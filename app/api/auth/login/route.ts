import { NextResponse } from "next/server";
import { authService } from "@/lib/auth-service";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const { user, token } = await authService.login(email, password);

    const response = NextResponse.json({ success: true, user });

    response.cookies.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Unable to sign in" },
      { status: 401 }
    );
  }
}