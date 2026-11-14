"use client";

import { EVENT_TYPES, addEvent } from "@/lib/events";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";

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

function formatDate(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return "";
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Today's date as yyyy-mm-dd (local time zone, not UTC). */
function getToday(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
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

export default function CreateEventPage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [previewFailed, setPreviewFailed] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);

  // Block past dates natively in the date picker (set after mount to avoid
  // a server/client hydration mismatch on the static page).
  useEffect(() => {
    if (dateRef.current) {
      dateRef.current.min = getToday();
    }
  }, []);

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => setSuccess(""), 6000);
    return () => clearTimeout(timer);
  }, [success]);

  function updateField(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (field === "thumbnail") setPreviewFailed(false);
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
    } else if (form.date < getToday()) {
      next.date = "Please choose a future date — past dates are not allowed";
    }

    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");

    // All fields are mandatory: stop before any request if anything is
    // missing or invalid.
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      requestAnimationFrame(() => {
        formRef.current
          ?.querySelector<HTMLElement>('[aria-invalid="true"]')
          ?.focus();
      });
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      type: form.type,
      thumbnail: form.thumbnail.trim(),
      location: form.location.trim(),
      date: form.date,
    };

    try {
      const res = await fetch("http://localhost:5000/upcoming-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      await res.json().catch(() => null);
    } catch {
      setSubmitError(
        "Could not create the event. Please make sure the server is running on localhost:5000 and try again.",
      );
      return;
    }

    addEvent(payload);

    setForm(EMPTY_FORM);
    setPreviewFailed(false);
    setSuccess(
      "Event created successfully! It has been saved to your upcoming events.",
    );
  }

  function handleReset() {
    setForm(EMPTY_FORM);
    setErrors({});
    setSubmitError("");
    setPreviewFailed(false);
  }

  const thumbnailUrl = form.thumbnail.trim();
  const showPreview = isValidHttpsUrl(thumbnailUrl) && !previewFailed;

  return (
    <section className="bg-[#F3F8F1] px-5 py-14 md:py-20">
      <div className="mx-auto max-w-4xl">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="mb-3 inline-block rounded-full bg-green-100 px-5 py-2 text-sm font-semibold text-green-700">
            📅 Organize Something Great
          </span>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            Create a New <span className="text-green-700">Community Event</span>
          </h1>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Share your idea with the careConnect community. Fill in the details
            below and your event will be ready for volunteers to discover.
          </p>
        </div>

        <div className="rounded-3xl border border-green-100 bg-white p-6 shadow-xl md:p-10">
          {success && (
            <div
              role="alert"
              className="mb-7 flex items-center gap-3 rounded-2xl bg-green-100 px-5 py-4 text-sm font-semibold text-green-800"
            >
              <span className="text-lg">✅</span>
              {success}
            </div>
          )}

          <form ref={formRef} onSubmit={handleSubmit} noValidate>
            {submitError && (
              <div
                role="alert"
                className="mb-7 flex items-center gap-3 rounded-2xl bg-red-50 px-5 py-4 text-sm font-semibold text-red-600 ring-1 ring-red-100"
              >
                <span className="text-lg">⚠️</span>
                {submitError}
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Event Title */}
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="e.g. Community River Cleanup"
                  aria-invalid={errors.title ? "true" : undefined}
                  className={inputClasses(Boolean(errors.title))}
                />
                <FieldError message={errors.title} />
              </div>

              {/* Event Type */}
              <div>
                <label
                  htmlFor="type"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Event Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="type"
                    name="type"
                    required
                    value={form.type}
                    onChange={(e) => updateField("type", e.target.value)}
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

              {/* Event Date */}

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
                  ref={dateRef}
                  required
                  min={new Date().toLocaleDateString("en-CA")}
                  value={form.date}
                  onClick={() => dateRef.current?.showPicker()}
                  onChange={(e) => updateField("date", e.target.value)}
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
                      Pick a future date — past dates are disabled in the
                      calendar.
                    </p>
                  ))}
              </div>

              {/* Location */}
              <div>
                <label
                  htmlFor="location"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  required
                  value={form.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  placeholder="e.g. Dhaka, Bangladesh"
                  aria-invalid={errors.location ? "true" : undefined}
                  className={inputClasses(Boolean(errors.location))}
                />
                <FieldError message={errors.location} />
              </div>

              {/* Thumbnail Image URL */}
              <div>
                <label
                  htmlFor="thumbnail"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Thumbnail Image URL <span className="text-red-500">*</span>
                </label>
                <input
                  id="thumbnail"
                  name="thumbnail"
                  type="url"
                  inputMode="url"
                  required
                  value={form.thumbnail}
                  onChange={(e) => updateField("thumbnail", e.target.value)}
                  placeholder="https://example.com/event-image.jpg"
                  aria-invalid={errors.thumbnail ? "true" : undefined}
                  className={inputClasses(Boolean(errors.thumbnail))}
                />
                <FieldError message={errors.thumbnail} />
                {!errors.thumbnail && (
                  <p className="mt-2 text-xs text-gray-400">
                    Paste a direct image link (https) for the event card.
                  </p>
                )}
              </div>

              {/* Thumbnail Preview */}
              <div>
                <span className="mb-2 block text-sm font-semibold text-gray-700">
                  Thumbnail Preview
                </span>
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-green-100 bg-[#F8FBF7]">
                  {showPreview ? (
                    <Image
                      src={thumbnailUrl}
                      alt="Event thumbnail preview"
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                      onError={() => setPreviewFailed(true)}
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-gray-400">
                      <span className="text-3xl">🖼️</span>
                      <p className="text-xs leading-5">
                        {form.thumbnail
                          ? "Loading image failed. Check the URL and try again."
                          : "Your event image will appear here."}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={6}
                  required
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Describe the event, its goal, what volunteers should bring, and how they can help..."
                  aria-invalid={errors.description ? "true" : undefined}
                  className={`${inputClasses(Boolean(errors.description))} resize-y`}
                />
                <div className="mt-2 flex items-center justify-between gap-4">
                  <FieldError message={errors.description} />
                  <span className="ml-auto text-xs text-gray-400">
                    {form.description.length} characters
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 border-t border-green-100 pt-7 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-gray-400">
                Fields marked with <span className="text-red-500">*</span> are
                required.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-full border-2 border-green-700 px-8 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-700 hover:text-white"
                >
                  Reset
                </button>

                <button
                  type="submit"
                  className="rounded-full bg-green-700 px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-green-800"
                >
                  Create Event →
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
