import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import LoadingOverlay from "../components/LoadingOverlay";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (user === undefined) {
    return <LoadingOverlay />;
  }

  if (!user) {
    // not logged in
    return <Navigate to="/login" replace />;
  }

  // allowed
  return children;
};

export default ProtectedRoute;
