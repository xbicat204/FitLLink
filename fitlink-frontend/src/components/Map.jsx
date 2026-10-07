import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function Map({ center }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) mapRef.current.remove();

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: `https@/api.maptiler.com/maps/streets/style.json?key=${import.meta.env.VITE_MAPTILER_KEY}`,
      center: [center.lng, center.lat],
      zoom: 16,
    });
    map.addControl(new maplibregl.NavigationControl(), "top-right");

    new maplibregl.Marker({ color: "#d33" })
      .setLngLat([center.lng, center.lat])
      // .setPopup(new maplibregl.Popup().setText(center.fullAddress))
      .addTo(map)
      .togglePopup();

    mapRef.current = map;
  }, [center]);

  return <div ref={mapContainer} style={{ height: "400px", width: "100%" }} />;
}