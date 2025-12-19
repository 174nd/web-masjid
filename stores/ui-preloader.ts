"use client";

import { create } from "zustand";

type UiPreloaderState = {
  isPreloaderDone: boolean;
  setPreloaderDone: (done: boolean) => void;
};

export const useUiPreloader = create<UiPreloaderState>((set) => ({
  isPreloaderDone: false,
  setPreloaderDone: (done) => set({ isPreloaderDone: done }),
}));
