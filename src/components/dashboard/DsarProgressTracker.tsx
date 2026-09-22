import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Circle, Clock, ShieldCheck, Database, Eye, PackageCheck, Send } from 'lucide-react';

export type DsarStepStatus = 'completed' | 'current' | 'pending' | 'failed';

export interface DsarStep {
  id: string;
  label: string;
  description: string;
  status: DsarStepStatus;
  icon: React.ElementType;
}

interface DsarProgressTrackerProps {
  steps: DsarStep[];
  currentStepIndex: number;
}

export const DsarProgressTracker: React.FC<DsarProgressTrackerProps> = ({ steps, currentStepIndex }) => {
  return (
    <div className="py-6">
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-6 right-6 h-0.5 bg-slate-100 -z-0">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
            className="h-full bg-indigo-500 transition-all duration-500"
          />
        </div>

        {/* Steps */}
        <div className="relative z-10 flex justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isPending = index > currentStepIndex;

            return (
              <div key={step.id} className="flex flex-col items-center group">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isCompleted ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' :
                    isCurrent ? 'bg-white border-indigo-500 text-indigo-600 shadow-md ring-4 ring-indigo-50' :
                    'bg-white border-slate-200 text-slate-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>

                <div className="mt-3 text-center max-w-[120px]">
                  <p className={`text-xs font-bold transition-colors ${
                    isCurrent ? 'text-indigo-600' : 
                    isCompleted ? 'text-slate-900' : 
                    'text-slate-400'
                  }`}>
                    {step.label}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-tight">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Default DSAR steps generator
export const getDsarSteps = (currentStatus: string): DsarStep[] => {
  const statusToStepIndex: Record<string, number> = {
    'Pending': 0,
    'Identity Verified': 1,
    'Retrieving Data': 2,
    'In Progress': 2, // Map "In Progress" to Retrieving Data as a default
    'Reviewing': 3,
    'Package Ready': 4,
    'Completed': 5
  };

  const currentIndex = statusToStepIndex[currentStatus] ?? 0;

  return [
    {
      id: 'received',
      label: 'Request Logged',
      description: 'Request received and timestamped for regulatory compliance.',
      status: currentIndex >= 0 ? (currentIndex > 0 ? 'completed' : 'current') : 'pending',
      icon: Clock
    },
    {
      id: 'verified',
      label: 'Identity Proof',
      description: 'Subject identity confirmed via biometric handshake.',
      status: currentIndex >= 1 ? (currentIndex > 1 ? 'completed' : 'current') : 'pending',
      icon: ShieldCheck
    },
    {
      id: 'retrieval',
      label: 'Data Mining',
      description: 'Locating records across sovereign vault clusters.',
      status: currentIndex >= 2 ? (currentIndex > 2 ? 'completed' : 'current') : 'pending',
      icon: Database
    },
    {
      id: 'review',
      label: 'Legal Review',
      description: 'Reviewing for third-party redactions and exemptions.',
      status: currentIndex >= 3 ? (currentIndex > 3 ? 'completed' : 'current') : 'pending',
      icon: Eye
    },
    {
      id: 'packaging',
      label: 'Ready to Deliver',
      description: 'Secure package generated and encrypted for transit.',
      status: currentIndex >= 4 ? (currentIndex > 4 ? 'completed' : 'current') : 'pending',
      icon: PackageCheck
    },
    {
      id: 'sent',
      label: 'Delivered',
      description: 'Request fulfilled and subject notified via secure channel.',
      status: currentIndex >= 5 ? 'completed' : 'pending',
      icon: Send
    }
  ];
};
