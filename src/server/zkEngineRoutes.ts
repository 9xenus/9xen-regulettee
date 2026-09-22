import { Router, Request, Response } from 'express';
import { zkCryptographicEngine } from '../services/zkCryptographicEngine.js';

export const zkEngineRouter = Router();

// 1. List available ZK Circuits
zkEngineRouter.get('/circuits', (req: Request, res: Response) => {
  try {
    const circuits = zkCryptographicEngine.getCircuits();
    res.json({ success: true, count: circuits.length, data: circuits });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Generate Zero-Knowledge Verifiable Proof
zkEngineRouter.post('/generate-proof', (req: Request, res: Response) => {
  try {
    const { circuitId, publicInputs = {}, privateWitness = {} } = req.body || {};
    const proofArtifact = zkCryptographicEngine.generateProof({
      circuitId: circuitId || 'CIRCUIT-ZK-SOVEREIGN-RESIDENCY',
      publicInputs,
      privateWitness
    });
    res.json({ success: true, data: proofArtifact });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Verify ZK Proof (Public Verifier Endpoint)
zkEngineRouter.post('/verify-proof', (req: Request, res: Response) => {
  try {
    const { proofId } = req.body || {};
    const verification = zkCryptographicEngine.verifyProof(proofId);
    res.json({ success: true, data: verification });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. List recent proofs
zkEngineRouter.get('/proofs', (req: Request, res: Response) => {
  try {
    const proofs = zkCryptographicEngine.getRecentProofs();
    res.json({ success: true, count: proofs.length, data: proofs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
