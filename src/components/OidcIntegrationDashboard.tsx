import React, { useState, useEffect } from "react";
import { 
  Activity, 
  Cpu, 
  Layers, 
  Wifi, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Copy, 
  Check, 
  RefreshCw, 
  FileCode, 
  Database,
  ArrowRightLeft,
  ShieldAlert,
  Server,
  Lock,
  Smartphone,
  Sliders
} from "lucide-react";

interface OidcIntegrationDashboardProps {
  oidcState?: "idle" | "request_generated" | "wallet_scanned" | "user_consent" | "token_verification" | "verified";
  oidcClientId?: string;
  oidcRedirectUri?: string;
  oidcNonce?: string;
  oidcWalletType?: string;
  oidcCitizenProfile?: string;
  oidcRequestedClaims?: Record<string, boolean>;
  oidcDisclosedClaims?: Record<string, boolean>;
  oidcVerificationDetails?: any;
  oidcEIDASConformance?: any;
  onInjectError?: (errorType: string | null) => void;
  injectedError?: string | null;
}

export function OidcIntegrationDashboard({
  oidcState = "verified",
  oidcClientId = "did:ebsi:zehN9vN4d...sovereign-node",
  oidcRedirectUri = "https://sovereign.platform.eu/api/v1/eid/verify-presentation",
  oidcNonce = "nonce_8f93a1c4b72e09",
  oidcWalletType = "EUDI Wallet Reference App (v2.1.0)",
  oidcCitizenProfile = "EU Sovereign Identity Holder",
  oidcRequestedClaims = { "first_name": true, "family_name": true, "date_of_birth": true, "tax_id": true },
  oidcDisclosedClaims = { "first_name": true, "family_name": true, "date_of_birth": true, "tax_id": true },
  oidcVerificationDetails = { issuer: "did:ebsi:eidas-trust-anchor-germany", qtspLevel: "eIDAS QTSP Qualified", revoked: false },
  oidcEIDASConformance = { highAssurance: true, cryptographicBinding: "ECDSA_SECP256R1" },
  onInjectError = () => {},
  injectedError = null
}: OidcIntegrationDashboardProps = {}) {
  const [activePacketTab, setActivePacketTab] = useState<"auth_req" | "sd_jwt" | "qtsp_verify">("auth_req");
  const [copied, setCopied] = useState(false);
  const [simulatedLatency, setSimulatedLatency] = useState(145);
  const [stats, setStats] = useState({
    sessionsProcessed: 28,
    successfulHandshakes: 27,
    failedHandshakes: 1,
    bytesTransferred: 114.8, // in KB
  });

  // Dynamic values based on connection state
  const isConnecting = oidcState !== "idle" && oidcState !== "verified";
  const isSuccess = oidcState === "verified" && !injectedError;
  const isFailed = !!injectedError && oidcState === "verified";

  // Fetch real backend handshake stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/v1/oidc4vp/handshake-stats');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setStats({
              sessionsProcessed: data.sessionsProcessed || 29,
              successfulHandshakes: data.successfulHandshakes || 28,
              failedHandshakes: data.failedHandshakes || 1,
              bytesTransferred: data.bytesTransferredKb || 118.3,
            });
          }
        }
      } catch (err) {
        console.error('Failed to fetch OIDC4VP stats:', err);
      }
    };
    fetchStats();
  }, []);

  // Simulate stats updates on verified handshake
  useEffect(() => {
    if (oidcState === "verified") {
      if (injectedError) {
        setStats(prev => ({
          ...prev,
          sessionsProcessed: prev.sessionsProcessed + 1,
          failedHandshakes: prev.failedHandshakes + 1,
          bytesTransferred: Number((prev.bytesTransferred + 2.8).toFixed(1))
        }));
      } else {
        const payloadSize = 3.5 + Object.keys(oidcDisclosedClaims).filter(k => oidcDisclosedClaims[k]).length * 0.4;
        setStats(prev => ({
          ...prev,
          sessionsProcessed: prev.sessionsProcessed + 1,
          successfulHandshakes: prev.successfulHandshakes + 1,
          bytesTransferred: Number((prev.bytesTransferred + payloadSize).toFixed(1))
        }));
      }
    }
  }, [oidcState, injectedError]);

  // Fluctuating Simulated Latency
  useEffect(() => {
    const timer = setInterval(() => {
      setSimulatedLatency(prev => {
        const fluctuation = Math.floor(Math.random() * 15) - 7;
        let next = prev + fluctuation;
        if (next < 80) next = 80;
        if (next > 280) next = 280;
        return next;
      });
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Build simulated JSON packet content
  const getPacketContent = () => {
    const nonce = oidcNonce || "6F82A091B0E";
    const clientId = oidcClientId || "https://regulettee-portal.eu/relying-party";
    const redirectUri = oidcRedirectUri || "https://regulettee-portal.eu/api/v1/auth/callback";

    if (activePacketTab === "auth_req") {
      return {
        header: {
          alg: "ES256",
          typ: "JWT",
          kid: "did:key:z6MkuY4md8VnPhA1R398fjsi..."
        },
        payload: {
          response_type: "vp_token",
          client_id: clientId,
          redirect_uri: redirectUri,
          scope: ["openid"],
          nonce: nonce,
          presentation_definition: {
            id: "eudiv_presentation_definition_v2",
            input_descriptors: [
              {
                id: "eu_digital_identity_credential",
                purpose: "Testing OID4VP identity integration & attribute minimization with 9Xen Regulettee portal",
                constraints: {
                  fields: Object.keys(oidcRequestedClaims)
                    .filter(k => oidcRequestedClaims[k])
                    .map(key => ({
                      path: [`$.credentialSubject.${key}`],
                      filter: { type: "string" }
                    }))
                }
              }
            ]
          }
        },
        signature: "MEQCIDUoM6Z3bV+Yl59tGvOnyuT+vWpA9N2eU8eO6KxG6WJHAiAh7gA+oX7m9g27jH62vB2rY..."
      };
    } else if (activePacketTab === "sd_jwt") {
      if (oidcState === "idle" || oidcState === "request_generated") {
        return { message: "Packet not transmitted yet. Initiate scan & attribute share inside simulator above to populate packet payload." };
      }

      // If we have verification details, build packet from that
      const disclosedKeys = Object.keys(oidcDisclosedClaims).filter(k => oidcDisclosedClaims[k]);
      
      const disclosures = disclosedKeys.map(key => {
        const salt = Math.random().toString(36).substring(2, 10).toUpperCase();
        return {
          salt,
          claim_name: key,
          claim_value: key === "age_over_18" ? true : key === "nationality" ? "DE/FR/IT" : "Simulated Value"
        };
      });

      return {
        protected_header: {
          alg: "ES256",
          typ: "vc+sd-jwt",
          kid: "did:key:z6MkuY4m..."
        },
        sd_payload: {
          iss: "https://qtsp.eidas.trust-anchors.eu",
          iat: Math.floor(Date.now() / 1000) - 3600,
          exp: Math.floor(Date.now() / 1000) + 86400,
          _sd: disclosures.map(d => btoa(JSON.stringify(d)).substring(0, 16)),
          _sd_decoy_salts: ["F829A102", "D92083A1", "C91028FA"],
          cnf: {
            jwk: {
              kty: "EC",
              crv: "P-256",
              x: "f83oj3D2xFToOT4N-YqYiQ...",
              y: "x_daDu6GtxRJE3KKX16_F..."
            }
          }
        },
        kb_jwt: {
          header: {
            alg: "ES256",
            typ: "kb+jwt"
          },
          payload: {
            nonce: nonce,
            aud: clientId,
            iat: Math.floor(Date.now() / 1000)
          },
          signature: isFailed && injectedError === "holder_binding_mismatch" 
            ? "INVALID_CORRUPTED_HOLDER_PROOF_SIGNATURE" 
            : "MEYCIQDUH96CgW2N7Fh+Y8Yd7GvOpyuT+vWpA9N2eU8eO6K..."
        }
      };
    } else {
      // QTSP Verify
      return {
        query: {
          qtsp_provider: "EU Qualified Trust Service Provider Ledger Anchor",
          issuer_domain: "qtsp.eidas.trust-anchors.eu",
          verification_standard: "eIDAS 2.0 Annex I Qualified Certificate validation",
          check_revocation: "OCSP Stapling via trust directory"
        },
        result: {
          status: isFailed && injectedError === "expired_trust_anchor" ? "REVOKED_OR_EXPIRED" : "TRUSTED_ACTIVE",
          ocsp_response: {
            produced_at: new Date().toISOString(),
            cert_status: isFailed && injectedError === "expired_trust_anchor" ? "invalid" : "good",
            signature_algorithm: "sha256WithRSAEncryption"
          },
          eidas_trust_registry_match: isFailed && injectedError === "expired_trust_anchor" ? false : true,
          level_of_assurance_validated: isFailed && injectedError === "expired_trust_anchor" ? "NONE" : "HIGH"
        }
      };
    }
  };

  const getActivePacketLabel = () => {
    if (activePacketTab === "auth_req") return "SIOPv2 Auth Request (RP → Client)";
    if (activePacketTab === "sd_jwt") return "SD-JWT Presentation (Client → RP)";
    return "QTSP Certification Check (RP → Trust Registry)";
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 sm:p-5 lg:p-6 lg:p-8 text-left space-y-4 sm:space-y-6 mt-8">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg shrink-0">
              <Activity className="w-5 h-5 animate-pulse" />
            </span>
            <h3 className="text-lg font-black text-slate-900 tracking-tight font-sans">
              OIDC Handshake & eIDAS 2.0 Attribute Exchange Dashboard
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time packet sniffer, dynamic protocol topology mapping, and cryptographic telemetry controls.
          </p>
        </div>

        {/* Diagnostic / Error Injection Tools */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mr-1">
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span>Test Diagnostic:</span>
          </div>
          <div className="flex gap-1.5">
            {[
              { id: "none", label: "Nominal (Normal)", error: null, color: "bg-emerald-50 text-emerald-800 border-emerald-100 hover:bg-emerald-100" },
              { id: "replay", label: "Replay Attack (Nonce Mismatch)", error: "nonce_replay", color: "bg-amber-50 text-amber-800 border-amber-100 hover:bg-amber-100" },
              { id: "expired", label: "Revoked QTSP Certificate", error: "expired_trust_anchor", color: "bg-rose-50 text-rose-800 border-rose-100 hover:bg-rose-100" },
              { id: "binding", label: "Corrupted Holder Proof", error: "holder_binding_mismatch", color: "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200" }
            ].map(err => {
              const isActive = injectedError === err.error;
              return (
                <button
                  key={err.id}
                  type="button"
                  onClick={() => {
                    onInjectError(err.error);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                    isActive 
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm font-black scale-102" 
                      : `${err.color}`
                  }`}
                >
                  {err.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Connection Latency</div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black text-slate-900 font-mono">{simulatedLatency}</span>
            <span className="text-xs font-bold text-slate-500">ms</span>
          </div>
          <div className="flex items-center gap-1 mt-2 text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-slate-500 font-medium font-sans">Active SSL handshake</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Integrations Audited</div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black text-slate-900 font-mono">{stats.sessionsProcessed}</span>
            <span className="text-xs font-bold text-slate-500">runs</span>
          </div>
          <div className="text-[10px] text-indigo-600 font-bold mt-2 font-sans flex justify-between">
            <span>Pass: {stats.successfulHandshakes}</span>
            <span className="text-rose-600">Fail: {stats.failedHandshakes}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Data Transferred</div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black text-slate-900 font-mono">{stats.bytesTransferred}</span>
            <span className="text-xs font-bold text-slate-500">KB</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-2 font-sans font-medium">
            Avg packet size: 3.8 KB (Compressed)
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">GDPR Minimization Rate</div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black text-slate-900 font-mono">
              {Object.keys(oidcRequestedClaims).length > 0 
                ? Math.round((1 - (Object.keys(oidcDisclosedClaims).filter(k => oidcDisclosedClaims[k]).length / Object.keys(oidcRequestedClaims).length)) * 100)
                : 0}%
            </span>
            <span className="text-xs font-bold text-emerald-600">Minimization</span>
          </div>
          <div className="text-[10px] text-emerald-700 font-bold mt-2 font-sans">
            Selective disclosure payload active
          </div>
        </div>
      </div>

      {/* Main Grid: Topology and Packet Inspector */}
      <div className="grid lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Dynamic Topology Node Connection Graph */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1">
              Active Integration Network Topology
            </h4>
            <p className="text-[11px] text-slate-500">
              Interactive data transit paths between OIDC entities during the current eIDAS 2.0 exchange protocol session.
            </p>
          </div>

          {/* SVG Topology Grid */}
          <div className="relative py-5 sm:py-8 flex flex-col items-center justify-center">
            {/* Visual Connections Map */}
            <div className="w-full max-w-[340px] aspect-[4/3] relative flex items-center justify-center">
              
              {/* Central flow lines using SVG */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
                {/* RP to Wallet Link */}
                <path 
                  d="M 60,70 Q 170,40 280,70" 
                  fill="none" 
                  stroke={isConnecting && activePacketTab === "auth_req" ? "#6366f1" : isSuccess ? "#10b981" : isFailed ? "#ef4444" : "#cbd5e1"} 
                  strokeWidth="2.5" 
                  strokeDasharray={isConnecting ? "6, 4" : "0"}
                  className={isConnecting ? "animate-dash-flow" : ""}
                />
                
                {/* Wallet to RP Link (Return token) */}
                <path 
                  d="M 280,100 Q 170,130 60,100" 
                  fill="none" 
                  stroke={isConnecting && activePacketTab === "sd_jwt" ? "#6366f1" : isSuccess ? "#10b981" : isFailed ? "#ef4444" : "#cbd5e1"} 
                  strokeWidth="2.5" 
                  strokeDasharray={isConnecting ? "6, 4" : "0"}
                  className={isConnecting ? "animate-dash-flow" : ""}
                />

                {/* RP to QTSP Direct Trust Link */}
                <path 
                  d="M 60,100 Q 170,220 280,180" 
                  fill="none" 
                  stroke={isConnecting && activePacketTab === "qtsp_verify" ? "#6366f1" : isSuccess ? "#10b981" : isFailed && injectedError === "expired_trust_anchor" ? "#ef4444" : "#cbd5e1"} 
                  strokeWidth="2" 
                  strokeDasharray={oidcState === "token_verification" || oidcState === "verified" ? "4, 4" : "0"}
                />

                {/* Animated Traffic Pulses */}
                {isConnecting && activePacketTab === "auth_req" && (
                  <circle r="5" fill="#4f46e5" className="animate-pulse-node">
                    <animateMotion dur="2.2s" repeatCount="indefinite" path="M 60,70 Q 170,40 280,70" />
                  </circle>
                )}
                {isConnecting && activePacketTab === "sd_jwt" && (
                  <circle r="5" fill="#4f46e5" className="animate-pulse-node">
                    <animateMotion dur="2.2s" repeatCount="indefinite" path="M 280,100 Q 170,130 60,100" />
                  </circle>
                )}
                {oidcState === "token_verification" && (
                  <circle r="5" fill="#818cf8" className="animate-pulse-node">
                    <animateMotion dur="1.8s" repeatCount="indefinite" path="M 60,100 Q 170,220 280,180" />
                  </circle>
                )}
              </svg>

              {/* Node 1: Relying Party (RP) */}
              <div className="absolute left-0 top-[25%] transform -translate-x-[20%] text-center space-y-1 z-10">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto border transition-all ${
                  isSuccess ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-emerald-50 shadow-md" : 
                  isFailed ? "bg-rose-50 border-rose-500 text-rose-700 shadow-rose-50 shadow-md" :
                  isConnecting ? "bg-indigo-50 border-indigo-500 text-indigo-700 animate-pulse" :
                  "bg-slate-50 border-slate-300 text-slate-500"
                }`}>
                  <Server className="w-5 h-5" />
                </div>
                <div className="text-[10px] font-extrabold text-slate-800 leading-tight">9Xen Regulettee RP</div>
                <div className="text-[8px] font-mono text-slate-400">Relying Party</div>
              </div>

              {/* Node 2: Client Wallet */}
              <div className="absolute right-0 top-[25%] transform translate-x-[20%] text-center space-y-1 z-10">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto border transition-all ${
                  isSuccess ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-emerald-50 shadow-md" : 
                  isFailed ? "bg-rose-50 border-rose-500 text-rose-700 shadow-rose-50 shadow-md" :
                  isConnecting ? "bg-indigo-50 border-indigo-500 text-indigo-700 animate-pulse" :
                  "bg-slate-50 border-slate-300 text-slate-500"
                }`}>
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="text-[10px] font-extrabold text-slate-800 leading-tight">EUDI Wallet</div>
                <div className="text-[8px] font-mono text-slate-400">Holder Agent</div>
              </div>

              {/* Node 3: QTSP Directory Service */}
              <div className="absolute right-[15%] bottom-0 text-center space-y-1 z-10">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center mx-auto border transition-all ${
                  isFailed && injectedError === "expired_trust_anchor" ? "bg-rose-50 border-rose-400 text-rose-600" :
                  isSuccess ? "bg-emerald-50 border-emerald-400 text-emerald-600" :
                  "bg-slate-50 border-slate-300 text-slate-500"
                }`}>
                  <Database className="w-4 h-4" />
                </div>
                <div className="text-[10px] font-extrabold text-slate-800 leading-tight">eIDAS QTSP Ledger</div>
                <div className="text-[8px] font-mono text-slate-400">EU Trusted List</div>
              </div>

            </div>
          </div>

          {/* Real-time Status / Alert Feed */}
          <div className="mt-4 p-3 rounded-xl border text-[11px] leading-normal font-sans">
            {isFailed ? (
              <div className="text-rose-900 bg-rose-50 border-rose-100 flex items-start gap-2 p-1 rounded">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-extrabold block">Handshake Integrity Blocked:</strong>
                  {injectedError === "nonce_replay" && "RP detected Replay Attack! Cryptographic nonce bound does not match authorization challenge."}
                  {injectedError === "expired_trust_anchor" && "Validation Failed! QTSP Certificate is revoked or expired. Trust root certificate path invalid."}
                  {injectedError === "holder_binding_mismatch" && "Security Exception! SD-JWT Key Binding verification failed. Token signature was forged or corrupted."}
                </div>
              </div>
            ) : isSuccess ? (
              <div className="text-emerald-900 bg-emerald-50 border-emerald-100 flex items-start gap-2 p-1 rounded">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-extrabold block">SSL Session & Cryptographic Handshake Secured</strong>
                  DPoP token bound over HTTPS. SD-JWT signed via holder ECC private key and verified by trust list root.
                </div>
              </div>
            ) : (
              <div className="text-indigo-900 bg-indigo-50/50 border-indigo-100/50 flex items-start gap-2 p-1 rounded">
                <Wifi className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block">Current Handshake State: {oidcState.toUpperCase()}</strong>
                  {oidcState === "idle" && "Ready to simulate integration. Trigger the eIDAS 2.0 handshake using controls on top."}
                  {oidcState === "request_generated" && "Auth request issued. Scanner active awaiting camera response binding."}
                  {oidcState === "user_consent" && "Awaiting user disclosure selection. Claims are stored locally inside sandboxed container."}
                  {oidcState === "token_verification" && "Verifying cryptographic proof matrices, checking ledger signatures and CRL directories."}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Packet Sniffer / Code Inspector */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col min-h-[420px]">
          <div className="flex justify-between items-start border-b border-slate-100 pb-3.5">
            <div>
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-indigo-600" />
                eIDAS 2.0 Protocol Packet Sniffer
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Sniff raw eIDAS / OID4VP request and response payloads exchanged over HTTP.
              </p>
            </div>
            
            {/* Action buttons */}
            <button
              onClick={() => handleCopy(JSON.stringify(getPacketContent(), null, 2))}
              className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 flex items-center gap-1 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? "Copied!" : "Copy Packet JSON"}</span>
            </button>
          </div>

          {/* Packet Selector Tabs */}
          <div className="flex border-b border-slate-100 my-3">
            {[
              { id: "auth_req", label: "SIOPv2 Auth Request" },
              { id: "sd_jwt", label: "SD-JWT Token" },
              { id: "qtsp_verify", label: "Trust Anchors Map" }
            ].map(tab => {
              const active = activePacketTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActivePacketTab(tab.id as any)}
                  className={`px-3 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                    active 
                      ? "border-indigo-600 text-indigo-700" 
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Raw JSON Packet Code Block */}
          <div className="flex-1 flex flex-col justify-between">
            <div className="relative font-mono text-[10px] bg-slate-950 text-slate-300 rounded-xl p-4 overflow-y-auto max-h-[280px] leading-relaxed border border-slate-950/80 custom-scrollbar">
              <div className="absolute top-2 right-2 text-[8px] font-bold text-indigo-400 bg-indigo-950/50 px-1.5 py-0.5 rounded uppercase tracking-wider">
                {activePacketTab === "sd_jwt" ? "SD-JWT JWS" : activePacketTab === "auth_req" ? "JSON-LD" : "OCSP STAPLE"}
              </div>
              <pre className="text-left whitespace-pre-wrap select-all">
                {JSON.stringify(getPacketContent(), null, 2)}
              </pre>
            </div>

            {/* Explanatory subtitle */}
            <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs flex justify-between items-center text-slate-600">
              <span className="font-bold flex items-center gap-1">
                <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-500" />
                {getActivePacketLabel()}
              </span>
              <span className="text-[10px] font-mono text-slate-400 font-bold bg-white px-1.5 py-0.5 border border-slate-200 rounded">
                Size: {activePacketTab === "auth_req" ? "1.4 KB" : activePacketTab === "sd_jwt" ? "3.2 KB" : "0.9 KB"}
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
