"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      let data: { error?: string } = {};
      try {
        data = (await response.json()) as { error?: string };
      } catch {
        // Response was not JSON (e.g. dev error overlay); fall back to generic handling.
        data = {};
      }

      if (!response.ok) {
        setError(data.error ?? "Unable to sign in.");
        setIsSubmitting(false);
        return;
      }

      router.push("/admin");
    } catch (err) {
      clearTimeout(timeout);
      console.error(err);
      if (err instanceof Error && err.name === "AbortError") {
        setError("Request timed out. The database may be unreachable from this network.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-md space-y-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">
          Admin
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          Choir admin sign in
        </h1>
        <p className="text-sm text-zinc-700">
          This area is for choir administrators only. Use the credentials you
          configured in the environment file.
        </p>
      </header>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200"
      >
        <div className="space-y-1">
          <label className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-600">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-10 w-full rounded-lg border border-zinc-300 px-3 text-sm text-zinc-900 outline-none ring-zinc-900/10 placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-600">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-10 w-full rounded-lg border border-zinc-300 px-3 text-sm text-zinc-900 outline-none ring-zinc-900/10 placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2"
          />
        </div>
        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </section>
  );
}

