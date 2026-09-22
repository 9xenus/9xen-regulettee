import React, { useMemo } from "react";
import { Newspaper } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export type Domain = "All" | "GDPR" | "CCPA" | "AI Act" | "NIS2";

export const RegulatoryNewsFeed: React.FC<{
  headlines?: string[];
  selectedDomain?: Domain;
  onDomainChange?: (domain: Domain) => void;
}> = ({ headlines, selectedDomain, onDomainChange }) => {
  const [internalDomain, setInternalDomain] = React.useState<Domain>("All");

  const currentDomain =
    selectedDomain !== undefined ? selectedDomain : internalDomain;
  const currentHeadlines = headlines || [
    "[GDPR] Data Protection Commission fines major tech firm €345M for minor data handling violations.",
    "[AI Act] European Parliament adopts final text of the AI Act, setting new global standards.",
    "[NIS2] Member states given 18-month deadline to transpose NIS2 directive into national law.",
    "[CCPA] California Privacy Protection Agency announces new enforcement sweep focusing on connected vehicles.",
  ];

  const filteredHeadlines = useMemo(() => {
    if (currentDomain === "All") return currentHeadlines;
    return currentHeadlines.filter((h) => h.includes(currentDomain));
  }, [currentHeadlines, currentDomain]);

  if (!currentHeadlines || currentHeadlines.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-5 lg:p-6 mb-12">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Newspaper className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-mono">
            Latest Regulatory Updates
          </h3>
        </div>
        <select
          value={currentDomain}
          onChange={(e) => {
            const val = e.target.value as Domain;
            if (onDomainChange) onDomainChange(val);
            setInternalDomain(val);
          }}
          className="text-sm border border-slate-200 rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="All">All Domains</option>
          <option value="GDPR">GDPR</option>
          <option value="CCPA">CCPA</option>
          <option value="AI Act">AI Act</option>
          <option value="NIS2">NIS2</option>
        </select>
      </div>
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredHeadlines.map((headline) => (
            <motion.div
              key={headline}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex items-start gap-2 text-sm text-slate-600 leading-relaxed"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-2"></span>
              {headline}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
