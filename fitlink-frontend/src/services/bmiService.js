import axios from "@/api/axiosClient";

export async function calculateBMIAndSave(heightCm, weightKg, bmi) {
    const res = await axios.post(
        "/students/bmi",
        { heightCm, weightKg, bmi },
    );
    return res.data;
}
