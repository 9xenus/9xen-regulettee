import React from 'react';
import { PremiumAddonConsole } from '../components/dashboard/PremiumAddonConsole';
import { useNotification } from '../context/NotificationContext';

export const HealthtechAddon: React.FC = () => {
  const { showToast } = useNotification();
  
  const addonDef = {
    id: "healthtech",
    name: "Healthtech (EHDS)",
    category: "Healthcare & Life Sciences",
    actId: "EHDS",
    desc: "EHDS Compliance, Patient Consent, and PHI Anonymization structures.",
    price: "$999/mo",
    score: 88,
    colorClass: "bg-rose-50/70 border-rose-200/50 text-rose-700",
    icon: "HeartPulse",
    isActiveGlobally: true
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Healthtech & EHDS Addon</h1>
        <p className="text-slate-500 mt-1">Manage health data privacy, electronic health records (EHDS) constraints, and PHI.</p>
      </div>
      <PremiumAddonConsole
        addon={addonDef}
        tenantId="org_1"
        onUpdateConfig={async () => {}}
        showToast={showToast}
      />
    </div>
  );
};
