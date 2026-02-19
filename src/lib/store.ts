"use client";

import type { Strategy } from "./types";

const STORAGE_KEY = "valentactics_strategy";

export function saveStrategy(strategy: Strategy): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(strategy));
  }
}

export function loadStrategy(id: string): Strategy | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const strategy: Strategy = JSON.parse(raw);
    return strategy.id === id ? strategy : null;
  } catch {
    return null;
  }
}
