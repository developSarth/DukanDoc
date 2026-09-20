import React, { useState, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
];

export default function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState('en');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load saved language
    const saved = localStorage.getItem('dukandoc_lang') || 'en';
    setCurrentLang(saved);

    // Inject Google Translate script dynamically if not already present
    if (!window.googleTranslateElementInit) {
      window.googleTranslateElementInit = function () {
        try {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: 'en',
              includedLanguages: 'en,hi,mr',
              autoDisplay: false,
            },
            'google_translate_element'
          );
        } catch (e) {
          console.error('[LanguageSwitcher] Google Translate init error:', e);
        }
      };

      const script = document.createElement('script');
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const changeLanguage = (code) => {
    setCurrentLang(code);
    localStorage.setItem('dukandoc_lang', code);
    setIsOpen(false);

    // Apply translation via Google Translate Select Element if present
    try {
      const selectElem = document.querySelector('.goog-te-combo');
      if (selectElem) {
        selectElem.value = code;
        selectElem.dispatchEvent(new Event('change'));
      } else {
        // Fallback: set google translate cookie and reload
        document.cookie = `googtrans=/en/${code}; path=/;`;
        window.location.reload();
      }
    } catch {
      document.cookie = `googtrans=/en/${code}; path=/;`;
      window.location.reload();
    }
  };

  const activeLang = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  return (
    <div className="relative">
      {/* Hidden container for Google Translate element */}
      <div id="google_translate_element" className="hidden" />

      {/* Custom Liquid Glass Language Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="nav-glass-btn text-xs px-2.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all cursor-pointer hover:border-[#004043]/40"
        title="Change language / भाषा बदला"
      >
        <Globe className="h-3.5 w-3.5 text-[#004043]" />
        <span className="font-semibold text-[#004043]">{activeLang.native}</span>
        <ChevronDown className="h-3 w-3 text-slate-500 opacity-70" />
      </button>

      {/* Language Selection Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop click dismiss */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div
            className="absolute right-0 top-full mt-2 z-50 w-40 p-1.5 rounded-2xl border shadow-xl animate-scale-in"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderColor: 'rgba(0, 64, 67, 0.12)',
              boxShadow: '0 16px 36px -8px rgba(0, 40, 43, 0.15)',
            }}
          >
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Select Language / भाषा
            </div>

            {LANGUAGES.map((lang) => {
              const isSelected = currentLang === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#004043] text-white'
                      : 'text-[#0A2528] hover:bg-[#004043]/8'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={isSelected ? 'font-semibold' : ''}>{lang.native}</span>
                    <span className={`text-[11px] ${isSelected ? 'text-white/70' : 'text-slate-400'}`}>
                      ({lang.label})
                    </span>
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 text-[#D0FF71]" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
