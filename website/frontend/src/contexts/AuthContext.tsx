import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

const API_URL = import.meta.env.VITE_API_URL;

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setUser({
        id: '1',
        name: 'Rayyyyyyy',
        email: 'Rayyyyyyy@bibibobo.com',
        role: 'admin',
        department: '健生中醫診所',
        phone: '0800092000',
        createdAt: new Date('2024-01-15'),
      });
    }
    setIsLoading(false);
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        // 👇 這裡把後端的 detail 填進 error
        return { success: false, error: data.detail || '登入失敗' };
      }

      if (data.token) {
        localStorage.setItem('authToken', data.token);
        const meRes = await fetch(`${API_URL}/me`, {
          headers: { Authorization: `Bearer ${data.token}` }
        });
        const meData = await meRes.json();
        setUser(meData);
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: '網路錯誤或伺服器無回應' };
    } finally {
      setIsLoading(false);
    }
  };


  const register = async (
    email: string,
    password: string,
    name: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.detail || '註冊失敗' };
      }

      if (data.token) {
        localStorage.setItem('authToken', data.token);
        const meRes = await fetch(`${API_URL}/me`, {
          headers: { Authorization: `Bearer ${data.token}` }
        });
        const meData = await meRes.json();
        setUser(meData);
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: '網路錯誤或伺服器無回應' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
