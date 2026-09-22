import React from 'react';

export const LogoCloud: React.FC = () => {
  const logos = [
    { name: 'Acme Corp', id: 'acme' },
    { name: 'Globex', id: 'globex' },
    { name: 'Sovereign', id: 'sovereign' },
    { name: 'EuroBank', id: 'eurobank' },
    { name: 'TechSolutions', id: 'techsolutions' },
  ];

  return (
    <section className="py-6 bg-white border-y border-slate-100">
      <div className="container mx-auto px-4 sm:px-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center mb-3">Trusted by Sovereigns & Global Enterprises</p>
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10 opacity-50 grayscale">
          {logos.map((logo) => (
            <div key={logo.id} className="flex items-center gap-1.5 font-bold text-sm text-slate-900 tracking-tighter">
              <div className="w-6 h-6 bg-slate-200 rounded-md flex-shrink-0" />
              <span>{logo.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
