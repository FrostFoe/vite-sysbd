import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { authApi } from "../api";
import type { User } from "../types";
import { showToastMsg } from "../utils";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<boolean>;

  register: (email: string, password: string) => Promise<boolean>;

  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
    }, 5000);

    try {
      const response = await authApi.checkAuth();
      clearTimeout(timer);
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
    password: string,
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
        "error",
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
