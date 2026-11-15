
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function Navbar() {
  const router = useRouter();

  // Get logged-in user information
  const { data: session, isPending } = authClient.useSession();

  // Logout function
  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  return (
    <div className="navbar bg-white text-gray-800 shadow-sm">

      {/* Navbar Start */}
      <div className="navbar-start">
        <div className="dropdown">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost lg:hidden"
          >
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
              <Link href="/upcoming-events">
                Upcoming Events
              </Link>
            </li>
          </ul>
        </div>

        {/* Logo */}
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

      {/* Navbar Center */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link href="/upcoming-events">
              Upcoming Events
            </Link>
          </li>
        </ul>
      </div>

      {/* Navbar End */}
      <div className="navbar-end gap-3">

        {!isPending && (
          <>
            {/* If user is not logged in */}
            {!session?.user ? (
              <Link
                href="/login"
                className="btn bg-green-700 text-white border-none hover:bg-green-800"
              >
                Login
              </Link>
            ) : (
              <>
                {/* Profile Dropdown */}
                <div className="dropdown dropdown-end">
                  <div
                    tabIndex={0}
                    role="button"
                    title={session.user.name || "User Profile"}
                    className="btn btn-ghost btn-circle avatar"
                  >
                    <div className="w-10 rounded-full">
                      {session.user.image ? (
                        <Image
                          src={session.user.image}
                          alt={session.user.name || "User Profile"}
                          width={40}
                          height={40}
                        />
                      ) : (
                        <div className="bg-green-700 text-white flex items-center justify-center w-10 h-10 rounded-full font-bold">
                          {session.user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dropdown Menu */}
                  <ul
                    tabIndex={0}
                    className="menu dropdown-content bg-white rounded-box z-10 mt-3 w-52 p-2 shadow"
                  >
                    <li className="menu-title">
                      {session.user.name}
                    </li>

                    <li>
                      <Link href="/create-event">
                        Create Event
                      </Link>
                    </li>

                    <li>
                      <Link href="/manage-events">
                        Manage Events
                      </Link>
                    </li>

                    <li>
                      <Link href="/joined-events">
                        Joined Events
                      </Link>
                    </li>

                    <li>
                      <button
                        onClick={handleLogout}
                        className="text-red-600"
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="btn bg-green-700 text-white border-none hover:bg-green-800"
                >
                  Logout
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
