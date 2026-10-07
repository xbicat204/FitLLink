import { useState } from "react";
import { feedbackApi } from "@/api/feedbackApi";

const FeedbackModal = ({ ptId, bookingId, ptProfileId, studentId, onClose }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const handleSubmit = async () => {
    await feedbackApi.create({
      pt: ptId,
      booking: bookingId,
      ptProfile: ptProfileId,
      student: studentId,
      rating,
      comment,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-xl w-96">
        <h2 className="text-lg font-semibold mb-3">Đánh giá huấn luyện viên</h2>
        <div className="flex space-x-1 mb-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              onClick={() => setRating(i)}
              className={`cursor-pointer text-2xl ${
                i <= rating ? "text-yellow-400" : "text-gray-300"
              }`}
            >
              ★
            </span>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Nhận xét của bạn..."
          className="w-full border rounded-md p-2 mb-4"
        />
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-lg">
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
