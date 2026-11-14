import { Search } from "lucide-react";
import Link from "next/link";

export default function EventNotFound() {
  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center bg-gray-50 px-4 py-20 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-700">
        <Search className="h-9 w-9" />
      </span>

      <h1 className="mt-6 text-3xl font-bold text-gray-900 md:text-4xl">
        Event Not Found
      </h1>

      <p className="mt-4 max-w-md text-gray-500 leading-relaxed">
        The event you are looking for doesn&apos;t exist, may have been removed,
        or the link is incorrect.
      </p>

      <Link
        href="/events"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-green-600 px-8 py-3.5 font-semibold text-white shadow-lg transition hover:bg-green-700"
      >
        ← Back to All Events
      </Link>
    </section>
  );
}
