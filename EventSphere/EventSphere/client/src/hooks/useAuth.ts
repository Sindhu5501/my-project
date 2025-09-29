import React, { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { User } from "@shared/schema";
import { useAuthStore } from "@/lib/store";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, setUser, isLoading, setLoading } = useAuthStore();

  // Check for existing session
  const { isLoading: sessionLoading } = useQuery({
    queryKey: ["/api/auth/session"],
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: false
  });

  // Handle session data changes
  useEffect(() => {
    if (sessionLoading === false) {
      try {
        const data = queryClient.getQueryData(["/api/auth/session"]);
        if (data) {
          setUser(data as User);
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      }
      setLoading(false);
    }
  }, [sessionLoading, setUser, setLoading]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      return apiRequest("POST", "/api/auth/login", credentials);
    },
    onSuccess: async (response) => {
      const userData = await response.json();
      setUser(userData);
      toast({
        title: "Welcome back!",
        description: `You are now logged in as ${userData.firstName} ${userData.lastName}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/session"] });
      navigate("/dashboard");
    },
    onError: (error) => {
      toast({
        title: "Login failed",
        description: (error as Error).message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/auth/logout", {});
    },
    onSuccess: () => {
      setUser(null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/session"] });
      navigate("/");
    },
    onError: (error) => {
      toast({
        title: "Logout failed",
        description: (error as Error).message || "An error occurred during logout.",
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: any) => {
      return apiRequest("POST", "/api/users", userData);
    },
    onSuccess: async (response) => {
      const userData = await response.json();
      toast({
        title: "Registration successful!",
        description: "Your account has been created. You can now log in.",
      });
      navigate("/login");
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: (error as Error).message || "Please check your information and try again.",
        variant: "destructive",
      });
    },
  });

  const login = async (username: string, password: string) => {
    await loginMutation.mutateAsync({ username, password });
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const register = async (userData: any) => {
    await registerMutation.mutateAsync(userData);
  };

  useEffect(() => {
    // When the component mounts, we are loading
    setLoading(true);
  }, []);

  const value = {
    user,
    isLoading: isLoading || sessionLoading,
    login,
    logout,
    register,
    isAuthenticated: !!user
  };

  return React.createElement(AuthContext.Provider, { value }, children);
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
