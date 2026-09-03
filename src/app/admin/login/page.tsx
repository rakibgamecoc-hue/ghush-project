"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Login failed");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 py-12">
      <h1 className="mb-2 text-3xl font-black">Admin Login</h1>
      <p className="mb-6 text-sm text-slate-500">
        Restricted area. Authorized reviewers only.
      </p>
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div className="space-y-1">
          <label htmlFor="admin-password" className="text-sm font-medium">
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-2 border-slate-900 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>
        {error && (
          <p role="alert" className="text-sm font-medium text-red-600">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full border-2 border-slate-900 bg-yellow-400 px-3 py-2 font-bold text-slate-900 shadow-[4px_4px_0_rgba(15,23,42,0.9)] transition hover:bg-yellow-300 disabled:opacity-60"
        >
          {isSubmitting ? "Verifying..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
