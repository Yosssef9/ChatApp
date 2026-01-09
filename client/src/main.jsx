import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { LoadingProvider } from "./context/LoadingContext";
import { AuthProvider } from "./context/AuthContext";
import router from "./routes/router";
import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LoadingProvider>
      <AuthProvider>
        <RouterProvider router={router} />
        {/* <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            closeOnClick
            pauseOnHover
            draggable
          /> */}
      </AuthProvider>
    </LoadingProvider>
  </StrictMode>
);
