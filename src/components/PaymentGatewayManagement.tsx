import React, { useState } from 'react';
import { CreditCard, CheckCircle2, AlertTriangle, Settings, Activity, Euro, Globe, ChevronRight, RefreshCw, Smartphone, Key, Lock, BellRing, ShieldCheck } from 'lucide-react';
import { NexiGatewayConfigurator } from './payment/NexiGatewayConfigurator';

export default function PaymentGatewayManagement() {
  const [activeTab, setActiveTab] = useState<'stripe' | 'sepa' | 'paypal' | 'nexi'>('stripe');

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Stripe Gateway</span>
              <span className="text-xl font-black text-slate-800 flex items-center gap-2">
                Connected
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3 font-medium">Processing global credit card fines.</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">SEPA Direct API</span>
              <span className="text-xl font-black text-slate-800 flex items-center gap-2">
                Operational
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Euro className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3 font-medium">B2B automated bank transfers active.</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">PayPal Checkout</span>
              <span className="text-xl font-black text-slate-800 flex items-center gap-2">
                Warning 
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center">
              <Globe className="w-5 h-5 text-sky-600" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3 font-medium text-amber-600">Pending secondary verification.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        {/* Left config tabs */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-2">
           <button 
             onClick={() => setActiveTab('stripe')}
             className={`w-full text-left px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-between ${
               activeTab === 'stripe' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
             }`}
           >
             <div className="flex items-center gap-2">
               <CreditCard className="w-4 h-4" />
               Stripe (Cards)
             </div>
             {activeTab === 'stripe' && <ChevronRight className="w-4 h-4" />}
           </button>
           <button 
             onClick={() => setActiveTab('sepa')}
             className={`w-full text-left px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-between ${
               activeTab === 'sepa' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
             }`}
           >
             <div className="flex items-center gap-2">
               <Euro className="w-4 h-4" />
               SEPA (EU Banks)
             </div>
             {activeTab === 'sepa' && <ChevronRight className="w-4 h-4" />}
           </button>
           <button 
             onClick={() => setActiveTab('paypal')}
             className={`w-full text-left px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-between ${
               activeTab === 'paypal' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
             }`}
           >
             <div className="flex items-center gap-2">
               <Globe className="w-4 h-4" />
               PayPal (Alternative)
             </div>
             {activeTab === 'paypal' && <ChevronRight className="w-4 h-4" />}
             {!activeTab.includes('paypal') && <div className="w-2 h-2 rounded-full bg-amber-500"></div>}
           </button>
           <button 
             onClick={() => setActiveTab('nexi')}
             className={`w-full text-left px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-between ${
               activeTab === 'nexi' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
             }`}
           >
             <div className="flex items-center gap-2">
               <ShieldCheck className="w-4 h-4 text-blue-400" />
               Nexi XPay (EU/IT)
             </div>
             {activeTab === 'nexi' && <ChevronRight className="w-4 h-4" />}
             {activeTab !== 'nexi' && <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded">NEW</span>}
           </button>
        </div>

        {/* Right content panel */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {activeTab === 'stripe' && (
            <div>
               <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <div>
                   <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                     <CreditCard className="w-4 h-4 text-indigo-500" /> Stripe Configuration
                   </h3>
                   <p className="text-xs text-slate-500 mt-1">Manage API keys and webhook endpoints for global credit card processing.</p>
                 </div>
                 <div className="flex gap-2">
                   <button className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition-colors flex items-center gap-1.5 border border-indigo-100">
                     <RefreshCw className="w-3.5 h-3.5" /> Test Connection
                   </button>
                 </div>
               </div>
               
               <div className="p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
                 {/* Env Config */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                        <Key className="w-3.5 h-3.5" /> Stripe Public Key
                      </label>
                      <input type="text" defaultValue="pk_live_<redacted>" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-mono text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" /> Stripe Secret Key
                      </label>
                      <div className="relative">
                        <input type="password" defaultValue="sk_live_<redacted>" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-mono text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all pr-24" />
                        <button className="absolute right-2 top-1.5 text-xs font-semibold bg-white border border-slate-200 text-slate-600 px-2.5 py-1 rounded-md hover:bg-slate-50">Rotate</button>
                      </div>
                    </div>
                 </div>

                 <hr className="border-slate-100" />

                 {/* Webhooks */}
                 <div>
                    <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                      <BellRing className="w-4 h-4 text-emerald-500" /> Webhook Endpoints
                    </h4>
                    <div className="border border-slate-200 rounded-xl overflow-x-auto">
                       <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                         <div>
                            <p className="text-sm font-mono text-slate-700 font-medium">https://api.compliance.eu/webhooks/stripe/fines</p>
                            <p className="text-xs text-slate-500 mt-1">Events: `payment_intent.succeeded`, `charge.disputed`</p>
                         </div>
                         <div className="flex items-center gap-2">
                            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase px-2 py-1 rounded-md">Live</span>
                            <button className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-md transition-colors">
                              <Settings className="w-4 h-4" />
                            </button>
                         </div>
                       </div>
                    </div>
                 </div>
                 
                 {/* Toggles */}
                 <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">Accept Corporate Credit Cards</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Allows payment of GDPR fines using Visa/Mastercard corporate limits.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                 </div>
               </div>
            </div>
          )}

          {activeTab === 'sepa' && (
            <div>
               <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <div>
                   <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                     <Euro className="w-4 h-4 text-blue-500" /> SEPA B2B Configuration
                   </h3>
                   <p className="text-xs text-slate-500 mt-1">Manage SEPA Direct Debit integration for frictionless intra-EU fine collections.</p>
                 </div>
               </div>
               
               <div className="p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
                 <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                   <Activity className="w-5 h-5 text-blue-600 shrink-0" />
                   <div>
                     <h4 className="text-sm font-bold text-blue-800">Direct integration active</h4>
                     <p className="text-xs text-blue-600 leading-relaxed mt-1">
                        Currently processing automated mandate setups. Ensure IBAN compliance rules are updated based on ECB guidelines.
                     </p>
                   </div>
                 </div>

                 {/* Env Config */}
                 <div className="grid grid-cols-1 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                        <Key className="w-3.5 h-3.5" /> Issuer Creditor ID (CID)
                      </label>
                      <input type="text" defaultValue="EU99ZZZ1234567890" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-mono text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold" />
                    </div>
                 </div>

                 {/* Toggles */}
                 <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">Force B2B Mandate Workflows</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Require corporate signatures for amounts &gt; €50,000.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                 </div>
               </div>
            </div>
          )}

          {activeTab === 'paypal' && (
            <div>
               <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <div>
                   <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                     <Globe className="w-4 h-4 text-sky-500" /> PayPal Integration
                   </h3>
                   <p className="text-xs text-slate-500 mt-1">Secondary fallback gateway for SME fine settlements.</p>
                 </div>
               </div>
               
               <div className="p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
                 <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-start">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-amber-800">Action Required: Business Account Verification</h4>
                      <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                        PayPal requires additional KYC documentation for government-level transaction volume. Submit required forms via the PayPal Business dashboard to unlock limits over €100,000/month.
                      </p>
                      <button className="mt-3 bg-amber-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors">
                        Go to Resolution Center
                      </button>
                    </div>
                 </div>

                 {/* Env Config */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 opacity-70">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                        <Key className="w-3.5 h-3.5" /> Client ID
                      </label>
                      <input type="text" defaultValue="AbC123..." disabled className="w-full bg-slate-100 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-mono text-slate-500" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" /> Secret
                      </label>
                      <input type="password" defaultValue="******" disabled className="w-full bg-slate-100 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-mono text-slate-500" />
                    </div>
                 </div>
               </div>
            </div>
          )}

          {activeTab === 'nexi' && (
            <div className="p-4 sm:p-5 lg:p-6">
              <NexiGatewayConfigurator />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
