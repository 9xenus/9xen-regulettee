import { fetchWithRetry } from '../lib/api-client';
import React, { useState, useEffect } from "react";
import { EasyIntegrationWizard } from './EasyIntegrationWizard';
import {
  Database,
  Globe,
  FileSpreadsheet,
  Cpu,
  Plus,
  Trash2,
  Play,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Clock,
  Settings2,
  ShieldAlert,
  Loader2,
  X,
  PlusCircle,
  HelpCircle,
  TrendingUp,
  Server,
  CloudLightning,
  Workflow,
  Key,
  Code,
  FileCode,
  Check,
  Send,
  Terminal,
  ChevronRight,
  Sparkles,
  Download,
  Copy,
  Users,
  MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNotification } from "../context/NotificationContext";

interface Integration {
  id: number;
  name: string;
  type: string;
  platform: string;
  status: "CONNECTED" | "ERROR" | "DISCONNECTED";
  settings: {
    apiUrl?: string;
    scope?: string;
    clientId?: string;
  };
  last_scanned_at: string | null;
  created_at: string;
}

interface ScanHistory {
  id: number;
  integration_id: number;
  status: "COMPLETED" | "FAILED";
  score: number;
  violations_count: number;
  details: {
    id: string;
    severity: "HIGH" | "MEDIUM" | "LOW";
    check: string;
    status: "RESOLVED" | "UNRESOLVED";
    description: string;
  }[];
  created_at: string;
}

interface ApiToken {
  id: number;
  token: string;
  name: string;
  client_system: string;
  scope: string;
  status: "ACTIVE" | "REVOKED";
  created_at: string;
  last_used_at: string | null;
}

export const IntegrationsScanHub: React.FC = () => {
  const { showToast } = useNotification();
  // Main Tab Control: 'easy_wizard' | 'connectors' | 'api_hub'
  const [mainTab, setMainTab] = useState<"easy_wizard" | "connectors" | "api_hub">("easy_wizard");

  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [scans, setScans] = useState<ScanHistory[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanningId, setScanningId] = useState<number | null>(null);
  const [scanProgress, setScanProgress] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Connection Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newForm, setNewForm] = useState({
    name: "",
    type: "CRM",
    platform: "Salesforce",
    apiUrl: "",
    clientId: "",
    apiToken: "",
    scope: "Lead Tracking & Consent Audit"
  });

  // Developer API Hub States
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(false);
  const [showAddToken, setShowAddToken] = useState(false);
  const [newTokenForm, setNewTokenForm] = useState({
    name: "",
    client_system: "Salesforce CRM",
    scope: "CRM Consent Scan"
  });
  const [latestGeneratedToken, setLatestGeneratedToken] = useState<string | null>(null);
  const [copiedTokenText, setCopiedTokenText] = useState(false);

  // Code Snippet Generator States
  const [selectedLanguage, setSelectedLanguage] = useState<"apex" | "abap" | "node" | "python" | "php" | "next">("node");
  const [selectedTokenForSnippet, setSelectedTokenForSnippet] = useState<string>("ep_live_sample_token_88ab776f33ea1");
  const [copiedSnippetText, setCopiedSnippetText] = useState(false);

  // Sandbox States
  const [sandboxToken, setSandboxToken] = useState<string>("");
  const [sandboxType, setSandboxType] = useState<"consent" | "privacy" | "retention">("consent");
  const [sandboxContent, setSandboxContent] = useState<string>("");
  const [isSandboxRunning, setIsSandboxRunning] = useState(false);
  const [sandboxResult, setSandboxResult] = useState<any>(null);
  const [sandboxError, setSandboxError] = useState<string | null>(null);

  const platformsByType: Record<string, string[]> = {
    CRM: ["Salesforce", "HubSpot", "Zoho CRM", "Custom CRM"],
    ERP: ["SAP", "Oracle NetSuite", "Microsoft Dynamics", "Odoo"],
    Website: ["WordPress", "Webflow", "Shopify", "Custom Web App", "Next.js"],
    Accounting: ["QuickBooks", "Xero", "Sage", "FreshBooks"],
    Cloud: ["AWS S3", "PostgreSQL Database", "Google Cloud Storage", "Azure Blob", "Nextcloud"],
    VCS: ["GitLab", "Bitbucket"],
    HRIS: ["Workday", "BambooHR", "Personio", "Custom HRIS"],
    IdP: ["Okta", "Azure Active Directory", "Keycloak", "Auth0"],
    Communications: ["Slack", "Microsoft Teams", "Discord", "Mattermost"],
    "AI & LLM Governance": ["Google Cloud Vertex AI", "Azure OpenAI Sentinel", "AWS Bedrock Guardrails", "Custom LLM API"],
    "SIEM & SOC": ["Datadog SIEM", "Splunk Enterprise Security", "Elastic SIEM", "Wazuh SOC"],
    "Data Clean Room": ["Snowflake", "Databricks Delta Sharing", "Google BigQuery Clean Room"],
    "Digital Identity": ["EUDIW W3C VC Gateway", "OIDC Sovereign Enclave", "eIDAS Node"],
    "FinTech & Payments": ["Stripe Financial Infrastructure", "Adyen Risk Hub", "bKash NPSB Gateway"],
    "GRC Remediation": ["ServiceNow GRC", "Jira Compliance Bridge", "Archer GRC"]
  };

  const defaultScopesByType: Record<string, string> = {
    CRM: "Lead Tracking & Consent Audit",
    ERP: "DORA Digital Resilience Logging",
    Website: "Cookie Policies & Checkout Form Encryption",
    Accounting: "Billing Document PII Scan",
    Cloud: "Public Bucket & Encryption Scan",
    VCS: "Secure Code scanning & NIS2 Dependency Audit",
    HRIS: "Employee PII Protection & GDPR Art 88 Compliance",
    IdP: "MFA & Role-Based Access Control Auditing",
    Communications: "Sovereign Channels & Leak Prevention Scan",
    "AI & LLM Governance": "EU AI Act Conformity, Prompt Injection & PII Redaction Audit",
    "SIEM & SOC": "DORA Article 19 & NIS2 Rapid Incident Statutory Notification",
    "Data Clean Room": "Zero-Copy Differential Privacy & Data Sovereignty Verification",
    "Digital Identity": "Selective Disclosure & Zero-Knowledge Age/Nationality Verification",
    "FinTech & Payments": "PCI-DSS v4.0 Zero-PAN Enclave & Settlement AML Screening",
    "GRC Remediation": "Bi-directional Statutory Audit SLA & Ticket Auto-Remediation"
  };

  const PRESET_SANDBOX_PAYLOADS = {
    consent: `<!-- Salesforce Lead Ingest Webhook Content -->
{
  "LeadSource": "Public Search Advertisements",
  "EmailOptInStatus": "AUTOMATICALLY_ACCEPTED",
  "GDPRConsentTimestamp": null,
  "CookieConsentAccepted": true,
  "LeadCountry": "Germany",
  "LeadIP": "82.165.101.44"
}`,
    privacy: `/* Custom CRM Customer Profile JSON */
{
  "client_id": "cust_829104",
  "client_phone": "+49 176 829 392",
  "unencrypted_data_elements": [
    "personal_email", "company_vat_number", "authorized_agent_surname"
  ],
  "third_party_monetization_permitted": true,
  "retention_period": "forever"
}`,
    retention: `/* ERP Asset ledger deletion query mockup */
CREATE TABLE SAP_HANA_CUSTOMER_TRANSACTION_RECORDS (
  record_id VARCHAR(50) PRIMARY KEY,
  client_id VARCHAR(50),
  cc_digits_unencrypted VARCHAR(16),
  stored_unencrypted VARCHAR(1) DEFAULT 'Y',
  -- VIOLATION: no expired_at column or automated archival procedures
  logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
  };

  // Fetch connected integration servers
  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const res = await fetchWithRetry("/api/v1/compliance/integrations");
      if (!res.ok) {
        const text = await res.text();
        console.error(`Fetch integrations error: ${res.status} ${res.statusText}`, text.slice(0, 500));
        setErrorMsg(`Server error (${res.status}): Failed to load software integrations`);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setIntegrations(data.integrations);
        setErrorMsg(null);
      } else {
        setErrorMsg(data.error || "Failed to load software integrations");
      }
    } catch (err: any) {
      console.error("Fetch integrations catch:", err);
      setErrorMsg(`Network error: ${err.message || "connecting to integrations service"}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch API Developer Tokens
  const fetchApiTokens = async () => {
    setLoadingTokens(true);
    try {
      const res = await fetchWithRetry("/api/v1/compliance/tokens");
      if (!res.ok) {
        const text = await res.text();
        console.error(`Fetch tokens error: ${res.status} ${res.statusText}`, text.slice(0, 500));
        return;
      }
      const data = await res.json();
      if (data.success) {
        const tokenList = data.tokens || [];
        setTokens(tokenList);
        if (tokenList.length > 0) {
          // Verify if previously selected token still exists in the newly fetched list
          const stillExists = tokenList.some((t: any) => t.token === selectedTokenForSnippet);
          if (!stillExists) {
            setSelectedTokenForSnippet(tokenList[0].token);
          }
          const stillSandboxExists = tokenList.some((t: any) => t.token === sandboxToken);
          if (!stillSandboxExists) {
            setSandboxToken(tokenList[0].token);
          }
        } else {
          // No tokens left in DB, reset to fallback / empty states
          setSelectedTokenForSnippet("ep_live_sample_token_88ab776f33ea1");
          setSandboxToken("");
        }
      }
    } catch (err: any) {
      console.error("Error loading developer tokens:", err);
    } finally {
      setLoadingTokens(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
    fetchApiTokens();
    // Default sandbox payload
    setSandboxContent(PRESET_SANDBOX_PAYLOADS.consent);
  }, []);

  const handleTypeChange = (type: string) => {
    const platforms = platformsByType[type] || [];
    setNewForm(prev => ({
      ...prev,
      type,
      platform: platforms[0] || "",
      scope: defaultScopesByType[type] || ""
    }));
  };

  const handleAddIntegration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.name || !newForm.apiUrl) {
      setErrorMsg("Connection Name and API Endpoint URL are required.");
      return;
    }

    try {
      const res = await fetchWithRetry("/api/v1/compliance/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newForm.name,
          type: newForm.type,
          platform: newForm.platform,
          settings: {
            apiUrl: newForm.apiUrl,
            scope: newForm.scope,
            clientId: newForm.clientId
          }
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`Successfully connected to ${newForm.platform}!`);
        setShowAddForm(false);
        setNewForm({
          name: "",
          type: "CRM",
          platform: "Salesforce",
          apiUrl: "",
          clientId: "",
          apiToken: "",
          scope: "Lead Tracking & Consent Audit"
        });
        fetchIntegrations();
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setErrorMsg(data.error || "Failed to establish integration account connection");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Connection timed out. Check endpoint schema validity.");
    }
  };

  const handleDeleteIntegration = async (id: number) => {
    if (!window.confirm("Are you sure you want to disconnect this software integration? Historical scan audits will be permanently purged.")) {
      return;
    }
    try {
      const res = await fetchWithRetry(`/api/v1/compliance/integrations/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg("Integration account disconnected.");
        if (selectedIntegration?.id === id) {
          setSelectedIntegration(null);
        }
        fetchIntegrations();
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        setErrorMsg(data.error || "Failed to disconnect integration");
      }
    } catch (err) {
      setErrorMsg("Failed to reach server. Please retry.");
    }
  };

  const handleScanIntegration = async (id: number) => {
    setScanningId(id);
    setScanProgress("Initiating Secure API Connection...");
    
    const stages = [
      "Securing transport-layer tunnel...",
      "Querying endpoints and directory schemas...",
      "Executing sovereign Lexis-Rules matching...",
      "Anonymizing findings & compiling results..."
    ];

    for (let i = 0; i < stages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setScanProgress(stages[i]);
    }

    try {
      const res = await fetchWithRetry(`/api/v1/compliance/integrations/${id}/scan`, {
        method: "POST"
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`Audit scanning completed for ${selectedIntegration?.name || "the software integration"}.`);
        
        const updated = integrations.map(item => {
          if (item.id === id) {
            return { ...item, last_scanned_at: data.last_scanned_at };
          }
          return item;
        });
        setIntegrations(updated);

        if (selectedIntegration && selectedIntegration.id === id) {
          setSelectedIntegration({
            ...selectedIntegration,
            last_scanned_at: data.last_scanned_at
          });
        }

        setScans(data.scans || []);
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setErrorMsg(data.error || "Compliance scanning failed");
      }
    } catch (err) {
      setErrorMsg("Network error during compliance audit scanning");
    } finally {
      setScanningId(null);
      setScanProgress("");
    }
  };

  const handleSelectIntegration = async (integration: Integration) => {
    setSelectedIntegration(integration);
    try {
      const res = await fetchWithRetry(`/api/v1/compliance/integrations/${integration.id}/scans`);
      const data = await res.json();
      if (res.ok && data.success) {
        setScans(data.scans || []);
      } else {
        setScans([]);
      }
    } catch (err) {
      setScans([]);
    }
  };

  // Generate API developer token
  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTokenForm.name) return;

    try {
      const res = await fetchWithRetry("/api/v1/compliance/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTokenForm)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLatestGeneratedToken(data.token);
        setShowAddToken(false);
        setNewTokenForm({ name: "", client_system: "Salesforce CRM", scope: "CRM Consent Scan" });
        fetchApiTokens();
      } else {
        showToast(data.error || "Failed to generate token", 'error');
      }
    } catch (err) {
      console.error(err);
      showToast("Error generating api token", 'error');
    }
  };

  // Revoke API developer token
  const handleRevokeToken = async (id: number) => {
    if (!window.confirm("Are you sure you want to revoke this API token? Any active CRM or ERP system utilizing it will immediately fail scanning requests.")) {
      return;
    }
    try {
      const res = await fetchWithRetry(`/api/v1/compliance/tokens/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchApiTokens();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger test-scan in Sandbox
  const handleRunSandboxTest = async () => {
    if (!sandboxToken) {
      setSandboxError("Please select or generate an active API token first.");
      return;
    }
    if (!sandboxContent.trim()) {
      setSandboxError("Input content is empty.");
      return;
    }

    setIsSandboxRunning(true);
    setSandboxError(null);
    setSandboxResult(null);

    try {
      const res = await fetchWithRetry("/api/v1/compliance/tokens/test-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: sandboxToken,
          content: sandboxContent,
          type: sandboxType
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSandboxResult(data);
      } else {
        setSandboxError(data.error || "Compliance test scan rejected.");
      }
    } catch (err) {
      setSandboxError("Failed to reach EuroPrivacy scanning endpoint. Verify token or network.");
    } finally {
      setIsSandboxRunning(false);
    }
  };

  const handlePresetChange = (type: "consent" | "privacy" | "retention") => {
    setSandboxType(type);
    setSandboxContent(PRESET_SANDBOX_PAYLOADS[type]);
    setSandboxResult(null);
    setSandboxError(null);
  };

  // Copy helpers
  const copyToClipboard = (text: string, type: "token" | "snippet") => {
    navigator.clipboard.writeText(text);
    if (type === "token") {
      setCopiedTokenText(true);
      setTimeout(() => setCopiedTokenText(false), 2500);
    } else {
      setCopiedSnippetText(true);
      setTimeout(() => setCopiedSnippetText(false), 2500);
    }
  };

  // Icon selector
  const getIconForType = (type: string) => {
    switch (type.toUpperCase()) {
      case "CRM":
        return <Cpu className="w-5 h-5 text-sky-500" />;
      case "ERP":
        return <Database className="w-5 h-5 text-indigo-500" />;
      case "WEBSITE":
        return <Globe className="w-5 h-5 text-emerald-500" />;
      case "ACCOUNTING":
        return <FileSpreadsheet className="w-5 h-5 text-amber-500" />;
      case "VCS":
        return <Code className="w-5 h-5 text-purple-500" />;
      case "HRIS":
        return <Users className="w-5 h-5 text-emerald-600" />;
      case "IDP":
        return <Key className="w-5 h-5 text-blue-500" />;
      case "COMMUNICATIONS":
        return <MessageSquare className="w-5 h-5 text-pink-500" />;
      default:
        return <Server className="w-5 h-5 text-rose-500" />;
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev.toUpperCase()) {
      case "HIGH":
      case "CRITICAL":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "MEDIUM":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
    }
  };

  // Generate realistic code snippet content
  const getCodeSnippet = () => {
    const tokenVal = selectedTokenForSnippet || "YOUR_API_TOKEN_HERE";
    switch (selectedLanguage) {
      case "apex":
        return `/*
 * EuroPrivacy Scanner Integration: Salesforce Apex Trigger Handler
 * Trigger this handler on Lead creation to identify and flag consent violations automatically.
 */
public class EuroPrivacyLeadHandler {
    
    @future(callout=true)
    public static void scanLeadConsent(Set<Id> leadIds) {
        List<Lead> leads = [SELECT Id, FirstName, LastName, Email, Country, LeadSource FROM Lead WHERE Id IN :leadIds];
        for (Lead ld : leads) {
            String payload = JSON.serialize(ld);
            
            HttpRequest req = new HttpRequest();
            req.setEndpoint('https://api.europrivacy-compliance.eu/v1/embed-scan');
            req.setMethod('POST');
            req.setHeader('Content-Type', 'application/json');
            req.setHeader('Authorization', 'Bearer ${tokenVal}');
            req.setBody('{"type": "consent", "content": "' + EncodingUtil.urlEncode(payload, 'UTF-8') + '"}');
            
            Http http = new Http();
            try {
                HttpResponse res = http.send(req);
                if (res.getStatusCode() == 200) {
                    Map<String, Object> results = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
                    Map<String, Object> report = (Map<String, Object>) results.get('compliance_report');
                    Integer score = (Integer) report.get('complianceScore');
                    
                    // Flag lead in Salesforce if compliance score falls below threshold
                    if (score < 80) {
                        ld.Description = 'Warning: GDPR Risk Detected by EuroPrivacy Scanner. Compliance Score: ' + score + '%\\n' + report.get('summary');
                        ld.Rating = 'Cold'; // Flag as risk
                    }
                    update ld;
                }
            } catch(Exception e) {
                System.debug('EuroPrivacy connection failed: ' + e.getMessage());
            }
        }
    }
}`;
      case "abap":
        return `*----------------------------------------------------------------------*
* EuroPrivacy Scanner Integration: SAP ABAP Data Minimization Check
* Executes a statutory audit scan on customer profiles prior to archiving.
*----------------------------------------------------------------------*
REPORT z_europrivacy_retention_audit.

PARAMETERS: p_cust TYPE kunnr OBLIGATORY.

START-OF-SELECTION.
  DATA: lv_payload TYPE string,
        lo_client  TYPE REF TO if_http_client,
        lv_code    TYPE i,
        lv_resp    TYPE string.

  " 1. Retrieve customer metadata
  SELECT SINGLE name1, ort01, land1 FROM kna1 INTO (@DATA(lv_name), @DATA(lv_city), @DATA(lv_country)) WHERE kunnr = @p_cust.
  
  lv_payload = |\{ "customer_id": "{ p_cust }", "city": "{ lv_city }", "country": "{ lv_country }" \}|.

  " 2. Establish connection to EuroPrivacy Hub
  cl_http_client=>create_by_url(
    EXPORTING
      url    = 'https://api.europrivacy-compliance.eu/v1/embed-scan'
    IMPORTING
      client = lo_client ).

  lo_client->request->set_method( 'POST' ).
  lo_client->request->set_header_field( name = 'Content-Type' value = 'application/json' ).
  lo_client->request->set_header_field( name = 'Authorization' value = 'Bearer ${tokenVal}' ).
  
  " 3. Embed scanned content
  lo_client->request->set_cdata( |\{ "type": "retention", "content": "{ lv_payload }" \}| ).

  lo_client->send( EXCEPTIONS OTHERS = 1 ).
  IF sy-subrc = 0.
    lo_client->receive( EXCEPTIONS OTHERS = 1 ).
    IF sy-subrc = 0.
      lo_client->response->get_status( IMPORTING code = lv_code ).
      lv_resp = lo_client->response->get_cdata( ).
      
      WRITE: / 'Scan HTTP Status:', lv_code.
      WRITE: / 'Scan Audit Verdict:', lv_resp.
    ENDIF;
  ENDIF.
  lo_client->close( ).`;
      case "node":
        return `// EuroPrivacy Embed API - Node.js SDK / Axios Integration
// Seamlessly scan CRM/ERP profiles dynamically from custom services
const axios = require('axios');

async function auditExternalRecord(recordType, recordData) {
  const endpoint = 'https://api.europrivacy-compliance.eu/v1/embed-scan';
  const apiToken = '${tokenVal}';

  try {
    const response = await axios.post(endpoint, {
      type: recordType, // 'consent' | 'privacy' | 'retention'
      content: JSON.stringify(recordData)
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${apiToken}\`
      }
    });

    if (response.data.success) {
      const report = response.data.compliance_report;
      console.log(\`[EuroPrivacy] Scan Completed. Compliance Score: \${report.complianceScore}%\`);
      console.log(\`Summary: \${report.summary}\`);
      
      if (report.complianceScore < 80) {
        console.warn(\`⚠️ High Risk: \${report.violations.length} statutory violations flagged.\`);
      }
      return report;
    }
  } catch (err) {
    console.error('EuroPrivacy client connection failed:', err.response?.data || err.message);
  }
}`;
      case "python":
        return `# EuroPrivacy Embed API - Python requests implementation
# Designed to audit user records inside CRM pipelines automatically
import requests
import json

def audit_crm_record(record_type, record_payload):
    endpoint = "https://api.europrivacy-compliance.eu/v1/embed-scan"
    token = "${tokenVal}"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
    
    data = {
        "type": record_type, # 'consent', 'privacy', or 'retention'
        "content": json.dumps(record_payload)
    }
    
    try:
        response = requests.post(endpoint, json=data, headers=headers)
        if response.status_code == 200:
            result = response.json()
            report = result.get("compliance_report", {})
            print(f"[EuroPrivacy] Grade Score: {report.get('complianceScore')}%")
            print(f"Summary: {report.get('summary')}")
            return report
        else:
            print(f"Audit failed. Status: {response.status_code}, Msg: {response.text}")
    except Exception as e:
        print(f"Connection to EuroPrivacy scan gateway failed: {e}")`;
      case "php":
        return `<?php
/**
 * EuroPrivacy Scanner - PHP Laravel / Guzzle CRM Integration
 * Ensures contact forms pass data minimization audits in real-time.
 */

use Illuminate\\Support\\Facades\\Http;

function auditPhpRecord(string $type, array $recordData) {
    $endpoint = 'https://api.europrivacy-compliance.eu/v1/embed-scan';
    $apiToken = '${tokenVal}';

    try {
        $response = Http::withHeaders([
            'Authorization' => "Bearer $apiToken",
            'Content-Type' => 'application/json'
        ])->post($endpoint, [
            'type' => $type,
            'content' => json_encode($recordData)
        ]);

        if ($response->successful()) {
            $data = $response->json();
            $report = $data['compliance_report'];
            
            Log::info("EuroPrivacy verified record compliance with score: " . $report['complianceScore'] . "%");
            return $report;
        }
    } catch (\\Exception $e) {
        Log::error("Failed to connect to EuroPrivacy scan platform: " . $e->getMessage());
    }
    return null;
}`;
      case "next":
        return `// Next.js App Router API Route Handler (app/api/audit/route.ts)
// Dynamically verify consent, privacy, or retention compliance of form or CRM data
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const endpoint = "https://api.europrivacy-compliance.eu/v1/embed-scan";
  const apiToken = "${tokenVal}";

  try {
    const body = await req.json();
    const { type, content } = body; // type: 'consent' | 'privacy' | 'retention'

    if (!content) {
      return NextResponse.json({ error: "Missing content payload" }, { status: 400 });
    }

    // Call the EuroPrivacy Compliance Gateway
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": \`Bearer \${apiToken}\`,
      },
      body: JSON.stringify({
        type: type || "consent",
        content: typeof content === "string" ? content : JSON.stringify(content),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: \`EuroPrivacy Gateway rejected scan: \${response.statusText}\`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    if (data.success) {
      const report = data.compliance_report;
      
      // Perform automated actions based on the compliance score
      const complianceScore = report.complianceScore;
      const isCompliant = complianceScore >= 80;

      return NextResponse.json({
        success: true,
        isCompliant,
        complianceScore,
        summary: report.summary,
        violations: report.violations || [],
        scannedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ error: "Failed to generate compliance report" }, { status: 500 });
  } catch (error: any) {
    console.error("[Next.js Integration Error]:", error);
    return NextResponse.json(
      { error: "Internal Server Error during compliance scan", message: error.message },
      { status: 500 }
    );
  }
}`;
      default:
        return "";
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Upper Module header block */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-md text-left flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>
        <div>
          <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-md uppercase">
            Platform Integrations Engine
          </span>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight mt-2 flex items-center gap-2">
            <Workflow className="w-6 h-6 text-indigo-400" />
            <span>Enterprise Integration Hub</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Audit connected third-party systems or embed EuroPrivacy compliance scanning directly into external Salesforce, HubSpot, SAP, or proprietary software architectures via API.
          </p>
        </div>

        {/* Action button inside header */}
        {mainTab === "connectors" && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer shrink-0"
          >
            {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{showAddForm ? "Cancel Connection" : "Add Live Connection"}</span>
          </button>
        )}
      </div>

      {/* Main Mode Toggle Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setMainTab("easy_wizard")}
          className={`px-5 py-3.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            mainTab === "easy_wizard"
              ? "border-indigo-600 text-indigo-700 font-extrabold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400/20" />
          <span>1-Click Easy Connect Wizard</span>
          <span className="bg-indigo-100 text-indigo-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">
            Recommended
          </span>
        </button>

        <button
          onClick={() => setMainTab("connectors")}
          className={`px-5 py-3.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            mainTab === "connectors"
              ? "border-indigo-600 text-indigo-700 font-extrabold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Connected Software Accounts ({integrations.length})</span>
        </button>

        <button
          onClick={() => {
            setMainTab("api_hub");
            setLatestGeneratedToken(null);
          }}
          className={`px-5 py-3.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            mainTab === "api_hub"
              ? "border-indigo-600 text-indigo-700 font-extrabold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Key className="w-4 h-4 text-amber-500 animate-pulse" />
          <span>Developer API &amp; Embed Hub</span>
          <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">
            Sovereign
          </span>
        </button>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs flex items-center gap-2 text-left">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs flex items-center gap-2 text-left">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* RENDER TAB 1: Easy Integration Wizard */}
      {mainTab === "easy_wizard" && <EasyIntegrationWizard />}

      {/* RENDER TAB 2: Connected accounts & scans */}
      {mainTab === "connectors" && (
        <div className="space-y-4 sm:space-y-6">
          {/* Add Connection Form */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden bg-slate-50 border border-slate-200 rounded-xl p-5 text-left"
              >
                <form onSubmit={handleAddIntegration} className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <PlusCircle className="w-4.5 h-4.5 text-indigo-600" />
                    Connect New Third-Party System
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">SYSTEM CATEGORY</label>
                      <select
                        value={newForm.type}
                        onChange={(e) => handleTypeChange(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      >
                        <option value="CRM">CRM (Lead & Customers)</option>
                        <option value="ERP">ERP (Operations & Ledgers)</option>
                        <option value="Website">Website / CMS (Web App)</option>
                        <option value="Accounting">Accounting & Financials</option>
                        <option value="Cloud">Cloud Infra & Databases</option>
                        <option value="VCS">Version Control (GitLab / Bitbucket)</option>
                        <option value="HRIS">HRIS & Employee Directories</option>
                        <option value="IdP">IdP (Identity Providers & SSO)</option>
                        <option value="Communications">Communications & Chat</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">PLATFORM BRAND</label>
                      <select
                        value={newForm.platform}
                        onChange={(e) => setNewForm(prev => ({ ...prev, platform: e.target.value }))}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      >
                        {(platformsByType[newForm.type] || []).map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">CONNECTION NAME</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., WordPress Main Store, Production CRM"
                        value={newForm.name}
                        onChange={(e) => setNewForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">API GATEWAY ENDPOINT / HOST URL</label>
                      <input
                        type="url"
                        required
                        placeholder="https://api.yoursoftware.com/v1"
                        value={newForm.apiUrl}
                        onChange={(e) => setNewForm(prev => ({ ...prev, apiUrl: e.target.value }))}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">COMPLIANCE SCANNING SCOPE</label>
                      <select
                        value={newForm.scope}
                        onChange={(e) => setNewForm(prev => ({ ...prev, scope: e.target.value }))}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      >
                        <option value="Lead Tracking & Consent Audit">GDPR Consent & Leads Audit</option>
                        <option value="DORA Digital Resilience Logging">DORA & NIS2 Digital Resilience Scan</option>
                        <option value="Cookie Policies & Checkout Form Encryption">Cookie Banner & Checkout Encryption Audit</option>
                        <option value="Billing Document PII Scan">Invoice & Tax Document PII Scrub</option>
                        <option value="Public Bucket & Encryption Scan">Cloud Storage Public Bucket Shield</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">CLIENT ID / ACCESS KEY ID (OPTIONAL)</label>
                      <input
                        type="text"
                        placeholder="e.g. cli_098a12b3"
                        value={newForm.clientId}
                        onChange={(e) => setNewForm(prev => ({ ...prev, clientId: e.target.value }))}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">SECRET KEY / JWT BEARER TOKEN (OPTIONAL)</label>
                      <input
                        type="password"
                        placeholder="••••••••••••••••••••••••••••"
                        value={newForm.apiToken}
                        onChange={(e) => setNewForm(prev => ({ ...prev, apiToken: e.target.value }))}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-3.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify & Link Account</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Connected Grid Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            
            {/* Left Column: Systems list */}
            <div className="lg:col-span-1 space-y-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Connected Software Assets</span>
                {loading && <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin" />}
              </div>

              {integrations.length === 0 ? (
                <div className="p-4 sm:p-5 lg:p-6 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50 space-y-2">
                  <CloudLightning className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">No software integrations found</p>
                  <p className="text-[11px] text-slate-400">Click Add Connection to configure Salesforce, SAP, QuickBooks, WordPress, and more.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1 text-left">
                  {integrations.map((item) => {
                    const isSelected = selectedIntegration?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectIntegration(item)}
                        className={`p-3.5 border rounded-xl text-left transition-all cursor-pointer relative group flex items-start gap-3 ${isSelected ? "border-indigo-600 bg-indigo-50/40 shadow-sm" : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50"}`}
                      >
                        <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-sm shrink-0">
                          {getIconForType(item.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-xs font-bold text-slate-800 truncate">{item.name}</h4>
                            <span className="text-[9px] bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded font-mono uppercase shrink-0">
                              {item.platform}
                            </span>
                          </div>
                          
                          <p className="text-[10px] text-slate-400 truncate font-mono">
                            {item.settings?.apiUrl || "https://api.gateway.internal"}
                          </p>

                          <div className="flex items-center justify-between text-[10px] pt-1">
                            <span className="flex items-center gap-1 text-slate-400">
                              <Clock className="w-3 h-3" />
                              <span>
                                {item.last_scanned_at ? new Date(item.last_scanned_at).toLocaleDateString() : "Never Scanned"}
                              </span>
                            </span>
                            
                            <span className={`w-2 h-2 rounded-full ${item.status === "CONNECTED" ? "bg-emerald-500" : "bg-rose-500"}`} title={item.status}></span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteIntegration(item.id);
                          }}
                          className="absolute right-2 top-2 p-1 text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition rounded-md hover:bg-rose-50"
                          title="Disconnect System"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Columns: Scan dashboard */}
            <div className="lg:col-span-2">
              {selectedIntegration ? (
                <div className="border border-slate-200 rounded-xl overflow-x-auto bg-slate-50/30 flex flex-col min-h-[380px] text-left">
                  
                  {/* Selected Title Bar */}
                  <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
                        {getIconForType(selectedIntegration.type)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          {selectedIntegration.name}
                          <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">
                            {selectedIntegration.type}
                          </span>
                        </h4>
                        <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
                          Scope: {selectedIntegration.settings?.scope || "Full Statutory Compliance"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleScanIntegration(selectedIntegration.id)}
                        disabled={scanningId !== null}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        {scanningId === selectedIntegration.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Play className="w-3.5 h-3.5" />
                        )}
                        <span>{scanningId === selectedIntegration.id ? "Auditing..." : "Trigger Audit Scan"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Real-time Scan Progress Bar */}
                  {scanningId === selectedIntegration.id && (
                    <div className="p-4 bg-indigo-950 text-indigo-200 space-y-2 border-b border-indigo-900">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold flex items-center gap-1.5">
                          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                          <span>{scanProgress}</span>
                        </span>
                        <span className="font-mono text-[10px] text-indigo-400">Scan Audit in Progress...</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1 rounded overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded" style={{ width: "80%" }}></div>
                      </div>
                    </div>
                  )}

                  {/* Details Content */}
                  <div className="p-4 flex-1 space-y-4 max-h-[450px] overflow-y-auto">
                    
                    {/* Score and stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Compliance Grade</span>
                        <div className="flex items-baseline justify-between">
                          <span className="text-2xl font-extrabold text-slate-900">
                            {scans[0] ? `${scans[0].score}%` : "—"}
                          </span>
                          {scans[0] && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${scans[0].score >= 90 ? "bg-emerald-50 text-emerald-700" : scans[0].score >= 75 ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"}`}>
                              {scans[0].score >= 90 ? "A+ High Trust" : scans[0].score >= 75 ? "B Medium Risk" : "C- Non-Compliant"}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Active Violations</span>
                        <div className="flex items-baseline justify-between">
                          <span className="text-2xl font-extrabold text-slate-900">
                            {scans[0] ? scans[0].violations_count : "0"}
                          </span>
                          {scans[0] && scans[0].violations_count > 0 ? (
                            <span className="text-[9px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3" /> Action Needed
                            </span>
                          ) : (
                            <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Last Audited</span>
                        <div className="flex items-baseline justify-between">
                          <span className="text-[11px] font-bold text-slate-700 mt-1.5 truncate">
                            {selectedIntegration.last_scanned_at ? new Date(selectedIntegration.last_scanned_at).toLocaleString() : "Never"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Scan Findings / Violations */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                        <span>AUDIT ANALYSIS FINDINGS</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {scans[0]?.details?.length || 0} checks completed
                        </span>
                      </div>

                      {!scans[0] ? (
                        <div className="p-5 sm:p-6 lg:p-8 text-center bg-white border border-slate-200 rounded-xl space-y-2">
                          <HelpCircle className="w-8 h-8 text-slate-300 mx-auto" />
                          <p className="text-xs font-bold text-slate-600">No audit scan results available</p>
                          <p className="text-[10.5px] text-slate-400">Trigger an audit scan above to query API schema, database tables, or cookies.</p>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {scans[0].details.map((finding) => (
                            <div key={finding.id} className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 flex flex-col md:flex-row md:items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className={`text-[8.5px] font-extrabold uppercase px-1.5 py-0.5 border rounded-full font-mono ${getSeverityBadge(finding.severity)}`}>
                                    {finding.severity}
                                  </span>
                                  <h5 className="text-xs font-bold text-slate-800">{finding.check}</h5>
                                </div>
                                <p className="text-[11px] text-slate-500 leading-relaxed font-sans">{finding.description}</p>
                              </div>

                              <div className="shrink-0 flex items-center">
                                {finding.status === "RESOLVED" ? (
                                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Compliant
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <AlertTriangle className="w-3.5 h-3.5" /> Action Req
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 text-center bg-slate-50/50 flex flex-col items-center justify-center space-y-3 min-h-[380px]">
                  <Settings2 className="w-10 h-10 text-slate-300" />
                  <h4 className="text-sm font-bold text-slate-600">Select software connector to review</h4>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Connect external accounts or click any linked system in the left pane to analyze API bindings, previous scan records, and legal audit findings.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* RENDER TAB 2: Developer API Hub & Snippet Generator */}
      {mainTab === "api_hub" && (
        <div className="space-y-6 text-left">
          
          {/* Top API Banner / Explanation */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <Key className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
            <div className="text-xs space-y-1">
              <span className="font-extrabold text-amber-800 block">Sovereign Embed API Mechanism</span>
              <p className="text-slate-700 leading-relaxed">
                Empower your software teams to embed EuroPrivacy scanners into custom in-house portals, Customer Relationship Management (CRM) tools like Salesforce, or Enterprise Resource Planning (ERP) databases like SAP. Requests signed with your API developer token run live policy evaluations against GDPR frameworks.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            
            {/* Left Side: Tokens Manager & Create Form (5 cols) */}
            <div className="lg:col-span-5 space-y-4 sm:space-y-6">
              
              {/* Token listing */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-indigo-500" />
                    <span>Compliance API Tokens</span>
                  </h3>
                  <button
                    onClick={() => setShowAddToken(!showAddToken)}
                    className="p-1 hover:bg-slate-100 rounded text-indigo-600 hover:text-indigo-800 font-bold text-xs flex items-center gap-1"
                  >
                    {showAddToken ? <X className="w-3.5 h-3.5" /> : <PlusCircle className="w-4 h-4" />}
                    <span>{showAddToken ? "Close" : "Generate Token"}</span>
                  </button>
                </div>

                {/* Show newly generated token prompt immediately on creation */}
                {latestGeneratedToken && (
                  <div className="p-3 bg-indigo-900 text-white rounded-xl space-y-2">
                    <span className="text-[10px] font-black uppercase text-indigo-300 block tracking-widest">
                      Token Generated Successfully!
                    </span>
                    <p className="text-[11px] leading-relaxed text-indigo-100">
                      Copy this secret immediately. It will not be shown again for security.
                    </p>
                    <div className="bg-slate-950 p-2 rounded-lg font-mono text-xs flex justify-between items-center text-emerald-400 select-all overflow-x-auto">
                      <span className="truncate">{latestGeneratedToken}</span>
                      <button
                        onClick={() => copyToClipboard(latestGeneratedToken, "token")}
                        className="p-1 bg-slate-900 text-white rounded hover:bg-slate-800 shrink-0 ml-2"
                        title="Copy Token Code"
                      >
                        {copiedTokenText ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Add Token Form */}
                {showAddToken && (
                  <form onSubmit={handleCreateToken} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-slate-800">New Token Parameters</h4>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 block uppercase">Token Identifier Label</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Production ERP integration"
                        value={newTokenForm.name}
                        onChange={(e) => setNewTokenForm(p => ({ ...p, name: e.target.value }))}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 block uppercase">Client Software</label>
                        <select
                          value={newTokenForm.client_system}
                          onChange={(e) => setNewTokenForm(p => ({ ...p, client_system: e.target.value }))}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-700"
                        >
                          <option value="Salesforce CRM">Salesforce</option>
                          <option value="HubSpot CRM">HubSpot</option>
                          <option value="SAP S/4HANA">SAP ERP</option>
                          <option value="Oracle NetSuite">NetSuite ERP</option>
                          <option value="Custom Web App">Custom Web App</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 block uppercase">Scanning Scope</label>
                        <select
                          value={newTokenForm.scope}
                          onChange={(e) => setNewTokenForm(p => ({ ...p, scope: e.target.value }))}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-700"
                        >
                          <option value="CRM Consent Scan">CRM Consent Scan</option>
                          <option value="ERP Minimization Audit">ERP Minimization</option>
                          <option value="Full Compliance">Full Statutory</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs flex justify-center items-center gap-1 cursor-pointer shadow"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>Issue Secure Access Key</span>
                    </button>
                  </form>
                )}

                {/* Tokens list */}
                <div className="space-y-2">
                  {loadingTokens ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                    </div>
                  ) : tokens.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">No active API keys found. Generate one to initiate developer embeds.</p>
                  ) : (
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {tokens.map(tk => (
                        <div key={tk.id} className="p-3 border border-slate-200 rounded-xl hover:border-slate-300 bg-slate-50/50 flex items-start justify-between gap-3 relative group">
                          <div className="min-w-0 space-y-1 text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-slate-800 truncate block">{tk.name}</span>
                              <span className="text-[9px] bg-indigo-100 text-indigo-700 font-bold px-1 rounded uppercase font-mono">
                                {tk.client_system}
                              </span>
                            </div>
                            <p className="font-mono text-[10px] text-indigo-600 select-all font-semibold truncate max-w-xs bg-white border border-slate-100 px-1.5 py-0.5 rounded shadow-sm">
                              {tk.token.substring(0, 16)}••••••••
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-1">
                              <span>Scope: <b className="text-slate-600">{tk.scope}</b></span>
                              <span>•</span>
                              <span>Used: <b>{tk.last_used_at ? new Date(tk.last_used_at).toLocaleDateString() : "Never"}</b></span>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleRevokeToken(tk.id)}
                            className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition shrink-0"
                            title="Revoke Token"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* CRM / ERP Scanner Embed Code generator widget */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 text-left">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                  <Code className="w-4 h-4 text-indigo-500" />
                  <span>SDK & Snippet Injector</span>
                </h3>

                <p className="text-xs text-slate-500">
                  Select your system architecture language to automatically inject the EuroPrivacy policy scanner.
                </p>

                {/* Scope selector */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">CHOOSE API TOKEN SOURCE</label>
                    <select
                      value={selectedTokenForSnippet}
                      onChange={(e) => setSelectedTokenForSnippet(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-700"
                    >
                      <option value="ep_live_sample_token_88ab776f33ea1">ep_live_sample_token_88ab776f33ea1 (Demo Mock Key)</option>
                      {tokens.map(tk => (
                        <option key={tk.id} value={tk.token}>{tk.name} ({tk.token.substring(0, 12)}...)</option>
                      ))}
                    </select>
                  </div>

                  {/* Language Selector Tabs */}
                  <div className="flex flex-wrap bg-slate-100 p-0.5 rounded-lg text-xs">
                    {(["node", "python", "php", "apex", "abap", "next"] as const).map(lang => (
                      <button
                        key={lang}
                        onClick={() => setSelectedLanguage(lang)}
                        className={`px-2 py-1 rounded font-bold capitalize flex-1 text-center transition-all ${
                          selectedLanguage === lang 
                            ? "bg-white text-indigo-700 shadow" 
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        {lang === "apex" ? "Salesforce" : lang === "abap" ? "SAP ERP" : lang === "node" ? "Node.js" : lang === "next" ? "Next.js" : lang}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

            </div>

            {/* Right Side: IDE Code Viewer & Sandbox Live Playground (7 cols) */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6">
              
              {/* Snippet Output Viewer */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col text-left space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                      <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                      <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest pl-2">
                      snippet_embed_{selectedLanguage}.{selectedLanguage === "apex" ? "cls" : selectedLanguage === "abap" ? "abap" : selectedLanguage === "python" ? "py" : selectedLanguage === "next" ? "ts" : "js"}
                    </span>
                  </div>

                  <button
                    onClick={() => copyToClipboard(getCodeSnippet(), "snippet")}
                    className="text-[10px] font-bold text-slate-300 hover:text-white bg-slate-800 border border-slate-700 px-2.5 py-1 rounded flex items-center gap-1 transition"
                  >
                    {copiedSnippetText ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Snippet Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="p-3 bg-slate-950 font-mono text-xs text-indigo-200 rounded-lg overflow-x-auto max-h-[300px] leading-relaxed select-all">
                  <code>{getCodeSnippet()}</code>
                </pre>
              </div>

              {/* Real-time Sandbox Playground */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-emerald-500" />
                      <span>API Live Embedding Sandbox</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Submit live CRM data payloads with your issued tokens to test model matching mechanics.
                    </p>
                  </div>

                  {/* Presets */}
                  <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg">
                    {(["consent", "privacy", "retention"] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => handlePresetChange(type)}
                        className={`text-[9px] font-black px-2 py-1 rounded capitalize ${
                          sandboxType === type 
                            ? "bg-indigo-600 text-white shadow-sm" 
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        {type === "consent" ? "CRM Leads" : type === "privacy" ? "Customer JSON" : "ERP Records"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Token Selector & Trigger block */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  
                  {/* Left Column Input */}
                  <div className="md:col-span-7 space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 block uppercase">ACTIVE RUNNING TOKEN</label>
                      <select
                        value={sandboxToken}
                        onChange={(e) => setSandboxToken(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
                      >
                        <option value="">-- Choose active token --</option>
                        {tokens.map(tk => (
                          <option key={tk.id} value={tk.token}>{tk.name} ({tk.token.substring(0, 15)}...)</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 block uppercase">SANDBOX DATA PAYLOAD</label>
                      <textarea
                        value={sandboxContent}
                        onChange={(e) => setSandboxContent(e.target.value)}
                        className="w-full h-44 p-3 border border-slate-200 rounded-lg font-mono text-[11px] text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                        placeholder="Paste document text or JSON records here to trigger test api call..."
                      />
                    </div>

                    <button
                      onClick={handleRunSandboxTest}
                      disabled={isSandboxRunning}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-700 text-white font-bold rounded-lg text-xs flex justify-center items-center gap-1.5 shadow transition cursor-pointer"
                    >
                      {isSandboxRunning ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Sending Token Authorization Header...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Execute Sandbox API Request</span>
                        </>
                      )}
                    </button>
                    {sandboxError && <p className="text-[11px] text-rose-600 font-semibold">{sandboxError}</p>}
                  </div>

                  {/* Right Column Output IDE Terminal */}
                  <div className="md:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col text-xs min-h-[220px]">
                    <div className="border-b border-slate-800 pb-2 mb-2 flex items-center justify-between">
                      <span className="text-[9px] font-mono text-slate-500 uppercase">Gateway JSON Response Log</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    </div>

                    <div className="flex-1 overflow-y-auto max-h-56 pr-1 text-left">
                      {!sandboxResult && !isSandboxRunning && (
                        <p className="text-[10px] text-slate-500 font-mono italic">Awaiting API trigger event log...</p>
                      )}

                      {isSandboxRunning && (
                        <div className="space-y-2 text-indigo-300 font-mono text-[10px]">
                          <p>&gt; POST https://api.europrivacy-compliance.eu/v1/embed-scan</p>
                          <p>&gt; Authorization: Bearer {sandboxToken.substring(0, 10)}••••••••</p>
                          <p>&gt; Payload validation success. Executing legal audits...</p>
                        </div>
                      )}

                      {sandboxResult && !isSandboxRunning && (
                        <div className="space-y-3 font-mono text-[10px]">
                          <div className="space-y-1">
                            <p className="text-indigo-400">&gt; Status 200 OK</p>
                            <p className="text-slate-400">&gt; Client: <b className="text-white">{sandboxResult.api_client}</b></p>
                            <p className="text-slate-400">&gt; System: <b className="text-white">{sandboxResult.system}</b></p>
                          </div>

                          <div className="p-2 border border-slate-800 bg-slate-900 rounded space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-400">Compliance Grade:</span>
                              <span className={`font-black ${sandboxResult.compliance_report?.complianceScore >= 80 ? "text-emerald-400" : "text-rose-400"}`}>
                                {sandboxResult.compliance_report?.complianceScore}%
                              </span>
                            </div>
                            <p className="text-slate-300 text-[9px] leading-relaxed mt-1">{sandboxResult.compliance_report?.summary}</p>
                            
                            {sandboxResult.compliance_report?.violations?.length > 0 && (
                              <div className="pt-1.5 space-y-1 border-t border-slate-800 mt-1.5">
                                <span className="text-rose-400 text-[9px] block font-bold">Gaps Detected:</span>
                                {sandboxResult.compliance_report.violations.map((violation: any, idx: number) => (
                                  <div key={idx} className="bg-slate-950 p-1 rounded text-[8.5px] space-y-0.5 border border-slate-800">
                                    <div className="flex items-center justify-between text-white">
                                      <span>Check: {violation.check}</span>
                                      <span className="text-rose-500 font-black">{violation.severity}</span>
                                    </div>
                                    <p className="text-slate-500">{violation.description}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
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
