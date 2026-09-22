import React, { useEffect, useState } from 'react';
import { TrendingUp, RefreshCw, Plus, Trash2, Activity, Gauge, Flame, Target } from 'lucide-react';
import { fetchWithRetry } from '../lib/api-client';

interface Signal {
  symbol: string; name: string; sector: string; ccy: string;
  price: number; changePct: number; momentum: number; volatility: number; rsi: number;
  signal: 'BUY' | 'SELL' | 'HOLD'; aiConfidence: number; catalyst: string; updatedAt: string;
}

const SIGNAL_STYLE: Record<string, string> = {
  BUY: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  SELL: 'bg-rose-100 text-rose-700 border-rose-300',
  HOLD: 'bg-amber-100 text-amber-700 border-amber-300',
};

export const PredictiveTradingIntelligence: React.FC = () => {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [mood, setMood] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [addSym, setAddSym] = useState('');
  const [addTarget, setAddTarget] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetchWithRetry('/api/v1/enterprise-network/predictive');
      const d = await r.json();
      if (d?.success) { setSignals(d.signals || []); setWatchlist(d.watchlist || []); setMood(d.marketMood || {}); }
    } catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const toggleWatch = async (symbol: string, action: 'add' | 'remove') => {
    try {
      await fetchWithRetry('/api/v1/enterprise-network/watchlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(action === 'add' ? { symbol, targetPrice: Number(addTarget) || 0 } : { symbol, action: 'remove' }) });
      if (action === 'add') setAddSym(''); setAddTarget('');
      load();
    } catch { /* ignore */ }
  };

  const sort = [...signals].sort((a, b) => b.momentum - a.momentum);
  const best = sort[0]; const worst = sort[sort.length - 1];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-rose-50 text-rose-600"><TrendingUp className="w-5 h-5" /></div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Predictive Business & Trading Intelligence</h3>
            <p className="text-[11px] text-slate-500">AI composite signals across EU firms — momentum, RSI, volatility, catalysts, and compliance-aware watchlists.</p>
          </div>
        </div>
        <button onClick={load} className="text-[11px] font-mono text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 flex items-center gap-1 cursor-pointer"><RefreshCw className="w-3.5 h-3.5" /> REFRESH</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Activity} label="AI Composite" value={`${mood.aiComposite ?? '—'}`} tone="text-rose-600" />
        <StatCard icon={TrendingUp} label="Market Bias" value={mood.bias || '—'} tone={mood.bias === 'BULLISH' ? 'text-emerald-600' : 'text-rose-600'} />
        <StatCard icon={Gauge} label="Avg Momentum" value={`${mood.avgMomentum ?? '—'}`} tone={Number(mood.avgMomentum) >= 0 ? 'text-emerald-600' : 'text-rose-600'} />
        <StatCard icon={Flame} label="Tracked Assets" value={`${signals.length}`} tone="text-indigo-600" />
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {best && <div className="rounded-2xl bg-emerald-50/60 border border-emerald-200 p-3 text-xs font-bold text-emerald-800">Top momentum: {best.symbol} · {best.name} (+{best.momentum}) · signal {best.signal}</div>}
        {worst && <div className="rounded-2xl bg-rose-50/60 border border-rose-200 p-3 text-xs font-bold text-rose-800">Weakest momentum: {worst.symbol} · {worst.name} ({worst.momentum}) · signal {worst.signal}</div>}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
        <div className="flex-1">
          <div className="text-[10px] font-bold text-slate-500 mb-1">Add to AI watchlist (symbol)</div>
          <input value={addSym} onChange={e => setAddSym(e.target.value)} placeholder="e.g. ZRH:HLSA" className="input" />
        </div>
        <div className="flex-1">
          <div className="text-[10px] font-bold text-slate-500 mb-1">Target price</div>
          <input value={addTarget} onChange={e => setAddTarget(e.target.value)} placeholder="15.00" className="input" />
        </div>
        <button onClick={() => toggleWatch(addSym, 'add')} disabled={!addSym} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white text-sm font-bold flex items-center gap-1.5 cursor-pointer"><Plus className="w-4 h-4" /> Add</button>
      </div>

      {watchlist.length > 0 && (
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-wider mb-2"><StarIcon /> AI Watchlist</div>
          <div className="flex flex-wrap gap-2">
            {watchlist.map(w => (
              <div key={w.id} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs">
                <span className="font-bold text-slate-800">{w.symbol}</span>
                {w.target_price > 0 && <span className="flex items-center gap-1 text-slate-400"><Target className="w-3 h-3" />{w.target_price}</span>}
                <button onClick={() => toggleWatch(w.symbol, 'remove')} className="text-rose-500 hover:bg-rose-50 rounded-lg p-0.5 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-wider mb-2"><Gauge className="w-3.5 h-3.5" /> AI Signal Feed (EU firms)</div>
        {loading ? (
          <div className="text-center py-10 text-sm text-slate-400 flex items-center justify-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> Computing composite signals…</div>
        ) : (
          <div className="space-y-2">
            {signals.map(s => (
              <div key={s.symbol} className="p-3.5 rounded-2xl border border-slate-200 bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-700 text-[10px] shrink-0">{s.symbol.split(':')[1] || s.symbol.slice(0, 4)}</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-slate-900">{s.symbol}</span>
                      <span className="text-slate-500">{s.name}</span>
                      <span className="text-[9px] font-mono bg-slate-100 text-slate-500 rounded px-1.5 py-0.5">{s.sector}</span>
                      <span className="text-[9px] font-mono bg-slate-100 text-slate-500 rounded px-1.5 py-0.5">{s.ccy}</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">catalyst: {s.catalyst}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 lg:gap-2 flex-wrap">
                  <div className="text-right"><div className="font-black text-slate-900">{s.price.toFixed(2)} {s.ccy}</div><div className={`text-[10px] font-bold ${s.changePct >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{s.changePct >= 0 ? '+' : ''}{s.changePct.toFixed(2)}%</div></div>
                  <MiniGauge label="MOM" value={s.momentum} />
                  <MiniGauge label="RSI" value={Math.round(s.rsi)} />
                  <MiniGauge label="VOL" value={s.volatility} />
                  <div className="text-center"><div className="text-[9px] font-bold text-slate-400 uppercase">AI conf</div><div className="font-black text-slate-800">{s.aiConfidence}%</div></div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-black border ${SIGNAL_STYLE[s.signal]}`}>{s.signal}</span>
                  <button onClick={() => toggleWatch(s.symbol, 'add')} className="px-2.5 py-1.5 rounded-lg font-bold bg-white border border-slate-200 text-slate-500 hover:border-indigo-300 cursor-pointer">+ Watch</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-[10px] text-slate-400">Deterministic AI scoring refreshed ~every 15 min. Composite = momentum + RSI mean-reversion + volatility penalty. Not financial advice; compliance-aware in a SaaS sandbox.</div>
      <style>{`.input{width:100%;padding:.55rem .75rem;border-radius:.75rem;border:1px solid #e2e8f0;font-size:.8125rem;color:#1e293b;background:#fff;outline:none}.input:focus{box-shadow:0 0 0 2px #c7d2fe;border-color:#818cf8}`}</style>
    </div>
  );
};

const StatCard: React.FC<{ icon: any; label: string; value: string; tone: string }> = ({ icon: I, label, value, tone }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-3.5 flex items-center gap-3">
    <div className="p-2 rounded-xl bg-slate-50 text-slate-500"><I className="w-4 h-4" /></div>
    <div>
      <div className={`text-lg font-black ${tone}`}>{value}</div>
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</div>
    </div>
  </div>
);

const MiniGauge: React.FC<{ label: string; value: number }> = ({ label, value }) => {
  const pct = Math.max(0, Math.min(100, ((value + 50) / 100) * 100));
  return (
    <div className="w-12 text-center">
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden"><div className={`h-full ${value > 20 ? 'bg-emerald-500' : value < -10 ? 'bg-rose-500' : 'bg-amber-400'}`} style={{ width: `${pct}%` }} /></div>
      <div className="text-[9px] font-bold text-slate-400 uppercase mt-1">{label} {value > 0 ? '+' : ''}{value}</div>
    </div>
  );
};

const StarIcon = () => (
  <svg className="w-3.5 h-3.5 text-indigo-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
);

export default PredictiveTradingIntelligence;