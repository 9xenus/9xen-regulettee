import React, { useState } from "react";
import { 
  Monitor, 
  Smartphone, 
  Tv, 
  Settings, 
  Layout, 
  Globe, 
  ShieldCheck, 
  Code2, 
  FileText, 
  Zap, 
  Smartphone as AppIcon,
  Tv as CtvIcon,
  Globe as WebIcon,
  ChevronRight,
  Plus,
  ShieldAlert,
  Database,
  History,
  Terminal,
  Activity,
  UserCheck,
  Users,
  Info,
  Download,
  Search
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type Platform = "web" | "app" | "ctv";

export const MCPManager: React.FC = () => {
  const [activePlatform, setActivePlatform] = useState<Platform>("web");
  const [activeTab, setActiveTab] = useState("overview");

  const platforms = [
    { id: "web", label: "Web CMP", icon: WebIcon, color: "text-blue-500", bg: "bg-blue-50" },
    { id: "app", label: "App CMP", icon: AppIcon, color: "text-indigo-500", bg: "bg-indigo-50" },
    { id: "ctv", label: "CTV CMP", icon: CtvIcon, color: "text-purple-500", bg: "bg-purple-50" },
  ];

  return (
    <div className="p-4 sm:p-5 lg:p-6 flex flex-col h-full bg-slate-50/50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-indigo-600" />
            MCP Manager <span className="text-slate-400 font-normal text-lg">| Multi-Platform Consent</span>
          </h2>
          <p className="text-slate-500 mt-1">Unified governance for Web, Mobile, and Connected TV environments.</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
          {platforms.map((p) => (
            <button
              key={p.id}
              onClick={() => setActivePlatform(p.id as Platform)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activePlatform === p.id
                  ? `${p.bg} ${p.color} shadow-sm`
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <p.icon className="w-4 h-4" />
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6 mb-6 border-b border-slate-200 overflow-x-auto no-scrollbar whitespace-nowrap">
        {[
          { id: "overview", label: "Overview", icon: Activity },
          { id: "configuration", label: "Compliance Config", icon: Settings },
          { id: "ui-customization", label: "UI & UX Designer", icon: Layout },
          { id: "deployment", label: "SDK & Deployment", icon: Terminal },
          { id: "logs", label: "Consent Audit Trail", icon: History },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-1 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <tab.icon className="w-4 h-4 shrink-0" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activePlatform}-${activeTab}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "overview" && <PlatformOverview platform={activePlatform} />}
            {activeTab === "configuration" && <PlatformConfig platform={activePlatform} />}
            {activeTab === "ui-customization" && <UIBuilder platform={activePlatform} />}
            {activeTab === "deployment" && <DeploymentCenter platform={activePlatform} />}
            {activeTab === "logs" && <AuditTrail platform={activePlatform} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

const PlatformOverview = ({ platform }: { platform: Platform }) => {
  const stats = {
    web: { optIn: "84.2%", total: "1.2M", health: "99.9%", active: true },
    app: { optIn: "62.1%", total: "450K", health: "98.5%", active: true },
    ctv: { optIn: "91.5%", total: "120K", health: "100%", active: true },
  }[platform];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Users Observed", value: stats.total, icon: Users, color: "text-blue-600" },
          { label: "Consent Opt-in Rate", value: stats.optIn, icon: UserCheck, color: "text-emerald-600" },
          { label: "System Health (Uptime)", value: stats.health, icon: Activity, color: "text-indigo-600" },
          { label: "Active Nodes", value: "Global", icon: Globe, color: "text-slate-600" },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <s.icon className={`w-5 h-5 ${s.color}`} />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time</span>
            </div>
            <p className="text-2xl font-black text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm">
          <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" /> Recent Opt-in Trends
          </h4>
          <div className="h-48 flex items-end gap-2">
            {[40, 60, 45, 80, 55, 90, 75].map((h, i) => (
              <div key={i} className="flex-1 bg-indigo-100 rounded-t-lg relative group">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  className="w-full bg-indigo-600 rounded-t-lg absolute bottom-0 transition-all group-hover:bg-indigo-500"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-400 uppercase">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm">
          <h4 className="font-bold text-slate-900 mb-4">Platform Specific Alerts</h4>
          <div className="space-y-3">
            {[
              { type: "success", msg: "Global GDPR sync completed for all nodes.", time: "12m ago" },
              { type: "warning", msg: "Low IDFA opt-in detected on iOS 17.4+ users.", time: "1h ago" },
              { type: "info", msg: "New CTV SDK v2.1.0 available for deployment.", time: "3h ago" },
            ].map((alert, i) => (
              <div key={i} className={`p-3 rounded-xl border flex items-center gap-3 ${
                alert.type === 'success' ? 'bg-emerald-50 border-emerald-100' :
                alert.type === 'warning' ? 'bg-amber-50 border-amber-100' : 'bg-blue-50 border-blue-100'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  alert.type === 'success' ? 'bg-emerald-500' :
                  alert.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                }`} />
                <p className="text-xs font-semibold text-slate-700 flex-grow">{alert.msg}</p>
                <span className="text-[10px] text-slate-400 font-bold">{alert.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const PlatformConfig = ({ platform }: { platform: Platform }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      <div className="lg:col-span-2 space-y-4 sm:space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm">
          <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-500" /> Jurisdictional Governance
          </h4>
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Primary Regulation</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 ring-indigo-500/20 outline-none">
                  <option>GDPR (European Union)</option>
                  <option>CCPA/CPRA (California)</option>
                  <option>LGPD (Brazil)</option>
                  <option>POPIA (South Africa)</option>
                  <option>Custom Enterprise Policy</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Enforcement Mode</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 ring-indigo-500/20 outline-none">
                  <option>Strict Opt-in (Recommended)</option>
                  <option>Opt-out (US Context)</option>
                  <option>Adaptive (Geolocation Based)</option>
                  <option>Implicit (Logging Only)</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <h5 className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-wider">Required Consent Categories</h5>
              <div className="grid grid-cols-2 gap-3">
                {['Necessary (Art. 6)', 'Analytics & Stats', 'Personalization', 'Marketing & Ads', 'Social Media', 'Third Party Sharing'].map((cat, i) => (
                  <label key={i} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl cursor-pointer hover:border-indigo-200 transition-all">
                    <input type="checkbox" defaultChecked={i === 0} disabled={i === 0} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-xs font-bold text-slate-700">{cat}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm">
          <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-500" /> Data Residency & Storage
          </h4>
          <div className="space-y-4">
            <p className="text-xs text-slate-500">Configure where the signed consent audit logs are stored for this platform.</p>
            <div className="grid grid-cols-3 gap-3">
              {['EU (Frankfurt)', 'US (Virginia)', 'APAC (Singapore)'].map((region, i) => (
                <button key={i} className={`p-4 border rounded-2xl text-center transition-all ${i === 0 ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/10' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}>
                  <Globe className={`w-5 h-5 mx-auto mb-2 ${i === 0 ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className={`text-[10px] font-black uppercase ${i === 0 ? 'text-indigo-900' : 'text-slate-500'}`}>{region}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <div className="bg-indigo-900 text-white rounded-2xl p-4 sm:p-5 lg:p-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ShieldCheck className="w-24 h-24 rotate-12" />
          </div>
          <h4 className="text-lg font-bold mb-2">Compliance Rating</h4>
          <p className="text-indigo-200 text-xs mb-6 leading-relaxed">Your current configuration for <strong>{platform.toUpperCase()}</strong> meets the A+ standard for GDPR enforcement.</p>
          <div className="text-4xl font-black mb-1">A+</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Certified Secure</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm">
          <h4 className="font-bold text-slate-900 mb-4 text-sm">Active Vendor Sync</h4>
          <div className="space-y-3">
            {[
              { name: "Google Analytics", status: "Active" },
              { name: "Facebook Pixel", status: "Blocked" },
              { name: "Hotjar", status: "Pending" },
              { name: "Segment", status: "Active" },
            ].map((v, i) => (
              <div key={i} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
                <span className="text-xs font-bold text-slate-700">{v.name}</span>
                <span className={`text-[10px] font-black uppercase ${v.status === 'Active' ? 'text-emerald-600' : v.status === 'Blocked' ? 'text-rose-600' : 'text-amber-600'}`}>{v.status}</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 border border-slate-200 rounded-xl text-[10px] font-bold uppercase text-slate-500 hover:bg-slate-50 transition-all">View All Vendors</button>
        </div>
      </div>
    </div>
  );
};

const UIBuilder = ({ platform }: { platform: Platform }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8">
      <div className="space-y-4 sm:space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm">
          <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Layout className="w-5 h-5 text-indigo-500" /> Visual Customization
          </h4>
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Banner Position</label>
              <div className="grid grid-cols-3 gap-2">
                {['Bottom Bar', 'Center Modal', 'Side Drawer'].map((pos, i) => (
                  <button key={i} className={`p-3 border rounded-xl text-[10px] font-bold uppercase transition-all ${i === 0 ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}>
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Primary Color</label>
                <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="w-6 h-6 rounded-md bg-indigo-600 shadow-sm" />
                  <input type="text" defaultValue="#4f46e5" className="bg-transparent border-none text-xs font-mono w-full outline-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Theme Mode</label>
                <div className="flex gap-2">
                  <button className="flex-1 p-2 bg-white border-2 border-indigo-500 rounded-xl text-[10px] font-bold">LIGHT</button>
                  <button className="flex-1 p-2 bg-slate-900 border-2 border-transparent text-white rounded-xl text-[10px] font-bold">DARK</button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Banner Message</label>
              <textarea 
                rows={3}
                defaultValue="We use cookies and similar technologies to enhance your experience, analyze site usage, and support our marketing efforts. By clicking 'Accept All', you agree to the storing of cookies on your device."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs leading-relaxed outline-none focus:ring-2 ring-indigo-500/20"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <div className="bg-slate-900 rounded-3xl p-5 sm:p-6 lg:p-8 shadow-2xl relative overflow-hidden aspect-video flex items-center justify-center border-4 border-slate-800">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent opacity-50" />
          
          <div className="relative w-full">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 text-center">Live {platform.toUpperCase()} Preview</div>
            
            {platform === 'web' && (
              <div className="bg-white rounded-2xl p-4 sm:p-5 lg:p-6 shadow-xl max-w-sm mx-auto border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">Privacy Preferences</h5>
                    <p className="text-[10px] text-slate-400">Jurisdiction: EU-GDPR</p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-600 leading-relaxed mb-6">This platform uses intelligent data processing to personalize your secure experience.</p>
                <div className="grid grid-cols-2 gap-2">
                  <button className="py-2.5 bg-slate-100 rounded-xl text-[10px] font-bold text-slate-700">Customize</button>
                  <button className="py-2.5 bg-indigo-600 rounded-xl text-[10px] font-bold text-white shadow-lg shadow-indigo-600/20">Accept All</button>
                </div>
              </div>
            )}

            {platform === 'app' && (
              <div className="w-48 h-96 mx-auto bg-slate-800 rounded-[3rem] border-[6px] border-slate-700 shadow-2xl p-2 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-slate-700 rounded-b-xl" />
                <div className="h-full w-full bg-white rounded-[2.5rem] p-4 flex flex-col justify-end">
                  <div className="bg-white rounded-t-3xl p-4 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.1)] border-t border-slate-50">
                    <h5 className="font-bold text-slate-900 text-[10px] mb-2">App Privacy Notice</h5>
                    <p className="text-[8px] text-slate-500 leading-relaxed mb-4">In accordance with TCF v2.2, we require your consent to track.</p>
                    <button className="w-full py-2 bg-indigo-600 rounded-lg text-[10px] font-bold text-white mb-2">Allow Tracking</button>
                    <button className="w-full py-2 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500">Ask App Not to Track</button>
                  </div>
                </div>
              </div>
            )}

            {platform === 'ctv' && (
              <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-5 sm:p-6 lg:p-8 border border-slate-700 max-w-lg mx-auto">
                <div className="flex gap-4 sm:gap-6 items-center">
                  <div className="bg-white p-2 rounded-xl shadow-lg">
                    <div className="w-24 h-24 bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://9xen-regulettee.ai/consent')] bg-cover" />
                  </div>
                  <div className="flex-grow">
                    <h5 className="text-white font-bold text-lg mb-2">Configure on your Phone</h5>
                    <p className="text-slate-400 text-xs leading-relaxed mb-4">Scan the QR code to manage privacy preferences for this Connected TV device or continue with remote.</p>
                    <div className="flex gap-3">
                      <button className="px-6 py-2 bg-white text-slate-900 rounded-lg text-xs font-bold">Continue</button>
                      <button className="px-6 py-2 bg-slate-700 text-white rounded-lg text-xs font-bold">Privacy Policy</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 lg:p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-amber-100 rounded-lg">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h5 className="font-bold text-amber-900 text-sm">Design Consistency Alert</h5>
              <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                The current {platform} design deviates from your brand's central color palette by 12%. 
                We recommend using <span className="font-mono font-bold">#4F46E5</span> for optimal consistency.
              </p>
              <button className="mt-3 text-[10px] font-bold text-amber-800 underline">Apply Brand Colors</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DeploymentCenter = ({ platform }: { platform: Platform }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8">
      <div className="space-y-4 sm:space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm">
          <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-500" /> Integration & SDK
          </h4>
          <p className="text-xs text-slate-500 mb-6">Follow the steps below to integrate the 9Xen Regulettee MCP into your {platform} environment.</p>
          
          <div className="space-y-4">
            {platform === 'web' && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-900 rounded-xl font-mono text-[11px] text-slate-300 relative group">
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="px-2 py-1 bg-slate-800 rounded border border-slate-700 text-[9px] font-bold hover:text-white">COPY</button>
                  </div>
                  <code>{`<script src="https://cdn.9xen-regulettee.ai/cmp/v2/loader.js" 
  data-mcp-id="mcp_9a2b1" 
  data-platform="web" 
  async>
</script>`}</code>
                </div>
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 text-xs">
                  <Info className="w-4 h-4" />
                  <span>Place this script at the highest possible point in your {`<head>`} tag.</span>
                </div>
              </div>
            )}

            {platform === 'app' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <button className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3 hover:border-indigo-500 transition-all">
                    <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-sm"><Smartphone className="w-5 h-5 text-indigo-600" /></div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-900">iOS SDK</p>
                      <p className="text-[10px] text-slate-400">CocoaPods / SwiftPM</p>
                    </div>
                  </button>
                  <button className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3 hover:border-emerald-500 transition-all">
                    <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-sm"><Smartphone className="w-5 h-5 text-emerald-600" /></div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-900">Android SDK</p>
                      <p className="text-[10px] text-slate-400">Maven / Gradle</p>
                    </div>
                  </button>
                </div>
                <div className="p-4 bg-slate-900 rounded-xl font-mono text-[11px] text-slate-300">
                  <code>implementation 'ai.9xen-regulettee:mcp-android-sdk:2.1.0'</code>
                </div>
              </div>
            )}

            {platform === 'ctv' && (
              <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-3">
                  <button className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3 hover:border-indigo-500 transition-all">
                    <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-sm"><Tv className="w-5 h-5 text-orange-600" /></div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-900">Apple TV (tvOS)</p>
                      <p className="text-[10px] text-slate-400">Swift / Native</p>
                    </div>
                  </button>
                  <button className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3 hover:border-emerald-500 transition-all">
                    <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-sm"><Tv className="w-5 h-5 text-red-600" /></div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-900">Roku / FireTV</p>
                      <p className="text-[10px] text-slate-400">API Integration</p>
                    </div>
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">CTV environments typically require our <span className="font-bold text-slate-700">Universal API endpoint</span> to handle consent state persistence across sessions without persistent local storage.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm">
          <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" /> Advanced Logic (Webhooks)
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs font-bold text-slate-700">Consent Change Notification</span>
              <div className="w-10 h-5 bg-emerald-500 rounded-full relative">
                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 opacity-50">
              <span className="text-xs font-bold text-slate-700">Sovereign Ledger Sync</span>
              <div className="w-10 h-5 bg-slate-300 rounded-full relative">
                <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 sm:p-6 lg:p-8 flex flex-col items-center justify-center text-center space-y-4 sm:space-y-6">
        <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center">
          <Code2 className="w-10 h-10 text-indigo-600" />
        </div>
        <div>
          <h4 className="text-lg font-bold text-slate-900 mb-2">Need a custom implementation?</h4>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">Our implementation engineers can help you build custom consent flows for specialized hardware or non-standard environments.</p>
        </div>
        <button className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold text-xs hover:bg-slate-800 transition-all shadow-lg">Schedule Integration Call</button>
        <div className="flex items-center gap-4 pt-4 grayscale opacity-40">
          <div className="text-[10px] font-black italic">REACT</div>
          <div className="text-[10px] font-black italic">SWIFT</div>
          <div className="text-[10px] font-black italic">KOTLIN</div>
          <div className="text-[10px] font-black italic">FLUTTER</div>
        </div>
      </div>
    </div>
  );
};

const AuditTrail = ({ platform }: { platform: Platform }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-4 sm:p-5 lg:p-6 border-b border-slate-100 flex items-center justify-between">
        <h4 className="font-bold text-slate-900 flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-500" /> Consent Audit Log <span className="text-slate-400 font-normal">({platform.toUpperCase()})</span>
        </h4>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors border border-slate-100"><Download className="w-4 h-4 text-slate-500" /></button>
          <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors border border-slate-100"><Search className="w-4 h-4 text-slate-500" /></button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Event ID</th>
              <th className="px-6 py-4">Subject / Device ID</th>
              <th className="px-6 py-4">Jurisdiction</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4 text-right">Verification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
            {[
              { id: "EVT-9a8b1", sub: "anon_881x", reg: "DE (GDPR)", status: "Accepted All", time: "2m ago" },
              { id: "EVT-2b3c4", sub: "user_442k", reg: "CA (CCPA)", status: "Opted Out", time: "14m ago" },
              { id: "EVT-1f9g0", sub: "anon_122p", reg: "UK (GDPR)", status: "Essential Only", time: "22m ago" },
              { id: "EVT-7h8j9", sub: "ctv_apple_99", reg: "US (Default)", status: "Accepted All", time: "1h ago" },
              { id: "EVT-5m6n7", sub: "app_ios_882", reg: "BR (LGPD)", status: "Custom", time: "2h ago" },
            ].map((log, i) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-indigo-600">{log.id}</td>
                <td className="px-6 py-4 text-slate-900">{log.sub}</td>
                <td className="px-6 py-4">{log.reg}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    log.status.includes('Accepted') ? 'bg-emerald-100 text-emerald-700' :
                    log.status.includes('Opted') ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                  }`}>{log.status}</span>
                </td>
                <td className="px-6 py-4 text-slate-400">{log.time}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1 text-emerald-600">
                    <ShieldCheck className="w-3 h-3" />
                    <span className="text-[10px]">VERIFIED</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-center">
        <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700">View Full Sovereign Ledger</button>
      </div>
    </div>
  );
};

// Removed redundant Info component to avoid conflict with lucide-react import
