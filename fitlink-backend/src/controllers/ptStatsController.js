import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";
import StudentPackage from "../models/StudentPackage.js";
import Session from "../models/Session.js"; 
import PTProfile from "../models/PTProfile.js";

export const ptStatsController = {
  getRevenueByYear,
  getStudentsByYear,
  getCompletedSessionsByYear,   // ✅ THÊM
  getCancelRateByYear,
  getPTRatingStats  
};
/* ============================================================
   0) RATING — LẤY TỪ PTProfile
============================================================ */
async function getPTRatingStats(req, res) {
  try {
    const ptId = req.user._id;

    const profile = await PTProfile.findOne({ user: ptId })
      .select("ratingAvg ratingCount")
      .lean();

    const averageRating = profile?.ratingAvg || 0;
    const totalReviews = profile?.ratingCount || 0;

    return res.json({
      success: true,
      averageRating,
      totalReviews
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
}

/* ============================================================
   1) DOANH THU THEO NĂM — LẤY THEO ptEarning (CHUẨN CHO PT)
============================================================ */
async function getRevenueByYear(req, res) {
  try {
    const ptId = new mongoose.Types.ObjectId(req.user._id);  // ✅ FIX 1
    const year = req.query.year;

    if (!year) {
      console.log("❌ Missing year");
      return res.status(400).json({ message: "Missing year" });
    }

    /* ---- FIX TIMEZONE CHUẨN ---- */
    const start = new Date(`${year}-01-01T00:00:00+07:00`);
    const end   = new Date(`${year}-12-31T23:59:59+07:00`);

    /* ---- AGGREGATE DOANH THU ---- */
    const data = await Transaction.aggregate([
      {
        $match: {
          pt: ptId,              // ✅ FIX 2 — giờ là ObjectId thật sự
          status: "paid",
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          total: { $sum: "$ptEarning" },
        },
      },
      { $sort: { "_id.month": 1 } }
    ]);


    /* ---- TRẢ VỀ MẢNG 12 THÁNG ---- */
    const result = Array(12).fill(0);
    data.forEach(i => result[i._id.month - 1] = i.total);

    console.log("📊 Revenue array:", result);

    res.json({ year, revenue: result });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

/* ============================================================
   2) SỐ HỌC VIÊN THEO NĂM — LẤY THEO StudentPackage
============================================================ */
async function getStudentsByYear(req, res) {
  try {
    const ptId = new mongoose.Types.ObjectId(req.user._id);  // ✅ FIX 3
    const year = req.query.year;

    if (!year) {
      console.log("❌ Missing year");
      return res.status(400).json({ message: "Missing year" });
    }

    /* ---- FIX TIMEZONE CHUẨN ---- */
    const start = new Date(`${year}-01-01T00:00:00+07:00`);
    const end   = new Date(`${year}-12-31T23:59:59+07:00`);

    /* ---- AGGREGATE STUDENTS ---- */
    const data = await StudentPackage.aggregate([
      {
        $match: {
          pt: ptId,               // ✅ FIX 4 — ObjectId chuẩn
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    console.log("📌 Aggregated student packages:", data);

    /* ---- TRẢ VỀ MẢNG 12 THÁNG ---- */
    const result = Array(12).fill(0);
    data.forEach(i => result[i._id.month - 1] = i.count);

    res.json({ year, students: result });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}
/* ============================================================
   3) SỐ BUỔI ĐÃ HOÀN THÀNH THEO THÁNG
============================================================ */
async function getCompletedSessionsByYear(req, res) {
  try {
    const ptId = new mongoose.Types.ObjectId(req.user._id);
    const year = req.query.year;

    const start = new Date(`${year}-01-01T00:00:00+07:00`);
    const end = new Date(`${year}-12-31T23:59:59+07:00`);

    const data = await Session.aggregate([
      {
        $match: {
          pt: ptId,
          status: "completed",
          startTime: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: { month: { $month: "$startTime" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.month": 1 } }
    ]);

    const result = Array(12).fill(0);
    data.forEach(i => result[i._id.month - 1] = i.count);

    res.json({ year, completed: result });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

/* ============================================================
   4) TỶ LỆ HỦY BUỔI THEO THÁNG
============================================================ */
async function getCancelRateByYear(req, res) {
  try {
    const ptId = new mongoose.Types.ObjectId(req.user._id);
    const year = req.query.year;

    const start = new Date(`${year}-01-01T00:00:00+07:00`);
    const end = new Date(`${year}-12-31T23:59:59+07:00`);

    const data = await Session.aggregate([
      {
        $match: {
          pt: ptId,
          startTime: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: "$startTime" },
            status: "$status"
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const completed = Array(12).fill(0);
    const cancelled = Array(12).fill(0);

    data.forEach(item => {
      const m = item._id.month - 1;
      if (item._id.status === "completed") completed[m] = item.count;
      if (item._id.status === "cancelled") cancelled[m] = item.count;
    });

    const cancelRate = Array(12).fill(0);
    for (let i = 0; i < 12; i++) {
      const total = completed[i] + cancelled[i];
      cancelRate[i] = total === 0 ? 0 : Math.round((cancelled[i] / total) * 100);
    }

    res.json({ year, cancelRate });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

