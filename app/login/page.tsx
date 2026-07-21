"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";

export default function CoachLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message ?? "Unable to sign in");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen grid-cols-1 bg-black lg:grid-cols-2">
      {/* Left: brand panel */}
      <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0B1C3D] to-[#0A1730] p-12 lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />

        <div className="relative">
          <div className="flex items-center gap-2.5">
            <div>
              <p className="text-[48px] font-bold leading-tight text-white">Upstep Academy</p>
            </div>
          </div>

          <h1 className="mt-10 text-4xl font-bold leading-tight text-white">
            Welcome Back,
            <br />
            <span className="text-[#4C82FB]">Coach!</span>
          </h1>
          <div className="mt-3 h-1 w-14 rounded-full bg-[#4C82FB]" />
          <p className="mt-20 max-w-sm text-lg leading-relaxed text-white/60">
            Log in to your account to manage students, track progress and
            continue your coaching journey.
          </p>
        </div>

        <div className="relative h-40" />
      </section>

      {/* Right: form */}
      <section className="flex items-center justify-center bg-black px-6 py-12 lg:bg-[#F4F6FA]">
        <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-xl">
          <div className="flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF0FE]">
              <User className="h-8 w-8 text-[#4C82FB]" strokeWidth={1.75} />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              Coach Login
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-semibold text-gray-800"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-11 pr-3.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-[#4C82FB] focus:ring-2 focus:ring-[#4C82FB]/20"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-semibold text-gray-800"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-11 pr-11 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-[#4C82FB] focus:ring-2 focus:ring-[#4C82FB]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4.5 w-4.5" />
                  ) : (
                    <Eye className="h-4.5 w-4.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <a
                href="/forgot-password"
                className="text-sm font-medium text-[#4C82FB] hover:underline"
              >
                Forgot Password?
              </a>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#3D6AE2] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#3559C4] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Logging in…" : "Log In"}
            </button>
          </form>

         
        </div>
      </section>
    </main>
  );
}