import { create } from 'zustand';

export interface ModalState {
  open: boolean;
  type?: string;
  payload?: Record<string, unknown>;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface UiState {
  sidebarOpen: boolean;
  modalState: ModalState;
  toastMessages: ToastMessage[];
  toggleSidebar: () => void;
  openModal: (type: string, payload?: Record<string, unknown>) => void;
  closeModal: () => void;
  pushToast: (message: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  modalState: { open: false },
  toastMessages: [],
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  openModal: (type, payload) => set({ modalState: { open: true, type, payload } }),
  closeModal: () => set({ modalState: { open: false } }),
  pushToast: (message) =>
    set((state) => ({
      toastMessages: [
        ...state.toastMessages,
        { ...message, id: `${Date.now()}-${Math.random()}` },
      ],
    })),
  removeToast: (id) =>
    set((state) => ({
      toastMessages: state.toastMessages.filter((toast) => toast.id !== id),
    })),
}));

export default useUiStore;
