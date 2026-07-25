// lib/feedbackFields.ts

export interface FeedbackField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'rating';
  placeholder?: string;
  required: boolean;
  options?: string[];
  defaultValue?: any;
}

export interface LevelConfig {
  level: string;
  fields: FeedbackField[];
}

export const LEVEL_FEEDBACK_CONFIG: Record<string, LevelConfig> = {
  'Beginner': {
    level: 'Beginner',
    fields: [
      { id: 'General_Feedback1__c', label: 'General Feedback', type: 'textarea', placeholder: 'Provide general feedback...', required: true },
      { id: 'Assessment_Score1__c', label: 'Assessment Score', type: 'number', placeholder: 'Enter score (0-100)', required: true },
      { id: 'Eligibility_for_next_course__c', label: 'Eligibility for Next Course', type: 'select', options: ['Yes', 'No', 'On Hold'], required: true },
      { id: 'Class_participation__c', label: 'Class Participation', type: 'select', options: ['Excellent', 'Good', 'Average', 'Needs Improvement'], required: true },
      { id: 'RecommendationB__c', label: 'Recommendation', type: 'textarea', placeholder: 'Provide recommendations...', required: true },
      { id: 'Areas_of_improvementB__c', label: 'Areas of Improvement', type: 'textarea', placeholder: 'List areas for improvement...', required: true },
    ]
  },
  'Advanced Beginner': {
    level: 'Advanced Beginner',
    fields: [
      { id: 'Understanding_of_Tactics__c', label: 'Understanding of Tactics', type: 'select', options: ['Excellent', 'Good', 'Average', 'Needs Improvement'], required: true },
      { id: 'Understanding_of_checkmate_patterns__c', label: 'Understanding of Checkmate Patterns', type: 'select', options: ['Excellent', 'Good', 'Average', 'Needs Improvement'], required: true },
      { id: 'Class_participation1__c', label: 'Class Participation', type: 'select', options: ['Excellent', 'Good', 'Average', 'Needs Improvement'], required: true },
      { id: 'General_Feedback2__c', label: 'General Feedback', type: 'textarea', placeholder: 'Provide general feedback...', required: true },
      { id: 'Assessment_Score2__c', label: 'Assessment Score', type: 'number', placeholder: 'Enter score (0-100)', required: true },
      { id: 'Eligibility_for_next_course1__c', label: 'Eligibility for Next Course', type: 'select', options: ['Yes', 'No', 'On Hold'], required: true },
      { id: 'Recommendation2__c', label: 'Recommendation', type: 'textarea', placeholder: 'Provide recommendations...', required: true },
      { id: 'Areas_of_improvementAB__c', label: 'Areas of Improvement', type: 'textarea', placeholder: 'List areas for improvement...', required: true },
    ]
  },
  'Intermediate': {
    level: 'Intermediate',
    fields: [
      { id: 'General_Feedback3__c', label: 'General Feedback', type: 'textarea', placeholder: 'Provide general feedback...', required: true },
      { id: 'Assessment_Score3__c', label: 'Assessment Score', type: 'number', placeholder: 'Enter score (0-100)', required: true },
      { id: 'Eligibility_for_next_course2__c', label: 'Eligibility for Next Course', type: 'select', options: ['Yes', 'No', 'On Hold'], required: true },
      { id: 'Class_participationInt__c', label: 'Class Participation', type: 'select', options: ['Excellent', 'Good', 'Average', 'Needs Improvement'], required: true },
      { id: 'RecommendationInt__c', label: 'Recommendation', type: 'textarea', placeholder: 'Provide recommendations...', required: true },
      { id: 'Areas_of_Improvement3__c', label: 'Areas of Improvement', type: 'textarea', placeholder: 'List areas for improvement...', required: true },
      { id: 'Implementation_of_Basic_TacticsInt__c', label: 'Implementation of Basic Tactics', type: 'select', options: ['Excellent', 'Good', 'Average', 'Needs Improvement'], required: true },
      { id: 'Technical_Strengths2__c', label: 'Technical Strengths', type: 'textarea', placeholder: 'List technical strengths...', required: true },
    ]
  },
  'Advanced Part 1': {
    level: 'Advanced Part 1',
    fields: [
      { id: 'General_Feedback4__c', label: 'General Feedback', type: 'textarea', placeholder: 'Provide general feedback...', required: true },
      { id: 'Assessment_Score4__c', label: 'Assessment Score', type: 'number', placeholder: 'Enter score (0-100)', required: true },
      { id: 'Eligibility_for_next_course3__c', label: 'Eligibility for Next Course', type: 'select', options: ['Yes', 'No', 'On Hold'], required: true },
      { id: 'Class_participationAd1__c', label: 'Class Participation', type: 'select', options: ['Excellent', 'Good', 'Average', 'Needs Improvement'], required: true },
      { id: 'Recommendation__c', label: 'Recommendation', type: 'textarea', placeholder: 'Provide recommendations...', required: true },
      { id: 'Areas_of_ImprovementAd1__c', label: 'Areas of Improvement', type: 'textarea', placeholder: 'List areas for improvement...', required: true },
      { id: 'Understanding_of_advanced_tactics__c', label: 'Understanding of Advanced Tactics', type: 'select', options: ['Excellent', 'Good', 'Average', 'Needs Improvement'], required: true },
    ]
  },
  'Advanced Part 2': {
    level: 'Advanced Part 2',
    fields: [
      { id: 'General_Feedback5__c', label: 'General Feedback', type: 'textarea', placeholder: 'Provide general feedback...', required: true },
      { id: 'Assessment_Score7__c', label: 'Assessment Score', type: 'number', placeholder: 'Enter score (0-100)', required: true },
      { id: 'Eligibility_for_next_course4__c', label: 'Eligibility for Next Course', type: 'select', options: ['Yes', 'No', 'On Hold'], required: true },
      { id: 'Class_participationAd2__c', label: 'Class Participation', type: 'select', options: ['Excellent', 'Good', 'Average', 'Needs Improvement'], required: true },
      { id: 'RecommendationAd2__c', label: 'Recommendation', type: 'textarea', placeholder: 'Provide recommendations...', required: true },
      { id: 'Areas_of_improvement2__c', label: 'Areas of Improvement', type: 'textarea', placeholder: 'List areas for improvement...', required: true },
      { id: 'Implementation_of_Advanced_TacticsAd2__c', label: 'Implementation of Advanced Tactics', type: 'select', options: ['Excellent', 'Good', 'Average', 'Needs Improvement'], required: true },
      { id: 'Understanding_of_mating_patterns__c', label: 'Understanding of Mating Patterns', type: 'select', options: ['Excellent', 'Good', 'Average', 'Needs Improvement'], required: true },
      { id: 'Understanding_of_instructive_games__c', label: 'Understanding of Instructive Games', type: 'select', options: ['Excellent', 'Good', 'Average', 'Needs Improvement'], required: true },
      { id: 'Potential_of_the_child2__c', label: 'Potential of the Child', type: 'select', options: ['High', 'Medium', 'Low'], required: true },
      { id: 'Technical_Strengths__c', label: 'Technical Strengths', type: 'textarea', placeholder: 'List technical strengths...', required: true },
    ]
  },
};

// Helper function to get fields for a level
export const getFieldsForLevel = (level: string): FeedbackField[] => {
  return LEVEL_FEEDBACK_CONFIG[level]?.fields || [];
};

// Helper function to check if a level exists
export const levelExists = (level: string): boolean => {
  return !!LEVEL_FEEDBACK_CONFIG[level];
};

// Get all available levels
export const getAvailableLevels = (): string[] => {
  return Object.keys(LEVEL_FEEDBACK_CONFIG);
};