import React, { useState } from 'react';
import { 
  Network, Globe, Cpu, ShieldCheck, ArrowRight, CheckCircle2, 
  RefreshCw, Layers, Database, Lock, Key, Server, Webhook, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface IntegrationNode {
  id: string;
  name: string;
  type: 'REGULATOR' | 'LAWYER' | 'CLIENT' | 'SAAS_ADMIN';
  shardRegion: string;
  status: 'SYNCED' | 'PENDING' | 'ACTIVE';
  latency: string;
  lastPing: string;
}

export const NextIntegrationBridge: React.FC = () => {
  const [locale, setLocale] = useState<'en' | 'bn'>('en');
  const [syncing, setSyncing] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string>('node-1');

  const [nodes, setNodes] = useState<IntegrationNode[]>([
    { id: 'node-1', name: 'Regulator Oversight Gateway (EU DPC)', type: 'REGULATOR', shardRegion: 'eu-central-1 (Frankfurt)', status: 'SYNCED', latency: '24ms', lastPing: 'Just now' },
    { id: 'node-2', name: 'Lawyer Professional Credential Vault', type: 'LAWYER', shardRegion: 'eu-west-1 (Ireland)', status: 'SYNCED', latency: '18ms', lastPing: '1 min ago' },
    { id: 'node-3', name: 'Client Dynamic Forms & Billing Sync', type: 'CLIENT', shardRegion: 'us-east-1 (N. Virginia)', status: 'ACTIVE', latency: '42ms', lastPing: 'Just now' },
    { id: 'node-4', name: 'SaaS Admin FastAPI Control Tower', type: 'SAAS_ADMIN', shardRegion: 'global-edge-network', status: 'SYNCED', latency: '12ms', lastPing: 'Just now' },
  ]);

  const [webhookUrl, setWebhookUrl] = useState('https://api.regulettee.eu/v1/webhooks/sovereign-shard-sync');
  const [testPayloadStatus, setTestPayloadStatus] = useState<'IDLE' | 'TESTING' | 'SUCCESS'>('IDLE');

  const triggerFullSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setNodes(prev => prev.map(n => ({ ...n, lastPing: 'Just now', latency: `${Math.floor(Math.random() * 20) + 12}ms` })));
    }, 1200);
  };

  const testWebhook = () => {
    setTestPayloadStatus('TESTING');
    setTimeout(() => {
      setTestPayloadStatus('SUCCESS');
    }, 1000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl text-emerald-600 dark:text-emerald-400">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {locale === 'bn' ? 'পরবর্তী ধাপের ইন্টিগ্রেশন ও এপিআই গেটওয়ে ব্রিজ' : 'Next Integration: API Gateway & Cross-Module Bridge'}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                FastAPI + 8-Region Shards
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {locale === 'bn' ? '৪টি মডিউলের মধ্যে রিয়েল-টাইম ডেটা সিঙ্ক্রোনাইজেশন এবং ওয়েভহুক ম্যানেজমেন্ট' : 'Real-time data synchronization & webhook event bus across all 4 upgraded modules'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLocale(locale === 'en' ? 'bn' : 'en')}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            {locale === 'en' ? 'বাংলা' : 'English'}
          </button>
          <button
            onClick={triggerFullSync}
            disabled={syncing}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
          >
            {syncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {syncing 
              ? (locale === 'bn' ? 'সিঙ্ক হচ্ছে...' : 'Syncing Shards...') 
              : (locale === 'bn' ? 'সকল মডিউল সিঙ্ক করুন' : 'Trigger Full Module Sync')}
          </button>
        </div>
      </div>

      {/* Nodes Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {nodes.map(node => (
          <div 
            key={node.id} 
            onClick={() => setSelectedNode(node.id)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              selectedNode === node.id 
                ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20' 
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">
                <Server className="w-4 h-4" />
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {node.status}
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1 truncate">{node.name}</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mb-3">{node.shardRegion}</p>
            
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Latency: <strong className="text-slate-700 dark:text-slate-300">{node.latency}</strong></span>
              <span className="text-slate-400">{node.lastPing}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Webhook & FastAPI Event Bus Configuration */}
      <div className="p-5 rounded-2xl bg-slate-900 text-slate-100 space-y-4 border border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Webhook className="w-5 h-5 text-emerald-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {locale === 'bn' ? 'ফাস্টএপিআই ওয়েভহুক ও ইভেন্ট বাস কনফিগারেশন' : 'FastAPI Webhook & Event Bus Integration'}
            </h4>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold">
            TLS 1.3 Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-[11px] text-slate-400 font-medium">
              {locale === 'bn' ? 'ওয়েভহুক ডেস্টিনেশন ইউআরএল' : 'Webhook Destination Endpoint'}
            </label>
            <input 
              type="text" 
              value={webhookUrl} 
              onChange={e => setWebhookUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500" 
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={testWebhook}
              disabled={testPayloadStatus === 'TESTING'}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
            >
              {testPayloadStatus === 'TESTING' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              {testPayloadStatus === 'SUCCESS' 
                ? (locale === 'bn' ? 'টেস্ট সফল হয়েছে!' : 'Payload Delivered!') 
                : (locale === 'bn' ? 'টেস্ট পেমলোড পাঠান' : 'Send Test Payload')}
            </button>
          </div>
        </div>

        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 font-mono text-[11px] text-slate-400 space-y-1">
          <div className="text-emerald-400 font-semibold">[EVENT BUS DISPATCHER] Active subscriptions:</div>
          <div>- <span className="text-indigo-400">regulator.audit.signed</span> &rarr; routed to EU DPC Shard #2</div>
          <div>- <span className="text-indigo-400">lawyer.credential.verified</span> &rarr; routed to Irish Bar Registry API</div>
          <div>- <span className="text-indigo-400">client.dynamic_form.submitted</span> &rarr; routed to FastAPI Validation Worker</div>
        </div>
      </div>
    </div>
  );
};

export default NextIntegrationBridge;
