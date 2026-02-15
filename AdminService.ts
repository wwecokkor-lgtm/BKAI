import { db } from './firebase';
import { collection, getDocs, doc, updateDoc, query, orderBy, limit, getCountFromServer, where, setDoc, addDoc, getDoc } from 'firebase/firestore';
import { UserProfile, DashboardStats, UserRole, FounderSettings, VideoSuggestion, ExamPrediction } from './types';

// ------------------------------------------
// 🔒 ADMIN ONLY OPERATIONS
// ------------------------------------------

export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const usersColl = collection(db, 'users');
    const questionsColl = collection(db, 'questions');
    
    const usersSnapshot = await getCountFromServer(usersColl);
    const questionsSnapshot = await getCountFromServer(questionsColl);
    
    // Simulate revenue for now
    const activeSubsQuery = query(usersColl, where('subscriptionType', '==', 'PREMIUM'));
    const activeSubsSnapshot = await getCountFromServer(activeSubsQuery);

    return {
      totalUsers: usersSnapshot.data().count,
      totalQuestions: questionsSnapshot.data().count,
      activeSubs: activeSubsSnapshot.data().count,
      revenue: activeSubsSnapshot.data().count * 500 
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return { totalUsers: 0, totalQuestions: 0, activeSubs: 0, revenue: 0 };
  }
};

export const getAllUsers = async (): Promise<UserProfile[]> => {
  try {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(50));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as UserProfile);
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

export const toggleUserStatus = async (uid: string, currentStatus: boolean): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { isActive: !currentStatus });
    return true;
  } catch (error) {
    console.error("Error toggling user status:", error);
    return false;
  }
};

export const updateUserRole = async (uid: string, newRole: UserRole): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { role: newRole });
    return true;
  } catch (error) {
    console.error("Error updating role:", error);
    return false;
  }
};

// --- FOUNDER POPUP SETTINGS ---

export const getFounderSettings = async (): Promise<FounderSettings> => {
  try {
    const docRef = doc(db, 'system', 'founderSettings');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
        const data = snap.data() as FounderSettings;
        return {
            ...data,
            enablePdfDownload: data.enablePdfDownload ?? true // Default true if missing
        };
    }
    return {
      name: "Founder Name",
      imageUrl: "",
      message: "Welcome to BK Academy!",
      isActive: true,
      slides: [],
      enablePdfDownload: true
    };
  } catch (error) {
    console.error("Error fetching founder settings:", error);
    return { name: "Founder", imageUrl: "", message: "", isActive: false, slides: [], enablePdfDownload: true };
  }
};

export const updateFounderSettings = async (settings: FounderSettings): Promise<void> => {
  await setDoc(doc(db, 'system', 'founderSettings'), settings);
};

// --- VIDEO SUGGESTIONS ---

export const addVideoSuggestion = async (video: Omit<VideoSuggestion, 'id'>) => {
  await addDoc(collection(db, 'videoSuggestions'), video);
};

export const getVideoSuggestions = async (): Promise<VideoSuggestion[]> => {
  const q = query(collection(db, 'videoSuggestions'), limit(20));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as VideoSuggestion));
};

// --- EXAM PREDICTIONS ---

export const addExamPrediction = async (prediction: Omit<ExamPrediction, 'id'>) => {
  await addDoc(collection(db, 'examPredictions'), prediction);
};

export const getExamPredictions = async (classLevel?: string): Promise<ExamPrediction[]> => {
  let q = query(collection(db, 'examPredictions'), orderBy('probability', 'desc'), limit(10));
  if (classLevel) {
    q = query(collection(db, 'examPredictions'), where('classLevel', '==', classLevel), orderBy('probability', 'desc'), limit(10));
  }
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as ExamPrediction));
};