"use client";

import { authClient } from "@/lib/auth-client";
import { Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const API_BASE = "http://localhost:5000";

type JoinableEvent = {
  _id: string;
  title: string;
  type?: string;
  eventType?: string;
  date?: string;
  eventDate?: string;
  location?: string;
  thumbnail?: string;
  description?: string;
  organizer?: {
    name?: string;
    email?: string;
    photo?: string;
  };
};

/** Row stored in the server's participant/organizer collection. */
type JoinRecord = {
  _id: string;
  eventId?: string;
  status?: string;
};

type SessionUser = {
  name?: string | null;
  email?: string;
  image?: string | null;
};

/**
 * "Join This Event" call-to-action for the event details page.
 *
 * A join is stored as a participant record on the API server
 * (`POST /organizer`) so the Joined Events page can list it for the
 * logged-in user. Leaving marks the record as `left` via `PATCH`.
 */
export default function JoinEventButton({
  event,
}: {
  event: JoinableEvent;
}) {
  const { data: session, isPending } = authClient.useSession();
  const [record, setRecord] = useState<JoinRecord | null>(null);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState<"join" | "leave" | null>(null);

  const user: SessionUser | undefined = session?.user;
  const email = user?.email;
  const joined = Boolean(record && record.status !== "left");

  // Has this user already joined the event?
  useEffect(() => {
    if (!email) return;

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(
          `${API_BASE}/organizer/${encodeURIComponent(email)}`,
          { cache: "no-store" },
        );

        if (!res.ok) throw new Error("Request failed");

        const data: unknown = await res.json();
        const list: JoinRecord[] = Array.isArray(data) ? data : [];

        if (!cancelled) {
          const mine = list.filter((item) => item?.eventId === event._id);
          setRecord(
            mine.find((item) => item.status !== "left") ?? mine[0] ?? null,
          );
        }
      } catch {
        // Leave the button in its "not joined" state — joining still works.
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [email, event._id]);

  function buildPayload(user: SessionUser) {
    return {
      participant: {
        name: user.name ?? "",
        email: user.email ?? "",
        photo: user.image ?? "",
      },
      ...(event.organizer
        ? {
            organizer: {
              name: event.organizer.name ?? "",
              email: event.organizer.email ?? "",
              photo: event.organizer.photo ?? "",
            },
          }
        : {}),
      eventId: event._id,
      // Snapshot so the Joined Events page can render even if the event
      // details endpoint is unavailable.
      event: {
        title: event.title,
        type: event.type || event.eventType || "",
        date: event.date || event.eventDate || "",
        location: event.location ?? "",
        thumbnail: event.thumbnail ?? "",
        description: event.description ?? "",
      },
      joinedAt: new Date().toISOString(),
      status: "joined",
    };
  }

  async function handleJoin() {
    if (!user?.email || busy) return;
    setBusy("join");

    try {
      if (record && record.status === "left") {
        // Re-join by flipping the existing record back on.
        const res = await fetch(`${API_BASE}/organizer/${record._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "joined" }),
        });

        if (!res.ok) throw new Error("Request failed");
        setRecord({ ...record, status: "joined" });
      } else {
        const res = await fetch(`${API_BASE}/organizer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildPayload(user)),
        });

        if (!res.ok) throw new Error("Request failed");

        const data: unknown = await res.json();
        const insertedId =
          data && typeof data === "object" && "insertedId" in data
            ? String((data as { insertedId?: unknown }).insertedId ?? "")
            : "";

        setRecord({ _id: insertedId, eventId: event._id, status: "joined" });
      }

      toast.success("You've joined this event! Find it under Joined Events.");
    } catch {
      toast.error(
        "Could not join the event. Please make sure the server is running on localhost:5000 and try again.",
      );
    } finally {
      setBusy(null);
    }
  }

  async function handleLeave() {
    if (!record?._id || busy) return;
    setBusy("leave");

    try {
      const res = await fetch(`${API_BASE}/organizer/${record._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "left" }),
      });

      if (!res.ok) throw new Error("Request failed");

      setRecord({ ...record, status: "left" });
      toast.success("You've left this event.");
    } catch {
      toast.error(
        "Could not leave the event. Please make sure the server is running on localhost:5000 and try again.",
      );
    } finally {
      setBusy(null);
    }
  }

  // Guest: joining requires an account.
  if (!isPending && !user?.email) {
    return (
      <Link
        href="/login"
        className="inline-flex h-11 w-full items-center justify-center rounded-full bg-white px-6 text-center font-semibold text-green-800 transition hover:bg-green-50"
      >
        Login to Join This Event
      </Link>
    );
  }

  if (isPending || checking) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-white/70 px-6 font-semibold text-green-800 transition"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading…
      </button>
    );
  }

  if (joined) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-white/15 px-6 font-semibold text-white ring-1 ring-white/40">
          <Check className="h-4 w-4" />
          You&apos;ve Joined This Event
        </div>

        <button
          type="button"
          onClick={handleLeave}
          disabled={busy !== null}
          className="inline-flex items-center gap-2 text-sm font-semibold text-green-100 underline underline-offset-4 transition hover:text-white disabled:opacity-60"
        >
          {busy === "leave" && <Loader2 className="h-4 w-4 animate-spin" />}
          {busy === "leave" ? "Leaving…" : "Leave Event"}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleJoin}
      disabled={busy !== null}
      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-white px-6 font-semibold text-green-800 transition hover:bg-green-50 disabled:opacity-70"
    >
      {busy === "join" && <Loader2 className="h-4 w-4 animate-spin" />}
      {busy === "join" ? "Joining…" : "Join This Event"}
    </button>
  );
}
