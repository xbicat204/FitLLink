// s@/contexts/BookingContext.jsx
import React, { createContext, useContext, useMemo, useState } from "react";

const BookingContext = createContext(null);

const initialState = {
  // định danh
  ptId: null,
  packageId: null,

  // lựa chọn lịch
  mode: null,              // 'atPtGym' | 'atClient' | 'atOtherGym'
  pattern: [],             // [2,4,6]
  slot: null,              // { start:'08:30', end:'09:30' }
  startDate: null,         // 'YYYY-MM-DD'

  // vị trí (input từ người dùng / map)
  clientAddress: null,     // { address, location:{ lat, lng }, name? }
  otherGymAddress: null,   // { address, location:{ lat, lng }, name? }
  ptGymAddress: null,      // (read-only từ PT detail nếu cần hiển thị)

  // travel tính được từ step 2
  distanceKm: null,        // số km theo routing (UI hiện)
  durationMin: null,       // phút theo routing (UI hiện)
  inRange: true,           // còn trong phạm vi
  travelFee: 0,            // phí ước tính FE (hiện trước khi submit)

  // policy snapshot (để FE tính hiển thị trước)
  travelPolicy: {
    freeRadiusKm: 0,
    maxTravelKm: 0,
    feePerKm: 0,
  },

  // package snapshot tối thiểu (để hiển thị/ước tính trước)
  packageSnapshot: {
    name: '',
    price: 0,
    currency: 'VND',
    totalSessions: null,
    sessionDurationMin: null,
  },

  // UI-only (không gửi BE)
  window: null,            // 'morning' | 'afternoon'
  loadingBlocks: false,
  blocks: [],              // [{start,end,ok}] từ /blocks-simple
  preview: [],             // danh sách buổi preview 9/12 buổi
  error: null,
};

export function BookingProvider({ children }) {
  const [state, setState] = useState(initialState);
  console.log("BookingProvider - State: ", state);
  

  const set = (patch) => setState((prev) => ({ ...prev, ...patch }));
  const reset = () => setState(initialState);

  const readyForPreview =
    state.pattern.length && state.slot && state.startDate && state.mode;

  const value = useMemo(
    () => ({ state, set, reset, readyForPreview }),
    [state, readyForPreview]
  );

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
}

export const useBooking = () => useContext(BookingContext);
