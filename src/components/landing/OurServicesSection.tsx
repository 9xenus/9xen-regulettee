import React from 'react';
import { motion } from 'motion/react';
import { 
  Briefcase, 
  ShieldAlert, 
  Cloud, 
  FileCheck2, 
  Scale, 
  Bot, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Lock 
} from 'lucide-react';

interface ServiceItem {
  id: string;
  title: string;
  tagline: string;
  icon: React.ElementType;
  badge: string;
  description: string;
  deliverables: string[];
  sla: string;
}

const services: ServiceItem[] = [
  {
    id: 'caas-managed',
    title: 'Managed Compliance-as-a-Service (CaaS)',
    tagline: 'Turnkey Fractional DPO & Compliance Engineering Team',
    icon: Briefcase,
    badge: 'Full-Service Retainer',
    description: 'A dedicated squad of certified Data Protection Officers (DPO) and Legal Tech engineers handling your continuous compliance monitoring, DSAR requests, and privacy audits.',
    deliverables: [
      '24/7 Continuous privacy posture monitoring & gap remediation',
      'Turnkey Data Subject Access Request (DSAR) fulfillment within 24h',
      'Quarterly Data Protection Impact Assessments (DPIA)',
      'Direct representation in dealings with regional Data Protection Authorities'
    ],
    sla: '1-Hour Critical Response SLA'
  },
  {
    id: 'sovereignty-migration',
    title: 'Autonomous Sovereign Cloud Migration',
    tagline: 'Zero-Downtime Data Relocation to Local Enclaves',
    icon: Cloud,
    badge: 'AWS / GCP Regional Enclaves',
    description: 'Seamlessly relocate customer databases, audit logs, and asset vaults to local national cloud regions (Saudi Arabia, UAE, Germany, India, Singapore) to comply with data residency laws.',
    deliverables: [
      'Automated schema partition & field-level encryption setup',
      'Live zero-downtime data replication with zero cross-border leakage',
      'Local HSM master key management & KMS integration',
      'Verification of local cloud compliance certification'
    ],
    sla: '99.99% Migration Uptime Guarantee'
  },
  {
    id: 'ai-governance',
    title: 'AI Safety & Model Governance Auditing',
    tagline: 'EU AI Act & ISO 42001 Algorithmic Compliance',
    icon: Bot,
    badge: 'EU AI Act Ready',
    description: 'Comprehensive risk audits for enterprise LLMs and AI pipelines to detect hallucination, training set PII contamination, bias, and prompt injection vulnerabilities.',
    deliverables: [
      'AI Model Lineage & Training Set PII Redaction Audit',
      'EU AI Act High-Risk System Conformity Assessment',
      'Automated LLM Orchestrator fallback & token cap configuration',
      'ISO 42001 Artificial Intelligence Management System certification'
    ],
    sla: 'Comprehensive Model Safety Audit Report'
  },
  {
    id: 'b2g-evidence',
    title: 'B2G Regulatory Evidence & Courtroom Prep',
    tagline: 'Tamper-Proof Audit Ledgers for Regulatory Audits',
    icon: Scale,
    badge: 'Court-Admissible Evidence',
    description: 'Preparing bulletproof cryptographic audit trails and forensic reports for government regulatory inquiries, data breach hearings, and arbitration proceedings.',
    deliverables: [
      'Append-only cryptographic hash ledger verification',
      '8-step due process notice & penalty appeal documentation',
      'Court-admissible PDF forensic evidence packages',
      'Expert witness testimony by certified legal engineering specialists'
    ],
    sla: 'Same-Day Legal Evidence Compilation'
  },
  {
    id: 'custom-adapter',
    title: 'Custom Regional Law Adapter Engineering',
    tagline: 'Plug-and-Play Ingestion for Local Gazettes & Laws',
    icon: FileCheck2,
    badge: 'Custom Law Ingestion',
    description: 'Engineering bespoke RAG ingestion pipelines for niche national jurisdictions, state regulations, or specialized industry standards.',
    deliverables: [
      'Custom web scraper / SPARQL endpoint integration',
      'LLM Legal Normalization pipeline (Act → Rule → Penalty fine limits)',
      '1536-dim vector indexing tagged with national jurisdiction codes',
      'Tenant admin toggle integration in SaaS control console'
    ],
    sla: '2-Week Adapter Deployment'
  },
  {
    id: 'incident-response',
    title: '24/7 Emergency Incident & Breach Response',
    tagline: 'Automated 72-Hour Regulatory Breach Notification',
    icon: ShieldAlert,
    badge: '72h Notification Window',
    description: 'Immediate lockdown and automated multi-jurisdictional breach notification to authorities (GDPR Art. 33, CCPA, KSA PDPL) within mandatory timeframes.',
    deliverables: [
      'Automated breach containment and compromised asset isolation',
      'Forensic data impact & affected citizen count calculation',
      'Auto-generated official authority notification letters & press releases',
      'Dedicated war-room scenario coordination with legal counsel'
    ],
    sla: '15-Minute Emergency Response SLA'
  }
];

export const OurServicesSection: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  return (
    <section id="services" className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-4">
            <Briefcase className="w-4 h-4 text-indigo-600" />
            <span>Professional & Managed Services</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
            Expert Legal Tech & Compliance Engineering
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Beyond our autonomous software platform, 9Xen Regulettee delivers specialized legal tech services, managed CaaS operations, and emergency incident response.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                className="bg-white rounded-3xl p-5 sm:p-6 lg:p-8 border border-slate-200/80 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3.5 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200">
                      {service.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-1">
                    {service.title}
                  </h3>
                  <div className="text-xs font-semibold text-indigo-600 mb-4">
                    {service.tagline}
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed mb-6">
                    {service.description}
                  </p>

                  <div className="space-y-2 mb-6">
                    <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">Key Deliverables</div>
                    {service.deliverables.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    {service.sla}
                  </span>
                  <button
                    onClick={onLogin}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 border-0 cursor-pointer bg-transparent"
                  >
                    Engage Service
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
