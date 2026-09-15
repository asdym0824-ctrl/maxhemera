import { User, Doctor, Specialty, ServiceItem, PatientPageContext } from '../types';
import { apiService } from './apiService';
import { isAppointmentToday } from '../utils/dateUtils';

export interface GroundedSecretaryContext {
  clinicId: string;
  clinicName: string;
  branchId?: string;
  branchName?: string;
  secretary: {
    id: string;
    name: string;
    role: string;
  };
  todayStats: {
    total: number;
    waiting: number; // arrived
    inVisit: number;
    completed: number;
    scheduled: number;
    cancelled: number;
    noShow: number;
    unconfirmed: number;
  };
  waitingList: Array<{
    patientName: string;
    doctorName: string;
    timeSlot: string;
    arrivedAt?: string;
    visitType: string;
  }>;
  urgentTasks: Array<{
    id: string;
    title: string;
    assignedToName: string;
    priority: string;
    patientPhone?: string;
    status: string;
  }>;
  pendingTasksCount: number;
  overdueTasksCount: number;
  activeDoctors: Array<{
    id: string;
    name: string;
    specialty: string;
  }>;
  notificationsCount: number;
}

export interface GroundedDoctorContext {
  doctorId: string;
  doctorName: string;
  specialty: string;
  medicalCouncilNumber?: string;
  isLinked: boolean;
  todayStats: {
    total: number;
    waitingCount: number;
    inVisitPatient?: string;
    completedCount: number;
    scheduledCount: number;
    cancelledCount: number;
  };
  nextPatient?: {
    name: string;
    timeSlot: string;
    visitType: string;
    symptomsNote?: string;
    status: string;
  };
  waitingPatients: Array<{
    name: string;
    timeSlot: string;
    visitType: string;
    notes?: string;
  }>;
  pendingTasks: Array<{
    id: string;
    title: string;
    priority: string;
    dueDate?: string;
  }>;
  pendingFollowUpsCount: number;
}

export interface GroundedClinicManagerContext {
  clinicId: string;
  clinicName: string;
  branchCount: number;
  overview: {
    totalAppointments: number;
    arrivedWaiting: number;
    inConsultation: number;
    completed: number;
    cancelled: number;
    noShow: number;
    scheduled: number;
    confirmationRate: string;
    estimatedAvgWaitMinutes: number | null;
    todayRevenue: number;
    activeTasksCount: number;
    urgentTasksCount: number;
    overdueTasksCount: number;
  };
  staffSummary: Array<{
    id: string;
    name: string;
    role: string;
    status: string;
    activeTasksCount: number;
  }>;
  activeDoctors: Array<{
    id: string;
    name: string;
    specialty: string;
  }>;
  activeDoctorsCount: number;
}

export interface GroundedPatientNavigationContext {
  specialties: Array<{
    id: string;
    name: string;
    doctorCount?: number;
  }>;
  doctors: Array<{
    id: string;
    slug: string;
    name: string;
    specialtyId: string;
    specialtyName: string;
    title: string;
    rating: number;
    reviewCount: number;
    visitFee: number;
    avatar?: string;
    clinicName?: string;
  }>;
  services: Array<{
    id: string;
    name: string;
    specialtyId: string;
    price: number;
  }>;
  pageContext: PatientPageContext;
  authenticatedPatient?: {
    id: string;
    name: string;
    upcomingAppointments: Array<{
      id: string;
      doctorName: string;
      specialtyName: string;
      timeSlot: string;
      date: string;
      status: string;
    }>;
    recordsCount: number;
  };
}

export const aiContextService = {
  /**
   * Build authentic grounded context for the Secretary AI Copilot.
   */
  async buildSecretaryContext(user: User): Promise<GroundedSecretaryContext> {
    const clinicId = user.clinicId || '';
    const clinic = clinicId ? await apiService.getClinicById(clinicId) : undefined;
    const branch = clinic?.branches.find(b => b.id === user.branchId) || clinic?.branches[0];
    const todayApps = clinicId ? await apiService.getTodayAppointmentsByClinic(clinicId, user.branchId) : [];
    const tasks = clinicId ? await apiService.getTasksByClinic(clinicId, user.branchId) : [];
    const doctors = clinicId ? await apiService.getClinicDoctors(clinicId, user.branchId) : [];
    const notifications = clinicId ? await apiService.getNotificationsByClinic(clinicId) : [];

    const waiting = todayApps.filter(a => a.status === 'arrived');
    const inVisit = todayApps.filter(a => a.status === 'in_visit');
    const completed = todayApps.filter(a => a.status === 'completed');
    const scheduled = todayApps.filter(a => a.status === 'scheduled');
    const cancelled = todayApps.filter(a => a.status === 'canceled');
    const noShow = todayApps.filter(a => a.status === 'no_show');

    const urgentTasks = tasks
      .filter(t => t.status !== 'completed' && (t.priority === 'urgent' || t.priority === 'high'))
      .map(t => ({
        id: t.id,
        title: t.title,
        assignedToName: t.assignedToName,
        priority: t.priority,
        patientPhone: t.patientPhone,
        status: t.status
      }));

    const todayStr = new Date().toISOString().split('T')[0];
    const overdueTasks = tasks.filter(t => t.status !== 'completed' && t.dueDate && t.dueDate < todayStr);

    return {
      clinicId,
      clinicName: clinic?.name || 'همرا کلینیک (HEMERA CLINIC)',
      branchId: branch?.id,
      branchName: branch?.name,
      secretary: {
        id: user.id,
        name: user.name || 'منشی پذیرش',
        role: user.role
      },
      todayStats: {
        total: todayApps.length,
        waiting: waiting.length,
        inVisit: inVisit.length,
        completed: completed.length,
        scheduled: scheduled.length,
        cancelled: cancelled.length,
        noShow: noShow.length,
        unconfirmed: scheduled.length
      },
      waitingList: waiting.map(w => ({
        patientName: w.patientName,
        doctorName: w.doctorName,
        timeSlot: w.timeSlot,
        arrivedAt: w.arrivedAt,
        visitType: w.visitType === 'in_person' ? 'حضوری' : 'مشاوره آنلاین'
      })),
      urgentTasks,
      pendingTasksCount: tasks.filter(t => t.status !== 'completed').length,
      overdueTasksCount: overdueTasks.length,
      activeDoctors: doctors.map(d => ({
        id: d.id,
        name: d.name,
        specialty: d.specialtyName
      })),
      notificationsCount: notifications.length
    };
  },

  /**
   * Build authentic grounded context for the Doctor Operations AI.
   * Strictly uses currentUser.doctorId or explicitly selected targetDoctorId for admins.
   */
  async buildDoctorOperationsContext(user: User, targetDoctorId?: string): Promise<GroundedDoctorContext> {
    let doctorId = targetDoctorId;

    if (!doctorId) {
      if (user.role === 'doctor') {
        doctorId = user.doctorId;
      } else if (user.doctorId) {
        doctorId = user.doctorId;
      }
    }

    if (!doctorId) {
      return {
        doctorId: '',
        doctorName: user.name || 'پزشک گرامی',
        specialty: 'عمومی',
        isLinked: false,
        todayStats: {
          total: 0,
          waitingCount: 0,
          completedCount: 0,
          scheduledCount: 0,
          cancelledCount: 0
        },
        waitingPatients: [],
        pendingTasks: [],
        pendingFollowUpsCount: 0
      };
    }

    const doctor = await apiService.getDoctorById(doctorId);
    const todayApps = await apiService.getTodayAppointmentsByDoctor(doctorId);
    const tasks = await apiService.getTasks({ doctorId });

    const waiting = todayApps.filter(a => a.status === 'arrived');
    const inVisit = todayApps.find(a => a.status === 'in_visit');
    const completed = todayApps.filter(a => a.status === 'completed');
    const scheduled = todayApps.filter(a => a.status === 'scheduled');
    const cancelled = todayApps.filter(a => a.status === 'canceled' || a.status === 'no_show');

    const nextPatientApp = waiting[0] || scheduled[0];

    return {
      doctorId,
      doctorName: doctor?.name || user.name || 'پزشک متخصص',
      specialty: doctor?.specialtyName || 'پزشکی',
      medicalCouncilNumber: doctor?.medicalCouncilNumber,
      isLinked: true,
      todayStats: {
        total: todayApps.length,
        waitingCount: waiting.length,
        inVisitPatient: inVisit?.patientName,
        completedCount: completed.length,
        scheduledCount: scheduled.length,
        cancelledCount: cancelled.length
      },
      nextPatient: nextPatientApp ? {
        name: nextPatientApp.patientName,
        timeSlot: nextPatientApp.timeSlot,
        visitType: nextPatientApp.visitType === 'in_person' ? 'حضوری' : 'آنلاین',
        symptomsNote: nextPatientApp.symptomsNote,
        status: nextPatientApp.status
      } : undefined,
      waitingPatients: waiting.map(w => ({
        name: w.patientName,
        timeSlot: w.timeSlot,
        visitType: w.visitType === 'in_person' ? 'حضوری' : 'آنلاین',
        notes: w.symptomsNote
      })),
      pendingTasks: tasks
        .filter(t => t.status !== 'completed')
        .map(t => ({
          id: t.id,
          title: t.title,
          priority: t.priority,
          dueDate: t.dueDate
        })),
      pendingFollowUpsCount: tasks.filter(t => (t.type === 'result_followup' || t.type === 'no_show_followup' || t.type === 'payment_followup') && t.status !== 'completed').length
    };
  },

  /**
   * Build authentic grounded context for the Clinic Manager AI Advisor.
   */
  async buildClinicManagerContext(user: User): Promise<GroundedClinicManagerContext> {
    const clinicId = user.clinicId || '';
    const clinic = clinicId ? await apiService.getClinicById(clinicId) : undefined;
    const overview = clinicId ? await apiService.getClinicTodayOverview(clinicId, user.branchId) : {
      totalTodayAppointments: 0,
      arrivedWaiting: 0,
      inConsultation: 0,
      completed: 0,
      pendingScheduled: 0,
      cancelled: 0,
      activeDoctorsCount: 0,
      activeTasksCount: 0,
      urgentTasksCount: 0,
      estimatedAvgWaitMinutes: 0,
      todayRevenue: 0
    };
    const staff = clinicId ? await apiService.getStaffByClinic(clinicId, user.branchId) : [];
    const doctors = clinicId ? await apiService.getClinicDoctors(clinicId, user.branchId) : [];
    const todayApps = clinicId ? await apiService.getTodayAppointmentsByClinic(clinicId, user.branchId) : [];
    const tasks = clinicId ? await apiService.getTasksByClinic(clinicId, user.branchId) : [];

    const cancelledCount = todayApps.filter(a => a.status === 'canceled').length;
    const noShowCount = todayApps.filter(a => a.status === 'no_show').length;
    const scheduledCount = todayApps.filter(a => a.status === 'scheduled').length;

    const total = overview.totalTodayAppointments || todayApps.length;
    const confirmationRate = total > 0 
      ? `${Math.round(((total - cancelledCount - noShowCount) / total) * 100)}%`
      : 'در دسترس نیست';

    const todayStr = new Date().toISOString().split('T')[0];
    const overdueTasksCount = tasks.filter(t => t.status !== 'completed' && t.dueDate && t.dueDate < todayStr).length;

    return {
      clinicId,
      clinicName: clinic?.name || 'همرا کلینیک (HEMERA CLINIC)',
      branchCount: clinic?.branches?.length || 1,
      overview: {
        totalAppointments: total,
        arrivedWaiting: overview.arrivedWaiting,
        inConsultation: overview.inConsultation,
        completed: overview.completed,
        cancelled: cancelledCount,
        noShow: noShowCount,
        scheduled: scheduledCount,
        confirmationRate,
        estimatedAvgWaitMinutes: overview.estimatedAvgWaitMinutes > 0 ? overview.estimatedAvgWaitMinutes : null,
        todayRevenue: overview.todayRevenue || 0,
        activeTasksCount: overview.activeTasksCount,
        urgentTasksCount: overview.urgentTasksCount,
        overdueTasksCount
      },
      staffSummary: staff.map(s => ({
        id: s.id,
        name: s.name,
        role: s.roleTitle,
        status: s.status,
        activeTasksCount: s.activeTasksCount
      })),
      activeDoctors: doctors.map(d => ({
        id: d.id,
        name: d.name,
        specialty: d.specialtyName
      })),
      activeDoctorsCount: doctors.length
    };
  },

  /**
   * Build authentic grounded context for the Patient AI Care Navigator.
   * Includes real specialties, real doctors, real services, and authenticated patient's own info.
   */
  async buildPatientNavigationContext(
    user?: User,
    pageContextInput?: Partial<PatientPageContext>
  ): Promise<GroundedPatientNavigationContext> {
    const specialties = await apiService.getSpecialties();
    const doctors = await apiService.getDoctors();
    const services = await apiService.getServices();

    // Determine current route and page context safely
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
    let pageContext: PatientPageContext = {
      pageType: 'home',
      route: currentPath,
      ...pageContextInput
    };

    if (!pageContextInput?.pageType) {
      if (currentPath.startsWith('/dr/') || currentPath.startsWith('/doctors/')) {
        const slug = currentPath.split('/')[2];
        const matchedDoc = doctors.find(d => d.slug === slug || d.id === slug);
        pageContext = {
          pageType: currentPath.startsWith('/dr/') ? 'doctor_site' : 'doctor',
          route: currentPath,
          doctorId: matchedDoc?.id,
          doctorSlug: matchedDoc?.slug || slug,
          doctorName: matchedDoc?.name
        };
      } else if (currentPath.startsWith('/patient')) {
        pageContext = {
          pageType: 'patient_portal',
          route: currentPath
        };
      } else if (currentPath.startsWith('/specialties')) {
        const specSlug = currentPath.split('/')[2];
        pageContext = {
          pageType: 'specialties',
          route: currentPath,
          specialtySlug: specSlug
        };
      } else if (currentPath.startsWith('/services')) {
        pageContext = {
          pageType: 'services',
          route: currentPath
        };
      } else if (currentPath.startsWith('/health')) {
        pageContext = {
          pageType: 'health_article',
          route: currentPath
        };
      } else if (currentPath === '/doctors') {
        pageContext = {
          pageType: 'doctors_directory',
          route: currentPath
        };
      }
    }

    // Authenticated patient data (strictly only if user is logged in as patient)
    let authenticatedPatient: GroundedPatientNavigationContext['authenticatedPatient'] = undefined;
    if (user && (user.role === 'patient' || user.role === 'super_admin')) {
      const myApps = await apiService.getMyAppointments(user.id);
      const myRecords = await apiService.getPatientMedicalRecords(user.id);
      
      authenticatedPatient = {
        id: user.id,
        name: user.name,
        upcomingAppointments: myApps
          .filter(a => a.status === 'scheduled' || a.status === 'arrived')
          .slice(0, 5)
          .map(a => ({
            id: a.id,
            doctorName: a.doctorName,
            specialtyName: a.doctorSpecialty,
            timeSlot: a.timeSlot,
            date: a.date,
            status: a.status
          })),
        recordsCount: myRecords.length
      };
    }

    return {
      specialties: specialties.map(s => ({
        id: s.id,
        name: s.name,
        doctorCount: doctors.filter(d => d.specialtyId === s.id).length
      })),
      doctors: doctors.map(d => ({
        id: d.id,
        slug: d.slug,
        name: d.name,
        specialtyId: d.specialtyId,
        specialtyName: d.specialtyName,
        title: d.title,
        rating: d.rating,
        reviewCount: d.reviewCount,
        visitFee: d.consultationFee,
        avatar: d.avatar,
        clinicName: d.clinicName
      })),
      services: services.map(srv => ({
        id: srv.id,
        name: srv.title,
        specialtyId: srv.category,
        price: srv.price
      })),
      pageContext,
      authenticatedPatient
    };
  }
};
