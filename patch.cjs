const fs = require('fs');
let code = fs.readFileSync('src/pages/PlatformDashboard.tsx', 'utf8');

const tabsCode = `
      {/* Platform Dashboard Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-slate-200 dark:border-slate-800 pb-2 mt-4 overflow-x-auto custom-scrollbar">
        {(['OVERVIEW', 'TELEMETRY', 'FINANCE_OPS', 'AUDIT_SECURITY', 'REGULATORY_LAW'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setDashboardActiveTab(tab)}
            className={\`px-4 py-3 text-[11px] uppercase tracking-wider font-bold rounded-t-2xl border-b-2 transition-all cursor-pointer \${
              dashboardActiveTab === tab
                ? 'border-indigo-600 text-indigo-700 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/30'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:hover:text-slate-300'
            }\`}
          >
            {tab.replace(/_/g, ' ')}
          </button>
        ))}
      </div>
`;
code = code.replace(
  "{/* Executive Summary KPI Cards */}",
  tabsCode + "\n      {/* Executive Summary KPI Cards */}"
);

code = code.replace(
  "{/* Executive Summary KPI Cards */}",
  "{dashboardActiveTab === 'OVERVIEW' && (<>\n      {/* Executive Summary KPI Cards */}"
);

code = code.replace(
  "{/* Distributed BullMQ Task Queue & Worker Monitoring Enclave */}",
  "</>)}\n\n      {dashboardActiveTab === 'TELEMETRY' && (<>\n      {/* Distributed BullMQ Task Queue & Worker Monitoring Enclave */}"
);

code = code.replace(
  "{/* Global CaaS & B2G Oversight */}",
  "</>)}\n\n      {dashboardActiveTab === 'FINANCE_OPS' && (<>\n      {/* Global CaaS & B2G Oversight */}"
);

code = code.replace(
  "{/* System Operations & Audit Trail Section */}",
  "</>)}\n\n      {dashboardActiveTab === 'AUDIT_SECURITY' && (<>\n      {/* System Operations & Audit Trail Section */}"
);

const lawCode = `
      </>)}

      {dashboardActiveTab === 'REGULATORY_LAW' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mt-6"
        >
          <RegulatoryLawManager />
        </motion.div>
      )}
`;

const parts = code.split('    </div>\n  );\n};');
if (parts.length === 2) {
    code = parts[0] + lawCode + '    </div>\n  );\n};';
} else {
    // maybe parts is not matching
}

fs.writeFileSync('src/pages/PlatformDashboard.tsx', code);
