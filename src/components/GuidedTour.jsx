import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Compass,
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Sparkles,
  Building2,
  FileText,
  Users,
  RotateCcw,
} from 'lucide-react';

const TOUR_STORAGE_KEY = 'dukandoc_tour_completed';

const TOUR_STEPS = [
  {
    step: 1,
    title: '1. Business Setup Intake',
    badge: 'Landing Page',
    icon: Building2,
    desc: 'Start by choosing or typing your business type and location on the landing page. DukanDoc maps your exact jurisdiction across Central, State, and Municipal rules.',
    path: '/',
    actionLabel: 'Go to Intake Wizard',
  },
  {
    step: 2,
    title: '2. Generate Instant Checklist',
    badge: 'AI Compliance Synthesis',
    icon: Sparkles,
    desc: 'DukanDoc synthesizes official registrations (FSSAI, GST, Udyam MSME, Gumasta, Municipal Health NOC) with portal links, government fees, and timelines.',
    path: '/',
    actionLabel: 'View Generation Flow',
  },
  {
    step: 3,
    title: '3. Track Progress & Deadlines',
    badge: 'Checklist Page',
    icon: CheckCircle2,
    desc: 'Update requirements from "To Do" to "In Progress" or "Completed". Set calendar reminders and watch your compliance score climb to 100%.',
    path: '/checklist',
    actionLabel: 'View Checklist Demo',
  },
  {
    step: 4,
    title: '4. Document Deep Dive & Videos',
    badge: 'Requirement Details',
    icon: FileText,
    desc: 'Click on any document card to see where to apply, official fees, required documents, YouTube video tutorials, and official filing guides.',
    path: '/requirement/req-1',
    actionLabel: 'View Document Page',
  },
  {
    step: 5,
    title: '5. Connect With Local Experts',
    badge: 'Inquiries & Support',
    icon: Users,
    desc: 'Need hands-on assistance? Click "Find Local Professionals" to view verified local Chartered Accountants, advocates, and agents near your shop.',
    path: '/requirement/req-1',
    actionLabel: 'View Expert Search',
  },
];

export default function GuidedTour() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(true); // Default true until checked

  useEffect(() => {
    try {
      const stored = localStorage.getItem(TOUR_STORAGE_KEY);
      if (!stored) {
        // First-time user: automatically show after a subtle delay
        const timer = setTimeout(() => {
          setIsOpen(true);
          setIsCompleted(false);
        }, 1200);
        return () => clearTimeout(timer);
      } else {
        setIsCompleted(true);
      }
    } catch {
      setIsCompleted(false);
    }
  }, []);

  const currentStep = TOUR_STEPS[currentStepIndex];
  const Icon = currentStep.icon;

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSkip = () => {
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    } catch (e) {
      console.error(e);
    }
    setIsOpen(false);
    setIsCompleted(true);
  };

  const handleComplete = () => {
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    } catch (e) {
      console.error(e);
    }
    setIsOpen(false);
    setIsCompleted(true);
  };

  const handleTryStep = (path) => {
    if (location.pathname !== path) {
      navigate(path);
    }
  };

  const handleRestartTour = () => {
    setCurrentStepIndex(0);
    setIsOpen(true);
  };

  return (
    <>
      {/* Floating Reopen Button (Available if closed/completed) */}
      {!isOpen && (
        <div className="fixed bottom-5 left-5 z-40 animate-fade-in">
          <button
            type="button"
            onClick={handleRestartTour}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold text-[#004043] border border-white/85 shadow-md hover:shadow-lg hover:scale-105 transition-all cursor-pointer group"
            style={{
              background: 'rgba(255, 255, 255, 0.75)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            }}
            title="Recommended Guide & Flow of Usage"
          >
            <Compass className="h-4 w-4 text-[#004043] group-hover:rotate-45 transition-transform duration-300" />
            <span className="hidden sm:inline">Recommended Flow</span>
          </button>
        </div>
      )}

      {/* Floating Guided Tour Card */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm w-[calc(100vw-40px)] sm:w-[380px] animate-scale-in">
          <div
            className="rounded-2xl p-5 border text-slate-800 shadow-2xl relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.88) 0%, rgba(255, 255, 255, 0.72) 100%)',
              backdropFilter: 'blur(28px) saturate(190%)',
              WebkitBackdropFilter: 'blur(28px) saturate(190%)',
              borderColor: 'rgba(255, 255, 255, 0.95)',
              boxShadow: '0 20px 48px -10px rgba(0, 40, 43, 0.18), 0 0 0 1px rgba(0, 64, 67, 0.08)',
            }}
          >
            {/* Top Accent Rim */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#D0FF71] via-[#004043] to-[#27EAA6]" />

            {/* Header: Badge & Skip/Close */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-wider bg-[#004043] text-[#D0FF71]">
                  Step {currentStep.step} of {TOUR_STEPS.length}
                </span>
                <span className="text-[11px] font-medium text-slate-500">
                  {currentStep.badge}
                </span>
              </div>
              <button
                type="button"
                onClick={handleSkip}
                className="text-slate-400 hover:text-[#004043] p-1 rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
                title="Skip recommendation flow"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Step Content */}
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#004043]/8 text-[#004043] flex items-center justify-center flex-shrink-0 mt-0.5 border border-[#004043]/10">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-sm sm:text-[15px] text-[#004043] leading-tight mb-1">
                  {currentStep.title}
                </h4>
                <p className="text-xs sm:text-[12.5px] text-[#4B6B6C] leading-relaxed font-normal">
                  {currentStep.desc}
                </p>
              </div>
            </div>

            {/* Quick Action to test this page */}
            <div className="mb-4 pt-2 border-t border-slate-100/80">
              <button
                type="button"
                onClick={() => handleTryStep(currentStep.path)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#004043] hover:underline cursor-pointer"
              >
                <span>{currentStep.actionLabel}</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Step Indicators & Navigation */}
            <div className="flex items-center justify-between pt-2">
              {/* Progress Dots */}
              <div className="flex items-center gap-1.5">
                {TOUR_STEPS.map((s, idx) => (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => setCurrentStepIndex(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      idx === currentStepIndex
                        ? 'w-5 bg-[#004043]'
                        : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                    }`}
                    title={`Go to step ${s.step}`}
                  />
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSkip}
                  className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 font-medium transition-colors cursor-pointer"
                >
                  Skip
                </button>
                {currentStepIndex > 0 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="p-1.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Previous step"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#004043] text-white hover:bg-[#0A2528] transition-all shadow-xs cursor-pointer"
                >
                  <span>{currentStepIndex === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
