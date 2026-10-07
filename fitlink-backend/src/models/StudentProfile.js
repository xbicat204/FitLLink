import mongoose from 'mongoose'
import { GeoPointSchema } from './_common'

const { Schema, model } = mongoose

const studentProfileSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', unique: true, required: true },

    // Tùy chọn: thông số cơ bản cho gợi ý mục tiêu
    heightCm: Number,
    weightKg: Number,
    bmi: Number, // có thể cache sau khi tính (server sẽ tính & set)

    goals: [String], // ví dụ: 'giảm mỡ', 'tăng cơ', 'sức bền'

    // Địa điểm mặc định khi tìm PT gần nhà
    defaultLocation: { type: GeoPointSchema }, // GeoJSON Point
        bmiHistory: [
      {
        session: { type: Schema.Types.ObjectId, ref: "Session" },
        heightCm: Number,
        weightKg: Number,
        bmi: Number,
        note: String,
        createdAt: { type: Date, default: Date.now }
      }
    ]

  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

// Index phục vụ search
studentProfileSchema.index({ defaultLocation: '2dsphere' })
studentProfileSchema.index({ bmi: 1 })

const StudentProfile = model('StudentProfile', studentProfileSchema)
export default StudentProfile
