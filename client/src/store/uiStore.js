import { create } from "zustand";

export const useUIStore = create((set) => ({
  isSidebarOpen: true,

  setIsSidebarOpen: (value) => set({ isSidebarOpen: value }),
}));
