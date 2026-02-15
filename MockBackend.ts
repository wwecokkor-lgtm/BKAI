import { User, Question, SolveRequest, SolveResponse, SubscriptionType } from './types';
import { generateHomeworkSolution } from './GeminiService';

// ---------------------------------------------------------
// ⚠️ BACKEND SIMULATION LAYER
// ---------------------------------------------------------

// Mock Database (LocalStorage)
const db = {
  getQuestions: (): Question[] => {
    const data = localStorage.getItem('questions');
    return data ? JSON.parse(data) : [];
  },
  saveQuestion: (q: Question) => {
    const questions = db.getQuestions();
    questions.unshift(q);
    localStorage.setItem('questions', JSON.stringify(questions));
  },
  updateUserUsage: (user: User): User => {
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  }
};

export const solveHomeworkEndpoint = async (request: SolveRequest, currentUser: User): Promise<SolveResponse> => {
  // 1. Backend Validation
  if (!request.userId || !request.question) {
    return { success: false, error: "Invalid request data" };
  }

  // 2. Update Usage Stats (No Limit Enforcement)
  const today = new Date().toISOString().split('T')[0];
  let usage = currentUser.dailyUsage;
  
  if (currentUser.lastUsageDate !== today) {
    usage = 0;
    currentUser.lastUsageDate = today;
  }

  // 3. Call AI Service
  try {
    const answer = await generateHomeworkSolution(request.question, request.image, request.subject);

    // 4. Save to Database
    const newQuestion: Question = {
      id: Date.now().toString(),
      userId: currentUser.uid,
      subject: request.subject,
      classLevel: currentUser.classLevel,
      questionText: request.question,
      questionImage: request.image,
      answer: answer,
      timestamp: Date.now()
    };
    db.saveQuestion(newQuestion);

    // 5. Update User Usage
    currentUser.dailyUsage = usage + 1;
    db.updateUserUsage(currentUser);

    return { 
      success: true, 
      answer: answer, 
      remainingLimit: 9999 
    };

  } catch (error) {
    console.error("Backend Error:", error);
    return { success: false, error: "Failed to process request. Please try again." };
  }
};