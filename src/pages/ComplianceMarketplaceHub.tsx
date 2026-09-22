import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Award, ShieldCheck, CheckCircle, 
  DollarSign, Star, Clock, Lock, ArrowRight, RefreshCw 
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export const ComplianceMarketplaceHub: React.FC = () => {
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState<'packages' | 'pros' | 'escrow'>('packages');
  const [packages, setPackages] = useState<any[]>([]);
  const [pros, setPros] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Escrow state
  const [selectedPackage, setSelectedPackage] = useState('APPEAL_RESPONSE');
  const [selectedProId, setSelectedProId] = useState('');
  const [escrowResult, setEscrowResult] = useState<any | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resPkg, resPro] = await Promise.all([
        fetch('/api/v1/marketplace/packages'),
        fetch('/api/v1/marketplace/professionals')
      ]);
      const dataPkg = await resPkg.json();
      const dataPro = await resPro.json();
      if (dataPkg.success) setPackages(dataPkg.data || []);
      if (dataPro.success) {
        setPros(dataPro.data || []);
        if (dataPro.data.length > 0) setSelectedProId(dataPro.data[0].id);
      }
    } catch (err) {
      console.warn('Failed to load marketplace data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFundEscrow = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const pkg = packages.find(p => p.code === selectedPackage);
      const res = await fetch('/api/v1/marketplace/escrow/fund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professionalId: selectedProId,
          packageCode: selectedPackage,
          amount: pkg?.base_price || 2500,
          currency: 'USD'
        })
      });
      const data = await res.json();
      if (data.success) {
        setEscrowResult(data.data);
      } else {
        showToast(data.error, 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Award className="w-4 h-4" />
            <span>Verified Human Expertise Ecosystem</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Compliance Professional Marketplace</h1>
          <p className="text-sm text-slate-400 mt-1">
            Curated network of Verified Compliance Advocates, ISAE Auditors &amp; Trainers. Escrow milestone protections, 18% commission rails, and system-verified outcome feedback.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('packages')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-colors cursor-pointer ${
              activeTab === 'packages' ? 'bg-emerald-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400'
            }`}
          >
            Fixed-Scope Packages
          </button>
          <button
            onClick={() => setActiveTab('pros')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-colors cursor-pointer ${
              activeTab === 'pros' ? 'bg-emerald-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400'
            }`}
          >
            VerifiedPros Registry
          </button>
          <button
            onClick={() => setActiveTab('escrow')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-colors cursor-pointer ${
              activeTab === 'escrow' ? 'bg-emerald-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400'
            }`}
          >
            Escrow Milestone Rails
          </button>
        </div>
      </div>

      {/* Tab 1: Fixed-Scope Packages */}
      {activeTab === 'packages' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {packages.map((pkg) => (
            <div 
              key={pkg.id} 
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-bold uppercase">
                  {pkg.category}
                </span>
                <h4 className="text-base font-bold text-white mt-2 mb-1">{pkg.title}</h4>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">{pkg.description}</p>
              </div>

              <div>
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono block">Standard Fixed Price</span>
                    <span className="text-base font-bold font-mono text-white">
                      ${pkg.base_price.toLocaleString()} {pkg.currency}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 font-mono block">Delivery SLA</span>
                    <span className="text-xs font-mono text-cyan-400">{pkg.estimated_days} Days</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedPackage(pkg.code);
                    setActiveTab('escrow');
                  }}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  Initiate Escrow <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: VerifiedPros Directory */}
      {activeTab === 'pros' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pros.map((p) => (
            <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-800/60 uppercase">
                    {p.tier} TIER
                  </span>
                  <h4 className="text-base font-bold text-white mt-1">{p.full_name}</h4>
                  <span className="text-xs text-slate-400">{p.type} • {p.country_id} Jurisdiction</span>
                </div>
                <div className="text-right font-mono">
                  <div className="text-sm font-bold text-white">${p.hourly_rate}/hr</div>
                  <div className="text-[10px] text-slate-500">{p.currency}</div>
                </div>
              </div>

              {/* ZK Badge */}
              <div className="my-3 p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  VerifiedPro ZK Badge
                </span>
                <span className="text-cyan-400 font-bold">{p.badge_zk_ref}</span>
              </div>

              {/* Verified Metrics */}
              <div className="grid grid-cols-3 gap-2 text-center py-2 border-y border-slate-800/80 my-3 font-mono text-xs">
                <div>
                  <div className="text-slate-500 text-[10px]">Verified Cases</div>
                  <div className="font-bold text-white">{p.verified_outcomes_count}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px]">Success Rate</div>
                  <div className="font-bold text-emerald-400">{p.success_rate_pct}%</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px]">Rating</div>
                  <div className="font-bold text-amber-400 flex items-center justify-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400" /> {p.rating_avg}
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 space-y-1 mt-2">
                <span className="text-slate-500 font-mono block">Practice Specialties:</span>
                <div className="flex flex-wrap gap-1">
                  {p.specialties?.map((s: string, idx: number) => (
                    <span key={idx} className="px-2 py-0.5 bg-slate-800 rounded text-slate-300 text-[10px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Escrow Milestone Rails */}
      {activeTab === 'escrow' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase mb-1">
            <Lock className="w-4 h-4" />
            <span>Escrow &amp; Double-Entry Commission Rails</span>
          </div>
          <h3 className="text-base font-bold text-white mb-2">Fund Milestone Escrow</h3>
          <p className="text-xs text-slate-400 mb-6">
            Client money is held in segregated escrow. Funds are released only upon milestone verification, with a 7-day auto-approve review window and 18% standard platform commission.
          </p>

          <form onSubmit={handleFundEscrow} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Select Fixed-Scope Package</label>
              <select
                value={selectedPackage}
                onChange={(e) => setSelectedPackage(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                {packages.map((pkg) => (
                  <option key={pkg.code} value={pkg.code}>
                    {pkg.title} (${pkg.base_price} {pkg.currency})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Select Matched VerifiedPro</label>
              <select
                value={selectedProId}
                onChange={(e) => setSelectedProId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                {pros.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name} ({p.type} • {p.tier} Tier • {p.success_rate_pct}% Success)
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <DollarSign className="w-4 h-4" /> Fund Escrow &amp; Begin Engagement
            </button>
          </form>

          {escrowResult && (
            <div className="mt-6 p-4 bg-emerald-950/60 border border-emerald-800 rounded-xl space-y-2 text-xs font-mono">
              <div className="text-emerald-400 font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Escrow Successfully Funded &amp; Locked
              </div>
              <div className="text-slate-300">Engagement ID: <strong>{escrowResult.engagementId}</strong></div>
              <div className="text-slate-300">Escrow ID: <strong>{escrowResult.escrowId}</strong></div>
              <div className="text-slate-300">Funded Amount: <strong>${escrowResult.fundedAmount} USD</strong></div>
              <div className="text-cyan-400">Auto-Approve Window: {escrowResult.autoApproveDays} Days</div>
              <div className="text-[11px] text-slate-400 mt-2">
                Platform Commission (18%) will be credited upon verified milestone sign-off.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
