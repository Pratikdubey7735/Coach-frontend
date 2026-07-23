'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthService } from '@/lib/services';
import { Session } from '@/lib/types';

interface Student {
  enrollmentId: string;
  name: string;
  status: 'Present' | 'Absent' | 'Late';
}

export default function AttendancePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  
  const [session, setSession] = useState<Session | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const authService = AuthService.getInstance();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    if (!sessionId) {
      router.push('/dashboard/sessions');
      return;
    }

    loadSessionData();
  }, [sessionId]);

  const loadSessionData = async () => {
    try {
      setLoading(true);
      const userData = authService.getUserData();
      if (!userData) {
        throw new Error('User data not found');
      }

      const sessions = await authService.getCoachSessions(userData.id);
      const foundSession = sessions.find(s => s.coachSessionId === sessionId);
      
      if (!foundSession) {
        throw new Error('Session not found');
      }

      setSession(foundSession);
      
      const studentsData: Student[] = (foundSession.students || []).map((student: any) => ({
        enrollmentId: student.enrollmentId || student.id || `student_${Math.random()}`,
        name: student.name || student.studentName || `Student ${Math.random().toString(36).substr(2, 4)}`,
        status: 'Present',
      }));

      setStudents(studentsData);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSessions = () => {
    router.push('/dashboard/sessions');
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const handleStatusChange = (enrollmentId: string, status: 'Present' | 'Absent' | 'Late') => {
    setStudents(prev =>
      prev.map(student =>
        student.enrollmentId === enrollmentId ? { ...student, status } : student
      )
    );
  };

  const handleMarkAllPresent = () => {
    setStudents(prev => prev.map(student => ({ ...student, status: 'Present' })));
  };

  const handleMarkAllAbsent = () => {
    setStudents(prev => prev.map(student => ({ ...student, status: 'Absent' })));
  };

  const handleSubmitAttendance = async () => {
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      const userData = authService.getUserData();
      if (!userData || !session) {
        throw new Error('Missing required data');
      }

      const records = students.map(student => ({
        enrollmentId: student.enrollmentId,
        status: student.status,
      }));

      const response = await authService.markAttendance({
        coachId: userData.id,
        coachSessionId: session.coachSessionId,
        records,
      });

      if (response.success) {
        setSuccess('Attendance marked successfully!');
        setTimeout(() => {
          router.push('/dashboard/sessions');
        }, 2000);
      } else {
        throw new Error(response.message || 'Failed to mark attendance');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present':
        return 'bg-green-100 text-green-800';
      case 'Absent':
        return 'bg-red-100 text-red-800';
      case 'Late':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'planned':
        return 'bg-yellow-100 text-yellow-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusCount = (status: string) => {
    return students.filter(s => s.status === status).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-500 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="mt-4 text-gray-600">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Session not found</p>
          <button
            onClick={handleBackToSessions}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Back to Sessions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button - Two options */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <button
            onClick={handleBackToSessions}
            className="flex items-center text-gray-600 hover:text-blue-600 transition font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Sessions
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={handleBackToDashboard}
            className="flex items-center text-gray-600 hover:text-blue-600 transition font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </button>
        </div>

        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex flex-wrap items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mark Attendance</h1>
                <h2 className="text-xl font-semibold text-gray-800 mt-1">{session.sessionName || 'Unnamed Session'}</h2>
                <p className="text-gray-600 mt-1">{session.topic || 'No topic specified'}</p>
              </div>
              <div className="flex flex-wrap gap-3 mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(session.status)}`}>
                  {session.status || 'Unknown'}
                </span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                  {session.batchName || 'No batch'}
                </span>
                <span className="px-3 py-1 bg-blue-50 rounded-full text-xs font-medium text-blue-600">
                  {students.length} Students
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {session.dayStr || ''}, {session.dateStr || ''}
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {session.startTime ? session.startTime.substring(0, 5) : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        {students.length > 0 ? (
          <>
            {/* Status Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
                <div className="text-2xl font-bold text-green-600">{getStatusCount('Present')}</div>
                <div className="text-sm text-green-700">Present</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 text-center border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-600">{getStatusCount('Late')}</div>
                <div className="text-sm text-yellow-700">Late</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center border border-red-200">
                <div className="text-2xl font-bold text-red-600">{getStatusCount('Absent')}</div>
                <div className="text-sm text-red-700">Absent</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-2">
                <h3 className="text-lg font-medium text-gray-900">Student List</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleMarkAllPresent}
                    className="px-4 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition font-medium"
                  >
                    All Present
                  </button>
                  <button
                    onClick={handleMarkAllAbsent}
                    className="px-4 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium"
                  >
                    All Absent
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Enrollment ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student.enrollmentId} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                              student.status === 'Present' ? 'bg-green-100 text-green-600' :
                              student.status === 'Late' ? 'bg-yellow-100 text-yellow-600' :
                              'bg-red-100 text-red-600'
                            }`}>
                              <span className="font-medium text-sm">
                                {student.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 font-mono">{student.enrollmentId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                            {student.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={student.status}
                            onChange={(e) => handleStatusChange(
                              student.enrollmentId,
                              e.target.value as 'Present' | 'Absent' | 'Late'
                            )}
                            className={`px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              student.status === 'Present' ? 'border-green-300 bg-green-50' :
                              student.status === 'Late' ? 'border-yellow-300 bg-yellow-50' :
                              'border-red-300 bg-red-50'
                            }`}
                          >
                            <option value="Present">✅ Present</option>
                            <option value="Late">⏰ Late</option>
                            <option value="Absent">❌ Absent</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-4">
              <button
                onClick={handleBackToSessions}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitAttendance}
                disabled={submitting}
                className={`px-8 py-2.5 rounded-lg text-white font-medium transition duration-200 ${
                  submitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 shadow-sm hover:shadow'
                }`}
              >
                {submitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Submit Attendance'
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No Students</h3>
            <p className="mt-2 text-sm text-gray-500">
              No students are enrolled in this session yet.
            </p>
            <button
              onClick={handleBackToSessions}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Back to Sessions
            </button>
          </div>
        )}
      </div>
    </div>
  );
}