import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { UserProfile, UserRole, SubscriptionType } from './types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 🔒 SECURITY: The specific email that gets auto-promoted to Admin
const SUPER_ADMIN_EMAIL = "fffgamer066@gmail.com";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (uid: string, fbUser: FirebaseUser) => {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data() as UserProfile;

        // 🚫 SECURITY CHECK: Block banned users
        if (userData.isActive === false) {
          await signOut(auth);
          alert("Your account has been suspended by the administrator.");
          setUser(null);
          return;
        }

        // 🛡️ ADMIN BOOTSTRAP: If this is the super admin email, force role to ADMIN
        if (userData.email === SUPER_ADMIN_EMAIL && userData.role !== UserRole.ADMIN) {
          await updateDoc(userRef, { role: UserRole.ADMIN });
          userData.role = UserRole.ADMIN;
        }

        setUser({
          ...userData,
          displayName: userData.displayName || 'Student',
          role: userData.role || UserRole.STUDENT
        });
      } else {
        // Create new user profile
        // 🛡️ Auto-assign ADMIN role if email matches
        const initialRole = fbUser.email === SUPER_ADMIN_EMAIL ? UserRole.ADMIN : UserRole.STUDENT;

        const newProfile: UserProfile = {
          uid: fbUser.uid,
          displayName: fbUser.displayName || 'Student',
          email: fbUser.email || '',
          photoURL: fbUser.photoURL || '',
          role: initialRole,
          classLevel: 'Class 9 (Science)', 
          subscriptionType: SubscriptionType.FREE,
          dailyUsage: 0,
          lastUsageDate: new Date().toISOString().split('T')[0],
          createdAt: Date.now(),
          isActive: true // Default active
        };
        await setDoc(userRef, newProfile);
        setUser(newProfile);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        await fetchUserProfile(fbUser.uid, fbUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const refreshUserProfile = async () => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data() as UserProfile;
        setUser({
          ...userData,
          displayName: userData.displayName || 'Student'
        });
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout, refreshUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};