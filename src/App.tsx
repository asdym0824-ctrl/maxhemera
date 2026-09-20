import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { AuthProvider, getRoleDefaultPath, useAuth } from './context/AuthContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { MobileNavigation } from './components/layout/MobileNavigation';
import { FloatingAiAssistant } from './components/ai/FloatingAiAssistant';
import { HomePage } from './pages/HomePage';
import { DoctorSearchPage } from './pages/DoctorSearchPage';
import { DoctorProfilePage } from './pages/DoctorProfilePage';
import { SpecialtyPage } from './pages/SpecialtyPage';
import { ServicesPage } from './pages/ServicesPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { HealthLibraryPage } from './pages/HealthLibraryPage';
import { ArticleDetailPage } from './pages/ArticleDetailPage';
import { ConditionDetailPage } from './pages/ConditionDetailPage';
import { BranchesPage } from './pages/BranchesPage';
import { InsuranceCoveragePage } from './pages/InsuranceCoveragePage';
import { PatientDashboardPage } from './pages/PatientDashboardPage';
import { DoctorDashboardPage } from './pages/DoctorDashboardPage';
import { SecretaryWorkspacePage } from './pages/SecretaryWorkspacePage';
import { ClinicManagerWorkspacePage } from './pages/ClinicManagerWorkspacePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { LoginPage } from './pages/LoginPage';
import { DoctorSitePage } from './pages/doctorSite/DoctorSitePage';
import { ClinicBrandingPage } from './pages/ClinicBrandingPage';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { apiService } from './services/apiService';
import { Doctor, Specialty, ServiceItem, HealthArticle } from './types';
import { ArrowLeft, User } from 'lucide-react';
import { MedicalLoadingIndicator } from './components/common/MedicalLoadingIndicator';
import { ClinicalBackgroundGrid } from './components/common/medicalPattern/ClinicalBackgroundGrid';
import { RealtimeAppointmentNotifier } from './components/common/RealtimeAppointmentNotifier';

const RootRouteHandler: React.FC<{
  doctors: Doctor[];
  specialties: Specialty[];
  services: ServiceItem[];
  articles: HealthArticle[];
}> = ({ doctors, specialties, services, articles }) => {
  const { currentUser, isLoggedIn, getRoleDefaultPath } = useAuth();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';

  // If user is clinical or administrative staff (doctor, secretary, clinic manager, admin) and not previewing public site,
  // automatically route them directly into their dedicated portal!
  if (isLoggedIn && currentUser && currentUser.role !== 'patient' && !isPreview) {
    return <Navigate to={getRoleDefaultPath(currentUser.role)} replace />;
  }

  return (
    <>
      {/* Banner if staff is actively previewing public site */}
      {isPreview && isLoggedIn && currentUser && currentUser.role !== 'patient' && (
        <div className="mb-6 bg-slate-900 text-white p-3.5 rounded-2xl border border-slate-700 flex flex-wrap items-center justify-between gap-3 shadow-lg font-sans animate-in fade-in" dir="rtl">
          <div className="flex items-center gap-2.5 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>
              حالت پیش‌نمایش: شما به عنوان <strong>{currentUser.name}</strong> در حال مشاهده سایت عمومی هستید.
            </span>
          </div>
          <Link
            to={getRoleDefaultPath(currentUser.role)}
            className="inline-flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold px-3.5 py-1.5 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <span>بازگشت به پرتال اختصاصی</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
      <HomePage
        doctors={doctors}
        specialties={specialties}
        services={services}
        articles={articles}
      />
    </>
  );
};

const MainAppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, isLoggedIn } = useAuth();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [articles, setArticles] = useState<HealthArticle[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([
      apiService.getDoctors(),
      apiService.getSpecialties(),
      apiService.getServices(),
      apiService.getArticles()
    ]).then(([docs, specs, srvs, arts]) => {
      setDoctors(docs);
      setSpecialties(specs);
      setServices(srvs);
      setArticles(arts);
      setTimeout(() => {
        setIsInitialLoading(false);
      }, 400);
    }).catch(() => {
      setIsInitialLoading(false);
    });
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  const isStaffWorkspace = 
    (location.pathname === '/doctor' || (location.pathname.startsWith('/doctor/') && !location.pathname.startsWith('/doctors'))) ||
    location.pathname.startsWith('/secretary') ||
    location.pathname.startsWith('/reception') ||
    (location.pathname === '/clinic' || (location.pathname.startsWith('/clinic/') && !location.pathname.startsWith('/clinic-'))) ||
    location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-slate-50 font-vazir text-slate-800 flex flex-col selection:bg-blue-600 selection:text-white relative">
      {/* Universal Medical Texture & Clinical Mesh Backdrop */}
      <ClinicalBackgroundGrid />

      {/* Minimalist Medical Loading Screen */}
      {isInitialLoading && (
        <MedicalLoadingIndicator
          fullScreen
          message="همرا کلینیک"
          subMessage="سامانه جامع پزشکی و سلامت"
        />
      )}

      {/* Universal Role-Adaptive Header */}
      <Header />

      {/* Main Render Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 pt-3 sm:pt-6 pb-20 sm:pb-28 xl:pb-8">
        <Routes>
          <Route
            path="/"
            element={
              <RootRouteHandler
                doctors={doctors}
                specialties={specialties}
                services={services}
                articles={articles}
              />
            }
          />
          <Route path="/doctors" element={<DoctorSearchPage />} />
          <Route path="/doctors/:slug" element={<DoctorProfilePage />} />
          
          <Route path="/specialties" element={<SpecialtyPage />} />
          <Route path="/specialties/:slug" element={<SpecialtyPage />} />
          
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:slug" element={<ServiceDetailPage />} />
          
          <Route path="/branches" element={<BranchesPage doctors={doctors} />} />
          <Route path="/nearest-branch" element={<BranchesPage doctors={doctors} />} />
          
          <Route path="/insurance" element={<InsuranceCoveragePage />} />
          <Route path="/insurance-finder" element={<InsuranceCoveragePage />} />
          
          <Route path="/telemedicine" element={<DoctorSearchPage />} />
          
          <Route path="/health" element={<HealthLibraryPage />} />
          <Route path="/health/article/:slug" element={<ArticleDetailPage />} />
          <Route path="/health/condition/:slug" element={<ConditionDetailPage />} />
          
          {/* Clinic Branding & Growth Development */}
          <Route path="/clinic-branding" element={<ClinicBrandingPage />} />
          <Route path="/clinic-growth" element={<ClinicBrandingPage />} />
          <Route path="/branding" element={<ClinicBrandingPage />} />
          
          {/* Patient Workspace Routes */}
          <Route
            path="/patient"
            element={
              <ProtectedRoute allowedRoles={['patient', 'super_admin']} requiredPermissions={['patient.portal.access']}>
                <PatientDashboardPage onNavigateToDoctors={() => navigate('/doctors')} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/appointments"
            element={
              <ProtectedRoute allowedRoles={['patient', 'super_admin']} requiredPermissions={['patient.portal.access']}>
                <PatientDashboardPage onNavigateToDoctors={() => navigate('/doctors')} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/records"
            element={
              <ProtectedRoute allowedRoles={['patient', 'super_admin']} requiredPermissions={['patient.portal.access']}>
                <PatientDashboardPage onNavigateToDoctors={() => navigate('/doctors')} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/family"
            element={
              <ProtectedRoute allowedRoles={['patient', 'super_admin']} requiredPermissions={['patient.portal.access']}>
                <PatientDashboardPage onNavigateToDoctors={() => navigate('/doctors')} />
              </ProtectedRoute>
            }
          />
          
          {/* Doctor Workspace */}
          <Route
            path="/doctor"
            element={
              <ProtectedRoute allowedRoles={['doctor', 'super_admin']} requiredPermissions={['doctor.portal.access']}>
                <DoctorDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Secretary / Reception Workspace */}
          <Route
            path="/reception"
            element={
              <ProtectedRoute allowedRoles={['secretary', 'reception', 'clinic_manager', 'super_admin']} requiredPermissions={['secretary.portal.access']}>
                <SecretaryWorkspacePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/secretary"
            element={
              <ProtectedRoute allowedRoles={['secretary', 'reception', 'clinic_manager', 'super_admin']} requiredPermissions={['secretary.portal.access']}>
                <SecretaryWorkspacePage />
              </ProtectedRoute>
            }
          />

          {/* Clinic Manager Workspace */}
          <Route
            path="/clinic"
            element={
              <ProtectedRoute allowedRoles={['clinic_manager', 'super_admin']} requiredPermissions={['clinic.portal.access']}>
                <ClinicManagerWorkspacePage />
              </ProtectedRoute>
            }
          />
          
          {/* Super Admin Dashboard */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['super_admin']} requiredPermissions={['system.admin']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/:subtab"
            element={
              <ProtectedRoute allowedRoles={['super_admin']} requiredPermissions={['system.admin']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          
          <Route path="/login" element={<LoginPage onSuccess={(user) => navigate(getRoleDefaultPath(user.role))} />} />

          {/* Legacy Aliases & Redirects */}
          <Route path="/patient-portal" element={<Navigate to="/patient" replace />} />
          <Route path="/doctor-portal" element={<Navigate to="/doctor" replace />} />
          <Route path="/reception-portal" element={<Navigate to="/reception" replace />} />
          <Route path="/admin-portal" element={<Navigate to="/admin" replace />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Floating AI Symptom Assistant - Displayed for patients and visitors only, hidden in staff clinical workspaces */}
      {!isStaffWorkspace && (
        <FloatingAiAssistant onNavigateToDoctors={() => navigate('/doctors')} />
      )}

      {/* Universal Footer */}
      <Footer />

      {/* Persistent Mobile Bottom Navigation */}
      <MobileNavigation />

      {/* Real-time Global Appointment Notifier */}
      <RealtimeAppointmentNotifier />
    </div>
  );
};

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Doctor Standalone Personal Sub-Website Direct Aliases */}
            <Route path="/site" element={<Navigate to="/site/dr-maryam-hosseini" replace />} />
            <Route path="/dr" element={<Navigate to="/dr/dr-maryam-hosseini" replace />} />
            <Route path="/doctor-site" element={<Navigate to="/site/dr-maryam-hosseini" replace />} />

            {/* Doctor Standalone Personal Sub-Website Routes */}
            <Route path="/site/:doctorSlug" element={<DoctorSitePage />} />
            <Route path="/site/:doctorSlug/*" element={<DoctorSitePage />} />
            <Route path="/dr/:doctorSlug" element={<DoctorSitePage />} />
            <Route path="/dr/:doctorSlug/*" element={<DoctorSitePage />} />
            <Route path="/doctor-site/:doctorSlug" element={<DoctorSitePage />} />
            <Route path="/doctor-site/:doctorSlug/*" element={<DoctorSitePage />} />

            {/* Main App Layout */}
            <Route path="/*" element={<MainAppLayout />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
