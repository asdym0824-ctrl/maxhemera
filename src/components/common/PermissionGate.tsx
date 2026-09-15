import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { AppPermission } from '../../types';
import { hasPermission } from '../../utils/authUtils';

interface PermissionGateProps {
  permission: AppPermission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  children,
  fallback = null
}) => {
  const { currentUser } = useAuth();
  const allowed = hasPermission(currentUser, permission);

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
