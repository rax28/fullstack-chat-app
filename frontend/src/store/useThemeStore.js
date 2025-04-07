import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("chat-theme") || "retro",
  setTheme: (theme) => {
    console.log("Setting theme:", theme);
    localStorage.setItem("chat-theme", theme);
    set({ theme });
  },
}));
