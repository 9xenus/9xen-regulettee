import React from 'react';
import { ShoppingCart, CheckCircle2, ShieldAlert, Globe, ScanSearch } from 'lucide-react';
import { PremiumAddonConsole } from '../components/dashboard/PremiumAddonConsole';
import { useNotification } from '../context/NotificationContext';

const addonDef = {
  id: "ecommerce-eu",
  name: "EU eCommerce Compliance",
  category: "Retail & Commerce",
  actId: "DSA",
  desc: "Omnibus price transparency, geo-blocking ban enforcement, DSA online-marketplace trader traceability, consumer rights automation and dark-pattern AI scanning across every storefront.",
  price: "$899/mo",
  score: 84,
  colorClass: "bg-indigo-50/70 border-indigo-200/50 text-indigo-700",
  icon: "ShoppingCart",
  isActiveGlobally: true,
  tiers: { STARTER: 499, PRO: 899, ENTERPRISE: 1799 },
  features: [
    "Omnibus price-drop authenticity (prior-price watermarking)",
    "Geo-blocking ban enforcement (Reg. 2018/302)",
    "DSA trader traceability — Know-Your-Seller (KYS)",
    "Dark-pattern detection & removal AI scanner",
    "Online warranty & 14-day return rights automation",
    "Cookie & consent storefront rules (ePrivacy-aligned)",
  ],
};

export const EuEcommerceAddon: React.FC = () => {
  const { showToast } = useNotification();

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-indigo-600" />
          EU eCommerce Compliance Add-On
        </h1>
        <p className="text-slate-500 mt-1">
          Omnibus Directive · Geo-Blocking Regulation 2018/302 · DSA trader traceability · Unfair Commercial Practices — one sovereign enclave.
        </p>
      </div>

      {/* Sector module highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Globe, title: 'Geo-Blocking Ban', desc: 'Detect and auto-disable geo-blocking barriers & unjustified price differentiation (Art. 4).' },
          { icon: ScanSearch, title: 'Dark-Pattern AI Scanner', desc: 'Annex I UCPD pattern detection: hidden costs, subscription traps, confirm-shaming.' },
          { icon: CheckCircle2, title: 'Trader Traceability (KYS)', desc: 'DSA Art. 30 know-your-trader evidence vault for online marketplace sellers.' },
          { icon: ShieldAlert, title: 'Omnibus Price Authenticity', desc: 'Prior-price watermarking & reference date audit for flash-sale legitimacy.' },
        ].map((m) => (
          <div key={m.title} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <m.icon className="w-5 h-5 text-indigo-600 mb-2" />
            <div className="text-sm font-bold text-slate-900">{m.title}</div>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{m.desc}</p>
          </div>
        ))}
      </div>

      <PremiumAddonConsole addon={addonDef} tenantId="org_1" onUpdateConfig={async () => {}} showToast={showToast} />
    </div>
  );
};