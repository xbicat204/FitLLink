import mongoose from "mongoose";
import StudentPackage from "../models/StudentPackage.js";
import Transaction from "../models/Transaction.js";
import Session from "../models/Session.js";

export const studentStatsController = {
  getDashboard,
  getPaymentHistory,
  getCompletedSessionsByYear,
  getProgressByYear,
  getSessionHistory
};

/* =========================================================
   📌 1) DASHBOARD OVERVIEW
========================================================= */
async function getDashboard(req, res) {
  try {
    const studentId = new mongoose.Types.ObjectId(req.user._id);

    const pkg = await StudentPackage.findOne({
      student: studentId,
      status: "active"
    });

    let totalSessions = pkg?.totalSessions || 0;
    let remaining = pkg?.remainingSessions || 0;

    const completed = await Session.countDocuments({
      student: studentId,
      status: "completed"
    });

    const cancelled = await Session.countDocuments({
      student: studentId,
      status: "cancelled"
    });

    const totalPaid = await Transaction.aggregate([
      { $match: { student: studentId, status: "paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    res.json({
      totalSessions,
      remaining,
      completed,
      cancelled,
      totalPaid: totalPaid?.[0]?.total || 0
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

/* =========================================================
   📌 2) PAYMENT HISTORY (12 tháng)
========================================================= */
async function getPaymentHistory(req, res) {
  try {
    const studentId = new mongoose.Types.ObjectId(req.user._id);
    const year = req.query.year;

    const start = new Date(`${year}-01-01T00:00:00+07:00`);
    const end   = new Date(`${year}-12-31T23:59:59+07:00`);

    const data = await Transaction.aggregate([
      {
        $match: {
          student: studentId,
          status: "paid",
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          total: { $sum: "$amount" }
        }
      }
    ]);

    const result = Array(12).fill(0);
    data.forEach(i => result[i._id.month - 1] = i.total);

    res.json({ year, payments: result });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

/* =========================================================
   📌 3) COMPLETED SESSIONS (12 tháng)
========================================================= */
async function getCompletedSessionsByYear(req, res) {
  try {
    const studentId = new mongoose.Types.ObjectId(req.user._id);
    const year = req.query.year;

    const start = new Date(`${year}-01-01T00:00:00+07:00`);
    const end   = new Date(`${year}-12-31T23:59:59+07:00`);

    const data = await Session.aggregate([
      {
        $match: {
          student: studentId,
          status: "completed",
          startTime: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: { month: { $month: "$startTime" } },
          count: { $sum: 1 }
        }
      }
    ]);

    const result = Array(12).fill(0);
    data.forEach(i => result[i._id.month - 1] = i.count);

    res.json({ year, completed: result });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

/* =========================================================
   📌 4) PROGRESS (12 tháng)
========================================================= */
async function getProgressByYear(req, res) {
  try {
    const studentId = new mongoose.Types.ObjectId(req.user._id);
    const year = req.query.year;

    const start = new Date(`${year}-01-01T00:00:00+07:00`);
    const end   = new Date(`${year}-12-31T23:59:59+07:00`);

    const data = await Session.aggregate([
      {
        $match: {
          student: studentId,
          status: "completed",
          startTime: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: { month: { $month: "$startTime" } },
          count: { $sum: 1 }
        }
      }
    ]);

    const result = Array(12).fill(0);
    data.forEach(i => result[i._id.month - 1] = i.count);

    res.json({ year, progress: result });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

/* =========================================================
   📌 5) SESSION HISTORY (A + B)
========================================================= */
async function getSessionHistory(req, res) {
  try {
    const studentId = new mongoose.Types.ObjectId(req.user._id);
    const year = req.query.year;
    const full = req.query.full === "1";

    const start = new Date(`${year}-01-01T00:00:00+07:00`);
    const end   = new Date(`${year}-12-31T23:59:59+07:00`);

    // -------------------------
    // B) FULL LIST (recent)
    // -------------------------
    if (full) {
      const sessions = await Session.find({
        student: studentId
      })
        .populate("pt", "name avatar")
        .sort({ startTime: -1 });

      return res.json({ sessions });
    }

    // -------------------------
    // A) 12 MONTHS HISTORY
    // -------------------------
    const data = await Session.aggregate([
      {
        $match: {
          student: studentId,
          startTime: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: { month: { $month: "$startTime" } },
          count: { $sum: 1 }
        }
      }
    ]);

    const result = Array(12).fill(0);
    data.forEach(i => result[i._id.month - 1] = i.count);

    res.json({ year, history: result });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}
