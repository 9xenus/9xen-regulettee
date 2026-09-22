import { fetchWithRetry } from '../lib/api-client';
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Shield, FileCheck, Globe, RefreshCcw, Search, AlertCircle, CheckCircle2, XCircle, CreditCard, Clock, Activity, Fingerprint, Settings, Coins, Brain, Sparkles, Eye, TrendingUp, FileText, Play, Square, Sliders, Plus, Check, History, UserCheck, HelpCircle, Zap, Cpu, Radio } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { ZeroDowntimeIntegrationHub } from './ZeroDowntimeIntegrationHub';
import { KybFirmIntegration } from '../components/dashboard/KybFirmIntegration';
import { RealtimeTransactionMonitoringDashboard } from '../components/dashboard/RealtimeTransactionMonitoringDashboard';
import { useNotification } from '../context/NotificationContext';

interface AmlCheckResult {
  id: string;
  userId: string;
  userName: string;
  status: "PASSED" | "FAILED" | "PENDING_REVIEW";
  riskScore: number;
  pepMatch: boolean;
  sanctionsMatch: boolean;
  timestamp: string;
}

export const AmlKycModule: React.FC = () => {
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState<"VERIFICATION" | "KYB_FIRM_INTEGRATION" | "MONITORING" | "MICA_FORENSICS" | "SANCTIONS_SCREENING" | "TAX_VAT" | "INVOICE_SHELL" | "FRAUD_DETECTION" | "ZERO_DOWNTIME_HUB" | "SETTINGS">("VERIFICATION");
  const [kycChecks, setKycChecks] = useState<AmlCheckResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [testUserId, setTestUserId] = useState("");

  // TAX & VAT Checker state
  const [vatNumber, setVatNumber] = useState("");
  const [taxCountryCode, setTaxCountryCode] = useState("DE");
  const [taxCompanyName, setTaxCompanyName] = useState("");
  const [taxChecking, setTaxChecking] = useState(false);
  const [taxResult, setTaxResult] = useState<any>(null);

  // Corporate Invoice Fraud & Shell Company Audit state
  const [invoiceForm, setInvoiceForm] = useState({
    issuerName: "Grand Offshore Management Ltd",
    issuerCountry: "Cayman Islands",
    issuerAddress: "West Bay Road, P.O. Box 311, Grand Cayman",
    issuerTaxId: "CY-999-H3",
    beneficiaryName: "Alpha Capital Partners LLC",
    beneficiaryCountry: "United States",
    amount: "250000",
    currency: "USD",
    invoiceNumber: "INV-0001",
    description: "Consulting fees for international operational structuring and regulatory alignment support",
    bankAccount: "CY8900223300001234567890", // Mismatch bank route (Cyprus IBAN for US/Cayman entity)
    headcount: "1",
    incorporationYears: "1"
  });
  const [auditingInvoice, setAuditingInvoice] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);

  // AI Invoice Scanner Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Fraud Insights Dashboard state
  const [invoiceSubTab, setInvoiceSubTab] = useState<'audit' | 'insights'>('audit');
  const [invoiceHistory, setInvoiceHistory] = useState<any[]>([]);
  const [insightsSummary, setInsightsSummary] = useState<string>("");
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);

  const fetchInvoiceHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await fetchWithRetry("/api/v1/fintech/invoice-shell/history");
      const data = await res.json();
      if (res.ok && data.success) {
        setInvoiceHistory(data.history);
      }
    } catch (e) {
      console.error("Failed to fetch invoice history", e);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  const generateInsightsSummary = async () => {
    setGeneratingSummary(true);
    setInsightsSummary("");
    try {
      const res = await fetchWithRetry("/api/v1/fintech/invoice-shell/insights-summary", {
        method: "POST"
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setInsightsSummary(data.summary);
      }
    } catch (e) {
      console.error("Failed to generate insights summary", e);
    } finally {
      setGeneratingSummary(false);
    }
  };

  const invoiceStats = useMemo(() => {
    if (invoiceHistory.length === 0) return { total: 0, avgShell: 0, avgFraud: 0, flaggedCount: 0, topHaven: "None" };
    
    let totalShell = 0;
    let totalFraud = 0;
    let flagged = 0;
    const countryScores: Record<string, { total: number; count: number }> = {};
    
    invoiceHistory.forEach(item => {
      totalShell += item.shellProbability;
      totalFraud += item.fraudRiskScore;
      if (item.riskRating === "HIGH" || item.riskRating === "CRITICAL") {
        flagged += 1;
      }
      
      const country = item.issuerCountry;
      if (!country) return;
      if (!countryScores[country]) {
        countryScores[country] = { total: item.shellProbability, count: 1 };
      } else {
        countryScores[country].total += item.shellProbability;
        countryScores[country].count += 1;
      }
    });
    
    let topHaven = "None";
    let maxAvg = 0;
    Object.keys(countryScores).forEach(country => {
      const avg = countryScores[country].total / countryScores[country].count;
      if (avg > maxAvg && country !== "Germany") {
        maxAvg = avg;
        topHaven = country;
      }
    });
    
    return {
      total: invoiceHistory.length,
      avgShell: Math.round(totalShell / invoiceHistory.length),
      avgFraud: Math.round(totalFraud / invoiceHistory.length),
      flaggedCount: flagged,
      topHaven: topHaven === "None" ? "N/A" : topHaven
    };
  }, [invoiceHistory]);

  const chartData = useMemo(() => {
    return invoiceHistory.slice(0, 8).map(item => ({
      name: item.issuerName.length > 12 ? item.issuerName.substring(0, 12) + "..." : item.issuerName,
      "Shell Probability": item.shellProbability,
      "Fraud Score": item.fraudRiskScore
    }));
  }, [invoiceHistory]);

  const renderMarkdown = (text: string) => {
    if (!text) return null;
    return text.split("\n").map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("###")) {
        return (
          <h4 key={idx} className="text-sm font-bold text-indigo-400 mt-4 mb-2 font-mono">
            {trimmed.replace("###", "").trim()}
          </h4>
        );
      }
      if (trimmed.startsWith("##")) {
        return (
          <h3 key={idx} className="text-base font-bold text-indigo-300 mt-5 mb-2 border-b border-slate-800 pb-1">
            {trimmed.replace("##", "").trim()}
          </h3>
        );
      }
      if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
        const bulletContent = trimmed.substring(1).trim();
        const parts = bulletContent.split("**");
        return (
          <li key={idx} className="text-xs text-slate-300 ml-4 list-disc leading-relaxed mt-1">
            {parts.map((part, pIdx) => (pIdx % 2 === 1 ? <strong key={pIdx} className="font-extrabold text-white">{part}</strong> : part))}
          </li>
        );
      }
      if (trimmed.startsWith("1.") || trimmed.startsWith("2.") || trimmed.startsWith("3.") || trimmed.startsWith("4.")) {
        const parts = trimmed.split("**");
        return (
          <div key={idx} className="text-xs text-slate-300 ml-2 pl-2 border-l border-indigo-500/30 leading-relaxed mt-2">
            {parts.map((part, pIdx) => (pIdx % 2 === 1 ? <strong key={pIdx} className="font-extrabold text-white">{part}</strong> : part))}
          </div>
        );
      }
      if (trimmed === "") {
        return <div key={idx} className="h-2" />;
      }
      const parts = line.split("**");
      return (
        <p key={idx} className="text-xs text-slate-300 leading-relaxed">
          {parts.map((part, pIdx) => (pIdx % 2 === 1 ? <strong key={pIdx} className="font-extrabold text-white">{part}</strong> : part))}
        </p>
      );
    });
  };

  const handleTaxVerify = async () => {
    if (!vatNumber.trim()) {
      showToast("Please provide a Tax/VAT identification number", 'warning');
      return;
    }
    setTaxChecking(true);
    setTaxResult(null);
    try {
      const res = await fetchWithRetry("/api/v1/fintech/tax-vat/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vatNumber, countryCode: taxCountryCode, companyName: taxCompanyName })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTaxResult(data.validation);
      } else {
        showToast(data.error || "Tax verification failed", 'error');
      }
    } catch (e) {
      console.error(e);
      showToast("Failed to connect to TAX/VAT registry verification server.", 'error');
    } finally {
      setTaxChecking(false);
    }
  };

  const handleInvoiceAudit = async () => {
    setAuditingInvoice(true);
    setAuditResult(null);
    try {
      const res = await fetchWithRetry("/api/v1/fintech/invoice-shell/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceData: { ...invoiceForm, headcount: parseInt(invoiceForm.headcount) || 1, incorporationYears: parseInt(invoiceForm.incorporationYears) || 1 } })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAuditResult(data.audit);
        fetchInvoiceHistory(); // Automatically sync with Insights Dashboard
      } else {
        showToast(data.error || "Forensic audit failed", 'error');
      }
    } catch (e) {
      console.error(e);
      showToast("Failed to connect to Forensic Audit server.", 'error');
    } finally {
      setAuditingInvoice(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);
    setUploadedFileName(file.name);

    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
      });

      const res = await fetchWithRetry("/api/v1/fintech/invoice-shell/scan-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileData: base64Data,
          mimeType: file.type || "application/octet-stream",
          fileName: file.name
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setInvoiceForm({
          issuerName: data.extractedData.issuerName || "",
          issuerCountry: data.extractedData.issuerCountry || "",
          issuerAddress: data.extractedData.issuerAddress || "",
          issuerTaxId: data.extractedData.issuerTaxId || "",
          beneficiaryName: data.extractedData.beneficiaryName || "",
          beneficiaryCountry: data.extractedData.beneficiaryCountry || "",
          amount: data.extractedData.amount || "",
          currency: data.extractedData.currency || "",
          invoiceNumber: data.extractedData.invoiceNumber || "",
          description: data.extractedData.description || "",
          bankAccount: data.extractedData.bankAccount || "",
          headcount: data.extractedData.headcount || "1",
          incorporationYears: data.extractedData.incorporationYears || "1"
        });
        setUploadSuccess(true);
      } else {
        setUploadError(data.error || "Failed to scan or parse the invoice file.");
      }
    } catch (e: any) {
      console.error(e);
      setUploadError(e.message || "An error occurred during file upload.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  // Enterprise Transaction Monitoring & Case management states
  const [transactions, setTransactions] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [caseJustification, setCaseJustification] = useState("");
  const [isSimulatorRunning, setIsSimulatorRunning] = useState(false);
  const [activeMonitoringSubTab, setActiveMonitoringSubTab] = useState<'ws-stream' | 'feed' | 'cases' | 'rules'>('ws-stream');
  const [showManualDispatcher, setShowManualDispatcher] = useState(false);
  const [manualTxForm, setManualTxForm] = useState({
    senderName: "",
    senderCountry: "Germany",
    senderIsPep: false,
    receiverName: "",
    receiverCountry: "France",
    receiverIsSanctioned: false,
    amount: "4500",
    currency: "USD",
    channel: "SEPA" as "SWIFT" | "SEPA" | "ACH" | "CHIPS" | "CRYPTO"
  });

  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterRisk, setFilterRisk] = useState<string>("ALL");

  // OpenSanctions & AI Bias Assessor state
  const [screenName, setScreenName] = useState("");
  const [screenCountry, setScreenCountry] = useState("");
  const [screenType, setScreenType] = useState<"individual" | "company" | "vessel">("individual");
  const [isScreening, setIsScreening] = useState(false);
  const [screenResult, setScreenResult] = useState<any>(null);
  const [isAssessing, setIsAssessing] = useState(false);
  const [biasReport, setBiasReport] = useState<any>(null);

  const handleScreen = async (nameOverride?: string, typeOverride?: "individual" | "company" | "vessel", countryOverride?: string) => {
    const targetName = nameOverride !== undefined ? nameOverride : screenName;
    const targetType = typeOverride !== undefined ? typeOverride : screenType;
    const targetCountry = countryOverride !== undefined ? countryOverride : screenCountry;

    if (!targetName.trim()) {
      showToast("Please enter or select a name to screen.", 'warning');
      return;
    }

    setIsScreening(true);
    setScreenResult(null);
    setBiasReport(null);

    try {
      const res = await fetchWithRetry("/api/v1/fintech/opensanctions/screen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: targetName, country: targetCountry, entityType: targetType })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setScreenResult(data.match);
        // Sync inputs with override choices if clicked from presets
        if (nameOverride !== undefined) setScreenName(nameOverride);
        if (typeOverride !== undefined) setScreenType(typeOverride);
        if (countryOverride !== undefined) setScreenCountry(countryOverride);
      } else {
        showToast(`Screening error: ${data.error || "Unknown error"}`, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to connect to the OpenSanctions screen engine.", 'error');
    } finally {
      setIsScreening(false);
    }
  };

  const handleBiasAssess = async () => {
    const targetName = screenResult?.name || screenName;
    if (!targetName.trim()) {
      showToast("Please run a screening check first to audit phonetic demographics.", 'warning');
      return;
    }

    setIsAssessing(true);
    setBiasReport(null);

    try {
      const res = await fetchWithRetry("/api/v1/fintech/opensanctions/bias-assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: targetName, country: screenCountry, entityType: screenType })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBiasReport(data.report);
      } else {
        showToast(`Bias evaluation error: ${data.error || "Unknown error"}`, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to connect to the Algorithmic Bias Assessor service.", 'error');
    } finally {
      setIsAssessing(false);
    }
  };

  // MICA Forensic state and mock data
  const [walletInput, setWalletInput] = useState("");
  const [forensicResult, setForensicResult] = useState<any>(null);
  const [isForensicScanning, setIsForensicScanning] = useState(false);
  const [sarReportGenerated, setSarReportGenerated] = useState(false);

  const mockWallets: Record<string, any> = {
    "0x71C7656EC7ab88b098defB751B7401B5f6d14731": {
      address: "0x71C7656EC7ab88b098defB751B7401B5f6d14731",
      riskScore: 92,
      status: "CRITICAL ALERT",
      anomalies: [
        "Self-Funded Circular Loop detected (Wallet A -> B -> C -> A within 120 seconds)",
        "Artificial volume inflating wash-trading profile on decentralized orderbook",
        "Associated with known sanction mixer address Tornado Cash"
      ],
      scoreDetails: { washIndex: 94, circularLoops: 12, mixingRatio: 85 }
    },
    "0x88F3B36EC9ab99b098defB751B7401B5f6d14742": {
      address: "0x88F3B36EC9ab99b098defB751B7401B5f6d14742",
      riskScore: 45,
      status: "MEDIUM RISK",
      anomalies: [
        "High-velocity transfer bursts (50 transactions in 5 seconds)",
        "Suspected automated trading bot footprint without registered trading license"
      ],
      scoreDetails: { washIndex: 35, circularLoops: 3, mixingRatio: 12 }
    },
    "0x12A9856EC1ab22b098defB751B7401B5f6d14710": {
      address: "0x12A9856EC1ab22b098defB751B7401B5f6d14710",
      riskScore: 12,
      status: "SAFE / TRUSTED",
      anomalies: [
        "Standard multi-sig distribution signatures verified under eIDAS custody frameworks"
      ],
      scoreDetails: { washIndex: 2, circularLoops: 0, mixingRatio: 0 }
    }
  };

  const handleMicaScan = () => {
    if (!walletInput.trim()) {
      showToast("Please enter a valid wallet address (e.g. 0x71C7656EC7ab88b098defB751B7401B5f6d14731)", 'warning');
      return;
    }
    setIsForensicScanning(true);
    setForensicResult(null);
    setSarReportGenerated(false);
    setTimeout(() => {
      setIsForensicScanning(false);
      const matched = mockWallets[walletInput] || {
        address: walletInput,
        riskScore: Math.floor(Math.random() * 45) + 5,
        status: "LOW RISK",
        anomalies: ["No critical market abuse circular paths detected.", "Volume patterns standard and matched to secondary market depth."],
        scoreDetails: { washIndex: Math.floor(Math.random() * 20), circularLoops: 0, mixingRatio: Math.floor(Math.random() * 15) }
      };
      setForensicResult(matched);
    }, 1000);
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetchWithRetry("/api/v1/fintech/transactions");
      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch (e) {
      console.error("Failed to fetch transactions:", e);
    }
  };

  const fetchRules = async () => {
    try {
      const res = await fetchWithRetry("/api/v1/fintech/rules");
      const data = await res.json();
      setRules(data.rules || []);
    } catch (e) {
      console.error("Failed to fetch rules:", e);
    }
  };

  const fetchCases = async () => {
    try {
      const res = await fetchWithRetry("/api/v1/fintech/cases");
      const data = await res.json();
      setCases(data.cases || []);
    } catch (e) {
      console.error("Failed to fetch cases:", e);
    }
  };

  const fetchChecks = async () => {
    setLoading(true);
    try {
      const res = await fetchWithRetry("/api/v1/fintech/aml-checks", {
        headers: { "Authorization": "Bearer mock-token" }
      });
      const data = await res.json();
      setKycChecks(data.checks || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRule = async (id: string, enabled: boolean, value?: number) => {
    try {
      const res = await fetchWithRetry("/api/v1/fintech/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, enabled, value })
      });
      if (res.ok) {
        fetchRules();
      }
    } catch (e) {
      console.error("Failed to update rule:", e);
    }
  };

  const handleCaseAction = async (id: string, action: 'DISMISS' | 'SAR_FILE') => {
    if (!caseJustification.trim()) {
      showToast("Please provide complete investigator notes & legal justification.", 'warning');
      return;
    }
    setLoading(true);
    try {
      const res = await fetchWithRetry(`/api/v1/fintech/cases/${id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, justification: caseJustification })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchCases();
        fetchTransactions();
        setCaseJustification("");
        showToast(action === 'DISMISS' 
          ? "Compliance Case successfully dismissed and transaction cleared." 
          : `SAR Document filed with regulatory authorities. Reference ID: ${data.case.sarDraft?.fincenID}`,
          'success'
        );
      } else {
        showToast(`Filing error: ${data.error || "Unknown error"}`, 'error');
      }
    } catch (e) {
      console.error("Case action execution failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const handlePostWebhook = async (payload: any) => {
    try {
      const res = await fetchWithRetry("/api/v1/fintech/transactions/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchTransactions();
        fetchCases();
        return data;
      }
    } catch (e) {
      console.error("Webhook dispatcher failed:", e);
    }
  };

  useEffect(() => {
    fetchChecks();
    fetchTransactions();
    fetchRules();
    fetchCases();
    fetchInvoiceHistory();
  }, []);

  // Simulated live transaction ingestion
  useEffect(() => {
    if (!isSimulatorRunning) return;

    const names = [
      "Liam O'Connor", "Sergei Romanov", "Isabella Bianchi", "Fatima Al-Sayed", 
      "Chen Wei", "Sophia Martinez", "Santiago Silva", "Yuki Tanaka", 
      "Amina Diop", "Oliver Hansen"
    ];
    const countries = [
      "United Kingdom", "Russia", "Italy", "United Arab Emirates", 
      "China", "Mexico", "Brazil", "Japan", "Senegal", "Germany", 
      "Cayman Islands", "Iran"
    ];
    const receivers = [
      "Prime Direct LTD", "Nornickel Logistics Co", "Eurostar Travel Corp", "Al-Sadiq Global Trading",
      "Vanguard Asset Custody", "Inovatech Solutions", "Amazon Web Services", "MercadoLibre SA",
      "Takahashi Electronics", "Dakar Port Logistics"
    ];

    const interval = setInterval(() => {
      const randomSender = names[Math.floor(Math.random() * names.length)];
      const randomReceiver = receivers[Math.floor(Math.random() * receivers.length)];
      const randomCountryS = countries[Math.floor(Math.random() * countries.length)];
      const randomCountryR = countries[Math.floor(Math.random() * countries.length)];
      
      const isPep = Math.random() > 0.85;
      const isSanctioned = randomReceiver === "Nornickel Logistics Co" || Math.random() > 0.95;
      
      const roll = Math.random();
      let amount = Math.floor(Math.random() * 5000) + 100;
      if (roll > 0.85) {
        amount = Math.floor(Math.random() * 1000) + 9000; // potential structuring (9000 - 10000)
      } else if (roll > 0.70) {
        amount = Math.floor(Math.random() * 80000) + 12000; // large transactions
      }

      const channelOptions = ["SWIFT", "SEPA", "ACH", "CHIPS", "CRYPTO"] as const;
      const channel = channelOptions[Math.floor(Math.random() * channelOptions.length)];

      handlePostWebhook({
        senderName: randomSender,
        senderCountry: randomCountryS,
        senderIsPep: isPep,
        receiverName: randomReceiver,
        receiverCountry: randomCountryR,
        receiverIsSanctioned: isSanctioned,
        amount,
        currency: randomCountryS === "Germany" || randomCountryS === "Italy" ? "EUR" : "USD",
        channel
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [isSimulatorRunning]);

  const runVerification = async () => {
    if (!testUserId) return showToast("Please enter a User ID or name to verify", 'warning');
    setLoading(true);
    try {
      const res = await fetchWithRetry("/api/v1/fintech/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: testUserId })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Verification Complete. Status: ${data.result.status}, Risk Score: ${data.result.riskScore}`, 'success');
        fetchChecks();
      } else {
        showToast(`Error: ${data.error}`, 'error');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const trendData = [
    { date: "Mon", passed: 42, flagged: 3 },
    { date: "Tue", passed: 58, flagged: 5 },
    { date: "Wed", passed: 49, flagged: 2 },
    { date: "Thu", passed: 65, flagged: 8 },
    { date: "Fri", passed: 71, flagged: 4 },
    { date: "Sat", passed: 35, flagged: 1 },
    { date: "Sun", passed: 40, flagged: 2 },
  ];

  return (
    <div className="w-full h-full flex flex-col space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Fingerprint className="w-6 h-6 text-indigo-600" />
            Fintech AML/KYC Addon
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Advanced identity verification, PEP screening, and real-time transaction monitoring for financial operations.
          </p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab("VERIFICATION")}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-all shrink-0 ${
              activeTab === "VERIFICATION" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Verification queue
          </button>
          <button
            onClick={() => setActiveTab("KYB_FIRM_INTEGRATION")}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-all shrink-0 ${
              activeTab === "KYB_FIRM_INTEGRATION" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            KYB Firm Integration
          </button>
          <button
            onClick={() => setActiveTab("MONITORING")}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-all shrink-0 ${
              activeTab === "MONITORING" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Transaction Monitoring
          </button>
          <button
            onClick={() => setActiveTab("MICA_FORENSICS")}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-all shrink-0 ${
              activeTab === "MICA_FORENSICS" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            MICA Crypto Forensics
          </button>
          <button
            onClick={() => setActiveTab("SANCTIONS_SCREENING")}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-all shrink-0 ${
              activeTab === "SANCTIONS_SCREENING" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            OpenSanctions Screen
          </button>
          <button
            onClick={() => setActiveTab("TAX_VAT")}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-all shrink-0 ${
              activeTab === "TAX_VAT" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            TAX & VAT Checker
          </button>
          <button
            onClick={() => setActiveTab("INVOICE_SHELL")}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-all shrink-0 ${
              activeTab === "INVOICE_SHELL" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Invoice & Shell Audit
          </button>
          <button
            onClick={() => setActiveTab("FRAUD_DETECTION")}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-all shrink-0 ${
              activeTab === "FRAUD_DETECTION" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Fraud Detection Engine
          </button>
          <button
            onClick={() => setActiveTab("ZERO_DOWNTIME_HUB")}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === "ZERO_DOWNTIME_HUB" ? "bg-indigo-600 text-white shadow-sm" : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Zero-Downtime Integration Hub
          </button>
          <button
            onClick={() => setActiveTab("SETTINGS")}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-all shrink-0 ${
              activeTab === "SETTINGS" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Risk Engine Settings
          </button>
        </div>
      </div>

      {activeTab === "KYB_FIRM_INTEGRATION" && (
        <KybFirmIntegration />
      )}
      {activeTab === "VERIFICATION" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 lg:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800">Recent Identity Verifications</h2>
                <button onClick={fetchChecks} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                  <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">User</th>
                      <th className="px-4 py-3">Risk Score</th>
                      <th className="px-4 py-3">PEP Match</th>
                      <th className="px-4 py-3">Sanctions</th>
                      <th className="px-4 py-3 rounded-tr-lg">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {kycChecks.length === 0 && !loading && (
                      <tr>
                        <td colSpan={5} className="px-4 py-5 sm:py-8 text-center text-slate-500">No verification records found.</td>
                      </tr>
                    )}
                    {kycChecks.map((check) => (
                      <tr key={check.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {check.userName}
                          <div className="text-[10px] text-slate-400 font-mono">{check.userId}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            check.riskScore < 30 ? "bg-emerald-100 text-emerald-700" :
                            check.riskScore < 70 ? "bg-amber-100 text-amber-700" :
                            "bg-rose-100 text-rose-700"
                          }`}>
                            {check.riskScore}/100
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {check.pepMatch ? <span className="text-rose-600 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Yes</span> : <span className="text-emerald-600">No</span>}
                        </td>
                        <td className="px-4 py-3">
                           {check.sanctionsMatch ? <span className="text-rose-600 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Match</span> : <span className="text-emerald-600">Clear</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold border ${
                            check.status === 'PASSED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            check.status === 'FAILED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {check.status === 'PASSED' && <CheckCircle2 className="w-3 h-3" />}
                            {check.status === 'FAILED' && <XCircle className="w-3 h-3" />}
                            {check.status === 'PENDING_REVIEW' && <Clock className="w-3 h-3" />}
                            {check.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="bg-indigo-900 rounded-2xl p-4 sm:p-5 lg:p-6 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Globe className="w-24 h-24" />
              </div>
              <h3 className="font-bold text-lg mb-2 relative z-10">Run Manual Verification</h3>
              <p className="text-indigo-200 text-sm mb-4 relative z-10">
                Trigger the global identity intelligence engine to screen against 400+ international sanction lists and PEP registries.
              </p>
              <div className="space-y-3 relative z-10">
                <div>
                  <label className="text-xs font-bold text-indigo-300 uppercase">Target User ID / Name</label>
                  <input
                    type="text"
                    value={testUserId}
                    onChange={(e) => setTestUserId(e.target.value)}
                    placeholder="e.g. John Doe or usr_123"
                    className="w-full mt-1 px-3 py-2 bg-indigo-950/50 border border-indigo-700 rounded-lg text-white placeholder-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <button
                  onClick={runVerification}
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg flex justify-center items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  {loading ? "Screening Entity..." : "Screen Entity"}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 lg:p-6">
               <h3 className="font-bold text-slate-800 mb-4">Verification Volume (7 Days)</h3>
               <div className="h-48">
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={trendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                     <defs>
                       <linearGradient id="colorPassed" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                     <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                     <Tooltip 
                       contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                       labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                     />
                     <Area type="monotone" dataKey="passed" stroke="#10b981" fillOpacity={1} fill="url(#colorPassed)" strokeWidth={2} />
                   </AreaChart>
                 </ResponsiveContainer>
               </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "MONITORING" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
          {/* Header & Section Navigation */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600 animate-pulse" />
                Enterprise Transaction Risk Monitor
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Real-time transaction screening, AML rule scoring, and automatic BSA FinCEN Case Management.
              </p>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200/60 max-w-full overflow-x-auto shrink-0">
              <button
                onClick={() => setActiveMonitoringSubTab('ws-stream')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeMonitoringSubTab === 'ws-stream' ? "bg-white text-indigo-700 shadow-sm font-semibold" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                Live WebSocket Stream (EU AML/CTF)
              </button>
              <button
                onClick={() => setActiveMonitoringSubTab('feed')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeMonitoringSubTab === 'feed' ? "bg-white text-indigo-700 shadow-sm font-semibold" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <History className="w-3.5 h-3.5" />
                REST Webhook Feed
              </button>
              <button
                onClick={() => setActiveMonitoringSubTab('cases')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeMonitoringSubTab === 'cases' ? "bg-white text-indigo-700 shadow-sm font-semibold" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Compliance Cases ({cases.filter(c => c.status === 'OPEN').length})
              </button>
              <button
                onClick={() => setActiveMonitoringSubTab('rules')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeMonitoringSubTab === 'rules' ? "bg-white text-indigo-700 shadow-sm font-semibold" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                Rules Config Engine
              </button>
            </div>
          </div>

          {/* 0. LIVE WEBSOCKET MONITORING STREAM SUB-TAB */}
          {activeMonitoringSubTab === 'ws-stream' && (
            <div className="pt-2">
              <RealtimeTransactionMonitoringDashboard />
            </div>
          )}

          {/* 1. LIVE LEDGER FEED SUB-TAB */}
          {activeMonitoringSubTab === 'feed' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Simulator & Dispatcher Controller */}
              <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-slate-50 p-4 border border-slate-200/80 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-3.5 w-3.5">
                    {isSimulatorRunning && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    )}
                    <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${isSimulatorRunning ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 uppercase block">Automatic Webhook Ingestion Feed</span>
                    <p className="text-[10px] text-slate-500">Pushes randomized high-fidelity transaction payloads every 4.5 seconds.</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    onClick={() => setIsSimulatorRunning(!isSimulatorRunning)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer border transition-all ${
                      isSimulatorRunning
                        ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        : 'bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-500 shadow-sm'
                    }`}
                  >
                    {isSimulatorRunning ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    {isSimulatorRunning ? 'Pause Simulator' : 'Start Live Feed'}
                  </button>
                  <button
                    onClick={() => setShowManualDispatcher(!showManualDispatcher)}
                    className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 cursor-pointer flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5 text-slate-500" />
                    {showManualDispatcher ? 'Collapse Webhook Payload' : 'Manual Webhook Payload'}
                  </button>
                </div>
              </div>

              {/* Manual Payload Dispatcher Form */}
              {showManualDispatcher && (
                <div className="p-5 border border-slate-200/80 rounded-xl space-y-4 bg-slate-50/50 animate-fade-in">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200/60 pb-2">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Fingerprint className="w-4 h-4 text-indigo-500" />
                      API Webhook Ingress Dispatcher
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 border px-2 py-0.5 rounded">POST /v1/fintech/transactions/webhook</span>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Quick Ingress Presets:</span>
                    <button
                      onClick={() => setManualTxForm({
                        senderName: "Alexander Lukashenko", senderCountry: "Belarus", senderIsPep: true,
                        receiverName: "Minsk Aviation Logistics", receiverCountry: "Belarus", receiverIsSanctioned: true,
                        amount: "45000", currency: "EUR", channel: "SWIFT"
                      })}
                      className="px-2 py-1 bg-white border border-slate-200 text-[10px] font-medium text-slate-700 rounded hover:border-indigo-500 hover:bg-indigo-50/10 cursor-pointer transition-colors"
                    >
                      🚨 Sanctions Match Violator
                    </button>
                    <button
                      onClick={() => setManualTxForm({
                        senderName: "Yoko Sato", senderCountry: "Japan", senderIsPep: false,
                        receiverName: "Crypto Liquidity Ltd", receiverCountry: "Cayman Islands", receiverIsSanctioned: false,
                        amount: "9820", currency: "USD", channel: "CRYPTO"
                      })}
                      className="px-2 py-1 bg-white border border-slate-200 text-[10px] font-medium text-slate-700 rounded hover:border-indigo-500 hover:bg-indigo-50/10 cursor-pointer transition-colors"
                    >
                      🐳 Structuring ($9,820 USD)
                    </button>
                    <button
                      onClick={() => setManualTxForm({
                        senderName: "Maria G.", senderCountry: "Germany", senderIsPep: false,
                        receiverName: "Paris Retailer Co", receiverCountry: "France", receiverIsSanctioned: false,
                        amount: "450", currency: "EUR", channel: "SEPA"
                      })}
                      className="px-2 py-1 bg-white border border-slate-200 text-[10px] font-medium text-slate-700 rounded hover:border-indigo-500 hover:bg-indigo-50/10 cursor-pointer transition-colors"
                    >
                      ✅ Standard Compliant Wire
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Sender Full Name</label>
                      <input
                        type="text"
                        value={manualTxForm.senderName}
                        onChange={(e) => setManualTxForm({ ...manualTxForm, senderName: e.target.value })}
                        placeholder="e.g. John Smith"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Sender Country</label>
                      <input
                        type="text"
                        value={manualTxForm.senderCountry}
                        onChange={(e) => setManualTxForm({ ...manualTxForm, senderCountry: e.target.value })}
                        placeholder="e.g. United Kingdom"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-5">
                      <input
                        type="checkbox"
                        id="senderIsPep"
                        checked={manualTxForm.senderIsPep}
                        onChange={(e) => setManualTxForm({ ...manualTxForm, senderIsPep: e.target.checked })}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                      />
                      <label htmlFor="senderIsPep" className="text-xs font-semibold text-slate-600 cursor-pointer select-none">Sender is a Politically Exposed Person (PEP)</label>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Receiver Beneficiary Name</label>
                      <input
                        type="text"
                        value={manualTxForm.receiverName}
                        onChange={(e) => setManualTxForm({ ...manualTxForm, receiverName: e.target.value })}
                        placeholder="e.g. Acme Corp"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Receiver Country</label>
                      <input
                        type="text"
                        value={manualTxForm.receiverCountry}
                        onChange={(e) => setManualTxForm({ ...manualTxForm, receiverCountry: e.target.value })}
                        placeholder="e.g. United States"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-5">
                      <input
                        type="checkbox"
                        id="receiverIsSanctioned"
                        checked={manualTxForm.receiverIsSanctioned}
                        onChange={(e) => setManualTxForm({ ...manualTxForm, receiverIsSanctioned: e.target.checked })}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                      />
                      <label htmlFor="receiverIsSanctioned" className="text-xs font-semibold text-slate-600 cursor-pointer select-none">Beneficiary is in Sanctions Registry Match</label>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Transaction Amount</label>
                      <input
                        type="number"
                        value={manualTxForm.amount}
                        onChange={(e) => setManualTxForm({ ...manualTxForm, amount: e.target.value })}
                        placeholder="e.g. 5000"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Currency</label>
                      <select
                        value={manualTxForm.currency}
                        onChange={(e) => setManualTxForm({ ...manualTxForm, currency: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="JPY">JPY (¥)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Ingress Channel</label>
                      <select
                        value={manualTxForm.channel}
                        onChange={(e) => setManualTxForm({ ...manualTxForm, channel: e.target.value as any })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="SWIFT">SWIFT International Wire</option>
                        <option value="SEPA">SEPA European Settlement</option>
                        <option value="ACH">ACH Domestic Settlement</option>
                        <option value="CHIPS">CHIPS High Value Clearing</option>
                        <option value="CRYPTO">On-Chain Smart Escrow</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-3 border-t border-slate-200/60">
                    <button
                      onClick={async () => {
                        if (!manualTxForm.senderName || !manualTxForm.receiverName || !manualTxForm.amount) {
                          showToast("Sender Name, Receiver Name, and Amount are strictly mandatory variables.", 'warning');
                          return;
                        }
                        const res = await handlePostWebhook(manualTxForm);
                        if (res && res.success) {
                          showToast(`Manual webhook ingestion successful. ${res.status}`, 'success');
                          setManualTxForm({
                            senderName: "", senderCountry: "Germany", senderIsPep: false,
                            receiverName: "", receiverCountry: "France", receiverIsSanctioned: false,
                            amount: "4500", currency: "USD", channel: "SEPA"
                          });
                          setShowManualDispatcher(false);
                        }
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCcw className="w-3.5 h-3.5" />
                      Dispatch Webhook Simulation
                    </button>
                  </div>
                </div>
              )}

              {/* Filters Header */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-b border-slate-100 pb-3 pt-2">
                <span className="text-xs text-slate-500 font-medium">
                  Showing <strong className="text-slate-900">{transactions.filter(t => {
                    if (filterRisk === "CRITICAL" && t.riskScore < 90) return false;
                    if (filterRisk === "HIGH" && (t.riskScore < 60 || t.riskScore >= 90)) return false;
                    if (filterRisk === "SAFE" && t.riskScore >= 60) return false;
                    if (filterStatus !== "ALL" && t.status !== filterStatus) return false;
                    return true;
                  }).length}</strong> transactions out of {transactions.length} total.
                </span>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <select
                    value={filterRisk}
                    onChange={(e) => setFilterRisk(e.target.value)}
                    className="flex-1 sm:flex-initial px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none bg-white text-slate-600 font-bold"
                  >
                    <option value="ALL">All Threat Scopes</option>
                    <option value="CRITICAL">Critical Threats (90+)</option>
                    <option value="HIGH">High Threats (60-89)</option>
                    <option value="SAFE">Low Threat Baselands (&lt;60)</option>
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="flex-1 sm:flex-initial px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none bg-white text-slate-600 font-bold"
                  >
                    <option value="ALL">All Router Statuses</option>
                    <option value="SETTLED">Settled Protocols</option>
                    <option value="REVIEW">Flagged for Review</option>
                    <option value="SUSPENDED">Suspended Operations</option>
                    <option value="BLOCKED">Blocked Accounts</option>
                  </select>
                </div>
              </div>

              {/* Transactions Ledger Table */}
              <div className="overflow-x-auto border border-slate-150 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Transaction ID</th>
                      <th className="px-4 py-3">Sender Profile</th>
                      <th className="px-4 py-3">Beneficiary Profile</th>
                      <th className="px-4 py-3">Valuation & Route</th>
                      <th className="px-4 py-3 text-center">Threat Score</th>
                      <th className="px-4 py-3">Compliance Flags</th>
                      <th className="px-4 py-3 text-right">Operational Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-slate-400 font-medium">No live ledger transactions. Please start the stream simulator or dispatch a webhook payload.</td>
                      </tr>
                    ) : (
                      transactions.filter(t => {
                        if (filterRisk === "CRITICAL" && t.riskScore < 90) return false;
                        if (filterRisk === "HIGH" && (t.riskScore < 60 || t.riskScore >= 90)) return false;
                        if (filterRisk === "SAFE" && t.riskScore >= 60) return false;
                        if (filterStatus !== "ALL" && t.status !== filterStatus) return false;
                        return true;
                      }).map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-slate-600">{tx.id}</td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-slate-900 block">{tx.senderName}</span>
                            <span className="text-slate-400 block text-[10px]">{tx.senderCountry} {tx.senderIsPep && <strong className="text-amber-600 font-bold bg-amber-50 px-1 rounded">PEP</strong>}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-slate-900 block">{tx.receiverName}</span>
                            <span className="text-slate-400 block text-[10px]">{tx.receiverCountry} {tx.receiverIsSanctioned && <strong className="text-rose-600 font-bold bg-rose-50 px-1 rounded">SANCTIONED</strong>}</span>
                          </td>
                          <td className="px-4 py-3">
                            <strong className="text-slate-900 block font-semibold">{tx.amount.toLocaleString(undefined, { style: 'currency', currency: tx.currency })}</strong>
                            <span className="text-[10px] font-mono text-indigo-600 font-bold block">{tx.channel}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-extrabold font-mono ${
                              tx.riskScore >= 90 ? 'bg-rose-100 text-rose-800' :
                              tx.riskScore >= 60 ? 'bg-amber-100 text-amber-800' :
                              'bg-emerald-100 text-emerald-800'
                            }`}>
                              {tx.riskScore}/100
                            </span>
                          </td>
                          <td className="px-4 py-3 max-w-[200px] truncate">
                            {tx.flags && tx.flags.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {tx.flags.map((flag: string, idx: number) => (
                                  <span key={idx} className="bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded text-[9px] font-bold tracking-tight uppercase" title={flag}>
                                    {flag.split(' ')[0]}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-emerald-600 font-semibold text-[10px]">CLEAR WHITELIST</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {tx.caseId ? (
                              <button
                                onClick={() => {
                                  setSelectedCaseId(tx.caseId);
                                  setActiveMonitoringSubTab('cases');
                                }}
                                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold rounded text-[10px] transition-colors cursor-pointer"
                              >
                                View Case File
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Approved
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. COMPLIANCE CASES & INVESTIGATION QUEUE */}
          {activeMonitoringSubTab === 'cases' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 animate-fade-in">
              {/* Left Column: List of cases */}
              <div className="xl:col-span-1 space-y-4 border-r border-slate-100 pr-0 xl:pr-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Compliance Ingress Audit Queue</h4>
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {cases.length === 0 ? (
                    <div className="p-5 sm:p-6 lg:p-8 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                      No compliance cases logged. High threat payloads will auto-spawn casework here.
                    </div>
                  ) : (
                    cases.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setSelectedCaseId(c.id);
                          setCaseJustification("");
                        }}
                        className={`p-4 border rounded-xl cursor-pointer transition-all ${
                          selectedCaseId === c.id
                            ? 'bg-indigo-50/40 border-indigo-500 shadow-sm'
                            : 'bg-white border-slate-200/80 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="font-mono text-[10px] font-bold text-slate-400">{c.id}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase ${
                            c.status === 'OPEN' ? 'bg-amber-100 text-amber-800' :
                            c.status === 'DISMISSED' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {c.status}
                          </span>
                        </div>
                        <div className="text-xs space-y-0.5">
                          <div className="flex justify-between font-bold text-slate-800">
                            <span>{c.transaction.senderName}</span>
                            <span>→</span>
                            <span className="text-right">{c.transaction.receiverName}</span>
                          </div>
                          <div className="flex justify-between text-slate-400 text-[10px]">
                            <span>{c.transaction.senderCountry}</span>
                            <span>{c.transaction.amount.toLocaleString(undefined, { style: 'currency', currency: c.transaction.currency })}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Column: Case File Auditor */}
              <div className="xl:col-span-2 space-y-4">
                {selectedCaseId && cases.find(c => c.id === selectedCaseId) ? (
                  (() => {
                    const activeCase = cases.find(c => c.id === selectedCaseId);
                    return (
                      <div className="bg-slate-50/50 border border-slate-200/85 rounded-xl p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 animate-fade-in">
                        {/* Case File Header */}
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200 pb-4">
                          <div>
                            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wide">CONFIDENTIAL COMPLIANCE RECORD</span>
                            <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5 mt-0.5">
                              Case File: {activeCase.id}
                              <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold tracking-wider ${
                                activeCase.status === 'OPEN' ? 'bg-amber-100 text-amber-800' :
                                activeCase.status === 'DISMISSED' ? 'bg-emerald-100 text-emerald-800' :
                                'bg-rose-100 text-rose-800'
                              }`}>
                                {activeCase.status}
                              </span>
                            </h4>
                          </div>
                          <div className="text-xs text-slate-400 text-left sm:text-right font-mono">
                            <div>Ingestion: {new Date(activeCase.timestamp).toLocaleString()}</div>
                            <div>Auditor Desk: {activeCase.assignedTo}</div>
                          </div>
                        </div>

                        {/* Profiles & Risk Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-white border border-slate-150 rounded-lg space-y-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sender Entity Context</span>
                            <div className="text-xs space-y-1">
                              <div className="flex justify-between"><span className="text-slate-400">Legal Name:</span><strong className="text-slate-800 font-semibold">{activeCase.transaction.senderName}</strong></div>
                              <div className="flex justify-between"><span className="text-slate-400">Jurisdiction:</span><strong className="text-slate-800 font-semibold">{activeCase.transaction.senderCountry}</strong></div>
                              <div className="flex justify-between"><span className="text-slate-400">PEP Exposed Status:</span><strong className={activeCase.transaction.senderIsPep ? "text-amber-600 font-bold" : "text-emerald-600 font-semibold"}>{activeCase.transaction.senderIsPep ? "YES MATCH" : "CLEAR"}</strong></div>
                            </div>
                          </div>
                          <div className="p-4 bg-white border border-slate-150 rounded-lg space-y-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Beneficiary Entity Context</span>
                            <div className="text-xs space-y-1">
                              <div className="flex justify-between"><span className="text-slate-400">Legal Name:</span><strong className="text-slate-800 font-semibold">{activeCase.transaction.receiverName}</strong></div>
                              <div className="flex justify-between"><span className="text-slate-400">Jurisdiction:</span><strong className="text-slate-800 font-semibold">{activeCase.transaction.receiverCountry}</strong></div>
                              <div className="flex justify-between"><span className="text-slate-400">Sanctions Watchlist Match:</span><strong className={activeCase.transaction.receiverIsSanctioned ? "text-rose-600 font-bold" : "text-emerald-600 font-semibold"}>{activeCase.transaction.receiverIsSanctioned ? "YES MATCH" : "CLEAR"}</strong></div>
                            </div>
                          </div>
                        </div>

                        {/* Ledger Metadata */}
                        <div className="p-4 bg-indigo-950 text-indigo-100 rounded-lg space-y-2 border border-indigo-900 font-mono">
                          <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider block">Transactional Ingress Parameters</span>
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="text-indigo-400 block">Ingress Transfer Valuation</span>
                              <strong className="text-base text-white font-bold">{activeCase.transaction.amount.toLocaleString(undefined, { style: 'currency', currency: activeCase.transaction.currency })}</strong>
                            </div>
                            <div>
                              <span className="text-indigo-400 block">Router Channel Protocol</span>
                              <strong className="text-base text-white font-bold">{activeCase.transaction.channel} Routing</strong>
                            </div>
                          </div>
                        </div>

                        {/* active rule flags */}
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Score Ingress Violations ({activeCase.transaction.flags.length})</span>
                          <div className="space-y-1.5">
                            {activeCase.transaction.flags.map((flag: string, idx: number) => (
                              <div key={idx} className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2 rounded-lg text-xs font-semibold">
                                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                <div>
                                  <span className="uppercase">{flag.split(' (')[0]}</span>
                                  <span className="text-[10px] text-amber-600 block font-normal">{flag}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* CASE RESOLUTION ACTIONS PANEL */}
                        {activeCase.status === 'OPEN' && (
                          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Officer Case Action & Sign-off Notes</span>
                            <textarea
                              value={caseJustification}
                              onChange={(e) => setCaseJustification(e.target.value)}
                              placeholder="Describe your false-positive investigation notes, KYC source of wealth confirmations, or sanction clearing reports before signing off."
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs h-24 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/20"
                            />
                            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2 border-t border-slate-100">
                              <button
                                onClick={() => handleCaseAction(activeCase.id, 'DISMISS')}
                                disabled={loading}
                                className="px-4 py-2 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                              >
                                <Check className="w-4 h-4 text-slate-500" />
                                Clear & Dismiss Case File
                              </button>
                              <button
                                onClick={() => handleCaseAction(activeCase.id, 'SAR_FILE')}
                                disabled={loading}
                                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
                              >
                                <FileText className="w-4 h-4" />
                                Escalate & Draft FinCEN SAR
                              </button>
                            </div>
                          </div>
                        )}

                        {/* DISMISSED RESOLUTION */}
                        {activeCase.status === 'DISMISSED' && (
                          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg space-y-2 animate-fade-in">
                            <h5 className="font-bold text-xs flex items-center gap-1.5 text-emerald-800 border-b border-emerald-200/55 pb-1.5">
                              <UserCheck className="w-4 h-4 text-emerald-600" />
                              CASE RESOLVED: FALSE-POSITIVE DISMISSED & ACQUITTED
                            </h5>
                            <p className="text-xs font-sans leading-relaxed">
                              This case was successfully audited and cleared as a false-positive under global risk guidelines.
                            </p>
                            <div className="bg-white/80 p-2.5 rounded font-mono text-[11px] text-emerald-700/90 italic">
                              <strong>Officer Review Notes:</strong> "{activeCase.justification}"
                            </div>
                          </div>
                        )}

                        {/* SAR FILED RESOLUTION */}
                        {activeCase.status === 'SAR_FILED' && activeCase.sarDraft && (
                          <div className="space-y-4 animate-fade-in">
                            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-3">
                              <FileCheck className="w-8 h-8 text-rose-500 shrink-0" />
                              <div>
                                <strong className="text-xs text-rose-900 uppercase tracking-wide block">CONFIDENTIAL REGULATORY SAR COMPILED SECURELY</strong>
                                <span className="text-[10px] text-rose-600 font-mono block">Filing Reference HASH: {activeCase.sarDraft.fincenID}</span>
                              </div>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 font-mono text-[10px] text-slate-300 overflow-x-auto whitespace-pre leading-relaxed relative max-h-[350px]">
                              {/* Red Legal Stamp in background */}
                              <div className="absolute top-5 right-5 border-2 border-rose-500/20 text-rose-500/20 text-[10px] font-extrabold uppercase px-2 py-1 transform rotate-12 pointer-events-none select-none">
                                BSA CONFIDENTIAL FILING
                              </div>
                              {activeCase.sarDraft.draftText}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()
                ) : (
                  <div className="p-16 border-2 border-dashed border-slate-200 rounded-xl text-center flex flex-col items-center justify-center space-y-3">
                    <Activity className="w-12 h-12 text-slate-300" />
                    <h5 className="text-slate-700 font-bold text-sm">Regulatory Case Review Deck</h5>
                    <p className="text-xs text-slate-400 max-w-sm">
                      Please select an operational compliance file in the left queue. Review targets, core violations, and sign-off clearing certificates or file FinCEN reports.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. RULES MANAGEMENT SUB-TAB */}
          {activeMonitoringSubTab === 'rules' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-indigo-50/30 p-4 border border-indigo-100 rounded-xl flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed text-indigo-900">
                  <span className="font-bold">Real-time Rules Engine Instructions:</span>
                  <p className="mt-0.5 text-indigo-700">
                    Modifying rules here instantly updates the scoring parameters on the Express backend server. Any webhook dispatched or automatic live feed transactions will evaluate immediately under the active parameters.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rules.map((rule) => (
                  <div key={rule.id} className="p-5 border border-slate-200/80 rounded-xl bg-white space-y-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">{rule.name}</h4>
                      <button
                        onClick={() => handleUpdateRule(rule.id, !rule.enabled)}
                        className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors cursor-pointer ${
                          rule.enabled ? 'bg-indigo-600' : 'bg-slate-200'
                        }`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          rule.enabled ? 'translate-x-5' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed h-10">
                      {rule.description}
                    </p>

                    {/* Numeric parameter threshold controller */}
                    {(rule.type === 'threshold' || rule.type === 'structuring') && (
                      <div className="space-y-1.5 pt-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Trigger Threshold</span>
                          <strong className="text-indigo-600 font-bold font-mono">
                            {rule.value.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
                          </strong>
                        </div>
                        <input
                          type="range"
                          min={rule.type === 'threshold' ? "1000" : "5000"}
                          max={rule.type === 'threshold' ? "50000" : "10000"}
                          step="1000"
                          defaultValue={rule.value}
                          onMouseUp={(e) => {
                            const val = parseInt((e.target as HTMLInputElement).value);
                            handleUpdateRule(rule.id, rule.enabled, val);
                          }}
                          className="w-full accent-indigo-600 h-1 bg-slate-100 rounded-lg cursor-pointer"
                        />
                      </div>
                    )}

                    {rule.type === 'velocity' && (
                      <div className="space-y-1.5 pt-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Transaction Velocity Max</span>
                          <strong className="text-indigo-600 font-bold font-mono">{rule.value} Transactions / 30s</strong>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          defaultValue={rule.value}
                          onMouseUp={(e) => {
                            const val = parseInt((e.target as HTMLInputElement).value);
                            handleUpdateRule(rule.id, rule.enabled, val);
                          }}
                          className="w-full accent-indigo-600 h-1 bg-slate-100 rounded-lg cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "MICA_FORENSICS" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-bold text-slate-900 tracking-tight text-base flex items-center gap-1.5">
                    MICA On-Chain Forensic Auditor
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-amber-100 text-amber-800">
                      MICA Article 86 Compliant
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Evaluate virtual asset wallet signatures, wash-trading velocity metrics, and circular self-funded loops.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setWalletInput("0x71C7656EC7ab88b098defB751B7401B5f6d14731")}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded cursor-pointer"
                  >
                    Load Critical Loop
                  </button>
                  <button
                    onClick={() => setWalletInput("0x88F3B36EC9ab99b098defB751B7401B5f6d14742")}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded cursor-pointer"
                  >
                    Load Suspect Bot
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={walletInput}
                  onChange={(e) => setWalletInput(e.target.value)}
                  placeholder="Enter EVM wallet address to perform forensic auditing..."
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleMicaScan}
                  disabled={isForensicScanning}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 shrink-0 cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCcw className={`w-3.5 h-3.5 ${isForensicScanning ? 'animate-spin' : ''}`} />
                  {isForensicScanning ? 'Auditing...' : 'Run Forensic Audit'}
                </button>
              </div>

              {isForensicScanning && (
                <div className="py-12 flex flex-col items-center justify-center space-y-3">
                  <RefreshCcw className="w-8 h-8 text-indigo-500 animate-spin" />
                  <p className="text-sm text-slate-500 font-medium">Reconstructing on-chain transaction graph & matching against global PEP registers...</p>
                </div>
              )}

              {forensicResult && !isForensicScanning && (
                <div className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">MICA Wash Index</span>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-indigo-500" />
                        <span className="text-xl font-extrabold text-slate-900">{forensicResult.scoreDetails.washIndex}%</span>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Circular Paths Detected</span>
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-rose-500" />
                        <span className="text-xl font-extrabold text-slate-900">{forensicResult.scoreDetails.circularLoops} loops</span>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Mixer Association</span>
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-amber-500" />
                        <span className="text-xl font-extrabold text-slate-900">{forensicResult.scoreDetails.mixingRatio}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950 text-slate-100 rounded-xl p-5 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">On-chain Audit Findings</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider ${
                        forensicResult.riskScore > 70 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        forensicResult.riskScore > 30 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {forensicResult.status} (Score: {forensicResult.riskScore}/100)
                      </span>
                    </div>
                    <div className="space-y-2">
                      {forensicResult.anomalies.map((a: string, idx: number) => (
                        <div key={idx} className="text-xs text-slate-300 font-sans flex items-start gap-2">
                          <span className="text-amber-500 shrink-0 mt-0.5">•</span>
                          <span>{a}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
                    <div className="text-xs text-slate-500">
                      Generate suspicious transaction report to instantly push to EU national financial regulators.
                    </div>
                    <button
                      onClick={() => setSarReportGenerated(true)}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Generate MICA SAR Report
                    </button>
                  </div>

                  {sarReportGenerated && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-lg flex items-center gap-2 animate-fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-bold">MICA Suspicious Activity Report (SAR) successfully compiled!</span>
                        <p className="text-[11px] text-emerald-700/80 mt-1">Generated matching crypto wash forensic data patterns under EU Anti-Abuse Regulation guidelines. Safe hashes sent securely to the Regulator Ledger.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 lg:p-6 space-y-4">
              <h3 className="font-bold text-slate-800">Crypto Wash-Trading Analysis</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Aggregated daily volume profile matching typical order-splitting circular loop behaviors on top DEX and CEX protocols.
              </p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: '0x71C', circularLoops: 12, washIndex: 94 },
                    { name: '0x88F', circularLoops: 3, washIndex: 35 },
                    { name: '0x12A', circularLoops: 0, washIndex: 2 }
                  ]} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="circularLoops" name="Circular Loops" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="washIndex" name="Wash Index %" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-indigo-900 rounded-2xl p-4 sm:p-5 lg:p-6 text-white shadow-lg relative overflow-hidden space-y-3">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Brain className="w-24 h-24" />
              </div>
              <h3 className="font-bold text-base flex items-center gap-1.5">
                Active MICA Intelligence
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-indigo-200 text-xs leading-relaxed">
                The forensic engine matches multi-hop asset routes utilizing advanced graph representation modeling to guarantee compliance across non-custodial decentralized protocols in full compliance with UN sanction updates.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "SANCTIONS_SCREENING" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 animate-fade-in">
          <div className="xl:col-span-2 space-y-4 sm:space-y-6">
            {/* Sanctions Checker Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-600" />
                  Global OpenSanctions Screening Engine
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Cross-checks names against consolidated global lists (OFAC SDN, EU sanctions, UN Security Council, and PEP lists) with real-time entity resolution.
                </p>
              </div>

              {/* Preset selectors for easier evaluation */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Preset Quick-Test Profiles</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleScreen("Alisher Usmanov", "individual", "Russia")}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 hover:border-indigo-500 rounded-lg text-xs font-medium text-slate-700 transition-colors cursor-pointer"
                  >
                    🇷🇺 Alisher Usmanov (Oligarch)
                  </button>
                  <button
                    onClick={() => handleScreen("Kim Jong-un", "individual", "North Korea")}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 hover:border-indigo-500 rounded-lg text-xs font-medium text-slate-700 transition-colors cursor-pointer"
                  >
                    🇰🇵 Kim Jong-un (PEP / State)
                  </button>
                  <button
                    onClick={() => handleScreen("MT San San", "vessel", "Panama")}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 hover:border-indigo-500 rounded-lg text-xs font-medium text-slate-700 transition-colors cursor-pointer"
                  >
                    🚢 MT San San (Sanctioned Vessel)
                  </button>
                  <button
                    onClick={() => handleScreen("John Smith", "individual", "Canada")}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 hover:border-indigo-500 rounded-lg text-xs font-medium text-slate-700 transition-colors cursor-pointer"
                  >
                    🇨🇦 John Smith (Clear Entity)
                  </button>
                </div>
              </div>

              {/* Interactive Form fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Entity Name</label>
                  <input
                    type="text"
                    value={screenName}
                    onChange={(e) => setScreenName(e.target.value)}
                    placeholder="Enter full name of individual or company..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Country / Jurisdiction</label>
                  <input
                    type="text"
                    value={screenCountry}
                    onChange={(e) => setScreenCountry(e.target.value)}
                    placeholder="E.g., Russia, Iran, China (Optional)..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Entity Classification</label>
                  <select
                    value={screenType}
                    onChange={(e) => setScreenType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="individual">Individual / Person</option>
                    <option value="company">Corporate / Organization</option>
                    <option value="vessel">Vessel / Aircraft</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleScreen()}
                  disabled={isScreening}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Search className="w-3.5 h-3.5" />
                  {isScreening ? "Performing AI Resolution..." : "Cross-check OpenSanctions Database"}
                </button>
              </div>
            </div>

            {/* Screening Result Details */}
            {isScreening && (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center justify-center space-y-3 shadow-sm">
                <RefreshCcw className="w-8 h-8 text-indigo-500 animate-spin" />
                <p className="text-sm text-slate-600 font-semibold text-center">Interrogating global consolidated sanctions registers...</p>
                <p className="text-[11px] text-slate-400 text-center">Analyzing phonetic variants, name permutations, translative scripts and resolving false-positives via Gemini-3.5-Flash</p>
              </div>
            )}

            {screenResult && !isScreening && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Screened Query</span>
                    <h3 className="font-bold text-lg text-slate-800">{screenName}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-mono">Match Probability</span>
                      <span className="text-sm font-extrabold text-slate-900">{screenResult.confidence}% Confidence</span>
                    </div>
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase ${
                      screenResult.riskLevel === "CLEAR" ? "bg-emerald-100 text-emerald-800" :
                      screenResult.riskLevel === "LOW" ? "bg-cyan-100 text-cyan-800" :
                      screenResult.riskLevel === "MEDIUM" ? "bg-amber-100 text-amber-800" :
                      "bg-rose-100 text-rose-800"
                    }`}>
                      {screenResult.riskLevel} Risk
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-3">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">List Classifications</span>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Politically Exposed Person (PEP)</span>
                        <span className={`font-bold ${screenResult.isPep ? "text-rose-600" : "text-emerald-600"}`}>
                          {screenResult.isPep ? "YES" : "NO"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Sanctioned Profile Matches</span>
                        <span className={`font-bold ${screenResult.isSanctioned ? "text-rose-600" : "text-emerald-600"}`}>
                          {screenResult.isSanctioned ? "YES" : "NO"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-3">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Target Geopolitics matched</span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {screenResult.listsMatched && screenResult.listsMatched.length > 0 ? (
                        screenResult.listsMatched.map((list: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-200 border border-slate-300 text-slate-700 rounded text-[10px] font-semibold font-mono uppercase">
                            {list}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">No global watchlist matches. Safe whitelist.</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 text-slate-100 rounded-xl p-5 space-y-2 border border-slate-800">
                  <h4 className="text-xs font-bold font-mono text-indigo-300 flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5 text-indigo-400" />
                    AI Regulatory Match Resolution
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                    {screenResult.justification}
                  </p>
                  {screenResult.biasFlag && screenResult.biasFlag !== "None. Direct character correlation established." && (
                    <div className="mt-3 pt-3 border-t border-slate-800 flex items-start gap-1.5 text-[10px] text-indigo-200 bg-indigo-950/20 p-2 rounded">
                      <AlertCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <span><strong>Algorithmic Note:</strong> {screenResult.biasFlag}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
                  <div className="text-xs text-slate-500">
                    Audit potential linguistic and ethnic false-positive skew using our fairness validation validator.
                  </div>
                  <button
                    onClick={handleBiasAssess}
                    disabled={isAssessing}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    {isAssessing ? "Calculating Bias Indexes..." : "Audit Algorithmic Bias"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Bias Assessor & Analytics */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
              <div>
                <h3 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-indigo-600" />
                  AI Bias Auditor Panel
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Evaluates the screening model against ethnic/regional name-transliteration cohorts to ensure compliance with global algorithmic fairness legislation.
                </p>
              </div>

              {isAssessing && (
                <div className="py-12 flex flex-col items-center justify-center space-y-3">
                  <RefreshCcw className="w-6 h-6 text-indigo-500 animate-spin" />
                  <span className="text-xs text-slate-500 font-semibold">Running regional phonetic permutations...</span>
                  <span className="text-[10px] text-slate-400 font-medium">Comparing risk variances on Anglo, Arabic, Slavic and East Asian spellings</span>
                </div>
              )}

              {!isAssessing && !biasReport && (
                <div className="p-4 sm:p-5 lg:p-6 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400 space-y-2">
                  <p>No active bias audit. Please run a name check first and trigger the bias assessor to see fairness scoreboards.</p>
                </div>
              )}

              {biasReport && !isAssessing && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center gap-4 bg-slate-50 p-4 border border-slate-200/60 rounded-xl">
                    <div className="w-16 h-16 rounded-full border-4 border-indigo-600/20 flex items-center justify-center shrink-0">
                      <div className="text-center">
                        <span className="text-lg font-extrabold text-slate-800">{biasReport.fairnessIndex}</span>
                        <span className="text-[8px] text-slate-400 block font-bold">FAIRNESS</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider block">Algorithmic Integrity</span>
                      <p className="text-xs text-slate-700 font-semibold">
                        {biasReport.fairnessIndex > 85 ? "Low Systemic Disparity" : biasReport.fairnessIndex > 70 ? "Moderate Disparity Flag" : "Critical Phonetic Disparity"}
                      </p>
                    </div>
                  </div>

                  <div className="bg-indigo-950 text-indigo-200 rounded-xl p-4 text-[11px] leading-relaxed border border-indigo-900 font-mono">
                    <span className="text-[10px] text-indigo-400 font-bold uppercase block mb-1">Bias Analyst Findings</span>
                    {biasReport.systemBiasReport}
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Demographic Disparity Matrix Matrix</span>
                    <div className="h-48 pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={biasReport.demographics} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="region" tick={{ fontSize: 8, fill: '#64748b' }} />
                          <YAxis tick={{ fontSize: 9, fill: '#64748b' }} />
                          <Tooltip wrapperStyle={{ fontSize: 10 }} />
                          <Bar dataKey="riskDisparity" name="Disparity Score" fill="#6366f1" radius={[3, 3, 0, 0]} />
                          <Bar dataKey="falsePositiveRate" name="False Pos %" fill="#ec4899" radius={[3, 3, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono pt-1">
                      <span>Low Disparity = Fair Evaluation</span>
                      <span>High Disparity = Rigid Transliteration</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "FRAUD_DETECTION" && (
        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 lg:p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-rose-500" />
                      Real-Time Fraud Detection Engine
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">AI-powered anomaly detection and velocity scoring.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                    </span>
                    <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Live Protection Active</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Global Risk Level</div>
                    <div className="text-2xl font-black text-emerald-600">STABLE</div>
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> 99.8% Trusted Traffic
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Flagged (24h)</div>
                    <div className="text-2xl font-black text-slate-900">12</div>
                    <div className="text-[10px] text-rose-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> +2 compared to avg
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Prevention Rate</div>
                    <div className="text-2xl font-black text-indigo-600">94.2%</div>
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Autonomous Intervention
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Active Anomalies & Threats</h4>
                  {[
                    { id: 'F-882', type: 'Velocity Attack', entity: 'User_9921', risk: 88, status: 'BLOCKED', desc: 'Attempted 45 transactions from 12 countries in 3 minutes.' },
                    { id: 'F-881', type: 'Account Takeover', entity: 'Merchant_A2', risk: 74, status: 'CHALLENGED', desc: 'Login location mismatch: IP in Beijing, previous in London.' },
                    { id: 'F-880', type: 'Card Testing', entity: 'Unknown_Guest', risk: 92, status: 'AUTO-VOID', desc: 'High volume of $1.00 authorization attempts detected.' }
                  ].map((threat) => (
                    <div key={threat.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-indigo-200 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${threat.risk > 80 ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                          <AlertCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{threat.type}</span>
                            <span className="text-[10px] font-mono text-slate-400">ID: {threat.id}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{threat.desc}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xs font-black uppercase tracking-wider mb-1 ${threat.status === 'BLOCKED' ? 'text-rose-600' : 'text-amber-600'}`}>
                          {threat.status}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Risk Score: {threat.risk}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 lg:p-6 text-white shadow-lg border border-slate-800">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-indigo-400" />
                  Neural Fraud Rules
                </h3>
                <div className="space-y-4">
                  {[
                    { name: 'Velocity Threshold', value: 10, unit: 'txn/min', enabled: true },
                    { name: 'Geographic Mismatch', value: 500, unit: 'km', enabled: true },
                    { name: 'High-Risk MCC Block', value: '7995, 6051', unit: 'codes', enabled: false },
                    { name: 'Phonetic Name Match', value: 85, unit: '%', enabled: true }
                  ].map((rule) => (
                    <div key={rule.name} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                      <div>
                        <div className="text-xs font-bold text-indigo-300">{rule.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{rule.value} {rule.unit}</div>
                      </div>
                      <div className={`w-8 h-4 rounded-full relative transition-all ${rule.enabled ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${rule.enabled ? 'left-4.5' : 'left-0.5'}`}></div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all border border-indigo-500 shadow-sm">
                  Tune AI Models
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 lg:p-6">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-600" />
                  Threat Distribution
                </h3>
                <div className="h-40 flex items-end justify-between gap-1">
                  {[45, 32, 67, 89, 23, 56, 78, 34, 12, 90, 43, 65].map((h, i) => (
                    <div key={i} className="flex-1 bg-slate-100 rounded-t-sm relative group cursor-help" style={{ height: `${h}%` }}>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap">
                        {h} threats
                      </div>
                      <div className={`absolute inset-0 rounded-t-sm transition-all ${h > 70 ? 'bg-rose-500/40' : 'bg-indigo-500/20'}`}></div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">00:00</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Now</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "SETTINGS" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 lg:p-8 max-w-3xl">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><Settings className="w-5 h-5 text-slate-500"/> Risk Engine Parameters</h2>
          
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-slate-700 mb-1">
                <span>Maximum Acceptable Risk Score</span>
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono text-xs">70 / 100</span>
              </label>
              <input type="range" min="1" max="100" defaultValue="70" className="w-full accent-indigo-600" />
              <p className="text-xs text-slate-500 mt-1">Users scoring above this threshold will automatically be flagged as FAILED or routed to PENDING_REVIEW.</p>
            </div>
            
            <hr className="border-slate-100" />
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-800 text-sm">Strict PEP Rejection</h4>
                <p className="text-xs text-slate-500">Automatically reject applicants appearing on any Politically Exposed Persons list.</p>
              </div>
              <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-500 cursor-pointer">
                 <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-800 text-sm">Adverse Media Screening</h4>
                <p className="text-xs text-slate-500">Include real-time news and adverse media analysis in the risk score computation.</p>
              </div>
              <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 cursor-pointer">
                 <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition" />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "TAX_VAT" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 animate-fade-in">
          <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 lg:p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-1.5">
              <Globe className="w-5 h-5 text-indigo-600" />
              Tax / VAT Query Panel
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Verify corporate entities against domestic and international tax registers across multiple jurisdictions in real-time.
            </p>

            {/* Quick Presets */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Registry Presets</span>
              <div className="grid grid-cols-1 gap-1.5">
                <button
                  type="button"
                  onClick={() => { setVatNumber("EU123456789"); setTaxCountryCode("DE"); setTaxCompanyName("Siemens AG"); }}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 hover:border-indigo-500 rounded-lg text-left text-xs text-slate-700 font-semibold cursor-pointer transition-all"
                >
                  🇩🇪 Siemens AG (EU VAT)
                </button>
                <button
                  type="button"
                  onClick={() => { setVatNumber("GB987654321"); setTaxCountryCode("GB"); setTaxCompanyName("British Petroleum PLC"); }}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 hover:border-indigo-500 rounded-lg text-left text-xs text-slate-700 font-semibold cursor-pointer transition-all"
                >
                  🇬🇧 British Petroleum (UK VAT)
                </button>
                <button
                  type="button"
                  onClick={() => { setVatNumber("US123456789"); setTaxCountryCode("US"); setTaxCompanyName("Stripe Inc"); }}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 hover:border-indigo-500 rounded-lg text-left text-xs text-slate-700 font-semibold cursor-pointer transition-all"
                >
                  🇺🇸 Stripe Inc (US EIN)
                </button>
                <button
                  type="button"
                  onClick={() => { setVatNumber("CY999888777"); setTaxCountryCode("CY"); setTaxCompanyName("Shell Offshore Logistics Ltd"); }}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 hover:border-rose-500 rounded-lg text-left text-xs text-slate-700 font-semibold cursor-pointer transition-all"
                >
                  🇨🇾 Shell Offshore (Cyprus - Flagged)
                </button>
              </div>
            </div>

            <hr className="border-slate-100" />

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Jurisdiction Country</label>
                <select
                  value={taxCountryCode}
                  onChange={(e) => setTaxCountryCode(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="DE">Germany (DE)</option>
                  <option value="GB">United Kingdom (GB)</option>
                  <option value="US">United States (US)</option>
                  <option value="SG">Singapore (SG)</option>
                  <option value="CY">Cyprus (CY)</option>
                  <option value="FR">France (FR)</option>
                  <option value="NL">Netherlands (NL)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">TAX/VAT ID Number</label>
                <input
                  type="text"
                  value={vatNumber}
                  onChange={(e) => setVatNumber(e.target.value)}
                  placeholder="e.g. EU123456789 or 12-3456789"
                  className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Company Name (Optional)</label>
                <input
                  type="text"
                  value={taxCompanyName}
                  onChange={(e) => setTaxCompanyName(e.target.value)}
                  placeholder="e.g. Siemens AG"
                  className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="button"
                onClick={handleTaxVerify}
                disabled={taxChecking}
                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg flex justify-center items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors animate-fade-in"
              >
                {taxChecking ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                {taxChecking ? "Verifying..." : "Verify Tax Account"}
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {taxChecking && (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center justify-center space-y-3 shadow-sm h-full min-h-[350px]">
                <RefreshCcw className="w-8 h-8 text-indigo-500 animate-spin" />
                <p className="text-sm text-slate-600 font-semibold text-center">Interrogating cross-border tax registers...</p>
                <p className="text-[11px] text-slate-400 text-center">Checking VIES schema, HMRC ledgers, SEC filings, and validating syntax consistency via Gemini-3.5-Flash</p>
              </div>
            )}

            {!taxChecking && !taxResult && (
              <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-12 flex flex-col items-center justify-center space-y-3 shadow-sm h-full min-h-[350px]">
                <Globe className="w-12 h-12 text-slate-300" />
                <p className="text-sm text-slate-500 font-semibold text-center">No active verification report</p>
                <p className="text-[11px] text-slate-400 text-center max-w-sm">Please select a preset or type a Tax ID to query regulatory database and run AI verification.</p>
              </div>
            )}

            {taxResult && !taxChecking && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Registry Search Term</span>
                    <h3 className="font-bold text-lg text-slate-800">{taxResult.companyName || "Unknown Corporate Entity"}</h3>
                    <p className="text-xs font-mono text-slate-500">{taxResult.vatNumber} ({taxResult.countryCode})</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-mono">Regulatory Confidence</span>
                      <span className="text-sm font-extrabold text-slate-900">{taxResult.regulatoryConfidence}% Score</span>
                    </div>
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase ${
                      taxResult.taxEntityStatus === "ACTIVE" ? "bg-emerald-100 text-emerald-800" :
                      taxResult.taxEntityStatus === "SUSPENDED" ? "bg-amber-100 text-amber-800" :
                      "bg-rose-100 text-rose-800"
                    }`}>
                      {taxResult.taxEntityStatus}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Jurisdiction Details</span>
                    <div className="space-y-1.5 text-xs text-slate-700">
                      <div><strong className="text-slate-500">Register:</strong> {taxResult.jurisdictionName}</div>
                      <div><strong className="text-slate-500">Tax Type:</strong> {taxResult.vatNumber.startsWith("US") ? "EIN" : "VAT"}</div>
                      <div><strong className="text-slate-500">Standard Rate:</strong> {taxResult.localRate}</div>
                      <div><strong className="text-slate-500">Filing Cycle:</strong> {taxResult.filingFrequency}</div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Registered Office</span>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {taxResult.registeredAddress || "No official address verified in this registry segment."}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900 text-slate-100 rounded-xl p-5 space-y-2 border border-slate-800">
                  <h4 className="text-xs font-bold font-mono text-indigo-300 flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5 text-indigo-400" />
                    AI Multi-Jurisdictional Tax Audit Summary
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                    {taxResult.taxAuditSummary}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "INVOICE_SHELL" && (
        <div className="space-y-6 animate-fade-in">
          {/* Dashboard and Auditor Tab Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3" id="invoice-tab-header">
            <div className="flex gap-4">
              <button
                type="button"
                id="tab-invoice-auditor"
                onClick={() => setInvoiceSubTab('audit')}
                className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                  invoiceSubTab === 'audit' 
                    ? 'border-indigo-600 text-indigo-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Forensic Auditor Input
              </button>
              <button
                type="button"
                id="tab-invoice-insights"
                onClick={() => {
                  setInvoiceSubTab('insights');
                  fetchInvoiceHistory();
                }}
                className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  invoiceSubTab === 'insights' 
                    ? 'border-indigo-600 text-indigo-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                Fraud Insights Dashboard
              </button>
            </div>
            {invoiceSubTab === 'insights' && (
              <button
                type="button"
                id="btn-generate-ai-fraud-summary"
                onClick={generateInsightsSummary}
                disabled={generatingSummary || loadingHistory}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 animate-fade-in"
              >
                {generatingSummary ? <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> : <Brain className="w-3.5 h-3.5" />}
                {generatingSummary ? "Analyzing Trends..." : "Generate AI Fraud Summary"}
              </button>
            )}
          </div>

          {invoiceSubTab === 'audit' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6" id="forensic-auditor-content">
              <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 lg:p-6 space-y-4 max-h-[85vh] overflow-y-auto">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Forensic Auditor
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Scan corporate transaction requests to identify high-risk shell companies, circular laundering patterns, sequential billing anomalies, and offshore flight accounts.
                </p>

                {/* AI Invoice Document Scanner Dropzone */}
                <div className="space-y-2 pt-1" id="invoice-uploader-container">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">AI-Powered Invoice Scanner</span>
                  <div 
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200 ${
                      dragActive 
                        ? "border-indigo-500 bg-indigo-50/50" 
                        : "border-slate-200 bg-slate-50 hover:bg-slate-100/50 hover:border-slate-300"
                    }`}
                  >
                    <input 
                      type="file" 
                      id="invoice-file-upload" 
                      className="hidden" 
                      onChange={handleFileChange}
                      accept=".pdf,.png,.jpg,.jpeg,.txt,.csv,.json"
                    />
                    <label htmlFor="invoice-file-upload" className="cursor-pointer space-y-2 block w-full h-full">
                      {isUploading ? (
                        <div className="flex flex-col items-center space-y-2.5">
                          <RefreshCcw className="w-6 h-6 text-indigo-500 animate-spin" />
                          <div className="text-xs font-semibold text-indigo-600 animate-pulse">Extracting invoice data...</div>
                          {/* Animated laser scanning line effect */}
                          <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden relative">
                            <div className="absolute top-0 left-0 bg-indigo-600 h-full w-1/3 rounded-full animate-bounce" style={{ animationDuration: '1.5s' }} />
                          </div>
                          <span className="text-[10px] text-slate-400">Gemini-3.5-Flash parsing structures</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center space-y-2">
                          <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100 text-indigo-500">
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-700 block">Drag & drop invoice document</span>
                            <span className="text-[10px] text-slate-400">or click to select file from device</span>
                          </div>
                          <span className="text-[9px] text-slate-400 block px-2 py-0.5 bg-slate-200/50 rounded font-mono">
                            PDF, Images, TXT, CSV, JSON
                          </span>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Upload State Alerts */}
                  {uploadSuccess && uploadedFileName && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 animate-fade-in" id="upload-success-alert">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="text-[11px] text-emerald-800 leading-tight text-left">
                        <strong className="font-bold block text-emerald-900 mb-0.5">Scan Successful!</strong>
                        Parsed <code className="font-mono bg-emerald-100/60 px-1 py-0.5 rounded text-[10px] text-emerald-900">{uploadedFileName}</code>. Form parameters updated automatically. Ready for forensic analysis.
                      </div>
                    </div>
                  )}

                  {uploadError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 animate-fade-in" id="upload-error-alert">
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div className="text-[11px] text-rose-800 leading-tight text-left">
                        <strong className="font-bold block text-rose-900 mb-0.5">Scan Failed</strong>
                        {uploadError}
                      </div>
                    </div>
                  )}
                </div>

                <hr className="border-slate-100" />

                {/* Presets */}
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Forensic Presets</span>
                  <div className="grid grid-cols-1 gap-1.5">
                    <button
                      type="button"
                      id="preset-cayman"
                      onClick={() => {
                        setInvoiceForm({
                          issuerName: "Grand Offshore Management Ltd",
                          issuerCountry: "Cayman Islands",
                          issuerAddress: "West Bay Road, P.O. Box 311, Grand Cayman",
                          issuerTaxId: "CY-999-H3",
                          beneficiaryName: "Alpha Capital Partners LLC",
                          beneficiaryCountry: "United States",
                          amount: "250000",
                          currency: "USD",
                          invoiceNumber: "INV-0001",
                          description: "Strategic advisory consulting fees for structural market optimization under Cayman flight rules.",
                          bankAccount: "CY8900223300001234567890",
                          headcount: "1",
                          incorporationYears: "1"
                        });
                      }}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 hover:border-rose-500 rounded-lg text-left text-[11px] text-slate-700 font-semibold cursor-pointer transition-all"
                    >
                      🚨 Cayman Shell & Offshore Corridor
                    </button>
                    <button
                      type="button"
                      id="preset-germany"
                      onClick={() => {
                        setInvoiceForm({
                          issuerName: "Acme European Logistics",
                          issuerCountry: "Germany",
                          issuerAddress: "Kurfürstendamm 21, 10719 Berlin",
                          issuerTaxId: "DE-88-223",
                          beneficiaryName: "Siemens Finance",
                          beneficiaryCountry: "Germany",
                          amount: "14200",
                          currency: "EUR",
                          invoiceNumber: "INV-29402",
                          description: "Monthly logistics fulfillment and warehouse distribution support services for Berlin regional hub.",
                          bankAccount: "DE45100700240123456789",
                          headcount: "450",
                          incorporationYears: "15"
                        });
                      }}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 hover:border-emerald-500 rounded-lg text-left text-[11px] text-slate-700 font-semibold cursor-pointer transition-all"
                    >
                      ✅ Standard Verified Corporate Settlement
                    </button>
                    <button
                      type="button"
                      id="preset-seychelles"
                      onClick={() => {
                        setInvoiceForm({
                          issuerName: "Vague Concepts Studio",
                          issuerCountry: "Seychelles",
                          issuerAddress: "Suite 40, Victoria House, Mahé",
                          issuerTaxId: "SEY-404-X",
                          beneficiaryName: "Global Wealth Distributors",
                          beneficiaryCountry: "Cyprus",
                          amount: "850000",
                          currency: "USD",
                          invoiceNumber: "0001",
                          description: "Consulting advisory retainer fees for non-specified international development strategy.",
                          bankAccount: "CY33005511000192837465",
                          headcount: "1",
                          incorporationYears: "0"
                        });
                      }}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 hover:border-rose-500 rounded-lg text-left text-[11px] text-slate-700 font-semibold cursor-pointer transition-all"
                    >
                      🚨 Sequential Billing & Single-Employee Shell
                    </button>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Form Fields */}
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Issuer Name</label>
                    <input
                      type="text"
                      value={invoiceForm.issuerName}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, issuerName: e.target.value })}
                      className="w-full mt-1 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Country</label>
                      <input
                        type="text"
                        value={invoiceForm.issuerCountry}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, issuerCountry: e.target.value })}
                        className="w-full mt-1 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Tax / VAT ID</label>
                      <input
                        type="text"
                        value={invoiceForm.issuerTaxId}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, issuerTaxId: e.target.value })}
                        className="w-full mt-1 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Registered Address</label>
                    <input
                      type="text"
                      value={invoiceForm.issuerAddress}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, issuerAddress: e.target.value })}
                      className="w-full mt-1 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Headcount</label>
                      <input
                        type="number"
                        value={invoiceForm.headcount}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, headcount: e.target.value })}
                        className="w-full mt-1 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Company Age (Yrs)</label>
                      <input
                        type="number"
                        value={invoiceForm.incorporationYears}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, incorporationYears: e.target.value })}
                        className="w-full mt-1 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Invoice Amount</label>
                      <input
                        type="number"
                        value={invoiceForm.amount}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                        className="w-full mt-1 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Currency</label>
                      <input
                        type="text"
                        value={invoiceForm.currency}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, currency: e.target.value })}
                        className="w-full mt-1 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Invoice Number</label>
                      <input
                        type="text"
                        value={invoiceForm.invoiceNumber}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceNumber: e.target.value })}
                        className="w-full mt-1 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Settlement IBAN/Bank</label>
                      <input
                        type="text"
                        value={invoiceForm.bankAccount}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, bankAccount: e.target.value })}
                        className="w-full mt-1 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Beneficiary Name</label>
                    <input
                      type="text"
                      value={invoiceForm.beneficiaryName}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, beneficiaryName: e.target.value })}
                      className="w-full mt-1 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Description of Services</label>
                    <textarea
                      value={invoiceForm.description}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, description: e.target.value })}
                      rows={2}
                      className="w-full mt-1 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <button
                    type="button"
                    id="btn-run-invoice-audit"
                    onClick={handleInvoiceAudit}
                    disabled={auditingInvoice}
                    className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-lg flex justify-center items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                  >
                    {auditingInvoice ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {auditingInvoice ? "Performing Audit..." : "Run AI Forensic Audit"}
                  </button>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                {auditingInvoice && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center justify-center space-y-3 shadow-sm h-full min-h-[450px]" id="invoice-loading-pane">
                    <RefreshCcw className="w-8 h-8 text-indigo-500 animate-spin" />
                    <p className="text-sm text-slate-600 font-semibold text-center">Interrogating corporate transparency indicators...</p>
                    <p className="text-[11px] text-slate-400 text-center">Evaluating staff capacity, age threshold safety, bank corridors mismatch, and billing text semantics via Gemini-3.5-Flash</p>
                  </div>
                )}

                {!auditingInvoice && !auditResult && (
                  <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-12 flex flex-col items-center justify-center space-y-3 shadow-sm h-full min-h-[450px]" id="invoice-empty-pane">
                    <FileText className="w-12 h-12 text-slate-300" />
                    <p className="text-sm text-slate-500 font-semibold text-center">No active forensic audit report</p>
                    <p className="text-[11px] text-slate-400 text-center max-w-sm">Please select a preset or fill out the billing details and click "Run AI Forensic Audit" to analyze Shell and Invoice Fraud risk matrices.</p>
                  </div>
                )}

                {auditResult && !auditingInvoice && (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 animate-fade-in" id="invoice-results-pane">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Audited Issuer Entity</span>
                        <h3 className="font-bold text-lg text-slate-800">{invoiceForm.issuerName}</h3>
                        <p className="text-xs text-slate-500 font-mono">Invoice Number: {invoiceForm.invoiceNumber} | {invoiceForm.amount} {invoiceForm.currency}</p>
                      </div>
                      <div>
                        <span className={`px-4 py-2 rounded-xl text-xs font-black tracking-widest uppercase border ${
                          auditResult.riskRating === "LOW" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          auditResult.riskRating === "MEDIUM" ? "bg-cyan-50 text-cyan-700 border-cyan-200" :
                          auditResult.riskRating === "HIGH" ? "bg-amber-50 text-amber-700 border-amber-200 animate-pulse" :
                          "bg-rose-50 text-rose-700 border-rose-200 animate-pulse font-extrabold"
                        }`}>
                          {auditResult.riskRating} THREAT LEVEL
                        </span>
                      </div>
                    </div>

                    {/* Score Indicators */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Shell Company Probability</span>
                          <span className={`text-sm font-black ${auditResult.shellProbability > 70 ? 'text-rose-600' : auditResult.shellProbability > 40 ? 'text-amber-500' : 'text-emerald-600'}`}>
                            {auditResult.shellProbability}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              auditResult.shellProbability > 70 ? 'bg-rose-500' : auditResult.shellProbability > 40 ? 'bg-amber-400' : 'bg-emerald-500'
                            }`} 
                            style={{ width: `${auditResult.shellProbability}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed italic">{auditResult.shellAuditFindings}</p>
                      </div>

                      <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Invoice Fraud Risk Index</span>
                          <span className={`text-sm font-black ${auditResult.fraudRiskScore > 70 ? 'text-rose-600' : auditResult.fraudRiskScore > 40 ? 'text-amber-500' : 'text-emerald-600'}`}>
                            {auditResult.fraudRiskScore}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              auditResult.fraudRiskScore > 70 ? 'bg-rose-500' : auditResult.fraudRiskScore > 40 ? 'bg-amber-400' : 'bg-emerald-500'
                            }`} 
                            style={{ width: `${auditResult.fraudRiskScore}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed italic">{auditResult.invoiceFraudFindings}</p>
                      </div>
                    </div>

                    {/* Audit Flags */}
                    <div className="space-y-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Forensic Flag Triggers</span>
                      <div className="flex flex-wrap gap-2">
                        {auditResult.forensicFlags.map((flag: string, i: number) => (
                          <span 
                            key={i} 
                            className={`px-3 py-1 border rounded-lg text-xs font-bold uppercase tracking-wide font-mono ${
                              flag.includes("CLEAR") 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}
                          >
                            ⚠️ {flag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* AI Narrative */}
                    <div className="bg-slate-950 text-slate-100 rounded-xl p-5 space-y-3 border border-slate-900">
                      <h4 className="text-xs font-bold font-mono text-indigo-300 flex items-center gap-1.5">
                        <Brain className="w-3.5 h-3.5 text-indigo-400" />
                        Corporate Forensic Intelligence Narrative Report
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                        {auditResult.auditNarrative}
                      </p>
                    </div>

                    {/* Recommendation Clear Alert */}
                    <div className={`p-4 border rounded-xl flex items-center gap-3 ${
                      auditResult.isRecommendedForClearance 
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                        : "bg-rose-50 border-rose-200 text-rose-800"
                    }`}>
                      {auditResult.isRecommendedForClearance ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          <div className="text-xs">
                            <strong className="block font-bold">Recommended for Settlement Clearance</strong>
                            The invoice passes standard risk thresholds. No severe shell indicators or billing anomalies.
                          </div>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 animate-bounce" />
                          <div className="text-xs">
                            <strong className="block font-bold">FLAGGED TRANSACTION: FREEZE AND ESCALATE</strong>
                            Forensic indicators suggest high shell company probability or potential billing evasion. Place payment holds immediately.
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in" id="fraud-insights-dashboard">
              {/* Stat Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between" id="stat-total-audits">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Audits Ran</span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-2xl font-extrabold text-slate-800">{invoiceStats.total}</span>
                    <span className="text-xs text-slate-400">cases</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-2 block font-mono">Durable compliance ledger</span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between" id="stat-avg-shell">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg Shell Company Risk</span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className={`text-2xl font-extrabold ${invoiceStats.avgShell > 50 ? "text-rose-600" : "text-emerald-600"}`}>
                      {invoiceStats.avgShell}%
                    </span>
                    <span className="text-xs text-slate-400">prob</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1 rounded-full mt-2 overflow-hidden">
                    <div className="bg-indigo-500 h-full" style={{ width: `${invoiceStats.avgShell}%` }} />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between" id="stat-avg-fraud">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg Invoice Fraud Risk</span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className={`text-2xl font-extrabold ${invoiceStats.avgFraud > 50 ? "text-rose-600" : "text-emerald-600"}`}>
                      {invoiceStats.avgFraud}%
                    </span>
                    <span className="text-xs text-slate-400">index</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1 rounded-full mt-2 overflow-hidden">
                    <div className="bg-rose-500 h-full" style={{ width: `${invoiceStats.avgFraud}%` }} />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between" id="stat-flagged-holds">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Flagged Settlement Holds</span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-2xl font-extrabold text-rose-600">{invoiceStats.flaggedCount}</span>
                    <span className="text-xs text-rose-400 font-bold">active</span>
                  </div>
                  <span className="text-[10px] text-rose-500 font-semibold mt-2 block">Escalated to FIU Unit</span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between" id="stat-top-haven">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">High Shell Haven Corridor</span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-lg font-extrabold text-indigo-700 truncate max-w-full">
                      {invoiceStats.topHaven}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-2 block font-mono">Based on current checks</span>
                </div>
              </div>

              {/* Chart & AI Summary Panel Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
                {/* Dynamic Chart Panel */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 flex flex-col justify-between min-h-[380px]" id="risk-distribution-panel">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-indigo-500" />
                      Shell vs Fraud Risk Score Distribution
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Real-time interactive threat vectors for the latest audited counterparties.
                    </p>
                  </div>
                  
                  {invoiceHistory.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-5 lg:p-6 text-center space-y-2">
                      <Activity className="w-10 h-10 text-slate-300 animate-pulse" />
                      <p className="text-xs text-slate-400">No active audit history in this session yet.</p>
                    </div>
                  ) : (
                    <div className="h-64 mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={9} domain={[0, 100]} tickLine={false} />
                          <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                          <Legend wrapperStyle={{ fontSize: '10px' }} />
                          <Bar dataKey="Shell Probability" fill="#6366f1" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Fraud Score" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* AI Executive Summary Panel */}
                <div className="lg:col-span-3 bg-slate-950 text-slate-100 rounded-2xl border border-slate-900 shadow-xl p-4 sm:p-5 lg:p-6 flex flex-col justify-between min-h-[380px]" id="ai-executive-summary-panel">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h4 className="text-sm font-bold font-mono text-indigo-300 flex items-center gap-2">
                        <Brain className="w-4 h-4 text-indigo-400" />
                        AI Forensic Trend Summary Report
                      </h4>
                      <span className="text-[10px] font-mono text-slate-500 px-2 py-0.5 bg-slate-900 rounded border border-slate-800">
                        Gemini Active-Audit
                      </span>
                    </div>

                    <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-800">
                      {generatingSummary ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-3">
                          <RefreshCcw className="w-8 h-8 text-indigo-400 animate-spin" />
                          <p className="text-xs text-indigo-300 font-mono animate-pulse">Running advanced multi-jurisdictional invoice intelligence algorithms...</p>
                        </div>
                      ) : insightsSummary ? (
                        <div className="space-y-3 text-slate-300 leading-relaxed font-sans select-text">
                          {renderMarkdown(insightsSummary)}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                          <Sparkles className="w-10 h-10 text-indigo-500/60 animate-pulse" />
                          <div className="space-y-1">
                            <p className="text-xs text-slate-400 font-medium">No trend summary generated for this session</p>
                            <p className="text-[11px] text-slate-500 max-w-sm">
                              Click the <strong className="text-indigo-400">"Generate AI Fraud Summary"</strong> button at the top right to compile corporate tax havens, shell corridors, and sequential billing indicators.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-slate-900 pt-3 mt-4 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>Classification: Confidential - compliance unit only</span>
                    <span>Audit ledger: {invoiceHistory.length} files analyzed</span>
                  </div>
                </div>
              </div>

              {/* Full Audit Log Ledger Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" id="compliance-ledger-table-panel">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <History className="w-4 h-4 text-indigo-600" />
                      Corporate Forensic Ledger & Compliance Registry
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Permanent multi-jurisdictional tax validation audit records.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                    {invoiceHistory.length} Audited Items
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs" id="ledger-table">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-4 sm:px-6">Counterparty (Issuer)</th>
                        <th className="py-3 px-4 sm:px-6">Jurisdiction</th>
                        <th className="py-3 px-4 sm:px-6">Invoice Number</th>
                        <th className="py-3 px-4 sm:px-6 text-right">Settlement Amount</th>
                        <th className="py-3 px-4 sm:px-6 text-center">Shell Risk</th>
                        <th className="py-3 px-4 sm:px-6 text-center">Invoice Risk</th>
                        <th className="py-3 px-4 sm:px-6">Triggers & Flags</th>
                        <th className="py-3 px-4 sm:px-6">Decision Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {loadingHistory ? (
                        <tr>
                          <td colSpan={8} className="text-center py-12 text-slate-400 font-mono">
                            <RefreshCcw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-500" />
                            Retrieving secure regulatory ledgers...
                          </td>
                        </tr>
                      ) : invoiceHistory.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-12 text-slate-400">
                            No active entries. Run audits on the Forensic Auditor tab first.
                          </td>
                        </tr>
                      ) : (
                        invoiceHistory.map((item, index) => (
                          <tr key={index} className="hover:bg-slate-50/70 transition-colors" id={`ledger-row-${index}`}>
                            <td className="py-4 px-4 sm:px-6">
                              <div className="font-bold text-slate-800">{item.issuerName}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{item.issuerAddress}</div>
                            </td>
                            <td className="py-4 px-4 sm:px-6">
                              <span className="font-mono text-[10px] font-bold text-slate-500 px-2 py-1 bg-slate-100 rounded">
                                {item.issuerCountry}
                              </span>
                            </td>
                            <td className="py-4 px-4 sm:px-6 font-mono text-[11px] text-slate-600">
                              {item.invoiceNumber}
                            </td>
                            <td className="py-4 px-4 sm:px-6 text-right font-mono font-bold text-slate-950">
                              {parseFloat(item.amount).toLocaleString()} {item.currency}
                            </td>
                            <td className="py-4 px-4 sm:px-6 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <span className={`text-[11px] font-black ${item.shellProbability > 70 ? "text-rose-600" : item.shellProbability > 40 ? "text-amber-500" : "text-emerald-600"}`}>
                                  {item.shellProbability}%
                                </span>
                                <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${item.shellProbability > 70 ? "bg-rose-500" : item.shellProbability > 40 ? "bg-amber-400" : "bg-emerald-500"}`}
                                    style={{ width: `${item.shellProbability}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 sm:px-6 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <span className={`text-[11px] font-black ${item.fraudRiskScore > 70 ? "text-rose-600" : item.fraudRiskScore > 40 ? "text-amber-500" : "text-emerald-600"}`}>
                                  {item.fraudRiskScore}%
                                </span>
                                <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${item.fraudRiskScore > 70 ? "bg-rose-500" : item.fraudRiskScore > 40 ? "bg-amber-400" : "bg-emerald-500"}`}
                                    style={{ width: `${item.fraudRiskScore}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 sm:px-6">
                              <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {item.forensicFlags?.slice(0, 2).map((flag: string, fIdx: number) => (
                                  <span key={fIdx} className="text-[9px] font-bold font-mono px-1.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded shrink-0">
                                    {flag.split(" ")[0]}
                                  </span>
                                ))}
                                {item.forensicFlags?.length > 2 && (
                                  <span className="text-[9px] font-bold font-mono px-1 bg-indigo-50 text-indigo-600 rounded">
                                    +{item.forensicFlags.length - 2}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4 sm:px-6">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border tracking-wider ${
                                item.riskRating === "LOW" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                item.riskRating === "MEDIUM" ? "bg-cyan-50 text-cyan-700 border-cyan-200" :
                                item.riskRating === "HIGH" ? "bg-amber-50 text-amber-600 border-amber-200" :
                                "bg-rose-50 text-rose-700 border-rose-200 animate-pulse"
                              }`}>
                                {item.riskRating}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {activeTab === "ZERO_DOWNTIME_HUB" && (
        <ZeroDowntimeIntegrationHub />
      )}
    </div>
  );
};
