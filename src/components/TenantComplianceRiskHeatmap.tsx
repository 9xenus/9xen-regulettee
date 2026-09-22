import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ActionableMitigation } from "./ActionableMitigation";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Cell,
  TooltipProps,
} from "recharts";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Globe,
  Layers,
  Grid,
  Search,
  Filter,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Activity,
  Database,
  Building2,
  Info,
  ChevronRight,
} from "lucide-react";

// Define the Tenant interface matching existing platform tenant data models
interface Tenant {
  id: string;
  name: string;
  domain: string;
  region: string;
  country: string;
  businessType: string;
  status: "Active" | "Suspended" | "Trial" | "Sovereign";
  activeNode: string;
  databaseEngine: string;
  totalPiiScans: number;
  complianceScore: number; // 0 - 100
  trendType: "stable" | "spiky" | "improving" | "deteriorating";
  volatility: number; // 1 - 10
}

// Highly realistic mock tenant data
const INITIAL_TENANTS: Tenant[] = [
  {
    id: "t1",
    name: "AeroSpace Europe SE",
    domain: "compliance.aerospace.eu",
    region: "Frankfurt (DE-CENTRAL)",
    country: "Germany",
    businessType: "Aerospace",
    status: "Sovereign",
    activeNode: "Node-DE-Frankfurt",
    databaseEngine: "SQLite Embedded Cluster",
    totalPiiScans: 14200,
    complianceScore: 88,
    trendType: "improving",
    volatility: 4,
  },
  {
    id: "t2",
    name: "Novartis Biotech & Pharma Group",
    domain: "privacy.novartis.ch",
    region: "Zurich (CH-WEST)",
    country: "Switzerland",
    businessType: "Healthcare",
    status: "Active",
    activeNode: "Node-CH-Geneva",
    databaseEngine: "Sovereign SQLite (Isolated VM)",
    totalPiiScans: 8900,
    complianceScore: 76,
    trendType: "stable",
    volatility: 6,
  },
  {
    id: "t3",
    name: "Zalando Retail SE",
    domain: "privacy.zalando.de",
    region: "Dublin (EU-WEST-1)",
    country: "Germany",
    businessType: "E-Commerce",
    status: "Active",
    activeNode: "Node-IE-Dublin-A",
    databaseEngine: "SQLite HA Distributed",
    totalPiiScans: 31200,
    complianceScore: 52,
    trendType: "spiky",
    volatility: 9,
  },
  {
    id: "t4",
    name: "BMW Autonomous Mobility Div",
    domain: "compliance.bmw.de",
    region: "Munich (DE-SOUTH)",
    country: "Germany",
    businessType: "Automotive",
    status: "Sovereign",
    activeNode: "Node-DE-Munich",
    databaseEngine: "De-centralized WASM Shards",
    totalPiiScans: 22400,
    complianceScore: 94,
    trendType: "stable",
    volatility: 3,
  },
  {
    id: "t5",
    name: "9Xen Regulettee Core Legaltech Sandbox",
    domain: "sandbox.regulettee.eu",
    region: "Paris (FR-WEST)",
    country: "France",
    businessType: "SaaS",
    status: "Trial",
    activeNode: "Node-FR-Paris",
    databaseEngine: "Local Memory Sandbox (SQLite)",
    totalPiiScans: 1200,
    complianceScore: 68,
    trendType: "deteriorating",
    volatility: 8,
  },
  {
    id: "t6",
    name: "KBC Bank NV Global FinTech",
    domain: "sovereign.kbc.be",
    region: "Brussels (BE-CENTRAL)",
    country: "Belgium",
    businessType: "Fintech",
    status: "Sovereign",
    activeNode: "Node-BE-Brussels",
    databaseEngine: "AES-256 encrypted SQLite",
    totalPiiScans: 54000,
    complianceScore: 91,
    trendType: "improving",
    volatility: 2,
  },
  {
    id: "t7",
    name: "Nokia Communications Oyj",
    domain: "sovereign.nokia.fi",
    region: "Helsinki (FI-NORTH)",
    country: "Finland",
    businessType: "Telecom",
    status: "Active",
    activeNode: "Node-FI-Helsinki",
    databaseEngine: "Sovereign Vault SQLite",
    totalPiiScans: 19800,
    complianceScore: 81,
    trendType: "stable",
    volatility: 5,
  },
  {
    id: "t8",
    name: "Philips Healthcare Solutions",
    domain: "compliance.philips.nl",
    region: "Eindhoven (NL-WEST)",
    country: "Netherlands",
    businessType: "Healthcare",
    status: "Active",
    activeNode: "Node-NL-Amsterdam",
    databaseEngine: "SQLite Encrypted Storage",
    totalPiiScans: 38900,
    complianceScore: 45,
    trendType: "deteriorating",
    volatility: 10,
  },
  {
    id: "t9",
    name: "Deliveroo Ireland Ops",
    domain: "compliance.deliveroo.ie",
    region: "Dublin (EU-WEST-1)",
    country: "Ireland",
    businessType: "E-Commerce",
    status: "Active",
    activeNode: "Node-IE-Dublin-B",
    databaseEngine: "SQLite Distributed",
    totalPiiScans: 42000,
    complianceScore: 62,
    trendType: "spiky",
    volatility: 8,
  },
  {
    id: "t10",
    name: "Ubisoft Entertainment Paris",
    domain: "sovereign.ubisoft.fr",
    region: "Paris (FR-WEST)",
    country: "France",
    businessType: "Gaming",
    status: "Trial",
    activeNode: "Node-FR-Paris",
    databaseEngine: "Transient Memory Vault",
    totalPiiScans: 61000,
    complianceScore: 73,
    trendType: "improving",
    volatility: 6,
  },
];

// Helper to determine risk level, color and label based on compliance score
const getRiskStatus = (score: number) => {
  if (score >= 90)
    return {
      label: "Low Risk",
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      text: "text-emerald-500",
      hex: "#10b981",
      desc: "Compliant with all sovereign mandates. Secure posture.",
    };
  if (score >= 70)
    return {
      label: "Medium Risk",
      bg: "bg-amber-50 text-amber-700 border-amber-200",
      text: "text-amber-500",
      hex: "#f59e0b",
      desc: "Minor procedural exceptions found. Regular active surveillance.",
    };
  if (score >= 50)
    return {
      label: "High Risk",
      bg: "bg-orange-50 text-orange-700 border-orange-200",
      text: "text-orange-500",
      hex: "#f97316",
      desc: "Repeated non-conformances. High surveillance alert status.",
    };
  return {
    label: "Critical Risk",
    bg: "bg-rose-50 text-rose-700 border-rose-200",
    text: "text-rose-500",
    hex: "#f43f5e",
    desc: "Severe structural isolation breaches. Action required.",
  };
};

const COUNTRIES = [
  "Germany",
  "France",
  "Ireland",
  "Netherlands",
  "Belgium",
  "Switzerland",
  "Finland",
];
const BUSINESS_TYPES = [
  "Aerospace",
  "Healthcare",
  "E-Commerce",
  "Automotive",
  "SaaS",
  "Fintech",
  "Telecom",
  "Gaming",
];

export const TenantComplianceRiskHeatmap: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"matrix" | "scatter">("matrix");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<
    "All" | "Low" | "Medium" | "High" | "Critical"
  >("All");
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(
    INITIAL_TENANTS[0],
  );

  // Handle Search and Filter
  const filteredTenants = useMemo(() => {
    return INITIAL_TENANTS.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.businessType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.country.toLowerCase().includes(searchTerm.toLowerCase());

      if (selectedRiskFilter === "All") return matchesSearch;

      const risk = getRiskStatus(t.complianceScore).label;
      const matchesRisk = risk
        .toLowerCase()
        .includes(selectedRiskFilter.toLowerCase());
      return matchesSearch && matchesRisk;
    });
  }, [searchTerm, selectedRiskFilter]);

  // Generate 2D Risk Matrix data representation
  const matrixData = useMemo(() => {
    const grid: Array<{
      country: string;
      businessType: string;
      score: number;
      count: number;
      tenantsList: Tenant[];
    }> = [];

    COUNTRIES.forEach((country) => {
      BUSINESS_TYPES.forEach((businessType) => {
        const matches = INITIAL_TENANTS.filter(
          (t) => t.country === country && t.businessType === businessType,
        );
        if (matches.length > 0) {
          const avgScore =
            matches.reduce((sum, curr) => sum + curr.complianceScore, 0) /
            matches.length;
          grid.push({
            country,
            businessType,
            score: Math.round(avgScore),
            count: matches.length,
            tenantsList: matches,
          });
        } else {
          // Zero-filled empty cell for completeness
          grid.push({
            country,
            businessType,
            score: 100, // Safe baseline
            count: 0,
            tenantsList: [],
          });
        }
      });
    });

    return grid;
  }, []);

  // Format Scatter plot points for Recharts
  const scatterData = useMemo(() => {
    return INITIAL_TENANTS.map((t) => ({
      x: t.complianceScore,
      y: t.totalPiiScans,
      z: t.volatility,
      name: t.name,
      tenant: t,
    }));
  }, []);

  // Custom tooltips
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const tenant: Tenant = data.tenant;
      const risk = getRiskStatus(tenant.complianceScore);

      return (
        <div className="bg-slate-950 border border-slate-800 text-slate-100 p-3.5 rounded-xl shadow-xl max-w-sm font-sans text-xs">
          <div className="font-extrabold text-sm text-white mb-1.5">
            {tenant.name}
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-2 text-slate-400">
            <div>
              Country:{" "}
              <span className="text-white font-medium">{tenant.country}</span>
            </div>
            <div>
              Vertical:{" "}
              <span className="text-white font-medium">
                {tenant.businessType}
              </span>
            </div>
            <div>
              Storage Node:{" "}
              <span className="text-white font-mono">{tenant.activeNode}</span>
            </div>
            <div>
              Compliance:{" "}
              <span className={`font-bold ${risk.text}`}>
                {tenant.complianceScore}%
              </span>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-1.5 flex items-center justify-between">
            <span className="text-slate-500 uppercase tracking-wider text-[10px] font-mono">
              PII Records Scanned
            </span>
            <span className="text-indigo-400 font-extrabold font-mono">
              {tenant.totalPiiScans.toLocaleString()}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
      id="compliance-risk-heatmap-module"
    >
      {/* Header and Controls */}
      <div className="p-4 sm:p-5 lg:p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-5.5 h-5.5 text-indigo-600" />
            Sovereign Tenant Risk Heatmap
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Dynamic surveillance mapping and security exposure indices across
            multi-tenant isolated databases.
          </p>
        </div>

        {/* Chart View Toggle Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl self-start md:self-auto">
          <button
            onClick={() => setActiveTab("matrix")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "matrix"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Grid className="w-4 h-4" />
            2D Risk Matrix
          </button>
          <button
            onClick={() => setActiveTab("scatter")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "scatter"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Activity className="w-4 h-4" />
            Risk Scatter Map
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 min-h-[500px]">
        {/* Left Interactive Sidebar (Tenants Directory) */}
        <div className="p-5 border-b xl:border-b-0 xl:border-r border-slate-200 bg-white flex flex-col h-[500px] xl:h-auto">
          <div className="space-y-3.5 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search tenant name or sector..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 font-sans placeholder-slate-400"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              <span className="flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Risk Level
              </span>
              {selectedRiskFilter !== "All" && (
                <button
                  onClick={() => setSelectedRiskFilter("All")}
                  className="text-indigo-600 font-bold hover:underline cursor-pointer lowercase"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1">
              {(["All", "Low", "Medium", "High", "Critical"] as const).map(
                (r) => (
                  <button
                    key={r}
                    onClick={() => setSelectedRiskFilter(r)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold border transition-colors ${
                      selectedRiskFilter === r
                        ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
                    }`}
                  >
                    {r}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Tenants List */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-0">
            {filteredTenants.length === 0 ? (
              <div className="text-center py-5 sm:py-8 text-xs text-slate-400">
                No tenants match criteria
              </div>
            ) : (
              filteredTenants.map((t) => {
                const isActive = selectedTenant?.id === t.id;
                const risk = getRiskStatus(t.complianceScore);

                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTenant(t)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-all border ${
                      isActive
                        ? "bg-indigo-50/50 border-indigo-200 shadow-xs"
                        : "bg-white border-transparent hover:bg-slate-50/70 hover:border-slate-100"
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div
                        className={`text-xs font-bold truncate ${isActive ? "text-indigo-950" : "text-slate-800"}`}
                      >
                        {t.name}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-sans mt-0.5">
                        <span className="font-semibold">{t.country}</span>
                        <span>•</span>
                        <span>{t.businessType}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${risk.bg}`}
                      >
                        {t.complianceScore}%
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Center Section (Interactive Plots) */}
        <div className="lg:col-span-2 p-4 sm:p-5 lg:p-6 bg-slate-50/40 border-b xl:border-b-0 xl:border-r border-slate-200 flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {activeTab === "matrix" ? (
              <motion.div
                key="matrix"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col h-full justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider font-mono">
                      Compliance Density Grid
                    </h3>
                    <div className="flex items-center gap-4 text-[10px] text-slate-500 font-semibold">
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>{" "}
                        Low Risk
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>{" "}
                        Med
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>{" "}
                        High
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>{" "}
                        Crit
                      </div>
                    </div>
                  </div>

                  {/* 2D Heatmap Matrix Implementation */}
                  <div className="overflow-x-auto">
                    <div className="min-w-[480px]">
                      {/* Grid Header Industries */}
                      <div className="grid grid-cols-9 gap-1 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider font-mono text-center mb-1 pb-1 border-b border-slate-100">
                        <div className="text-left font-bold text-slate-500">
                          Country / Sector
                        </div>
                        {BUSINESS_TYPES.map((b) => (
                          <div key={b} className="truncate" title={b}>
                            {b}
                          </div>
                        ))}
                      </div>

                      {/* Matrix Grid Rows */}
                      <div className="space-y-1">
                        {COUNTRIES.map((country) => {
                          return (
                            <div
                              key={country}
                              className="grid grid-cols-9 gap-1 items-center"
                            >
                              <div className="text-[10px] font-extrabold text-slate-700 truncate pr-1">
                                {country}
                              </div>

                              {BUSINESS_TYPES.map((businessType) => {
                                const cell = matrixData.find(
                                  (c) =>
                                    c.country === country &&
                                    c.businessType === businessType,
                                );
                                const hasTenants = cell && cell.count > 0;
                                const activeMatch =
                                  hasTenants &&
                                  cell.tenantsList.some(
                                    (t) => t.id === selectedTenant?.id,
                                  );

                                // Color shading logic based on compliance score
                                let cellBg =
                                  "bg-slate-50 border-slate-100 hover:bg-slate-100";
                                let cellBorder = "border-slate-200";
                                if (hasTenants) {
                                  const score = cell.score;
                                  if (score >= 90) {
                                    cellBg =
                                      "bg-emerald-500/15 hover:bg-emerald-500/25";
                                    cellBorder = "border-emerald-300";
                                  } else if (score >= 70) {
                                    cellBg =
                                      "bg-amber-500/15 hover:bg-amber-500/25";
                                    cellBorder = "border-amber-300";
                                  } else if (score >= 50) {
                                    cellBg =
                                      "bg-orange-500/15 hover:bg-orange-500/25";
                                    cellBorder = "border-orange-300";
                                  } else {
                                    cellBg =
                                      "bg-rose-500/15 hover:bg-rose-500/25";
                                    cellBorder = "border-rose-300";
                                  }
                                }

                                return (
                                  <button
                                    key={businessType}
                                    onClick={() => {
                                      if (
                                        hasTenants &&
                                        cell.tenantsList.length > 0
                                      ) {
                                        setSelectedTenant(cell.tenantsList[0]);
                                      }
                                    }}
                                    disabled={!hasTenants}
                                    className={`h-9 border rounded-md transition-all flex flex-col items-center justify-center p-1 relative ${cellBg} ${cellBorder} ${
                                      activeMatch
                                        ? "ring-2 ring-indigo-600 ring-offset-1 z-10"
                                        : ""
                                    } ${hasTenants ? "cursor-pointer hover:shadow-2xs" : "opacity-40 cursor-not-allowed"}`}
                                    title={
                                      hasTenants
                                        ? `${cell.tenantsList.length} Tenant(s) at ${cell.score}% Compliance`
                                        : "No Tenants"
                                    }
                                  >
                                    {hasTenants ? (
                                      <>
                                        <span className="text-[10px] font-black text-slate-800 leading-none">
                                          {cell.score}%
                                        </span>
                                        <span className="text-[8px] font-extrabold text-slate-400 mt-0.5">
                                          {cell.count}{" "}
                                          {cell.count === 1
                                            ? "tenant"
                                            : "tenants"}
                                        </span>
                                      </>
                                    ) : (
                                      <span className="text-[11px] text-slate-300">
                                        •
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3.5 text-xs text-slate-500 mt-4">
                  <span className="font-extrabold text-slate-800 flex items-center gap-1.5 mb-1">
                    <Info className="w-3.5 h-3.5 text-indigo-500" />
                    How to read the Risk Grid:
                  </span>
                  Each block represents a geopolitical jurisdiction crossing
                  vertical business environments. High score values represent
                  secure and optimal isolated nodes. Lower percentages flag
                  sections calling for instant isolation and strict DORA
                  testing.
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="scatter"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col h-full"
              >
                <div className="mb-2">
                  <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider font-mono mb-1">
                    Risk Exposure Space Mapping
                  </h3>
                  <p className="text-xs text-slate-400">
                    Sovereign PII Scan volume mapped against compliance scores.
                    Bubble sizes scale with volatility metrics.
                  </p>
                </div>

                <div className="flex-1 min-h-[300px] h-[340px] mt-4 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                      margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
                    >
                      <XAxis
                        type="number"
                        dataKey="x"
                        name="Compliance Score"
                        unit="%"
                        domain={[30, 100]}
                        tick={{
                          fontSize: 9,
                          fill: "#64748b",
                          fontWeight: "bold",
                        }}
                        tickLine={{ stroke: "#cbd5e1" }}
                        axisLine={{ stroke: "#cbd5e1" }}
                      />
                      <YAxis
                        type="number"
                        dataKey="y"
                        name="PII Scans"
                        unit=""
                        domain={[0, 70000]}
                        tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                        tick={{
                          fontSize: 9,
                          fill: "#64748b",
                          fontWeight: "bold",
                        }}
                        tickLine={{ stroke: "#cbd5e1" }}
                        axisLine={{ stroke: "#cbd5e1" }}
                      />
                      <ZAxis
                        type="number"
                        dataKey="z"
                        range={[50, 450]}
                        name="Volatility"
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ strokeDasharray: "3 3" }}
                      />

                      <Scatter
                        name="Tenants"
                        data={scatterData}
                        onClick={(item: any) =>
                          item?.tenant && setSelectedTenant(item.tenant)
                        }
                      >
                        {scatterData.map((entry, index) => {
                          const isSelected =
                            selectedTenant?.id === entry.tenant.id;
                          const risk = getRiskStatus(
                            entry.tenant.complianceScore,
                          );
                          return (
                            <Cell
                              key={`cell-${index}`}
                              fill={risk.hex}
                              fillOpacity={isSelected ? 1.0 : 0.65}
                              stroke={isSelected ? "#4f46e5" : "#ffffff"}
                              strokeWidth={isSelected ? 2.5 : 1}
                              className="transition-all cursor-pointer"
                            />
                          );
                        })}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex justify-center gap-4 mt-2 text-[10px] font-bold text-slate-500 font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>{" "}
                    Compliance Suite Clean
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]"></span>{" "}
                    Vulnerabilities Discovered
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Section (Dynamic Tenant Inspector Panel) */}
        <div className="p-4 sm:p-5 lg:p-6 bg-slate-50/20 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider font-mono mb-4 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-slate-500" />
              Sovereign Asset Inspector
            </h3>

            {selectedTenant ? (
              <div className="space-y-5">
                {/* Basic Header */}
                <div>
                  <h4 className="text-base font-black text-slate-900 tracking-tight leading-snug">
                    {selectedTenant.name}
                  </h4>
                  <div className="text-xs text-indigo-600 font-mono mt-0.5 select-all">
                    {selectedTenant.domain}
                  </div>
                </div>

                {/* Risk & Score */}
                {(() => {
                  const risk = getRiskStatus(selectedTenant.complianceScore);
                  return (
                    <div className={`p-3.5 rounded-xl border ${risk.bg}`}>
                      <div className="text-[10px] font-bold uppercase tracking-wider opacity-85 mb-0.5">
                        Sovereign Risk Level
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-black">{risk.label}</span>
                        <span className="text-xs font-bold opacity-80">
                          ({selectedTenant.complianceScore}% Score)
                        </span>
                      </div>
                      <div className="text-[11px] mt-1.5 opacity-90 leading-relaxed">
                        {risk.desc}
                      </div>
                    </div>
                  );
                })()}

                {/* Detailed Tech Stats */}
                <div className="space-y-2.5 pt-2">
                  <div className="flex justify-between items-center text-xs pb-1.5 border-b border-slate-100">
                    <span className="text-slate-400 font-medium flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />{" "}
                      Jurisdiction
                    </span>
                    <span className="font-bold text-slate-800">
                      {selectedTenant.country}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs pb-1.5 border-b border-slate-100">
                    <span className="text-slate-400 font-medium flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />{" "}
                      Business Sector
                    </span>
                    <span className="font-bold text-slate-800">
                      {selectedTenant.businessType}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs pb-1.5 border-b border-slate-100">
                    <span className="text-slate-400 font-medium flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-slate-400" />{" "}
                      Database Cluster
                    </span>
                    <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                      {selectedTenant.databaseEngine}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs pb-1.5 border-b border-slate-100">
                    <span className="text-slate-400 font-medium flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-slate-400" /> Node
                      Sovereign IP
                    </span>
                    <span className="font-mono text-slate-800">
                      {selectedTenant.activeNode}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs pb-1.5 border-b border-slate-100">
                    <span className="text-slate-400 font-medium flex items-center gap-1.5 text-left">
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />{" "}
                      PII Records Audited
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      {selectedTenant.totalPiiScans.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium flex items-center gap-1.5">
                      Volatility Index
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">
                        {selectedTenant.volatility} / 10
                      </span>
                      {selectedTenant.trendType === "improving" ? (
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                      ) : selectedTenant.trendType === "deteriorating" ? (
                        <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                      ) : (
                        <span className="text-xs font-mono text-amber-500">
                          ~
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="pt-4">
                  <ActionableMitigation 
                    severityScore={Math.max(0, Math.min(10, 10 - (selectedTenant.complianceScore / 10)))}
                    vulnerabilityDescription={`Compliance assessment for ${selectedTenant.name} in ${selectedTenant.country} (${selectedTenant.businessType}).`}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-xs text-slate-400 flex flex-col items-center gap-2">
                <Info className="w-8 h-8 text-slate-300" />
                Select an active tenant or matrix point to inspect core
                compliance characteristics.
              </div>
            )}
          </div>

          {selectedTenant && (
            <div className="pt-6 border-t border-slate-100 mt-6">
              <button
                onClick={() => {
                  // Simulate navigating or firing role-switch event
                  const event = new CustomEvent("role-switch", {
                    detail: {
                      role: "CLIENT_ADMIN",
                      tenantId: selectedTenant.id,
                    },
                  });
                  window.dispatchEvent(event);
                }}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm"
              >
                <span>Login as Client Administrator</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
