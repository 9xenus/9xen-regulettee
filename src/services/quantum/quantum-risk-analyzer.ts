import { CryptoAsset } from './crypto-scanner';

export interface QuantumRisk {
  score: number;
  vulnerableAlgorithms: string[];
  affectedServices: string[];
}

export class QuantumRiskAnalyzer {
  /**
   * Analyzes an inventory of cryptographic assets against ENISA/NIST guidance.
   * Identifies quantum-vulnerable algorithms and calculates a risk score.
   */
  static async analyze(inventory: CryptoAsset[]): Promise<QuantumRisk> {
    console.log(`[QuantumRiskAnalyzer] Analyzing ${inventory.length} assets...`);
    
    // Simulate AI / complex logic latency
    await new Promise(resolve => setTimeout(resolve, 600));

    const vulnerableAlgos = ['RSA', 'ECDSA', 'ECDH', 'DSA'];
    const affectedAssets = inventory.filter(asset => 
      vulnerableAlgos.includes(asset.algorithm) || (asset.algorithm === 'RSA' && asset.keySize < 3072)
    );

    const score = affectedAssets.length > 0 
      ? Math.min(100, 30 + (affectedAssets.length * 15)) 
      : 10; // Base score 10 if all assets are safe

    // Deduplicate vulnerable algorithms found
    const foundAlgos = Array.from(new Set(affectedAssets.map(a => a.algorithm)));

    return {
      score,
      vulnerableAlgorithms: foundAlgos,
      affectedServices: affectedAssets.map(a => a.endpoint)
    };
  }
}
