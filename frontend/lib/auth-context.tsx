"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { loginUser } from "./api";

export type UserRole = "admin" | "officer";

export interface AuthUser {
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  status?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const STORAGE_KEY = "privacyshield_auth_user";

function getStoredUser() {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as AuthUser) : null;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());

  const login = async (email: string, password: string) => {
    try {
      const result = await loginUser(email, password);

      if (!result.success || !result.user) {
        return { success: false, error: result.message || "Authentication failed" };
      }

      setUser(result.user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result.user));
      return { success: true };
    } catch (error: unknown) {
      const message =
        error && typeof error === "object" && "response" in error
          ? "Invalid credentials"
          : "Authentication service is unavailable";
      return { success: false, error: message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: Boolean(user), login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
