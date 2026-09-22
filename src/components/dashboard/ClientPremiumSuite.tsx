import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from "motion/react";
import {
  Activity, Radio, ShieldCheck, Fingerprint, Sparkles, QrCode, Hash, CheckCircle2, XCircle,
  Loader2, MessageSquare, RefreshCw, Send, Copy, Lock, FileLock2, ScanLine, Smartphone,
  Camera, Network, Download, FileArchive, FileText, ScrollText,
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { ComplianceUniverseGraph } from './ComplianceUniverseGraph';
import jsQR from 'jsqr';
import ReactMarkdown from 'react-markdown';

const API = '/api/v1/client-premium';

// ============================================================
// 1) REALTIME SOVEREIGN PULSE — SSE live event bus
// ============================================================
export const RealtimeSovereignPulse: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [emitTitle, setEmitTitle] = useState('');
  const [emitMessage, setEmitMessage] = useState('');
  const { showToast } = useNotification();

  useEffect(() => {
    const es = new EventSource(`${API}/realtime/pulse`);
    const onOpen = () => setConnected(true);
    const onErr = () => setConnected(false);
    const onMsg = (e: MessageEvent) => {
      try {
        const d = JSON.parse(e.data);
        setEvents(prev => [d, ...prev].slice(0, 30));
      } catch { /* skip */ }
    };
    es.addEventListener('open', onOpen);
    es.addEventListener('error', onErr);
    es.addEventListener('message', onMsg);
    return () => { es.removeEventListener('open', onOpen); es.removeEventListener('error', onErr); es.removeEventListener('message', onMsg); es.close(); };
  }, []);

  const emit = async () => {
    try {
      const res = await fetch(`${API}/realtime/emit`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'CLIENT_EVENT', title: emitTitle || 'Client event', message: emitMessage || 'Emitted from the client dashboard.', severity: 'INFO', source: 'client' })
      });
      const data = await res.json();
      if (data.success) { setEmitTitle(''); setEmitMessage(''); showToast('Event broadcast to pulse subscribers.', 'success'); }
    } catch { showToast('Failed to emit event.', 'error'); }
  };

  const sevColor = (s: string) => s === 'ERROR' ? 'bg-red-500' : s === 'WARN' || s === 'WARNING' ? 'bg-amber-500' : s === 'COPILOT_QUERY' ? 'bg-violet-500' : 'bg-emerald-500';

  return (
    <div className="space-y-4">
      <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold ${connected ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300'}`}>
        <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${connected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        {connected ? 'LIVE — realtime compliance pulse connected (SSE)' : 'Disconnected — retrying…'}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
          <Radio className="w-4 h-4 text-indigo-600" /> Broadcast a Client Event
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input value={emitTitle} onChange={e => setEmitTitle(e.target.value)} placeholder="Event title (e.g. New audit evidence sealed)" className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none" />
          <input value={emitMessage} onChange={e => setEmitMessage(e.target.value)} placeholder="Event message…" className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none" />
        </div>
        <button onClick={emit} className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer">
          <Send className="w-3.5 h-3.5" /> Broadcast
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
          <Activity className="w-4 h-4" /> Live Event Stream
        </div>
        <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {events.map((e, i) => (
            <div key={i} className="px-4 py-2.5 flex items-start gap-3">
              <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${sevColor(e.severity || 'INFO')}`} />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">{e.title} <span className="text-[9px] font-mono text-slate-400 ml-1">{e.type}</span></div>
                {e.message && <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{e.message}</div>}
              </div>
              <span className="text-[9px] font-mono text-slate-400 shrink-0">{new Date(e.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
          {events.filter(e => e.type !== 'CONNECTED' && e.type !== 'HEARTBEAT').length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400">Waiting for events — heartbeat every 15s.</div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// 2) QUANTUM FORENSIC SEAL VAULT — hash-chain + QR seals
// ============================================================
export const QuantumForensicSealVault: React.FC = () => {
  const [seals, setSeals] = useState<any[]>([]);
  const [docName, setDocName] = useState('Risk Assessment Report');
  const [docContent, setDocContent] = useState('Evidence dump: DPA registry, model card v3, consent telemetry export.');
  const [activeSeal, setActiveSeal] = useState<any>(null);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const { showToast } = useNotification();

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API}/seals`); const data = await res.json();
      setSeals(data.success ? data.seals : []);
    } catch { setSeals([]); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const seal = async () => {
    try {
      const res = await fetch(`${API}/seals`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentName: docName, content: docContent })
      });
      const data = await res.json();
      if (data.success) { setActiveSeal(data.seal); setVerifyResult(null); showToast('Document sealed cryptographically. QR anchored.', 'success'); load(); }
      else showToast(`Seal failed: ${data.error || ''}`, 'error');
    } catch { showToast('Seal request failed.', 'error'); }
  };

  const verify = async (id: string) => {
    try {
      const res = await fetch(`${API}/seals/${id}/verify`, { method: 'POST' });
      const data = await res.json();
      setVerifyResult(data);
      showToast(data.validity === 'INTACT' ? 'Evidence integrity verified — chain intact.' : 'TAMPERED — chain mismatch!', data.validity === 'INTACT' ? 'success' : 'error');
    } catch { showToast('Verification failed.', 'error'); }
  };

  const exportBundle = async () => {
    try {
      const res = await fetch(`${API}/seals/export`);
      if (!res.ok) { showToast('Export failed.', 'error'); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'evidence-bundle.zip'; document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      showToast('Tamper-evident evidence bundle downloaded.', 'success');
    } catch { showToast('Export failed.', 'error'); }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
            <FileLock2 className="w-4 h-4 text-indigo-600" /> Seal New Evidence
          </h4>
          <label className="text-[11px] font-semibold text-slate-500 uppercase">Document name</label>
          <input value={docName} onChange={e => setDocName(e.target.value)} className="mt-1 w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none" />
          <label className="mt-3 block text-[11px] font-semibold text-slate-500 uppercase">Document content (hashed)</label>
          <textarea value={docContent} onChange={e => setDocContent(e.target.value)} rows={4} className="mt-1 w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none font-mono" />
          <button onClick={seal} className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer">
            <Lock className="w-3.5 h-3.5" /> Seal with SHA-512 Hash Chain
          </button>
          {activeSeal && (
            <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-950 rounded-lg">
              <div className="text-xs font-bold text-indigo-800 dark:text-indigo-200">Seal {activeSeal.id}</div>
              <div className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 break-all mt-1">sha512:{activeSeal.documentHash?.slice(0, 40)}…</div>
              <div className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 break-all">chain:{activeSeal.chainRef}</div>
              <div className="flex items-center gap-3 mt-2">
                <img src={activeSeal.sealQr} alt="seal qr" className="w-28 h-28 rounded-lg bg-white p-1" />
                <ul className="text-[10px] text-indigo-700 dark:text-indigo-300 space-y-1">
                  <li>• HMAC-SHA-256 chain ref</li>
                  <li>• Anchor: crypto timestamp</li>
                  <li>• Scan QR to verify</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
            <QrCode className="w-4 h-4" /> Sealed Evidence Vault
            <button onClick={exportBundle} className="ml-auto px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg flex items-center gap-1.5 cursor-pointer" title="Download tamper-evident ZIP bundle">
              <Download className="w-3 h-3" /> Export ZIP
            </button>
          </div>
          <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {seals.map(s => (
              <div key={s.id} className="px-4 py-3 flex items-center gap-3">
                <img src={s.sealQr} alt="qr" className="w-10 h-10 rounded bg-white border border-slate-200 p-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{s.documentName}</div>
                  <div className="text-[10px] font-mono text-slate-400 truncate">{s.id} · {s.chainRef}</div>
                  <span className={`mt-1 inline-block px-1.5 py-0.5 rounded font-mono text-[9px] font-bold ${s.status === 'VERIFIED' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : s.status === 'TAMPERED' ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>{s.status}</span>
                </div>
                <button onClick={() => verify(s.id)} className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer">
                  <Hash className="w-3 h-3" /> Verify
                </button>
              </div>
            ))}
            {seals.length === 0 && <div className="p-8 text-center text-xs text-slate-400">No seals yet.</div>}
          </div>
        </div>
      </div>

      {verifyResult && (
        <div className={`p-4 rounded-xl border ${verifyResult.validity === 'INTACT' ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-900' : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-900'}`}>
          <div className="text-sm font-bold flex items-center gap-2">
            {verifyResult.validity === 'INTACT'
              ? <><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Verdict: INTACT</>
              : <><XCircle className="w-4 h-4 text-red-600" /> Verdict: TAMPERED</>}
          </div>
          <p className="text-xs mt-1 text-slate-600 dark:text-slate-300">{verifyResult.message}</p>
          <div className="mt-2 text-[10px] font-mono text-slate-500 break-all">stored:{verifyResult.check?.storedChain}</div>
          <div className="text-[10px] font-mono text-slate-500 break-all">recomputed:{verifyResult.check?.recomputedChain}</div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// 3) DEVICE IDENTITY ATTESTATION — TOTP QR provisioning
// ============================================================
export const DeviceIdentityAttestation: React.FC = () => {
  const [attest, setAttest] = useState<any>(null);
  const [code, setCode] = useState('');
  const [challengeResult, setChallengeResult] = useState<any>(null);
  const [devices, setDevices] = useState<any[]>([]);
  const { showToast } = useNotification();

  const loadDevices = useCallback(async () => {
    try { const r = await fetch(`${API}/identity/devices`); const d = await r.json(); if (d.success) setDevices(d.devices); } catch { /* offline */ }
  }, []);
  useEffect(() => { loadDevices(); }, [loadDevices]);

  const startAttest = async () => {
    setAttest(null); setChallengeResult(null);
    try {
      const r = await fetch(`${API}/identity/attest`); const d = await r.json();
      if (d.success) { setAttest(d); setCode(d.secretBase32 ? '' : ''); showToast('Device opened for provisioning — scan the QR.', 'success'); }
    } catch { showToast('Attestation request failed.', 'error'); }
  };

  const challenge = async () => {
    if (!attest || !code) return;
    try {
      const r = await fetch(`${API}/identity/challenge`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: attest.deviceId, code })
      });
      const d = await r.json();
      setChallengeResult(d);
      showToast(d.success ? 'Device identity verified cryptographically!' : 'Invalid or expired code.', d.success ? 'success' : 'error');
      loadDevices();
    } catch { showToast('Challenge failed.', 'error'); }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
            <Fingerprint className="w-4 h-4 text-indigo-600" /> TOTP Device Binding
          </h4>
          <p className="text-xs text-slate-500">Provision a cryptographically bound authenticator for this tenant. HMAC-SHA256, 6-digit, 30s window.</p>
          <button onClick={startAttest} className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer">
            <Smartphone className="w-4 h-4" /> Attest New Device
          </button>

          {attest && (
            <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-950 rounded-xl text-center">
              <div className="inline-block bg-white rounded-xl p-2">
                <img src={attest.provisioningQr} alt="totp qr" className="w-36 h-36" />
              </div>
              <div className="text-xs font-bold text-indigo-800 dark:text-indigo-200 mt-2 flex items-center justify-center gap-1"><ScanLine className="w-3.5 h-3.5" /> Scan with Google Authenticator / Authy</div>
              <div className="text-[10px] font-mono text-indigo-500 mt-1 break-all">{attest.otpauthUrl}</div>
              <div className="text-[10px] font-mono text-indigo-500 mt-1">Device ID: {attest.deviceId}</div>
              <div className="mt-3 flex gap-2 max-w-xs mx-auto">
                <input value={code} onChange={e => setCode(e.target.value)} maxLength={6} placeholder="6-digit code"
                  className="flex-1 px-3 py-2 text-center text-sm font-mono tracking-[0.5em] rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 outline-none" />
                <button onClick={challenge} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer">Verify</button>
              </div>
              {challengeResult && (
                <div className={`mt-2 text-xs font-bold ${challengeResult.success ? 'text-emerald-600' : 'text-red-600'}`}>{challengeResult.message}</div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
            <Smartphone className="w-4 h-4" /> Bound Devices
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {devices.map(d => (
              <div key={d.deviceId} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{d.alias}</div>
                  <div className="text-[10px] font-mono text-slate-400">{d.deviceId}</div>
                </div>
                <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold ${d.status === 'VERIFIED' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : d.status === 'FAILED' ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300' : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'}`}>{d.status}</span>
              </div>
            ))}
            {devices.length === 0 && <div className="p-8 text-center text-xs text-slate-400">No devices bound.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// 4) AI COMPLIANCE CO-PILOT — Gemini with deterministic fallback
// ============================================================
export const AiComplianceCopilot: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<{ provider: string; answer: string; context?: any } | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const ask = async () => {
    if (!question.trim()) return;
    setLoading(true);
    try {
      const r = await fetch(`${API}/copilot`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      const d = await r.json();
      if (d.success) {
        setAnswer(d);
        setHistory(prev => [{ q: question, provider: d.provider, answer: d.answer, ts: new Date().toISOString() }, ...prev].slice(0, 12));
        setQuestion('');
      }
    } catch { /* offline */ } finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" /> Sovereign Compliance Co-Pilot
        </h4>
        <p className="text-xs text-slate-500 mt-1">Asks grounded on your live pulse stream, sealed evidence count and active regulatory posture. Gemini when a key is configured; deterministic sovereign counsel fallback otherwise.</p>
        <div className="mt-3 flex gap-2">
          <input value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key === 'Enter' && ask()}
            placeholder="e.g. What should I prioritize ahead of my DORA ICT audit?"
            className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none" />
          <button onClick={ask} disabled={loading || !question.trim()} className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 disabled:opacity-50 cursor-pointer">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageSquare className="w-3.5 h-3.5" />} Ask
          </button>
        </div>
        {answer && (
          <div className="mt-4 p-4 bg-violet-50 dark:bg-violet-950 rounded-xl">
            <div className="flex items-center gap-2 text-[10px] font-mono text-violet-600 dark:text-violet-300 uppercase mb-2">
              <RefreshCw className="w-3 h-3" /> answered by {answer.provider}
              {answer.context && <span>· {answer.context.evidenceSeals} seals · {answer.context.pulseItems} pulse items</span>}
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-200 whitespace-pre-wrap"><ReactMarkdown>{answer.answer}</ReactMarkdown></p>
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
          {history.map((h, i) => (
            <div key={i} className="px-4 py-3">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                Q: {h.q} <span className="text-[9px] font-mono text-slate-400">{h.provider}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-3">{h.answer}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================
// SEAL QR SCANNER — jsqr camera verification of forensic seals
// ============================================================
export const SealQrScanner: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanning, setScanning] = useState(false);
  const { showToast } = useNotification();
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraOn(false); setScanning(false);
  }, []);

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) { showToast('Camera not available in this browser.', 'error'); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
      setCameraOn(true); setScanning(true); setScanResult(null);
    } catch { showToast('Camera permission denied.', 'error'); }
  };

  useEffect(() => {
    if (!scanning || !cameraOn) return;
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const v = videoRef.current, cv = canvasRef.current;
      if (!v || !cv || v.videoWidth === 0) return;
      cv.width = v.videoWidth; cv.height = v.videoHeight;
      const ctx = cv.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(v, 0, 0, cv.width, cv.height);
      const img = ctx.getImageData(0, 0, cv.width, cv.height);
      const code = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' });
      if (code && code.data) {
        setScanning(false); stopCamera();
        handleSealPayload(code.data);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanning, cameraOn]);

  const handleSealPayload = async (payload: string) => {
    let sealId: string | null = null;
    try {
      const parsed = JSON.parse(payload);
      sealId = parsed.chainRef ? parsed.id : null;
    } catch { sealId = null; }
    if (!sealId) { setScanResult({ verdict: 'UNRECOGNIZED', message: 'QR does not carry a valid forensic seal payload.' }); return; }
    try {
      const r = await fetch(`${API}/seals/${sealId}/verify`, { method: 'POST' });
      const d = await r.json();
      setScanResult(d);
      showToast(d.validity === 'INTACT' ? 'Seal verified INTACT via camera scan.' : 'Seal flagged TAMPERED!', d.validity === 'INTACT' ? 'success' : 'error');
    } catch { setScanResult({ verdict: 'ERROR', message: 'Verification request failed.' }); }
  };

  useEffect(() => () => stopCamera(), [stopCamera]);

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Camera className="w-4 h-4 text-indigo-600" /> Camera Seal Verifier
        </h4>
        <p className="text-xs text-slate-500 mt-1">Point your camera at a sealed evidence QR. The payload resolves to the stored seal and runs an on-chain hash verification instantly.</p>
        <div className="mt-3">
          {!cameraOn ? (
            <button onClick={startCamera} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer">
              <Camera className="w-3.5 h-3.5" /> Start Camera Scan
            </button>
          ) : (
            <div className="flex gap-3 items-start">
              <video ref={videoRef} className="w-64 h-48 rounded-lg bg-slate-900 object-cover" muted playsInline />
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex flex-col gap-2 text-[11px] text-slate-500 max-w-[180px]">
                <span>Scanning for seal QR…</span>
                <button onClick={stopCamera} className="px-3 py-1.5 w-fit bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[10px] font-bold rounded-lg cursor-pointer">Cancel</button>
              </div>
            </div>
          )}
        </div>
        {scanResult && (
          <div className={`mt-4 p-4 rounded-xl border ${scanResult.validity === 'INTACT' ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-900' : scanResult.validity === 'TAMPERED' ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-900' : 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-900'}`}>
            <div className="text-sm font-bold flex items-center gap-2">
              {scanResult.validity === 'INTACT' ? <><CheckCircle2 className="w-4 h-4 text-emerald-600" /> INTACT</> : scanResult.validity === 'TAMPERED' ? <><XCircle className="w-4 h-4 text-red-600" /> TAMPERED</> : <><ScanLine className="w-4 h-4 text-amber-600" /> {scanResult.verdict}</>}
            </div>
            <p className="text-xs mt-1 text-slate-600 dark:text-slate-300">{scanResult.message}</p>
            {scanResult.check?.documentName && <div className="mt-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">Evidence: {scanResult.check.documentName}</div>}
            <button onClick={() => setScanResult(null)} className="mt-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[10px] font-bold rounded-lg cursor-pointer">Scan another</button>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================
// REGULATORY DOSSIER — one-click tamper-evident audit bundle
// ============================================================
export const RegulatoryDossierGenerator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { showToast } = useNotification();

  const generate = async () => {
    setLoading(true); setResult(null);
    try {
      const r = await fetch(`${API}/dossier/export`);
      const d = await r.json();
      if (d.success) setResult(d.dossier);
      else showToast(`Dossier failed: ${d.error || ''}`, 'error');
    } catch { showToast('Dossier generation failed.', 'error'); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ScrollText className="w-4 h-4 text-indigo-600" /> Automated Regulatory Dossier
        </h4>
        <p className="text-xs text-slate-500 mt-1">
          One-click aggregate of your live compliance score, active framework activations, forensic seal vault, realtime pulse log and attested identity devices — bundled into a single tamper-evident audit package with SHA-512 dossier hash.
        </p>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          {[
            { k: 'Compliance Score', v: result?.overallScore ?? '—', color: 'text-emerald-600' },
            { k: 'Grade', v: result?.grade ?? '—', color: 'text-violet-600' },
            { k: 'Forensic Seals', v: (result?.redactedSummary?.match(/d+ forensic seals/) || [])[0]?.match(/\d+/)?.[0] ?? '—', color: 'text-indigo-600' },
            { k: 'Framework Activations', v: (result?.redactedSummary?.match(/d+ framework activations/) || [])[0]?.match(/\d+/)?.[0] ?? '—', color: 'text-cyan-600' },
          ].map(s => (
            <div key={s.k} className="bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2.5">
              <div className={`text-xl font-bold ${s.color}`}>{s.v}</div>
              <div className="text-[9px] uppercase font-semibold text-slate-400 mt-0.5">{s.k}</div>
            </div>
          ))}
        </div>
        <button onClick={generate} disabled={loading}
          className="mt-4 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 disabled:opacity-50 cursor-pointer">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />} Generate Dossier
        </button>

        {result && (
          <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-950 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold text-indigo-800 dark:text-indigo-200">{result.dossierId}</div>
              <span className="text-[10px] font-mono text-indigo-500">{result.sections.length} sections</span>
            </div>
            <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-2">{result.redactedSummary}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {result.sections.map((s: string) => (
                <span key={s} className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 text-[9px] font-mono text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900">{s}</span>
              ))}
            </div>
            <div className="mt-2 text-[10px] font-mono text-indigo-500 break-all">sha512: {result.integrityHash?.slice(0, 40)}…</div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================
// LIVE PULSE MINI-WIDGET — compact ticker for the Overview tab
// ============================================================
export const SovereignPulseMini: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [last, setLast] = useState<any>(null);
  const [ticker, setTicker] = useState<any[]>([]);

  useEffect(() => {
    const es = new EventSource(`${API}/realtime/pulse`);
    es.addEventListener('open', () => setConnected(true));
    es.addEventListener('error', () => setConnected(false));
    es.addEventListener('message', (e: MessageEvent) => {
      try {
        const d = JSON.parse(e.data);
        setLast(d);
        if (d.type !== 'CONNECTED' && d.type !== 'HEARTBEAT') setTicker(prev => [d, ...prev].slice(0, 4));
      } catch { /* skip */ }
    });
    return () => es.close();
  }, []);

  const dot = connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500';
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Radio className="w-4 h-4 text-indigo-600" /> Sovereign Pulse
        </div>
        <span className={`w-2.5 h-2.5 rounded-full ${dot}`} />
      </div>
      <div className="h-[52px] overflow-hidden">
        {last ? (
          <div key={last.timestamp} className="text-[11px] text-slate-600 dark:text-slate-300">
            <span className="font-semibold text-slate-800 dark:text-slate-100">{last.title}</span> — {last.message}
          </div>
        ) : (
          <div className="text-[11px] text-slate-400">Connecting to realtime stream…</div>
        )}
      </div>
      {ticker.length > 0 && (
        <div className="mt-1 space-y-0.5">
          {ticker.map((t, i) => (
            <div key={i} className="text-[10px] text-slate-400 truncate">· {t.title}</div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================
// PREMIUM SUITE WRAPPER — sub-tab hub for the 4 high-tech panels
// ============================================================
const PREMIUM_TABS = [
  { id: 'pulse', label: 'Realtime Pulse', icon: Radio },
  { id: 'universe', label: 'Compliance Universe', icon: Network },
  { id: 'seals', label: 'Forensic Seals', icon: FileLock2 },
  { id: 'scanner', label: 'QR Scanner', icon: Camera },
  { id: 'identity', label: 'Identity Attestation', icon: Fingerprint },
  { id: 'dossier', label: 'Regulatory Dossier', icon: ScrollText },
  { id: 'copilot', label: 'AI Co-Pilot', icon: Sparkles },
];

export const ClientPremiumSuite: React.FC = () => {
  const [active, setActive] = useState('pulse');
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        {PREMIUM_TABS.map(t => (
          <button key={t.id} onClick={() => setActive(t.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${active === t.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>
      {active === 'pulse' && <RealtimeSovereignPulse />}
      {active === 'universe' && <ComplianceUniverseGraph />}
      {active === 'seals' && <QuantumForensicSealVault />}
      {active === 'scanner' && <SealQrScanner />}
      {active === 'identity' && <DeviceIdentityAttestation />}
      {active === 'dossier' && <RegulatoryDossierGenerator />}
      {active === 'copilot' && <AiComplianceCopilot />}
    </motion.div>
  );
};