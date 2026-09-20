import React, { useState, useRef, useEffect } from 'react';
import { Languages, Check, ChevronDown } from 'lucide-react';
import { useI18n, type Language, SUPPORTED_LANGUAGES } from '../../i18n';

interface LanguageSelectorProps {
  className?: string;
  isMobile?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  className = '',
  isMobile = false,
}) => {
  const { language, setLanguage, currentLanguageMeta } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const handleSelect = (code: Language) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-900/50 transition-colors cursor-pointer select-none"
        title="Select Basin Language / भाषा चुनें"
        aria-label="Select Language"
        aria-expanded={isOpen}
      >
        <Languages className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        <span className="font-medium">{currentLanguageMeta.nativeName}</span>
        <ChevronDown
          className={`w-3 h-3 text-blue-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Language Selector Dropdown Popover */}
      {isOpen && (
        <div
          className={`absolute z-[100] mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-[#0E101B] border border-slate-200 dark:border-slate-800 shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-150 ${
            isMobile ? 'left-0' : 'right-0'
          }`}
        >
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 mb-1">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Official River Basin Languages
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              10 Indian Regional Languages
            </p>
          </div>

          <div className="max-h-[320px] overflow-y-auto space-y-1 p-0.5 custom-scrollbar">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = lang.code === language;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200/80 dark:border-blue-800/80'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">{lang.nativeName}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({lang.name})
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {lang.region}
                    </span>
                  </div>

                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
