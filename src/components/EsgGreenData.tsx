import React, { useState } from 'react';
import { Leaf, Zap, Trash2, Users, FileText, Upload, BarChart3, TrendingUp, Award, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';

interface PolicyAnalysis {
  missingSections: string[];
  presentSections: string[];
  analysisSummary: string;
}

interface IndustryBenchmark {
  industry: string;
  avgScore: number;
  avgEnergy: number; // in kWh
  avgWaste: number;  // in kg
  avgDiversity: number; // in %
  leaderScore: number;
  insights: string;
}

const industryBenchmarks: Record<string, IndustryBenchmark> = {
  'Tech & Software': {
    industry: 'Tech & Software',
    avgScore: 78,
    avgEnergy: 150,
    avgWaste: 40,
    avgDiversity: 38,
    leaderScore: 94,
    insights: 'Tech sector leaders prioritize 100% renewable energy credits and robust remote-first diversity policies.'
  },
  'Finance & Banking': {
    industry: 'Finance & Banking',
    avgScore: 82,
    avgEnergy: 100,
    avgWaste: 25,
    avgDiversity: 44,
    leaderScore: 96,
    insights: 'Financial sector ESG compliance is heavily driven by sustainable investment disclosures and paperless operations.'
  },
  'Manufacturing': {
    industry: 'Manufacturing',
    avgScore: 61,
    avgEnergy: 750,
    avgWaste: 400,
    avgDiversity: 20,
    leaderScore: 85,
    insights: 'Manufacturing leaders implement closed-loop circular economy models to dramatically minimize toxic waste.'
  },
  'Energy & Utilities': {
    industry: 'Energy & Utilities',
    avgScore: 68,
    avgEnergy: 900,
    avgWaste: 220,
    avgDiversity: 24,
    leaderScore: 88,
    insights: 'Utilities score high by actively transitioning traditional coal units into modern grid-scale solar and battery operations.'
  },
  'Retail & Consumer Goods': {
    industry: 'Retail & Consumer Goods',
    avgScore: 72,
    avgEnergy: 220,
    avgWaste: 150,
    avgDiversity: 32,
    leaderScore: 91,
    insights: 'Retail front-runners optimize supplier packaging guidelines and demand ethically sourced raw cotton/fabrics.'
  }
};

export const EsgGreenData: React.FC = () => {
  const [energy, setEnergy] = useState<number>(180);
  const [waste, setWaste] = useState<number>(65);
  const [diversity, setDiversity] = useState<number>(35);
  const [score, setScore] = useState<number | null>(72); // Default mock calculated score so the user starts with visual data
  
  const [selectedIndustry, setSelectedIndustry] = useState<string>('Tech & Software');
  const [policyText, setPolicyText] = useState<string>('');
  const [analysis, setAnalysis] = useState<PolicyAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const calculateScore = () => {
    const energyScore = Math.max(0, 100 - (energy / 10));
    const wasteScore = Math.max(0, 100 - (waste / 5));
    const diversityScore = Math.min(100, diversity);
    
    const finalScore = (energyScore * 0.4 + wasteScore * 0.3 + diversityScore * 0.3);
    setScore(Math.round(finalScore));
  };

  const analyzePolicy = async () => {
    if (!policyText) return;
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/v1/compliance-advisor/analyze-esg-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ policyText }),
      });
      const data = await response.json();
      if (data.success) {
        setAnalysis(data.analysis);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const currentBenchmark = industryBenchmarks[selectedIndustry] || industryBenchmarks['Tech & Software'];
  const userScore = score ?? 72;
  const scoreDiff = userScore - currentBenchmark.avgScore;
  const isAboveAverage = scoreDiff >= 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Tracker & Benchmarking Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Tracker Panel */}
        <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-emerald-600" />
              ESG Performance Tracker
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500" /> Energy (kWh)
                </label>
                <input 
                  type="number" 
                  value={energy} 
                  onChange={(e) => setEnergy(Number(e.target.value))} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none font-medium" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" /> Waste (kg)
                </label>
                <input 
                  type="number" 
                  value={waste} 
                  onChange={(e) => setWaste(Number(e.target.value))} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none font-medium" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-blue-500" /> Diversity (%)
                </label>
                <input 
                  type="number" 
                  value={diversity} 
                  onChange={(e) => setDiversity(Number(e.target.value))} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none font-medium" 
                />
              </div>
            </div>
          </div>

          <div>
            <button 
              onClick={calculateScore}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/10 mb-4"
            >
              Recalculate ESG Score
            </button>

            {score !== null && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl text-center"
              >
                <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Your Overall ESG Score</div>
                <div className="text-4xl font-black text-emerald-900 mt-1">{score}/100</div>
                <p className="text-xs text-emerald-700/80 mt-1.5 font-medium">Based on 40% Energy, 30% Waste, and 30% Social Diversity weightings</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Benchmarking & Competitive Comparison Panel */}
        <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                Industry Benchmarking
              </h3>
              
              <div className="relative">
                <select 
                  value={selectedIndustry} 
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg py-1 px-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {Object.keys(industryBenchmarks).map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>
            </div>

            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Compare your current sustainability footprint against verified sector averages to evaluate your market leadership position.
            </p>

            {/* Score Comparison Display */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Your Score</span>
                <span className="text-xl font-bold text-slate-800 mt-1 block">{userScore}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Industry Avg</span>
                <span className="text-xl font-bold text-slate-800 mt-1 block">{currentBenchmark.avgScore}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Sector Leader</span>
                <span className="text-xl font-bold text-slate-800 mt-1 block">{currentBenchmark.leaderScore}</span>
              </div>
            </div>

            {/* Dynamic visual comparison bars */}
            <div className="space-y-4">
              {/* Score gap progress bar */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-600" /> Sector Standings
                  </span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${isAboveAverage ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {isAboveAverage ? `+${scoreDiff} Above Average` : `${scoreDiff} Below Average`}
                  </span>
                </div>
                <div className="relative h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  {/* Industry Average Marker */}
                  <div 
                    className="absolute top-0 bottom-0 w-1 bg-slate-400 z-10" 
                    style={{ left: `${currentBenchmark.avgScore}%` }}
                    title={`Industry Avg: ${currentBenchmark.avgScore}`}
                  />
                  {/* Company's Score bar */}
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${isAboveAverage ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                    style={{ width: `${userScore}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                  <span>0 (Laggard)</span>
                  <span style={{ marginLeft: `${currentBenchmark.avgScore - 5}%` }}>Industry Average ({currentBenchmark.avgScore})</span>
                  <span>100 (Leader)</span>
                </div>
              </div>

              {/* Individual metric comparison indicators */}
              <div className="border-t border-slate-100 pt-4 space-y-2.5">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Metrics Comparison</h4>
                
                {/* Energy */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Energy Consumption:</span>
                  <span className={`font-medium ${energy <= currentBenchmark.avgEnergy ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {energy} kWh vs Avg {currentBenchmark.avgEnergy} kWh ({energy <= currentBenchmark.avgEnergy ? 'Better' : 'Worse'})
                  </span>
                </div>

                {/* Waste */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Waste Disposal:</span>
                  <span className={`font-medium ${waste <= currentBenchmark.avgWaste ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {waste} kg vs Avg {currentBenchmark.avgWaste} kg ({waste <= currentBenchmark.avgWaste ? 'Better' : 'Worse'})
                  </span>
                </div>

                {/* Diversity */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Diversity & Inclusion:</span>
                  <span className={`font-medium ${diversity >= currentBenchmark.avgDiversity ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {diversity}% vs Avg {currentBenchmark.avgDiversity}% ({diversity >= currentBenchmark.avgDiversity ? 'Better' : 'Worse'})
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 p-3.5 bg-indigo-50/40 rounded-xl border border-indigo-100 flex items-start gap-2.5">
            <Award className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-indigo-900 block flex items-center gap-1">
                Strategic Insight <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
              <p className="text-[11px] text-indigo-800 leading-relaxed">{currentBenchmark.insights}</p>
            </div>
          </div>
        </div>

      </div>

      {/* Supplier Policy AI Analyzer */}
      <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-600" />
          Supplier Policy AI Analyzer
        </h3>
        
        <div className="mb-6 p-5 sm:p-6 lg:p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-slate-50 hover:border-emerald-300 transition-all group flex flex-col items-center justify-center text-center cursor-pointer">
          <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
            <Upload className="w-6 h-6 text-emerald-600" />
          </div>
          <p className="text-sm font-bold text-slate-700">Drop ESG Policy Document</p>
          <p className="text-xs text-slate-500 mt-1">Supports PDF, DOCX, or Text (Paste content below for immediate analysis)</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Policy Content</label>
            <button 
              onClick={() => setPolicyText('')}
              className="text-xs font-bold text-rose-600 hover:text-rose-700"
            >
              Clear
            </button>
          </div>
          <textarea 
            value={policyText}
            onChange={(e) => setPolicyText(e.target.value)}
            className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none"
            placeholder="Paste the supplier policy text here for AI auditing..."
          />
        </div>
        
        <button 
          onClick={analyzePolicy}
          disabled={isAnalyzing || !policyText}
          className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10"
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Auditing Policy...
            </>
          ) : (
            <>Analyze with AI Auditor</>
          )}
        </button>

        {analysis && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 space-y-4 sm:space-y-6 pt-6 border-t border-slate-100"
          >
            <div className="p-4 bg-slate-900 rounded-xl">
              <p className="text-xs font-bold text-emerald-400 uppercase mb-2 tracking-widest flex items-center gap-2">
                <Leaf className="w-3 h-3" /> Auditor Summary
              </p>
              <p className="text-sm text-slate-300 leading-relaxed italic">"{analysis.analysisSummary}"</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                <h4 className="text-xs font-bold text-emerald-800 uppercase mb-3 tracking-widest">Compliance Detected</h4>
                <ul className="space-y-2">
                  {analysis.presentSections.map((s: string) => (
                    <li key={s} className="text-sm text-emerald-700 flex items-center gap-2 font-medium">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> {s}
                    </li>
                  ))}
                  {analysis.presentSections.length === 0 && <li className="text-xs text-slate-400 italic">No mandatory sections found.</li>}
                </ul>
              </div>
              <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100">
                <h4 className="text-xs font-bold text-rose-800 uppercase mb-3 tracking-widest">Missing Required Assets</h4>
                <ul className="space-y-2">
                  {analysis.missingSections.map((s: string) => (
                    <li key={s} className="text-sm text-rose-700 flex items-center gap-2 font-medium">
                      <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" /> {s}
                    </li>
                  ))}
                  {analysis.missingSections.length === 0 && <li className="text-xs text-slate-400 italic">All mandatory sections present.</li>}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
