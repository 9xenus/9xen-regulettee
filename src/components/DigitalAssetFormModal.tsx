import React, { useState } from "react";
import { FileText, Save, X, ShieldCheck } from "lucide-react";

export interface DigitalAssetFormData {
  name?: string;
  title?: string;
  type?: any;
  category?: string;
  identifier?: string;
  region?: string;
  status?: any;
  encryption?: any;
  description?: string;
  jurisdiction?: string;
}

export const DigitalAssetFormModal: React.FC<any> = ({ isOpen, onClose, className = "" }) => {
  const [assetName, setAssetName] = useState("");
  const [assetType, setAssetType] = useState("AI_MODEL");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className={`w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 p-6 shadow-2xl ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" /> Register Digital Compliance Asset
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Asset Title / Identifier</label>
            <input
              type="text"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
              placeholder="e.g. Sovereign LLM Classifier v2.1"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Asset Category</label>
            <select
              value={assetType}
              onChange={(e) => setAssetType(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="AI_MODEL">AI / Machine Learning Model (EU AI Act)</option>
              <option value="DATA_RECOVERY_ENCLAVE">DORA ICT Resilience Data Enclave</option>
              <option value="PII_DATABASE">GDPR Article 30 PII Database</option>
            </select>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20"
        >
          <Save className="w-4 h-4" /> Register Asset
        </button>
      </div>
    </div>
  );
};

export default DigitalAssetFormModal;
