'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/services';
import { Batch, Enrollment } from '@/lib/types';

export default function BatchesPage() {
    const router = useRouter();
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedBatchId, setExpandedBatchId] = useState<string | null>(null);
    const authService = AuthService.getInstance();

    useEffect(() => {
        if (!authService.isAuthenticated()) {
            router.push('/login');
            return;
        }

        const userData = authService.getUserData();
        if (userData && userData.id) {
            fetchBatches(userData.id);
        } else {
            setError('User ID not found');
            setLoading(false);
        }
    }, [router]);

    const fetchBatches = async (coachId: string) => {
        try {
            setLoading(true);
            setError(null);
            const data = await authService.getCoachBatchesWithEnrollments(coachId);
            console.log('Fetched data:', data);
            setBatches(data.batches || []);
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch batches');
        } finally {
            setLoading(false);
        }
    };

    const toggleBatch = (batchId: string) => {
        setExpandedBatchId(expandedBatchId === batchId ? null : batchId);
    };

    const handleCreateFeedback = (enrollment: Enrollment) => {
        router.push(`/dashboard/batches/feedback?enrollmentId=${enrollment.Id}`);
    };

    // ✅ FIX: Updated status color mapping to include all possible statuses
    const getStatusColor = (status: string) => {
        const statusMap: Record<string, string> = {
            'Active Batch': 'bg-green-100 text-green-800 border-green-200',
            'Active': 'bg-green-100 text-green-800 border-green-200',
            'Completed': 'bg-blue-100 text-blue-800 border-blue-200',
            'Scheduled': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'Cancelled': 'bg-red-100 text-red-800 border-red-200',
            'Inactive': 'bg-gray-100 text-gray-800 border-gray-200',
        };
        return statusMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getEnrollmentStatusColor = (status: string) => {
        const statusMap: Record<string, string> = {
            'Active': 'bg-green-100 text-green-800',
            'Completed': 'bg-blue-100 text-blue-800',
            'Upcoming': 'bg-yellow-100 text-yellow-800',
            'Pending': 'bg-yellow-100 text-yellow-800',
            'Dropped': 'bg-red-100 text-red-800',
        };
        return statusMap[status] || 'bg-gray-100 text-gray-800';
    };

    const handleBack = () => {
        router.push('/dashboard');
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
                    <p className="mt-6 text-lg font-medium text-gray-700">Loading batches...</p>
                    <p className="text-sm text-gray-400">Please wait while we fetch your data</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <button
                    onClick={handleBack}
                    className="group mb-8 flex items-center text-slate-600 hover:text-blue-600 transition-all duration-300 font-medium"
                >
                    <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Dashboard
                </button>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-blue-600 bg-clip-text text-transparent">
                                My Batches
                            </h1>
                            <p className="text-slate-500 mt-2 flex items-center">
                                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                                Manage your coaching batches and student enrollments
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 flex items-center">
                                <span className="text-sm text-slate-500">Total Batches:</span>
                                <span className="ml-2 font-semibold text-slate-900">{batches.length}</span>
                            </div>
                            <div className="bg-green-50 px-4 py-2 rounded-xl shadow-sm border border-green-200 flex items-center">
                                <span className="text-sm text-green-600">✅ Active:</span>
                                <span className="ml-2 font-semibold text-green-700">
                                    {batches.filter(b => b.Batch_Status__c === 'Active Batch' || b.Batch_Status__c === 'Active').length}
                                </span>
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

                {/* Batches List */}
                <div className="space-y-4">
                    {batches.map((batch) => {
                        const enrollments = batch.enrollments || [];

                        return (
                            <div
                                key={batch.Id}
                                className="bg-white rounded-2xl shadow-md border border-slate-200/60 overflow-hidden hover:shadow-lg transition-shadow duration-300"
                            >
                                {/* Batch Header */}
                                <div
                                    className="p-6 cursor-pointer hover:bg-slate-50 transition-colors duration-200"
                                    onClick={() => toggleBatch(batch.Id)}
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-xl font-bold text-slate-900">
                                                    {batch.Name || 'Unnamed Batch'}
                                                </h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(batch.Batch_Status__c)}`}>
                                                    {batch.Batch_Status__c || 'Unknown'}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500">
                                                <span className="flex items-center">
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    Start: {batch.Start_Date__c ? new Date(batch.Start_Date__c).toLocaleDateString() : 'N/A'}
                                                </span>
                                                <span className="flex items-center">
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    End: {batch.End_Date__c ? new Date(batch.End_Date__c).toLocaleDateString() : 'N/A'}
                                                </span>
                                                <span className="flex items-center">
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                    {enrollments.length} Students
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-slate-400">
                                                {enrollments.filter(e => e.Enrollment_Status__c === 'Active').length} Active
                                            </span>
                                            <svg className={`w-6 h-6 text-slate-400 transition-transform duration-300 ${expandedBatchId === batch.Id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Enrollments List */}
                                {expandedBatchId === batch.Id && (
                                    <div className="px-6 pb-6 pt-0 border-t border-slate-200">
                                        <div className="mt-4">
                                            <h4 className="text-sm font-semibold text-slate-600 mb-3">Students</h4>
                                            {enrollments.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {enrollments.map((enrollment) => (
                                                        <div
                                                            key={enrollment.Id}
                                                            className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-blue-300 transition-colors duration-200 flex items-center justify-between"
                                                        >
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium text-slate-900 truncate">
                                                                        {enrollment.Student__r?.Name || 'Unknown Student'}
                                                                    </span>
                                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getEnrollmentStatusColor(enrollment.Enrollment_Status__c)}`}>
                                                                        {enrollment.Enrollment_Status__c || 'Unknown'}
                                                                    </span>
                                                                </div>
                                                                {enrollment.Level__c && (
                                                                    <p className="text-xs text-slate-400 mt-1">
                                                                        Level: {enrollment.Level__c}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <button
                                                                onClick={() => handleCreateFeedback(enrollment)}
                                                                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 ml-2 flex-shrink-0"
                                                            >
                                                                ✏️ Create Feedback
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-6 text-slate-500">
                                                    <p>No students enrolled in this batch</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {batches.length === 0 && !error && (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-slate-200">
                        <div className="flex flex-col items-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-blue-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">No Batches Found</h3>
                            <p className="mt-1 text-sm text-slate-500 max-w-sm">
                                No batches are available for this coach at the moment.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}