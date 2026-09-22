import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpenText } from 'lucide-react';

interface HelpMeUnderstandDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  steps: { title: string; description: string }[];
}

export const HelpMeUnderstandDrawer: React.FC<HelpMeUnderstandDrawerProps> = ({
  isOpen,
  onClose,
  title,
  steps,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 p-4 sm:p-5 lg:p-6 flex flex-col"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <BookOpenText className="w-5 h-5 text-indigo-500" />
                {title}
              </h3>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-6">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">{step.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
