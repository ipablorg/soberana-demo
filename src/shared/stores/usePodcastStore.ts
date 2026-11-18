import { create } from 'zustand';

interface PodcastState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  isMinimized: boolean;

  setIsPlaying: (val: boolean) => void;
  setCurrentTime: (val: number) => void;
  setDuration: (val: number) => void;
  setIsLoading: (val: boolean) => void;
  toggleMinimized: () => void;
}

export const usePodcastStore = create<PodcastState>((set) => ({
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  isLoading: false,
  isMinimized: false,

  setIsPlaying: (val) => set({ isPlaying: val }),
  setCurrentTime: (val) => set({ currentTime: val }),
  setDuration: (val) => set({ duration: val }),
  setIsLoading: (val) => set({ isLoading: val }),
  toggleMinimized: () => set((s) => ({ isMinimized: !s.isMinimized })),
}));
