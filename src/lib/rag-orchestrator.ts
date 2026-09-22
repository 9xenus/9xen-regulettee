import { AdvancedRagPipelineService } from "../ai/rag/advanced_pipeline";

export async function ragQuery(query: string, orgId: string = 'org_enterprise_default') {
  const result = await AdvancedRagPipelineService.retrieveAndAnalyze(orgId, query);
  return result.synthesizedAnswer;
}
