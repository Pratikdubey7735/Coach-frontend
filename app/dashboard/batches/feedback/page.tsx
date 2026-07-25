'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthService } from '@/lib/services';
import { getFieldsForLevel, LEVEL_FEEDBACK_CONFIG } from '@/lib/feedbackFields';
import { Enrollment, CreateFeedbackRequest } from '@/lib/types';

export default function CreateFeedbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const enrollmentId = searchParams.get('enrollmentId');
  
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [selectedLevel, setSelectedLevel] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState<CreateFeedbackRequest['Feedback_Status__c']>('Submit for Approval');
  const [dynamicFields, setDynamicFields] = useState<Record<string, any>>({});
  
  const authService = AuthService.getInstance();
  const availableLevels = Object.keys(LEVEL_FEEDBACK_CONFIG);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    if (!enrollmentId) {
      router.push('/dashboard/batches');
      return;
    }

    loadEnrollmentData();
  }, [enrollmentId]);

  const loadEnrollmentData = async () => {
    try {
      setLoading(true);
      const userData = authService.getUserData();
      if (!userData) {
        throw new Error('User data not found');
      }

      const data = await authService.getCoachBatchesWithEnrollments(userData.id);
      const allEnrollments = data.enrollments || [];
      const foundEnrollment = allEnrollments.find((e: Enrollment) => e.Id === enrollmentId);
      
      if (!foundEnrollment) {
        throw new Error('Enrollment not found');
      }

      setEnrollment(foundEnrollment);
      
      // ✅ Don't auto-select level from enrollment
      // User will select it manually
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load enrollment');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setDynamicFields(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleLevelChange = (level: string) => {
    setSelectedLevel(level);
    // ✅ Clear dynamic fields when level changes
    setDynamicFields({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      if (!enrollmentId || !selectedLevel) {
        throw new Error('Please select a level before submitting');
      }

      // ✅ Validate required fields for the selected level
      const fields = getFieldsForLevel(selectedLevel);
      const missingFields = fields.filter(f => f.required && !dynamicFields[f.id]);
      
      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.map(f => f.label).join(', ')}`);
      }

      const feedbackData: CreateFeedbackRequest = {
        Enrollment__c: enrollmentId,
        Level1__c: selectedLevel,
        Feedback_Status__c: feedbackStatus,
        ...dynamicFields,
      };

      console.log('Submitting feedback:', feedbackData);

      const response = await authService.createFeedback(feedbackData);

      if (response.success) {
        setSuccess('✨ Feedback created successfully!');
        setTimeout(() => {
          router.push('/dashboard/batches');
        }, 2000);
      } else {
        throw new Error(response.message || 'Failed to create feedback');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push('/dashboard/batches');
  };

  const getFields = () => {
    return getFieldsForLevel(selectedLevel);
  };

  const renderField = (field: any) => {
    const value = dynamicFields[field.id] || '';
    const commonClasses = "w-full px-5 py-3.5 border-2 border-slate-200 rounded-xl text-sm text-slate-700 bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-purple-300 transition-all duration-200";
    
    switch (field.type) {
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={commonClasses}
            required={field.required}
          >
            <option value="">Select...</option>
            {field.options?.map((option: string) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={commonClasses}
            required={field.required}
            min="0"
            max="100"
          />
        );
      
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className={`${commonClasses} resize-none`}
            required={field.required}
          />
        );
      
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={commonClasses}
            required={field.required}
          />
        );
    }
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
          <p className="mt-6 text-lg font-medium text-gray-700">Loading enrollment details...</p>
          <p className="text-sm text-gray-400">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center bg-white rounded-2xl shadow-xl p-12 max-w-md">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Enrollment Not Found</h3>
          <p className="mt-2 text-gray-500">The enrollment you're looking for doesn't exist.</p>
          <button
            onClick={handleBack}
            className="mt-6 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Back to Batches
          </button>
        </div>
      </div>
    );
  }

  const fields = getFields();

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
          Back to Batches
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/60 overflow-hidden">
          {/* Header */}
          <div className="relative px-8 py-6 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">✏️ Create Feedback</h1>
                <p className="text-purple-100 mt-1 text-sm">
                  For: {enrollment.Student__r?.Name || 'Unknown Student'}
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
                <span className="text-white font-medium text-sm">
                  {selectedLevel || 'Select Level'}
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

            {/* Student Info */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400">Student Name</p>
                  <p className="font-medium text-slate-900">{enrollment.Student__r?.Name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Enrollment Status</p>
                  <p className="font-medium text-slate-900">{enrollment.Enrollment_Status__c || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* ✅ Level Selection - User will select from dropdown */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Select Level <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={selectedLevel}
                  onChange={(e) => handleLevelChange(e.target.value)}
                  className="w-full px-5 py-3.5 border-2 border-slate-200 rounded-xl text-sm text-slate-700 bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-purple-300 transition-all duration-200 appearance-none"
                  required
                >
                  <option value="">Select Level</option>
                  {availableLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {selectedLevel && (
                <p className="mt-2 text-xs text-slate-400">
                  {getFieldsForLevel(selectedLevel).filter(f => f.required).length} required fields for {selectedLevel}
                </p>
              )}
            </div>

            {/* ✅ Dynamic Fields - Based on Selected Level */}
            {selectedLevel && fields.length > 0 && (
              <div className="border-t border-slate-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">
                    📋 {selectedLevel} Feedback Fields
                  </h3>
                  <span className="text-xs text-slate-400">
                    {fields.filter(f => f.required).length} required fields
                  </span>
                </div>
                <div className="space-y-4">
                  {fields.map((field) => (
                    <div key={field.id}>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        {field.label}
                        {field.required && <span className="text-rose-500 ml-1">*</span>}
                      </label>
                      {renderField(field)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback Status */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Feedback Status
              </label>
              <div className="relative">
                <select
                  value={feedbackStatus}
                  onChange={(e) => setFeedbackStatus(e.target.value as CreateFeedbackRequest['Feedback_Status__c'])}
                  className="w-full px-5 py-3.5 border-2 border-slate-200 rounded-xl text-sm text-slate-700 bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-purple-300 transition-all duration-200 appearance-none"
                >
                  <option value="Draft">📝 Draft</option>
                  <option value="Submit for Approval">🚀 Submit for Approval</option>
                  <option value="Approved">✅ Approved</option>
                  <option value="Rejected">❌ Rejected</option>
                </select>
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
                disabled={submitting || !selectedLevel}
                className={`px-8 py-2.5 rounded-xl text-white font-medium transition-all duration-300 shadow-md hover:shadow-lg ${
                  submitting || !selectedLevel
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
                    Creating...
                  </span>
                ) : (
                  '💾 Create Feedback'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}