import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole, AppPermission } from '../types';
import { apiService } from '../services/apiService';
import { INITIAL_USERS } from '../data/mockData';
import { hasPermission as checkUserPermission } from '../utils/authUtils';

export function getRoleDefaultPath(role: UserRole): string {
  switch (role) {
    case 'doctor':
      return '/doctor';
    case 'patient':
      return '/patient';
    case 'secretary':
    case 'reception':
    case 'nurse':
      return '/secretary';
    case 'clinic_manager':
    case 'branch_manager':
      return '/clinic';
    case 'admin':
    case 'super_admin':
      return '/admin';
    case 'finance':
      return '/admin/finance';
    case 'hr':
      return '/admin/hr';
    case 'content_manager':
      return '/admin/marketing';
    default:
      return '/patient';
  }
}

interface AuthContextType {
  currentUser: User | null;
  currentRole: UserRole;
  isLoggedIn: boolean;
  setRole: (role: UserRole) => Promise<User>;
  switchUser: (userId: string) => Promise<User | null>;
  hasPermission: (permission: AppPermission) => boolean;
  loginWithPhone: (phone: string, otp?: string, name?: string, nationalCode?: string, avatar?: string) => Promise<{ success: boolean; user: User; redirectPath: string }>;
  loginWithPassword: (identifier: string, password: string) => Promise<{ success: boolean; user: User; redirectPath: string; error?: string }>;
  loginAsUser: (user: User) => { user: User; redirectPath: string };
  updateCurrentUser: (updates: Partial<User>) => Promise<User>;
  logout: () => void;
  getRoleDefaultPath: (role: UserRole) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const storedAuth = localStorage.getItem('synapse_auth_logged_in');
      if (storedAuth === 'false') {
        return null;
      }
      const stored = localStorage.getItem('synapse_current_user_v4');
      if (stored) {
        return JSON.parse(stored);
      }
      // If auth flag is true or first time default
      if (storedAuth === 'true') {
        return INITIAL_USERS[0];
      }
    } catch {
      // fallback
    }
    return null;
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      const storedAuth = localStorage.getItem('synapse_auth_logged_in');
      if (storedAuth !== null) {
        return storedAuth === 'true';
      }
      // Check if user is stored in local storage
      const storedUser = localStorage.getItem('synapse_current_user_v4');
      return !!storedUser;
    } catch {
      // fallback
    }
    return false;
  });

  useEffect(() => {
    apiService.getCurrentUser().then(user => {
      if (user) {
        setCurrentUser(user);
        setIsLoggedIn(true);
      } else {
        const storedAuth = localStorage.getItem('synapse_auth_logged_in');
        if (storedAuth === 'false') {
          setCurrentUser(null);
          setIsLoggedIn(false);
        }
      }
    });
  }, []);

  const setRole = async (role: UserRole): Promise<User> => {
    const updated = await apiService.setCurrentUserRole(role);
    setCurrentUser(updated);
    localStorage.setItem('synapse_current_user_v4', JSON.stringify(updated));
    localStorage.setItem('synapse_auth_logged_in', 'true');
    setIsLoggedIn(true);
    return updated;
  };

  const switchUser = async (userId: string): Promise<User | null> => {
    const target = INITIAL_USERS.find(u => u.id === userId);
    if (target) {
      localStorage.setItem('synapse_current_user_v4', JSON.stringify(target));
      localStorage.setItem('synapse_auth_logged_in', 'true');
      setCurrentUser(target);
      setIsLoggedIn(true);
      return target;
    }
    return null;
  };

  const hasPermission = useCallback((permission: AppPermission): boolean => {
    if (!currentUser) return false;
    return checkUserPermission(currentUser, permission);
  }, [currentUser]);

  const normalizePhone = (p: string) => {
    return p
      .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
      .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
      .replace(/\s+/g, '')
      .replace(/[-+()]/g, '')
      .trim();
  };

  const loginWithPhone = async (
    phone: string,
    _otp?: string,
    name?: string,
    nationalCode?: string,
    avatar?: string
  ): Promise<{ success: boolean; user: User; redirectPath: string }> => {
    const cleanPhone = normalizePhone(phone);
    
    // Check if phone belongs to any registered user in INITIAL_USERS
    let matched = INITIAL_USERS.find(u => normalizePhone(u.phone) === cleanPhone);

    // If matched and custom avatar/name passed, allow overriding
    let authenticatedUser: User;
    if (matched) {
      authenticatedUser = {
        ...matched,
        name: name?.trim() ? name.trim() : matched.name,
        nationalId: nationalCode?.trim() ? nationalCode.trim() : matched.nationalId,
        avatar: avatar || matched.avatar
      };
    } else {
      authenticatedUser = {
        id: `user-patient-${Date.now()}`,
        name: name?.trim() || 'کاربر همرا کلینیک',
        phone: cleanPhone,
        nationalId: nationalCode?.trim() || undefined,
        role: 'patient',
        avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'
      };
    }

    setCurrentUser(authenticatedUser);
    localStorage.setItem('synapse_current_user_v4', JSON.stringify(authenticatedUser));
    localStorage.setItem('synapse_auth_logged_in', 'true');
    setIsLoggedIn(true);

    const redirectPath = getRoleDefaultPath(authenticatedUser.role);
    return { success: true, user: authenticatedUser, redirectPath };
  };

  const updateCurrentUser = async (updates: Partial<User>): Promise<User> => {
    if (!currentUser) {
      throw new Error('No logged in user to update');
    }
    const updated: User = {
      ...currentUser,
      ...updates
    };
    setCurrentUser(updated);
    localStorage.setItem('synapse_current_user_v4', JSON.stringify(updated));
    return updated;
  };

  const loginWithPassword = async (
    identifier: string,
    _password: string
  ): Promise<{ success: boolean; user: User; redirectPath: string; error?: string }> => {
    const cleanIdentifier = normalizePhone(identifier);

    // Search by phone, id, or role matching
    const matched = INITIAL_USERS.find(
      u => normalizePhone(u.phone) === cleanIdentifier || 
           u.id.toLowerCase() === identifier.toLowerCase().trim() ||
           u.name.toLowerCase().includes(identifier.toLowerCase().trim())
    );

    if (matched) {
      setCurrentUser(matched);
      localStorage.setItem('synapse_current_user_v4', JSON.stringify(matched));
      localStorage.setItem('synapse_auth_logged_in', 'true');
      setIsLoggedIn(true);
      const redirectPath = getRoleDefaultPath(matched.role);
      return { success: true, user: matched, redirectPath };
    }

    // Default fallback to patient or doctor if mock credentials
    const fallbackUser = INITIAL_USERS[0];
    setCurrentUser(fallbackUser);
    localStorage.setItem('synapse_current_user_v4', JSON.stringify(fallbackUser));
    localStorage.setItem('synapse_auth_logged_in', 'true');
    setIsLoggedIn(true);
    return { success: true, user: fallbackUser, redirectPath: getRoleDefaultPath(fallbackUser.role) };
  };

  const loginAsUser = (user: User): { user: User; redirectPath: string } => {
    setCurrentUser(user);
    localStorage.setItem('synapse_current_user_v4', JSON.stringify(user));
    localStorage.setItem('synapse_auth_logged_in', 'true');
    setIsLoggedIn(true);
    const redirectPath = getRoleDefaultPath(user.role);
    return { user, redirectPath };
  };

  const logout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('synapse_current_user_v4');
    localStorage.setItem('synapse_auth_logged_in', 'false');
    apiService.logout().catch(() => {});
  };

  const currentRole: UserRole = currentUser ? currentUser.role : 'patient';

  return (
    <AuthContext.Provider value={{
      currentUser,
      currentRole,
      setRole,
      switchUser,
      hasPermission,
      isLoggedIn,
      loginWithPhone,
      loginWithPassword,
      loginAsUser,
      updateCurrentUser,
      logout,
      getRoleDefaultPath
    }}>
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
