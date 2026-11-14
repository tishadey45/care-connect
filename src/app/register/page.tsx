"use client";

import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-700">Create Account</h1>

          <p className="text-gray-500 mt-2">
            Join CareConnect and make a difference
          </p>
        </div>

        <form className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>

            <input
              type="text"
              placeholder="Enter your full name"
              className="bg-gray-300 py-2 w-full rounded-1xl"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              className="bg-gray-300 py-2 w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo URL
            </label>

            <input
              type="url"
              placeholder="Enter your photo URL"
              className="bg-gray-300 py-2 w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              className="bg-gray-300 py-2 w-full"
              required
            />

            <p className="text-xs text-gray-500 mt-2">Password must contain:</p>

            <ul className="text-xs text-gray-500 list-disc ml-5 mt-1 space-y-1">
              <li>At least one uppercase letter (A-Z)</li>
              <li>At least one lowercase letter (a-z)</li>
              <li>Minimum 6 characters</li>
            </ul>
          </div>

          <button
            type="submit"
            className="btn w-full bg-green-700 hover:bg-green-800 text-white border-none"
          >
            Create Account
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-7">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-green-700 font-bold hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
