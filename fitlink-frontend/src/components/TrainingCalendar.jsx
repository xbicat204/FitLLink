import React, { useEffect, useState, useContext } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { AuthContext } from "@/contexts/AuthContext";
import { fetchTrainingSessions } from "@/services/trainingSessionService";
import studentBookingService from "@/services/studentBookingService";
import { fetchStudentPackages } from "@/services/studentPackage";
import { ChevronDown, ChevronRight, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getSocket } from "@/api/socket";
import { toast } from "react-hot-toast";
import Lottie from "lottie-react";
//import errorAnim from "@/assets/lotties/ErrorAnimation.json";
moment.locale("vi");
const localizer = momentLocalizer(moment);
const TrainingCalendar = ({ role = "student" }) => {
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [packages, setPackages] = useState([]);
  const [expandedPT, setExpandedPT] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("week");

  const navigate = useNavigate();

  // MODALS
  const [newDate, setNewDate] = useState("");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  // BMI MODAL
  const [openBmiModal, setOpenBmiModal] = useState(false);
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [bmiNote, setBmiNote] = useState("");
  const [bmiAvailable, setBmiAvailable] = useState(false);
  const [bmiData, setBmiData] = useState(null);

  const [openActionModal, setOpenActionModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [feedback, setFeedback] = useState({
    open: false,     // đang hiện popup hay không
    type: null,      // "success" | "error"
    message: "",
  });
  const [openReasonModal, setOpenReasonModal] = useState(false);
  const [reasonType, setReasonType] = useState(""); // change | absent
  const [reasonText, setReasonText] = useState("");
  const today = moment().format("YYYY-MM-DD");

  const isPastTimeToday = (date, time) => {
    const now = new Date();
    const selected = new Date(`${date}T${time}:00`);
    return selected < now;
  };

  const durationMinutes = (start, end) => {
    const s = moment(start, "HH:mm");
    const e = moment(end, "HH:mm");
    return e.diff(s, "minutes");
  };

  // LOAD PACKAGES
  useEffect(() => {
    if (user?._id) loadPackages();
  }, [user]);

  const loadPackages = async () => {
    try {
      const res = await fetchStudentPackages();
      setPackages(res.data || []);
    } catch (err) {
      console.error("❌ Lỗi khi tải gói tập:", err);
    }
  };

  // LOAD SESSIONS
  useEffect(() => {
    if (selectedPackage?._id) {
      setEvents([]);
      loadSessions(selectedPackage._id);
    }
  }, [selectedPackage]);

  useEffect(() => {
    const socket = getSocket();
    if (!selectedPackage?._id) return;

    const handler = () => loadSessions(selectedPackage._id);
    socket.on("session_updated", handler);

    return () => socket.off("session_updated", handler);
  }, [selectedPackage]);
  const showFeedback = (type, message, callback) => {
    setFeedback({ open: true, type, message });

    setTimeout(() => {
      setFeedback({ open: false, type: null, message: "" });
      if (callback) callback();
    }, 1000); // hiện 1s
  };
  const loadSessions = async (packageId) => {
    try {
      const data = await fetchTrainingSessions({
        userId: user._id,
        role,
        packageId,
      });

      const formatted = data.sessions.map((s) => ({
        sessionId: s._id,
        title: "Buổi tập",
        start: new Date(s.startTime),
        end: new Date(s.endTime),
        statusType: s.status,
        raw: s, // full session data
      }));

      setEvents(formatted);
    } catch (err) {
      console.error("❌ Lỗi khi tải lịch tập:", err);
    }
  };

  // GROUP PACKAGES
  const groupPackagesByPT = (packages) => {
    const grouped = {};
    packages.forEach((pkg) => {
      let ptName = pkg.pt?.name || pkg.pt?.email?.split("@")[0] || "PT";
      if (!grouped[ptName]) grouped[ptName] = [];
      grouped[ptName].push(pkg);
    });
    return grouped;
  };

  const eventStyleGetter = (event) => {
    let bg = "#3b82f6";
    if (event.statusType === "completed") bg = "#22c55e";
    if (event.statusType === "missed") bg = "#dc2626";
    return {
      style: {
        backgroundColor: bg,
        color: "white",
        borderRadius: "8px",
        fontSize: "13px",
      },
    };
  };

  // CLICK EVENT
  const handleSelectEvent = (event) => {
    if (event.statusType !== "scheduled") {
      toast.warning("Buổi này đã học hoặc không thể thay đổi.");
      return;
    }
    setSelectedEvent(event);
    setOpenActionModal(true);
  };
  const handleSaveBMI = async () => {
    if (!heightCm || !weightKg) {
      toast.error("Hãy nhập đủ chiều cao và cân nặng!");
      return;
    }

    if (heightCm <= 0 || weightKg <= 0) {
      toast.error("Chiều cao và cân nặng không hợp lệ!");
      return;
    }

    try {
      const res = await axios.post("/students/bmi/session", {
        sessionId: selectedEvent.sessionId,
        heightCm: Number(heightCm),
        weightKg: Number(weightKg),
        note: bmiNote,
      });

      if (res.data.success) {
        showFeedback("success", "Lưu BMI thành công!", () => {
          // reset
          setOpenBmiModal(false);
          setHeightCm("");
          setWeightKg("");
          setBmiNote("");
          setBmiAvailable(true);    // Cập nhật lại UI
          setBmiData(res.data.data);
        });
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi server");
    }
  };

  // SEND REQUEST
  const sendRequest = async () => {
    if (!reasonText.trim()) {
      toast.error("Vui lòng nhập lý do!");
      return;
    }
    if (!selectedEvent) return;

    try {
      if (reasonType === "change") {
        if (!newDate || !newStart || !newEnd)
          return toast.error("Hãy chọn ngày và giờ mới!");
        // 1) Ngày quá khứ
        if (newDate < today) {
          toast.error("Không thể chọn ngày trong quá khứ!");
          return;
        }

        // 2) Giờ đã trôi qua trong hôm nay
        if (isPastTimeToday(newDate, newStart)) {
          toast.error("Giờ bắt đầu không hợp lệ!");
          return;
        }

        // 3) Giờ kết thúc phải > giờ bắt đầu
        if (newEnd <= newStart) {
          toast.error("Giờ kết thúc phải sau giờ bắt đầu!");
          return;
        }

        // 4) Check độ dài session gốc
        const originalDuration = moment(selectedEvent.end).diff(moment(selectedEvent.start), "minutes");
        const newDuration = durationMinutes(newStart, newEnd);

        if (newDuration !== originalDuration) {
          toast.error(`Buổi tập phải kéo dài ${originalDuration} phút!`);
          return;
        }
        const newStartTime = `${newDate}T${newStart}:00`;
        const newEndTime = `${newDate}T${newEnd}:00`;

        await studentBookingService.studentRequestChange({
          sessionId: selectedEvent.sessionId,
          reason: reasonText,
          newStartTime,
          newEndTime,
        });
      }
      else {
        await studentBookingService.studentRequestAbsent({
          sessionId: selectedEvent.sessionId,
          reason: reasonText,
        });
      }

      // Hiện animation thành công 1s, sau đó đóng modal + chuyển trang
      showFeedback("success", "Gửi yêu cầu thành công!", () => {
        setOpenReasonModal(false);
        setReasonText("");
        navigate("/student/requests");
      });
    } catch (err) {
      const msg = err.response?.data?.message || "Lỗi gửi yêu cầu";

      // Hiện animation lỗi 1s, không chuyển trang
      showFeedback("error", msg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Sidebar */}
      <div className="w-80 bg-white border-r p-5">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 mb-5 px-3 py-2 rounded-lg bg-gray-100 hover:bg-blue-50"
        >
          <ArrowLeft size={18} />
          <span>Quay lại</span>
        </button>

        <h2 className="text-xl font-semibold mb-4">Danh sách PT & gói tập</h2>

        {packages.length === 0 ? (
          <p>Chưa có gói tập.</p>
        ) : (
          Object.entries(groupPackagesByPT(packages)).map(([ptName, list]) => (
            <div key={ptName} className="mb-4">
              <button
                onClick={() =>
                  setExpandedPT((prev) => (prev === ptName ? null : ptName))
                }
                className={`w-full flex justify-between px-3 py-2 rounded-lg ${expandedPT === ptName ? "bg-blue-100" : "bg-gray-100"
                  }`}
              >
                {ptName}
                {expandedPT === ptName ? (
                  <ChevronDown size={18} />
                ) : (
                  <ChevronRight size={18} />
                )}
              </button>

              {expandedPT === ptName && (
                <ul className="mt-2 ml-3">
                  {list.map((pkg) => (
                    <li
                      key={pkg._id}
                      className={`cursor-pointer px-3 py-2 rounded-md border mt-1 ${selectedPackage?._id === pkg._id
                        ? "bg-blue-50 border-blue-400"
                        : "bg-white"
                        }`}
                      onClick={() => setSelectedPackage(pkg)}
                    >
                      {pkg.package?.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))
        )}
      </div>

      {/* Calendar */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-4">📅 Lịch tập luyện</h1>

        <div className="bg-white border rounded-xl p-6 shadow">
          <Calendar
            localizer={localizer}
            events={events}
            onSelectEvent={handleSelectEvent}
            startAccessor="start"
            endAccessor="end"
            date={currentDate}
            onNavigate={setCurrentDate}
            view={view}
            onView={setView}
            views={["month", "week", "day"]}
            eventPropGetter={eventStyleGetter}
            style={{ height: "80vh" }}
          />
        </div>
      </div>

      {/* Modal 1 — chọn hành động */}
      {openActionModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-80 shadow-xl">
            <h2 className="font-semibold text-lg mb-4">
              Bạn muốn làm gì với buổi này?
            </h2>

            <button
              onClick={() => {
                setOpenActionModal(false);
                setReasonType("change");
                setOpenReasonModal(true);
              }}
              className="w-full bg-blue-600 text-white py-2 rounded-lg mb-3"
            >
              Đổi lịch
            </button>

            <button
              onClick={() => {
                setOpenActionModal(false);
                setReasonType("absent");
                setOpenReasonModal(true);
              }}
              className="w-full bg-red-600 text-white py-2 rounded-lg"
            >
              Xin nghỉ
            </button>
            <button
              onClick={() => {
                setOpenActionModal(false);
                setOpenBmiModal(true);
              }}
              className="w-full bg-green-600 text-white py-2 rounded-lg mt-3"
            >
              Lưu BMI
            </button>

            <button
              onClick={() => setOpenActionModal(false)}
              className="w-full mt-3 bg-gray-200 py-2 rounded-lg"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Modal 2 — nhập lý do */}
      {/* Modal 2 — nhập lý do + chọn thời gian mới */}
      {openReasonModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-[420px] shadow-xl">

            <h2 className="text-xl font-semibold mb-4">
              {reasonType === "change" ? "Đổi lịch buổi tập" : "Lý do xin nghỉ"}
            </h2>

            {reasonType === "change" && (
              <>
                {/* NGÀY MỚI */}
                <label className="block mb-2 font-medium">Ngày mới</label>
                <input
                  type="date"
                  className="w-full border rounded-lg p-2 mb-4"
                  value={newDate}
                  min={today}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val < today) {
                      toast.error("Không thể chọn ngày trong quá khứ!");
                      return;
                    }
                    setNewDate(val);
                  }}
                />


                {/* GIỜ BẮT ĐẦU */}
                <label className="block mb-2 font-medium">Giờ bắt đầu</label>
                <input
                  type="time"
                  className="w-full border rounded-lg p-2 mb-4"
                  value={newStart}
                  onChange={(e) => {
                    const val = e.target.value;

                    if (newDate === today && isPastTimeToday(newDate, val)) {
                      toast.error("Giờ này đã trôi qua!");
                      return;
                    }

                    setNewStart(val);
                  }}
                />

                {/* GIỜ KẾT THÚC */}
                <label className="block mb-2 font-medium">Giờ kết thúc</label>
                <input
                  type="time"
                  className="w-full border rounded-lg p-2 mb-4"
                  value={newEnd}
                  onChange={(e) => {
                    const val = e.target.value;

                    if (newStart && val <= newStart) {
                      toast.error("Giờ kết thúc phải sau giờ bắt đầu!");
                      return;
                    }

                    setNewEnd(val);
                  }}
                />

              </>
            )}

            {/* LÝ DO */}
            <label className="block font-medium mb-2">
              {reasonType === "change" ? "Lý do đổi lịch" : "Lý do xin nghỉ"}
            </label>
            <textarea
              className="w-full border rounded-lg p-3 h-24 mb-4"
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              placeholder="Nhập lý do..."
            />

            <button
              onClick={sendRequest}
              className="w-full bg-blue-600 text-white py-2 rounded-lg mb-2"
            >
              Gửi yêu cầu
            </button>

            <button
              onClick={() => setOpenReasonModal(false)}
              className="w-full bg-gray-200 py-2 rounded-lg"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
      {/* Modal 3 — nhập BMI */}
      {openBmiModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-[420px] shadow-xl">

            <h2 className="text-xl font-semibold mb-4">
              Nhập BMI cho buổi tập
            </h2>

            <label className="font-medium mb-2 block">Chiều cao (cm)</label>
            <input
              type="number"
              className="w-full border rounded-lg p-2 mb-3"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              placeholder="Ví dụ: 170"
            />

            <label className="font-medium mb-2 block">Cân nặng (kg)</label>
            <input
              type="number"
              className="w-full border rounded-lg p-2 mb-3"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              placeholder="Ví dụ: 65"
            />

            <label className="font-medium mb-2 block">Ghi chú (tùy chọn)</label>
            <textarea
              className="w-full border rounded-lg p-2 mb-4 h-20"
              value={bmiNote}
              onChange={(e) => setBmiNote(e.target.value)}
              placeholder="Nhập ghi chú..."
            />

            <button
              onClick={handleSaveBMI}
              className="w-full bg-blue-600 text-white py-2 rounded-lg mb-2"
            >
              Lưu BMI
            </button>

            <button
              onClick={() => setOpenBmiModal(false)}
              className="w-full bg-gray-200 py-2 rounded-lg"
            >
              Đóng
            </button>

          </div>
        </div>
      )}

      {feedback.open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-xl px-4 py-3 shadow-xl flex flex-col items-center">
            <Lottie
              animationData={successAnim}
              loop={false}
              autoplay
              style={{ width: 120, height: 120 }}
            />
            <p className="mt-2 text-sm text-gray-700 text-center">
              {feedback.message}
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default TrainingCalendar;
