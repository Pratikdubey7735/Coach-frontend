export interface AuthUser {
  userName: string;
  userId: string;
  email: string;
  employeeType: string;
  coachLevel: string;
}

function mapApiUserToAuthUser(apiData: any): AuthUser {
  return {
    userName: apiData.userName,
    userId: apiData.userId,
    email: apiData.email,
    employeeType: apiData.EmployeeType,
    coachLevel: apiData.coachLevel,
  };
}

export const authService = {
  async login(email: string, password: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data?.message ?? "Unable to sign in");
    }

    return {
      user: mapApiUserToAuthUser(data),
      token: data.token ?? data.userId, // replace with whatever your API actually returns as the session token
    };
  },

  async me(token: string): Promise<AuthUser | null> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return mapApiUserToAuthUser(data);
  },
};