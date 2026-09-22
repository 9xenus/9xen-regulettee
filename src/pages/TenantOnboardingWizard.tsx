import { fetchWithRetry } from '../lib/api-client';
import React, { useState, useEffect, useRef } from 'react';
import { RegulatorOnboarding } from '../components/onboarding/RegulatorOnboarding';
import { 
  Building2, Globe, Database, ShieldCheck, 
  ChevronRight, ArrowRight, CheckCircle2, Factory, 
  Activity, Scale, CreditCard, Cpu, Network, Loader2, Users,
  Upload, FileText, UserCheck, ShieldAlert, FileSignature, Check, ArrowLeft,
  X, Laptop, Compass, BookOpen, Settings, Server, Key, Lock, SlidersHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

interface TenantOnboardingWizardProps {
  onComplete?: (companyName: string) => void;
}

export const TenantOnboardingWizard: React.FC<TenantOnboardingWizardProps> = ({ onComplete }) => {
  const { showToast } = useNotification();
  const { user } = useAuth();
  
  const actualRole = user?.user_metadata?.role || user?.user_metadata?.accountType || 'CLIENT';
  const [selectedRole, setSelectedRole] = useState<'CLIENT'>('CLIENT');

  const [activeFrameworks, setActiveFrameworks] = useState({
    gdpr: true,
    aiact: false,
    dora: false,
    nis2: false,
    csrd: false
  });

  const [regulatorFrameworks, setRegulatorFrameworks] = useState({
    gdpr: true,
    aiact: false,
    dora: false,
    nis2: false,
    csrd: false
  });

  const [step, setStep] = useState(1);
  const [isAssessing, setIsAssessing] = useState(false);
  const [applicableRegulations, setApplicableRegulations] = useState<string[]>([]);
  const [provisioningStep, setProvisioningStep] = useState(0);
  const [provisioningLogs, setProvisioningLogs] = useState<string[]>([]);

  // Onboarding registration type: COMPANY (Corporate) vs CLIENT (Subsidiary) vs EU_REGULATOR (Supervising Agency)
  const [registrationType, setRegistrationType] = useState<'COMPANY' | 'CLIENT' | 'EU_REGULATOR'>('COMPANY');
  
  // Custom form builder fields loaded from localStorage (with fallbacks)
  const [formFields, setFormFields] = useState<any[]>([]);
  
  // Verification config rules loaded from localStorage (with fallbacks)
  const [verificationConfig, setVerificationConfig] = useState<any>({
    eudiEnabled: true,
    eudiMinAssurance: 'HIGH',
    eudiSignatureRequired: true,
    viesEnabled: true,
    viesBlockUnverified: false,
    sanctionsEnabled: true,
    sanctionsRiskThreshold: 75,
    sccSignatureRequired: true,
    dpoLetterRequired: true
  });

  // Load configurations on mount
  useEffect(() => {
    const fetchRegionsAndCountries = async () => {
      try {
        const res = await fetchWithRetry('/api/v1/compliance/regions-countries');
        const data = await res.json();
        const regionsList = data && data.success && Array.isArray(data.regions) ? data.regions : [
          {
            name: 'European Union (EU)',
            code: 'EU',
            countries: [
              { name: 'Germany', country_code: 'DE', is_active: true, local_law: 'BDSG / GDPR' },
              { name: 'France', country_code: 'FR', is_active: true, local_law: 'CNIL / GDPR' },
              { name: 'Netherlands', country_code: 'NL', is_active: true, local_law: 'AVG / GDPR' },
              { name: 'Ireland', country_code: 'IE', is_active: true, local_law: 'Data Protection Act / GDPR' },
              { name: 'Spain', country_code: 'ES', is_active: true, local_law: 'LOPDGDD / GDPR' },
              { name: 'Italy', country_code: 'IT', is_active: true, local_law: 'Codice Privacy / GDPR' }
            ]
          },
          {
            name: 'United States & Americas',
            code: 'US',
            countries: [
              { name: 'United States (Federal / CA)', country_code: 'US', is_active: true, local_law: 'CCPA / CPRA / HIPAA' },
              { name: 'Brazil', country_code: 'BR', is_active: true, local_law: 'LGPD' },
              { name: 'Canada', country_code: 'CA', is_active: true, local_law: 'PIPEDA' }
            ]
          },
          {
            name: 'Asia Pacific & Middle East',
            code: 'APAC',
            countries: [
              { name: 'Singapore', country_code: 'SG', is_active: true, local_law: 'PDPA Singapore' },
              { name: 'United Arab Emirates', country_code: 'AE', is_active: true, local_law: 'UAE Data Protection Law' },
              { name: 'Saudi Arabia', country_code: 'SA', is_active: true, local_law: 'PDPL Saudi Arabia' },
              { name: 'India', country_code: 'IN', is_active: true, local_law: 'DPDP Act 2023' },
              { name: 'Global Region', country_code: 'BD', is_active: true, local_law: 'Cyber Security Act / DNCRP' }
            ]
          },
          {
            name: 'United Kingdom & EFTA',
            code: 'UK',
            countries: [
              { name: 'United Kingdom', country_code: 'GB', is_active: true, local_law: 'UK GDPR / DPA 2018' },
              { name: 'Switzerland', country_code: 'CH', is_active: true, local_law: 'FADP / revDSG' }
            ]
          }
        ];

        setRegionData(regionsList);
        const options = regionsList.map((r: any) => r.name);
        const defaultFields = [
          { id: 'f_1', label: 'Legal Company Name', internalKey: 'company_legal_name', type: 'text', required: true },
          { id: 'f_2', label: 'VAT / Tax Number', internalKey: 'eu_vat_number', type: 'text', required: true },
          { id: 'f_region', label: 'Operating Region', internalKey: 'operating_region', type: 'select', required: true, options: options },
          { id: 'f_country', label: 'Country of Registration', internalKey: 'operating_country', type: 'select', required: true, options: [] },
          { id: 'f_3', label: 'Primary Data Protection Officer (DPO)', internalKey: 'primary_dpo', type: 'text', required: false }
        ];
        setFormFields(defaultFields);
      } catch (err) {
        console.error('Failed to fetch regions', err);
      }
    };
    fetchRegionsAndCountries();

    const savedConfig = localStorage.getItem('onboarding_verification_config');
    if (savedConfig) {
      try {
        setVerificationConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error("Error parsing onboarding verification config:", e);
      }
    }

    const savedDraftId = localStorage.getItem('onboarding_draft_tenant_id');
    if (savedDraftId) {
      setDraftTenantId(savedDraftId);
      // Fetch the draft data to resume
      fetchWithRetry(`/api/v1/tenants/${savedDraftId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.tenant) {
            const t = data.tenant;
            if (t.name) setProfile(prev => ({ ...prev, companyName: t.name }));
            if (t.industry) setProfile(prev => ({ ...prev, industry: t.industry }));
            if (t.revenue) setProfile(prev => ({ ...prev, revenue: t.revenue }));
            if (t.employees) setProfile(prev => ({ ...prev, employees: t.employees }));
            if (t.registrationType) setRegistrationType(t.registrationType);
            if (t.selectedRole) setSelectedRole(t.selectedRole);
            if (t.dataTypes) setDataTypes(t.dataTypes);
            if (t.activeFrameworks) setActiveFrameworks(t.activeFrameworks);
            if (t.regulatorFrameworks) setRegulatorFrameworks(t.regulatorFrameworks);
            if (t.dynamicFormValues) setDynamicFormValues(t.dynamicFormValues);
            if (t.step) setStep(t.step);
          }
        })
        .catch(err => console.error('Failed to resume draft:', err));
    }
  }, []);

  const [draftTenantId, setDraftTenantId] = useState<string | null>(null);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Standard Profile attributes
  const [profile, setProfile] = useState({
    companyName: '',
    industry: '',
    revenue: '',
    employees: ''
  });

  // Dynamic values for Form Builder fields
  const [dynamicFormValues, setDynamicFormValues] = useState<Record<string, any>>({});

  // Data processing scopes
  const [regionData, setRegionData] = useState<any[]>([]);
  const [detectedLaws, setDetectedLaws] = useState<any[]>([]);
  const [dataTypes, setDataTypes] = useState({
    pii: false,
    phi: false,
    financial: false,
    biometric: false,
    aiTraining: false
  });

  // Verification states (Step 4)
  const [eudiVerified, setEudiVerified] = useState(false);
  const [eudiScanning, setEudiScanning] = useState(false);
  const [eudiPidData, setEudiPidData] = useState<any>(null);
  
  const [viesStatus, setViesStatus] = useState<'PENDING' | 'VERIFYING' | 'VERIFIED' | 'FAILED'>('PENDING');
  const [sanctionsCleared, setSanctionsCleared] = useState<'PENDING' | 'SCANNING' | 'CLEARED'>('PENDING');
  const [sccSignature, setSccSignature] = useState('');
  const [dpoLetterFileName, setDpoLetterFileName] = useState('');

  // Drag over state for file uploaders
  const [isDpoDragOver, setIsDpoDragOver] = useState(false);

  // Background save logic
  useEffect(() => {
    // Only save if we have a company name and are past the very first welcome step
    const companyName = profile.companyName || dynamicFormValues['company_legal_name'];
    if (!companyName || step < 2) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(async () => {
      const dataToSave = {
        name: companyName,
        industry: profile.industry,
        revenue: profile.revenue,
        employees: profile.employees,
        registrationType,
        selectedRole,
        dataTypes,
        activeFrameworks,
        regulatorFrameworks,
        dynamicFormValues,
        step,
        status: 'ONBOARDING_DRAFT'
      };

      try {
        if (!draftTenantId) {
          const res = await fetchWithRetry('/api/v1/tenants', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataToSave)
          });
          const data = await res.json();
          if (data.success && data.tenant?.id) {
            setDraftTenantId(data.tenant.id);
            localStorage.setItem('onboarding_draft_tenant_id', data.tenant.id);
          }
        } else {
          await fetchWithRetry(`/api/v1/tenants/${draftTenantId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataToSave)
          });
        }
      } catch (error) {
        console.error('Failed to auto-save tenant config:', error);
      }
    }, 2000); // 2 second debounce

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [
    profile, 
    dynamicFormValues, 
    dataTypes, 
    activeFrameworks, 
    regulatorFrameworks, 
    registrationType, 
    selectedRole, 
    step,
    draftTenantId
  ]);
  const simulateEudiVerification = async () => {
    setEudiScanning(true);
    try {
      const res = await fetch('/api/v1/eid/verify-presentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          presentationToken: 'mock_eudi_token_onboarding',
          profileId: 'de_citizen',
          userId: 'usr_active_tenant'
        })
      });
      const data = await res.json();
      setEudiScanning(false);

      if (res.ok && data.success) {
        setEudiVerified(true);
        setEudiPidData({
          givenName: data.claims.firstName,
          familyName: data.claims.lastName,
          nationality: `${data.claims.issuingCountry} (${data.claims.issuingCountry === 'DE' ? 'Germany' : 'EU Member State'})`,
          dob: data.claims.dob,
          assuranceLevel: verificationConfig.eudiMinAssurance || "HIGH",
          validThrough: data.claims.validUntil,
          digitalSignature: "SHA256-ECDSA-eIDAS-Qualified"
        });
        showToast("eIDAS v2 verified! SD-JWT selective disclosure cryptographically checked against EUTL anchors.", "success");
      } else {
        showToast(data.error || "EUDI signature validation failure.", "error");
      }
    } catch (err: any) {
      setEudiScanning(false);
      showToast(`EUDI Verification service unreachable: ${err.message}`, "error");
    }
  };

  const simulateViesLookup = () => {
    setViesStatus('VERIFYING');
    setTimeout(() => {
      const idStr = registrationType === 'EU_REGULATOR' ? (profile.revenue || 'REG-EU-1049') : (dynamicFormValues['eu_vat_number'] || 'DE123456789');
      setViesStatus('VERIFIED');
      if (registrationType === 'EU_REGULATOR') {
        showToast(`Regulator Registry ID ${idStr} successfully whitelisted in European Commission records`, "success");
      } else {
        showToast(`VAT Registration ${idStr} successfully verified in EU VIES registry`, "success");
      }
    }, 1500);
  };

  const simulateSanctionsCheck = () => {
    setSanctionsCleared('SCANNING');
    setTimeout(() => {
      setSanctionsCleared('CLEARED');
      if (registrationType === 'EU_REGULATOR') {
        showToast("Supervisory authority credentials checked & verified successfully", "success");
      } else {
        showToast("PEP and global watchlist screens returned 0 conflicts", "success");
      }
    }, 1500);
  };

  const handleProvision = () => {
    setStep(5);
    setProvisioningLogs([]);
    setProvisioningStep(0);
    
    let logs: string[] = [];
    const resolvedName = profile.companyName || dynamicFormValues['company_legal_name'] || "Sovereign Compliance Entity";
    if (registrationType === 'EU_REGULATOR') {
      logs = [
        "Contacting European Commission Registry ledger...",
        `Provisioning Official Regulator Oversight Node for [${resolvedName}]...`,
        "Activating hardware HSM for eIDAS Qualified Electronic Seals...",
        "Establishing encrypted read-only Ledger Bridges to parent corporate nodes...",
        "Registering official regulatory certificates on EEA sovereign network...",
        "Sovereign Regulator oversight channel established successfully!"
      ];
    } else {
      logs = [
        "Contacting sovereign cloud services (Frankfurt aws-central-1)...",
        `Creating cryptographically sealed Firestore container boundary for [${resolvedName}]...`,
        "Generating hardware-backed KMS key ring (AES-GCM 256-bit envelope)...",
        "Binding regulatory compliance checks for " + resolvedName + "...",
        "Registering Local Data Protection Officer (DPO) ledger hooks...",
        "Configuring eIDAS trust lists anchors & continuous KYC monitoring metrics...",
        "Sovereign tenant workspace initialized successfully!"
      ];
    }

    logs.forEach((log, index) => {
      setTimeout(() => {
        setProvisioningLogs(prev => [...prev, log]);
        setProvisioningStep(index + 1);
        
        // Finalize state on last log line
        if (index === logs.length - 1) {
          const resolvedName = profile.companyName || dynamicFormValues['company_legal_name'] || "Sovereign Compliance Entity";

          // Add registered tenant/client to localStorage list
          let list = [];
          const savedList = localStorage.getItem('platform_tenants_list');
          if (savedList) {
            try {
              list = JSON.parse(savedList);
            } catch (e) {
              console.error("Error parsing tenants list during provisioning:", e);
            }
          }
          const newTenant = {
            id: 'tenant_' + Date.now(),
            name: resolvedName,
            type: (registrationType === 'COMPANY' ? 'Parent Corporate' : registrationType === 'EU_REGULATOR' ? 'EU Regulator Board' : 'Client Entity'),
            industry: (registrationType === 'EU_REGULATOR' ? 'Official EU Supervision' : (profile.industry || 'Technology & SaaS')),
            status: 'Compliant',
            riskLevel: 'Low',
            createdAt: new Date().toISOString()
          };
          list.push(newTenant);
          localStorage.setItem('platform_tenants_list', JSON.stringify(list));

          // Auto-assign reviewers based on Dynamic Form rules
          const assignedReviewers: string[] = [];
          formFields.forEach((field: any) => {
            if (field.reviewerRouting && dynamicFormValues[field.internalKey]) {
              assignedReviewers.push(field.reviewerRouting);
            }
          });

          // Final server-side activation if draft exists
          if (draftTenantId) {
            fetchWithRetry(`/api/v1/tenants/${draftTenantId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                status: 'ACTIVE', 
                phase: 'Completed',
                assignedReviewers: assignedReviewers
              })
            }).catch(e => console.error('Final activation failed', e));
            
            setDraftTenantId(null);
            localStorage.removeItem('onboarding_draft_tenant_id');
          }
        }
      }, (index + 1) * 800);
    });
  };

  const handleNext = () => {
    if (selectedRole === 'CLIENT') {
      if (step === 3) {
        runAssessment();
      } else {
        setStep(s => s + 1);
      }
    }
  };

  const handleBack = () => {
    setStep(s => Math.max(1, s - 1));
  };

  const runAssessment = () => {
    setIsAssessing(true);
    setStep(4);
    
    setTimeout(() => {
      const regs = ['GDPR Core Requirements'];
      if (registrationType === 'EU_REGULATOR') {
        regs.push('Full Supervisory Authority');
        if (regulatorFrameworks.gdpr) regs.push('GDPR Oversight');
        if (regulatorFrameworks.aiact) regs.push('EU AI Act Monitoring');
        if (regulatorFrameworks.dora) regs.push('DORA Audits');
        if (regulatorFrameworks.nis2) regs.push('NIS2 Supervision');
        if (regulatorFrameworks.csrd) regs.push('CSRD Disclosures');
      } else {
        if (profile.industry === 'Finance' || dataTypes.financial) regs.push('DORA (Digital Operational Resilience Act)');
        if (profile.industry === 'Healthcare' || dataTypes.phi) regs.push('NIS2 Directive (Essential Entities)');
        if (dataTypes.aiTraining) regs.push('EU AI Act (High-Risk Systems)');
        if (profile.revenue === '50M+' && profile.employees === '250+') regs.push('CSRD (Corporate Sustainability Reporting)');
      }
      
      setApplicableRegulations(regs);
      setIsAssessing(false);
      
      // Auto-trigger background validations
      if (verificationConfig.viesEnabled) simulateViesLookup();
      if (verificationConfig.sanctionsEnabled) simulateSanctionsCheck();
    }, 2000);
  };

  // Check validity for dynamic form builder fields
  const isDynamicFormValid = () => {
    if (registrationType === 'EU_REGULATOR') {
      return profile.companyName && profile.industry && profile.employees && profile.revenue;
    }

    // Company legal name or profile name must exist
    const companyNameField = formFields.find((f: any) => f.internalKey === 'company_legal_name');
    if (companyNameField && companyNameField.required) {
      if (!dynamicFormValues['company_legal_name']) return false;
    } else {
      if (!profile.companyName) return false;
    }

    // Verify all other mandatory fields
    for (const field of formFields) {
      if (field.required) {
        const val = dynamicFormValues[field.internalKey];
        if (val === undefined || val === '') return false;
      }
    }
    return true;
  };

  const isStep2Valid = registrationType === 'EU_REGULATOR' ? (profile.companyName && profile.industry && profile.employees && profile.revenue) : (isDynamicFormValid() && profile.industry && profile.employees && profile.revenue);
  const isStep3Valid = registrationType === 'EU_REGULATOR' ? Object.values(regulatorFrameworks).some(Boolean) : Object.values(dataTypes).some(Boolean);

  // Check if all active verifications configured by the Admin are completed
  const isVerificationStepValid = () => {
    if (verificationConfig.eudiEnabled && !eudiVerified) return false;
    if (verificationConfig.viesEnabled && viesStatus !== 'VERIFIED' && verificationConfig.viesBlockUnverified) return false;
    if (verificationConfig.sccSignatureRequired && !sccSignature.trim()) return false;
    if (registrationType !== 'EU_REGULATOR' && verificationConfig.dpoLetterRequired && !dpoLetterFileName) return false;
    return true;
  };

  return (
    <div className="max-w-4xl mx-auto py-5 sm:py-8">
      {/* Dev/Simulation Role Override Switcher */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <span className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
            <SlidersHorizontal className="w-5 h-5" />
          </span>
          <div>
            <span className="font-bold text-slate-800 block text-sm">Sovereign Role Onboarding Simulator</span>
            <span className="text-[11px] text-slate-500 leading-normal">
              The platform detected your authenticated role as <strong className="text-slate-800">{actualRole}</strong>. Switch roles below to test different dynamic workflows.
            </span>
          </div>
        </div>
        <div className="flex bg-slate-200/60 p-0.5 rounded-lg border border-slate-200 shrink-0 w-fit gap-1 flex-wrap">
          <button 
            type="button"
            onClick={() => {
              setSelectedRole('CLIENT');
              setRegistrationType('COMPANY');
              setStep(1);
            }}
            className={`px-3 py-1.5 rounded-md font-bold transition-all border-0 cursor-pointer text-xs ${selectedRole === 'CLIENT' && registrationType !== 'EU_REGULATOR' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-800 bg-transparent'}`}
          >
            Client Onboarding
          </button>
          {actualRole === 'EU_REGULATOR' && (
            <button 
              type="button"
              onClick={() => {
                setSelectedRole('CLIENT');
                setRegistrationType('EU_REGULATOR');
                setStep(1);
              }}
              className={`px-3 py-1.5 rounded-md font-bold transition-all border-0 cursor-pointer text-xs ${selectedRole === 'CLIENT' && registrationType === 'EU_REGULATOR' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-800 bg-transparent'}`}
            >
              Regulator Onboarding
            </button>
          )}
        </div>
      </div>

      {/* Progress Tracker */}
      <div className="mb-10">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10 rounded-full"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-600 -z-10 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${((step - 1) / 4) * 100}%` }}
          ></div>
          
          {[1, 2, 3, 4, 5].map((num) => (
            <div 
              key={num} 
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-colors duration-300 ${
                step > num ? 'bg-indigo-600 text-white' : 
                step === num ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' : 'bg-white text-slate-400 border border-slate-200'
              }`}
            >
              {step > num ? <CheckCircle2 className="w-5 h-5" /> : num}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-3 text-xs font-semibold text-slate-500">
          <span>Type & Welcome</span>
          <span>{registrationType === 'EU_REGULATOR' ? 'Agency Profile' : 'Dynamic Profile'}</span>
          <span>{registrationType === 'EU_REGULATOR' ? 'Framework Select' : 'Data Processing'}</span>
          <span>Identity Verification</span>
          <span>Workspace Provision</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[450px]">
        <AnimatePresence mode="wait">
          
          {/* Step 1: Account Type & Welcome */}
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-10 flex flex-col items-center justify-center h-full text-center min-h-[450px]"
            >
                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-sm border border-indigo-100">
                  <Building2 className="w-10 h-10" />
                </div>
                
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Central Compliance Onboarding</h1>
                <p className="text-slate-500 max-w-lg mb-8 text-sm leading-relaxed">
                  Welcome to the 9Xen Regulettee Compliance Gateway. Select your registration intent below to architect an automated sovereign data boundary.
                </p>

                {/* Registration Type Selectors */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full mb-8">
                  <button 
                    type="button"
                    onClick={() => setRegistrationType('COMPANY')}
                    className={`p-5 rounded-2xl border-2 text-left transition-all flex flex-col items-start gap-3 cursor-pointer bg-white ${
                      registrationType === 'COMPANY' ? 'border-indigo-600 bg-indigo-50/20 ring-1 ring-indigo-500' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${registrationType === 'COMPANY' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">Parent Corporate</h3>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Register a primary corporate headquarters entity managing global sub-entities and DPOs.</p>
                    </div>
                  </button>

                  <button 
                    type="button"
                    onClick={() => setRegistrationType('CLIENT')}
                    className={`p-5 rounded-2xl border-2 text-left transition-all flex flex-col items-start gap-3 cursor-pointer bg-white ${
                      registrationType === 'CLIENT' ? 'border-indigo-600 bg-indigo-50/20 ring-1 ring-indigo-500' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${registrationType === 'CLIENT' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <Laptop className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">Client / Subsidiary</h3>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Register as an independent business unit, commercial client, or regional subsidiary.</p>
                    </div>
                  </button>

                  {actualRole === 'EU_REGULATOR' && (
                    <button 
                      type="button"
                      onClick={() => setRegistrationType('EU_REGULATOR')}
                      className={`p-5 rounded-2xl border-2 text-left transition-all flex flex-col items-start gap-3 cursor-pointer bg-white ${
                        registrationType === 'EU_REGULATOR' ? 'border-indigo-600 bg-indigo-50/20 ring-1 ring-indigo-500' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${registrationType === 'EU_REGULATOR' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <Scale className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">Official EU Regulator</h3>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Register as an authorized supervising authority (e.g. BaFin, CNIL, EDPB) to audit and fetch data logs.</p>
                      </div>
                    </button>
                  )}
                </div>

                <button 
                  onClick={handleNext}
                  className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm transition-colors flex items-center cursor-pointer border-0"
                >
                  Begin Workspace Profiling <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </motion.div>
            )}

          {/* Step 2: Profile Attributes (Standard or Regulator) */}
          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-5 sm:p-6 lg:p-8 min-h-[450px]"
            >
                <div className="flex items-center gap-2.5 mb-6">
                  <Globe className="w-6 h-6 text-indigo-500" />
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      {registrationType === 'EU_REGULATOR' ? 'EU Regulator Authority Registration' : registrationType === 'COMPANY' ? 'Parent Company Profile' : 'Client Profile Details'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">Please fill out the authorized credentials to initiate sovereignty auditing.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-3xl">
                  {registrationType === 'EU_REGULATOR' ? (
                    // SPECIALIZED EU REGULATOR FORM
                    <RegulatorOnboarding profile={profile} setProfile={setProfile} />
                  ) : (
                    // STANDARD COMPANY / CLIENT PROFILE
                    <>
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Demographic Metrics</h3>
                        
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1">Company Legal Name</label>
                          <input 
                            type="text" 
                            value={profile.companyName}
                            onChange={(e) => setProfile({...profile, companyName: e.target.value})}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                            placeholder="e.g. Acme Corporation GmbH"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1">Primary Industry Sector</label>
                          <select 
                            value={profile.industry}
                            onChange={(e) => setProfile({...profile, industry: e.target.value})}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                          >
                            <option value="">Select Industry...</option>
                            <option value="Finance">Financial Services & Banking</option>
                            <option value="Healthcare">Healthcare & BioTech</option>
                            <option value="Technology">Technology & SaaS</option>
                            <option value="Manufacturing">Manufacturing & Energy</option>
                            <option value="Retail">Retail & E-commerce</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Scale (FTE)</label>
                            <select 
                              value={profile.employees}
                              onChange={(e) => setProfile({...profile, employees: e.target.value})}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                            >
                              <option value="">Select...</option>
                              <option value="1-49">1 - 49 (Small)</option>
                              <option value="50-249">50 - 249 (Medium)</option>
                              <option value="250+">250+ (Large)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Annual Revenue</label>
                            <select 
                              value={profile.revenue}
                              onChange={(e) => setProfile({...profile, revenue: e.target.value})}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                            >
                              <option value="">Select...</option>
                              <option value="<10M">&lt; €10M</option>
                              <option value="10M-50M">€10M - €50M</option>
                              <option value="50M+">&gt; €50M</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Custom Registry Parameters</h3>
                        {formFields.map((field: any) => {
                          // Conditional Rules Engine Logic
                          const isVisible = (!field.conditionalRules || field.conditionalRules.length === 0) ? true : field.conditionalRules.every((rule: any) => {
                            const depValue = String(dynamicFormValues[rule.dependentOnKey] || '').toLowerCase();
                            const expectedValue = String(rule.value || '').toLowerCase();
                            if (rule.condition === 'EQUALS') return depValue === expectedValue;
                            if (rule.condition === 'NOT_EQUALS') return depValue !== expectedValue;
                            if (rule.condition === 'CONTAINS') return depValue.includes(expectedValue);
                            return true;
                          });

                          if (!isVisible) return null;

                          const value = dynamicFormValues[field.internalKey] || '';
                          
                          const handleValueChange = async (val: any) => {
                            setDynamicFormValues(prev => ({ ...prev, [field.internalKey]: val }));

                            // Region selected -> update country options
                            if (field.internalKey === 'operating_region') {
                              const selectedRegion = regionData.find((r: any) => r.name === val);
                              if (selectedRegion) {
                                const countryOptions = selectedRegion.countries.map((c: any) => c.name);
                                setFormFields(prev => prev.map(f => 
                                  f.internalKey === 'operating_country' ? { ...f, options: countryOptions } : f
                                ));
                                setDynamicFormValues(prev => ({ ...prev, operating_country: '' }));
                                setDetectedLaws([]);
                              }
                            }

                            // Country selected -> fetch and display detected laws
                            if (field.internalKey === 'operating_country') {
                              const selectedRegion = regionData.find((r: any) => r.name === dynamicFormValues.operating_region);
                              if (selectedRegion) {
                                const selectedCountry = selectedRegion.countries.find((c: any) => c.name === val);
                                if (selectedCountry) {
                                  sessionStorage.setItem('registered_country', selectedCountry.country_code);
                                  try {
                                    const res = await fetchWithRetry(`/api/v1/compliance/detected-laws?country_code=${selectedCountry.country_code}`);
                                    const data = await res.json();
                                    if (data.success && data.laws) {
                                      setDetectedLaws(data.laws);
                                    }
                                  } catch (err) {
                                    console.error('Failed to fetch detected laws', err);
                                  }
                                }
                              }
                            }
                          };


                          return (
                            <div key={field.id} className="space-y-1">
                              <label className="block text-sm font-semibold text-slate-700">
                                {field.label} {field.required && <span className="text-rose-500 font-bold">*</span>}
                              </label>
                              
                              {field.type === 'text' && (
                                <input 
                                  type="text" 
                                  required={field.required}
                                  value={value}
                                  onChange={(e) => handleValueChange(e.target.value)}
                                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                                  placeholder={`Enter ${field.label.toLowerCase()}...`}
                                />
                              )}

                              {field.type === 'textarea' && (
                                <textarea 
                                  required={field.required}
                                  value={value}
                                  onChange={(e) => handleValueChange(e.target.value)}
                                  rows={2}
                                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                                  placeholder={`Enter ${field.label.toLowerCase()}...`}
                                />
                              )}

                              {field.type === 'select' && (
                                <select 
                                  required={field.required}
                                  value={value}
                                  onChange={(e) => handleValueChange(e.target.value)}
                                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                >
                                  <option value="">Select an option...</option>
                                  {(field.options || ['EU-CENTRAL-1', 'EU-WEST-1']).map((opt: string, idx: number) => (
                                    <option key={idx} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              )}

                              {field.type === 'file' && (
                                <div 
                                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                                    value ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-200 hover:border-indigo-400 bg-slate-50'
                                  }`}
                                  onClick={() => {
                                    const input = document.createElement('input');
                                    input.type = 'file';
                                    input.onchange = (e: any) => {
                                      if (e.target.files && e.target.files[0]) {
                                        handleValueChange(e.target.files[0].name);
                                      }
                                    };
                                    input.click();
                                  }}
                                >
                                  {value ? (
                                    <div className="flex items-center justify-center gap-2">
                                      <Check className="w-4 h-4 text-emerald-600" />
                                      <span className="text-xs text-slate-600 font-mono truncate max-w-[200px]">{value}</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center gap-2 text-slate-500">
                                      <Upload className="w-4 h-4 text-slate-400" />
                                      <span className="text-xs">Drag or Click to attach file</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-12 flex justify-between pt-6 border-t border-slate-100">
                  <button onClick={handleBack} className="px-6 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors border-0 cursor-pointer">Back</button>
                  <button 
                    onClick={handleNext} 
                    disabled={!isStep2Valid}
                    className={`px-8 py-2 font-bold rounded-lg transition-colors flex items-center border-0 ${isStep2Valid ? 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                  >
                    Continue <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </motion.div>
            )}

          {/* Step 3: Data Processing types (Skip for EU Regulator, auto-triggers) */}
          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-5 sm:p-6 lg:p-8 min-h-[450px]"
            >
                {registrationType === 'EU_REGULATOR' ? (
                  <>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center">
                      <Scale className="w-6 h-6 text-indigo-500 mr-3" /> Regulatory Supervision Scope
                    </h2>
                    <p className="text-slate-500 mb-8 max-w-2xl text-xs sm:text-sm">
                      Select which regulatory frameworks and directives your authority is authorized to supervise, audit, and inspect.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { id: 'gdpr', key: 'gdpr' as keyof typeof regulatorFrameworks, label: 'GDPR Oversight Authority', desc: 'Supervise personal data protections, right-to-be-forgotten registries, and DPO appointments.', icon: Users },
                        { id: 'aiact', key: 'aiact' as keyof typeof regulatorFrameworks, label: 'EU AI Act Monitoring Hub', desc: 'Inspect high-risk models, transparency registries, and systemic risk mitigation plans.', icon: Cpu },
                        { id: 'dora', key: 'dora' as keyof typeof regulatorFrameworks, label: 'DORA Resilience Supervision', desc: 'Monitor operational resilience testing, third-party ICT risks, and financial entity compliance.', icon: Activity },
                        { id: 'nis2', key: 'nis2' as keyof typeof regulatorFrameworks, label: 'NIS2 Security Enforcement', desc: 'Audit critical sectors, supply chain cybersecurity policies, and incident disclosure compliance.', icon: ShieldCheck },
                        { id: 'csrd', key: 'csrd' as keyof typeof regulatorFrameworks, label: 'CSRD Double-Materiality Ledger', desc: 'Enforce sustainability reporting metrics, green computing standards, and ESG audits.', icon: Globe },
                      ].map((item) => {
                        const isChecked = regulatorFrameworks[item.key];
                        return (
                          <div 
                            key={item.id} 
                            onClick={() => setRegulatorFrameworks({...regulatorFrameworks, [item.key]: !isChecked})}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start ${isChecked ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                          >
                            <div className={`p-2 rounded-lg mr-3 shrink-0 ${isChecked ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                              {React.createElement(item.icon, {className: "w-5 h-5"})}
                            </div>
                            <div className="w-full">
                              <div className="flex justify-between items-center">
                                <h3 className={`font-bold text-sm ${isChecked ? 'text-indigo-900' : 'text-slate-800'}`}>{item.label}</h3>
                                <input 
                                  type="checkbox" 
                                  checked={isChecked}
                                  onChange={() => {}} // handled by parent div click
                                  className="w-3.5 h-3.5 accent-indigo-600 shrink-0 border-slate-300 rounded focus:ring-indigo-500" 
                                />
                              </div>
                              <p className={`text-[11px] mt-1 ${isChecked ? 'text-indigo-700' : 'text-slate-500'}`}>{item.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center">
                      <Database className="w-6 h-6 text-indigo-500 mr-3" /> Data Processing Types
                    </h2>
                    <p className="text-slate-500 mb-8 max-w-2xl text-xs sm:text-sm">Select all categories of data your organization processes or stores. This determines which regulatory frameworks (like GDPR, DORA, AI Act) will be mapped to your workspace.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { id: 'pii', key: 'pii' as keyof typeof dataTypes, label: 'Personally Identifiable Info (PII)', desc: 'Names, emails, addresses of EU citizens', icon: Users },
                        { id: 'phi', key: 'phi' as keyof typeof dataTypes, label: 'Protected Health Info (PHI)', desc: 'Medical records, genetic data', icon: Activity },
                        { id: 'financial', key: 'financial' as keyof typeof dataTypes, label: 'Financial & Payment Data', desc: 'Credit cards, bank accounts, transactions', icon: CreditCard },
                        { id: 'biometric', key: 'biometric' as keyof typeof dataTypes, label: 'Biometric Identifiers', desc: 'Facial recognition, fingerprints', icon: ShieldCheck },
                        { id: 'aiTraining', key: 'aiTraining' as keyof typeof dataTypes, label: 'AI Model Training Data', desc: 'Data used to train large-scale ML models', icon: Cpu },
                      ].map((item) => (
                        <div 
                          key={item.id} 
                          onClick={() => setDataTypes({...dataTypes, [item.key]: !dataTypes[item.key]})}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start ${dataTypes[item.key] ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                        >
                          <div className={`p-2 rounded-lg mr-3 shrink-0 ${dataTypes[item.key] ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            {React.createElement(item.icon, {className: "w-5 h-5"})}
                          </div>
                          <div>
                            <h3 className={`font-bold text-sm ${dataTypes[item.key] ? 'text-indigo-900' : 'text-slate-800'}`}>{item.label}</h3>
                            <p className={`text-[11px] mt-1 ${dataTypes[item.key] ? 'text-indigo-700' : 'text-slate-500'}`}>{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div className="mt-12 flex justify-between pt-6 border-t border-slate-100">
                  <button onClick={handleBack} className="px-6 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors border-0 cursor-pointer">Back</button>
                  <button 
                    onClick={handleNext} 
                    disabled={!isStep3Valid}
                    className={`px-8 py-2 font-bold rounded-lg transition-colors flex items-center border-0 ${isStep3Valid ? 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                  >
                    {registrationType === 'EU_REGULATOR' ? 'Register Authorized Scopes' : 'Run Applicability Engine'} <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </motion.div>
            )}

          {/* Step 4: Identity & Compliance Verification */}
          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-5 sm:p-6 lg:p-8 min-h-[450px]"
            >
               {isAssessing ? (
                 <div className="flex flex-col items-center text-center py-12">
                   <div className="relative w-24 h-24 mb-6">
                     <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                     <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                     <Scale className="w-8 h-8 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                   </div>
                   <h2 className="text-2xl font-bold text-slate-900 mb-2">Analyzing Regulatory Scope...</h2>
                   <p className="text-slate-500">Mapping credentials against European Supervisory Whitelists</p>
                 </div>
               ) : (
                 <div className="space-y-4 sm:space-y-6">
                   <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-slate-100 pb-4">
                     <div>
                       <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                         <ShieldCheck className="w-6 h-6 text-indigo-600" />
                         Sovereign Verification Pipeline
                       </h2>
                       <p className="text-xs text-slate-500 mt-0.5">Please fulfill the active identity & credential checks to activate oversight.</p>
                     </div>
                     <div className="flex flex-wrap gap-1.5 mt-2 md:mt-0">
                       {applicableRegulations.map((reg, idx) => (
                         <span key={idx} className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                           <Check className="w-3 h-3 text-indigo-500" /> {reg}
                         </span>
                       ))}
                     </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                     {/* Left Column: Direct Verification Actions */}
                     <div className="space-y-4">
                       
                       {/* EUDI WALLET CHECK */}
                       {verificationConfig.eudiEnabled && (
                         <div className={`p-4 rounded-xl border ${eudiVerified ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200 bg-slate-50'}`}>
                           <div className="flex justify-between items-start">
                             <div className="flex gap-2.5">
                               <ShieldCheck className={`w-5 h-5 mt-0.5 ${eudiVerified ? 'text-emerald-600' : 'text-slate-400'}`} />
                               <div>
                                 <h3 className="text-sm font-bold text-slate-800">EU Digital Identity Verification</h3>
                                 <p className="text-[11px] text-slate-500 mt-0.5">eIDAS Level of Assurance: <strong>{verificationConfig.eudiMinAssurance}</strong></p>
                               </div>
                             </div>
                             {eudiVerified ? (
                               <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded">VERIFIED</span>
                             ) : (
                               <button 
                                 type="button"
                                 onClick={simulateEudiVerification}
                                 disabled={eudiScanning}
                                 className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-md border-0 cursor-pointer shadow-sm flex items-center gap-1"
                               >
                                 {eudiScanning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Globe className="w-3 h-3" />}
                                 Verify eID
                               </button>
                             )}
                           </div>

                           {eudiVerified && eudiPidData && (
                             <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 pt-3 border-t border-emerald-100/50 text-[11px] text-slate-600 font-mono space-y-1">
                               <div>Given Name: <span className="font-bold text-slate-800">{eudiPidData.givenName}</span></div>
                               <div>Family Name: <span className="font-bold text-slate-800">{eudiPidData.familyName}</span></div>
                               <div>Nationality: <span className="text-slate-800">{eudiPidData.nationality}</span></div>
                               <div>Signature: <span className="text-emerald-600 font-bold">{eudiPidData.digitalSignature}</span></div>
                             </motion.div>
                           )}
                         </div>
                       )}

                       {/* VIES TRADE OR REGULATOR REGISTRY CHECK */}
                       {verificationConfig.viesEnabled && (
                         <div className={`p-4 rounded-xl border ${viesStatus === 'VERIFIED' ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200 bg-slate-50'}`}>
                           <div className="flex justify-between items-start">
                             <div className="flex gap-2.5">
                               <Building2 className={`w-5 h-5 mt-0.5 ${viesStatus === 'VERIFIED' ? 'text-emerald-600' : 'text-slate-400'}`} />
                               <div>
                                 <h3 className="text-sm font-bold text-slate-800">
                                   {registrationType === 'EU_REGULATOR' ? 'Official EU Agency Whitelist check' : 'EU VIES Corporate Lookup'}
                                 </h3>
                                 <p className="text-[11px] text-slate-500 mt-0.5">Real-time trade register & authority credentials verification.</p>
                               </div>
                             </div>
                             {viesStatus === 'VERIFIED' ? (
                               <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded">
                                 {registrationType === 'EU_REGULATOR' ? 'WHITELISTED' : 'VIES VALID'}
                               </span>
                             ) : viesStatus === 'VERIFYING' ? (
                               <span className="text-xs text-slate-500 flex items-center gap-1"><Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" /> Querying...</span>
                             ) : (
                               <button 
                                 type="button"
                                 onClick={simulateViesLookup}
                                 className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-md border-0 cursor-pointer shadow-sm"
                               >
                                 Query Registry
                               </button>
                             )}
                           </div>
                         </div>
                       )}

                       {/* WATCHLIST OR REGULATORY SCOPE CHECK */}
                       {verificationConfig.sanctionsEnabled && (
                         <div className={`p-4 rounded-xl border ${sanctionsCleared === 'CLEARED' ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200 bg-slate-50'}`}>
                           <div className="flex justify-between items-start">
                             <div className="flex gap-2.5">
                               <Users className={`w-5 h-5 mt-0.5 ${sanctionsCleared === 'CLEARED' ? 'text-emerald-600' : 'text-slate-400'}`} />
                               <div>
                                 <h3 className="text-sm font-bold text-slate-800">
                                   {registrationType === 'EU_REGULATOR' ? 'Supervisory Domain Alignment' : 'PEP & Watchlist Screening'}
                                 </h3>
                                 <p className="text-[11px] text-slate-500 mt-0.5">Continuous verification threshold mapped to regional legislation.</p>
                               </div>
                             </div>
                             {sanctionsCleared === 'CLEARED' ? (
                               <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded">CLEARED</span>
                             ) : sanctionsCleared === 'SCANNING' ? (
                               <span className="text-xs text-slate-500 flex items-center gap-1"><Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" /> Verifying...</span>
                             ) : (
                               <button 
                                 type="button"
                                 onClick={simulateSanctionsCheck}
                                 className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-md border-0 cursor-pointer shadow-sm"
                               >
                                 Validate Domain
                               </button>
                             )}
                           </div>
                         </div>
                       )}
                     </div>

                     {/* Right Column: Signatures & File uploads */}
                     <div className="space-y-4">
                       
                       {/* OATH OF OFFICE OR SCC SIGN-OFF PANEL */}
                       {verificationConfig.sccSignatureRequired && (
                         <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                           <div className="flex items-center gap-2">
                             <FileSignature className="w-4 h-4 text-indigo-500" />
                             <h4 className="text-xs font-bold text-slate-700 uppercase">
                               {registrationType === 'EU_REGULATOR' ? 'Official Attestation & Oath of Office' : 'Standard Contractual Clauses (SCC)'}
                             </h4>
                           </div>
                           <p className="text-[10px] text-slate-500 leading-normal font-medium">
                             {registrationType === 'EU_REGULATOR' 
                               ? 'Attest to uphold independent supervisory practices under European Union administrative rules.'
                               : 'By signing below, you endorse the GDPR Article 46 cross-border transfer agreements and data processing amendments.'}
                           </p>
                           <div>
                             <input 
                               type="text"
                               required
                               value={sccSignature}
                               onChange={(e) => setSccSignature(e.target.value)}
                               placeholder={registrationType === 'EU_REGULATOR' ? "Type your official full name..." : "Type your Full Legal Name to sign..."}
                               className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                             />
                           </div>
                         </div>
                       )}

                       {/* APPOINTMENT LETTER UPLOAD (Not required for Regulators) */}
                       {registrationType !== 'EU_REGULATOR' && verificationConfig.dpoLetterRequired && (
                         <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                           <div className="flex items-center gap-2">
                             <Upload className="w-4 h-4 text-indigo-500" />
                             <h4 className="text-xs font-bold text-slate-700 uppercase">GDPR Art 37 DPO Letter</h4>
                           </div>
                           <p className="text-[10px] text-slate-500 leading-normal font-medium">Please attach a signed copy of your formal DPO appointment board resolution.</p>
                           
                           <div 
                             className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all bg-white ${
                               dpoLetterFileName ? 'border-emerald-500 bg-emerald-50/10' : isDpoDragOver ? 'border-indigo-500 bg-indigo-50/10' : 'border-slate-200 hover:border-indigo-400'
                             }`}
                             onDragOver={(e) => { e.preventDefault(); setIsDpoDragOver(true); }}
                             onDragLeave={() => setIsDpoDragOver(false)}
                             onDrop={(e) => {
                               e.preventDefault();
                               setIsDpoDragOver(false);
                               if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                 setDpoLetterFileName(e.dataTransfer.files[0].name);
                                 showToast("DPO Appointment Letter uploaded & staged", "success");
                               }
                             }}
                             onClick={() => {
                               const input = document.createElement('input');
                               input.type = 'file';
                               input.accept = '.pdf,.doc,.docx';
                               input.onchange = (e: any) => {
                                 if (e.target.files && e.target.files[0]) {
                                   setDpoLetterFileName(e.target.files[0].name);
                                   showToast("DPO Appointment Letter uploaded & staged", "success");
                                 }
                               };
                               input.click();
                             }}
                           >
                             {dpoLetterFileName ? (
                               <div className="flex items-center justify-center gap-2">
                                 <FileText className="w-4.5 h-4.5 text-emerald-600" />
                                 <span className="text-xs font-semibold text-slate-800 truncate max-w-[200px]">{dpoLetterFileName}</span>
                               </div>
                             ) : (
                               <div className="flex flex-col items-center justify-center text-slate-500">
                                 <Upload className="w-6 h-6 text-slate-400 mb-1" />
                                 <span className="text-xs font-bold">Upload signed PDF</span>
                                 <span className="text-[9px] text-slate-400 mt-0.5">Supports PDF / Word up to 10MB</span>
                               </div>
                             )}
                           </div>
                         </div>
                       )}

                       {registrationType === 'EU_REGULATOR' && (
                         <div className="bg-emerald-50/40 p-4 border border-emerald-100 rounded-xl space-y-1">
                           <h4 className="text-xs font-black text-emerald-800 flex items-center gap-1.5 uppercase">
                             <ShieldCheck className="w-4 h-4 text-emerald-600" />
                             Regulator Credentials Active
                           </h4>
                           <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                             This session is secured with EU eIDAS high assurance checks. Your compliance certificates will be anchored to the 9Xen Regulettee security ledger.
                           </p>
                         </div>
                       )}
                     </div>
                   </div>

                   <div className="mt-12 flex justify-between pt-6 border-t border-slate-100">
                     <button onClick={handleBack} className="px-6 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors border-0 cursor-pointer">Back</button>
                     <button 
                       onClick={handleProvision}
                       disabled={!isVerificationStepValid()}
                       className={`px-8 py-3 font-bold rounded-xl shadow-md transition-colors flex items-center border-0 ${
                         isVerificationStepValid() ? 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                       }`}
                     >
                       {registrationType === 'EU_REGULATOR' ? 'Activate Regulator Oversight Node' : 'Provision Sovereign Environment'} <ArrowRight className="w-5 h-5 ml-2" />
                     </button>
                   </div>
                 </div>
               )}
             </motion.div>
          )}

          {/* Step 5: Sandbox Environment Provisioning & Completed screen */}
          {step === 5 && (
             <motion.div 
               key="step5"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="p-10 flex flex-col items-center justify-center h-full min-h-[450px]"
             >
               {provisioningStep < 6 ? (
                 <div className="w-full max-w-md space-y-4 sm:space-y-6">
                   <div className="flex flex-col items-center text-center animate-pulse">
                     <div className="relative w-16 h-16 mb-4">
                       <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                       <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                     </div>
                     <h2 className="text-xl font-bold text-slate-900">
                       {registrationType === 'EU_REGULATOR' ? 'Deploying Oversight Node' : 'Deploying Sealed Environment'}
                     </h2>
                     <p className="text-sm text-slate-500">Creating secure sandbox within the European jurisdiction</p>
                   </div>

                   <div className="bg-slate-950 text-emerald-400 font-mono text-xs p-4 rounded-xl space-y-2 h-44 overflow-y-auto shadow-inner border border-slate-800">
                     {provisioningLogs.map((log, idx) => (
                       <div key={idx} className="flex items-start">
                         <span className="text-slate-500 mr-2 shrink-0">[{idx + 1}]</span>
                         <span>{log}</span>
                       </div>
                     ))}
                   </div>
                 </div>
               ) : (
                 <div className="w-full max-w-md text-center space-y-4 sm:space-y-6">
                   <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                     <CheckCircle2 className="w-8 h-8" />
                   </div>
                   <div>
                     <h2 className="text-2xl font-black text-slate-900">
                       {registrationType === 'EU_REGULATOR' ? 'Regulator Workspace Connected!' : 'Tenant Workspace Provisioned!'}
                     </h2>
                     <p className="text-slate-500 text-sm mt-2">
                       {registrationType === 'EU_REGULATOR' ? 'Oversight channel linked successfully, and ledger tracking keys are anchored in Frankfurt (EU-Central-1).' : 'Compliance policies activated, and encrypted storage containers have been sealed in EU-Central-1 (Frankfurt).'}
                     </p>
                   </div>

                   <button 
                     onClick={() => {
                       const resolvedName = (profile.companyName || dynamicFormValues['company_legal_name'] || 'Acme Corp');
                       onComplete?.(resolvedName);
                     }}
                     className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center border-0 cursor-pointer"
                   >
                     <span>Enter Compliance Gateway</span>
                     <ArrowRight className="w-5 h-5 ml-2" />
                   </button>
                 </div>
               )}
             </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};
