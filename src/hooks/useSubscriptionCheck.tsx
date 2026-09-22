import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Lock, 
  Sparkles, 
  ShieldAlert, 
  ChevronRight, 
  CheckCircle,
  CreditCard,
  Crown,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { UpgradePlanModal } from '../components/admin/UpgradePlanModal';
import { useNotification } from '../context/NotificationContext';

export type PlanLevel = 'basic' | 'pro' | 'enterprise';

export interface FeatureRequirement {
  id: string;
  name: string;
  requiredPlan: PlanLevel;
  description: string;
}

// Map high-tier tools and compliance modules to their required plan level
export const FEATURE_REGISTRY: Record<string, FeatureRequirement> = {
  // Pro level tools
  'soc2': {
    id: 'soc2',
    name: 'SOC2 Type II Compliance Hub',
    requiredPlan: 'pro',
    description: 'Continuous SOC2 monitoring, controls mapping, and evidence collections.'
  },
  'aml-kyc': {
    id: 'aml-kyc',
    name: 'Real-time e-KYC / Onboarding Handshake',
    requiredPlan: 'pro',
    description: 'Enforce AML and KYC verification workflows natively.'
  },
  'scanhub': {
    id: 'scanhub',
    name: 'Advanced Scan Engine Hub',
    requiredPlan: 'pro',
    description: 'Run deep scans across cross-border databases and flag PII exposure risk.'
  },
  'b2g-interactions': {
    id: 'b2g-interactions',
    name: 'B2G Interaction Portal',
    requiredPlan: 'pro',
    description: 'Transmit compliance telemetry directly to national regulatory agencies.'
  },
  'verification-toggles': {
    id: 'verification-toggles',
    name: 'Verification & Bypass Controls',
    requiredPlan: 'pro',
    description: 'Override regulatory blocks and customize verification checklists.'
  },
  // Enterprise level tools
  'llm-provider-config': {
    id: 'llm-provider-config',
    name: 'LLM Infrastructure Control Studio',
    requiredPlan: 'enterprise',
    description: 'Configure custom LLM models, vector stores, and custom regulatory grounding.'
  },
  'privacy-policy-gen': {
    id: 'privacy-policy-gen',
    name: 'AI Privacy Policy & DPIA Generator',
    requiredPlan: 'enterprise',
    description: 'Generate legally binding GDPR and CPRA privacy policies using deep legal reasoning.'
  },
  'quantum-engine': {
    id: 'quantum-engine',
    name: 'Quantum-Safe Data Vault',
    requiredPlan: 'enterprise',
    description: 'Deploy Post-Quantum Cryptographic (PQC) encryption layers for highly sensitive sharding.'
  },
  'breach-simulation': {
    id: 'breach-simulation',
    name: 'Adversarial Breach Simulator',
    requiredPlan: 'enterprise',
    description: 'Run synthetic compliance leaks to audit automatic failovers and enclaves.'
  },
  // Premium high-technology stack additions
  'premium-pulse': {
    id: 'premium-pulse',
    name: 'Realtime Sovereign Pulse',
    requiredPlan: 'pro',
    description: 'Live SSE compliance event bus: heartbeat, alerts and AI co-pilot consultations streamed in real time.'
  },
  'forensic-seals': {
    id: 'forensic-seals',
    name: 'Quantum Forensic Seal Vault',
    requiredPlan: 'pro',
    description: 'Tamper-evident SHA-512 document seals with QR anchoring and hash-chain verification.'
  },
  'identity-attestation': {
    id: 'identity-attestation',
    name: 'Device Identity Attestation',
    requiredPlan: 'pro',
    description: 'TOTP/HMAC device binding with QR provisioning and 6-digit challenge verification.'
  },
  'ai-copilot': {
    id: 'ai-copilot',
    name: 'AI Compliance Co-Pilot',
    requiredPlan: 'enterprise',
    description: 'Gemini-grounded sovereign counsel that reads your live pulse, sealed evidence and compliance posture.'
  },
  'compliance-universe': {
    id: 'compliance-universe',
    name: 'Compliance Universe d3 Graph',
    requiredPlan: 'pro',
    description: 'Interactive d3 force-graph mapping sub-entities ↔ frameworks ↔ forensic seals ↔ live pulse events in real time.'
  },
  'sector-pack-store': {
    id: 'sector-pack-store',
    name: 'Sector Pack Store',
    requiredPlan: 'pro',
    description: 'Browse and enable all sector compliance packs (automotive, logistics, medical devices, cyber…), each with lifecycle scoring and live tenant enablement.'
  }
};

const PLAN_HIERARCHY: Record<PlanLevel, number> = {
  'basic': 1,
  'pro': 2,
  'enterprise': 3
};

export const getPlanLabel = (plan: PlanLevel): string => {
  if (plan === 'enterprise') return 'Sovereign Enterprise';
  if (plan === 'pro') return 'Pro Enterprise';
  return 'Starter Plan';
};

export const useSubscriptionCheck = (tenantId: string = 'admin-console') => {
  const [currentPlan, setCurrentPlan] = useState<PlanLevel>(() => {
    const saved = localStorage.getItem(`sovereign_plan_${tenantId}`);
    return (saved as PlanLevel) || 'basic';
  });

  const { showToast } = useNotification();

  const updatePlan = (plan: PlanLevel) => {
    setCurrentPlan(plan);
    localStorage.setItem(`sovereign_plan_${tenantId}`, plan);
    showToast(`Subscription plan upgraded to ${getPlanLabel(plan)}!`, 'success');
  };

  const hasAccessTo = (featureId: string): boolean => {
    // 1. Check SaaS Admin per-tenant feature overrides set in AdminEntitlements
    try {
      const savedOverrides = localStorage.getItem(`entitlement_overrides_${tenantId}`);
      if (savedOverrides) {
        const overrides = JSON.parse(savedOverrides);
        if (overrides[featureId]) {
          const status = overrides[featureId].status;
          if (status === 'disabled' || status === 'upgrade') return false;
          if (status === 'enabled') return true;
        }
      }
    } catch (e) {
      // Ignore parsing error and fall back to plan requirement
    }

    // 2. Check standard feature registry required plan level
    const req = FEATURE_REGISTRY[featureId];
    if (!req) return true; // Standard features are open to all

    const currentWeight = PLAN_HIERARCHY[currentPlan] || 1;
    const requiredWeight = PLAN_HIERARCHY[req.requiredPlan] || 1;

    return currentWeight >= requiredWeight;
  };

  return {
    currentPlan,
    updatePlan,
    hasAccessTo,
    getFeatureRequirement: (featureId: string) => FEATURE_REGISTRY[featureId]
  };
};

interface UpgradeGateProps {
  featureId: string;
  tenantId?: string;
  tenantName?: string;
  children: React.ReactNode;
}

export const UpgradeGate: React.FC<UpgradeGateProps> = ({
  featureId,
  tenantId = 'admin-console',
  tenantName = 'Acme Corporation Europe',
  children
}) => {
  const { currentPlan, hasAccessTo, getFeatureRequirement, updatePlan } = useSubscriptionCheck(tenantId);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const requirement = getFeatureRequirement(featureId);

  // If user has sufficient subscription tier access, render children
  if (!requirement || hasAccessTo(featureId)) {
    return <>{children}</>;
  }

  const isEnterpriseReq = requirement.requiredPlan === 'enterprise';

  return (
    <div className="relative">
      {/* Blurred preview of the tool behind */}
      <div className="pointer-events-none select-none filter blur-sm opacity-25">
        {children}
      </div>

      {/* Upgrade Required overlay overlay */}
      <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-xl bg-slate-900 border-2 border-slate-800 rounded-2xl shadow-2xl p-4 sm:p-5 lg:p-6 text-white text-center relative overflow-hidden"
        >
          {/* Decorative Corner Glow */}
          <div className={`absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-20 ${
            isEnterpriseReq ? 'bg-purple-500' : 'bg-indigo-500'
          }`} />

          <div className="flex flex-col items-center">
            {/* Crown or Shield Icons */}
            <div className={`p-4 rounded-full mb-4 border ${
              isEnterpriseReq 
                ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' 
                : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
            }`}>
              {isEnterpriseReq ? (
                <Crown className="w-8 h-8 animate-bounce" />
              ) : (
                <Zap className="w-8 h-8 animate-pulse" />
              )}
            </div>

            <span className={`text-[10px] font-mono font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full mb-3 border ${
              isEnterpriseReq 
                ? 'bg-purple-950/40 border-purple-800 text-purple-300' 
                : 'bg-indigo-950/40 border-indigo-800 text-indigo-300'
            }`}>
              Upgrade Required &bull; {getPlanLabel(requirement.requiredPlan)} Tier
            </span>

            <h3 className="text-xl font-black text-white tracking-tight">
              Unlock {requirement.name}
            </h3>

            <p className="text-slate-400 text-xs mt-2 leading-relaxed max-w-sm">
              {requirement.description} Your workspace is currently on the{' '}
              <strong className="text-slate-200">{getPlanLabel(currentPlan)}</strong>. Upgrade now to enable this sovereign capability.
            </p>

            {/* Quick Benefits Check list */}
            <div className="my-5 w-full bg-slate-950/40 border border-slate-800/60 rounded-xl p-3.5 text-left text-xs space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-slate-300">Natively compliant with all latest EU Acts</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-slate-300">Continuous background drift checks</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-slate-300">Sovereign cloud data residency lockups</span>
              </div>
            </div>

            {/* CTA Trigger */}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className={`flex-1 py-2.5 px-4 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition border-0 cursor-pointer ${
                  isEnterpriseReq
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/10'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Select New Subscription Tier</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              
              <button
                type="button"
                onClick={() => {
                  // Simulate self-serve demo bypass/quick upgrade for previewing
                  const targetPlan = requirement.requiredPlan;
                  updatePlan(targetPlan);
                }}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700/60 transition cursor-pointer"
              >
                Simulate Bypass
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Upgrade Subscription Modal popup */}
      <UpgradePlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tenantId={tenantId}
        tenantName={tenantName}
        currentPlanId={currentPlan === 'basic' ? 'price_starter' : currentPlan === 'pro' ? 'price_pro' : 'price_sovereign'}
        onSuccess={() => {
          setIsModalOpen(false);
          // Simulate instant upgrade on mock Stripe completion
          updatePlan(requirement.requiredPlan);
        }}
      />
    </div>
  );
};
