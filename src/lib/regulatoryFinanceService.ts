import { getDb } from '../db/sqlite';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export interface RegulatorBillingConfig {
  id: string;
  regulator_id: number;
  base_monthly_fee_cents: number;
  commission_rate_percentage: number;
  currency: string;
  billing_day_of_month: number;
  auto_invoice_enabled: boolean;
}

export interface PenaltyCollection {
  id: string;
  penalty_id: number;
  regulator_id: number;
  amount_collected_cents: number;
  platform_commission_amount_cents: number;
  commission_rate_snapshot: number;
  transaction_ref: string;
  payment_method: string;
  collected_at: string;
}

export class RegulatoryFinanceService {
  private static instance: RegulatoryFinanceService;

  private constructor() {}

  public static getInstance(): RegulatoryFinanceService {
    if (!RegulatoryFinanceService.instance) {
      RegulatoryFinanceService.instance = new RegulatoryFinanceService();
    }
    return RegulatoryFinanceService.instance;
  }

  /**
   * Get billing configuration for a regulator
   */
  public getRegulatorBillingConfig(regulatorId: number): RegulatorBillingConfig | null {
    const db = getDb();
    const config = db.prepare('SELECT * FROM regulator_billing_configs WHERE regulator_id = ?').get(regulatorId);
    return (config as RegulatorBillingConfig) || null;
  }

  /**
   * Record a penalty payment from an enterprise to the regulator
   */
  public async recordPenaltyPayment(params: {
    penaltyId: number;
    regulatorId: number;
    amountCents: number;
    paymentMethod: string;
    transactionRef: string;
  }): Promise<{ success: boolean; collectionId?: string; receiptId?: string; error?: string }> {
    const db = getDb();
    
    // 1. Get regulator billing config to calculate commission
    const config = this.getRegulatorBillingConfig(params.regulatorId);
    if (!config) {
      return { success: false, error: 'Regulator billing configuration not found' };
    }

    const commissionAmount = Math.round((params.amountCents * config.commission_rate_percentage) / 100);
    const collectionId = uuidv4();
    const receiptId = uuidv4();
    const receiptNumber = `RCPT-${new Date().getFullYear()}-${params.regulatorId}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    // 2. Generate Immutable Hash
    const hashPayload = JSON.stringify({
      collectionId,
      penaltyId: params.penaltyId,
      amount: params.amountCents,
      timestamp: new Date().toISOString(),
      regulatorId: params.regulatorId
    });
    const txHash = crypto.createHash('sha256').update(hashPayload).digest('hex');
    const qrCode = `VERIFY-${txHash.substring(0, 8).toUpperCase()}`;

    try {
      db.transaction(() => {
        // Update the penalty/fine status in the existing 'fines' table
        db.prepare('UPDATE fines SET payment_status = ?, paid_at = CURRENT_TIMESTAMP WHERE id = ?')
          .run('PAID', params.penaltyId);

        // Record the collection
        db.prepare(`
          INSERT INTO penalty_collections (
            id, penalty_id, regulator_id, amount_collected_cents, 
            platform_commission_amount_cents, commission_rate_snapshot, 
            transaction_ref, payment_method
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          collectionId, params.penaltyId, params.regulatorId, params.amountCents,
          commissionAmount, config.commission_rate_percentage, 
          params.transactionRef, params.paymentMethod
        );

        // Generate official receipt
        db.prepare(`
          INSERT INTO penalty_receipts (
            id, collection_id, receipt_number, immutable_tx_hash, qr_verification_code
          ) VALUES (?, ?, ?, ?, ?)
        `).run(receiptId, collectionId, receiptNumber, txHash, qrCode);
      })();

      return { success: true, collectionId, receiptId };
    } catch (err) {
      console.error('Failed to record penalty payment:', err);
      return { success: false, error: 'Database transaction failed' };
    }
  }

  /**
   * Generate a platform invoice for a regulator for a specific billing period
   */
  public generatePlatformInvoice(regulatorId: number, periodLabel: string): string | null {
    const db = getDb();
    
    // 1. Get billing config
    const config = this.getRegulatorBillingConfig(regulatorId);
    if (!config) return null;

    // 2. Aggregate unsettled commissions
    const unsettled = db.prepare(`
      SELECT SUM(platform_commission_amount_cents) as total_comm
      FROM penalty_collections
      WHERE regulator_id = ? AND settled_to_platform = 0
    `).get(regulatorId) as { total_comm: number };

    const totalCommission = unsettled.total_comm || 0;
    const baseFee = config.base_monthly_fee_cents;
    const grandTotal = baseFee + totalCommission;
    
    const invoiceId = `INV-PL-${uuidv4().substring(0, 8).toUpperCase()}`;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 15); // 15 days net

    try {
      db.transaction(() => {
        // Create the invoice
        db.prepare(`
          INSERT INTO platform_invoices (
            id, regulator_id, billing_period_label, base_fee_cents, 
            total_commission_cents, grand_total_cents, due_date, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          invoiceId, regulatorId, periodLabel, baseFee, 
          totalCommission, grandTotal, dueDate.toISOString(), 'ISSUED'
        );

        // Mark collections as settled
        db.prepare(`
          UPDATE penalty_collections 
          SET settled_to_platform = 1, platform_invoice_id = ?
          WHERE regulator_id = ? AND settled_to_platform = 0
        `).run(invoiceId, regulatorId);
      })();

      return invoiceId;
    } catch (err) {
      console.error('Failed to generate platform invoice:', err);
      return null;
    }
  }

  /**
   * Seed initial billing configurations for existing regulators
   */
  public seedInitialConfigs() {
    const db = getDb();
    const regulators = db.prepare('SELECT id FROM governments').all() as { id: number }[];
    
    const insertConfig = db.prepare(`
      INSERT OR IGNORE INTO regulator_billing_configs (
        id, regulator_id, base_monthly_fee_cents, commission_rate_percentage
      ) VALUES (?, ?, ?, ?)
    `);

    db.transaction(() => {
      regulators.forEach(reg => {
        insertConfig.run(uuidv4(), reg.id, 500000, 10.00); // Default $5000 + 10%
      });
    })();
  }
}

export const regulatoryFinanceService = RegulatoryFinanceService.getInstance();
