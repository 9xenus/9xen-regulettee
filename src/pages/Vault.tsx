import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, FileText, Database, Shield, ShieldCheck, Download, Search, File, UploadCloud, Eye } from 'lucide-react';

export const Vault: React.FC = () => {
  const [dataAssets] = useState([
    { id: 'da1', name: 'HR Employee Database', class: 'High Risk', act: 'GDPR', records: '14,209', status: 'Encrypted at Rest' },
    { id: 'da2', name: 'Critical Server Logs', class: 'Regulated', act: 'NIS2', records: '2.4M', status: 'Immutable' },
    { id: 'da3', name: 'Cross-Border Transfer SCCs', class: 'Legal', act: 'GDPR', records: '12 Docs', status: ' Countersigned' },
    { id: 'da4', name: 'AI Training Set (Anonymized)', class: 'Medium Risk', act: 'EU AI Act', records: '1.1M', status: 'Monitoring' }
  ]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Secure Data Vault</h1>
          <p className="text-slate-500 mt-1">Manage encrypted assets, data processing inventories, and cross-border flows.</p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
           <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center">
             <UploadCloud className="w-4 h-4 mr-2" />
             Register Asset
          </button>
        </div>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-300 transition-colors">
          <div className="flex items-center text-indigo-500 mb-2">
            <Lock className="w-5 h-5 mr-2" />
            <h3 className="font-bold text-slate-800">KMS Encryption</h3>
          </div>
          <p className="text-sm text-slate-600 mb-4">AES-256 GCM encryption active for all tenant data volumes.</p>
          <div className="text-xs font-mono font-bold text-slate-400 bg-slate-50 p-2 rounded">
            STATUS: ACTIVE & ROTATING
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-emerald-300 transition-colors">
          <div className="flex items-center text-emerald-500 mb-2">
            <ShieldCheck className="w-5 h-5 mr-2" />
            <h3 className="font-bold text-slate-800">Data Residency</h3>
          </div>
          <p className="text-sm text-slate-600 mb-4">All data physically constrained to selected EU isolation zone.</p>
          <div className="text-xs font-mono font-bold text-slate-400 bg-slate-50 p-2 rounded">
            ZONE: EU-CENTRAL-1 (FRA)
          </div>
        </motion.div>
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-amber-300 transition-colors">
          <div className="flex items-center text-amber-500 mb-2">
            <Database className="w-5 h-5 mr-2" />
            <h3 className="font-bold text-slate-800">DPIA Status</h3>
          </div>
          <p className="text-sm text-slate-600 mb-4">Data Protection Impact Assessments tracking for critical assets.</p>
          <div className="text-xs font-mono font-bold text-slate-400 bg-amber-50 p-2 rounded">
            1 ASSESSMENT PENDING
          </div>
        </motion.div>
      </div>

       <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
         <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
           <h2 className="text-lg font-bold text-slate-800">Registered Data Assets</h2>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search assets..." className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="px-6 py-4">Data Asset</th>
                <th className="px-6 py-4">Classification</th>
                <th className="px-6 py-4">Bound To</th>
                <th className="px-6 py-4">Volume/Records</th>
                <th className="px-6 py-4">Security Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dataAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                      <span className="font-bold text-slate-800">{asset.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      asset.class === 'High Risk' ? 'bg-rose-100 text-rose-800' :
                      asset.class === 'Regulated' ? 'bg-indigo-100 text-indigo-800' :
                      asset.class === 'Legal' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {asset.class}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                     <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-white border border-slate-200 text-slate-600">
                      {asset.act}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono font-medium text-slate-600">
                    {asset.records}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-xs font-semibold text-slate-600">
                      <Shield className="w-3.5 h-3.5 text-emerald-500 mr-1.5" />
                      {asset.status}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center justify-end w-full">
                       <Eye className="w-4 h-4 mr-1" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};
