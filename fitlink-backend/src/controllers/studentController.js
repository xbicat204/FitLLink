import StudentPackage from "../models/StudentPackage.js";
import { StatusCodes } from "http-status-codes";
import StudentProfile from "../models/StudentProfile.js";
import User from "../models/User.js";
import mongoose from "mongoose";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const isValidCoordinates = (lng, lat) => {
  if (typeof lng !== "number" || typeof lat !== "number") return false;
  if (Number.isNaN(lng) || Number.isNaN(lat)) return false;
  if (lng < -180 || lng > 180) return false;
  if (lat < -90 || lat > 90) return false;
  return true;
};

export const getDefaultLocationByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId || !isValidObjectId(studentId)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "studentId không hợp lệ" });
    }

    const profile = await StudentProfile.findOne(
      { user: studentId },
      { defaultLocation: 1, _id: 0 }
    ).lean();

    if (!profile) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({
          message:
            "Chưa có StudentProfile hoặc chưa thiết lập defaultLocation",
        });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      data: profile.defaultLocation ?? null,
    });
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Lỗi server khi lấy defaultLocation" });
  }
};

export const upsertDefaultLocation = async (req, res) => {
  try {
    const { lng, lat, defaultLocation } = req.body;

    let targetUserId = req.params.studentId || req.user?._id;
    if (!targetUserId || !isValidObjectId(targetUserId)) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Không xác định được user hợp lệ để cập nhật" });
    }

    let point;
    if (
      defaultLocation?.type === "Point" &&
      Array.isArray(defaultLocation.coordinates)
    ) {
      const [lngIn, latIn] = defaultLocation.coordinates.map(Number);
      if (!isValidCoordinates(lngIn, latIn)) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Toạ độ không hợp lệ. Cần dạng [lng, lat]" });
      }
      point = { type: "Point", coordinates: [lngIn, latIn] };
    } else {
      const lngNum = Number(lng);
      const latNum = Number(lat);
      if (!isValidCoordinates(lngNum, latNum)) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Thiếu hoặc sai định dạng lng/lat" });
      }
      point = { type: "Point", coordinates: [lngNum, latNum] };
    }

    const updated = await StudentProfile.findOneAndUpdate(
      { user: targetUserId },
      {
        $set: { defaultLocation: point },
        $setOnInsert: { user: targetUserId },
      },
      { new: true, upsert: true }
    )
      .populate("user", "name email phone avatar")
      .lean();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Đã cập nhật defaultLocation thành công",
      data: {
        user: updated.user,
        defaultLocation: updated.defaultLocation,
      },
    });
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Lỗi server khi cập nhật defaultLocation" });
  }
};

export const getMyPTs = async (req, res) => {
  try {
    const studentId = req.user._id;

    const packages = await StudentPackage.find({
      student: studentId,
      status: "active",
    })
      .populate("pt", "name avatar email phone")
      .populate({
        path: "package",
        select: "name totalSessions durationDays",
      })
      .lean();

    const pts = packages
      .filter((pkg) => pkg.pt)
      .map((pkg) => ({
        _id: pkg.pt._id,
        name: pkg.pt.name,
        avatar: pkg.pt.avatar,
        email: pkg.pt.email,
        phone: pkg.pt.phone,
        packageId: pkg._id,
        packageName: pkg.package?.name,
        totalSessions: pkg.package?.totalSessions,
        durationDays: pkg.package?.durationDays,
        startDate: pkg.startDate,
        endDate: pkg.endDate,
        remainingSessions: pkg.remainingSessions,
        status: pkg.status,
      }));

    return res.status(StatusCodes.OK).json({
      success: true,
      data: pts,
    });
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).lean();

    res.status(StatusCodes.OK).json(students);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};

export const getStudentProfile = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const profile = await StudentProfile.findOne({ user: studentId })
      .populate("user", "name email phone avatar")
      .lean();

    if (!profile) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Không tìm thấy hồ sơ học viên" });
    }

    res.status(StatusCodes.OK).json(profile);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};

export const studentController = {
  updateBMI: async (req, res) => {
    try {
      const { heightCm, weightKg } = req.body;
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({ message: "User chưa đăng nhập" });
      }
      if (!heightCm || !weightKg) {
        return res
          .status(400)
          .json({ message: "Thiếu dữ liệu chiều cao hoặc cân nặng" });
      }

      const bmiValue = weightKg / (heightCm / 100) ** 2;
      const bmi = Number(bmiValue.toFixed(2));

      const updatedProfile = await StudentProfile.findOneAndUpdate(
        { user: userId },
        {
          heightCm,
          weightKg,
          bmi,
        },
        { new: true, upsert: true }
      );

      res.status(200).json({
        success: true,
        message: "Đã cập nhật BMI thành công",
        data: updatedProfile,
      });
    } catch (err) {
      if (err.name === "ValidationError" || err.name === "CastError") {
        return res.status(400).json({
          message: "Dữ liệu gửi lên không đúng định dạng.",
          details: err.message,
        });
      }
      res.status(500).json({ message: "Lỗi server khi lưu BMI" });
    }
  },
};
