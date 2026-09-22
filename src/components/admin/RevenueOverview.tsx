import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { DollarSign, TrendingUp, CreditCard, Building2, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { subscriptionBillingEngine, TenantSubscription } from '../../services/SubscriptionBillingEngine';

interface RevenueOverviewProps {
  subscriptions?: TenantSubscription[];
  isDarkMode?: boolean;
}

export const RevenueOverview: React.FC<RevenueOverviewProps> = ({ subscriptions, isDarkMode = false }) => {
  const [mrrPeriod, setMrrPeriod] = useState<'6m' | '12m'>('6m');

  const activeSubs = (subscriptions || subscriptionBillingEngine.getAllSubscriptions()).filter(
    (s) => s.status === 'ACTIVE' || s.status === 'GRACE_PERIOD'
  );

  const plans = subscriptionBillingEngine.getAllPlans();
  const planMap = new Map(plans.map((p) => [p.id, p]));

  // Calculate current total MRR
  const totalMrrUsd = activeSubs.reduce((acc, sub) => {
    if (sub.customPriceOverrideUsd !== undefined) {
      return acc + sub.customPriceOverrideUsd;
    }
    const plan = planMap.get(sub.planId);
    if (!plan) return acc + 49;
    const monthlyRate = plan.billingCycle === 'YEARLY' ? Math.round(plan.basePriceUsd / 12) : plan.basePriceUsd;
    return acc + monthlyRate;
  }, 0);

  // Breakdown by plan tier
  const tierBreakdown = plans.map((plan) => {
    const subsOnPlan = activeSubs.filter((s) => s.planId === plan.id);
    const revenue = subsOnPlan.reduce((sum, s) => {
      if (s.customPriceOverrideUsd !== undefined) return sum + s.customPriceOverrideUsd;
      return sum + (plan.billingCycle === 'YEARLY' ? Math.round(plan.basePriceUsd / 12) : plan.basePriceUsd);
    }, 0);
    return {
      id: plan.id,
      name: plan.displayName,
      count: subsOnPlan.length,
      revenue
    };
  });

  // Monthly historical MRR data (simulated 12 months with realistic growth trajectory)
  const full12MonthData = [
    { month: 'Oct 25', basic: 147, pro: 598, enterprise: 1499, totalMrr: 2244 },
    { month: 'Nov 25', basic: 196, pro: 897, enterprise: 1499, totalMrr: 2592 },
    { month: 'Dec 25', basic: 245, pro: 1196, enterprise: 2998, totalMrr: 4439 },
    { month: 'Jan 26', basic: 294, pro: 1495, enterprise: 2998, totalMrr: 4787 },
    { month: 'Feb 26', basic: 343, pro: 1794, enterprise: 4497, totalMrr: 6634 },
    { month: 'Mar 26', basic: 392, pro: 2093, enterprise: 4497, totalMrr: 6982 },
    { month: 'Apr 26', basic: 441, pro: 2392, enterprise: 5996, totalMrr: 8829 },
    { month: 'May 26', basic: 490, pro: 2691, enterprise: 5996, totalMrr: 9177 },
    { month: 'Jun 26', basic: 539, pro: 2990, enterprise: 7495, totalMrr: 11024 },
    { month: 'Jul 26', basic: 588, pro: 3289, enterprise: 7495, totalMrr: 11372 },
    { month: 'Aug 26', basic: 637, pro: 3588, enterprise: 8994, totalMrr: 13219 },
    { month: 'Sep 26', basic: 686, pro: 3887, enterprise: 10493, totalMrr: totalMrrUsd > 0 ? totalMrrUsd : 15066 }
  ];

  const chartData = mrrPeriod === '6m' ? full12MonthData.slice(6) : full12MonthData;

  return (
    <div className="p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1">
            <TrendingUp className="w-3 h-3 text-emerald-500" /> MRR Analytics &amp; SaaS Health
          </div>
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            Monthly Recurring Revenue (MRR) Overview
          </h3>
          <p className="text-xs text-slate-500">Visualizing active subscription recurring revenue and tier distribution.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Top Metric Highlight Badge */}
          <div className="hidden md:flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1.5 rounded-xl">
            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <div>
              <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold uppercase">Current MRR</div>
              <div className="text-sm font-black text-emerald-950 dark:text-emerald-200">${totalMrrUsd.toLocaleString()} USD</div>
            </div>
          </div>

          {/* Timeframe selector */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setMrrPeriod('6m')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                mrrPeriod === '6m'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              6 Months
            </button>
            <button
              onClick={() => setMrrPeriod('12m')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                mrrPeriod === '12m'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              12 Months
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <div className="text-slate-400 font-bold text-[10px] uppercase">Active Subscriptions</div>
          <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{activeSubs.length} Tenants</div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5 mt-1">
            <ArrowUpRight className="w-3 h-3" /> 100% Retained
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <div className="text-slate-400 font-bold text-[10px] uppercase">Average Revenue Per User (ARPU)</div>
          <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
            ${activeSubs.length > 0 ? Math.round(totalMrrUsd / activeSubs.length).toLocaleString() : 0}/mo
          </div>
          <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold mt-1">High Enterprise Mix</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <div className="text-slate-400 font-bold text-[10px] uppercase">Annual Run Rate (ARR)</div>
          <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
            ${(totalMrrUsd * 12).toLocaleString()} USD
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">Projected Annual</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <div className="text-slate-400 font-bold text-[10px] uppercase">Active Plan Breakdown</div>
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 space-y-0.5">
            {tierBreakdown.map((t) => (
              <div key={t.id} className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500">{t.name}:</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">{t.count} ({Math.round((t.count / (activeSubs.length || 1)) * 100)}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recharts Bar Chart Container */}
      <div className="pt-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Monthly Recurring Revenue ($ USD)</span>
          <div className="flex items-center gap-4 text-[11px] font-bold">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-indigo-600"></span> Enterprise</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-violet-500"></span> Pro Growth</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-emerald-500"></span> Basic Starter</span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#E2E8F0'} />
              <XAxis dataKey="month" stroke={isDarkMode ? '#94A3B8' : '#64748B'} fontSize={10} />
              <YAxis
                stroke={isDarkMode ? '#94A3B8' : '#64748B'}
                fontSize={10}
                tickFormatter={(val) => `$${val}`}
              />
              <Tooltip
                formatter={(value: any) => [`$${Number(value).toLocaleString()} USD`, 'MRR']}
                contentStyle={{
                  backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF',
                  borderColor: isDarkMode ? '#334155' : '#CBD5E1',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              />
              <Bar dataKey="enterprise" name="Enterprise Tier" stackId="a" fill="#4F46E5" radius={[0, 0, 0, 0]} />
              <Bar dataKey="pro" name="Pro Growth Tier" stackId="a" fill="#8B5CF6" radius={[0, 0, 0, 0]} />
              <Bar dataKey="basic" name="Basic Starter Tier" stackId="a" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
