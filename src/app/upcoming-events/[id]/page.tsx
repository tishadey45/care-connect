import {
  ArrowLeft,
  CalendarDays,
  Mail,
  MapPin,
  Tag,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache, type ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Organizer = {
  name?: string;
  email?: string;
  photo?: string;
};

type EventDetails = {
  _id: string;
  title: string;
  description: string;
  // Seed data uses eventType/eventDate; events created through the create
  // form are stored as type/date — support both shapes.
  eventType?: string;
  type?: string;
  thumbnail: string;
  location: string;
  eventDate?: string;
  date?: string;
  organizer?: Organizer;
};

const API_BASE = "http://localhost:5000";
const OBJECT_ID_PATTERN = /^[0-9a-f]{24}$/i;

const fetchEvent = cache(async (id: string): Promise<EventDetails | null> => {
  if (!OBJECT_ID_PATTERN.test(id)) return null;

  try {
    const res = await fetch(`${API_BASE}/event/${id}`, { cache: "no-store" });
    if (!res.ok) return null;

    const data: unknown = await res.json().catch(() => null);
    if (!data || typeof data !== "object" || !("title" in data)) return null;

    return data as EventDetails;
  } catch {
    return null;
  }
});

function formatEventDate(value?: string): string {
  if (!value) return "Date to be announced";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
        {icon}
      </span>

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          {label}
        </p>
        <p className="mt-1 break-words text-sm font-medium text-gray-800">
          {value}
        </p>
      </div>
    </div>
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/events/[id]">): Promise<Metadata> {
  const { id } = await params;
  const event = await fetchEvent(id);

  if (!event) {
    return { title: "Event Not Found | careConnect" };
  }

  return {
    title: `${event.title} | careConnect`,
    description: event.description,
    openGraph: {
      title: event.title,
      description: event.description,
      images: event.thumbnail ? [{ url: event.thumbnail }] : undefined,
    },
  };
}

export default async function EventDetailsPage({
  params,
}: PageProps<"/events/[id]">) {
  const { id } = await params;
  const event = await fetchEvent(id);

  if (!event) notFound();

  const organizerName = event.organizer?.name || "CareConnect Team";
  const organizerEmail = event.organizer?.email || "";
  const organizerPhoto = event.organizer?.photo || "";
  const eventType = event.eventType || event.type || "Community Event";

  const initials = organizerName
    .split(" ")
    .map((part) => part.charAt(0))
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const formattedDate = formatEventDate(event.eventDate || event.date);
  const mailSubject = encodeURIComponent(`Interested in ${event.title}`);
  const mailBody = encodeURIComponent(
    `Hi ${organizerName},\n\nI would like to take part in "${event.title}" on ${formattedDate} at ${event.location}.\n\nThank you!`
  );
  const mailHref = organizerEmail
    ? `mailto:${organizerEmail}?subject=${mailSubject}&body=${mailBody}`
    : `mailto:?subject=${mailSubject}&body=${mailBody}`;

  return (
    <section className="min-h-screen bg-gray-50 px-4 py-12 md:py-16">
      <div className="mx-auto max-w-6xl">
        {/* Back to events */}
        <Link
          href="/events"
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-green-200 bg-white px-5 py-2.5 text-sm font-semibold text-green-700 transition hover:bg-green-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Link>

        {/* Hero */}
        <div className="relative h-72 w-full overflow-hidden rounded-3xl md:h-96">
          <Image
            src={event.thumbnail}
            alt={event.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1152px"
            className="object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
            <Badge className="mb-4 h-7 bg-green-600 px-3.5 text-xs font-semibold text-white hover:bg-green-700">
              {eventType}
            </Badge>

            <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-white md:text-5xl">
              {event.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/90">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                {formattedDate}
              </span>

              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {event.location}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* About */}
            <Card className="rounded-2xl shadow-sm ring-green-100">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900">
                  About This Event
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="whitespace-pre-line text-sm leading-7 text-gray-600">
                  {event.description}
                </p>
              </CardContent>
            </Card>

            {/* Event information */}
            <Card className="rounded-2xl shadow-sm ring-green-100">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900">
                  Event Information
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <InfoRow
                  icon={<Tag className="h-5 w-5" />}
                  label="Event Type"
                  value={eventType}
                />

                <Separator />

                <InfoRow
                  icon={<CalendarDays className="h-5 w-5" />}
                  label="Date"
                  value={formattedDate}
                />

                <Separator />

                <InfoRow
                  icon={<MapPin className="h-5 w-5" />}
                  label="Location"
                  value={event.location}
                />

                <Separator />

                <InfoRow
                  icon={<Users className="h-5 w-5" />}
                  label="Organizer"
                  value={organizerName}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Organizer */}
            <Card className="rounded-2xl shadow-sm ring-green-100">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900">
                  Organized By
                </CardTitle>
              </CardHeader>

              <CardContent className="flex items-center gap-4">
                <Avatar className="size-14 ring-2 ring-green-600">
                  <AvatarImage src={organizerPhoto} alt={organizerName} />
                  <AvatarFallback className="bg-green-100 font-semibold text-green-700">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <p className="truncate font-semibold text-gray-900">
                    {organizerName}
                  </p>

                  <p className="truncate text-sm text-gray-500">
                    {organizerEmail || "Event Organizer"}
                  </p>
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  render={<a href={mailHref} />}
                  className="h-11 w-full rounded-full bg-green-700 px-6 font-semibold text-white transition hover:bg-green-800"
                >
                  <Mail className="h-4 w-4" />
                  Contact Organizer
                </Button>
              </CardFooter>
            </Card>

            {/* Call to action */}
            <Card className="rounded-2xl bg-green-700 text-white shadow-lg ring-green-800">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-white">
                  Want to make a difference?
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-sm leading-6 text-green-100">
                  Reach out to the organizer and be a part of{" "}
                  <span className="font-semibold text-white">
                    {event.title}
                  </span>
                  . Every volunteer counts!
                </p>
              </CardContent>

              <CardFooter className="flex-col items-stretch gap-3 border-green-800 bg-transparent">
                <Button
                  render={<a href={mailHref} />}
                  className="h-11 w-full rounded-full bg-white px-6 font-semibold text-green-800 transition hover:bg-green-50"
                >
                  Join This Event
                </Button>

                <Link
                  href="/events"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/40 px-6 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Browse More Events
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
