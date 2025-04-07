import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });

      get().connectSocket(); // Call the socket connection function after checking auth
    } catch (error) {
      console.log("Error checking authentication:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);

      set({ authUser: res.data });
      toast.success("Account created successfully");

      get().connectSocket(); // Call the socket connection function after signup
    } catch (error) {
      console.error(error.response.data.message);
      console.log("Error in signup:", error);
      if (error.response) {
        const { message, user } = error.response.data; // Extract message & user details

        if (error.response.status === 400 && user) {
          toast.error(` ${message})`);
        } else {
          toast.error(message || "Something went wrong. Please try again.");
        }
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      set({ isSigningUp: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");

      get().disconnectSocket(); // Call the socket disconnection function after logout
    } catch (error) {
      toast.error("oppssiess something went wrong");
      console.log("Error in logout:", error);
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");

      get().connectSocket(); // Call the socket connection function after login
    } catch (error) {
      toast.error(error.response.data.message);
      console.error(error.response.data.message);
      console.log("Error in login:", error);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-Profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("error in update profile", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return; // Ensure user is authenticated before connecting

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id, // Pass userId as a query parameter to the socket connection
      },
    });
    socket.connect();

    set({ socket: socket }); // Save the socket instance in the state

    socket.on("getOnlineUsers", (UserIds) => {
      set({ onlineUsers: UserIds });
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect(); // Disconnect the socket if it's connected
  },
}));
