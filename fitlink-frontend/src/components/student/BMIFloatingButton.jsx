import { useState } from "react";
import { Calculator } from "lucide-react";
import BMIWidget from "./BMIWidget";

export default function BMIFloatingButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* 🧮 Nút mở BMI — luôn nằm ở góc phải dưới */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-24 bg-orange-600 text-white p-4 rounded-full shadow-lg hover:bg-orange-700 transition duration-300 z-40"
            >
                <Calculator className="w-6 h-6" />
            </button>

            {/* 🪟 Overlay + Modal hiển thị giữa màn hình */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)} // click nền để tắt
                >
                    <div
                        onClick={(e) => e.stopPropagation()} // tránh tắt khi click trong modal
                        className="animate-fadeIn w-full max-w-xl"
                    >
                        <BMIWidget onClose={() => setIsOpen(false)} />
                    </div>
                </div>
            )}
        </>
    );
}
