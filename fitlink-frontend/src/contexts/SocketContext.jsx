// s@/contexts/SocketContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { getSocket } from "@/api/socket";
import { useAuth } from "./AuthProvider";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socket = getSocket();          // ⭐ lấy instance duy nhất

  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [socket]);

  // đăng ký user room sau khi connect / khi user thay đổi
  useEffect(() => {
    if (!user?._id) return;

    const register = () => socket.emit("registerUser", user._id);

    if (socket.connected) register();

    socket.on("connect", register);
    return () => socket.off("connect", register);
  }, [user?._id, socket]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
