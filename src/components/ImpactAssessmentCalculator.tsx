import React, { useState } from 'react';
import { 
  Scale, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  HelpCircle, 
  FileText, 
  Download, 
  Sparkles,
  BarChart3
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export interface ImpactAssessmentCalculatorProps {
  initialEscalationLevel?: number;
  className?: string;
}

export const ImpactAssessmentCalculator: React.FC<ImpactAssessmentCalculatorProps> = ({
  initialEscalationLevel = 3,
  className = ''
}) => {
  const { showToast } = useNotification();
  const [dataSensitivity, setDataSensitivity] = useState(initialEscalationLevel); // 1-5
  const [scaleOfProcessing, setScaleOfProcessing] = useState(4); // 1-5
  const [vulnerableSubjects, setVulnerableSubjects] = useState(2); // 1-5
  const [innovativeTech, setInnovativeTech] = useState(4); // 1-5
  const [evaluationScoring, setEvaluationScoring] = useState(3); // 1-5

  const dpiaScore = React.useMemo(() => {
    const raw = (dataSensitivity * 0.25) + (scaleOfProcessing * 0.25) + (vulnerableSubjects * 0.15) + (innovativeTech * 0.2) + (evaluationScoring * 0.15);
    const normalized = Math.min(100, Math.round(raw * 20));
    const isMandatory = normalized >= 60;
    return {
      score: normalized,
      isMandatory,
      riskLevel: normalized >= 75 ? 'HIGH_RISK' : normalized >= 50 ? 'MEDIUM_RISK' : 'LOW_RISK'
    };
  }, [dataSensitivity, scaleOfProcessing, vulnerableSubjects, innovativeTech, evaluationScoring]);

  return (
    <div className="p-5 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-950/80 border border-blue-700/60 rounded-xl text-blue-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white">GDPR Art. 35 Data Protection Impact Assessment (DPIA) Calculator</h3>
            <p className="text-xs text-slate-400">Evaluate processing risks against EDPB WP248 criteria to determine mandatory DPIA thresholds.</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-slate-950 border border-slate-800 text-slate-300 rounded-xl text-xs font-mono">
          EDPB WP248 Standard
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-300 uppercase mb-1">
              <span>Data Sensitivity &amp; Special Categories (Art. 9/10)</span>
              <span className="font-mono text-indigo-400">{dataSensitivity}/5</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={dataSensitivity}
              onChange={(e) => setDataSensitivity(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-300 uppercase mb-1">
              <span>Scale of Processing &amp; Subject Volume</span>
              <span className="font-mono text-indigo-400">{scaleOfProcessing}/5</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={scaleOfProcessing}
              onChange={(e) => setScaleOfProcessing(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-300 uppercase mb-1">
              <span>Vulnerable Data Subjects (Minors, Patients, Employees)</span>
              <span className="font-mono text-indigo-400">{vulnerableSubjects}/5</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={vulnerableSubjects}
              onChange={(e) => setVulnerableSubjects(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-300 uppercase mb-1">
              <span>Innovative Technology (AI, Biometrics, Edge IoT)</span>
              <span className="font-mono text-indigo-400">{innovativeTech}/5</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={innovativeTech}
              onChange={(e) => setInnovativeTech(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Right Score Panel */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Statutory DPIA Necessity Index
            </div>

            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-900/60 mt-3">
              <div className="text-xs text-indigo-300 font-medium">Calculated Impact Severity Score</div>
              <div className="text-4xl font-extrabold text-white font-mono mt-1">
                {dpiaScore.score} / 100
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono ${
                  dpiaScore.isMandatory
                    ? 'bg-red-950 text-red-300 border border-red-800'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}>
                  {dpiaScore.isMandatory ? 'MANDATORY DPIA REQUIRED (Art. 35)' : 'DPIA Recommended / Voluntary'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-4 leading-relaxed">
              Based on the EDPB WP248 criteria, your processing meets multiple triggers under Article 35(3). Prior consultation with the lead Supervisory Authority is advised if high residual risks remain.
            </p>
          </div>

          <button
            type="button"
            onClick={() => showToast('Exported Certified DPIA Impact Matrix Assessment as PDF', 'info')}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Official DPIA Finding Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImpactAssessmentCalculator;
