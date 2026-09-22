import { useState, useEffect, useRef } from 'react';

export interface PiiLeakPattern {
  id: string;
  name: string;
  pattern: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  category: string;
}

export interface PiiFlaggedItem {
  id: string;
  patternName: string;
  snippet: string;
  sourceFile: string;
  detectedAt: string;
  remediationStatus: 'Redacted' | 'Isolated' | 'Awaiting Manual Review' | 'Allowed';
}

export interface PiiScanSummary {
  id: string;
  timestamp: string;
  filesScannedCount: number;
  totalLeaksFound: number;
  status: 'Clean' | 'Leak Isolated' | 'Threat Detected';
  flaggedItems: PiiFlaggedItem[];
  overallRisk: 'None' | 'Low' | 'Medium' | 'High' | 'Critical';
}

const LEAK_PATTERNS: PiiLeakPattern[] = [
  { id: 'ssn', name: 'US Social Security Number (SSN)', pattern: '\\b\\d{3}-\\d{2}-\\d{4}\\b', severity: 'Critical', category: 'Identity' },
  { id: 'cc', name: 'Credit Card Number (PAN)', pattern: '\\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14})\\b', severity: 'Critical', category: 'Financial' },
  { id: 'api_key', name: 'Exposed Cloud Secret Key', pattern: '(?i)(api_key|secret_key|private_key)\\s*[:=]\\s*[\'"][a-zA-Z0-9_]{32,}[\'"]', severity: 'High', category: 'Credentials' },
  { id: 'email', name: 'Unencrypted Corporate Email', pattern: '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b', severity: 'Low', category: 'Communication' },
  { id: 'phone', name: 'Unmasked Client Phone Number', pattern: '\\b\\+?[0-9]{1,3}?[-.\\s]?\\(?[0-9]{3}\\)?[-.\\s]?[0-9]{3}[-.\\s]?[0-9]{4}\\b', severity: 'Medium', category: 'Contact' },
];

const MOCK_FILES = [
  'customer_profiles_2026.csv',
  'api_gateway_access.log',
  'billing_manifest_v2.json',
  'internal_wiki_backup.md',
  'support_chat_transcript.txt',
  'user_sessions_dump.sql',
  'hr_onboarding_list.xlsx',
  'temporary_dump_debug.json'
];

const MOCK_SNIPPETS: { [key: string]: string[] } = {
  ssn: [
    'user_id: 8829, tax_id: "042-88-9124", verified: true',
    'employee_record: { name: "Alice Green", ssn: "318-44-5921" }',
    'applicant_ssn_unencrypted: "901-52-4412"'
  ],
  cc: [
    'transaction_payload: { card: "4111-XXXX-XXXX-3042", expiry: "08/29" }',
    'payment_method: { type: "visa", pan: "5214-XXXX-XXXX-2015", brand: "Mastercard" }'
  ],
  api_key: [
    'const GITLAB_TOKEN = "glpat_<REDACTED>"',
    'process.env.STRIPE_SECRET_KEY = "sk_live_<REDACTED>"',
    'const google_maps_key = "AIza<REDACTED>"'
  ],
  email: [
    'primary_contact: "john.doe.developer@partner-system.net"',
    'alert_recipient: "ceo-mailbox-leaked-address@gmail.com"',
    'debug_sender: "dev-test-account-v2@nonaxen.com"'
  ],
  phone: [
    'phone_primary: "+1 (555) 019-2831"',
    'contact_number: "555-882-9102"',
    'callback: "1-800-555-9182"'
  ]
};

export const usePiiScanService = (isEnabled: boolean = true, intervalMs: number = 12000) => {
  const [scanHistory, setScanHistory] = useState<PiiScanSummary[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [cumulativeLeaks, setCumulativeLeaks] = useState<number>(0);
  const [cumulativeScans, setCumulativeScans] = useState<number>(0);
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);
  
  // Use a ref to keep track of counts to survive component re-renders cleanly
  const scanCountRef = useRef<number>(0);

  const triggerScan = () => {
    setIsScanning(true);

    // Simulate short network/processing delay (1.5 seconds) for realism
    setTimeout(() => {
      scanCountRef.current += 1;
      setCumulativeScans(prev => prev + 1);
      
      const timestamp = new Date();
      // Randomly decide number of files scanned in this batch (between 3 and 6)
      const numFilesScanned = Math.floor(Math.random() * 4) + 3;
      const selectedFiles = [...MOCK_FILES]
        .sort(() => 0.5 - Math.random())
        .slice(0, numFilesScanned);

      // Randomly determine if leaks are found during this mock scan (80% chance of clean, 20% of findings, or higher in demo context)
      // Let's make it 50/50 for rich visual display in a demo workspace
      const containsLeak = Math.random() < 0.5;
      const flaggedItems: PiiFlaggedItem[] = [];

      if (containsLeak) {
        // Find 1-3 leak patterns
        const numLeaks = Math.floor(Math.random() * 3) + 1;
        const availablePatterns = [...LEAK_PATTERNS];
        
        for (let i = 0; i < numLeaks; i++) {
          const patternIndex = Math.floor(Math.random() * availablePatterns.length);
          const pattern = availablePatterns.splice(patternIndex, 1)[0];
          
          if (!pattern) continue;

          const snippets = MOCK_SNIPPETS[pattern.id];
          const randomSnippet = snippets[Math.floor(Math.random() * snippets.length)];
          const randomFile = selectedFiles[Math.floor(Math.random() * selectedFiles.length)];
          
          // Remediation action mapping
          const statuses: Array<PiiFlaggedItem['remediationStatus']> = ['Redacted', 'Isolated', 'Awaiting Manual Review'];
          const remediationStatus = pattern.severity === 'Critical' 
            ? 'Isolated' 
            : pattern.severity === 'High' 
              ? 'Redacted' 
              : statuses[Math.floor(Math.random() * statuses.length)];

          flaggedItems.push({
            id: `leak_${Date.now()}_${i}`,
            patternName: pattern.name,
            snippet: randomSnippet,
            sourceFile: randomFile,
            detectedAt: timestamp.toISOString(),
            remediationStatus
          });
        }
      }

      const totalLeaksFound = flaggedItems.length;
      if (totalLeaksFound > 0) {
        setCumulativeLeaks(prev => prev + totalLeaksFound);
      }

      // Determine overall risk
      let overallRisk: PiiScanSummary['overallRisk'] = 'None';
      if (totalLeaksFound > 0) {
        const hasCritical = flaggedItems.some(item => 
          LEAK_PATTERNS.find(p => p.name === item.patternName)?.severity === 'Critical'
        );
        const hasHigh = flaggedItems.some(item => 
          LEAK_PATTERNS.find(p => p.name === item.patternName)?.severity === 'High'
        );
        const hasMedium = flaggedItems.some(item => 
          LEAK_PATTERNS.find(p => p.name === item.patternName)?.severity === 'Medium'
        );

        if (hasCritical) overallRisk = 'Critical';
        else if (hasHigh) overallRisk = 'High';
        else if (hasMedium) overallRisk = 'Medium';
        else overallRisk = 'Low';
      }

      const status: PiiScanSummary['status'] = totalLeaksFound === 0 
        ? 'Clean' 
        : flaggedItems.every(item => item.remediationStatus === 'Redacted' || item.remediationStatus === 'Isolated')
          ? 'Leak Isolated'
          : 'Threat Detected';

      const newScan: PiiScanSummary = {
        id: `scan_${Date.now()}`,
        timestamp: timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        filesScannedCount: numFilesScanned,
        totalLeaksFound,
        status,
        flaggedItems,
        overallRisk
      };

      setScanHistory(prev => {
        // Keep maximum of 15 scans in memory history
        const updated = [newScan, ...prev];
        if (updated.length > 15) {
          return updated.slice(0, 15);
        }
        return updated;
      });

      setLastScanTime(timestamp);
      setIsScanning(false);
    }, 1500);
  };

  // Set up periodic scanner interval
  useEffect(() => {
    if (!isEnabled) return;

    // Trigger initial scan on mount/activation immediately
    triggerScan();

    const interval = setInterval(() => {
      triggerScan();
    }, intervalMs);

    return () => {
      clearInterval(interval);
    };
  }, [isEnabled, intervalMs]);

  return {
    scanHistory,
    isScanning,
    cumulativeLeaks,
    cumulativeScans,
    lastScanTime,
    triggerScan
  };
};
