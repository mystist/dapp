import { create } from 'zustand'

interface RefreshState {
  counter: number
  refresh: () => void
}

export const useRefreshStore = create<RefreshState>((set) => ({
  counter: 0,
  refresh: () => set((state) => ({ counter: state.counter + 1 })),
}))
