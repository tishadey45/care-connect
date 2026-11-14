export type EventItem = {
  id: string;
  title: string;
  type: string;
  location: string;
  date: string;
  thumbnail: string;
  description?: string;
  createdAt: string;
};

export const EVENT_TYPES = [
  "Cleanup",
  "Plantation",
  "Donation",
  "Education",
  "Blood Donation",
  "Other",
] as const;

export const DEFAULT_THUMBNAIL =
  "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=800&q=85";

const STORAGE_KEY = "careconnect-events";
const EMPTY_EVENTS: EventItem[] = [];

let cachedEvents: EventItem[] = EMPTY_EVENTS;
let initialized = false;
const listeners = new Set<() => void>();

function readFromStorage(): EventItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_EVENTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as EventItem[]) : EMPTY_EVENTS;
  } catch {
    return EMPTY_EVENTS;
  }
}

export function getEvents(): EventItem[] {
  if (!initialized && typeof window !== "undefined") {
    cachedEvents = readFromStorage();
    initialized = true;
  }
  return cachedEvents;
}

export function getServerEvents(): EventItem[] {
  return EMPTY_EVENTS;
}

export function subscribeEvents(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setEvents(next: EventItem[]): void {
  cachedEvents = next;
  initialized = true;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  listeners.forEach((listener) => listener());
}

export function addEvent(
  input: Omit<EventItem, "id" | "createdAt">
): EventItem {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `event-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const event: EventItem = {
    ...input,
    id,
    createdAt: new Date().toISOString(),
  };

  setEvents([event, ...getEvents()]);
  return event;
}
