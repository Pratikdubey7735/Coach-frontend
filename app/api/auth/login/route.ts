import { NextResponse } from "next/server";
import { authService } from "@/lib/auth-service";
import { ApiError } from "@/lib/api";

const SESSION_COOKIE = "session_token";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, user } = await authService.login(body);

    const response = NextResponse.json({ user });

    // httpOnly so client-side JS (and therefore XSS) can never read the
    // token directly; the middleware reads it on the server for every
    // request to decide whether a route is accessible.
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 500;
    const message =
      err instanceof ApiError ? err.message : "Unable to sign in right now";
    return NextResponse.json({ message }, { status });
  }
}
