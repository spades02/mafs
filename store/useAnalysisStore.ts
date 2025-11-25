"use client";

import { create } from "zustand";

interface AnalysisState {
  analysisRun: boolean;
  setAnalysisRun: (value: boolean) => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  analysisRun: false,
  setAnalysisRun: (value) => set({ analysisRun: value }),
}));