import { db } from './firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit, doc, updateDoc, increment, deleteDoc } from 'firebase/firestore';
import { Question, UserProfile, SubscriptionType } from './types';

export const saveQuestion = async (user: UserProfile, question: Question) => {
  try {
    // Save to 'questions' collection
    await addDoc(collection(db, 'questions'), {
      ...question,
      isFavorite: false // Default
    });

    // Update user usage
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      dailyUsage: increment(1),
      lastUsageDate: new Date().toISOString().split('T')[0]
    });
  } catch (error) {
    console.error("Error saving question:", error);
    throw error;
  }
};

export const getUserHistory = async (userId: string): Promise<Question[]> => {
  try {
    const q = query(
      collection(db, 'questions'),
      where('userId', '==', userId),
      limit(100)
    );

    const querySnapshot = await getDocs(q);
    const questions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
    
    // Sort client-side
    return questions.sort((a, b) => b.timestamp - a.timestamp);
    
  } catch (error) {
    console.error("Error fetching history:", error);
    return [];
  }
};

// Admin: Get History for ALL users
export const getGlobalHistory = async (): Promise<Question[]> => {
  try {
    // Fetching last 200 questions globally
    const q = query(
      collection(db, 'questions'),
      orderBy('timestamp', 'desc'),
      limit(200)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
  } catch (error) {
    console.error("Error fetching global history:", error);
    return [];
  }
};

export const deleteQuestion = async (questionId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'questions', questionId));
  } catch (error) {
    console.error("Error deleting question:", error);
    throw error;
  }
};

export const toggleQuestionFavorite = async (questionId: string, currentStatus: boolean): Promise<void> => {
  try {
    const qRef = doc(db, 'questions', questionId);
    await updateDoc(qRef, { isFavorite: !currentStatus });
  } catch (error) {
    console.error("Error toggling favorite:", error);
    throw error;
  }
};

export const checkDailyLimit = async (user: UserProfile): Promise<boolean> => {
  // UNLIMITED ACCESS ENABLED
  // Always return true so users never hit a paywall
  return true;
};