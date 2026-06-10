
import { create } from 'zustand';

const useCounterStore = create((set) => ({
  count: 0,
  name: 'Danya',
  increment: () => set((state) => ({ count: state.count + 1 })),
  increase: () => set((state) => ({ count: state.count * 2 })),
}));

export default useCounterStore