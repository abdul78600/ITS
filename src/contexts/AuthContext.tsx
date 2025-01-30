import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, AuthContextType } from '../types';
import { getStoredUser, setStoredUser, getStoredUsers } from '../utils/storage';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = getStoredUser();
    if (savedUser) {
      setUser(savedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Input validation
      if (!email?.trim()) {
        throw new Error('Email is required');
      }
      if (!password?.trim()) {
        throw new Error('Password is required');
      }

      // Get users from storage
      const users = getStoredUsers();
      
      // Find user by email (case insensitive)
      const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      // Validate user and password
      if (!foundUser || password !== 'password123') {
        throw new Error('Invalid email or password');
      }

      if (foundUser.status !== 'active') {
        throw new Error('Account is not active');
      }

      // Create session user object with updated last login
      const sessionUser: User = {
        ...foundUser,
        last_login: new Date().toISOString()
      };

      setUser(sessionUser);
      setStoredUser(sessionUser);

    } catch (error) {
      console.error('Login error:', error);
      throw error instanceof Error ? error : new Error('An unexpected error occurred');
    }
  };

  const logout = () => {
    setUser(null);
    setStoredUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}