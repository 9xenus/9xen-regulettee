import { Router } from 'express';
import { SectorPack, ModelSpecification } from '../../core/src/types';
// import { requireSector } from '../../core/src/middleware/tenantSectorRouter';
import { legalRoutes } from './routes';

export class LegalSectorPack implements SectorPack {
  name = 'legal';
  version = '1.0.0';

  registerRules() {
    return {
      'MAX_LIABILITY_CAP_MULTIPLIER': 2.0,
      'REQUIRED_JURISDICTION': 'Bangladesh',
    };
  }

  registerWorkflows() {
    return {
      'CONTRACT_REDLINING': 'legal.workflows.aiRedlining',
      'RJSC_BOARD_RESOLUTION': 'legal.workflows.processResolutionToForm',
    };
  }

  registerReports() {
    return {
      'BOARD_COMPLIANCE_MEMO': 'templates/board_memo.ejs',
      'ANNUAL_RETURN_PACKAGE': 'templates/annual_return.ejs',
    };
  }

  registerModels(): ModelSpecification[] {
    return [
      {
        id: 'legal-contract-parser-llm',
        name: 'Legal Contract Parser',
        modelId: 'legal-contract-parser-llm',
        version: '1.4.0',
        featuresRequired: ['ocr_text_block', 'clause_taxonomy'],
        xaiSupported: true,
        accuracyTarget: 0.96
      },
      {
        id: 'legal-resolution-intent-extractor',
        name: 'Legal Resolution Extractor',
        modelId: 'legal-resolution-intent-extractor',
        version: '1.1.0',
        featuresRequired: ['meeting_minutes_text'],
        xaiSupported: true,
        accuracyTarget: 0.98
      }
    ];
  }

  registerRoutes(): Router {
    return legalRoutes;
  }
}
