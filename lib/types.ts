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

export interface DemoLead {
  Name: string;
  MobilePhone: string | null;
  Email: string;
}

export interface DemoAppointment {
  Id: string;
  Name: string;
  Lead__c: string;
  Lead__r: DemoLead;
  IST_Demo_Date__c: string;
  IST_Start_Time__c: string;
  IST_End_Time__c: string;
  Region__c: string;
  Demo_Status__c: 'Demo Done' | 'Coach Assigned' | 'Scheduled' | 'Cancelled' | 'No Show';
  Sub_Level__c?: string;
  Remarks__c?: string;
  Coach_User__c: string;
}

export interface UpdateDemoStatusRequest {
  demoId: string;
  status: string;
  subLevel?: string;
  remarks?: string;
}

export interface UpdateDemoStatusResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface UpdateDemoFeedbackRequest {
  demoId: string;
  status: string;
  subLevel?: string;
  remarks?: string;
}

export interface UpdateDemoFeedbackResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface Batch {
  Id: string;
  Name: string;
  Coach_User__c: string;
  Start_Date__c: string;
  End_Date__c: string;
  Batch_Status__c: 'Active Batch' | 'Active' | 'Completed' | 'Scheduled' | 'Cancelled' | 'Inactive';
  enrollments?: Enrollment[];
}

export interface Enrollment {
  Id: string;
  Student__c: string;
  Student__r: {
    Name: string;
    Email?: string;
  };
  Batch__c: string;
  Enrollment_Status__c: 'Active' | 'Completed' | 'Dropped' | 'Pending';
  Level__c?: string;
}


export interface CreateFeedbackRequest {
  Enrollment__c: string;
  Level1__c: string;
  Feedback_Status__c: 'Draft' | 'Submit for Approval' | 'Approved' | 'Rejected';
  [key: string]: any; 
}

export interface CreateFeedbackResponse {
  success: boolean;
  message: string;
  data?: any;
}