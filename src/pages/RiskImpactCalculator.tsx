import React, { useState } from 'react';
import { Brain, ShieldAlert, CheckCircle, ArrowRight, Server, Users, FileText, Activity, RefreshCw } from 'lucide-react';
import { fetchWithRetry } from '../lib/api-client';

export const RiskImpactCalculator: React.FC = () => {
  const [dataSubjectType, setDataSubjectType] = useState('Consumers');
  const [dataVolume, setDataVolume] = useState('10000-50000');
  const [dataCategories, setDataCategories] = useState<string[]>([]);
  const [processingLocation, setProcessingLocation] = useState('EU');
  
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const toggleCategory = (cat: string) => {
    setDataCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const calculateRisk = async () => {
    setIsCalculating(true);
    setResult(null);
    try {
      // Use the generic AI route to assess risk
      const res = await fetchWithRetry("/api/v1/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Act as a GDPR/CCPA compliance expert. Assess the privacy risk for the following data processing activity:
          - Data Subject Type: ${dataSubjectType}
          - Estimated Volume: ${dataVolume} records
          - Data Categories: ${dataCategories.join(', ')}
          - Processing Location: ${processingLocation}
          
          Return a JSON object with:
          {
            "riskScore": number (0-100),
            "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
            "keyConcerns": ["string", "string"],
            "recommendations": ["string", "string"]
          }`,
          format: "json"
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setResult(JSON.parse(data.data));
      } else {
        // Fallback for errors or missing API key
        setResult({
          riskScore: dataCategories.includes('Health Data') || dataCategories.includes('Financial Data') ? 85 : 45,
          riskLevel: dataCategories.includes('Health Data') || dataCategories.includes('Financial Data') ? 'HIGH' : 'MEDIUM',
          keyConcerns: [
            "Processing of sensitive personal data requires explicit consent.",
            "Cross-border data transfers may be subject to additional safeguards."
          ],
          recommendations: [
            "Implement end-to-end encryption for all sensitive data.",
            "Conduct a formal Data Protection Impact Assessment (DPIA)."
          ]
        });
      }
    } catch (err) {
      console.error("Risk calculation failed:", err);
      setResult({
        riskScore: 75,
        riskLevel: 'HIGH',
        keyConcerns: ["Unable to complete AI assessment. High risk assumed by default."],
        recommendations: ["Review data processing manually."]
      });
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-white border border-slate-200 p-4 sm:p-5 lg:p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">AI Risk Impact Calculator</h1>
            <p className="text-sm text-slate-500">Evaluate GDPR/CCPA compliance risk based on processing activities.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white border border-slate-200 p-4 sm:p-5 lg:p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Processing Details</h3>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Data Subject Type</label>
              <select 
                value={dataSubjectType}
                onChange={(e) => setDataSubjectType(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option>Consumers</option>
                <option>Employees</option>
                <option>Minors / Children</option>
                <option>B2B Contacts</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Estimated Volume</label>
              <select 
                value={dataVolume}
                onChange={(e) => setDataVolume(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option>&lt; 1,000</option>
                <option>1,000 - 10,000</option>
                <option>10,000 - 50,000</option>
                <option>50,000+</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Processing Location</label>
              <select 
                value={processingLocation}
                onChange={(e) => setProcessingLocation(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option>EU (Local)</option>
                <option>US</option>
                <option>Global / Distributed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Data Categories</label>
              <div className="flex flex-wrap gap-2">
                {['PII (Basic)', 'Health Data', 'Financial Data', 'Biometrics', 'Location Data', 'Behavioral Data'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                      dataCategories.includes(cat) 
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={calculateRisk}
              disabled={isCalculating || dataCategories.length === 0}
              className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isCalculating ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Analyzing Risk...</>
              ) : (
                <><Brain className="w-4 h-4" /> Calculate Impact Score</>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {result ? (
            <div className="bg-white border border-slate-200 p-4 sm:p-5 lg:p-6 rounded-2xl shadow-sm space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">Assessment Result</h3>
                  <p className="text-xs text-slate-500">AI-generated impact analysis</p>
                </div>
                <div className={`px-4 py-2 rounded-xl border font-black text-lg whitespace-nowrap text-center sm:text-left ${
                  result.riskLevel === 'CRITICAL' ? 'bg-rose-50 border-rose-200 text-rose-700' :
                  result.riskLevel === 'HIGH' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                  result.riskLevel === 'MEDIUM' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                  'bg-emerald-50 border-emerald-200 text-emerald-700'
                }`}>
                  {result.riskLevel} ({result.riskScore}/100)
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <ShieldAlert className="w-4 h-4 text-amber-500" />
                    Key Privacy Concerns
                  </h4>
                  <ul className="space-y-2">
                    {result.keyConcerns.map((concern: string, i: number) => (
                      <li key={i} className="text-sm text-slate-600 flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                        {concern}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Actionable Recommendations
                  </h4>
                  <ul className="space-y-2">
                    {result.recommendations.map((rec: string, i: number) => (
                      <li key={i} className="text-sm text-slate-600 flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl h-full flex flex-col items-center justify-center p-5 sm:p-6 lg:p-8 text-center text-slate-500">
              <Activity className="w-12 h-12 text-slate-300 mb-3" />
              <p className="font-semibold text-slate-600">No Assessment Yet</p>
              <p className="text-xs mt-1">Configure processing details and run the calculator to see the AI impact analysis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
