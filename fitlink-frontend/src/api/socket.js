// s@/api/socket.js
import { io } from "socket.io-client";

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL, {
      withCredentials: true,
      autoConnect: true,
    });
  }
  return socket;
}
