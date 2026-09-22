import React from 'react';
import { PremiumAddonConsole } from '../components/dashboard/PremiumAddonConsole';
import { useNotification } from '../context/NotificationContext';

export const EdtechShieldAddon: React.FC = () => {
  const { showToast } = useNotification();
  
  const addonDef = {
    id: "edtech-shield",
    name: "Edtech Shield",
    category: "Education & Minors",
    actId: "GDPR-K / COPPA",
    desc: "Automated age-gating, minor consent management, and educational data privacy compliance.",
    price: "$799/mo",
    score: 94,
    colorClass: "bg-blue-50/70 border-blue-200/50 text-blue-700",
    icon: "GraduationCap",
    isActiveGlobally: true
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edtech Shield</h1>
        <p className="text-slate-500 mt-1">Manage minor data consent and education sector compliance.</p>
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
