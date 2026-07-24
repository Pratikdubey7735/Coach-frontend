'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/services';
import { DemoAppointment } from '@/lib/types';

export default function DemosPage() {
    const router = useRouter();
    const [demos, setDemos] = useState<DemoAppointment[]>([]);
    const [filteredDemos, setFilteredDemos] = useState<DemoAppointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [updating, setUpdating] = useState<string | null>(null);
    const authService = AuthService.getInstance();

    useEffect(() => {
        if (!authService.isAuthenticated()) {
            router.push('/login');
            return;
        }

        const userData = authService.getUserData();
        if (userData && userData.id) {
            fetchDemos(userData.id);
        } else {
            setError('User ID not found');
            setLoading(false);
        }
    }, [router]);

    const fetchDemos = async (coachId: string) => {
        try {
            setLoading(true);
            setError(null);
            const data = await authService.getCoachDemos(coachId);
            console.log('Fetched demos:', data);
            setDemos(data);
            setFilteredDemos(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch demos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let filtered = [...demos];

        if (filterStatus !== 'all') {
            filtered = filtered.filter(demo => {
                const status = demo.Demo_Status__c?.toLowerCase() || '';
                const filter = filterStatus.toLowerCase();
                return status === filter;
            });
        }

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(demo => {
                const name = demo.Lead__r?.Name?.toLowerCase() || '';
                const email = demo.Lead__r?.Email?.toLowerCase() || '';
                const demoName = demo.Name?.toLowerCase() || '';
                return name.includes(term) || email.includes(term) || demoName.includes(term);
            });
        }

        setFilteredDemos(filtered);
    }, [searchTerm, filterStatus, demos]);

    const handleUpdateStatus = async (demoId: string, newStatus: string) => {
        try {
            setUpdating(demoId);
            await authService.updateDemoStatus({
                demoId,
                status: newStatus
            });

            setDemos(prev =>
                prev.map(demo =>
                    demo.Id === demoId ? { ...demo, Demo_Status__c: newStatus as any } : demo
                )
            );
        } catch (err) {
            console.error('Failed to update status:', err);
            alert('Failed to update demo status. Please try again.');
        } finally {
            setUpdating(null);
        }
    };

    const handleFeedbackClick = (demoId: string) => {
        router.push(`/dashboard/demos/feedback?demoId=${demoId}`);
    };

    const handleBack = () => {
        router.push('/dashboard');
    };

    const getStatusColor = (status: string) => {
        const statusMap: Record<string, string> = {
            'Demo Done': 'bg-emerald-100 text-emerald-800 border-emerald-200',
            'Coach Assigned': 'bg-blue-100 text-blue-800 border-blue-200',
            'Scheduled': 'bg-amber-100 text-amber-800 border-amber-200',
            'Cancelled': 'bg-rose-100 text-rose-800 border-rose-200',
            'No Show': 'bg-slate-100 text-slate-800 border-slate-200',
        };
        return statusMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getStatusIcon = (status: string) => {
        const iconMap: Record<string, string> = {
            'Demo Done': '✅',
            'Coach Assigned': '👤',
            'Scheduled': '📅',
            'Cancelled': '❌',
            'No Show': '🚫',
        };
        return iconMap[status] || '📋';
    };

    const getStatusDot = (status: string) => {
        const statusMap: Record<string, string> = {
            'Demo Done': 'bg-emerald-500',
            'Coach Assigned': 'bg-blue-500',
            'Scheduled': 'bg-amber-500',
            'Cancelled': 'bg-rose-500',
            'No Show': 'bg-slate-500',
        };
        return statusMap[status] || 'bg-gray-500';
    };

    // ✅ FIXED: Return ALL statuses, not filtered
    const getStatusOptions = () => {
        return ['Demo Done', 'Coach Assigned', 'Scheduled', 'Cancelled', 'No Show'];
    };

    const getStatusCount = (status: string) => {
        return demos.filter(d => d.Demo_Status__c === status).length;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-10 h-10 bg-blue-600 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                    <p className="mt-6 text-lg font-medium text-gray-700">Loading your demos...</p>
                    <p className="text-sm text-gray-400">Please wait while we fetch your data</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Enhanced Back Button */}
                <button
                    onClick={handleBack}
                    className="group mb-8 flex items-center text-slate-600 hover:text-blue-600 transition-all duration-300 font-medium"
                >
                    <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Dashboard
                </button>

                {/* Header with Stats */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-blue-600 bg-clip-text text-transparent">
                                My Demos
                            </h1>
                            <p className="text-slate-500 mt-2 flex items-center">
                                <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                                Track and manage your coaching demos
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 flex items-center">
                                <span className="text-sm text-slate-500">Total:</span>
                                <span className="ml-2 font-semibold text-slate-900">{demos.length}</span>
                            </div>
                            <div className="bg-emerald-50 px-4 py-2 rounded-xl shadow-sm border border-emerald-200 flex items-center">
                                <span className="text-sm text-emerald-600">✅ Done:</span>
                                <span className="ml-2 font-semibold text-emerald-700">{getStatusCount('Demo Done')}</span>
                            </div>
                            <div className="bg-amber-50 px-4 py-2 rounded-xl shadow-sm border border-amber-200 flex items-center">
                                <span className="text-sm text-amber-600">📅 Scheduled:</span>
                                <span className="ml-2 font-semibold text-amber-700">{getStatusCount('Scheduled')}</span>
                            </div>
                            <div className="bg-blue-50 px-4 py-2 rounded-xl shadow-sm border border-blue-200 flex items-center">
                                <span className="text-sm text-blue-600">👤 Assigned:</span>
                                <span className="ml-2 font-semibold text-blue-700">{getStatusCount('Coach Assigned')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl mb-6 shadow-sm">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-rose-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Enhanced Filters */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 p-5 mb-8">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-semibold text-slate-700">Filter:</span>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 transition-all duration-200"
                                style={{ minWidth: '160px' }}
                            >
                                <option value="all">📋 All Demos</option>
                                <option value="demo done">✅ Demo Done</option>
                                <option value="coach assigned">👤 Coach Assigned</option>
                                <option value="scheduled">📅 Scheduled</option>
                                <option value="cancelled">❌ Cancelled</option>
                                <option value="no show">🚫 No Show</option>
                            </select>
                        </div>

                        <div className="flex-1 min-w-[250px]">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="🔍 Search by lead name, email, or demo..."
                                    className="w-full px-4 py-2.5 pl-11 border-2 border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 transition-all duration-200"
                                />
                                <svg className="absolute left-3 top-3 h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        {(searchTerm || filterStatus !== 'all') && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterStatus('all');
                                }}
                                className="px-4 py-2.5 text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all duration-200"
                            >
                                ✕ Clear All
                            </button>
                        )}
                    </div>

                    {/* Active Filters Display */}
                    {(searchTerm || filterStatus !== 'all') && (
                        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-200">
                            {filterStatus !== 'all' && (
                                <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                                    <span className="mr-1">{getStatusIcon(filterStatus)}</span>
                                    {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                                    <button
                                        onClick={() => setFilterStatus('all')}
                                        className="ml-2 text-blue-500 hover:text-blue-700 hover:bg-blue-200 rounded-full p-0.5 transition"
                                    >
                                        ×
                                    </button>
                                </span>
                            )}
                            {searchTerm && (
                                <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                                    🔍 "{searchTerm}"
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="ml-2 text-purple-500 hover:text-purple-700 hover:bg-purple-200 rounded-full p-0.5 transition"
                                    >
                                        ×
                                    </button>
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Demos Grid - Enhanced Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredDemos.map((demo, index) => (
                        <div
                            key={demo.Id}
                            className="group bg-white rounded-2xl shadow-md hover:shadow-2xl border border-slate-200/60 hover:border-blue-200 transition-all duration-500 overflow-hidden animate-fade-in-up"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="p-6">
                                {/* Header with Status */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-300 truncate">
                                            {demo.Lead__r?.Name || 'Unknown Lead'}
                                        </h3>
                                        <div className="flex items-center mt-2 space-x-2">
                                            <span className={`w-2.5 h-2.5 rounded-full ${getStatusDot(demo.Demo_Status__c)} animate-pulse`}></span>
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(demo.Demo_Status__c)}`}>
                                                <span className="mr-1">{getStatusIcon(demo.Demo_Status__c)}</span>
                                                {demo.Demo_Status__c || 'Unknown'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Demo Name */}
                                <div className="mb-4">
                                    <p className="text-sm text-slate-600 font-medium">{demo.Name || 'No demo name'}</p>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="bg-slate-50 rounded-xl p-2.5">
                                        <p className="text-xs text-slate-400">Email</p>
                                        <p className="text-sm font-medium text-slate-700 truncate">{demo.Lead__r?.Email || 'N/A'}</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-2.5">
                                        <p className="text-xs text-slate-400">Date</p>
                                        <p className="text-sm font-medium text-slate-700">{demo.IST_Demo_Date__c || 'N/A'}</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-2.5">
                                        <p className="text-xs text-slate-400">Time</p>
                                        <p className="text-sm font-medium text-slate-700">
                                            {demo.IST_Start_Time__c ? demo.IST_Start_Time__c.substring(0, 5) : 'N/A'} -
                                            {demo.IST_End_Time__c ? demo.IST_End_Time__c.substring(0, 5) : 'N/A'}
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-2.5">
                                        <p className="text-xs text-slate-400">Region</p>
                                        <p className="text-sm font-medium text-slate-700">{demo.Region__c || 'N/A'}</p>
                                    </div>
                                </div>

                                {/* Sub Level if exists */}
                                {demo.Sub_Level__c && (
                                    <div className="mb-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-2.5 border border-purple-100">
                                        <p className="text-xs text-purple-500">Sub Level</p>
                                        <p className="text-sm font-medium text-purple-700">{demo.Sub_Level__c}</p>
                                    </div>
                                )}

                                {/* Remarks if exists */}
                                {demo.Remarks__c && (
                                    <div className="mb-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-2.5 border border-amber-100">
                                        <p className="text-xs text-amber-500">Remarks</p>
                                        <p className="text-sm font-medium text-amber-700 line-clamp-2">{demo.Remarks__c}</p>
                                    </div>
                                )}

                                {/* Actions - ✅ CLEAN DROPDOWN (No Background Colors) */}
                                <div className="mt-4 pt-4 border-t border-slate-200">
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={demo.Demo_Status__c || 'Coach Assigned'}
                                            onChange={(e) => handleUpdateStatus(demo.Id, e.target.value)}
                                            disabled={updating === demo.Id}
                                            className={`flex-1 px-3 py-2 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 transition-all duration-200 ${updating === demo.Id ? 'opacity-50 cursor-not-allowed' : ''
                                                }`}
                                        >
                                            {getStatusOptions().map((status) => (
                                                <option key={status} value={status} className="text-slate-700 bg-white">
                                                    {getStatusIcon(status)} {status}
                                                </option>
                                            ))}
                                        </select>

                                        <button
                                            onClick={() => handleFeedbackClick(demo.Id)}
                                            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                                        >
                                            ✏️ Feedback
                                        </button>
                                    </div>
                                    {updating === demo.Id && (
                                        <p className="text-xs text-blue-500 mt-2 animate-pulse">Updating status...</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredDemos.length === 0 && !error && (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-slate-200">
                        <div className="flex flex-col items-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-blue-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">
                                {searchTerm || filterStatus !== 'all' ? 'No matching demos' : 'No demos found'}
                            </h3>
                            <p className="mt-1 text-sm text-slate-500 max-w-sm">
                                {searchTerm || filterStatus !== 'all'
                                    ? 'Try adjusting your filters or search terms to find what you\'re looking for.'
                                    : 'No demo appointments are available for this coach at the moment.'}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}