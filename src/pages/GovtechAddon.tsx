import React from 'react';
import { PremiumAddonConsole } from '../components/dashboard/PremiumAddonConsole';
import { useNotification } from '../context/NotificationContext';

export const GovtechAddon: React.FC = () => {
  const { showToast } = useNotification();
  
  const addonDef = {
    id: "govtech",
    name: "Govtech Addon",
    category: "Public Sector",
    actId: "NIS2 / EUDI",
    desc: "Strict public sector data isolation, zero-trust network policies, and EUDI integration.",
    price: "$2,499/mo",
    score: 98,
    colorClass: "bg-slate-800 text-slate-100",
    icon: "Landmark",
    isActiveGlobally: true
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Govtech Shield</h1>
        <p className="text-slate-500 mt-1">Public sector compliance and sovereign infrastructure monitoring.</p>
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
