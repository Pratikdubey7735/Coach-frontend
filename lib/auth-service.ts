import { api } from "./api";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

/**
 * Talks to the Node.js backend's auth endpoints.
 * Adjust the paths below (`/auth/login`, `/auth/me`) to match your
 * actual backend routes.
 */
export const authService = {
  login: (payload: LoginPayload) =>
    api.post<LoginResponse>("/auth/login", payload),

  me: (token: string) => api.get<AuthUser>("/auth/me", { token }),

  logout: (token: string) => api.post<void>("/auth/logout", undefined, { token }),
};
