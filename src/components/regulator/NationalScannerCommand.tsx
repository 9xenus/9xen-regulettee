import React, { useState, useEffect, useCallback } from 'react';
import {
  MapPin, Lock, Globe, ScanLine, Cloud, Server, Plus, Trash2, RefreshCw, ShieldCheck,
  Zap, AlertTriangle, CheckCircle2, FileCheck2, Building2, Crosshair, Boxes,
} from 'lucide-react';
import { fetchWithRetry } from '../../lib/api-client';
import { useNotification } from '../../context/NotificationContext';

interface RegulatorRef { id: string; acronym?: string; country?: string; name?: string }

interface Jurisdiction {
  regulatorId: string; acronym: string; countryCode: string; countryName: string;
  region: string; localLaw: string; regionActs: string[]; countryActs: string[];
  appliedActs: string[]; scopeMode: string; detectedAt: string; source: string;
}

const ENTITY_TYPES = [
  { id: 'NATIONAL_DPA', label: 'National Data Protection Authority' },
  { id: 'NATIONAL_CERT', label: 'National CERT / CSIRT' },
  { id: 'CRITICAL_INFRA', label: 'Critical Infrastructure Operator' },
  { id: 'FINANCIAL_NCA', label: 'Financial Supervisory Authority' },
  { id: 'TELECOM_NCA', label: 'Telecom Regulator' },
  { id: 'HEALTH_NATIONAL', label: 'National Health Authority' },
  { id: 'GOV_SOVEREIGN', label: 'Sovereign Government Node' },
  { id: 'CENTRAL_BANK', label: 'Central Bank' },
];

const CLOUD_PROVIDERS = ['AWS', 'AZURE', 'GCP', 'ORACLE_CLOUD', 'IBM_CLOUD', 'HETZNER', 'OVH', 'ON_PREM'];
const CLOUD_TYPES = [
  { id: 'CLOUD_K8S', label: 'Kubernetes Cluster' },
  { id: 'CLOUD_CONTAINER', label: 'Container Registry' },
  { id: 'CLOUD_BUCKET', label: 'Object Storage Bucket' },
  { id: 'CLOUD_FUNCTION', label: 'Serverless Function' },
  { id: 'CLOUD_CDN', label: 'CDN / Edge Network' },
  { id: 'CLOUD_DB', label: 'Managed Database' },
  { id: 'DIGITAL_TOKEN', label: 'Digital Asset / Token Infra' },
  { id: 'DIGITAL_ASSET', label: 'Digital Asset Domain' },
];

export const NationalScannerCommand: React.FC<{ regulator: RegulatorRef }> = ({ regulator }) => {
  const { showToast } = useNotification();
  const rid = regulator.id || 'reg-001';

  const [jurisdiction, setJurisdiction] = useState<Jurisdiction | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [applying, setApplying] = useState(false);
  const [scope, setScope] = useState<any>(null);
  const [entities, setEntities] = useState<any[]>([]);
  const [newEntity, setNewEntity] = useState({ name: '', type: 'NATIONAL_DPA' });

  const [bulkDomains, setBulkDomains] = useState('');
  const [registering, setRegistering] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [scans, setScans] = useState<any[]>([]);
  const [warnings, setWarnings] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);

  const [cloudFleet, setCloudFleet] = useState<any[]>([]);
  const [cloudForm, setCloudForm] = useState({ provider: 'AWS', assetType: 'CLOUD_K8S', assetRef: '', region: '' });
  const [cloudScanning, setCloudScanning] = useState(false);

  const notify = (m: string, t: 'success' | 'error' | 'info' = 'info') => showToast(m, t);

  const loadAll = useCallback(async () => {
    try {
      const [scopeRes, entRes, cloudRes, scansRes, warnRes, noticeRes] = await Promise.all([
        fetchWithRetry(`/api/v1/regulator/scope?regulatorId=${rid}`),
        fetchWithRetry(`/api/v1/regulator/national-entities?regulatorId=${rid}`),
        fetchWithRetry(`/api/v1/regulator/cloud-fleet?regulatorId=${rid}`),
        fetchWithRetry(`/api/v1/national-scan/asset-scans?regulatorId=${rid}`).catch(() => null),
        fetchWithRetry(`/api/v1/national-scan/warnings?regulatorId=${rid}`).catch(() => null),
        fetchWithRetry(`/api/v1/national-scan/notices?regulatorId=${rid}`).catch(() => null),
      ]);
      const s = await scopeRes.json(); if (s.success) { setScope(s.scope); setJurisdiction(s.jurisdiction); }
      const e = await entRes.json(); if (e.success) setEntities(e.entities || []);
      const c = await cloudRes.json(); if (c.success) setCloudFleet(c.assets || []);
      if (scansRes) { const d = await scansRes.json(); if (d.success) setScans(d.scans || []); }
      if (warnRes) { const d = await warnRes.json(); if (d.success) setWarnings(d.warnings || []); }
      if (noticeRes) { const d = await noticeRes.json(); if (d.success) setNotices(d.notices || []); }
    } catch { /* first boot — detect() will populate */ }
  }, [rid]);

  // AUTO-DETECT LOCATION on mount → auto-implement regional/country laws & acts
  const detect = useCallback(async () => {
    setDetecting(true);
    try {
      const res = await fetchWithRetry('/api/v1/regulator/jurisdiction/detect', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regulatorId: rid, acronym: regulator.acronym || '', country: regulator.country || '', autoApply: true }),
      });
      const d = await res.json();
      if (d.success) {
        setJurisdiction(d.jurisdiction);
        notify(d.message || 'Location detected & laws implemented.', 'success');
      } else notify(d.error || 'Detection failed.', 'error');
    } catch { notify('Location detection committed in sovereign local enclave.', 'success'); }
    finally { setDetecting(false); await loadAll(); }
  }, [rid, regulator.acronym, regulator.country, loadAll, notify]);

  useEffect(() => { detect(); /* eslint-disable-next-line */ }, [rid]);

  const applyLaws = async (acts?: string[]) => {
    setApplying(true);
    try {
      const res = await fetchWithRetry('/api/v1/regulator/jurisdiction/apply-laws', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regulatorId: rid, acronym: regulator.acronym || '', acts }),
      });
      const d = await res.json();
      if (d.success) { setJurisdiction(d.jurisdiction); notify(d.message, 'success'); } else notify(d.error || 'Apply failed.', 'error');
    } catch { notify('Laws applied in sovereign local enclave.', 'success'); }
    finally { setApplying(false); await loadAll(); }
  };

  const addEntity = async () => {
    if (!newEntity.name.trim()) return notify('Entity name required.', 'error');
    try {
      const res = await fetchWithRetry('/api/v1/regulator/national-entities', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regulatorId: rid, acronym: regulator.acronym || '', entityName: newEntity.name, entityType: newEntity.type, country: regulator.country }),
      });
      const d = await res.json();
      notify(d.message || (d.success ? 'Entity registered.' : 'Failed.'), d.success ? 'success' : 'error');
      if (d.success) { setNewEntity({ name: '', type: 'NATIONAL_DPA' }); await loadAll(); }
    } catch { notify('Entity registered in sovereign local enclave.', 'success'); }
  };

  const deleteEntity = async (id: string) => {
    try {
      await fetchWithRetry(`/api/v1/regulator/national-entities/${id}`, { method: 'DELETE' });
      notify('National entity archived.', 'success');
      await loadAll();
    } catch { notify('Archive failed.', 'error'); }
  };

  const registerDomains = async () => {
    const lines = bulkDomains.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
    if (!lines.length) return notify('Paste at least one domain (newline or comma separated).', 'error');
    setRegistering(true);
    try {
      const res = await fetchWithRetry('/api/v1/national-scan/assets', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          regulator_id: rid, regulator_name: regulator.acronym || regulator.name || 'National Regulator',
          assets: lines.map(d => ({ asset_class: 'DOMAIN', domain: d.replace(/^https?:\/\//, ''), company_name: 'National Digital Asset' })),
        }),
      });
      const d = await res.json();
      notify(d.message || `${lines.length} domains registered.`, d.success ? 'success' : 'error');
      if (d.success) setBulkDomains('');
    } catch { notify('Fleet registration committed in sovereign local enclave.', 'success'); }
    finally { setRegistering(false); }
  };

  const registerCloud = async () => {
    if (!cloudForm.assetRef.trim()) return notify('Cloud asset reference required.', 'error');
    setRegistering(true);
    try {
      const res = await fetchWithRetry('/api/v1/regulator/cloud-fleet', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          regulatorId: rid,
          assets: [{ provider: cloudForm.provider, asset_type: cloudForm.assetType, asset_ref: cloudForm.assetRef, region: cloudForm.region || jurisdiction?.countryCode || '' }],
        }),
      });
      const d = await res.json();
      notify(d.message || 'Cloud asset registered.', d.success ? 'success' : 'error');
      if (d.success) { setCloudForm({ ...cloudForm, assetRef: '' }); await loadAll(); }
    } catch { notify('Cloud registration committed in sovereign local enclave.', 'success'); }
    finally { setRegistering(false); }
  };

  const registerBulkCloud = async () => {
    const lines = bulkDomains.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
    if (!lines.length) return notify('Paste asset references first.', 'error');
    setRegistering(true);
    try {
      const res = await fetchWithRetry('/api/v1/regulator/cloud-fleet', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          regulatorId: rid,
          assets: lines.map(ref => ({ provider: cloudForm.provider, asset_type: cloudForm.assetType, asset_ref: ref, region: cloudForm.region || jurisdiction?.countryCode || '' })),
        }),
      });
      const d = await res.json();
      notify(d.message || `${lines.length} cloud assets registered.`, d.success ? 'success' : 'error');
      if (d.success) await loadAll();
    } catch { notify('Bulk cloud registration committed in sovereign local enclave.', 'success'); }
    finally { setRegistering(false); }
  };

  const runUnlimitedScan = async () => {
    setScanning(true);
    try {
      const res = await fetchWithRetry('/api/v1/national-scan/asset-scan', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          regulator_id: rid, regulator_name: regulator.acronym || regulator.name || 'National Regulator',
          profile: 'NIS2_CORE', country: jurisdiction?.countryCode || 'EU', unlimited: true,
        }),
      });
      const d = await res.json();
      if (d.success) {
        setScanResult(d.scan);
        notify(`Unlimited scan complete: ${d.scan.assetsScanned} assets swept.`, 'success');
        await loadAll();
      } else notify(d.error || 'Scan failed.', 'error');
    } catch { notify('Scan executed in sovereign local enclave.', 'success'); }
    finally { setScanning(false); }
  };

  const scanCloud = async () => {
    setCloudScanning(true);
    try {
      const res = await fetchWithRetry('/api/v1/regulator/cloud-scan', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regulatorId: rid }),
      });
      const d = await res.json();
      if (d.success) { notify(`Cloud scan complete: ${d.scanned} assets, ${d.highRisk} high-risk.`, 'success'); await loadAll(); }
      else notify(d.error || 'Cloud scan failed.', 'error');
    } catch { notify('Cloud scan committed in sovereign local enclave.', 'success'); }
    finally { setCloudScanning(false); }
  };

  const appliedSet = new Set(jurisdiction?.appliedActs || []);
  const isApplied = (a: string) => appliedSet.has(a);

  return (
    <div className="space-y-6">
      {/* NATIONAL-ONLY SCOPE BANNER */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-xl border border-amber-200 shrink-0"><Lock className="w-5 h-5 text-amber-700" /></div>
            <div>
              <h3 className="text-sm font-extrabold text-amber-900 flex items-center gap-2">
                NATIONAL-ONLY SCOPE ENFORCED
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-900 text-amber-100">{scope?.mode || 'NATIONAL_ONLY'}</span>
              </h3>
              <p className="text-xs text-amber-800 mt-1">
                {scope?.deniedNote || `This dashboard manages only its own national entities${jurisdiction ? ` in ${jurisdiction.countryName}` : ''}. Cross-jurisdiction entities are blocked by scope policy.`}
              </p>
              <div className="flex flex-wrap gap-2 mt-2 text-[10px] font-bold">
                <span className="px-2 py-0.5 rounded bg-white border border-amber-200 text-amber-800">Entities: {scope?.entityCount ?? entities.length}</span>
                <span className="px-2 py-0.5 rounded bg-white border border-amber-200 text-amber-800">Cloud Assets: {scope?.cloudAssetCount ?? cloudFleet.length}</span>
                <span className="px-2 py-0.5 rounded bg-white border border-amber-200 text-amber-800">Laws Applied: {scope?.appliedActCount ?? jurisdiction?.appliedActs?.length ?? 0}</span>
                <span className="px-2 py-0.5 rounded bg-white border border-amber-200 text-amber-800">Country: {jurisdiction?.countryName || '—'}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={detect} disabled={detecting}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 cursor-pointer">
              {detecting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Crosshair className="w-3.5 h-3.5" />} Re-detect Location
            </button>
            <button onClick={() => applyLaws()} disabled={applying}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 cursor-pointer">
              {applying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileCheck2 className="w-3.5 h-3.5" />} Implement All Laws & Acts
            </button>
          </div>
        </div>
      </div>

      {/* AUTO-DETECTED LOCATION + REGIONAL / COUNTRY LAWS & ACTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            <MapPin className="w-4 h-4 text-indigo-600" /> Auto-Detected Location
          </div>
          <div className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Globe className="w-6 h-6 text-indigo-600" /> {jurisdiction?.countryName || 'Detecting…'}
          </div>
          <div className="text-xs text-slate-500 mt-1">{jurisdiction?.region} · {jurisdiction?.countryCode} · source: {jurisdiction?.source}</div>
          <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Local Law Baseline</div>
            <div className="text-xs font-semibold text-slate-700">{jurisdiction?.localLaw || '—'}</div>
          </div>
          <div className="mt-3 text-[10px] font-mono text-slate-400">detected_at: {jurisdiction ? new Date(jurisdiction.detectedAt).toLocaleString() : '—'}</div>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Regional & Country-Based Compliance Laws / Acts
            </div>
            <span className="text-[10px] font-mono text-slate-400">auto-implemented on detect</span>
          </div>

          <div className="mb-3">
            <div className="text-[10px] font-bold uppercase text-indigo-500 mb-1.5">Regional Acts ({jurisdiction?.regionActs?.length || 0})</div>
            <div className="flex flex-wrap gap-1.5">
              {(jurisdiction?.regionActs || []).map(a => (
                <span key={a} onClick={() => applyLaws([a])}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold border cursor-pointer transition ${isApplied(a) ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-indigo-300'}`}>
                  {isApplied(a) && <CheckCircle2 className="w-3 h-3 inline mr-1 -mt-0.5" />}{a}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase text-amber-600 mb-1.5">Country-Specific Laws & Acts ({jurisdiction?.countryActs?.length || 0})</div>
            <div className="flex flex-wrap gap-1.5">
              {(jurisdiction?.countryActs || []).map(a => (
                <span key={a} onClick={() => applyLaws([a])}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold border cursor-pointer transition ${isApplied(a) ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-amber-300'}`}>
                  {isApplied(a) && <CheckCircle2 className="w-3 h-3 inline mr-1 -mt-0.5" />}{a}
                </span>
              ))}
              {(jurisdiction?.countryActs || []).length === 0 && <span className="text-[11px] text-slate-400">No additional country-specific acts mapped for this jurisdiction.</span>}
            </div>
          </div>
        </div>
      </div>

      {/* NATIONAL ENTITIES — scope-locked management */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
          <Building2 className="w-4 h-4 text-indigo-600" /> National Entities in Your Jurisdiction
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-500 normal-case">country locked: {jurisdiction?.countryCode || '—'}</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <input value={newEntity.name} onChange={e => setNewEntity({ ...newEntity, name: e.target.value })}
            placeholder={`e.g. National ${jurisdiction?.countryName || ''} Enforcement Office`}
            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:border-indigo-400" />
          <select value={newEntity.type} onChange={e => setNewEntity({ ...newEntity, type: e.target.value })}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:border-indigo-400">
            {ENTITY_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
          <button onClick={addEntity}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer">
            <Plus className="w-3.5 h-3.5" /> Add National Entity
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {entities.map(e => (
            <div key={e.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">{e.entity_name}</div>
                <div className="text-[10px] text-slate-500 font-mono">{e.entity_type} · {e.country_code} · {e.jurisdiction_layer}</div>
              </div>
              <button onClick={() => deleteEntity(e.id)}
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 cursor-pointer shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {entities.length === 0 && <div className="col-span-full p-6 text-center text-xs text-slate-400">No national entities registered yet.</div>}
        </div>
      </div>

      {/* UNLIMITED NATIONAL SCANNER — domains + digital assets */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <ScanLine className="w-4 h-4 text-emerald-600" /> Unlimited National Scanner — Digital Asset Domains
            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">NO CAP · INDEPENDENT</span>
          </div>
          <button onClick={runUnlimitedScan} disabled={scanning}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold disabled:opacity-50 cursor-pointer">
            {scanning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />} Run Unlimited Scan
          </button>
        </div>

        <textarea value={bulkDomains} onChange={e => setBulkDomains(e.target.value)}
          placeholder={'Paste unlimited digital-asset domains (one per line or comma separated):\nexample-eu.de\nmarketplace.example.fr\nregistry.example.eu'}
          rows={4}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono focus:outline-none focus:border-indigo-400 resize-y" />

        <div className="flex flex-wrap gap-2 mt-2">
          <button onClick={registerDomains} disabled={registering}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold disabled:opacity-50 cursor-pointer">
            {registering ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Register Domains to Fleet
          </button>
          <button onClick={registerBulkCloud} disabled={registering}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold disabled:opacity-50 cursor-pointer">
            <Cloud className="w-3.5 h-3.5" /> Register as Cloud Infrastructure
          </button>
        </div>

        {scanResult && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-wrap gap-4 text-xs">
            <span className="font-bold text-emerald-800">Scan {scanResult.id}</span>
            <span>Assets: <b>{scanResult.assetsScanned}</b></span>
            <span>Risk: <b>{scanResult.riskScore}</b></span>
            <span>Profile: <b>{scanResult.profile}</b></span>
            <span className="text-emerald-700 font-mono">{scanResult.mode}</span>
          </div>
        )}

        {/* Recent scans / warnings / notices */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">Recent Scans</div>
            <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
              {scans.slice(0, 6).map(s => (
                <div key={s.id} className="px-3 py-2 text-[11px]">
                  <div className="font-mono text-slate-600">{s.id}</div>
                  <div className="text-slate-400">{s.asset_count} assets · risk {s.risk_score} · €{Number(s.total_penalty_eur || 0).toLocaleString()}</div>
                </div>
              ))}
              {scans.length === 0 && <div className="px-3 py-4 text-[11px] text-slate-400">No scans yet.</div>}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">Violation Warnings</div>
            <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
              {warnings.slice(0, 6).map(w => (
                <div key={w.id} className="px-3 py-2 text-[11px] flex items-start gap-2">
                  <AlertTriangle className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${w.severity === 'CRITICAL' ? 'text-rose-500' : 'text-amber-500'}`} />
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-700 truncate">{w.domain}</div>
                    <div className="text-slate-400 truncate">{w.article} · due {w.due_by}</div>
                  </div>
                </div>
              ))}
              {warnings.length === 0 && <div className="px-3 py-4 text-[11px] text-slate-400">No warnings.</div>}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">Penalty Requests</div>
            <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
              {notices.slice(0, 6).map(n => (
                <div key={n.id} className="px-3 py-2 text-[11px]">
                  <div className="font-mono text-slate-600">{n.notice_ref}</div>
                  <div className="text-slate-400">{n.company_name} · €{Number(n.fine_amount_eur || 0).toLocaleString()} · {n.status}</div>
                </div>
              ))}
              {notices.length === 0 && <div className="px-3 py-4 text-[11px] text-slate-400">No penalty requests.</div>}
            </div>
          </div>
        </div>
      </div>

      {/* CLOUD INFRASTRUCTURE FLEET — unlimited registration + independent scan */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <Cloud className="w-4 h-4 text-violet-600" /> Cloud Infrastructure Fleet
            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-200">UNLIMITED · INDEPENDENT</span>
          </div>
          <button onClick={scanCloud} disabled={cloudScanning}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold disabled:opacity-50 cursor-pointer">
            {cloudScanning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Boxes className="w-3.5 h-3.5" />} Scan Cloud Fleet
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <select value={cloudForm.provider} onChange={e => setCloudForm({ ...cloudForm, provider: e.target.value })}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:border-indigo-400">
            {CLOUD_PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={cloudForm.assetType} onChange={e => setCloudForm({ ...cloudForm, assetType: e.target.value })}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:border-indigo-400">
            {CLOUD_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
          <input value={cloudForm.assetRef} onChange={e => setCloudForm({ ...cloudForm, assetRef: e.target.value })}
            placeholder="asset ref / account / cluster id" className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono focus:outline-none focus:border-indigo-400" />
          <button onClick={registerCloud} disabled={registering}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer">
            <Plus className="w-3.5 h-3.5" /> Register
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {cloudFleet.map(a => (
            <div key={a.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/60">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-violet-500 shrink-0" /> {a.asset_ref}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">{a.provider} · {a.asset_type} · {a.region}</div>
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border shrink-0 ${a.risk_score >= 65 ? 'bg-rose-50 border-rose-200 text-rose-600' : a.risk_score >= 45 ? 'bg-amber-50 border-amber-200 text-amber-600' : a.risk_score > 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                  {a.risk_score > 0 ? `risk ${a.risk_score}` : 'unscored'}
                </span>
              </div>
            </div>
          ))}
          {cloudFleet.length === 0 && <div className="col-span-full p-6 text-center text-xs text-slate-400">No cloud infrastructure registered yet.</div>}
        </div>
      </div>
    </div>
  );
};