import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { LoadingProvider } from "./context/LoadingContext";
import { AuthProvider } from "./context/AuthContext";
import router from "./routes/router";
import { RouterProvider } from "react-router-dom";
import SocketProvider from "./providers/SocketProvider";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LoadingProvider>
      <AuthProvider>
        <SocketProvider>
          <RouterProvider router={router} />
        </SocketProvider>
      </AuthProvider>
    </LoadingProvider>
  </StrictMode>,
);
