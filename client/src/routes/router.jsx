import { createBrowserRouter } from "react-router-dom";
import { Suspense, lazy } from "react";
import LoadingOverlay from "../components/LoadingOverlay";
import ProtectedRoute from "../components/ProtectedRoute";

// ✅ Lazy Imports
const Home = lazy(() => import("../pages/Home"));
const Login = lazy(() => import("../pages/Login"));
const Signup = lazy(() => import("../pages/Signup"));

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingOverlay />}>
          <Home />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: (
      <Suspense fallback={<LoadingOverlay />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: "/signup",
    element: (
      <Suspense fallback={<LoadingOverlay />}>
        <Signup />
      </Suspense>
    ),
  },
]);

export default router;
