/**
 * Mock User Context
 * ─────────────────
 * Provides a fake 'Rolando' profile so the UI can render personalised
 * greetings and avatar placeholders without real auth.
 *
 * Also manages the mock-auth session, persisted in localStorage.
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { MOCK_USER_ID } from './constants';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

export interface AuthContext {
  user: UserProfile;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const STORAGE_KEY = 'reaves-mock-auth';

const mockUser: UserProfile = {
  id: MOCK_USER_ID,
  name: 'Rolando',
  email: 'rolando@reaves.dev',
  avatar: null,
};

const defaultCtx: AuthContext = {
  user: mockUser,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
};

const UserContext = createContext<AuthContext>(defaultCtx);

export function UserProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Keep localStorage in sync
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(isAuthenticated));
    } catch { /* noop */ }
  }, [isAuthenticated]);

  function login() {
    setIsAuthenticated(true);
  }

  function logout() {
    setIsAuthenticated(false);
  }

  return (
    <UserContext.Provider value={{ user: mockUser, isAuthenticated, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

/** Convenience hooks */
export function useAuth(): AuthContext {
  return useContext(UserContext);
}

export function useUser(): UserProfile {
  return useContext(UserContext).user;
}
