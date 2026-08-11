
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import API from "../api/axios";
import socket from "../socket/socket";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // Load Logged-in User
  // ==========================================

  const loadUser = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await API.get("/auth/profile");

      if (
        response.data?.success &&
        response.data?.user
      ) {
        const loggedInUser = response.data.user;

        setUser(loggedInUser);

        localStorage.setItem(
          "user",
          JSON.stringify(loggedInUser)
        );

        // Connect Socket.IO
        if (!socket.connected) {
          socket.connect();
        }

        // Join user's socket room
        if (loggedInUser?._id) {
          socket.emit(
            "join",
            loggedInUser._id
          );
        }
      } else {
        throw new Error(
          "Invalid profile response"
        );
      }
    } catch (error) {
      console.error(
        "Authentication check failed:",
        error.response?.data?.message ||
          error.message
      );

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (socket.connected) {
        socket.disconnect();
      }

      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Login
  // ==========================================

  const login = async (email, password) => {
    try {
      const response = await API.post(
        "/auth/login",
        {
          email,
          password,
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Login failed"
        );
      }

      const loggedInUser =
        response.data.user;

      const token =
        response.data.token;

      if (!token) {
        throw new Error(
          "Login successful but token was not received."
        );
      }

      // Save token
      localStorage.setItem(
        "token",
        token
      );

      // Save user
      localStorage.setItem(
        "user",
        JSON.stringify(loggedInUser)
      );

      // Update React state
      setUser(loggedInUser);

      // Connect Socket.IO
      if (!socket.connected) {
        socket.connect();
      }

      // Join socket room
      if (loggedInUser?._id) {
        socket.emit(
          "join",
          loggedInUser._id
        );
      }

      return response.data;
    } catch (error) {
      console.error(
        "Login failed:",
        error.response?.data?.message ||
          error.message
      );

      throw error;
    }
  };

  // ==========================================
  // Logout
  // ==========================================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    if (socket.connected) {
      socket.disconnect();
    }

    setUser(null);
  };

  // ==========================================
  // Update User
  // ==========================================

  const updateUser = (updatedUser) => {
    setUser(updatedUser);

    localStorage.setItem(
      "user",
      JSON.stringify(updatedUser)
    );
  };

  // ==========================================
  // Initial Authentication Check
  // ==========================================

  useEffect(() => {
    loadUser();
  }, []);

  // ==========================================
  // Provider
  // ==========================================

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        updateUser,
        loading,
        login,
        logout,
        loadUser,
        isAuthenticated:
          Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ==========================================
// useAuth Hook
// ==========================================

export const useAuth = () => {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};

