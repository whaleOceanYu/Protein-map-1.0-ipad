// src/context/UserContext.jsx

import { createContext, useContext, useState } from 'react';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user,       setUser]       = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isGuest,    setIsGuest]    = useState(false); // true = 訪客模式（無用戶數據）
  const [likedIds,   setLikedIds]   = useState(new Set());
  const [goal,       setGoal]       = useState('增肌');

  const login = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    setIsGuest(false);
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setIsGuest(false);
  };

  // 訪客：進入 App 但不載入任何用戶數據
  const loginAsGuest = () => {
    setUser(null);
    setIsLoggedIn(true);
    setIsGuest(true);
  };

  const toggleLike = (id) => {
    setLikedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const value = { user, isLoggedIn, isGuest, login, logout, loginAsGuest, likedIds, toggleLike, goal, setGoal };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === null) {
    throw new Error('useUser 必須在 UserProvider 內部使用。');
  }
  return context;
}
