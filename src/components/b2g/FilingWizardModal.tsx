import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { B2gFilingWizard } from './B2gFilingWizard';

interface FilingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilingSubmitted: (newFiling: any) => void;
}

export const FilingWizardModal: React.FC<FilingWizardModalProps> = ({
  isOpen,
  onClose,
  onFilingSubmitted
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 lg:p-8 bg-slate-950/75 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-6xl my-auto"
        >
          <B2gFilingWizard
            isModal={true}
            onClose={onClose}
            onFilingSubmitted={(filing) => {
              onFilingSubmitted(filing);
              onClose();
            }}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
