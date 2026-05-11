import express from 'express';
import { authenticateToken } from './auth.js';

const router = express.Router();

// GET /api/schemes?country=IN&category=crop_insurance&state=MH
router.get('/', authenticateToken, (req, res) => {
  const { country = 'IN', category, state } = req.query;
  let schemes = country === 'IN' ? INDIA_SCHEMES : US_SCHEMES;

  if (category) schemes = schemes.filter(s => s.category === category);
  if (state) schemes = schemes.filter(s => !s.states || s.states.includes('ALL') || s.states.includes(state.toUpperCase()));

  res.json({ schemes, country, total: schemes.length });
});

// GET /api/schemes/:schemeId
router.get('/:schemeId', authenticateToken, (req, res) => {
  const scheme = [...INDIA_SCHEMES, ...US_SCHEMES].find(s => s.id === req.params.schemeId);
  if (!scheme) return res.status(404).json({ error: 'Scheme not found' });
  res.json({ scheme });
});

// POST /api/schemes/check-eligibility
router.post('/check-eligibility', authenticateToken, (req, res) => {
  const { country = 'IN', farmSizeAcres, landOwnership, state, crops = [] } = req.body;
  const schemes = country === 'IN' ? INDIA_SCHEMES : US_SCHEMES;

  const eligible = schemes.filter(scheme => {
    const e = scheme.eligibility;
    if (!e) return true;
    if (e.landOwnership && landOwnership && !e.landOwnership.includes(landOwnership)) return false;
    if (e.maxAcres && farmSizeAcres > e.maxAcres) return false;
    if (e.states && state && !e.states.includes('ALL') && !e.states.includes(state.toUpperCase())) return false;
    return true;
  });

  res.json({ eligible, total: eligible.length });
});

// ─── India Schemes ────────────────────────────────────────────────────────────
const INDIA_SCHEMES = [
  {
    id: 'pm-kisan',
    name: 'PM-KISAN',
    fullName: 'प्रधानमंत्री किसान सम्मान निधि',
    fullNameEn: 'PM Kisan Samman Nidhi',
    category: 'income_support',
    benefit: '₹6,000/year (3 installments of ₹2,000)',
    benefitAmount: 6000,
    currency: 'INR',
    description: 'Direct income support of ₹6,000 per year deposited directly into bank accounts of small and marginal farmer families.',
    howToApply: 'Visit pmkisan.gov.in or your nearest Common Service Centre (CSC) / Gram Panchayat office.',
    documents: ['Aadhaar card', 'Land records (Khasra/Khatauni)', 'Bank account with IFSC', 'Mobile number linked to Aadhaar'],
    eligibility: { maxAcres: 5, landOwnership: ['owner'], states: ['ALL'] },
    applyUrl: 'https://pmkisan.gov.in',
    states: ['ALL'],
    tags: ['income', 'direct benefit', 'small farmers', 'marginal farmers'],
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    frequency: 'Every 4 months',
    icon: 'cash',
  },
  {
    id: 'pmfby',
    name: 'PMFBY',
    fullName: 'प्रधानमंत्री फसल बीमा योजना',
    fullNameEn: 'Pradhan Mantri Fasal Bima Yojana',
    category: 'crop_insurance',
    benefit: 'Crop insurance: 2% premium for Kharif, 1.5% for Rabi, 5% for commercial crops',
    description: 'Financial support to farmers suffering crop loss/damage due to unforeseen events — floods, drought, pest attacks, natural calamities.',
    howToApply: 'Apply through your bank, insurance company branch, or at pmfby.gov.in before the cutoff date for each season.',
    documents: ['Land records', 'Aadhaar card', 'Bank account', 'Sowing certificate from Patwari'],
    eligibility: { states: ['ALL'] },
    applyUrl: 'https://pmfby.gov.in',
    states: ['ALL'],
    tags: ['insurance', 'crop protection', 'natural disaster', 'Kharif', 'Rabi'],
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    frequency: 'Per season',
    icon: 'shield-checkmark',
  },
  {
    id: 'kcc',
    name: 'Kisan Credit Card',
    fullName: 'किसान क्रेडिट कार्ड',
    fullNameEn: 'Kisan Credit Card',
    category: 'credit',
    benefit: 'Credit up to ₹3 lakh at 4% interest (3% interest subvention from govt)',
    benefitAmount: 300000,
    currency: 'INR',
    description: 'Provides short-term credit for cultivation expenses, post-harvest needs, maintenance of farm assets, and allied activities.',
    howToApply: 'Apply at any bank branch. Fill KCC application form with land and income details.',
    documents: ['Land records', 'Identity proof (Aadhaar/Voter ID)', 'Address proof', 'Passport-size photos', 'Income proof'],
    eligibility: { states: ['ALL'] },
    tags: ['credit', 'loan', 'working capital', 'interest subsidy'],
    ministry: 'Ministry of Finance / NABARD',
    frequency: 'Renewable annually',
    icon: 'card',
  },
  {
    id: 'soil-health-card',
    name: 'Soil Health Card',
    fullName: 'मृदा स्वास्थ्य कार्ड योजना',
    fullNameEn: 'Soil Health Card Scheme',
    category: 'soil_health',
    benefit: 'Free soil testing + crop-wise fertilizer recommendation card',
    description: 'Government issues Soil Health Cards with soil nutrient status and recommended dosage of fertilizers to help improve soil productivity.',
    howToApply: 'Contact your local Krishi Vigyan Kendra (KVK), Agriculture Department office, or register at soilhealth.dac.gov.in.',
    documents: ['Aadhaar card', 'Land details (survey number)'],
    eligibility: { states: ['ALL'] },
    applyUrl: 'https://soilhealth.dac.gov.in',
    states: ['ALL'],
    tags: ['soil', 'testing', 'fertilizer', 'free'],
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    frequency: 'Every 2 years',
    icon: 'flask',
  },
  {
    id: 'e-nam',
    name: 'e-NAM',
    fullName: 'राष्ट्रीय कृषि बाजार',
    fullNameEn: 'National Agriculture Market',
    category: 'market_access',
    benefit: 'Sell produce online to buyers across India — better price discovery',
    description: 'Pan-India electronic trading portal connecting APMC mandis. Farmers can list produce and get bids from buyers across the country.',
    howToApply: 'Register at enam.gov.in with bank details, Aadhaar, and mobile number.',
    documents: ['Aadhaar card', 'Bank account details', 'Mobile number'],
    eligibility: { states: ['ALL'] },
    applyUrl: 'https://enam.gov.in',
    states: ['ALL'],
    tags: ['market', 'trading', 'online', 'price discovery'],
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    icon: 'storefront',
  },
  {
    id: 'pm-kusum',
    name: 'PM-KUSUM',
    fullName: 'पीएम किसान ऊर्जा सुरक्षा उत्थान महाअभियान',
    fullNameEn: 'PM Kisan Urja Suraksha evam Utthan Mahabhiyan',
    category: 'solar_energy',
    benefit: '60% subsidy on solar irrigation pumps (30% central + 30% state)',
    description: 'Scheme to install solar-powered agriculture pumps and help farmers earn extra income by selling surplus solar power to DISCOM.',
    howToApply: 'Apply through State Nodal Agency (SNA) or MNRE portal. Contact State Renewable Energy Development Agency.',
    documents: ['Land records', 'Aadhaar card', 'Bank account', 'Electricity connection details'],
    eligibility: { states: ['ALL'] },
    tags: ['solar', 'irrigation', 'energy', 'subsidy'],
    ministry: 'Ministry of New and Renewable Energy',
    icon: 'sunny',
  },
  {
    id: 'pkvy',
    name: 'PKVY',
    fullName: 'परम्परागत कृषि विकास योजना',
    fullNameEn: 'Paramparagat Krishi Vikas Yojana',
    category: 'organic',
    benefit: '₹50,000/hectare over 3 years for organic farming transition',
    benefitAmount: 50000,
    currency: 'INR',
    description: 'Promotes organic farming through cluster approach. Helps farmer groups adopt organic practices and get certification.',
    howToApply: 'Form a cluster of 50 farmers (minimum 50 acres) and apply through State Agriculture Department.',
    documents: ['Group formation documents', 'Land records', 'Aadhaar cards of all members'],
    eligibility: { states: ['ALL'] },
    tags: ['organic', 'certification', 'cluster', 'sustainable'],
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    icon: 'leaf',
  },
  {
    id: 'agri-infra-fund',
    name: 'Agriculture Infrastructure Fund',
    fullName: 'कृषि अवसंरचना कोष',
    fullNameEn: 'Agriculture Infrastructure Fund',
    category: 'infrastructure',
    benefit: '3% interest subvention on loans up to ₹2 crore for agri infrastructure',
    benefitAmount: 20000000,
    currency: 'INR',
    description: 'Medium to long-term debt financing for post-harvest management infrastructure and community farming assets like cold storage, warehouses, processing units.',
    howToApply: 'Apply through agriinfra.dac.gov.in via banks, cooperative societies, or FPOs.',
    documents: ['Project proposal', 'Financial statements', 'Land documents', 'Registration proof'],
    eligibility: { states: ['ALL'] },
    applyUrl: 'https://agriinfra.dac.gov.in',
    tags: ['infrastructure', 'cold storage', 'warehouse', 'FPO'],
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    icon: 'business',
  },
];

// ─── US Schemes ───────────────────────────────────────────────────────────────
const US_SCHEMES = [
  {
    id: 'usda-fsa-direct-loans',
    name: 'USDA FSA Direct Farm Loans',
    category: 'credit',
    benefit: 'Low-interest loans up to $600,000 for farm ownership and operations',
    benefitAmount: 600000,
    currency: 'USD',
    description: 'USDA Farm Service Agency provides direct loans to farmers who cannot qualify for commercial credit — including beginning and minority farmers.',
    howToApply: 'Apply online at farmers.gov or visit your local USDA Service Center.',
    documents: ['3 years tax returns', 'Financial statements', 'Farm operation plan', 'Credit history'],
    eligibility: { states: ['ALL'] },
    applyUrl: 'https://www.farmers.gov/loans',
    tags: ['loan', 'credit', 'USDA', 'FSA', 'beginning farmer'],
    ministry: 'USDA Farm Service Agency',
    icon: 'cash',
  },
  {
    id: 'arc-plc',
    name: 'ARC / PLC Program',
    fullName: 'Agriculture Risk Coverage / Price Loss Coverage',
    category: 'income_support',
    benefit: 'Safety-net payments when revenues or commodity prices fall below benchmarks',
    description: 'Provides financial protection for commodity producers when market prices or revenues fall below historical guaranteed levels.',
    howToApply: 'Sign up at your local FSA office. Annual enrollment period each fall.',
    documents: ['Farm records', 'FSA farm number', 'Crop history (5 years)'],
    eligibility: { states: ['ALL'] },
    applyUrl: 'https://www.fsa.usda.gov/programs-and-services/arcplc_program/',
    tags: ['commodity', 'revenue protection', 'safety net', 'corn', 'soybeans', 'wheat'],
    ministry: 'USDA Farm Service Agency',
    icon: 'shield-checkmark',
  },
  {
    id: 'usda-crop-insurance',
    name: 'Federal Crop Insurance',
    category: 'crop_insurance',
    benefit: 'Subsidized crop insurance — govt pays 60%+ of premiums on average',
    description: 'USDA Risk Management Agency offers subsidized crop insurance through private companies covering yield losses, revenue losses, and whole farm revenue.',
    howToApply: 'Contact an approved crop insurance agent. Find agents at rma.usda.gov. Sign up before the sales closing date.',
    documents: ['Farm records', 'Production history (APH)', 'Acreage reports'],
    eligibility: { states: ['ALL'] },
    applyUrl: 'https://www.rma.usda.gov',
    tags: ['insurance', 'crop protection', 'RMA', 'yield', 'revenue'],
    ministry: 'USDA Risk Management Agency',
    icon: 'umbrella',
  },
  {
    id: 'eqip',
    name: 'EQIP',
    fullName: 'Environmental Quality Incentives Program',
    category: 'conservation',
    benefit: 'Up to $450,000 over 6 years for conservation practice implementation',
    benefitAmount: 450000,
    currency: 'USD',
    description: 'Financial and technical assistance to implement conservation practices addressing soil health, water quality, air quality, and wildlife habitat.',
    howToApply: 'Apply at local USDA NRCS office. Applications accepted year-round with periodic ranking and funding decisions.',
    documents: ['Farm plan', 'Conservation needs assessment', 'Ownership/operator documentation'],
    eligibility: { states: ['ALL'] },
    applyUrl: 'https://www.nrcs.usda.gov/programs-initiatives/eqip-environmental-quality-incentives',
    tags: ['conservation', 'environment', 'NRCS', 'soil health', 'water quality'],
    ministry: 'USDA Natural Resources Conservation Service',
    icon: 'leaf',
  },
  {
    id: 'beginning-farmer-loan',
    name: 'Beginning Farmer & Rancher Loans',
    category: 'credit',
    benefit: 'Reduced interest rates + relaxed requirements for first 10 years of farming',
    description: 'Special loan programs for farmers and ranchers who have operated for 10 years or less, with lower down payments and preference in funding.',
    howToApply: 'Apply at local FSA office with a 3-year farm plan.',
    documents: ['3-year farm business plan', 'Credit history', 'Financial projections', 'Training records'],
    eligibility: { states: ['ALL'] },
    applyUrl: 'https://www.farmers.gov/loans/beginning-farmers',
    tags: ['new farmer', 'loan', 'beginning', 'rancher'],
    ministry: 'USDA Farm Service Agency',
    icon: 'sprout',
  },
  {
    id: 'organic-cost-share',
    name: 'Organic Certification Cost Share',
    category: 'organic',
    benefit: '75% reimbursement (max $750/scope) for organic certification costs',
    benefitAmount: 750,
    currency: 'USD',
    description: 'Helps certified organic producers and handlers offset the cost of USDA organic certification. Covers application fees, inspection costs, and fees.',
    howToApply: 'Apply through your State Department of Agriculture after receiving certification.',
    documents: ['Organic certification documents', 'Receipts for certification expenses', 'NOP certificate'],
    eligibility: { states: ['ALL'] },
    tags: ['organic', 'certification', 'cost share', 'USDA organic'],
    ministry: 'USDA Agricultural Marketing Service',
    icon: 'ribbon',
  },
  {
    id: 'reap',
    name: 'REAP',
    fullName: 'Rural Energy for America Program',
    category: 'solar_energy',
    benefit: 'Grants up to 50% + loans for renewable energy systems on farm operations',
    description: 'Provides guaranteed loan financing and grant funding to agricultural producers to purchase and install renewable energy systems including solar, wind, and geothermal.',
    howToApply: 'Apply through USDA Rural Development office. Applications accepted year-round.',
    documents: ['Energy audit', 'Project cost estimates', 'Financial statements', 'Business plan'],
    eligibility: { states: ['ALL'] },
    applyUrl: 'https://www.rd.usda.gov/programs-services/energy-programs/rural-energy-america-program-renewable-energy-systems-energy-efficiency-improvement-guaranteed-loans',
    tags: ['solar', 'renewable energy', 'grant', 'loan', 'USDA Rural Development'],
    ministry: 'USDA Rural Development',
    icon: 'sunny',
  },
];

export default router;
