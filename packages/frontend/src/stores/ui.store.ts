import { create } from 'zustand';

interface UIState {
  isSidebarOpen: boolean;
  isSheetOpen: boolean;
  sheetContent: React.ReactNode | null;
  sheetTitle: string;

  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  openSheet: (title: string, content: React.ReactNode) => void;
  closeSheet: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: false,
  isSheetOpen: false,
  sheetContent: null,
  sheetTitle: '',

  openSidebar: () => set({ isSidebarOpen: true }),
  closeSidebar: () => set({ isSidebarOpen: false }),
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  openSheet: (title, content) => set({ isSheetOpen: true, sheetTitle: title, sheetContent: content }),
  closeSheet: () => set({ isSheetOpen: false, sheetContent: null, sheetTitle: '' }),
}));