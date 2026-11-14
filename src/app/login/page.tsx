"use client";

import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-700">Welcome Back!</h1>
          <p className="text-gray-500 mt-2">
            Login to your CareConnect account
          </p>
        </div>

        <form className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="input input-bordered w-full"
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
              className="input input-bordered w-full"
              required
            />
          </div>

          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm text-green-700 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="btn w-full bg-green-700 hover:bg-green-800 text-white border-none"
          >
            Login
          </button>
        </form>

        <div className="divider text-gray-400">OR</div>

        <button type="button" className="btn w-full">
          <span className="text-lg font-bold text-blue-600">G</span>
          Continue with Google
        </button>

        <p className="text-center text-sm text-gray-600 mt-7">
          Dont have an account?{" "}
          <Link
            href="/register"
            className="text-green-700 font-bold hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
