// page.tsx
'use client';
import { Suspense } from 'react';
import DemoFeedbackPageContent from './feedback-content';

export default function DemoFeedbackPage() {
    return (
        <Suspense fallback={null}>
            <DemoFeedbackPageContent />
        </Suspense>
    );
}