import React from 'react';
import { PremiumAddonConsole } from '../components/dashboard/PremiumAddonConsole';
import { useNotification } from '../context/NotificationContext';

export const LogisticSupplyChainAddon: React.FC = () => {
  const { showToast } = useNotification();
  
  const addonDef = {
    id: "logistics-supply-chain",
    name: "Logistics & Supply Chain",
    category: "Operations",
    actId: "CSDDD",
    desc: "Supply chain due diligence, ESG vendor tracking, and cross-border logistics data mapping.",
    price: "$1,099/mo",
    score: 91,
    colorClass: "bg-amber-50/70 border-amber-200/50 text-amber-700",
    icon: "Truck",
    isActiveGlobally: true
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Logistics & Supply Chain</h1>
        <p className="text-slate-500 mt-1">Monitor CSDDD supply chain compliance and third-party operational risk.</p>
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
