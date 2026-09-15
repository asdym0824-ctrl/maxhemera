import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Mail, 
  Send, 
  Calendar, 
  CheckCircle2, 
  ShieldCheck,
  Building,
  Navigation,
  MessageSquare,
  Instagram,
  Linkedin
} from 'lucide-react';
import { Doctor } from '../../types';
import { ThemeStyles } from './themeConfig';

interface Props {
  doctor: Doctor;
  theme: ThemeStyles;
  onBookOffice: (officeName?: string, officeId?: string) => void;
}

export const DoctorSiteContact: React.FC<Props> = ({ doctor, theme, onBookOffice }) => {
  const [formSent, setFormSent] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    subject: 'پرسش عمومی از مطب',
    message: ''
  });

  const offices = doctor.offices && doctor.offices.length > 0 ? doctor.offices : [
    {
      id: 'default-off',
      title: 'مطب اصلی',
      address: doctor.address,
      phone: doctor.websiteConfig?.phone || '۰۲۱-۲۲۰۰۱۱۰۰',
      workingHours: 'شنبه تا چهارشنبه از ساعت ۱۶:۰۰ الی ۲۱:۰۰',
      isPrimary: true
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    setFormSent(true);
  };

  const socials = doctor.websiteConfig?.socialLinks;

  return (
    <div className="py-16 md:py-20 bg-slate-50/60 min-h-screen text-right" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${theme.badgeBg}`}>
            <Phone className="w-3.5 h-3.5" />
            <span>راه‌های ارتباط و آدرس مطب‌ها</span>
          </span>
          <h1 className={`text-2xl sm:text-3xl ${theme.sectionHeadingClass}`}>
            تماس با مطب {doctor.name}
          </h1>
          <p className="text-slate-600 text-sm leading-relaxed">
            مشاهده شعب و مطب‌های فعال، ساعات حضور، شماره تماس مستقیم پذیرش و ارسال پیام به منشی
          </p>
        </div>

        {/* Office Location Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {offices.map(office => (
            <div
              key={office.id}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900">{office.title}</h3>
                      {office.isPrimary && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          مطب اصلی
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-slate-600">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{office.address}</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>تلفن تماس: </span>
                    <a href={`tel:${office.phone.replace(/[^0-9]/g, '')}`} className="font-mono font-bold text-slate-900 hover:text-blue-700 hover:underline" dir="ltr">
                      {office.phone}
                    </a>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>ساعات پذیرش: <strong className="text-slate-800 font-semibold">{office.workingHours}</strong></span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => onBookOffice(office.title, office.id)}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 ${theme.primaryButton}`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>دریافت نوبت در این مطب</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 2-Column: Direct Message Form & Quick Channels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className={`w-5 h-5 ${theme.accentIconColor}`} />
                <span>ارسال پیام یا سوال به منشی مطب</span>
              </h3>
              <p className="text-xs text-slate-500">
                پرسش‌های اداری، مدارک لازم یا هماهنگی پرونده را از طریق این فرم ارسال فرمایید.
              </p>
            </div>

            {formSent ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-in fade-in">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-slate-900 text-sm">پیام شما با موفقیت ثبت شد</h4>
                <p className="text-xs text-slate-600">
                  منشی مطب در ساعات کاری روز آتی با شماره همراه ثبت شده تماس خواهد گرفت.
                </p>
                <button
                  onClick={() => setFormSent(false)}
                  className="text-xs text-emerald-700 font-bold hover:underline"
                >
                  ارسال پیام جدید
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">نام و نام خانوادگی:</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="مثال: علی احمدی"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-blue-600 focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">شماره تماس همراه:</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="09121234567"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-hidden focus:border-blue-600 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">موضوع پیام:</label>
                  <select
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-blue-600 focus:bg-white transition-colors cursor-pointer"
                  >
                    <option value="پرسش عمومی از مطب">پرسش عمومی از مطب</option>
                    <option value="هماهنگی مدارک قبل از ویزیت">هماهنگی مدارک قبل از ویزیت</option>
                    <option value="استعلام بیمه تکمیلی">استعلام بیمه تکمیلی</option>
                    <option value="پیگیری جواب آزمایش">پیگیری جواب آزمایش</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">متن پیام:</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    placeholder="پیام یا شرح مختصری از درخواست خود را بنویسید..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-blue-600 focus:bg-white transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 ${theme.primaryButton}`}
                >
                  <Send className="w-4 h-4" />
                  <span>ارسال پیام به مطب</span>
                </button>
              </form>
            )}
          </div>

          {/* Social Channels & Online Guidance */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>شبکه‌های اطلاع‌رسانی رسمی</span>
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                کانال‌ها و صفحات رسمی جهت آگاهی از روزهای تعطیلی اضطراری، ویدیوهای آموزشی و آخرین دستاوردهای پزشکی:
              </p>

              <div className="space-y-2 pt-2">
                {socials?.instagram && (
                  <a
                    href={`https://instagram.com/${socials.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-900 border border-slate-200/70 transition-all text-xs"
                  >
                    <span className="flex items-center gap-2">
                      <Instagram className="w-4 h-4 text-rose-600" />
                      <span>اینستاگرام رسمی</span>
                    </span>
                    <span className="font-mono text-slate-400" dir="ltr">@{socials.instagram.replace('@', '')}</span>
                  </a>
                )}

                {socials?.telegram && (
                  <a
                    href={`https://t.me/${socials.telegram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-sky-900 border border-slate-200/70 transition-all text-xs"
                  >
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4 text-sky-600" />
                      <span>کانال تلگرام</span>
                    </span>
                    <span className="font-mono text-slate-400" dir="ltr">@{socials.telegram.replace('@', '')}</span>
                  </a>
                )}

                {socials?.linkedin && (
                  <a
                    href={socials.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-900 border border-slate-200/70 transition-all text-xs"
                  >
                    <span className="flex items-center gap-2">
                      <Linkedin className="w-4 h-4 text-blue-600" />
                      <span>پروفایل لینکدین تخصصی</span>
                    </span>
                    <span className="text-[11px] text-slate-400">مشاهده</span>
                  </a>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
