import { useEffect, useMemo, useRef, useState } from "react";
import { useBooking } from "@/contexts/BookingContext";
import MapD from "@/components/MapD";
import { studentService } from "@/services/studentService";
import { calculateTravelFee } from "@/utils/booking/calculateTravelFee";
import { toast } from "react-toastify";

const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_KEY;
const COUNTRY_FILTER = "countrycode:vn"; // tuỳ chọn

const Chip = ({ active, disabled, onClick, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-3 py-2 rounded-xl border text-sm mr-2 mb-2
      ${active ? "bg-red-600/20 border-red-500 text-red-200" : "bg-neutral-900/60 border-neutral-700 text-neutral-300"}
      ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-neutral-800"}`}
  >
    {children}
  </button>
);

/** Autocomplete Geoapify → onSelect({label, coords:[lng,lat]}) */
function AddressAutocomplete({ onSelect, placeholder = "Nhập địa chỉ để tìm…" }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const tRef = useRef(null);

  useEffect(() => {
    if (!q.trim()) { setItems([]); return; }
    clearTimeout(tRef.current);
    tRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        const url = new URL("https@/api.geoapify.com/v1/geocode/autocomplete");
        url.searchParams.set("text", q.trim());
        url.searchParams.set("format", "json");
        url.searchParams.set("limit", "6");
        url.searchParams.set("apiKey", GEOAPIFY_KEY);
        if (COUNTRY_FILTER) url.searchParams.set("filter", COUNTRY_FILTER);
        const res = await fetch(url.toString());
        const data = await res.json();
        const list = (data?.results || []).map((r) => ({
          label: r.formatted || r.address_line1 || r.result_type,
          coords: [r.lon, r.lat],
        }));
        setItems(list);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(tRef.current);
  }, [q]);

  const pick = (s) => {
    setQ(s.label);
    setOpen(false);
    setItems([]);
    onSelect?.(s); // { label, coords:[lng,lat] }
  };

  return (
    <div className="relative">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-gray-200"
        aria-label="Ô tìm địa chỉ"
      />
      {open && (loading || items.length > 0) && (
        <div className="absolute z-10 mt-1 w-full max-h-64 overflow-auto rounded-md border border-white/10 bg-gray-900/95 backdrop-blur">
          {loading && <div className="p-2 text-xs text-gray-400">Đang tìm…</div>}
          {items.map((s, i) => (
            <button
              key={`${s.label}-${i}`}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(s)}
              className="block w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-white/10"
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const isNum = (n) => typeof n === "number" && !Number.isNaN(n);
const isValidWgs84 = (lng, lat) =>
  isNum(lng) && isNum(lat) && lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;

export default function Step2Location({ student, pt, onBack, onNext }) {
  const { state, set } = useBooking();

  const {
    feePerKm,
    freeRadiusKm,
    maxTravelKm
  } = state.travelPolicy;

  const {
    distanceKm
  } = state;

  // Tâm PT gym từ BE: [lng, lat] → {lat, lng}
  const ptCoords = pt?.primaryGym?.location?.coordinates;
  const ptCenter = useMemo(() => {
    if (Array.isArray(ptCoords) && ptCoords.length === 2 && isValidWgs84(ptCoords[0], ptCoords[1])) {
      return { lat: ptCoords[1], lng: ptCoords[0] };
    }
    return { lat: 21.0278, lng: 105.8342 }; // fallback HN
  }, [ptCoords]);

  // UI states
  const [loadingDefault, setLoadingDefault] = useState(true);
  const [defaultError, setDefaultError] = useState("");

  // Form nhập trước khi lưu
  const [addr, setAddr] = useState("");
  const [lng, setLng] = useState("");
  const [lat, setLat] = useState("");

  // Sau khi lưu thành công → mở Chip + Map
  const [savedLocation, setSavedLocation] = useState(null); // {lng, lat}
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [travelFee, setTravelFee] = useState(null)

  // Tải default location qua service
  useEffect(() => {
    // reset booking fields mỗi lần vào step
    set({
      mode: null,
      clientAddress: null,
      otherGymAddress: null,
      ptGymAddress: pt?.primaryGym || null,
    });

    const run = async () => {
      try {
        setLoadingDefault(true);
        setDefaultError("");
        if (!student?._id) return;

        const res = await studentService.getDefaultLocationByStudentId(student._id);
        const point = res?.data; // GeoJSON Point
        if (point?.type === "Point" && Array.isArray(point.coordinates) && point.coordinates.length === 2) {
          const [lng0, lat0] = point.coordinates.map(Number);
          if (isValidWgs84(lng0, lat0)) {
            setSavedLocation({ lng: lng0, lat: lat0 });
            setAddr("Địa chỉ mặc định");
            setLng(String(lng0));
            setLat(String(lat0));
          }
        }
      } catch (err) {
        // 404 là bình thường (chưa có default)
        if (err?.response?.status !== 404) {
          setDefaultError(err?.response?.data?.message || "Không thể tải toạ độ mặc định");
        }
      } finally {
        setLoadingDefault(false);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student?._id]);

  // Khi pick từ autocomplete → set addr + đổ lng/lat vào input
  const handlePickAddress = (s) => {
    setAddr(s.label);
    if (Array.isArray(s.coords) && s.coords.length === 2) {
      setLng(String(s.coords[0]));
      setLat(String(s.coords[1]));
    }
  };

  // Lưu default location (yêu cầu cookie/token hợp lệ ở axiosClient)
  const handleSave = async () => {
    setSaveMsg("");
    const lngNum = Number(lng);
    const latNum = Number(lat);
    if (!isValidWgs84(lngNum, latNum)) {
      setSaveMsg("Toạ độ không hợp lệ. Cần nằm trong [-180..180] và [-90..90].");
      return;
    }
    try {
      setSaving(true);
      const res = await studentService.upsertDefaultLocation({ lng: lngNum, lat: latNum });
      if (res?.success) {
        setSavedLocation({ lng: lngNum, lat: latNum });
        setSaveMsg("✅ Đã lưu địa chỉ mặc định.");
      } else {
        setSaveMsg(res?.message || "Lưu địa chỉ thất bại.");
      }
    } catch (error) {
      setSaveMsg(error?.response?.data?.message || "Lỗi mạng khi lưu địa chỉ.");
    } finally {
      setSaving(false);
    }
  };

  // Bật Chip/Next khi đã có savedLocation + đã chọn mode
  const enableChips = !!savedLocation;
  const canNext = !!state.mode && !!savedLocation;

  const delivery = pt?.deliveryModes || {};
  const canAtPtGym = !!delivery.atPtGym;
  const canAtClient = !!delivery.atClient;
  const canAtOtherGym = !!delivery.atOtherGym;

  const chooseMode = (mode) => {
    if (!savedLocation) return;
    const payload = {
      address: addr || "Địa chỉ mặc định",
      location: { lat: savedLocation.lat, lng: savedLocation.lng },
    };
    if (mode === "atClient") {
      try {
        // Tính phí di chuyển dựa trên state.distanceKm & travelPolicy
        const fee = calculateTravelFee(
          Number(distanceKm || 0),
          Number(feePerKm || 0),
          Number(freeRadiusKm || 0),
          Number(maxTravelKm || Infinity)
        );
        setTravelFee(fee);
        set({ mode,travelFee: fee, clientAddress: null, otherGymAddress: null });
      } catch (err) {
        // Nếu vượt quá khoảng cách cho phép → không đổi mode và hiện toast
        setTravelFee(null);
        toast.error(err?.message || "Vượt quá khoảng cách đi lại cho phép của PT, vui lòng chọn mode khác.");
      }

    } else if (mode === "atOtherGym") {
      // Không tính phí ở đây
      setTravelFee(null);
      set({ mode, otherGymAddress: payload, clientAddress: null });
    } else if (mode === "atPtGym") {
      // Không tính phí, reset hiển thị phí (nếu có)
      setTravelFee(null);
      set({ mode, clientAddress: payload, otherGymAddress: null, travelFee: 0 });
    }
  };

  const center = savedLocation
    ? { lat: savedLocation.lat, lng: savedLocation.lng }
    : ptCenter;

  return (
    <div className="space-y-4">
      <div className="text-slate-300">Chọn địa điểm</div>

      {/* B1: tải default location */}
      {loadingDefault && <div className="text-sm text-neutral-400">Đang tải vị trí mặc định…</div>}
      {!loadingDefault && defaultError && (
        <div className="text-sm text-red-400">{defaultError}</div>
      )}

      {/* B2: Nếu CHƯA có savedLocation → nhập địa chỉ + toạ độ, bấm Lưu */}
      {!loadingDefault && !savedLocation && (
        <div className="space-y-2">
          <AddressAutocomplete onSelect={handlePickAddress} />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Kinh độ (lng)</label>
              <input
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                inputMode="decimal"
                placeholder="vd: 105.83416"
                className="w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-gray-200"
                aria-label="Kinh độ"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Vĩ độ (lat)</label>
              <input
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                inputMode="decimal"
                placeholder="vd: 21.02776"
                className="w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-gray-200"
                aria-label="Vĩ độ"
              />
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-red-600 text-white disabled:opacity-50 hover:bg-red-700 transition"
          >
            {saving ? "Đang lưu…" : "Lưu địa chỉ"}
          </button>
          {saveMsg && <div className="text-xs text-neutral-400">{saveMsg}</div>}
          <div className="text-xs text-neutral-500">
            * Chọn địa chỉ sẽ tự điền toạ độ; nếu không tìm được, bạn có thể nhập tay lng/lat.
          </div>
        </div>
      )}

      {/* B3: Khi đã có savedLocation → mở Chip + Map */}
      {savedLocation && (
        <>
          <div className="flex gap-2 flex-wrap">
            <Chip
              active={state.mode === "atPtGym"}
              disabled={!enableChips || !canAtPtGym}
              onClick={() => chooseMode("atPtGym")}
            >
              Tại gym PT
            </Chip>
            <Chip
              active={state.mode === "atClient"}
              disabled={!enableChips || !canAtClient}
              onClick={() => chooseMode("atClient")}
            >
              Tại nhà tôi
            </Chip>
            <Chip
              active={state.mode === "atOtherGym"}
              disabled={!enableChips || !canAtOtherGym}
              onClick={() => chooseMode("atOtherGym")}
            >
              Tại gym khác
            </Chip>
          </div>

          <MapD center={center} ptLocation={ptCenter} />
          {state.mode === "atClient" && travelFee !== null && (
            <div className="mt-2 rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-gray-200">
              <div className="font-medium">Phí di chuyển ước tính</div>
              <div className="mt-1">
                Khoảng cách: <span className="text-gray-300">{Number(distanceKm || 0).toFixed(2)} km</span>
              </div>
              <div>
                Miễn phí trong bán kính: <span className="text-gray-300">{Number(freeRadiusKm || 0)} km</span>
              </div>
              <div>
                Đơn giá: <span className="text-gray-300">{Number(feePerKm || 0).toLocaleString("vi-VN")} đ/km</span>
              </div>
              <div className="mt-1">
                <span>Tổng phí tạm tính: </span>
                <span className="font-semibold">
                  {Number(travelFee).toLocaleString("vi-VN")} đ
                </span>
              </div>
              <div className="text-xs text-neutral-400 mt-1">
                * Phí tạm tính có thể thay đổi nếu khoảng cách hoặc chính sách di chuyển khác đi.
              </div>
            </div>
          )}
          <div className="text-xs text-neutral-400 mt-2">
            Toạ độ mặc định: ({savedLocation.lat.toFixed(6)}, {savedLocation.lng.toFixed(6)})
            {addr ? ` — ${addr}` : ""}
          </div>
        </>
      )}

      <div className="flex justify-between">
        <button
          className="px-4 py-2 rounded-xl border border-neutral-700 text-neutral-200 hover:bg-neutral-800"
          onClick={onBack}
        >
          Quay lại
        </button>
        <button
          className="px-4 py-2 rounded-xl bg-red-600 text-white disabled:opacity-50 hover:bg-red-700 transition"
          onClick={onNext}
          disabled={!canNext}
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );
}
