import Image from "next/image";
import Link from "next/link";

export default function Banner() {
  return (
    <section className="w-full overflow-hidden bg-[#F3F8F1] font-sans">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-5 py-14 md:py-20 lg:grid-cols-2">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-5 py-2 text-sm font-semibold text-green-800">
            🌱 Together for a Better Tomorrow
          </span>

          <h1 className="text-4xl leading-tight font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Make a Difference
            <br />
            With{" "}
            <span className="text-green-900">
              care<span className="text-green-700">Connect</span>
            </span>
          </h1>

          <p className="max-w-lg text-base leading-relaxed text-gray-600 md:text-lg">
            Connect with passionate people, participate in meaningful community
            service activities, and help build a better tomorrow for everyone.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="#upcoming-events"
              className="rounded-full bg-green-700 px-7 py-3.5 font-semibold text-white shadow-lg transition hover:bg-green-800"
            >
              Explore Events →
            </Link>

            <Link
              href="/register"
              className="rounded-full border-2 border-green-700 px-7 py-3.5 font-semibold text-green-700 transition hover:bg-green-700 hover:text-white"
            >
              Join Community
            </Link>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-2xl">
              🤝
            </div>

            <div>
              <h3 className="font-semibold text-gray-800">
                Stronger Community Together
              </h3>

              <p className="text-sm text-gray-500">Small Acts, Big Impact.</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -right-5 -top-5 h-40 w-40 rounded-full bg-green-200 opacity-60 blur-3xl" />

          <Image
            src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1200&q=85"
            alt="Volunteers helping the community"
            width={800}
            height={700}
            priority
            className="relative h-87.5 w-full rounded-3xl object-cover shadow-2xl md:h-120"
          />

          <div className="absolute -bottom-5 left-4 right-4 rounded-2xl border border-green-100 bg-white p-5 shadow-xl md:left-8 md:right-8">
            <h3 className="font-bold text-green-800">
              ❤️ Together We Can Change Lives
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Be a volunteer. Be the change.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
