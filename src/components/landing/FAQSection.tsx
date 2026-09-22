import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const faqs = [
  {
    question: 'How does 9Xen Regulettee ensure data sovereignty?',
    answer: 'We utilize European-based cloud infrastructure and provide sovereign enclaves where data is encrypted with keys managed entirely within the EU jurisdiction, ensuring no unauthorized access from outside the region.',
  },
  {
    question: 'Is 9Xen Regulettee compatible with my existing tech stack?',
    answer: 'Yes, we provide native integrations for major cloud providers (AWS, Azure, GCP), SaaS platforms (Salesforce, Slack, GitHub), and custom internal systems via our robust API and SDKs.',
  },
  {
    question: 'Can I use 9Xen Regulettee for both GDPR and DORA compliance?',
    answer: 'Absolutely. 9Xen Regulettee is designed as a unified trust intelligence platform that covers multiple regulatory frameworks including GDPR, DORA, NIS2, and the EU AI Act.',
  },
  {
    question: 'How long does it take to implement?',
    answer: 'Basic setup and initial domain scanning can be completed in minutes. Full enterprise integration typically takes 2-4 weeks depending on the complexity of your infrastructure.',
  },
];

export const FAQSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="py-24 bg-slate-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-4 text-center">FAQ</h2>
          <h3 className="text-4xl font-bold text-slate-900 mb-12 text-center">Frequently asked questions</h3>
          
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                  className="w-full p-4 sm:p-5 lg:p-6 flex items-center justify-between text-left hover:bg-slate-50 transition-colors border-0 cursor-pointer"
                >
                  <span className="font-bold text-slate-900">{faq.question}</span>
                  {openIdx === idx ? (
                    <Minus className="w-5 h-5 text-indigo-600" />
                  ) : (
                    <Plus className="w-5 h-5 text-slate-400" />
                  )}
                </button>
                <AnimatePresence>
                  {openIdx === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="p-4 sm:p-5 lg:p-6 pt-0 text-slate-600 leading-relaxed text-sm">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
