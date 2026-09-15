import { 
  DoctorAiClinicalSummaryResponse, 
  Doctor, 
  PatientAiIntentResponse, 
  PatientPageContext 
} from '../types';
import { 
  GroundedSecretaryContext, 
  GroundedDoctorContext, 
  GroundedClinicManagerContext, 
  GroundedPatientNavigationContext 
} from './aiContextService';
import { apiService } from './apiService';

export const AI_DISCLAIMER = `توجه مهم: این دستیار هوشمند صرفاً جهت راهنمایی، مسیریابی خدمات کلینیک و پشتیبانی اولیه طراحی شده است و به‌هیچ‌عنوان جایگزین تشخیص یا تجویز مستقیم پزشک متخصص نمی‌باشد. در موارد اضطراری فوری با ۱۱۵ تماس بگیرید.`;

export interface CareNavigatorRequest {
  message: string;
  history?: Array<{ sender: 'user' | 'ai'; text: string; intent?: string; specialtyId?: string | null }>;
  context?: Partial<GroundedPatientNavigationContext>;
  activeSpecialtyId?: string | null;
}

export interface CareNavigatorResponse {
  reply: string;
  intent: 'find_doctor' | 'find_specialty' | 'booking_help' | 'patient_appointments' | 'general_info' | 'emergency';
  specialtyId?: string | null;
  doctorId?: string | null;
  urgency?: 'routine' | 'urgent' | 'emergency';
  emergency: boolean;
  matchedDoctors?: Doctor[];
}

/**
 * Helper to match doctors dynamically by specialty ID or doctor ID from actual system data.
 * Zero hardcoded doctor name mappings!
 */
export async function matchDoctorsDynamically(params: {
  specialtyId?: string | null;
  doctorId?: string | null;
  searchQuery?: string;
}): Promise<Doctor[]> {
  const allDoctors = await apiService.getDoctors();

  if (params.doctorId) {
    const matched = allDoctors.filter(d => d.id === params.doctorId || d.slug === params.doctorId);
    if (matched.length > 0) return matched;
  }

  if (params.specialtyId) {
    const targetSpec = params.specialtyId.toLowerCase().trim();
    const matched = allDoctors.filter(d => 
      d.specialtyId.toLowerCase() === targetSpec || 
      d.specialtyName.toLowerCase().includes(targetSpec)
    );
    if (matched.length > 0) return matched;
  }

  if (params.searchQuery) {
    const q = params.searchQuery.toLowerCase().trim();
    return allDoctors.filter(d => 
      d.name.toLowerCase().includes(q) || 
      d.specialtyName.toLowerCase().includes(q) ||
      d.services?.some(s => s.toLowerCase().includes(q))
    );
  }

  return [];
}

/**
 * Ask Care Navigator (Patient AI Assistant)
 * Returns structured intent and dynamically binds actual matching doctors from the clinic database.
 */
export async function askCareNavigator(req: CareNavigatorRequest): Promise<CareNavigatorResponse> {
  const allDoctors = await apiService.getDoctors();
  const allSpecialties = await apiService.getSpecialties();

  // Check previous turns to maintain conversation context (e.g. user says "کدوم دکتر برم؟" after discussing stomach pain)
  let rememberedSpecialtyId = req.activeSpecialtyId || null;
  if (!rememberedSpecialtyId && req.history && req.history.length > 0) {
    for (let i = req.history.length - 1; i >= 0; i--) {
      const turn = req.history[i];
      if (turn.specialtyId) {
        rememberedSpecialtyId = turn.specialtyId;
        break;
      }
      const tText = turn.text.toLowerCase();
      if (tText.includes('معده') || tText.includes('گوارش') || tText.includes('کبد')) {
        rememberedSpecialtyId = 'gastroenterology';
        break;
      } else if (tText.includes('قلب') || tText.includes('فشار') || tText.includes('تپش')) {
        rememberedSpecialtyId = 'cardiology';
        break;
      } else if (tText.includes('پوست') || tText.includes('مو') || tText.includes('جوش')) {
        rememberedSpecialtyId = 'dermatology';
        break;
      } else if (tText.includes('زانو') || tText.includes('کمر') || tText.includes('مفصل') || tText.includes('ارتوپدی')) {
        rememberedSpecialtyId = 'orthopedics';
        break;
      } else if (tText.includes('مغز') || tText.includes('اعصاب') || tText.includes('سردرد')) {
        rememberedSpecialtyId = 'neurology';
        break;
      } else if (tText.includes('کودک') || tText.includes('اطفال')) {
        rememberedSpecialtyId = 'pediatrics';
        break;
      } else if (tText.includes('چشم') || tText.includes('بینایی')) {
        rememberedSpecialtyId = 'ophthalmology';
        break;
      }
    }
  }

  try {
    const res = await fetch('/api/ai/care-navigator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: req.message,
        history: req.history,
        context: req.context || {
          rememberedSpecialtyId
        }
      })
    });

    if (res.ok) {
      const data: PatientAiIntentResponse = await res.json();
      if (data && typeof data.reply === 'string') {
        const resolvedSpecialtyId = data.specialtyId || rememberedSpecialtyId;
        
        let matchedDoctors: Doctor[] = [];
        if (data.doctorId) {
          matchedDoctors = allDoctors.filter(d => d.id === data.doctorId || d.slug === data.doctorId);
        } else if (resolvedSpecialtyId) {
          matchedDoctors = allDoctors.filter(d => 
            d.specialtyId.toLowerCase() === resolvedSpecialtyId.toLowerCase() ||
            d.specialtyName.toLowerCase().includes(resolvedSpecialtyId.toLowerCase())
          );
        }

        return {
          reply: data.reply.trim(),
          intent: data.intent || (matchedDoctors.length > 0 ? 'find_doctor' : 'general_info'),
          specialtyId: resolvedSpecialtyId,
          doctorId: data.doctorId,
          urgency: data.urgency || (data.emergency ? 'emergency' : 'routine'),
          emergency: !!data.emergency,
          matchedDoctors: matchedDoctors.length > 0 ? matchedDoctors : undefined
        };
      }
    }
  } catch (err) {
    console.info('Server Care Navigator endpoint unavailable, using grounded local triage engine:', err);
  }

  // Grounded local triage engine with dynamic doctor resolution & multi-turn memory
  const query = req.message.toLowerCase().trim();
  let detectedSpecialtyId: string | null = null;
  let emergency = false;
  let urgency: 'routine' | 'urgent' | 'emergency' = 'routine';
  let intent: CareNavigatorResponse['intent'] = 'general_info';

  // Red-flag emergency detection
  if (
    query.includes('درد شدید قفسه سینه') || 
    query.includes('سکته') || 
    query.includes('بیهوشی') || 
    query.includes('تنگی نفس شدید') ||
    query.includes('فلج ناگهانی') ||
    query.includes('خونریزی شدید')
  ) {
    emergency = true;
    urgency = 'emergency';
    intent = 'emergency';
    detectedSpecialtyId = 'cardiology';
    return {
      reply: 'هشدار شرایط اضطراری: علائم ذکر شده نیازمند مداخله فوری پزشکی است. لطفاً بدون فوت وقت با اورژانس ۱۱۵ تماس بگیرید یا به نزدیک‌ترین بخش اورژانس بیمارستان مراجعه فرمایید.',
      intent,
      specialtyId: detectedSpecialtyId,
      urgency,
      emergency: true
    };
  }

  // Detect specialty intent from message
  if (query.includes('معده') || query.includes('سوزش معده') || query.includes('کبد') || query.includes('گوارش') || query.includes('روده') || query.includes('یبوست') || query.includes('اسهال')) {
    detectedSpecialtyId = 'gastroenterology';
    intent = 'find_doctor';
  } else if (query.includes('قلب') || query.includes('تپش') || query.includes('فشار') || query.includes('سینه')) {
    detectedSpecialtyId = 'cardiology';
    intent = 'find_doctor';
  } else if (query.includes('پوست') || query.includes('مو') || query.includes('جوش') || query.includes('ریزش مو') || query.includes('زیبایی') || query.includes('لک')) {
    detectedSpecialtyId = 'dermatology';
    intent = 'find_doctor';
  } else if (query.includes('زانو') || query.includes('کمر') || query.includes('مفصل') || query.includes('ارتوپدی') || query.includes('استخوان') || query.includes('دیسک')) {
    detectedSpecialtyId = 'orthopedics';
    intent = 'find_doctor';
  } else if (query.includes('سردرد') || query.includes('میگرن') || query.includes('اعصاب') || query.includes('سرگیجه') || query.includes('تشنج')) {
    detectedSpecialtyId = 'neurology';
    intent = 'find_doctor';
  } else if (query.includes('کودک') || query.includes('اطفال') || query.includes('نوزاد') || query.includes('واکسن')) {
    detectedSpecialtyId = 'pediatrics';
    intent = 'find_doctor';
  } else if (query.includes('چشم') || query.includes('بینایی') || query.includes('تاری دید') || query.includes('عینک')) {
    detectedSpecialtyId = 'ophthalmology';
    intent = 'find_doctor';
  } else if (
    // Multi-turn context resolution: "کدوم دکتر برم؟" or "کدوم متخصص برای مشکل قبلیم مناسب بود؟"
    query.includes('کدوم دکتر') || 
    query.includes('کدام پزشک') || 
    query.includes('کی برم') || 
    query.includes('مشکل قبلی') ||
    query.includes('چه دکتری')
  ) {
    if (rememberedSpecialtyId) {
      detectedSpecialtyId = rememberedSpecialtyId;
      intent = 'find_doctor';
    }
  } else if (query.includes('نوبت') || query.includes('رزرو') || query.includes('ساعت') || query.includes('چگونه')) {
    intent = 'booking_help';
  } else if (query.includes('نوبت‌های من') || query.includes('پیگیری') || query.includes('سوابق من')) {
    intent = 'patient_appointments';
  }

  // Resolve matching doctors dynamically strictly from clinic dataset
  const activeSpec = detectedSpecialtyId || rememberedSpecialtyId;
  let matchedDoctors: Doctor[] = [];
  
  if (activeSpec) {
    matchedDoctors = allDoctors.filter(d => 
      d.specialtyId.toLowerCase() === activeSpec.toLowerCase() ||
      d.specialtyName.toLowerCase().includes(activeSpec.toLowerCase())
    );
  }

  // Generate grounded conservative reply
  const specialtyObj = allSpecialties.find(s => s.id === activeSpec);
  const specName = specialtyObj?.name || (activeSpec ? `متخصص ${activeSpec}` : '');

  let reply = 'به سامانه راهبری سلامت همرا کلینیک (HEMERA CLINIC) خوش آمدید. چگونه می‌توانم در انتخاب تخصص درمانی، پزشک یا نوبت‌دهی به شما کمک کنم؟';

  if (intent === 'booking_help') {
    reply = 'رزرو نوبت در سامانه همرا کلینیک (HEMERA CLINIC) بسیار ساده است: ابتدا پزشک یا تخصص مورد نظر را انتخاب نموده، نوع ویزیت (حضوری در مطب یا مشاوره آنلاین) را تعیین و زمان مناسب را تأیید فرمایید.';
  } else if (intent === 'patient_appointments') {
    if (req.context?.authenticatedPatient) {
      const up = req.context.authenticatedPatient.upcomingAppointments;
      if (up.length > 0) {
        reply = `شما هم‌اکنون ${up.length} نوبت فعال دارید: ${up.map(a => `${a.doctorName} (${a.date} ساعت ${a.timeSlot})`).join('، ')}.`;
      } else {
        reply = 'در حال حاضر هیچ نوبت رزرو شده فعالی برای شما ثبت نشده است. می‌توانید از بخش پزشکان اقدام به دریافت نوبت نمایید.';
      }
    } else {
      reply = 'برای مشاهده نوبت‌ها و پرونده پزشکی اختصاصی خود، لطفاً با شماره همراه وارد پنل کاربری بیمار شوید.';
    }
  } else if (activeSpec && specName) {
    if (matchedDoctors.length > 0) {
      reply = `برای بررسی این علائم، مراجعه به دپارتمان ${specName} کلینیک توصیه می‌شود. پزشکان متخصص فعال در این بخش در ادامه برای نوبت‌گیری آماده هستند.`;
    } else {
      reply = `برای بررسی این علائم، دپارتمان ${specName} پیشنهاد می‌گردد. می‌توانید از بخش تخصص‌ها اطلاعات تکمیلی را مشاهده فرمایید.`;
    }
  }

  return {
    reply,
    intent,
    specialtyId: activeSpec,
    urgency,
    emergency: false,
    matchedDoctors: matchedDoctors.length > 0 ? matchedDoctors : undefined
  };
}

export async function askPatientAiAssistant(userQuery: string): Promise<string> {
  const result = await askCareNavigator({ message: userQuery });
  return result.reply;
}

/**
 * Generate Doctor AI Clinical Summary (Clinical Safety Directives Enforced)
 * Never hallucinates diseases, medications or diagnostic tests unless explicitly in history.
 */
export async function generateDoctorAiClinicalSummary(
  patientName: string,
  history: string
): Promise<DoctorAiClinicalSummaryResponse> {
  try {
    const res = await fetch('/api/ai/copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientName, history })
    });

    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.summary === 'string') {
        return {
          summary: data.summary,
          alerts: Array.isArray(data.alerts) ? data.alerts : [],
          suggestedFocus: Array.isArray(data.suggestedFocus) ? data.suggestedFocus : [],
          missingInformation: Array.isArray(data.missingInformation) ? data.missingInformation : []
        };
      }
    }
  } catch (err) {
    console.info('Server Copilot endpoint unavailable, using conservative local clinical parser:', err);
  }

  // Safe conservative fallback strictly grounded in provided history
  const hasContent = history && history.trim().length > 10;
  
  if (!hasContent) {
    return {
      summary: `شرح حال اولیه برای بیمار ${patientName} در پرونده ثبت نشده است.`,
      alerts: [],
      suggestedFocus: ['اخذ شرح حال کامل و بررسی علت اصلی مراجعه در ویزیت'],
      missingInformation: ['اطلاعات کافی برای استخراج این مورد وجود ندارد. نیاز به ثبت شرح حال اولیه.']
    };
  }

  const alerts: string[] = [];
  const focus: string[] = [];

  if (history.includes('درد قفسه سینه') || history.includes('تپش')) {
    alerts.push('شکایت درد یا ناراحتی قفسه سینه در شرح حال ثبت شده وجود دارد');
    focus.push('بررسی علائم قفسه سینه و معاینه بالینی قلب و عروق');
  }

  if (history.includes('فشار') || history.includes('BP') || history.includes('فشارخون')) {
    alerts.push('سابقه ذکر شده پیرامون فشار خون در پرونده');
    focus.push('سنجش و ثبت دقیق فشار خون در شروع ویزیت');
  }

  if (history.includes('دیابت') || history.includes('قند')) {
    alerts.push('سابقه دیابت یا قند خون در شرح حال');
    focus.push('بررسی قند خون و داروهای مصرفی فعلی');
  }

  return {
    summary: `شرح حال مستند بیمار ${patientName}: ${history.slice(0, 160)}...`,
    alerts: alerts.length > 0 ? alerts : [],
    suggestedFocus: focus.length > 0 ? focus : ['بررسی علائم و شکایات ذکر شده توسط بیمار در ویزیت امروز'],
    missingInformation: ['بررسی سوابق حساسیت‌های دارویی و داروهای مصرفی جاری در ویزیت حضوری']
  };
}

/**
 * Grounded Clinic Operations AI (Secretary, Clinic Manager, Doctor Operations)
 * Uses real data from aiContextService and answers queries using actual statistics.
 */
export async function askClinicOperationsAi(
  role: 'secretary' | 'clinic_manager' | 'doctor',
  userPrompt: string,
  context?: GroundedSecretaryContext | GroundedClinicManagerContext | GroundedDoctorContext | Record<string, any>
): Promise<string> {
  try {
    const res = await fetch('/api/ai/operations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, prompt: userPrompt, context })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.text) {
        return data.text.trim();
      }
    }
  } catch (err) {
    console.info('Server AI operations endpoint unavailable, using grounded local rules:', err);
  }

  // Safe grounded local fallback using EXACT context numbers
  const p = userPrompt.toLowerCase().trim();

  // 1. SECRETARY COPILOT
  if (role === 'secretary') {
    const secCtx = context as GroundedSecretaryContext;
    const todayTotal = secCtx?.todayStats?.total ?? 0;
    const waitingCount = secCtx?.todayStats?.waiting ?? 0;
    const completedCount = secCtx?.todayStats?.completed ?? 0;
    const scheduledCount = secCtx?.todayStats?.scheduled ?? 0;
    const urgentTasks = secCtx?.urgentTasks ?? [];
    const urgentCount = urgentTasks.length;

    if (p.includes('چند نوبت') || p.includes('نوبت امروز') || p.includes('امروز چند')) {
      return `امروز مجموعاً ${todayTotal} نوبت در کلینیک ثبت شده است (شامل ${waitingCount} بیمار در سالن انتظار، ${completedCount} ویزیت تکمیل شده، و ${scheduledCount} نوبت رزرو شده).`;
    }

    if (p.includes('انتظار') || p.includes('سالن') || p.includes('صف') || p.includes('شلوغ')) {
      if (waitingCount === 0) {
        return 'هم‌اکنون هیچ بیماری در سالن انتظار اعلام حضور نکرده و سالن انتظار خلوت است.';
      }
      const names = secCtx?.waitingList?.map(w => `${w.patientName} (${w.doctorName})`).join('، ');
      return `هم‌اکنون ${waitingCount} بیمار در سالن انتظار حاضر هستند: ${names}.`;
    }

    if (p.includes('تسک') || p.includes('فوری') || p.includes('وظایف')) {
      if (urgentCount === 0) {
        return 'در حال حاضر هیچ وظیفه فوری یا اضطراری ثبت شده‌ای در کارتابل منشی وجود ندارد.';
      }
      const taskTitles = urgentTasks.map(t => t.title).join(' | ');
      return `تعداد ${urgentCount} وظیفه فوری نیازمند پیگیری در کارتابل ثبت شده است: ${taskTitles}.`;
    }

    if (p.includes('پیامک') || p.includes('یادآوری') || p.includes('فردا')) {
      return `بر اساس ${todayTotal} نوبت فعال امروز، الگوهای پیامک یادآوری و آمادگی ویزیت در پنل پیامک آماده ارسال هستند.`;
    }

    return `دستیار هوشمند منشی: سیستم با ${todayTotal} نوبت امروز و ${waitingCount} بیمار در سالن انتظار آماده مدیریت شیفت است.`;
  }

  // 2. CLINIC MANAGER ADVISOR
  if (role === 'clinic_manager') {
    const mgrCtx = context as GroundedClinicManagerContext;
    const totalToday = mgrCtx?.overview?.totalAppointments ?? 0;
    const waiting = mgrCtx?.overview?.arrivedWaiting ?? 0;
    const inConsult = mgrCtx?.overview?.inConsultation ?? 0;
    const completed = mgrCtx?.overview?.completed ?? 0;
    const activeDocs = mgrCtx?.activeDoctorsCount ?? 0;
    const confRate = mgrCtx?.overview?.confirmationRate ?? 'در دسترس نیست';
    const revenue = mgrCtx?.overview?.todayRevenue ?? 0;
    const urgentTasks = mgrCtx?.overview?.urgentTasksCount ?? 0;

    if (p.includes('چند بیمار در انتظار') || p.includes('انتظار') || p.includes('صف')) {
      return `هم‌اکنون ${waiting} بیمار در صف انتظار کلینیک اعلام حضور کرده و ${inConsult} بیمار در حال ویزیت هستند.`;
    }

    if (p.includes('گزارش') || p.includes('تحلیل') || p.includes('بهره‌وری') || p.includes('وضعیت')) {
      return `گزارش عملیات کلینیک: مجموع ${totalToday} نوبت ثبت شده، ${completed} ویزیت خاتمه‌یافته، ${waiting} نفر در انتظار، و ${activeDocs} پزشک فعال در کلینیک حضور دارند. نرخ تأیید نوبت‌ها ${confRate} و درآمد ثبت شده امروز ${revenue.toLocaleString('fa-IR')} تومان است.`;
    }

    if (p.includes('پرسنل') || p.includes('وظایف') || p.includes('تسک')) {
      return `پرسنل کلینیک با ${urgentTasks} وظیفه فوری و ${mgrCtx?.overview?.activeTasksCount ?? 0} وظیفه باز در شیفت جاری در حال فعالیت هستند.`;
    }

    return `مشاور مدیریت: کلیه شاخص‌های عملیاتی کلینیک با ${totalToday} نوبت امروز و ${activeDocs} پزشک فعال در حال رصد هستند.`;
  }

  // 3. DOCTOR OPERATIONS COPILOT
  if (role === 'doctor') {
    const docCtx = context as GroundedDoctorContext;
    if (!docCtx?.isLinked) {
      return 'پروفایل پزشکی متصل نشده است. لطفاً جهت اتصال به کلینیک با مدیر سیستم تماس بگیرید.';
    }

    const nextPat = docCtx.nextPatient;
    const totalApps = docCtx.todayStats?.total ?? 0;
    const waitingCount = docCtx.todayStats?.waitingCount ?? 0;

    if (p.includes('بیمار بعدی') || p.includes('نفر بعدی') || p.includes('کیست')) {
      if (nextPat) {
        return `بیمار بعدی شما «${nextPat.name}» در ساعت ${nextPat.timeSlot} (${nextPat.visitType}) می‌باشد.${nextPat.symptomsNote ? ` علت مراجعه: ${nextPat.symptomsNote}` : ''}`;
      }
      return 'در حال حاضر هیچ بیمار جدیدی در صف نوبت‌های شیفت امروز ثبت نشده است.';
    }

    if (p.includes('چند نوبت') || p.includes('نوبت‌های من') || p.includes('وضعیت شیفت')) {
      return `شما امروز مجموعاً ${totalApps} نوبت دارید (${waitingCount} بیمار حاضر در سالن انتظار و ${docCtx.todayStats?.completedCount ?? 0} ویزیت انجام شده).`;
    }

    return `دستیار بالینی پزشک: شیفت کاری ${docCtx.doctorName} با ${totalApps} نوبت امروز در دسترس است.`;
  }

  return 'دستیار هوشمند آماده پاسخگویی و ارائه تحلیل بر اساس داده‌های واقعی سامانه است.';
}
