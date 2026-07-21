"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton({
  children,
}: {
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="disabled:opacity-60"
    >
      {loading ? "Signing out…" : children ?? "Sign out"}
    </button>
  );
}