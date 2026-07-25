'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthService } from '@/lib/services';
import { getFieldsForLevel, LEVEL_FEEDBACK_CONFIG } from '@/lib/feedbackFields';
import { Enrollment, CreateFeedbackRequest } from '@/lib/types';

export default function FeedbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const enrollmentId = searchParams.get('enrollmentId');
  
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
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
    const commonClasses = "w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200";
    
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading enrollment details...</p>
        </div>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900">Enrollment Not Found</h3>
          <p className="mt-2 text-gray-500">The enrollment you're looking for doesn't exist.</p>
          <button
            onClick={handleBack}
            className="mt-6 px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Back to Batches
          </button>
        </div>
      </div>
    );
  }

  const fields = getFields();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="group mb-6 flex items-center text-gray-600 hover:text-purple-600 transition font-medium"
        >
          <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Batches
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 bg-gradient-to-r from-purple-600 to-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">✏️ Create Feedback</h1>
                <p className="text-purple-100 mt-1 text-sm">
                  For: {enrollment.Student__r?.Name || 'Unknown Student'}
                </p>
              </div>
              <div className="bg-white/20 px-4 py-2 rounded-lg border border-white/30">
                <span className="text-white font-medium text-sm">
                  {selectedLevel || 'Select Level'}
                </span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}

            {/* Student Info */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Student Name</p>
                  <p className="font-medium text-gray-900">{enrollment.Student__r?.Name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Enrollment Status</p>
                  <p className="font-medium text-gray-900">{enrollment.Enrollment_Status__c || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Level Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Level <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => handleLevelChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                required
              >
                <option value="">Select Level</option>
                {availableLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
              {selectedLevel && (
                <p className="mt-2 text-xs text-gray-400">
                  {getFieldsForLevel(selectedLevel).filter(f => f.required).length} required fields for {selectedLevel}
                </p>
              )}
            </div>

            {/* Dynamic Fields */}
            {selectedLevel && fields.length > 0 && (
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    📋 {selectedLevel} Feedback Fields
                  </h3>
                  <span className="text-xs text-gray-400">
                    {fields.filter(f => f.required).length} required fields
                  </span>
                </div>
                <div className="space-y-4">
                  {fields.map((field) => (
                    <div key={field.id}>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {renderField(field)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Feedback Status
              </label>
              <select
                value={feedbackStatus}
                onChange={(e) => setFeedbackStatus(e.target.value as CreateFeedbackRequest['Feedback_Status__c'])}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
              >
                <option value="Draft">📝 Draft</option>
                <option value="Submit for Approval">🚀 Submit for Approval</option>
                <option value="Approved">✅ Approved</option>
                <option value="Rejected">❌ Rejected</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !selectedLevel}
                className={`px-8 py-2.5 rounded-lg text-white font-medium transition-all duration-300 ${
                  submitting || !selectedLevel
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transform hover:scale-105'
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