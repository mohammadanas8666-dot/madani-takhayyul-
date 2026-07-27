'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from '@/lib/firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null); // Firebase user
  const [dbUser, setDbUser] = useState(null); // MongoDB synced user (with role)
  const [loading, setLoading] = useState(true);

  // Sync Firebase user to MongoDB
  const syncUserToDb = async (fbUser) => {
    if (!fbUser) {
      setDbUser(null);
      return;
    }

    try {
      const res = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid: fbUser.uid,
          name: fbUser.displayName || fbUser.email.split('@')[0],
          email: fbUser.email,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDbUser(data.user);
      }
    } catch (err) {
      console.error('Failed to sync user with DB:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await syncUserToDb(user);
      } else {
        setDbUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      await syncUserToDb(res.user);
      return res.user;
    } catch (error) {
      console.error("Google sign in error:", error);
      throw error;
    }
  };

  const loginWithEmail = async (email, password) => {
    const res = await signInWithEmailAndPassword(auth, email, password);
    await syncUserToDb(res.user);
    return res.user;
  };

  const signupWithEmail = async (email, password) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    await syncUserToDb(res.user);
    return res.user;
  };

  const logout = async () => {
    await signOut(auth);
    setDbUser(null);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        dbUser,
        loading,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        logout,
        isAdmin: dbUser?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
