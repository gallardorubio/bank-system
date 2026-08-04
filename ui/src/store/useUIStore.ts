// src/store/useUIStore.ts
import { create } from 'zustand';

interface UIState {
  isSidebarOpen: boolean;
  isInboxOpen: boolean;
  toggleSidebar: () => void;
  toggleInbox: () => void;
  closeAll: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: false,
  isInboxOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen, isInboxOpen: false })),
  toggleInbox: () => set((state) => ({ isInboxOpen: !state.isInboxOpen, isSidebarOpen: false })),
  closeAll: () => set({ isSidebarOpen: false, isInboxOpen: false }),
}));