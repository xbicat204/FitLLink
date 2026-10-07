// src/hooks/useDebouncedValue.js
import { useEffect, useState } from 'react'

export default function useDebouncedValue(value, delay = 300) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return v
}
