'use client';
// src/store.js
import { create } from 'zustand';

const useStore = create((set) => ({
  panels: 2,
  doors: 1,
  returnSide: 'left',
  isDoorOpen: false,
  toggleDoor: () => set((state) => ({ isDoorOpen: !state.isDoorOpen })),
}));

export default useStore;
