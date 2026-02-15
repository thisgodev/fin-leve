
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { storageService } from '../services/storageService';
import { apiService } from '../services/apiService';

interface AuthContextType {
  user: User | null;
  handleGoogleResponse: (response: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = storageService.getAuth();
    if (savedUser) setUser(savedUser);
  }, []);

  const decodeJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const handleGoogleResponse = async (response: any) => {
    const payload = decodeJwt(response.credential);
    if (payload) {
      const googleUser = {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        avatar: payload.picture,
      };

      // Sincroniza com o banco Neon através do apiService
      const syncedUser = await apiService.syncUser(googleUser);
      setUser(syncedUser);
      storageService.saveAuth(syncedUser);
    }
  };

  const logout = () => {
    setUser(null);
    storageService.saveAuth(null);
    // Limpar sessão do Google se necessário
  };

  return (
    <AuthContext.Provider value={{ user, handleGoogleResponse, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
