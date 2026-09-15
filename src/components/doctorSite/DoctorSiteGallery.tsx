import React, { useState } from 'react';
import { 
  Camera, 
  X, 
  Maximize2,
  Building2
} from 'lucide-react';
import { Doctor, DoctorGalleryItem } from '../../types';
import { ThemeStyles } from './themeConfig';

interface Props {
  doctor: Doctor;
  theme: ThemeStyles;
}

export const DoctorSiteGallery: React.FC<Props> = ({ doctor, theme }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<DoctorGalleryItem | null>(null);

  const config = doctor.websiteConfig;
  if (config?.sectionVisibility?.gallery === false) return null;

  const galleryItems = doctor.gallery || config?.gallery || [];
  if (galleryItems.length === 0) return null;

  return (
    <section id="gallery" className="py-16 md:py-20 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${theme.badgeBg}`}>
            <Camera className="w-3.5 h-3.5" />
            <span>تصاویر و محیط بالینی</span>
          </span>
          <h2 className={`text-2xl sm:text-3xl ${theme.sectionHeadingClass}`}>
            محیط مطب و امکانات تشخیصی
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            آشنایی با فضای آرام کلینیک، سالن انتظار مراجعین و استانداردهای تجهیزات پیشرفته پزشکی
          </p>
        </div>

        {/* Photos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map((item, idx) => (
            <div
              key={item.id || idx}
              onClick={() => setSelectedPhoto(item)}
              className="group cursor-pointer rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 relative shadow-2xs hover:shadow-lg transition-all"
            >
              <div className="relative h-64 w-full overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                
                <div className="absolute top-3 left-3 p-2 rounded-full bg-black/40 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-4 h-4" />
                </div>

                <div className="absolute bottom-4 right-4 left-4 text-white text-right">
                  {item.category && (
                    <div className="text-[11px] font-semibold text-blue-300 mb-0.5">
                      {item.category}
                    </div>
                  )}
                  <h3 className="text-sm font-bold leading-tight">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-slate-300 mt-1 line-clamp-1">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Photo Lightbox Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-800 p-4 sm:p-6 space-y-4 relative text-right">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-6 left-6 z-10 p-2.5 rounded-full bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="rounded-2xl overflow-hidden max-h-[70vh] flex items-center justify-center bg-black/50">
              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.title}
                className="max-h-[68vh] w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="pt-2 text-white space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
                <Building2 className="w-3.5 h-3.5" />
                <span>{selectedPhoto.category || 'فضای درمانی'}</span>
              </div>
              <h3 className="text-lg font-bold">{selectedPhoto.title}</h3>
              {selectedPhoto.description && (
                <p className="text-xs text-slate-400">{selectedPhoto.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
