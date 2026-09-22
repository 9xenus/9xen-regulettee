import crypto from 'crypto';
import { getDb } from '../db/sqlite.js';

/**
 * 9XEN REGULETTEE — BLOCKCHAIN AUDIT TRAIL (sovereign immutable chain)
 * Bitcoin-style append-only chain of mined blocks. Every block links to the
 * previous block hash, batches audited events under a Merkle root and carries
 * a proof-of-work (SHA-256 leading-zero) so past entries are computationally
 * infeasible to rewrite without re-mining the entire suffix. Used to anchor
 * National Scanning Engine runs, remediation actions, rollbacks and unified
 * Regulatory Billing issuance into a single tamper-evident audit chain.
 */

export interface BlockchainTx {
  txId: string;
  ts: string;
  actor: string;
  action: string;
  category: string;
  resource: string;
  refId: string;
  payloadHash: string;
  payload: Record<string, any>;
}

export interface BlockchainBlock {
  blockNumber: number;
  timestamp: string;
  previousBlockHash: string;
  merkleRoot: string;
  nonce: number;
  difficulty: number;
  txCount: number;
  transactions: BlockchainTx[];
  blockHash: string;
  minedBy: string;
}

const ZERO_HASH = '0'.repeat(64);
const GENESIS_PREV = ZERO_HASH;
const GENESIS_MINER = '9XEN_SOVEREIGN_GENESIS';

const sha256 = (data: string): string => crypto.createHash('sha256').update(data).digest('hex');

const txCanonical = (tx: BlockchainTx): string =>
  `${tx.txId}|${tx.ts}|${tx.actor}|${tx.action}|${tx.category}|${tx.resource}|${tx.refId}|${tx.payloadHash}|${JSON.stringify(tx.payload || {})}`;

const txHash = (tx: BlockchainTx): string => sha256(txCanonical(tx));

const powDifficulty = (): number => {
  const raw = Number(process.env.BLOCKCHAIN_POW_DIFFICULTY || 3);
  const d = Number.isFinite(raw) ? Math.max(1, Math.min(8, Math.floor(raw))) : 3;
  return d;
};

const safeParse = (s: string, fallback: any = null): any => {
  try { return JSON.parse(s); } catch { return fallback; }
};

function merkleRoot(txHashes: string[]): string {
  if (txHashes.length === 0) return sha256('EMPTY');
  let level = txHashes;
  while (level.length > 1) {
    const next: string[] = [];
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i];
      const right = i + 1 < level.length ? level[i + 1] : left;
      next.push(sha256(`${left}${right}`));
    }
    level = next;
  }
  return level[0];
}

class BlockchainAuditTrailService {
  private json<T>(v: T): string { return JSON.stringify(v); }

  ensureSchema(): void {
    const db = getDb();
    if (!db || typeof db.exec !== 'function') return;
    try {
      db.exec(`
        CREATE TABLE IF NOT EXISTS bc_audit_blocks (
          block_number INTEGER PRIMARY KEY,
          timestamp TEXT NOT NULL,
          previous_block_hash TEXT NOT NULL,
          merkle_root TEXT NOT NULL,
          nonce INTEGER NOT NULL,
          difficulty INTEGER NOT NULL,
          tx_count INTEGER NOT NULL DEFAULT 0,
          data_json TEXT NOT NULL,
          block_hash TEXT NOT NULL UNIQUE,
          mined_by TEXT NOT NULL DEFAULT 'SYSTEM',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS bc_audit_txs (
          tx_id TEXT PRIMARY KEY,
          block_number INTEGER NOT NULL,
          ts TEXT NOT NULL,
          actor TEXT NOT NULL,
          action TEXT NOT NULL,
          category TEXT NOT NULL,
          resource TEXT NOT NULL,
          ref_id TEXT NOT NULL DEFAULT '',
          payload_hash TEXT NOT NULL,
          payload_json TEXT NOT NULL DEFAULT '{}',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_bc_tx_block ON bc_audit_txs(block_number);
      `);
      const count = db.prepare('SELECT COUNT(*) AS c FROM bc_audit_blocks').get() as { c: number };
      if (!count || count.c === 0) this.seedGenesis();
    } catch { /* ignore */ }
  }

  private seedGenesis(): void {
    const timestamp = '2026-01-01T00:00:00.000Z';
    const genesisTx: BlockchainTx = {
      txId: 'GENESIS-TX-000000000000',
      ts: timestamp,
      actor: 'system-genesis@9xen.eu',
      action: 'GENESIS_BLOCK',
      category: 'SYSTEM_OPS',
      resource: 'BLOCKCHAIN_AUDIT_TRAIL_ROOT',
      refId: 'GENESIS',
      payloadHash: sha256(this.json({ reason: 'Sovereign blockchain audit trail genesis anchor' })),
      payload: { reason: 'Sovereign blockchain audit trail genesis anchor' }
    };
    const merkle = merkleRoot([txHash(genesisTx)]);
    const blockNumber = 0;
    const { nonce, hash } = this.mineHeader(blockNumber, timestamp, GENESIS_PREV, merkle);
    const block: BlockchainBlock = {
      blockNumber, timestamp, previousBlockHash: GENESIS_PREV, merkleRoot: merkle,
      nonce, difficulty: powDifficulty(), txCount: 1, transactions: [genesisTx], blockHash: hash, minedBy: GENESIS_MINER
    };
    this.persistBlock(block);
  }

  private mineHeader(blockNumber: number, timestamp: string, previousBlockHash: string, merkle: string): { nonce: number; hash: string } {
    const target = '0'.repeat(powDifficulty());
    let nonce = 0;
    for (;;) {
      const hash = sha256(`${blockNumber}|${timestamp}|${previousBlockHash}|${merkle}|${nonce}`);
      if (hash.startsWith(target)) return { nonce, hash };
      nonce += 1;
      if (nonce > 2147483646) throw new Error('BC_POW: nonce space exhausted');
    }
  }

  private persistBlock(block: BlockchainBlock): void {
    const db = getDb();
    if (!db || typeof db.prepare !== 'function') return;
    try {
      db.transaction(() => {
        db.prepare(`INSERT INTO bc_audit_blocks (block_number, timestamp, previous_block_hash, merkle_root, nonce, difficulty, tx_count, data_json, block_hash, mined_by) VALUES (?,?,?,?,?,?,?,?,?,?)`)
          .run(block.blockNumber, block.timestamp, block.previousBlockHash, block.merkleRoot, block.nonce, block.difficulty, block.txCount, this.json(block.transactions), block.blockHash, block.minedBy);
        const ins = db.prepare(`INSERT OR REPLACE INTO bc_audit_txs (tx_id, block_number, ts, actor, action, category, resource, ref_id, payload_hash, payload_json) VALUES (?,?,?,?,?,?,?,?,?,?)`);
        for (const tx of block.transactions) {
          ins.run(tx.txId, block.blockNumber, tx.ts, tx.actor, tx.action, tx.category, tx.resource, tx.refId, tx.payloadHash, this.json(tx.payload));
        }
      })();
    } catch (err: any) {
      console.error('[BC_AUDIT] Failed to persist block:', err?.message);
    }
  }

  private readBlockRow(row: any): BlockchainBlock | null {
    if (!row) return null;
    const transactions = safeParse(row.data_json, []);
    if (Array.isArray(transactions) && transactions.length === 0) {
      const txRows = (getDb().prepare('SELECT * FROM bc_audit_txs WHERE block_number = ? ORDER BY created_at').all(row.block_number) as any[]);
      return { blockNumber: row.block_number, timestamp: row.timestamp, previousBlockHash: row.previous_block_hash, merkleRoot: row.merkle_root, nonce: row.nonce, difficulty: row.difficulty, txCount: row.tx_count, transactions: txRows.map(this.fromTxRow), blockHash: row.block_hash, minedBy: row.mined_by };
    }
    return { blockNumber: row.block_number, timestamp: row.timestamp, previousBlockHash: row.previous_block_hash, merkleRoot: row.merkle_root, nonce: row.nonce, difficulty: row.difficulty, txCount: row.tx_count, transactions, blockHash: row.block_hash, minedBy: row.mined_by };
  }

  private fromTxRow = (r: any): BlockchainTx => ({
    txId: r.tx_id, ts: r.ts, actor: r.actor, action: r.action, category: r.category,
    resource: r.resource, refId: r.ref_id, payloadHash: r.payload_hash, payload: safeParse(r.payload_json, {}) || {}
  });

  hashTx(tx: Omit<BlockchainTx, 'payloadHash' | 'payload'> & { payload?: Record<string, any> }): string {
    const payload = tx.payload || {};
    return sha256(`${tx.txId}|${tx.ts}|${tx.actor}|${tx.action}|${tx.category}|${tx.resource}|${tx.refId}|${this.json(payload)}`);
  }

  buildTx(partial: {
    actor: string; action: string; category: string; resource: string; refId?: string; payload?: Record<string, any>;
  }): BlockchainTx {
    const ts = new Date().toISOString();
    const txId = `bcx_${ts.replace(/[^0-9]/g, '')}_${crypto.randomBytes(4).toString('hex')}`;
    const payload = partial.payload || {};
    const base = { txId, ts, actor: partial.actor, action: partial.action, category: partial.category, resource: partial.resource, refId: partial.refId || '' };
    const payloadHash = sha256(`${base.txId}|${base.ts}|${base.actor}|${base.action}|${base.category}|${base.resource}|${base.refId}|${this.json(payload)}`);
    return { ...base, payloadHash, payload };
  }

  /**
   * Mines one new block containing the given audit transactions onto the chain tail.
   */
  appendTransactions(txs: BlockchainTx[], minedBy = 'SYSTEM'): BlockchainBlock | null {
    this.ensureSchema();
    const db = getDb();
    if (!db || txs.length === 0) return null;
    const tail = db.prepare('SELECT * FROM bc_audit_blocks ORDER BY block_number DESC LIMIT 1').get() as any;
    const blockNumber = (tail?.block_number ?? -1) + 1;
    const timestamp = new Date().toISOString();
    const previousBlockHash = tail?.block_hash || GENESIS_PREV;
    const merkle = merkleRoot(txs.map(t => txHash(t)));
    const { nonce, hash } = this.mineHeader(blockNumber, timestamp, previousBlockHash, merkle);
    const block: BlockchainBlock = {
      blockNumber, timestamp, previousBlockHash, merkleRoot: merkle, nonce,
      difficulty: powDifficulty(), txCount: txs.length, transactions: txs, blockHash: hash, minedBy
    };
    this.persistBlock(block);
    return block;
  }

  /**
   * Convenience: builds a single tx and mines it into a new block.
   */
  anchor(partial: {
    actor: string; action: string; category: string; resource: string; refId?: string; payload?: Record<string, any>;
  }): { block: BlockchainBlock | null; tx: BlockchainTx } {
    const tx = this.buildTx(partial);
    const block = this.appendTransactions([tx], partial.actor);
    return { block, tx };
  }

  getTail(): BlockchainBlock | null {
    this.ensureSchema();
    try {
      const row = getDb().prepare('SELECT * FROM bc_audit_blocks ORDER BY block_number DESC LIMIT 1').get() as any;
      return this.readBlockRow(row);
    } catch { return null; }
  }

  getBlock(blockNumber: number): BlockchainBlock | null {
    this.ensureSchema();
    try {
      const row = getDb().prepare('SELECT * FROM bc_audit_blocks WHERE block_number = ?').get(blockNumber) as any;
      return this.readBlockRow(row);
    } catch { return null; }
  }

  getChain(limit = 25): { height: number; blocks: BlockchainBlock[] } {
    this.ensureSchema();
    try {
      const rows = getDb().prepare('SELECT * FROM bc_audit_blocks ORDER BY block_number DESC LIMIT ?').all(limit) as any[];
      const blocks = rows.map((r) => this.readBlockRow(r)).filter(Boolean) as BlockchainBlock[];
      const height = blocks.length ? blocks[0].blockNumber : -1;
      return { height, blocks };
    } catch { return { height: -1, blocks: [] }; }
  }

  verifyChain(): { valid: boolean; blocksChecked: number; tip?: string; firstInvalidAt?: number; reason?: string } {
    this.ensureSchema();
    try {
      const rows = getDb().prepare('SELECT * FROM bc_audit_blocks ORDER BY block_number ASC').all() as any[];
      let prev = GENESIS_PREV;
      const target = '0'.repeat(powDifficulty());
      for (let i = 0; i < rows.length; i++) {
        const b = this.readBlockRow(rows[i]);
        if (!b) return { valid: false, blocksChecked: i, firstInvalidAt: rows[i]?.block_number, reason: 'UNPARSEABLE_BLOCK' };
        if (b.previousBlockHash !== prev) {
          return { valid: false, blocksChecked: i, firstInvalidAt: b.blockNumber, reason: `BROKEN_LINK (expected ${prev.slice(0, 16)}… got ${b.previousBlockHash.slice(0, 16)}…)` };
        }
        const recomputedMerkle = merkleRoot(b.transactions.map(t => txHash(t)));
        if (recomputedMerkle !== b.merkleRoot) {
          return { valid: false, blocksChecked: i, firstInvalidAt: b.blockNumber, reason: 'MERKLE_MISMATCH' };
        }
        const recomputed = sha256(`${b.blockNumber}|${b.timestamp}|${b.previousBlockHash}|${b.merkleRoot}|${b.nonce}`);
        if (recomputed !== b.blockHash || !b.blockHash.startsWith(target)) {
          return { valid: false, blocksChecked: i, firstInvalidAt: b.blockNumber, reason: 'POW_OR_HASH_MISMATCH' };
        }
        prev = b.blockHash;
      }
      return { valid: true, blocksChecked: rows.length, tip: rows.length ? this.readBlockRow(rows[rows.length - 1])?.blockHash : undefined };
    } catch (err: any) {
      return { valid: false, blocksChecked: 0, reason: err?.message };
    }
  }
}

export const BlockchainAuditTrail = new BlockchainAuditTrailService();