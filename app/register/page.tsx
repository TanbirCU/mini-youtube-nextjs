import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-10">

      <div className="w-full max-w-md rounded-2xl border bg-white p-7 shadow-sm">

        <div className="text-center">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-600 text-white">
            ▶
          </div>

          <h1 className="mt-5 text-2xl font-bold">
            Create your account
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Join the MiniTube community
          </p>

        </div>

        <form className="mt-8 space-y-5">

          <div>
            <label className="mb-2 block text-sm font-medium">
              Name
            </label>

            <input
              placeholder="Your name"
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Email
            </label>

            <input
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Password
            </label>

            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Confirm password
            </label>

            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-gray-900"
            />
          </div>

          <button className="w-full rounded-xl bg-gray-900 py-3 font-medium text-white hover:bg-gray-800">
            Create account
          </button>

        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-red-600"
          >
            Sign in
          </Link>
        </p>

      </div>

    </div>
  );
}