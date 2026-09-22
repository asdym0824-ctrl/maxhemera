import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, X, Search } from 'lucide-react';

export interface MultiSelectOption {
  value: string;
  label: string;
  badge?: string;
  group?: string;
}

interface MultiSelectDropdownProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  options: MultiSelectOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  unitLabel?: string; // e.g. "استان" or "تخصص" or "مورد"
  variant?: 'dark' | 'light';
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  id,
  label,
  icon,
  options,
  selectedValues,
  onChange,
  placeholder = 'انتخاب گزینه‌ها (امکان انتخاب چندتایی)',
  searchPlaceholder = 'جستجو در گزینه‌ها...',
  emptyLabel = 'موردی یافت نشد',
  unitLabel = 'مورد',
  variant = 'dark'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const isLight = variant === 'light';

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleOption = (val: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter(v => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  const removeSingle = (val: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedValues.filter(v => v !== val));
  };

  const handleClearAll = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onChange([]);
  };

  const filteredOptions = useMemo(() => {
    if (!searchFilter.trim()) return options;
    const q = searchFilter.toLowerCase().trim();
    return options.filter(
      opt => opt.label.toLowerCase().includes(q) || (opt.group && opt.group.toLowerCase().includes(q))
    );
  }, [options, searchFilter]);

  const handleSelectAllFiltered = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newValues = Array.from(new Set([...selectedValues, ...filteredOptions.map(o => o.value)]));
    onChange(newValues);
  };

  // Grouped options if groups exist
  const groups = useMemo(() => {
    const hasGroups = options.some(o => !!o.group);
    if (!hasGroups) return null;

    const grouped: Record<string, MultiSelectOption[]> = {};
    filteredOptions.forEach(opt => {
      const g = opt.group || 'سایر';
      if (!grouped[g]) grouped[g] = [];
      grouped[g].push(opt);
    });
    return grouped;
  }, [options, filteredOptions]);

  // Selected labels for chip display
  const selectedOptions = useMemo(() => {
    return options.filter(o => selectedValues.includes(o.value));
  }, [options, selectedValues]);

  return (
    <div id={id} ref={containerRef} className="space-y-1.5 relative select-none">
      <div className="flex items-center justify-between">
        <label 
          className={`text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
            isLight ? 'text-slate-700' : 'text-slate-300'
          }`} 
          onClick={() => setIsOpen(!isOpen)}
        >
          {icon}
          <span>{label}</span>
        </label>
        {selectedValues.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md border ${
              isLight 
                ? 'bg-blue-50 text-blue-700 border-blue-200' 
                : 'bg-blue-500/20 text-blue-300 border-blue-400/30'
            }`}>
              {selectedValues.length} {unitLabel} انتخاب شده
            </span>
            <button
              type="button"
              onClick={handleClearAll}
              className={`text-[10px] cursor-pointer transition-colors ${
                isLight ? 'text-slate-400 hover:text-rose-600' : 'text-slate-400 hover:text-rose-400'
              }`}
              title="پاک‌سازی این فیلتر"
            >
              پاک‌سازی
            </button>
          </div>
        )}
      </div>

      {/* Main Trigger Box */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full border rounded-xl p-2 text-xs outline-hidden cursor-pointer transition-all flex items-center justify-between gap-1.5 min-h-[42px] ${
          isLight
            ? isOpen
              ? 'bg-white border-blue-600 ring-2 ring-blue-600/20 shadow-xs text-slate-900'
              : 'bg-slate-50 border-slate-200/80 hover:border-slate-300 text-slate-800'
            : isOpen
              ? 'bg-slate-950/80 border-blue-500 ring-2 ring-blue-500/20 shadow-md text-slate-200'
              : 'bg-slate-950/80 border-slate-700 hover:border-slate-600 text-slate-200'
        }`}
      >
        <div className="flex-1 min-w-0 flex flex-wrap items-center gap-1 overflow-hidden">
          {selectedValues.length === 0 ? (
            <span className="text-slate-400 text-xs px-1">{placeholder}</span>
          ) : (
            <>
              {selectedOptions.slice(0, 2).map(opt => (
                <span
                  key={opt.value}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium border animate-in fade-in ${
                    isLight
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : 'bg-blue-600/30 text-blue-200 border-blue-500/40'
                  }`}
                >
                  <span className="truncate max-w-[110px]">{opt.label}</span>
                  <span
                    onClick={e => removeSingle(opt.value, e)}
                    className={`rounded-full p-0.5 cursor-pointer ${
                      isLight 
                        ? 'hover:text-blue-900 hover:bg-blue-200/60' 
                        : 'hover:text-white hover:bg-blue-500/50'
                    }`}
                  >
                    <X className="w-2.5 h-2.5" />
                  </span>
                </span>
              ))}
              {selectedOptions.length > 2 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md border font-bold ${
                  isLight
                    ? 'bg-slate-100 text-slate-700 border-slate-200'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  +{selectedOptions.length - 2} مورد دیگر
                </span>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 text-slate-400 mr-1">
          {selectedValues.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className={`p-1 cursor-pointer ${isLight ? 'hover:text-slate-700' : 'hover:text-slate-200'}`}
              title="حذف همه"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-500' : ''}`}
          />
        </div>
      </div>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className={`absolute top-full mt-1.5 left-0 right-0 z-50 rounded-2xl shadow-2xl p-2.5 space-y-2 text-right animate-in fade-in-50 zoom-in-95 ${
          isLight
            ? 'bg-white border border-slate-200 text-slate-800'
            : 'bg-slate-900 border border-slate-700/90 text-slate-200 backdrop-blur-xl'
        }`}>
          {/* Search bar inside popover */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              placeholder={searchPlaceholder}
              autoFocus
              className={`w-full rounded-xl pr-8 pl-6 py-1.5 text-xs outline-hidden ${
                isLight
                  ? 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white'
                  : 'bg-slate-950/90 border border-slate-700 text-slate-200 placeholder-slate-500 focus:border-blue-500'
              }`}
            />
            {searchFilter && (
              <button
                type="button"
                onClick={() => setSearchFilter('')}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Quick Actions Bar */}
          <div className={`flex items-center justify-between px-1 text-[11px] pb-1.5 border-b ${
            isLight ? 'text-slate-500 border-slate-100' : 'text-slate-400 border-slate-800'
          }`}>
            <span className="font-medium">
              {filteredOptions.length} مورد قابل انتخاب
            </span>
            <div className="flex items-center gap-2 font-bold">
              <button
                type="button"
                onClick={handleSelectAllFiltered}
                className="text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
              >
                انتخاب همه
              </button>
              {selectedValues.length > 0 && (
                <>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                  >
                    حذف همه ({selectedValues.length})
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className={`max-h-56 overflow-y-auto space-y-1 pr-0.5 divide-y ${
            isLight ? 'divide-slate-100' : 'divide-slate-800/40'
          }`}>
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">{emptyLabel}</div>
            ) : groups ? (
              Object.entries(groups).map(([groupName, groupOpts]) => (
                <div key={groupName} className="pt-1.5 first:pt-0">
                  <div className={`text-[10px] font-extrabold px-2 py-1 sticky top-0 ${
                    isLight ? 'text-blue-700 bg-slate-50/95' : 'text-blue-400/90 bg-slate-900/95'
                  }`}>
                    {groupName}
                  </div>
                  <div className="space-y-0.5">
                    {groupOpts.map(opt => {
                      const isSelected = selectedValues.includes(opt.value);
                      return (
                        <div
                          key={opt.value}
                          onClick={e => toggleOption(opt.value, e)}
                          className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-all ${
                            isLight
                              ? isSelected
                                ? 'bg-blue-50 text-blue-900 border border-blue-200 font-bold'
                                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                              : isSelected
                                ? 'bg-blue-600/25 text-white border border-blue-500/30 font-bold'
                                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                                isSelected
                                  ? 'bg-blue-600 border-blue-600 text-white'
                                  : isLight
                                    ? 'border-slate-300 bg-white'
                                    : 'border-slate-600 bg-slate-950/60'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="truncate">{opt.label}</span>
                          </div>
                          {opt.badge && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-md shrink-0 mr-1.5 ${
                              isLight ? 'text-slate-500 bg-slate-100' : 'text-slate-400 bg-slate-800'
                            }`}>
                              {opt.badge}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              filteredOptions.map(opt => {
                const isSelected = selectedValues.includes(opt.value);
                return (
                  <div
                    key={opt.value}
                    onClick={e => toggleOption(opt.value, e)}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-all ${
                      isLight
                        ? isSelected
                          ? 'bg-blue-50 text-blue-900 border border-blue-200 font-bold'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                        : isSelected
                          ? 'bg-blue-600/25 text-white border border-blue-500/30 font-bold'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : isLight
                              ? 'border-slate-300 bg-white'
                              : 'border-slate-600 bg-slate-950/60'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="truncate">{opt.label}</span>
                    </div>
                    {opt.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md shrink-0 mr-1.5 ${
                        isLight ? 'text-slate-500 bg-slate-100' : 'text-slate-400 bg-slate-800'
                      }`}>
                        {opt.badge}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer note */}
          <div className={`pt-1 border-t flex items-center justify-between text-[10px] ${
            isLight ? 'border-slate-100 text-slate-500' : 'border-slate-800 text-slate-400'
          }`}>
            <span>امکان انتخاب همزمان چند گزینه فعال است</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-blue-600 hover:text-blue-700 font-bold cursor-pointer"
            >
              تأیید و بستن
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
