import React, { useState, useEffect } from "react";
import { fetchWithRetry } from "../../lib/api-client";
import {
  Building2,
  ShieldCheck,
  Activity,
  Users,
  Settings,
  FileText,
  AlertTriangle,
  Menu,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Globe,
  PieChart,
  Network,
  LogOut,
  ToggleLeft,
  ToggleRight,
  Layers,
  Lock,
  RefreshCcw,
  Sliders,
  Landmark,
  DollarSign,
  FileCheck2,
  FileAxis3d,
  Box,
  Scale,
  Server,
  Map,
  ShoppingCart,
  Code2,
  HeartPulse,
  Gamepad2,
  ShieldAlert,
  Truck,
  Plus,
  Search,
  UserSearch,
  Terminal,
  Shield,
  Zap,
  BrainCircuit,
  Fingerprint,
  Cpu,
  PowerOff,
  AlertOctagon,
  Wrench,
  Database,
  LineChart,
  Leaf,
  Brain,
  Sparkles,
  Umbrella,
  TestTube,
  Swords,
  Key,
  Briefcase,
  Compass,
  Target,
  Mail,
  Award,
  GraduationCap,
  Sprout,
  Share2,
  UserCheck
} from "lucide-react";
import { motion } from "motion/react";
import { NonaxenLogo } from "../NonaxenLogo";
import { useLanguage } from "../../context/LanguageContext";
import { BackendHealthIndicator } from "./BackendHealthIndicator";
import { maskNavigationLinks } from "./FeatureMaskingMiddleware";

interface SidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  activePath: string;
  onNavigate: (path: string) => void;
  role: string;
}

type BadgeDef = { text: string | number; colorClass: string };

type NavItemDef = {
  id: string;
  label: string;
  icon?: React.ElementType;
  badge?: BadgeDef;
  tag?: BadgeDef;
  subItems?: NavItemDef[];
};

type NavSectionDef = {
  title?: string;
  items: NavItemDef[];
};

export const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen,
  toggleSidebar,
  activePath,
  onNavigate,
  role,
}) => {
  const { t } = useLanguage();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    "admin-hq": true,
    "admin-finance-mgmt": true,
    "admin-security-mgmt": true,
    "admin-infrastructure": true,
    "policy-acts": true,
    "admin-settings": false,
    billing: false,
    "core-systems": true,
    "risk-scanners": false,
    "advanced-engines": false,
    "system-mgmt": false,
    "security-ops": false,
    "caas-ops": true,
    "caas-hub": true,
    "ai-trust-engines": false,
    "intelligence-hub": false,
  });

  const [dbAddons, setDbAddons] = useState<any[]>([]);

  const loadAddons = async () => {
    try {
      let tenantId = "";
      try {
        const storedTenant = localStorage.getItem('active_tenant_workspace');
        if (storedTenant) {
          const parsed = JSON.parse(storedTenant);
          tenantId = parsed.id || "";
        }
      } catch (e) {}

      const url = tenantId ? `/api/v1/caas/addons?tenantId=${encodeURIComponent(tenantId)}` : "/api/v1/caas/addons";
      const res = await fetchWithRetry(url);
      if (res.ok) {
        const ct = res.headers.get('content-type');
        if (ct && ct.includes('application/json')) {
          const data = await res.json().catch(() => null);
          if (data?.success && Array.isArray(data.addons)) {
            setDbAddons(data.addons);
          }
        }
      }
    } catch (e) {
      console.warn("Failed to load sidebar dynamic addons", e);
    }
  };

  useEffect(() => {
    loadAddons();

    const handleSubscriptionChange = () => {
      loadAddons();
    };

    window.addEventListener("caas-addon-subscription-changed", handleSubscriptionChange);
    window.addEventListener("tenant-switched", handleSubscriptionChange);
    window.addEventListener("storage", handleSubscriptionChange);

    return () => {
      window.removeEventListener("caas-addon-subscription-changed", handleSubscriptionChange);
      window.removeEventListener("tenant-switched", handleSubscriptionChange);
      window.removeEventListener("storage", handleSubscriptionChange);
    };
  }, []);

  const getAddonIcon = (iconName?: string) => {
    switch (iconName) {
      case "ShieldCheck": return ShieldCheck;
      case "ShoppingCart": return ShoppingCart;
      case "HeartPulse": return HeartPulse;
      case "Gamepad2": return Gamepad2;
      case "Building2": return Building2;
      case "ShieldAlert": return ShieldAlert;
      case "Truck": return Truck;
      case "Zap": return Zap;
      case "Activity": return Activity;
      case "Brain": return Brain;
      case "Server": return Server;
      default: return ShieldCheck;
    }
  };

  const translateLabel = (id: string, defaultLabel: string): string => {
    switch (id) {
      case "client-dashboard":
      case "dashboard":
      case "platform-dashboard":
      case "regulator-dashboard":
        return t("dashboard", defaultLabel);
      case "integrations":
        return t("integrations", defaultLabel);
      case "cyber-security":
        return t("cyber-security", defaultLabel);
      case "reports":
        return t("reports", defaultLabel);
      case "vault":
      case "evidence-vault":
        return t("vault", defaultLabel);
      case "tasks":
        return t("tasks", defaultLabel);
      case "automation-portal":
        return t("compliance", defaultLabel);
      case "audit-ledger":
        return t("audits", defaultLabel);
      case "billing":
      case "finance":
        return t("finance", defaultLabel);
      case "team":
        return t("members", defaultLabel);
      case "settings":
      case "admin-settings":
        return t("settings", defaultLabel);
      default:
        return defaultLabel;
    }
  };

  const getComplianceRequirement = (id: string, role: string): string => {
    const isRegulator = role === "EU_REGULATOR";
    
    // Base contextual tips
    const tips: Record<string, string> = {
      "automation-portal": isRegulator ? "Oversee platform-wide automated enforcement." : "Manage automated compliance workflows to meet regulatory standards.",
      "audit-ledger": isRegulator ? "Review internal security and access logs for audit readiness." : "Review internal security and access logs for audit readiness.",
      "soc2-hub": "Manage and track controls for SOC 2 Type II compliance.",
      "vault": "Securely store and manage your regulatory documentation.",
      "tasks": isRegulator ? "View pending enforcement actions." : "Manage daily compliance tasks and alerts.",
    };

    return tips[id] || "";
  };

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
    // If opening sidebar to see expanded item
    if (!isSidebarOpen) {
      toggleSidebar();
    }
  };

  const isItemActive = (item: NavItemDef): boolean => {
    if (activePath === item.id) return true;
    if (item.subItems) {
      return item.subItems.some((sub) => isItemActive(sub));
    }
    return false;
  };
  const getNavSections = (): NavSectionDef[] => {
    const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN" || role === "admin" || role === "super_admin";
    const isRegulator = role === "EU_REGULATOR";
    const isLawyer = role === "LAWYER" || role === "LEGAL_CONSULTANT" || role === "lawyer" || role === "legal_consultant";

    // All standard industry solutions catalog
    const allStandardSolutions: Array<{ id: string; label: string; icon: any; actId: string; defaultBadge: { text: string; colorClass: string } }> = [
      { id: "gdpr-compliance", label: "GDPR Compliance Suite", icon: ShieldCheck, actId: "GDPR", defaultBadge: { text: "Active", colorClass: "bg-emerald-600 text-white" } },
      { id: "cyber-security", label: "Cybersecurity & NIS2", icon: ShieldAlert, actId: "NIS2", defaultBadge: { text: "Active", colorClass: "bg-emerald-600 text-white" } },
      { id: "aml-kyc", label: "Fintech AML/KYC", icon: Fingerprint, actId: "AMLD6", defaultBadge: { text: "Active", colorClass: "bg-emerald-600 text-white" } },
      { id: "ecommerce-eu", label: "EU eCommerce (GPSR)", icon: ShoppingCart, actId: "GPSR", defaultBadge: { text: "Active", colorClass: "bg-emerald-600 text-white" } },
      { id: "healthtech", label: "Healthtech (EHDS)", icon: HeartPulse, actId: "EHDS", defaultBadge: { text: "Active", colorClass: "bg-emerald-600 text-white" } },
      { id: "gaming", label: "Gaming & Entertainment", icon: Gamepad2, actId: "PEGI", defaultBadge: { text: "Active", colorClass: "bg-emerald-600 text-white" } },
      { id: "govtech", label: "Public Sector & Govtech", icon: Building2, actId: "EUDI", defaultBadge: { text: "Active", colorClass: "bg-emerald-600 text-white" } },
      { id: "edtech", label: "Edtech Shield", icon: Shield, actId: "COPPA", defaultBadge: { text: "Active", colorClass: "bg-emerald-600 text-white" } },
      { id: "logistic", label: "Logistic & Supply Chain", icon: Truck, actId: "CSDDD", defaultBadge: { text: "Active", colorClass: "bg-emerald-600 text-white" } },
    ];

    const standardIds = allStandardSolutions.map(s => s.id);
    
    // Dynamic addons from database
    const dynamicItems = dbAddons
      .filter(a => a.isActiveGlobally && !standardIds.includes(a.id))
      .map(addon => ({
        id: addon.id,
        label: addon.name,
        icon: getAddonIcon(addon.icon),
        badge: { 
          text: addon.subscriptionStatus === 'trial' ? 'Trial' : addon.subscriptionStatus === 'active' ? 'Active' : 'Add-On', 
          colorClass: addon.subscriptionStatus === 'active' ? 'bg-emerald-600 text-white' : addon.subscriptionStatus === 'trial' ? 'bg-amber-600 text-white' : 'bg-indigo-600 text-white' 
        }
      }));

    // For Client role: only show actively subscribed addons in the operational subItems
    let filteredSubItems: NavItemDef[] = [];

    if (isAdmin) {
      // Super Admin sees all solutions
      filteredSubItems = [
        ...allStandardSolutions.map(s => ({
          id: s.id,
          label: s.label,
          icon: s.icon,
          badge: { text: "Service", colorClass: "bg-indigo-500 text-white" }
        })),
        ...dynamicItems
      ];
    } else {
      // Client sees only subscribed / active addons
      const subscribedDbAddons = dbAddons.filter(a => a.isActiveGlobally && (a.subscriptionStatus === 'active' || a.subscriptionStatus === 'trial'));
      const subscribedAddonIds = new Set(subscribedDbAddons.map(a => a.id));

      filteredSubItems = allStandardSolutions
        .filter(s => subscribedAddonIds.has(s.id))
        .map(s => ({
          id: s.id,
          label: s.label,
          icon: s.icon,
          badge: { text: "Active", colorClass: "bg-emerald-600 text-white" }
        }));

      // Append subscribed dynamic addons
      subscribedDbAddons.filter(a => !standardIds.includes(a.id)).forEach(addon => {
        filteredSubItems.push({
          id: addon.id,
          label: addon.name,
          icon: getAddonIcon(addon.icon),
          badge: { 
            text: addon.subscriptionStatus === 'trial' ? 'Trial' : 'Active', 
            colorClass: addon.subscriptionStatus === 'trial' ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white' 
          }
        });
      });

      // If no addons are subscribed yet, offer quick subscribe navigation
      if (filteredSubItems.length === 0) {
        filteredSubItems.push({
          id: "caas-marketplace",
          label: "Enable Add-Ons (Marketplace)",
          icon: Plus,
          badge: { text: "Explore", colorClass: "bg-indigo-600 text-white animate-pulse" }
        });
      }
    }

    // Common sections for Enterprise clients
    const marketplaceSolutions: NavItemDef = {
      id: "marketplace-solutions",
      label: isAdmin ? "Marketplace Solutions" : "Subscribed Enclaves",
      icon: isAdmin ? ShoppingCart : ShieldCheck,
      subItems: filteredSubItems,
    };

    if (isAdmin) {
      return [
        {
          title: "Sovereign Upgrade & National Engines",
          items: [
            { id: "energy-grid", label: "Energy & Grid (ESG)", icon: Zap, badge: { text: "Pack 3", colorClass: "bg-amber-600 text-white font-bold" } },
            { id: "healthcare-life-sciences", label: "Healthcare & Life Sciences", icon: HeartPulse, badge: { text: "Pack 4", colorClass: "bg-rose-600 text-white font-bold" } },
            { id: "global-nlp-gateway", label: "Global NLP Gateway (40+ Langs)", icon: Globe, badge: { text: "AI Core", colorClass: "bg-emerald-600 text-white font-bold" } },
            { id: "tbml-dashboard", label: "TBML Detection (Export)", icon: ShieldCheck, badge: { text: "AI Risk", colorClass: "bg-rose-600 text-white font-bold" } },
            { id: "contract-intelligence", label: "Contract Intelligence (Legal)", icon: Scale, badge: { text: "AI NLP", colorClass: "bg-indigo-600 text-white font-bold" } },
            { id: "govt-procurement", label: "Govt E-Procurement Audit", icon: Landmark, badge: { text: "GovTech", colorClass: "bg-purple-600 text-white font-bold" } },
            { id: "tax-anomaly", label: "Tax Evasion Intelligence", icon: Building2, badge: { text: "GovTech", colorClass: "bg-purple-600 text-white font-bold" } },
            { id: "edu-credentials", label: "Credential Verification (Edu)", icon: GraduationCap, badge: { text: "EduTech", colorClass: "bg-blue-600 text-white font-bold" } },
            { id: "agri-subsidies", label: "Agri-Subsidies Audit", icon: Sprout, badge: { text: "AgriTech", colorClass: "bg-emerald-600 text-white font-bold" } },
            { id: "entity-network-explorer", label: "Entity Network & Graph Intel", icon: Network, badge: { text: "Neo4j Graph", colorClass: "bg-indigo-600 text-white font-bold" } },
            { id: "super-admin-tower", label: "Super Admin Control Tower", icon: ShieldAlert, badge: { text: "2-Person MFA", colorClass: "bg-rose-600 text-white font-bold" } },
            { id: "nre-country-packs", label: "Global NRE Country Packs", icon: Globe, badge: { text: "Tier 1 & 2", colorClass: "bg-cyan-600 text-white font-bold" } },
            { id: "consumer-grievance", label: "Consumer Grievance Intake", icon: Users, badge: { text: "Encrypted", colorClass: "bg-indigo-600 text-white font-bold" } },
            { id: "compliance-marketplace-hub", label: "Compliance Marketplace", icon: Award, badge: { text: "Escrow ZK", colorClass: "bg-emerald-600 text-white font-bold" } },
          ]
        },
        {
          title: "SaaS Admin HQ",
          items: [
            {
              id: "admin-hq",
              label: "Admin Command Center",
              icon: Server,
              subItems: [
                { id: "super-admin-tower", label: "SaaS Admin & Entitlements HQ", icon: ShieldAlert, badge: { text: "SaaS-HQ", colorClass: "bg-rose-600 text-white font-bold" } },
                { id: "system-audit-log", label: "System Audit Log", icon: Activity, badge: { text: "Audit", colorClass: "bg-emerald-600 text-white font-bold" } },
                { id: "landing", label: "Public Landing Portal", icon: Globe, badge: { text: "Portal", colorClass: "bg-indigo-600 text-white font-bold" } },
                { id: "sudou", label: "System Administration HQ", icon: Server, badge: { text: "HQ", colorClass: "bg-purple-600 text-white font-bold" } },
                { id: "platform-dashboard", label: "Platform Overview", icon: Activity },
                { id: "tenants", label: "Multi-Tenant Registry", icon: Building2, badge: { text: "Live", colorClass: "bg-emerald-600 text-white" } },
                { id: "onboarding", label: "Tenant Onboarding Flows", icon: Globe },
                { id: "companies", label: "Global Companies Directory", icon: Building2 },
                { id: "entity-profile", label: "Enterprise KYB/KYC Profile", icon: ShieldCheck, badge: { text: "Profile", colorClass: "bg-emerald-600 text-white font-bold" } },
                { id: "registration", label: "Enterprise Registration Wizard", icon: Plus, badge: { text: "Wizard", colorClass: "bg-indigo-600 text-white font-bold" } },
                { id: "regional-compliance", label: "Regional Compliance Config", icon: Map },
                { id: "user-management", label: "User Identity & Governance", icon: Users, badge: { text: "Auth-HQ", colorClass: "bg-indigo-600 text-white" } },
                { id: "rule-engine-builder", label: "Dynamic Rule Engine", icon: Cpu, badge: { text: "Eng-v2", colorClass: "bg-emerald-600 text-white" } },
                { id: "regulatory-radar", label: "Regulatory Radar & Deadlines", icon: Compass, badge: { text: "Radar", colorClass: "bg-indigo-600 text-white font-bold" } },
                { id: "ai-model-governance", label: "AI Model Governance & Trust", icon: BrainCircuit, badge: { text: "AI-HQ", colorClass: "bg-indigo-600 text-white" } },
                { id: "mica-forensics", label: "MiCA Crypto-Forensic & SAR", icon: Box, badge: { text: "MiCA", colorClass: "bg-purple-600 text-white font-bold" } },
                { id: "incident-copilot", label: "Cyber Incident Response Copilot", icon: ShieldAlert, badge: { text: "AI-Ops", colorClass: "bg-rose-600 text-white font-bold" } },
                { id: "regulatory-narrative", label: "Autonomous Regulatory Narrative", icon: Sparkles, badge: { text: "GenAI", colorClass: "bg-indigo-600 text-white font-bold" } },
                { id: "incident-center", label: "Platform Incident Center", icon: ShieldAlert, badge: { text: "Live", colorClass: "bg-rose-600 text-white" } },
                { id: "forensic-audit", label: "Forensic Audit & Data Lineage", icon: Fingerprint, badge: { text: "v2.0", colorClass: "bg-indigo-600 text-white" } },
                { id: "transfer-impact-assessment", label: "Transfer Impact Assessment (TIA)", icon: Network, badge: { text: "TIA/SCC", colorClass: "bg-indigo-600 text-white font-bold" } },
                { id: "statutory-gazette-watchdog", label: "Statutory Gazette Watchdog", icon: Scale, badge: { text: "Live", colorClass: "bg-emerald-600 text-white font-bold" } },
                { id: "caas-operation-center", label: "CaaS Operation Center", icon: Activity, badge: { text: "OP-HQ", colorClass: "bg-blue-600 text-white" } },
                { id: "b2g-operations", label: "B2G & B2R Operations Hub", icon: Scale, badge: { text: "B2R-HQ", colorClass: "bg-amber-600 text-white font-bold" } },
                { id: "regtech-orchestrator", label: "RegTech Engine Orchestrator", icon: Layers, badge: { text: "4-LAYER", colorClass: "bg-indigo-600 text-white font-bold" } },
                { id: "regtech-overview", label: "RegTech SaaS Overview", icon: ShieldCheck, badge: { text: "SaaS", colorClass: "bg-emerald-600 text-white font-bold" } },
                { id: "guardrails", label: "M1 & M2: Guardrail & Cache", icon: Zap, badge: { text: "M1/M2", colorClass: "bg-cyan-600 text-white font-bold" } },
                { id: "sovereign-gateway", label: "M3: Sovereign Gateway", icon: Globe, badge: { text: "M3", colorClass: "bg-purple-600 text-white font-bold" } },
                { id: "compliance-audit", label: "M4: AI Compliance Audit", icon: Award, badge: { text: "M4", colorClass: "bg-amber-600 text-white font-bold" } },
                { id: "country-regulators", label: "Country Regulator Engine", icon: Landmark, badge: { text: "GRC", colorClass: "bg-purple-600 text-white font-bold" } },
                { id: "lawyer-manager", label: "Lawyer/Consultant Manager", icon: Users },
                { id: "llm-config", label: "AI Providers & LLM Orchestration", icon: BrainCircuit },
                { id: "verification-toggles", label: "Verification Toggles", icon: ToggleRight },
                { id: "enterprise-gateway", label: "Enterprise Services Gateway", icon: Globe, badge: { text: "Services", colorClass: "bg-rose-600 text-white font-bold" } },
                { id: "company-network", label: "AI Company Network", icon: Building2, badge: { text: "AI-KYB", colorClass: "bg-indigo-600 text-white font-bold" } },
                { id: "verification-hub", label: "AI Verification Hub", icon: UserCheck, badge: { text: "KYC/KYB", colorClass: "bg-emerald-600 text-white font-bold" } },
                { id: "predictive-intelligence", label: "Predictive Trading Intelligence", icon: LineChart, badge: { text: "AI-Signal", colorClass: "bg-rose-600 text-white font-bold" } },
              ]
            }
          ]
        },
        {
          title: "B2G & Sovereign Regulatory Oversight",
          items: [
            {
              id: "admin-b2g-center",
              label: "B2G Operations & Oversight",
              icon: Scale,
              badge: { text: "B2G-HQ", colorClass: "bg-amber-600 text-white font-bold" },
              subItems: [
                { id: "admin-b2g-dashboard", label: "Oversight Command Center", icon: Activity, badge: { text: "Live", colorClass: "bg-emerald-600 text-white" } },
                { id: "b2g-operations", label: "B2R Operations Control HQ", icon: Scale, badge: { text: "B2R", colorClass: "bg-indigo-600 text-white" } },
                { id: "admin-b2g-scanner", label: "National B2G Scanning Engine", icon: Globe, badge: { text: "27 EU", colorClass: "bg-cyan-600 text-white font-bold" } },
                { id: "admin-b2g-sandbox", label: "Regulatory Sandboxes (AI & Fintech)", icon: Box, badge: { text: "Sandbox", colorClass: "bg-purple-600 text-white" } },
                { id: "admin-b2g-filings", label: "B2G Statutory Filings & Timeline", icon: FileCheck2 },
                { id: "admin-b2g-stakeholders", label: "Agency Stakeholder Matrix", icon: Building2 },
                { id: "admin-b2g-delta", label: "Compliance Delta Auditor", icon: Scale },
                { id: "admin-b2g-advanced", label: "Advanced B2G Enclave Suite", icon: Sparkles, badge: { text: "15+ Mod", colorClass: "bg-amber-600 text-white font-bold" } },
                { id: "admin-b2g-inquiries", label: "Statutory Inquiries & DPA Requests", icon: Search },
                { id: "admin-b2g-whistleblower", label: "Whistleblower & Direct Disclosures", icon: ShieldAlert },
                { id: "admin-b2g-agencies", label: "Inter-Agency Relay & Data Sharing", icon: Globe },
              ]
            }
          ]
        },
        {
          title: "Compliance-as-a-Service",
          items: [
            {
              id: "caas-hub",
              label: "CaaS Hub",
              icon: Layers,
              subItems: [
                {
                  id: "caas-service-center",
                  label: "Service Dashboard",
                  icon: PieChart,
                  badge: { text: "New", colorClass: "bg-indigo-600 text-white" },
                },
                {
                  id: "caas-marketplace",
                  label: "CaaS Enterprise Marketplace",
                  icon: ShoppingCart,
                  badge: { text: "Store", colorClass: "bg-indigo-600 text-white font-bold" },
                },
                marketplaceSolutions,
                {
                  id: "caas-subscription-mgmt",
                  label: "Subscription & Billing",
                  icon: CreditCard,
                  badge: { text: "Billing", colorClass: "bg-[#00D1B2] text-slate-950 font-bold" },
                },
              ]
            }
          ]
        },
        {
          title: "Privacy & Data Rights",
          items: [
            { id: "enterprise-privacy-suite", label: "Enterprise Privacy Suite", icon: ShieldCheck, badge: { text: "Pro", colorClass: "bg-indigo-600 text-white font-bold" } },
            { id: "dsar-portal", label: "DSAR Transparency Portal", icon: UserSearch },
            { id: "privacy-policy-gen", label: "Privacy Policy Generator", icon: Sparkles },
            { id: "breach-notification", label: "Breach Notification System", icon: ShieldAlert },
          ]
        },
        {
          title: "SaaS Finance & Subscriptions",
          items: [
            {
              id: "admin-finance-mgmt",
              label: "Financial Operations",
              icon: CreditCard,
              subItems: [
                { id: "billing", label: "SaaS Subscriptions & Revenue", icon: CreditCard, badge: { text: "Finance", colorClass: "bg-emerald-600 text-white" } },
                { id: "payment-gateways", label: "Payment Gateways", icon: DollarSign },
                { id: "treasury-sync", label: "Treasury & Govt Settlement", icon: DollarSign },
                { id: "entitlements", label: "Plan Entitlements", icon: Award },
              ]
            }
          ]
        },
        {
          title: "Enterprise Integrations & Launch Hub",
          items: [
            { id: "launch-tracker", label: "Launch Readiness & Prompts Dossier", icon: Award, badge: { text: "97% Live", colorClass: "bg-emerald-600 text-white font-bold" } },
            { id: "integrations", label: "Zero-Downtime Integrations Hub", icon: Network, badge: { text: "9-in-1", colorClass: "bg-indigo-600 text-white font-bold" } },
            { id: "developer-api", label: "Developer API Gateway", icon: Terminal },
            { id: "event-webhooks", label: "Global Event Webhooks", icon: Share2, badge: { text: "HMAC", colorClass: "bg-indigo-600 text-white" } },
          ]
        },
        {
          title: "Platform Governance & Security",
          items: [
            {
              id: "admin-security-mgmt",
              label: "System Security & Audit",
              icon: ShieldCheck,
              subItems: [
                { id: "audit-ledger", label: "Global Audit Ledger", icon: FileText },
                { id: "system-audit-ledger", label: "System Core Audit Logs", icon: ShieldCheck },
                { id: "data-security", label: "Global Security Suite", icon: Lock },
                { id: "law-violation-scanner", label: "Law Violation Surveillance", icon: AlertTriangle },
                { id: "platform-policy-engine", label: "Platform Policy Engine", icon: Sliders },
                { id: "blockchain-mgmt", label: "Blockchain Escrow Engine", icon: Box },
              ]
            }
          ]
        },
        {
          title: "Infrastructure & DevSecOps",
          items: [
            {
              id: "admin-infrastructure",
              label: "System Control & DevOps",
              icon: Terminal,
              subItems: [
                { id: "integrations", label: "Zero-Downtime Integrations Hub", icon: Network, badge: { text: "9-in-1", colorClass: "bg-indigo-600 text-white font-bold" } },
                { id: "event-webhooks", label: "Global Event Webhooks", icon: Share2, badge: { text: "HMAC", colorClass: "bg-emerald-600 text-white font-bold" } },
                { id: "developer-api", label: "Developer API & Sandbox", icon: Terminal, badge: { text: "REST", colorClass: "bg-purple-600 text-white font-bold" } },
                { id: "fs-database", label: "API & Database Control", icon: Database },
                { id: "devops", label: "DevOps & Environments", icon: Terminal },
                { id: "admin-queue-dashboard", label: "Background Task Queue", icon: Activity, badge: { text: "Worker", colorClass: "bg-indigo-600 text-white font-bold" } },
                { id: "regional-features", label: "Regional Compliance Control", icon: Globe },
                { id: "compliance-integrity", label: "Compliance Integrity", icon: ShieldCheck },
                { id: "backup-restore", label: "Backup & Disaster Recovery", icon: Database },
                { id: "global-maintenance-toggle", label: "Global Maintenance Mode", icon: PowerOff, badge: { text: "Control", colorClass: "bg-rose-600 text-white" } },
                { id: "force-tenant-logout", label: "Force Tenant Session Logout", icon: LogOut, badge: { text: "Emergency", colorClass: "bg-amber-600 text-white" } },
                { id: "system-settings", label: "Global System Settings", icon: Settings },
              ]
            }
          ]
        }
      ];
    }

    if (isLawyer) {
      return [
        {
          title: "Legal Partner Console",
          items: [
            {
              id: "lawyer-ops",
              label: "Legal Operations",
              icon: Scale,
              subItems: [
                { id: "lawyer-portal", label: "Partner Overview", icon: Scale, badge: { text: "Active", colorClass: "bg-teal-600 text-white" } },
                { id: "companies", label: "Client Portfolio", icon: Building2 },
                { id: "tenant-wizard", label: "Onboard Client Tenant", icon: Globe },
                { id: "tasks", label: "Actionable Legal Tasks", icon: AlertTriangle, badge: { text: "4 Pending", colorClass: "bg-amber-500 text-amber-950" } },
              ]
            }
          ],
        },
        {
          title: "Legal Intelligence & Auditing",
          items: [
            {
              id: "legal-intelligence",
              label: "Regulatory Intelligence",
              icon: Search,
              subItems: [
                { id: "regulatory-search", label: "Policy & Regulatory Search", icon: Search, badge: { text: "AI", colorClass: "bg-indigo-500 text-white" } },
                { id: "regulatory-radar", label: "Regulatory Radar & Deadlines", icon: Compass, badge: { text: "Radar", colorClass: "bg-indigo-600 text-white font-bold" } },
                { id: "transfer-impact-assessment", label: "Transfer Impact Assessment (TIA)", icon: Network, badge: { text: "TIA", colorClass: "bg-indigo-600 text-white font-bold" } },
                { id: "statutory-gazette-watchdog", label: "Statutory Gazette Watchdog", icon: Scale, badge: { text: "Live", colorClass: "bg-emerald-600 text-white font-bold" } },
                { id: "regulatory-mapping", label: "Regulatory Mapping & Engine", icon: Scale, badge: { text: "AI Act", colorClass: "bg-blue-600 text-white" } },
                { id: "automated-scanning", label: "Automated Scanning & Inspection", icon: ShieldCheck, badge: { text: "Realtime", colorClass: "bg-emerald-600 text-white" } },
                { id: "automated-remediation", label: "Automated Remediation Engine", icon: Zap, badge: { text: "Auto-Fix", colorClass: "bg-amber-500 text-white" } },
                { id: "sovereignty-security", label: "Sovereignty & Role Security", icon: Globe, badge: { text: "PQC & Enclaves", colorClass: "bg-purple-600 text-white" } },
                { id: "law-violation-scanner", label: "Law Violation Scanner", icon: AlertTriangle },
                { id: "mcp-manager", label: "MCP Manager (Unified CMP)", icon: ShieldCheck, badge: { text: "Full", colorClass: "bg-purple-600 text-white" } },
                { id: "gdpr-management", label: "GDPR Management System", icon: ShieldCheck },
                { id: "ai-model-governance", label: "AI Model Governance", icon: Brain },
                { id: "competitive-moat", label: "Enterprise Moat & AI Gateway", icon: Sparkles, badge: { text: "Moat", colorClass: "bg-indigo-600 text-white" } },
              ]
            }
          ],
        },
        {
          title: "Evidence & Records Vault",
          items: [
            {
              id: "lawyer-vaults",
              label: "Document Vaults",
              icon: Lock,
              subItems: [
                { id: "vault", label: "Client Vault & Contracts", icon: Lock },
                { id: "evidence-vault", label: "Evidence Dossier Vault", icon: FileAxis3d },
                { id: "audit-ledger", label: "Immutable Audit Ledger", icon: FileText },
                { id: "system-audit-ledger", label: "System Audit Ledger", icon: ShieldCheck },
              ]
            }
          ],
        },
        {
          items: [
            { id: "security-settings", label: "Partner Security & MFA", icon: ShieldCheck },
            { id: "settings", label: "Account Settings", icon: Settings },
          ]
        }
      ];
    }

    const proactiveRegTech: NavItemDef = {
      id: "proactive-regtech",
      label: "Proactive RegTech AI",
      icon: Sparkles,
      badge: { text: "Advanced", colorClass: "bg-indigo-600 text-white font-bold animate-pulse" },
      subItems: [
        { id: "proactive-regtech-engine", label: "Proactive Compliance Engine", icon: BrainCircuit, badge: { text: "AI", colorClass: "bg-indigo-600 text-white" } },
      ]
    };

    const governanceAndForensics: NavItemDef = {
      id: "governance-forensics",
      label: "Governance & Forensics",
      icon: Search,
      subItems: [
        { id: "regulatory-ontology", label: "Regulatory Ontology & Moat", icon: Scale, badge: { text: "Moat", colorClass: "bg-purple-600 text-white font-bold" } },
        { id: "regulatory-radar", label: "Regulatory Radar & Deadlines", icon: Compass, badge: { text: "Radar", colorClass: "bg-indigo-600 text-white font-bold" } },
        { id: "transfer-impact-assessment", label: "Transfer Impact Assessment (TIA)", icon: Network, badge: { text: "TIA", colorClass: "bg-indigo-600 text-white font-bold" } },
        { id: "statutory-gazette-watchdog", label: "Statutory Gazette Watchdog", icon: Scale, badge: { text: "Live", colorClass: "bg-emerald-600 text-white font-bold" } },
        { id: "ai-model-governance", label: "AI Model Governance", icon: Brain },
        { id: "competitive-moat", label: "Enterprise Moat & AI Gateway", icon: Sparkles },
        { id: "ai-lineage", label: "AI Lineage Forensics", icon: Search },
        { id: "compliance-scraper", label: "GDPR Compliance Scraper", icon: Globe },
        { id: "data-flow-adequacy", label: "Data Flow & Adequacy", icon: Network },
        { id: "supply-chain", label: "Supply Chain Auditor", icon: Briefcase },
        { id: "digital-identity", label: "Digital Identity", icon: Fingerprint },
        { id: "esg-data", label: "ESG & Green Data", icon: Leaf },
      ]
    };

    const privacyAndTrust: NavItemDef = {
      id: "privacy-trust",
      label: "Privacy & Trust Management",
      icon: ShieldCheck,
      subItems: [
        { 
          id: "enterprise-privacy-suite", 
          label: "Enterprise Privacy Suite", 
          icon: ShieldCheck, 
          badge: { text: "Pro", colorClass: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold" } 
        },
        { id: "gdpr-management", label: "GDPR Management System", icon: ShieldCheck, badge: { text: "System", colorClass: "bg-indigo-600 text-white" } },
        { 
          id: "mcp-manager", 
          label: "MCP Manager (Unified CMP)", 
          icon: ShieldCheck, 
          badge: { text: "Full", colorClass: "bg-purple-600 text-white" },
          subItems: [
            { id: "mcp-manager", label: "Multi-Platform Overview", icon: Activity },
            { id: "cookie-consent", label: "Web Cookie Settings", icon: Globe },
          ]
        },
        { id: "data-mapping", label: "Data Mapping & Inventory", icon: Network },
        { id: "dsar-management", label: "Data Subject Requests (DSAR)", icon: Users },
        { id: "dpia-assessments", label: "PIA & DPIA Assessments", icon: FileCheck2 },
        { id: "vendor-risk", label: "Vendor Risk Management", icon: Building2 },
        { id: "whistleblower", label: "Ethics & Whistleblower", icon: AlertTriangle },
        { id: "esg-sustainability", label: "ESG & Sustainability", icon: HeartPulse, badge: { text: "New", colorClass: "bg-emerald-500 text-white" } },
      ]
    };

    if (isRegulator) {
      return [
        {
          title: "B2G Sovereign & Regulator Oversight",
          items: [
            {
              id: "b2g-sovereign-suite",
              label: "B2G Sovereign Suite",
              icon: Scale,
              badge: { text: "GovTech", colorClass: "bg-emerald-600 text-white font-bold" },
              subItems: [
                { id: "regulator-dashboard", label: "Regulator Command Dashboard", icon: Activity, badge: { text: "HQ", colorClass: "bg-amber-600 text-white" } },
                { id: "b2g-operations", label: "B2R Operations Control HQ", icon: Scale, badge: { text: "B2R", colorClass: "bg-indigo-600 text-white" } },
                { id: "admin-b2g-dashboard", label: "B2G Oversight Center", icon: ShieldCheck, badge: { text: "Live", colorClass: "bg-emerald-600 text-white" } },
                { id: "admin-b2g-scanner", label: "National B2G Scanning Engine", icon: Globe, badge: { text: "27 EU", colorClass: "bg-cyan-600 text-white font-bold" } },
                { id: "admin-b2g-sandbox", label: "Regulatory Sandboxes (AI & Fintech)", icon: Box, badge: { text: "Sandbox", colorClass: "bg-purple-600 text-white" } },
                { id: "admin-b2g-filings", label: "B2G Statutory Filings & Timeline", icon: FileCheck2 },
                { id: "admin-b2g-stakeholders", label: "Agency Stakeholder Matrix", icon: Building2 },
                { id: "admin-b2g-delta", label: "Compliance Delta Auditor", icon: Scale },
                { id: "admin-b2g-advanced", label: "Advanced B2G Enclave Suite", icon: Sparkles, badge: { text: "15+ Mod", colorClass: "bg-amber-600 text-white font-bold" } },
                { id: "b2g-regulator-portal", label: "B2G Auto-Penalty Portal", icon: Scale, badge: { text: "Request", colorClass: "bg-amber-500 text-slate-950 font-bold" } },
                { id: "b2g_scraper_hub", label: "B2G Web Scraper Hub", icon: Globe, badge: { text: "Scraper", colorClass: "bg-indigo-600 text-white font-bold" } },
                { id: "entity-portal", label: "Entity Enforcement & Resolution", icon: Scale, badge: { text: "Resolution", colorClass: "bg-rose-600 text-white font-bold" } },
              ]
            }
          ],
        },
        {
          title: "Surveillance & Enforcement",
          items: [
            {
              id: "regulator-ops",
              label: "Enforcement Operations",
              icon: Scale,
              subItems: [
                { id: "regulatory-radar", label: "Regulatory Radar & Deadlines", icon: Compass, badge: { text: "Radar", colorClass: "bg-indigo-600 text-white font-bold" } },
                { id: "transfer-impact-assessment", label: "Transfer Impact Assessment (TIA)", icon: Network, badge: { text: "TIA", colorClass: "bg-indigo-600 text-white font-bold" } },
                { id: "statutory-gazette-watchdog", label: "Statutory Gazette Watchdog", icon: Scale, badge: { text: "Live", colorClass: "bg-emerald-600 text-white font-bold" } },
                { id: "violations", label: "Violation Surveillance", icon: AlertTriangle, badge: { text: "12 Active", colorClass: "bg-rose-500 text-white" } },
                { id: "enforcement", label: "Penalties & Collections", icon: Scale },
                { id: "ledger", label: "Audit Trail Viewer", icon: FileText },
                { id: "reports", label: "Enforcement Reports", icon: PieChart },
              ]
            }
          ],
        },
        {
          title: "Ecosystem Operations",
          items: [
            {
              id: "ecosystem-mgmt",
              label: "Entity Management",
              icon: Building2,
              subItems: [
                { id: "companies", label: "Monitored Entities", icon: Building2 },
                { id: "tasks", label: "Actionable Alerts", icon: AlertTriangle, badge: { text: "4 Pending", colorClass: "bg-amber-500 text-amber-950" } },
                { id: "automation-portal", label: "Compliance Portal", icon: RefreshCcw },
              ]
            }
          ],
        },
        {
          title: "Evidence & Records",
          items: [
            {
              id: "records-vault",
              label: "Secure Records",
              icon: FileAxis3d,
              subItems: [
                { id: "vault", label: "Regulatory Document Vault", icon: FileCheck2 },
                { id: "evidence-vault", label: "Secure Evidence Vault", icon: FileAxis3d },
                { id: "dpo-certification", label: "DPO Certification", icon: ShieldCheck, badge: { text: "Alerts", colorClass: "bg-rose-500 text-white" } },
              ]
            }
          ],
        },
        {
          title: "Regulator Settings",
          items: [
            {
              id: "reg-mgmt",
              label: "Regulator Admin",
              icon: Settings,
              subItems: [
                { id: "company-profile", label: "Regulator Profile", icon: Building2 },
                { id: "audit-ledger", label: "Platform Audit Logs", icon: FileText },
                { id: "integrations", label: "API Integrations", icon: Network },
                {
                  id: "admin-settings",
                  label: "Admin Settings",
                  icon: Settings,
                  subItems: [
                    { id: "team", label: "Team & Roles", icon: Users },
                    { id: "settings", label: "Regulator Settings", icon: Sliders },
                    { id: "security-settings", label: "Security & MFA", icon: ShieldCheck },
                  ],
                },
              ]
            }
          ],
        },
      ];
    }

    // Default Client Tenant
    return [
      {
        items: [
          { id: "landing", label: "Public Website / Landing", icon: Globe, badge: { text: "Portal", colorClass: "bg-indigo-600 text-white font-bold" } },
          { id: "client-dashboard", label: "Overview", icon: Activity },
          {
            id: "companies",
            label: "Corporate Entities & KYB",
            icon: Building2,
            subItems: [
              { id: "entity-profile", label: "Enterprise KYB/KYC Profile", icon: ShieldCheck, badge: { text: "Verified", colorClass: "bg-emerald-600 text-white font-bold" } },
              { id: "registration", label: "Multi-Step Registration Wizard", icon: Plus, badge: { text: "Wizard", colorClass: "bg-indigo-600 text-white font-bold" } },
              { id: "companies", label: "Global Entities Directory", icon: Building2 }
            ]
          },
          { id: "tenant-wizard", label: "Onboarding Wizard", icon: Globe },
          { id: "eu-client-portal", label: "My account", icon: ShieldCheck, badge: { text: "Portal", colorClass: "bg-indigo-600 text-white" } },
          {
            id: "tasks",
            label: "Tasks & Alerts",
            icon: AlertTriangle,
            badge: {
              text: "4 Pending",
              colorClass: "bg-amber-500 text-amber-950",
            },
            subItems: [
              { id: "tasks", label: "Actionable Alerts & Tasks", icon: AlertTriangle },
              { id: "entity-portal", label: "Regulatory Disputes & Fines", icon: AlertOctagon },
            ]
          },
        ],
      },
      {
        title: "Compliance-as-a-Service",
        items: [
          {
            id: "caas-hub",
            label: "CaaS Hub",
            icon: Layers,
            subItems: [
              {
                id: "caas-service-center",
                label: "Service Dashboard",
                icon: PieChart,
                badge: { text: "New", colorClass: "bg-indigo-600 text-white" },
              },
              {
                id: "caas-marketplace",
                label: "CaaS Enterprise Marketplace",
                icon: ShoppingCart,
                badge: { text: "Store", colorClass: "bg-indigo-600 text-white font-bold" },
              },
              marketplaceSolutions,
              {
                id: "ma-marketplace",
                label: "M&A & Personnel Hub",
                icon: Briefcase,
                badge: { text: "v2.1", colorClass: "bg-purple-600 text-white font-bold" },
              },
              {
                id: "caas-subscription-mgmt",
                label: "Subscription & Billing",
                icon: CreditCard,
                badge: { text: "Billing", colorClass: "bg-[#00D1B2] text-slate-950 font-bold" },
              },
            ]
          },
        ],
      },
      { items: [proactiveRegTech] },
      { items: [governanceAndForensics] },
      { items: [privacyAndTrust] },
      {
        title: "Organization",
        items: [
          { id: "company-profile", label: "Company Profile", icon: Building2 },
          { id: "kyb-registration", label: "Entity Registration & KYB", icon: UserCheck, badge: { text: "KYB", colorClass: "bg-emerald-600 text-white font-bold" } },
          { id: "reports", label: "Reports", icon: PieChart },
          { 
            id: "integrations", 
            label: "Integrations & APIs", 
            icon: Network,
            badge: { text: "9-in-1", colorClass: "bg-indigo-600 text-white font-bold" },
            subItems: [
              { id: "integrations", label: "Zero-Downtime Hub", icon: Network },
              { id: "event-webhooks", label: "Event Webhooks (HMAC)", icon: Share2 },
              { id: "developer-api", label: "Developer API Keys", icon: Terminal },
            ]
          },
          { id: "audit-ledger", label: "Audit Logs", icon: FileText },
          {
            id: "billing",
            label: "Billing",
            icon: CreditCard,
            subItems: [
              { id: "subscriptions", label: "Subscriptions" },
              {
                id: "invoices",
                label: "Invoices",
                badge: {
                  text: "1 Unpaid",
                  colorClass: "bg-rose-500 text-white",
                },
              },
            ],
          },
          {
            id: "admin-settings",
            label: "Admin Settings",
            icon: Settings,
            subItems: [
              { id: "team", label: "Team & Roles", icon: Users },
              { id: "settings", label: "Tenant Settings", icon: Sliders },
              { id: "security-settings", label: "Security & MFA", icon: ShieldCheck },
            ],
          },
        ],
      },
    ];
  };

  const sections = maskNavigationLinks(getNavSections(), role);

  const NavMenuItem: React.FC<{ item: NavItemDef; depth?: number }> = ({ item, depth = 0 }) => {
    const Icon = item.icon || Box;
    const active = isItemActive(item);
    const hasSubItems = Boolean(item.subItems?.length);
    const isExpanded = expandedItems[item.id];
    const exactlyActive = activePath === item.id;

    return (
      <li className="relative">
        <button
          onClick={(e) => {
            if (hasSubItems) {
              toggleExpand(item.id, e);
            } else {
              onNavigate(item.id);
              if (typeof window !== 'undefined' && window.innerWidth < 768 && isSidebarOpen) {
                toggleSidebar();
              }
            }
          }}
          className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-colors group ${
            exactlyActive
              ? "bg-emerald-500/10 text-emerald-400"
              : active
                ? "text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          }`}
          style={{ paddingLeft: depth > 0 ? `${depth * 1.5 + 0.625}rem` : '0.625rem' }}
          title={!isSidebarOpen ? `${translateLabel(item.id, item.label)} ${getComplianceRequirement(item.id, role) ? `: ${getComplianceRequirement(item.id, role)}` : ''}` : undefined}
        >
          <div className="flex items-center min-w-0">
            <Icon
              className={`w-5 h-5 shrink-0 ${exactlyActive ? "text-emerald-400" : active ? "text-white" : "text-slate-400 group-hover:text-slate-200"}`}
            />
            {isSidebarOpen && (
              <span className={`ml-3 font-medium truncate ${depth > 0 ? 'text-xs' : 'text-sm'}`}>
                {translateLabel(item.id, item.label)}
              </span>
            )}
          </div>

          {isSidebarOpen && (
            <div className="flex items-center space-x-2 shrink-0 ml-2">
              {item.badge && (
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${item.badge.colorClass}`}>
                  {item.badge.text}
                </span>
              )}
              {item.tag && (
                <span className={`px-1.5 py-0.5 text-[10px] font-semibold border border-transparent rounded whitespace-nowrap ${item.tag.colorClass}`}>
                  {item.tag.text}
                </span>
              )}
              {hasSubItems && (
                isExpanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />
              )}
            </div>
          )}
        </button>

        {hasSubItems && isExpanded && isSidebarOpen && (
          <ul className="mt-1 space-y-1">
            {item.subItems!.map((sub) => (
              <NavMenuItem key={sub.id} item={sub} depth={depth + 1} />
            ))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <motion.aside
      initial={false}
      animate={{
        width: typeof window !== 'undefined' && window.innerWidth < 768 ? 288 : (isSidebarOpen ? 288 : 80),
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`fixed md:relative inset-y-0 left-0 z-40 bg-[#0B1120] border-r border-slate-800 flex flex-col h-screen overflow-hidden shrink-0 transition-transform duration-300 ${
        isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
      }`}
    >
      {/* Brand Header */}
      <div className="h-13 shrink-0 flex items-center justify-between px-3.5 border-b border-slate-800 bg-[#0B1120]">
        {isSidebarOpen ? (
          <div className="flex items-center space-x-2 overflow-hidden truncate">
            <NonaxenLogo className="w-6 h-6" showText={true} textSize="sm" />
          </div>
        ) : (
          <div className="mx-auto w-fit">
            <NonaxenLogo className="w-6 h-6" showText={false} />
          </div>
        )}

        <button
          onClick={toggleSidebar}
          className="text-slate-400 hover:text-white p-1 rounded transition-colors hidden sm:block"
        >
          {isSidebarOpen ? (
            <ChevronLeft className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Visual FastAPI Backend Health Indicator */}
      <BackendHealthIndicator isSidebarOpen={isSidebarOpen} />

      {/* Navigation Links */}
      <nav className="flex-1 min-h-0 overflow-y-auto py-4 custom-scrollbar overscroll-contain">
        {sections.map((section, sIdx) => (
          <div key={`section-${sIdx}`} className="mb-6">
            {section.title && isSidebarOpen && (
              <div className="px-4 mb-2 text-xs font-bold tracking-wider text-slate-500 uppercase">
                {section.title}
              </div>
            )}

            <ul className="space-y-1 px-2">
              {section.items.map((item: NavItemDef) => (
                <NavMenuItem key={item.id} item={item} />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom Legal/Version Info */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 shrink-0">
        {isSidebarOpen ? (
          <div className="flex flex-col space-y-1">
            <span className="font-mono text-[10px] uppercase tracking-widest text-slate-600">
              Secure Node V.1.0
            </span>
            <span>© 2026 9Xen Regulettee</span>
          </div>
        ) : (
          <div className="text-center font-mono text-[10px]">v1.0</div>
        )}
      </div>
    </motion.aside>
  );
};
