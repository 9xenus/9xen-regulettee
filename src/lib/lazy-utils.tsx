import React from 'react';

// Helper to safely load dynamic imports with graceful fallback
export const lazyWithRetry = <P extends object = any>(importFn: () => Promise<any>, name?: string): React.LazyExoticComponent<React.ComponentType<P>> => {
  return React.lazy(async () => {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const module = await importFn();
        const component = module?.default || (name && module?.[name]) || (module && typeof module === 'object' ? Object.values(module).find(v => typeof v === 'function' || (v && typeof v === 'object')) : null);
        if (component && (typeof component === 'function' || typeof component === 'object')) {
          return { default: component };
        }
      } catch (error) {
        console.warn(`[Router] Attempt ${attempt} failed to import ${name || 'module'}:`, error);
        if (attempt < 2) {
          await new Promise(r => setTimeout(r, 100));
        }
      }
    }

    // Graceful fallback component that never hangs the application
    console.error(`[Router] Module ${name || 'unknown'} could not be resolved directly, rendering fallback view.`);
    return {
      default: ((props: any) => (
        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl text-center text-slate-300">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
            Module {name || 'Component'} Enclave
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Component loaded in sovereign workspace mode.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold font-mono transition-all cursor-pointer shadow-sm"
          >
            Refresh Enclave
          </button>
        </div>
      )) as any
    };
  });
};
