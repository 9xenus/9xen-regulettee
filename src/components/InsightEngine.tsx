import React, { useState, useEffect } from 'react';
import { Lightbulb, TrendingUp, AlertTriangle, ShieldAlert, Cpu, Wrench, CheckCircle, RefreshCw, Activity, ArrowRight, PlayCircle, TerminalSquare, Check, X } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

interface RemediationStep {
  title: string;
  command?: string;
  description: string;
}

interface Insight {
  id: string;
  type: 'PATTERN' | 'RECOMMENDATION' | 'ALERT';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  affectedResources: number;
  remediationAction: string;
  remediationSteps: RemediationStep[];
}

export const InsightEngine: React.FC = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [activeWizardId, setActiveWizardId] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<string, number[]>>({});
  const { showToast } = useNotification();

  useEffect(() => {
    const analyzeHistory = async () => {
      setIsAnalyzing(true);
      // Simulate historical scan analysis
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setInsights([
        {
          id: 'ins_1',
          type: 'PATTERN',
          severity: 'HIGH',
          title: 'Recurring S3 Public ACL Configurations',
          description: 'Historical scan analysis reveals that 4 recent deployments attempted to configure storage buckets with public-read ACLs. This recurring anti-pattern indicates a flaw in baseline IaC templates.',
          affectedResources: 4,
          remediationAction: 'Update baseline Terraform modules (github.com/acme-corp/infra-modules) to enforce `acl = "private"` by default and implement OPA (Open Policy Agent) gatekeeper policies to block public ACLs.',
          remediationSteps: [
            {
              title: 'Checkout Baseline Module',
              command: 'git clone git@github.com:acme-corp/infra-modules.git && cd infra-modules/s3-baseline',
              description: 'Clone the internal Terraform baseline modules repository locally.'
            },
            {
              title: 'Update Default ACL',
              command: 'sed -i \'s/acl = "public-read"/acl = "private"/g\' main.tf',
              description: 'Modify the default ACL parameter to private to enforce secure-by-default.'
            },
            {
              title: 'Add OPA Gatekeeper Policy',
              description: 'Create a new rego policy to deny public ACLs during the CI/CD pipeline check.'
            },
            {
              title: 'Commit and Push Changes',
              command: 'git commit -am "Security: Enforce private ACLs" && git push',
              description: 'Push the updated module version and policies to the central repository.'
            }
          ]
        },
        {
          id: 'ins_2',
          type: 'RECOMMENDATION',
          severity: 'MEDIUM',
          title: 'Missing Biometric Data Encryption Context',
          description: 'Scans over the last 60 days show a trend of missing encryption contexts for KMS keys used to encrypt biometric AI models, conflicting with EU AI Act High-Risk categorization.',
          affectedResources: 7,
          remediationAction: 'Inject explicit `encryption_context` parameters in the KMS key resource definitions and audit existing keys to ensure context binding is applied retroactively.',
          remediationSteps: [
            {
              title: 'Locate KMS Key Definitions',
              command: 'grep -r "aws_kms_key" src/terraform/',
              description: 'Find all Terraform files defining KMS keys used for biometric data storage.'
            },
            {
              title: 'Inject Encryption Context',
              description: 'Add the encryption_context block to your aws_kms_key configurations indicating the application and data type.'
            },
            {
              title: 'Deploy Changes',
              command: 'terraform plan -out=tfplan && terraform apply tfplan',
              description: 'Apply the updated infrastructure configuration.'
            }
          ]
        },
        {
          id: 'ins_3',
          type: 'ALERT',
          severity: 'HIGH',
          title: 'GDPR Data Residency Drift Detected',
          description: 'Pattern matching identified a slow drift where secondary analytic databases are increasingly provisioned in non-EU regions (us-east-1) instead of the mandated eu-central-1 enclave.',
          affectedResources: 2,
          remediationAction: 'Hardcode regional constraints in the CI/CD pipeline variables and configure SCP (Service Control Policies) to deny resource creation outside of designated EU regions.',
          remediationSteps: [
            {
              title: 'Review Active Pipelines',
              description: 'Check the CI/CD configuration files (e.g. .gitlab-ci.yml, .github/workflows) for region variables.'
            },
            {
              title: 'Enforce Region Variable',
              command: 'export AWS_REGION=eu-central-1',
              description: 'Hardcode the region variable to ensure all deployments default to the compliant zone.'
            },
            {
              title: 'Apply Service Control Policy',
              description: 'Deploy a new AWS SCP to the organizational root that explicitly denies resource creation in regions other than eu-central-1.'
            }
          ]
        }
      ]);
      setIsAnalyzing(false);
      showToast('InsightEngine analysis complete. Proactive recommendations generated.', 'success', 'Analysis Complete');
    };

    analyzeHistory();
  }, [showToast]);

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'HIGH': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'MEDIUM': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'LOW': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'PATTERN': return <TrendingUp className="w-5 h-5 text-indigo-500" />;
      case 'RECOMMENDATION': return <Lightbulb className="w-5 h-5 text-amber-500" />;
      case 'ALERT': return <ShieldAlert className="w-5 h-5 text-rose-500" />;
      default: return <Activity className="w-5 h-5 text-slate-500" />;
    }
  };

  const toggleWizard = (id: string) => {
    if (activeWizardId === id) {
      setActiveWizardId(null);
    } else {
      setActiveWizardId(id);
      if (!completedSteps[id]) {
        setCompletedSteps(prev => ({ ...prev, [id]: [] }));
      }
    }
  };

  const toggleStepCompletion = (insightId: string, stepIndex: number) => {
    setCompletedSteps(prev => {
      const current = prev[insightId] || [];
      if (current.includes(stepIndex)) {
        return { ...prev, [insightId]: current.filter(i => i !== stepIndex) };
      } else {
        const newCompleted = [...current, stepIndex];
        // If all steps completed, show toast
        const insight = insights.find(i => i.id === insightId);
        if (insight && newCompleted.length === insight.remediationSteps.length) {
          showToast(`Remediation for "${insight.title}" completed successfully!`, 'success', 'Wizard Complete');
        }
        return { ...prev, [insightId]: newCompleted };
      }
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm space-y-4 sm:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-violet-50 text-violet-700 rounded-xl border border-violet-100">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black tracking-tight text-slate-900 uppercase">InsightEngine Analytics</h3>
            <p className="text-xs text-slate-500">Heuristic analysis of historical scan data to identify patterns and provide proactive remediation.</p>
          </div>
        </div>
        <button
          type="button"
          disabled={isAnalyzing}
          onClick={() => setIsAnalyzing(true)}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? 'Analyzing Data...' : 'Refresh Insights'}
        </button>
      </div>

      {isAnalyzing ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-violet-200 rounded-full animate-spin border-t-violet-600"></div>
            <Cpu className="w-5 h-5 text-violet-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="text-center">
            <h4 className="text-sm font-bold text-slate-800 uppercase">Analyzing Scan Telemetry</h4>
            <p className="text-xs text-slate-500 mt-1">Cross-referencing historical violations to detect structural anti-patterns...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {insights.map((insight) => (
            <div key={insight.id} className="bg-slate-50 border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all flex flex-col">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm shrink-0">
                  {getIcon(insight.type)}
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900">{insight.title}</h4>
                    <div className="flex gap-2">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${getSeverityColor(insight.severity)}`}>
                        {insight.severity} SEVERITY
                      </span>
                      <span className="text-[9px] font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded border border-slate-300">
                        {insight.type}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {insight.description}
                  </p>
                  
                  <div className="bg-white border border-slate-200 rounded-lg p-3 mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Proactive Remediation Recommendation</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 font-medium mb-3">
                      {insight.remediationAction}
                    </p>
                    
                    <button
                      type="button"
                      onClick={() => toggleWizard(insight.id)}
                      className={`w-full py-2 flex items-center justify-center gap-2 text-xs font-bold uppercase rounded-lg border transition-all ${
                        activeWizardId === insight.id 
                          ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200' 
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      {activeWizardId === insight.id ? (
                        <>
                          <X className="w-4 h-4" /> Close Wizard
                        </>
                      ) : (
                        <>
                          <PlayCircle className="w-4 h-4" /> Start Remediation Wizard
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Affected Resources across historical scans: <span className="text-amber-600 text-xs">{insight.affectedResources}</span>
                    </span>
                  </div>
                </div>
              </div>
              
              {activeWizardId === insight.id && (
                <div className="mt-4 pt-4 border-t border-slate-200 animate-fadeIn">
                  <h5 className="text-xs font-black uppercase text-slate-800 mb-3 flex items-center gap-2">
                    <TerminalSquare className="w-4 h-4 text-indigo-600" /> Remediation Steps
                  </h5>
                  <div className="space-y-4">
                    {insight.remediationSteps.map((step, index) => {
                      const isCompleted = completedSteps[insight.id]?.includes(index);
                      return (
                        <div key={index} className={`relative pl-8 ${index !== insight.remediationSteps.length - 1 ? 'pb-4' : ''}`}>
                          {index !== insight.remediationSteps.length - 1 && (
                            <div className="absolute left-3 top-6 bottom-0 w-px bg-slate-200"></div>
                          )}
                          <div 
                            className={`absolute left-0 top-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2 cursor-pointer transition-colors ${
                              isCompleted 
                                ? 'bg-emerald-500 border-emerald-500 text-white' 
                                : 'bg-white border-slate-300 text-slate-400 hover:border-indigo-400'
                            }`}
                            onClick={() => toggleStepCompletion(insight.id, index)}
                          >
                            {isCompleted ? <Check className="w-3.5 h-3.5" /> : <span className="text-[10px] font-bold">{index + 1}</span>}
                          </div>
                          
                          <div className={`bg-white border rounded-xl p-3 shadow-sm transition-all ${isCompleted ? 'border-emerald-200 opacity-75' : 'border-slate-200'}`}>
                            <div className="flex items-start justify-between gap-2">
                              <h6 className={`text-xs font-bold ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{step.title}</h6>
                              <button
                                type="button"
                                onClick={() => toggleStepCompletion(insight.id, index)}
                                className={`text-[9px] font-bold uppercase px-2 py-1 rounded border transition-colors ${
                                  isCompleted 
                                    ? 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200' 
                                    : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                                }`}
                              >
                                {isCompleted ? 'Undo' : 'Mark Complete'}
                              </button>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1 mb-2">{step.description}</p>
                            
                            {step.command && (
                              <div className="bg-slate-900 rounded-lg p-2 flex items-center gap-2 mt-2">
                                <span className="text-emerald-400 font-mono text-[10px]">$</span>
                                <code className="text-slate-200 font-mono text-[10px] flex-1 overflow-x-auto whitespace-nowrap scrollbar-hide">
                                  {step.command}
                                </code>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(step.command!);
                                    showToast('Command copied to clipboard!', 'info');
                                  }}
                                  className="text-[9px] bg-slate-800 text-slate-300 hover:bg-slate-700 px-2 py-1 rounded transition-colors uppercase font-bold"
                                >
                                  Copy
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

