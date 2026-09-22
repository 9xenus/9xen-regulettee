import { 
  CountryPackManifest, 
  REGISTERED_COUNTRY_PACKS, 
  GLOBAL_SKELETON_PACKS,
  NRE_EXPANSION_PHASES,
  PhaseDefinition,
  LawRuleDefinition,
  LawDefinition,
  RegulatorDefinition,
  LetterTemplateDefinition,
  ALL_WORLD_COUNTRIES,
  WorldCountryDefinition
} from '../../packages/nre-packs';

export type { 
  CountryPackManifest, 
  PhaseDefinition, 
  LawRuleDefinition, 
  LawDefinition, 
  RegulatorDefinition,
  LetterTemplateDefinition,
  WorldCountryDefinition
};

export const TIER1_COUNTRY_PACKS = REGISTERED_COUNTRY_PACKS;
export const TIER2_SKELETON_PACKS = GLOBAL_SKELETON_PACKS;
export const ALL_NRE_WORLD_COUNTRIES = ALL_WORLD_COUNTRIES;
export const EXPANSION_PHASES = NRE_EXPANSION_PHASES;
