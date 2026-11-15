"use client";

import { authClient } from "@/lib/auth-client";
import { EVENT_TYPES } from "@/lib/events";
import {
  AlertCircle,
  CalendarDays,
  ChevronDown,
  Eye,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import toast from "react-hot-toast";

const API_BASE = "http://localhost:5000";

type Organizer = {
  name?: string;
  email?: string;
  photo?: string;
};

type ManagedEvent = {
  _id: string;
  title: string;
  description: string;
  type?: string;
  eventType?: string;
  thumbnail: string;
  location: string;
  date: string;
  organizer?: Organizer;
};

type FormState = {
  title: string;
  description: string;
  type: string;
  thumbnail: string;
  location: string;
  date: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const EMPTY_FORM: FormState = {
  title: "",
  description: "",
  type: "",
  thumbnail: "",
  location: "",
  date: "",
};

function isValidHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

/** Trim a stored value (ISO date or yyyy-mm-dd) down to yyyy-mm-dd. */
function toDateInputValue(value: string): string {
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(value.trim());
  return match ? match[1] : "";
}

function formatDate(value: string): string {
  const iso = toDateInputValue(value);
  if (!iso) return value;

  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return value;

  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const inputBase =
  "w-full rounded-xl border px-4 py-3 text-sm text-gray-900 transition focus:outline-none focus:ring-2";

function inputClasses(hasError: boolean) {
  return hasError
    ? `${inputBase} border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-500/20`
    : `${inputBase} border-green-200 bg-green-50 focus:border-green-600 focus:ring-green-600/20`;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-2 text-sm font-medium text-red-500">{message}</p>;
}

export default function ManageEventsPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [events, setEvents] = useState<ManagedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [reloadKey, setReloadKey] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const editFormRef = useRef<HTMLFormElement>(null);

  const email = session?.user?.email;

  // Private page: bounce guests to the login screen.
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.replace("/login");
    }
  }, [isPending, session, router]);

  // Load only the events created by the logged-in user.
  useEffect(() => {
    if (!email) return;

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(
          `${API_BASE}/events/${encodeURIComponent(email)}`,
          { cache: "no-store" },
        );

        if (!res.ok) throw new Error("Request failed");

        const data: unknown = await res.json();
        const list: ManagedEvent[] = Array.isArray(data) ? data : [];

        if (!cancelled) {
          // Defence in depth: never render someone else's event.
          setEvents(
            list.filter(
              (event) =>
                event?._id &&
                event.organizer?.email?.toLowerCase() === email.toLowerCase(),
            ),
          );
          setLoadError("");
        }
      } catch {
        if (!cancelled) {
          setLoadError(
            "Could not load your events. Please make sure the server is running on localhost:5000 and try again.",
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

  function updateField(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): FormErrors {
    const next: FormErrors = {};

    if (!form.title.trim()) {
      next.title = "Event title is required";
    } else if (form.title.trim().length < 3) {
      next.title = "Title must be at least 3 characters";
    }

    if (!form.description.trim()) {
      next.description = "Description is required";
    } else if (form.description.trim().length < 20) {
      next.description = "Description must be at least 20 characters";
    }

    if (!form.type) {
      next.type = "Please select an event type";
    }

    if (!form.thumbnail.trim()) {
      next.thumbnail = "Thumbnail image URL is required";
    } else if (!isValidHttpsUrl(form.thumbnail.trim())) {
      next.thumbnail = "Enter a valid image URL starting with https://";
    }

    if (!form.location.trim()) {
      next.location = "Location is required";
    }

    if (!form.date) {
      next.date = "Event date is required";
    }

    return next;
  }

  function startEditing(event: ManagedEvent) {
    setConfirmingId(null);
    setErrors({});
    setForm({
      title: event.title ?? "",
      description: event.description ?? "",
      type: event.type || event.eventType || "",
      thumbnail: event.thumbnail ?? "",
      location: event.location ?? "",
      date: toDateInputValue(event.date ?? ""),
    });
    setEditingId(event._id);

    requestAnimationFrame(() => {
      editFormRef.current
        ?.querySelector<HTMLElement>('[aria-invalid="true"], #edit-title')
        ?.focus();
    });
  }

  function cancelEditing() {
    setEditingId(null);
    setErrors({});
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const target = events.find((item) => item._id === editingId);
    if (!target) return;

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      requestAnimationFrame(() => {
        editFormRef.current
          ?.querySelector<HTMLElement>('[aria-invalid="true"]')
          ?.focus();
      });
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      type: form.type,
      eventType: form.type,
      thumbnail: form.thumbnail.trim(),
      location: form.location.trim(),
      date: form.date,
      // Keep ownership intact so the event stays manageable by its creator.
      organizer: target.organizer ?? {
        name: session?.user?.name ?? "",
        email: session?.user?.email ?? "",
        photo: session?.user?.image ?? "",
      },
    };

    setSaving(true);

    try {
      const res = await fetch(`${API_BASE}/event/${target._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Request failed");

      setEvents((prev) =>
        prev.map((item) =>
          item._id === target._id ? { ...item, ...payload } : item,
        ),
      );
      setEditingId(null);
      toast.success("Event updated successfully!");
    } catch {
      toast.error(
        "Could not update the event. Please make sure the server is running on localhost:5000 and try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(event: ManagedEvent) {
    setDeletingId(event._id);

    try {
      const res = await fetch(`${API_BASE}/event/${event._id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Request failed");

      setEvents((prev) => prev.filter((item) => item._id !== event._id));
      if (editingId === event._id) setEditingId(null);
      setConfirmingId(null);
      toast.success("Event deleted successfully!");
    } catch {
      toast.error(
        "Could not delete the event. Please make sure the server is running on localhost:5000 and try again.",
      );
    } finally {
      setDeletingId(null);
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
            🛠️ Your Events, Your Impact
          </span>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            Manage Your <span className="text-green-700">Community Events</span>
          </h1>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Update the details of the events you created or remove the ones that
            are no longer happening. You can only edit and delete your own
            events.
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
                {events.length} {events.length === 1 ? "Event" : "Events"}{" "}
                Created by You
              </p>
            )}
          </div>

          <Link
            href="/create-event"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-green-700 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-green-800"
          >
            <Plus className="h-4 w-4" />
            Create New Event
          </Link>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div
            className="space-y-6"
            aria-busy="true"
            aria-label="Loading your events"
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
              We couldn&apos;t load your events
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
              No Events Yet
            </h2>
            <p className="mx-auto mt-3 max-w-md text-gray-500">
              You haven&apos;t created any events yet. Start something great for
              the careConnect community!
            </p>
            <Link
              href="/create-event"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-green-700 px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-green-800"
            >
              <Plus className="h-4 w-4" />
              Create Your First Event
            </Link>
          </div>
        )}

        {/* Event cards */}
        {!loading && !loadError && events.length > 0 && (
          <div className="space-y-6">
            {events.map((event) => {
              const isEditing = editingId === event._id;
              const isConfirming = confirmingId === event._id;
              const isDeleting = deletingId === event._id;
              const showImage = isValidHttpsUrl(event.thumbnail ?? "");
              const displayDate = formatDate(event.date ?? "");

              return (
                <div
                  key={event._id}
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

                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent p-4">
                      <span className="inline-block rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white">
                        {event.type || event.eventType || "Event"}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900">
                      {event.title}
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-gray-500">
                      {event.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-green-600" />
                        {displayDate}
                      </span>

                      <span className="inline-flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-green-600" />
                        {event.location}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-green-100 pt-5">
                      <button
                        type="button"
                        onClick={() => startEditing(event)}
                        disabled={isDeleting}
                        className="inline-flex items-center gap-2 rounded-full border-2 border-green-700 px-5 py-2.5 text-sm font-semibold text-green-700 transition hover:bg-green-700 hover:text-white disabled:opacity-50"
                      >
                        <Pencil className="h-4 w-4" />
                        {isEditing ? "Editing…" : "Edit"}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setConfirmingId(isConfirming ? null : event._id);
                        }}
                        disabled={isDeleting}
                        className="inline-flex items-center gap-2 rounded-full border-2 border-red-400 px-5 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>

                      <Link
                        href={`/upcoming-events/${event._id}`}
                        className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-gray-500 transition hover:text-green-700"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Link>
                    </div>
                  </div>

                  {/* Delete confirmation */}
                  {isConfirming && (
                    <div className="border-t border-red-100 bg-red-50 p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                          <div>
                            <p className="text-sm font-semibold text-red-700">
                              Delete “{event.title}”?
                            </p>
                            <p className="mt-1 text-sm text-red-500">
                              This permanently removes the event. It cannot be
                              undone.
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 gap-3">
                          <button
                            type="button"
                            onClick={() => setConfirmingId(null)}
                            disabled={isDeleting}
                            className="rounded-full border-2 border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-white disabled:opacity-50"
                          >
                            Cancel
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(event)}
                            disabled={isDeleting}
                            className="inline-flex items-center gap-2 rounded-full bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
                          >
                            {isDeleting && (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            {isDeleting ? "Deleting…" : "Yes, Delete"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Inline edit form */}
                  {isEditing && (
                    <div className="border-t border-green-100 bg-[#F8FBF7] p-6">
                      <h3 className="mb-5 text-lg font-bold text-gray-900">
                        Edit Event Details
                      </h3>

                      <form
                        ref={editFormRef}
                        onSubmit={handleSubmit}
                        noValidate
                      >
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                          {/* Title */}
                          <div>
                            <label
                              htmlFor="edit-title"
                              className="mb-2 block text-sm font-semibold text-gray-700"
                            >
                              Event Title{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              id="edit-title"
                              name="title"
                              type="text"
                              required
                              value={form.title}
                              onChange={(e) =>
                                updateField("title", e.target.value)
                              }
                              placeholder="e.g. Community River Cleanup"
                              aria-invalid={errors.title ? "true" : undefined}
                              className={inputClasses(Boolean(errors.title))}
                            />
                            <FieldError message={errors.title} />
                          </div>

                          {/* Type */}
                          <div>
                            <label
                              htmlFor="edit-type"
                              className="mb-2 block text-sm font-semibold text-gray-700"
                            >
                              Event Type <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <select
                                id="edit-type"
                                name="type"
                                required
                                value={form.type}
                                onChange={(e) =>
                                  updateField("type", e.target.value)
                                }
                                aria-invalid={errors.type ? "true" : undefined}
                                className={`${inputClasses(
                                  Boolean(errors.type),
                                )} block cursor-pointer appearance-none pr-10`}
                              >
                                <option value="">Select event type</option>
                                {EVENT_TYPES.map((type) => (
                                  <option key={type} value={type}>
                                    {type}
                                  </option>
                                ))}
                              </select>

                              <ChevronDown
                                aria-hidden="true"
                                className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
                              />
                            </div>
                            <FieldError message={errors.type} />
                          </div>

                          {/* Date */}
                          <div>
                            <label
                              htmlFor="date"
                              className="mb-2 block text-sm font-semibold text-gray-700"
                            >
                              Event Date <span className="text-red-500">*</span>
                            </label>

                            <input
                              id="date"
                              name="date"
                              type="date"
                            //   ref={dateRef}
                              required
                              min={new Date().toLocaleDateString("en-CA")}
                              value={form.date}
                              onClick={(e) => {
                                const input = e.currentTarget;
                                if (input.showPicker) {
                                  input.showPicker();
                                }
                              }}
                              onChange={(e) =>
                                updateField("date", e.target.value)
                              }
                              aria-invalid={errors.date ? "true" : undefined}
                              className={`${inputClasses(
                                Boolean(errors.date),
                              )} cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
                            />

                            <FieldError message={errors.date} />

                            {!errors.date &&
                              (form.date ? (
                                <p className="mt-2 text-xs font-medium text-green-700">
                                  📅 {formatDate(form.date)}
                                </p>
                              ) : (
                                <p className="mt-2 text-xs text-gray-400">
                                  Pick a future date — past dates are disabled
                                  in the calendar.
                                </p>
                              ))}
                          </div>

                          {/* Location */}
                          <div>
                            <label
                              htmlFor="edit-location"
                              className="mb-2 block text-sm font-semibold text-gray-700"
                            >
                              Location <span className="text-red-500">*</span>
                            </label>
                            <input
                              id="edit-location"
                              name="location"
                              type="text"
                              required
                              value={form.location}
                              onChange={(e) =>
                                updateField("location", e.target.value)
                              }
                              placeholder="e.g. Dhaka, Bangladesh"
                              aria-invalid={
                                errors.location ? "true" : undefined
                              }
                              className={inputClasses(Boolean(errors.location))}
                            />
                            <FieldError message={errors.location} />
                          </div>

                          {/* Thumbnail */}
                          <div className="md:col-span-2">
                            <label
                              htmlFor="edit-thumbnail"
                              className="mb-2 block text-sm font-semibold text-gray-700"
                            >
                              Thumbnail Image URL{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              id="edit-thumbnail"
                              name="thumbnail"
                              type="url"
                              inputMode="url"
                              required
                              value={form.thumbnail}
                              onChange={(e) =>
                                updateField("thumbnail", e.target.value)
                              }
                              placeholder="https://example.com/event-image.jpg"
                              aria-invalid={
                                errors.thumbnail ? "true" : undefined
                              }
                              className={inputClasses(
                                Boolean(errors.thumbnail),
                              )}
                            />
                            <FieldError message={errors.thumbnail} />
                          </div>

                          {/* Description */}
                          <div className="md:col-span-2">
                            <label
                              htmlFor="edit-description"
                              className="mb-2 block text-sm font-semibold text-gray-700"
                            >
                              Description{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              id="edit-description"
                              name="description"
                              rows={5}
                              required
                              value={form.description}
                              onChange={(e) =>
                                updateField("description", e.target.value)
                              }
                              placeholder="Describe the event, its goal, what volunteers should bring, and how they can help..."
                              aria-invalid={
                                errors.description ? "true" : undefined
                              }
                              className={`${inputClasses(
                                Boolean(errors.description),
                              )} resize-y`}
                            />
                            <div className="mt-2 flex items-center justify-between gap-4">
                              <FieldError message={errors.description} />
                              <span className="ml-auto text-xs text-gray-400">
                                {form.description.length} characters
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-7 flex flex-col gap-3 border-t border-green-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-xs text-gray-400">
                            Fields marked with{" "}
                            <span className="text-red-500">*</span> are
                            required.
                          </p>

                          <div className="flex flex-col gap-3 sm:flex-row">
                            <button
                              type="button"
                              onClick={cancelEditing}
                              disabled={saving}
                              className="rounded-full border-2 border-green-700 px-7 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-700 hover:text-white disabled:opacity-50"
                            >
                              Cancel
                            </button>

                            <button
                              type="submit"
                              disabled={saving}
                              className="inline-flex items-center gap-2 rounded-full bg-green-700 px-7 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-green-800 disabled:opacity-60"
                            >
                              {saving && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              )}
                              {saving ? "Saving…" : "Save Changes"}
                            </button>
                          </div>
                        </div>
                      </form>
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
