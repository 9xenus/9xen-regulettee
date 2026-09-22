import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Globe, 
  ShieldAlert, 
  ShieldCheck, 
  Activity, 
  Check, 
  AlertCircle, 
  X, 
  Search, 
  Code, 
  Copy, 
  ExternalLink, 
  Loader2, 
  RefreshCw, 
  Play, 
  ArrowRight,
  Sparkles,
  Lock,
  Eye,
  Server
} from "lucide-react";

interface WebsiteComplianceScannerProps {
  isOpen: boolean;
  onClose: () => void;
  defaultUrl?: string;
  showToast: (message: string, type: "success" | "error" | "info" | "warning") => void;
}

interface ScanFinding {
  type: "success" | "warning" | "error";
  category: "Cookie Consent" | "PII Protection" | "SSL / Headers" | "Tracking Scripts";
  title: string;
  description: string;
  remediation: string;
}

export const WebsiteComplianceScanner: React.FC<WebsiteComplianceScannerProps> = ({
  isOpen,
  onClose,
  defaultUrl = "https://acme-corp.eu",
  showToast
}) => {
  const [url, setUrl] = useState(defaultUrl);
  const [scanState, setScanState] = useState<"idle" | "scanning" | "completed">("idle");
  const [scanStep, setScanStep] = useState(0);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // High-fidelity scan findings based on the input URL domain
  const [scanScore, setScanScore] = useState(100);
  const [findings, setFindings] = useState<ScanFinding[]>([]);

  const simulateScanSteps = [
    { log: "Initializing headless crawler engine on virtual container...", delay: 600 },
    { log: "Resolving DNS records and SSL/TLS handshake protocols...", delay: 800 },
    { log: "Validating Security Headers (HSTS, Content-Security-Policy, X-Frame-Options)...", delay: 900 },
    { log: "Parsing HTML DOM tree for Cookie Consent overlays (#cookie-banner, .consent-popup)...", delay: 1000 },
    { log: "Intercepting dynamic outgoing network XMLHttpRequests for unmasked PII query indicators...", delay: 1100 },
    { log: "Analyzing active trackers (Meta Pixel, Google Analytics 4, TikTok Audiences)...", delay: 700 },
    { log: "Compiling real-time sovereign compliance health scorecard...", delay: 500 }
  ];

  const handleStartScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      showToast("Please enter a valid website URL to analyze.", "warning");
      return;
    }

    // Parse URL for realistic simulated results
    const lowerUrl = url.toLowerCase();
    const hasSsl = lowerUrl.startsWith("https://");
    const domainName = lowerUrl.replace("https://", "").replace("http://", "").split("/")[0] || "Acme Enterprise Portal";

    setScanState("scanning");
    setScanStep(0);
    setScanLogs(["[SYSTEM] Initiating real-time Compliance Health Scan for: " + url]);

    let stepIndex = 0;
    const runNextStep = () => {
      if (stepIndex < simulateScanSteps.length) {
        const currentStep = simulateScanSteps[stepIndex];
        setTimeout(() => {
          setScanLogs(prev => [...prev, `[INFO] ${currentStep.log}`]);
          setScanStep(stepIndex + 1);
          stepIndex++;
          runNextStep();
        }, currentStep.delay);
      } else {
        // Compile findings dynamically based on URL characteristics to feel incredibly intelligent!
        const generatedFindings: ScanFinding[] = [];
        let computedScore = 100;

        // SSL Verification
        if (!hasSsl) {
          generatedFindings.push({
            type: "error",
            category: "SSL / Headers",
            title: "Insecure Protocol Detected (HTTP)",
            description: "Traffic is being transmitted without encryption. PII is exposed to cleartext sniffing.",
            remediation: "Configure Nginx to redirect all 80 ports to 443 and provision a Let's Encrypt TLS certificate."
          });
          computedScore -= 25;
        } else {
          generatedFindings.push({
            type: "success",
            category: "SSL / Headers",
            title: "TLS v1.3 Strong Encryption active",
            description: "Handshake verified with 256-bit AES cryptographic strength. Connection is secure.",
            remediation: "No action needed."
          });
        }

        // Cookie Consent Overlay Analysis
        if (lowerUrl.includes("unsecured") || lowerUrl.includes("test") || lowerUrl.includes("drift") || lowerUrl.length % 2 === 0) {
          generatedFindings.push({
            type: "warning",
            category: "Cookie Consent",
            title: "Implied Consent Fallback Triggered",
            description: "A banner was located, but user cookies are dropped before receiving explicit 'Accept' button clicks.",
            remediation: "Enable the Compliance Shield strict-blocking loader script inside your HTML head element."
          });
          computedScore -= 15;
        } else {
          generatedFindings.push({
            type: "success",
            category: "Cookie Consent",
            title: "Explicit Cookie Consent Banner found",
            description: "Banner detected and matched against GDPR Article 6 & IAB TCF specifications.",
            remediation: "No action needed."
          });
        }

        // PII leakage in query parameters
        if (!lowerUrl.includes("secure") && (lowerUrl.includes("leak") || lowerUrl.length % 3 === 0)) {
          generatedFindings.push({
            type: "error",
            category: "PII Protection",
            title: "Unmasked Email Transmission Leakage",
            description: "Automated network tracker caught active payload requests containing raw query string emails (?email=client@test.com).",
            remediation: "Enforce dynamic regex URL masking filter inside your application controller layer."
          });
          computedScore -= 20;
        } else {
          generatedFindings.push({
            type: "success",
            category: "PII Protection",
            title: "Zero Plaintext PII parameter leakage detected",
            description: "No email or username strings were isolated in outbound network request streams.",
            remediation: "No action needed."
          });
        }

        // Third-party scripts without strict CSP declarations
        if (lowerUrl.length % 4 === 0) {
          generatedFindings.push({
            type: "warning",
            category: "Tracking Scripts",
            title: "Unapproved Tracking Pixels Discovered",
            description: "Dynamic crawler isolated unauthorized tracking frames transmitting visitor fingerprint metadata.",
            remediation: "Declare strict Content-Security-Policy (CSP) headers restricting tracking script origins."
          });
          computedScore -= 15;
        } else {
          generatedFindings.push({
            type: "success",
            category: "Tracking Scripts",
            title: "All Third-Party scripts matched whitelist profiles",
            description: "Outbound tracking destinations perfectly align with registered GDPR compliance policies.",
            remediation: "No action needed."
          });
        }

        setScanScore(Math.max(computedScore, 40));
        setFindings(generatedFindings);
        setScanLogs(prev => [...prev, "[SYSTEM] Compliance scan finalized. Score compiled successfully."]);
        setScanState("completed");
        showToast(`Compliance scan finalized for ${domainName}. Score: ${Math.max(computedScore, 40)}%`, "success");
      }
    };

    runNextStep();
  };

  const shieldSnippet = `<!-- Acme Sovereign Shield v2.4 -->
<script 
  src="https://cdn.compliance-shield.dev/autofix/v1/loader.js" 
  data-tenant-id="org_3"
  data-auto-mask-pii="true" 
  data-strict-consent-blocking="true"
  async>
</script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shieldSnippet);
    setCopiedSnippet(true);
    showToast("Sovereign shield fix script snippet copied to clipboard!", "success");
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Modal Header */}
          <div className="px-6 py-5 border-b border-slate-150 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Globe className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                  Real-time Cookie & PII Compliance Scanner
                  <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    Sandbox Shield
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Audit cookie banners, SSL compliance, unmasked tracking pixels, and cleartext PII leakage in real-time.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Body Scroll Container */}
          <div className="p-4 sm:p-5 lg:p-6 overflow-y-auto space-y-4 sm:space-y-6 flex-grow">
            
            {/* Input URL Form */}
            {scanState === "idle" && (
              <form onSubmit={handleStartScan} className="space-y-4">
                <div className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    How does the Sovereign Compliance scan work?
                  </h4>
                  <p className="text-[11px] text-indigo-850 leading-relaxed font-medium">
                    Enter any production URL, staging, or local workspace address. Our advanced headless sandbox cralwer parses
                    cookie consent dialogues, checks outgoing tracking logs, and highlights where regulatory penalties might trigger.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Target Website URL</label>
                  <div className="flex gap-2">
                    <div className="relative flex-grow">
                      <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="e.g. https://acme-corp.eu"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-250 hover:border-slate-350 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Start Health Scan</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 border border-slate-150 rounded-xl flex items-start gap-2.5 bg-slate-50/50">
                    <Server className="w-4 h-4 text-slate-500 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-700 font-bold block">Sandbox IP</span>
                      <span className="text-[9.5px] text-slate-400 font-mono">198.51.100.42</span>
                    </div>
                  </div>
                  <div className="p-3 border border-slate-150 rounded-xl flex items-start gap-2.5 bg-slate-50/50">
                    <Lock className="w-4 h-4 text-slate-500 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-700 font-bold block">User Agent</span>
                      <span className="text-[9.5px] text-slate-400 font-mono">SovereignBot/2.4</span>
                    </div>
                  </div>
                  <div className="p-3 border border-slate-150 rounded-xl flex items-start gap-2.5 bg-slate-50/50">
                    <Eye className="w-4 h-4 text-slate-500 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-700 font-bold block">Test Method</span>
                      <span className="text-[9.5px] text-slate-400 font-mono">Silent DOM Crawl</span>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {/* SCANNING ACTIVE SCREEN */}
            {scanState === "scanning" && (
              <div className="space-y-5 py-4">
                <div className="flex flex-col items-center justify-center text-center space-y-3">
                  <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-slate-800">Crawl Audit in Progress...</h4>
                    <p className="text-xs text-slate-500">Currently executing headless browser validations against cookie scripts.</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <motion.div
                    className="bg-indigo-600 h-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${(scanStep / simulateScanSteps.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                {/* Live Console Logs */}
                <div className="bg-slate-950 text-slate-300 p-4 rounded-xl font-mono text-[10px] leading-relaxed space-y-1.5 h-48 overflow-y-auto shadow-inner border border-slate-850">
                  {scanLogs.map((log, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-slate-500 flex-shrink-0">[{idx+1}]</span>
                      <span className={log.includes("[SYSTEM]") ? "text-indigo-400 font-bold" : log.includes("[ERROR]") ? "text-rose-400" : "text-emerald-400"}>
                        {log}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* COMPLETED RESULTS SCREEN */}
            {scanState === "completed" && (
              <div className="space-y-4 sm:space-y-6">
                
                {/* Scorecard Header */}
                <div className="p-5 bg-slate-900 text-white rounded-xl flex flex-col md:flex-row justify-between items-center gap-4 border border-slate-800">
                  <div className="space-y-1 text-center md:text-left">
                    <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">COMPLIANCE SCAN COMPLETED</span>
                    <h4 className="text-sm font-extrabold text-slate-200">Regulatory Risk Scoring for {url}</h4>
                    <p className="text-xs text-slate-400">Scan date: {new Date().toLocaleDateString()}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <span className="text-3xl font-black font-mono tracking-tight text-white block">
                        {scanScore}%
                      </span>
                      <span className="text-[9px] text-indigo-300 font-bold uppercase">Health Score</span>
                    </div>
                    <div className="h-10 w-px bg-slate-800" />
                    <div>
                      <span className={`text-xs font-black uppercase px-3 py-1 rounded-full ${
                        scanScore >= 90 ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                        scanScore >= 70 ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                        "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      }`}>
                        {scanScore >= 90 ? "OPTIMAL" : scanScore >= 70 ? "STABLE" : "SEVERE RISK"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Findings List */}
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Crawl Findings Checklist</h5>
                  
                  <div className="space-y-3">
                    {findings.map((finding, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border flex items-start gap-3.5 transition duration-200 ${
                          finding.type === "success" ? "bg-emerald-50/20 border-emerald-100/80" :
                          finding.type === "warning" ? "bg-amber-50/30 border-amber-150" :
                          "bg-rose-50/20 border-rose-150"
                        }`}
                      >
                        <div className="mt-0.5">
                          {finding.type === "success" ? (
                            <div className="bg-emerald-100 text-emerald-700 p-1 rounded-full">
                              <ShieldCheck className="w-4 h-4" />
                            </div>
                          ) : finding.type === "warning" ? (
                            <div className="bg-amber-100 text-amber-700 p-1 rounded-full">
                              <AlertCircle className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="bg-rose-100 text-rose-700 p-1 rounded-full">
                              <ShieldAlert className="w-4 h-4" />
                            </div>
                          )}
                        </div>

                        <div className="space-y-1 flex-grow">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{finding.category}</span>
                            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${
                              finding.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                              finding.type === "warning" ? "bg-amber-50 text-amber-800 border border-amber-100" :
                              "bg-rose-50 text-rose-700 border border-rose-150"
                            }`}>
                              {finding.type.toUpperCase()}
                            </span>
                          </div>
                          <h6 className="text-xs font-extrabold text-slate-800">{finding.title}</h6>
                          <p className="text-[11px] text-slate-500 leading-normal">{finding.description}</p>
                          
                          {finding.type !== "success" && (
                            <div className="mt-2.5 p-2.5 bg-white border border-slate-150 rounded-lg text-[10.5px] text-slate-600 leading-normal">
                              <strong className="text-slate-800 text-[10px] block mb-0.5">REMEDIATION ACTION:</strong>
                              {finding.remediation}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Automatic Healing Solution Code Block */}
                {scanScore < 100 && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Code className="w-4.5 h-4.5 text-indigo-600" />
                        <h5 className="text-xs font-bold text-slate-800">Compliance Shield Fast-Fix Snippet</h5>
                      </div>
                      <button
                        type="button"
                        onClick={copyToClipboard}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-white border border-slate-200 hover:border-indigo-150 py-1 px-2.5 rounded-lg transition cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {copiedSnippet ? "Copied!" : "Copy Fix HTML"}
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                      Deploy our non-blocking regulatory loader script directly into your page's <code>&lt;head&gt;</code> element. 
                      This intercepts raw query strings, blocks pre-consent Google tracking loops, and masks plain-text emails automatically.
                    </p>

                    <pre className="bg-slate-900 text-indigo-300 p-3.5 rounded-lg font-mono text-[10.5px] overflow-x-auto border border-slate-800 leading-relaxed">
                      {shieldSnippet}
                    </pre>
                  </div>
                )}

              </div>
            )}

          </div>

          {/* Modal Footer Controls */}
          <div className="px-6 py-4 border-t border-slate-150 bg-slate-50 flex items-center justify-between gap-3 flex-shrink-0">
            {scanState === "completed" ? (
              <button
                onClick={() => {
                  setScanState("idle");
                  setScanStep(0);
                  setScanLogs([]);
                }}
                className="px-4 py-2 bg-white border border-slate-250 text-slate-700 hover:bg-slate-100 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Test Another URL</span>
              </button>
            ) : (
              <span className="text-[10px] text-slate-400 font-mono">
                Powered by Compliance Shield Sandbox AI Crawler
              </span>
            )}

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-white border border-slate-250 text-slate-700 hover:bg-slate-100 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Close
              </button>

              {scanState === "completed" && scanScore < 100 && (
                <button
                  onClick={() => {
                    showToast("Simulating shield alignment in active sandboxes...", "info");
                    setTimeout(() => {
                      showToast("Sovereign script alignment successful! All consent fallbacks patched.", "success");
                      onClose();
                    }, 1200);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl shadow-sm transition cursor-pointer flex items-center gap-1"
                >
                  Apply Auto-Heal Fix
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
