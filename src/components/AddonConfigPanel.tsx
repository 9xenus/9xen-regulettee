import React, { useState } from 'react';
import { Check, X, Sliders } from 'lucide-react';

interface ConfigField {
  key: string;
  label: string;
  type: 'select' | 'number' | 'boolean' | 'text';
  options?: string[];
  defaultValue?: any;
}

interface AddonConfigPanelProps {
  addonId: string;
  addonName: string;
  addonCategory: string;
  configSchema: ConfigField[];
  currentValues: Record<string, any>;
  onSave: (values: Record<string, any>) => void;
  onCancel: () => void;
}

export const AddonConfigPanel: React.FC<AddonConfigPanelProps> = ({
  addonId,
  addonName,
  configSchema,
  currentValues,
  onSave,
  onCancel,
}) => {
  const [formValues, setFormValues] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = { ...currentValues };
    configSchema.forEach(field => {
      if (initial[field.key] === undefined) {
        initial[field.key] = field.defaultValue;
      }
    });
    return initial;
  });

  const handleChange = (key: string, val: any) => {
    setFormValues(prev => ({ ...prev, [key]: val }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formValues);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4 text-slate-800">
      {configSchema.map(field => (
        <div key={field.key} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            {field.label}
          </label>
          {field.type === 'select' && (
            <select
              value={formValues[field.key] || ''}
              onChange={(e) => handleChange(field.key, e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500"
            >
              {field.options?.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          )}

          {field.type === 'number' && (
            <input
              type="number"
              value={formValues[field.key] || 0}
              onChange={(e) => handleChange(field.key, Number(e.target.value))}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500"
            />
          )}

          {field.type === 'boolean' && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id={field.key}
                checked={!!formValues[field.key]}
                onChange={(e) => handleChange(field.key, e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor={field.key} className="text-xs text-slate-600 cursor-pointer">
                Enabled in production enclave
              </label>
            </div>
          )}

          {field.type === 'text' && (
            <input
              type="text"
              value={formValues[field.key] || ''}
              onChange={(e) => handleChange(field.key, e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500"
            />
          )}
        </div>
      ))}

      <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
        >
          <Check className="w-3.5 h-3.5" />
          Save Policy Configuration
        </button>
      </div>
    </form>
  );
};
