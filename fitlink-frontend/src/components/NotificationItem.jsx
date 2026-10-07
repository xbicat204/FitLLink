import React, { useState } from "react";
import { CheckCircle, Info, Star, Gift } from "lucide-react";
import FeedbackDialog from "./student/FeedbackDialog";

export default function NotificationItem({ noti, onFeedbackSent }) {
  const [openFeedback, setOpenFeedback] = useState(false);

  // 🎨 Card style by type
  const getTypeStyle = () => {
    switch (noti.type) {
      case "session":
        return "border-blue-400 bg-blue-50";
      case "feedback":
        return "border-orange-400 bg-orange-50";
      case "message":
        return "border-green-400 bg-green-50";
      default:
        return "border-gray-300 bg-white";
    }
  };

  // 🧩 Icon by type
  const getIcon = () => {
    if (noti.title?.includes("completed")) {
      return <Gift className="text-orange-500 w-5 h-5" />;
    }
    switch (noti.type) {
      case "session":
        return <CheckCircle className="text-blue-500 w-5 h-5" />;
      case "feedback":
        return <Star className="text-orange-500 w-5 h-5" />;
      default:
        return <Info className="text-gray-500 w-5 h-5" />;
    }
  };

  // 🧠 Determine status & note from meta
  const status =
    noti.meta?.status ||
    (noti.message?.toLowerCase().includes("completed") ? "completed" : "");
  const note = noti.meta?.ptNote || "";

  // ✨ Render different messages
  const renderMessage = () => {
    // Completed all sessions (feedback request)
    if (noti.title?.toLowerCase().includes("completed package")) {
      return (
        <div className="text-center text-gray-800 text-sm leading-relaxed">
          <p className="text-lg font-semibold text-orange-600 mb-1">
            🎉 Congratulations!
          </p>
          <p>
            You’ve completed all your training sessions! Don’t forget to leave
            feedback for your trainer.
          </p>
        </div>
      );
    }

    // Session update
    if (noti.type === "session") {
      return (
        <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
          <p>
            <span className="font-semibold">Status:</span>{" "}
            {status === "completed"
              ? "✅ Completed"
              : status === "missed"
              ? "❌ Missed"
              : status === "upcoming"
              ? "🕓 Upcoming"
              : status || "Updated"}
          </p>
          {note && (
            <p className="mt-1">
              <span className="font-semibold">Trainer’s note:</span> {note}
            </p>
          )}
        </div>
      );
    }

    // Other notification types
    return (
      <p
        className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: noti.message }}
      />
    );
  };

  return (
    <div
      className={`border ${getTypeStyle()} rounded-xl p-5 shadow-sm hover:shadow-md transition-all`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        {getIcon()}
        <h3 className="font-semibold text-gray-800 text-base">
          {noti.title || "Notification"}
        </h3>
      </div>

      {/* Message content */}
      {renderMessage()}

      {/* Timestamp */}
      <small className="text-gray-500 text-xs mt-3 block text-right">
        {new Date(noti.createdAt).toLocaleString("en-GB")}
      </small>

      {/* Feedback button */}
      {noti.meta?.feedbackRequest && !noti.meta?.feedbackSent && (
        <div className="flex justify-center mt-3">
          <button
            onClick={() => setOpenFeedback(true)}
            className="px-4 py-1.5 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium shadow-sm transition-all"
          >
            Give Feedback
          </button>
        </div>
      )}

      {/* Feedback dialog */}
      <FeedbackDialog
        open={openFeedback}
        onClose={() => setOpenFeedback(false)}
        ptId={noti.meta?.ptId}
        notiId={noti._id}
        notiMeta={noti.meta}
        onFeedbackSent={onFeedbackSent}
      />
    </div>
  );
}
