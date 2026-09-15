import {
  Doctor,
  Specialty,
  ServiceItem,
  SymptomGuide,
  Appointment,
  MedicalRecord,
  FamilyMember,
  Review,
  HealthArticle,
  DiseaseCondition,
  PatientCRMRecord,
  AdminKPIs,
  User,
  VisitType,
  AppointmentStatus,
  Clinic,
  ClinicStaff,
  ClinicTask,
  ActivityLog,
  ClinicAutomationRule,
  ClinicNotification,
  DoctorClinicMembership,
  InsuranceCompany,
  DoctorSchedule,
  ScheduleBlock
} from '../types';
import { getRelativeISODate } from '../utils/dateUtils';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-patient-1',
    name: 'امیرحسین رضایی',
    phone: '09121112233',
    role: 'patient',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    nationalId: '0012345678',
    email: 'a.rezaei@example.com'
  },
  {
    id: 'user-doctor-1',
    name: 'دکتر مریم حسینی',
    phone: '09123334455',
    role: 'doctor',
    doctorId: 'doc-1',
    clinicId: 'clinic-1',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
    nationalId: '0023456789'
  },
  {
    id: 'user-doctor-2',
    name: 'دکتر علیرضا کریمی',
    phone: '09122223344',
    role: 'doctor',
    doctorId: 'doc-2',
    clinicId: 'clinic-1',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
    nationalId: '0034567890'
  },
  {
    id: 'user-doctor-3',
    name: 'دکتر سارا محمدی',
    phone: '09124445566',
    role: 'doctor',
    doctorId: 'doc-3',
    clinicId: 'clinic-1',
    avatar: 'https://images.unsplash.com/photo-1594824813515-5853b05f2425?auto=format&fit=crop&q=80&w=300',
    nationalId: '0045678901'
  },
  {
    id: 'user-secretary-1',
    name: 'سارا کاظمی',
    phone: '09125556677',
    role: 'secretary',
    clinicId: 'clinic-1',
    branchId: 'branch-1',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'user-reception-1',
    name: 'سارا کاظمی (پذیرش مرکزی)',
    phone: '09125556677',
    role: 'reception',
    clinicId: 'clinic-1',
    branchId: 'branch-1',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'user-clinic-manager-1',
    name: 'مهندس علیرضا صبوری',
    phone: '09128889911',
    role: 'clinic_manager',
    clinicId: 'clinic-1',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'user-superadmin-1',
    name: 'مدیر ارشد سامانه همرا کلینیک (HEMERA CLINIC)',
    phone: '09129990000',
    role: 'super_admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'user-admin-1',
    name: 'مدیر سیستم و IT کلینیک',
    phone: '09129990011',
    role: 'admin',
    clinicId: 'clinic-1',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150'
  }
];

export const MOCK_PATIENTS: User[] = [
  { id: 'patient-1', name: 'امیرحسین رضایی', phone: '09121112233', role: 'patient', nationalId: '0012345678', email: 'a.rezaei@example.com' },
  { id: 'patient-2', name: 'زهرا نوری', phone: '09122223344', role: 'patient', nationalId: '0023456781', email: 'z.noori@example.com' },
  { id: 'patient-3', name: 'حسین کاظمی', phone: '09123334455', role: 'patient', nationalId: '0034567892', email: 'h.kazemi@example.com' },
  { id: 'patient-4', name: 'فرشته احمدی', phone: '09124445566', role: 'patient', nationalId: '0045678903', email: 'f.ahmadi@example.com' },
  { id: 'patient-5', name: 'کامران امیری', phone: '09125556677', role: 'patient', nationalId: '0056789014', email: 'k.amiri@example.com' },
  { id: 'patient-6', name: 'مریم محمودی', phone: '09126667788', role: 'patient', nationalId: '0067890125', email: 'm.mahmoudi@example.com' },
  { id: 'patient-7', name: 'رضا جلالی', phone: '09127778899', role: 'patient', nationalId: '0078901236', email: 'r.jalali@example.com' },
  { id: 'patient-8', name: 'سمیرا بهرامی', phone: '09128889900', role: 'patient', nationalId: '0089012347', email: 's.bahrami@example.com' },
  { id: 'patient-9', name: 'محسن کریمیان', phone: '09129990011', role: 'patient', nationalId: '0090123458', email: 'm.karimian@example.com' },
  { id: 'patient-10', name: 'نرگس شریفی', phone: '09120001122', role: 'patient', nationalId: '0101234569', email: 'n.sharifi@example.com' }
];

export const SPECIALTIES: Specialty[] = [
  {
    id: 'spec-cardio',
    slug: 'cardiology',
    name: 'قلب و عروق',
    englishName: 'Cardiology',
    icon: 'Heart',
    doctorCount: 8,
    description: 'تشخیص، درمان و پایش بیماری‌های قلب، عروق کرونر، فشار خون و آریتمی',
    popularSymptoms: ['درد قفسه سینه', 'تپش قلب', 'تنگی نفس هنگام فعالیت', 'فشار خون بالا']
  },
  {
    id: 'spec-gastro',
    slug: 'gastroenterology',
    name: 'گوارش و کبد',
    englishName: 'Gastroenterology',
    icon: 'Activity',
    doctorCount: 6,
    description: 'درمان مشکلات معده، روده، کبد چرب، ریفلاکس و سندرم روده تحریک‌پذیر',
    popularSymptoms: ['معده درد و سوزش', 'نفخ شدید', 'کبد چرب', 'تهوع و بی‌اشتهایی']
  },
  {
    id: 'spec-derm',
    slug: 'dermatology',
    name: 'پوست، مو و زیبایی',
    englishName: 'Dermatology',
    icon: 'Sparkles',
    doctorCount: 9,
    description: 'تشخیص بیماری‌های پوستی، درمان ریزش مو، آکنه و خدمات جوانسازی تخصصی',
    popularSymptoms: ['ریزش مو', 'آکنه و جوش', 'خارش و حساسیت پوستی', 'لکه‌های پوستی']
  },
  {
    id: 'spec-obgyn',
    slug: 'gynecology',
    name: 'زنان و زایمان',
    englishName: 'Gynecology & Obstetrics',
    icon: 'User',
    doctorCount: 7,
    description: 'مراقبت‌های دوران بارداری، غربالگری‌ها، نازایی و جراحی‌های تخصصی زنان',
    popularSymptoms: ['مراقبت بارداری', 'اختلالات قاعدگی', 'چکاپ سلامت زنان', 'سونوگرافی بارداری']
  },
  {
    id: 'spec-pediatrics',
    slug: 'pediatrics',
    name: 'اطفال و کودکان',
    englishName: 'Pediatrics',
    icon: 'Baby',
    doctorCount: 5,
    description: 'پایش رشد و تکامل نوزاد و کودک، واکسیناسیون و درمان بیماری‌های عفونی کودکان',
    popularSymptoms: ['تب کودک', 'سرفه و سرماخوردگی', 'پایش رشد نوزاد', 'کاهش اشتها']
  },
  {
    id: 'spec-ortho',
    slug: 'orthopedics',
    name: 'ارتوپدی و مفاصل',
    englishName: 'Orthopedics',
    icon: 'Bone',
    doctorCount: 6,
    description: 'جراحی و درمان غیرجراحی زانو، ستون فقرات، دیسک کمر، شکستگی‌ها و آرتروز',
    popularSymptoms: ['زانودرد', 'دیسک کمر و گردن', 'درد مفاصل', 'آسیب‌های ورزشی']
  },
  {
    id: 'spec-neuro',
    slug: 'neurology',
    name: 'مغز و اعصاب (نورولوژی)',
    englishName: 'Neurology',
    icon: 'Brain',
    doctorCount: 4,
    description: 'درمان سردردهای مزمن، میگرن، تشنج، ام‌اس و اختلالات حافظه و خواب',
    popularSymptoms: ['سردرد میگرنی', 'سرگیجه', 'بی‌حسی دست و پا', 'اختلال خواب']
  },
  {
    id: 'spec-psych',
    slug: 'psychiatry',
    name: 'روانپزشکی و روانشناسی',
    englishName: 'Psychiatry',
    icon: 'Smile',
    doctorCount: 5,
    description: 'مشاوره روانی، درمان افسردگی، اضطراب، وسواس و مشاوره خانواده و فردی',
    popularSymptoms: ['اضطراب و استرس', 'افسردگی', 'حملات پانیک', 'وسواس فکری']
  },
  {
    id: 'spec-ophthalmo',
    slug: 'ophthalmology',
    name: 'چشم‌پزشکی',
    englishName: 'Ophthalmology',
    icon: 'Eye',
    doctorCount: 4,
    description: 'معایب انکساری، عینک و لنز، آب مروارید، لیزیک و جراحی‌های تخصصی چشم',
    popularSymptoms: ['ضعف بینایی', 'قرمزی و سوزش چشم', 'آب مروارید', 'خشکی چشم']
  },
  {
    id: 'spec-ent',
    slug: 'ent',
    name: 'گوش، حلق و بینی',
    englishName: 'ENT',
    icon: 'Stethoscope',
    doctorCount: 4,
    description: 'جراحی بینی، درمان سینوزیت مزمن، اختلالات شنوایی و مشکلات حنجره',
    popularSymptoms: ['گرفتگی بینی', 'سینوزیت', 'گوش‌درد و افت شنوایی', 'پلیپ بینی']
  },
  {
    id: 'spec-dental',
    slug: 'dentistry',
    name: 'دندانپزشکی و ایمپلنت',
    englishName: 'Dentistry',
    icon: 'Smile',
    doctorCount: 5,
    description: 'ترمیم، عصب‌کشی، لمینت، ایمپلنت دیجیتال، ارتودنسی و جراحی فک و دندان',
    popularSymptoms: ['دندان‌درد', 'خونریزی لثه', 'پوسیدگی دندان', 'ایمپلنت و زیبایی دندان']
  },
  {
    id: 'spec-urology',
    slug: 'urology',
    name: 'کلیه و مجاری ادراری (ارولوژی)',
    englishName: 'Urology',
    icon: 'Activity',
    doctorCount: 4,
    description: 'درمان سنگ کلیه با لیزر، پروستات، عفونت‌های ادراری و جراحی‌های سیستم تناسلی',
    popularSymptoms: ['سنگ کلیه', 'سوزش ادرار', 'مشکلات پروستات', 'درد پهلو']
  },
  {
    id: 'spec-pulmonology',
    slug: 'pulmonology',
    name: 'ریه و دستگاه تنفسی',
    englishName: 'Pulmonology',
    icon: 'Activity',
    doctorCount: 3,
    description: 'درمان آسم، آلرژی‌های فصلی، برونشیت مزمن، عفونت‌های ریوی و اسپیرومتری',
    popularSymptoms: ['تنگی نفس', 'سرفه‌های مزمن', 'خس‌خس سینه', 'آلرژی تنفسی']
  },
  {
    id: 'spec-endocrinology',
    slug: 'endocrinology',
    name: 'غدد، دیابت و متابولیسم',
    englishName: 'Endocrinology',
    icon: 'Activity',
    doctorCount: 4,
    description: 'تنظیم تیروئید، کنترل پیشرفته دیابت، اختلالات چربی خون و رشد',
    popularSymptoms: ['کم‌کاری یا پرکاری تیروئید', 'دیابت و قند بالا', 'چاقی مفرط', 'اختلال هورمونی']
  },
  {
    id: 'spec-rheumatology',
    slug: 'rheumatology',
    name: 'روماتولوژی و مفاصل خودایمنی',
    englishName: 'Rheumatology',
    icon: 'Bone',
    doctorCount: 3,
    description: 'تشخیص و درمان روماتیسم مفصلی، لوپوس، نقرس و خشکی صبحگاهی مفاصل',
    popularSymptoms: ['تورم و خشکی مفاصل', 'روماتیسم', 'نقرس', 'درد عضلانی گسترده']
  },
  {
    id: 'spec-gen-surgery',
    slug: 'general-surgery',
    name: 'جراحی عمومی و لاپاراسکوپی',
    englishName: 'General Surgery',
    icon: 'Stethoscope',
    doctorCount: 4,
    description: 'جراحی فتق، آپاندیس، کیسه صفرا با لاپاراسکوپی، توده‌های خوش‌خیم و کیست‌ها',
    popularSymptoms: ['درد کیسه صفرا', 'فتق شکمی', 'توده‌های چربی و کیست', 'جراحی سرپایی']
  }
];

export const MOCK_DOCTORS: Doctor[] = [
  {
    id: 'doc-1',
    slug: 'dr-maryam-hosseini',
    name: 'دکتر مریم حسینی',
    title: 'فوق تخصص آنژیوپلاستی و بیماری‌های قلب و عروق',
    medicalCouncilNumber: '۴۸۱۲۵',
    specialtyId: 'spec-cardio',
    specialtyName: 'قلب و عروق',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
    rating: 4.9,
    reviewCount: 342,
    experienceYears: 18,
    city: 'تهران',
    address: 'همرا کلینیک (HEMERA) - شعبه سعادت‌آباد، طبقه ۴، واحد ۴۰۲',
    bio: 'دکتر مریم حسینی فارغ‌التحصیل فوق‌تخصصی اینترونشنال کاردیولوژی از دانشگاه علوم پزشکی تهران با ۱۸ سال سابقه درخشان در آنژیوپلاستی عروق کرونر، درمان فشار خون مقاوم و اکوکاردیوگرافی پیشرفته.',
    education: [
      'فوق تخصص اینترونشنال کاردیولوژی از دانشگاه علوم پزشکی تهران',
      'تخصص بیماری‌های قلب و عروق با رتبه اول بورد کشوری',
      'عضو انجمن قلب آمریکا (AHA) و انجمن قلب ایران',
      'فلوشیپ آنژیوپلاستی عروق محیطی از زوریخ سوئیس'
    ],
    services: [
      'آنژیوگرافی و آنژیوپلاستی عروق کرونر',
      'اکوکاردیوگرافی رنگی و داپلر بافتی',
      'تست ورزش و هولتر مانیتورینگ فشار و ریتم',
      'مدیریت نارسایی قلبی و تنظیم داروهای فشار خون',
      'مشاوره قلب قبل از جراحی‌های عمومی'
    ],
    detailedServices: [
      {
        id: 'srv-101',
        title: 'آنژیوگرافی و استنت‌گذاری عروق کرونر',
        description: 'بررسی دقیق انسداد عروق تغذیه‌کننده قلب و تعبیه استنت‌های دارویی نسل جدید با کمترین تهاجم.',
        durationMinutes: 45,
        bookingEnabled: true,
        price: 1200000,
        featured: true
      },
      {
        id: 'srv-102',
        title: 'اکوکاردیوگرافی رنگی پیشرفته (۲D & Doppler)',
        description: 'ارزیابی عملکرد بطن چپ، سلامت دریچه‌های قلبی و فشار شریان ریوی با دستگاه پیشرفته GE.',
        durationMinutes: 30,
        bookingEnabled: true,
        price: 450000,
        featured: true
      },
      {
        id: 'srv-103',
        title: 'تست ورزش قلب و ارزیابی تنگی نفس',
        description: 'پایش الکتروکاردیوگرام در حین فعالیت فیزیکی کنترل‌شده جهت تشخیص زودهنگام ایسکمی قلبی.',
        durationMinutes: 40,
        bookingEnabled: true,
        price: 380000,
        featured: false
      },
      {
        id: 'srv-104',
        title: 'هولتر مانیتورینگ ۲۴ ساعته فشار خون و ریتم',
        description: 'ثبت پیوسته نوسانات فشار خون و آریتمی‌های پنهان قلبی در طول شبانه‌روز در منزل.',
        durationMinutes: 20,
        bookingEnabled: true,
        price: 320000,
        featured: false
      }
    ],
    offices: [
      {
        id: 'off-1',
        title: 'مطب اصلی - کلینیک فوق تخصصی قلب همرا کلینیک',
        city: 'تهران',
        address: 'سعادت‌آباد، میدان کاج، خیابان سرو غربی، مجتمع پزشکی همرا کلینیک (HEMERA)، طبقه ۴، واحد ۴۰۲',
        phone: '۰۲۱-۲۲۱۴۵۶۷۸',
        workingHours: 'شنبه تا چهارشنبه: ۱۶:۰۰ الی ۲۰:۳۰',
        appointmentEnabled: true,
        inPersonEnabled: true,
        note: 'دارای پارکینگ اختصاصی مراجعین و دسترسی آسان برای ویلچر',
        clinicId: 'clinic-1',
        branchId: 'branch-1'
      },
      {
        id: 'off-2',
        title: 'کلینیک مشاوره و اکوکاردیوگرافی ونک',
        city: 'تهران',
        address: 'میدان ونک، خیابان ملاصدرا، جنب بیمارستان بقیه‌الله، ساختمان پزشکان ونک، طبقه ۲',
        phone: '۰۲۱-۸۸۷۷۶۶۵۵',
        workingHours: 'دوشنبه‌ها و پنج‌شنبه‌ها: ۰۹:۰۰ الی ۱۳:۳۰',
        appointmentEnabled: true,
        inPersonEnabled: true,
        note: 'ویژه چکاپ بیماران آنژیوگرافی‌شده و هولتر مانیتورینگ',
        clinicId: 'clinic-1',
        branchId: 'branch-2'
      }
    ],
    achievements: [
      {
        id: 'ach-1',
        title: 'رتبه اول بورد فوق‌تخصصی اینترونشنال کاردیولوژی',
        year: '۱۳۹۲',
        issuer: 'وزارت بهداشت و آموزش پزشکی',
        description: 'کسب بالاترین امتیاز در آزمون جامع بورد فوق‌تخصصی کشور',
        category: 'academic'
      },
      {
        id: 'ach-2',
        title: 'عضو پیوسته انجمن قلب آمریکا (Fellow of AHA)',
        year: '۱۳۹۶',
        issuer: 'American Heart Association',
        description: 'عضویت رسمی در دپارتمان اینترونشنال و نارسایی قلبی',
        category: 'membership'
      },
      {
        id: 'ach-3',
        title: 'پزشک برگزیده جشنواره بالینی همرا کلینیک',
        year: '۱۴۰۴',
        issuer: 'بنیاد سلامت و درمان همرا کلینیک (HEMERA CLINIC)',
        description: 'کسب رضایت ۹۸.۷ درصدی مراجعین و بیش از ۳۰۰۰ آنژیوپلاستی موفق',
        category: 'award'
      },
      {
        id: 'ach-4',
        title: 'سخنران مدعو در کنگره بین‌المللی عروق کرونر استانبول',
        year: '۱۴۰۳',
        issuer: 'European Society of Cardiology',
        description: 'ارائه مقاله روش‌های نوین استنت‌گذاری در بیماران دیابتی',
        category: 'conference'
      }
    ],
    faqs: [
      {
        id: 'faq-1',
        question: 'برای انجام اکوکاردیوگرافی یا تست ورزش چه آمادگی قبلی لازم است؟',
        answer: 'برای تست ورزش لباس راحت و کفش ورزشی به همراه داشته باشید و حداقل ۳ ساعت قبل از تست غذای سنگین میل نکنید. برای اکوکاردیوگرافی نیازی به ناشتایی نیست.',
        category: 'آمادگی ویزیت'
      },
      {
        id: 'faq-2',
        question: 'آیا برای تمدید نسخه یا تفسیر آزمایش‌های قبلی مشاوره آنلاین کافی است؟',
        answer: 'بله، از طریق نوبت آنلاین تصویری یا پیام صوتی می‌توانید آزمایش‌ها، اکو و نوار قلب‌های پیشین را ارسال نموده و نسخه الکترونیک معتبر دریافت کنید.',
        category: 'مشاوره آنلاین'
      },
      {
        id: 'faq-3',
        question: 'کدام بیمه‌های پایه و تکمیلی در مطب پذیرش می‌شوند؟',
        answer: 'اطلاعات بیمه در نسخه فعلی نمایشی است و به سامانه آنلاین بیمه متصل نیست. در صورت نیاز، پس از ویزیت گواهی و صورتحساب جهت ارائه به شرکت‌های بیمه صادر می‌شود.',
        category: 'بیمه و پرداخت'
      }
    ],
    gallery: [
      {
        id: 'gal-1',
        title: 'دستگاه اکوکاردیوگرافی پیشرفته بافت قلب',
        imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=600',
        category: 'تجهیزات مطب'
      },
      {
        id: 'gal-2',
        title: 'اتاق مانیتورینگ و تست ورزش استاندارد',
        imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=600',
        category: 'فضای بالینی'
      },
      {
        id: 'gal-3',
        title: 'سالن آرام انتظار و پذیرش بیماران',
        imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=600',
        category: 'محیط مطب'
      }
    ],
    websiteConfig: {
      websiteStatus: 'published',
      websiteEnabled: true,
      websitePublished: true,
      websiteTheme: 'modern-specialist',
      brandPrimaryColor: '#0f766e',
      brandAccentColor: '#0284c7',
      heroTitle: 'فوق تخصص بیماری‌های قلب، عروق و آنژیوپلاستی',
      heroSubtitle: 'ارائه پیشرفته‌ترین خدمات تشخیصی، اکوکاردیوگرافی رنگی و مراقبت‌های کرونری با استاندارد روز بین‌المللی',
      shortIntroduction: 'با ۱۸ سال تجربه بالینی و دانشگاهی، همراه شما در مسیر حفظ سلامت قلب، پیشگیری از سکته‌های قلبی و تنظیم دقیق فشار خون هستیم.',
      detailedBiography: 'دکتر مریم حسینی، فوق تخصص اینترونشنال کاردیولوژی، دوره‌های تکمیلی آنژیوپلاستی عروق پیچیده را در دانشگاه علوم پزشکی تهران و مراکز معتبر قلب اروپا گذرانده‌اند. ایشان با تمرکز بر پیشگیری اولیه، کنترل علمی فشار خون و بهره‌گیری از تجهیزات استاندارد روز دنیا، تاکنون جان هزاران بیمار قلبی را نجات داده و با افتخار در خدمت سلامت هموطنان عزیز می‌باشند.',
      websiteSubdomain: 'dr-maryam.hamrah.ir',
      customDomain: 'dr-hosseini.ir',
      seoTitle: 'دکتر مریم حسینی | فوق تخصص قلب و عروق و آنژیوپلاستی | وبسایت رسمی',
      seoDescription: 'وبسایت رسمی دکتر مریم حسینی فوق تخصص قلب و عروق. دریافت نوبت ویزیت حضوری در سعادت‌آباد و ونک، مشاوره آنلاین تصویری، مقالات و راهنمای سلامت قلب.',
      phone: '۰۲۱-۲۲۱۴۵۶۷۸',
      whatsapp: '09123334455',
      email: 'contact@dr-hosseini.ir',
      socialLinks: {
        instagram: 'dr.maryam_hosseini',
        linkedin: 'maryam-hosseini-md',
        telegram: 'dr_hosseini_cardio',
        whatsapp: '+989123334455'
      },
      sectionVisibility: {
        about: true,
        services: true,
        achievements: true,
        articles: true,
        gallery: true,
        faq: true,
        reviews: true,
        offices: true
      }
    },
    supportedInsurances: ['تأمین اجتماعی', 'خدمات درمانی', 'بیمه سلامت', 'ایران', 'دانا', 'پاسارگاد'],
    languages: ['فارسی', 'انگلیسی'],
    consultationFee: 350000,
    onlineConsultationFee: 280000,
    hasOnlineConsultation: true,
    nextAvailableSlot: 'امروز ۱۷:۳۰',
    gender: 'female'
  },
  {
    id: 'doc-2',
    slug: 'dr-alireza-karimi',
    name: 'دکتر علیرضا کریمی',
    title: 'متخصص بیماری‌های گوارش، کبد و اندوسکوپی پیشرفته',
    medicalCouncilNumber: '۵۳۹۸۰',
    specialtyId: 'spec-gastro',
    specialtyName: 'گوارش و کبد',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
    rating: 4.8,
    reviewCount: 289,
    experienceYears: 15,
    city: 'تهران',
    address: 'همرا کلینیک (HEMERA) - شعبه ونک، طبقه ۲، واحد ۲۰۵',
    bio: 'استاد دانشگاه و متخصص گوارش با تمرکز بر درمان زخم‌های معده، کبد چرب گرید ۱ تا ۳، میکروب معده (هلیکوباکتر) و کولونوسکوپی بدون درد.',
    education: [
      'تخصص گوارش و کبد از دانشگاه شهید بهشتی',
      'دوره تکمیلی اندوسکوپی درمانی و پولیپکتومی از وین اتریش',
      'عضو انجمن جهانی گوارش و کبد (WGO)'
    ],
    services: [
      'اندوسکوپی فوقانی و کولونوسکوپی تشخیصی و درمانی',
      'درمان کبد چرب، کبد الکلی و فیبرواسکن',
      'مدیریت سندرم روده تحریک‌پذیر (IBS) و کولیت اولسروز',
      'غربالگری زودهنگام پولیپ‌ها و سرطان‌های دستگاه گوارش'
    ],
    detailedServices: [
      {
        id: 'srv-201',
        title: 'کولونوسکوپی با بیهوشی ملایم و بدون درد',
        description: 'بررسی کامل روده بزرگ و برداشتن پولیپ‌های مخاطی با پیشرفته‌ترین لنزهای HD بدون احساس درد.',
        durationMinutes: 45,
        bookingEnabled: true,
        price: 950000,
        featured: true
      },
      {
        id: 'srv-202',
        title: 'اندوسکوپی معده و بررسی هلیکوباکتر پیلوری',
        description: 'تشخیص دقیق ریفلاکس اسید، زخم معده و اثنی‌عشر با نمونه‌برداری سریع اوره‌آز.',
        durationMinutes: 30,
        bookingEnabled: true,
        price: 650000,
        featured: true
      },
      {
        id: 'srv-203',
        title: 'پایش و درمان تخصصی کبد چرب (گرید ۱ تا ۳)',
        description: 'تنظیم برنامه تغذیه درمانی، بررسی آنزیم‌های کبدی و کاهش چربی احشایی.',
        durationMinutes: 25,
        bookingEnabled: true,
        price: 320000,
        featured: false
      }
    ],
    offices: [
      {
        id: 'off-201',
        title: 'کلینیک گوارش و اندوسکوپی ونک',
        city: 'تهران',
        address: 'میدان ونک، تقاطع حقانی و گاندی شمالی، ساختمان پزشکان همرا کلینیک ونک (HEMERA)، طبقه ۲، واحد ۲۰۵',
        phone: '۰۲۱-۸۸۶۶۴۴۲۲',
        workingHours: 'روزهای زوج: ۱۵:۰۰ الی ۲۱:۰۰',
        appointmentEnabled: true,
        inPersonEnabled: true,
        note: 'مجهز به اتاق ریکاوری و سوئیت آندوسکوپی استاندارد',
        clinicId: 'clinic-1',
        branchId: 'branch-2'
      },
      {
        id: 'off-202',
        title: 'مطب جردن (نلسون ماندلا)',
        city: 'تهران',
        address: 'بلوار آفریقا (جردن)، بعد از پل میرداماد، کوچه تابان شرقی، پلاک ۱۲',
        phone: '۰۲۱-۲۲۰۵۶۷۸۹',
        workingHours: 'یکشنبه و سه‌شنبه: ۱۰:۰۰ الی ۱۴:۰۰',
        appointmentEnabled: true,
        inPersonEnabled: true,
        clinicId: 'clinic-1',
        branchId: 'branch-2'
      }
    ],
    achievements: [
      {
        id: 'ach-201',
        title: 'گواهینامه اندوسکوپی درمانی پیشرفته از اتریش',
        year: '۱۳۹۵',
        issuer: 'Medical University of Vienna',
        description: 'تکمیل دوره پولیپکتومی عمیق و اندوگاستروپلاستی',
        category: 'certification'
      },
      {
        id: 'ach-202',
        title: 'عضو انجمن متخصصین کبد و گوارش ایران (IAGH)',
        year: '۱۳۹۱',
        issuer: 'انجمن گوارش و کبد ایران',
        description: 'پژوهشگر ارشد در زمینه شیوع هلیکوباکتر در خاورمیانه',
        category: 'membership'
      }
    ],
    faqs: [
      {
        id: 'faq-201',
        question: 'برای انجام آندوسکوپی چند ساعت باید ناشتا بود؟',
        answer: 'حداقل ۸ ساعت ناشتایی کامل (حتی از نوشیدن آب) قبل از آندوسکوپی الزامی است. داروهای ضروری را با مقدار بسیار کم آب میل فرمایید.',
        category: 'آمادگی آزمایش'
      },
      {
        id: 'faq-202',
        question: 'آیا کولونوسکوپی با بیهوشی انجام می‌شود؟',
        answer: 'بله، تحت نظر متخصص بیهوشی با آرام‌بخش سبک (سدیشن) انجام می‌شود و بیمار هیچ‌گونه درد یا ناراحتی حس نخواهد کرد.',
        category: 'فرایند درمان'
      }
    ],
    gallery: [
      {
        id: 'gal-201',
        title: 'سوئیت اندوسکوپی با سیستم استریلیزاسیون خودکار',
        imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=600',
        category: 'اتاق عمل سرپایی'
      }
    ],
    websiteConfig: {
      websiteStatus: 'draft',
      websiteEnabled: true,
      websitePublished: false,
      websiteTheme: 'clinical-minimal',
      brandPrimaryColor: '#059669',
      brandAccentColor: '#0d9488',
      heroTitle: 'متخصص گوارش، کبد و کولونوسکوپی بدون درد',
      heroSubtitle: 'تشخیص و درمان علمی اختلالات گوارشی، کبد چرب و پولیپ‌های روده با متدهای نوین آندوسکوپی',
      shortIntroduction: '۱۵ سال تجربه بالینی در دانشگاه شهید بهشتی و دوره‌های تکمیلی اروپا، متعهد به تشخیص دقیق و درمان صبورانه بیماری‌های گوارش و کبد.',
      detailedBiography: 'دکتر علیرضا کریمی با بیش از ۱۵ سال تجربه تخصصی در بیماری‌های گوارش و کبد، درمان‌های پیشرفته اختلالات ریفلاکس، زخم‌های مقاوم و کبد چرب را ارائه می‌نمایند. کلیه پروسیجرهای اندوسکوپی و کولونوسکوپی در محیطی آرام، مدرن و با دستگاه‌های دیجیتال لنز بالا انجام می‌پذیرد.',
      websiteSubdomain: 'dr-karimi.hamrah.ir',
      customDomain: 'dr-karimi-gastro.com',
      seoTitle: 'دکتر علیرضا کریمی | متخصص گوارش، کبد و کولونوسکوپی | وبسایت رسمی',
      seoDescription: 'وبسایت رسمی دکتر علیرضا کریمی متخصص گوارش و کبد در ونک و جردن. رزرو نوبت کولونوسکوپی بدون درد، درمان کبد چرب و مشاوره آنلاین.',
      phone: '۰۲۱-۸۸۶۶۴۴۲۲',
      whatsapp: '09122223344',
      email: 'info@dr-karimi-gastro.com',
      socialLinks: {
        instagram: 'dr.karimi_gastro',
        linkedin: 'alireza-karimi-gastro'
      },
      sectionVisibility: {
        about: true,
        services: true,
        achievements: true,
        articles: true,
        gallery: true,
        faq: true,
        reviews: true,
        offices: true
      }
    },
    supportedInsurances: ['تأمین اجتماعی', 'خدمات درمانی', 'البرز', 'کوثر', 'ایران'],
    languages: ['فارسی', 'آلمانی'],
    consultationFee: 320000,
    onlineConsultationFee: 250000,
    hasOnlineConsultation: true,
    nextAvailableSlot: 'امروز ۱۹:۰۰',
    gender: 'male'
  },
  {
    id: 'doc-3',
    slug: 'dr-sara-mohammadi',
    name: 'دکتر سارا محمدی',
    title: 'متخصص پوست، مو، زیبایی و لیزرتراپی',
    medicalCouncilNumber: '۶۱۲۴۰',
    specialtyId: 'spec-derm',
    specialtyName: 'پوست، مو و زیبایی',
    avatar: 'https://images.unsplash.com/photo-1594824813566-82823d5afe4a?auto=format&fit=crop&q=80&w=300',
    rating: 4.9,
    reviewCount: 512,
    experienceYears: 12,
    city: 'تهران',
    address: 'همرا کلینیک (HEMERA) - شعبه اندرزگو، طبقه ۵',
    bio: 'رتبه برتر بورد تخصصی پوست و مو، دارای گواهینامه بین‌المللی تزریق مزوتراپی، ژل و بوتاکس، کاشت مو و جوانسازی پوست با مدرن‌ترین تجهیزات لیزر.',
    education: [
      'تخصص پوست، مو و زیبایی از دانشگاه علوم پزشکی ایران',
      'عضو آکادمی متخصصین پوست اروپا (EADV)',
      'فلوشیپ لیزرهای درمانی و جوانسازی از پاریس'
    ],
    services: [
      'درمان تخصصی ریزش مو هورمونی و ارثی',
      'تزریق فیلر طبیعی، بوتاکس و مزوژل جوانساز',
      'لیزر لک، جای جوش، اسکار و ترافیکی',
      'درمان آکنه‌های مقاوم و اگزمای مزمن'
    ],
    detailedServices: [
      {
        id: 'srv-301',
        title: 'مزوتراپی و PRP تقویت مو و رفع ریزش',
        description: 'تغذیه فولیکول‌های مو با کوکتل‌های غنی فرانسوی و فاکتورهای رشد پلاکتی خود فرد.',
        durationMinutes: 30,
        bookingEnabled: true,
        price: 750000,
        featured: true
      },
      {
        id: 'srv-302',
        title: 'جوانسازی صورت با هایفوتراپی و فوتونا ۴D',
        description: 'لیفت غیرجراحی صورت، زاویه‌سازی فک و کلاژن‌سازی عمیق با ماندگاری بالا.',
        durationMinutes: 45,
        bookingEnabled: true,
        price: 1800000,
        featured: true
      },
      {
        id: 'srv-303',
        title: 'تزریق بوتاکس دیسپورت پیشانی و خط اخم',
        description: 'رفع خطوط پنجه‌کلاغی و چروک‌های دینامیک صورت با ماندگاری ۶ ماهه.',
        durationMinutes: 20,
        bookingEnabled: true,
        price: 850000,
        featured: false
      }
    ],
    offices: [
      {
        id: 'off-301',
        title: 'کلینیک تخصصی پوست و لیزر اندرزگو',
        city: 'تهران',
        address: 'بلوار اندرزگو، نبش خیابان عبدالهی، ساختمان پزشکان ارغوان، طبقه ۵، واحد ۵۰۲',
        phone: '۰۲۱-۲۲۲۱۱۰۰۹',
        workingHours: 'شنبه تا چهارشنبه: ۱۱:۰۰ الی ۱۹:۳۰',
        appointmentEnabled: true,
        inPersonEnabled: true,
        note: 'مجهز به بروزترین لیزرهای ۲۰۲۴ و سالن انتظار VIP',
        clinicId: 'clinic-1',
        branchId: 'branch-3'
      }
    ],
    achievements: [
      {
        id: 'ach-301',
        title: 'رتبه دوم بورد تخصصی پوست کشور',
        year: '۱۳۹۳',
        issuer: 'دانشگاه علوم پزشکی ایران',
        category: 'academic'
      },
      {
        id: 'ach-302',
        title: 'مدرس کارگاه‌های تزریق ایمن فیلر و بوتاکس',
        year: '۱۴۰۱',
        issuer: 'انجمن متخصصین پوست ایران',
        category: 'certification'
      }
    ],
    faqs: [
      {
        id: 'faq-301',
        question: 'تزریق بوتاکس چه مدت بعد اثر می‌کند و چقدر ماندگاری دارد؟',
        answer: 'اثر بوتاکس معمولاً از روز ۳ الی ۴ شروع شده و در روز ۱۴ به اوج می‌رسد. ماندگاری آن بین ۴ تا ۶ ماه است.',
        category: 'خدمات زیبایی'
      },
      {
        id: 'faq-302',
        question: 'آیا درمان اسکار آکنه با یک جلسه لیزر امکان‌پذیر است؟',
        answer: 'اسکارهای فرورفته به پروتکل ترکیبی (لیزر فرکشنال + سابسیژن + مزوتراپی) در ۳ تا ۴ جلسه نیاز دارند.',
        category: 'درمان‌های تخصصی'
      }
    ],
    gallery: [
      {
        id: 'gal-301',
        title: 'اتاق لیزر و جوانسازی پوست با مدرن‌ترین تجهیزات',
        imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600',
        category: 'تجهیزات مطب'
      }
    ],
    websiteConfig: {
      websiteStatus: 'disabled',
      websiteEnabled: false,
      websitePublished: false,
      websiteTheme: 'warm-care',
      brandPrimaryColor: '#0d9488',
      brandAccentColor: '#f59e0b',
      heroTitle: 'متخصص پوست، مو، لیزر و جوانسازی چهره',
      heroSubtitle: 'ترکیب دانش آکادمیک بورد تخصصی و هنر زیبایی‌شناسی چهره با مدرن‌ترین استانداردهای بین‌المللی',
      shortIntroduction: 'زیبایی طبیعی و سلامت پایدار پوست و مو با استفاده از جدیدترین پروتکل‌های درمانی و دستگاه‌های معتبر جهانی.',
      detailedBiography: 'دکتر سارا محمدی فارغ‌التحصیل ممتاز دانشگاه علوم پزشکی ایران و عضو آکادمی پوست اروپا (EADV)، با ۱۲ سال تجربه تخصصی در حوزه مراقبت‌های پوستی، مزوتراپی، کاشت مو و جوانسازی چهره فعالیت می‌کنند.',
      websiteSubdomain: 'dr-sara.hamrah.ir',
      customDomain: 'dr-saramohammadi.ir',
      seoTitle: 'دکتر سارا محمدی | متخصص پوست، مو و زیبایی در اندرزگو | وبسایت رسمی',
      seoDescription: 'وبسایت رسمی دکتر سارا محمدی متخصص پوست و مو در اندرزگو. مشاوره زیبایی، رزرو نوبت لیزر، درمان ریزش مو و ویزیت آنلاین.',
      phone: '۰۲۱-۲۲۲۱۱۰۰۹',
      whatsapp: '09124445566',
      email: 'info@dr-saramohammadi.ir',
      socialLinks: {
        instagram: 'dr.sara_mohammadi_derma',
        telegram: 'dr_sara_skincare'
      },
      sectionVisibility: {
        about: true,
        services: true,
        achievements: true,
        articles: true,
        gallery: true,
        faq: true,
        reviews: true,
        offices: true
      }
    },
    supportedInsurances: ['تأمین اجتماعی', 'خدمات درمانی', 'ایران', 'پاسارگاد'],
    languages: ['فارسی', 'انگلیسی'],
    consultationFee: 380000,
    onlineConsultationFee: 300000,
    hasOnlineConsultation: true,
    nextAvailableSlot: 'فردا ۱۰:۰۰',
    gender: 'female'
  },
  {
    id: 'doc-4',
    slug: 'dr-reza-ahmadi',
    name: 'دکتر رضا احمدی',
    title: 'فوق تخصص جراحی زانو، ستون فقرات و آرتروپلاستی',
    medicalCouncilNumber: '۴۱۲۹۰',
    specialtyId: 'spec-ortho',
    specialtyName: 'ارتوپدی و مفاصل',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300',
    rating: 4.8,
    reviewCount: 198,
    experienceYears: 20,
    city: 'تهران',
    address: 'همرا کلینیک (HEMERA) - شعبه سعادت‌آباد، طبقه ۳',
    bio: 'جراح برجسته ستون فقرات و زانو با سابقه تعویض مفصل زانو، درمان رباتیک آرتروز و آسیب‌های ورزشی ورزشکاران حرفه‌ای.',
    education: ['فوق تخصص آرتروپلاستی زانو از فرانسه', 'تخصص ارتوپدی از دانشگاه علوم پزشکی تهران'],
    services: ['تعویض مفصل زانو و لگن', 'آرتروسکوپی زانو و بازسازی ربات صلیبی', 'تزریق ژل غضروف‌ساز و PRP'],
    websiteConfig: {
      websiteStatus: 'suspended',
      websiteEnabled: false,
      websitePublished: false,
      websiteTheme: 'tech-innovative',
      brandPrimaryColor: '#0284c7',
      brandAccentColor: '#0ea5e9',
      heroTitle: 'فوق تخصص جراحی مفاصل، تعویض مفصل زانو و ارتوپدی ورزشی',
      heroSubtitle: 'جراحی‌های کم‌تهاجمی مفاصل، بازسازی رباط صلیبی و درمان پیشرفته آرتروز زانو و لگن',
      shortIntroduction: '۲۰ سال تجربه جراحی موفق مفاصل، بازیابی حرکت بدون درد برای بیش از ۴۰۰۰ بیمار ارتوپدی.',
      websiteSubdomain: 'dr-ahmadi.hamrah.ir',
      seoTitle: 'دکتر رضا احمدی | فوق تخصص ارتوپدی و جراحی زانو | وبسایت رسمی',
      seoDescription: 'وبسایت رسمی دکتر رضا احمدی فوق تخصص ارتوپدی. دریافت نوبت ویزیت حضوری در سعادت‌آباد، آرتروسکوپی و تعویض مفصل.',
      phone: '۰۲۱-۲۲۰۹۸۷۶۵',
      sectionVisibility: {
        about: true,
        services: true,
        achievements: true,
        articles: true,
        gallery: true,
        faq: true,
        reviews: true,
        offices: true
      }
    },
    offices: [
      {
        id: 'off-401',
        title: 'مطب ارتوپدی سعادت‌آباد',
        city: 'تهران',
        address: 'سعادت‌آباد، خیابان علامه شمالی، مجتمع درمانی همرا کلینیک (HEMERA)، طبقه ۳',
        phone: '۰۲۱-۲۲۰۹۸۷۶۵',
        workingHours: 'شنبه، دوشنبه، چهارشنبه: ۱۶:۰۰ الی ۲۰:۰۰',
        appointmentEnabled: true,
        inPersonEnabled: true,
        clinicId: 'clinic-1',
        branchId: 'branch-1'
      }
    ],
    supportedInsurances: ['تأمین اجتماعی', 'خدمات درمانی', 'ایران', 'دانا'],
    languages: ['فارسی', 'فرانسوی'],
    consultationFee: 400000,
    onlineConsultationFee: 320000,
    hasOnlineConsultation: true,
    nextAvailableSlot: 'شنبه ۱۶:۰۰',
    gender: 'male'
  },
  {
    id: 'doc-5',
    slug: 'dr-narges-rezaei',
    name: 'دکتر نرگس رضایی',
    title: 'متخصص زنان، زایمان و مراقبت‌های پرخطر بارداری',
    medicalCouncilNumber: '۵۸۹۲۰',
    specialtyId: 'spec-obgyn',
    specialtyName: 'زنان و زایمان',
    avatar: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=300',
    rating: 4.9,
    reviewCount: 420,
    experienceYears: 16,
    city: 'تهران',
    address: 'همرا کلینیک (HEMERA) - شعبه سعادت‌آباد، طبقه ۲',
    bio: 'متخصص زنان و زایمان با مهارات ویژه در مدیریت بارداری‌های پرخطر، سونوگرافی‌های آنومالی، درمان کیست تخمدان و فیبروم.',
    education: ['تخصص زنان و زایمان از دانشگاه علوم پزشکی تهران'],
    services: ['مراقبت‌های پیش و حین بارداری', 'سونوگرافی تخصصی زنان', 'درمان تنبلی تخمدان (PCOS)'],
    websiteConfig: {
      websiteEnabled: true,
      websitePublished: true,
      websiteTheme: 'warm-care',
      heroTitle: 'متخصص زنان، زایمان، نازایی و پایش سلامت بارداری',
      heroSubtitle: 'مراقبت‌های جامع دوران بارداری، غربالگری‌های سلامت جنین و درمان اختلالات هورمونی زنان',
      shortIntroduction: '۱۶ سال همراهی صمیمانه با مادران عزیز در تجربه بارداری ایمن و آرامش‌بخش.',
      websiteSubdomain: 'dr-rezaei.hamrah.ir',
      seoTitle: 'دکتر نرگس رضایی | متخصص زنان و زایمان | وبسایت رسمی',
      seoDescription: 'وبسایت رسمی دکتر نرگس رضایی متخصص زنان و زایمان در تهران. دریافت نوبت ویزیت، سونوگرافی و مشاوره بارداری.',
      phone: '۰۲۱-۲۲۱۴۳۳۲۲',
      sectionVisibility: {
        about: true,
        services: true,
        achievements: true,
        articles: true,
        gallery: true,
        faq: true,
        reviews: true,
        offices: true
      }
    },
    offices: [
      {
        id: 'off-501',
        title: 'مطب سعادت‌آباد',
        city: 'تهران',
        address: 'سعادت‌آباد، بلوار شهرداری، خیابان ۱۶ غربی، طبقه ۲',
        phone: '۰۲۱-۲۲۱۴۳۳۲۲',
        workingHours: 'شنبه تا چهارشنبه: ۱۷:۰۰ الی ۲۱:۰۰',
        appointmentEnabled: true,
        inPersonEnabled: true,
        clinicId: 'clinic-1',
        branchId: 'branch-1'
      }
    ],
    supportedInsurances: ['تأمین اجتماعی', 'خدمات درمانی', 'سلامت'],
    languages: ['فارسی', 'انگلیسی'],
    consultationFee: 330000,
    onlineConsultationFee: 270000,
    hasOnlineConsultation: true,
    nextAvailableSlot: 'امروز ۱۸:۰۰',
    gender: 'female'
  },
  {
    id: 'doc-6',
    slug: 'dr-pouriya-soleimani',
    name: 'دکتر پوریا سلیمانی',
    title: 'متخصص اطفال و بیماری‌های عفونی کودکان',
    medicalCouncilNumber: '۶۴۵۱۰',
    specialtyId: 'spec-pediatrics',
    specialtyName: 'اطفال و کودکان',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300',
    rating: 4.7,
    reviewCount: 175,
    experienceYears: 10,
    city: 'تهران',
    address: 'همرا کلینیک (HEMERA) - شعبه ونک، طبقه ۱',
    bio: 'پزشک صبور کودکان و متخصص پایش نمو نوزادان، درمان آلرژی‌های تنفسی و عفونت‌های فصلی اطفال.',
    education: ['تخصص کودکان از دانشگاه علوم پزشکی شهید بهشتی'],
    services: ['پایش رشد و قد نوزاد', 'واکسیناسیون تکمیلی', 'درمان آسم و آلرژی کودکان'],
    supportedInsurances: ['تأمین اجتماعی', 'خدمات درمانی'],
    languages: ['فارسی', 'انگلیسی'],
    consultationFee: 300000,
    onlineConsultationFee: 240000,
    hasOnlineConsultation: true,
    nextAvailableSlot: 'فردا ۱۱:۳۰',
    gender: 'male'
  },
  {
    id: 'doc-7',
    slug: 'dr-elham-samadi',
    name: 'دکتر الهام صمدی',
    title: 'متخصص مغز و اعصاب و سردردهای میگرنی',
    medicalCouncilNumber: '۵۷۳۰۰',
    specialtyId: 'spec-neuro',
    specialtyName: 'مغز و اعصاب (نورولوژی)',
    avatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=300',
    rating: 4.9,
    reviewCount: 260,
    experienceYears: 14,
    city: 'تهران',
    address: 'همرا کلینیک (HEMERA) - شعبه سعادت‌آباد، طبقه ۵',
    bio: 'متخصص نورولوژی با تمرکز بر درمان دارویی و بوتاکس درمانی میگرن شدید، اختلالات خواب و نوارهای عصبی (EMG/NCV).',
    education: ['تخصص مغز و اعصاب از دانشگاه علوم پزشکی تهران'],
    services: ['درمان میگرن و سردردهای مقاوم', 'نوار مغز (EEG) و نوار عصب و عضله', 'پایش ام‌اس و تشنج'],
    supportedInsurances: ['تأمین اجتماعی', 'خدمات درمانی', 'ایران', 'کوثر'],
    languages: ['فارسی', 'انگلیسی'],
    consultationFee: 360000,
    onlineConsultationFee: 290000,
    hasOnlineConsultation: true,
    nextAvailableSlot: 'امروز ۲۰:۰۰',
    gender: 'female'
  },
  {
    id: 'doc-8',
    slug: 'dr-arash-farhadi',
    name: 'دکتر آرش فرهادی',
    title: 'روانپزشک و متخصص روان‌درمانی اضطراب و اختلالات روان‌تنی',
    medicalCouncilNumber: '۴۹۸۲۰',
    specialtyId: 'spec-psych',
    specialtyName: 'روانپزشکی و روانشناسی',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300',
    rating: 4.8,
    reviewCount: 310,
    experienceYears: 17,
    city: 'تهران',
    address: 'همرا کلینیک (HEMERA) - شعبه اندرزگو، طبقه ۳',
    bio: 'روانپزشک مجرب در درمان دارویی و شناختی-رفتاری (CBT) اختلالات پانیک، افسردگی فصلی، وسواس و مشاوره زوجین.',
    education: ['تخصص روانپزشکی از دانشگاه تهران'],
    services: ['درمان اضطراب و پانیک', 'روان‌درمانی شناختی رفتاری (CBT)', 'مشاوره وسواس و خواب'],
    supportedInsurances: ['تأمین اجتماعی', 'خدمات درمانی', 'پاسارگاد'],
    languages: ['فارسی', 'انگلیسی'],
    consultationFee: 370000,
    onlineConsultationFee: 300000,
    hasOnlineConsultation: true,
    nextAvailableSlot: 'شنبه ۱۷:۰۰',
    gender: 'male'
  },
  {
    id: 'doc-9',
    slug: 'dr-mehdi-ebrahimi',
    name: 'دکتر مهدی ابراهیمی',
    title: 'جراح و متخصص چشم، آب مروارید و لیزیک',
    medicalCouncilNumber: '۴۵۲۰۰',
    specialtyId: 'spec-ophthalmo',
    specialtyName: 'چشم‌پزشکی',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
    rating: 4.9,
    reviewCount: 230,
    experienceYears: 21,
    city: 'تهران',
    address: 'همرا کلینیک (HEMERA) - شعبه سعادت‌آباد، طبقه ۱',
    bio: 'جراح برجسته چشم با بیش از ۵۰۰۰ عمل موفق لیزیک، لازک، پیوند قرنیه و درمان آب مروارید فموتولیزیک.',
    education: ['تخصص جراحی چشم از دانشگاه علوم پزشکی شیراز'],
    services: ['عمل لیزیک و لازک', 'جراحی آب مروارید', 'تعیین شماره عینک و لنز'],
    supportedInsurances: ['تأمین اجتماعی', 'خدمات درمانی', 'ایران'],
    languages: ['فارسی', 'انگلیسی'],
    consultationFee: 390000,
    onlineConsultationFee: 310000,
    hasOnlineConsultation: true,
    nextAvailableSlot: 'امروز ۱۶:۳۰',
    gender: 'male'
  },
  {
    id: 'doc-10',
    slug: 'dr-neda-kamali',
    name: 'دکتر ندا کمالی',
    title: 'متخصص گوش، حلق، بینی و جراحی زیبایی بینی',
    medicalCouncilNumber: '۵۶۱۱۰',
    specialtyId: 'spec-ent',
    specialtyName: 'گوش، حلق و بینی',
    avatar: 'https://images.unsplash.com/photo-1594824813566-82823d5afe4a?auto=format&fit=crop&q=80&w=300',
    rating: 4.8,
    reviewCount: 390,
    experienceYears: 13,
    city: 'تهران',
    address: 'همرا کلینیک (HEMERA) - شعبه اندرزگو، طبقه ۴',
    bio: 'جراح با سلیقه رینوپلاستی طبیعی، درمان انحراف بینی، سینوزیت مزمن با اندوسکوپی و سنجش شنوایی.',
    education: ['تخصص گوش، حلق و بینی از دانشگاه علوم پزشکی ایران'],
    services: ['جراحی زیبایی و درمانی بینی', 'درمان سینوزیت مزمن', 'ارزیابی وزوز گوش'],
    supportedInsurances: ['تأمین اجتماعی', 'خدمات درمانی', 'دانا'],
    languages: ['فارسی', 'انگلیسی'],
    consultationFee: 380000,
    onlineConsultationFee: 300000,
    hasOnlineConsultation: true,
    nextAvailableSlot: 'یکشنبه ۱۵:۰۰',
    gender: 'female'
  },
  {
    id: 'doc-11',
    slug: 'dr-kaveh-tahmasbi',
    name: 'دکتر کاوه طهماسبی',
    title: 'فوق تخصص الکتروفیزیولوژی و آریتمی قلب',
    medicalCouncilNumber: '۴۳۸۹۰',
    specialtyId: 'spec-cardio',
    specialtyName: 'قلب و عروق',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300',
    rating: 4.9,
    reviewCount: 180,
    experienceYears: 19,
    city: 'تهران',
    address: 'همرا کلینیک (HEMERA) - شعبه سعادت‌آباد، طبقه ۴',
    bio: 'فوق تخصص آریتمی و باتری قلب، درمان تپش قلب ناشی از فیبریلاسیون دهلیزی و ابلیشن عروق.',
    education: ['فوق تخصص الکتروفیزیولوژی از آلمان'],
    services: ['درمان تپش قلب و آریتمی', 'تعبیه و پایش باتری قلب (پیس‌میکر)', 'ابلیشن قلبی'],
    supportedInsurances: ['تأمین اجتماعی', 'خدمات درمانی', 'ایران'],
    languages: ['فارسی', 'آلمانی'],
    consultationFee: 410000,
    onlineConsultationFee: 330000,
    hasOnlineConsultation: true,
    nextAvailableSlot: 'امروز ۱۹:۳۰',
    gender: 'male'
  },
  {
    id: 'doc-12',
    slug: 'dr-shirin-khodadad',
    name: 'دکتر شیرین خداداد',
    title: 'متخصص کبد چرب و بیماری‌های متابولیک گوارش',
    medicalCouncilNumber: '۶۲۳۰۰',
    specialtyId: 'spec-gastro',
    specialtyName: 'گوارش و کبد',
    avatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=300',
    rating: 4.7,
    reviewCount: 140,
    experienceYears: 11,
    city: 'تهران',
    address: 'همرا کلینیک (HEMERA) - شعبه ونک، طبقه ۲',
    bio: 'پزشک پژوهشگر درزمینه درمان کبد چرب پیشرفته، کنترل ورم شکم و ریفلاکس اسید معده به مری.',
    education: ['تخصص گوارش از دانشگاه علوم پزشکی تهران'],
    services: ['فیبرواسکن غیرتهاجمی کبد', 'درمان میکروب معده و ریفلاکس', 'مشاوره رژیم گوارشی'],
    supportedInsurances: ['تأمین اجتماعی', 'خدمات درمانی'],
    languages: ['فارسی', 'انگلیسی'],
    consultationFee: 310000,
    onlineConsultationFee: 240000,
    hasOnlineConsultation: true,
    nextAvailableSlot: 'دوشنبه ۱۰:۰۰',
    gender: 'female'
  },
  {
    id: 'doc-13',
    slug: 'dr-amin-rezaei',
    name: 'دکتر امین رضایی',
    title: 'متخصص زیبایی، کاشت مو و لیزر پوست',
    medicalCouncilNumber: '۵۹۸۷۰',
    specialtyId: 'spec-derm',
    specialtyName: 'پوست، مو و زیبایی',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300',
    rating: 4.8,
    reviewCount: 215,
    experienceYears: 14,
    city: 'تهران',
    address: 'همرا کلینیک (HEMERA) - شعبه اندرزگو، طبقه ۵',
    bio: 'متخصص کاشت طبیعی مو به روش‌های FIT و FUT، جوانسازی با هایفو و فیشیال تخصصی.',
    education: ['تخصص پوست از دانشگاه شهید بهشتی'],
    services: ['کاشت مو و ابروی طبیعی', 'هایفوتراپی و لیفت پوست', 'تزریق فیلر و بوتاکس'],
    supportedInsurances: ['تأمین اجتماعی', 'ایران'],
    languages: ['فارسی', 'انگلیسی'],
    consultationFee: 370000,
    onlineConsultationFee: 290000,
    hasOnlineConsultation: true,
    nextAvailableSlot: 'امروز ۱۸:۳۰',
    gender: 'male'
  },
  {
    id: 'doc-14',
    slug: 'dr-fatemeh-shafiei',
    name: 'دکتر فاطمه شفیعی',
    title: 'فوق تخصص ستون فقرات و دیسک کمر ارتوپدی',
    medicalCouncilNumber: '۴۷۱۲۰',
    specialtyId: 'spec-ortho',
    specialtyName: 'ارتوپدی و مفاصل',
    avatar: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=300',
    rating: 4.9,
    reviewCount: 310,
    experienceYears: 17,
    city: 'تهران',
    address: 'همرا کلینیک (HEMERA) - شعبه سعادت‌آباد، طبقه ۳',
    bio: 'جراح برجسته دیسک کمر، سیاتیک و انحراف ستون فقرات با روش‌های بسته لیزری و بدون جراحی باز.',
    education: ['فوق تخصص ستون فقرات از سوئیس'],
    services: ['لیزر دیسک کمر و گردن', 'درمان غیرجراحی سیاتیک', 'تزریق اپیدورال ضددرد'],
    supportedInsurances: ['تأمین اجتماعی', 'خدمات درمانی', 'ایران', 'پاسارگاد'],
    languages: ['فارسی', 'انگلیسی', 'آلمانی'],
    consultationFee: 420000,
    onlineConsultationFee: 340000,
    hasOnlineConsultation: true,
    nextAvailableSlot: 'سه‌شنبه ۱۶:۳۰',
    gender: 'female'
  },
  {
    id: 'doc-15',
    slug: 'dr-sohrab-kazemi',
    name: 'دکتر سهراب کاظمی',
    title: 'متخصص نوزادان و رشد و تغذیه کودکان',
    medicalCouncilNumber: '۶۵۴۳۰',
    specialtyId: 'spec-pediatrics',
    specialtyName: 'اطفال و کودکان',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300',
    rating: 4.8,
    reviewCount: 160,
    experienceYears: 9,
    city: 'تهران',
    address: 'همرا کلینیک (HEMERA) - شعبه ونک، طبقه ۱',
    bio: 'متخصص متعهد کودکان با رویکرد صمیمانه، تشخیص زودرس زردی نوزادان و مکمل‌های رشد کودکان.',
    education: ['تخصص اطفال از دانشگاه علوم پزشکی شیراز'],
    services: ['درمان زردی نوزاد', 'تنظیم رژیم رشد کودک', 'چکاپ دوره‌ای اطفال'],
    supportedInsurances: ['تأمین اجتماعی', 'خدمات درمانی'],
    languages: ['فارسی', 'انگلیسی'],
    consultationFee: 290000,
    onlineConsultationFee: 230000,
    hasOnlineConsultation: true,
    nextAvailableSlot: 'امروز ۱۷:۰۰',
    gender: 'male'
  },
  {
    id: 'doc-16',
    slug: 'dr-mona-asgari',
    name: 'دکتر مونا عسگری',
    title: 'متخصص نازایی و IVF زنان',
    medicalCouncilNumber: '۵۲۱۰۰',
    specialtyId: 'spec-obgyn',
    specialtyName: 'زنان و زایمان',
    avatar: 'https://images.unsplash.com/photo-1594824813566-82823d5afe4a?auto=format&fit=crop&q=80&w=300',
    rating: 4.9,
    reviewCount: 290,
    experienceYears: 15,
    city: 'تهران',
    address: 'همرا کلینیک (HEMERA) - شعبه سعادت‌آباد، طبقه ۲',
    bio: 'فوق تخصص نازایی با درصد موفقیت بالا در تعیین جنسیت، IUI و IVF، درمان اندومتریوز شدید.',
    education: ['فوق تخصص فلوشیپ نازایی از انگلستان'],
    services: ['درمان تخصصی نازایی با IVF', 'تعیین جنسیت جنین', 'لاپاراسکوپی اندومتریوز'],
    supportedInsurances: ['تأمین اجتماعی', 'خدمات درمانی', 'ایران'],
    languages: ['فارسی', 'انگلیسی'],
    consultationFee: 430000,
    onlineConsultationFee: 350000,
    hasOnlineConsultation: true,
    nextAvailableSlot: 'چهارشنبه ۱۱:۰۰',
    gender: 'female'
  },
  {
    id: 'doc-17',
    slug: 'dr-hesam-noroozi',
    name: 'دکتر حسام نوروزی',
    title: 'متخصص نوار مغز و اختلالات خواب و صرع',
    medicalCouncilNumber: '۴۸۷۶۰',
    specialtyId: 'spec-neuro',
    specialtyName: 'مغز و اعصاب (نورولوژی)',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
    rating: 4.7,
    reviewCount: 195,
    experienceYears: 13,
    city: 'تهران',
    address: 'همرا کلینیک (HEMERA) - شعبه سعادت‌آباد، طبقه ۵',
    bio: 'پزشک متخصص درمان تشنج، سرگیجه‌های خوش‌خیم وضعیتی (BPPV) و بررسی تخصصی پلی‌سومنوگرافی خواب.',
    education: ['تخصص اعصاب از دانشگاه علوم پزشکی تبریز'],
    services: ['تست جامع اختلال خواب', 'درمان تشنج و صرع', 'تست مانور سرگیجه'],
    supportedInsurances: ['تأمین اجتماعی', 'خدمات درمانی'],
    languages: ['فارسی', 'ترکی'],
    consultationFee: 350000,
    onlineConsultationFee: 280000,
    hasOnlineConsultation: true,
    nextAvailableSlot: 'امروز ۲۱:۰۰',
    gender: 'male'
  },
  {
    id: 'doc-18',
    slug: 'dr-leila-mohammadkhani',
    name: 'دکتر لیلا محمدخانی',
    title: 'متخصص وسواس، افسردگی و زوج درمانی',
    medicalCouncilNumber: '۶۱۸۹۰',
    specialtyId: 'spec-psych',
    specialtyName: 'روانپزشکی و روانشناسی',
    avatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=300',
    rating: 4.9,
    reviewCount: 270,
    experienceYears: 12,
    city: 'تهران',
    address: 'همرا کلینیک (HEMERA) - شعبه اندرزگو، طبقه ۳',
    bio: 'روانپزشک باحوصله، متخصص مدیریت شکست عاطفی، اختلالات خلقی دوقطبی و نوروفیدبک.',
    education: ['تخصص روانپزشکی از دانشگاه علوم پزشکی ایران'],
    services: ['نوروفیدبک و تحریک مغزی TDCS', 'روان‌درمانی فردی و زوجین', 'درمان وسواس فکری عملی'],
    supportedInsurances: ['تأمین اجتماعی', 'ایران'],
    languages: ['فارسی', 'انگلیسی'],
    consultationFee: 360000,
    onlineConsultationFee: 290000,
    hasOnlineConsultation: true,
    nextAvailableSlot: 'فردا ۱۴:۰۰',
    gender: 'female'
  },
  {
    id: 'doc-19',
    slug: 'dr-danyal-babaei',
    name: 'دکتر دانیال بابایی',
    title: 'فوق تخصص شبکیه و جراحی لیزر چشم',
    medicalCouncilNumber: '۴۴۵60',
    specialtyId: 'spec-ophthalmo',
    specialtyName: 'چشم‌پزشکی',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300',
    rating: 4.8,
    reviewCount: 205,
    experienceYears: 18,
    city: 'تهران',
    address: 'همرا کلینیک (HEMERA) - شعبه سعادت‌آباد، طبقه ۱',
    bio: 'فوق تخصص جراحی شبکیه دیابتی، لیزر عروق چشم و جراحی پارگی شبکیه با لیزرهای مدرن.',
    education: ['فوق تخصص ویتره و رتین از دانشگاه علوم پزشکی شهید بهشتی'],
    services: ['لیزر شبکیه بیماران دیابتی', 'جراحی پارگی شبکیه', 'معاینه دقیق ته چشم (Fundoscopy)'],
    supportedInsurances: ['تأمین اجتماعی', 'خدمات درمانی', 'ایران'],
    languages: ['فارسی', 'انگلیسی'],
    consultationFee: 400000,
    onlineConsultationFee: 320000,
    hasOnlineConsultation: true,
    nextAvailableSlot: 'امروز ۱۷:۴۵',
    gender: 'male'
  },
  {
    id: 'doc-20',
    slug: 'dr-yaser-ghasemi',
    name: 'دکتر یاسر قاسمی',
    title: 'متخصص گوش و حلق و بینی و جراحی سر و گردن',
    medicalCouncilNumber: '۵۱۴۵۰',
    specialtyId: 'spec-ent',
    specialtyName: 'گوش، حلق و بینی',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300',
    rating: 4.8,
    reviewCount: 180,
    experienceYears: 15,
    city: 'تهران',
    address: 'همرا کلینیک (HEMERA) - شعبه اندرزگو، طبقه ۴',
    bio: 'جراح لوزه بدون درد با کوبلشن، درمان خرخر شبانه، پلیپ بینی و جراحی توده غده تیرویید.',
    education: ['تخصص ENT از دانشگاه علوم پزشکی تهران'],
    services: ['درمان خرخر و آپنه خواب', 'جراحی لوزه کودکان و بزرگسالان', 'اندوسکوپی سینوس'],
    supportedInsurances: ['تأمین اجتماعی', 'خدمات درمانی', 'کوثر'],
    languages: ['فارسی', 'انگلیسی'],
    consultationFee: 370000,
    onlineConsultationFee: 290000,
    hasOnlineConsultation: true,
    nextAvailableSlot: 'شنبه ۱۸:۰۰',
    gender: 'male'
  }
];

export const CLINIC_SERVICES: ServiceItem[] = [
  {
    id: 'srv-1',
    slug: 'cardiology-full-checkup',
    title: 'چکاپ کامل سلامت قلب و عروق',
    category: 'پاراکلینیک قلب',
    description: 'شامل اکوکاردیوگرافی رنگی، نوار قلب (ECG)، تست ورزش و آزمایش چربی و قند خون کامل',
    icon: 'Heart',
    price: 1250000,
    durationMinutes: 45,
    prerequisites: ['۸ ساعت ناشتایی جهت آزمایش خون', 'پوشیدن لباس و کفش ورزشی راحت'],
    popular: true
  },
  {
    id: 'srv-2',
    slug: 'endoscopy-colonoscopy',
    title: 'اندوسکوپی و کولونوسکوپی با بیهوشی سبک',
    category: 'گوارش',
    description: 'بررسی دقیق مخاط معده و روده بزرگ توسط فوق تخصص گوارش بدون احساس درد و ناراحتی',
    icon: 'Activity',
    price: 2800000,
    durationMinutes: 60,
    prerequisites: ['مصرف محلول آمادگی روده از روز قبل', 'حضور همراه در کلینیک'],
    popular: true
  },
  {
    id: 'srv-3',
    slug: 'skin-rejuvenation-laser',
    title: 'لیزر جوانسازی فوتونا و تزریق بوتاکس دیسپورت',
    category: 'پوست و زیبایی',
    description: 'رفع چین و چروک پیشانی و دور چشم، لیفت قوام پوست و روشن‌سازی لکه‌های آفتاب',
    icon: 'Sparkles',
    price: 1800000,
    durationMinutes: 30,
    prerequisites: ['عدم سولاریوم و آفتاب گرفتن دو هفته قبل'],
    popular: true
  },
  {
    id: 'srv-4',
    slug: 'knee-mri-evaluation',
    title: 'تفسیر ام‌ارآی و تزریق غضروف‌ساز زانو (PRP)',
    category: 'ارتوپدی',
    description: 'تزریق پلاسمای غنی از پلاکت به مفصل زانو جهت بازسازی غضروف و کاهش درد آرتروز',
    icon: 'Bone',
    price: 2400000,
    durationMinutes: 40,
    prerequisites: ['همراه داشتن سی‌دی یا گرافی MRI زانو'],
    popular: true
  },
  {
    id: 'srv-5',
    slug: 'prenatal-anomaly-ultrasound',
    title: 'سونوگرافی آنومالی اسکن و غربالگری بارداری',
    category: 'زنان و تصویربرداری',
    description: 'بررسی دقیق سلامت جنین، انگشتان، ارگان‌های داخلی و جریان خون بند ناف',
    icon: 'User',
    price: 1450000,
    durationMinutes: 35,
    prerequisites: ['مصرف یک لیوان آب‌میوه شیرین نیم ساعت قبل سونوگرافی'],
    popular: true
  },
  {
    id: 'srv-6',
    slug: 'child-growth-development-audit',
    title: 'پایش جامع رشد، قد و تغذیه کودکان',
    category: 'اطفال',
    description: 'بررسی نمودار رشد WHO، سنجش تراکم استخوان کودک و آنالیز فقر آهن و ویتامین D',
    icon: 'Baby',
    price: 650000,
    durationMinutes: 30,
    prerequisites: ['دفترچه سلامت و پرونده واکسیناسیون کودک'],
    popular: false
  },
  {
    id: 'srv-7',
    slug: 'eeg-brain-mapping',
    title: 'نوار مغز (EEG) و نقشه مغزی دیجیتال',
    category: 'نورولوژی',
    description: 'ثبت امواج الکتریکی مغز جهت تشخیص علل تشنج، میگرن و تمرکز حواس',
    icon: 'Brain',
    price: 950000,
    durationMinutes: 45,
    prerequisites: ['شستشوی موها بدون ژل و اسپری از قبل'],
    popular: false
  },
  {
    id: 'srv-8',
    slug: 'psychotherapy-cbt-session',
    title: 'جلسه مشاوره روانشناسی تخصصی CBT',
    category: 'روانشناسی',
    description: 'روان‌درمانی فردی ۴۵ دقیقه‌ای جهت مدیریت اضطراب، پانیک و استرس‌های شغلی',
    icon: 'Smile',
    price: 550000,
    durationMinutes: 45,
    prerequisites: ['تکمیل پرسشنامه اولیه قبل جلسه'],
    popular: true
  },
  {
    id: 'srv-9',
    slug: 'lasik-preop-eye-assessment',
    title: 'معاینه جامع قبل از عمل لیزیک و لازک چشم',
    category: 'چشم‌پزشکی',
    description: 'ارزیابی ضخامت قرنیه (پاکی‌متری)، عکسبرداری توپوگرافی و تعیین شماره چشم',
    icon: 'Eye',
    price: 880000,
    durationMinutes: 40,
    prerequisites: ['عدم استفاده از لنز تماسی سخت به مدت ۳ روز'],
    popular: true
  },
  {
    id: 'srv-10',
    slug: 'sinus-endoscopy-hearing-test',
    title: 'اندوسکوپی تشخیصی بینی و ادیومتری شنوایی',
    category: 'گوش و حلق و بینی',
    description: 'معاینه دقیق مجاری سینوس با دوربین اندوسکوپ به همراه سنجش آستانه شنوایی',
    icon: 'Stethoscope',
    price: 750000,
    durationMinutes: 30,
    prerequisites: ['عدم اسپری بینی کورتونی در روز معاینه'],
    popular: false
  },
  {
    id: 'srv-11',
    slug: 'holter-blood-pressure-24h',
    title: 'هولتر مانیتورینگ ۲۴ ساعته فشار خون',
    category: 'پاراکلینیک قلب',
    description: 'دستگاه ثبت دقیق نوسانات فشار خون در طول شبانه‌روز هنگام فعالیت و خواب',
    icon: 'Heart',
    price: 890000,
    durationMinutes: 20,
    prerequisites: ['حمام کردن قبل نصب دستگاه (زیرا دستگاه نباید خیس شود)'],
    popular: false
  },
  {
    id: 'srv-12',
    slug: 'fibroscan-fatty-liver',
    title: 'فیبرواسکن پیشرفته کبد (کمی‌سازی چربی و فیبروز)',
    category: 'گوارش',
    description: 'تست سونوگرافی کشسانی کبد جهت سنجش دقیق میزان چربی و اسکار کبدی بدون سوزن',
    icon: 'Activity',
    price: 1100000,
    durationMinutes: 20,
    prerequisites: ['۲ ساعت ناشتایی کامل'],
    popular: true
  },
  {
    id: 'srv-13',
    slug: 'hair-mesotherapy-platelet',
    title: 'مزوتراپی وتقویت ریشه مو (پی‌آرپی و کوکتل فرانسه)',
    category: 'پوست و مو',
    description: 'تزریق ویتامین‌ها، اسیدهای آمینه و فاکتورهای رشد به پوست سر جهت توقف ریزش',
    icon: 'Sparkles',
    price: 1350000,
    durationMinutes: 30,
    prerequisites: ['تمیزی کامل پوست سر'],
    popular: true
  },
  {
    id: 'srv-14',
    slug: 'joint-hyaluronic-injection',
    title: 'تزریق ژل هیالورونیک اسید متراکم زانو',
    category: 'ارتوپدی',
    description: 'روان‌سازی حرکت مفصل زانو و رفع صدای تق تق و سائیدگی استخوان‌ها',
    icon: 'Bone',
    price: 2100000,
    durationMinutes: 25,
    prerequisites: ['عکس گرافی زانو جدید'],
    popular: false
  },
  {
    id: 'srv-15',
    slug: 'mammography-breast-ultrasound',
    title: 'ماموگرافی دیجیتال کم‌دوز و سونوگرافی پستان',
    category: 'تصویربرداری زنان',
    description: 'غربالگری دقیق بافت پستان جهت تشخیص زودهنگام توده‌های خوش‌خیم و بدخیم',
    icon: 'User',
    price: 1200000,
    durationMinutes: 30,
    prerequisites: ['عدم استفاده از پودر تالک یا مام زیر بغل در روز مراجعه'],
    popular: true
  },
  {
    id: 'srv-16',
    slug: 'emg-ncv-nerve-conduction',
    title: 'نوار عصب و عضله (EMG / NCV)',
    category: 'نورولوژی',
    description: 'تشخیص گرفتگی عصب سیاتیک، دیسک گردن و سندرم تونل کارپال مچ دست',
    icon: 'Brain',
    price: 1300000,
    durationMinutes: 40,
    prerequisites: ['گرم نگه داشتن دست و پاها هنگام مراجعه'],
    popular: false
  },
  {
    id: 'srv-17',
    slug: 'tdcs-brain-stimulation',
    title: 'تحریک الکتریکی مغز TDCS جهت تمرکز و وسواس',
    category: 'روانپزشکی',
    description: 'روش غیرتهاجمی تقویت حافظه، کاهش ولع مصرف و بهبود افسردگی مقاوم',
    icon: 'Smile',
    price: 480000,
    durationMinutes: 30,
    prerequisites: ['جلسات متوالی طبق تجویز روانپزشک'],
    popular: false
  },
  {
    id: 'srv-18',
    slug: 'fundoscopy-diabetic-retina',
    title: 'معاینه شبکیه چشم بیماران دیابتی (فوندوسکوپی)',
    category: 'چشم‌پزشکی',
    description: 'بررسی عروق ته چشم جهت جلوگیری از خونریزی شبکیه و ناشی از قند بالا',
    icon: 'Eye',
    price: 600000,
    durationMinutes: 30,
    prerequisites: ['همراه داشتن عینک آفتابی (زیرا قطره چشم مردمک را گشاد می‌کند)'],
    popular: false
  },
  {
    id: 'srv-19',
    slug: 'allergy-skin-prick-test',
    title: 'تست پوستی آلرژی (Skin Prick Test)',
    category: 'طبی و آلرژی',
    description: 'شناسایی دقیق آلرژن‌های تنفسی و غذایی شامل گرده‌ها، گردوخاک و مواد غذایی',
    icon: 'Stethoscope',
    price: 980000,
    durationMinutes: 45,
    prerequisites: ['قطع آنتی‌هیستامین‌ها از ۵ روز قبل'],
    popular: false
  },
  {
    id: 'srv-20',
    slug: 'bone-density-scan-dexa',
    title: 'سنجش تراکم استخوان دیجیتال (DEXA)',
    category: 'تصویربرداری',
    description: 'سنجش دقیق میزان پوکی استخوان در ستون فقرات و لگن در بانوان و سالمندان',
    icon: 'Bone',
    price: 790000,
    durationMinutes: 20,
    prerequisites: ['عدم مصرف قرص کلسیم در ۲۴ ساعت قبل'],
    popular: true
  }
];

export const SYMPTOM_GUIDES: SymptomGuide[] = [
  {
    id: 'symp-1',
    symptom: 'درد قفسه سینه',
    suggestedSpecialtyId: 'spec-cardio',
    suggestedSpecialtyName: 'قلب و عروق',
    urgencyLevel: 'high',
    emergencyWarning: 'اگر درد قفسه سینه همراه با انتشار به دست چپ، فک، تعریق سرد یا تنگی نفس است فوراً با ۱۱۵ تماس بگیرید.',
    commonCauses: ['انقباض عروق کرونر', 'فشار خون بالا', 'استرس شدید', 'اسپاسم مری'],
    recommendedDoctors: ['doc-1', 'doc-11']
  },
  {
    id: 'symp-2',
    symptom: 'معده درد و سوزش',
    suggestedSpecialtyId: 'spec-gastro',
    suggestedSpecialtyName: 'گوارش و کبد',
    urgencyLevel: 'medium',
    commonCauses: ['زخم معده', 'ریفلاکس اسید به مری', 'عفونت هلیکوباکتر پیلوری', 'کبد چرب'],
    recommendedDoctors: ['doc-2', 'doc-12']
  },
  {
    id: 'symp-3',
    symptom: 'ریزش مو شدید',
    suggestedSpecialtyId: 'spec-derm',
    suggestedSpecialtyName: 'پوست، مو و زیبایی',
    urgencyLevel: 'low',
    commonCauses: ['کاهش آهن یا زینک', 'اختلالات هورمونی تیرویید', 'استرس', 'آلوپسی آندروژنیک'],
    recommendedDoctors: ['doc-3', 'doc-13']
  },
  {
    id: 'symp-4',
    symptom: 'زانودرد هنگام پله',
    suggestedSpecialtyId: 'spec-ortho',
    suggestedSpecialtyName: 'ارتوپدی و مفاصل',
    urgencyLevel: 'medium',
    commonCauses: ['آرتروز مفصل زانو', 'آسیب مینیسک', 'نرمی غضروف کشکک'],
    recommendedDoctors: ['doc-4', 'doc-14']
  },
  {
    id: 'symp-5',
    symptom: 'سردرد نبض‌دار میگرنی',
    suggestedSpecialtyId: 'spec-neuro',
    suggestedSpecialtyName: 'مغز و اعصاب (نورولوژی)',
    urgencyLevel: 'medium',
    commonCauses: ['میگرن حاد', 'انقباض عضلات سر و گردن', 'کم‌خوابی و استرس'],
    recommendedDoctors: ['doc-7', 'doc-17']
  }
];

export const MOCK_DOCTOR_CLINIC_MEMBERSHIPS: DoctorClinicMembership[] = [
  {
    id: 'mem-1',
    doctorId: 'doc-1',
    clinicId: 'clinic-1',
    branchId: 'branch-1',
    officeId: 'off-1',
    roleTitle: 'فوق تخصص آنژیوپلاستی و مدیر گروه قلب',
    active: true,
    isPrimary: true,
    roomNumber: '۱۰۱',
    consultationDays: ['شنبه', 'دوشنبه', 'چهارشنبه']
  },
  {
    id: 'mem-1-2',
    doctorId: 'doc-1',
    clinicId: 'clinic-1',
    branchId: 'branch-2',
    officeId: 'off-2',
    roleTitle: 'فوق تخصص آنژیوپلاستی و اکوکاردیوگرافی ونک',
    active: true,
    isPrimary: false,
    roomNumber: '۲۰۴',
    consultationDays: ['دوشنبه', 'پنج‌شنبه']
  },
  {
    id: 'mem-2',
    doctorId: 'doc-2',
    clinicId: 'clinic-1',
    branchId: 'branch-2',
    officeId: 'off-201',
    roleTitle: 'فوق تخصص گوارش و آندوسکوپی',
    active: true,
    isPrimary: true,
    roomNumber: '۱۰۲',
    consultationDays: ['یک‌شنبه', 'سه‌شنبه', 'پنج‌شنبه']
  },
  {
    id: 'mem-3',
    doctorId: 'doc-3',
    clinicId: 'clinic-1',
    branchId: 'branch-3',
    officeId: 'off-301',
    roleTitle: 'متخصص پوست و لیزر',
    active: true,
    isPrimary: true,
    roomNumber: '۱۰۳',
    consultationDays: ['شنبه', 'سه‌شنبه']
  },
  {
    id: 'mem-4',
    doctorId: 'doc-4',
    clinicId: 'clinic-1',
    branchId: 'branch-1',
    officeId: 'off-401',
    roleTitle: 'فوق تخصص جراحی زانو و ارتوپدی',
    active: true,
    isPrimary: true,
    roomNumber: '۱۰۴',
    consultationDays: ['یک‌شنبه', 'چهارشنبه']
  },
  {
    id: 'mem-5',
    doctorId: 'doc-5',
    clinicId: 'clinic-1',
    branchId: 'branch-1',
    officeId: 'off-501',
    roleTitle: 'متخصص زنان و زایمان',
    active: true,
    isPrimary: true,
    roomNumber: '۱۰۵',
    consultationDays: ['دوشنبه', 'پنج‌شنبه']
  }
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'app-101',
    trackingCode: 'SYN-88219',
    doctorId: 'doc-1',
    doctorName: 'دکتر مریم حسینی',
    doctorSpecialty: 'قلب و عروق',
    doctorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
    patientId: 'user-patient-1',
    patientName: 'امیرحسین رضایی',
    patientPhone: '09121112233',
    patientAge: 46,
    visitType: 'in_person',
    date: getRelativeISODate(0),
    timeSlot: '17:30',
    status: 'arrived',
    clinicId: 'clinic-1',
    branchId: 'branch-1',
    officeId: 'off-1-1',
    clinicAddress: 'همرا کلینیک (HEMERA) - شعبه سعادت‌آباد، طبقه ۴',
    symptomsNote: 'درد خفیف قفسه سینه هنگام پیاده‌روی سریع',
    fee: 350000,
    paidStatus: 'paid',
    queuePosition: 2,
    estimatedWaitMinutes: 15,
    createdAt: getRelativeISODate(-2),
    arrivedAt: new Date(Date.now() - 25 * 60000).toISOString()
  },
  {
    id: 'app-102',
    trackingCode: 'SYN-99412',
    doctorId: 'doc-2',
    doctorName: 'دکتر علیرضا کریمی',
    doctorSpecialty: 'گوارش و کبد',
    doctorAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
    patientId: 'user-patient-1',
    patientName: 'امیرحسین رضایی',
    familyMemberName: 'مهری رضایی (مادر)',
    familyRelation: 'mother',
    patientPhone: '09121112233',
    patientAge: 68,
    visitType: 'in_person',
    date: getRelativeISODate(1),
    timeSlot: '10:00',
    status: 'scheduled',
    clinicId: 'clinic-1',
    branchId: 'branch-2',
    officeId: 'off-2-1',
    clinicAddress: 'همرا کلینیک (HEMERA) - شعبه ونک، طبقه ۲',
    symptomsNote: 'بررسی جواب فیبرواسکن کبد چرب',
    fee: 320000,
    paidStatus: 'paid',
    createdAt: getRelativeISODate(-1)
  },
  {
    id: 'app-103',
    trackingCode: 'SYN-45120',
    doctorId: 'doc-3',
    doctorName: 'دکتر سارا محمدی',
    doctorSpecialty: 'پوست، مو و زیبایی',
    doctorAvatar: 'https://images.unsplash.com/photo-1594824813566-82823d5afe4a?auto=format&fit=crop&q=80&w=300',
    patientId: 'patient-2',
    patientName: 'زهرا نوری',
    patientPhone: '09122223344',
    patientAge: 32,
    visitType: 'online_video',
    date: getRelativeISODate(0),
    timeSlot: '18:15',
    status: 'in_visit',
    clinicId: 'clinic-1',
    branchId: 'branch-1',
    officeId: 'off-3-1',
    clinicAddress: 'ویزیت آنلاین تصویری همرا کلینیک (HEMERA)',
    symptomsNote: 'مشاوره تزریق مزوتراپی مو',
    fee: 300000,
    paidStatus: 'paid',
    queuePosition: 1,
    estimatedWaitMinutes: 0,
    createdAt: getRelativeISODate(0),
    arrivedAt: new Date(Date.now() - 30 * 60000).toISOString(),
    visitStartedAt: new Date(Date.now() - 10 * 60000).toISOString()
  },
  {
    id: 'app-104',
    trackingCode: 'SYN-67231',
    doctorId: 'doc-4',
    doctorName: 'دکتر رضا احمدی',
    doctorSpecialty: 'ارتوپدی و مفاصل',
    doctorAvatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300',
    patientId: 'patient-3',
    patientName: 'حسین کاظمی',
    patientPhone: '09123334455',
    patientAge: 54,
    visitType: 'in_person',
    date: getRelativeISODate(0),
    timeSlot: '16:00',
    status: 'completed',
    clinicId: 'clinic-1',
    branchId: 'branch-1',
    officeId: 'off-4-1',
    clinicAddress: 'همرا کلینیک (HEMERA) - شعبه سعادت‌آباد، طبقه ۳',
    symptomsNote: 'درد شدید زانوی راست هنگام پله',
    fee: 400000,
    paidStatus: 'paid',
    createdAt: getRelativeISODate(-3),
    arrivedAt: new Date(Date.now() - 90 * 60000).toISOString(),
    visitStartedAt: new Date(Date.now() - 65 * 60000).toISOString(),
    completedAt: new Date(Date.now() - 40 * 60000).toISOString(),
    waitingDurationMinutes: 25,
    consultationDurationMinutes: 25
  },
  {
    id: 'app-105',
    trackingCode: 'SYN-11029',
    doctorId: 'doc-5',
    doctorName: 'دکتر نرگس رضایی',
    doctorSpecialty: 'زنان و زایمان',
    doctorAvatar: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=300',
    patientId: 'patient-4',
    patientName: 'فرشته احمدی',
    patientPhone: '09124445566',
    patientAge: 29,
    visitType: 'in_person',
    date: getRelativeISODate(2),
    timeSlot: '11:00',
    status: 'scheduled',
    clinicId: 'clinic-1',
    branchId: 'branch-1',
    officeId: 'off-5-1',
    clinicAddress: 'همرا کلینیک (HEMERA) - شعبه سعادت‌آباد، طبقه ۲',
    symptomsNote: 'چکاپ ماه ششم بارداری',
    fee: 330000,
    paidStatus: 'paid',
    createdAt: getRelativeISODate(-1)
  },
  ...Array.from({ length: 45 }, (_, i) => ({
    id: `app-auto-${i + 6}`,
    trackingCode: `SYN-${80000 + i}`,
    doctorId: `doc-${(i % 20) + 1}`,
    doctorName: [
      'دکتر مریم حسینی', 'دکتر علیرضا کریمی', 'دکتر سارا محمدی', 'دکتر رضا احمدی', 'دکتر نرگس رضایی',
      'دکتر امیرحسین باقری', 'دکتر الهام صمدی', 'دکتر پوریا سلیمانی', 'دکتر مهدی موسوی', 'دکتر آناهیتا شریفی',
      'دکتر بابک رستمی', 'دکتر شيرين عباسی', 'دکتر فرزاد ابراهیمی', 'دکتر غزال نجفی', 'دکتر کاوه قاسمی',
      'دکتر نیلوفر حیدری', 'دکتر سامان داوودی', 'دکتر مژگان افشار', 'دکتر حمید کیانی', 'دکتر لادن میرزایی'
    ][i % 20],
    doctorSpecialty: [
      'قلب و عروق', 'گوارش و کبد', 'پوست و زیبایی', 'ارتوپدی', 'زنان و زایمان',
      'مغز و اعصاب', 'روانپزشکی', 'اطفال', 'چشم پزشکی', 'گوش، حلق و بینی',
      'ریه و تنفس', 'غدد و متابولیسم', 'کلیه و مجاری ادراری', 'روماتولوژی', 'خون و آنکولوژی',
      'پزشکی عمومی', 'تغذیه و رژیم درمانی', 'فیزیوتراپی', 'دندانپزشکی', 'طب فیزیکی'
    ][i % 20],
    doctorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
    patientId: `patient-${(i % 10) + 1}`,
    patientName: [
      'امیرحسین رضایی', 'زهرا نوری', 'حسین کاظمی', 'فرشته احمدی', 'کامران امیری',
      'سارا بهرامی', 'مریم سعیدی', 'رضا جلالی', 'نیلوفر پارسا', 'علیرضا حسینی'
    ][i % 10],
    patientPhone: `0912${(i % 10) + 1}112233`,
    patientAge: 25 + (i % 40),
    visitType: (i % 3 === 0 ? 'online_video' : 'in_person') as VisitType,
    date: getRelativeISODate(i < 8 ? 0 : -(i % 5)),
    timeSlot: `${10 + (i % 8)}:00`,
    status: (i % 4 === 0 ? 'completed' : i % 4 === 1 ? 'arrived' : 'scheduled') as AppointmentStatus,
    clinicId: 'clinic-1',
    branchId: i % 2 === 0 ? 'branch-1' : 'branch-2',
    clinicAddress: i % 2 === 0 ? 'همرا کلینیک (HEMERA) - شعبه سعادت‌آباد' : 'همرا کلینیک (HEMERA) - شعبه ونک',
    symptomsNote: 'ویزیت دوره‌ای و بررسی آزمایشات چکاپ سلامت',
    fee: 350000,
    paidStatus: 'paid' as const,
    createdAt: getRelativeISODate(-2),
    ...(i % 4 === 1 ? { arrivedAt: new Date(Date.now() - (15 + i * 2) * 60000).toISOString() } : {}),
    ...(i % 4 === 0 ? {
      arrivedAt: new Date(Date.now() - (70 + i * 2) * 60000).toISOString(),
      visitStartedAt: new Date(Date.now() - (50 + i * 2) * 60000).toISOString(),
      completedAt: new Date(Date.now() - (30 + i * 2) * 60000).toISOString(),
      waitingDurationMinutes: 20,
      consultationDurationMinutes: 20
    } : {})
  }))
];

export const MOCK_MEDICAL_RECORDS: MedicalRecord[] = [
  {
    id: 'rec-1',
    patientId: 'user-patient-1',
    date: '۱۸ تیر ۱۴۰۵',
    title: 'چکاپ سالانه و اکوکاردیوگرافی قلب',
    type: 'visit',
    doctorName: 'دکتر مریم حسینی',
    doctorSpecialty: 'فوق تخصص قلب و عروق',
    summary: 'اکوکاردیوگرافی کسر تزریقی (EF=60%) را نرمال نشان داد. فشار خون ۱۳۵/۸۵ کنترل با رژیم.',
    details: 'ریتم سینوسی منظم. بدون افتادگی دریچه میترال. توصیه به مصرف کمتر نمک و پیاده‌روی روزانه.',
    medications: [
      { name: 'لوزارتان (Losartan)', dosage: '25 mg', frequency: 'روزی یک عدد', duration: 'مداوم' },
      { name: 'آتوروواستاتین (Atorvastatin)', dosage: '10 mg', frequency: 'شب‌ها یک عدد', duration: '۳ ماه' }
    ],
    vitalSigns: { bp: '135/85', hr: 74, temp: 36.6, weight: 78 }
  },
  {
    id: 'rec-2',
    patientId: 'user-patient-1',
    date: '۲ خرداد ۱۴۰۵',
    title: 'نتایج آزمایش کامل خون و چربی',
    type: 'lab',
    doctorName: 'آزمایشگاه مرکزی همرا کلینیک (HEMERA CLINIC)',
    doctorSpecialty: 'آزمایشگاه تشخیصی',
    summary: 'قند خون ناشتا 92 mg/dL. کلسترول کل 195 mg/dL. آنزیم‌های کبدی نرمال.',
    attachments: [
      { name: 'برگه رسمی جواب آزمایش خون.pdf', url: '#', type: 'application/pdf' }
    ]
  }
];

export const MOCK_FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: 'fam-1',
    patientId: 'user-patient-1',
    name: 'مهری رضایی',
    relation: 'mother',
    nationalId: '0039876543',
    birthYear: 1337,
    gender: 'female',
    allergies: ['پنی‌سیلین'],
    chronicDiseases: ['فشار خون بالا', 'پوکی استخوان']
  },
  {
    id: 'fam-2',
    patientId: 'user-patient-1',
    name: 'آرتین رضایی',
    relation: 'child',
    nationalId: '0081239876',
    birthYear: 1398,
    gender: 'male',
    allergies: ['گرده گیاهان'],
    chronicDiseases: []
  }
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    doctorId: 'doc-1',
    patientName: 'حسین کاظمی',
    date: '۲ روز پیش',
    rating: 5,
    comment: 'دکتر حسینی فوق‌العاده باحوصله و با سواد هستند. تمام جزئیات اکوکاردیوگرافی را برایم توضیح دادند و اضطراب بی‌دلیلم کاملاً برطرف شد.',
    doctorBehaviorRating: 5,
    waitTimeRating: 4.8,
    explanationRating: 5,
    treatmentRating: 5
  },
  {
    id: 'rev-2',
    doctorId: 'doc-1',
    patientName: 'زهرا نوری',
    date: '۱ هفته پیش',
    rating: 5,
    comment: 'محیط کلینیک بسیار تمیز و مرتب است. بدون هیچ اتلاف وقتی در زمان مقرر ویزیت شدم.',
    doctorBehaviorRating: 5,
    waitTimeRating: 5,
    explanationRating: 5,
    treatmentRating: 4.9
  },
  {
    id: 'rev-3',
    doctorId: 'doc-3',
    patientName: 'فرشته احمدی',
    date: '۳ روز پیش',
    rating: 5,
    comment: 'برای ریزش مو مراجعه کردم. پس از دو جلسه مزوتراپی تغییرات ملموسی در رشد مجدد موهام دیدم. ممنونم از دکتر محمدی عزیز.',
    doctorBehaviorRating: 5,
    waitTimeRating: 4.5,
    explanationRating: 5,
    treatmentRating: 5
  },
  ...Array.from({ length: 17 }, (_, i) => ({
    id: `rev-auto-${i + 4}`,
    doctorId: `doc-${(i % 20) + 1}`,
    patientName: ['علی محمدی', 'سارا رضایی', 'رضا جلالی', 'مریم کاظمی', 'مهدی صادقی', 'ناهید امیری', 'کامران پور حسینی'][i % 7],
    date: `${(i % 5) + 1} روز پیش`,
    rating: 4 + (i % 2),
    comment: 'برخورد پرسنل و تشخیص دقیق پزشک بسیار عالی بود. حتماً همرا کلینیک (HEMERA CLINIC) را به دوستان و آشنایان پیشنهاد می‌کنم.',
    doctorBehaviorRating: 5,
    waitTimeRating: 4.7,
    explanationRating: 4.9,
    treatmentRating: 5
  }))
];

export const MOCK_ARTICLES: HealthArticle[] = [
  {
    id: 'art-1',
    slug: 'preventing-cardiovascular-disease',
    title: '۱۰ راهکار علمی برای پیشگیری از بیماری‌های قلبی و فشار خون بالا',
    category: 'سلامت قلب',
    summary: 'چگونه با تغییرات کوچک در رژیم غذایی، خواب استاندارد و پیاده‌روی روزانه ریسک سکته قلبی را تا ۷۰ درصد کاهش دهیم؟',
    content: `بیماری‌های قلبی عروقی همچنان علت اصلی مرگ‌ومیر در سراسر جهان هستند. خوشبختانه بیش از ۸۰٪ این بیماری‌ها قابل پیشگیری هستند.

### ۱. کنترل دقیق فشار خون
فشار خون بالا اغلب بدون علامت است اما به جداره عروق آسیب می‌زند. فشار خون ایده‌آل ۱۲۰/۸۰ میلیمتر جیوه است.

### ۲. تغذیه مدیترانه‌ای
استفاده از روغن زیتون، ماهی‌های غنی از اومگا-۳، سبزیجات تازه و حذف فست‌فود و نمک اضافی.

### ۳. پیاده‌روی ۳۰ دقیقه‌ای
ورزش منظم هوازی عضله قلب را تقویت کرده و چربی‌های مضر خون (LDL) را کاهش می‌دهد.`,
    authorDoctorId: 'doc-1',
    authorDoctorName: 'دکتر مریم حسینی',
    reviewerDoctorName: 'شورای پزشکی همرا کلینیک (HEMERA CLINIC)',
    readTimeMinutes: 5,
    updatedAt: '۲ خرداد ۱۴۰۵',
    coverImage: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=600',
    tags: ['قلب', 'فشار خون', 'ورزش', 'تغذیه']
  },
  {
    id: 'art-2',
    slug: 'understanding-fatty-liver',
    title: 'راهنمای جامع درمان کبد چرب گرید ۱ تا ۳ با رژیم و ورزش',
    category: 'گوارش و تغذیه',
    summary: 'علائم پنهان کبد چرب چیست و چه زمانی نیاز به مداخله دارویی و بررسی متخصص گوارش وجود دارد؟',
    content: `کبد چرب یکی از شایع‌ترین مشکلات متابولیک در جامعه امروزی است.

### علائم اولیه
خستگی مزمن، احساس سنگینی در سمت راست بالای شکم و لکه‌های پوستی.

### روش‌های تشخیص
سونوگرافی شکم، آزمایش آنزیم‌های کبدی (ALT/AST) و فیبرواسکن.`,
    authorDoctorId: 'doc-2',
    authorDoctorName: 'دکتر علیرضا کریمی',
    reviewerDoctorName: 'شورای تخصصی گوارش همرا کلینیک (HEMERA CLINIC)',
    readTimeMinutes: 6,
    updatedAt: '۱۰ تیر ۱۴۰۵',
    coverImage: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=600',
    tags: ['کبد چرب', 'گوارش', 'تغذیه', 'چکاپ']
  },
  {
    id: 'art-3',
    slug: 'migraine-prevention-guide',
    title: 'راهنمای کنترل و پیشگیری از محرک‌های سردرد میگرنی',
    category: 'مغز و اعصاب',
    summary: 'چگونه محرک‌های غذایی، نور و استرس را شناسایی کنیم تا تکرار حملات میگرن را حداقل نمائیم؟',
    content: `سردردهای میگرنی می‌توانند کیفیت زندگی فرد را به شدت تحت تاثیر قرار دهند.

### مدیریت خواب و استرس
الگوی منظم خواب شبانه و تمرینات تنفسی عمیق به کاهش تحریک‌پذیری سلول‌های مغزی کمک می‌کند.`,
    authorDoctorId: 'doc-7',
    authorDoctorName: 'دکتر الهام صمدی',
    reviewerDoctorName: 'دپارتمان نورولوژی همرا کلینیک (HEMERA CLINIC)',
    readTimeMinutes: 4,
    updatedAt: '۱۵ تیر ۱۴۰۵',
    coverImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600',
    tags: ['میگرن', 'سردرد', 'اعصاب']
  },
  {
    id: 'art-4',
    slug: 'skin-care-in-summer',
    title: 'مراقبت‌های ضروری پوست در برابر نور خورشید و ضدآفتاب مناسب',
    category: 'پوست و زیبایی',
    summary: 'نکات کلیدی انتخاب ضدآفتاب استاندارد، تجدید آن و پیشگیری از لک‌های پیگمانته تابستانی.',
    content: `استفاده روزانه از ضدآفتاب با SPF حداقل ۳۰ برای تمام افراد فارغ از جنسیت الزامی است.`,
    authorDoctorId: 'doc-3',
    authorDoctorName: 'دکتر سارا محمدی',
    reviewerDoctorName: 'انجمن پوست ایران',
    readTimeMinutes: 5,
    updatedAt: '۲۰ تیر ۱۴۰۵',
    coverImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=600',
    tags: ['پوست', 'ضدآفتاب', 'زیبایی']
  },
  {
    id: 'art-5',
    slug: 'childhood-vaccination-schedule',
    title: 'جدول کامل واکسیناسیون کشوری کودکان و مراقبت‌های تب پس از آن',
    category: 'اطفال',
    summary: 'تمام نکات مادرانه در مورد قطره فلج اطفال، واکسن پنج‌گانه و کنترل تب نوزاد در خانه.',
    content: `واکسیناسیون منظم موثرترین راه حفاظت کودک در برابر بیماری‌های خطرناک عفونی است.`,
    authorDoctorId: 'doc-6',
    authorDoctorName: 'دکتر پوریا سلیمانی',
    reviewerDoctorName: 'دپارتمان اطفال همرا کلینیک (HEMERA CLINIC)',
    readTimeMinutes: 7,
    updatedAt: '۲۵ تیر ۱۴۰۵',
    coverImage: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=600',
    tags: ['کودک', 'واکسن', 'سلامت نوزاد']
  },
  {
    id: 'art-6',
    slug: 'sleep-hygiene-and-mental-health',
    title: 'بهداشت خواب و تاثیر مستقیم آن بر اضطراب و عملکرد مغز',
    category: 'روانپزشکی',
    summary: 'خواب کم‌تر از ۷ ساعت چگونه سیستم ایمنی و هورمون‌های استرس را مختل می‌کند؟',
    content: `خواب کافی رکن اصلی سلامت روان و شادابی روزانه است. ایجاد روتین تاریک و خنک قبل از خواب کلید حل بی‌خوابی است.`,
    authorDoctorId: 'doc-8',
    authorDoctorName: 'دکتر امیرحسین باقری',
    reviewerDoctorName: 'دپارتمان روانپزشکی همرا کلینیک (HEMERA CLINIC)',
    readTimeMinutes: 5,
    updatedAt: '۲۶ تیر ۱۴۰۵',
    coverImage: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=600',
    tags: ['خواب', 'روانپزشکی', 'اضطراب']
  },
  {
    id: 'art-7',
    slug: 'cataract-early-symptoms',
    title: 'علائم اولیه آب مروارید و روش‌های مدرن جراحی لیزری چشم',
    category: 'چشم پزشکی',
    summary: 'تاری دید، کاهش دید در شب و حساسیت به نور چراغ‌ها نشان‌دهنده چیست؟',
    content: `جراحی آب مروارید یکی از ایمن‌ترین و سریع‌ترین عمل‌های سرپایی چشم پزشکی است.`,
    authorDoctorId: 'doc-9',
    authorDoctorName: 'دکتر مهدی موسوی',
    reviewerDoctorName: 'کلینیک چشم همرا کلینیک (HEMERA CLINIC)',
    readTimeMinutes: 4,
    updatedAt: '۲۷ تیر ۱۴۰۵',
    coverImage: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=600',
    tags: ['چشم', 'آب مروارید', 'بینایی']
  },
  {
    id: 'art-8',
    slug: 'pregnancy-nutrition-guide',
    title: 'تغذیه سه ماهه اول بارداری و مکمل‌های ضروری اسید فولیک',
    category: 'زنان و زایمان',
    summary: 'راهنمای جامع کنترل تهوع صبحگاهی و تامین ویتامین‌های نوزاد در ماه اول بارداری.',
    content: `مصرف اسید فولیک قبل و هنگام بارداری از نقص‌های لوله عصبی جنین جلوگیری می‌کند.`,
    authorDoctorId: 'doc-5',
    authorDoctorName: 'دکتر نرگس رضایی',
    reviewerDoctorName: 'انجمن متخصصین زنان ایران',
    readTimeMinutes: 6,
    updatedAt: '۲۸ تیر ۱۴۰۵',
    coverImage: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=600',
    tags: ['بارداری', 'زنان', 'تغذیه']
  },
  {
    id: 'art-9',
    slug: 'knee-pain-exercise-routine',
    title: 'تمرینات فیزیوتراپی خانگی برای تقویتی عضلات چهارسر و کاهش زانودرد',
    category: 'ارتوپدی',
    summary: 'حرکات ساده‌ای که بدون فشار به مفصل زانو، درد آرتروز را تسکین می‌دهند.',
    content: `تقویت عضلات اطراف زانو بار وزنی روی غضروف را تا ۵۰٪ کاهش می‌دهد.`,
    authorDoctorName: 'دکتر رضا احمدی',
    reviewerDoctorName: 'مرکز فیزیوتراپی همرا کلینیک (HEMERA CLINIC)',
    readTimeMinutes: 5,
    updatedAt: '۲۹ تیر ۱۴۰۵',
    coverImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600',
    tags: ['زانو', 'ارتوپدی', 'فیزیوتراپی']
  },
  {
    id: 'art-10',
    slug: 'sinusitis-home-remedies',
    title: 'تفاوت سینوزیت حاد و حساسیت فصلی به همراه روش‌های شستشوی بینی',
    category: 'گوش، حلق و بینی',
    summary: 'چگونه با سرم نمکی و بخور گیاهی گرفتگی سینوس‌ها را برطرف کنیم؟',
    content: `شستشوی روزانه مجاری بینی با محلول ایزوتونیک خط اول درمان سینوزیت غیرعفونی است.`,
    authorDoctorName: 'دکتر آناهیتا شریفی',
    reviewerDoctorName: 'دپارتمان ENT همرا کلینیک (HEMERA CLINIC)',
    readTimeMinutes: 4,
    updatedAt: '۳۰ تیر ۱۴۰۵',
    coverImage: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=600',
    tags: ['سینوزیت', 'گوش و حلق', 'سرماخوردگی']
  }
];

export const MOCK_DISEASES: DiseaseCondition[] = [
  {
    id: 'dis-1',
    slug: 'migraine',
    title: 'Migraine',
    persianTitle: 'میگرن و سردردهای نبض‌دار',
    overview: 'میگرن نوعی اختلال عصبی پیچیده است که با سردردهای شدید و ضربان‌دار در یک سمت سر، تهوع و حساسیت شدید به نور و صدا مشخص می‌شود.',
    symptoms: ['درد ضربان‌دار در یک سمت سر', 'تهوع و استفراغ', 'حساسیت به نور (فوتوفوبیا)', 'دیدن هاله‌های نورانی (اورا)'],
    causes: ['تغییرات هورمونی', 'استرس و فشار عصبی', 'مصرف پنیر کهنه، شکلات یا کافئین زیاد', 'کم‌خوابی یا تغییر الگوی خواب'],
    diagnosisMethods: ['معاینه دقیق نورولوژیک', 'نوار عصب و مغز', 'ام‌ارآی (MRI) جهت رد سایر علل'],
    treatments: ['داروهای پیشگیری کننده میگرن', 'تزریق بوتاکس درمانی میگرن', 'اصلاح سبک زندگی و الگوی خواب'],
    whenToSeeDoctor: 'اگر سردرد شما ناگهانی و شدید شد، همراه با تب، سفتی گردن یا ضعف در یک سمت بدن بود فوراً به پزشک مراجعه کنید.',
    relatedSpecialties: ['spec-neuro', 'spec-psych']
  },
  {
    id: 'dis-2',
    slug: 'hypertension',
    title: 'Hypertension',
    persianTitle: 'فشار خون بالا (قاتل خاموش)',
    overview: 'افزایش مزمن فشار خون در داخل عروق سرخرگی که می‌تواند به مرور به کلیه‌ها، چشم و قلب آسیب وارد کند.',
    symptoms: ['سردرد پس سری صبحگاهی', 'تپش قلب', 'سرگیجه', 'تاری دید در موارد شدید'],
    causes: ['مصرف زیاد نمک', 'چاقی و کم‌تحرکی', 'سابقه خانوادگی', 'استرس و دخانیات'],
    diagnosisMethods: ['اندازه‌گیری دوره‌ای فشار خون', 'هولتر ۲۴ ساعته فشار خون', 'آزمایش کلیه و ادرار'],
    treatments: ['داروهای مهارکننده ACE و لوزارتان', 'رژیم غذایی کم‌نمک (DASH)', 'ورزش منظم هوازی'],
    whenToSeeDoctor: 'اگر فشار خون بالای ۱۸۰/۱۲۰ همراه با درد قفسه سینه یا سردرد شدید باشد نیازمند اورژانس فوری است.',
    relatedSpecialties: ['spec-cardio']
  },
  {
    id: 'dis-3',
    slug: 'fatty-liver',
    title: 'Fatty Liver Disease',
    persianTitle: 'کبد چرب غیرالکلی (NAFLD)',
    overview: 'تجمع غیرطبیعی چربی در سلول‌های کبد که در صورت عدم درمان می‌تواند منجر به فیبروز و سیروز کبدی شود.',
    symptoms: ['خستگی مزمن', 'سنگینی یا درد مبهم در سمت راست بالای شکم', 'لکه‌های پوستی'],
    causes: ['رژیم غذایی پرکربوهیدرات و شیرینی', 'اضافه وزن', 'مقاومت به انسولین'],
    diagnosisMethods: ['سونوگرافی شکم', 'آزمایش آنزیم‌های ALT و AST', 'فیبرواسکن کبد'],
    treatments: ['کاهش ۷ تا ۱۰ درصد وزن بدن', 'ورزش روزانه', 'مکمل‌های ویتامین E و ویتامین‌های آنتی‌اکسیدان'],
    whenToSeeDoctor: 'در صورت زرد شدن چشم‌ها، ورم شکم یا خستگی مفرط با متخصص گوارش مشورت کنید.',
    relatedSpecialties: ['spec-gastro']
  },
  {
    id: 'dis-4',
    slug: 'diabetes',
    title: 'Diabetes Mellitus',
    persianTitle: 'دیابت شیرین (نوع ۲)',
    overview: 'اختلال متابولیک ناشی از عدم پاسخ کافی بدن به انسولین که منجر به افزایش قند خون می‌شود.',
    symptoms: ['پرنوشی و پراداری', 'کاهش وزن ناگهانی', 'تاری دید', 'دیر التیام یافتن زخم‌ها'],
    causes: ['سابقه ژنتیکی', 'چاقی شکمی', 'سبک زندگی بی‌تحرک'],
    diagnosisMethods: ['آزمایش قند خون ناشتا (FBS)', 'تست هموگلوبین A1C', 'تست تحمل گلوکز'],
    treatments: ['قرص متفورمین و داروهای کنترل قند', 'رژیم غذایی کم‌کربوهیدرات', 'پایش روزانه قند خون'],
    whenToSeeDoctor: 'افت شدید قند خون (هیپوگلیسمی) یا قند بالاتر از ۳۰۰ نیازمند بررسی فوری پزشکی است.',
    relatedSpecialties: ['spec-gastro', 'spec-cardio']
  },
  {
    id: 'dis-5',
    slug: 'acid-reflux',
    title: 'Acid Reflux / GERD',
    persianTitle: 'ریفلاکس اسید معده به مری',
    overview: 'بازگشت محتویات اسیدی معده به مری ناشی از شل بودن دریچه تحتانی مری (LES).',
    symptoms: ['سوزش پشت جناغ سینه (ترش کردن)', 'مزه تلخ در دهان', 'سرفه خشک صبحگاهی', 'سختی در بلع'],
    causes: ['خوردن غذاهای پرچرب و تند', 'خوابیدن بلافاصله پس از غذا', 'مصرف زیاد قهوه و چای پررنگ'],
    diagnosisMethods: ['اندوسکوپی فوقانی', 'مانومتری مری', 'پایش pH مری'],
    treatments: ['داروهای مهارکننده پمپ پروتون (امپرازول)', 'تغییر رژیم غذایی', 'بالا بردن سر هنگام خواب'],
    whenToSeeDoctor: 'سختی بلع مداوم یا گیر کردن غذا نیازمند بررسی فوری اندوسکوپی است.',
    relatedSpecialties: ['spec-gastro', 'spec-ent']
  },
  {
    id: 'dis-6',
    slug: 'asthma',
    title: 'Asthma',
    persianTitle: 'آسم و آلرژی‌های تنفسی',
    overview: 'التهاب مزمن مجاری هوایی ریه که باعث تنگی نفس و خس‌خس سینه می‌شود.',
    symptoms: ['تنگی نفس هنگام فعالیت', 'خس‌خس سینه', 'سرفه خشک شبانه'],
    causes: ['آلودگی هوا', 'پشم حیوانات خانگی', 'گرده گیاهان', 'سابقه ژنتیکی'],
    diagnosisMethods: ['اسپیرومتری (تست تنفس)', 'تست آلرژی پوستی'],
    treatments: ['اسپری‌های کورتون تنفسی', 'اسپری سالبوتامول برای حملات'],
    whenToSeeDoctor: 'تنگی نفس شدید که با اسپری برطرف نشود نیازمند اورژانس فوری است.',
    relatedSpecialties: ['spec-pulmo']
  },
  {
    id: 'dis-7',
    slug: 'hypothyroidism',
    title: 'Hypothyroidism',
    persianTitle: 'کم‌کاری غده تیروئید',
    overview: 'کاهش ترشح هورمون‌های تیروئید (T3 و T4) که سوخت‌وساز بدن را کند می‌کند.',
    symptoms: ['افزایش وزن ناگهانی', 'احساس سرمای زیاد', 'خشکی پوست و ریزش مو', 'افسردگی و خستگی'],
    causes: ['بیماری خودایمنی هاشیموتو', 'کمبود ید در رژیم غذایی'],
    diagnosisMethods: ['آزمایش هورمونی TSH و Free T4', 'سونوگرافی تیروئید'],
    treatments: ['مصرف قرص لووتیروکسین صبح ناشتا'],
    whenToSeeDoctor: 'در صورت احساس توده در گلو یا تپش قلب شدید با فوق تخصص غدد مشورت کنید.',
    relatedSpecialties: ['spec-endo']
  },
  {
    id: 'dis-8',
    slug: 'kidney-stones',
    title: 'Kidney Stones',
    persianTitle: 'سنگ کلیه و مجاری ادراری',
    overview: 'رسوب سخت مواد معدنی و نمک‌ها در کلیه‌ها که باعث دردهای پهلوی شدیدی می‌شود.',
    symptoms: ['درد تیرکشنده شدید در پهلو و پهلوی عقب', 'تغییر رنگ ادرار یا خون در ادرار', 'تهوع و سوزش ادرار'],
    causes: ['مصرف کم آب', 'مصرف بالای نمک و پروتئین حیوانی'],
    diagnosisMethods: ['سی‌تی اسکن بدون حاجب', 'سونوگرافی کلیه و مجاری ادراری', 'آزمایش کامل ادرار'],
    treatments: ['مصرف مایعات فراوان و مسکن', 'سنگ‌شکنی برون‌پیکری (ESWL)', 'جراحی لیزری'],
    whenToSeeDoctor: 'در صورت همراه شدن درد پهلو با تب و لرز فوراً به اورژانس مراجعه کنید.',
    relatedSpecialties: ['spec-uro']
  },
  {
    id: 'dis-9',
    slug: 'eczema',
    title: 'Atopic Dermatitis / Eczema',
    persianTitle: 'اگزما و التهاب‌های پوستی خارش‌دار',
    overview: 'بیماری مزمن پوستی که با قرمز شدن، خشکی شدید و خارش پوست همراه است.',
    symptoms: ['خارش شدید به ویژه شب‌ها', 'لکه‌های قرمز تا قهوه‌ای روی دست و چین زانوها', 'پوسته‌پوسته شدن'],
    causes: ['اختلال در سد دفاعی پوست', 'تماس با شوینده‌های قوی یا صابون‌های عطری'],
    diagnosisMethods: ['معاینه بالینی متخصص پوست', 'پچ تست آلرژی'],
    treatments: ['پمادهای مرطوب‌کننده غنی (امولینت)', 'پمادهای موضعی کورتون در زمان فاز حاد'],
    whenToSeeDoctor: 'در صورت عفونی شدن زخم‌های پوستی و خروج ترشحات زرد رنگ به پزشک مراجعه کنید.',
    relatedSpecialties: ['spec-derm']
  },
  {
    id: 'dis-10',
    slug: 'cataract',
    title: 'Cataract',
    persianTitle: 'آب مروارید چشم',
    overview: 'کدر شدن عدسی طبیعی چشم که مانع از عبور شفاف نور به شبکیه می‌شود.',
    symptoms: ['تاری دید تدریجی', 'کاهش کیفیت دید در شب', 'حساسیت زیاد به نور آفتاب یا چراغ خودروها'],
    causes: ['کهولت سن', 'دیابت کنترل نشده', 'ضربه به چشم', 'مصرف طولانی‌مدت کورتون'],
    diagnosisMethods: ['معاینه با دستگاه اسلیت لمپ', 'تست بینایی‌سنجی'],
    treatments: ['جراحی تعویض عدسی چشم (فاکو)'],
    whenToSeeDoctor: 'در صورت افت ناگهانی بینایی جهت معاینه فوری چشم مراجعه کنید.',
    relatedSpecialties: ['spec-ophth']
  }
];

export const MOCK_CRM_RECORDS: PatientCRMRecord[] = [
  {
    patientId: 'user-patient-1',
    name: 'امیرحسین رضایی',
    phone: '09121112233',
    status: 'active',
    lifetimeVisits: 6,
    totalSpent: 2450000,
    lastVisitDate: '۱۸ تیر ۱۴۰۵',
    nextFollowUpDate: '۱۰ مرداد ۱۴۰۵',
    tags: ['قلب و عروق', 'چکاپ سالانه', 'بیمه ایران']
  },
  {
    patientId: 'patient-2',
    name: 'زهرا نوری',
    phone: '09122223344',
    status: 'vip',
    lifetimeVisits: 8,
    totalSpent: 4200000,
    lastVisitDate: '۲۰ تیر ۱۴۰۵',
    nextFollowUpDate: '۱۵ مرداد ۱۴۰۵',
    tags: ['پوست و زیبایی', 'مزوتراپی', 'VIP']
  },
  {
    patientId: 'patient-3',
    name: 'حسین کاظمی',
    phone: '09123334455',
    status: 'active',
    lifetimeVisits: 4,
    totalSpent: 1800000,
    lastVisitDate: '۲۷ تیر ۱۴۰۵',
    tags: ['ارتوپدی', 'زانو']
  },
  {
    patientId: 'patient-4',
    name: 'فرشته احمدی',
    phone: '09124445566',
    status: 'followup_needed',
    lifetimeVisits: 5,
    totalSpent: 2100000,
    lastVisitDate: '۱۵ خرداد ۱۴۰۵',
    nextFollowUpDate: '۱ مرداد ۱۴۰۵',
    tags: ['زنان و زایمان', 'بارداری']
  },
  {
    patientId: 'patient-5',
    name: 'کامران امیری',
    phone: '09125556677',
    status: 'vip',
    lifetimeVisits: 12,
    totalSpent: 6800000,
    lastVisitDate: '۲۸ تیر ۱۴۰۵',
    tags: ['قلب', 'VIP', 'چکاپ کامل']
  },
  ...Array.from({ length: 15 }, (_, i) => ({
    patientId: `patient-${i + 6}`,
    name: ['سارا بهرامی', 'مریم سعیدی', 'رضا جلالی', 'نیلوفر پارسا', 'علیرضا حسینی', 'مهدی قربانی', 'فاطمه ابراهیمی', 'پوریا کریمی', 'نرگس شریفی', 'امیرعلی رستمی', 'پریسا کاظمی', 'صادق محمدی', 'الهام رضایی', 'حامد داوودی', 'شیوا نجفی'][i],
    phone: `0912${i + 6}667788`,
    status: (i % 3 === 0 ? 'vip' : i % 3 === 1 ? 'followup_needed' : 'active') as 'vip' | 'followup_needed' | 'active' | 'new',
    lifetimeVisits: 3 + (i % 7),
    totalSpent: 1200000 + (i * 350000),
    lastVisitDate: `۱${i % 9} تیر ۱۴۰۵`,
    nextFollowUpDate: `۰${(i % 9) + 1} مرداد ۱۴۰۵`,
    tags: ['چکاپ عمومی', 'بیمه تکمیلی']
  }))
];

export const MOCK_ADMIN_KPIS: AdminKPIs = {
  todayPatients: 48,
  todayRevenue: 17850000,
  todayAppointments: 52,
  noShowRatePercent: 3.8,
  avgWaitTimeMinutes: 14,
  patientSatisfactionPercent: 98.4,
  activeDoctorsCount: 16
};

export const MOCK_CLINIC: Clinic = {
  id: 'clinic-1',
  name: 'مجتمع تخصصی و فوق‌تخصصی همرا کلینیک (HEMERA CLINIC)',
  legalName: 'مرکز جامع خدمات سلامت و درمان همرا کلینیک (HEMERA CLINIC)',
  code: 'HC-CLINIC-01',
  slug: 'hamrah-central',
  phone: '۰۲۱-۲۲۱۴۵۶۷۸',
  supportPhone: '۰۲۱-۲۲۱۴۵۶۷۹',
  emergencyPhone: '۰۲۱-۲۲۱۴۵۶۸۰',
  city: 'تهران',
  address: 'تهران، سعادت‌آباد، میدان کاج، خیابان سرو غربی، مجتمع پزشکی همرا کلینیک (HEMERA)',
  departments: [
    'دپارتمان قلب و عروق',
    'دپارتمان گوارش و کبد',
    'دپارتمان پوست و زیبایی',
    'دپارتمان ارتوپدی و مفاصل',
    'دپارتمان زنان و زایمان',
    'دپارتمان اطفال و نوزادان',
    'مرکز تصویربرداری و آزمایشگاه تشخیصی'
  ],
  branches: [
    {
      id: 'branch-1',
      name: 'شعبه مرکزی و فوق تخصصی سعادت‌آباد',
      code: 'BR-01',
      city: 'تهران',
      district: 'سعادت‌آباد (منطقه ۲)',
      address: 'سعادت‌آباد، میدان کاج، خیابان سرو غربی، نبش خیابان مروارید، مجتمع پزشکی همرا کلینیک (HEMERA)',
      floorAndUnit: 'طبقات ۱ تا ۵ (پذیرش و تریاژ در همکف)',
      phone: '۰۲۱-۲۲۱۴۵۶۷۸',
      emergencyPhone: '۰۲۱-۲۲۱۴۵۶۸۰',
      isMain: true,
      coordinates: { lat: 35.7832, lng: 51.3745 },
      image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&q=80&w=600',
      departments: ['قلب و عروق', 'ارتوپدی', 'پوست و لیزر', 'زنان و زایمان', 'آزمایشگاه جامع', 'تصویربرداری و ام‌آر‌آی'],
      facilities: ['پارکینگ طبقاتی اختصاصی مراجعین', 'دسترسی کامل ویلچر و رمپ استاندارد', 'داروخانه شبانه‌روزی', 'تریاژ و پذیرش فوری بدون نوبت', 'کافی‌شاپ سلامت'],
      metroAccess: 'ایستگاه مترو میدان کتاب (خط ۷) - فاصله ۵ دقیقه با تاکسی',
      busAccess: 'ایستگاه اتوبوس میدان کاج',
      parkingInfo: 'پارکینگ اختصاصی رایگان به مدت ۲ ساعت برای مراجعین کلینیک',
      isOpenNow: true,
      workingHours: 'همه‌روزه (حتی ایام تعطیل): ۰۷:۰۰ الی ۲۳:۰۰',
      todayPresentDoctorsCount: 14,
      currentQueueWaitMinutes: 12,
      inPersonBookingEnabled: true,
      note: 'پذیرش بیماران اورژانسی و حضوری بدون نوبت در واحد تریاژ طبقه همکف امکان‌پذیر است.',
      supportedInsurances: ['تأمین اجتماعی', 'خدمات درمانی', 'نیروهای مسلح (ساتا)', 'سلامت همگانی', 'بیمه ایران', 'بیمه دانا', 'بیمه البرز', 'بیمه آسیا', 'بیمه سامان', 'بیمه پارسیان', 'بیمه پاسارگاد', 'بیمه کوثر']
    },
    {
      id: 'branch-2',
      name: 'شعبه ونک و ملاصدرا (مرکز پاراکلینیک و قلب)',
      code: 'BR-02',
      city: 'تهران',
      district: 'ونک / ملاصدرا (منطقه ۳)',
      address: 'میدان ونک، خیابان ملاصدرا، نرسیده به پل کردستان، ساختمان پزشکان ملاصدرا',
      floorAndUnit: 'طبقه همکف و دوم',
      phone: '۰۲۱-۸۸۷۷۶۶۵۵',
      emergencyPhone: '۰۲۱-۸۸۷۷۶۶۵۹',
      isMain: false,
      coordinates: { lat: 35.7592, lng: 51.4011 },
      image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=600',
      departments: ['قلب و اکوکاردیوگرافی', 'گوارش و آندوسکوپی', 'غدد و متابولیسم', 'سونوگرافی و داپلر', 'نوار عصب و عضله'],
      facilities: ['آسانسور برانکاردبر', 'اتاق استراحت بیماران آندوسکوپی', 'امکان پارک در خیابان و پارکینگ عمومی ونک', 'سالن نمونه‌گیری خون'],
      metroAccess: 'ایستگاه مترو حقانی (خط ۱) - اتوبوس‌های ونک',
      busAccess: 'پایانه اتوبوس‌رانی میدان ونک و بی‌آرتی ولیعصر',
      parkingInfo: 'پارکینگ عمومی جهان کودک و ونک سنتر در فاصله ۱۰۰ متری',
      isOpenNow: true,
      workingHours: 'شنبه تا چهارشنبه: ۰۸:۰۰ الی ۲۱:۰۰ | پنج‌شنبه: ۰۸:۰۰ الی ۱۵:۰۰',
      todayPresentDoctorsCount: 9,
      currentQueueWaitMinutes: 15,
      inPersonBookingEnabled: true,
      note: 'مرکز فوق تخصصی آندوسکوپی، کولونوسکوپی و هولتر فشار خون با تعیین وقت فوری حضوری.',
      supportedInsurances: ['تأمین اجتماعی', 'خدمات درمانی', 'نیروهای مسلح (ساتا)', 'بیمه ایران', 'بیمه البرز', 'بیمه آسیا', 'بیمه کوثر']
    },
    {
      id: 'branch-3',
      name: 'شعبه پاسداران و هروی (کلینیک مادر، کودک و پوست)',
      code: 'BR-03',
      city: 'تهران',
      district: 'پاسداران / هروی (منطقه ۴)',
      address: 'خیابان پاسداران، میدان هروی، بلوار پناهی‌نیا، پلاک ۴۸، ساختمان سلامت همرا کلینیک (HEMERA)',
      floorAndUnit: 'طبقه ۱ و ۳',
      phone: '۰۲۱-۲۲۹۸۴۴۵۵',
      emergencyPhone: '۰۲۱-۲۲۹۸۴۴۵۹',
      isMain: false,
      coordinates: { lat: 35.7688, lng: 51.4721 },
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600',
      departments: ['اطفال و نوزادان', 'زنان و مامایی', 'پوست، مو و لیزر', 'تغذیه و رشد کودک', 'روانشناسی کودک'],
      facilities: ['اتاق بازی کودکان', 'فضای شیردهی مادران', 'دستگاه‌های لیزر ۲۰۲۶', 'پارکینگ اختصاصی مراجعین'],
      metroAccess: 'ایستگاه مترو میدان هروی (خط ۳) - فاصله ۳ دقیقه پیاده',
      busAccess: 'خطوط تاکسی میدان رسالت - میدان هروی',
      parkingInfo: 'پارکینگ اختصاصی در منفی ۱ ساختمان',
      isOpenNow: true,
      workingHours: 'شنبه تا پنج‌شنبه: ۰۸:۳۰ الی ۲۰:۳۰',
      todayPresentDoctorsCount: 8,
      currentQueueWaitMinutes: 10,
      inPersonBookingEnabled: true,
      note: 'واکسیناسیون نوزادان و پایش رشد کودکان همه‌روزه به صورت حضوری و بدون معطلی انجام می‌شود.',
      supportedInsurances: ['تأمین اجتماعی', 'خدمات درمانی', 'سلامت همگانی', 'بیمه دانا', 'بیمه سامان', 'بیمه پارسیان', 'بیمه ایران']
    },
    {
      id: 'branch-4',
      name: 'شعبه صادقیه و بلوار فردوس (غرب تهران)',
      code: 'BR-04',
      city: 'تهران',
      district: 'صادقیه / فردوس شرق (منطقه ۵)',
      address: 'فلکه دوم صادقیه، ابتدای بلوار فردوس شرق، جنب مجتمع آیریک سنتر، پلاک ۱۲',
      floorAndUnit: 'طبقه همکف و اول',
      phone: '۰۲۱-۴۴۰۱۸۸۹۹',
      isMain: false,
      coordinates: { lat: 35.7215, lng: 51.3284 },
      image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=600',
      departments: ['ارتوپدی و فیزیوتراپی', 'مغز و اعصاب', 'چشم‌پزشکی و بینایی‌سنجی', 'پزشک عمومی و اورژانس سرپایی'],
      facilities: ['سالن فیزیوتراپی مجهز', 'دستگاه اپتومتری دیجیتال', 'رمپ معلولین', 'تزریقات و سرم‌تراپی'],
      metroAccess: 'ایستگاه مترو صادقیه (تقاطع خط ۲ و ۵) - ۳ دقیقه پیاده',
      busAccess: 'پایانه اتوبوس‌رانی غرب و بی‌آرتی جناح',
      parkingInfo: 'امکان پارک در پارکینگ طبقاتی صادقیه',
      isOpenNow: true,
      workingHours: 'شنبه تا پنج‌شنبه: ۰۸:۰۰ الی ۲۲:۰۰',
      todayPresentDoctorsCount: 11,
      currentQueueWaitMinutes: 8,
      inPersonBookingEnabled: true,
      note: 'واحد فیزیوتراپی و توانبخشی مفاصل با نوبت‌دهی سریع حضوری و دستگاه‌های مدرن تکار و لیزر پرتوان.',
      supportedInsurances: ['تأمین اجتماعی', 'خدمات درمانی', 'نیروهای مسلح (ساتا)', 'بیمه ایران', 'بیمه دانا', 'بیمه پاسارگاد']
    },
    {
      id: 'branch-5',
      name: 'شعبه پیروزی و نبرد (شرق تهران)',
      code: 'BR-05',
      city: 'تهران',
      district: 'خیابان پیروزی (منطقه ۱۴)',
      address: 'خیابان پیروزی، چهارراه کوکاکولا، ابتدای خیابان نبرد شمالی، مجتمع پزشکی نبرد',
      floorAndUnit: 'طبقه ۲ و ۳',
      phone: '۰۲۱-۷۷۴۵۱۲۳۴',
      isMain: false,
      coordinates: { lat: 35.6948, lng: 51.4889 },
      image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=600',
      departments: ['پزشک عمومی و چکاپ', 'داخلی و دیابت', 'قلب و عروق', 'تزریقات و پانسمان', 'شنوایی‌سنجی'],
      facilities: ['اتاق تزریقات مجزا برای بانوان و آقایان', 'دستگاه نوار قلب فوری', 'آسانسور استاندارد', 'داروخانه همجوار'],
      metroAccess: 'ایستگاه مترو نبرد (خط ۴) - دقیقا روبروی کلینیک',
      busAccess: 'ایستگاه اتوبوس کوکاکولا',
      parkingInfo: 'پارکینگ عمومی چهارراه نبرد',
      isOpenNow: true,
      workingHours: 'شنبه تا پنج‌شنبه: ۰۸:۰۰ الی ۲۱:۰۰',
      todayPresentDoctorsCount: 7,
      currentQueueWaitMinutes: 10,
      inPersonBookingEnabled: true,
      note: 'پایش فشار و قند خون رایگان برای سالمندان محترم و نوبت‌دهی حضوری در کمترین زمان.',
      supportedInsurances: ['تأمین اجتماعی', 'سلامت همگانی', 'بیمه ایران', 'بیمه البرز', 'بیمه آسیا']
    }
  ],
  operatingHours: 'شنبه تا پنج‌شنبه: ۰۷:۳۰ الی ۲۱:۳۰',
  settings: {
    defaultAppointmentDuration: 20,
    autoReminderHours: 24,
    allowOnlineCancellation: true,
    maxQueueWaitWarningMinutes: 25
  }
};

export const MOCK_CLINIC_STAFF: ClinicStaff[] = [
  {
    id: 'staff-1',
    userId: 'user-secretary-1',
    name: 'سارا کاظمی',
    role: 'secretary',
    roleTitle: 'سرپرست پذیرش و منشی ارشد',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
    phone: '09125556677',
    email: 's.kazemi@hamrahclinic.ir',
    clinicId: 'clinic-1',
    branchId: 'branch-1',
    status: 'active',
    shift: 'morning',
    assignedDoctorIds: ['doc-1', 'doc-2', 'doc-3'],
    activeTasksCount: 4
  },
  {
    id: 'staff-2',
    userId: 'user-reception-2',
    name: 'مریم حسینی‌نیا',
    role: 'reception',
    roleTitle: 'مسئول نوبت‌دهی و پذیرش حضوری',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150',
    phone: '09124447788',
    email: 'm.hosseini@hamrahclinic.ir',
    clinicId: 'clinic-1',
    branchId: 'branch-1',
    status: 'active',
    shift: 'evening',
    assignedDoctorIds: ['doc-4', 'doc-5', 'doc-6'],
    activeTasksCount: 2
  },
  {
    id: 'staff-3',
    userId: 'user-nurse-1',
    name: 'پرستار زهرا سعیدی',
    role: 'nurse',
    roleTitle: 'پرستار تریاژ و کنترل علائم حیاتی',
    avatar: 'https://images.unsplash.com/photo-1590650516494-0c8e4a4dd67e?auto=format&fit=crop&q=80&w=150',
    phone: '09123338899',
    email: 'z.saeedi@hamrahclinic.ir',
    clinicId: 'clinic-1',
    branchId: 'branch-1',
    status: 'busy',
    shift: 'full',
    assignedDoctorIds: ['doc-1', 'doc-4'],
    activeTasksCount: 3
  },
  {
    id: 'staff-4',
    userId: 'user-clinic-manager-1',
    name: 'مهندس علیرضا صبوری',
    role: 'clinic_manager',
    roleTitle: 'مدیر اجرایی و عملیات کلینیک',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
    phone: '09128889911',
    email: 'a.sabouri@hamrahclinic.ir',
    clinicId: 'clinic-1',
    branchId: 'branch-1',
    status: 'active',
    shift: 'full',
    activeTasksCount: 2
  }
];

export const MOCK_CLINIC_TASKS: ClinicTask[] = [
  {
    id: 'task-1',
    title: 'تأیید نوبت بیمار فردا (مهری رضایی - گوارش)',
    description: 'تماس تلفنی جهت تأیید ویزیت فردا ساعت ۱۰:۰۰ نزد دکتر کریمی و یادآوری همراه داشتن جواب فیبرواسکن.',
    type: 'confirm_appointment',
    clinicId: 'clinic-1',
    branchId: 'branch-1',
    assignedTo: 'user-secretary-1',
    assignedToName: 'سارا کاظمی',
    assignedRole: 'secretary',
    createdBy: 'system-auto',
    createdByName: 'اتوماسیون یادآوری نوبت‌ها',
    patientId: 'user-patient-1',
    patientName: 'مهری رضایی (مادر امیرحسین رضایی)',
    patientPhone: '09121112233',
    doctorId: 'doc-2',
    doctorName: 'دکتر علیرضا کریمی',
    appointmentId: 'app-102',
    priority: 'high',
    status: 'todo',
    dueDate: getRelativeISODate(0),
    createdAt: getRelativeISODate(0),
    actionPayload: {
      suggestedAction: 'call',
      targetPhone: '09121112233',
      templateKey: 'appointment_confirmation'
    }
  },
  {
    id: 'task-2',
    title: 'پیگیری جواب آزمایش خون بیمار قلبی (حسین کاظمی)',
    description: 'آزمایش چربی خون و انعقاد بیمار توسط آزمایشگاه آماده شده؛ بارگذاری در پرونده دکتر حسینی و اطلاع‌رسانی.',
    type: 'result_followup',
    clinicId: 'clinic-1',
    branchId: 'branch-1',
    assignedTo: 'user-secretary-1',
    assignedToName: 'سارا کاظمی',
    assignedRole: 'secretary',
    createdBy: 'user-doctor-1',
    createdByName: 'دکتر مریم حسینی',
    patientId: 'patient-3',
    patientName: 'حسین کاظمی',
    patientPhone: '09123334455',
    doctorId: 'doc-1',
    doctorName: 'دکتر مریم حسینی',
    priority: 'urgent',
    status: 'todo',
    dueDate: getRelativeISODate(0),
    createdAt: getRelativeISODate(0),
    actionPayload: {
      suggestedAction: 'view_record',
      targetPhone: '09123334455'
    }
  },
  {
    id: 'task-3',
    title: 'ارسال پیامک آمادگی اندوسکوپی به کامران امیری',
    description: 'بیمار پس‌فردا نوبت اندوسکوپی دارد؛ دستورالعمل ناشتایی و داروی آمادگی روده باید پیامک شود.',
    type: 'document_collection',
    clinicId: 'clinic-1',
    branchId: 'branch-1',
    assignedTo: 'user-secretary-1',
    assignedToName: 'سارا کاظمی',
    assignedRole: 'secretary',
    createdBy: 'user-doctor-2',
    createdByName: 'دکتر علیرضا کریمی',
    patientId: 'patient-5',
    patientName: 'کامران امیری',
    patientPhone: '09125556677',
    doctorId: 'doc-2',
    doctorName: 'دکتر علیرضا کریمی',
    priority: 'normal',
    status: 'todo',
    dueDate: getRelativeISODate(0),
    createdAt: getRelativeISODate(0),
    actionPayload: {
      suggestedAction: 'sms',
      targetPhone: '09125556677',
      templateKey: 'appointment_reminder'
    }
  },
  {
    id: 'task-4',
    title: 'پیگیری بیمار عدم مراجعه (فرشته احمدی)',
    description: 'بیمار نوبت قبلی حاضر نشد؛ تماس جهت بررسی وضعیت بارداری و تعیین وقت جایگزین.',
    type: 'no_show_followup',
    clinicId: 'clinic-1',
    branchId: 'branch-1',
    assignedTo: 'user-secretary-1',
    assignedToName: 'سارا کاظمی',
    assignedRole: 'secretary',
    createdBy: 'system-auto',
    createdByName: 'سیستم پایش No-Show',
    patientId: 'patient-4',
    patientName: 'فرشته احمدی',
    patientPhone: '09124445566',
    doctorId: 'doc-5',
    doctorName: 'دکتر نرگس رضایی',
    priority: 'normal',
    status: 'in_progress',
    dueDate: getRelativeISODate(0),
    createdAt: getRelativeISODate(-1),
    actionPayload: {
      suggestedAction: 'reschedule',
      targetPhone: '09124445566'
    }
  },
  {
    id: 'task-5',
    title: 'بررسی ثبت ویزیت‌های بیمه تکمیلی امروز',
    description: 'تطبیق فیش‌های واریزی بیمه ایران و دانا با گزارش سیستم حسابداری پایان شیفت.',
    type: 'payment_followup',
    clinicId: 'clinic-1',
    branchId: 'branch-1',
    assignedTo: 'user-clinic-manager-1',
    assignedToName: 'مهندس علیرضا صبوری',
    assignedRole: 'clinic_manager',
    createdBy: 'user-clinic-manager-1',
    createdByName: 'مهندس علیرضا صبوری',
    priority: 'low',
    status: 'todo',
    dueDate: getRelativeISODate(0),
    createdAt: getRelativeISODate(0)
  },
  {
    id: 'task-6',
    title: 'ارسال گزارش کنترل علائم حیاتی بیمار قلبی (امیرحسین رضایی)',
    description: 'فشار خون بیمار در تریاژ 130/85 ثبت شد؛ پرونده به دکتر حسینی ارجاع داده شد.',
    type: 'prepare_record',
    clinicId: 'clinic-1',
    branchId: 'branch-1',
    assignedTo: 'user-secretary-1',
    assignedToName: 'سارا کاظمی',
    assignedRole: 'secretary',
    createdBy: 'user-nurse-1',
    createdByName: 'پرستار زهرا سعیدی',
    patientId: 'user-patient-1',
    patientName: 'امیرحسین رضایی',
    patientPhone: '09121112233',
    doctorId: 'doc-1',
    doctorName: 'دکتر مریم حسینی',
    appointmentId: 'app-101',
    priority: 'urgent',
    status: 'completed',
    dueDate: getRelativeISODate(0),
    createdAt: getRelativeISODate(0),
    completedAt: getRelativeISODate(0)
  }
];

export const MOCK_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    actorUserId: 'user-secretary-1',
    actorName: 'سارا کاظمی',
    actorRole: 'secretary',
    action: 'اعلام حضور بیمار',
    entityType: 'appointment',
    entityId: 'app-101',
    description: 'امیرحسین رضایی وارد کلینیک شد و در نوبت ویزیت دکتر حسینی قرار گرفت.',
    timestamp: '۱۰ دقیقه پیش'
  },
  {
    id: 'log-2',
    actorUserId: 'user-doctor-1',
    actorName: 'دکتر مریم حسینی',
    actorRole: 'doctor',
    action: 'ثبت نسخه الکترونیک',
    entityType: 'appointment',
    entityId: 'app-104',
    description: 'نسخه دارویی و دستورات بالینی بیمار حسین کاظمی ثبت و امضا شد.',
    timestamp: '۲۵ دقیقه پیش'
  },
  {
    id: 'log-3',
    actorUserId: 'system-auto',
    actorName: 'اتوماسیون هوشمند همرا کلینیک (HEMERA CLINIC)',
    actorRole: 'admin',
    action: 'ثبت شبیه‌ساز پیامک یادآوری',
    entityType: 'notification',
    entityId: 'notif-101',
    description: 'پیام یادآوری در نسخه نمایشی برای ۶ بیمار ثبت شد.',
    timestamp: '۴۵ دقیقه پیش'
  },
  {
    id: 'log-4',
    actorUserId: 'user-clinic-manager-1',
    actorName: 'مهندس علیرضا صبوری',
    actorRole: 'clinic_manager',
    action: 'تغییر ظرفیت نوبت‌دهی',
    entityType: 'clinic',
    entityId: 'clinic-1',
    description: 'افزایش ۴ اسلات ویزیت فوق‌العاده برای کلینیک قلب شعبه سعادت‌آباد.',
    timestamp: '۱ ساعت پیش'
  },
  {
    id: 'log-5',
    actorUserId: 'user-patient-1',
    actorName: 'امیرحسین رضایی',
    actorRole: 'patient',
    action: 'رزرو آنلاین نوبت',
    entityType: 'appointment',
    entityId: 'app-102',
    description: 'رزرو نوبت فوق‌تخصص گوارش برای تاریخ فردا با پرداخت نمایشی.',
    timestamp: '۲ ساعت پیش'
  }
];

export const MOCK_AUTOMATION_RULES: ClinicAutomationRule[] = [
  {
    id: 'auto-1',
    title: 'یادآوری پیامکی نوبت ۲۴ ساعت قبل',
    description: 'ثبت خودکار پیامک حاوی زمان، آدرس کلینیک و دکمه تأیید حضور به شماره موبایل بیمار (شبیه‌سازی‌شده).',
    trigger: '۲۴ ساعت پیش از شروع نوبت ویزیت',
    action: 'ثبت پیامک الگو در لاگ شبیه‌ساز',
    category: 'reminder',
    enabled: true,
    lastRun: 'امروز ۰۸:۰۰',
    runCount: 142
  },
  {
    id: 'auto-2',
    title: 'ساخت خودکار وظیفه تماس برای نوبت‌های بدون تأیید',
    description: 'در صورتی که بیمار تا ۴ ساعت قبل از ویزیت تأیید نکند، تسک تماس تلفنی فوری برای منشی ایجاد می‌شود.',
    trigger: 'عدم تأیید پیامک تا ۴ ساعت قبل ویزیت',
    action: 'تولید تسک با اولویت بالا برای سرپرست پذیرش',
    category: 'task_generation',
    enabled: true,
    lastRun: 'امروز ۱۱:۳۰',
    runCount: 28
  },
  {
    id: 'auto-3',
    title: 'پیگیری خودکار بیماران No-Show (عدم حضور)',
    description: 'اگر وضعیت نوبت به عدم مراجعه تغییر کند، پیامک احوالپرسی و لینک رزرو مجدد ارسال می‌شود.',
    trigger: 'ثبت وضعیت No-Show در پایان شیفت',
    action: 'ارسال پیامک دلجویی و تولید تسک پیگیری',
    category: 'followup',
    enabled: true,
    lastRun: 'دیروز ۲۱:۰۰',
    runCount: 15
  },
  {
    id: 'auto-4',
    title: 'نظرسنجی کیفیت خدمات بعد از خروج بیمار',
    description: 'ثبت پیوند سنجش رضایت از پزشک، منشی و بهداشت محیط پس از ثبت وضعیت "تکمیل ویزیت".',
    trigger: '۳۰ دقیقه پس از اتمام ویزیت',
    action: 'ثبت پیامک نظرسنجی ۵ ستاره‌ای همرا کلینیک',
    category: 'quality',
    enabled: true,
    lastRun: 'امروز ۱۶:۱۵',
    runCount: 89
  }
];

export const MOCK_NOTIFICATIONS: ClinicNotification[] = [
  {
    id: 'notif-1',
    recipientPhone: '09121112233',
    recipientName: 'امیرحسین رضایی',
    type: 'sms',
    templateKey: 'appointment_confirmation',
    title: 'تأیید نوبت ویزیت قلب',
    message: 'جناب رضایی، نوبت شما نزد دکتر مریم حسینی برای امروز ساعت ۱۷:۳۰ تأیید گردید. آدرس: سعادت‌آباد، میدان کاج.',
    status: 'simulated',
    deliveryMode: 'prototype',
    sentAt: 'امروز ۱۲:۰۰'
  },
  {
    id: 'notif-2',
    recipientPhone: '09122223344',
    recipientName: 'زهرا نوری',
    type: 'sms',
    templateKey: 'appointment_reminder',
    title: 'لینک ورود به ویزیت آنلاین',
    message: 'سرکار خانم نوری، نوبت مشاوره آنلاین شما با دکتر سارا محمدی راس ساعت ۱۸:۱۵ آغاز خواهد شد.',
    status: 'simulated',
    deliveryMode: 'prototype',
    sentAt: 'امروز ۱۷:۰۰'
  },
  {
    id: 'notif-3',
    recipientPhone: '09125556677',
    recipientName: 'کامران امیری',
    type: 'sms',
    templateKey: 'appointment_reminder',
    title: 'دستورالعمل آمادگی اندوسکوپی',
    message: 'بیمار گرامی، لطفاً از ۱۲ ساعت قبل از مراجعه کاملاً ناشتا بوده و مدارک پیشین را همراه داشته باشید.',
    status: 'simulated',
    deliveryMode: 'prototype',
    sentAt: 'دیروز ۱۸:۳۰'
  }
];

export const MOCK_INSURANCES: InsuranceCompany[] = [
  // بیمه‌های پایه
  {
    id: 'ins-tamin',
    name: 'تأمین اجتماعی',
    type: 'basic',
    shortDescription: 'پوشش فرانشیز ویزیت، پاراکلینیک و نسخه الکترونیک سراسری',
    coverageCoPayPercent: 30,
    hasDirectOnlineClaim: false,
    electronicRxSupported: true,
    popular: true,
    notes: 'اطلاعات بیمه در نسخه فعلی نمایشی است و به سامانه آنلاین بیمه متصل نیست.',
    acceptedServicesCount: 24,
    acceptedDoctorsCount: 12
  },
  {
    id: 'ins-salamat',
    name: 'بیمه سلامت (خدمات درمانی)',
    type: 'basic',
    shortDescription: 'صندوق کارکنان دولت، ایرانیان و روستاییان با تعرفه نیمه‌دولتی مصوب',
    coverageCoPayPercent: 30,
    hasDirectOnlineClaim: false,
    electronicRxSupported: true,
    popular: true,
    notes: 'اطلاعات بیمه در نسخه فعلی نمایشی است و به سامانه آنلاین بیمه متصل نیست.',
    acceptedServicesCount: 22,
    acceptedDoctorsCount: 11
  },
  {
    id: 'ins-sata',
    name: 'نیروهای مسلح (ساتا)',
    type: 'basic',
    shortDescription: 'پوشش ویژه نیروهای مسلح، کادر نظامی، ایثارگران و خانواده‌های تحت تکفل',
    coverageCoPayPercent: 40,
    hasDirectOnlineClaim: false,
    electronicRxSupported: true,
    popular: true,
    notes: 'اطلاعات بیمه در نسخه فعلی نمایشی است و به سامانه آنلاین بیمه متصل نیست.',
    acceptedServicesCount: 24,
    acceptedDoctorsCount: 10
  },
  {
    id: 'ins-salamat-hamgani',
    name: 'سلامت همگانی / ایرانیان',
    type: 'basic',
    shortDescription: 'پوشش بیمه پایه درمانی دولتی ایرانیان فاقد پوشش بیمه‌ای دیگر',
    coverageCoPayPercent: 25,
    hasDirectOnlineClaim: false,
    electronicRxSupported: true,
    popular: false,
    notes: 'اطلاعات بیمه در نسخه فعلی نمایشی است و به سامانه آنلاین بیمه متصل نیست.',
    acceptedServicesCount: 18,
    acceptedDoctorsCount: 9
  },

  // بیمه‌های تکمیلی
  {
    id: 'ins-iran',
    name: 'بیمه ایران',
    type: 'supplementary',
    shortDescription: 'پوشش خدمات پاراکلینیک و ویزیت تخصصی بر اساس تعرفه‌های ثبت‌شده',
    coverageCoPayPercent: 70,
    hasDirectOnlineClaim: false,
    electronicRxSupported: true,
    popular: true,
    notes: 'اطلاعات بیمه در نسخه فعلی نمایشی است و به سامانه آنلاین بیمه متصل نیست.',
    acceptedServicesCount: 24,
    acceptedDoctorsCount: 12
  },
  {
    id: 'ins-dana',
    name: 'بیمه دانا',
    type: 'supplementary',
    shortDescription: 'خدمات درمانی، جراحی‌های سرپایی، آندوسکوپی و تصویربرداری',
    coverageCoPayPercent: 70,
    hasDirectOnlineClaim: false,
    electronicRxSupported: true,
    popular: true,
    notes: 'اطلاعات بیمه در نسخه فعلی نمایشی است و به سامانه آنلاین بیمه متصل نیست.',
    acceptedServicesCount: 23,
    acceptedDoctorsCount: 10
  },
  {
    id: 'ins-asia',
    name: 'بیمه آسیا',
    type: 'supplementary',
    shortDescription: 'پوشش پاراکلینیک، ویزیت فوق‌تخصصی و دپارتمان مادر و کودک',
    coverageCoPayPercent: 65,
    hasDirectOnlineClaim: false,
    electronicRxSupported: true,
    popular: true,
    notes: 'اطلاعات بیمه در نسخه فعلی نمایشی است و به سامانه آنلاین بیمه متصل نیست.',
    acceptedServicesCount: 21,
    acceptedDoctorsCount: 9
  },
  {
    id: 'ins-alborz',
    name: 'بیمه البرز',
    type: 'supplementary',
    shortDescription: 'امکان ارائه صورتحساب معتبر و گواهی ویزیت جهت تحویل به شعب بیمه',
    coverageCoPayPercent: 65,
    hasDirectOnlineClaim: false,
    electronicRxSupported: true,
    popular: true,
    notes: 'اطلاعات بیمه در نسخه فعلی نمایشی است و به سامانه آنلاین بیمه متصل نیست.',
    acceptedServicesCount: 20,
    acceptedDoctorsCount: 9
  },
  {
    id: 'ins-pasargad',
    name: 'بیمه پاسارگاد',
    type: 'supplementary',
    shortDescription: 'پوشش خدمات تشخیصی، نوار عصب و عضله، ویزیت روانپزشکی و اکوکاردیوگرافی',
    coverageCoPayPercent: 60,
    hasDirectOnlineClaim: false,
    electronicRxSupported: true,
    popular: true,
    notes: 'اطلاعات بیمه در نسخه فعلی نمایشی است و به سامانه آنلاین بیمه متصل نیست.',
    acceptedServicesCount: 20,
    acceptedDoctorsCount: 8
  },
  {
    id: 'ins-saman',
    name: 'بیمه سامان',
    type: 'supplementary',
    shortDescription: 'پوشش خدمات درمانی، لیزر درمانی و پایش بیماری‌های مزمن بر اساس تعرفه ثبت‌شده',
    coverageCoPayPercent: 65,
    hasDirectOnlineClaim: false,
    electronicRxSupported: true,
    popular: false,
    notes: 'اطلاعات بیمه در نسخه فعلی نمایشی است و به سامانه آنلاین بیمه متصل نیست.',
    acceptedServicesCount: 19,
    acceptedDoctorsCount: 8
  },
  {
    id: 'ins-parsian',
    name: 'بیمه پارسیان',
    type: 'supplementary',
    shortDescription: 'پوشش آزمایش‌های غربالگری، کلینیک چشم و شنوایی‌سنجی',
    coverageCoPayPercent: 60,
    hasDirectOnlineClaim: false,
    electronicRxSupported: true,
    popular: false,
    notes: 'اطلاعات بیمه در نسخه فعلی نمایشی است و به سامانه آنلاین بیمه متصل نیست.',
    acceptedServicesCount: 18,
    acceptedDoctorsCount: 8
  },
  {
    id: 'ins-kowsar',
    name: 'بیمه کوثر',
    type: 'supplementary',
    shortDescription: 'پوشش تکمیلی ویژه بازنشستگان و کارکنان بر اساس تعرفه مصوب',
    coverageCoPayPercent: 70,
    hasDirectOnlineClaim: false,
    electronicRxSupported: true,
    popular: false,
    notes: 'اطلاعات بیمه در نسخه فعلی نمایشی است و به سامانه آنلاین بیمه متصل نیست.',
    acceptedServicesCount: 20,
    acceptedDoctorsCount: 8
  },
  {
    id: 'ins-dey',
    name: 'بیمه دی (ایثارگران و خانواده شهدا)',
    type: 'specialized',
    shortDescription: 'پوشش فرانشیز درمان، دارو و خدمات کلینیکی برای جامعه محترم ایثارگران',
    coverageCoPayPercent: 95,
    hasDirectOnlineClaim: false,
    electronicRxSupported: true,
    popular: true,
    notes: 'اطلاعات بیمه در نسخه فعلی نمایشی است و به سامانه آنلاین بیمه متصل نیست.',
    acceptedServicesCount: 24,
    acceptedDoctorsCount: 12
  },
  {
    id: 'ins-banks-oil',
    name: 'صندوق رفاه بانک‌ها و نفت',
    type: 'specialized',
    shortDescription: 'سازمان‌های بانک‌های ملی، ملت، صادرات، تجارت و شرکت ملی نفت ایران',
    coverageCoPayPercent: 85,
    hasDirectOnlineClaim: false,
    electronicRxSupported: true,
    popular: true,
    notes: 'اطلاعات بیمه در نسخه فعلی نمایشی است و به سامانه آنلاین بیمه متصل نیست.',
    acceptedServicesCount: 24,
    acceptedDoctorsCount: 11
  }
];

export const MOCK_DOCTOR_SCHEDULES: DoctorSchedule[] = [
  // Dr. Maryam Hosseini (doc-1) - Office 1 (سعادت‌آباد off-1): Sat(0), Sun(1), Tue(3), Wed(4) 16:00-20:30
  {
    id: 'sch-doc1-off1-sat',
    doctorId: 'doc-1',
    clinicId: 'clinic-1',
    branchId: 'branch-1',
    officeId: 'off-1',
    officeTitle: 'مطب اصلی - سعادت‌آباد',
    dayOfWeek: 0, // شنبه
    startTime: '16:00',
    endTime: '20:30',
    visitDurationMinutes: 30,
    slotIntervalMinutes: 30,
    visitTypes: ['in_person'],
    active: true
  },
  {
    id: 'sch-doc1-off1-sun',
    doctorId: 'doc-1',
    clinicId: 'clinic-1',
    branchId: 'branch-1',
    officeId: 'off-1',
    officeTitle: 'مطب اصلی - سعادت‌آباد',
    dayOfWeek: 1, // یکشنبه
    startTime: '16:00',
    endTime: '20:30',
    visitDurationMinutes: 30,
    slotIntervalMinutes: 30,
    visitTypes: ['in_person'],
    active: true
  },
  {
    id: 'sch-doc1-off1-tue',
    doctorId: 'doc-1',
    clinicId: 'clinic-1',
    branchId: 'branch-1',
    officeId: 'off-1',
    officeTitle: 'مطب اصلی - سعادت‌آباد',
    dayOfWeek: 3, // سه‌شنبه
    startTime: '16:00',
    endTime: '20:30',
    visitDurationMinutes: 30,
    slotIntervalMinutes: 30,
    visitTypes: ['in_person'],
    active: true
  },
  {
    id: 'sch-doc1-off1-wed',
    doctorId: 'doc-1',
    clinicId: 'clinic-1',
    branchId: 'branch-1',
    officeId: 'off-1',
    officeTitle: 'مطب اصلی - سعادت‌آباد',
    dayOfWeek: 4, // چهارشنبه
    startTime: '16:00',
    endTime: '20:30',
    visitDurationMinutes: 30,
    slotIntervalMinutes: 30,
    visitTypes: ['in_person'],
    active: true
  },

  // Dr. Maryam Hosseini (doc-1) - Office 2 (ونک off-2): Mon(2), Thu(5) 09:00-13:30
  {
    id: 'sch-doc1-off2-mon',
    doctorId: 'doc-1',
    clinicId: 'clinic-1',
    branchId: 'branch-2',
    officeId: 'off-2',
    officeTitle: 'کلینیک ونک',
    dayOfWeek: 2, // دوشنبه
    startTime: '09:00',
    endTime: '13:30',
    visitDurationMinutes: 30,
    slotIntervalMinutes: 30,
    visitTypes: ['in_person'],
    active: true
  },
  {
    id: 'sch-doc1-off2-thu',
    doctorId: 'doc-1',
    clinicId: 'clinic-1',
    branchId: 'branch-2',
    officeId: 'off-2',
    officeTitle: 'کلینیک ونک',
    dayOfWeek: 5, // پنج‌شنبه
    startTime: '09:00',
    endTime: '13:30',
    visitDurationMinutes: 30,
    slotIntervalMinutes: 30,
    visitTypes: ['in_person'],
    active: true
  },

  // Dr. Maryam Hosseini (doc-1) - Online Consultations: Sat(0), Sun(1), Mon(2), Tue(3), Wed(4) 14:00-15:30
  ...[0, 1, 2, 3, 4].map(dow => ({
    id: `sch-doc1-online-${dow}`,
    doctorId: 'doc-1',
    clinicId: 'clinic-1',
    branchId: 'branch-1',
    dayOfWeek: dow,
    startTime: '14:00',
    endTime: '15:30',
    visitDurationMinutes: 20,
    slotIntervalMinutes: 20,
    visitTypes: ['online_video' as const, 'online_chat' as const],
    active: true
  })),

  // Dr. Alireza Karimi (doc-2): Sat(0), Mon(2), Wed(4) 10:00-14:00 and 16:30-19:30 in-person; Thu(5) online
  ...[0, 2, 4].map(dow => ({
    id: `sch-doc2-inperson-morn-${dow}`,
    doctorId: 'doc-2',
    clinicId: 'clinic-1',
    branchId: 'branch-1',
    dayOfWeek: dow,
    startTime: '10:00',
    endTime: '14:00',
    visitDurationMinutes: 25,
    slotIntervalMinutes: 25,
    visitTypes: ['in_person' as const],
    active: true
  })),
  ...[0, 2, 4].map(dow => ({
    id: `sch-doc2-inperson-eve-${dow}`,
    doctorId: 'doc-2',
    clinicId: 'clinic-1',
    branchId: 'branch-1',
    dayOfWeek: dow,
    startTime: '16:30',
    endTime: '19:30',
    visitDurationMinutes: 25,
    slotIntervalMinutes: 25,
    visitTypes: ['in_person' as const],
    active: true
  })),
  {
    id: 'sch-doc2-online-thu',
    doctorId: 'doc-2',
    clinicId: 'clinic-1',
    branchId: 'branch-1',
    dayOfWeek: 5, // پنج‌شنبه
    startTime: '15:00',
    endTime: '18:00',
    visitDurationMinutes: 20,
    slotIntervalMinutes: 20,
    visitTypes: ['online_video'],
    active: true
  },

  // Dr. Sara Tehrani (doc-3): Sat(0), Sun(1), Tue(3), Thu(5) 10:30-17:30
  ...[0, 1, 3, 5].map(dow => ({
    id: `sch-doc3-inperson-${dow}`,
    doctorId: 'doc-3',
    clinicId: 'clinic-1',
    branchId: 'branch-1',
    dayOfWeek: dow,
    startTime: '10:30',
    endTime: '17:30',
    visitDurationMinutes: 30,
    slotIntervalMinutes: 30,
    visitTypes: ['in_person' as const],
    active: true
  })),
  {
    id: 'sch-doc3-online-wed',
    doctorId: 'doc-3',
    clinicId: 'clinic-1',
    branchId: 'branch-1',
    dayOfWeek: 4, // چهارشنبه
    startTime: '15:00',
    endTime: '18:00',
    visitDurationMinutes: 20,
    slotIntervalMinutes: 20,
    visitTypes: ['online_video'],
    active: true
  },

  // Dr. Babak Rad (doc-4): Sat(0), Sun(1), Mon(2), Wed(4) 15:00-20:00
  ...[0, 1, 2, 4].map(dow => ({
    id: `sch-doc4-inperson-${dow}`,
    doctorId: 'doc-4',
    clinicId: 'clinic-1',
    branchId: 'branch-1',
    dayOfWeek: dow,
    startTime: '15:00',
    endTime: '20:00',
    visitDurationMinutes: 30,
    slotIntervalMinutes: 30,
    visitTypes: ['in_person' as const],
    active: true
  })),
  {
    id: 'sch-doc4-online-mon',
    doctorId: 'doc-4',
    clinicId: 'clinic-1',
    branchId: 'branch-1',
    dayOfWeek: 2, // دوشنبه
    startTime: '11:00',
    endTime: '13:00',
    visitDurationMinutes: 20,
    slotIntervalMinutes: 20,
    visitTypes: ['online_video'],
    active: true
  },

  // Dr. Niloofar Yeganeh (doc-5): Sat(0) through Wed(4) 09:30-14:30
  ...[0, 1, 2, 3, 4].map(dow => ({
    id: `sch-doc5-inperson-${dow}`,
    doctorId: 'doc-5',
    clinicId: 'clinic-1',
    branchId: 'branch-1',
    dayOfWeek: dow,
    startTime: '09:30',
    endTime: '14:30',
    visitDurationMinutes: 20,
    slotIntervalMinutes: 20,
    visitTypes: ['in_person' as const],
    active: true
  })),
  ...[0, 4].map(dow => ({
    id: `sch-doc5-online-${dow}`,
    doctorId: 'doc-5',
    clinicId: 'clinic-1',
    branchId: 'branch-1',
    dayOfWeek: dow,
    startTime: '16:00',
    endTime: '18:00',
    visitDurationMinutes: 20,
    slotIntervalMinutes: 20,
    visitTypes: ['online_video' as const],
    active: true
  })),

  // Dr. Mehran Salimi (doc-6): Sun(1), Tue(3), Thu(5) 16:00-20:30
  ...[1, 3, 5].map(dow => ({
    id: `sch-doc6-inperson-${dow}`,
    doctorId: 'doc-6',
    clinicId: 'clinic-1',
    branchId: 'branch-1',
    dayOfWeek: dow,
    startTime: '16:00',
    endTime: '20:30',
    visitDurationMinutes: 30,
    slotIntervalMinutes: 30,
    visitTypes: ['in_person' as const],
    active: true
  })),

  // Dr. Anahita Farahmand (doc-7): Sat(0), Mon(2), Wed(4) 11:00-17:00
  ...[0, 2, 4].map(dow => ({
    id: `sch-doc7-inperson-${dow}`,
    doctorId: 'doc-7',
    clinicId: 'clinic-1',
    branchId: 'branch-1',
    dayOfWeek: dow,
    startTime: '11:00',
    endTime: '17:00',
    visitDurationMinutes: 30,
    slotIntervalMinutes: 30,
    visitTypes: ['in_person' as const],
    active: true
  })),
  {
    id: 'sch-doc7-online-tue',
    doctorId: 'doc-7',
    clinicId: 'clinic-1',
    branchId: 'branch-1',
    dayOfWeek: 3, // سه‌شنبه
    startTime: '15:00',
    endTime: '18:00',
    visitDurationMinutes: 20,
    slotIntervalMinutes: 20,
    visitTypes: ['online_video'],
    active: true
  },

  // Dr. Behzad Naseri (doc-8): Sat(0), Sun(1), Tue(3), Wed(4) 16:00-21:00
  ...[0, 1, 3, 4].map(dow => ({
    id: `sch-doc8-inperson-${dow}`,
    doctorId: 'doc-8',
    clinicId: 'clinic-1',
    branchId: 'branch-1',
    dayOfWeek: dow,
    startTime: '16:00',
    endTime: '21:00',
    visitDurationMinutes: 20,
    slotIntervalMinutes: 20,
    visitTypes: ['in_person' as const],
    active: true
  })),

  // Dr. Fariba Afshar (doc-9): Sun(1), Mon(2), Wed(4) 09:30-15:00
  ...[1, 2, 4].map(dow => ({
    id: `sch-doc9-inperson-${dow}`,
    doctorId: 'doc-9',
    clinicId: 'clinic-1',
    branchId: 'branch-1',
    dayOfWeek: dow,
    startTime: '09:30',
    endTime: '15:00',
    visitDurationMinutes: 30,
    slotIntervalMinutes: 30,
    visitTypes: ['in_person' as const],
    active: true
  })),

  // Dr. Kaveh Sotoudeh (doc-10): Sat(0), Tue(3), Thu(5) 14:00-19:30
  ...[0, 3, 5].map(dow => ({
    id: `sch-doc10-inperson-${dow}`,
    doctorId: 'doc-10',
    clinicId: 'clinic-1',
    branchId: 'branch-1',
    dayOfWeek: dow,
    startTime: '14:00',
    endTime: '19:30',
    visitDurationMinutes: 25,
    slotIntervalMinutes: 25,
    visitTypes: ['in_person' as const],
    active: true
  })),

  // Dr. Farzaneh Motamedi (doc-11): Sat(0), Mon(2), Wed(4) 10:00-16:00
  ...[0, 2, 4].map(dow => ({
    id: `sch-doc11-inperson-${dow}`,
    doctorId: 'doc-11',
    clinicId: 'clinic-1',
    branchId: 'branch-1',
    dayOfWeek: dow,
    startTime: '10:00',
    endTime: '16:00',
    visitDurationMinutes: 30,
    slotIntervalMinutes: 30,
    visitTypes: ['in_person' as const],
    active: true
  })),

  // Dr. Pouria Shayan (doc-12): Sun(1), Tue(3), Wed(4) 16:30-21:00
  ...[1, 3, 4].map(dow => ({
    id: `sch-doc12-inperson-${dow}`,
    doctorId: 'doc-12',
    clinicId: 'clinic-1',
    branchId: 'branch-1',
    dayOfWeek: dow,
    startTime: '16:30',
    endTime: '21:00',
    visitDurationMinutes: 25,
    slotIntervalMinutes: 25,
    visitTypes: ['in_person' as const],
    active: true
  }))
];

export const MOCK_SCHEDULE_BLOCKS: ScheduleBlock[] = [
  {
    id: 'block-doc1-leave-1',
    doctorId: 'doc-1',
    clinicId: 'clinic-1',
    startDate: getRelativeISODate(6), // 6 days in future
    endDate: getRelativeISODate(6),
    reasonType: 'leave',
    reasonDescription: 'مرخصی و حضور در کنگره بین‌المللی قلب و عروق',
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'block-doc1-off2-maint',
    doctorId: 'doc-1',
    clinicId: 'clinic-1',
    officeId: 'off-2',
    startDate: getRelativeISODate(9),
    endDate: getRelativeISODate(9),
    reasonType: 'closed_office',
    reasonDescription: 'تعمیرات و کالیبراسیون دستگاه اکوکاردیوگرافی مطب ونک',
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'block-doc2-break-1',
    doctorId: 'doc-2',
    clinicId: 'clinic-1',
    startDate: getRelativeISODate(1),
    endDate: getRelativeISODate(1),
    startTime: '12:00',
    endTime: '13:00',
    reasonType: 'break',
    reasonDescription: 'جلسه کمیسیون پزشکی و مشاوره جراحی گوارش',
    active: true,
    createdAt: new Date().toISOString()
  }
];


