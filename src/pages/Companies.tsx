import React, { useState } from 'react';
import { 
  Building2, Plus, Users, Search, MoreVertical, Building, Globe, MapPin, Tag, 
  Shield, AlertTriangle, CheckCircle, ExternalLink, Trash2, Edit, Cpu, Server, 
  Database, Cloud, Globe2, Lock, ShieldCheck, FileText, ChevronRight, X, Layers, Activity, ArrowLeftRight
} from 'lucide-react';
import { DigitalAssetFormModal, DigitalAssetFormData } from '../components/DigitalAssetFormModal';
import { InfrastructureComparisonModal } from '../components/InfrastructureComparisonModal';

interface DigitalAsset {
  id: string;
  name: string;
  type: 'Cloud Account' | 'Domain / URL' | 'Database Cluster' | 'Storage Bucket' | 'API Gateway';
  identifier: string;
  region: string;
  status: 'Secure' | 'Vulnerability Detected' | 'Unmonitored';
  encryption: 'AES-256' | 'TLS 1.3' | 'Unencrypted' | 'Standard';
}

interface CompanyEntity {
  id: string;
  name: string;
  legalName: string;
  registrationId: string;
  country: string;
  region: string;
  type: 'Parent Company' | 'Subsidiary' | 'Joint Venture' | 'Regional Branch';
  employees: number;
  dpoName: string;
  dpoEmail: string;
  status: 'Compliant' | 'Review Needed' | 'Action Required';
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  digitalAssets: DigitalAsset[];
  notes: string;
}

const RealTimeBadge: React.FC<{ status: string; riskLevel: string }> = ({ status, riskLevel }) => {
  let colorClasses = 'bg-emerald-100 text-emerald-700 border-emerald-200';
  let dotColor = 'bg-emerald-500';

  if (riskLevel === 'Medium') {
    colorClasses = 'bg-amber-100 text-amber-700 border-amber-200';
    dotColor = 'bg-amber-500';
  } else if (riskLevel === 'High' || riskLevel === 'Critical') {
    colorClasses = 'bg-rose-100 text-rose-700 border-rose-200';
    dotColor = 'bg-rose-500';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shadow-xs ${colorClasses}`}>
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor}`}></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`}></span>
      </span>
      {status}
    </span>
  );
};

export const Companies: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  
  const [companies, setCompanies] = useState<CompanyEntity[]>([
    {
      id: '1',
      name: 'Acme Corporation (HQ)',
      legalName: 'Acme Corporation Global SE',
      registrationId: 'DE-HRB-984210',
      country: 'Germany',
      region: 'EU-Central (Frankfurt)',
      type: 'Parent Company',
      employees: 1200,
      dpoName: 'Elena Rostova',
      dpoEmail: 'e.rostova@acme-corp.de',
      status: 'Compliant',
      riskLevel: 'Low',
      notes: 'Global headquarters and primary core data processing hub.',
      digitalAssets: [
        { id: 'da-1', name: 'AWS Production EU-Central', type: 'Cloud Account', identifier: 'aws-prod-01 (acc# 492081)', region: 'eu-central-1', status: 'Secure', encryption: 'AES-256' },
        { id: 'da-2', name: 'Main Corporate Portal', type: 'Domain / URL', identifier: 'https://acme-corp.de', region: 'Global Edge', status: 'Secure', encryption: 'TLS 1.3' },
        { id: 'da-3', name: 'Customer Core PostgreSQL', type: 'Database Cluster', identifier: 'rds-prod-customers.internal', region: 'eu-central-1', status: 'Secure', encryption: 'AES-256' },
        { id: 'da-4', name: 'Global API Gateway', type: 'API Gateway', identifier: 'api.acme-corp.de/v2', region: 'Multi-Region', status: 'Secure', encryption: 'TLS 1.3' }
      ]
    },
    {
      id: '2',
      name: 'Acme Logistics Ltd.',
      legalName: 'Acme Logistics United Kingdom Ltd',
      registrationId: 'UK-COMP-481920',
      country: 'United Kingdom',
      region: 'EU-West (London)',
      type: 'Subsidiary',
      employees: 450,
      dpoName: 'Marcus Vance',
      dpoEmail: 'm.vance@acmelogistics.co.uk',
      status: 'Review Needed',
      riskLevel: 'Medium',
      notes: 'Manages UK freight tracking and regional supply chain databases.',
      digitalAssets: [
        { id: 'da-5', name: 'Azure UK South Hub', type: 'Cloud Account', identifier: 'azure-uksouth-02', region: 'uksouth', status: 'Secure', encryption: 'AES-256' },
        { id: 'da-6', name: 'UK Logistics Portal', type: 'Domain / URL', identifier: 'https://logistics.acme.co.uk', region: 'London Edge', status: 'Vulnerability Detected', encryption: 'TLS 1.3' },
        { id: 'da-7', name: 'Freight S3 Archive', type: 'Storage Bucket', identifier: 'acme-uk-freight-backups', region: 'uksouth', status: 'Secure', encryption: 'AES-256' }
      ]
    },
    {
      id: '3',
      name: 'Acme Software SARL',
      legalName: 'Acme Software France SAS',
      registrationId: 'FR-RCS-783920',
      country: 'France',
      region: 'EU-West (Paris)',
      type: 'Subsidiary',
      employees: 85,
      dpoName: 'Aria Chen',
      dpoEmail: 'a.chen@acmesoftware.fr',
      status: 'Action Required',
      riskLevel: 'High',
      notes: 'R&D subsidiary handling experimental AI models and telemetry collectors.',
      digitalAssets: [
        { id: 'da-8', name: 'GCP Paris AI Cluster', type: 'Cloud Account', identifier: 'gcp-paris-ai-01', region: 'europe-west9', status: 'Vulnerability Detected', encryption: 'Standard' },
        { id: 'da-9', name: 'AI R&D Staging API', type: 'API Gateway', identifier: 'https://api-staging.acmesoftware.fr', region: 'Paris', status: 'Vulnerability Detected', encryption: 'TLS 1.3' },
        { id: 'da-10', name: 'Unmonitored Mongo DB', type: 'Database Cluster', identifier: 'mongo-dev-ai.internal', region: 'europe-west9', status: 'Unmonitored', encryption: 'Unencrypted' }
      ]
    }
  ]);

  const [selectedCompany, setSelectedCompany] = useState<CompanyEntity | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'overview' | 'infrastructure' | 'compliance'>('overview');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);

  // New entity form state
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newLegalName, setNewLegalName] = useState('');
  const [newRegistrationId, setNewRegistrationId] = useState('');
  const [newCountry, setNewCountry] = useState('Germany');
  const [newRegion, setNewRegion] = useState('EU-Central (Frankfurt)');
  const [newType, setNewType] = useState<'Parent Company' | 'Subsidiary' | 'Joint Venture' | 'Regional Branch'>('Subsidiary');
  const [newEmployees, setNewEmployees] = useState(50);
  const [newDpoName, setNewDpoName] = useState('');
  const [newDpoEmail, setNewDpoEmail] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const handleAddCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;

    const newEntity: CompanyEntity = {
      id: String(Date.now()),
      name: newCompanyName,
      legalName: newLegalName || `${newCompanyName} Inc.`,
      registrationId: newRegistrationId || `REG-${Math.floor(100000 + Math.random() * 900000)}`,
      country: newCountry,
      region: newRegion,
      type: newType,
      employees: Number(newEmployees) || 10,
      dpoName: newDpoName || 'Assigned Officer',
      dpoEmail: newDpoEmail || 'compliance@company.com',
      status: 'Compliant',
      riskLevel: 'Low',
      notes: newNotes || 'Newly onboarded sub-entity with automated compliance monitoring.',
      digitalAssets: [
        {
          id: `da-${Date.now()}-1`,
          name: `${newCompanyName} Primary AWS`,
          type: 'Cloud Account',
          identifier: `aws-${newCountry.toLowerCase().substring(0, 3)}-prod`,
          region: newRegion,
          status: 'Secure',
          encryption: 'AES-256'
        },
        {
          id: `da-${Date.now()}-2`,
          name: `${newCompanyName} Web Portal`,
          type: 'Domain / URL',
          identifier: `https://${newCompanyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
          region: 'Global Edge',
          status: 'Secure',
          encryption: 'TLS 1.3'
        }
      ]
    };

    setCompanies([newEntity, ...companies]);
    setIsAddModalOpen(false);
    // Reset form
    setNewCompanyName('');
    setNewLegalName('');
    setNewRegistrationId('');
    setNewDpoName('');
    setNewDpoEmail('');
    setNewNotes('');
  };

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                          c.country.toLowerCase().includes(search.toLowerCase()) ||
                          c.legalName.toLowerCase().includes(search.toLowerCase()) ||
                          c.dpoName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-5 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <Building2 className="w-8 h-8 mr-3 text-indigo-600" />
            Companies & Sub-Entities Hub
          </h1>
          <p className="text-slate-500 mt-1">
            Manage your organization hierarchy, regional subsidiaries, and detailed digital asset infrastructures.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsComparisonModalOpen(true)}
            className="flex items-center px-4 py-2.5 bg-white text-indigo-700 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition font-bold text-sm shadow-2xs cursor-pointer"
          >
            <ArrowLeftRight className="w-4 h-4 mr-2" />
            Compare Infrastructure Profiles
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-bold text-sm shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Subsidiary Entity
          </button>
        </div>
      </div>

      {/* Filter and Stats Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input 
            type="text" 
            placeholder="Search companies, DPO, country..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-indigo-500 focus:border-indigo-500" 
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {['All', 'Compliant', 'Review Needed', 'Action Required'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Companies Grid / Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            Registered Entities & Digital Infrastructure Inventory ({filteredCompanies.length})
          </div>
          <div className="text-xs text-slate-500 font-mono">
            Total Digital Assets: {companies.reduce((acc, c) => acc + c.digitalAssets.length, 0)} monitored
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-medium text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Entity Name & Legal ID</th>
                <th className="px-6 py-3.5">Region & Type</th>
                <th className="px-6 py-3.5">Digital Assets</th>
                <th className="px-6 py-3.5">Assigned DPO</th>
                <th className="px-6 py-3.5">Compliance Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCompanies.map(comp => (
                <tr key={comp.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mr-3 font-extrabold text-sm shadow-2xs">
                        {comp.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{comp.name}</div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">
                          {comp.legalName} • <span className="text-indigo-600">{comp.registrationId}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center text-slate-700 text-xs font-medium">
                        <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> {comp.country} ({comp.region})
                      </div>
                      <div className="flex items-center text-slate-500 text-[11px]">
                        <Tag className="w-3 h-3 mr-1.5 text-slate-400" /> {comp.type} • {comp.employees} employees
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-800 border border-slate-200 flex items-center gap-1.5">
                        <Server className="w-3.5 h-3.5 text-indigo-600" />
                        {comp.digitalAssets.length} Assets
                      </span>
                      {comp.digitalAssets.some(a => a.status === 'Vulnerability Detected' || a.status === 'Unmonitored') && (
                        <span className="w-2 h-2 rounded-full bg-rose-500" title="Infrastructure vulnerabilities found" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs">
                      <div className="font-bold text-slate-800">{comp.dpoName}</div>
                      <div className="text-slate-400 text-[11px] font-mono">{comp.dpoEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <RealTimeBadge status={comp.status} riskLevel={comp.riskLevel} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedCompany(comp);
                        setActiveModalTab('overview');
                      }}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg transition-colors border border-indigo-200 mr-2 cursor-pointer inline-flex items-center gap-1"
                    >
                      View Details & Assets
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCompanies.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <Building2 className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    No subsidiary companies match your search or filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Company & Infrastructure Modal */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full flex flex-col overflow-hidden border border-slate-200 max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md">
                  {selectedCompany.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold text-white">{selectedCompany.name}</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                      {selectedCompany.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Legal Name: {selectedCompany.legalName} • ID: {selectedCompany.registrationId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCompany(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-6 gap-4 sm:gap-6 shrink-0">
              <button
                onClick={() => setActiveModalTab('overview')}
                className={`py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                  activeModalTab === 'overview'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Building className="w-4 h-4" />
                Entity Overview & DPO
              </button>
              <button
                onClick={() => setActiveModalTab('infrastructure')}
                className={`py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                  activeModalTab === 'infrastructure'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Server className="w-4 h-4" />
                Digital Asset Infrastructure ({selectedCompany.digitalAssets.length})
              </button>
              <button
                onClick={() => setActiveModalTab('compliance')}
                className={`py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                  activeModalTab === 'compliance'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Compliance & Risk Posture
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
              {activeModalTab === 'overview' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Country / Region</span>
                      <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-indigo-600" />
                        {selectedCompany.country} ({selectedCompany.region})
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Headcount & Scale</span>
                      <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-indigo-600" />
                        {selectedCompany.employees} Active Personnel
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Risk Level</span>
                      <div className="pt-1">
                        <RealTimeBadge status={selectedCompany.status} riskLevel={selectedCompany.riskLevel} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-5 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-600" />
                      Assigned Data Protection Officer (DPO) & Legal Lead
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div className="bg-white p-3.5 rounded-lg border border-indigo-100 shadow-2xs">
                        <div className="text-xs text-slate-400 uppercase font-bold">Officer Name</div>
                        <div className="text-sm font-extrabold text-slate-900 mt-0.5">{selectedCompany.dpoName}</div>
                      </div>
                      <div className="bg-white p-3.5 rounded-lg border border-indigo-100 shadow-2xs">
                        <div className="text-xs text-slate-400 uppercase font-bold">Secure Contact Email</div>
                        <div className="text-sm font-extrabold text-indigo-600 mt-0.5 font-mono">{selectedCompany.dpoEmail}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Corporate & Operational Notes</h3>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-mono">
                      {selectedCompany.notes}
                    </div>
                  </div>
                </div>
              )}

              {activeModalTab === 'infrastructure' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Digital Asset Infrastructure</h3>
                      <p className="text-xs text-slate-500">Monitored cloud accounts, database clusters, storage buckets, and secure gateways for {selectedCompany.name}.</p>
                    </div>
                    <button
                      onClick={() => setIsAssetModalOpen(true)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Digital Asset Node
                    </button>
                  </div>

                  <div className="space-y-3">
                    {selectedCompany.digitalAssets.map((asset) => (
                      <div key={asset.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-indigo-200 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 mt-0.5">
                            {asset.type === 'Cloud Account' && <Cloud className="w-5 h-5" />}
                            {asset.type === 'Domain / URL' && <Globe2 className="w-5 h-5" />}
                            {asset.type === 'Database Cluster' && <Database className="w-5 h-5" />}
                            {asset.type === 'Storage Bucket' && <Server className="w-5 h-5" />}
                            {asset.type === 'API Gateway' && <Cpu className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-900 text-sm">{asset.name}</h4>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                {asset.type}
                              </span>
                            </div>
                            <div className="text-xs text-indigo-600 font-mono mt-0.5">{asset.identifier}</div>
                            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-3">
                              <span>Region: {asset.region}</span>
                              <span>Encryption: <strong className="text-slate-700">{asset.encryption}</strong></span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                            asset.status === 'Secure' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            asset.status === 'Vulnerability Detected' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {asset.status}
                          </span>
                          <button
                            onClick={() => {
                              const updatedAssets = selectedCompany.digitalAssets.filter(a => a.id !== asset.id);
                              setCompanies(companies.map(c => c.id === selectedCompany.id ? { ...c, digitalAssets: updatedAssets } : c));
                              setSelectedCompany({ ...selectedCompany, digitalAssets: updatedAssets });
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Remove asset"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeModalTab === 'compliance' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl space-y-1">
                      <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">GDPR / DORA Readiness</div>
                      <div className="text-2xl font-black text-emerald-950">96.4%</div>
                      <div className="text-xs text-emerald-700 font-medium">Fully audited & compliant</div>
                    </div>
                    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl space-y-1">
                      <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Active Scans</div>
                      <div className="text-2xl font-black text-indigo-950">24/7 Real-Time</div>
                      <div className="text-xs text-indigo-700 font-medium">Continuous telemetry feed</div>
                    </div>
                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl space-y-1">
                      <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Remediation SLA</div>
                      <div className="text-2xl font-black text-amber-950">&lt; 4 Hours</div>
                      <div className="text-xs text-amber-700 font-medium">Automated proxy patching active</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Recent Compliance Audit Log</h3>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 text-xs font-mono">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <span className="text-slate-800 font-bold">✓ Automated Cloud Asset Inventory Sync</span>
                        <span className="text-slate-400">2 hours ago</span>
                      </div>
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <span className="text-slate-800 font-bold">✓ TLS 1.3 Certificate Validation Check</span>
                        <span className="text-slate-400">1 day ago</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-800 font-bold">✓ DPO Contact Verification & Policy Sign-off</span>
                        <span className="text-slate-400">3 days ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
              <span className="text-xs text-slate-500 font-mono">
                Entity ID: {selectedCompany.id} • Last synchronized with cloud scanner gateway.
              </span>
              <button
                onClick={() => setSelectedCompany(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Subsidiary Entity Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-400" />
                Register New Subsidiary Entity & Digital Infrastructure
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCompany} className="p-4 sm:p-5 lg:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Entity Trade Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Acme Asia Pacific Pte"
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Legal Entity Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Acme APAC Pte Ltd"
                    value={newLegalName}
                    onChange={(e) => setNewLegalName(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Registration ID</label>
                  <input
                    type="text"
                    placeholder="e.g., SG-2026-9812"
                    value={newRegistrationId}
                    onChange={(e) => setNewRegistrationId(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Country</label>
                  <input
                    type="text"
                    placeholder="e.g., Singapore"
                    value={newCountry}
                    onChange={(e) => setNewCountry(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Entity Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white font-medium"
                  >
                    <option value="Subsidiary">Subsidiary</option>
                    <option value="Parent Company">Parent Company</option>
                    <option value="Joint Venture">Joint Venture</option>
                    <option value="Regional Branch">Regional Branch</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Cloud Region</label>
                  <input
                    type="text"
                    placeholder="e.g., ap-southeast-1 (Singapore)"
                    value={newRegion}
                    onChange={(e) => setNewRegion(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Headcount</label>
                  <input
                    type="number"
                    value={newEmployees}
                    onChange={(e) => setNewEmployees(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Assigned DPO</label>
                  <input
                    type="text"
                    placeholder="e.g., Liam Wong"
                    value={newDpoName}
                    onChange={(e) => setNewDpoName(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">DPO Secure Email</label>
                <input
                  type="email"
                  placeholder="l.wong@company.sg"
                  value={newDpoEmail}
                  onChange={(e) => setNewDpoEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Operational & Infrastructure Notes</label>
                <textarea
                  rows={2}
                  placeholder="Describe digital infrastructure scope and compliance requirements..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-sm cursor-pointer"
                >
                  Register Entity & Assets
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedCompany && (
        <DigitalAssetFormModal
          companyName={selectedCompany.name}
          isOpen={isAssetModalOpen}
          onClose={() => setIsAssetModalOpen(false)}
          onSubmit={(newAssetData: DigitalAssetFormData) => {
            const newAsset: DigitalAsset = {
              id: `da-${Date.now()}`,
              name: newAssetData.name,
              type: newAssetData.type,
              identifier: newAssetData.identifier,
              region: newAssetData.region,
              status: newAssetData.status,
              encryption: newAssetData.encryption
            };
            setCompanies(companies.map(c => c.id === selectedCompany.id ? { ...c, digitalAssets: [...c.digitalAssets, newAsset] } : c));
            setSelectedCompany({ ...selectedCompany, digitalAssets: [...selectedCompany.digitalAssets, newAsset] });
          }}
        />
      )}

      <InfrastructureComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
        companies={companies}
      />
    </div>
  );
};
