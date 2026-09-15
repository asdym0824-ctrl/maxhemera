import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole, AppPermission } from '../../types';
import { hasPermission } from '../../utils/authUtils';
import { ShieldAlert, RefreshCw, LogIn, ArrowRight, UserCheck } from 'lucide-react';
import { Button } from './Button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredPermission?: AppPermission;
  requiredPermissions?: AppPermission[];
  fallbackPath?: string;
}

const ROLE_LABELS: Record<UserRole, string> = {
  patient: 'بیمار',
  doctor: 'پزشک متخصص',
  secretary: 'منشی',
  reception: 'پذیرش',
  clinic_manager: 'مدیر کلینیک',
  admin: 'مدیر سیستم',
  super_admin: 'سوپر ادمین همرا کلینیک',
  nurse: 'پرستار',
  finance: 'مالی',
  hr: 'منابع انسانی',
  content_manager: 'مدیر محتوا',
  branch_manager: 'مدیر شعبه'
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requiredPermission,
  requiredPermissions,
  fallbackPath = '/'
}) => {
  const { currentUser, isLoggedIn, setRole, getRoleDefaultPath } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!isLoggedIn || !currentUser) {
    return <Navigate to={`/login?returnUrl=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  const hasRoleAccess = !allowedRoles || allowedRoles.length === 0 || allowedRoles.includes(currentUser.role) || currentUser.role === 'super_admin';
  const hasSinglePerm = !requiredPermission || hasPermission(currentUser, requiredPermission);
  const hasArrayPerm = !requiredPermissions || requiredPermissions.length === 0 || requiredPermissions.every(p => hasPermission(currentUser, p));
  const hasPermAccess = hasSinglePerm && hasArrayPerm;

  if (hasRoleAccess && hasPermAccess) {
    return <>{children}</>;
  }

  // Role Access Restriction Guard
  return (
    <div className="max-w-xl mx-auto my-12 p-8 bg-white border border-amber-200/90 rounded-3xl shadow-sm text-center font-sans space-y-4" dir="rtl">
      <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-slate-800">عدم دسترسی به این بخش</h2>
      <p className="text-sm text-slate-600 leading-relaxed">
        شما هم‌اکنون با حساب <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg">{currentUser.name} ({ROLE_LABELS[currentUser.role] || currentUser.role})</span> وارد شده‌اید.
        <br />
        این بخش مخصوص کاربران با نقش <strong>{allowedRoles?.map(r => ROLE_LABELS[r] || r).join(' یا ')}</strong> می‌باشد.
      </p>

      <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button 
          variant="primary" 
          onClick={() => navigate(getRoleDefaultPath(currentUser.role))}
          icon={<UserCheck className="w-4 h-4" />}
        >
          ورود به پرتال اختصاصی خودم ({ROLE_LABELS[currentUser.role] || currentUser.role})
        </Button>

        <Button 
          variant="outline" 
          onClick={() => navigate('/login')}
          icon={<LogIn className="w-4 h-4" />}
        >
          ورود با حساب کاربری دیگر
        </Button>
      </div>

      {allowedRoles && allowedRoles.length > 0 && (
        <div className="pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-500 mb-2">
            تغییر سریع نقش (ویژه حالت توسعه و آزمایش سامانه):
          </p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {allowedRoles.map(r => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 transition-colors cursor-pointer"
              >
                تغییر به {ROLE_LABELS[r] || r}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
