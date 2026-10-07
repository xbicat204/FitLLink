import { useState,useEffect } from "react";
import { calculateBMIAndSave } from "@/services/bmiService";
import Lottie from "lottie-react"; // Import Lottie component
const ANIMATION_PATH = "/animation/Gym & Fitness Gold.json"; // Đường dẫn từ thư mục PUBLIC
import { toast } from "react-toastify";
export default function BMIWidget({ onClose }) {
    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [bmi, setBmi] = useState(null);
    const [bodyType, setBodyType] = useState("");
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [lottieData, setLottieData] = useState(null);
    // Tính BMI
    useEffect(() => {
        fetch(ANIMATION_PATH)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Failed to load Lottie JSON from ${ANIMATION_PATH}`);
                }
                return res.json();
            })
            .then(data => setLottieData(data))
            .catch(error => {
                console.error("Lỗi tải animation Lottie:", error);
                // Bạn có thể đặt một state lỗi ở đây
            });
    }, []);
    const handleCalculate = () => {
        const h = parseFloat(height);
        const w = parseFloat(weight);
        if (!h || !w) return alert("Vui lòng nhập chiều cao và cân nặng hợp lệ!");

        // Công thức BMI: cân nặng (kg) / [chiều cao (m)]^2
        const result = (w / ((h / 100) ** 2)).toFixed(1);
        setBmi(result);

        // Phân loại tạng người dựa trên BMI (phân loại Endomorph/Mesomorph/Ectomorph 
        // ở đây chỉ mang tính minh họa đơn giản, không phải phân loại khoa học)
        let type = "";
        const bmiNum = parseFloat(result);
        if (bmiNum < 18.5) type = "Gầy (Ectomorph)";
        else if (bmiNum < 25) type = "Bình thường (Mesomorph)";
        else if (bmiNum < 30) type = "Hơi béo (Endomorph)";
        else type = "Béo phì (Endomorph)";
        setBodyType(type);
    };

    // Lưu BMI
    const handleSaveBMI = async () => {
        const h = parseFloat(height);
        const w = parseFloat(weight);

        if (!h || !w || !bmi) {
            return toast.error("Vui lòng tính chỉ số BMI trước khi lưu!");
        }

        try {
            setLoading(true);
            // Gửi dữ liệu lên API
            await calculateBMIAndSave(h, w, bmi, note);
            toast.success("Đã lưu chỉ số BMI thành công!");
        } catch (err) {
            console.error(err);
            toast.error("Lỗi khi lưu chỉ số BMI. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-orange-600 to-black text-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    {/* THAY THẾ: Thêm Lottie Animation vào đây */}
                    <Lottie
                        animationData={lottieData } // Sử dụng dữ liệu animation đã import
                        loop={true}                 // Cho phép lặp lại
                        autoplay={true}             // Tự động chạy
                        style={{ width: 50, height: 50, marginRight: '10px' }}
                    />
                    <h3 className="text-2xl font-bold">Tính chỉ số BMI</h3>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-300 hover:text-white text-2xl font-bold"
                >
                    ✕
                </button>
            </div>

            {/* Form & Kết quả */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Input chiều cao & cân nặng */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-lg font-semibold mb-1">Chiều cao (cm)</label>
                        <input
                            type="number"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            className="w-full rounded-lg px-4 py-3 bg-black/30 border border-orange-400 text-white text-lg"
                            placeholder="Ví dụ: 175"
                        />
                    </div>
                    <div>
                        <label className="block text-lg font-semibold mb-1">Cân nặng (kg)</label>
                        <input
                            type="number"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            className="w-full rounded-lg px-4 py-3 bg-black/30 border border-orange-400 text-white text-lg"
                            placeholder="Ví dụ: 70"
                        />
                    </div>

                    <div>
                        <label className="block text-lg font-semibold mb-1">Ghi chú</label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="w-full rounded-lg px-4 py-3 bg-black/30 border border-orange-400 text-white text-lg resize-none"
                            rows={4}
                            placeholder="Nhập ghi chú hoặc lời khuyên của bạn..."
                        />
                    </div>
                </div>

                {/* Kết quả BMI */}
                <div className="flex flex-col justify-center items-center space-y-4 text-center p-4 bg-black/10 rounded-lg">
                    <h4 className="text-xl font-bold text-orange-400">KẾT QUẢ</h4>
                    {bmi ? (
                        <>
                            <p className="text-4xl md:text-5xl font-extrabold">
                                {bmi}
                            </p>
                            <p className="text-xl md:text-2xl font-semibold">
                                Tạng người: <span className="text-orange-300">{bodyType}</span>
                            </p>
                        </>
                    ) : (
                        <p className="text-lg text-gray-400">
                            Nhập chỉ số và nhấn **Tính BMI**
                        </p>
                    )}
                </div>
            </div>

            {/* Nút tính & lưu */}
            <div className="mt-6 flex flex-col md:flex-row gap-4">
                <button
                    onClick={handleCalculate}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 py-3 rounded-lg font-bold text-lg transition shadow-md hover:shadow-lg"
                >
                    Tính BMI
                </button>
                <button
                    onClick={handleSaveBMI}
                    disabled={loading || !bmi}
                    className={`flex-1 py-3 rounded-lg font-bold text-lg transition shadow-md ${bmi
                        ? "bg-green-500 hover:bg-green-600 text-white hover:shadow-lg"
                        : "bg-gray-500 cursor-not-allowed text-gray-200"
                        }`}
                >
                    {loading ? "Đang lưu..." : "Lưu BMI"}
                </button>
            </div>
        </div>
    );
}