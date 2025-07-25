import React, { createContext, useEffect, useState } from 'react';
import { loginUser, getCurrentUser } from '../api/authApi';

// UserContext provides simple authentication state.  In this demo we only
// persist data in memory.  A real application would talk to an API and
// store tokens securely.
export const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [tokens, setTokens] = useState(() => {
    const access = localStorage.getItem('access_token');
    const refresh = localStorage.getItem('refresh_token');
    return access ? { access, refresh } : null;
  });

  // On mount, if tokens exist, fetch the current user
  useEffect(() => {
    const fetchUser = async () => {
      if (tokens && tokens.access) {
        try {
          const user = await getCurrentUser(tokens.access);
          setCurrentUser(user);
        } catch (err) {
          console.error('Failed to fetch current user', err);
          // Remove invalid tokens
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setTokens(null);
        }
      }
    };
    fetchUser();
  }, [tokens]);

  const login = async ({ email, password }) => {
    try {
      const tokenPair = await loginUser({ email, password });
      localStorage.setItem('access_token', tokenPair.access_token);
      if (tokenPair.refresh_token) {
        localStorage.setItem('refresh_token', tokenPair.refresh_token);
      }
      setTokens({ access: tokenPair.access_token, refresh: tokenPair.refresh_token });
      const user = await getCurrentUser(tokenPair.access_token);
      setCurrentUser(user);
      return user;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setTokens(null);
    setCurrentUser(null);
  };

  return (
    <UserContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}