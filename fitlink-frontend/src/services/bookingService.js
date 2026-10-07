import axios from "@/api/axiosClient";

export const booking = async (payload) => {
  // payload: { name, description?, price?, totalSessions, durationDays, visibility?, tags? }
  const res = await axios.post('/booking/create-slots', payload)
  return res.data
}
const bookingService = {
  booking
}
export default bookingService