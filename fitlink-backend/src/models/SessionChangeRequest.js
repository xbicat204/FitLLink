import mongoose from "mongoose";

const SessionChangeRequestSchema = new mongoose.Schema(
    {
        session: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Session",
            required: true,
        },

        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        pt: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        reason: { type: String, required: true },

        newStartTime: { type: Date, required: true },
        newEndTime: { type: Date, required: true },

        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "expired"],
            default: "pending",
        },

        rejectReason: { type: String, default: null },
    },
    { timestamps: true }
);

export default mongoose.model(
    "SessionChangeRequest",
    SessionChangeRequestSchema
);
