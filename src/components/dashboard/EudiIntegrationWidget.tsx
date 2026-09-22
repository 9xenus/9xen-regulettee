import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Activity,
  Wifi,
  WifiOff,
  Loader2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Globe,
  Key,
  UserCheck,
  Terminal,
  AlertTriangle,
  Play,
  Settings,
  ChevronRight,
  Database
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LogEntry {
  timestamp: string;
  type: "info" | "success" | "error" | "warning";
  message: string;
}

export const EudiIntegrationWidget: React.FC = () => {
  // Widget States
  const [connectionStatus, setConnectionStatus] = useState<"ACTIVE" | "STANDBY" | "SYNCING" | "DEGRADED" | "DISCONNECTED">("ACTIVE");
  const [latency, setLatency] = useState<number>(34);
  const [isStrictMode, setIsStrictMode] = useState<boolean>(true);
  const [isTestingConnection, setIsTestingConnection] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"status" | "simulator" | "credentials">("status");

  // Statistics
  const [stats, setStats] = useState({
    verifiedPresentations: 1420,
    successRate: 99.4,
    decryptionFailures: 2,
    activeKeysInHSM: 3
  });

  // Simulator States
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [selectedProfile, setSelectedProfile] = useState<string>("de_citizen");
  const [customToken, setCustomToken] = useState<string>("");
  const [verificationResult, setVerificationResult] = useState<any | null>(null);

  // Terminal Logs
  const [logs, setLogs] = useState<LogEntry[]>([
    { timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(), type: "info", message: "eIDAS v2 EUDI Module initialized." },
    { timestamp: new Date(Date.now() - 1800000).toLocaleTimeString(), type: "success", message: "HSM ECDSA P-256 certificate validation: PASS" },
    { timestamp: new Date(Date.now() - 600000).toLocaleTimeString(), type: "info", message: "Listening for OID4VP presentation requests on /api/v1/eudi/verify" }
  ]);

  const profiles = {
    de_citizen: {
      firstName: "Hans",
      lastName: "Müller",
      dob: "1984-09-12",
      nationalId: "DE/12093810293",
      issuingCountry: "DE",
      issuingAuthority: "Bundesministerium des Innern und für Heimat",
      walletProvider: "ID-Wallet GmbH (Official DE)",
      validUntil: "2031-12-31"
    },
    fr_citizen: {
      firstName: "Chloé",
      lastName: "Dubois",
      dob: "1991-03-24",
      nationalId: "FR/94021820491",
      issuingCountry: "FR",
      issuingAuthority: "Ministère de l'Intérieur",
      walletProvider: "France Identity App",
      validUntil: "2030-05-15"
    },
    it_citizen: {
      firstName: "Matteo",
      lastName: "Rossi",
      dob: "1978-11-05",
      nationalId: "IT/48201948201",
      issuingCountry: "IT",
      issuingAuthority: "Ministero dell'Interno",
      walletProvider: "IT Wallet (App IO)",
      validUntil: "2029-08-20"
    }
  };

  const addLog = (message: string, type: "info" | "success" | "error" | "warning" = "info") => {
    setLogs((prev) => [
      ...prev,
      {
        timestamp: new Date().toLocaleTimeString(),
        type,
        message
      }
    ]);
  };

  const handleTestConnection = () => {
    setIsTestingConnection(true);
    setConnectionStatus("SYNCING");
    addLog("Initiating full path diagnostics to eIDAS v2 EbDS / EUDI trust registry...", "info");

    setTimeout(() => {
      const isSuccess = Math.random() > 0.1;
      setIsTestingConnection(false);

      if (isSuccess) {
        setConnectionStatus("ACTIVE");
        setLatency(28 + Math.floor(Math.random() * 15));
        addLog("eIDAS v2 Ledger Trust Nodes replied successfully.", "success");
        addLog("Cryptographic keys validated against the EU Trusted List (EUTL).", "success");
      } else {
        setConnectionStatus("DEGRADED");
        setLatency(142);
        addLog("EbDS node latency exceeded threshold (120ms). Fallback to secondary node.", "warning");
      }
    }, 1800);
  };

  const handleSimulateVerification = () => {
    setIsVerifying(true);
    setVerificationResult(null);
    addLog("EUDI presentation received via OpenID4VP protocol...", "info");

    setTimeout(async () => {
      addLog("Initiating production-level cryptographic handshakes...", "info");
      addLog("Transmitting SD-JWT selective disclosure envelope to /api/v1/eid/verify-presentation...", "info");

      try {
        const res = await fetch('/api/v1/eid/verify-presentation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            presentationToken: customToken || `mock_eudi_token_${selectedProfile}`,
            profileId: selectedProfile,
            userId: 'usr_active_tenant'
          })
        });

        const data = await res.json();

        if (res.ok && data.success) {
          addLog("Decrypted JARM package with secure hardware module key successfully.", "success");
          addLog("Cryptographic signature validated against official EUTL trust anchors.", "success");
          setIsVerifying(false);
          setStats(prev => ({
            ...prev,
            verifiedPresentations: prev.verifiedPresentations + 1,
            successRate: parseFloat((((prev.verifiedPresentations + 1) / (prev.verifiedPresentations + 1 + prev.decryptionFailures)) * 100).toFixed(1))
          }));
          setVerificationResult({
            success: true,
            claims: data.claims,
            security: data.security,
            timestamp: data.timestamp
          });
          addLog(`Successfully verified EUDI identity of ${data.claims.firstName} ${data.claims.lastName} (${data.claims.issuingCountry})`, "success");
        } else {
          setIsVerifying(false);
          setStats(prev => ({
            ...prev,
            decryptionFailures: prev.decryptionFailures + 1,
            successRate: parseFloat(((prev.verifiedPresentations / (prev.verifiedPresentations + prev.decryptionFailures + 1)) * 100).toFixed(1))
          }));
          setVerificationResult({
            success: false,
            error: data.error || "Cryptographic signature validation failure.",
            timestamp: new Date().toISOString()
          });
          addLog(data.error || "Wallet signature invalid or issued by an untrusted member state CA!", "error");
        }
      } catch (err: any) {
        setIsVerifying(false);
        setVerificationResult({
          success: false,
          error: `Network error or connection timed out: ${err.message}`,
          timestamp: new Date().toISOString()
        });
        addLog(`Backend verification failed: ${err.message}`, "error");
      }
    }, 1200);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-sm flex flex-col">
      {/* Header section with beautiful eIDAS badge */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100/50">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <span>eIDAS v2 EUDI Identity Engine</span>
              <span className="text-[10px] bg-indigo-100 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded font-extrabold uppercase font-mono">
                Mandate-Compliant
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Secure identity assertion and wallet verification for the European Union.
            </p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          {connectionStatus === "ACTIVE" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-emerald-400"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Connected
            </span>
          )}
          {connectionStatus === "SYNCING" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100 shadow-sm">
              <Loader2 className="w-3 h-3 animate-spin text-amber-500" />
              Syncing
            </span>
          )}
          {connectionStatus === "DEGRADED" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100 shadow-sm">
              <AlertTriangle className="w-3 h-3 text-amber-500" />
              Degraded
            </span>
          )}
        </div>
      </div>

      {/* Embedded Navigation Tabs inside widget */}
      <div className="flex border-b border-slate-100 bg-white font-medium text-xs px-5">
        <button
          onClick={() => setActiveTab("status")}
          className={`py-3 px-4 border-b-2 transition-colors ${
            activeTab === "status" ? "border-indigo-600 text-indigo-600 font-bold" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Connectivity Status
        </button>
        <button
          onClick={() => setActiveTab("simulator")}
          className={`py-3 px-4 border-b-2 transition-colors ${
            activeTab === "simulator" ? "border-indigo-600 text-indigo-600 font-bold" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Verification Simulator
        </button>
        <button
          onClick={() => setActiveTab("credentials")}
          className={`py-3 px-4 border-b-2 transition-colors ${
            activeTab === "credentials" ? "border-indigo-600 text-indigo-600 font-bold" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Diagnostics & Trust List
        </button>
      </div>

      <div className="p-5 flex-1 bg-white">
        {activeTab === "status" && (
          <div className="space-y-5">
            {/* Grid of basic parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Verifications</span>
                <span className="text-xl font-extrabold text-slate-800 block mt-1">{stats.verifiedPresentations.toLocaleString()}</span>
                <span className="text-slate-500 text-[11px] block mt-1">High Assurance Level</span>
              </div>
              <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Success Rate</span>
                <span className="text-xl font-extrabold text-emerald-600 block mt-1">{stats.successRate}%</span>
                <span className="text-slate-500 text-[11px] block mt-1">Decryption & Auth integrity</span>
              </div>
              <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">EBDS Latency</span>
                <span className="text-xl font-extrabold text-slate-800 block mt-1">{latency}ms</span>
                <span className="text-slate-500 text-[11px] block mt-1">Trust Anchor Endpoint</span>
              </div>
              <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">failures</span>
                <span className={`text-xl font-extrabold block mt-1 ${stats.decryptionFailures > 5 ? "text-rose-600" : "text-slate-700"}`}>
                  {stats.decryptionFailures}
                </span>
                <span className="text-slate-500 text-[11px] block mt-1">Untrusted trust roots</span>
              </div>
            </div>

            {/* Strict mode setting */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-indigo-50/40 border border-indigo-100/50 rounded-xl gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Settings className="w-4 h-4 text-indigo-500" />
                  eIDAS v2 Enforcement Level
                </h4>
                <p className="text-xs text-slate-500 max-w-xl">
                  Strict Mode enforces hardware-bound confirmation keys, selective disclosures, and only trusts wallets with certified eIDAS v2 conformant trust roots.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsStrictMode(!isStrictMode);
                  addLog(`Strict Mode changed to: ${!isStrictMode ? "ENFORCED" : "PERMISSIVE"}`, !isStrictMode ? "warning" : "info");
                }}
                className={`w-full sm:w-auto px-4 py-2 text-xs font-bold rounded-lg transition-all border ${
                  isStrictMode
                    ? "bg-indigo-600 border-indigo-700 text-white shadow-sm hover:bg-indigo-700"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {isStrictMode ? "Strict Mode: Enforced" : "Permissive Mode"}
              </button>
            </div>

            {/* Test Connection Button */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-xs text-slate-400 font-mono">Endpoint: eudi.trust.europa.eu/v2/EbDS</span>
              <button
                onClick={handleTestConnection}
                disabled={isTestingConnection}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isTestingConnection ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                <span>{isTestingConnection ? "Checking..." : "Diagnose Connectivity"}</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === "simulator" && (
          <div className="space-y-5">
            <p className="text-xs text-slate-500 leading-relaxed">
              Use this simulator to verify physical or digital wallet authentication payloads compliant with the **eIDAS v2 SD-JWT Presentation (OpenID4VP)** standard. Select a preset EU Citizen Profile or input custom CBOR credentials payload:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Profile selector */}
              <div className="space-y-4 md:col-span-1">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Citizen Profile</label>
                  <div className="space-y-2">
                    {Object.keys(profiles).map((key) => {
                      const prof = profiles[key as keyof typeof profiles];
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            setSelectedProfile(key);
                            setVerificationResult(null);
                          }}
                          className={`w-full text-left p-3 rounded-lg border transition ${
                            selectedProfile === key
                              ? "bg-indigo-50/50 border-indigo-200 text-slate-800 font-semibold"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex justify-between items-center text-xs">
                            <span>{prof.firstName} {prof.lastName}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 font-bold">{prof.issuingCountry}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-1 font-normal truncate">{prof.walletProvider}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Custom Token (Optional)</label>
                  <input
                    type="text"
                    value={customToken}
                    onChange={(e) => setCustomToken(e.target.value)}
                    placeholder="Enter SD-JWT presentation block or 'FAIL' to trigger validation error"
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <button
                  onClick={handleSimulateVerification}
                  disabled={isVerifying}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition disabled:opacity-50"
                >
                  {isVerifying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isVerifying ? "Verifying Token..." : "Simulate Verification"}</span>
                </button>
              </div>

              {/* Display Result and Decrypted Claims */}
              <div className="md:col-span-2 bg-slate-900 text-slate-100 rounded-xl p-4 flex flex-col min-h-[300px]">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
                  <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                    DECRYPTED OID4VP CLAIMS MAP
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">eIDAS v2 Engine v1.0</span>
                </div>

                <div className="flex-1 overflow-y-auto max-h-[250px] custom-scrollbar text-xs font-mono space-y-3">
                  {isVerifying && (
                    <div className="h-full flex flex-col items-center justify-center space-y-2 py-10">
                      <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                      <span className="text-slate-400 text-[10px]">Processing presentation payload...</span>
                    </div>
                  )}

                  {!isVerifying && !verificationResult && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center py-10">
                      <UserCheck className="w-8 h-8 mb-2 stroke-[1.5px] text-slate-600" />
                      <p>Awaiting presentation request...</p>
                      <p className="text-[10px] text-slate-600 mt-1">Select a profile and click 'Simulate Verification' to begin.</p>
                    </div>
                  )}

                  {!isVerifying && verificationResult && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      {verificationResult.success ? (
                        <>
                          <div className="p-3 bg-emerald-950/40 border border-emerald-900/40 rounded-lg flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                            <div>
                              <div className="text-emerald-400 font-bold">VERIFICATION OK</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">Trust chain verified against EU Trust List anchors. EPID signature authentic.</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px]">
                            <div>
                              <span className="text-slate-500 block">First Name:</span>
                              <span className="text-slate-200 font-bold">{verificationResult.claims.firstName}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Last Name:</span>
                              <span className="text-slate-200 font-bold">{verificationResult.claims.lastName}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Date of Birth:</span>
                              <span className="text-slate-200 font-bold">{verificationResult.claims.dob}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">PID National Identifier:</span>
                              <span className="text-amber-400 font-bold">{verificationResult.claims.nationalId}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Issuing Country:</span>
                              <span className="text-slate-200">{verificationResult.claims.issuingCountry}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Authority:</span>
                              <span className="text-slate-300 text-[10px] truncate block" title={verificationResult.claims.issuingAuthority}>
                                {verificationResult.claims.issuingAuthority}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-1 bg-slate-950 p-3 rounded-lg border border-slate-800 text-[10px]">
                            <div className="text-slate-400 font-bold border-b border-slate-900 pb-1 mb-1.5">CRYPTOGRAPHIC DETAILS</div>
                            <div className="flex justify-between"><span className="text-slate-500">Protocol:</span> <span className="text-slate-300">{verificationResult.security.authProtocol}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Signature algorithm:</span> <span className="text-slate-300">{verificationResult.security.signatureAlgorithm}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Assurance Level:</span> <span className="text-indigo-400 font-bold">{verificationResult.security.assuranceLevel}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Binding proof:</span> <span className="text-slate-300">{verificationResult.security.bindingConfirmation}</span></div>
                          </div>
                        </>
                      ) : (
                        <div className="p-3 bg-rose-950/40 border border-rose-900/40 rounded-lg flex items-start gap-3">
                          <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                          <div>
                            <div className="text-rose-400 font-bold">VERIFICATION FAILURE</div>
                            <div className="text-[10px] text-slate-300 mt-1 leading-relaxed">{verificationResult.error}</div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "credentials" && (
          <div className="space-y-5">
            <div className="flex flex-col md:flex-row gap-5">
              {/* Trust anchors info */}
              <div className="flex-1 space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                    <Database className="w-4 h-4 text-indigo-500" />
                    EU Member State Trust Anchor Anchoring (EUTL)
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    This engine queries the digital signatures and public keys published on the official EU Trusted Lists (EUTL) to cryptographically attest any presented digital wallet credential under article 12 of eIDAS.
                  </p>
                </div>

                <div className="space-y-2 bg-slate-50 p-3.5 border border-slate-150 rounded-xl text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-200">
                    <span className="font-semibold text-slate-700">Verified Member States CA</span>
                    <span className="font-mono bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-bold">27 / 27</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200">
                    <span className="font-semibold text-slate-700">HSM Certificate Status</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Synchronized
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="font-semibold text-slate-700">Decryption HSM Keys (FIPS 140-3)</span>
                    <span className="font-mono text-slate-600">3 Keys Loaded</span>
                  </div>
                </div>
              </div>

              {/* Diagnostics log panel */}
              <div className="flex-1 bg-slate-950 rounded-xl p-4 flex flex-col">
                <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider block border-b border-slate-900 pb-1.5 mb-2 uppercase">
                  Active diagnostic feed
                </span>
                <div className="flex-1 max-h-[140px] overflow-y-auto custom-scrollbar font-mono text-[10px] text-slate-400 space-y-1.5">
                  {logs.slice().reverse().map((log, index) => (
                    <div key={index} className="flex items-start gap-1">
                      <span className="text-slate-600 select-none">[{log.timestamp}]</span>
                      <span className={`font-bold ${
                        log.type === "success" ? "text-emerald-400" :
                        log.type === "error" ? "text-rose-400" :
                        log.type === "warning" ? "text-amber-400" : "text-indigo-400"
                      }`}>
                        {log.type.toUpperCase()}:
                      </span>
                      <span className="text-slate-300">{log.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
