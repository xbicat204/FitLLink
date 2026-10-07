import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Session from "../models/Session.js";
export const adminStatsController = {
  getRevenueByYear,
  getUsersByYear,
  getBookingTrends,
  getTopPT
};

/* =========================================================
   DOANH THU THEO NĂM — DOANH THU NỀN TẢNG (platformFee)
   ========================================================= */

async function getRevenueByYear(req, res) {
  try {
    const { year } = req.query;
    if (!year) return res.status(400).json({ message: "Missing year" });

    const start = new Date(`${year}-01-01T00:00:00+07:00`);
    const end = new Date(`${year}-12-31T23:59:59+07:00`);

    const data = await Transaction.aggregate([
      {
        $match: {
          status: "paid",
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        // nhóm theo tháng và sum platformFee
        $group: {
          _id: {
            month: {
              $month: {
                date: "$createdAt",
                timezone: "Asia/Ho_Chi_Minh",
              },
            },
          },
          total: { $sum: "$platformFee" }, // ✔ DOANH THU NỀN TẢNG
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    const result = Array(12).fill(0);
    data.forEach((item) => {
      result[item._id.month - 1] = item.total;
    });

    res.json({ year, revenue: result });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

/* =========================================================
   USER JOINED THEO NĂM — CÓ TZ VN
   ========================================================= */

async function getUsersByYear(req, res) {
  try {
    const { year } = req.query;
    if (!year) return res.status(400).json({ message: "Missing year" });

    const start = new Date(`${year}-01-01T00:00:00+07:00`);
    const end = new Date(`${year}-12-31T23:59:59+07:00`);

    const data = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            month: {
              $month: {
                date: "$createdAt",
                timezone: "Asia/Ho_Chi_Minh",
              },
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    const result = Array(12).fill(0);
    data.forEach((item) => {
      result[item._id.month - 1] = item.count;
    });

    res.json({ year, users: result });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

async function getBookingTrends(req, res) {
  try {
    const { year } = req.query;
    if (!year) return res.status(400).json({ message: "Missing year" });

    const start = new Date(`${year}-01-01T00:00:00.000Z`);
    const end   = new Date(`${year}-12-31T23:59:59.999Z`);

    const data = await Booking.aggregate([
      {
        $match: {
          status: "PAID",
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.month": 1 } }
    ]);

    const result = Array(12).fill(0);
    data.forEach((item) => {
      result[item._id.month - 1] = item.count;
    });

    res.json({ year, bookings: result });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}
async function getTopPT(req, res) {
  try {
    const data = await Session.aggregate([
      { 
        $match: { status: "completed" } 
      },
      {
        $group: {
          _id: "$pt",
          totalSessions: { $sum: 1 }
        }
      },
      { $sort: { totalSessions: -1 } },
      { $limit: 5 },

      // Populate PT info
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "ptInfo"
        }
      },
      { $unwind: "$ptInfo" },

      {
        $project: {
          _id: 0,
          ptId: "$_id",
          name: "$ptInfo.name",
          totalSessions: 1
        }
      }
    ]);

    res.json({ topPTs: data });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}
