import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useBooking } from "@/contexts/BookingContext";

export default function MapD({ center, ptLocation }) {
  const {state, set} = useBooking();
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  // marker refs
  const centerMarkerRef = useRef(null);
  const originMarkerRef = useRef(null);

  // debounce timer
  const drawTimerRef = useRef(null);

  // form state
  const [lat, setLat] = useState(ptLocation.lat ?? "");
  const [lng, setLng] = useState(ptLocation.lng ?? "");

  // metrics
  const [distanceKm, setDistanceKm] = useState(null);
  const [durationMin, setDurationMin] = useState(null);
  const [error, setError] = useState("");

  // ---- init map 1 lần ----
  useEffect(() => {
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: `https@/api.maptiler.com/maps/streets/style.json?key=${import.meta.env.VITE_MAPTILER_KEY}`,
      center: [center.lng, center.lat],
      zoom: 16,
    });
    map.addControl(new maplibregl.NavigationControl(), "top-right");

    // Center marker
    centerMarkerRef.current = new maplibregl.Marker({ color: "#d33" })
      .setLngLat([center.lng, center.lat])
      .setPopup(new maplibregl.Popup().setText(center.fullAddress || "Center"))
      .addTo(map)
      .togglePopup();

    mapRef.current = map;

    return () => {
      map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Nếu ptLocation prop thay đổi => cập nhật input
  useEffect(() => {
    if (ptLocation?.lat != null) setLat(ptLocation.lat);
    if (ptLocation?.lng != null) setLng(ptLocation.lng);
  }, [ptLocation?.lat, ptLocation?.lng]);

  // ---- cập nhật khi center prop đổi (không re-create map) ----
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (centerMarkerRef.current) {
      centerMarkerRef.current.setLngLat([center.lng, center.lat]);
      if (center.fullAddress) {
        centerMarkerRef.current.setPopup(
          new maplibregl.Popup().setText(center.fullAddress)
        );
      }
    } else {
      centerMarkerRef.current = new maplibregl.Marker({ color: "#d33" })
        .setLngLat([center.lng, center.lat])
        .setPopup(new maplibregl.Popup().setText(center.fullAddress || "Center"))
        .addTo(map);
    }

    map.flyTo({ center: [center.lng, center.lat], zoom: 16, duration: 600 });
  }, [center]);

  // ---- helpers ----
  const clearRoute = () => {
    const map = mapRef.current;
    if (!map) return;
    if (map.getLayer("route-line")) map.removeLayer("route-line");
    if (map.getSource("route")) map.removeSource("route");
  };

  const clearOriginMarker = () => {
    if (originMarkerRef.current) {
      originMarkerRef.current.remove();
      originMarkerRef.current = null;
    }
  };

  const resetUI = () => {
    clearRoute();
    clearOriginMarker();
    setDistanceKm(null);
    setDurationMin(null);
    setError("");
  };

  const isValidCoord = (latNum, lngNum) =>
    Number.isFinite(latNum) &&
    Number.isFinite(lngNum) &&
    latNum >= -90 &&
    latNum <= 90 &&
    lngNum >= -180 &&
    lngNum <= 180;

  // ---- core: vẽ tuyến từ (lat,lng) -> center ----
  const drawRoute = async (latNum, lngNum) => {
    const map = mapRef.current;
    if (!map) return;

    // dọn cũ
    clearRoute();
    clearOriginMarker();

    // marker origin (tọa độ bạn nhập)
    originMarkerRef.current = new maplibregl.Marker({ color: "#0ea5e9" })
      .setLngLat([lngNum, latNum])
      .setPopup(new maplibregl.Popup().setText("Điểm nhập (origin)"))
      .addTo(map);

    try {
      const coords = `${lngNum},${latNum};${center.lng},${center.lat}`;
      const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=false`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Routing request failed");
      const data = await res.json();

      const route = data?.routes?.[0];
      if (!route?.geometry) throw new Error("No route found");

      map.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: route.geometry,
        },
      });

      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-width": 5,
          "line-color": "#3b82f6",
          "line-opacity": 0.9,
        },
      });

      const coordsArr = route.geometry.coordinates;
      const bounds = coordsArr.reduce(
        (b, [lng, lat]) => b.extend([lng, lat]),
        new maplibregl.LngLatBounds(coordsArr[0], coordsArr[0])
      );
      map.fitBounds(bounds, { padding: 60, duration: 600 });

      setDistanceKm((route.distance || 0) / 1000);
      setDurationMin((route.duration || 0) / 60);
      set({ distanceKm:(route.distance || 0) / 1000, durationMin:(route.duration || 0) / 60 });
      setError("");
    } catch (err) {
      console.error(err);
      setError("Không tìm thấy tuyến đường phù hợp.");

      // fit 2 điểm tối thiểu
      const bounds = new maplibregl.LngLatBounds(
        [lngNum, latNum],
        [center.lng, center.lat]
      );
      map.fitBounds(bounds, { padding: 60, duration: 600 });
    }
  };

  // ---- AUTO DRAW: mỗi khi lat/lng/center đổi, tự vẽ nếu hợp lệ ----
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // nếu input trống -> clear
    if (lat === "" || lng === "") {
      resetUI();
      return;
    }

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (!isValidCoord(latNum, lngNum)) {
      setError("Tọa độ không hợp lệ. Vui lòng nhập lat ∈ [-90, 90], lng ∈ [-180, 180].");
      resetUI();
      return;
    }

    // debounce 300ms để tránh gọi liên tục khi đang gõ
    if (drawTimerRef.current) clearTimeout(drawTimerRef.current);
    drawTimerRef.current = setTimeout(() => {
      drawRoute(latNum, lngNum);
    }, 300);

    return () => {
      if (drawTimerRef.current) clearTimeout(drawTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng, center.lat, center.lng]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Control Panel */}
      <form
        onSubmit={(e) => e.preventDefault()} // không cần submit nữa
        style={{
          position: "absolute",
          zIndex: 1,
          top: 8,
          left: 8,
          padding: 12,
          background: "white",
          borderRadius: 10,
          boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
          maxWidth: 440,
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          <input
            hidden={true}
            type="number"
            step="any"
            placeholder="Lat (vd: 10.781)"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            style={{
              width: 140,
              padding: "6px 8px",
              border: "1px solid #ddd",
              borderRadius: 8,
            }}
          />
          <input
            hidden={true}
            type="number"

            step="any"
            placeholder="Lng (vd: 106.700)"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            style={{
              width: 160,
              padding: "6px 8px",
              border: "1px solid #ddd",
              borderRadius: 8,
            }}
          />
        </div>

        <button
          hidden={true}
          type="button"
          onClick={() => {
            setLat("");
            setLng("");
            resetUI();
          }}
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            background: "white",
            cursor: "pointer",
            fontWeight: 600,
          }}
          title="Xóa tuyến & marker nhập"
        >
          Xóa
        </button>

        {/* metrics */}
        {(distanceKm != null || durationMin != null) && (
          <div style={{ fontSize: 13, color: "#111827" }}>
            {distanceKm != null && (
              <span>
                Quãng đường: <b>{distanceKm.toFixed(2)} km</b>
              </span>
            )}
            {distanceKm != null && durationMin != null && <span> · </span>}
            {durationMin != null && (
              <span>
                Thời gian: <b>{Math.round(durationMin)} phút</b>
              </span>
            )}
          </div>
        )}

        {/* error */}
        {error && (
          <div style={{ color: "#dc2626", fontSize: 12, width: "100%" }}>
            {error}
          </div>
        )}
      </form>

      {/* Map */}
      <div ref={mapContainer} style={{ height: "400px", width: "100%" }} />
    </div>
  );
}
