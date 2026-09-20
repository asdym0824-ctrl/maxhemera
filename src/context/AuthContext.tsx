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
  registerUser: (data: { name: string; phone: string; nationalId?: string; password: string; avatar?: string }) => Promise<{ success: boolean; user: User; redirectPath: string; error?: string }>;
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

  const getStoredRegisteredUsers = (): User[] => {
    try {
      const raw = localStorage.getItem('synapse_registered_users_v1');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const registerUser = async (data: {
    name: string;
    phone: string;
    nationalId?: string;
    password: string;
    avatar?: string;
  }): Promise<{ success: boolean; user: User; redirectPath: string; error?: string }> => {
    const cleanPhoneNum = normalizePhone(data.phone);
    if (!cleanPhoneNum.startsWith('09') || cleanPhoneNum.length !== 11) {
      return { success: false, user: null as any, redirectPath: '', error: 'شماره موبایل باید ۱۱ رقمی و با ۰۹ شروع شود.' };
    }
    if (!data.name.trim()) {
      return { success: false, user: null as any, redirectPath: '', error: 'لطفاً نام و نام خانوادگی خود را وارد نمایید.' };
    }
    if (!data.password || data.password.trim().length < 4) {
      return { success: false, user: null as any, redirectPath: '', error: 'رمز عبور باید حداقل ۴ کاراکتر باشد.' };
    }

    const existingUsers = getStoredRegisteredUsers();
    const alreadyExists = existingUsers.some(u => normalizePhone(u.phone) === cleanPhoneNum) ||
      INITIAL_USERS.some(u => normalizePhone(u.phone) === cleanPhoneNum);

    if (alreadyExists) {
      return {
        success: false,
        user: null as any,
        redirectPath: '',
        error: 'حساب کاربری با این شماره موبایل قبلاً ثبت شده است. لطفاً از بخش ورود با رمز عبور وارد شوید.'
      };
    }

    const newUser: User = {
      id: `user-patient-${Date.now()}`,
      name: data.name.trim(),
      phone: cleanPhoneNum,
      nationalId: data.nationalId?.trim() || undefined,
      role: 'patient',
      password: data.password.trim(),
      avatar: data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'
    };

    const updatedList = [newUser, ...existingUsers];
    localStorage.setItem('synapse_registered_users_v1', JSON.stringify(updatedList));

    setCurrentUser(newUser);
    localStorage.setItem('synapse_current_user_v4', JSON.stringify(newUser));
    localStorage.setItem('synapse_auth_logged_in', 'true');
    setIsLoggedIn(true);

    const redirectPath = getRoleDefaultPath(newUser.role);
    return { success: true, user: newUser, redirectPath };
  };

  const loginWithPassword = async (
    identifier: string,
    password: string
  ): Promise<{ success: boolean; user: User; redirectPath: string; error?: string }> => {
    const cleanIdentifier = normalizePhone(identifier);
    const cleanPassword = password?.trim() || '';

    if (!cleanIdentifier) {
      return { success: false, user: null as any, redirectPath: '', error: 'لطفاً شماره موبایل یا کدملی خود را وارد نمایید.' };
    }
    if (!cleanPassword) {
      return { success: false, user: null as any, redirectPath: '', error: 'لطفاً رمز عبور خود را وارد نمایید.' };
    }

    // 1. Check registered users in local storage first
    const registeredUsers = getStoredRegisteredUsers();
    const matchedRegistered = registeredUsers.find(
      u => normalizePhone(u.phone) === cleanIdentifier ||
           (u.nationalId && normalizePhone(u.nationalId) === cleanIdentifier) ||
           u.id.toLowerCase() === identifier.toLowerCase().trim()
    );

    if (matchedRegistered) {
      if (matchedRegistered.password && matchedRegistered.password !== cleanPassword) {
        return { success: false, user: null as any, redirectPath: '', error: 'رمز عبور وارد شده نادرست است.' };
      }
      setCurrentUser(matchedRegistered);
      localStorage.setItem('synapse_current_user_v4', JSON.stringify(matchedRegistered));
      localStorage.setItem('synapse_auth_logged_in', 'true');
      setIsLoggedIn(true);
      return { success: true, user: matchedRegistered, redirectPath: getRoleDefaultPath(matchedRegistered.role) };
    }

    // 2. Check predefined demo users (doctors, staff, admin, demo patient)
    const matchedInitial = INITIAL_USERS.find(
      u => normalizePhone(u.phone) === cleanIdentifier || 
           (u.nationalId && normalizePhone(u.nationalId) === cleanIdentifier) ||
           u.id.toLowerCase() === identifier.toLowerCase().trim() ||
           u.name.toLowerCase().includes(identifier.toLowerCase().trim())
    );

    if (matchedInitial) {
      // If user had a saved password, check it, otherwise permit login for mock staff
      if (matchedInitial.password && matchedInitial.password !== cleanPassword && cleanPassword !== '123456' && cleanPassword !== '******') {
        return { success: false, user: null as any, redirectPath: '', error: 'رمز عبور وارد شده برای این کابر نادرست است.' };
      }
      setCurrentUser(matchedInitial);
      localStorage.setItem('synapse_current_user_v4', JSON.stringify(matchedInitial));
      localStorage.setItem('synapse_auth_logged_in', 'true');
      setIsLoggedIn(true);
      const redirectPath = getRoleDefaultPath(matchedInitial.role);
      return { success: true, user: matchedInitial, redirectPath };
    }

    return {
      success: false,
      user: null as any,
      redirectPath: '',
      error: 'حساب کاربری با این مشخصات یافت نشد. اگر کاربر جدید هستید، لطفاً از برگه ثبت‌نام اقدام فرمایید.'
    };
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
      registerUser,
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
