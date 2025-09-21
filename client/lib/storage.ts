import type { Scrum } from "../../shared/api";

const STORAGE_KEY = "scrumdinger.scrums.v1";

export function loadScrums(): Scrum[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as Scrum[];
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Failed to load scrums", e);
    return [];
  }
}

export function saveScrums(scrums: Scrum[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scrums));
  } catch (e) {
    console.error("Failed to save scrums", e);
  }
}

export function upsertScrum(scrum: Scrum) {
  const scrums = loadScrums();
  const idx = scrums.findIndex((s) => s.id === scrum.id);
  if (idx >= 0) scrums[idx] = scrum; else scrums.unshift(scrum);
  saveScrums(scrums);
}

export function removeScrum(id: string) {
  const scrums = loadScrums().filter((s) => s.id !== id);
  saveScrums(scrums);
}

export function findScrum(id: string): Scrum | undefined {
  return loadScrums().find((s) => s.id === id);
}
