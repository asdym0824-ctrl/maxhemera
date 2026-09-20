import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Check, X, Move, RefreshCw } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string | null;
  onCropComplete: (croppedBase64: string) => void;
  title?: string;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
  title = 'تنظیم و برش تصویر پروفایل'
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset parameters whenever a new image is loaded
  useEffect(() => {
    if (isOpen && imageSrc) {
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      setImageLoaded(false);
    }
  }, [isOpen, imageSrc]);

  // Mouse & Touch Dragging Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.min(Math.max(0.5, prev + delta), 3.5));
  };

  // Generate cropped output canvas
  const handleConfirm = useCallback(() => {
    if (!imgRef.current) return;

    const img = imgRef.current;
    const canvas = document.createElement('canvas');
    const size = 320; // High quality avatar size
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Smooth rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Clear background
    ctx.clearRect(0, 0, size, size);

    // Translate to center
    ctx.translate(size / 2, size / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    // Compute scale and draw offsets based on container dimensions
    const container = containerRef.current;
    const containerSize = container ? container.clientWidth : 260;
    const scaleRatio = size / containerSize;

    const renderWidth = img.naturalWidth * (containerSize / Math.max(img.naturalWidth, img.naturalHeight)) * zoom * scaleRatio;
    const renderHeight = img.naturalHeight * (containerSize / Math.max(img.naturalWidth, img.naturalHeight)) * zoom * scaleRatio;

    ctx.drawImage(
      img,
      position.x * scaleRatio - renderWidth / 2,
      position.y * scaleRatio - renderHeight / 2,
      renderWidth,
      renderHeight
    );

    const croppedBase64 = canvas.toDataURL('image/jpeg', 0.92);
    onCropComplete(croppedBase64);
    onClose();
  }, [position, zoom, rotation, onCropComplete, onClose]);

  if (!isOpen || !imageSrc) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4 font-sans text-slate-800" dir="rtl">
        {/* Notice & Instructions */}
        <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/80">
          <span className="flex items-center gap-1.5 font-medium">
            <Move className="w-3.5 h-3.5 text-blue-600" />
            تصویر را بکشید (بالا، پایین یا اطراف) و با اسلایدر اندازه آن را تنظیم کنید.
          </span>
          <button
            type="button"
            onClick={() => {
              setZoom(1);
              setRotation(0);
              setPosition({ x: 0, y: 0 });
            }}
            className="text-blue-600 hover:text-blue-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
            title="بازنشانی به حالت اول"
          >
            <RefreshCw className="w-3 h-3" />
            <span>تنظیم مجدد</span>
          </button>
        </div>

        {/* Interactive Viewport Canvas Area */}
        <div className="flex justify-center items-center py-2">
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
            className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl bg-slate-900 overflow-hidden cursor-grab active:cursor-grabbing select-none border-4 border-slate-800 shadow-inner flex items-center justify-center touch-none"
          >
            {/* The Image being transformed */}
            <img
              ref={imgRef}
              src={imageSrc}
              alt="تنظیم عکس"
              onLoad={() => setImageLoaded(true)}
              draggable={false}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                transition: isDragging ? 'none' : 'transform 0.08s ease-out',
                maxHeight: '100%',
                maxWidth: '100%',
                objectFit: 'contain'
              }}
              className="pointer-events-none select-none drop-shadow-md"
            />

            {/* Dark Mask with Circular Transparent Cutout for Avatar Framing */}
            <div className="absolute inset-0 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <mask id="avatar-hole-mask">
                    {/* Fill white everywhere */}
                    <rect x="0" y="0" width="100" height="100" fill="white" />
                    {/* Cutout circular hole in center */}
                    <circle cx="50" cy="50" r="42" fill="black" />
                  </mask>
                </defs>
                {/* Semi-transparent dark overlay through mask */}
                <rect
                  x="0"
                  y="0"
                  width="100"
                  height="100"
                  fill="rgba(15, 23, 42, 0.75)"
                  mask="url(#avatar-hole-mask)"
                />
                {/* Circular ring indicator */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="0.8"
                  strokeDasharray="2 1.5"
                />
              </svg>
            </div>

            {/* Guide Badge */}
            <div className="absolute top-2 right-2 bg-slate-900/80 text-white/90 text-[10px] px-2 py-0.5 rounded-full backdrop-blur-xs font-mono pointer-events-none">
              {Math.round(zoom * 100)}%
            </div>
          </div>
        </div>

        {/* Adjustment Controls Bar */}
        <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
          {/* Zoom Slider & Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setZoom(prev => Math.max(0.5, prev - 0.15))}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer shadow-2xs"
              title="کوچک‌نمایی"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <div className="flex-1 flex items-center gap-2">
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
              />
            </div>

            <button
              type="button"
              onClick={() => setZoom(prev => Math.min(3, prev + 0.15))}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer shadow-2xs"
              title="بزرگ‌نمایی"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            {/* Rotate Button */}
            <button
              type="button"
              onClick={() => setRotation(prev => (prev + 90) % 360)}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer shadow-2xs flex items-center gap-1 text-xs font-medium mr-1"
              title="چرخش ۹۰ درجه تصویر"
            >
              <RotateCw className="w-4 h-4" />
              <span className="hidden sm:inline">چرخش</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-xl"
          >
            انصراف
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleConfirm}
            icon={<Check className="w-4 h-4" />}
            className="rounded-xl shadow-md shadow-blue-500/20"
          >
            تایید و ذخیره تصویر
          </Button>
        </div>
      </div>
    </Modal>
  );
};
