import { getDb } from '../db/sqlite';
import { 
  TIER1_COUNTRY_PACKS, 
  ALL_NRE_WORLD_COUNTRIES, 
  CountryPackManifest, 
  EXPANSION_PHASES,
  PhaseDefinition
} from './nreCountryPacksData';

export class NreCountryPackLoader {
  /**
   * Initializes all regions, Tier 1 full packs and all world countries.
   */
  public static seedAllPacks(): { seeded: number; errors: string[] } {
    const db = getDb();
    if (!db || typeof db.prepare !== 'function') {
      return { seeded: 0, errors: ['Database unready'] };
    }

    const errors: string[] = [];
    let seeded = 0;

    // 1. Seed base regions matching allowed check ('asia','africa','middle_east','americas','europe')
    const regions = [
      { id: 'region_asia', code: 'asia', name: 'Asia & Pacific', currency: 'USD' },
      { id: 'region_middle_east', code: 'middle_east', name: 'Middle East & GCC', currency: 'USD' },
      { id: 'region_africa', code: 'africa', name: 'Africa', currency: 'USD' },
      { id: 'region_americas', code: 'americas', name: 'Americas', currency: 'USD' },
      { id: 'region_europe', code: 'europe', name: 'Europe', currency: 'EUR' }
    ];

    try {
      const insertRegion = db.prepare(`
        INSERT INTO nre_regions (id, region_code, region_name, reporting_currency, is_active)
        VALUES (?, ?, ?, ?, 1)
        ON CONFLICT(region_code) DO UPDATE SET 
          region_name = excluded.region_name,
          reporting_currency = excluded.reporting_currency
      `);
      for (const r of regions) {
        insertRegion.run(r.id, r.code, r.name, r.currency);
      }
    } catch (e: any) {
      errors.push(`Region seed error: ${e.message}`);
    }

    // 2. Load all Tier 1 packs (full manifest with laws & rules)
    for (const [code, pack] of Object.entries(TIER1_COUNTRY_PACKS)) {
      try {
        this.loadCountryPack(pack);
        seeded++;
      } catch (err: any) {
        errors.push(`Tier 1 pack error (${code}): ${err.message}`);
      }
    }

    // 3. Load all World Countries & Regulators (if not already loaded with full Tier 1 pack)
    try {
      const insertCountry = db.prepare(`
        INSERT INTO nre_countries (
          id, region_id, country_code, country_name, currency_code, languages,
          primary_language, timezone, legal_system, data_residency_required,
          international_sanctions_list, scanner_legal_gate, govt_mou_required,
          is_active, pack_version
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
        ON CONFLICT(country_code) DO UPDATE SET
          country_name = excluded.country_name,
          currency_code = excluded.currency_code,
          primary_language = excluded.primary_language,
          legal_system = excluded.legal_system
      `);
      const insertRegulator = db.prepare(`
        INSERT INTO nre_regulators (
          id, country_id, regulator_code, name, name_local, sectors, enforcement_power, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          name_local = excluded.name_local,
          sectors = excluded.sectors
      `);

      for (const wc of ALL_NRE_WORLD_COUNTRIES) {
        // If already loaded as Tier 1, don't overwrite with skeleton
        if (TIER1_COUNTRY_PACKS[wc.countryCode.toUpperCase()]) {
          continue;
        }

        const countryId = `country_${wc.countryCode.toLowerCase()}`;
        const regionId = `region_${wc.regionCode.toLowerCase()}`;
        
        insertCountry.run(
          countryId,
          regionId,
          wc.countryCode.toUpperCase(),
          wc.countryName,
          wc.currencyCode,
          JSON.stringify(wc.languages || [wc.primaryLanguage]),
          wc.primaryLanguage,
          'UTC',
          wc.legalSystem,
          wc.dataResidencyRequired ? 1 : 0,
          JSON.stringify(['UN', 'OFAC']),
          wc.scannerLegalGate || 'standard',
          wc.scannerLegalGate === 'government_mou_required' ? 1 : 0,
          '1.0.0-sovereign'
        );

        for (const reg of wc.regulators) {
          const regId = `reg_${wc.countryCode.toLowerCase()}_${reg.code.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
          insertRegulator.run(
            regId,
            countryId,
            reg.code,
            reg.name,
            reg.nameLocal || null,
            JSON.stringify([reg.sector || 'statutory_oversight']),
            reg.enforcementPower || 'full'
          );
        }
        seeded++;
      }
    } catch (e: any) {
      errors.push(`World countries seed error: ${e.message}`);
    }

    // Update active count per region
    try {
      db.exec(`
        UPDATE nre_regions
        SET active_countries_count = (
          SELECT COUNT(*) FROM nre_countries 
          WHERE nre_countries.region_id = nre_regions.id AND nre_countries.is_active = 1
        )
      `);
    } catch {}

    // Seed sample initial mock violations if none exist
    try {
      const vCount = (db.prepare(`SELECT COUNT(*) as c FROM nre_violations`).get() as any)?.c || 0;
      if (vCount === 0) {
        this.seedInitialViolations(db);
      }
    } catch (e: any) {
      errors.push(`Violations seed error: ${e.message}`);
    }

    return { seeded, errors };
  }

  /**
   * Loads or updates a single country pack manifest at runtime.
   */
  public static loadCountryPack(pack: CountryPackManifest): void {
    const db = getDb();
    if (!db || typeof db.prepare !== 'function') throw new Error('Database unready');

    const countryId = `country_${pack.countryCode.toLowerCase()}`;
    const regionId = `region_${pack.regionCode.toLowerCase()}`;

    // Upsert Country
    db.prepare(`
      INSERT INTO nre_countries (
        id, region_id, country_code, country_name, currency_code, languages,
        primary_language, timezone, legal_system, data_residency_required,
        international_sanctions_list, scanner_legal_gate, govt_mou_required,
        is_active, pack_version
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
      ON CONFLICT(country_code) DO UPDATE SET
        country_name = excluded.country_name,
        currency_code = excluded.currency_code,
        languages = excluded.languages,
        primary_language = excluded.primary_language,
        timezone = excluded.timezone,
        legal_system = excluded.legal_system,
        data_residency_required = excluded.data_residency_required,
        international_sanctions_list = excluded.international_sanctions_list,
        scanner_legal_gate = excluded.scanner_legal_gate,
        govt_mou_required = excluded.govt_mou_required,
        pack_version = excluded.pack_version
    `).run(
      countryId,
      regionId,
      pack.countryCode.toUpperCase(),
      pack.countryName,
      pack.currencyCode,
      JSON.stringify(pack.languages),
      pack.primaryLanguage,
      pack.timezone,
      pack.legalSystem,
      pack.dataResidencyRequired ? 1 : 0,
      JSON.stringify(pack.internationalSanctionsList || []),
      pack.scannerLegalGate,
      pack.govtMouRequired ? 1 : 0,
      pack.packVersion
    );

    // Save pack manifest copy in nre_country_packs
    db.prepare(`
      INSERT INTO nre_country_packs (
        id, country_id, country_code, pack_version, scanner_config,
        notification_channels, letter_template_set, watchlist_sources,
        registry_integration, fx_source, status, activated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(country_code) DO UPDATE SET
        pack_version = excluded.pack_version,
        scanner_config = excluded.scanner_config,
        notification_channels = excluded.notification_channels,
        letter_template_set = excluded.letter_template_set,
        watchlist_sources = excluded.watchlist_sources,
        registry_integration = excluded.registry_integration,
        fx_source = excluded.fx_source,
        status = excluded.status
    `).run(
      `pack_${pack.countryCode.toLowerCase()}`,
      countryId,
      pack.countryCode.toUpperCase(),
      pack.packVersion,
      JSON.stringify(pack.scannerConfig),
      JSON.stringify(pack.notificationChannels),
      JSON.stringify(pack.letterTemplateSet),
      JSON.stringify(pack.internationalSanctionsList || []),
      JSON.stringify(pack.registryIntegration || {}),
      pack.fxSource,
      pack.status
    );

    // Insert Regulators
    const insertRegulator = db.prepare(`
      INSERT INTO nre_regulators (
        id, country_id, regulator_code, name, name_local, sectors,
        enforcement_power, appeal_body, portal_config, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        name_local = excluded.name_local,
        sectors = excluded.sectors,
        enforcement_power = excluded.enforcement_power,
        appeal_body = excluded.appeal_body,
        portal_config = excluded.portal_config
    `);

    for (const reg of pack.regulators) {
      const regId = `reg_${pack.countryCode.toLowerCase()}_${reg.code.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      insertRegulator.run(
        regId,
        countryId,
        reg.code,
        reg.name,
        reg.nameLocal || null,
        JSON.stringify(reg.sectors || [reg.sector]),
        reg.enforcementPower,
        reg.appealBody || null,
        JSON.stringify(reg.portalConfig || {})
      );
    }

    // Insert Laws & Rules
    const insertLaw = db.prepare(`
      INSERT INTO nre_laws (
        id, country_id, law_code, law_name, law_name_local, regulator_id,
        language, effective_from, status, version, supersedes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        law_name = excluded.law_name,
        law_name_local = excluded.law_name_local,
        regulator_id = excluded.regulator_id,
        language = excluded.language,
        status = excluded.status
    `);

    const insertRule = db.prepare(`
      INSERT INTO nre_law_rules (
        id, law_id, section_code, section_text, section_text_local,
        violation_types, penalty_type, penalty_min, penalty_max,
        penalty_currency, daily_accrual, revenue_percent, severity_grade,
        repeat_offense_rule, payment_deadline_days, appeal_window_days,
        imprisonment_note, effective_from, auto_enforceable
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        section_text = excluded.section_text,
        section_text_local = excluded.section_text_local,
        penalty_min = excluded.penalty_min,
        penalty_max = excluded.penalty_max,
        severity_grade = excluded.severity_grade
    `);

    for (const law of pack.laws) {
      const lawId = `law_${pack.countryCode.toLowerCase()}_${law.code.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      const regulatorId = law.regulatorCode 
        ? `reg_${pack.countryCode.toLowerCase()}_${law.regulatorCode.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
        : null;

      insertLaw.run(
        lawId,
        countryId,
        law.code,
        law.title,
        law.titleLocal || null,
        regulatorId,
        law.language || 'en',
        law.effectiveFrom || null,
        law.status || 'active',
        law.version || 1,
        law.supersedes || null
      );

      for (const rule of law.rules) {
        const ruleId = `rule_${lawId}_${rule.section.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        insertRule.run(
          ruleId,
          lawId,
          rule.section,
          rule.title,
          rule.titleLocal || null,
          JSON.stringify([rule.violationType]),
          rule.penaltyType,
          rule.minPenalty,
          rule.maxPenalty,
          rule.currency,
          rule.dailyAccrual || 0,
          rule.revenuePercent || 0,
          rule.severityGrade,
          JSON.stringify(rule.repeatOffenseRule || { multiplier: rule.repeatMultiplier }),
          rule.paymentDeadlineDays,
          rule.appealWindowDays,
          rule.imprisonmentNote || null,
          law.effectiveFrom || null,
          rule.autoEnforceable ? 1 : 0
        );
      }
    }
  }

  /**
   * Retrieves all regions with active metrics.
   */
  public static getAllRegions(): any[] {
    const db = getDb();
    if (!db || typeof db.prepare !== 'function') return [];
    try {
      return db.prepare(`
        SELECT r.*,
          (SELECT COUNT(*) FROM nre_countries WHERE region_id = r.id) as total_countries,
          (SELECT COUNT(*) FROM nre_countries WHERE region_id = r.id AND is_active = 1) as active_countries
        FROM nre_regions r
        ORDER BY r.region_name ASC
      `).all();
    } catch {
      return [];
    }
  }

  /**
   * Toggles active status of an entire region.
   * If cascade is requested or default, cascades active state to all countries in the region.
   */
  public static toggleRegion(regionCode: string, targetState?: boolean, cascade: boolean = true): { success: boolean; region?: any; affectedCountries?: number; error?: string } {
    const db = getDb();
    if (!db) return { success: false, error: 'Database unavailable' };
    try {
      const code = regionCode.toLowerCase();
      const current = db.prepare(`SELECT * FROM nre_regions WHERE region_code = ?`).get(code) as any;
      if (!current) return { success: false, error: `Region ${regionCode} not found` };

      const nextActive = targetState !== undefined ? (targetState ? 1 : 0) : (current.is_active ? 0 : 1);
      
      db.prepare(`UPDATE nre_regions SET is_active = ? WHERE region_code = ?`).run(nextActive, code);

      let affected = 0;
      if (cascade) {
        const updateCountries = db.prepare(`UPDATE nre_countries SET is_active = ? WHERE region_id = ?`);
        const res = updateCountries.run(nextActive, current.id);
        affected = res.changes || 0;

        // Also update pack status
        db.prepare(`
          UPDATE nre_country_packs 
          SET status = ? 
          WHERE country_id IN (SELECT id FROM nre_countries WHERE region_id = ?)
        `).run(nextActive ? 'active' : 'suspended', current.id);
      }

      // Update region count cache
      db.prepare(`
        UPDATE nre_regions 
        SET active_countries_count = (SELECT COUNT(*) FROM nre_countries WHERE region_id = ? AND is_active = 1)
        WHERE id = ?
      `).run(current.id, current.id);

      const updated = db.prepare(`SELECT * FROM nre_regions WHERE region_code = ?`).get(code);
      return { success: true, region: updated, affectedCountries: affected };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  /**
   * Toggles active status of a country.
   */
  public static toggleCountry(countryCode: string, targetState?: boolean): { success: boolean; country?: any; error?: string } {
    const db = getDb();
    if (!db) return { success: false, error: 'Database unavailable' };
    try {
      const code = countryCode.toUpperCase();
      const current = db.prepare(`SELECT * FROM nre_countries WHERE country_code = ?`).get(code) as any;
      if (!current) return { success: false, error: `Country ${countryCode} not found` };

      const nextActive = targetState !== undefined ? (targetState ? 1 : 0) : (current.is_active ? 0 : 1);
      
      db.prepare(`UPDATE nre_countries SET is_active = ? WHERE country_code = ?`).run(nextActive, code);
      
      // Update pack status if exists
      db.prepare(`
        UPDATE nre_country_packs 
        SET status = ? 
        WHERE country_code = ?
      `).run(nextActive ? 'active' : 'suspended', code);

      // Refresh region active count
      db.prepare(`
        UPDATE nre_regions 
        SET active_countries_count = (SELECT COUNT(*) FROM nre_countries WHERE region_id = ? AND is_active = 1)
        WHERE id = ?
      `).run(current.region_id, current.region_id);

      const updated = db.prepare(`
        SELECT c.*, r.region_name, r.region_code 
        FROM nre_countries c 
        JOIN nre_regions r ON c.region_id = r.id 
        WHERE c.country_code = ?
      `).get(code);

      return { success: true, country: updated };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  /**
   * Toggles active status of a regulator.
   */
  public static toggleRegulator(regulatorIdOrCode: string, targetState?: boolean, countryCode?: string): { success: boolean; regulator?: any; error?: string } {
    const db = getDb();
    if (!db) return { success: false, error: 'Database unavailable' };
    try {
      let reg: any = null;
      if (countryCode) {
        reg = db.prepare(`
          SELECT r.* FROM nre_regulators r 
          JOIN nre_countries c ON r.country_id = c.id 
          WHERE (r.id = ? OR r.regulator_code = ?) AND c.country_code = ?
        `).get(regulatorIdOrCode, regulatorIdOrCode, countryCode.toUpperCase());
      } else {
        reg = db.prepare(`SELECT * FROM nre_regulators WHERE id = ? OR regulator_code = ?`).get(regulatorIdOrCode, regulatorIdOrCode);
      }

      if (!reg) return { success: false, error: `Regulator not found` };

      const nextActive = targetState !== undefined ? (targetState ? 1 : 0) : (reg.is_active ? 0 : 1);
      db.prepare(`UPDATE nre_regulators SET is_active = ? WHERE id = ?`).run(nextActive, reg.id);

      const updated = db.prepare(`SELECT * FROM nre_regulators WHERE id = ?`).get(reg.id);
      return { success: true, regulator: updated };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  /**
   * Retrieves all regulators, optionally filtered by country.
   */
  public static getAllRegulators(countryCode?: string): any[] {
    const db = getDb();
    if (!db || typeof db.prepare !== 'function') return [];
    try {
      if (countryCode) {
        return db.prepare(`
          SELECT r.*, c.country_code, c.country_name, c.is_active as country_is_active 
          FROM nre_regulators r 
          JOIN nre_countries c ON r.country_id = c.id 
          WHERE c.country_code = ?
          ORDER BY r.name ASC
        `).all(countryCode.toUpperCase());
      }
      return db.prepare(`
        SELECT r.*, c.country_code, c.country_name, c.is_active as country_is_active 
        FROM nre_regulators r 
        JOIN nre_countries c ON r.country_id = c.id 
        ORDER BY c.country_name ASC, r.name ASC
      `).all();
    } catch {
      return [];
    }
  }

  /**
   * Validates if a user account / entity from a given country & optional regulator is permitted to register/login.
   */
  public static validateAccountAccess(countryCode: string, regulatorCode?: string): { allowed: boolean; error?: string; countryName?: string; regionName?: string } {
    const db = getDb();
    if (!db || typeof db.prepare !== 'function') return { allowed: true };
    try {
      const code = countryCode.toUpperCase();
      const country = db.prepare(`
        SELECT c.*, r.region_name, r.is_active as region_is_active 
        FROM nre_countries c 
        JOIN nre_regions r ON c.region_id = r.id 
        WHERE c.country_code = ?
      `).get(code) as any;

      if (!country) {
        // If not found in DB, default allow or report missing
        return { allowed: true, countryName: countryCode };
      }

      // Check Region status
      if (country.region_is_active === 0) {
        return {
          allowed: false,
          error: `Jurisdiction Region (${country.region_name}) is currently suspended by Sovereign Admin. All account operations in this region are temporarily paused.`,
          countryName: country.country_name,
          regionName: country.region_name
        };
      }

      // Check Country status
      if (country.is_active === 0) {
        return {
          allowed: false,
          error: `Jurisdiction ${country.country_name} (${country.country_code}) is currently disabled by Sovereign Admin. Account registration, login, and operations are suspended for this territory.`,
          countryName: country.country_name,
          regionName: country.region_name
        };
      }

      // Check Regulator if provided
      if (regulatorCode) {
        const reg = db.prepare(`
          SELECT * FROM nre_regulators 
          WHERE country_id = ? AND (regulator_code = ? OR id = ?)
        `).get(country.id, regulatorCode, regulatorCode) as any;

        if (reg && reg.is_active === 0) {
          return {
            allowed: false,
            error: `Regulator authority '${reg.name}' (${reg.regulator_code}) in ${country.country_name} is currently deactivated by Sovereign Admin. Operations under this agency are disabled.`,
            countryName: country.country_name,
            regionName: country.region_name
          };
        }
      }

      return { allowed: true, countryName: country.country_name, regionName: country.region_name };
    } catch (e: any) {
      return { allowed: true };
    }
  }

  /**
   * Retrieves all countries with regions and summary metrics.
   */
  public static getAllCountries(onlyActive: boolean = false): any[] {
    const db = getDb();
    if (!db || typeof db.prepare !== 'function') return [];
    try {
      const sql = `
        SELECT c.*, r.region_name, r.region_code, r.is_active as region_is_active,
          (SELECT COUNT(*) FROM nre_regulators WHERE country_id = c.id) as regulator_count,
          (SELECT COUNT(*) FROM nre_regulators WHERE country_id = c.id AND is_active = 1) as active_regulator_count,
          (SELECT COUNT(*) FROM nre_laws WHERE country_id = c.id) as law_count,
          COALESCE((SELECT status FROM nre_country_packs WHERE country_code = c.country_code), CASE WHEN c.is_active = 1 THEN 'active' ELSE 'suspended' END) as pack_status
        FROM nre_countries c
        JOIN nre_regions r ON c.region_id = r.id
        ${onlyActive ? 'WHERE c.is_active = 1 AND r.is_active = 1' : ''}
        ORDER BY c.country_name ASC
      `;
      return db.prepare(sql).all();
    } catch {
      return [];
    }
  }

  /**
   * Retrieves specific country pack manifest with full populated details.
   */
  public static getCountryDetail(countryCode: string): any {
    const db = getDb();
    if (!db) return null;
    try {
      const code = countryCode.toUpperCase();
      const country = db.prepare(`
        SELECT c.*, r.region_name, r.region_code, r.is_active as region_is_active 
        FROM nre_countries c 
        JOIN nre_regions r ON c.region_id = r.id 
        WHERE c.country_code = ?
      `).get(code) as any;

      if (!country) return null;

      const pack = db.prepare(`SELECT * FROM nre_country_packs WHERE country_code = ?`).get(code) as any;
      const regulators = db.prepare(`SELECT * FROM nre_regulators WHERE country_id = ?`).all(country.id);
      const laws = db.prepare(`SELECT * FROM nre_laws WHERE country_id = ?`).all(country.id);

      const populatedLaws = laws.map((l: any) => {
        const rules = db.prepare(`SELECT * FROM nre_law_rules WHERE law_id = ?`).all(l.id);
        return { ...l, rules };
      });

      return {
        ...country,
        packConfig: pack ? {
          ...pack,
          scanner_config: typeof pack.scanner_config === 'string' ? JSON.parse(pack.scanner_config) : pack.scanner_config,
          notification_channels: typeof pack.notification_channels === 'string' ? JSON.parse(pack.notification_channels) : pack.notification_channels,
          letter_template_set: typeof pack.letter_template_set === 'string' ? JSON.parse(pack.letter_template_set) : pack.letter_template_set
        } : null,
        regulators,
        laws: populatedLaws
      };
    } catch {
      return null;
    }
  }

  private static seedInitialViolations(db: any) {
    const insertViolation = db.prepare(`
      INSERT INTO nre_violations (
        id, case_number, country_id, regulator_id, entity_name, entity_domain,
        violation_details, evidence_hash, confidence_score, status, penalty_amount, currency
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertViolation.run(
      'viol_bd_001',
      'CASE-BD-2026-BTRC-084',
      'country_bd',
      'reg_bd_btrc',
      'QuickPay FinTech Ltd',
      'quickpay-bd.net',
      'Unlawful routing of unverified customer biometric metadata and transmission outside national sovereign boundary under CSA 2023 Sec 17 & BTRC Act Sec 65A.',
      'sha256_bd_772a819cd91f',
      0.94,
      'APPROVED',
      5000000,
      'BDT'
    );

    insertViolation.run(
      'viol_ae_001',
      'CASE-AE-2026-DPO-109',
      'country_ae',
      'reg_ae_uae_dpo',
      'Apex Horizon Cloud FZ-LLC',
      'horizon-ae.io',
      'Cross-border telemetry exfiltration without adequacy decision or sovereign consent under Federal Decree-Law 45/2021 Article 13.',
      'sha256_ae_991c44bb21a0',
      0.98,
      'ISSUED',
      500000,
      'AED'
    );

    insertViolation.run(
      'viol_in_001',
      'CASE-IN-2026-DPBI-312',
      'country_in',
      'reg_in_dpdpa_board',
      'Bharat Direct Retail Tech',
      'bharatdirect-mart.in',
      'Failure to implement reasonable technical security safeguards leading to public exposure of customer PII under DPDP Act 2023 Section 8(6).',
      'sha256_in_442e998bb12c',
      0.96,
      'APPROVED',
      50000000,
      'INR'
    );
  }
}
