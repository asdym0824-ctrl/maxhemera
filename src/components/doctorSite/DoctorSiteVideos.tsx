import React, { useState } from 'react';
import { 
  Play, 
  Video, 
  Image as ImageIcon, 
  Eye, 
  Clock, 
  Sparkles,
  Calendar,
  X
} from 'lucide-react';
import { Doctor } from '../../types';
import { ThemeStyles } from './themeConfig';

interface Props {
  doctor: Doctor;
  theme: ThemeStyles;
  onBookClick: (note?: string) => void;
}

export const DoctorSiteVideos: React.FC<Props> = ({ doctor, theme, onBookClick }) => {
  const [activeTab, setActiveTab] = useState<'videos' | 'gallery'>('videos');
  const [selectedVideo, setSelectedVideo] = useState<{ title: string; desc: string; duration: string } | null>(null);

  // Doctor Educational Videos
  const sampleVideos = [
    {
      id: 'vid-1',
      title: `راهنمای مراقبت و پیشگیری بیماری‌ها با ${doctor.name}`,
      duration: '۴:۲۰',
      views: '۱,۴۲۰ بازدید',
      thumbnail: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=600',
      description: 'نکات کلیدی و راهکارهای بالینی که هر بیمار قبل از شروع درمان باید از آن مطلع باشد.'
    },
    {
      id: 'vid-2',
      title: 'آشنایی با مراحل ویزیت و تجهیزات تشخیصی پیشرفته مطب',
      duration: '۳:۱۵',
      views: '۸۹۰ بازدید',
      thumbnail: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=600',
      description: 'معرفی دستگاه‌های استاندارد و روند معاینات بدون درد و دقیق در مطب.'
    },
    {
      id: 'vid-3',
      title: 'پاسخ به سوالات پرتکرار مراجعین در مورد روند بهبودی',
      duration: '۵:۴۰',
      views: '۲,۱۵۰ بازدید',
      thumbnail: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=600',
      description: 'توضیحات تکمیلی پیرامون مصرف صحیح داروها و مراقبت‌های دوره نقاهت.'
    }
  ];

  const galleryItems = doctor.gallery || [];

  return (
    <div className="py-16 md:py-20 bg-white border-b border-slate-200/80 text-right" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${theme.badgeBg}`}>
            <Video className="w-3.5 h-3.5" />
            <span>رسانه و چندرسانه‌ای مطب</span>
          </span>
          <h2 className={`text-2xl sm:text-3xl ${theme.sectionHeadingClass}`}>
            ویدیوهای آموزشی و گالری فضای بالینی
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            مشاهده ویدیوهای راهنمای بالینی، پاسخ به سوالات متداول بیماران و تصاویر محیط درمانی {doctor.name}
          </p>

          {/* Sub Tab Switcher */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setActiveTab('videos')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'videos'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>ویدیوهای آموزشی ({sampleVideos.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'gallery'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>گالری تصاویر ({galleryItems.length})</span>
            </button>
          </div>
        </div>

        {/* Video Grid */}
        {activeTab === 'videos' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sampleVideos.map(vid => (
              <div
                key={vid.id}
                className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="relative aspect-video overflow-hidden bg-slate-900 cursor-pointer" onClick={() => setSelectedVideo({ title: vid.title, desc: vid.description, duration: vid.duration })}>
                  <img
                    src={vid.thumbnail}
                    alt={vid.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/90 text-slate-900 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-lg">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-slate-950/80 text-white text-[11px] font-mono">
                    {vid.duration}
                  </span>
                </div>

                <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{vid.views}</span>
                      <span className="text-blue-600 font-bold">آموزش سلامت</span>
                    </div>
                    <h3 
                      onClick={() => setSelectedVideo({ title: vid.title, desc: vid.description, duration: vid.duration })}
                      className="font-bold text-sm text-slate-900 hover:text-blue-700 transition-colors cursor-pointer line-clamp-2"
                    >
                      {vid.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {vid.description}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedVideo({ title: vid.title, desc: vid.description, duration: vid.duration })}
                    className="w-full mt-3 py-2 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-800 text-xs font-bold transition-colors border border-slate-200/70 cursor-pointer"
                  >
                    تماشای ویدیو
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Gallery Grid */}
        {activeTab === 'gallery' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {galleryItems.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-md transition-all group space-y-3"
              >
                <div className="aspect-4/3 overflow-hidden bg-slate-100">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-4 pt-1 space-y-1">
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                    {item.category}
                  </span>
                  <h4 className="text-xs font-bold text-slate-800">{item.title}</h4>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Video Player Modal */}
        {selectedVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl relative">
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute top-6 left-6 p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                aria-label="بستن ویدیو"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="aspect-video bg-slate-900 rounded-2xl flex items-center justify-center relative overflow-hidden">
                <div className="text-center space-y-2 text-white p-6">
                  <div className="w-16 h-16 rounded-full bg-blue-600/40 border-2 border-blue-400 flex items-center justify-center mx-auto text-blue-200 animate-pulse">
                    <Play className="w-8 h-8 fill-current ml-1" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-200">{selectedVideo.title}</h4>
                  <p className="text-xs text-slate-400">در حال آماده‌سازی پخش فایل ویدیویی...</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-black text-slate-900 text-base">{selectedVideo.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{selectedVideo.desc}</p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setSelectedVideo(null);
                    onBookClick(`پس از مشاهده ویدیو: ${selectedVideo.title}`);
                  }}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold ${theme.primaryButton}`}
                >
                  رزرو نوبت مشاوره
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
