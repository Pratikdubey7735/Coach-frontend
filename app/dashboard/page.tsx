import { cookies } from "next/headers";
import { authService, type AuthUser } from "@/lib/auth-service";
import DashboardClient from "./DashboardClient";

async function getCurrentUser(): Promise<AuthUser | null> {
  const token = (await cookies()).get("session_token")?.value;
  if (!token) return null;

  try {
    return await authService.me(token);
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  return <DashboardClient user={user} />;
}