
import Image from "next/image";
import Link from "next/link";

interface Event {
  _id: string;
  title: string;
  description: string;
  type: string;
  thumbnail: string;
  location: string;
  date: string;
}

export default async function AllEventsPage() {
  const res = await fetch("http://localhost:5000/events", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch events");
  }

  const data = await res.json();

  // Only show upcoming events
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents: Event[] = (Array.isArray(data) ? data : data.events || [])
    .filter((event: Event) => new Date(event.date) >= today)
    .sort(
      (a: Event, b: Event) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

  return (
    <section className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Heading */}
        <div className="text-center mb-12">
          <p className="text-green-600 font-semibold uppercase tracking-widest text-sm mb-3">
            Make a Difference Together
          </p>

          <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
            Upcoming <span className="text-green-600">Events</span>
          </h1>

          <p className="text-gray-500 max-w-2xl mx-auto">
            Discover meaningful community events near you. Join hands with
            others and make a positive impact on society.
          </p>
        </div>

        {/* Event Count */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-gray-800">
            Explore Events
          </h2>

          <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
            {upcomingEvents.length} Events Found
          </span>
        </div>

        {/* Events Grid */}
        {upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingEvents.map((event) => (
              <div
                key={event._id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition duration-300 border border-gray-100 group"
              >
                {/* Thumbnail */}
                <div className="relative h-56 w-full overflow-hidden">
                  <Image
                    src={event.thumbnail}
                    alt={event.title}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />

                  <span className="absolute top-4 left-4 bg-green-600 text-white text-xs font-semibold px-3 py-2 rounded-full">
                    {event.type}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-1">
                    {event.title}
                  </h3>

                  <p className="text-gray-500 text-sm leading-6 mb-5 line-clamp-2">
                    {event.description}
                  </p>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                    <span>📍</span>
                    <span className="line-clamp-1">{event.location}</span>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-6">
                    <span>📅</span>
                    <span>
                      {new Date(event.date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Button */}
                  <Link
                    href={`/upcoming-events/${event._id}`}
                    className="block text-center bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition duration-300"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="text-5xl mb-4">🌱</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              No Upcoming Events
            </h3>
            <p className="text-gray-500">
              There are no upcoming events right now. Please check back later!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
