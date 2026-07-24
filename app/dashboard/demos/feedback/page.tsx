'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthService } from '@/lib/services';
import { DemoAppointment } from '@/lib/types';
import {
    getGroupedSubLevels,
} from '@/lib/subLevels';

export default function DemoFeedbackPage() {
    return (
        <Suspense fallback={null}>
            <DemoFeedbackPageContent />
        </Suspense>
    );
}

function DemoFeedbackPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const demoId = searchParams.get('demoId');

    const [demo, setDemo] = useState<DemoAppointment | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Form state
    const [status, setStatus] = useState('Demo Done');
    const [subLevel, setSubLevel] = useState('');
    const [remarks, setRemarks] = useState('');
    const [charCount, setCharCount] = useState(0);

    const authService = AuthService.getInstance();
    const groupedSubLevels = getGroupedSubLevels();

    useEffect(() => {
        if (!authService.isAuthenticated()) {
            router.push('/login');
            return;
        }

        if (!demoId) {
            router.push('/dashboard/demos');
            return;
        }

        loadDemoData();
    }, [demoId]);

    const loadDemoData = async () => {
        try {
            setLoading(true);
            if (!demoId) {
                throw new Error('Demo ID is required');
            }

            const demoData = await authService.getDemoById(demoId);

            if (!demoData) {
                throw new Error('Demo not found');
            }

            setDemo(demoData);

            // Pre-fill form with existing data
            setStatus(demoData.Demo_Status__c || 'Demo Done');
            setSubLevel(demoData.Sub_Level__c || '');
            setRemarks(demoData.Remarks__c || '');
            setCharCount(demoData.Remarks__c?.length || 0);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load demo');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setSubmitting(true);
            setError(null);
            setSuccess(null);

            if (!demo) {
                throw new Error('Demo not found');
            }

            const response = await authService.updateDemoFeedback({
                demoId: demo.Id,
                status,
                subLevel: subLevel || undefined,
                remarks: remarks || undefined,
            });

            if (response.success) {
                setSuccess('✨ Demo feedback submitted successfully!');
                setTimeout(() => {
                    router.push('/dashboard/demos');
                }, 2000);
            } else {
                throw new Error(response.message || 'Failed to submit feedback');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to submit feedback');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemarksChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        if (text.length <= 500) {
            setRemarks(text);
            setCharCount(text.length);
        }
    };

    const handleBack = () => {
        router.push('/dashboard/demos');
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-10 h-10 bg-purple-600 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                    <p className="mt-6 text-lg font-medium text-gray-700">Loading demo details...</p>
                    <p className="text-sm text-gray-400">Please wait while we fetch your data</p>
                </div>
            </div>
        );
    }

    if (!demo) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="text-center bg-white rounded-2xl shadow-xl p-12 max-w-md">
                    <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Demo Not Found</h3>
                    <p className="mt-2 text-gray-500">The demo you're looking for doesn't exist or has been removed.</p>
                    <button
                        onClick={handleBack}
                        className="mt-6 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                        Back to Demos
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <button
                    onClick={handleBack}
                    className="group mb-6 flex items-center text-slate-600 hover:text-purple-600 transition-all duration-300 font-medium"
                >
                    <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Demos
                </button>

                {/* Main Card */}
                <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/60 overflow-hidden">
                    {/* Header */}
                    <div className="relative px-8 py-6 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600">
                        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                        <div className="relative flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-white">✏️ Demo Feedback</h1>
                                <p className="text-purple-100 mt-1 text-sm">Provide detailed feedback for the demo session</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
                                <span className="text-white font-medium text-sm">{demo.Name || 'Demo'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Demo Info Card */}
                    <div className="m-6 p-6 bg-gradient-to-br from-slate-50 to-purple-50/50 rounded-2xl border border-slate-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Lead Name</p>
                                <p className="mt-1 font-semibold text-slate-900">{demo.Lead__r?.Name || 'N/A'}</p>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Email</p>
                                <p className="mt-1 font-semibold text-slate-900 truncate">{demo.Lead__r?.Email || 'N/A'}</p>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Demo Date</p>
                                <p className="mt-1 font-semibold text-slate-900">{demo.IST_Demo_Date__c || 'N/A'}</p>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Current Status</p>
                                <span className={`mt-1 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(demo.Demo_Status__c)}`}>
                                    <span className="mr-1">{getStatusIcon(demo.Demo_Status__c)}</span>
                                    {demo.Demo_Status__c || 'Unknown'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 pt-0 space-y-6">
                        {error && (
                            <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl animate-shake">
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

                        {success && (
                            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-xl animate-fade-in">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-emerald-700">{success}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Status Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Demo Status <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full px-5 py-3.5 border-2 border-slate-200 rounded-xl text-sm text-slate-700 bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-purple-300 transition-all duration-200 appearance-none"
                                    required
                                >
                                    <option value="Demo Done">✅ Demo Done</option>
                                    <option value="Coach Assigned">👤 Coach Assigned</option>
                                    <option value="Scheduled">📅 Scheduled</option>
                                    <option value="Cancelled">❌ Cancelled</option>
                                    <option value="No Show">🚫 No Show</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Sub Level - Accordion Style */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-3">
                                Sub Level
                            </label>

                            <div className="space-y-2">
                                {Object.entries(groupedSubLevels).map(([level, levels]) => {
                                    const isExpanded = subLevel && levels.some(sl => sl.value === subLevel);

                                    return (
                                        <div key={level} className="border border-slate-200 rounded-xl overflow-hidden">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const firstSubLevel = levels[0];
                                                    setSubLevel(isExpanded ? '' : firstSubLevel.value);
                                                }}
                                                className={`w-full px-5 py-3 flex items-center justify-between transition-all duration-200 ${isExpanded ? 'bg-gradient-to-r from-purple-50 to-indigo-50' : 'bg-white hover:bg-slate-50'
                                                    }`}
                                            >
                                                <span className={`font-medium ${isExpanded ? 'text-purple-700' : 'text-slate-700'}`}>
                                                    {level}
                                                </span>
                                                <svg className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>

                                            <div className={`px-5 pb-3 mt-4 grid grid-cols-3 gap-2 transition-all duration-200 ${isExpanded ? 'block' : 'hidden'}`}>
                                                {levels.map((sl) => (
                                                    <button
                                                        key={sl.value}
                                                        type="button"
                                                        onClick={() => setSubLevel(sl.value)}
                                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${subLevel === sl.value
                                                                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md'
                                                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                                                            }`}
                                                    >
                                                        {sl.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Remarks */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-semibold text-slate-700">
                                    Remarks
                                </label>
                                <span className={`text-xs font-medium ${charCount > 450 ? 'text-amber-500' : 'text-slate-400'}`}>
                                    {charCount}/500
                                </span>
                            </div>
                            <div className="relative">
                                <textarea
                                    value={remarks}
                                    onChange={handleRemarksChange}
                                    rows={5}
                                    maxLength={500}
                                    placeholder="📝 Enter your feedback, observations, or notes about the demo..."
                                    className="w-full px-5 py-3.5 border-2 border-slate-200 rounded-xl text-sm text-slate-700 bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-purple-300 transition-all duration-200 resize-none"
                                />
                                {charCount > 0 && (
                                    <div className="absolute bottom-3 right-3">
                                        <span className={`text-xs font-medium ${charCount > 450 ? 'text-amber-500' : 'text-slate-400'}`}>
                                            {charCount}/500
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap justify-end gap-4 pt-6 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="px-6 py-2.5 border-2 border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className={`px-8 py-2.5 rounded-xl text-white font-medium transition-all duration-300 shadow-md hover:shadow-lg ${submitting
                                    ? 'bg-slate-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 transform hover:scale-105'
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
                                    '💾 Submit Feedback'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}