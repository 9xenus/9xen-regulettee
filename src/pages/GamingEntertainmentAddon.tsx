import React from 'react';
import { PremiumAddonConsole } from '../components/dashboard/PremiumAddonConsole';
import { useNotification } from '../context/NotificationContext';

export const GamingEntertainmentAddon: React.FC = () => {
  const { showToast } = useNotification();
  
  const addonDef = {
    id: "gaming-entertainment",
    name: "Gaming & Entertainment",
    category: "Media & Gaming",
    actId: "DSA / GDPR",
    desc: "In-game privacy controls, cross-border matchmaking data residency, and DSA moderation.",
    price: "$1,299/mo",
    score: 88,
    colorClass: "bg-purple-50/70 border-purple-200/50 text-purple-700",
    icon: "Gamepad2",
    isActiveGlobally: true
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Gaming & Entertainment Addon</h1>
        <p className="text-slate-500 mt-1">DSA compliance and data residency for gaming platforms.</p>
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
