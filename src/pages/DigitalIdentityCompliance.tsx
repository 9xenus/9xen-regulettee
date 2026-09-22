import { fetchWithRetry } from '../lib/api-client';
import React, { useState, useEffect, useRef } from "react";
import { useNotification } from '../context/NotificationContext';
import { 
  Fingerprint, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  FileKey2, 
  Link, 
  Globe, 
  Camera, 
  Upload, 
  RefreshCw, 
  Cpu, 
  Brain, 
  Check, 
  X, 
  ShieldAlert, 
  Sparkles, 
  Server, 
  Terminal, 
  Lock, 
  Download, 
  Eye, 
  FileText, 
  ChevronRight, 
  Activity,
  QrCode,
  Smartphone,
  Key,
  Code,
  UserCheck,
  ExternalLink,
  Share2,
  Database,
  Send,
  Sliders,
  Search,
  ScrollText,
  Trash2,
  FileSpreadsheet,
  Shield
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { OidcIntegrationDashboard } from "../components/OidcIntegrationDashboard";
import { DSRWorkflow } from "../components/DSRWorkflow";
import { BiometricStorageOverview } from "../components/BiometricStorageOverview";
import { GlobalLawSynchronizer } from "../components/GlobalLawSynchronizer";
import { RegionalAdminManager } from "../components/RegionalAdminManager";
import { JurisdictionDashboard } from "../components/JurisdictionDashboard";
import { ClientDashboard } from "../components/ClientDashboard";
import { RegulatoryChangeSimulator } from "../components/RegulatoryChangeSimulator";

interface ComplianceLog {
  timestamp: string;
  type: "info" | "success" | "warning" | "error";
  message: string;
}

export function DigitalIdentityCompliance() {
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState<"framework" | "biometric" | "enrollment" | "oidc-wallet" | "audit-trail" | "dsar" | "biometric-overview" | "law-sync" | "client-dashboard" | "saas-admin">("saas-admin");
  const [selectedProfile, setSelectedProfile] = useState<"de_citizen" | "fr_citizen" | "it_citizen" | "custom">("de_citizen");
  
  // eIDAS 2.0 Biometric Audit Trail States
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);
  const [auditSearchQuery, setAuditSearchQuery] = useState("");
  const [auditFilterType, setAuditFilterType] = useState<"ALL" | "ENROLLMENT" | "VERIFICATION" | "DELETION">("ALL");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchAuditLogs = async () => {
    setIsLoadingAudit(true);
    try {
      const res = await fetchWithRetry("/api/v1/compliance/biometric/audit-trail");
      const data = await res.json();
      if (data && data.success && data.auditTrail) {
        setAuditLogs(data.auditTrail);
      }
    } catch (err) {
      console.error("Error fetching biometric audit logs:", err);
    } finally {
      setIsLoadingAudit(false);
    }
  };
  
  // Wallet Enrollment States
  const [enrollName, setEnrollName] = useState("");
  const [enrollCountry, setEnrollCountry] = useState("DE");
  const [enrollDocType, setEnrollDocType] = useState("EU Passport");
  const [enrollEnclaveKey, setEnrollEnclaveKey] = useState("");
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false);
  const [newEnrollmentResult, setNewEnrollmentResult] = useState<any | null>(null);
  const [enrolledList, setEnrolledList] = useState<any[]>([]);
  const [isLoadingEnrollments, setIsLoadingEnrollments] = useState(false);
  const [disclosedEnrollments, setDisclosedEnrollments] = useState<Record<string, boolean>>({});

  // OIDC Wallet Attribute Validation Simulation States
  const [oidcState, setOidcState] = useState<"idle" | "request_generated" | "wallet_scanned" | "user_consent" | "token_verification" | "verified">("idle");
  const [oidcWalletType, setOidcWalletType] = useState<"de_ausweisapp" | "fr_identity" | "it_cie" | "eu_wallet">("eu_wallet");
  const [oidcCitizenProfile, setOidcCitizenProfile] = useState<"de_citizen" | "fr_citizen" | "it_citizen" | "enrolled_citizen">("de_citizen");
  const [selectedEnrolledCitizenId, setSelectedEnrolledCitizenId] = useState<string>("");
  const [oidcNonce, setOidcNonce] = useState<string>("");
  const [oidcClientId, setOidcClientId] = useState<string>("https://regulettee-portal.eu/relying-party");
  const [oidcRedirectUri, setOidcRedirectUri] = useState<string>("https://regulettee-portal.eu/api/v1/auth/callback");
  const [oidcRequestedClaims, setOidcRequestedClaims] = useState<Record<string, boolean>>({
    given_name: true,
    family_name: true,
    date_of_birth: true,
    age_over_18: true,
    nationality: true,
    unique_id: true,
    electronic_signature: false,
  });
  const [oidcDisclosedClaims, setOidcDisclosedClaims] = useState<Record<string, boolean>>({
    given_name: true,
    family_name: true,
    date_of_birth: true,
    age_over_18: true,
    nationality: true,
    unique_id: true,
    electronic_signature: false,
  });
  const [oidcSimulatedLogs, setOidcSimulatedLogs] = useState<string[]>([]);
  const [oidcGeneratedQr, setOidcGeneratedQr] = useState<string>("");
  const [oidcVerificationDetails, setOidcVerificationDetails] = useState<any | null>(null);
  const [oidcEIDASConformance, setOidcEIDASConformance] = useState<any | null>(null);
  const [oidcIsProcessing, setOidcIsProcessing] = useState<boolean>(false);
  const [oidcInjectedError, setOidcInjectedError] = useState<string | null>(null);

  const addOidcLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setOidcSimulatedLogs(prev => [...prev, `[${time}] ${msg}`]);
  };

  const handleGenerateOidcRequest = () => {
    setOidcIsProcessing(true);
    const generatedNonce = Array.from(crypto.getRandomValues(new Uint8Array(6))).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    setOidcNonce(generatedNonce);

    const claimScope = Object.keys(oidcRequestedClaims)
      .filter(k => oidcRequestedClaims[k])
      .join(",");

    // Constructing a standard eIDAS 2.0 OID4VP/SIOPv2 URI
    const uri = `openid-vc://?response_type=vp_token&client_id=${encodeURIComponent(oidcClientId)}&redirect_uri=${encodeURIComponent(oidcRedirectUri)}&scope=openid&nonce=${generatedNonce}&presentation_definition=${encodeURIComponent(JSON.stringify({
      id: "eudiv_presentation",
      input_descriptors: [{
        id: "eu_digital_identity_attestation",
        purpose: "Authenticate EU citizen attributes for eIDAS 2.0 relying party validation",
        constraints: {
          fields: Object.keys(oidcRequestedClaims)
            .filter(k => oidcRequestedClaims[k])
            .map(k => ({ path: [`$.credentialSubject.${k}`], filter: { type: "string" } }))
        }
      }]
    }))}`;

    setOidcGeneratedQr(uri);

    setTimeout(() => {
      setOidcState("request_generated");
      setOidcIsProcessing(false);
      addOidcLog("Generated OID4VP Verifiable Presentation Request.");
      addOidcLog(`Created cryptographic nonce: ${generatedNonce}`);
      addOidcLog(`Relying Party Client ID: ${oidcClientId}`);
      addOidcLog(`Redirect Response Target: ${oidcRedirectUri}`);
      addLog("EU Digital Identity Wallet OIDC authorization request generated.", "info");
    }, 600);
  };

  const handleSimulateWalletScan = () => {
    setOidcIsProcessing(true);
    addOidcLog("OIDC Authorization Request scanned by EU Digital Identity Wallet app.");
    addOidcLog("Validating Relying Party digital certificate signature...");
    
    setTimeout(() => {
      addOidcLog("SUCCESS: Relying Party metadata contains valid QTSP signature seal (eIDAS v2 Trust List anchored).");
      addOidcLog("Secure tunnel established via HTTPS with DPoP binding keys.");
      setOidcDisclosedClaims({ ...oidcRequestedClaims });
      setOidcState("user_consent");
      setOidcIsProcessing(false);
      addLog("EU Wallet app parsed OID4VP presentation definition successfully.", "success");
    }, 800);
  };

  const handleToggleDisclosedClaim = (claim: string) => {
    setOidcDisclosedClaims(prev => ({
      ...prev,
      [claim]: !prev[claim]
    }));
  };

  const handleVerifyWalletToken = () => {
    setOidcIsProcessing(true);
    setOidcState("token_verification");
    addOidcLog("Citizen approved disclosure. Generating SD-JWT Verifiable Presentation...");
    
    // Determine the subject info
    let activeProfileObj: any = profiles.de_citizen;
    if (oidcCitizenProfile === "fr_citizen") activeProfileObj = profiles.fr_citizen;
    else if (oidcCitizenProfile === "it_citizen") activeProfileObj = profiles.it_citizen;
    else if (oidcCitizenProfile === "enrolled_citizen") {
      const found = enrolledList.find(c => c.enrollmentId === selectedEnrolledCitizenId);
      if (found) {
        activeProfileObj = {
          name: found.username,
          dob: found.createdAt ? "1990-05-15" : "1990-05-15", // fallback
          idNum: found.enrollmentId,
          country: found.country,
          type: found.documentType,
          authority: "Sovereign eIDAS Trust Registry",
          sdJwt: found.sdJwtCredential,
          vectorHash: found.vectorHash
        };
      }
    }

    setTimeout(() => {
      addOidcLog("Transmitting verifiable presentation via HTTP POST callback...");
      addOidcLog("Relying Party endpoint received vp_token.");
      addOidcLog("Running cryptographic signature validation on SD-JWT holder token...");
    }, 600);

    setTimeout(() => {
      const uniqueId = activeProfileObj.idNum || "EU-ID-8293102";

      if (oidcInjectedError) {
        let errorMsg = "Verification failed due to security policies.";
        if (oidcInjectedError === "nonce_replay") {
          errorMsg = "CRITICAL ERROR: Nonce validation failed! Nonce replay attack blocked.";
        } else if (oidcInjectedError === "expired_trust_anchor") {
          errorMsg = "CRITICAL ERROR: Qualified Trust Chain validation failed! Issuer anchor has expired or been revoked.";
        } else if (oidcInjectedError === "holder_binding_mismatch") {
          errorMsg = "CRITICAL ERROR: SD-JWT Holder binding signature mismatch! The holder proof signature is invalid.";
        }

        const details = {
          issuer: "EU Qualified Trust Service Provider (QTSP)",
          subject: activeProfileObj.name,
          country: activeProfileObj.country,
          algorithm: "ECDSA_SHA256 (ECC SECP256R1)",
          header: {
            alg: "ES256",
            typ: "kb+jwt",
            kid: "did:key:z6MkuY4m..."
          },
          disclosedClaims: {},
          signatureToken: `INVALID-SD-JWT-TOKEN-ERROR-${oidcInjectedError.toUpperCase()}`,
          nonceValidated: oidcInjectedError !== "nonce_replay",
          holderBindingValidated: oidcInjectedError !== "holder_binding_mismatch",
          trustChainAnchored: oidcInjectedError !== "expired_trust_anchor"
        };

        const conformance = {
          siopv2Conformance: oidcInjectedError === "nonce_replay" ? "FAIL (Invalid cryptographic nonce binding)" : "PASS",
          selectiveDisclosureConformance: "PASS",
          hardwareEnclaveBinding: oidcInjectedError === "holder_binding_mismatch" ? "FAIL (Holder proof binding signature invalid)" : "PASS",
          assuranceLevel: "Level of Assurance: NONE (Verification failed)",
          complianceWarnings: [errorMsg]
        };

        setOidcVerificationDetails(details);
        setOidcEIDASConformance(conformance);
        setOidcState("verified");
        setOidcIsProcessing(false);

        addOidcLog(errorMsg);
        addOidcLog("Handshake validation aborted. Session security audit log updated.");
        addLog(`OIDC Handshake FAILED for ${activeProfileObj.name}: ${errorMsg}`, "error");
        return;
      }

      const signatureChecked = true;
      const holderBindingChecked = true;
      const nonceChecked = true;
      const expiredChecked = true;

      const details = {
        issuer: "EU Qualified Trust Service Provider (QTSP)",
        subject: activeProfileObj.name,
        country: activeProfileObj.country,
        algorithm: "ECDSA_SHA256 (ECC SECP256R1)",
        header: {
          alg: "ES256",
          typ: "kb+jwt",
          kid: "did:key:z6MkuY4m..."
        },
        disclosedClaims: Object.keys(oidcDisclosedClaims).reduce((acc: any, key) => {
          if (oidcDisclosedClaims[key]) {
            if (key === "given_name") acc[key] = activeProfileObj.name.split(' ')[0];
            else if (key === "family_name") acc[key] = activeProfileObj.name.split(' ').slice(1).join(' ') || "Sovereign";
            else if (key === "date_of_birth") acc[key] = activeProfileObj.dob || "1988-06-12";
            else if (key === "age_over_18") acc[key] = true;
            else if (key === "nationality") acc[key] = activeProfileObj.country;
            else if (key === "unique_id") acc[key] = uniqueId;
            else if (key === "electronic_signature") acc[key] = `QES_LEVEL_SEC_ENCLAVE_KEY:${Array.from(crypto.getRandomValues(new Uint8Array(4))).map(b => b.toString(16).padStart(2, '0')).join('')}`;
          }
          return acc;
        }, {}),
        signatureToken: activeProfileObj.sdJwt || `eIDAS-v2-SD-JWT-ECC-P256-${activeProfileObj.country}-HASHED-91A2F`,
        nonceValidated: nonceChecked,
        holderBindingValidated: holderBindingChecked,
        trustChainAnchored: true
      };

      const conformance = {
        siopv2Conformance: "PASS (OpenID Connect for Verifiable Presentations v2.0 - Draft 13)",
        selectiveDisclosureConformance: "PASS (SD-JWT RFC Draft 04 Conformant payload)",
        hardwareEnclaveBinding: "PASS (Attestation contains secure hardware-bound private key proof)",
        assuranceLevel: activeProfileObj.sdJwt ? "Level of Assurance: HIGH (eIDAS Article 8 compliant)" : "Level of Assurance: SUBSTANTIAL",
        complianceWarnings: Object.keys(oidcDisclosedClaims).filter(k => oidcRequestedClaims[k] && !oidcDisclosedClaims[k]).length > 0 
          ? ["Citizen selectively withheld requested attributes. RP must gracefully handle missing claims (GDPR minimization principle conforming)."]
          : []
      };

      setOidcVerificationDetails(details);
      setOidcEIDASConformance(conformance);
      setOidcState("verified");
      setOidcIsProcessing(false);

      addOidcLog("OIDC handshakes verified! Signature MATCHED.");
      addOidcLog("Holder key binding confirmed via nonce challenge signature check.");
      addOidcLog("Selective disclosures extracted cleanly.");
      addLog(`OIDC Attribute Validation Conformance check PASSED for ${activeProfileObj.name}.`, "success");
    }, 1800);
  };

  const handleResetOidcSimulation = () => {
    setOidcState("idle");
    setOidcGeneratedQr("");
    setOidcVerificationDetails(null);
    setOidcEIDASConformance(null);
    setOidcSimulatedLogs([]);
    addLog("OIDC Wallet Validation Simulator reset to idle state.", "info");
  };

  const generateMockEnclaveKey = () => {
    let key = "04"; // Uncompressed ECC public key prefix
    for (const b of crypto.getRandomValues(new Uint8Array(32))) {
      key += b.toString(16).padStart(2, '0').toUpperCase();
    }
    return key;
  };

  const fetchEnrollments = async () => {
    setIsLoadingEnrollments(true);
    try {
      const res = await fetchWithRetry("/api/v1/compliance/biometric/enrollments");
      const data = await res.json();
      if (data && data.success && data.enrollments) {
        setEnrolledList(data.enrollments);
      }
    } catch (err) {
      console.error("Error fetching biometric enrollments:", err);
    } finally {
      setIsLoadingEnrollments(false);
    }
  };

  useEffect(() => {
    setEnrollEnclaveKey(generateMockEnclaveKey());
    fetchEnrollments();
  }, []);

  const toggleDisclosed = (id: string) => {
    setDisclosedEnrollments(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleEnrollBiometrics = async () => {
    if (!enrollName.trim()) {
      addLog("Enrollment failed: Citizen Full Name is required.", "error");
      return;
    }

    if (livenessStep !== "PASSED") {
      addLog("Enrollment blocked: Real-time liveness check (e.g. blink or yaw challenge) is required to prevent replay attacks.", "error");
      setLivenessError("Real-time liveness verification must be successfully completed before issuing the secure wallet credential.");
      return;
    }
    
    setIsEnrolling(true);
    setEnrollmentSuccess(false);
    setNewEnrollmentResult(null);
    addLog(`Initiating eIDAS 2.0 biometric mapping for ${enrollName}...`, "info");
    addLog(`Securing keys to hardware enclave: ${enrollEnclaveKey.substring(0, 16)}...`, "success");

    try {
      let selfieToSend = capturedSelfie;
      
      // If camera is not active, let's look if there is a custom selfie or we can use a profile template avatar
      if (!selfieToSend && selectedProfile === "custom") {
        selfieToSend = customSelfieImage;
      }

      const res = await fetchWithRetry("/api/v1/compliance/biometric/enroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: enrollName,
          country: enrollCountry,
          documentType: enrollDocType,
          selfieImage: selfieToSend,
          strictMode,
          enclaveKey: enrollEnclaveKey,
          livenessVerified: true,
          challengesPassed: challengesVerified
        })
      });

      const data = await res.json();
      if (data && data.success && data.enrollment) {
        setNewEnrollmentResult(data.enrollment);
        setEnrollmentSuccess(true);
        addLog(`Biometric mapped successfully! Enrollment ID: ${data.enrollment.enrollmentId}`, "success");
        addLog("eIDAS v2 Selective Disclosure JWT (SD-JWT) generated.", "success");
        fetchEnrollments(); // refresh active enrollments list!
      } else {
        addLog(data.error || "Enrollment failed during feature vector processing", "error");
      }
    } catch (err: any) {
      console.error(err);
      addLog("Failed to reach enrollment validation service", "error");
    } finally {
      setIsEnrolling(false);
    }
  };
  
  // Webcam & Capture States
  const [webcamActive, setWebcamActive] = useState(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedSelfie, setCapturedSelfie] = useState<string | null>(null);
  
  // Custom uploaded document state
  const [customDocImage, setCustomDocImage] = useState<string | null>(null);
  const [customSelfieImage, setCustomSelfieImage] = useState<string | null>(null);

  // Simulation & strict configs
  const [simulateAttack, setSimulateAttack] = useState(false);
  const [strictMode, setStrictMode] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Verification result state
  const [verificationResult, setVerificationResult] = useState<any | null>(null);

  // Mesh simulator parameters
  const [meshCalibrated, setMeshCalibrated] = useState(false);
  const [meshTelemetry, setMeshTelemetry] = useState({
    pitch: "0.2°",
    yaw: "-1.5°",
    roll: "0.0°",
    blinkDetected: true,
    smileScore: "14%",
    lightingScore: "98/100"
  });

  // Real-time Liveness Check States for Enrollment
  const [livenessActive, setLivenessActive] = useState(false);
  const [livenessStep, setLivenessStep] = useState<"IDLE" | "CHALLENGE_BLINK" | "CHALLENGE_TURN_HEAD" | "CHALLENGE_SMILE" | "PASSED" | "FAILED">("IDLE");
  const [livenessStatusMsg, setLivenessStatusMsg] = useState("");
  const [livenessProgress, setLivenessProgress] = useState(0); 
  const [challengesVerified, setChallengesVerified] = useState<string[]>([]);
  const [livenessError, setLivenessError] = useState<string | null>(null);

  // Liveness Challenge Orchestrator Effect
  useEffect(() => {
    if (!livenessActive) {
      setLivenessStep("IDLE");
      setLivenessProgress(0);
      setChallengesVerified([]);
      setLivenessError(null);
      setLivenessStatusMsg("");
      return;
    }

    if (simulateAttack) {
      setLivenessStatusMsg("Analyzing feed pattern for temporal inconsistencies...");
      const timer = setTimeout(() => {
        setLivenessStep("FAILED");
        setLivenessError("Presentation Attack Detected: Replay video playback pattern matched (Static frequency signature / Optical flow loop).");
        addLog("CRITICAL: Liveness challenge failed! Potential presentation attack blocked.", "error");
      }, 1500);
      return () => clearTimeout(timer);
    }

    if (livenessStep === "IDLE") {
      setLivenessStep("CHALLENGE_BLINK");
      setLivenessStatusMsg("Challenge 1/3: Close and open your eyes (Blink detection)");
      setLivenessProgress(10);
      addLog("Liveness verification initiated. Active challenge: Eyelid blink signature.", "info");
    }

    const interval = setInterval(() => {
      if (livenessStep === "CHALLENGE_BLINK") {
        const telemetryBlink = meshTelemetry.blinkDetected;
        if (telemetryBlink) {
          setChallengesVerified(prev => [...prev, "BLINK"]);
          setLivenessStep("CHALLENGE_TURN_HEAD");
          setLivenessStatusMsg("Challenge 2/3: Slowly turn your head to the right (Yaw confirmation)");
          setLivenessProgress(45);
          addLog("Challenge 1/3 PASSED: Dynamic eyelid micro-movement matched.", "success");
        }
      } else if (livenessStep === "CHALLENGE_TURN_HEAD") {
        setChallengesVerified(prev => [...prev, "TURN_HEAD"]);
        setLivenessStep("CHALLENGE_SMILE");
        setLivenessStatusMsg("Challenge 3/3: Smile slightly (3D dynamic contour validation)");
        setLivenessProgress(75);
        addLog("Challenge 2/3 PASSED: Head rotation yaw vector authenticated.", "success");
      } else if (livenessStep === "CHALLENGE_SMILE") {
        setChallengesVerified(prev => [...prev, "SMILE"]);
        setLivenessStep("PASSED");
        setLivenessStatusMsg("Liveness check completed. Citizen is present and verified!");
        setLivenessProgress(100);
        addLog("Challenge 3/3 PASSED: Facial muscle warm smile pattern matched. Liveness verified!", "success");
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [livenessActive, livenessStep, simulateAttack, meshTelemetry.blinkDetected]);

  const triggerManualLivenessChallenge = (challenge: "BLINK" | "TURN_HEAD" | "SMILE") => {
    if (simulateAttack) {
      setLivenessStep("FAILED");
      setLivenessError("Presentation Attack Detected: Manual bypass blocked by hardware-enclave frame signature checker.");
      addLog("CRITICAL: Manual liveness override blocked! Spoof attempt detected.", "error");
      return;
    }

    if (challenge === "BLINK" && livenessStep === "CHALLENGE_BLINK") {
      setChallengesVerified(prev => [...prev, "BLINK"]);
      setLivenessStep("CHALLENGE_TURN_HEAD");
      setLivenessStatusMsg("Challenge 2/3: Slowly turn your head to the right (Yaw confirmation)");
      setLivenessProgress(45);
      addLog("Challenge 1/3 (BLINK) passed via live keypoint confirmation.", "success");
    } else if (challenge === "TURN_HEAD" && livenessStep === "CHALLENGE_TURN_HEAD") {
      setChallengesVerified(prev => [...prev, "TURN_HEAD"]);
      setLivenessStep("CHALLENGE_SMILE");
      setLivenessStatusMsg("Challenge 3/3: Smile slightly (3D dynamic contour validation)");
      setLivenessProgress(75);
      addLog("Challenge 2/3 (TURN_HEAD) passed via yaw vector confirmation.", "success");
    } else if (challenge === "SMILE" && livenessStep === "CHALLENGE_SMILE") {
      setChallengesVerified(prev => [...prev, "SMILE"]);
      setLivenessStep("PASSED");
      setLivenessStatusMsg("Liveness check completed. Citizen is present and verified!");
      setLivenessProgress(100);
      addLog("Challenge 3/3 (SMILE) passed. Complete liveness mapping achieved.", "success");
    }
  };

  // Diagnostic Logs
  const [logs, setLogs] = useState<ComplianceLog[]>([
    { timestamp: new Date(Date.now() - 300000).toLocaleTimeString(), type: "info", message: "Biometric AI Engine v2.0 initialized." },
    { timestamp: new Date(Date.now() - 200000).toLocaleTimeString(), type: "success", message: "Liveness Neural Net weights loaded." },
    { timestamp: new Date(Date.now() - 100000).toLocaleTimeString(), type: "info", message: "Relying Party endpoint /api/v1/compliance/biometric/verify: ACTIVE" }
  ]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Profile Presets data
  const profiles = {
    de_citizen: {
      name: "Hans Müller",
      dob: "1984-09-12",
      idNum: "DE/12093810293",
      country: "DE",
      type: "EU Passport",
      authority: "Bundesministerium des Innern",
      avatarSvg: (
        <svg viewBox="0 0 100 100" className="w-16 h-16 rounded-full border border-slate-300 bg-slate-100">
          <circle cx="50" cy="38" r="18" fill="#4f46e5" fillOpacity="0.1" stroke="#4f46e5" strokeWidth="2" />
          <path d="M25 78c0-12 11-22 25-22s25 10 25 22" fill="#4f46e5" fillOpacity="0.1" stroke="#4f46e5" strokeWidth="2" />
          <circle cx="43" cy="35" r="2" fill="#4f46e5" />
          <circle cx="57" cy="35" r="2" fill="#4f46e5" />
          <path d="M46 44 q 4 2 8 0" stroke="#4f46e5" strokeWidth="1.5" fill="none" />
        </svg>
      ),
      docSvg: (
        <div className="w-full h-24 bg-gradient-to-r from-red-900 to-red-950 text-white rounded-xl p-3 border border-red-700/50 shadow-sm relative overflow-hidden flex flex-col justify-between font-mono text-[9px]">
          <div className="absolute top-0 right-0 p-1 opacity-10 font-bold text-2xl">BUNDESREPUBLIK DEUTSCHLAND</div>
          <div className="flex justify-between items-start">
            <span className="font-bold text-[8px] uppercase tracking-wider text-red-300">REISEPASS / PASSPORT</span>
            <span className="bg-amber-400 text-slate-900 px-1.5 py-0.2 rounded text-[7px] font-bold">DEU</span>
          </div>
          <div className="flex gap-2 items-center">
            <div className="w-6 h-8 bg-slate-800 rounded border border-slate-700 flex items-center justify-center text-[6px]">PHOTO</div>
            <div className="space-y-0.5">
              <div className="font-bold text-[8px]">MÜLLER, HANS</div>
              <div>ID NO: DE12093810</div>
              <div>DOB: 12.09.1984</div>
            </div>
          </div>
          <div className="flex justify-between text-[7px] text-red-300">
            <span>ISSUING AUTH: GERMANY</span>
            <span>VALID: 31 DEC 2031</span>
          </div>
        </div>
      )
    },
    fr_citizen: {
      name: "Chloé Dubois",
      dob: "1991-03-24",
      idNum: "FR/94021820491",
      country: "FR",
      type: "National Identity Card",
      authority: "Ministère de l'Intérieur",
      avatarSvg: (
        <svg viewBox="0 0 100 100" className="w-16 h-16 rounded-full border border-slate-300 bg-slate-100">
          <circle cx="50" cy="38" r="18" fill="#10b981" fillOpacity="0.1" stroke="#10b981" strokeWidth="2" />
          <path d="M25 78c0-12 11-22 25-22s25 10 25 22" fill="#10b981" fillOpacity="0.1" stroke="#10b981" strokeWidth="2" />
          <circle cx="43" cy="35" r="2" fill="#10b981" />
          <circle cx="57" cy="35" r="2" fill="#10b981" />
          <path d="M45 43 q 5 3 10 0" stroke="#10b981" strokeWidth="1.5" fill="none" />
        </svg>
      ),
      docSvg: (
        <div className="w-full h-24 bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-xl p-3 border border-blue-700/50 shadow-sm relative overflow-hidden flex flex-col justify-between font-mono text-[9px]">
          <div className="absolute top-0 right-0 p-1 opacity-10 font-bold text-2xl">RÉPUBLIQUE FRANÇAISE</div>
          <div className="flex justify-between items-start">
            <span className="font-bold text-[8px] uppercase tracking-wider text-blue-300">CARTE NATIONALE D'IDENTITÉ</span>
            <span className="bg-amber-400 text-slate-900 px-1.5 py-0.2 rounded text-[7px] font-bold">FRA</span>
          </div>
          <div className="flex gap-2 items-center">
            <div className="w-6 h-8 bg-slate-800 rounded border border-slate-700 flex items-center justify-center text-[6px]">PHOTO</div>
            <div className="space-y-0.5">
              <div className="font-bold text-[8px]">DUBOIS, CHLOÉ</div>
              <div>ID NO: FR94021820</div>
              <div>DOB: 24.03.1991</div>
            </div>
          </div>
          <div className="flex justify-between text-[7px] text-blue-300">
            <span>PREFECTURE DE PARIS</span>
            <span>VALID: 15 MAY 2030</span>
          </div>
        </div>
      )
    },
    it_citizen: {
      name: "Matteo Rossi",
      dob: "1978-11-05",
      idNum: "IT/48201948201",
      country: "IT",
      type: "National Identity Card",
      authority: "Ministero dell'Interno",
      avatarSvg: (
        <svg viewBox="0 0 100 100" className="w-16 h-16 rounded-full border border-slate-300 bg-slate-100">
          <circle cx="50" cy="38" r="18" fill="#f59e0b" fillOpacity="0.1" stroke="#f59e0b" strokeWidth="2" />
          <path d="M25 78c0-12 11-22 25-22s25 10 25 22" fill="#f59e0b" fillOpacity="0.1" stroke="#f59e0b" strokeWidth="2" />
          <circle cx="43" cy="35" r="2" fill="#f59e0b" />
          <circle cx="57" cy="35" r="2" fill="#f59e0b" />
          <path d="M46 45 q 4 1 8 0" stroke="#f59e0b" strokeWidth="1.5" fill="none" />
        </svg>
      ),
      docSvg: (
        <div className="w-full h-24 bg-gradient-to-r from-emerald-900 to-emerald-950 text-white rounded-xl p-3 border border-emerald-700/50 shadow-sm relative overflow-hidden flex flex-col justify-between font-mono text-[9px]">
          <div className="absolute top-0 right-0 p-1 opacity-10 font-bold text-2xl">REPUBBLICA ITALIANA</div>
          <div className="flex justify-between items-start">
            <span className="font-bold text-[8px] uppercase tracking-wider text-emerald-300">CARTA D'IDENTITÀ ELETTRONICA</span>
            <span className="bg-amber-400 text-slate-900 px-1.5 py-0.2 rounded text-[7px] font-bold">ITA</span>
          </div>
          <div className="flex gap-2 items-center">
            <div className="w-6 h-8 bg-slate-800 rounded border border-slate-700 flex items-center justify-center text-[6px]">PHOTO</div>
            <div className="space-y-0.5">
              <div className="font-bold text-[8px]">ROSSI, MATTEO</div>
              <div>ID NO: IT48201948</div>
              <div>DOB: 05.11.1978</div>
            </div>
          </div>
          <div className="flex justify-between text-[7px] text-emerald-300">
            <span>MINISTERO INTERNO</span>
            <span>VALID: 20 AUG 2029</span>
          </div>
        </div>
      )
    }
  };

  const addLog = (message: string, type: "info" | "success" | "warning" | "error" = "info") => {
    setLogs((prev) => [
      ...prev,
      {
        timestamp: new Date().toLocaleTimeString(),
        type,
        message
      }
    ]);
  };

  // Turn on actual webcam stream
  const startWebcam = async () => {
    try {
      setWebcamError(null);
      addLog("Initializing media devices and requesting camera permissions...", "info");
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480, facingMode: "user" } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setWebcamActive(true);
      addLog("Webcam stream active. Resolution: 640x480. High refresh rate.", "success");
    } catch (err: any) {
      console.error(err);
      setWebcamActive(false);
      setWebcamError("Camera access denied or unavailable. Using virtual simulator fallback.");
      addLog("Webcam access failed. Downgraded to biometric virtual capture model.", "warning");
    }
  };

  // Turn off webcam stream
  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setWebcamActive(false);
    setStream(null);
    addLog("Webcam stream closed and camera resource released.", "info");
  };

  // Take webcam photo snapshot
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL("image/jpeg");
        setCapturedSelfie(base64);
        addLog("Live biometric face frame captured & frozen.", "success");
      }
    }
  };

  // Custom document upload handler
  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomDocImage(event.target.result as string);
          addLog("Custom ID Document successfully parsed and loaded into sandbox memory.", "success");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Simulate mesh telemetry changes
  useEffect(() => {
    const interval = setInterval(() => {
      if (webcamActive || activeTab === "biometric") {
        setMeshCalibrated(true);
        setMeshTelemetry({
          pitch: `${(Math.random() * 2 - 1).toFixed(1)}°`,
          yaw: `${(Math.random() * 4 - 2).toFixed(1)}°`,
          roll: `${(Math.random() * 0.8 - 0.4).toFixed(2)}°`,
          blinkDetected: Math.random() > 0.08,
          smileScore: `${Math.floor(Math.random() * 15 + 10)}%`,
          lightingScore: `${Math.floor(Math.random() * 5 + 95)}/100`
        });
      }
    }, 1200);
    return () => clearInterval(interval);
  }, [webcamActive, activeTab]);

  // Perform Gemini AI Biometric Match
  const handlePerformVerification = async () => {
    setIsVerifying(true);
    setVerificationResult(null);
    addLog("Packaging secure biometric presentation claims map...", "info");
    addLog(`Strict Level Enforcement: ${strictMode ? "ENABLED (L3)" : "STANDARD (L2)"}`, strictMode ? "success" : "info");
    if (simulateAttack) {
      addLog("CRITICAL: Simulation includes potential presentation attack detection parameters.", "warning");
    }

    try {
      // Determine what images to send
      let selfieToSend = capturedSelfie;
      let docToSend = null;

      if (selectedProfile === "custom") {
        selfieToSend = customSelfieImage || capturedSelfie;
        docToSend = customDocImage;
      }

      const res = await fetchWithRetry("/api/v1/compliance/biometric/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          selfieImage: selfieToSend,
          documentImage: docToSend,
          simulateAttack,
          selectedProfile,
          strictMode
        })
      });

      const data = await res.json();
      if (data && data.success && data.analysis) {
        setVerificationResult(data.analysis);
        addLog(`Analysis complete. Matched: ${data.analysis.matched ? "YES" : "NO"} | Match Score: ${data.analysis.matchScore}%`, data.analysis.matched ? "success" : "error");
        if (data.analysis.alerts && data.analysis.alerts.length > 0) {
          data.analysis.alerts.forEach((alert: string) => {
            addLog(`ENGINE ALERT: ${alert}`, alert.includes("CRITICAL") ? "error" : "warning");
          });
        }
        addLog(`Cryptographic assurance token issued: ${data.analysis.signatureToken}`, "success");
      } else {
        addLog(data.error || "Verification failed during neural processing", "error");
      }
    } catch (err: any) {
      console.error(err);
      addLog("Failed to reach European Biometric validation endpoint", "error");
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    // Cleanup webcam stream on unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header section with brand and badge */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Fingerprint className="w-7 h-7 text-indigo-600" />
            Digital Identity & eIDAS 2.0 Compliance Suite
          </h1>
          <p className="text-slate-500 mt-1">EU Digital Identity Wallet (EUDIW) Relying Party integration, biometric audits, and active facial verification.</p>
        </div>
        <div className="flex flex-wrap bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1">
          <button 
            onClick={() => {
              setActiveTab("framework");
              addLog("Switched to eIDAS 2.0 Trust Framework view.", "info");
            }}
            className={`px-3 py-2 font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "framework"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Trust Framework</span>
          </button>
          <button 
            onClick={() => {
              setActiveTab("biometric");
              addLog("Switched to AI Biometric Match Auditor view.", "info");
            }}
            className={`px-3 py-2 font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "biometric"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            <span>Match Auditor</span>
          </button>
          <button 
            onClick={() => {
              setActiveTab("enrollment");
              addLog("Switched to Wallet Biometric Enrollment view.", "info");
            }}
            className={`px-3 py-2 font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "enrollment"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <FileKey2 className="w-3.5 h-3.5 animate-pulse" />
            <span>Identity Enrollment</span>
          </button>
          <button 
            onClick={() => {
              setActiveTab("oidc-wallet");
              addLog("Switched to OIDC Wallet Simulator view.", "info");
            }}
            className={`px-3 py-2 font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "oidc-wallet"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>OIDC Wallet Simulator</span>
          </button>
          <button 
            onClick={() => {
              setActiveTab("dsar");
              addLog("Switched to DSR Workflow view.", "info");
            }}
            className={`px-3 py-2 font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "dsar"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>DSAR Workflow</span>
          </button>
          <button 
            onClick={() => {
              setActiveTab("biometric-overview");
              addLog("Switched to Biometric Storage Overview view.", "info");
            }}
            className={`px-3 py-2 font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "biometric-overview"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Storage Overview</span>
          </button>
          <button 
            onClick={() => {
              setActiveTab("law-sync");
              addLog("Switched to Global Law Synchronizer view.", "info");
            }}
            className={`px-3 py-2 font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "law-sync"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Law Sync</span>
          </button>
          <button 
            onClick={() => {
              setActiveTab("client-dashboard");
              addLog("Switched to Client Dashboard view.", "info");
            }}
            className={`px-3 py-2 font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "client-dashboard"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Client Dashboard</span>
          </button>
          <button 
            onClick={() => {
              setActiveTab("saas-admin");
              addLog("Switched to SaaS Admin view.", "info");
            }}
            className={`px-3 py-2 font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "saas-admin"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>SaaS Admin</span>
          </button>
        </div>
      </div>

      {/* Basic Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></div>
          <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 font-mono">eIDAS 2.0 Readiness</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-extrabold text-emerald-600">85%</span>
            <span className="text-[10px] text-emerald-500 font-semibold bg-emerald-50 px-1.5 rounded">High Assurance</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 font-mono">KYC Verifications (24h)</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-extrabold text-slate-900">4,192</span>
            <span className="text-[10px] text-slate-500 font-medium">99.4% Auth Success</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 font-mono">Active trust CAs</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-extrabold text-indigo-600">27 / 27</span>
            <span className="text-[10px] text-indigo-500 font-medium">Synced Lists</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 font-mono">Biometric failures</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-extrabold text-amber-500">2.1%</span>
            <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 rounded">Spoofing Filtered</span>
          </div>
        </div>
      </div>

      {activeTab === "biometric" ? (
        <div className="grid lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Left Panel: Camera capture, Preset Profiles, Simulation controls */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            
            {/* Viewfinder Console Card */}
            <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col">
              <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-indigo-400"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">Biometric AI Scannery & Viewfinder</span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-mono bg-indigo-950 text-indigo-400 px-2.5 py-0.5 rounded-full border border-indigo-500/20 font-bold">
                  <Activity className="w-3 h-3 text-indigo-400 animate-pulse" />
                  <span>Mesh Matrix Actived</span>
                </div>
              </div>

              <div className="p-4 sm:p-5 lg:p-6 bg-slate-950/40 flex-1 flex flex-col md:flex-row gap-4 sm:gap-6">
                
                {/* Visual Viewfinder Frame */}
                <div className="w-full md:w-1/2 flex flex-col items-center justify-center space-y-3">
                  <div className="w-full aspect-[4/3] bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto relative group">
                    
                    {/* Glowing Mesh Overlay (Always on to simulate tracking) */}
                    <div className="absolute inset-0 z-10 pointer-events-none border border-indigo-500/10">
                      
                      {/* Scanning Line */}
                      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent absolute top-0 left-0 animate-scan z-20"></div>
                      
                      {/* Target Reticle corners */}
                      <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-indigo-500/70"></div>
                      <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-indigo-500/70"></div>
                      <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-indigo-500/70"></div>
                      <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-indigo-500/70"></div>

                      {/* Simulated Wireframe dots */}
                      {selectedProfile !== "custom" && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-40">
                          <svg viewBox="0 0 100 100" className="w-32 h-32 text-indigo-400 animate-pulse">
                            <circle cx="50" cy="50" r="1.5" fill="currentColor" />
                            {/* Eyeboxes */}
                            <rect x="38" y="42" width="6" height="6" fill="none" stroke="currentColor" strokeWidth="0.5" />
                            <rect x="56" y="42" width="6" height="6" fill="none" stroke="currentColor" strokeWidth="0.5" />
                            {/* Mouth cross */}
                            <line x1="45" y1="62" x2="55" y2="62" stroke="currentColor" strokeWidth="0.5" />
                            {/* Chin trace */}
                            <path d="M 32 55 Q 50 82 68 55" fill="none" stroke="currentColor" strokeWidth="0.5" />
                            {/* Forehead mesh line */}
                            <line x1="35" y1="35" x2="65" y2="35" stroke="currentColor" strokeWidth="0.3" strokeDasharray="2" />
                            <line x1="50" y1="35" x2="50" y2="62" stroke="currentColor" strokeWidth="0.3" strokeDasharray="2" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Camera view / Static simulated profile / frozen snapshot */}
                    {webcamActive ? (
                      <>
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          className={`w-full h-full object-cover transform scale-x-[-1] ${capturedSelfie ? "hidden" : "block"}`}
                        />
                        {capturedSelfie && (
                          <img src={capturedSelfie} alt="Captured Selfie" className="w-full h-full object-cover transform scale-x-[-1]" />
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                        {selectedProfile !== "custom" ? (
                          <div className="space-y-4">
                            <div className="flex justify-center">
                              {profiles[selectedProfile].avatarSvg}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                              Virtual Biometric Feed OK
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {customSelfieImage ? (
                              <img src={customSelfieImage} alt="Custom Selfie" className="w-20 h-20 rounded-full border border-slate-700 mx-auto object-cover" />
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 mx-auto">
                                <Camera className="w-6 h-6" />
                              </div>
                            )}
                            <label className="block text-xs font-bold text-slate-300 cursor-pointer hover:text-white bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors">
                              Upload Selfie Photo
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (ev) => {
                                      if (ev.target?.result) {
                                        setCustomSelfieImage(ev.target.result as string);
                                        addLog("Custom selfie photo uploaded and aligned.", "success");
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }} 
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Capturing Status */}
                    {isVerifying && (
                      <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center z-30 space-y-3">
                        <Brain className="w-8 h-8 text-indigo-400 animate-spin-slow" />
                        <span className="text-[10px] font-mono tracking-widest text-indigo-200">Neural Network Aligning...</span>
                      </div>
                    )}
                  </div>

                  {/* Camera Control Buttons */}
                  <div className="flex gap-2 w-full justify-center">
                    {webcamActive ? (
                      <>
                        <button 
                          onClick={capturePhoto}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5" /> Freeze Frame
                        </button>
                        <button 
                          onClick={() => {
                            setCapturedSelfie(null);
                            addLog("Selfie viewfinder unfrozen and reset.", "info");
                          }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-mono font-bold cursor-pointer"
                        >
                          Clear
                        </button>
                        <button 
                          onClick={stopWebcam}
                          className="px-3 py-1.5 bg-rose-900/60 hover:bg-rose-900 text-rose-200 rounded-lg text-[10px] font-mono font-bold cursor-pointer"
                        >
                          Stop WebCam
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={startWebcam}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5 text-indigo-400" /> Start Real Webcam Capture
                      </button>
                    )}
                  </div>
                  {webcamError && (
                    <span className="text-[10px] text-amber-500 font-mono text-center block mt-1">{webcamError}</span>
                  )}
                </div>

                {/* Live Face Telemetry HUD */}
                <div className="w-full md:w-1/2 flex flex-col justify-between space-y-4">
                  <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-4 space-y-3 font-mono text-[10px]">
                    <div className="text-slate-500 border-b border-slate-900 pb-1 font-bold tracking-widest text-[9px] uppercase">
                      Live Telemetry HUD
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-slate-300">
                      <div>
                        <span className="text-slate-500 block">FACE DETECTED:</span>
                        <span className="text-emerald-400 font-bold">YES</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">PITCH / YAW:</span>
                        <span className="text-indigo-400">{meshTelemetry.pitch} / {meshTelemetry.yaw}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">LIVENESS PASS:</span>
                        <span className={meshTelemetry.blinkDetected && !simulateAttack ? "text-emerald-400 font-bold" : "text-rose-400 font-bold animate-pulse"}>
                          {meshTelemetry.blinkDetected && !simulateAttack ? "VERIFIED" : "WARNING"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">SMILE COEFF:</span>
                        <span className="text-slate-400">{meshTelemetry.smileScore}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">LIGHTING:</span>
                        <span className="text-emerald-400">{meshTelemetry.lightingScore}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">FP MODEL RECON:</span>
                        <span className="text-slate-400">P256-R3 Mesh</span>
                      </div>
                    </div>
                  </div>

                  {/* ID Document Match Slot */}
                  <div className="border border-slate-800 rounded-xl p-3 bg-slate-950/40">
                    <span className="text-[9px] font-mono text-slate-500 block mb-2 font-bold uppercase tracking-wider">Document Anchor Mapped</span>
                    {selectedProfile !== "custom" ? (
                      profiles[selectedProfile].docSvg
                    ) : (
                      <div className="w-full h-24 border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center p-3 text-center bg-slate-950/80">
                        {customDocImage ? (
                          <div className="flex items-center gap-3 w-full">
                            <img src={customDocImage} alt="Custom ID" className="w-12 h-16 rounded border border-slate-700 object-cover" />
                            <div className="text-left font-mono text-[9px]">
                              <span className="text-slate-400 block font-bold">Custom Document Loaded</span>
                              <span className="text-slate-500 block truncate max-w-[120px]">Size: ~{Math.round(customDocImage.length/1024)} KB</span>
                              <span className="text-emerald-400">Parsed & Ready</span>
                            </div>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-5 h-5 text-slate-600 mb-1" />
                            <span className="text-[9px] text-slate-500 font-mono block">No ID Document uploaded</span>
                            <label className="text-[8px] bg-slate-800 text-indigo-400 hover:text-white px-2 py-0.5 rounded border border-slate-700 mt-1 cursor-pointer">
                              Browse Document
                              <input type="file" accept="image/*" className="hidden" onChange={handleDocUpload} />
                            </label>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Config & Action Panel */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm space-y-4">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">Biometric Compliance Parameters</h4>
                <p className="text-xs text-slate-500 mt-0.5">Control the security thresholds, spoofing audits, and eIDAS levels.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Liveness Attack simulator option */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                  <input 
                    type="checkbox" 
                    id="simulateAttack"
                    checked={simulateAttack}
                    onChange={(e) => {
                      setSimulateAttack(e.target.checked);
                      addLog(`Spoof attack simulation set to: ${e.target.checked ? "ACTIVE" : "INACTIVE"}`, e.target.checked ? "warning" : "info");
                    }}
                    className="mt-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                  />
                  <div>
                    <label htmlFor="simulateAttack" className="font-bold text-xs text-slate-800 flex items-center gap-1 cursor-pointer">
                      Simulate Spoofing / Presentation Attack
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                    </label>
                    <p className="text-[10px] text-slate-500 mt-0.5">Simulates high-contrast printed paper portrait or deepfake video replay loop.</p>
                  </div>
                </div>

                {/* Strict Enforcement level */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                  <input 
                    type="checkbox" 
                    id="strictMode"
                    checked={strictMode}
                    onChange={(e) => {
                      setStrictMode(e.target.checked);
                      addLog(`Strict Biometric Enrollment set to: ${e.target.checked ? "ENFORCED" : "PERMISSIVE"}`, e.target.checked ? "success" : "warning");
                    }}
                    className="mt-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                  />
                  <div>
                    <label htmlFor="strictMode" className="font-bold text-xs text-slate-800 flex items-center gap-1 cursor-pointer">
                      Enforce Strict eIDAS LoA High
                      <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    </label>
                    <p className="text-[10px] text-slate-500 mt-0.5">Enforces physical hardware-bound confirm signature, micro-saccade eye checking, and 95% matching threshold.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePerformVerification}
                disabled={isVerifying}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:bg-slate-300 disabled:from-slate-300 text-white font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 text-xs border-none cursor-pointer"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Engaging Gemini Biometric Auditor...</span>
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 text-indigo-200" />
                    <span>Perform AI Biometric Match & Verification</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Panel: Results console, Preset citizens profiles, Terminal logs */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6">
            
            {/* Citizens Select Profile list */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3.5">
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 font-mono">Test Citizen Presets</h4>
                <p className="text-xs text-slate-500 mt-0.5">Choose a preloaded EU Identity Profile to test instant verification.</p>
              </div>

              <div className="space-y-2">
                {Object.keys(profiles).map((key) => {
                  const p = profiles[key as keyof typeof profiles];
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedProfile(key as any);
                        setVerificationResult(null);
                        addLog(`Switched identity preset template to: ${p.name} (${p.country})`, "info");
                      }}
                      className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                        selectedProfile === key
                          ? "bg-indigo-50/50 border-indigo-200 text-slate-900 shadow-sm"
                          : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full border bg-slate-50 flex items-center justify-center font-bold text-xs">
                          {p.country}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-800">{p.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{p.type}</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  );
                })}

                <button
                  onClick={() => {
                    setSelectedProfile("custom");
                    setVerificationResult(null);
                    addLog("Switched to Custom biometric enrollment template.", "info");
                  }}
                  className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                    selectedProfile === "custom"
                      ? "bg-indigo-50/50 border-indigo-200 text-slate-900 shadow-sm"
                      : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full border border-dashed bg-slate-50 flex items-center justify-center font-bold text-xs text-indigo-500">
                      +
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-800">Custom Manual Upload</div>
                      <div className="text-[10px] text-slate-400 font-mono">Upload your own selfie & ID</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Verification Result Display */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm min-h-[220px] flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 p-1 opacity-5 text-indigo-900"><Fingerprint className="w-24 h-24" /></div>
              
              <div className="border-b border-slate-100 pb-3 mb-4">
                <span className="text-[9px] font-mono tracking-widest uppercase font-black text-slate-400 block">AI Biometric Result Console</span>
                <h4 className="font-extrabold text-slate-800 text-sm mt-1">Audit Attestation Outcome</h4>
              </div>

              {!verificationResult && !isVerifying && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4 sm:p-5 lg:p-6 text-slate-400 space-y-2">
                  <Brain className="w-8 h-8 stroke-[1.5px] text-slate-300 animate-pulse" />
                  <p className="text-xs font-semibold text-slate-500">Awaiting Biometric Execution</p>
                  <p className="text-[10px] max-w-xs text-slate-400 leading-normal">Align camera/presets and press 'Perform AI Biometric Match' to initiate regulatory audit.</p>
                </div>
              )}

              {isVerifying && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4 sm:p-5 lg:p-6 space-y-2">
                  <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
                  <p className="text-xs font-bold text-indigo-700">Verifying Biometric Presentation</p>
                  <p className="text-[10px] text-slate-400">Verifying CBOR signatures & SD-JWT key selective disclosures under eIDAS 2.0...</p>
                </div>
              )}

              {!isVerifying && verificationResult && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 flex-1">
                  
                  {/* Result Header Badge */}
                  {verificationResult.matched ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-emerald-800 font-extrabold text-xs">BIOMETRIC AUTHENTICATION SUCCESS</div>
                        <p className="text-[10px] text-slate-500 mt-0.5">The selfie face matches the ID Document photo. Liveness verified successfully.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
                      <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-rose-800 font-extrabold text-xs">BIOMETRIC VERIFICATION FAILURE</div>
                        <p className="text-[10px] text-rose-600 mt-0.5">Biometric match score below threshold or liveness audit failed. Access denied.</p>
                      </div>
                    </div>
                  )}

                  {/* Score telemetries */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-slate-400 text-[10px] block font-mono font-bold uppercase">MATCH CONFIDENCE</span>
                      <span className={`text-xl font-black block mt-1 ${verificationResult.matched ? "text-emerald-600" : "text-rose-600"}`}>
                        {verificationResult.matchScore}%
                      </span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-slate-400 text-[10px] block font-mono font-bold uppercase">LIVENESS SCORE</span>
                      <span className={`text-xl font-black block mt-1 ${verificationResult.livenessVerified ? "text-emerald-600" : "text-rose-600"}`}>
                        {verificationResult.livenessScore}%
                      </span>
                    </div>
                  </div>

                  {/* Extracted Card Details */}
                  <div className="bg-slate-950 text-slate-100 rounded-xl p-3 text-[10px] font-mono space-y-1.5 border border-slate-900">
                    <div className="text-slate-400 font-bold border-b border-slate-900 pb-1 mb-1 tracking-wider">DECRYPTED IDENTITY DEEDS</div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Document country:</span>
                      <span className="text-slate-300 font-bold">{verificationResult.documentCountry || "EU"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Document Type:</span>
                      <span className="text-slate-300 truncate max-w-[150px]" title={verificationResult.documentTypeDetected}>{verificationResult.documentTypeDetected || "National ID"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">eIDAS Assurance LoA:</span>
                      <span className="text-indigo-400 font-bold">{verificationResult.eidas2AssuranceLevel || "Substantial"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Credential token:</span>
                      <span className="text-amber-400 font-bold tracking-tight text-[9px] truncate max-w-[140px]">{verificationResult.signatureToken}</span>
                    </div>
                  </div>

                  {/* Warning and Alert Bullet Items */}
                  {verificationResult.alerts && verificationResult.alerts.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {verificationResult.alerts.map((al: string, i: number) => (
                        <div key={i} className="text-[10px] text-amber-700 font-mono flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                          <span className="truncate" title={al}>{al}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                    <button 
                      onClick={() => {
                        addLog("Downloading biometric token audit trail PDF...", "success");
                        showToast("Cryptographic biometric attestation certificate (eIDAS v2 aligned) downloaded to local client storage.", 'success');
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Certificate
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Diagnostic Logs Feed */}
            <div className="bg-slate-950 text-slate-100 rounded-2xl p-4 border border-slate-800 flex flex-col">
              <div className="border-b border-slate-900 pb-2 mb-3 flex justify-between items-center">
                <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider block uppercase">
                  Biometric active diagnostic feed
                </span>
                <span className="text-[8px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-500 font-mono">256-bit GCM</span>
              </div>
              <div className="h-32 overflow-y-auto custom-scrollbar font-mono text-[10px] text-slate-400 space-y-1.5">
                {logs.slice().reverse().map((log, index) => (
                  <div key={index} className="flex items-start gap-1">
                    <span className="text-slate-600 select-none">[{log.timestamp}]</span>
                    <span className={`font-bold shrink-0 ${
                      log.type === "success" ? "text-emerald-400" :
                      log.type === "error" ? "text-rose-400" :
                      log.type === "warning" ? "text-amber-400" : "text-indigo-400"
                    }`}>
                      {log.type.toUpperCase()}:
                    </span>
                    <span className="text-slate-300 leading-normal">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      ) : activeTab === "biometric-overview" ? (
        <div className="max-w-4xl mx-auto">
          <BiometricStorageOverview />
        </div>
      ) : activeTab === "law-sync" ? (
        <div className="max-w-4xl mx-auto">
          <GlobalLawSynchronizer />
        </div>
      ) : activeTab === "client-dashboard" ? (
        <div className="max-w-4xl mx-auto">
          <ClientDashboard />
        </div>
      ) : activeTab === "saas-admin" ? (
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          <JurisdictionDashboard />
          <RegionalAdminManager />
          <RegulatoryChangeSimulator />
        </div>
      ) : activeTab === "dsar" ? (
        <div className="max-w-4xl mx-auto">
          <DSRWorkflow />
        </div>
      ) : activeTab === "enrollment" ? (
        <div className="grid lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Left Column: Form & Vector Mapping Viewfinder */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            
            {/* Enrollment Form Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm space-y-5">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Fingerprint className="w-5 h-5 text-indigo-600 animate-pulse" />
                  Biometric Wallet Mapping
                </h3>
                <p className="text-xs text-slate-500 mt-1">Enroll a citizen into the biometric AI engine. This maps facial feature topology into a secure hardware-enclave template.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Citizen Full Name</label>
                  <input 
                    type="text" 
                    value={enrollName}
                    onChange={(e) => setEnrollName(e.target.value)}
                    placeholder="e.g. Hans Müller"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Jurisdiction / Country</label>
                    <select 
                      value={enrollCountry}
                      onChange={(e) => setEnrollCountry(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                    >
                      <option value="DE">Germany 🇩🇪</option>
                      <option value="FR">France 🇫🇷</option>
                      <option value="IT">Italy 🇮🇹</option>
                      <option value="ES">Spain 🇪🇸</option>
                      <option value="NL">Netherlands 🇳🇱</option>
                      <option value="EU">European Union 🇪🇺</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Identity Document Type</label>
                    <select 
                      value={enrollDocType}
                      onChange={(e) => setEnrollDocType(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                    >
                      <option value="EU Passport">EU Passport 📕</option>
                      <option value="National Identity Card">National Identity Card 🪪</option>
                      <option value="Digital Driver License">Digital Driver's License 🪪</option>
                      <option value="Residence Permit">Residence Permit 🛡️</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Wallet Secure Enclave Public Key (ECC P-256)
                    </label>
                    <button 
                      type="button"
                      onClick={() => {
                        setEnrollEnclaveKey(generateMockEnclaveKey());
                        addLog("Re-generated hardware-bound ECC key pair.", "success");
                      }}
                      className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 px-2 py-0.5 rounded"
                    >
                      Re-generate Pair
                    </button>
                  </div>
                  <div className="relative">
                    <input 
                      type="text" 
                      readOnly
                      value={enrollEnclaveKey}
                      className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-[9px] font-mono text-slate-600 select-all outline-none pl-8"
                    />
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Bound to physical hardware secure enclave in accordance with eIDAS 2.0 Level of Assurance (LoA) High requirements.</p>
                </div>

                {/* Camera snapshot / preset status */}
                <div className="border border-slate-100 rounded-xl p-4 bg-slate-50 space-y-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono block">Biometric Capture Feed</span>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-24 h-24 rounded-2xl border bg-slate-900 border-slate-200 overflow-hidden relative flex items-center justify-center">
                      {capturedSelfie ? (
                        <img src={capturedSelfie} alt="Capture" className="w-full h-full object-cover transform scale-x-[-1]" />
                      ) : selectedProfile !== "custom" ? (
                        <div className="transform scale-75">{profiles[selectedProfile].avatarSvg}</div>
                      ) : customSelfieImage ? (
                        <img src={customSelfieImage} alt="Custom Capture" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-6 h-6 text-slate-500" />
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-2 text-center sm:text-left">
                      <p className="text-xs text-slate-600 font-medium">Capture a real-time frame or use your selected citizen preset snapshot to feed the neural encoder.</p>
                      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                        {webcamActive ? (
                          <button 
                            type="button"
                            onClick={capturePhoto}
                            className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Camera className="w-3 h-3" /> Freeze Frame
                          </button>
                        ) : (
                          <button 
                            type="button"
                            onClick={() => {
                              setActiveTab("biometric");
                              startWebcam();
                            }}
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Camera className="w-3 h-3 text-indigo-400" /> Start Webcam
                          </button>
                        )}
                        <button 
                          type="button"
                          onClick={() => {
                            setCapturedSelfie(null);
                            addLog("Selfie buffer cleared.", "info");
                          }}
                          className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-[10px] font-mono font-bold cursor-pointer"
                        >
                          Reset Frame
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Real-time Liveness Check Interactive Module */}
                <div className="border border-slate-200 rounded-xl p-5 bg-slate-50 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider font-mono block flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                      Dynamic Liveness Verification (Anti-Spoofing)
                    </span>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                      simulateAttack ? "bg-rose-100 text-rose-700" : "bg-indigo-50 text-indigo-700"
                    }`}>
                      {simulateAttack ? "Presentation Attack Simulated" : "eIDAS 2.0 Annex II Compliant"}
                    </span>
                  </div>

                  {livenessStep === "IDLE" ? (
                    <div className="space-y-3.5 text-center p-3 bg-white border border-slate-100 rounded-xl">
                      <div className="mx-auto w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-800">Biometric Liveness Challenge Required</p>
                        <p className="text-[10px] text-slate-500 max-w-sm mx-auto leading-normal">
                          Requires active head movement, blink telemetry, and organic thermal/depth signature mapping to certify that captured biometric data is from a live person and not a high-resolution print or video loop replay.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setLivenessActive(true);
                          setLivenessError(null);
                        }}
                        className="mx-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-sm border-none"
                      >
                        <Camera className="w-3.5 h-3.5 text-indigo-400" />
                        Initialize Real-time Liveness Scan
                      </button>
                    </div>
                  ) : livenessStep === "FAILED" ? (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-3">
                      <div className="flex items-start gap-2.5">
                        <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5 animate-bounce" />
                        <div>
                          <h5 className="text-xs font-extrabold text-rose-900">Liveness Verification Blocked</h5>
                          <p className="text-[10px] text-rose-700 font-mono leading-normal mt-0.5">
                            {livenessError || "Biometric presentation signature matched replay/spoof metrics."}
                          </p>
                        </div>
                      </div>
                      <div className="bg-slate-900 text-slate-200 p-2 rounded text-[8px] font-mono">
                        // Neural analyzer error trace: <br />
                        SYS_REF_CORRELATION: NULL_TEMPORAL_NOISE_FLUTTER <br />
                        LOA_HIGH_VERDICT: REJECT_SPOOF_ATTACK_SUSPECTED
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setLivenessActive(false);
                          setTimeout(() => {
                            setLivenessActive(true);
                          }, 100);
                        }}
                        className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-[9px] font-mono font-bold cursor-pointer border-none"
                      >
                        Reset and Retry Challenge
                      </button>
                    </div>
                  ) : livenessStep === "PASSED" ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div>
                          <h5 className="text-xs font-extrabold text-emerald-900">Real-time Liveness Confirmed</h5>
                          <p className="text-[10px] text-emerald-700 font-medium">Verified via hardware enclave challenge-response matrix.</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2 bg-white/60 border border-emerald-100 rounded-lg text-center">
                          <Check className="w-3.5 h-3.5 text-emerald-600 mx-auto mb-1" />
                          <span className="text-[8px] font-mono font-bold text-slate-600 uppercase block">1. Eye Blink</span>
                          <span className="text-[7px] text-emerald-700 font-bold bg-emerald-100 px-1 rounded block mt-0.5">PASS</span>
                        </div>
                        <div className="p-2 bg-white/60 border border-emerald-100 rounded-lg text-center">
                          <Check className="w-3.5 h-3.5 text-emerald-600 mx-auto mb-1" />
                          <span className="text-[8px] font-mono font-bold text-slate-600 uppercase block">2. Yaw Vector</span>
                          <span className="text-[7px] text-emerald-700 font-bold bg-emerald-100 px-1 rounded block mt-0.5">PASS</span>
                        </div>
                        <div className="p-2 bg-white/60 border border-emerald-100 rounded-lg text-center">
                          <Check className="w-3.5 h-3.5 text-emerald-600 mx-auto mb-1" />
                          <span className="text-[8px] font-mono font-bold text-slate-600 uppercase block">3. Smile Contour</span>
                          <span className="text-[7px] text-emerald-700 font-bold bg-emerald-100 px-1 rounded block mt-0.5">PASS</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono pt-1">
                        <span>Liveness token signed:</span>
                        <span className="text-emerald-700 font-bold bg-emerald-100/50 px-1.5 rounded">LOA3-SECURE-STAMP</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-indigo-900 text-white rounded-xl space-y-3.5 relative overflow-hidden">
                      {/* Interactive Radar Ring */}
                      <div className="absolute right-3 top-3 w-10 h-10 border border-indigo-400/20 rounded-full flex items-center justify-center animate-ping-slow">
                        <div className="w-6 h-6 border border-indigo-400/40 rounded-full flex items-center justify-center">
                          <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full"></div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] font-mono font-bold text-indigo-300 tracking-wider uppercase block">Challenges active: {challengesVerified.length} of 3 completed</span>
                        <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Brain className="w-4 h-4 text-indigo-300 animate-pulse" />
                          {livenessStatusMsg}
                        </h5>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[8px] font-mono text-indigo-300">
                          <span>TEMPORAL CONSISTENCY ANALYZER</span>
                          <span>{livenessProgress}%</span>
                        </div>
                        <div className="w-full bg-indigo-950 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-indigo-400 to-emerald-400 h-1.5 transition-all duration-500" 
                            style={{ width: `${livenessProgress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Manual interaction / calibration override buttons for convenience & instant testing */}
                      <div className="bg-indigo-950/75 rounded-lg p-2.5 space-y-1.5 border border-indigo-800">
                        <span className="text-[8px] font-mono text-indigo-300 block font-bold">// SIMULATION CALIBRATION CONTROLS</span>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => triggerManualLivenessChallenge("BLINK")}
                            disabled={livenessStep !== "CHALLENGE_BLINK"}
                            className="px-2 py-1 bg-indigo-800 hover:bg-indigo-700 disabled:opacity-40 text-white rounded font-mono text-[8px] cursor-pointer border-none"
                          >
                            [Simulate Blink]
                          </button>
                          <button
                            type="button"
                            onClick={() => triggerManualLivenessChallenge("TURN_HEAD")}
                            disabled={livenessStep !== "CHALLENGE_TURN_HEAD"}
                            className="px-2 py-1 bg-indigo-800 hover:bg-indigo-700 disabled:opacity-40 text-white rounded font-mono text-[8px] cursor-pointer border-none"
                          >
                            [Simulate Head Rotation]
                          </button>
                          <button
                            type="button"
                            onClick={() => triggerManualLivenessChallenge("SMILE")}
                            disabled={livenessStep !== "CHALLENGE_SMILE"}
                            className="px-2 py-1 bg-indigo-800 hover:bg-indigo-700 disabled:opacity-40 text-white rounded font-mono text-[8px] cursor-pointer border-none"
                          >
                            [Simulate Smile]
                          </button>
                        </div>
                        <p className="text-[7px] text-indigo-400 font-mono">Note: The system monitors live camera feeds. Alternatively, click these simulation toggles to bypass and complete challenges instantly.</p>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleEnrollBiometrics}
                  disabled={isEnrolling}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:bg-slate-300 disabled:from-slate-300 text-white font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 text-xs border-none cursor-pointer"
                >
                  {isEnrolling ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Mapping Face Topology & Signing Credential...</span>
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 text-indigo-200" />
                      <span>Securely Map Face & Register Wallet</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Enrollment Outcome HUD & Wallet Register */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6">
            
            {/* Enrollment Outcome HUD */}
            <AnimatePresence mode="wait">
              {enrollmentSuccess && newEnrollmentResult ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-indigo-950 text-white border border-indigo-900 rounded-2xl p-5 shadow-lg space-y-4 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-1 opacity-10"><Sparkles className="w-20 h-20 text-indigo-400 animate-pulse" /></div>
                  
                  <div className="flex items-center gap-2.5 pb-3 border-b border-indigo-900">
                    <Check className="w-5 h-5 text-emerald-400 bg-emerald-500/20 p-1 rounded-full shrink-0" />
                    <div>
                      <span className="text-[9px] font-mono tracking-widest uppercase text-indigo-300 block">Enrollment Successful</span>
                      <h4 className="font-extrabold text-sm text-indigo-100">SD-JWT Wallet Credential Issued</h4>
                    </div>
                  </div>

                  <div className="text-[10px] font-mono space-y-2">
                    <div className="flex justify-between border-b border-indigo-900/50 pb-1">
                      <span className="text-indigo-400">ENROLLMENT ID:</span>
                      <span className="text-emerald-400 font-bold">{newEnrollmentResult.enrollmentId}</span>
                    </div>
                    <div className="flex justify-between border-b border-indigo-900/50 pb-1">
                      <span className="text-indigo-400">JURISDICTION:</span>
                      <span className="text-white font-bold">{newEnrollmentResult.country} (eIDAS v2)</span>
                    </div>
                    <div className="flex justify-between border-b border-indigo-900/50 pb-1">
                      <span className="text-indigo-400">LANDMARKS:</span>
                      <span className="text-indigo-200">{newEnrollmentResult.facialTemplate?.landmarksCount} Keypoints Mapped</span>
                    </div>
                    <div className="flex justify-between border-b border-indigo-900/50 pb-1">
                      <span className="text-indigo-400">SYMMETRY INDEX:</span>
                      <span className="text-indigo-200">{(newEnrollmentResult.facialTemplate?.jawlineSymmetry * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-indigo-400">ENCLAVE ATTESTATION:</span>
                      <span className="text-amber-400 font-bold truncate max-w-[120px]" title={newEnrollmentResult.sdJwtCredential}>{newEnrollmentResult.sdJwtCredential}</span>
                    </div>
                  </div>

                  <div className="bg-slate-900/50 rounded-xl p-3 border border-indigo-900 text-center">
                    <p className="text-[9px] font-mono text-slate-300 leading-normal">
                      The biometric features have been hashed deterministically. A Decentralized Identity Credential containing W3C selective disclosure tags has been signed and injected into the user's secure wallet enclave.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 text-center text-slate-400 shadow-sm min-h-[160px] flex flex-col justify-center items-center space-y-2">
                  <Cpu className="w-8 h-8 stroke-[1.5px] text-slate-300 animate-spin-slow" />
                  <p className="text-xs font-bold text-slate-500">Identity Cryptography Console</p>
                  <p className="text-[10px] max-w-xs text-slate-400 leading-normal">Submit the citizen enrollment form to generate an eIDAS-v2 biometric attestation deed.</p>
                </div>
              )}
            </AnimatePresence>

            {/* Wallet Register List */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 font-mono">Active Wallet Registries</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Citizens with secure biometric templates active on the network.</p>
                </div>
                <button 
                  onClick={fetchEnrollments}
                  className="p-1 text-slate-400 hover:text-indigo-600 rounded transition cursor-pointer"
                  title="Reload list"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingEnrollments ? "animate-spin" : ""}`} />
                </button>
              </div>

              {isLoadingEnrollments && enrolledList.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 font-mono">
                  Contacting Qualified Trust Provider Register...
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[360px] overflow-y-auto custom-scrollbar pr-1">
                  {enrolledList.map((citizen) => {
                    const countryFlag = citizen.country === "DE" ? "🇩🇪" : citizen.country === "FR" ? "🇫🇷" : citizen.country === "IT" ? "🇮🇹" : citizen.country === "ES" ? "🇪🇸" : citizen.country === "NL" ? "🇳🇱" : "🇪🇺";
                    const isDisclosed = !!disclosedEnrollments[citizen.enrollmentId];
                    return (
                      <div 
                        key={citizen.enrollmentId}
                        className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl shrink-0">{countryFlag}</span>
                            <div>
                              <h5 className="font-bold text-slate-900 text-xs">{citizen.username}</h5>
                              <p className="text-[9px] text-slate-400 font-mono tracking-tight">{citizen.enrollmentId} • {citizen.documentType}</p>
                            </div>
                          </div>
                          <span className={`text-[8px] font-mono px-2 py-0.5 rounded-full font-bold ${
                            citizen.securityLevel === "L3_HARDWARE_BOUND"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                              : "bg-amber-50 text-amber-700 border border-amber-200/50"
                          }`}>
                            {citizen.securityLevel === "L3_HARDWARE_BOUND" ? "LoA High" : "LoA Substantial"}
                          </span>
                        </div>

                        {/* Expandable Selective Disclosure JWT inspection */}
                        {isDisclosed && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="bg-slate-950 text-slate-200 p-2.5 rounded-lg text-[8px] font-mono space-y-2 border border-slate-900 overflow-hidden leading-normal"
                          >
                            <div className="text-indigo-400 font-bold border-b border-slate-900 pb-1 mb-1 tracking-wider uppercase">
                              eIDAS v2 SD-JWT Disclosures
                            </div>
                            <p className="text-slate-400"><span className="text-amber-500 font-bold">ALG:</span> ES256 (ECC SECP256R1)</p>
                            <p className="text-slate-400"><span className="text-amber-500 font-bold">CRV_SHA256_HASH:</span> {citizen.vectorHash?.substring(0, 32)}...</p>
                            <div className="space-y-0.5 pt-1">
                              <div className="text-slate-500">// Selective Disclosures List:</div>
                              <div className="flex justify-between text-[7px] bg-slate-900/50 px-1 py-0.5 rounded">
                                <span className="text-indigo-300">"given_name":</span>
                                <span className="text-slate-300">"{citizen.username.split(' ')[0]}"</span>
                              </div>
                              <div className="flex justify-between text-[7px] bg-slate-900/50 px-1 py-0.5 rounded">
                                <span className="text-indigo-300">"family_name":</span>
                                <span className="text-slate-300">"{citizen.username.split(' ').slice(1).join(' ')}"</span>
                              </div>
                              <div className="flex justify-between text-[7px] bg-slate-900/50 px-1 py-0.5 rounded">
                                <span className="text-indigo-300">"biometric_vector":</span>
                                <span className="text-emerald-400 font-bold">"ENCRYPTED_TOPOLOGY"</span>
                              </div>
                              <div className="flex justify-between text-[7px] bg-slate-900/50 px-1 py-0.5 rounded">
                                <span className="text-indigo-300">"issuing_authority":</span>
                                <span className="text-slate-300">"EU QTSP Trusted Issuer"</span>
                              </div>
                            </div>
                            <div className="text-slate-500 font-bold pt-1 break-all">
                              SD-JWT SignatureToken:<br />
                              <span className="text-indigo-300">{citizen.sdJwtCredential}</span>
                            </div>
                          </motion.div>
                        )}

                        <div className="flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => toggleDisclosed(citizen.enrollmentId)}
                            className="px-2 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-[9px] font-mono font-bold cursor-pointer"
                          >
                            {isDisclosed ? "Hide SD-JWT" : "Inspect SD-JWT"}
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => {
                              // map the citizen preset name into verification selector
                              let profileKey: "de_citizen" | "fr_citizen" | "it_citizen" | "custom" = "custom";
                              if (citizen.username === "Hans Müller") profileKey = "de_citizen";
                              else if (citizen.username === "Chloé Dubois") profileKey = "fr_citizen";
                              else if (citizen.username === "Matteo Rossi") profileKey = "it_citizen";
                              
                              setSelectedProfile(profileKey);
                              if (profileKey === "custom") {
                                setEnrollName(citizen.username);
                                setEnrollCountry(citizen.country);
                                setEnrollDocType(citizen.documentType);
                              }
                              setActiveTab("biometric");
                              addLog(`Loaded enrolled citizen ${citizen.username} into Biometric Match Auditor.`, "success");
                            }}
                            className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[9px] font-mono font-bold cursor-pointer"
                          >
                            Verify Citizen
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      ) : activeTab === "oidc-wallet" ? (
        <div className="space-y-4 sm:space-y-6">
          <div className="grid lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Left Column: Sandbox Configuration */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm space-y-5 text-left">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-600" />
                  Relying Party Sandbox Configuration
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Configure OIDC / OID4VP claims request metadata to conform with eIDAS 2.0 Architecture & Reference Framework (ARF).
                </p>
              </div>

              <div className="space-y-4">
                {/* Relying Party Details */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Relying Party Client ID</label>
                  <input 
                    type="text" 
                    value={oidcClientId}
                    onChange={(e) => setOidcClientId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                    disabled={oidcState !== "idle"}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Redirect URI / Callback Endpoint</label>
                  <input 
                    type="text" 
                    value={oidcRedirectUri}
                    onChange={(e) => setOidcRedirectUri(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                    disabled={oidcState !== "idle"}
                  />
                </div>

                {/* Target Citizen Wallet Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Simulated Citizen Wallet Owner</label>
                  <select 
                    value={oidcCitizenProfile}
                    onChange={(e) => {
                      setOidcCitizenProfile(e.target.value as any);
                      // Set default wallet type based on country of citizen
                      if (e.target.value === "de_citizen") setOidcWalletType("de_ausweisapp");
                      else if (e.target.value === "fr_citizen") setOidcWalletType("fr_identity");
                      else if (e.target.value === "it_citizen") setOidcWalletType("it_cie");
                      else if (e.target.value === "enrolled_citizen" && enrolledList.length > 0) {
                        setSelectedEnrolledCitizenId(enrolledList[0].enrollmentId);
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                    disabled={oidcState !== "idle"}
                  >
                    <option value="de_citizen">Hans Müller (Germany 🇩🇪 preset)</option>
                    <option value="fr_citizen">Chloé Dubois (France 🇫🇷 preset)</option>
                    <option value="it_citizen">Matteo Rossi (Italy 🇮🇹 preset)</option>
                    <option value="enrolled_citizen" disabled={enrolledList.length === 0}>
                      {enrolledList.length > 0 ? "Active Enrolled Citizen from Registry" : "No Enrolled Citizens Available"}
                    </option>
                  </select>
                </div>

                {/* If Enrolled Citizen is selected, display list */}
                {oidcCitizenProfile === "enrolled_citizen" && enrolledList.length > 0 && (
                  <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2">
                    <label className="block text-[10px] font-bold text-indigo-900 uppercase tracking-wider">Select Registered Wallet</label>
                    <select 
                      value={selectedEnrolledCitizenId}
                      onChange={(e) => setSelectedEnrolledCitizenId(e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                      disabled={oidcState !== "idle"}
                    >
                      {enrolledList.map(c => (
                        <option key={c.enrollmentId} value={c.enrollmentId}>{c.username} ({c.enrollmentId.substring(0, 8)}...)</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Wallet App Flavor */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Simulated Wallet Engine / Client App</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "eu_wallet", name: "Sovereign EU Wallet" },
                      { id: "de_ausweisapp", name: "AusweisApp2 (DE)" },
                      { id: "fr_identity", name: "France Identité" },
                      { id: "it_cie", name: "CIE ID (Italy)" }
                    ].map(w => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => setOidcWalletType(w.id as any)}
                        className={`px-3 py-2 text-left border rounded-xl text-xs transition-all ${
                          oidcWalletType === w.id 
                            ? "border-indigo-600 bg-indigo-50/50 text-indigo-950 font-bold" 
                            : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                        }`}
                        disabled={oidcState !== "idle"}
                      >
                        {w.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Requested Attributes / Claims (Minimization sandbox) */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Requested Claims Matrix</label>
                    <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 rounded">GDPR Minimization Enabled</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                    {[
                      { id: "given_name", label: "Given Name (First Name)" },
                      { id: "family_name", label: "Family Name (Last Name)" },
                      { id: "date_of_birth", label: "Date of Birth" },
                      { id: "age_over_18", label: "Age Verification (> 18 check)" },
                      { id: "nationality", label: "Nationality (Country of Origin)" },
                      { id: "unique_id", label: "Unique Identifier / eID Number" },
                      { id: "electronic_signature", label: "Qualified Electronic Signature (QES)" }
                    ].map(claim => (
                      <label key={claim.id} className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer select-none">
                        <input 
                          type="checkbox"
                          checked={oidcRequestedClaims[claim.id]}
                          onChange={() => {
                            setOidcRequestedClaims(prev => ({
                              ...prev,
                              [claim.id]: !prev[claim.id]
                            }));
                          }}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                          disabled={oidcState !== "idle"}
                        />
                        <span>{claim.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                {oidcState === "idle" ? (
                  <button
                    type="button"
                    onClick={handleGenerateOidcRequest}
                    disabled={oidcIsProcessing || Object.values(oidcRequestedClaims).filter(Boolean).length === 0}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {oidcIsProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Compiling Request...</span>
                      </>
                    ) : (
                      <>
                        <QrCode className="w-4 h-4" />
                        <span>Generate OID4VP Request & QR</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleResetOidcSimulation}
                    className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Reset Simulation Sandbox</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Interaction Flow Console */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            
            {/* Main Interactive Stage */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col min-h-[500px]">
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Smartphone className="w-4 h-4 text-indigo-600 animate-pulse" />
                  <span className="text-xs font-bold text-slate-800 font-sans">
                    {oidcState === "idle" && "Simulator Idle"}
                    {oidcState === "request_generated" && "Step 1: Out-of-Band Auth Request"}
                    {oidcState === "user_consent" && "Step 2: Wallet Selective Disclosure Consent"}
                    {oidcState === "token_verification" && "Step 3: Verification & Cryptographic Handshake"}
                    {oidcState === "verified" && "Step 4: Conformance Report & Receipts"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${oidcState === "verified" ? "bg-emerald-500 animate-pulse" : oidcState === "idle" ? "bg-slate-400" : "bg-indigo-500 animate-ping"}`}></span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">
                    {oidcState === "idle" && "Idle"}
                    {oidcState === "request_generated" && "Awaiting Scan"}
                    {oidcState === "user_consent" && "Awaiting Consent"}
                    {oidcState === "token_verification" && "Verifying Tokens"}
                    {oidcState === "verified" && "Session Success"}
                  </span>
                </div>
              </div>

              <div className="p-4 sm:p-5 lg:p-6 flex-1 flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  {oidcState === "idle" && (
                    <motion.div 
                      key="idle"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-center space-y-4 max-w-sm mx-auto"
                    >
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto border border-slate-100 text-slate-400">
                        <Smartphone className="w-8 h-8" />
                      </div>
                      <div className="space-y-1 text-center">
                        <h4 className="text-sm font-bold text-slate-800">EU Wallet Conformance Simulator</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Test Relying Party compliance with the upcoming European Union Digital Identity (EUDID) architecture. You will trigger a simulated OpenID Connect flow, exchange hardware-secured credentials, apply selective attribute consent, and analyze the resulting cryptographic proof tokens.
                        </p>
                      </div>
                      <div className="p-3.5 bg-indigo-50 border border-indigo-100/50 rounded-xl text-[11px] text-indigo-950 flex items-start gap-2.5 text-left leading-normal">
                        <Cpu className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold">Did you know?</strong> eIDAS 2.0 (under EU Regulation 2024/1183) mandates all member states to provide a Digital Identity Wallet by 2026, allowing cross-border online authentication with Level of Assurance (LoA) High.
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {oidcState === "request_generated" && (
                    <motion.div 
                      key="request_generated"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="grid md:grid-cols-12 gap-4 sm:gap-6 items-center text-left"
                    >
                      {/* Left: Interactive Scan QR Simulation */}
                      <div className="md:col-span-5 flex flex-col items-center text-center space-y-3">
                        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden group">
                          {/* Simulated QR Code */}
                          <div className="w-32 h-32 bg-white rounded-lg p-2 flex flex-col justify-between items-center relative">
                            {/* Simple block grid mock QR */}
                            <div className="grid grid-cols-4 gap-1 w-full h-full opacity-90">
                              {[...Array(16)].map((_, i) => {
                                const active = (i * 7 + 13) % 3 === 0 || i === 0 || i === 3 || i === 12 || i === 15;
                                return (
                                  <div 
                                    key={i} 
                                    className={`rounded-[2px] transition-all duration-300 ${active ? "bg-slate-900" : "bg-slate-50"}`}
                                  ></div>
                                );
                              })}
                            </div>
                            {/* Little badge in middle */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white rounded p-1 shadow-md border border-white">
                              <Fingerprint className="w-4 h-4" />
                            </div>
                          </div>
                          
                          <div className="absolute inset-0 pointer-events-none z-10">
                            {/* Scan line indicator */}
                            <div className="w-full h-0.5 bg-indigo-500 absolute top-0 left-0 animate-scan"></div>
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-400 font-medium font-sans">Scan via EUDI compliant wallet app</p>

                        <button
                          type="button"
                          onClick={handleSimulateWalletScan}
                          disabled={oidcIsProcessing}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer border-none"
                        >
                          <Smartphone className="w-3.5 h-3.5 animate-bounce" />
                          <span>Simulate App Scanning</span>
                        </button>
                      </div>

                      {/* Right: Technical Request payload parameters */}
                      <div className="md:col-span-7 space-y-4">
                        <div className="space-y-1">
                          <h4 className="text-sm font-extrabold text-slate-800">OID4VP Cross-Border Request</h4>
                          <p className="text-[11px] text-slate-500">Relying Party published a SIOPv2 auth response request mapping to a secure wallet endpoint.</p>
                        </div>

                        <div className="space-y-2 bg-slate-950 text-slate-200 p-4 rounded-xl text-[10px] font-mono leading-relaxed border border-slate-900 max-h-[220px] overflow-y-auto custom-scrollbar">
                          <div><span className="text-amber-400 font-bold">SCHEME:</span> openid-vc://</div>
                          <div><span className="text-amber-400 font-bold">CLIENT_ID:</span> {oidcClientId}</div>
                          <div><span className="text-amber-400 font-bold">REDIRECT:</span> {oidcRedirectUri}</div>
                          <div><span className="text-amber-400 font-bold">NONCE_CHALLENGE:</span> {oidcNonce}</div>
                          <div className="pt-2 text-indigo-400 font-extrabold border-t border-slate-900">PRESENTATION_DEFINITION</div>
                          <div className="text-slate-400 text-[9px] whitespace-pre-wrap">
                            {JSON.stringify({
                              id: "eudiv_presentation",
                              input_descriptors: [{
                                id: "eu_digital_identity_attestation",
                                constraints: {
                                  fields: Object.keys(oidcRequestedClaims).filter(k => oidcRequestedClaims[k]).map(k => `$.credentialSubject.${k}`)
                                }
                              }]
                            }, null, 2)}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {oidcState === "user_consent" && (
                    <motion.div 
                      key="user_consent"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="max-w-md mx-auto w-full text-left"
                    >
                      {/* Simulated Smartphone Container representing the EUDI Wallet */}
                      <div className="bg-slate-950 rounded-[2.5rem] border-[6px] border-slate-800 p-4 shadow-2xl relative overflow-hidden text-slate-200 max-w-[340px] mx-auto">
                        {/* Dynamic phone speaker notch */}
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-slate-800 h-4 w-28 rounded-b-xl z-20"></div>

                        <div className="pt-5 space-y-4">
                          {/* Wallet App Header */}
                          <div className="flex justify-between items-center px-1">
                            <span className="text-[10px] font-extrabold tracking-wider text-indigo-400 uppercase">
                              {oidcWalletType === "eu_wallet" && "Sovereign EU Wallet"}
                              {oidcWalletType === "de_ausweisapp" && "AusweisApp2 🇩🇪"}
                              {oidcWalletType === "fr_identity" && "France Identité 🇫🇷"}
                              {oidcWalletType === "it_cie" && "CIE ID Wallet 🇮🇹"}
                            </span>
                            <span className="text-[9px] font-mono text-slate-500 font-bold">eIDAS v2.4</span>
                          </div>

                          {/* Requester authentication alert */}
                          <div className="p-3 bg-indigo-950/40 border border-indigo-500/20 rounded-2xl flex items-start gap-2.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <h5 className="text-[10px] font-extrabold text-white">Trust Seal Authenticated</h5>
                              <p className="text-[9px] text-slate-400 leading-normal">
                                Relying Party <strong className="text-indigo-300 font-bold">9Xen Regulettee RP</strong> is qualified under eIDAS Annex I registry.
                              </p>
                            </div>
                          </div>

                          {/* selective disclosure list */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Select Attributes to Disclose</span>
                              <span className="text-[8px] text-indigo-300 font-mono">Art. 5 GDPR</span>
                            </div>

                            <div className="space-y-1.5 max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
                              {Object.keys(oidcRequestedClaims)
                                .filter(claim => oidcRequestedClaims[claim])
                                .map(claim => {
                                  let claimName = "";
                                  let claimValue = "";
                                  
                                  // Determine preset value
                                  let currentProfile: any = profiles.de_citizen;
                                  if (oidcCitizenProfile === "fr_citizen") currentProfile = profiles.fr_citizen;
                                  else if (oidcCitizenProfile === "it_citizen") currentProfile = profiles.it_citizen;
                                  else if (oidcCitizenProfile === "enrolled_citizen") {
                                    const found = enrolledList.find(c => c.enrollmentId === selectedEnrolledCitizenId);
                                    if (found) {
                                      currentProfile = {
                                        name: found.username,
                                        dob: "1990-05-15",
                                        country: found.country,
                                        idNum: found.enrollmentId
                                      };
                                    }
                                  }

                                  if (claim === "given_name") {
                                    claimName = "Given Name";
                                    claimValue = currentProfile.name.split(' ')[0];
                                  } else if (claim === "family_name") {
                                    claimName = "Family Name";
                                    claimValue = currentProfile.name.split(' ').slice(1).join(' ') || "Sovereign";
                                  } else if (claim === "date_of_birth") {
                                    claimName = "Date of Birth";
                                    claimValue = currentProfile.dob || "1984-09-12";
                                  } else if (claim === "age_over_18") {
                                    claimName = "Age Over 18 Verification";
                                    claimValue = "TRUE (Self-asserted with issuer attestation)";
                                  } else if (claim === "nationality") {
                                    claimName = "Nationality";
                                    claimValue = currentProfile.country || "DE";
                                  } else if (claim === "unique_id") {
                                    claimName = "Unique Citizen ID / eID";
                                    claimValue = currentProfile.idNum ? currentProfile.idNum.substring(0, 15) + "..." : "DE/20391802";
                                  } else if (claim === "electronic_signature") {
                                    claimName = "Qualified Electronic Signature";
                                    claimValue = "Hardware-Bound Signing Key active";
                                  }

                                  const disclosed = !!oidcDisclosedClaims[claim];

                                  return (
                                    <div 
                                      key={claim} 
                                      onClick={() => handleToggleDisclosedClaim(claim)}
                                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                                        disclosed 
                                          ? "border-indigo-500/50 bg-indigo-950/20" 
                                          : "border-slate-800 bg-slate-900/50 text-slate-500"
                                      }`}
                                    >
                                      <div className="space-y-0.5">
                                        <div className="text-[9px] font-bold text-slate-400">{claimName}</div>
                                        <div className={`text-[10px] font-mono font-bold ${disclosed ? "text-white" : "text-slate-600 line-through"}`}>{claimValue}</div>
                                      </div>
                                      <div className={`w-4 h-4 rounded flex items-center justify-center border ${disclosed ? "border-indigo-500 bg-indigo-600 text-white" : "border-slate-700"}`}>
                                        {disclosed && <Check className="w-3 h-3" />}
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>

                          {/* Cryptographic Proof and Hardware attestation info */}
                          <div className="space-y-1 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-[8px] font-mono text-slate-400 leading-normal">
                            <div className="text-[9px] font-bold text-indigo-400 border-b border-slate-800 pb-1 mb-1 uppercase tracking-wide">Secure Hardware Attestation</div>
                            <div>ENCLAVE_ENGINE: SE_ECC_SECP256R1</div>
                            <div>ATTESTATION_STAMP: LOCAL_TEE_ACTIVE</div>
                            <div className="truncate">HOLDER_KEY: {profiles.de_citizen.idNum}</div>
                          </div>

                          {/* Action controls inside phone screen */}
                          <div className="grid grid-cols-2 gap-2 pt-2">
                            <button
                              type="button"
                              onClick={handleResetOidcSimulation}
                              className="py-2.5 bg-slate-900 hover:bg-slate-850 text-slate-300 rounded-xl text-[10px] font-bold text-center transition-all cursor-pointer border-none"
                            >
                              Deny Auth
                            </button>
                            <button
                              type="button"
                              onClick={handleVerifyWalletToken}
                              disabled={Object.values(oidcDisclosedClaims).filter(Boolean).length === 0}
                              className="py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-bold text-center transition-all cursor-pointer border-none disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                            >
                              <Lock className="w-3 h-3 text-indigo-200" />
                              <span>Share Attributes</span>
                            </button>
                          </div>

                        </div>
                      </div>
                    </motion.div>
                  )}

                  {oidcState === "token_verification" && (
                    <motion.div 
                      key="token_verification"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="text-center space-y-4 sm:space-y-6 max-w-sm mx-auto"
                    >
                      <div className="relative w-16 h-16 mx-auto">
                        <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Cpu className="w-6 h-6 text-indigo-600 animate-pulse" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <h4 className="text-sm font-extrabold text-slate-800">Verifying eIDAS 2.0 SD-JWT Presentation</h4>
                        <p className="text-xs text-slate-500 leading-normal">
                          Verifying cryptographic issuer trust-chain, wallet proof of possession (nonce binding), and validating disclosed attribute schemas.
                        </p>
                      </div>

                      {/* Micro log step tracker during loading */}
                      <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-left font-mono text-[9px] text-slate-500 space-y-1">
                        <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                          <Check className="w-3.5 h-3.5 shrink-0" /> Establishing secure channel... OK
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                          <Check className="w-3.5 h-3.5 shrink-0" /> Check issuer signature anchor... OK
                        </div>
                        <div className="flex items-center gap-1.5 text-indigo-600 font-bold">
                          <RefreshCw className="w-3.5 h-3.5 shrink-0 animate-spin" /> Verifying client nonce and holder signature binding...
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {oidcState === "verified" && oidcVerificationDetails && (
                    <motion.div 
                      key="verified"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-5 text-left"
                    >
                      {/* Big Conformance Verified Banner */}
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3.5">
                        <div className="p-2 bg-emerald-500 text-white rounded-full shrink-0">
                          <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-extrabold text-emerald-950 flex items-center gap-1.5">
                            OIDC Attribute Validation Conformance: PASSED
                          </h4>
                          <p className="text-xs text-emerald-800/90 leading-relaxed font-medium">
                            The Relying Party has successfully verified the presentation from the EU Digital Identity Wallet. Cryptographic signatures match and the presentation strictly complies with the <strong className="font-extrabold text-emerald-950">eIDAS 2.0 ARF v1.4</strong> selective disclosure standard.
                          </p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Conformance Check List */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 flex flex-col justify-between">
                          <div>
                            <h5 className="text-[10px] font-black uppercase tracking-wider text-indigo-600 font-mono mb-2.5">eIDAS 2.0 Conformance Report</h5>
                            <div className="space-y-2 text-xs">
                              <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                <div>
                                  <div className="font-bold text-slate-800">SIOPv2 Protocol compliance</div>
                                  <div className="text-[10px] text-slate-500">{oidcEIDASConformance?.siopv2Conformance}</div>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                <div>
                                  <div className="font-bold text-slate-800">Selective Disclosure Scheme</div>
                                  <div className="text-[10px] text-slate-500">{oidcEIDASConformance?.selectiveDisclosureConformance}</div>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                <div>
                                  <div className="font-bold text-slate-800">Hardware Bind attestation</div>
                                  <div className="text-[10px] text-slate-500">{oidcEIDASConformance?.hardwareEnclaveBinding}</div>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                <div>
                                  <div className="font-bold text-slate-800">Qualified Level of Assurance</div>
                                  <div className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1 rounded block w-fit mt-0.5">
                                    {oidcEIDASConformance?.assuranceLevel}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {oidcEIDASConformance?.complianceWarnings.length > 0 && (
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[10px] text-amber-900 leading-normal flex gap-2 items-start mt-3">
                              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold block mb-0.5">Data Minimization Warning:</span>
                                {oidcEIDASConformance?.complianceWarnings[0]}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Verified Attributes Decoded */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
                          <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">Decoded Claims Payload</h5>
                          <div className="space-y-1.5 max-h-[180px] overflow-y-auto custom-scrollbar">
                            {Object.keys(oidcVerificationDetails.disclosedClaims).map(key => {
                              let label = key;
                              if (key === "given_name") label = "Given Name";
                              else if (key === "family_name") label = "Family Name";
                              else if (key === "date_of_birth") label = "Date of Birth";
                              else if (key === "age_over_18") label = "Age Verification (>18)";
                              else if (key === "nationality") label = "Nationality";
                              else if (key === "unique_id") label = "Unique ID / ID No";
                              else if (key === "electronic_signature") label = "Electronic Signature";

                              return (
                                <div key={key} className="flex justify-between items-center bg-white p-2 border border-slate-200/60 rounded-lg text-xs">
                                  <span className="font-bold text-slate-700">{label}</span>
                                  <span className="font-mono text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded text-[10px]">
                                    {oidcVerificationDetails.disclosedClaims[key] === true ? "TRUE" : oidcVerificationDetails.disclosedClaims[key]}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                          <div className="text-[9px] text-slate-400 font-mono text-center border-t border-slate-200 pt-2.5">
                            Claims cryptographically bound via ECDSA_SHA256 signature to issuer trust anchors.
                          </div>
                        </div>
                      </div>

                      {/* SD-JWT Cryptographic Details */}
                      <div className="space-y-1.5 bg-slate-950 text-slate-300 p-4 rounded-xl text-[10px] font-mono leading-relaxed border border-slate-900">
                        <div className="flex justify-between items-center text-indigo-400 font-extrabold uppercase border-b border-slate-900 pb-1.5 mb-2.5">
                          <span>Cryptographic Receipt (eIDAS v2 compliance metadata)</span>
                          <span className="text-[8px] bg-indigo-950 px-2 py-0.5 rounded text-indigo-300 font-bold">SD-JWT + RFC7515</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 bg-slate-900/40 p-2 rounded-lg border border-slate-900 mb-2 text-[9px]">
                          <div><span className="text-slate-500">SIGNATURE ALGO:</span> <span className="text-white font-bold">{oidcVerificationDetails.algorithm}</span></div>
                          <div><span className="text-slate-500">TRUST ROOT:</span> <span className="text-white font-bold">EU Qualified Trust Service Provider</span></div>
                          <div><span className="text-slate-500">NONCE BOUND:</span> <span className="text-emerald-400 font-bold">YES (Match Nonce: {oidcNonce})</span></div>
                          <div><span className="text-slate-500">HOLDER SIGNATURE:</span> <span className="text-emerald-400 font-bold">Verified (ECC Private Proof)</span></div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-amber-400 font-extrabold block">SD-JWT PRESENTATION TOKEN:</span>
                          <span className="text-[9px] text-slate-400 break-all bg-slate-950 p-2 rounded border border-slate-900 font-mono block max-h-[80px] overflow-y-auto custom-scrollbar leading-tight">
                            {oidcVerificationDetails.signatureToken}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Simulated Device Terminal Logs */}
            <div className="bg-slate-900 text-slate-300 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-3.5 text-left">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold font-mono tracking-wide text-slate-100">OIDC / OID4VP Live Attestation Logs</span>
                </div>
                <button 
                  onClick={() => setOidcSimulatedLogs([])}
                  className="text-[9px] font-mono text-slate-500 hover:text-indigo-400 uppercase tracking-wider font-bold transition-colors cursor-pointer border-none bg-transparent"
                >
                  Clear Console
                </button>
              </div>

              <div className="font-mono text-[10px] space-y-1.5 max-h-[160px] overflow-y-auto custom-scrollbar bg-slate-950 p-3.5 rounded-xl border border-slate-950/80 leading-relaxed">
                {oidcSimulatedLogs.length === 0 ? (
                  <div className="text-slate-500 italic text-center py-4">// No active validation handshakes logged yet. Start simulation above.</div>
                ) : (
                  oidcSimulatedLogs.map((log, idx) => (
                    <div key={idx} className="whitespace-pre-wrap">
                      <span className="text-indigo-400">{log.split("]")[0]}]</span>
                      <span className={`${
                        log.includes("SUCCESS") || log.includes("PASSED") || log.includes("verified!")
                          ? "text-emerald-400" 
                          : log.includes("ERROR") || log.includes("failed") 
                          ? "text-rose-400" 
                          : "text-slate-300"
                      }`}>
                        {log.substring(log.indexOf("]") + 1)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

        <OidcIntegrationDashboard
          oidcState={oidcState}
          oidcClientId={oidcClientId}
          oidcRedirectUri={oidcRedirectUri}
          oidcNonce={oidcNonce}
          oidcWalletType={oidcWalletType}
          oidcCitizenProfile={oidcCitizenProfile}
          oidcRequestedClaims={oidcRequestedClaims}
          oidcDisclosedClaims={oidcDisclosedClaims}
          oidcVerificationDetails={oidcVerificationDetails}
          oidcEIDASConformance={oidcEIDASConformance}
          onInjectError={setOidcInjectedError}
          injectedError={oidcInjectedError}
        />
      </div>
      ) : (
        /* Original Framework and Trust List tab contents */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-500" />
              Compliance Framework Status
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3.5 border border-slate-100 rounded-xl bg-slate-50">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">EUDI Wallet Integration</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Relying Party implementation for cross-border ID under eIDAS 2.0.</p>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 font-mono">
                  <AlertTriangle className="w-3.5 h-3.5" /> In Progress
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3.5 border border-slate-100 rounded-xl bg-slate-50">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Biometric Data Processing</h4>
                  <p className="text-xs text-slate-500 mt-0.5">GDPR Art. 9 explicit consent flows & biometric DPIA certified.</p>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Compliant
                </span>
              </div>

              <div className="flex justify-between items-center p-3.5 border border-slate-100 rounded-xl bg-slate-50">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">AML/KYC Directives (6AMLD)</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Sanctions screening and ultimate beneficial owner (UBO) tracing.</p>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Compliant
                </span>
              </div>

              <div className="flex justify-between items-center p-3.5 border border-rose-100 rounded-xl bg-rose-50">
                <div>
                  <h4 className="font-bold text-rose-950 text-sm">Age Verification (DSA/AV)</h4>
                  <p className="text-xs text-rose-600 mt-0.5">Strict local variations and physical age proofing protocols.</p>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 font-mono">
                  <AlertTriangle className="w-3.5 h-3.5" /> Action Req
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileKey2 className="w-5 h-5 text-emerald-500" />
              Qualified Trust Service Providers (QTSP)
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">Providers currently mapped for issuing Qualified Electronic Signatures (QES) and authenticating eIDAS 2.0 electronic identity attestations.</p>
            
            <div className="space-y-4">
              <div className="p-4 border border-slate-200 rounded-xl flex items-start gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-950 text-sm">Signicat AS</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Norway / EU Trust List Anchored</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Active</span>
                  </div>
                  <div className="mt-3 flex gap-1.5 text-[10px] font-mono">
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">eID</span>
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">QES</span>
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">KYC</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-slate-200 rounded-xl flex items-start gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-950 text-sm">Namirial S.p.A.</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Italy / EU Trust List Anchored</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Active</span>
                  </div>
                  <div className="mt-3 flex gap-1.5 text-[10px] font-mono">
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">QES</span>
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">TimeStamping</span>
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => addLog("Qualified trust anchor addition requested.", "info")}
              className="mt-6 w-full py-2.5 flex items-center justify-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50/50 rounded-xl transition-all border border-indigo-100 cursor-pointer"
            >
              <Link className="w-4 h-4" /> Add QTSP Integration
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
