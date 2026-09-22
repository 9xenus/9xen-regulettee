import { Router } from 'express';
import { BlockchainAuditTrail } from '../services/blockchain-audit-trail.js';

export const blockchainAuditRouter = Router();

const bodyText = (v: any): string => (typeof v === 'string' && v) || '';

blockchainAuditRouter.get('/chain', (req, res) => {
  try {
    const limit = Math.max(1, Math.min(200, Number(req.query.limit) || 25));
    const chain = BlockchainAuditTrail.getChain(limit);
    res.json({ success: true, network: '9XEN_SOVEREIGN_AUDIT_CHAIN', pow: { algorithm: 'SHA-256', difficulty: (isNaN(Number(process.env.BLOCKCHAIN_POW_DIFFICULTY)) ? 3 : Number(process.env.BLOCKCHAIN_POW_DIFFICULTY)) }, ...chain });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

blockchainAuditRouter.get('/block/:height', (req, res) => {
  try {
    const block = BlockchainAuditTrail.getBlock(Number(req.params.height));
    if (!block) return res.status(404).json({ success: false, error: 'Block not found' });
    res.json({ success: true, block });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

blockchainAuditRouter.get('/latest', (_req, res) => {
  try {
    const block = BlockchainAuditTrail.getTail();
    if (!block) return res.status(404).json({ success: false, error: 'Chain empty' });
    res.json({ success: true, block });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

blockchainAuditRouter.get('/verify', (_req, res) => {
  try {
    const result = BlockchainAuditTrail.verifyChain();
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

blockchainAuditRouter.get('/stats', (_req, res) => {
  try {
    const { height, blocks } = BlockchainAuditTrail.getChain(200);
    const txs = blocks.reduce((s, b) => s + b.txCount, 0);
    const tail = blocks[0];
    res.json({
      success: true,
      network: '9XEN_SOVEREIGN_AUDIT_CHAIN',
      height,
      blocks: blocks.length,
      transactions: txs,
      difficulty: tail?.difficulty ?? (isNaN(Number(process.env.BLOCKCHAIN_POW_DIFFICULTY)) ? 3 : Number(process.env.BLOCKCHAIN_POW_DIFFICULTY)),
      latestBlock: tail ? { blockNumber: tail.blockNumber, blockHash: tail.blockHash, minedBy: tail.minedBy, transactionCount: tail.txCount } : null
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

blockchainAuditRouter.post('/anchor', (req, res) => {
  try {
    const body = req.body || {};
    const action = bodyText(body.action);
    const resource = bodyText(body.resource);
    if (!action || !resource) {
      return res.status(400).json({ success: false, error: '`action` and `resource` are required in the JSON body.' });
    }
    const { block, tx } = BlockchainAuditTrail.anchor({
      actor: bodyText(body.actor) || 'system@9xen.eu',
      action,
      category: bodyText(body.category) || 'AUDIT_EVENT',
      resource,
      refId: bodyText(body.refId),
      payload: typeof body.payload === 'object' && body.payload ? body.payload : {}
    });
    res.status(201).json({ success: true, mined: !!block, tx, blockNumber: block?.blockNumber ?? null, blockHash: block?.blockHash ?? null });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});