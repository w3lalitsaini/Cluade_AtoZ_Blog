"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/me");
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("[AuthContext] Failed to fetch user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync with next-auth session changes
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // If we have a session, update our local user state
      setUser({
        id: (session.user as any).id,
        name: session.user.name || null,
        email: session.user.email || null,
        image: session.user.image || null,
        role: (session.user as any).role || "user",
      });
      setLoading(false);
    } else if (status === "unauthenticated") {
      setUser(null);
      setLoading(false);
    } else if (status === "loading") {
      setLoading(true);
    }
  }, [session, status]);

  // Initial load from /api/me (additional fallback)
  useEffect(() => {
    if (status !== "loading") {
      fetchUser();
    }
  }, [fetchUser, status]);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser: fetchUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
