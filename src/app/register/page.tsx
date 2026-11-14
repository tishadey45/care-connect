
"use client";

import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleEmailSignUp = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const user = Object.fromEntries(formData.entries()) as {
      name: string;
      image: string;
      email: string;
      password: string;
    };

    // Password Validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/;

    if (!passwordRegex.test(user.password)) {
      toast.error(
        "Password must contain uppercase, lowercase and at least 6 characters!"
      );
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await authClient.signUp.email({
        ...user,
        callbackURL: "/",
      });

      if (error) {
        toast.error(error.message || "Registration failed!");
        console.log(error);
        return;
      }

      if (data) {
        toast.success("Registration successful!");
        router.push("/login");
        router.refresh();
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-700">
            Create Account
          </h1>

          <p className="text-gray-500 mt-2">
            Join CareConnect and make a difference
          </p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleEmailSignUp} className="space-y-5">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>

            <input
              name="name"
              type="text"
              placeholder="Enter your full name"
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>

            <input
              name="email"
              type="email"
              placeholder="Enter your email"
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* Photo URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo URL
            </label>

            <input
              name="image"
              type="url"
              placeholder="Enter your photo URL"
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>

            <input
              name="password"
              type="password"
              placeholder="Enter your password"
              className="input input-bordered w-full"
              required
            />

            <p className="text-xs text-gray-500 mt-2">
              Password must contain:
            </p>

            <ul className="text-xs text-gray-500 list-disc ml-5 mt-1 space-y-1">
              <li>At least one uppercase letter (A-Z)</li>
              <li>At least one lowercase letter (a-z)</li>
              <li>Minimum 6 characters</li>
            </ul>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn w-full bg-green-700 hover:bg-green-800 text-white border-none"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Login Link */}
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
