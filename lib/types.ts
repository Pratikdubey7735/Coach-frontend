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

export interface Session {
  topic: string;
  students: string[];
  status: 'Completed' | 'Planned' | 'In Progress';
  startTime: string;
  sessionName: string;
  dayStr: string;
  dateStr: string;
  coachSessionId: string;
  batchName: string;
  batchId: string;
}

export interface AttendanceRecord {
  enrollmentId: string;
  status: 'Present' | 'Absent' | 'Late';
}

export interface MarkAttendanceRequest {
  coachId: string;
  coachSessionId: string;
  records: AttendanceRecord[];
}

export interface MarkAttendanceResponse {
  success: boolean;
  message: string;
  data?: any;
}