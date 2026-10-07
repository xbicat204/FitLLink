// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthProvider.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Environment } from "@/config/environment.js";
import { SocketProvider } from "@/contexts/SocketContext.jsx";
import { NotificationProvider } from "@/contexts/NotificationContext.jsx";
import "@/index.css";
import { BookingProvider } from "@/contexts/BookingContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={Environment.GG_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <SocketProvider>
            <NotificationProvider>
              <BookingProvider>
                <App />
              </BookingProvider>
            </NotificationProvider>
          </SocketProvider>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
