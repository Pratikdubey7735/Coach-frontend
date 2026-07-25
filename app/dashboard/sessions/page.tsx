'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/services';
import { Session } from '@/lib/types';

export default function SessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showPendingPastSessions, setShowPendingPastSessions] = useState(false);
  const authService = AuthService.getInstance();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    const userData = authService.getUserData();
    if (userData && userData.id) {
      fetchSessions(userData.id);
    } else {
      setError('User ID not found');
      setLoading(false);
    }

    // Check if we came from the "Mark Attendance" button on dashboard
    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get('filter');
    if (filterParam === 'pending-past') {
      setShowPendingPastSessions(true);
    }
  }, [router]);

  const fetchSessions = async (coachId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await authService.getCoachSessions(coachId);
      setSessions(data);
      setFilteredSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if a session is past
  const isSessionPast = (session: Session): boolean => {
    if (!session.dateStr || !session.startTime) return false;
    
    // Combine date and time
    const [year, month, day] = session.dateStr.split('-').map(Number);
    const [hours, minutes] = session.startTime.split(':').map(Number);
    
    const sessionDate = new Date(year, month - 1, day, hours, minutes);
    const now = new Date();
    
    return sessionDate < now;
  };

  // Filter sessions
  useEffect(() => {
    let filtered = [...sessions];

    // Filter by pending past sessions (for Mark Attendance)
    if (showPendingPastSessions) {
      filtered = filtered.filter(session => 
        session.status?.toLowerCase() === 'planned' && isSessionPast(session)
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(session => {
        const sessionStatus = session.status?.toLowerCase() || '';
        const filter = filterStatus.toLowerCase();
        return sessionStatus === filter;
      });
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(session => {
        const topic = session.topic?.toLowerCase() || '';
        const sessionName = session.sessionName?.toLowerCase() || '';
        const batchName = session.batchName?.toLowerCase() || '';
        return topic.includes(term) || 
               sessionName.includes(term) || 
               batchName.includes(term);
      });
    }

    setFilteredSessions(filtered);
  }, [searchTerm, filterStatus, sessions, showPendingPastSessions]);

  const handleMarkAttendance = (session: Session) => {
    router.push(`/dashboard/attendance?sessionId=${session.coachSessionId}`);
  };

  const handleBack = () => {
    router.push('/dashboard');
  };

  const handleTogglePendingPast = () => {
    setShowPendingPastSessions(!showPendingPastSessions);
    // Reset other filters when toggling this special filter
    if (!showPendingPastSessions) {
      setFilterStatus('all');
      setSearchTerm('');
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'planned':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDot = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'completed':
        return 'bg-green-500';
      case 'planned':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Count pending past sessions
  const getPendingPastCount = () => {
    return sessions.filter(session => 
      session.status?.toLowerCase() === 'planned' && isSessionPast(session)
    ).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-500 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="mt-4 text-gray-600">Loading sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="mb-6 flex items-center text-gray-600 hover:text-blue-600 transition font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button>

        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Sessions</h1>
              <p className="text-gray-600 mt-2">
                {showPendingPastSessions 
                  ? 'Showing sessions that need attendance marking'
                  : 'View and manage your coaching sessions'}
              </p>
            </div>
            <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm">
              {filteredSessions.length} sessions found
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

        {/* Session Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Mark Attendance Filter Button - Simple and clean */}
            <button
              onClick={handleTogglePendingPast}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                showPendingPastSessions
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-green-50 text-green-600 hover:bg-green-100 border-2 border-green-200'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {showPendingPastSessions ? 'Showing Pending' : 'Mark Attendance'}
              {!showPendingPastSessions && getPendingPastCount() > 0 && (
                <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full ml-1">
                  {getPendingPastCount()}
                </span>
              )}
            </button>

            <div className="h-8 w-px bg-gray-200" />

            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-gray-700">Filter by Status:</span>
              <select 
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  if (showPendingPastSessions && e.target.value !== 'all') {
                    setShowPendingPastSessions(false);
                  }
                }}
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-400 transition"
                style={{ minWidth: '150px' }}
                disabled={showPendingPastSessions}
              >
                <option value="all" className="text-gray-700">📋 All Sessions</option>
                <option value="planned" className="text-yellow-700">📅 Planned</option>
                <option value="completed" className="text-green-700">✅ Completed</option>
              </select>
            </div>
            
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="🔍 Search by topic, session name, or batch..."
                  className="w-full px-4 py-2.5 pl-11 border border-gray-300 rounded-lg text-sm text-gray-700 placeholder-gray-500 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-400 transition"
                  disabled={showPendingPastSessions}
                />
                <svg className="absolute left-3 top-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            {(searchTerm || filterStatus !== 'all' || showPendingPastSessions) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setShowPendingPastSessions(false);
                }}
                className="px-4 py-2.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
              >
                ✕ Clear All
              </button>
            )}
          </div>
          
          {/* Active Filters Display */}
          {(searchTerm || filterStatus !== 'all' || showPendingPastSessions) && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
              {showPendingPastSessions && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  ⏰ Pending Past Sessions
                  <button
                    onClick={() => setShowPendingPastSessions(false)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {filterStatus !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Status: {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                  <button
                    onClick={() => setFilterStatus('all')}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {searchTerm && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Search: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-2 text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Sessions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session) => {
            const isPendingPast = isSessionPast(session) && session.status?.toLowerCase() === 'planned';
            
            return (
              <div
                key={session.coachSessionId}
                className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all duration-200 group ${
                  showPendingPastSessions && isPendingPast
                    ? 'border-blue-300 shadow-md'
                    : showPendingPastSessions && !isPendingPast
                    ? 'opacity-50'
                    : 'border-gray-100 hover:shadow-md'
                }`}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition">
                        {session.sessionName || 'Unnamed Session'}
                      </h3>
                      <div className="flex items-center mt-1 gap-2 flex-wrap">
                        <span className={`w-2 h-2 rounded-full ${getStatusDot(session.status)} mr-2`}></span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                          {session.status || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{session.topic || 'No topic specified'}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-500">
                      <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{session.dayStr || ''}, {session.dateStr || ''}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{session.startTime ? session.startTime.substring(0, 5) : 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="truncate">{session.batchName || 'No batch'}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        <span className="font-medium text-gray-700">{session.students?.length || 0}</span> students enrolled
                      </span>
                      <button
                        onClick={() => handleMarkAttendance(session)}
                        disabled={session.status?.toLowerCase() === 'completed'}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition duration-200 ${
                          session.status?.toLowerCase() === 'completed'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm hover:shadow'
                        }`}
                      >
                        {session.status?.toLowerCase() === 'completed' ? 'Completed' : 'Mark Attendance'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredSessions.length === 0 && !error && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {showPendingPastSessions 
                ? 'No pending sessions to mark attendance' 
                : searchTerm || filterStatus !== 'all' 
                ? 'No matching sessions' 
                : 'No sessions found'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {showPendingPastSessions 
                ? 'All your sessions have been marked or are upcoming'
                : searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your filters or search terms'
                : 'No sessions available for this coach.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}