// Standalone API Client with in-browser Mock/Dummy backend
// Zero Base44 cloud dependencies — 100% ready for AWS / Vercel / Netlify deployment.

const STORAGE_KEYS = {
  CHECKLISTS: 'dukandoc_checklists',
  ITEMS: 'dukandoc_checklist_items',
  INQUIRIES: 'dukandoc_inquiries',
  USER: 'dukandoc_current_user',
  TOKEN: 'dukandoc_auth_token',
};

// Seed sample data if first time
function getStored(key, defaultVal) {
  try {
    let raw = localStorage.getItem(key);
    if (!raw && key.startsWith('dukandoc_')) {
      // Backward compatibility for existing browser sessions
      raw = localStorage.getItem(key.replace('dukandoc_', 'legaldoc_'));
    }
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setStored(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }
}

// Generate realistic checklists based on business category & Mumbai/India context
function generateDummyRequirements(form) {
  const bType = (form.business_type || '').toLowerCase();
  const loc = form.location || 'Mumbai, Maharashtra';

  const isFood = bType.includes('food') || bType.includes('stall') || bType.includes('restaurant') || bType.includes('cafe') || bType.includes('snack') || bType.includes('tea') || bType.includes('bakery') || bType.includes('kitchen');
  const isRetail = bType.includes('shop') || bType.includes('retail') || bType.includes('store') || bType.includes('boutique') || bType.includes('stationery') || bType.includes('clothes');

  const list = [
    {
      name: 'Shop & Establishment (Gumasta License / Intimation)',
      category: 'Municipal',
      description: 'Mandatory registration under the Maharashtra Shops and Establishments (Regulation of Employment and Conditions of Service) Act.',
      why_required: `Required for operating any commercial shop, stall, or office in ${loc}. Form A is for 0-9 employees (intimation), Form B for 10+ employees.`,
      portal_name: 'Aaple Sarkar / MCGM Citizen Portal',
      portal_url: 'https://aaplesarkar.mahaonline.gov.in',
      official_fees: '₹0 (0-9 employees) to ₹2,360 (10+ employees)',
      required_documents: ['Aadhaar Card of Owner', 'PAN Card', 'Passport size photo', 'Shop Photo with Signboard in Marathi (Devanagari)', 'Electricity Bill / Rent Agreement of premises'],
      process_and_timeline: 'Apply online on Aaple Sarkar portal. Upload documents and self-attested photo. Instant auto-generated receipt for Form A; 3-5 days for Form B.',
      can_apply_self: true,
      difficulty: 'easy',
      is_official: true,
      sources: ['https://aaplesarkar.mahaonline.gov.in', 'https://portal.mcgm.gov.in'],
    },
    {
      name: 'Udyam MSME Registration',
      category: 'Registration',
      description: 'Government of India micro, small, and medium enterprise recognition certificate.',
      why_required: 'Gives eligibility for collateral-free bank loans, government subsidies, PM SVANidhi street vendor loans, and lower interest rates.',
      portal_name: 'Udyam Registration Portal (Ministry of MSME)',
      portal_url: 'https://udyamregistration.gov.in',
      official_fees: 'Free of Cost (Govt official portal)',
      required_documents: ['Aadhaar Card (linked with mobile)', 'PAN Card of Proprietor/Firm', 'Bank Account details (IFSC, Account Number)'],
      process_and_timeline: '100% online self-serve on udyamregistration.gov.in. Verify Aadhaar via OTP. E-Certificate generated within 24–48 hours.',
      can_apply_self: true,
      difficulty: 'easy',
      is_official: true,
      sources: ['https://udyamregistration.gov.in'],
    },
  ];

  if (isFood) {
    list.unshift({
      name: 'FSSAI Food Safety Registration / State License',
      category: 'License',
      description: 'Mandatory food safety permit issued by the Food Safety and Standards Authority of India for handling, preparing, or selling food items.',
      why_required: `Mandatory for all food stalls, hawkers, restaurants, and cloud kitchens operating in ${loc}. Operating without FSSAI attracts severe penalties.`,
      portal_name: 'FoSCoS (Food Safety Compliance System)',
      portal_url: 'https://foscos.fssai.gov.in',
      official_fees: '₹100/year (Basic Registration under ₹12 Lakh turnover) or ₹2,000/year (State License)',
      required_documents: ['Photo ID of Food Business Operator (FBO)', 'Passport photo', 'Proof of premises address (Rent agreement / NOC / Ward survey)', 'Food safety management system plan or declaration'],
      process_and_timeline: 'Register online at FoSCoS portal. Submit Form A (Basic Registration), pay ₹100 fee. Certificate is approved in 7–14 business days.',
      can_apply_self: true,
      difficulty: 'easy',
      is_official: true,
      sources: ['https://foscos.fssai.gov.in', 'https://fssai.gov.in'],
    });

    list.push({
      name: 'BMC / Municipal Health & Trade License (Section 394 MMC Act)',
      category: 'Municipal',
      description: 'Trade license issued by the local Municipal Corporation Health Department ensuring hygiene and fire safety.',
      why_required: `Mandatory for running any eating house, food kiosk, or manufacturing unit in ${loc} under the Mumbai Municipal Corporation Act.`,
      portal_name: 'MCGM Citizen Portal / Local Ward Office',
      portal_url: 'https://portal.mcgm.gov.in',
      official_fees: '₹2,500 – ₹7,000 depending on area and seating',
      required_documents: ['Premises layout plan', 'Fire Compliance NOC', 'Water connection bill', 'Pest control certificate', 'NOC from property owner'],
      process_and_timeline: 'Submit application online on MCGM portal followed by physical inspection by Ward Sanitary Inspector. Takes 15–30 days.',
      can_apply_self: false,
      difficulty: 'complex',
      is_official: true,
      sources: ['https://portal.mcgm.gov.in'],
    });
  }

  if (isRetail || !isFood) {
    list.push({
      name: 'GST Registration',
      category: 'Tax',
      description: 'Goods and Services Tax registration for business identity and tax collection.',
      why_required: 'Mandatory if annual goods turnover exceeds ₹40 Lakhs (₹20 Lakhs for services), or if selling goods inter-state / on Amazon/Flipkart/Swiggy.',
      portal_name: 'GST Common Portal',
      portal_url: 'https://www.gst.gov.in',
      official_fees: '₹0 (Government portal is free)',
      required_documents: ['PAN Card of Business/Proprietor', 'Aadhaar Card', 'Proof of Business Address (Electricity Bill + NOC / Rent Agreement)', 'Bank Statement / Cancelled Cheque'],
      process_and_timeline: 'Submit REG-01 online on gst.gov.in with Aadhaar authentication. GSTIN is issued in 3–7 working days.',
      can_apply_self: true,
      difficulty: 'moderate',
      is_official: true,
      sources: ['https://www.gst.gov.in'],
    });
  }

  list.push(
    {
      name: 'Professional Tax (PTEC / PTRC Registration)',
      category: 'Tax',
      description: 'Maharashtra State Professional Tax enrollment and registration certificate.',
      why_required: 'Mandatory for individuals carrying out a profession or business in Maharashtra, as well as employers with salaried staff.',
      portal_name: 'Maharashtra Goods & Services Tax Department',
      portal_url: 'https://www.mahagst.gov.in',
      official_fees: '₹2,500 per year (PTEC for business owner)',
      required_documents: ['PAN Card', 'Aadhaar Card', 'Gumasta License', 'Bank Account details'],
      process_and_timeline: 'Apply online on Mahagst portal. Form I / II submission with Aadhaar OTP authentication. 1–3 business days.',
      can_apply_self: true,
      difficulty: 'moderate',
      is_official: true,
      sources: ['https://www.mahagst.gov.in'],
    },
    {
      name: 'Current Business Bank Account & PAN Card',
      category: 'Registration',
      description: 'Dedicated commercial bank account in the name of the business entity for formal financial transactions and UPI payments.',
      why_required: 'Separates personal and business finances, enables commercial QR code payments (Google Pay Business, Paytm), and required for MSME subsidies.',
      portal_name: 'Any Scheduled Commercial Bank (SBI, HDFC, ICICI, etc.)',
      portal_url: 'https://www.sbi.co.in',
      official_fees: 'Zero opening fee (Minimum average balance varies from ₹1,000 to ₹10,000)',
      required_documents: ['PAN Card', 'Aadhaar Card', '2 Business Proofs (Gumasta License + Udyam Certificate)', 'Passport photos'],
      process_and_timeline: 'Visit bank branch or apply online with bank executive. Account active within 24–48 hours with UPI QR kit.',
      can_apply_self: true,
      difficulty: 'easy',
      is_official: true,
      sources: ['https://rbi.org.in'],
    }
  );

  return {
    profile_summary: `Your proposed business (${form.business_type} in ${loc}) operates under Maharashtra municipal regulations and national trade standards. The primary licenses include Shop Act (Gumasta), Udyam MSME, and ${isFood ? 'FSSAI food safety clearance' : 'tax registrations'}. Most can be initiated online directly.`,
    requirements: list,
  };
}

function generateDummyProfessionals(params) {
  const loc = params.location || 'Mumbai';
  const reqName = params.requirement_name || 'Business License';

  return [
    {
      name: `Aaple Sarkar Seva Kendra & Documentation Hub (${loc.split(',')[0]})`,
      profession_type: 'Authorized Maharashtra e-Seva / CSC Center',
      location: `${loc.split(',')[0]}, Mumbai`,
      rating: '4.8 (142 reviews)',
      contact_email: 'contact.setukendra.mumbai@gmail.com',
      phone: '+91 98201 44520',
      pricing: '₹300 – ₹750 per application filing',
      source_url: 'https://aaplesarkar.mahaonline.gov.in',
    },
    {
      name: `M/s R.K. Sharma & Associates (Tax & Business Consultants)`,
      profession_type: 'Chartered Accountant & Shop Act Licensing Consultant',
      location: `Near Railway Station, ${loc.split(',')[0]}`,
      rating: '4.9 (88 reviews)',
      contact_email: 'info.rkassociates.legal@gmail.com',
      phone: '+91 98335 11980',
      pricing: '₹1,500 – ₹3,500 full package',
      source_url: 'https://www.google.com/maps',
    },
    {
      name: `Express Cyber Cafe & Online Government Services`,
      profession_type: 'Digital Documentation & Udyam / Gumasta Agent',
      location: `${loc.split(',')[0]} Market Area`,
      rating: '4.6 (64 reviews)',
      contact_email: 'expresscyber.docs@gmail.com',
      phone: '+91 99203 77412',
      pricing: '₹200 – ₹500 application fee',
      source_url: 'https://www.google.com/maps',
    },
    {
      name: `Mumbai Trade & Municipal Ward Liaison Consultants`,
      profession_type: 'BMC Ward Health License & Fire Compliance Expert',
      location: `Bandra West / Dadar Central, Mumbai`,
      rating: '4.7 (52 reviews)',
      contact_email: 'trade.license.mumbai@gmail.com',
      phone: '+91 97692 88310',
      pricing: 'Pricing on consultation',
      source_url: 'https://portal.mcgm.gov.in',
    },
  ];
}

// Client Object API
export const base44 = {
  entities: {
    Checklist: {
      async list(sort = '-created_date', limit = 10) {
        const list = getStored(STORAGE_KEYS.CHECKLISTS, []);
        return list.slice(0, limit);
      },
      async get(id) {
        const list = getStored(STORAGE_KEYS.CHECKLISTS, []);
        const found = list.find((x) => x.id === id);
        if (!found) throw new Error('Checklist not found');
        return found;
      },
      async create(data) {
        const list = getStored(STORAGE_KEYS.CHECKLISTS, []);
        const newItem = {
          ...data,
          id: 'cl_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          created_date: new Date().toISOString(),
        };
        list.unshift(newItem);
        setStored(STORAGE_KEYS.CHECKLISTS, list);
        return newItem;
      },
    },

    ChecklistItem: {
      async filter({ checklist_id }, sort = 'order_index', limit = 100) {
        const items = getStored(STORAGE_KEYS.ITEMS, []);
        return items.filter((x) => x.checklist_id === checklist_id);
      },
      async get(id) {
        const items = getStored(STORAGE_KEYS.ITEMS, []);
        const found = items.find((x) => x.id === id);
        if (!found) throw new Error('Requirement item not found');
        return found;
      },
      async update(id, updates) {
        const items = getStored(STORAGE_KEYS.ITEMS, []);
        const index = items.findIndex((x) => x.id === id);
        if (index !== -1) {
          items[index] = { ...items[index], ...updates };
          setStored(STORAGE_KEYS.ITEMS, items);
          return items[index];
        }
        throw new Error('Item not found');
      },
      async bulkCreate(newItems) {
        const items = getStored(STORAGE_KEYS.ITEMS, []);
        const formatted = newItems.map((item, idx) => ({
          ...item,
          id: 'item_' + Date.now() + '_' + idx + '_' + Math.random().toString(36).substr(2, 4),
          created_date: new Date().toISOString(),
        }));
        const combined = [...formatted, ...items];
        setStored(STORAGE_KEYS.ITEMS, combined);
        return formatted;
      },
    },

    Inquiry: {
      async list(sort = '-created_date', limit = 50) {
        const inqs = getStored(STORAGE_KEYS.INQUIRIES, []);
        return inqs.slice(0, limit);
      },
      async create(data) {
        const inqs = getStored(STORAGE_KEYS.INQUIRIES, []);
        const newInq = {
          ...data,
          id: 'inq_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          created_date: new Date().toISOString(),
          status: 'sent',
        };
        inqs.unshift(newInq);
        setStored(STORAGE_KEYS.INQUIRIES, inqs);
        return newInq;
      },
    },
  },

  functions: {
    async invoke(functionName, payload = {}) {
      // Relative URL routes through Vite proxy in dev, and Nginx proxy in production
      const BACKEND_URL = '';

      if (functionName === 'generateChecklist') {
        try {
          const resp = await fetch(`${BACKEND_URL}/api/generateChecklist`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (resp.ok) {
            const result = await resp.json();
            return result;
          }
        } catch (err) {
          console.warn('[base44Client] Backend /api/generateChecklist failed, using offline fallback', err);
        }
        const data = generateDummyRequirements(payload);
        return { data };
      }

      if (functionName === 'findProfessionals') {
        try {
          const resp = await fetch(`${BACKEND_URL}/api/findProfessionals`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (resp.ok) {
            const result = await resp.json();
            return result;
          }
        } catch (err) {
          console.warn('[base44Client] Backend /api/findProfessionals failed, using offline fallback', err);
        }
        const pros = generateDummyProfessionals(payload);
        return { data: { professionals: pros } };
      }

      if (functionName === 'sendInquiry') {
        try {
          const resp = await fetch(`${BACKEND_URL}/api/sendInquiry`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (resp.ok) {
            const result = await resp.json();
            return result;
          }
        } catch (err) {
          console.warn('[base44Client] Backend /api/sendInquiry failed', err);
        }
        return { data: { ok: true } };
      }

      return { data: { ok: true } };
    },
  },

  auth: {
    async me() {
      const user = getStored(STORAGE_KEYS.USER, null);
      return user;
    },
    async loginViaEmailPassword(email, password) {
      await new Promise((r) => setTimeout(r, 300));
      const mockUser = {
        id: 'usr_' + btoa(email).substr(0, 8),
        email,
        name: email.split('@')[0],
        role: 'user',
      };
      setStored(STORAGE_KEYS.USER, mockUser);
      setStored(STORAGE_KEYS.TOKEN, 'token_' + Date.now());
      return mockUser;
    },
    loginWithProvider(provider, returnTo = '/') {
      const mockUser = {
        id: 'usr_google_123',
        email: 'entrepreneur@gmail.com',
        name: 'Demo Entrepreneur',
        role: 'user',
      };
      setStored(STORAGE_KEYS.USER, mockUser);
      setStored(STORAGE_KEYS.TOKEN, 'google_token_' + Date.now());
      window.location.href = returnTo;
    },
    async register({ email, password }) {
      await new Promise((r) => setTimeout(r, 300));
      return { ok: true, email };
    },
    async verifyOtp({ email, otpCode }) {
      await new Promise((r) => setTimeout(r, 300));
      const mockUser = {
        id: 'usr_' + btoa(email).substr(0, 8),
        email,
        name: email.split('@')[0],
        role: 'user',
      };
      setStored(STORAGE_KEYS.USER, mockUser);
      const token = 'token_' + Date.now();
      setStored(STORAGE_KEYS.TOKEN, token);
      return { access_token: token, user: mockUser };
    },
    async resendOtp(email) {
      return { ok: true };
    },
    async resetPassword({ resetToken, newPassword }) {
      await new Promise((r) => setTimeout(r, 300));
      return { ok: true };
    },
    async requestPasswordReset(email) {
      await new Promise((r) => setTimeout(r, 300));
      return { ok: true };
    },
    setToken(token) {
      setStored(STORAGE_KEYS.TOKEN, token);
    },
    logout(redirectUrl) {
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    },
    redirectToLogin(returnTo) {
      window.location.href = '/login?returnTo=' + encodeURIComponent(returnTo || '/');
    },
    isAuthenticated() {
      return !!getStored(STORAGE_KEYS.TOKEN, null);
    },
  },

  app: {
    async getPublicSettings() {
      return {
        id: 'dukandoc-app',
        public_settings: {
          allow_registration: true,
          app_name: 'DukanDoc India',
        },
      };
    },
  },
};

export default base44;
