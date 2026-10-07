import PTProfile from "../models/PTProfile.js";
import User from "../models/User.js";
import Package from "../models/Package.js";

const escapeRegex = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const removeVietnameseTones = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");

const areaAliases = {
  "ho chi minh": ["hcm", "tphcm", "tp hcm", "sai gon", "saigon"],
  "ha noi": ["hn", "thu do"],
  "da nang": ["danang"],
  "can tho": ["cantho"],
  "thua thien hue": ["hue"],
};

const buildAreaRegex = (area = "") => {
  const raw = String(area || "").trim();
  const plain = removeVietnameseTones(raw).toLowerCase();
  const variants = new Set([raw, removeVietnameseTones(raw)]);

  Object.entries(areaAliases).forEach(([key, aliases]) => {
    if (plain.includes(key) || aliases.includes(plain)) {
      variants.add(key);
      aliases.forEach((alias) => variants.add(alias));
    }
  });

  return new RegExp(
    Array.from(variants)
      .filter(Boolean)
      .map((item) => escapeRegex(item))
      .join("|"),
    "i"
  );
};

/* ----------------------------------------------------
   🔹 Search PTs by specialty, slot availability, duration, mode, and location
---------------------------------------------------- */
export const getPTsByAvailableSlot = async (req, res) => {
  try {
    const {
      availableAt,
      specialty,
      packageTime,
      area,
      coords,         // "lat,lon"
      modes,
      name,
      goals,
      mode,
      sortBy = "best",
      page = 1,
      limit = 12,
    } = req.query;

    const pipeline = [];
    const strictAvailabilityMatch = {
      $match: { verified: true, availableForNewClients: true },
    };

    // ✅ 1. Only verified PTs available for new clients
    pipeline.push(strictAvailabilityMatch);

    // ✅ 2. Require at least one of area or coords
    if (!area && !coords) {
      return res.status(400).json({
        success: false,
        message: "Either area or coordinates is required to search PTs.",
      });
    }

    /* ----------------------------------------------------
       ✅ 3. LOCATION FILTER — prioritize GPS over city text
    ---------------------------------------------------- */
    if (coords) {
      const [lat, lon] = coords.split(",").map(Number);
      if (!isNaN(lat) && !isNaN(lon)) {
        // Dùng geoNear nếu PT có primaryGym.location (GeoJSON)
        pipeline.unshift({
          $geoNear: {
            near: { type: "Point", coordinates: [lon, lat] },
            distanceField: "distanceKm",
            spherical: true,
            maxDistance: 50000, // 50 km radius để tránh trả rỗng quá dễ
            distanceMultiplier: 0.001, // convert to km
            key: "primaryGym.location",
          },
        });
      }
      
    } else if (area) {
      // 🔹 fallback: match theo city name trong address hoặc areaNote
      const regex = buildAreaRegex(area);
      pipeline.push({
        $match: {
          $or: [
            { gymLocation: regex },
            { areaNote: regex },
            { "primaryGym.address": regex },
            { "primaryGym.name": regex },
          ],
        },
      });
    }

    /* ----------------------------------------------------
       ✅ 4. Filter by delivery modes (multi-select)
    ---------------------------------------------------- */
    if (modes && Array.isArray(modes) && modes.length > 0) {
      const selectedModes = modes.map((m) => m.trim());
      pipeline.push({
        $match: {
          $or: selectedModes.map((mode) => ({
            [`deliveryModes.${mode}`]: true,
          })),
        },
      });
    }

    /* ----------------------------------------------------
       ✅ 5. Filter by single mode dropdown
    ---------------------------------------------------- */
    if (mode && mode !== "all") {
      pipeline.push({
        $match: { [`deliveryModes.${mode}`]: true },
      });
    }

    /* ----------------------------------------------------
       ✅ 6. Filter by specialty
    ---------------------------------------------------- */
    if (specialty) {
      pipeline.push({
        $match: { specialties: { $regex: new RegExp(specialty, "i") } },
      });
    }

    /* ----------------------------------------------------
       ✅ 7. Filter by available slot
    ---------------------------------------------------- */
    if (availableAt) {
      const time = new Date(availableAt);
      pipeline.push({
        $lookup: {
          from: "slots",
          let: { ptId: "$user" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$pt", "$$ptId"] },
                    { $eq: ["$status", "OPEN"] },
                    { $lte: ["$startTime", time] },
                    { $gt: ["$endTime", time] },
                  ],
                },
              },
            },
          ],
          as: "openSlotsAt",
        },
      });
      pipeline.push({ $match: { "openSlotsAt.0": { $exists: true } } });
    }

    /* ----------------------------------------------------
       ✅ 8. Lookup packages (and filter by duration)
    ---------------------------------------------------- */
    pipeline.push({
      $lookup: {
        from: "packages",
        let: { ptId: "$user" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$pt", "$$ptId"] },
              isActive: true,
              ...(packageTime && {
                durationDays:
                  packageTime === "short"
                    ? { $lt: 7 }
                    : packageTime === "medium"
                    ? { $gte: 7, $lte: 30 }
                    : packageTime === "long"
                    ? { $gt: 30 }
                    : {},
              }),
            },
          },
          { $sort: { price: 1 } },
          {
            $project: {
              name: 1,
              price: 1,
              durationDays: 1,
              description: 1,
              tags: 1,
            },
          },
        ],
        as: "packages",
      },
    });

    /* ----------------------------------------------------
       ✅ 9. Match specialty or goals in package tags
    ---------------------------------------------------- */
    if (specialty || (goals && goals.length > 0)) {
      const goalRegex = goals?.map((g) => new RegExp(g, "i")) || [];
      const matchConditions = [];
      if (specialty)
        matchConditions.push(
          { specialties: { $regex: new RegExp(specialty, "i") } },
          { "packages.tags": { $regex: new RegExp(specialty, "i") } }
        );
      if (goalRegex.length > 0)
        matchConditions.push(
          { "packages.tags": { $in: goalRegex } },
          { specialties: { $in: goalRegex } }
        );

      pipeline.push({ $match: { $or: matchConditions } });
    }

    /* ----------------------------------------------------
       ✅ 10. Featured package & lowest price
    ---------------------------------------------------- */
    pipeline.push({
      $addFields: {
        featuredPackage: { $arrayElemAt: ["$packages", 0] },
        lowestPricePerSession: { $min: "$packages.price" },
      },
    });

    /* ----------------------------------------------------
       ✅ 11. Join user info
    ---------------------------------------------------- */
    pipeline.push({
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userInfo",
      },
    });
    pipeline.push({
      $addFields: {
        userInfo: { $arrayElemAt: ["$userInfo", 0] },
      },
    });

    /* ----------------------------------------------------
       ✅ 12. Filter by PT name (AFTER lookup)
    ---------------------------------------------------- */
    if (name) {
      pipeline.push({
        $match: { "userInfo.name": { $regex: new RegExp(name, "i") } },
      });
    }

    /* ----------------------------------------------------
       ✅ 13. Sorting logic
    ---------------------------------------------------- */
    const sort = {};
    switch (sortBy) {
      case "price":
        sort.lowestPricePerSession = 1;
        break;
      case "rating":
        sort.ratingAvg = -1;
        break;
      case "distance":
        sort.distanceKm = 1;
        break;
      default:
        sort.ratingAvg = -1;
        sort.lowestPricePerSession = 1;
        break;
    }
    pipeline.push({ $sort: sort });

    /* ----------------------------------------------------
       ✅ 14. Pagination
    ---------------------------------------------------- */
    pipeline.push(
      { $skip: (Number(page) - 1) * Number(limit) },
      { $limit: Number(limit) }
    );

    /* ----------------------------------------------------
       ✅ 15. Execute
    ---------------------------------------------------- */
    let result = await PTProfile.aggregate(pipeline);

    // Fallback cho môi trường local/demo: nếu không có PT nào đạt cả verified + available
    // thì vẫn trả hồ sơ phù hợp khu vực để luồng tìm kiếm không bị "trắng" hoàn toàn.
    if (result.length === 0) {
      const relaxedPipeline = pipeline.filter(
        (stage) => stage !== strictAvailabilityMatch
      );
      result = await PTProfile.aggregate(relaxedPipeline);
    }

    res.status(200).json({
      success: true,
      message: "Search PTs successful",
      page: Number(page),
      limit: Number(limit),
      total: result.length,
      items: result,
    });
  } catch (error) {
    console.error("Error searching PTs:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ----------------------------------------------------
   🔹 PT Detail (includes all active packages)
---------------------------------------------------- */
export const getPTById = async (req, res) => {
  try {
    const ptProfile = await PTProfile.findById(req.params.id).lean();
    if (!ptProfile)
      return res.status(404).json({ success: false, message: "PT not found" });

    const user = await User.findById(ptProfile.user)
      .select("name avatar gender email phone")
      .lean();

    const packages = await Package.find({
      pt: ptProfile.user,
      isActive: true,
    })
      .select("name price durationDays description tags")
      .lean();

    res.status(200).json({
      success: true,
      message: "PT detail retrieved successfully",
      data: { ...ptProfile, user, packages },
    });
  } catch (error) {
    console.error("Error fetching PT detail:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
