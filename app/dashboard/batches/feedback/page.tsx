import { Suspense } from 'react';
import FeedbackContent from './FeedbackContent';

export default function CreateFeedbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading feedback form...</p>
        </div>
      </div>
    }>
      <FeedbackContent />
    </Suspense>
  );
}