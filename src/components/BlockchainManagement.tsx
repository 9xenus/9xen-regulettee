import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Link, 
  CheckCircle2, 
  ShieldCheck, 
  RefreshCw, 
  Database, 
  ExternalLink,
  Layers,
  Sparkles,
  Check
} from 'lucide-react';

interface MerkleBlock {
  blockHeight: number;
  merkleRoot: string;
  auditEventsCount: number;
  timestamp: string;
  validatorProof: string;
}

export const BlockchainManagement: React.FC = () => {
  const [blocks, setBlocks] = useState<MerkleBlock[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sealing, setSealing] = useState<boolean>(false);
  const [nodeStatus, setNodeStatus] = useState<string>('SYNCHRONIZED');
  const [sealMessage, setSealMessage] = useState<string | null>(null);

  const fetchBlocks = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/blockchain/blocks');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setBlocks(data.blocks || []);
          setNodeStatus(data.ebsiNodeStatus || 'SYNCHRONIZED');
        }
      }
    } catch (err) {
      console.error('Failed to fetch blockchain Merkle blocks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlocks();
  }, []);

  const handleSealBlock = async () => {
    try {
      setSealing(true);
      const res = await fetch('/api/v1/blockchain/seal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSealMessage(data.message);
          fetchBlocks();
          setTimeout(() => setSealMessage(null), 4000);
        }
      }
    } catch (err) {
      console.error('Failed to seal Merkle block:', err);
    } finally {
      setSealing(false);
    }
  };

  return (
    <div className="p-5 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-950/80 border border-indigo-700/60 rounded-xl text-indigo-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white">Immutable Audit Ledger &amp; EBSI Blockchain Nodes</h3>
            <p className="text-xs text-slate-400">European Blockchain Services Infrastructure (EBSI) cryptographic timestamping and immudb zero-trust proofs.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSealBlock}
            disabled={sealing}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Sparkles className={`w-3.5 h-3.5 ${sealing ? 'animate-spin' : ''}`} />
            <span>{sealing ? 'Sealing...' : 'Seal Merkle Block'}</span>
          </button>
          <span className="px-3 py-1 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded-xl text-xs font-mono font-bold">
            EBSI Node {nodeStatus}
          </span>
        </div>
      </div>

      {sealMessage && (
        <div className="bg-emerald-950/90 border border-emerald-700/60 px-4 py-2.5 rounded-xl text-xs text-emerald-200 flex items-center gap-2 font-mono">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{sealMessage}</span>
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8 text-xs font-mono text-slate-500">
            Synchronizing EBSI Merkle tree ledger state...
          </div>
        ) : (
          blocks.map((b) => (
            <div key={b.blockHeight} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white font-mono">Block #{b.blockHeight}</span>
                  <span className="text-[11px] text-slate-400 font-mono">({b.auditEventsCount} Audit Receipts Sealed)</span>
                </div>
                <div className="text-[11px] font-mono text-indigo-400 mt-1">
                  Root: {b.merkleRoot}
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <span className="text-xs font-medium text-emerald-400 font-mono">{b.validatorProof}</span>
                <span className="text-[11px] text-slate-500">{b.timestamp}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BlockchainManagement;
