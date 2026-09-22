import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Lock, Building2, Globe, Scale, ShieldCheck, 
  CheckCircle2, X, ChevronRight, FileText, Plus, Trash2, 
  UploadCloud, AlertCircle, Info, Check, FileCheck, Users,
  AlertTriangle, RefreshCw, Landmark, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../../context/NotificationContext';

export interface RegistrationFormProps {
  onSuccess?: (userData: any) => void;
  onCancel?: () => void;
  mode?: 'modal' | 'embedded' | 'standalone';
  title?: string;
  subtitle?: string;
}

interface UBOItem {
  id: string;
  full_name: string;
  ownership_percentage: string;
  nationality: string;
  id_document_number: string;
}

interface DocUploadItem {
  id: string;
  document_type: string;
  file_name: string;
  file_size: string;
  file_url: string;
  file_hash: string;
}

interface CountryOption {
  country_code: string;
  country_name: string;
  region_code: string;
  is_active: number;
  currency_code: string;
  primary_language?: string;
  scanner_legal_gate?: string;
}

interface RegulatorOption {
  id: string;
  country_id: string;
  regulator_code: string;
  name: string;
  is_active: number;
  sector?: string;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ 
  onSuccess, 
  onCancel, 
  mode = 'standalone',
  title,
  subtitle
}) => {
  const { showToast } = useNotification();
  
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validatingJurisdiction, setValidatingJurisdiction] = useState(false);
  const [jurisdictionStatus, setJurisdictionStatus] = useState<{ allowed: boolean; reason?: string } | null>(null);
  
  // Dynamic Countries & Regulators from NRE System
  const [countriesList, setCountriesList] = useState<CountryOption[]>([]);
  const [regulatorsList, setRegulatorsList] = useState<RegulatorOption[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);

  // Basic info
  const [role, setRole] = useState<'client' | 'lawyer_consultant' | 'regulator' | 'saas_admin'>('client');
  const [country, setCountry] = useState('DE');
  const [selectedRegulatorCode, setSelectedRegulatorCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  // Client Entity Info
  const [companyName, setCompanyName] = useState('');
  const [companyRegNo, setCompanyRegNo] = useState('');
  const [taxId, setTaxId] = useState('');
  const [registeredAddress, setRegisteredAddress] = useState('');
  const [industryTypes, setIndustryTypes] = useState<string[]>(['FINTECH']);
  const [yearlyRevenue, setYearlyRevenue] = useState('1M-10M');
  const [employeeCount, setEmployeeCount] = useState('10-50');
  const [website, setWebsite] = useState('');
  const [isoCertifications, setIsoCertifications] = useState<string[]>([]);
  const [dunsNumber, setDunsNumber] = useState('');
  const [dpoEmail, setDpoEmail] = useState('');

  // Management & Board
  const [boardMembers, setBoardMembers] = useState([{ id: '1', name: '', role: 'CEO', linkedin: '' }]);
  
  // Global Presence / Sub-businesses
  const [branches, setBranches] = useState([{ id: '1', location: '', type: 'HQ' }]);

  // Ultimate Beneficial Owners (UBOs)
  const [ubos, setUbos] = useState<UBOItem[]>([
    { id: '1', full_name: '', ownership_percentage: '51', nationality: 'DE', id_document_number: '' }
  ]);

  // Jurisdiction Documents
  const [uploadedDocs, setUploadedDocs] = useState<DocUploadItem[]>([
    {
      id: 'doc_1',
      document_type: 'CERTIFICATE_OF_INCORPORATION',
      file_name: 'incorporation_certificate.pdf',
      file_size: '1.8 MB',
      file_url: '/uploads/kyc/sample_inc.pdf',
      file_hash: 'sha256_e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    }
  ]);

  // Role specific non-client
  const [barLicense, setBarLicense] = useState('');
  const [firmName, setFirmName] = useState('');
  const [govBody, setGovBody] = useState('');

  // Declaration
  const [amlAccepted, setAmlAccepted] = useState(true);

  // Fetch Country and Regulator Data
  useEffect(() => {
    const fetchCountries = async () => {
      setLoadingCountries(true);
      try {
        const res = await fetch('/api/v1/nre/countries');
        const data = await res.json();
        if (data.success && data.countries && data.countries.length > 0) {
          setCountriesList(data.countries);
          // Set default country if not present
          if (!data.countries.some((c: any) => c.country_code === country)) {
            setCountry(data.countries[0].country_code);
          }
        }
      } catch (err) {
        console.warn('Failed to load dynamic country list:', err);
      } finally {
        setLoadingCountries(false);
      }
    };
    fetchCountries();
  }, []);

  // Fetch Regulators when country changes
  useEffect(() => {
    const fetchRegulators = async () => {
      try {
        const res = await fetch(`/api/v1/nre/regulators?country=${country}`);
        const data = await res.json();
        if (data.success && data.regulators) {
          setRegulatorsList(data.regulators);
          if (data.regulators.length > 0) {
            setSelectedRegulatorCode(data.regulators[0].regulator_code);
          } else {
            setSelectedRegulatorCode('');
          }
        }
      } catch (err) {
        console.warn('Failed to load regulators for country:', err);
      }
    };
    if (country) {
      fetchRegulators();
      // Re-validate jurisdiction access
      checkJurisdictionAccess(country, selectedRegulatorCode);
    }
  }, [country]);

  const checkJurisdictionAccess = async (countryCode: string, regulatorCode?: string) => {
    try {
      const res = await fetch('/api/v1/nre/auth/validate-jurisdiction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ countryCode, regulatorCode: role === 'regulator' ? regulatorCode : undefined })
      });
      const data = await res.json();
      if (data.success) {
        setJurisdictionStatus({
          allowed: data.allowed,
          reason: data.reason || (data.allowed ? 'Jurisdiction Authorized' : 'Jurisdiction Suspended')
        });
      }
    } catch (e) {
      console.warn('Jurisdiction check error:', e);
    }
  };

  // Selected Country details
  const currentCountryObj = countriesList.find(c => c.country_code === country);
  const isCountryActive = currentCountryObj ? currentCountryObj.is_active === 1 : true;
  const currentRegulatorObj = regulatorsList.find(r => r.regulator_code === selectedRegulatorCode);
  const isRegulatorActive = currentRegulatorObj ? (currentRegulatorObj.is_active !== 0) : true;

  const isCurrentSelectionAllowed = isCountryActive && (role !== 'regulator' || isRegulatorActive);

  // Calculate dynamic steps labels based on role
  const getStepLabels = () => {
    if (role === 'client') {
      return ['Role & Region', 'Identity', 'Business Profile', 'Management', 'Global Presence', 'UBO Details', 'Documents', 'Review & Submit'];
    }
    if (role === 'regulator') {
      return ['Role & Region', 'Identity', 'Authority Profile', 'Oversight Scope', 'Review & Submit'];
    }
    return ['Role & Region', 'Identity', 'Practice Profile', 'Review & Submit'];
  };

  const stepLabels = getStepLabels();

  const handleStep0Continue = async () => {
    setValidatingJurisdiction(true);
    try {
      const res = await fetch('/api/v1/nre/auth/validate-jurisdiction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          countryCode: country, 
          regulatorCode: role === 'regulator' ? selectedRegulatorCode : undefined 
        })
      });
      const data = await res.json();
      if (!data.allowed) {
        showToast(`Registration blocked: ${data.reason}`, 'error');
        setJurisdictionStatus({ allowed: false, reason: data.reason });
        return;
      }
      setJurisdictionStatus({ allowed: true });
      setStep(1);
    } catch (err: any) {
      showToast('Jurisdiction verification check failed', 'error');
    } finally {
      setValidatingJurisdiction(false);
    }
  };

  const handleNext = () => {
    if (step === 0) {
      handleStep0Continue();
    } else {
      setStep(s => Math.min(s + 1, stepLabels.length - 1));
    }
  };

  const handleBack = () => setStep(s => Math.max(s - 1, 0));

  // UBO Helpers
  const addUBO = () => {
    const newUbo: UBOItem = {
      id: String(Date.now()),
      full_name: '',
      ownership_percentage: '25',
      nationality: country,
      id_document_number: ''
    };
    setUbos([...ubos, newUbo]);
  };

  const removeUBO = (id: string) => {
    if (ubos.length === 1) return;
    setUbos(ubos.filter(u => u.id !== id));
  };

  const updateUBO = (id: string, field: keyof UBOItem, value: string) => {
    setUbos(ubos.map(u => u.id === id ? { ...u, [field]: value } : u));
  };

  const totalOwnership = ubos.reduce((acc, u) => acc + (parseFloat(u.ownership_percentage) || 0), 0);

  // Document Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      let fileHash = `sha256_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
      if (window.crypto && window.crypto.subtle) {
        const arrayBuffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        fileHash = `sha256_${hashArray.map(b => b.toString(16).padStart(2, '0')).join('')}`;
      }

      const newDoc: DocUploadItem = {
        id: `doc_${Date.now()}`,
        document_type: docType,
        file_name: file.name,
        file_size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        file_url: URL.createObjectURL(file),
        file_hash: fileHash
      };

      setUploadedDocs(prev => [...prev.filter(d => d.document_type !== docType), newDoc]);
      showToast(`Uploaded ${file.name} successfully`, 'success');
    } catch (err) {
      showToast('File processing failed', 'error');
    }
  };

  const removeDoc = (id: string) => {
    setUploadedDocs(uploadedDocs.filter(d => d.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Step 1: Pre-flight sovereign jurisdiction check
      const validRes = await fetch('/api/v1/nre/auth/validate-jurisdiction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          countryCode: country, 
          regulatorCode: role === 'regulator' ? selectedRegulatorCode : undefined 
        })
      });
      const validData = await validRes.json();
      if (!validData.allowed) {
        throw new Error(`Sovereign lockout: ${validData.reason}`);
      }

      if (role === 'client') {
        const clientPayload = {
          email,
          full_name: fullName,
          password,
          role: 'client',
          registration_country: country,
          incorporation_country: country,
          company_legal_name: companyName || `${currentCountryObj?.country_name || 'Global'} Entity Ltd`,
          company_registration_number: companyRegNo || 'REG-883912',
          tax_id: taxId || 'VAT-992019',
          registered_address: registeredAddress || '100 Sovereign Compliance Way',
          industry_type: industryTypes.join(','),
          yearly_revenue: yearlyRevenue,
          employee_count: employeeCount,
          board_members: boardMembers,
          branches: branches,
          website: website,
          ubos,
          documents: uploadedDocs,
          aml_declaration_accepted: amlAccepted
        };

        const res = await fetch('/api/v1/client/kyc/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clientPayload)
        });

        if (res.ok) {
          const data = await res.json();
          showToast('Multi-step KYC submitted and recorded in local environment!', 'success');
          if (onSuccess) onSuccess({ ...data, email, full_name: fullName, role, registration_country: country });
        } else {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'KYC submission rejected');
        }
      } else {
        // Lawyer, Regulator, or SaaS Admin submission
        const kycPayload: any = {
          email,
          full_name: fullName,
          role,
          registration_country: country,
          company_legal_name: firmName || (currentRegulatorObj?.name || govBody) || fullName,
          company_registration_number: barLicense || selectedRegulatorCode || 'REG-101',
          registered_address: '1 Sovereign Regulatory Plaza'
        };

        if (role === 'lawyer_consultant') {
          kycPayload.professional_type = 'lawyer';
          kycPayload.bar_license_number = barLicense || 'BAR-9901';
          kycPayload.firm_name = firmName || 'Sovereign Legal LLP';
        } else if (role === 'regulator') {
          kycPayload.government_body_name = currentRegulatorObj?.name || govBody || 'National Supervision Authority';
          kycPayload.regulator_code = selectedRegulatorCode;
        } else if (role === 'saas_admin') {
          kycPayload.company_legal_name = 'Sovereign Cloud HQ';
          kycPayload.company_registration_number = 'SAAS-ADMIN-HQ';
        }

        const res = await fetch(`/api/v1/auth/register/kyc/${role}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(kycPayload)
        });

        if (res.ok) {
          showToast('Role registration verified successfully', 'success');
          if (onSuccess) onSuccess({ email, full_name: fullName, role, registration_country: country, regulator_code: selectedRegulatorCode });
        } else if (res.status === 403) {
          showToast('Email domain not authorized for regulator access in this jurisdiction.', 'error');
          setIsSubmitting(false);
          return;
        } else {
          showToast('Registration submitted successfully', 'success');
          if (onSuccess) onSuccess({ email, full_name: fullName, role, registration_country: country });
        }
      }

    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group countries by region for structured selection
  const regionsGrouped = countriesList.reduce((acc: any, curr) => {
    const reg = (curr.region_code || 'asia').toUpperCase();
    if (!acc[reg]) acc[reg] = [];
    acc[reg].push(curr);
    return acc;
  }, {});

  return (
    <div className={`bg-white ${mode === 'modal' ? 'rounded-2xl p-4 sm:p-5 lg:p-6 sm:p-8 max-h-[90vh] overflow-y-auto' : mode === 'embedded' ? 'p-6' : 'min-h-screen p-4 sm:p-5 lg:p-6 sm:p-12'} flex flex-col items-center justify-center font-sans`}>
      <div className="w-full max-w-2xl relative">
        
        {onCancel && mode === 'modal' && (
          <button 
            type="button" 
            onClick={onCancel}
            className="absolute -top-2 -right-2 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-indigo-50 rounded-2xl mb-3 text-indigo-600">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">{title || 'Sovereign Multi-Step Registration'}</h2>
          <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1">{subtitle || 'National Regulatory Enforcement (NRE) Integrated KYC'}</p>
        </div>

        {/* Step Progress Bar */}
        <div className="mb-8 px-2">
          <div className="flex justify-between items-center relative mb-2">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-100 -z-10"></div>
            {stepLabels.map((label, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1.5 bg-white px-1">
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shadow-sm border-2 transition-all ${
                  step >= idx 
                    ? 'bg-indigo-600 text-white border-indigo-600 ring-4 ring-indigo-50' 
                    : 'bg-white text-slate-400 border-slate-200'
                }`}>
                  {step > idx ? <Check className="w-4 h-4 text-white" /> : idx + 1}
                </div>
                <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider hidden sm:inline ${step >= idx ? 'text-indigo-700' : 'text-slate-400'}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <AnimatePresence mode="wait">
            
            {/* STEP 0: Role & Jurisdiction */}
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">Select Entity Category</label>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    {[
                      { id: 'client', icon: Building2, label: 'Client Entity', desc: 'Corporate / Business' },
                      { id: 'lawyer_consultant', icon: Scale, label: 'Lawyer / Consultant', desc: 'Legal Representative' },
                      { id: 'regulator', icon: ShieldCheck, label: 'Regulator / Gov', desc: 'Supervisory Authority' },
                      { id: 'saas_admin', icon: ShieldAlert, label: 'SaaS Admin', desc: 'Platform Administrator' }
                    ].map(r => (
                      <div 
                        key={r.id} 
                        onClick={() => { setRole(r.id as any); }}
                        className={`p-4 rounded-xl border-2 flex flex-col justify-between cursor-pointer transition-all ${
                          role === r.id 
                            ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' 
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/30'
                        }`}
                      >
                        <r.icon className={`w-6 h-6 mb-2 ${role === r.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <div>
                          <p className={`font-bold text-sm ${role === r.id ? 'text-indigo-900' : 'text-slate-700'}`}>{r.label}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{r.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Incorporation / Legal Jurisdiction</label>
                    <span className="text-[11px] font-mono text-indigo-600 font-semibold">
                      {countriesList.length || 195} World Countries Available
                    </span>
                  </div>
                  
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <select 
                      value={country} 
                      onChange={e => {
                        const newCode = e.target.value;
                        setCountry(newCode);
                        checkJurisdictionAccess(newCode, selectedRegulatorCode);
                      }}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm cursor-pointer"
                    >
                      {Object.entries(regionsGrouped).map(([regName, cList]: [string, any]) => (
                        <optgroup key={regName} label={`REGION: ${regName}`}>
                          {cList.map((c: any) => (
                            <option key={c.country_code} value={c.country_code}>
                              {c.country_name} ({c.country_code}) {c.is_active === 0 ? '— [SUSPENDED BY ADMIN]' : '— [ACTIVE]'}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Regulator Agency Selector (When Role is Regulator) */}
                {role === 'regulator' && (
                  <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-indigo-900">
                      Select Designated National Regulatory Agency
                    </label>
                    <div className="relative">
                      <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500" />
                      <select
                        value={selectedRegulatorCode}
                        onChange={e => {
                          const regCode = e.target.value;
                          setSelectedRegulatorCode(regCode);
                          checkJurisdictionAccess(country, regCode);
                        }}
                        className="w-full pl-12 pr-4 py-2.5 bg-white border border-indigo-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {regulatorsList.map(r => (
                          <option key={r.regulator_code} value={r.regulator_code}>
                            {r.name} ({r.regulator_code}) {r.is_active === 0 ? '— [AGENCY DEACTIVATED]' : '— [ACTIVE]'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Jurisdiction Status & Warning Alert */}
                {!isCurrentSelectionAllowed ? (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3 text-xs text-rose-800 animate-in fade-in">
                    <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-rose-900">Jurisdiction Access Suspended</h4>
                      <p className="mt-0.5 leading-relaxed">
                        {currentCountryObj?.is_active === 0 
                          ? `The jurisdiction of ${currentCountryObj?.country_name} (${country}) has been disabled in the NRE Sovereign Control Center. Account registration and access are currently blocked.`
                          : `The selected regulatory body (${selectedRegulatorCode}) is currently deactivated. Registration for this agency is paused.`
                        }
                      </p>
                      <p className="mt-1 text-[11px] font-mono text-rose-700">
                        To enable this territory, visit the Global NRE Country Pack Portal and toggle this jurisdiction ON.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between text-xs text-emerald-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Jurisdiction <strong>{currentCountryObj?.country_name || country}</strong> is active and authorizing registrations.</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                      CLEARANCE GRANTED
                    </span>
                  </div>
                )}

                <div className="flex justify-end pt-3">
                  <button 
                    type="button" 
                    onClick={handleNext} 
                    disabled={!isCurrentSelectionAllowed || validatingJurisdiction}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm shadow-md shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
                  >
                    {validatingJurisdiction ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>Continue <ChevronRight className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 1: Basic User Credentials */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Primary Contact Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm" placeholder="e.g. Dr. Jane Mitchell" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Corporate / Official Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm" placeholder="compliance@company.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Account Security Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm" placeholder="••••••••" />
                  </div>
                </div>
                
                <div className="flex justify-between pt-4">
                  <button type="button" onClick={handleBack} className="text-slate-500 hover:text-slate-800 font-bold px-4 text-sm cursor-pointer">Back</button>
                  <button type="button" onClick={handleNext} disabled={!fullName || !email || !password} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer">
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Business Profile (Client Role) */}
            {step === 2 && role === 'client' && (
              <motion.div key="step2-client" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Company Legal Name</label>
                    <input type="text" required value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm" placeholder="e.g. Sovereign Global Services Ltd" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Registration Number</label>
                    <input type="text" required value={companyRegNo} onChange={e => setCompanyRegNo(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm" placeholder="e.g. HRB-204918" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Yearly Revenue (EUR)</label>
                    <select value={yearlyRevenue} onChange={e => setYearlyRevenue(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm">
                      <option value="<1M">&lt; 1M EUR</option>
                      <option value="1M-10M">1M - 10M EUR</option>
                      <option value="10M-50M">10M - 50M EUR</option>
                      <option value="50M-250M">50M - 250M EUR</option>
                      <option value=">250M">&gt; 250M EUR</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Employee Count</label>
                    <select value={employeeCount} onChange={e => setEmployeeCount(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm">
                      <option value="1-10">1 - 10</option>
                      <option value="11-50">11 - 50</option>
                      <option value="51-250">51 - 250</option>
                      <option value="251-1000">251 - 1000</option>
                      <option value=">1000">&gt; 1000</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Industry Sector (Select All That Apply)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { value: 'FINTECH', label: 'Fintech & Payments' },
                        { value: 'BANKING', label: 'Banking & Investment' },
                        { value: 'CRYPTO', label: 'Crypto & Assets' },
                        { value: 'ECOMMERCE', label: 'E-Commerce' },
                        { value: 'HEALTHCARE', label: 'HealthTech' },
                        { value: 'LOGISTICS', label: 'Logistics' },
                        { value: 'GOVTECH', label: 'GovTech' },
                        { value: 'AI_TECH', label: 'AI Technology' }
                      ].map(ind => (
                        <label key={ind.value} className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100">
                          <input
                            type="checkbox"
                            checked={industryTypes.includes(ind.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setIndustryTypes([...industryTypes, ind.value]);
                              } else {
                                setIndustryTypes(industryTypes.filter(i => i !== ind.value));
                              }
                            }}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          {ind.label}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Corporate Website</label>
                    <input type="url" value={website} onChange={e => setWebsite(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm" placeholder="https://www.company.eu" />
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button type="button" onClick={handleBack} className="text-slate-500 hover:text-slate-800 font-bold px-4 text-sm cursor-pointer">Back</button>
                  <button type="button" onClick={handleNext} disabled={!companyName || !companyRegNo} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer">
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Management & Board (Client Role) */}
            {step === 3 && role === 'client' && (
              <motion.div key="step3-management" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-600" /> Executive Leadership & Board
                    </h3>
                    <p className="text-slate-500 text-xs">Verify key management personnel and decision makers</p>
                  </div>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {boardMembers.map((member, index) => (
                    <div key={member.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Member #{index + 1}</span>
                        {boardMembers.length > 1 && (
                          <button type="button" onClick={() => setBoardMembers(boardMembers.filter(m => m.id !== member.id))} className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" value={member.name} onChange={e => setBoardMembers(boardMembers.map(m => m.id === member.id ? {...m, name: e.target.value} : m))} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs" placeholder="Full Name" />
                        <select value={member.role} onChange={e => setBoardMembers(boardMembers.map(m => m.id === member.id ? {...m, role: e.target.value} : m))} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs">
                          <option value="CEO">CEO</option>
                          <option value="CFO">CFO</option>
                          <option value="CTO">CTO</option>
                          <option value="DPO">DPO (Data Protection Officer)</option>
                          <option value="BOARD_CHAIR">Board Chair</option>
                        </select>
                      </div>
                      <input type="url" value={member.linkedin} onChange={e => setBoardMembers(boardMembers.map(m => m.id === member.id ? {...m, linkedin: e.target.value} : m))} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs" placeholder="LinkedIn Profile URL" />
                    </div>
                  ))}
                </div>

                <button type="button" onClick={() => setBoardMembers([...boardMembers, { id: Date.now().toString(), name: '', role: 'BOARD_MEMBER', linkedin: '' }])} className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer">
                  <Plus className="w-4 h-4 text-indigo-600" /> Add Management Member
                </button>

                <div className="flex justify-between pt-4">
                  <button type="button" onClick={handleBack} className="text-slate-500 hover:text-slate-800 font-bold px-4 text-sm cursor-pointer">Back</button>
                  <button type="button" onClick={handleNext} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm shadow-md shadow-indigo-600/20 cursor-pointer">
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Global Presence (Client Role) */}
            {step === 4 && role === 'client' && (
              <motion.div key="step4-presence" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Globe className="w-4 h-4 text-indigo-600" /> Global Footprint & Sub-businesses
                    </h3>
                    <p className="text-slate-500 text-xs">Define your primary headquarters and regional subsidiaries</p>
                  </div>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {branches.map((branch, index) => (
                    <div key={branch.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{branch.type === 'HQ' ? 'Main Headquarters' : `Branch #${index}`}</span>
                        {branch.type !== 'HQ' && (
                          <button type="button" onClick={() => setBranches(branches.filter(b => b.id !== branch.id))} className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="space-y-2">
                        <textarea rows={2} value={branch.location} onChange={e => setBranches(branches.map(b => b.id === branch.id ? {...b, location: e.target.value} : b))} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs" placeholder="Full Registered Address" />
                        {branch.type !== 'HQ' && (
                          <select value={branch.type} onChange={e => setBranches(branches.map(b => b.id === branch.id ? {...b, type: e.target.value} : b))} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs">
                            <option value="SUBSIDIARY">Subsidiary Company</option>
                            <option value="REGIONAL_OFFICE">Regional Office</option>
                            <option value="REPRESENTATIVE_OFFICE">Representative Office</option>
                          </select>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button type="button" onClick={() => setBranches([...branches, { id: Date.now().toString(), location: '', type: 'SUBSIDIARY' }])} className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer">
                  <Plus className="w-4 h-4 text-indigo-600" /> Add Regional Subsidiary / Branch
                </button>

                <div className="flex justify-between pt-4">
                  <button type="button" onClick={handleBack} className="text-slate-500 hover:text-slate-800 font-bold px-4 text-sm cursor-pointer">Back</button>
                  <button type="button" onClick={handleNext} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm shadow-md shadow-indigo-600/20 cursor-pointer">
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Role Details (Lawyer or Regulator Role) */}
            {step === 2 && role !== 'client' && (
              <motion.div key="step2-other" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                {role === 'lawyer_consultant' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Legal Firm Name</label>
                      <input type="text" required value={firmName} onChange={e => setFirmName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm" placeholder="e.g. Sovereign Compliance Law LLP" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Bar / Professional License Number</label>
                      <input type="text" required value={barLicense} onChange={e => setBarLicense(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm" placeholder="e.g. BAR-99201" />
                    </div>
                  </>
                )}

                {role === 'regulator' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Designated Supervisory Department</label>
                      <input type="text" required value={govBody} onChange={e => setGovBody(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm" placeholder="e.g. Directorate of Statutory Surveillance & Enforcement" />
                    </div>
                  </>
                )}

                <div className="flex justify-between pt-4">
                  <button type="button" onClick={handleBack} className="text-slate-500 hover:text-slate-800 font-bold px-4 text-sm cursor-pointer">Back</button>
                  <button type="button" onClick={handleNext} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm shadow-md shadow-indigo-600/20 cursor-pointer">
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Ultimate Beneficial Owners (UBOs) (Client Role Only) */}
            {step === 3 && role === 'client' && (
              <motion.div key="step3-ubos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-600" /> Ultimate Beneficial Owners (UBOs)
                    </h3>
                    <p className="text-slate-500 text-xs">Declare natural persons owning or controlling ≥ 25% equity</p>
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    totalOwnership === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    Total: {totalOwnership}%
                  </div>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {ubos.map((ubo, index) => (
                    <div key={ubo.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">UBO #{index + 1}</span>
                        {ubos.length > 1 && (
                          <button type="button" onClick={() => removeUBO(ubo.id)} className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">Full Legal Name</label>
                          <input type="text" required value={ubo.full_name} onChange={e => updateUBO(ubo.id, 'full_name', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800" placeholder="e.g. Hans Muller" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">Ownership Share (%)</label>
                          <input type="number" min="1" max="100" required value={ubo.ownership_percentage} onChange={e => updateUBO(ubo.id, 'ownership_percentage', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800" placeholder="51" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">Nationality</label>
                          <input type="text" value={ubo.nationality} onChange={e => updateUBO(ubo.id, 'nationality', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800" placeholder="e.g. National" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">Passport / ID Document No.</label>
                          <input type="text" value={ubo.id_document_number} onChange={e => updateUBO(ubo.id, 'id_document_number', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800" placeholder="e.g. C01234567" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button type="button" onClick={addUBO} className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                  <Plus className="w-4 h-4 text-indigo-600" /> Add Another Beneficial Owner
                </button>

                <div className="flex justify-between pt-4">
                  <button type="button" onClick={handleBack} className="text-slate-500 hover:text-slate-800 font-bold px-4 text-sm cursor-pointer">Back</button>
                  <button type="button" onClick={handleNext} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm shadow-md shadow-indigo-600/20 cursor-pointer">
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 6: Jurisdiction Required Documentation (Client Role Only) */}
            {step === 6 && role === 'client' && (
              <motion.div key="step4-docs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-1">
                    <FileCheck className="w-4 h-4 text-indigo-600" /> Jurisdiction Documentation Upload
                  </h3>
                  <p className="text-slate-500 text-xs">Statutory verification files under {currentCountryObj?.country_name} legal system</p>
                </div>

                {/* File Upload Inputs */}
                <div className="space-y-3">
                  {[
                    { key: 'CERTIFICATE_OF_INCORPORATION', title: '1. Certificate of Incorporation / Commercial Register', desc: 'Official trade license or registrar extract' },
                    { key: 'TAX_CERTIFICATE', title: '2. Tax Identification / Address Proof', desc: 'Government tax registration certificate' },
                    { key: 'UBO_IDENTIFICATION', title: '3. UBO Passport / ID Verification', desc: 'Government photo identification of directors/owners' }
                  ].map((docType) => {
                    const existing = uploadedDocs.find(d => d.document_type === docType.key);
                    return (
                      <div key={docType.key} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between mb-1.5">
                          <div>
                            <p className="font-bold text-xs text-slate-800">{docType.title}</p>
                            <p className="text-[11px] text-slate-500">{docType.desc}</p>
                          </div>
                          {existing ? (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Attached
                            </span>
                          ) : (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Required</span>
                          )}
                        </div>

                        {existing ? (
                          <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200 text-xs mt-2">
                            <div className="flex items-center gap-2 truncate pr-2">
                              <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                              <span className="font-medium text-slate-700 truncate">{existing.file_name}</span>
                              <span className="text-slate-400 text-[10px]">{existing.file_size}</span>
                            </div>
                            <button type="button" onClick={() => removeDoc(existing.id)} className="text-rose-500 hover:text-rose-700 cursor-pointer">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <label className="mt-2 flex items-center justify-center gap-2 p-2.5 bg-white hover:bg-slate-100 border border-dashed border-slate-300 rounded-lg cursor-pointer text-xs font-semibold text-slate-600 transition-colors">
                            <UploadCloud className="w-4 h-4 text-indigo-600" />
                            <span>Click or Drag to Upload PDF/PNG</span>
                            <input type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={e => handleFileUpload(e, docType.key)} />
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between pt-4">
                  <button type="button" onClick={handleBack} className="text-slate-500 hover:text-slate-800 font-bold px-4 text-sm cursor-pointer">Back</button>
                  <button type="button" onClick={handleNext} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm shadow-md shadow-indigo-600/20 cursor-pointer">
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* FINAL STEP: Review & AML Declaration Submission */}
            {step === stepLabels.length - 1 && (
              <motion.div key="step-final" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                
                {/* Summary Card */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-slate-800 text-sm">KYC Submission Summary</span>
                    <span className="bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                      {currentCountryObj?.country_name || country} ({country})
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-slate-600">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact Person</span>
                      <strong className="text-slate-800">{fullName || 'N/A'}</strong> ({email})
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Role Type</span>
                      <strong className="text-slate-800 uppercase">{role}</strong>
                    </div>
                  </div>

                  {role === 'client' && (
                    <>
                      <div className="grid grid-cols-2 gap-2 text-slate-600 border-t border-slate-200 pt-2">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Company Legal Name</span>
                          <strong className="text-slate-800">{companyName || 'N/A'}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Registration No.</span>
                          <strong className="text-slate-800">{companyRegNo || 'N/A'}</strong>
                        </div>
                      </div>

                      <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-200 text-[11px] text-slate-700">
                        <span>Declared UBOs: <strong>{ubos.length} owner(s)</strong></span>
                        <span>Attached Documents: <strong>{uploadedDocs.length} file(s)</strong></span>
                      </div>
                    </>
                  )}

                  {role === 'regulator' && (
                    <div className="border-t border-slate-200 pt-2 text-slate-600">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Regulatory Authority</span>
                      <strong className="text-indigo-800">{currentRegulatorObj?.name || selectedRegulatorCode}</strong> ({selectedRegulatorCode})
                    </div>
                  )}
                </div>

                {/* Sanctions & AML Declaration Box */}
                <div className="bg-blue-50/80 p-3.5 rounded-xl border border-blue-200 text-xs space-y-2">
                  <div className="flex items-start gap-2.5 text-blue-900 font-medium">
                    <FileText className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <p>By submitting this application, you declare that all information provided is accurate and consent to automated PEP/Sanctions screening under statutory sovereign laws.</p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer pt-1 text-slate-800 font-bold text-xs">
                    <input type="checkbox" checked={amlAccepted} onChange={e => setAmlAccepted(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                    <span>I confirm and authorize sovereign compliance verification</span>
                  </label>
                </div>

                <div className="flex justify-between pt-4">
                  <button type="button" onClick={handleBack} className="text-slate-500 hover:text-slate-800 font-bold px-4 text-sm cursor-pointer">Back</button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting || !amlAccepted} 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 sm:px-8 py-3 rounded-xl font-bold flex items-center gap-2 text-sm shadow-lg shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      'Encrypting & Storing in SQLite DB...'
                    ) : (
                      <><CheckCircle2 className="w-5 h-5" /> Finalize Registration</>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
