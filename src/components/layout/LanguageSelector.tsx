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
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface)] text-[var(--text)] text-xs font-medium border border-[var(--border)] transition-colors cursor-pointer select-none"
        title="Select basin language"
        aria-label="Select basin language"
        aria-expanded={isOpen}
      >
        <Languages className="w-3.5 h-3.5 text-[var(--live)]" />
        <span className="font-medium text-xs">{currentLanguageMeta.nativeName}</span>
        <ChevronDown
          className={`w-3 h-3 text-[var(--text-muted)] transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Language Selector Dropdown Popover */}
      {isOpen && (
        <div
          className={`absolute z-[100] mt-2 w-72 sm:w-80 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-xl p-2 animate-in fade-in slide-in-from-top-2 duration-150 ${
            isMobile ? 'left-0' : 'right-0'
          }`}
        >
          <div className="px-3 py-2 border-b border-[var(--border)] mb-1">
            <p className="text-xs font-medium text-[var(--text-muted)]">
              Official river basin languages
            </p>
            <p className="text-[11px] text-[var(--text-muted)]">
              10 Indian regional languages
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
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--primary)] text-white font-medium shadow-xs'
                      : 'hover:bg-[var(--surface-2)] text-[var(--text)]'
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">{lang.nativeName}</span>
                      <span className={`text-[11px] font-normal ${isSelected ? 'text-white/80' : 'text-[var(--text-muted)]'}`}>
                        ({lang.name})
                      </span>
                    </div>
                    <span className={`text-[11px] ${isSelected ? 'text-white/75' : 'text-[var(--text-muted)]'}`}>
                      {lang.region}
                    </span>
                  </div>

                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center shrink-0">
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
