// src/controllers/studentBmiController.js
import StudentProfile from "../models/StudentProfile.js";
import Session from "../models/Session.js";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
export const getBMIBySession = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { sessionId } = req.params;

    const profile = await StudentProfile.findOne(
      {
        user: userId,
        "bmiHistory.session": sessionId
      },
      {
        bmiHistory: { $elemMatch: { session: sessionId } }
      }
    );

    if (!profile || profile.bmiHistory.length === 0) {
      return res.json({ exists: false });
    }

    return res.json({
      exists: true,
      data: profile.bmiHistory[0]
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ===============================
// UPDATE BMI BY SESSION
// (KHÔNG THAY ĐỔI BMI GỐC)
// ===============================
export const updateBMIBySession = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { sessionId, heightCm, weightKg, note } = req.body;

    if (!userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "User chưa đăng nhập" });
    }

    if (!sessionId || !isValidObjectId(sessionId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "sessionId không hợp lệ" });
    }

    if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Thiếu dữ liệu hợp lệ (heightCm, weightKg)"
      });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Không tìm thấy session" });
    }

    if (session.student.toString() !== userId.toString()) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: "Session không thuộc về user này" });
    }

    // ❗ Không cho phép nhập lại
    const existing = await StudentProfile.findOne({
      user: userId,
      "bmiHistory.session": sessionId
    });

    if (existing) {
      return res.status(StatusCodes.CONFLICT).json({
        message: "Buổi tập này đã được nhập BMI trước đó"
      });
    }

    const bmiValue = weightKg / Math.pow(heightCm / 100, 2);
    const bmi = Number(bmiValue.toFixed(2));

    // ⭐ FIX CHÍNH: Không ghi đè BMI gốc
    const updated = await StudentProfile.findOneAndUpdate(
      { user: userId },
      {
        $push: {
          bmiHistory: {
            session: sessionId,
            heightCm,
            weightKg,
            bmi,
            note: note || ""
          }
        }
      },
      { new: true }
    );

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Đã lưu BMI thành công cho buổi tập",
      data: updated
    });
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Lỗi server", error: err.message });
  }
};

// ===============================
// GET BMI HISTORY (HIỂN THỊ THEO BUỔI TẬP)
// ===============================
export const getBMIHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const profile = await StudentProfile.findOne({ user: userId })
      .select("bmiHistory")
      .populate({
        path: "bmiHistory.session",
        select: "startTime"
      });

    if (!profile) return res.json([]);

    return res.json(profile.bmiHistory);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
