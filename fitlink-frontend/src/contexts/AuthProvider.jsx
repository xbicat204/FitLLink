import { useContext, useState, useEffect, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import { getProfile } from '@/services/userService';

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const data = await getProfile();
      setUser(data);
      return data;
    } catch (error) {
      setUser(null);
      throw error;
    }
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      try {
        await refreshUser();
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [refreshUser]);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
