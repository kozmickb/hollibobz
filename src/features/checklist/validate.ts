import { ChecklistDoc } from "./types";

export function validateChecklistDoc(raw: unknown): ChecklistDoc | null {
  try {
    const doc = raw as ChecklistDoc;
    if (!doc || typeof doc.tripTitle !== "string") return null;
    if (!Array.isArray(doc.sections)) return null;
    for (const s of doc.sections) {
      if (typeof s.title !== "string") return null;
      if (!Array.isArray(s.items)) return null;
      if (!s.items.every(i => typeof i === "string")) return null;
    }
    return doc;
  } catch {
    return null;
  }
}
