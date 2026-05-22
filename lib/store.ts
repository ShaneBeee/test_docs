import { SkDocs } from "./types";

const STORAGE_KEY = "skbee-docs-data";

export function getDocs(): SkDocs | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

export function saveDocs(docs: SkDocs) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

export function clearDocs() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export const CATEGORIES = [
  "structures",
  "events",
  "types",
  "expressions",
  "conditions",
  "effects",
  "functions",
  "sections",
] as const;
