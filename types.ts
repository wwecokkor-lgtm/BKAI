export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN'
}

export enum SubscriptionType {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM'
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: UserRole;
  classLevel: string; // e.g., "Class 10"
  subscriptionType: SubscriptionType;
  dailyUsage: number;
  lastUsageDate: string;
  createdAt: number;
  isActive: boolean; // For banning users
  phoneNumber?: string;
}

// Alias for MockBackend compatibility
export type User = UserProfile;

export interface SolveRequest {
  userId: string;
  question: string;
  image?: string;
  subject: string;
  classLevel?: string;
}

export interface SolveResponse {
  success: boolean;
  error?: string;
  answer?: string;
  remainingLimit?: number;
}

export interface Question {
  id: string;
  userId: string;
  subject: string;
  classLevel: string;
  questionText: string;
  questionImage?: string;
  answer: string;
  timestamp: number;
  isFavorite?: boolean; // New field for premium history
}

export interface DashboardStats {
  totalUsers: number;
  totalQuestions: number;
  activeSubs: number;
  revenue: number;
}

export interface FounderSlide {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
}

export interface FounderSettings {
  name: string;
  imageUrl: string;
  message: string;
  isActive: boolean;
  slides: FounderSlide[];
  enablePdfDownload?: boolean; // New setting
}

export interface VideoSuggestion {
  id: string;
  title: string;
  thumbnailUrl: string;
  youtubeUrl: string;
  subject: string;
  classLevel: string; // "All" or specific
  duration: string;
}

export interface ExamPrediction {
  id: string;
  subject: string;
  topic: string;
  probability: number; // 0-100
  importance: 'High' | 'Medium' | 'Low';
  classLevel: string;
}

export const CLASSES = [
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 
  'Class 9 (Science)', 'Class 9 (Arts)', 'Class 9 (Commerce)',
  'Class 10', 
  'HSC 1st Year', 'HSC 2nd Year'
];

export const SUBJECTS_NCTB = [
  'Bangla',
  'English',
  'Mathematics',
  'Higher Math',
  'Physics',
  'Chemistry',
  'Biology',
  'ICT',
  'General Science',
  'Accounting',
  'Finance',
  'Economics',
  'Bangladesh & Global Studies',
  'Religion'
];