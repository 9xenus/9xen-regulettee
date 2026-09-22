const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

// I will insert a new section "Platform Telemetry & Audit" before "SaaS Admin HQ"
const newSection = `
        {
          title: "Platform Features",
          items: [
            { id: "platform-dashboard", label: "Global Platform Telemetry", icon: Activity },
            { id: "compliance-audit-platform", label: "Compliance Audit Platform", icon: ShieldCheck },
            { id: "sovereign-data-gateway", label: "Sovereign Data Gateway", icon: Globe },
            { id: "integration-hub", label: "NextGen Integration Hub", icon: Network },
            { id: "capability-extension", label: "Capability Extension Hub", icon: Layers },
          ]
        },
`;

code = code.replace(
  '{ title: "SaaS Admin HQ"',
  newSection + '        { title: "SaaS Admin HQ"'
);

fs.writeFileSync('src/components/layout/Sidebar.tsx', code);
