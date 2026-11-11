import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#123D2B] text-white">
      <div className="mx-auto max-w-7xl px-5 py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-5">
            <Link href="/" className="inline-block text-3xl font-bold">
              care<span className="text-green-400">Connect</span>
            </Link>

            <p className="max-w-xs text-sm leading-7 text-gray-300">
              Connecting people, inspiring kindness, and creating meaningful
              changes through community service and social development
              initiatives.
            </p>

            <div className="flex gap-3">
              <Link
                href="https://facebook.com"
                target="_blank"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-green-600"
              >
                f
              </Link>

              <Link
                href="https://instagram.com"
                target="_blank"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-green-600"
              >
                ◎
              </Link>

              <Link
                href="https://linkedin.com"
                target="_blank"
                aria-label="LinkedIn"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-green-600"
              >
                in
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-5 text-lg font-semibold">Quick Links</h3>

            <ul className="space-y-3 text-sm text-gray-300">
              <li>
                <Link href="/" className="transition hover:text-green-400">
                  Home
                </Link>
              </li>

              <li>
                <Link
                  href="/events"
                  className="transition hover:text-green-400"
                >
                  All Events
                </Link>
              </li>

              <li>
                <Link
                  href="/gallery"
                  className="transition hover:text-green-400"
                >
                  Gallery
                </Link>
              </li>

              <li>
                <Link href="/about" className="transition hover:text-green-400">
                  About Us
                </Link>
              </li>

              <li>
                <Link
                  href="/contact"
                  className="transition hover:text-green-400"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-lg font-semibold">Our Community</h3>

            <ul className="space-y-3 text-sm text-gray-300">
              <li>
                <Link
                  href="/register"
                  className="transition hover:text-green-400"
                >
                  Join Community
                </Link>
              </li>

              <li>
                <Link
                  href="/create-event"
                  className="transition hover:text-green-400"
                >
                  Create an Event
                </Link>
              </li>

              <li>
                <Link
                  href="/events"
                  className="transition hover:text-green-400"
                >
                  Become a Volunteer
                </Link>
              </li>

              <li>
                <Link
                  href="/events"
                  className="transition hover:text-green-400"
                >
                  Explore Events
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-lg font-semibold">Get In Touch</h3>

            <ul className="space-y-4 text-sm text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-lg">📧</span>
                <span>hello@careconnect.com</span>
              </li>

              <li className="flex items-start gap-3">
                <span className="text-lg">📞</span>
                <span>+880 1XXX-XXXXXX</span>
              </li>

              <li className="flex items-start gap-3">
                <span className="text-lg">📍</span>
                <span>Bangladesh</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="my-10 border-t border-white/20" />

        <div className="flex flex-col items-center justify-between gap-4 text-center text-sm text-gray-300 md:flex-row">
          <p>© 2026 careConnect. All rights reserved.</p>

          <p>Made with ❤️ for a better community.</p>
        </div>
      </div>
    </footer>
  );
}
