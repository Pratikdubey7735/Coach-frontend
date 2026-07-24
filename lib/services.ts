import { 
  LoginCredentials, 
  LoginResponse, 
  UserData, 
  Session, 
  MarkAttendanceRequest, 
  MarkAttendanceResponse,
  DemoAppointment,
  UpdateDemoStatusRequest,
  UpdateDemoStatusResponse,
  UpdateDemoFeedbackRequest,
  UpdateDemoFeedbackResponse
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export class AuthService {
  private static instance: AuthService;
  private token: string | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // ============= AUTH METHODS =============
  async login(credentials: LoginCredentials): Promise<UserData> {
    try {
      console.log('Attempting login to:', `${API_BASE_URL}/api/auth/login`);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Received non-JSON response:', text);
        throw new Error('Server returned non-JSON response. Please check your backend.');
      }

      const data: LoginResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Login failed with status: ${response.status}`);
      }

      if (!data.success) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token and user data
      this.token = data.token;
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_data', JSON.stringify(data.user || data));
        // Set cookie for middleware
        document.cookie = `auth_token=${data.token}; path=/; max-age=604800`; // 7 days
      }

      // Return user data
      return data.user || data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      // Clear local storage and cookies
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
      this.token = null;
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  getUserData(): UserData | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        try {
          return JSON.parse(userData);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('auth_token');
    }
    return !!this.token;
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return this.token;
  }

  // ============= SESSION METHODS =============
  async getCoachSessions(coachId: string): Promise<Session[]> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      console.log('Fetching sessions for coach:', coachId);

      const response = await fetch(
        `${API_BASE_URL}/api/coach/sessions?coachId=${coachId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch sessions');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Get sessions error:', error);
      throw error;
    }
  }

  async markAttendance(request: MarkAttendanceRequest): Promise<MarkAttendanceResponse> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      console.log('Marking attendance for session:', request.coachSessionId);

      const response = await fetch(
        `${API_BASE_URL}/api/coach/attendance`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to mark attendance');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Mark attendance error:', error);
      throw error;
    }
  }

  // ============= DEMO METHODS =============
  async getCoachDemos(coachId: string): Promise<DemoAppointment[]> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      console.log('Fetching demos for coach:', coachId);

      const response = await fetch(
        `${API_BASE_URL}/api/coach/demos?coachId=${coachId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch demos');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Get demos error:', error);
      throw error;
    }
  }

  async getDemoById(demoId: string): Promise<DemoAppointment> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      console.log('Fetching demo by ID:', demoId);

      const response = await fetch(
        `${API_BASE_URL}/api/coach/demo/${demoId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch demo');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Get demo by ID error:', error);
      throw error;
    }
  }

  async updateDemoStatus(request: UpdateDemoStatusRequest): Promise<UpdateDemoStatusResponse> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      console.log('Updating demo status:', request);

      const response = await fetch(
        `${API_BASE_URL}/api/coach/demo/status`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update demo status');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Update demo status error:', error);
      throw error;
    }
  }

  async updateDemoFeedback(request: UpdateDemoFeedbackRequest): Promise<UpdateDemoFeedbackResponse> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      console.log('Updating demo feedback:', request);

      const response = await fetch(
        `${API_BASE_URL}/api/coach/demo/feedback`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update demo feedback');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Update demo feedback error:', error);
      throw error;
    }
  }
}

export function useAuth() {
  return AuthService.getInstance();
}