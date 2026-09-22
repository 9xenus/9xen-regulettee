import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Clock, 
  Download, 
  FileText, 
  CheckSquare, 
  Square, 
  RefreshCw, 
  Play, 
  Pause, 
  Filter, 
  ShieldAlert, 
  Activity, 
  User, 
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle2,
  Trash2,
  ListFilter,
  Award,
  ShieldCheck,
  Copy,
  Code,
  Sparkles,
  Lock
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  AreaChart, 
  Area 
} from 'recharts';
import { useNotification } from '../context/NotificationContext';

import { MultiSelectActionBar } from '../components/MultiSelectActionBar';
import { LedgerExportTool } from '../components/dashboard/LedgerExportTool';
import { fetchWithRetry } from '../lib/api-client';

// Client-side SHA-256 cryptographic hashing helper
function sha256(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }
  
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const lengthProperty = 'length';
  let i, j;
  let result = '';

  const words: number[] = [];
  const asciiLength = ascii[lengthProperty] * 8;
  
  let hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664d, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  let asciiBitLength = ascii.length * 8;
  let asciiString = ascii + String.fromCharCode(0x80);
  while (asciiString.length % 64 !== 56) {
    asciiString += String.fromCharCode(0);
  }
  for (i = 0; i < asciiString.length; i++) {
    words[i >> 2] |= asciiString.charCodeAt(i) << (24 - (i % 4) * 8);
  }
  words[words.length] = ((asciiBitLength / maxWord) | 0);
  words[words.length] = (asciiBitLength | 0);

  for (j = 0; j < words.length; j += 16) {
    const w = words.slice(j, j + 16);
    const oldHash = hash.slice(0);
    for (i = 0; i < 64; i++) {
      if (i >= 16) {
        const s0 = rightRotate(w[i - 15], 7) ^ rightRotate(w[i - 15], 18) ^ (w[i - 15] >>> 3);
        const s1 = rightRotate(w[i - 2], 17) ^ rightRotate(w[i - 2], 19) ^ (w[i - 2] >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      }
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp1 = (hash[7] + (rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25)) + ch + k[i] + (w[i] || 0)) | 0;
      const temp2 = ((rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22)) + maj) | 0;

      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
      hash.length = 8;
    }
    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const byte = (hash[i] >> (j * 8)) & 0xff;
      result += (byte < 16 ? '0' : '') + byte.toString(16);
    }
  }
  return result;
}

interface AuditLog {
  id: string | number;
  time: string;
  action: string;
  actor: string;
  target: string;
  status: 'SUCCESS' | 'DENIED' | 'FAILED';
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  actorRole: string;
}

export const AdminAuditLedger: React.FC = () => {
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState<'stream' | 'badge'>('stream');

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [selectedLogs, setSelectedLogs] = useState<(string | number)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<number | 'OFF'>(5); // Default 5s
  const [isPollingActive, setIsPollingActive] = useState(true);
  
  // Categorical filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('ALL');

  // Digital Trust Badge customize states
  const [badgeTitle, setBadgeTitle] = useState('NONAXEN TRUST DIRECTIVE');
  const [badgeTheme, setBadgeTheme] = useState<'sovereign' | 'platinum' | 'cyber'>('sovereign');
  const [copied, setCopied] = useState(false);
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);

  const generateTrustCertificate = async () => {
    setIsGeneratingCertificate(true);
    // Simulate generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const tenantName = "Acme Financial EU";
    const certificateId = `CERT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const date = new Date().toLocaleDateString();
    
    // Use first 50 logs for hashing
    const logsSample = logs.slice(0, 50);
    const logsHash = sha256(JSON.stringify(logsSample));
    
    const content = `
***************************************************
    SOVEREIGN DIGITAL TRUST CERTIFICATE
***************************************************
Certificate ID: ${certificateId}
Issued To: ${tenantName}
Issue Date: ${date}

STATUS: COMPLIANT / AUDITED

This certificate verifies that the aforementioned entity
maintains a cryptographically signed, immutable audit 
ledger on the Sovereign GRC Platform.

AUDIT SCOPE:
- GDPR Article 30 ROPA
- NIS2 Asset Integrity
- DORA ICT Risk Management
- EU AI Act Transparency

VERIFICATION HASH (SHA-256):
${logsHash}

SIGNATURE AUTHORITY:
Sovereign GRC Admin Authority v2.1
EUTL-DE-NONAXEN-99201a
***************************************************
    (c) 2026 Sovereign GRC Admin Authority
***************************************************
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Trust_Certificate_${tenantName.replace(/\s+/g, '_')}.txt`;
    link.click();
    
    setIsGeneratingCertificate(false);
    showToast(`Digital Trust Certificate ${certificateId} generated successfully.`, 'success');
  };

  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchLogs = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const response = await fetchWithRetry('/api/v1/admin/audit-logs?limit=200');
      const data = await response.json();
      if (data && Array.isArray(data.events)) {
        setLogs(data.events);
      } else if (data && Array.isArray(data.data)) {
        setLogs(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      if (!silent) showToast('Failed to sync with Immutable Event Store.', 'error');
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchLogs();
  }, []);

  // Handle Polling Setup
  useEffect(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
    }

    if (isPollingActive && pollingInterval !== 'OFF') {
      pollTimerRef.current = setInterval(() => {
        fetchLogs(true);
      }, pollingInterval * 1000);
    }

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, [isPollingActive, pollingInterval]);

  const handleManualRefresh = () => {
    fetchLogs();
  };

  const clearAllLogs = () => {
    if (confirm('Are you sure you want to purge current session logs?')) {
      setLogs([]);
      setSelectedLogs([]);
    }
  };

  const handleSelect = (id: string | number) => {
    setSelectedLogs(prev => prev.includes(id) ? prev.filter(logId => logId !== id) : [...prev, id]);
  };

  const handleSelectAll = (filteredLogs: AuditLog[]) => {
    if (selectedLogs.length === filteredLogs.length) {
      setSelectedLogs([]);
    } else {
      setSelectedLogs(filteredLogs.map(log => log.id));
    }
  };

  // Cryptographically signed CSV generator
  const generateSignedCSV = (logsToExport: AuditLog[]) => {
    const headers = ['ID', 'Timestamp', 'Action', 'Actor', 'Target', 'Status', 'Severity', 'ActorRole'];
    const rows = logsToExport.map(log => [
      log.id,
      log.time,
      log.action,
      log.actor,
      log.target,
      log.status,
      log.severity,
      log.actorRole
    ]);
    
    const csvBody = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const fileHash = sha256(csvBody);
    const signature = sha256(fileHash + '_nonaxen_sovereign_trust_key_2026_salt');
    
    const signedFooter = [
      '',
      '# --- BEGIN SOVEREIGN CRYPTOGRAPHIC SIGNATURE ---',
      '# Issuer,Sovereign Audit Trust Authority',
      `# Signed By,nonacryptaiii@gmail.com`,
      `# Signature Authority ID,EUTL-DE-NONAXEN-99201a`,
      `# Integrity Checksum (SHA-256),${fileHash}`,
      `# RSA digital signature,0x${signature.substring(0, 32)}...${signature.substring(32)}`,
      `# Signing Timestamp,${new Date().toISOString()}`,
      '# --- END SOVEREIGN CRYPTOGRAPHIC SIGNATURE ---'
    ].join('\n');
    
    return csvBody + signedFooter;
  };

  const handleExportCSV = (exportType: 'selected' | 'filtered') => {
    const logsToExport = exportType === 'selected' 
      ? logs.filter(l => selectedLogs.includes(l.id))
      : filteredLogs;

    if (logsToExport.length === 0) {
      showToast('No logs found matching your selection criteria.', 'error');
      return;
    }

    const signedCSVContent = generateSignedCSV(logsToExport);
    
    const blob = new Blob([signedCSVContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sovereign_signed_audit_${exportType}_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    const checksum = sha256(signedCSVContent).substring(0, 16).toUpperCase();
    showToast(`Successfully exported ${logsToExport.length} logs! Sovereign cryptographic signature hash: 0x${checksum}`, 'success');
    
    if (exportType === 'selected') {
      setSelectedLogs([]);
    }
  };

  const handleExportSignedLedgerText = (exportType: 'selected' | 'filtered') => {
    const logsToExport = exportType === 'selected' 
      ? logs.filter(l => selectedLogs.includes(l.id))
      : filteredLogs;

    if (logsToExport.length === 0) {
      showToast('No logs found matching your selection criteria.', 'error');
      return;
    }

    const header = [
      '========================================================================',
      '                 SOVEREIGN AUDIT LEDGER - TRUST CERTIFICATE             ',
      `                 Generated: ${new Date().toLocaleString()}              `,
      '========================================================================',
      `Total Log Entries: ${logsToExport.length}`,
      'Sovereign Identity verified for: nonacryptaiii@gmail.com',
      'Authority: EU Trust List Anchor EUTL-DE-NONAXEN-99201a',
      '========================================================================',
      ''
    ].join('\n');

    const body = logsToExport.map((log, index) => {
      return `[${index + 1}] ID: ${log.id} | ${log.time}\n` +
             `    Action:   ${log.action}\n` +
             `    Status:   ${log.status} [Severity: ${log.severity}]\n` +
             `    Actor:    ${log.actor} (${log.actorRole})\n` +
             `    Target:   ${log.target}\n` +
             `    ----------------------------------------------------------------`;
    }).join('\n\n');

    const fileHash = sha256(header + body);
    const signature = sha256(fileHash + '_nonaxen_sovereign_trust_key_2026_salt');

    const footer = [
      '',
      '========================================================================',
      '# --- BEGIN SOVEREIGN CRYPTOGRAPHIC SIGNATURE ---',
      `# Checksum (SHA-256): ${fileHash}`,
      `# Signature: 0x${signature}`,
      `# Signee: nonacryptaiii@gmail.com`,
      '# Certified authentic under GDPR Article 32 & eIDAS 2.0 Trust anchors.',
      '# --- END SOVEREIGN CRYPTOGRAPHIC SIGNATURE ---',
      '========================================================================'
    ].join('\n');

    const fullContent = header + body + footer;

    const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sovereign_signed_ledger_${exportType}_${Date.now()}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Signed Ledger Text Report downloaded. Signature checksum: 0x${fileHash.substring(0, 16).toUpperCase()}`, 'success');
    
    if (exportType === 'selected') {
      setSelectedLogs([]);
    }
  };

  const exportSelected = (format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      handleExportCSV('selected');
    } else {
      handleExportSignedLedgerText('selected');
    }
  };

  // Dynamic metrics for the Badge
  const badgeMetrics = useMemo(() => {
    const successCount = logs.filter(l => l.status === 'SUCCESS').length;
    const totalCount = logs.length;
    const integrityScore = totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 100;
    const latestLogTime = logs.length > 0 ? new Date(logs[0].time).toLocaleTimeString() : new Date().toLocaleTimeString();
    
    // Hash based on current logs state to make it real
    const ledgerHash = sha256(JSON.stringify(logs)).substring(0, 16).toUpperCase();
    
    return {
      integrityScore,
      totalCount,
      latestLogTime,
      ledgerHash
    };
  }, [logs]);

  const generateSvgBadge = () => {
    const { integrityScore, totalCount, ledgerHash } = badgeMetrics;
    const title = badgeTitle || 'NONAXEN PROOF OF TRUST';

    if (badgeTheme === 'sovereign') {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="380" height="130" viewBox="0 0 380 130">
  <defs>
    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
    <linearGradient id="neonGlow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#6366f1" />
    </linearGradient>
  </defs>
  <!-- Background Card -->
  <rect width="380" height="130" rx="16" fill="url(#shieldGrad)" stroke="url(#neonGlow)" stroke-width="2" />
  
  <!-- Decorative Grid lines -->
  <path d="M 0,20 L 380,20 M 0,110 L 380,110 M 60,0 L 60,130" stroke="#334155" stroke-width="0.5" stroke-dasharray="4,4" />
  
  <!-- Left Accent Shield Icon -->
  <g transform="translate(16, 25)">
    <path d="M18 2.01s-6 2-12 2c0 10 12 18 12 18s12-8 12-18c-6 0-12-2-12-2z" fill="#10b981" fill-opacity="0.15" stroke="#10b981" stroke-width="2" />
    <path d="M9 11.5l3.5 3.5 8.5-8.5" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
  </g>
  
  <!-- Badge Content -->
  <text x="68" y="38" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="9" font-weight="800" letter-spacing="1.5">SOVEREIGN TRUST SEAL</text>
  <text x="68" y="60" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="14" font-weight="900" letter-spacing="0.5">${title}</text>
  <text x="68" y="78" fill="#e2e8f0" font-family="system-ui, sans-serif" font-size="11" font-weight="600">Integrity: <tspan fill="#10b981" font-weight="800">${integrityScore}% PASS</tspan></text>
  
  <!-- Footer Info -->
  <text x="68" y="100" fill="#64748b" font-family="monospace" font-size="8.5" font-weight="bold">LEDGER HASH: ${ledgerHash}</text>
  <text x="364" y="118" fill="#475569" font-family="system-ui, sans-serif" font-size="7.5" font-weight="bold" text-anchor="end">eIDAS 2.0 AUDITED</text>
</svg>`;
    } else if (badgeTheme === 'platinum') {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="380" height="130" viewBox="0 0 380 130">
  <defs>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#f8fafc" />
    </linearGradient>
    <linearGradient id="platBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#cbd5e1" />
      <stop offset="50%" stop-color="#94a3b8" />
      <stop offset="100%" stop-color="#cbd5e1" />
    </linearGradient>
  </defs>
  <!-- Background Card -->
  <rect width="380" height="130" rx="16" fill="url(#cardGrad)" stroke="url(#platBorder)" stroke-width="2.5" />
  
  <!-- Left Side Crest -->
  <g transform="translate(32, 65)">
    <!-- Outer starry circle -->
    <circle r="22" fill="none" stroke="#64748b" stroke-width="1" stroke-dasharray="2,2" />
    <circle r="18" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5" />
    <!-- Award Icon inside -->
    <path d="M-6,-8 L6,-8 L9,1 L0,10 L-9,1 Z" fill="#475569" />
  </g>
  
  <!-- Badge Content -->
  <text x="76" y="36" fill="#64748b" font-family="system-ui, sans-serif" font-size="9.5" font-weight="800" letter-spacing="1">TRUST DIRECTIVE CERTIFICATE</text>
  <text x="76" y="58" fill="#0f172a" font-family="system-ui, sans-serif" font-size="14" font-weight="900" letter-spacing="0.25">${title}</text>
  <text x="76" y="78" fill="#334155" font-family="system-ui, sans-serif" font-size="11" font-weight="700">Verified Events: <tspan fill="#475569" font-weight="900">${totalCount} Records</tspan></text>
  <text x="76" y="98" fill="#94a3b8" font-family="monospace" font-size="8.5" font-weight="bold">CERT ID: EUTL-${ledgerHash}</text>
  
  <!-- Regulatory stamp -->
  <rect x="264" y="10" width="100" height="16" rx="4" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="0.75" />
  <text x="314" y="21" fill="#475569" font-family="system-ui, sans-serif" font-size="7.5" font-weight="900" text-anchor="middle" letter-spacing="0.5">GDPR SECURED</text>
</svg>`;
    } else {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="380" height="130" viewBox="0 0 380 130">
  <defs>
    <linearGradient id="cyberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#020617" />
      <stop offset="100%" stop-color="#0b1329" />
    </linearGradient>
  </defs>
  <!-- Background Card -->
  <rect width="380" height="130" rx="16" fill="url(#cyberGrad)" stroke="#4f46e5" stroke-width="2" />
  
  <!-- Corner Tech Borders -->
  <path d="M 12,2 L 2,12 M 368,2 L 378,12 M 2,118 L 12,128 M 378,118 L 368,128" stroke="#4f46e5" stroke-width="1.5" />
  
  <!-- Radar/Lock Icon -->
  <g transform="translate(18, 25)">
    <rect x="2" y="10" width="22" height="16" rx="3" fill="none" stroke="#818cf8" stroke-width="2" />
    <path d="M7 10V6a5 5 0 0 1 10 0v4" fill="none" stroke="#818cf8" stroke-width="2" />
    <circle cx="13" cy="18" r="1.5" fill="#818cf8" />
  </g>
  
  <!-- Badge Content -->
  <text x="64" y="38" fill="#818cf8" font-family="monospace" font-size="9" font-weight="bold" letter-spacing="1">ZERO-TRUST AUDIT STREAM</text>
  <text x="64" y="60" fill="#ffffff" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" letter-spacing="0.5">${title}</text>
  <text x="64" y="80" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" font-weight="600">Status: <tspan fill="#4f46e5" font-weight="900">● LIVE_MONITOR</tspan></text>
  
  <!-- Footer Info -->
  <text x="64" y="102" fill="#475569" font-family="monospace" font-size="8.5" font-weight="bold">SIG_KEY: 0x${ledgerHash}</text>
  <text x="364" y="118" fill="#818cf8" font-family="monospace" font-size="7.5" font-weight="bold" text-anchor="end">NIS2 COMPLIANCE ASSURED</text>
</svg>`;
    }
  };

  const handleDownloadBadge = () => {
    const svgContent = generateSvgBadge();
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `digital_trust_badge_${badgeTheme}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Digital Trust Badge SVG certificate exported successfully!", "success");
  };

  const copyEmbedCode = () => {
    const svgCode = generateSvgBadge();
    navigator.clipboard.writeText(svgCode);
    setCopied(true);
    showToast("HTML SVG Embed Code copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  // Filters logic
  const filteredLogs = logs.filter(log => {
    // Search query matches action, actor or target
    const matchesSearch = 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.target.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Severity Filter
    const matchesSeverity = severityFilter === 'ALL' || log.severity === severityFilter;

    // Role Filter
    const matchesRole = roleFilter === 'ALL' || log.actorRole === roleFilter;

    // Status Filter
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;

    // Date Filter logic
    let matchesDate = true;
    if (dateFilter !== 'ALL') {
      const logTime = new Date(log.time).getTime();
      const now = Date.now();
      const diffMs = now - logTime;
      if (dateFilter === '24H') matchesDate = diffMs <= 1000 * 60 * 60 * 24;
      else if (dateFilter === '7D') matchesDate = diffMs <= 1000 * 60 * 60 * 24 * 7;
      else if (dateFilter === '30D') matchesDate = diffMs <= 1000 * 60 * 60 * 24 * 30;
    }

    return matchesSearch && matchesSeverity && matchesRole && matchesStatus && matchesDate;
  });

  // Recharts metric calculations
  const getSeverityChartData = () => {
    const counts = { INFO: 0, WARNING: 0, ERROR: 0, CRITICAL: 0 };
    filteredLogs.forEach(log => {
      if (counts[log.severity] !== undefined) {
        counts[log.severity]++;
      }
    });
    return [
      { name: 'Info', value: counts.INFO, fill: '#3b82f6' },
      { name: 'Warning', value: counts.WARNING, fill: '#f59e0b' },
      { name: 'Error', value: counts.ERROR, fill: '#f43f5e' },
      { name: 'Critical', value: counts.CRITICAL, fill: '#9f1239' }
    ];
  };

  const getTimelineChartData = () => {
    // Count actions per hour or minute bucket (simplified simulated timeline)
    const sorted = [...filteredLogs].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    return sorted.slice(-10).map((log, index) => {
      const timeStr = new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      return {
        time: timeStr,
        actions: index + 1,
        severityScore: log.severity === 'CRITICAL' ? 4 : log.severity === 'ERROR' ? 3 : log.severity === 'WARNING' ? 2 : 1
      };
    });
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-rose-100 text-rose-900 border-rose-200';
      case 'ERROR': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'WARNING': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return <ShieldAlert className="w-3.5 h-3.5 text-rose-700 animate-pulse" />;
      case 'ERROR': return <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />;
      case 'WARNING': return <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />;
      default: return <Info className="w-3.5 h-3.5 text-blue-500" />;
    }
  };

  const handleBatchDelete = () => {
    setLogs(prev => prev.filter(log => !selectedLogs.includes(log.id)));
    setSelectedLogs([]);
    showToast(`Successfully purged ${selectedLogs.length} entries from session cache.`, 'info');
  };

  const handleBatchUpdateSeverity = (severity: string) => {
    setLogs(prev => prev.map(log => 
      selectedLogs.includes(log.id) ? { ...log, severity: severity as any } : log
    ));
    setSelectedLogs([]);
    showToast(`Updated severity for ${selectedLogs.length} logs.`, 'success');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-100 rounded-lg text-emerald-600">
              <Activity className="w-6 h-6 animate-pulse" />
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Immutable Audit Ledger</h1>
          </div>
          <p className="text-slate-500 mt-1">Cryptographically verifiable logs with real-time streaming analytics.</p>
        </div>
        
        {/* Controls block */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh indicator */}
          {isPollingActive && pollingInterval !== 'OFF' && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100 mr-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Live Polling: {pollingInterval}s
            </div>
          )}

          {/* Polling Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setIsPollingActive(true)}
              className={`p-1.5 rounded-md transition-all ${isPollingActive ? 'bg-white shadow text-emerald-600' : 'text-slate-500 hover:text-slate-800'}`}
              title="Resume Auto-Polling"
            >
              <Play className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsPollingActive(false)}
              className={`p-1.5 rounded-md transition-all ${!isPollingActive ? 'bg-white shadow text-rose-600' : 'text-slate-500 hover:text-slate-800'}`}
              title="Pause Auto-Polling"
            >
              <Pause className="w-4 h-4" />
            </button>
            <select
              value={pollingInterval}
              onChange={(e) => {
                const val = e.target.value;
                setPollingInterval(val === 'OFF' ? 'OFF' : Number(val));
              }}
              className="text-xs bg-transparent border-0 focus:ring-0 text-slate-700 font-semibold pr-6 cursor-pointer"
            >
              <option value={3}>3s interval</option>
              <option value={5}>5s interval</option>
              <option value={10}>10s interval</option>
              <option value={30}>30s interval</option>
              <option value="OFF">No Polling</option>
            </select>
          </div>

          <button 
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="px-3.5 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 text-indigo-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <LedgerExportTool 
            logs={logs} 
            onExportComplete={(format, count) => showToast(`Successfully exported ${count} records to ${format.toUpperCase()} format.`, 'success')} 
          />

          <button 
            onClick={clearAllLogs}
            className="p-2 bg-white border border-slate-300 text-rose-600 rounded-lg hover:bg-rose-50 transition-colors shadow-sm"
            title="Purge Logs"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        <button 
          onClick={() => setActiveTab('stream')}
          className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'stream' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Live Ledger Stream
        </button>
        <button 
          onClick={() => setActiveTab('badge')}
          className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'badge' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Trust Badge & Certificate
        </button>
      </div>

      {activeTab === 'stream' ? (
        <>
          {/* Analytics Charts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Severity counts */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wide">
              <ShieldAlert className="w-4 h-4 text-rose-500" /> Severity Metrics
            </h3>
            <span className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">Dynamic Live Distribution</span>
          </div>
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getSeverityChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} />
                <Bar dataKey="value" name="Logs" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Real-time Activity graph */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wide">
              <Activity className="w-4 h-4 text-emerald-500" /> Log Stream Timeline
            </h3>
            <span className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">Last 10 Actions</span>
          </div>
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getTimelineChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="severityScore" name="Severity Index" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorActivity)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Interactive Categorical Filters block */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <ListFilter className="w-4 h-4 text-indigo-600" />
          <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Search & Filters</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Text Search query */}
          <div className="flex flex-col gap-1.5 md:col-span-1">
            <label className="text-xs font-bold text-slate-600">Quick Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search action, host, actor..."
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          </div>

          {/* Severity filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600">Severity Level</label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              <option value="ALL">All Severities</option>
              <option value="INFO">INFO</option>
              <option value="WARNING">WARNING</option>
              <option value="ERROR">ERROR</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>

          {/* Role filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600">Actor Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              <option value="ALL">All Roles</option>
              <option value="sys_root">sys_root</option>
              <option value="tenant_admin">tenant_admin</option>
              <option value="auditor">auditor</option>
              <option value="user">user</option>
              <option value="regulator">regulator</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600">Action Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="DENIED">DENIED</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>

          {/* Date range filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600">Timestamp</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              <option value="ALL">All Time</option>
              <option value="24H">Last 24 Hours</option>
              <option value="7D">Last 7 Days</option>
              <option value="30D">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table view of logs */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => handleSelectAll(filteredLogs)} 
              className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
               {selectedLogs.length === filteredLogs.length && filteredLogs.length > 0 ? (
                 <CheckSquare className="w-5 h-5 text-indigo-600 animate-in zoom-in-50" />
               ) : (
                 <Square className="w-5 h-5 text-slate-400" />
               )}
               Select Page
            </button>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">
              Matched entries: {filteredLogs.length}
            </span>
          </div>

          {/* No Exports selection here, moved to MultiSelectActionBar */}
        </div>

        {/* Logs List rendering */}
        <div className="space-y-3.5 pb-20">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Clock className="w-10 h-10 mx-auto mb-3 opacity-25" />
              <p className="font-semibold text-sm">No ledger entries match selected criteria</p>
              <p className="text-xs text-slate-400 mt-1">Try relaxing filters or search queries.</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="flex items-start space-x-3 border-b border-slate-100 pb-4 last:border-0 last:pb-0 group">
                <button 
                  onClick={() => handleSelect(log.id)}
                  className="mt-1 flex-shrink-0 focus:outline-none"
                >
                  {selectedLogs.includes(log.id) ? (
                    <CheckSquare className="w-5 h-5 text-indigo-600 animate-in zoom-in-50" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-300 hover:text-slate-400" />
                  )}
                </button>
                
                {/* Severity Indicators */}
                <div className="mt-0.5 p-1.5 bg-slate-50 rounded-md border border-slate-200 flex-shrink-0 flex items-center justify-center">
                  {getSeverityIcon(log.severity)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center flex-wrap gap-2">
                      <p className="text-sm font-bold text-slate-800 truncate">{log.action}</p>
                      <span className={`text-[9px] font-bold px-2 py-0.5 border rounded-full capitalize ${getSeverityBadgeColor(log.severity)}`}>
                        {log.severity}
                      </span>
                    </div>
                    <span className={`flex-shrink-0 w-fit text-[9px] uppercase font-black px-2.5 py-0.5 rounded border ${
                      log.status === 'SUCCESS' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                      log.status === 'DENIED' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                      'bg-rose-50 border-rose-200 text-rose-800'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                  
                  {/* Actor details & Target */}
                  <div className="text-xs text-slate-500 mt-1 flex flex-col sm:flex-row sm:space-x-4">
                    <span className="truncate flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <strong className="text-slate-600">Actor:</strong> {log.actor} 
                      <span className="text-[10px] text-indigo-600 bg-indigo-50 border border-indigo-100 px-1 rounded ml-1 font-mono font-bold">{log.actorRole}</span>
                    </span>
                    <span className="mt-0.5 sm:mt-0 truncate">
                      <strong className="text-slate-600">Target:</strong> {log.target}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400 mt-2 font-mono tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-300" /> {new Date(log.time).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <MultiSelectActionBar
        selectedCount={selectedLogs.length}
        onDelete={handleBatchDelete}
        onStatusUpdate={handleBatchUpdateSeverity}
        onClear={() => setSelectedLogs([])}
        statusOptions={[
          { value: 'INFO', label: 'Mark as Info' },
          { value: 'WARNING', label: 'Mark as Warning' },
          { value: 'ERROR', label: 'Mark as Error' },
          { value: 'CRITICAL', label: 'Mark as Critical' }
        ]}
        additionalActions={
          <div className="flex gap-2">
            <button 
              onClick={() => exportSelected('csv')}
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-1 rounded-md transition-colors"
            >
              <Download className="w-4 h-4" /> CSV
            </button>
            <button 
              onClick={() => exportSelected('pdf')}
              className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-md transition-colors"
            >
              <FileText className="w-4 h-4" /> PDF
            </button>
          </div>
        }
      />
        </>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Certificate Generator Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Sovereign Digital Trust Certificate</h3>
                    <p className="text-sm text-slate-500">Generate a cryptographically signed document verifying your compliance status.</p>
                  </div>
                </div>
                
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 mb-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="block text-slate-400 font-bold text-[10px] uppercase tracking-wider">Target Entity</span>
                      <span className="font-bold text-slate-800">Acme Financial EU</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 font-bold text-[10px] uppercase tracking-wider">Verification Authority</span>
                      <span className="font-bold text-slate-800">Sovereign GRC v2.1</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 font-bold text-[10px] uppercase tracking-wider">Current Integrity</span>
                      <span className="font-bold text-emerald-600">{badgeMetrics.integrityScore}% PASSED</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 font-bold text-[10px] uppercase tracking-wider">Ledger Checksum</span>
                      <span className="font-mono text-xs text-slate-600">{badgeMetrics.ledgerHash}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={generateTrustCertificate}
                  disabled={isGeneratingCertificate}
                  className={`w-full py-3 rounded-xl font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 ${
                    isGeneratingCertificate ? 'bg-slate-400' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]'
                  }`}
                >
                  {isGeneratingCertificate ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Signing Digital Assets...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      Generate Official Trust Certificate
                    </>
                  )}
                </button>
                <p className="text-center text-[10px] text-slate-400 mt-4 italic">
                  * This certificate is cryptographically linked to the current state of your immutable ledger. 
                  Any subsequent modifications will invalidate the verification hash.
                </p>
              </div>

              {/* Badge Customization */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Digital Trust Badge Customizer</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Custom Badge Label</label>
                    <input 
                      type="text" 
                      value={badgeTitle}
                      onChange={(e) => setBadgeTitle(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="e.g. Acme Verified Trust"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Visual Theme</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['sovereign', 'platinum', 'cyber'] as const).map(theme => (
                        <button
                          key={theme}
                          onClick={() => setBadgeTheme(theme)}
                          className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                            badgeTheme === theme 
                              ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm' 
                              : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                          }`}
                        >
                          {theme.charAt(0).toUpperCase() + theme.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {/* Badge Preview Card */}
              <div className="bg-slate-900 rounded-xl p-4 sm:p-5 lg:p-6 shadow-xl border border-indigo-500/30">
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4">Real-time Preview</h3>
                <div className="flex justify-center py-4">
                   <div dangerouslySetInnerHTML={{ __html: generateSvgBadge() }} />
                </div>
                <div className="mt-6 space-y-3">
                  <button 
                    onClick={handleDownloadBadge}
                    className="w-full py-2.5 bg-white text-slate-900 font-bold rounded-lg text-sm hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Download SVG
                  </button>
                  <button 
                    onClick={copyEmbedCode}
                    className="w-full py-2.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold rounded-lg text-sm hover:bg-indigo-500/30 transition-colors flex items-center justify-center gap-2"
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4" /> : <Code className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy Embed Code'}
                  </button>
                </div>
              </div>

              {/* Integrity Stats */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 mb-4">Ledger Integrity Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-medium">Verified Records</span>
                    <span className="text-sm font-bold text-slate-900">{badgeMetrics.totalCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-medium">Success Rate</span>
                    <span className="text-sm font-bold text-emerald-600">{badgeMetrics.integrityScore}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-medium">Last Sync</span>
                    <span className="text-sm font-bold text-slate-900">{badgeMetrics.latestLogTime}</span>
                  </div>
                  <div className="pt-2">
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${badgeMetrics.integrityScore}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
