"use client";

import { authClient } from "@/lib/auth-client";
import {
  AlertCircle,
  CalendarDays,
  Eye,
  Loader2,
  LogOut,
  MapPin,
  RefreshCw,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const API_BASE = "http://localhost:5000";

/** Event fields stored inside a join record (snapshot). */
type EventSource = {
  title?: string;
  description?: string;
  type?: string;
  eventType?: string;
  thumbnail?: string;
  location?: string;
  date?: string;
  eventDate?: string;
};

/** Row stored in the server's participant/organizer collection. */
type JoinRecord = {
  _id: string;
  eventId?: string;
  status?: string;
  joinedAt?: string;
  event?: EventSource;
};

type LiveEvent = EventSource & { _id: string };

type JoinedEvent = {
  recordId: string;
  eventId: string;
  title: string;
  description: string;
  type: string;
  date: string;
  location: string;
  thumbnail: string;
  joinedAt?: string;
};

function isValidHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

/** Milliseconds for sorting; unknown dates sink to the end. */
function dateValue(value?: string): number {
  if (!value) return Number.POSITIVE_INFINITY;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? Number.POSITIVE_INFINITY : time;
}

function formatDate(value?: string): string {
  if (!value) return "Date to be announced";

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  const date = match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isPastDate(value?: string): boolean {
  if (!value) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dateValue(value) < today.getTime();
}

/** Combine a join record with the live event it points at. */
function toJoinedEvent(
  record: JoinRecord,
  source: EventSource | undefined,
): JoinedEvent | null {
  if (!source?.title) return null;

  return {
    recordId: record._id,
    eventId: record.eventId ?? "",
    title: source.title,
    description: source.description ?? "",
    type: source.type || source.eventType || "",
    date: source.date || source.eventDate || "",
    location: source.location ?? "",
    thumbnail: source.thumbnail ?? "",
    joinedAt: record.joinedAt,
  };
}

export default function JoinedEventPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [events, setEvents] = useState<JoinedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [leavingId, setLeavingId] = useState<string | null>(null);

  const email = session?.user?.email;

  // Private page: bounce guests to the login screen.
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.replace("/login");
    }
  }, [isPending, session, router]);

  // Load every event the logged-in user has joined, soonest first.
  useEffect(() => {
    if (!email) return;

    let cancelled = false;

    (async () => {
      try {
        const [joinsRes, allEventsRes] = await Promise.all([
          fetch(
            `${API_BASE}/organizer/${encodeURIComponent(email)}`,
            { cache: "no-store" },
          ),
          fetch(`${API_BASE}/events`, { cache: "no-store" }),
        ]);

        if (!joinsRes.ok) throw new Error("Request failed");

        const joinsData: unknown = await joinsRes.json();
        const joins: JoinRecord[] = Array.isArray(joinsData) ? joinsData : [];

        // The event list is best-effort: fall back to the snapshot stored
        // inside each join record if it cannot be loaded.
        let liveEventsOk = false;
        let liveEvents: LiveEvent[] = [];
        if (allEventsRes.ok) {
          const eventsData: unknown = await allEventsRes.json();
          if (Array.isArray(eventsData)) {
            liveEventsOk = true;
            liveEvents = eventsData as LiveEvent[];
          }
        }

        const liveById = new Map(liveEvents.map((item) => [item._id, item]));
        const seen = new Set<string>();
        const joined: JoinedEvent[] = [];

        for (const record of joins) {
          if (!record?.eventId) continue; // not an event join
          if (record.status === "left") continue;
          if (seen.has(record.eventId)) continue;
          seen.add(record.eventId);

          // Prefer fresh event data; skip events that no longer exist.
          const source = liveEventsOk
            ? liveById.get(record.eventId)
            : record.event;
          if (!source) continue;

          const item = toJoinedEvent(record, source);
          if (item) joined.push(item);
        }

        // Sort by event date — soonest first.
        joined.sort((a, b) => dateValue(a.date) - dateValue(b.date));

        if (!cancelled) {
          setEvents(joined);
          setLoadError("");
        }
      } catch {
        if (!cancelled) {
          setLoadError(
            "Could not load your joined events. Please make sure the server is running on localhost:5000 and try again.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [email, reloadKey]);

  async function handleLeave(item: JoinedEvent) {
    setLeavingId(item.recordId);

    try {
      const res = await fetch(`${API_BASE}/organizer/${item.recordId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "left" }),
      });

      if (!res.ok) throw new Error("Request failed");

      setEvents((prev) => prev.filter((entry) => entry.recordId !== item.recordId));
      setConfirmingId(null);
      toast.success(`You've left "${item.title}".`);
    } catch {
      toast.error(
        "Could not leave the event. Please make sure the server is running on localhost:5000 and try again.",
      );
    } finally {
      setLeavingId(null);
    }
  }

  function retryLoad() {
    setLoadError("");
    setLoading(true);
    setReloadKey((key) => key + 1);
  }

  // Still resolving the session (or the guest is being redirected).
  if (isPending || !session?.user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#F3F8F1] px-6 py-16">
        <div className="flex flex-col items-center gap-3 text-green-700">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm font-semibold">Checking your session…</p>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-[#F3F8F1] px-5 py-14 md:py-20">
      <div className="mx-auto max-w-4xl">
        {/* Heading */}
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="mb-3 inline-block rounded-full bg-green-100 px-5 py-2 text-sm font-semibold text-green-700">
            🤝 Thank You for Showing Up
          </span>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            My <span className="text-green-700">Joined Events</span>
          </h1>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Every event you&apos;ve signed up for, sorted by event date so the
            next one on your calendar is always at the top.
          </p>
        </div>

        {/* Session summary */}
        <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-green-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="truncate text-sm text-gray-500">
              Signed in as{" "}
              <span className="font-semibold text-gray-800">
                {session.user.name || "User"}
              </span>{" "}
              ({session.user.email})
            </p>

            {!loading && !loadError && (
              <p className="mt-1 text-xs font-semibold text-green-700">
                {events.length}{" "}
                {events.length === 1 ? "Event" : "Events"} Joined · Sorted by
                event date
              </p>
            )}
          </div>

          <Link
            href="/upcoming-events"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-green-700 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-green-800"
          >
            <Eye className="h-4 w-4" />
            Browse More Events
          </Link>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div
            className="space-y-6"
            aria-busy="true"
            aria-label="Loading your joined events"
          >
            {[0, 1].map((item) => (
              <div
                key={item}
                className="animate-pulse overflow-hidden rounded-3xl border border-green-100 bg-white shadow-sm"
              >
                <div className="h-44 w-full bg-green-100" />
                <div className="space-y-3 p-6">
                  <div className="h-5 w-2/3 rounded-full bg-green-100" />
                  <div className="h-4 w-full rounded-full bg-gray-100" />
                  <div className="h-4 w-1/2 rounded-full bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load error */}
        {!loading && loadError && (
          <div className="rounded-3xl border border-red-100 bg-white p-10 text-center shadow-sm">
            <span className="text-4xl">⚠️</span>
            <h2 className="mt-4 text-xl font-bold text-gray-900">
              We couldn&apos;t load your joined events
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              {loadError}
            </p>
            <button
              type="button"
              onClick={retryLoad}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-green-700 px-7 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !loadError && events.length === 0 && (
          <div className="rounded-3xl border border-green-100 bg-white p-12 text-center shadow-sm">
            <div className="text-5xl">🌱</div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              No Joined Events Yet
            </h2>
            <p className="mx-auto mt-3 max-w-md text-gray-500">
              You haven&apos;t joined any events yet. Find a community event you
              care about and join it — it will show up right here.
            </p>
            <Link
              href="/upcoming-events"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-green-700 px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-green-800"
            >
              <Eye className="h-4 w-4" />
              Explore Upcoming Events
            </Link>
          </div>
        )}

        {/* Joined event cards */}
        {!loading && !loadError && events.length > 0 && (
          <div className="space-y-6">
            {events.map((event) => {
              const isConfirming = confirmingId === event.recordId;
              const isLeaving = leavingId === event.recordId;
              const showImage = isValidHttpsUrl(event.thumbnail);
              const completed = isPastDate(event.date);

              return (
                <div
                  key={event.recordId}
                  className="overflow-hidden rounded-3xl border border-green-100 bg-white shadow-sm transition hover:shadow-lg"
                >
                  {/* Thumbnail */}
                  <div className="relative h-44 w-full overflow-hidden bg-green-50 md:h-52">
                    {showImage ? (
                      <Image
                        src={event.thumbnail}
                        alt={event.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 896px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-4xl">
                        🖼️
                      </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center gap-2 bg-linear-to-t from-black/70 to-transparent p-4">
                      <span className="inline-block rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white">
                        {event.type || "Event"}
                      </span>

                      {completed && (
                        <span className="inline-block rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                          Completed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <h2 className="text-xl font-bold text-gray-900">
                        {event.title}
                      </h2>

                      <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        Joined
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-gray-500">
                      {event.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-green-600" />
                        {formatDate(event.date)}
                      </span>

                      <span className="inline-flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-green-600" />
                        {event.location}
                      </span>
                    </div>

                    {event.joinedAt && (
                      <p className="mt-2 text-xs text-gray-400">
                        You joined on {formatDate(event.joinedAt)}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-green-100 pt-5">
                      <Link
                        href={`/upcoming-events/${event.eventId}`}
                        className="inline-flex items-center gap-2 rounded-full bg-green-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          setConfirmingId(isConfirming ? null : event.recordId)
                        }
                        disabled={isLeaving}
                        className="inline-flex items-center gap-2 rounded-full border-2 border-red-400 px-5 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Leave Event
                      </button>
                    </div>
                  </div>

                  {/* Leave confirmation */}
                  {isConfirming && (
                    <div className="border-t border-red-100 bg-red-50 p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                          <div>
                            <p className="text-sm font-semibold text-red-700">
                              Leave “{event.title}”?
                            </p>
                            <p className="mt-1 text-sm text-red-500">
                              You can always join the event again later.
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 gap-3">
                          <button
                            type="button"
                            onClick={() => setConfirmingId(null)}
                            disabled={isLeaving}
                            className="rounded-full border-2 border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-white disabled:opacity-50"
                          >
                            Cancel
                          </button>

                          <button
                            type="button"
                            onClick={() => handleLeave(event)}
                            disabled={isLeaving}
                            className="inline-flex items-center gap-2 rounded-full bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
                          >
                            {isLeaving && (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            {isLeaving ? "Leaving…" : "Yes, Leave"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
