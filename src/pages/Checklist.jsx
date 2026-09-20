import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import StatusSelect from '@/components/StatusSelect';
import NewCalendar from '@/components/ui/new-calendar';
import { format } from 'date-fns';
import {
  MapPin,
  Building2,
  ChevronRight,
  Printer,
  Sparkles,
  Loader2,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  FileText,
  Briefcase,
  Landmark,
  Layers,
  ShieldCheck,
} from 'lucide-react';

function getCategoryIcon(category) {
  if (!category) return FileText;
  const c = category.toLowerCase();
  if (c.includes('tax') || c.includes('gst') || c.includes('finance')) return Landmark;
  if (c.includes('license') || c.includes('fssai') || c.includes('permit')) return ShieldCheck;
  if (c.includes('registration') || c.includes('udyam') || c.includes('incorporation')) return Layers;
  if (c.includes('municipal') || c.includes('shop') || c.includes('local')) return Building2;
  return Briefcase;
}

const FALLBACK_CHECKLIST = {
  id: 'cl_1789901194311_3k3ay',
  business_type: 'Food stall / restaurant',
  business_structure: 'Sole Proprietorship',
  location: 'Mumbai',
  profile_summary:
    'Your proposed business (Food stall / restaurant in Mumbai) operates under Maharashtra municipal regulations and national trade standards. The primary licenses include Shop Act (Gumasta), Udyam MSME, and FSSAI food safety clearance. Most can be initiated online directly.',
};

const FALLBACK_ITEMS = [
  {
    id: 'req-1',
    name: 'Shop & Establishment (Gumasta License / Intimation)',
    category: 'Municipal',
    is_mandatory: true,
    can_apply_self: true,
    status: 'todo',
    description:
      'Mandatory registration under the Maharashtra Shops and Establishments (Regulation of Employment and Conditions of Service) Act.',
    why_required:
      'Mandatory registration under the Maharashtra Shops and Establishments (Regulation of Employment and Conditions of Service) Act.',
    official_fees: '₹0 (0–9 employees) to ₹2,360 (10+ employees)',
    portal_url: 'https://lms.mahaonline.gov.in',
    process_and_timeline: '1–3 days',
  },
  {
    id: 'req-2',
    name: 'FSSAI Food Safety Registration / State License',
    category: 'License',
    is_mandatory: true,
    can_apply_self: true,
    status: 'todo',
    description:
      'Mandatory for all food stalls, hawkers, restaurants, and cloud kitchens operating in Mumbai. Operating without FSSAI attracts severe penalties.',
    why_required:
      'Mandatory for all food stalls, hawkers, restaurants, and cloud kitchens operating in Mumbai. Operating without FSSAI attracts severe penalties.',
    official_fees: '₹100 / year (Basic) to ₹2,000 / year (State)',
    portal_url: 'https://foscos.fssai.gov.in',
    process_and_timeline: '7–14 days',
  },
  {
    id: 'req-3',
    name: 'Udyam MSME Registration',
    category: 'Registration',
    is_mandatory: false,
    can_apply_self: true,
    status: 'todo',
    description:
      'Gives eligibility for collateral-free bank loans, government subsidies, PM SVANidhi street vendor loans, and lower interest rates.',
    why_required:
      'Gives eligibility for collateral-free bank loans, government subsidies, PM SVANidhi street vendor loans, and lower interest rates.',
    official_fees: 'Free of Cost (Govt official portal)',
    portal_url: 'https://udyamregistration.gov.in',
    process_and_timeline: 'Instant (1 day)',
  },
  {
    id: 'req-4',
    name: 'Goods & Services Tax (GST) Registration',
    category: 'Tax',
    is_mandatory: false,
    can_apply_self: true,
    status: 'todo',
    description:
      'Mandatory if turnover exceeds ₹20 Lakhs (services) / ₹40 Lakhs (goods), or for listing on online delivery platforms like Zomato/Swiggy.',
    why_required:
      'Mandatory if turnover exceeds ₹20 Lakhs (services) / ₹40 Lakhs (goods), or for listing on online delivery platforms like Zomato/Swiggy.',
    official_fees: '₹0 (Government application is free)',
    portal_url: 'https://www.gst.gov.in',
    process_and_timeline: '3–7 working days',
  },
  {
    id: 'req-5',
    name: 'Professional Tax (P-Tax) Enrolment & Registration (PTRC/PTEC)',
    category: 'Municipal',
    is_mandatory: true,
    can_apply_self: true,
    status: 'todo',
    description:
      'Mandatory registration for business entities in Maharashtra under the Maharashtra State Tax on Professions Act.',
    why_required:
      'Mandatory registration for business entities in Maharashtra under the Maharashtra State Tax on Professions Act.',
    official_fees: '₹2,500 / year (PTEC)',
    portal_url: 'https://mahagst.gov.in',
    process_and_timeline: '2–5 days',
  },
  {
    id: 'req-6',
    name: 'BMC Health Trade License / Eating House NOC',
    category: 'License',
    is_mandatory: true,
    can_apply_self: false,
    status: 'todo',
    description:
      'Municipal Corporation of Greater Mumbai (MCGM) health trade license required for preparing and serving food commercially.',
    why_required:
      'Municipal Corporation of Greater Mumbai (MCGM) health trade license required for preparing and serving food commercially.',
    official_fees: 'Varies by ward & square footage (₹3,000–₹12,000)',
    portal_url: 'https://portal.mcgm.gov.in',
    process_and_timeline: '15–30 days',
  },
];

// Motion Graphics: Smooth Rolling Ticker Counter
function useRollingTicker(target, duration = 850) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTimestamp = null;
    let frameId = null;
    const startVal = count;

    function step(timestamp) {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (target - startVal) * ease);
      setCount(current);

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    }

    frameId = requestAnimationFrame(step);
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [target, duration]);

  return count;
}

export default function Checklist() {
  const { id } = useParams();
  const [checklist, setChecklist] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [calendarOpenId, setCalendarOpenId] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const targetId = id || 'cl_1789901194311_3k3ay';
      try {
        const [cl, clItems] = await Promise.all([
          base44.entities.Checklist.get(targetId),
          base44.entities.ChecklistItem.filter({ checklist_id: targetId }, 'order_index', 100),
        ]);
        if (cl) {
          setChecklist(cl);
          setItems(clItems && clItems.length > 0 ? clItems : FALLBACK_ITEMS);
        } else {
          setChecklist(FALLBACK_CHECKLIST);
          setItems(FALLBACK_ITEMS);
        }
      } catch (err) {
        setChecklist(FALLBACK_CHECKLIST);
        setItems(FALLBACK_ITEMS);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const total = items.length;
  const doneCount = items.filter((it) => it.status === 'done').length;
  const inProgressCount = items.filter((it) => it.status === 'in_progress').length;
  const targetPercent = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const rollingPercent = useRollingTicker(targetPercent);

  async function handleStatusChange(itemId, newStatus) {
    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, status: newStatus } : it))
    );
    try {
      await base44.entities.ChecklistItem.update(itemId, { status: newStatus });
    } catch (err) {
      console.error('Failed to update status', err);
    }
  }

  async function handleDateChange(itemId, date) {
    const formattedDate = date ? date.toISOString() : null;
    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, due_date: formattedDate } : it))
    );
    setCalendarOpenId(null);
    try {
      await base44.entities.ChecklistItem.update(itemId, { due_date: formattedDate });
    } catch (err) {
      console.error('Failed to update due date', err);
    }
  }

  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(items.map((it) => it.category).filter(Boolean)))];
  }, [items]);

  const filteredItems = useMemo(() => {
    return selectedCategory === 'All'
      ? items
      : items.filter((it) => it.category === selectedCategory);
  }, [items, selectedCategory]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 space-y-3" style={{ backgroundColor: 'var(--canvas)' }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--ink)' }} />
        <p className="text-sm font-medium" style={{ color: 'var(--slate)' }}>Loading your business compliance file…</p>
      </div>
    );
  }

  const clData = checklist || FALLBACK_CHECKLIST;

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--canvas)' }}>
      {/* ── Top Bar & Actions ─────────────────────────────────── */}
      <div className="border-b" style={{ borderColor: 'rgba(0,64,67,0.08)' }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium transition-smooth hover:opacity-80"
            style={{ color: 'var(--slate)' }}
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => window.print()}
              className="btn-outline-ink text-xs px-3.5 py-1.5 gap-1.5"
              style={{ borderRadius: '9999px', fontSize: '13px' }}
            >
              <Printer className="h-3.5 w-3.5" /> Print / Save PDF
            </button>
            <Link
              to="/"
              className="btn-ink text-xs px-4 py-1.5 gap-1.5"
              style={{ borderRadius: '9999px', fontSize: '13px' }}
            >
              <Sparkles className="h-3.5 w-3.5" /> New Business
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-8 space-y-6">
        {/* ── Summary & Compliance Header ───────────────────────── */}
        <div
          className="rounded-3xl p-6 sm:p-8 relative overflow-hidden"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid rgba(0,64,67,0.10)',
            boxShadow: '0 20px 48px -12px rgba(0,64,67,0.06)',
          }}
        >
          {/* Eyebrow and tags */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: 'rgba(0,64,67,0.06)', color: 'var(--ink)' }}
              >
                <Building2 className="h-3.5 w-3.5" /> {clData.business_structure || 'Sole Proprietorship'}
              </span>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: 'rgba(0,64,67,0.06)', color: 'var(--ink)' }}
              >
                <MapPin className="h-3.5 w-3.5" /> {clData.location ? (clData.location.charAt(0).toUpperCase() + clData.location.slice(1).toLowerCase()) : 'Mumbai'}
              </span>
              <span
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
                style={{ backgroundColor: 'rgba(208, 255, 113, 0.45)', color: 'var(--ink)' }}
              >
                {total} Requirements
              </span>
            </div>

            <div className="text-right flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-heading font-semibold" style={{ color: 'var(--ink)' }}>
                {rollingPercent}%
              </span>
              <span className="text-xs text-slate-500">complete</span>
            </div>
          </div>

          <h1
            className="text-2xl sm:text-4xl font-heading font-medium tracking-tight mb-2"
            style={{ color: 'var(--ink)' }}
          >
            {clData.business_type}
          </h1>

          {clData.profile_summary && (
            <p className="text-sm sm:text-[15px] leading-relaxed max-w-3xl mb-5" style={{ color: 'var(--slate)' }}>
              {clData.profile_summary}
            </p>
          )}

          {/* Motion Graphics: Sleek Liquid Gradient Progress Bar Scrub */}
          <div className="pt-4 border-t" style={{ borderColor: 'rgba(0,64,67,0.08)' }}>
            <div className="flex justify-between items-center text-xs font-medium mb-2" style={{ color: 'var(--slate)' }}>
              <span>Compliance Status ({doneCount} of {total} completed)</span>
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#004043]" /> {doneCount} done</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> {inProgressCount} in progress</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-300" /> {total - doneCount - inProgressCount} to do</span>
              </span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(0,64,67,0.06)' }}>
              <div
                className="h-full rounded-full progress-bar-scrub"
                style={{
                  width: `${targetPercent}%`,
                  background: 'linear-gradient(90deg, rgba(39, 234, 166, 0.90) 0%, rgba(0, 64, 67, 0.95) 100%)',
                }}
              />
            </div>
          </div>
        </div>

        {/* ── Category Filter Pills ────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 overflow-x-auto pb-1">
          <div className="flex items-center gap-2">
            {categories.map((cat) => {
              const count = cat === 'All' ? items.length : items.filter((it) => it.category === cat).length;
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-[13px] font-medium transition-smooth whitespace-nowrap shadow-sm cursor-pointer"
                  style={{
                    backgroundColor: isSelected ? 'var(--ink)' : '#FFFFFF',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--ink)' : 'rgba(0,64,67,0.12)',
                    color: isSelected ? '#FFFFFF' : 'var(--slate)',
                    fontWeight: isSelected ? 600 : 500,
                  }}
                >
                  <span>{cat}</span>
                  <span
                    className="h-4 min-w-[16px] px-1 rounded-full text-[10px] flex items-center justify-center font-semibold"
                    style={{
                      backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : 'rgba(0,64,67,0.08)',
                      color: isSelected ? '#FFFFFF' : 'var(--ink)',
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Motion Graphics: Staggered Card Entrance Cascade ── */}
        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[rgba(0,64,67,0.10)] p-10 text-center space-y-3 shadow-xs">
              <p className="text-slate-500 text-sm font-medium">No requirements found under the "{selectedCategory}" category.</p>
              <button
                type="button"
                onClick={() => setSelectedCategory('All')}
                className="btn-ink text-xs px-4 py-2 rounded-full cursor-pointer transition-all"
              >
                View all requirements
              </button>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const CatIcon = getCategoryIcon(item.category);
              const isDone = item.status === 'done';
              const isCalendarOpen = calendarOpenId === item.id;

              return (
                <div
                  key={`${selectedCategory}-${item.id || index}`}
                  className="animate-card-stagger bg-white rounded-2xl sm:rounded-3xl border p-6 sm:p-7 transition-all duration-300 hover:shadow-md relative group"
                  style={{
                    animationDelay: `${index * 0.05}s`,
                    borderColor: isDone ? 'rgba(6, 95, 70, 0.28)' : 'rgba(0, 64, 67, 0.09)',
                    boxShadow: '0 2px 14px rgba(0, 40, 43, 0.03)',
                  }}
                >
                {/* Motion Graphics: Ink Stamp Effect when marked Complete */}
                {isDone && (
                  <div className="absolute right-6 top-16 sm:top-6 pointer-events-none select-none animate-ink-stamp z-10">
                    <div className="rubber-stamp">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-800" />
                      <span>OFFICIALLY COMPLIANT ✓</span>
                    </div>
                  </div>
                )}

                {/* Top Row: Icon + License Category (Left) & To-Do List Status (Right) */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    {/* The Icon */}
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: isDone ? 'rgba(6, 95, 70, 0.08)' : 'rgba(0, 64, 67, 0.05)',
                      }}
                    >
                      <CatIcon
                        className="h-4 w-4"
                        style={{ color: isDone ? '#065F46' : '#004043' }}
                      />
                    </div>

                    {/* The License / Category Pill with Index */}
                    <div className="inline-flex items-center gap-1.5 bg-[#EDF9EC] rounded-full py-0.5 pr-3 pl-0.5 text-xs font-semibold text-[#004043]">
                      <span className="w-5 h-5 rounded-full bg-[#D0FF71] text-[#004043] font-bold text-xs flex items-center justify-center flex-shrink-0">
                        {index + 1}
                      </span>
                      <span>{item.category || 'License'}</span>
                    </div>

                    {/* Requirement Badge */}
                    {item.is_mandatory !== false && (
                      <span className="inline-flex items-center gap-1 bg-[#EBF7EE] text-[#156645] border border-[#D5EEDC] px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                        <CheckCircle2 className="h-3 w-3 text-[#156645]" />
                        Official Requirement
                      </span>
                    )}
                  </div>

                  {/* The To-Do List Status */}
                  <div className="flex-shrink-0">
                    <StatusSelect
                      value={item.status || 'todo'}
                      onChange={(val) => handleStatusChange(item.id, val)}
                    />
                  </div>
                </div>

                {/* The Name: Clickable, leads directly to details page */}
                <Link
                  to={`/requirement/${item.id}`}
                  className="group/title block mt-1 mb-2"
                >
                  <h2
                    className="font-heading font-bold text-xl sm:text-[22px] tracking-tight text-[#0A2528] group-hover/title:text-[#004043] flex items-center gap-2 transition-colors"
                  >
                    <span>{item.name}</span>
                    <ChevronRight className="h-4 w-4 opacity-0 group-hover/title:opacity-100 transition-opacity text-[#004043] transform group-hover/title:translate-x-0.5" />
                  </h2>
                </Link>

                {/* The Explanation */}
                <p
                  className="text-[14px] sm:text-[14.5px] text-[#5A6E70] leading-relaxed mb-5 max-w-4xl"
                >
                  {item.why_required || item.description || 'Mandatory government compliance for operating legally.'}
                </p>

                {/* Bottom Row: The Set Reminder & Details Link */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  {/* The Set Reminder with Interactive Calendar that closes immediately on mouse leave */}
                  <div
                    className="relative"
                    onMouseEnter={() => setCalendarOpenId(item.id)}
                    onMouseLeave={() => setCalendarOpenId(null)}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCalendarOpenId((prev) => (prev === item.id ? null : item.id));
                      }}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-[13px] font-medium transition-all cursor-pointer"
                      style={{
                        backgroundColor: item.due_date ? 'rgba(6, 95, 70, 0.08)' : 'rgba(0, 64, 67, 0.04)',
                        color: item.due_date ? '#065F46' : '#0A2528',
                        border: '1px solid',
                        borderColor: item.due_date ? 'rgba(6, 95, 70, 0.25)' : 'rgba(0, 64, 67, 0.12)',
                      }}
                    >
                      <Calendar className="h-3.5 w-3.5 text-slate-500" />
                      <span className="font-semibold">
                        {item.due_date ? `Due: ${format(new Date(item.due_date), 'd MMM yyyy')}` : 'Set reminder'}
                      </span>
                    </button>

                    {/* New Calendar Popover */}
                    {isCalendarOpen && (
                      <div
                        className="absolute left-0 bottom-full mb-2 z-50 animate-scale-in"
                        style={{ filter: 'drop-shadow(0 12px 28px rgba(0,40,43,0.12))' }}
                      >
                        <NewCalendar
                          selectedDate={item.due_date}
                          onSelectDate={(date) => handleDateChange(item.id, date)}
                          onClose={() => setCalendarOpenId(null)}
                        />
                      </div>
                    )}
                  </div>

                  {/* Details Page Link */}
                  <Link
                    to={`/requirement/${item.id}`}
                    className="text-xs font-semibold text-[#004043] hover:underline flex items-center gap-1 transition-smooth"
                  >
                    <span>View Details &amp; Help</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
        </div>
      </div>
    </div>
  );
}
