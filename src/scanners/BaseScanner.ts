import { SovereignScanJob, ScannerResult, ScannerType } from '../types/scanning';

/**
 * Base interface for all compliance scanners.
 * Enforces a strict contract for all CLI, HTTP, and API based scanners.
 */
export abstract class BaseScanner {
  abstract readonly type: ScannerType;

  /**
   * Main execution method for the scanner.
   * Must return a standardized result array to be aggregated by the worker.
   */
  abstract run(job: SovereignScanJob): Promise<ScannerResult>;

  /**
   * Helper to format output uniformly
   */
  protected createResult(
    success: boolean,
    durationMs: number,
    violations: any[] = [],
    error?: string
  ): ScannerResult {
    return {
      scanner_type: this.type,
      success,
      duration_ms: durationMs,
      violations,
      error
    };
  }
}
