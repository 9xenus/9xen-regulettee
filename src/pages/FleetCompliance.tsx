import React, { useState } from 'react';
import {
  Truck,
  ShieldCheck,
  ShieldAlert,
  Search,
  Download,
  Plus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Zap,
  Globe,
  FileText,
  Sparkles,
  RefreshCw,
  Layers,
  Award,
  Users,
  Check,
  Battery,
  MapPin,
  Activity,
  FileCheck,
  Wrench
} from 'lucide-react';
import { generatePdfExport } from '../utils/pdfGenerator';
import { useNotification } from '../context/NotificationContext';

interface VehicleItem {
  id: string;
  vehicleName: string;
  type: 'Heavy EV Freight Truck' | 'Hydrogen Fuel Logistics' | 'Diesel Euro-6 Van' | 'Autonomous Enclave Cargo';
  driver: string;
  route: string;
  shiftHoursToday: number; // EC 561/2006 max 9h
  tachographStatus: 'Synchronized & Encrypted' | 'Rest Violation' | 'Unencrypted Edge Device';
  euroStandard: 'Euro 7 Zero-Emission' | 'Euro 6 Diesel' | 'Electric EV';
  co2SavedKg: number;
  maintenanceStatus: 'Passed' | 'Inspection Due' | 'Hazard Alert';
}

const INITIAL_FLEET: VehicleItem[] = [
  {
    id: 'FLT-2026-01',
    vehicleName: 'Sovereign EV Truck #14 (Volvo FH Electric)',
    type: 'Heavy EV Freight Truck',
    driver: 'Aleksei Ivanov',
    route: 'Frankfurt -> Rotterdam Enclave',
    shiftHoursToday: 7.5,
    tachographStatus: 'Synchronized & Encrypted',
    euroStandard: 'Euro 7 Zero-Emission',
    co2SavedKg: 1420,
    maintenanceStatus: 'Passed'
  },
  {
    id: 'FLT-2026-02',
    vehicleName: 'Logistics Cargo Van #09 (Mercedes eSprinter)',
    type: 'Heavy EV Freight Truck',
    driver: 'Marie Dubois',
    route: 'Paris -> Brussels Corridor',
    shiftHoursToday: 8.8,
    tachographStatus: 'Synchronized & Encrypted',
    euroStandard: 'Electric EV',
    co2SavedKg: 890,
    maintenanceStatus: 'Passed'
  },
  {
    id: 'FLT-2026-03',
    vehicleName: 'Standard Cargo Van #02 (Euro-6 Diesel)',
    type: 'Diesel Euro-6 Van',
    driver: 'Hans Müller',
    route: 'Munich Local Hub',
    shiftHoursToday: 9.8, // Exceeds 9h daily limit without 45m break!
    tachographStatus: 'Rest Violation',
    euroStandard: 'Euro 6 Diesel',
    co2SavedKg: 0,
    maintenanceStatus: 'Inspection Due'
  },
  {
    id: 'FLT-2026-04',
    vehicleName: 'Hydrogen Heavy Transport #01',
    type: 'Hydrogen Fuel Logistics',
    driver: 'Jan de Jong',
    route: 'Amsterdam -> Hamburg Port',
    shiftHoursToday: 6.2,
    tachographStatus: 'Synchronized & Encrypted',
    euroStandard: 'Euro 7 Zero-Emission',
    co2SavedKg: 2100,
    maintenanceStatus: 'Passed'
  }
];

export const FleetCompliance: React.FC = () => {
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState<'overview' | 'tachograph' | 'carbon' | 'maintenance' | 'fleet_list'>('overview');
  const [fleet, setFleet] = useState<VehicleItem[]>(INITIAL_FLEET);
  const [searchTerm, setSearchTerm] = useState('');

  // Tachograph Audit state
  const [isAuditingTachograph, setIsAuditingTachograph] = useState(false);
  const [tachographReport, setTachographReport] = useState<any>(null);

  const filteredFleet = fleet.filter(
    (v) =>
      v.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCo2Saved = fleet.reduce((acc, v) => acc + v.co2SavedKg, 0);
  const compliantCount = fleet.filter((v) => v.tachographStatus === 'Synchronized & Encrypted' && v.shiftHoursToday <= 9.0).length;

  const handleAuditTachograph = () => {
    setIsAuditingTachograph(true);
    setTachographReport(null);

    setTimeout(() => {
      setIsAuditingTachograph(false);
      setTachographReport({
        totalVehiclesAudited: fleet.length,
        violationsFound: 1,
        mobilityPackagePassed: false,
        findings: [
          {
            vehicle: 'Standard Cargo Van #02 (Hans Müller)',
            issue: 'Driver exceeded 9.0 hour daily driving limit (9.8h recorded). Violates EC 561/2006 Article 6.',
            fineRisk: '€1,500 Fine per EU Mobility Package I Clause 4'
          }
        ]
      });
      showToast('Tachograph & Driver Rest Audit finished. 1 shift violation flagged.', 'info');
    }, 1100);
  };

  const handleExportPDF = () => {
    const headers = ['Vehicle ID', 'Vehicle Name', 'Driver', 'Route', 'Shift Hours', 'Tachograph Status', 'Euro Standard', 'CO2 Saved (kg)'];
    const rows = filteredFleet.map((v) => [
      v.id,
      v.vehicleName,
      v.driver,
      v.route,
      `${v.shiftHoursToday}h`,
      v.tachographStatus,
      v.euroStandard,
      `${v.co2SavedKg} kg`
    ]);
    generatePdfExport('EuroPrivacy Fleet Telematics & Mobility Package Audit Report', headers, rows, 'fleet-compliance-report');
    showToast('Fleet Compliance PDF exported successfully.', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 space-y-5 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1 font-mono">
            <Truck className="w-4 h-4" />
            EU Mobility Package I & ISO 21434 Vehicle Telematics
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Fleet & Transport Compliance</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            Automate EU Regulation EC 561/2006 tachograph driver rest logs, Euro 6/7 carbon emissions accounting, ISO 21434 vehicle cybersecurity, and route sovereignty audits.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export Fleet Audit Ledger
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Fleet Vehicles</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{fleet.length}</p>
            <span className="text-[11px] text-slate-500 font-medium">100% Telematics Connected</span>
          </div>
          <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
            <Truck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tachograph Compliant</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{compliantCount} / {fleet.length}</p>
            <span className="text-[11px] text-emerald-600 font-semibold">{Math.round((compliantCount / fleet.length) * 100)}% Pass Rate</span>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Shift Rest Violations</p>
            <p className="text-2xl font-black text-rose-600 mt-1">{fleet.length - compliantCount}</p>
            <span className="text-[11px] text-rose-600 font-semibold">EC 561/2006 Flag</span>
          </div>
          <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fleet CO2 Offsets</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{(totalCo2Saved / 1000).toFixed(1)} <span className="text-xs font-normal text-slate-400">Tons</span></p>
            <span className="text-[11px] text-emerald-600 font-semibold">Euro 7 / EV Transition</span>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-100 text-amber-600 rounded-xl">
            <Zap className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 text-sm font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'overview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Overview & EU Mobility Rules
        </button>
        <button
          onClick={() => setActiveTab('tachograph')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'tachograph' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4 text-indigo-600" />
          Tachograph & Shift Rest Auditor
        </button>
        <button
          onClick={() => setActiveTab('carbon')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'carbon' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Zap className="w-4 h-4 text-emerald-600" />
          EV & Carbon Emissions (Scope 1)
        </button>
        <button
          onClick={() => setActiveTab('maintenance')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'maintenance' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wrench className="w-4 h-4 text-amber-600" />
          Maintenance & Roadworthiness
        </button>
        <button
          onClick={() => setActiveTab('fleet_list')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'fleet_list' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          Fleet Vehicle Roster ({filteredFleet.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 lg:p-6 rounded-2xl shadow-md border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 text-xs font-bold font-mono flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                EU MOBILITY PACKAGE I & ISO 21434 ACTIVE
              </span>
              <span className="text-xs text-slate-400 font-mono">Live Edge Telematics</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Sovereign Fleet & Freight Logistics Compliance</h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Ensure full compliance with EU driver shift limits, digital Smart Tachograph II requirements, ISO 21434 vehicle cybersecurity against CAN-bus hacking, and Scope 1 freight emissions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs space-y-3">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <Clock className="w-4 h-4" />
                Digital Tachograph (EC 561/2006)
              </div>
              <p className="text-xs text-slate-500">
                Automatic tracking of daily driving caps (max 9 hours), mandatory 45-minute rest breaks, and weekly rest periods.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs space-y-3">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <ShieldCheck className="w-4 h-4" />
                ISO 21434 Vehicle Cybersecurity
              </div>
              <p className="text-xs text-slate-500">
                Cryptographic edge encryption for telematics data units, securing vehicle CAN-bus communications against spoofing.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs space-y-3">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <Zap className="w-4 h-4" />
                Euro 6 / Euro 7 Decarbonization
              </div>
              <p className="text-xs text-slate-500">
                Track electric vehicle (EV) fleet conversion metrics to meet corporate CSRD Scope 1 reduction mandates.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TACHOGRAPH AUDIT */}
      {activeTab === 'tachograph' && (
        <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                Smart Tachograph & Driver Rest Limit Inspector
              </h3>
              <p className="text-xs text-slate-500 mt-1">Audit real-time telematics feeds against EU Regulation EC 561/2006.</p>
            </div>
            <button
              onClick={handleAuditTachograph}
              disabled={isAuditingTachograph}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isAuditingTachograph ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isAuditingTachograph ? 'Auditing Telematics...' : 'Execute Tachograph Audit'}
            </button>
          </div>

          {tachographReport && (
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Audit Status</p>
                  <p className="text-xl font-black text-rose-600">{tachographReport.violationsFound} Rest Violation Flagged</p>
                </div>
                <span className="px-3 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-full">Non-Compliant Shift</span>
              </div>

              {tachographReport.findings.map((f: any, idx: number) => (
                <div key={idx} className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs space-y-1 text-rose-900">
                  <p className="font-bold">{f.vehicle}</p>
                  <p>• {f.issue}</p>
                  <p className="font-bold text-rose-800">Penalty Exposure: {f.fineRisk}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CARBON */}
      {activeTab === 'carbon' && (
        <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-600" />
            Fleet Scope 1 Carbon Emissions & EV Transition
          </h3>
          <p className="text-xs text-slate-500">
            Monitor real-time tailpipe emissions versus zero-emission EV savings across all regional delivery routes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
              <span className="text-xs font-bold text-emerald-800 uppercase">EV & Hydrogen Fleet CO2 Savings</span>
              <p className="text-3xl font-black text-emerald-900">{(totalCo2Saved / 1000).toFixed(2)} Metric Tons CO2</p>
              <p className="text-xs text-emerald-700">Equivalent to planting 180 mature trees across European corridors.</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase">Euro 7 Zero-Emission Transition</span>
              <p className="text-3xl font-black text-slate-900">75% Electric Fleet Ratio</p>
              <p className="text-xs text-slate-600">3 of 4 vehicles fully electric/hydrogen powered.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MAINTENANCE */}
      {activeTab === 'maintenance' && (
        <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-600" />
                Fleet Maintenance & Roadworthiness Inspector
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Periodic safety inspection status, defect rectification and COC-required certificate tracking across the fleet.
              </p>
            </div>
            <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
              {fleet.filter((v) => v.maintenanceStatus === 'Hazard Alert').length} Hazard Alerts
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
              <span className="text-xs font-bold text-emerald-800 uppercase">Roadworthy / Passed</span>
              <p className="text-3xl font-black text-emerald-900">{fleet.filter((v) => v.maintenanceStatus === 'Passed').length}</p>
              <p className="text-xs text-emerald-700">Inspections current with valid COC certificates.</p>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
              <span className="text-xs font-bold text-amber-800 uppercase">Inspection Due</span>
              <p className="text-3xl font-black text-amber-900">{fleet.filter((v) => v.maintenanceStatus === 'Inspection Due').length}</p>
              <p className="text-xs text-amber-700">Scheduled maintenance window approaching.</p>
            </div>
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
              <span className="text-xs font-bold text-rose-800 uppercase">Hazard Alert</span>
              <p className="text-3xl font-black text-rose-900">{fleet.filter((v) => v.maintenanceStatus === 'Hazard Alert').length}</p>
              <p className="text-xs text-rose-700">Immediate roadworthiness action required.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                  <th className="p-3">ID</th>
                  <th className="p-3">Vehicle Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Maintenance Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fleet.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-slate-400 font-bold">{v.id}</td>
                    <td className="p-3 font-bold text-slate-900">{v.vehicleName}</td>
                    <td className="p-3 text-slate-600">{v.type}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          v.maintenanceStatus === 'Passed'
                            ? 'bg-emerald-100 text-emerald-700'
                            : v.maintenanceStatus === 'Inspection Due'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {v.maintenanceStatus}
                      </span>
                    </td>
                    <td className="p-3">
                      {v.maintenanceStatus === 'Passed' ? (
                        <span className="flex items-center gap-1 text-emerald-600 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Certified
                        </span>
                      ) : (
                        <button className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-bold hover:bg-slate-700 transition cursor-pointer">
                          Schedule Inspection
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: ROSTER */}
      {activeTab === 'fleet_list' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-4 sm:p-5 lg:p-6 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search fleet by name, driver, or route..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                  <th className="p-3">ID</th>
                  <th className="p-3">Vehicle Name</th>
                  <th className="p-3">Driver</th>
                  <th className="p-3">Route</th>
                  <th className="p-3">Shift Hours Today</th>
                  <th className="p-3">Tachograph Status</th>
                  <th className="p-3">Emission Standard</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFleet.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-slate-400 font-bold">{v.id}</td>
                    <td className="p-3 font-bold text-slate-900">{v.vehicleName}</td>
                    <td className="p-3 text-slate-600">{v.driver}</td>
                    <td className="p-3 text-slate-600">{v.route}</td>
                    <td className="p-3 font-bold">{v.shiftHoursToday}h / 9.0h</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          v.tachographStatus === 'Synchronized & Encrypted' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {v.tachographStatus}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-700">{v.euroStandard}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
