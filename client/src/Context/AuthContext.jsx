// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/api";
import { useLoading } from "./LoadingContext";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(undefined);
  const { setLoading } = useLoading();

  // ===============================
  // 🔹 Fetch logged-in user
  // ===============================
  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await api.get("/auth/me", { withCredentials: true });
      console.log("auth/me", res);
      setUser(res.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // ===============================
  // 🔹 Auth methods
  // ===============================
  const login = async (username, password) => {
    try {
      setLoading(true);
      const res = await api.post(
        "/auth/login",
        { username, password },
        { withCredentials: true }
      );
      const currentUser = res.data.user;
      setUser(currentUser);

      // ✅ رجّع اليوزر علشان اللي ينادي login يقدر يقرر هو يروح فين
      return { success: true, user: currentUser };
    } catch (err) {
      console.log("err.response", err.response);
      const message =
        err.response?.data?.message || "Login failed. Please try again.";
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, password) => {
    try {
      setLoading(true);
      const res = await api.post(
        "/auth/register",
        { username, password },
        { withCredentials: true }
      );
      setUser(res.data.user);
      return { success: true };
    } catch (err) {
      console.log("err.response", err.response);
      const message =
        err.response?.data?.message || "Registration failed. Please try again.";
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await api.post("/auth/logout", {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        fetchUser,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
