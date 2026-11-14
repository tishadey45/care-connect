
"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function LoginPage() {
 const handleEmailSignUp = async (e: React.SubmitEvent<HTMLElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const user = Object.fromEntries(formData.entries()) as {
      email: string;
      password: string;
    };
    console.log(user);
    const {data, error} = await authClient.signIn.email({
      ...user,
    });
    if(data){
      console.log(data)
    }
    if(error){
      console.log(error)
    }
  };
  // const onSubmit = async (e: React.SubmitEvent<HTMLElement>) => {
  //   e.preventDefault();

  //   const formData = new FormData(e.target);
  //   const user = Object.fromEntries(formData.entries()) as {
  //     email: string;
  //     password: string;
  //   };

  //   console.log(user);

  //   const { data, error } = await authClient.signIn.email({
  //     ...user,
  //     callbackURL: "/",
  //   });

  //   if (data) {
  //     toast.success("Sign In successfull!");
  //     console.log(data);
  //   }

  //   if (error) {
  //     toast.error("Something went error!");
  //     console.log(error);
  //   }
  // };

  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({
      provider: "google",
    });

  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-700">
            Welcome Back!
          </h1>
          <p className="text-gray-500 mt-2">
            Login to your CareConnect account
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleEmailSignUp} className="space-y-5">

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
            
            />
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm text-green-700 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="btn w-full bg-green-700 hover:bg-green-800 text-white border-none"
          >
            Login
          </button>
        </form>

        {/* Divider */}
        <div className="divider text-gray-400">OR</div>

        {/* Google Login */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="btn btn-outline w-full"
        >
          <span className="text-lg font-bold text-blue-600">G</span>
          Continue with Google
        </button>

        {/* Register Link */}
        <p className="text-center text-sm text-gray-600 mt-7">
          Don't have an account?{" "}
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
