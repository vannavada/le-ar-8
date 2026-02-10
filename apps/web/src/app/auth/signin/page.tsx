"use client";

import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <div className="max-w-sm mx-auto mt-12 p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
      <h1 className="text-xl font-semibold text-gray-900">Sign in</h1>
      <p className="mt-2 text-sm text-gray-500">
        Use Google or credentials to continue.
      </p>
      <div className="mt-6 space-y-3">
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Sign in with Google
        </button>
        <p className="text-center text-xs text-gray-400">
          Credentials sign-in requires an account (e.g. seed user with password).
        </p>
      </div>
    </div>
  );
}
