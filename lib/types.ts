export interface UserData {
  id: string;
  userName: string;
  email: string;
  employeeType: string;
  coachLevel: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: UserData;
  // Backward compatibility fields
  userName?: string;
  userId?: string;
  EmployeeType?: string;
  coachLevel?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}