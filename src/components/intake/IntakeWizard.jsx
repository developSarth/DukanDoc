import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  UtensilsCrossed,
  ShoppingBag,
  Globe,
  Home as HomeIcon,
  Building2,
  User,
} from 'lucide-react';

const STRUCTURES = [
  'Sole Proprietorship',
  'Partnership Firm',
  'Limited Liability Partnership (LLP)',
  'One Person Company (OPC)',
  'Private Limited Company',
  'Hindu Undivided Family (HUF)',
  'Trust / Society / NGO',
  'Not sure yet',
];

const TYPE_OPTIONS = [
  { label: 'Food stall / restaurant', Icon: UtensilsCrossed },
  { label: 'Retail shop', Icon: ShoppingBag },
  { label: 'Online / e-commerce', Icon: Globe },
  { label: 'Home-based business', Icon: HomeIcon },
  { label: 'Manufacturing / workshop', Icon: Building2 },
  { label: 'Consulting / freelancing', Icon: User },
];

const STEPS = [
  { label: 'Business type', subtitle: 'What are you building?' },
  { label: 'Location',      subtitle: 'Where are you opening?' },
  { label: 'Structure',     subtitle: 'How are you setting it up?' },
  { label: 'Operations',    subtitle: 'What is your role? Tell us more about what you do' },
];

export default function IntakeWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    business_type: '',
    location: '',
    business_structure: 'Sole Proprietorship',
    operations_nature: '',
    details: '',
  });
  const [customInput, setCustomInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const isLast = step === STEPS.length - 1;

  // Selected or typed
  const currentType = form.business_type || customInput;
  const canNext =
    step === 0
      ? currentType.trim().length > 0
      : step === 1
      ? form.location.trim().length > 0
      : true;

  const handlePillSelect = (label) => {
    if (form.business_type === label) {
      set('business_type', '');
    } else {
      set('business_type', label);
      setCustomInput('');
    }
  };

  const handleCustomInputChange = (e) => {
    const val = e.target.value;
    setCustomInput(val);
    set('business_type', val);
  };

  async function handleSubmit() {
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        business_type: form.business_type || customInput,
      };
      const response = await base44.functions.invoke('generateChecklist', payload);
      const { profile_summary, requirements } = response.data;
      const checklist = await base44.entities.Checklist.create({ ...payload, profile_summary });
      await base44.entities.ChecklistItem.bulkCreate(
        requirements.map((r, i) => ({
          checklist_id: checklist.id,
          status: 'todo',
          order_index: i,
          name: r.name,
          category: r.category || 'Other',
          description: r.description || '',
          why_required: r.why_required || '',
          portal_name: r.portal_name || '',
          portal_url: r.portal_url || '',
          official_fees: r.official_fees || '',
          required_documents: r.required_documents || [],
          process_and_timeline: r.process_and_timeline || '',
          can_apply_self: !!r.can_apply_self,
          difficulty: r.difficulty || 'moderate',
          is_official: r.is_official !== false,
          sources: r.sources || [],
        }))
      );
      navigate(`/checklist/${checklist.id}`);
    } catch (e) {
      setError(
        e?.response?.data?.error ||
          e?.message ||
          'Something went wrong while generating your checklist. Please try again.'
      );
      setLoading(false);
    }
  }

  return (
    <div className="liquid-glass-card px-6 py-6 sm:px-9 sm:py-7 animate-fade-up">
      {/* Header & Subtle Gradient Progress Bar */}
      <div className="text-center relative mb-5">
        {step > 0 && !loading && (
          <button
            type="button"
            className="absolute left-0 top-0 flex items-center justify-center h-7 w-7 rounded-full transition-smooth hover:bg-black/5"
            onClick={() => setStep((s) => s - 1)}
            title="Back"
          >
            <ArrowLeft className="h-4 w-4" style={{ color: 'var(--ink)', opacity: 0.7 }} />
          </button>
        )}

        <p className="text-xs font-medium tracking-wide mb-2.5" style={{ color: 'var(--slate)', opacity: 0.85 }}>
          Step {step + 1} of {STEPS.length}
        </p>

        {/* Subtle, tasteful gradient progress bar */}
        <div className="w-full rounded-full h-[5px] mb-5 relative overflow-hidden" style={{ backgroundColor: 'rgba(0,64,67,0.06)' }}>
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${((step + 1) / STEPS.length) * 100}%`,
              background: 'linear-gradient(90deg, rgba(39, 234, 166, 0.75) 0%, rgba(0, 64, 67, 0.80) 100%)',
            }}
          />
        </div>

        {/* Step Heading */}
        <h3
          className="font-heading font-medium text-xl sm:text-[23px]"
          style={{ color: 'var(--ink)', letterSpacing: '-0.02em' }}
        >
          {step === 0 ? 'What business are you starting?' : STEPS[step].label}
        </h3>
        {step !== 0 && (
          <p className="text-sm mt-1" style={{ color: 'var(--slate)' }}>
            {STEPS[step].subtitle}
          </p>
        )}
      </div>

      {/* ── Step 0: Business Type ─────────────────────────────── */}
      {step === 0 && (
        <div className="animate-slide-right" key="step-0">
          {/* 3-column Grid of Options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3.5">
            {TYPE_OPTIONS.map((t) => {
              const isSelected = form.business_type === t.label;
              return (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => handlePillSelect(t.label)}
                  className={`liquid-glass-pill rounded-full px-3.5 py-2.5 text-[13px] sm:text-[13.5px] font-medium flex items-center gap-2 transition-smooth whitespace-nowrap ${
                    isSelected ? 'selected' : ''
                  }`}
                >
                  <t.Icon className="h-4 w-4 flex-shrink-0" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Custom Business Input */}
          <input
            type="text"
            className="liquid-glass-input rounded-xl px-4 py-2.5 text-sm w-full outline-none"
            value={customInput}
            onChange={handleCustomInputChange}
            placeholder="or describe it in your own words..."
            style={{ color: 'var(--ink)' }}
          />
        </div>
      )}

      {/* ── Step 1: Location ──────────────────────────────────── */}
      {step === 1 && (
        <div className="animate-slide-right" key="step-1">
          <p className="text-sm mb-3" style={{ color: 'var(--slate)' }}>
            Please mention the city and state because many rules, like municipal trade licenses, depend on the exact city and state.
          </p>
          <input
            type="text"
            className="liquid-glass-input rounded-xl px-4 py-2.5 text-sm w-full outline-none"
            value={form.location}
            onChange={(e) => set('location', e.target.value)}
            placeholder="e.g. Mumbai, Maharashtra"
            autoFocus
            style={{ color: 'var(--ink)' }}
          />
        </div>
      )}

      {/* ── Step 2: Structure ─────────────────────────────────── */}
      {step === 2 && (
        <div className="animate-slide-right" key="step-2">
          <p className="text-sm mb-3" style={{ color: 'var(--slate)' }}>
            Pick the &ldquo;Not sure&rdquo; option, and we&apos;ll suggest to you what to do.
          </p>
          <Select
            value={form.business_structure}
            onValueChange={(v) => set('business_structure', v)}
          >
            <SelectTrigger
              className="liquid-glass-input rounded-xl px-4 py-2.5 text-sm w-full"
              style={{ color: 'var(--ink)' }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              style={{
                backgroundColor: 'var(--canvas-lifted)',
                border: '1px solid rgba(0,64,67,0.12)',
                borderRadius: '14px',
              }}
            >
              {STRUCTURES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* ── Step 3: Operations ────────────────────────────────── */}
      {step === 3 && (
        <div className="animate-slide-right" key="step-3">
          <Textarea
            id="operations_nature"
            rows={3}
            className="liquid-glass-input rounded-xl p-3 text-sm w-full resize-none"
            value={form.operations_nature}
            onChange={(e) => set('operations_nature', e.target.value)}
            placeholder="e.g. Preparing and selling cooked snacks from a stall, 1 to 2 helpers, around Rs 50,000 monthly sales"
            style={{ color: 'var(--ink)' }}
          />
          <p className="text-xs mt-1 mb-3" style={{ color: 'var(--slate)', opacity: 0.7 }}>
            Be specific so it helps us find all the permits that apply.
          </p>

          <p className="text-sm font-medium mb-1" style={{ color: 'var(--ink)' }}>
            Anything else we should know?{' '}
            <span style={{ color: 'var(--slate)', fontWeight: 400 }}>(optional)</span>
          </p>
          <Textarea
            id="details"
            rows={2}
            className="liquid-glass-input rounded-xl p-3 text-sm w-full resize-none"
            value={form.details}
            onChange={(e) => set('details', e.target.value)}
            placeholder="e.g. I may also deliver via Swiggy or Zomato later"
            style={{ color: 'var(--ink)' }}
          />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p
          className="text-sm mt-3 px-3 py-2 rounded-xl animate-fade-up"
          style={{
            color: '#b91c1c',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.20)',
          }}
        >
          {error}
        </p>
      )}

      {/* Navigation Footer */}
      <div
        className="flex items-center justify-between mt-5 pt-4 border-t"
        style={{ borderColor: 'rgba(0,64,67,0.07)' }}
      >
        {step > 0 ? (
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-smooth hover:bg-black/5"
            style={{ color: 'var(--slate)' }}
            onClick={() => setStep((s) => s - 1)}
            disabled={loading}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        ) : (
          <div />
        )}

        {isLast ? (
          <button
            type="button"
            className="btn-signal"
            style={{
              borderRadius: '9999px',
              padding: '9px 24px',
              fontSize: '14px',
              boxShadow: '0 4px 14px rgba(208, 255, 113, 0.40)',
            }}
            onClick={handleSubmit}
            disabled={loading || !canNext}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? 'Researching requirements…' : 'Generate my checklist'}
          </button>
        ) : (
          <button
            type="button"
            className="btn-signal"
            style={{
              borderRadius: '9999px',
              padding: '8px 22px',
              fontSize: '14px',
              boxShadow: '0 4px 14px rgba(208, 255, 113, 0.40)',
            }}
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext}
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {loading && (
        <p className="text-xs mt-3 text-center animate-fade-up" style={{ color: 'var(--slate)' }}>
          This researches live government sources — usually under a minute. Keep this page open.
        </p>
      )}
    </div>
  );
}
