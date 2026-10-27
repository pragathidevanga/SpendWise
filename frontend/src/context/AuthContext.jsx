import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Storage, KEYS } from '../services/storage';
import { hashPassword } from '../services/crypto';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session on startup
  useEffect(() => {
    try {
      const activeSession = Storage.getRaw(KEYS.SESSION, null);
      if (activeSession && activeSession.userId) {
        const users = Storage.getRaw(KEYS.USERS, []);
        const found = users.find(u => u.id === activeSession.userId);
        if (found) {
          setUser({
            id: found.id,
            name: found.name,
            email: found.email,
            avatar: found.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(found.name)}`,
            isDemo: !!found.isDemo,
            createdAt: found.createdAt
          });
        } else if (activeSession.isDemo) {
          // Fallback restore for demo session
          setUser({
            id: activeSession.userId,
            name: activeSession.name || 'Demo User',
            email: activeSession.email || 'demo@spendwise.local',
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=DemoUser`,
            isDemo: true,
            createdAt: new Date().toISOString()
          });
        }
      }
    } catch (err) {
      console.error('[AuthContext] Failed to load session:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Standard email/password signup
  const signup = useCallback(async ({ name, email, password }) => {
    const trimmedEmail = (email || '').trim().toLowerCase();
    const trimmedName = (name || '').trim();

    if (!trimmedName || !trimmedEmail || !password) {
      throw new Error('All fields are required.');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    const users = Storage.getRaw(KEYS.USERS, []);
    const existing = users.find(u => u.email.toLowerCase() === trimmedEmail);
    if (existing) {
      throw new Error('An account with this email already exists. Please sign in instead.');
    }

    const passwordHash = await hashPassword(password);
    const userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    const newUser = {
      id: userId,
      name: trimmedName,
      email: trimmedEmail,
      passwordHash,
      createdAt: new Date().toISOString(),
      isDemo: false
    };

    users.push(newUser);
    Storage.setRaw(KEYS.USERS, users);

    // Save active session
    const session = {
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
      loggedInAt: new Date().toISOString()
    };
    Storage.setRaw(KEYS.SESSION, session);

    const activeUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(newUser.name)}`,
      isDemo: false,
      createdAt: newUser.createdAt
    };

    setUser(activeUser);
    return activeUser;
  }, []);

  // Standard email/password login
  const login = useCallback(async ({ email, password, rememberMe = true }) => {
    const trimmedEmail = (email || '').trim().toLowerCase();

    if (!trimmedEmail || !password) {
      throw new Error('Please enter both email and password.');
    }

    const users = Storage.getRaw(KEYS.USERS, []);
    const foundUser = users.find(u => u.email.toLowerCase() === trimmedEmail);

    if (!foundUser) {
      throw new Error('No account found with this email. Please check your credentials or sign up.');
    }

    const enteredHash = await hashPassword(password);
    if (foundUser.passwordHash !== enteredHash) {
      throw new Error('Incorrect password. Please verify and try again.');
    }

    const session = {
      userId: foundUser.id,
      email: foundUser.email,
      name: foundUser.name,
      rememberMe: !!rememberMe,
      loggedInAt: new Date().toISOString()
    };
    Storage.setRaw(KEYS.SESSION, session);

    const activeUser = {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      avatar: foundUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(foundUser.name)}`,
      isDemo: !!foundUser.isDemo,
      createdAt: foundUser.createdAt
    };

    setUser(activeUser);
    return activeUser;
  }, []);

  // Google Sign-In Demo Mode
  const loginWithGoogleDemo = useCallback(async (customProfile = null) => {
    const profile = customProfile || {
      name: 'Alex Morgan',
      email: 'alex.morgan.demo@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
    };

    const users = Storage.getRaw(KEYS.USERS, []);
    let userRecord = users.find(u => u.email.toLowerCase() === profile.email.toLowerCase());

    if (!userRecord) {
      const demoHash = await hashPassword('demo_oauth_pass_' + Date.now());
      userRecord = {
        id: 'usr_gdemo_' + Math.random().toString(36).substring(2, 8),
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar,
        passwordHash: demoHash,
        isDemo: true,
        authProvider: 'google-demo',
        createdAt: new Date().toISOString()
      };
      users.push(userRecord);
      Storage.setRaw(KEYS.USERS, users);
    }

    const session = {
      userId: userRecord.id,
      email: userRecord.email,
      name: userRecord.name,
      isDemo: true,
      authProvider: 'google-demo',
      loggedInAt: new Date().toISOString()
    };
    Storage.setRaw(KEYS.SESSION, session);

    const activeUser = {
      id: userRecord.id,
      name: userRecord.name,
      email: userRecord.email,
      avatar: userRecord.avatar,
      isDemo: true,
      authProvider: 'google-demo',
      createdAt: userRecord.createdAt
    };

    setUser(activeUser);
    return activeUser;
  }, []);

  // Local demo password reset
  const resetPasswordDemo = useCallback(async ({ email, newPassword }) => {
    const trimmedEmail = (email || '').trim().toLowerCase();

    if (!trimmedEmail || !newPassword) {
      throw new Error('Email and new password are required.');
    }
    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters.');
    }

    const users = Storage.getRaw(KEYS.USERS, []);
    const userIndex = users.findIndex(u => u.email.toLowerCase() === trimmedEmail);

    if (userIndex === -1) {
      throw new Error('No registered account was found with this email address.');
    }

    const newHash = await hashPassword(newPassword);
    users[userIndex].passwordHash = newHash;
    users[userIndex].updatedAt = new Date().toISOString();
    Storage.setRaw(KEYS.USERS, users);

    return true;
  }, []);

  // Profile update
  const updateProfile = useCallback(({ name, email }) => {
    if (!user) return false;
    const users = Storage.getRaw(KEYS.USERS, []);
    const idx = users.findIndex(u => u.id === user.id);

    const updatedUser = {
      ...user,
      name: name ? name.trim() : user.name,
      email: email ? email.trim().toLowerCase() : user.email
    };

    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updatedUser };
      Storage.setRaw(KEYS.USERS, users);
    }

    const session = Storage.getRaw(KEYS.SESSION, {});
    Storage.setRaw(KEYS.SESSION, { ...session, name: updatedUser.name, email: updatedUser.email });

    setUser(updatedUser);
    return true;
  }, [user]);

  // Logout - preserves user data, removes session only
  const logout = useCallback(() => {
    Storage.removeRaw(KEYS.SESSION);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        loginWithGoogleDemo,
        resetPasswordDemo,
        updateProfile,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
