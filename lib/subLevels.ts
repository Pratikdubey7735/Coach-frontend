// lib/subLevels.ts

export interface SubLevel {
  value: string;
  label: string;
  level: 'Beginner' | 'Advanced Beginner' | 'Intermediate' | 'Advanced Part 1' | 'Advanced Part 2';
  icon?: string;
}

export const SUB_LEVELS: SubLevel[] = [
  // ============ BEGINNER LEVELS ============
  { 
    value: 'Beginner Sub level 1', 
    label: 'Sub level 1', 
    level: 'Beginner'
  },
  { 
    value: 'Beginner Sub level 2', 
    label: 'Sub level 2', 
    level: 'Beginner'
  },
  { 
    value: 'Beginner Sub level 3', 
    label: 'Sub level 3', 
    level: 'Beginner'
  },

  // ============ ADVANCED BEGINNER LEVELS ============
  { 
    value: 'Advanced Beginner Sub level 1', 
    label: 'Sub level 1', 
    level: 'Advanced Beginner'
  },
  { 
    value: 'Advanced Beginner Sub level 2', 
    label: 'Sub level 2', 
    level: 'Advanced Beginner'
  },
  { 
    value: 'Advanced Beginner Sub level 3', 
    label: 'Sub level 3', 
    level: 'Advanced Beginner'
  },

  // ============ INTERMEDIATE LEVELS ============
  { 
    value: 'Intermediate Sub level 1', 
    label: 'Sub level 1', 
    level: 'Intermediate'
  },
  { 
    value: 'Intermediate Sub level 2', 
    label: 'Sub level 2', 
    level: 'Intermediate'
  },
  { 
    value: 'Intermediate Sub level 3', 
    label: 'Sub level 3', 
    level: 'Intermediate'
  },

  // ============ ADVANCED PART 1 LEVELS ============
  { 
    value: 'Advanced Part 1 Sub level 1', 
    label: 'Sub level 1', 
    level: 'Advanced Part 1'
  },
  { 
    value: 'Advanced Part 1 Sub level 2', 
    label: 'Sub level 2', 
    level: 'Advanced Part 1'
  },
  { 
    value: 'Advanced Part 1 Sub level 3', 
    label: 'Sub level 3', 
    level: 'Advanced Part 1'
  },

  // ============ ADVANCED PART 2 LEVELS ============
  { 
    value: 'Advanced Part 2 Sub level 1', 
    label: 'Sub level 1', 
    level: 'Advanced Part 2'
  },
  { 
    value: 'Advanced Part 2 Sub level 2', 
    label: 'Sub level 2', 
    level: 'Advanced Part 2'
  },
  { 
    value: 'Advanced Part 2 Sub level 3', 
    label: 'Sub level 3', 
    level: 'Advanced Part 2'
  },
];

// Helper function to get all sub levels
export const getAllSubLevels = (): SubLevel[] => {
  return SUB_LEVELS;
};

// Helper function to get sub levels by level
export const getSubLevelsByLevel = (level: string): SubLevel[] => {
  return SUB_LEVELS.filter(sl => sl.level === level);
};

// Helper function to get grouped sub levels
export const getGroupedSubLevels = (): Record<string, SubLevel[]> => {
  const groups: Record<string, SubLevel[]> = {};
  SUB_LEVELS.forEach(sl => {
    if (!groups[sl.level]) {
      groups[sl.level] = [];
    }
    groups[sl.level].push(sl);
  });
  return groups;
};

// Helper function to get level label (without icon)
export const getLevelLabel = (level: string): string => {
  return level;
};