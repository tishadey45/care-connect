import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <div className="navbar bg-white text-gray-800 shadow-sm">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </div>

          <ul
            tabIndex={0}
            className="menu dropdown-content bg-white text-gray-800 rounded-box z-10 mt-3 w-52 p-2 shadow"
          >
            <li>
              <Link href="/upcoming-events">Upcoming Events</Link>
            </li>
          </ul>
        </div>

        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="CareConnect Logo"
            width={100}
            height={100}
            priority
          />
        </Link>
      </div>

      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link href="/upcoming-events">Upcoming Events</Link>
          </li>
        </ul>
      </div>

      <div className="navbar-end">
        <Link
          href="/login"
          className="btn bg-green-700 text-white border-none hover:bg-green-200"
        >
          Login
        </Link>
      </div>
    </div>
  );
}
