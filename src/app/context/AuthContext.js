"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  onAuthStateChanged,
} from "firebase/auth";

import { auth } from "@/app/lib/firebase";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] =
    useState(true);
  const [authError, setAuthError] =
    useState("");

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        if (!active) return;

        setUser(currentUser);
        setAuthError("");
        setAuthLoading(false);
      },
      (error) => {
        console.error(
          "Authentication state error:",
          error
        );

        if (!active) return;

        setUser(null);
        setAuthError(
          "Your account status could not be verified."
        );
        setAuthLoading(false);
      }
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const refreshUser = useCallback(async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setUser(null);
      return null;
    }

    try {
      await currentUser.reload();

      const refreshedUser = auth.currentUser;

      setUser(refreshedUser);
      setAuthError("");

      return refreshedUser;
    } catch (error) {
      console.error(
        "Unable to refresh user:",
        error
      );

      setAuthError(
        "Your account information could not be refreshed."
      );

      throw error;
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      user,
      authLoading,
      authError,
      refreshUser,
    }),
    [
      user,
      authLoading,
      authError,
      refreshUser,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}