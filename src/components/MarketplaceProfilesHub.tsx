import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, Users, ShoppingCart, Globe, ShieldCheck, 
  ChevronRight, Plus, Pencil, ExternalLink, Briefcase, 
  GraduationCap, Award, Link as LinkIcon, Lock, Search,
  TrendingUp, FileText, CheckCircle2, AlertCircle, Info,
  BadgeCheck, UserCheck, LayoutGrid, ListFilter, XCircle,
  Eye, HeartPulse
} from 'lucide-react';
import { fetchWithRetry } from '../lib/api-client';

interface CompanyProfile {
  legal_structure: string;
  founded_year: number;
  employee_count_range: string;
  annual_revenue_range: string;
  headquarters_address: string;
  website_url: string;
  company_description: string;
  logo_url: string;
  cover_image_url: string;
  industry_tags: string[];
  stock_exchange_listed: boolean;
  stock_ticker: string;
}

interface PersonnelMember {
  id: string;
  personnel_profile_id: string;
  full_name: string;
  headline: string;
  profile_photo_url: string;
  position_title: string;
  governing_body_type: string;
  is_authorized_signatory: boolean;
  appointed_date: string;
  nationality: string;
}

export const MarketplaceProfilesHub: React.FC<{ tenantId: string }> = ({ tenantId }) => {
  const [activeSection, setActiveSection] = useState<'profile' | 'governance' | 'marketplace'>('profile');
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [governance, setGovernance] = useState<PersonnelMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [tenantId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profileRes, govRes] = await Promise.all([
        fetchWithRetry(`/api/v1/client-dashboard/company-profile?tenantId=${tenantId}`).then(r => r.json()),
        fetchWithRetry(`/api/v1/client-dashboard/governing-body?tenantId=${tenantId}`).then(r => r.json())
      ]);

      if (profileRes.success) setProfile(profileRes.profile);
      if (govRes.success) setGovernance(govRes.members || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header & Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-1 flex items-center gap-1 w-fit shadow-sm">
        <button
          onClick={() => setActiveSection('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeSection === 'profile' 
              ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Extended Profile
        </button>
        <button
          onClick={() => setActiveSection('governance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeSection === 'governance' 
              ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          Governing Body
        </button>
        <button
          onClick={() => setActiveSection('marketplace')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeSection === 'marketplace' 
              ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          M&A Marketplace
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeSection === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                {/* Profile Card */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
                    {profile?.cover_image_url && (
                      <img src={profile.cover_image_url} alt="Cover" className="w-full h-full object-cover opacity-50" />
                    )}
                    <div className="absolute -bottom-10 left-8 p-1 bg-white rounded-xl border border-slate-200 shadow-lg">
                      <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center">
                        {profile?.logo_url ? (
                          <img src={profile.logo_url} alt="Logo" className="w-full h-full object-contain p-2" />
                        ) : (
                          <Building2 className="w-10 h-10 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-14 px-5 sm:px-8 pb-8 space-y-4 sm:space-y-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">Acme Corporation Europe</h2>
                        <p className="text-slate-500 flex items-center gap-2 mt-1">
                          <Globe className="w-4 h-4" />
                          {profile?.website_url || 'https://acme-corp.eu'}
                        </p>
                      </div>
                      <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
                        <Pencil className="w-4 h-4" />
                        Edit Profile
                      </button>
                    </div>

                    <div className="prose prose-slate max-w-none">
                      <p className="text-slate-600 leading-relaxed">
                        {profile?.company_description || "Acme Corporation is a leading provider of advanced compliance solutions for the European market. Specializing in AI Act alignment and GDPR automation, we help enterprises scale safely across jurisdictions."}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {(profile?.industry_tags || ['SaaS', 'RegTech', 'Enterprise', 'AI/ML']).map(tag => (
                        <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Legal Structure</p>
                        <p className="text-sm font-semibold text-slate-700 mt-1">{profile?.legal_structure || 'GmbH'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Founded</p>
                        <p className="text-sm font-semibold text-slate-700 mt-1">{profile?.founded_year || '2019'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Employees</p>
                        <p className="text-sm font-semibold text-slate-700 mt-1">{profile?.employee_count_range || '51-200'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Revenue</p>
                        <p className="text-sm font-semibold text-slate-700 mt-1">{profile?.annual_revenue_range || '€10M - €50M'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Compliance Posture Summary */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 lg:p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-bold text-slate-900">Verified Compliance Posture</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { label: 'GDPR Article 30', status: 'Verified', date: '2026-01-12' },
                      { label: 'AI Act Annex IV', status: 'Verified', date: '2026-02-05' },
                      { label: 'ISO 27001:2022', status: 'Verified', date: '2025-11-20' }
                    ].map((item, idx) => (
                      <div key={idx} className="p-4 bg-emerald-50/50 rounded-lg border border-emerald-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-emerald-800 uppercase tracking-tight">{item.label}</span>
                          <BadgeCheck className="w-4 h-4 text-emerald-600" />
                        </div>
                        <p className="text-lg font-bold text-slate-900">{item.status}</p>
                        <p className="text-xs text-slate-500 mt-1">Last audit: {item.date}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {/* Public Trust Score */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 lg:p-6 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-4">Public Trust Profile</h3>
                  <div className="flex items-center justify-center py-4 sm:py-6">
                    <div className="relative w-32 h-32">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={364} strokeDashoffset={364 * (1 - 0.98)} className="text-indigo-600 transition-all duration-1000" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-indigo-700">98</span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Score</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 text-center">Top 1% of compliant organizations in your sector.</p>
                </div>

                {/* Stock Info */}
                {profile?.stock_exchange_listed && (
                  <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 lg:p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-slate-900">Stock Exchange</h3>
                      <TrendingUp className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Ticker</span>
                        <span className="font-bold text-slate-700">{profile.stock_ticker}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Exchange</span>
                        <span className="font-medium text-slate-700">Deutsche Börse (XETRA)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'governance' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Governing Body</h3>
                  <p className="text-sm text-slate-500">Managing directors, board members, and authorized signatories.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-colors">
                  <Plus className="w-4 h-4" />
                  Add Member
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {governance.length > 0 ? (
                  governance.map((member) => (
                    <motion.div
                      key={member.id}
                      whileHover={{ y: -4 }}
                      className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 lg:p-6 shadow-sm hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full bg-slate-100 overflow-hidden border-2 border-slate-100">
                            {member.profile_photo_url ? (
                              <img src={member.profile_photo_url} alt={member.full_name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xl uppercase">
                                {member.full_name.charAt(0)}
                              </div>
                            )}
                          </div>
                          {member.is_authorized_signatory && (
                            <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-sm">
                              <ShieldCheck className="w-4 h-4 text-indigo-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                            {member.full_name}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium truncate">{member.position_title}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold uppercase tracking-wider">
                              {member.governing_body_type.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="mt-6 pt-4 border-t border-slate-50 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Appointed</span>
                          <span className="font-medium text-slate-600">{new Date(member.appointed_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Nationality</span>
                          <span className="font-medium text-slate-600">{member.nationality}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full py-12 flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <UserCheck className="w-12 h-12 text-slate-300 mb-4" />
                    <p className="text-slate-500 font-medium">No governing body members listed yet.</p>
                    <button className="mt-4 text-indigo-600 font-bold text-sm hover:underline">
                      Populate from personnel database
                    </button>
                  </div>
                )}
              </div>

              {/* Change Log Mini-view */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 lg:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-900">Governance Audit Log</h3>
                  <button className="text-xs font-bold text-indigo-600 hover:underline">View Full History</button>
                </div>
                <div className="space-y-4">
                  {[
                    { date: '2026-08-10', action: 'Appointed', person: 'Dr. Sarah Weber', role: 'Managing Director' },
                    { date: '2026-07-15', action: 'Departed', person: 'Marcus Thorne', role: 'CTO' },
                    { date: '2026-06-01', action: 'Granted Signing Rights', person: 'Elena Rossi', role: 'Legal Counsel' }
                  ].map((log, i) => (
                    <div key={i} className="flex gap-4 items-start pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                      <div className={`mt-1 p-1.5 rounded-full ${log.action === 'Departed' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                        {log.action === 'Departed' ? <XCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">
                          <span className="font-bold">{log.action}</span>: {log.person}
                        </p>
                        <p className="text-xs text-slate-500">{log.role}</p>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">{log.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'marketplace' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div className="md:col-span-2 space-y-4 sm:space-y-6">
                  {/* Readiness Banner */}
                  <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-5 sm:p-6 lg:p-8 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-5 sm:p-6 lg:p-8 opacity-10">
                      <TrendingUp className="w-48 h-48" />
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-2xl font-bold mb-2">M&A Readiness & Marketplace</h3>
                      <p className="text-indigo-100 max-w-lg mb-6">
                        Anonymously list your organization for investment, acquisition, or merger. 
                        Our zero-knowledge deal rooms ensure complete security before disclosure.
                      </p>
                      <div className="flex flex-wrap gap-4">
                        <button className="px-6 py-2.5 bg-white text-indigo-600 rounded-xl text-sm font-bold shadow-sm hover:bg-indigo-50 transition-all">
                          Manage Readiness Flags
                        </button>
                        <button className="px-6 py-2.5 bg-indigo-500/30 border border-indigo-400/50 text-white rounded-xl text-sm font-bold hover:bg-indigo-500/40 transition-all">
                          Browse Active Investors
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Active Listing Status */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 lg:p-8 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-lg font-bold text-slate-900">Your Marketplace Presence</h3>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider">
                        Active
                      </span>
                    </div>

                    <div className="p-4 sm:p-5 lg:p-6 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Current Teaser</p>
                          <h4 className="text-xl font-bold text-slate-800">Leading European RegTech Platform Specialized in AI Act Alignment</h4>
                        </div>
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed mb-6">
                        High-growth SaaS organization with 98% compliance readiness score. Proprietary automation engine for cross-border data sharding and sovereign cloud governance. Multiple Fortune 500 clients in Financial Services and Healthcare sectors.
                      </p>
                      <div className="flex items-center gap-4 sm:gap-6">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-bold text-slate-700">42</span>
                          <span className="text-xs text-slate-400">Views</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <HeartPulse className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-bold text-slate-700">8</span>
                          <span className="text-xs text-slate-400">Interests</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-bold text-slate-700">3</span>
                          <span className="text-xs text-slate-400">Signed NDAs</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  {/* Readiness Checklist */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 lg:p-6 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-6">Readiness Checklist</h3>
                    <div className="space-y-4">
                      {[
                        { label: 'KYC/KYB Verification', done: true },
                        { label: 'Clean Audit History', done: true },
                        { label: 'DPA Coverage > 90%', done: true },
                        { label: 'Authorized Signatories Set', done: true },
                        { label: 'Public Trust Score > 80', done: true },
                        { label: 'Deal Room Collateral', done: false }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          {item.done ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-slate-200 flex-shrink-0" />
                          )}
                          <span className={`text-sm font-medium ${item.done ? 'text-slate-700' : 'text-slate-400'}`}>
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-8 pt-6 border-t border-slate-100">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase">Readiness Score</span>
                        <span className="text-lg font-bold text-indigo-600">84%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600" style={{ width: '84%' }} />
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-indigo-50 rounded-xl p-4 sm:p-5 lg:p-6 border border-indigo-100">
                    <h3 className="font-bold text-indigo-900 mb-4">Quick Setup</h3>
                    <div className="space-y-2">
                      <button className="w-full text-left p-3 bg-white rounded-lg border border-indigo-100 text-xs font-bold text-indigo-700 hover:shadow-sm transition-all flex items-center justify-between group">
                        Create Investor Teaser
                        <Plus className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                      <button className="w-full text-left p-3 bg-white rounded-lg border border-indigo-100 text-xs font-bold text-indigo-700 hover:shadow-sm transition-all flex items-center justify-between group">
                        Configure NDA Workflow
                        <Lock className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                      <button className="w-full text-left p-3 bg-white rounded-lg border border-indigo-100 text-xs font-bold text-indigo-700 hover:shadow-sm transition-all flex items-center justify-between group">
                        Upload Financial Docs
                        <FileText className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
