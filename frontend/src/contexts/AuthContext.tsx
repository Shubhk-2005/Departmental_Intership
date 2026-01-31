import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { api } from "../services/api.service";

export type UserRole = "student" | "alumni" | "admin";

export interface UserData {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  graduationYear?: string;
  rollNumber?: string;
}

interface AuthContextType {
  user: User | null;
  userRole: string | null | undefined; // undefined = loading/unknown, null = no role, string = role
  userData: UserData | null;
  loading: boolean;
  isMaintenanceMode: boolean;
  signup: (email: string, password: string, name: string, role: UserRole, additionalData?: any) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: undefined,
  userData: null,
  loading: true,
  isMaintenanceMode: false,
  signup: async () => {},
  login: async () => {},
  logout: async () => {},
  refreshUserData: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null | undefined>(undefined);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

  // Fetch user data from backend
  const fetchUserData = async (user: User) => {
    try {
      const response = await api.auth.getCurrentUser();
      const data = response.data.user;
      setUserData(data);
      setUserRole(data.role);
    } catch (error) {
      console.error('Failed to fetch user data from backend:', error);
      // Fallback to Firestore if backend fails
      try {
        const userDoc = await getDoc(doc(db, "Users", user.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
        } else {
          setUserRole(null);
        }
      } catch (firestoreError) {
        console.error('Failed to fetch from Firestore:', firestoreError);
        setUserRole(null);
      }
    }
  };

  // Signup function
  const signup = async (
    email: string,
    password: string,
    name: string,
    role: UserRole,
    additionalData?: any
  ) => {
    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      await updateProfile(userCredential.user, { displayName: name });

      // Create user document in backend
      await api.auth.signup({
        email,
        password,
        name,
        role,
        ...additionalData,
      });

      // Fetch full user data
      await fetchUserData(userCredential.user);
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Failed to sign up');
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await fetchUserData(userCredential.user);
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Failed to log in');
    }
  };

  // Refresh user data
  const refreshUserData = async () => {
    if (user) {
      await fetchUserData(user);
    }
  };

  // Maintenance Mode Check (one-time, no real-time listener to avoid CORS issues)
  useEffect(() => {
    const checkMaintenanceMode = async () => {
      try {
        const docRef = doc(db, "system_settings", "general");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setIsMaintenanceMode(docSnap.data().maintenanceMode || false);
        }
      } catch (error) {
        console.error('Error checking maintenance mode:', error);
        // Default to non-maintenance mode on error
        setIsMaintenanceMode(false);
      }
    };
    
    checkMaintenanceMode();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        // Reset role to undefined while fetching to prevent premature redirects
        setUserRole(undefined);
        await fetchUserData(user);
      } else {
        setUserRole(null);
        setUserData(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUserRole(null);
    setUserData(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userRole, 
      userData,
      loading, 
      isMaintenanceMode, 
      signup,
      login,
      logout,
      refreshUserData 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
