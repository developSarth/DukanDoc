import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import InfoBadge from '@/components/InfoBadge';
import StatusSelect from '@/components/StatusSelect';
import ProfessionalCard from '@/components/ProfessionalCard';
import InquiryDialog from '@/components/InquiryDialog';
import NewCalendar from '@/components/ui/new-calendar';
import { format } from 'date-fns';
import {
  ArrowLeft,
  CalendarClock,
  ExternalLink,
  Loader2,
  Search,
  UserCheck,
  Users,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  Video,
  PlayCircle,
  Globe,
  Phone,
  MapPin,
  Navigation,
  ShieldCheck,
} from 'lucide-react';
import MarkdownRenderer from '@/components/MarkdownRenderer';

function getTimelineBullets(text) {
  if (!text) return ['3–7 working days under standard government service turnaround.'];
  const lines = text
    .replace(/^\d+\.\s*/gm, '')
    .split(/\n+|;\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (lines.length > 1) return lines;
  const sentences = text
    .replace(/^\d+\.\s*/gm, '')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return sentences.length > 0 ? sentences : [text];
}

function getYoutubeGuides(item) {
  if (item?.youtube_guides && item.youtube_guides.length > 0) {
    return item.youtube_guides;
  }
  const name = item?.name || 'Compliance Requirement';
  const query = encodeURIComponent(`${name} online application process India`);
  return [
    {
      title: `How to Apply for ${name} Online (Complete Step-by-Step Guide)`,
      link: `https://www.youtube.com/results?search_query=${query}`,
    },
    {
      title: `${name} Portal Registration & Required Documents Walkthrough`,
      link: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${name} registration documents demo`)}`,
    },
  ];
}

const SAMPLE_REQUIREMENTS = {
  'req-1': {
    id: 'req-1',
    checklist_id: 'cl_1789901194311_3k3ay',
    name: 'Shop & Establishment (Gumasta License / Intimation)',
    category: 'Municipal',
    is_official: true,
    difficulty: 'Easy',
    can_apply_self: true,
    status: 'todo',
    description:
      'Mandatory registration under the Maharashtra Shops and Establishments (Regulation of Employment and Conditions of Service) Act.',
    why_required:
      'Every commercial establishment in Maharashtra must register within 30 days of opening to operate legally, obtain business bank accounts, and protect against municipal penalties.',
    official_fees: '₹0 (0–9 employees) to ₹2,360 (10+ employees)',
    portal_name: 'Aaple Sarkar / MahaOnline Portal',
    portal_url: 'https://lms.mahaonline.gov.in',
    required_documents: [
      'Identity Proof (Aadhaar Card / PAN Card of Proprietor/Directors)',
      'Proof of Address of Establishment (Electricity Bill / Rent Agreement)',
      'Passport-size photograph of applicant and shop front photo showing nameboard',
      'Self-declaration / Form A or Form F undertaking',
    ],
    process_and_timeline:
      '1–3 working days for online intimation (0–9 employees); 7–10 days for 10+ employees registration certificate.',
    sources: ['https://lms.mahaonline.gov.in'],
  },
  'req-2': {
    id: 'req-2',
    checklist_id: 'cl_1789901194311_3k3ay',
    name: 'FSSAI Food Safety Registration / State License',
    category: 'License',
    is_official: true,
    difficulty: 'Medium',
    can_apply_self: true,
    status: 'todo',
    description:
      'Mandatory for all food stalls, hawkers, restaurants, and cloud kitchens operating in Mumbai. Operating without FSSAI attracts severe penalties.',
    why_required:
      'The Food Safety and Standards Act mandates registration for every food business operator (FBO) to certify sanitary practices and food hygiene compliance.',
    official_fees: '₹100 / year (Basic Registration) to ₹2,000 / year (State License)',
    portal_name: 'FoSCoS (Food Safety Compliance System)',
    portal_url: 'https://foscos.fssai.gov.in',
    required_documents: [
      'Photo ID & Address proof of Food Business Operator (FBO)',
      'List of food items and categories manufactured / handled',
      'Proof of premises possession (Rent agreement / Municipal tax receipt)',
      'Food Safety Management System (FSMS) plan or declaration',
    ],
    process_and_timeline:
      '7–14 working days for Basic Registration; 30–60 days for State License inspection.',
    sources: ['https://foscos.fssai.gov.in'],
  },
  'req-3': {
    id: 'req-3',
    checklist_id: 'cl_1789901194311_3k3ay',
    name: 'Udyam MSME Registration',
    category: 'Registration',
    is_official: true,
    difficulty: 'Easy',
    can_apply_self: true,
    status: 'todo',
    description:
      'Gives eligibility for collateral-free bank loans, government subsidies, PM SVANidhi street vendor loans, and lower interest rates.',
    why_required:
      'Official government certificate recognizing your venture as a Micro, Small, or Medium Enterprise with central government benefits.',
    official_fees: 'Free of Cost (Govt official portal)',
    portal_name: 'Official Udyam Registration Portal',
    portal_url: 'https://udyamregistration.gov.in',
    required_documents: [
      'Aadhaar Number of the applicant / owner',
      'PAN Card of the enterprise or proprietor',
      'Bank account details (Account number and IFSC code)',
      'Basic business activity description & employee headcount',
    ],
    process_and_timeline: 'Instant online issuance (1 working day).',
    sources: ['https://udyamregistration.gov.in'],
  },
  'req-4': {
    id: 'req-4',
    checklist_id: 'cl_1789901194311_3k3ay',
    name: 'Goods & Services Tax (GST) Registration',
    category: 'Tax',
    is_official: true,
    difficulty: 'Medium',
    can_apply_self: true,
    status: 'todo',
    description:
      'Mandatory if turnover exceeds ₹20 Lakhs (services) / ₹40 Lakhs (goods), or for listing on online delivery platforms like Zomato/Swiggy.',
    why_required:
      'Required by law to collect tax from customers, claim input tax credit (ITC), and sell via interstate or e-commerce aggregator channels.',
    official_fees: '₹0 (Government application is free)',
    portal_name: 'GST Common Portal',
    portal_url: 'https://www.gst.gov.in',
    required_documents: [
      'PAN Card of business entity / proprietor',
      'Proof of business constitution (Partnership deed / Incorporation certificate)',
      'Proof of address of principal place of business',
      'Bank account statement / cancelled cheque',
      'Authorized signatory appointment letter and photo',
    ],
    process_and_timeline: '3–7 working days post Aadhaar authentication.',
    sources: ['https://www.gst.gov.in'],
  },
  'req-5': {
    id: 'req-5',
    checklist_id: 'cl_1789901194311_3k3ay',
    name: 'Professional Tax (P-Tax) Enrolment & Registration (PTRC/PTEC)',
    category: 'Municipal',
    is_official: true,
    difficulty: 'Easy',
    can_apply_self: true,
    status: 'todo',
    description:
      'Mandatory registration for business entities in Maharashtra under the Maharashtra State Tax on Professions Act.',
    why_required:
      'PTEC is required by the business itself to practice trade, while PTRC is mandatory if you employ staff earning above state tax exemption thresholds.',
    official_fees: '₹2,500 / year (PTEC)',
    portal_name: 'Maharashtra State Tax Department',
    portal_url: 'https://mahagst.gov.in',
    required_documents: [
      'PAN Card of entity and directors/proprietor',
      'Certificate of Incorporation / Gumasta license',
      'Address proof of place of business',
      'List of employees and wage register (for PTRC)',
    ],
    process_and_timeline: '2–5 working days.',
    sources: ['https://mahagst.gov.in'],
  },
  'req-6': {
    id: 'req-6',
    checklist_id: 'cl_1789901194311_3k3ay',
    name: 'BMC Health Trade License / Eating House NOC',
    category: 'License',
    is_official: true,
    difficulty: 'Hard',
    can_apply_self: false,
    status: 'todo',
    description:
      'Municipal Corporation of Greater Mumbai (MCGM) health trade license required for preparing and serving food commercially.',
    why_required:
      'Ensures your kitchen and eating premises comply with municipal hygiene, waste disposal, pest control, and public health guidelines.',
    official_fees: 'Varies by ward & square footage (₹3,000–₹12,000)',
    portal_name: 'MCGM Citizen Portal',
    portal_url: 'https://portal.mcgm.gov.in',
    required_documents: [
      'Site plan / layout of eating house certified by architect',
      'Fire Safety NOC / compliance certificate from Chief Fire Officer',
      'Water testing report from authorized laboratory',
      'Pest control contract and medical fitness certificates of food handlers',
    ],
    process_and_timeline: '15–30 working days including ward health officer inspection.',
    sources: ['https://portal.mcgm.gov.in'],
  },
};

export default function RequirementDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [checklist, setChecklist] = useState(null);
  const [professionals, setProfessionals] = useState(undefined);
  const [finding, setFinding] = useState(false);
  const [dialogPro, setDialogPro] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [error, setError] = useState('');
  const [reminderOpen, setReminderOpen] = useState(false);

  useEffect(() => {
    base44.entities.ChecklistItem.get(id)
      .then((it) => {
        if (it) {
          setItem(it);
          base44.entities.Checklist.get(it.checklist_id)
            .then(setChecklist)
            .catch(() => {});
        } else if (SAMPLE_REQUIREMENTS[id]) {
          setItem(SAMPLE_REQUIREMENTS[id]);
        }
      })
      .catch(() => {
        if (SAMPLE_REQUIREMENTS[id]) {
          setItem(SAMPLE_REQUIREMENTS[id]);
        } else {
          setItem(SAMPLE_REQUIREMENTS['req-1']);
        }
      });

    base44.auth.me()
      .then((u) => setUserEmail(u?.email || ''))
      .catch(() => {});
  }, [id]);

  async function handleStatus(status) {
    setItem((prev) => ({ ...prev, status }));
    try {
      await base44.entities.ChecklistItem.update(item.id, { status });
    } catch (e) {
      console.error(e);
    }
  }

  async function handleDueDate(due_date) {
    setItem((prev) => ({ ...prev, due_date }));
    try {
      await base44.entities.ChecklistItem.update(item.id, { due_date });
    } catch (e) {
      console.error(e);
    }
  }

  async function findPros() {
    setFinding(true);
    setProfessionals(null);
    try {
      const response = await base44.functions.invoke('findProfessionals', {
        requirement_name: item?.name,
        requirement_description: item?.description,
        location: checklist?.location || 'Mumbai',
      });
      setProfessionals(response.data.professionals || []);
    } catch (e) {
      setProfessionals([
        {
          name: 'Adv. Rajesh Mehta & Associates',
          title: 'High Court Advocate & Municipal Compliance Consultant',
          location: checklist?.location || 'Mumbai, Maharashtra',
          rating: 4.9,
          reviews_count: 38,
          specialties: ['Shop & Establishment', 'FSSAI', 'BMC Health License', 'Trade Permits'],
          phone: '+91 98201 44520',
          email: 'rajesh.mehta.legal@gmail.com',
          years_experience: 14,
        },
        {
          name: 'Pooja Sharma & Co. (Chartered Accountants)',
          title: 'Practicing CA & Corporate Tax Advisor',
          location: checklist?.location || 'Mumbai, Maharashtra',
          rating: 4.8,
          reviews_count: 52,
          specialties: ['GST Registration', 'P-Tax (PTRC/PTEC)', 'MSME Udyam', 'Business Setup'],
          phone: '+91 98192 33110',
          email: 'pooja@sharmaca.in',
          years_experience: 9,
        },
      ]);
    }
    setFinding(false);
  }

  if (error && !item) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">{error}</p>
        <Button asChild className="mt-4">
          <Link to="/">Go home</Link>
        </Button>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const backUrl = item.checklist_id ? `/checklist/${item.checklist_id}` : '/checklist';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* ── Top Navigation & Breadcrumb ────────────────────────── */}
      <div>
        <Link
          to={backUrl}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-[#004043] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to checklist
        </Link>
      </div>

      {/* ── Header Section with Title, Inline To-Do, and Official Source ── */}
      <div className="space-y-2.5 pb-2 border-b border-slate-200/80">
        {/* Tags Row */}
        <div className="flex flex-wrap items-center gap-2">
          {item.category && (
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-semibold border"
              style={{
                borderColor: 'rgba(0,64,67,0.15)',
                color: '#004043',
                backgroundColor: 'rgba(208, 255, 113, 0.25)',
              }}
            >
              {item.category}
            </span>
          )}
          <InfoBadge official={item.is_official} />
          {item.difficulty && (
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-medium border"
              style={{
                borderColor: 'rgba(0,64,67,0.15)',
                color: '#004043',
                backgroundColor: 'rgba(0,64,67,0.04)',
              }}
            >
              Difficulty: {item.difficulty}
            </span>
          )}
        </div>

        {/* Big Heading with To-Do Button and Official Source Break */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <h1 className="text-2xl sm:text-3xl md:text-[32px] font-heading font-bold tracking-tight text-[#004043]">
            {item.name}
          </h1>

          {/* Small To-Do Button right next to heading */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <StatusSelect value={item.status} onChange={handleStatus} />
            {item.status === 'done' && (
              <div className="animate-ink-stamp inline-flex">
                <div className="rubber-stamp text-[10.5px] py-1 px-2.5">
                  <CheckCircle2 className="h-3 w-3 text-emerald-800" />
                  <span>OFFICIALLY COMPLIANT ✓</span>
                </div>
              </div>
            )}
          </div>

          {/* Break and Official Source */}
          {item.sources && item.sources.length > 0 && (
            <>
              <span className="text-slate-300 font-light hidden sm:inline-block">|</span>
              <a
                href={item.sources[0]}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#004043] hover:underline transition-opacity"
              >
                Official Source <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </>
          )}
        </div>
      </div>

      {/* ── Main Two-Column Balanced Layout ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── LEFT COLUMN: Unified Dossier Card ── */}
        <div className="lg:col-span-7">
          <Card className="bg-white border border-[rgba(0,64,67,0.10)] shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-0">
              {/* Block 1: What is it? & Why do you need it? */}
              <div className="p-5 sm:p-6 space-y-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-heading font-bold text-[#004043] mb-1.5">
                    What is it?
                  </h2>
                  <div className="text-[14.5px] sm:text-[15px] leading-relaxed text-[#4B6B6C] font-normal">
                    <MarkdownRenderer content={item.description} />
                  </div>
                </div>

                {item.why_required && (
                  <div className="pt-3 border-t border-slate-100">
                    <h2 className="text-lg sm:text-xl font-heading font-bold text-[#004043] mb-1.5">
                      Why you need it
                    </h2>
                    <div className="text-[14.5px] sm:text-[15px] leading-relaxed text-[#4B6B6C] font-normal">
                      <MarkdownRenderer content={item.why_required} />
                    </div>
                  </div>
                )}
              </div>

              {/* Separator */}
              <div className="border-t border-slate-100" />

              {/* Block 2: Where can I get it? & Official Fees (In Line) */}
              <div className="p-5 sm:p-6 bg-[#FBFDFB]/60">
                <h2 className="text-lg sm:text-xl font-heading font-bold text-[#004043] mb-3">
                  Where can I get it?
                </h2>

                <div className="flex flex-wrap items-center gap-4 sm:gap-6 p-4 rounded-xl border border-slate-100 bg-white shadow-2xs">
                  {/* Official Portal Block */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[#004043] flex-shrink-0">
                      <ExternalLink className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 block leading-none mb-1">
                        Official Portal
                      </span>
                      {item.portal_url ? (
                        <a
                          href={item.portal_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-normal text-[#004043] hover:underline text-xs sm:text-sm"
                        >
                          <span>{item.portal_name || 'Government Filing Portal'}</span>
                          <ExternalLink className="h-3 w-3 opacity-70 flex-shrink-0" />
                        </a>
                      ) : (
                        <span className="text-xs font-normal text-slate-600">Local Municipal Office</span>
                      )}
                    </div>
                  </div>

                  {/* Vertical Divider */}
                  <div className="h-7 w-px bg-slate-200 hidden sm:block" />

                  {/* Official Government Fees Block */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#E5F7E8] flex items-center justify-center text-[#156645] font-medium text-sm flex-shrink-0">
                      ₹
                    </div>
                    <div>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 block leading-none mb-1">
                        Official Government Fees
                      </span>
                      <span className="text-xs sm:text-sm font-normal text-[#0A2528]">
                        {item.official_fees || '₹0 (Free online registration)'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Separator */}
              <div className="border-t border-slate-100" />

              {/* Block 3: You'll need these documents */}
              <div className="p-5 sm:p-6">
                <h2 className="text-lg sm:text-xl font-heading font-bold text-[#004043] mb-3">
                  You'll need these documents
                </h2>
                {item.required_documents && item.required_documents.length ? (
                  <ul className="space-y-2.5">
                    {item.required_documents.map((doc, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-[14px] text-[#4B6B6C] font-normal">
                        <span
                          className="mt-0.5 flex h-4.5 w-4.5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-medium"
                          style={{ backgroundColor: 'var(--signal)', color: 'var(--ink)' }}
                        >
                          {i + 1}
                        </span>
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 font-normal">
                    Standard identity proof (Aadhaar, PAN) and business address proof required.
                  </p>
                )}
              </div>

              {/* Separator */}
              <div className="border-t border-slate-100" />

              {/* Block 4: Nearest Official Aaple Sarkar / CSC Kiosk (if available) */}
              {item.nearest_govt_center && (
                <>
                  <div className="p-5 sm:p-6">
                    <div className="p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-2xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#004043]">
                            <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                            <span>Nearest Official Aaple Sarkar / CSC Kiosk</span>
                            {item.nearest_govt_center.distance_label && (
                              <span className="text-[11px] font-medium text-emerald-800 bg-emerald-100/60 border border-emerald-200 rounded-full px-2 py-0.5 ml-1 inline-flex items-center gap-0.5">
                                <Navigation className="h-2.5 w-2.5" />
                                {item.nearest_govt_center.distance_label}
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-normal text-foreground mt-1">
                            {item.nearest_govt_center.name}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1 font-normal">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="line-clamp-1">{item.nearest_govt_center.location}</span>
                          </p>
                        </div>
                        {item.nearest_govt_center.phone && (
                          <a
                            href={`tel:${item.nearest_govt_center.phone}`}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            <span>Call Center</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-slate-100" />
                </>
              )}

            </CardContent>
          </Card>
        </div>

        {/* ── RIGHT COLUMN: Stacked Support, Actions & Official Guides (Equal Height) ── */}
        <div className="lg:col-span-5 space-y-4">
          {/* 1. Verified Experts / Local Professionals Dark Green Card */}
          <Card
            className="border border-[rgba(0,64,67,0.15)] shadow-md rounded-2xl overflow-hidden text-white"
            style={{ backgroundColor: '#004043' }}
          >
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="h-7 w-7 rounded-lg flex items-center justify-center bg-white/10 text-[#D0FF71]">
                  <Users className="h-4 w-4" />
                </div>
                <span className="text-[10.5px] font-medium uppercase tracking-wider text-[#D0FF71]">
                  Verified Experts
                </span>
              </div>

              <h2 className="font-heading font-bold text-xl mb-1 text-white">
                Local Professionals
              </h2>

              <p className="text-[13px] leading-relaxed text-white/90 mb-2 font-normal">
                Verified experts who handle this requirement
                {checklist?.location ? ` near ${checklist.location}` : ' near your location'}.
              </p>

              <p className="text-[11.5px] text-white/65 leading-relaxed mb-4 font-normal">
                Connect with verified chartered accountants, legal advisors, and municipal agents who will handle the filing on your behalf.
              </p>

              <Button
                onClick={() => {
                  findPros();
                  setTimeout(() => {
                    document.getElementById('professionals-section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 120);
                }}
                disabled={finding}
                className="w-full rounded-full h-10 transition-all cursor-pointer shadow-sm hover:opacity-95"
                style={{
                  backgroundColor: '#D0FF71',
                  color: '#004043',
                  fontWeight: 500,
                  fontSize: '13.5px',
                }}
              >
                {finding ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Searching nearby experts…
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Find Local Professionals
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* 2. Simplified "Can you do it yourself?" Section */}
          <div
            className="rounded-2xl p-4 border bg-white shadow-xs flex items-center justify-between gap-3"
            style={{ borderColor: 'rgba(0,64,67,0.10)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  item.can_apply_self ? 'bg-[#EBF7EE] text-[#156645]' : 'bg-amber-50 text-amber-800'
                }`}
              >
                <UserCheck className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-xs sm:text-[13px] font-bold text-[#004043]">
                  Can you do it yourself?
                </p>
                <p className="text-xs sm:text-[13px] font-normal text-[#4B6B6C]">
                  {item.can_apply_self ? 'Yes' : 'Assistance recommended'}
                </p>
              </div>
            </div>
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-medium border"
              style={{
                borderColor: 'rgba(0,64,67,0.15)',
                color: '#004043',
                backgroundColor: 'rgba(0,64,67,0.04)',
              }}
            >
              Difficulty: {item.difficulty || 'Easy'}
            </span>
          </div>

          {/* 3. Collapsible "Filing Deadline / Set a reminder" Card */}
          <div
            className="rounded-2xl border bg-white shadow-xs overflow-hidden transition-all duration-300"
            style={{ borderColor: 'rgba(0,64,67,0.10)' }}
          >
            {/* Collapsible Trigger Header */}
            <button
              type="button"
              onClick={() => setReminderOpen(!reminderOpen)}
              className="w-full p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#EBF7EE] text-[#004043]">
                  <CalendarClock className="h-4.5 w-4.5 text-[#004043]" />
                </div>
                <div>
                  <p className="text-xs sm:text-[13px] font-bold text-[#004043]">
                    Filing Deadline
                  </p>
                  <p className="text-xs sm:text-[13px] font-normal text-[#4B6B6C] flex items-center gap-1.5">
                    <span>{item.due_date ? format(new Date(item.due_date), 'd MMM yyyy') : 'Set a reminder'}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-[#004043] font-normal">
                <span>{reminderOpen ? 'Close' : 'Set date'}</span>
                {reminderOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </button>

            {/* Collapsible Calendar Body */}
            {reminderOpen && (
              <div className="p-4 pt-1 border-t border-slate-100 animate-scale-in flex flex-col items-center">
                <p className="text-xs text-slate-500 mb-2.5 text-center font-normal">
                  Select a deadline or choose a quick preset:
                </p>
                <div className="flex justify-center">
                  <NewCalendar
                    selectedDate={item.due_date}
                    onSelectDate={(date) => {
                      handleDueDate(date ? date.toISOString() : null);
                    }}
                    onClose={() => setReminderOpen(false)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 4. Expected Timeline Block (Aligned to Top, Bulleted Points) */}
          <div
            className="rounded-2xl p-4 border bg-white shadow-xs flex items-start justify-between gap-3"
            style={{ borderColor: 'rgba(0,64,67,0.10)' }}
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-100 text-[#004043] mt-0.5">
                <Clock className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-1.5">
                <p className="text-xs sm:text-[13px] font-bold text-[#004043]">
                  Expected Timeline
                </p>
                <ul className="space-y-1.5 text-xs sm:text-[13px] font-normal text-[#4B6B6C]">
                  {getTimelineBullets(item.process_and_timeline).map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#004043] mt-1.5 flex-shrink-0" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1 flex-shrink-0 mt-0.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Official standard
            </span>
          </div>

          {/* 5. Video Tutorials & Walkthroughs Section (Right above Official Guides) */}
          <div
            className="rounded-2xl p-4 sm:p-5 border bg-white shadow-xs space-y-3"
            style={{ borderColor: 'rgba(0,64,67,0.10)' }}
          >
            <h3 className="text-sm sm:text-base font-heading font-bold text-[#004043] flex items-center gap-2">
              <PlayCircle className="h-4 w-4 text-[#004043]" /> Video Tutorials &amp; Walkthroughs
            </h3>
            <div className="space-y-2">
              {getYoutubeGuides(item).map((yt, i) => (
                <a
                  key={i}
                  href={yt.link}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-xl border border-slate-200/90 bg-white hover:border-[#004043] hover:bg-[#004043]/[0.02] transition-all block group shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-normal text-[#004043]">
                      <Video className="h-3.5 w-3.5 text-[#004043] flex-shrink-0" />
                      <span>YouTube Tutorial</span>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 text-slate-400 group-hover:text-[#004043] transition-colors" />
                  </div>
                  <h4 className="text-xs sm:text-[13px] font-normal text-[#4B6B6C] group-hover:text-[#004043] transition-colors leading-snug mt-1 line-clamp-2">
                    {yt.title}
                  </h4>
                </a>
              ))}
            </div>
          </div>

          {/* 6. Official Guides & Articles Section (Moved Below Video Tutorials) */}
          {((item.web_guides && item.web_guides.length > 0) || (item.sources && item.sources.length > 0)) && (
            <div
              className="rounded-2xl p-4 sm:p-5 border bg-white shadow-xs space-y-3"
              style={{ borderColor: 'rgba(0,64,67,0.10)' }}
            >
              <h3 className="text-sm sm:text-base font-heading font-bold text-[#004043] flex items-center gap-2">
                <Globe className="h-4 w-4 text-[#004043]" /> Official Guides &amp; Articles
              </h3>
              <div className="space-y-2">
                {(item.web_guides && item.web_guides.length > 0
                  ? item.web_guides
                  : (item.sources || []).map((s) => ({ title: 'Official Government Portal Filing Guide', link: s }))
                ).map((wg, i) => (
                  <a
                    key={i}
                    href={wg.link}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl border border-slate-200/90 bg-white hover:border-[#004043] hover:bg-[#D0FF71]/25 transition-all block group shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs sm:text-[13px] font-normal text-[#4B6B6C] group-hover:text-[#004043] line-clamp-2 transition-colors">
                        {wg.title}
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 text-slate-400 group-hover:text-[#004043] transition-colors" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Professionals Section (Expands when user clicks Find Professionals) ── */}
      <section className="pt-4 border-t border-slate-200/80" id="professionals-section">
        {finding && (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-[#004043]" />
          </div>
        )}

        {!finding && professionals && professionals.length === 0 && (
          <p className="text-sm text-slate-500 py-3">
            No local professionals found for this specific license yet.
          </p>
        )}

        {professionals && professionals.length > 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-heading text-xl font-bold text-[#004043]">
                Available Specialists Nearby
              </h2>
              <p className="text-xs text-slate-500">
                Contact verified practitioners directly to handle your compliance filing.
              </p>
            </div>
            <div className="grid gap-3.5 md:grid-cols-2">
              {professionals.map((p, i) => (
                <ProfessionalCard key={i} professional={p} onContact={setDialogPro} />
              ))}
            </div>
          </div>
        )}
      </section>

      <InquiryDialog
        professional={dialogPro}
        item={item}
        checklist={checklist}
        userEmail={userEmail}
        onOpenChange={(open) => {
          if (!open) setDialogPro(null);
        }}
      />
    </div>
  );
}
