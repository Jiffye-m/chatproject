import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isVerifyingEmail: false,
  isResendingVerification: false,
  socket: null,
  onlineUsers: [],

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in authCheck:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      
      // Check if email verification is required
      if (res.data.requiresVerification) {
        toast.success("Account created! Please check your email to verify your account.");
        set({ authUser: null }); // Don't set auth user until verified
        return { requiresVerification: true, email: res.data.email };
      }
      
      // If no verification required (shouldn't happen with your backend, but for safety)
      set({ authUser: res.data });
      toast.success("Account created successfully!");
      get().connectSocket();
      return { requiresVerification: false };
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create account");
      throw error;
    } finally {
      set({ isSigningUp: false });
    }
  },

  verifyEmail: async (token) => {
    set({ isVerifyingEmail: true });
    try {
      const res = await axiosInstance.get(`/auth/verify-email?token=${token}`);
      set({ authUser: res.data.user });
      toast.success("Email verified successfully! Welcome to ChatApp!");
      get().connectSocket();
      return { success: true, user: res.data.user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Email verification failed";
      toast.error(errorMessage);
      return { 
        success: false, 
        message: errorMessage,
        expired: error.response?.data?.expired 
      };
    } finally {
      set({ isVerifyingEmail: false });
    }
  },

  resendVerification: async (email) => {
    set({ isResendingVerification: true });
    try {
      const res = await axiosInstance.post("/auth/resend-verification", { email });
      toast.success(res.data.message || "Verification email sent! Check your inbox.");
      return { success: true, attemptsLeft: res.data.attemptsLeft };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to resend verification email";
      toast.error(errorMessage);
      return { 
        success: false, 
        message: errorMessage,
        retryAfter: error.response?.data?.retryAfter 
      };
    } finally {
      set({ isResendingVerification: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      
      // Check if email verification is required
      if (res.data.requiresVerification) {
        toast.error("Please verify your email address to continue");
        return { requiresVerification: true, email: res.data.email };
      }
      
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
      return { requiresVerification: false };
    } catch (error) {
      const errorData = error.response?.data;
      
      // Handle email verification required
      if (errorData?.requiresVerification) {
        toast.error(errorData.message || "Please verify your email to login");
        return { requiresVerification: true, email: errorData.email };
      }
      
      toast.error(errorData?.message || "Login failed");
      throw error;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error("Error logging out");
      console.log("Logout error:", error);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      
      // Show appropriate message
      if (res.data.requiresVerification) {
        toast.success(res.data.message || "Email updated! Please verify your new email address.");
        return { requiresVerification: true };
      }
      
      // Only show success message if it's not just a profile picture update
      if (data.fullName || data.email) {
        toast.success("Profile updated successfully");
      }
      return { requiresVerification: false };
    } catch (error) {
      console.log("Error in update profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
      throw error;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      withCredentials: true,
    });

    socket.connect();
    set({ socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));