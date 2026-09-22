import { getDb } from '../db/sqlite';

export interface FxRateEntry {
  currency: string;
  rateToUsd: number; // 1 unit of local currency = X USD
  source: string;
}

export const OFFICIAL_FX_RATES: Record<string, FxRateEntry> = {
  USD: { currency: 'USD', rateToUsd: 1.0, source: 'FEDERAL_RESERVE' },
   // ~120 USD/USD
  INR: { currency: 'INR', rateToUsd: 0.0117, source: 'RBI_FBIL' }, // ~85 INR/USD
  AED: { currency: 'AED', rateToUsd: 0.2723, source: 'CENTRAL_BANK_UAE' }, // Pegged 3.6725
  SAR: { currency: 'SAR', rateToUsd: 0.2667, source: 'SAMA_OFFICIAL' }, // Pegged 3.75
  NGN: { currency: 'NGN', rateToUsd: 0.00067, source: 'NAFEX_CBN' }, // ~1500 NGN/USD
  KES: { currency: 'KES', rateToUsd: 0.0077, source: 'CENTRAL_BANK_KENYA' }, // ~130 KES/USD
  ZAR: { currency: 'ZAR', rateToUsd: 0.055, source: 'SARB_RESERVE_BANK' }, // ~18.2 ZAR/USD
  EUR: { currency: 'EUR', rateToUsd: 1.08, source: 'ECB_REFERENCE' },
  GBP: { currency: 'GBP', rateToUsd: 1.28, source: 'BANK_OF_ENGLAND' },
  SGD: { currency: 'SGD', rateToUsd: 0.74, source: 'MAS_SINGAPORE' },
  CAD: { currency: 'CAD', rateToUsd: 0.73, source: 'BANK_OF_CANADA' },
  BRL: { currency: 'BRL', rateToUsd: 0.18, source: 'BACEN_BRAZIL' },
  JPY: { currency: 'JPY', rateToUsd: 0.0068, source: 'BANK_OF_JAPAN' }
};

export class NreFxService {
  /**
   * Converts local currency to USD and records an entry in nre_penalty_fx_log.
   */
  public static convertAndLog(
    violationId: string,
    localAmount: number,
    localCurrency: string
  ): { usdAmount: number; fxRate: number; fxSource: string } {
    const currencyUpper = (localCurrency || 'USD').toUpperCase();
    const rateInfo = OFFICIAL_FX_RATES[currencyUpper] || {
      currency: currencyUpper,
      rateToUsd: 1.0,
      source: 'FALLBACK_PARITY'
    };

    const usdAmount = Math.round((localAmount * rateInfo.rateToUsd) * 100) / 100;
    const db = getDb();

    if (db && typeof db.prepare === 'function') {
      try {
        const logId = `fx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        db.prepare(`
          INSERT INTO nre_penalty_fx_log (
            id, violation_id, local_currency, local_amount, usd_amount, fx_rate, fx_source, conversion_timestamp
          ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `).run(logId, violationId, currencyUpper, localAmount, usdAmount, rateInfo.rateToUsd, rateInfo.source);
      } catch (err) {
        console.warn('[NRE_FX] Failed to log conversion:', err);
      }
    }

    return {
      usdAmount,
      fxRate: rateInfo.rateToUsd,
      fxSource: rateInfo.source
    };
  }

  /**
   * Calculates total penalty exposure across all countries in USD.
   */
  public static getGlobalPenaltyExposureUsd(): { totalUsd: number; byCountry: Record<string, number> } {
    const db = getDb();
    if (!db || typeof db.prepare !== 'function') return { totalUsd: 0, byCountry: {} };

    try {
      const rows = db.prepare(`
        SELECT v.country_id, v.currency, SUM(v.penalty_amount) as total_local
        FROM nre_violations v
        WHERE v.status IN ('APPROVED', 'ISSUED', 'UNDER_REVIEW')
        GROUP BY v.country_id, v.currency
      `).all() as any[];

      let totalUsd = 0;
      const byCountry: Record<string, number> = {};

      for (const row of rows) {
        const rate = OFFICIAL_FX_RATES[row.currency]?.rateToUsd || 1.0;
        const inUsd = (row.total_local || 0) * rate;
        totalUsd += inUsd;
        byCountry[row.country_id] = (byCountry[row.country_id] || 0) + inUsd;
      }

      return { totalUsd: Math.round(totalUsd), byCountry };
    } catch {
      return { totalUsd: 0, byCountry: {} };
    }
  }
}
