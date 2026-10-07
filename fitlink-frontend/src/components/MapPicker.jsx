// s@/components/MapPicker.jsx
import { useEffect, useMemo, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import useDebouncedValue from '../hooks/useDeboncedValue'

const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_KEY
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY

/**
 * props:
 *  value?: { address?: string, coordinates?: [lng, lat] }
 *  onChange?: ({ address, coordinates }) => void
 *  height?: number|string
 *  countryFilter?: string  // vd: "countrycode:vn"
 */
export default function MapPicker({
    value = {},
    onChange,
    height = 360,
    countryFilter = ''
}) {
    const mapEl = useRef(null)
    const mapRef = useRef(null)
    const markerRef = useRef(null)

    const [query, setQuery] = useState(value.address || '')
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [suggestions, setSuggestions] = useState([])
    const dq = useDebouncedValue(query, 350)

    // tâm map ban đầu
    const center = useMemo(() => {
        return (Array.isArray(value.coordinates) && value.coordinates.length === 2)
            ? value.coordinates
            : [106.700981, 10.776889] // HCMC fallback
    }, [value.coordinates])

    // init map (mount 1 lần)
    useEffect(() => {
        if (!mapEl.current || mapRef.current) return

        const map = new maplibregl.Map({
            container: mapEl.current,
            style: `https@/api.maptiler.com/maps/streets/style.json?key=${MAPTILER_KEY}`,
            center,
            zoom: Array.isArray(value.coordinates) ? 15 : 12,
            attributionControl: true
        })
        mapRef.current = map
        map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right')

        // tạo marker ngay từ đầu (setLngLat rồi mới addTo để tránh lỗi)
        markerRef.current = new maplibregl.Marker({ color: '#ff4d00' })
        markerRef.current.setLngLat(center).addTo(map)
        markerRef.current.setPopup(new maplibregl.Popup().setText(value.address || ''))

        return () => { map.remove(); mapRef.current = null; markerRef.current = null }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // nếu prop value.coordinates đổi từ bên ngoài → flyTo + cập nhật marker
    useEffect(() => {
        if (!mapRef.current) return
        if (!Array.isArray(value.coordinates) || value.coordinates.length !== 2) return
        markerRef.current?.setLngLat(value.coordinates)
        mapRef.current.flyTo({ center: value.coordinates, zoom: 15 })
    }, [value.coordinates?.[0], value.coordinates?.[1]])

    // gọi Geoapify autocomplete
    useEffect(() => {
        const q = dq.trim()
        if (!q) { setSuggestions([]); return }
        let aborted = false
            ; (async () => {
                try {
                    setLoading(true)
                    const url = new URL('https@/api.geoapify.com/v1/geocode/autocomplete')
                    url.searchParams.set('text', q)
                    url.searchParams.set('format', 'json')
                    if (countryFilter) url.searchParams.set('filter', countryFilter) // ví dụ "countrycode:vn"
                    url.searchParams.set('limit', '6')
                    url.searchParams.set('apiKey', GEOAPIFY_KEY)

                    const res = await fetch(url.toString())
                    const data = await res.json()
                    if (aborted) return

                    const items = (data?.results || []).map(r => ({
                        label: r.formatted || r.address_line1 || r.result_type,
                        coords: [r.lon, r.lat] // [lng, lat]
                    }))
                    setSuggestions(items)
                } catch (e) {
                    setSuggestions([])
                } finally {
                    if (!aborted) setLoading(false)
                }
            })()
        return () => { aborted = true }
    }, [dq, countryFilter])

    const selectSuggestion = (s) => {
        setQuery(s.label)
        setOpen(false)
        setSuggestions([])

        // cập nhật marker + bay tới vị trí
        markerRef.current?.setLngLat(s.coords)
        mapRef.current?.flyTo({ center: s.coords, zoom: 16 })

        // trả về parent
        onChange?.({ address: s.label, coordinates: s.coords })
    }

    return (
        <div className="w-full">
            {/* ô search + dropdown */}
            <div className="relative mb-2">
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setOpen(true)}
                    onBlur={() => setTimeout(() => setOpen(false), 120)}
                    placeholder="Tìm địa chỉ…"
                    className="w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-gray-200"
                />
                {open && (loading || suggestions.length > 0) && (
                    <div className="absolute z-10 mt-1 w-full rounded-md border border-white/10 bg-gray-900/95 backdrop-blur">
                        {loading && <div className="p-2 text-xs text-gray-400">Đang tìm…</div>}
                        {suggestions.map((s, i) => (
                            <button
                                key={i}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()} // để không mất focus trước khi click
                                onClick={() => selectSuggestion(s)}
                                className="block w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-white/10"
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* map container phải có height */}
            <div
                ref={mapEl}
                style={{ height }}
                className="w-full rounded-xl overflow-hidden border border-white/10"
            />
        </div>
    )
}
