/**
 * Authentication Context
 * Manages user authentication state across the application
 *
 * @provides User login, registration, logout functionality
 * @provides User authentication state and loading states
 * @example
 * const { user, isAuthenticated, login } = useAuth();
 */

import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { authApi } from "../lib/api";
import { showToastMsg } from "../lib/utils";
import type { User } from "../types";

/**
 * Authentication context type definition
 */
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** Login user with email and password */
  login: (email: string, password: string) => Promise<boolean>;
  /** Register new user */
  register: (email: string, password: string) => Promise<boolean>;
  /** Logout current user */
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Provider Component
 * Wraps app with authentication context
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAuth = useCallback(async () => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setUser(null);
      setIsAuthenticated(false);
      console.warn("Auth check timed out. Defaulting to unauthenticated.");
    }, 5000); // 5 second timeout

    try {
      const response = await authApi.checkAuth();
      clearTimeout(timer); // Clear timeout if API responds in time
      if (response.authenticated && response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      clearTimeout(timer);
      console.error("Failed to check authentication:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      if (isLoading) {
        // Only set if it hasn't been set by the timer
        setIsLoading(false);
      }
    }
  }, [isLoading]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await authApi.login(email, password);
      if (response.success && response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        return true;
      } else {
        showToastMsg(response.message || "Login failed", "error");
        return false;
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showToastMsg(err.response?.data?.message || "Login failed", "error");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await authApi.register(email, password);
      if (response.success && response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        return true;
      } else {
        showToastMsg(response.message || "Registration failed", "error");
        return false;
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showToastMsg(
        err.response?.data?.message || "Registration failed",
        "error"
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth Hook
 * Access authentication state and methods
 *
 * @throws Error if used outside AuthProvider
 * @returns {AuthContextType} Authentication context
 *
 * @example
 * const { user, login, isLoading } = useAuth();
 *
 * const handleLogin = async () => {
 *   const success = await login('user@example.com', 'password');
 *   if (success) {
 *     navigate('/dashboard');
 *   }
 * };
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
