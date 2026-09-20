import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import IntakeWizard from '@/components/intake/IntakeWizard';
import { format } from 'date-fns';
import {
  MapPin, ArrowRight, Clock,
  HelpCircle, ShoppingBag, User, Handshake,
  Landmark, Zap, Gift,
  UtensilsCrossed, Globe, Briefcase, Home as HomeIcon, Wrench, Lightbulb, Building2, MoreHorizontal,
} from 'lucide-react';

// Custom rupee icon (inline SVG as component)
function RupeeIcon({ className, style }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <path d="M6 3h12M6 8h12M15 21l-9-13h4a4 4 0 000-8" />
    </svg>
  );
}

const PILLS = [
  { label: 'What do I need?',      Icon: HelpCircle, desc: 'Dukandoc identifies every single license and registration you need for your business in India, from GST to FSSAI.' },
  { label: 'Where do I get it?',   Icon: ShoppingBag, desc: 'We direct you straight to verified official government portals so you never have to deal with shady middlemen.' },
  { label: 'Can I do it myself?',  Icon: User, desc: 'Yes! Step-by-step guides empower you to apply on your own, saving thousands of rupees in consultant fees.' },
  { label: 'What will it cost?',   Icon: RupeeIcon, desc: 'Get clear upfront estimates of all official government application fees and stamp duties so you can plan your budget.' },
  { label: 'Who can help?',        Icon: Handshake, desc: 'If you ever hit a roadblock, connect directly with verified legal and tax professionals ready to assist on demand.' },
];

// Fallback sample cards matching user reference mockup
const SAMPLE_CHECKLISTS = [
  { id: 'cl_1789901194311_3k3ay', business_type: 'Online / e-commerce', location: 'dadar', created_date: '2026-09-20T10:00:00.000Z' },
  { id: 'cl_1789901194311_3k3ay', business_type: 'Food stall / restaurant', location: 'Andheri', created_date: '2026-09-18T10:00:00.000Z' },
  { id: 'cl_1789901194311_3k3ay', business_type: 'Retail shop', location: 'Mumbai', created_date: '2026-09-15T10:00:00.000Z' },
];

// Map business types to icons for saved checklist cards
function getBusinessIcon(businessType) {
  if (!businessType) return Building2;
  const t = businessType.toLowerCase();
  if (t.includes('food') || t.includes('restaurant') || t.includes('snack') || t.includes('cafe') || t.includes('catering')) return UtensilsCrossed;
  if (t.includes('retail') || t.includes('shop') || t.includes('store')) return ShoppingBag;
  if (t.includes('online') || t.includes('e-commerce') || t.includes('ecommerce') || t.includes('digital')) return Globe;
  if (t.includes('home') || t.includes('home-based')) return HomeIcon;
  if (t.includes('manufactur') || t.includes('workshop') || t.includes('factory')) return Wrench;
  if (t.includes('consult') || t.includes('freelanc') || t.includes('advisory')) return Lightbulb;
  if (t.includes('service')) return Briefcase;
  return Building2;
}

export default function Home() {
  const [checklists, setChecklists] = useState(null);
  const [activePill, setActivePill] = useState(null);

  useEffect(() => {
    base44.entities.Checklist.list('-created_date', 10)
      .then((data) => {
        if (data && data.length > 0) {
          setChecklists(data);
        } else {
          setChecklists(SAMPLE_CHECKLISTS);
        }
      })
      .catch(() => setChecklists(SAMPLE_CHECKLISTS));
  }, []);

  const displayChecklists = checklists && checklists.length > 0 ? checklists : SAMPLE_CHECKLISTS;

  return (
    <div style={{ backgroundColor: 'var(--canvas)' }}>

      {/* ── Hero Section with Mountain Illustration Background ─────────── */}
      <section
        className="relative w-full overflow-hidden -mt-20 pt-28 pb-32 sm:pb-36"
        style={{
          backgroundImage: "url('/hero-bg.png')",
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
        }}
      >
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center animate-fade-up">
            {/* Headline - Capital B in Business, colored Legally without bold */}
            <h1
              className="font-serif font-normal text-4xl sm:text-6xl md:text-[66px] mb-4 max-w-4xl mx-auto"
              style={{
                color: 'var(--ink)',
                letterSpacing: '-0.02em',
                lineHeight: '1.08',
              }}
            >
              Everything you need to start<br className="hidden sm:inline" /> your Business{' '}
              <span
                style={{
                  color: '#246B56',
                  fontWeight: 400,
                }}
              >
                Legally
              </span><br className="hidden sm:inline" /> in one place.
            </h1>

            {/* Subheading / Feature pills text box: Strictly locked aspect ratio and dimensions to eliminate distortion */}
            <div
              className="w-full max-w-[700px] mx-auto mb-3 min-h-[92px] sm:min-h-[76px] sm:h-[76px] sm:max-h-[76px] flex items-center justify-center text-center px-4"
              style={{
                aspectRatio: '700 / 76',
              }}
            >
              <p
                key={activePill || 'default'}
                className="w-full text-base sm:text-lg animate-fade-in select-none"
                style={{
                  color: 'var(--slate)',
                  lineHeight: '1.6',
                  opacity: activePill ? 1 : 0.88,
                  animationDuration: '0.18s',
                  animationTimingFunction: 'ease-out',
                }}
              >
                {activePill 
                  ? PILLS.find(p => p.label === activePill)?.desc 
                  : "We'll build your personalized checklist of licenses, permits and registrations with official portals, fees, timelines and who can help."}
              </p>
            </div>

            {/* Feature pills - Hover interaction with stable layout */}
            <div className="flex flex-col items-center mb-8">
              <div className="flex flex-wrap justify-center gap-2 relative z-10 animate-fade-up">
                {PILLS.map(({ label, Icon }) => {
                  const isActive = activePill === label;
                  return (
                    <button
                      key={label}
                      type="button"
                      onMouseEnter={() => setActivePill(label)}
                      onMouseLeave={() => setActivePill(null)}
                      onClick={() => setActivePill(label)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm transition-colors duration-150 shadow-sm cursor-pointer hover:bg-white hover:border-[rgba(0,64,67,0.25)]"
                      style={{
                        backgroundColor: isActive ? 'var(--ink)' : 'rgba(255, 255, 255, 0.72)',
                        border: '1px solid',
                        borderColor: isActive ? 'var(--ink)' : 'rgba(0,64,67,0.12)',
                        color: isActive ? '#FFFFFF' : 'var(--slate)',
                        backdropFilter: 'blur(8px)',
                        fontWeight: isActive ? 600 : 500,
                      }}
                    >
                      <Icon className="h-3.5 w-3.5" style={{ color: isActive ? '#FFFFFF' : 'var(--slate)' }} />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Checklist Wizard: directly below hero section pills with liquid glass ── */}
          <div className="max-w-[760px] mx-auto relative z-10">
            <IntakeWizard />
          </div>
        </div>

        {/* Bottom mist transition overlay to blend seamlessly into var(--canvas) */}
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none"
          style={{
            height: '140px',
            background: 'linear-gradient(180deg, rgba(247, 251, 249, 0) 0%, rgba(247, 251, 249, 0.45) 45%, rgba(247, 251, 249, 0.88) 80%, var(--canvas) 100%)',
          }}
        />
      </section>

      {/* ── 3 Trust Features ────────────────────────────────────── */}
      <section
        className="relative z-10 py-12 md:py-14"
        style={{
          backgroundColor: 'transparent',
        }}
      >
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                Icon: Landmark,
                title: 'Official sources only',
                desc: 'Every requirement is sourced from government portals — FSSAI, GST, Udyam, municipal wards.',
              },
              {
                Icon: Zap,
                title: 'Under a minute',
                desc: 'AI researches live government databases and builds your personalized checklist in seconds.',
              },
              {
                Icon: Gift,
                title: 'Completely free',
                desc: 'No subscription, no paywall. DukanDoc exists to democratize access to legal information.',
              },
            ].map((item, i) => (
              <div
                key={item.title}
                className="animate-fade-up flex gap-4 items-start"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: 'rgba(0,64,67,0.06)' }}
                >
                  <item.Icon className="h-4.5 w-4.5" style={{ color: 'var(--ink)' }} />
                </div>
                <div>
                  <h3
                    className="font-semibold mb-1"
                    style={{ color: 'var(--ink)', fontSize: '15px' }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--slate)', lineHeight: '1.6' }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NO MORE PILLS ("Start your business without the guesswork") ── */}
      <section className="relative overflow-hidden py-14 md:py-20" style={{ backgroundColor: 'var(--canvas)' }}>
        {/* Ambient faint mountain silhouette on the right edge matching mockup */}
        <div 
          className="absolute right-0 bottom-0 top-0 w-1/3 pointer-events-none opacity-20 hidden md:block"
          style={{
            backgroundImage: "url('/hero-bg.png')",
            backgroundPosition: 'right bottom',
            backgroundSize: 'cover',
            maskImage: 'linear-gradient(to left, black, transparent)',
            WebkitMaskImage: 'linear-gradient(to left, black, transparent)',
          }}
        />

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          {/* Made in India liquid glass pill matching IntakeWizard opacity */}
          <div className="mb-4">
            <span
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide border border-white/85 shadow-sm"
              style={{
                background: 'rgba(255, 255, 255, 0.55)',
                color: 'var(--slate)',
                backdropFilter: 'blur(28px) saturate(180%)',
                WebkitBackdropFilter: 'blur(28px) saturate(180%)',
                boxShadow: '0 4px 14px rgba(0, 40, 43, 0.05), inset 0 1px 1.5px rgba(255, 255, 255, 0.95)',
              }}
            >
              <span>Made in India</span>
              <img
                src="/ind.svg"
                alt="Flag of India"
                className="w-4.5 h-3 object-cover rounded-[2px] shadow-2xs inline-block"
              />
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-center mt-3">
            {/* Left Column */}
            <div>
              <h2
                className="font-serif text-3xl sm:text-4xl md:text-[42px] mb-4"
                style={{ color: 'var(--ink)', lineHeight: '1.14', fontWeight: 400 }}
              >
                Start your business<br />without the guesswork.
              </h2>
              <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--slate)', maxWidth: '440px' }}>
                No more endless Google searches, confusing PDFs or unreliable advice. Get a clear, personalized checklist based on official government sources — in seconds.
              </p>
            </div>

            {/* Right Column */}
            <div className="md:border-l md:pl-10 space-y-3.5" style={{ borderColor: 'rgba(0,64,67,0.14)' }}>
              {[
                'No more endless Googling',
                'No more confusing PDFs',
                'No more missing important licenses',
                'No more unreliable advice',
                'No more wasted time and money',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3.5 group">
                  <div
                    className="h-5 w-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-smooth group-hover:border-[var(--ink)]"
                    style={{ borderColor: 'rgba(0,64,67,0.35)', color: 'var(--slate)' }}
                  >
                    <span className="text-[10px] font-bold leading-none">✕</span>
                  </div>
                  <span className="text-sm sm:text-[14.5px] font-medium" style={{ color: 'var(--ink)' }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Saved Checklists ───────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pt-4 pb-20">
        <div className="mb-6 flex items-center justify-between">
          <h2
            className="font-heading font-semibold text-xl"
            style={{ color: 'var(--ink)', letterSpacing: '-0.02em' }}
          >
            Saved checklists
          </h2>
          <Link
            to="/inquiries"
            className="text-sm font-medium flex items-center gap-1 hover:underline transition-smooth"
            style={{ color: 'var(--ink)' }}
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayChecklists.map((c, i) => {
            const BizIcon = getBusinessIcon(c.business_type);
            const targetUrl = `/checklist/${c.id || 'sample-1'}`;

            return (
              <Link
                key={c.id || i}
                to={targetUrl}
                className="block group animate-fade-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div
                  className="bg-white/90 backdrop-blur-sm border border-[rgba(0,64,67,0.08)] rounded-2xl p-5 h-full shadow-sm hover:border-[rgba(0,64,67,0.22)] hover:shadow-md transition-all"
                  style={{ textDecoration: 'none' }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'rgba(0,64,67,0.05)' }}
                    >
                      <BizIcon className="h-4.5 w-4.5" style={{ color: 'var(--ink)' }} />
                    </div>
                    <button
                      type="button"
                      className="text-slate/60 hover:text-ink transition-smooth p-1"
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                      title="More options"
                    >
                      <MoreHorizontal className="h-4 w-4" style={{ color: 'var(--slate)' }} />
                    </button>
                  </div>

                  <p
                    className="font-semibold text-base mb-2"
                    style={{ color: 'var(--ink)', letterSpacing: '-0.01em' }}
                  >
                    {c.business_type}
                  </p>

                  <div
                    className="flex items-center gap-1.5 text-sm mb-3"
                    style={{ color: 'var(--slate)' }}
                  >
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                    {c.location}
                  </div>

                  {c.created_date && (
                    <div
                      className="flex items-center gap-1.5 text-xs"
                      style={{ color: 'var(--slate)', opacity: 0.7 }}
                    >
                      <Clock className="h-3 w-3" />
                      {format(new Date(c.created_date), 'd MMM yyyy')}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
