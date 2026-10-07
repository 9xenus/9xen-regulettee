/**
 * AI ASSET DISCOVERY + EU AI ACT SYSTEM CLASSIFIER
 *
 * Discovery builds an inventory of AI assets found while scanning an estate (SDK usage, provider endpoints,
 * agents / MCP servers, IaC ML endpoints, model artefacts, ERP/CRM AI features, website widgets, AI CI steps).
 *
 * The classifier proposes an EU AI Act tier from textual signals. It is HEURISTIC: it can only see names and
 * code, not the system's real intended purpose. Anything high-risk/prohibited, or low-confidence, is flagged
 * `requiresHumanReview` and must be confirmed by a compliance officer before it is relied upon.
 */
import crypto from 'node:crypto';
import { AI_PROVIDER_DOMAINS, detectKind, type EstateFile } from './ai-estate-scanner';
import type { AiSystemProfile } from './ai-compliance-risk-engine';

export type AiAssetType =
  | 'LLM_PROVIDER_INTEGRATION' | 'AI_SDK_USAGE' | 'AGENT' | 'MCP_SERVER' | 'ML_ENDPOINT'
  | 'MODEL_ARTIFACT' | 'AI_FEATURE_ERP_CRM' | 'AI_WEBSITE_WIDGET' | 'AI_PIPELINE_STEP';

export type AiRiskTier = 'UNACCEPTABLE_PROHIBITED' | 'HIGH_RISK_ANNEX_III' | 'SPECIFIC_TRANSPARENCY_ART_50' | 'MINIMAL_RISK';

export interface DiscoveredAiAsset {
  id: string;
  type: AiAssetType;
  name: string;
  vendor: string | null;
  region: string | null;
  sanctioned: boolean | null;
  locations: { path: string; line: number }[];
  /** Per-usage-site text used for classification (never persisted). Classified separately so one file's purpose can't taint another's. */
  contexts: { path: string; text: string }[];
}

export interface Classification {
  riskClass: AiRiskTier;
  annexArea: string | null;
  confidence: number;
  signals: string[];
  obligations: string[];
  requiresHumanReview: boolean;
  rationale: string;
}

// ── Discovery ────────────────────────────────────────────────────────────────

const SDKS: { re: RegExp; name: string; vendor: string }[] = [
  { re: /(from\s+openai\s+import|require\(['"]openai['"]\)|from\s+['"]openai['"]|import\s+OpenAI|\bopenai\.(?:chat\.completions|ChatCompletion|Completion|Embedding|responses)\b)/, name: 'OpenAI SDK', vendor: 'OpenAI' },
  { re: /(from\s+anthropic\s+import|@anthropic-ai\/sdk|import\s+anthropic|\banthropic\.messages\b)/, name: 'Anthropic SDK', vendor: 'Anthropic' },
  { re: /(@google\/genai|google\.generativeai|google-generativeai|from\s+vertexai|@google-cloud\/vertexai|\.generateContent\()/, name: 'Google Gemini / Vertex SDK', vendor: 'Google' },
  { re: /(bedrock-runtime|@aws-sdk\/client-bedrock|\.invoke_model\(|InvokeModelCommand)/, name: 'AWS Bedrock SDK', vendor: 'AWS' },
  { re: /(@azure\/openai|azure\.ai\.openai|AzureOpenAI)/, name: 'Azure OpenAI SDK', vendor: 'Microsoft' },
  { re: /(from\s+mistralai|@mistralai\/mistralai)/, name: 'Mistral SDK', vendor: 'Mistral AI' },
  { re: /(import\s+cohere|from\s+cohere\s+import|cohere-ai)/, name: 'Cohere SDK', vendor: 'Cohere' },
  { re: /(from\s+langchain|@langchain\/|langchain-)/, name: 'LangChain', vendor: 'LangChain' },
  { re: /(llama_index|llamaindex|from\s+llama_index)/, name: 'LlamaIndex', vendor: 'LlamaIndex' },
  { re: /(from\s+transformers\s+import|AutoModel|AutoTokenizer|from_pretrained)/, name: 'Hugging Face Transformers', vendor: 'Hugging Face' },
  { re: /(import\s+torch\b|from\s+torch\b)/, name: 'PyTorch (in-house models)', vendor: 'Self-hosted' },
  { re: /(import\s+tensorflow|from\s+tensorflow|import\s+keras)/, name: 'TensorFlow / Keras (in-house models)', vendor: 'Self-hosted' },
  { re: /(\bollama\b|\bvllm\b|llama[_-]?cpp)/i, name: 'Self-hosted LLM runtime', vendor: 'Self-hosted' }
];

const AGENT_FRAMEWORKS = /(crewai|langgraph|autogen|AgentExecutor|create_react_agent|openai-agents|smolagents|pydantic_ai|semantic[_-]?kernel)/i;
const IAC_ML = /resource\s+"((?:aws_sagemaker_[a-z_]+|aws_bedrock[a-z_]*|google_vertex_ai_[a-z_]+|azurerm_cognitive_[a-z_]+|azurerm_machine_learning_[a-z_]+|google_ml_engine_[a-z_]+))"\s+"([^"]+)"/g;
const MODEL_FILE = /\.(safetensors|gguf|ckpt|onnx|pt|pth|h5|pb|tflite|mlmodel)$/i;
const ERP_AI = /(agentforce|einstein\s*gpt|einstein|joule|copilot\s+for\s+(?:dynamics|sales|service|finance)|now\s*assist|workday\s*ai|breeze|zoho\s*zia|oracle\s*ai|netsuite\s*(?:ai|text\s*enhance))/i;
const WIDGET = /(intercom[^"'\s]*fin|widget\.intercom|drift\.com|js\.driftt|tidio|botpress|voiceflow|dialogflow|landbot|ada\.cx|kommunicate|crisp\.chat|zendesk[^"'\s]*ai|freshchat|manychat|chat-widget|chatbot)/i;
const CI_AI_STEP = /uses:\s*([\w./-]+)@/gi;
const CI_AI_NAME = /(openai|anthropic|claude|gemini|copilot|coderabbit|ai-?review|llm|gpt)/i;

const stableId = (type: string, name: string): string =>
  `ast_${crypto.createHash('sha1').update(`${type}|${name.toLowerCase()}`).digest('hex').slice(0, 10)}`;

const lineOf = (content: string, idx: number): number => content.slice(0, Math.max(0, idx)).split('\n').length;

export class AiAssetDiscovery {
  static discover(files: EstateFile[], opts: { allPaths?: string[]; sanctioned?: string[] } = {}): DiscoveredAiAsset[] {
    const sanctioned = (opts.sanctioned || []).map(s => s.toLowerCase());
    const assets = new Map<string, DiscoveredAiAsset>();
    const add = (type: AiAssetType, name: string, path: string, line: number, ctx: string, extra: Partial<DiscoveredAiAsset> = {}) => {
      const id = stableId(type, name);
      const cur = assets.get(id) || { id, type, name, vendor: null, region: null, sanctioned: null, locations: [], contexts: [], ...extra };
      if (cur.locations.length < 5 && !cur.locations.some(l => l.path === path && l.line === line)) cur.locations.push({ path, line });
      if (cur.contexts.length < 8 && !cur.contexts.some(c => c.path === path)) cur.contexts.push({ path, text: ctx.slice(0, 8000) });
      assets.set(id, cur);
    };

    for (const f of files) {
      if (!f?.path || typeof f.content !== 'string') continue;
      const kind = f.kind || detectKind(f.path, f.content);
      const c = f.content;
      const low = c.toLowerCase();

      for (const s of SDKS) { const m = s.re.exec(c); if (m) add('AI_SDK_USAGE', s.name, f.path, lineOf(c, m.index), c, { vendor: s.vendor }); }

      const catalogue = new Set(AI_PROVIDER_DOMAINS.filter(p => low.includes(p.domain)).map(p => p.provider)).size >= 4;
      for (const p of AI_PROVIDER_DOMAINS) {
        const i = low.indexOf(p.domain);
        if (i >= 0) {
          const ok = sanctioned.some(x => x === p.domain || p.domain.includes(x) || p.provider.toLowerCase().includes(x) || x.includes(p.provider.toLowerCase()));
          // A provider catalogue file mentions every purpose; its text says nothing about how any one provider is used.
          add('LLM_PROVIDER_INTEGRATION', p.provider, f.path, lineOf(c, i), catalogue ? '' : c, { vendor: p.provider, region: p.region, sanctioned: ok });
        }
      }

      const ag = AGENT_FRAMEWORKS.exec(c);
      if (ag) add('AGENT', `Agent framework: ${ag[1]}`, f.path, lineOf(c, ag.index), c);

      if (kind === 'AGENT_CONFIG') {
        add('AGENT', `Agent config: ${f.path}`, f.path, 1, c);
        try {
          const servers = (JSON.parse(c) as { mcpServers?: Record<string, unknown> }).mcpServers;
          if (servers && typeof servers === 'object') for (const k of Object.keys(servers).slice(0, 20)) add('MCP_SERVER', `MCP server: ${k}`, f.path, Math.max(1, lineOf(c, c.indexOf(`"${k}"`))), c);
        } catch { /* non-JSON agent config */ }
      }

      if (kind === 'IAC') {
        for (const m of c.matchAll(IAC_ML)) add('ML_ENDPOINT', `${m[1]}.${m[2]}`, f.path, lineOf(c, m.index!), c);
      }

      for (const m of c.matchAll(/from_pretrained\(\s*["']([^"']{3,100})["']/g)) add('MODEL_ARTIFACT', `Model: ${m[1]}`, f.path, lineOf(c, m.index!), c);

      if (kind === 'ERP_CRM_CONFIG') { const m = ERP_AI.exec(c); if (m) add('AI_FEATURE_ERP_CRM', `ERP/CRM AI feature: ${m[1].trim()}`, f.path, lineOf(c, m.index), c); }
      if (kind === 'WEBSITE') { const m = WIDGET.exec(c); if (m) add('AI_WEBSITE_WIDGET', `Website AI widget: ${m[1].toLowerCase()}`, f.path, lineOf(c, m.index), c); }
      if (kind === 'CICD_PIPELINE') {
        for (const m of c.matchAll(CI_AI_STEP)) if (CI_AI_NAME.test(m[1])) add('AI_PIPELINE_STEP', `CI AI step: ${m[1]}`, f.path, lineOf(c, m.index!), c);
      }
    }

    for (const p of opts.allPaths || []) if (MODEL_FILE.test(p)) add('MODEL_ARTIFACT', `Model file: ${p}`, p, 1, p);

    return Array.from(assets.values());
  }
}

// ── Classifier ───────────────────────────────────────────────────────────────

interface Area { area: string; annex: string; subject: RegExp; action?: RegExp; medical?: boolean; minTerms?: number }

const PROHIBITED: { label: string; re: RegExp }[] = [
  { label: 'social scoring (Art. 5(1)(c))', re: /(social[\s_-]?scor|citizen[\s_-]?scor)/i },
  { label: 'emotion recognition (Art. 5(1)(f))', re: /(emotion[\s_-]?recogni|affect[\s_-]?detect|emotion[\s_-]?detect)/i },
  { label: 'untargeted facial-image scraping (Art. 5(1)(e))', re: /(facial[\s_-]?image[\s_-]?scrap|scrap\w*[^\n]{0,30}\bfaces?\b|clearview)/i },
  { label: 'predictive policing of individuals (Art. 5(1)(d))', re: /(predictive[\s_-]?polic|crime[\s_-]?risk[\s_-]?(?:score|assess))/i },
  { label: 'biometric categorisation of sensitive traits (Art. 5(1)(g))', re: /(biometric[\s_-]?categori|infer\w*\s+(?:sexual|political|religio|ethnic|race))/i },
  { label: 'subliminal / manipulative techniques (Art. 5(1)(a))', re: /(subliminal|manipulat\w+[\s_-]?(?:technique|persuasion)\b)/i },
  { label: 'real-time remote biometric identification (Art. 5(1)(h))', re: /real[\s_-]?time[\s_-]?(?:remote[\s_-]?)?(?:biometric|face)/i }
];

const HIGH_AREAS: Area[] = [
  { area: 'BIOMETRICS', annex: 'Annex III(1)', subject: /(biometric|face[\s_-]?(?:recogni|match|verif)|fingerprint|iris[\s_-]?scan|voice[\s_-]?(?:id|print))/i },
  { area: 'CRITICAL_INFRASTRUCTURE', annex: 'Annex III(2)', subject: /(scada|power[\s_-]?grid|water[\s_-]?supply|gas[\s_-]?network|traffic[\s_-]?management|critical[\s_-]?infrastructure|heating[\s_-]?network)/i },
  { area: 'EDUCATION', annex: 'Annex III(3)', subject: /(student|admission|exam\b|proctor|grading|learning[\s_-]?outcome)/i, action: /(scor|assess|rank|evaluat|predict|decision|monitor)/i },
  { area: 'EMPLOYMENT', annex: 'Annex III(4)', subject: /(recruit|candidate|applicant|resume|\bcv\b|hiring|job[\s_-]?applic|performance[\s_-]?review|promotion|termination|workforce)/i, action: /(scor|rank|screen|filter|rate|evaluat|monitor|predict|decision|reject|shortlist)/i },
  { area: 'ESSENTIAL_SERVICES', annex: 'Annex III(5)', subject: /(credit[\s_-]?scor|creditworth|loan|underwrit|mortgage|insurance[\s_-]?(?:pricing|premium|claim)|benefit[\s_-]?eligib|welfare|emergency[\s_-]?(?:dispatch|call)|triage)/i },
  { area: 'LAW_ENFORCEMENT', annex: 'Annex III(6)', subject: /(law[\s_-]?enforcement|police|recidivism|polygraph|criminal[\s_-]?profil|evidence[\s_-]?reliab)/i },
  { area: 'MIGRATION_BORDER', annex: 'Annex III(7)', subject: /(asylum|visa\b|border[\s_-]?control|immigration|residence[\s_-]?permit)/i },
  { area: 'JUSTICE_DEMOCRACY', annex: 'Annex III(8)', subject: /(sentencing|judicial|court[\s_-]?(?:case|decision)|election|voter|referendum|campaign[\s_-]?targeting)/i },
  { area: 'MEDICAL_DEVICE', annex: 'Art. 6(1) / MDR', subject: /(diagnos|clinical|patient|medical[\s_-]?device|radiolog|treatment[\s_-]?recommend)/i, medical: true, minTerms: 2 }
];

const TRANSPARENCY = /(chatbot|virtual[\s_-]?assistant|conversational|support[\s_-]?(?:bot|ai)|image[\s_-]?generat|text[\s_-]?to[\s_-]?(?:image|video|speech)|deepfake|voice[\s_-]?clon|synthetic[\s_-]?(?:media|content)|content[\s_-]?generat|chat[\s_-]?widget)/i;

const OBLIGATIONS: Record<AiRiskTier, string[]> = {
  UNACCEPTABLE_PROHIBITED: [
    'Do not place on the market or use unless a narrow statutory exception applies (Art. 5)',
    'Obtain legal review of any claimed exception before continued use',
    'Document the decision and retire the capability if no exception applies'
  ],
  HIGH_RISK_ANNEX_III: [
    'Risk management system (Art. 9)', 'Data and data governance (Art. 10)', 'Technical documentation (Art. 11, Annex IV)',
    'Automatic event logging (Art. 12)', 'Transparency and instructions for deployers (Art. 13)', 'Human oversight (Art. 14)',
    'Accuracy, robustness and cybersecurity (Art. 15)', 'Quality management system (Art. 17)',
    'Conformity assessment and CE marking (Art. 43, 48)', 'EU database registration (Art. 49)',
    'Deployer duties: use per instructions, assign oversight, monitor, keep logs (Art. 26)',
    'Fundamental-rights impact assessment where required (Art. 27)', 'Serious-incident reporting (Art. 73)'
  ],
  SPECIFIC_TRANSPARENCY_ART_50: [
    'Tell people they are interacting with an AI system (Art. 50(1))', 'Mark synthetic audio/image/video/text in a machine-readable way (Art. 50(2))',
    'Disclose deepfakes (Art. 50(4))', 'AI literacy for staff operating the system (Art. 4)'
  ],
  MINIMAL_RISK: ['AI literacy for staff (Art. 4)', 'Consider voluntary codes of conduct (Art. 95)']
};

export class AiSystemClassifier {
  private static readonly RANK: Record<AiRiskTier, number> = { UNACCEPTABLE_PROHIBITED: 3, HIGH_RISK_ANNEX_III: 2, SPECIFIC_TRANSPARENCY_ART_50: 1, MINIMAL_RISK: 0 };

  /**
   * Classifies each usage site on its own and returns the most severe result (conservative), naming the file that
   * drove it. Mixing all files into one text would let an unrelated file's vocabulary change another usage's class.
   */
  static classify(asset: Pick<DiscoveredAiAsset, 'type' | 'name' | 'contexts' | 'locations'>): Classification {
    const sites = asset.contexts.length ? asset.contexts : [{ path: asset.locations[0]?.path ?? '', text: '' }];
    let best: Classification | null = null; let bestPath = '';
    for (const site of sites) {
      const c = AiSystemClassifier.classifyText(asset, `${site.path}\n${site.text}`);
      if (!best || AiSystemClassifier.RANK[c.riskClass] > AiSystemClassifier.RANK[best.riskClass] || (c.riskClass === best.riskClass && c.confidence > best.confidence)) { best = c; bestPath = site.path; }
    }
    const out = best as Classification;
    return sites.length > 1 && out.riskClass !== 'MINIMAL_RISK' ? { ...out, rationale: `${out.rationale} (Driven by ${bestPath}; ${sites.length} usage sites were assessed separately and the most severe is reported.)` } : out;
  }

  private static classifyText(asset: Pick<DiscoveredAiAsset, 'type' | 'name'>, siteText: string): Classification {
    const text = `${asset.name}\n${siteText}`;
    const signals: string[] = [];
    for (const p of PROHIBITED) if (p.re.test(text)) signals.push(p.label);
    if (signals.length) {
      return {
        riskClass: 'UNACCEPTABLE_PROHIBITED', annexArea: 'Art. 5', confidence: Math.min(0.9, 0.5 + 0.15 * signals.length), signals,
        obligations: OBLIGATIONS.UNACCEPTABLE_PROHIBITED, requiresHumanReview: true,
        rationale: 'Indicator of a practice listed in Art. 5. Art. 5 depends on context and has exceptions (e.g. emotion recognition for medical/safety use), so this must be reviewed by a lawyer — it is not a finding of illegality.'
      };
    }

    let best: { a: Area; score: number; hits: string[] } | null = null;
    for (const a of HIGH_AREAS) {
      const sub = text.match(new RegExp(a.subject.source, 'gi')) || [];
      if (!sub.length) continue;
      const act = a.action ? a.action.test(text) : true;
      if (a.action && !act && sub.length < 2) continue;          // a lone subject word without any decision/scoring action is not enough
      const distinct = new Set(sub.map(s => s.toLowerCase())).size;
      if (distinct < (a.minTerms ?? 1)) continue;          // generic single words (e.g. "clinical") are not enough
      const score = distinct + (a.action && act ? 1 : 0);
      if (!best || score > best.score) best = { a, score, hits: Array.from(new Set(sub.map(s => s.toLowerCase()))).slice(0, 5) };
    }
    if (best) {
      const confidence = Math.min(0.9, 0.35 + 0.15 * best.score);
      return {
        riskClass: 'HIGH_RISK_ANNEX_III', annexArea: `${best.a.area} (${best.a.annex})`, confidence: parseFloat(confidence.toFixed(2)),
        signals: best.hits.map(h => `${best.a.area.toLowerCase()}: "${h}"`), obligations: OBLIGATIONS.HIGH_RISK_ANNEX_III, requiresHumanReview: true,
        rationale: `Terms associated with ${best.a.area.replace(/_/g, ' ').toLowerCase()} (${best.a.annex}) appear near AI usage. Whether the system is actually high-risk depends on its intended purpose and Art. 6(3) derogations — confirm with the system owner.`
      };
    }

    const tr = text.match(TRANSPARENCY);
    if (tr || asset.type === 'AI_WEBSITE_WIDGET') {
      return {
        riskClass: 'SPECIFIC_TRANSPARENCY_ART_50', annexArea: 'Art. 50', confidence: tr ? 0.7 : 0.6, signals: [tr ? `interaction/generation: "${tr[1].toLowerCase()}"` : 'public AI widget'],
        obligations: OBLIGATIONS.SPECIFIC_TRANSPARENCY_ART_50, requiresHumanReview: false,
        rationale: 'The system appears to interact with people or generate synthetic content, which triggers Art. 50 transparency duties.'
      };
    }
    return {
      riskClass: 'MINIMAL_RISK', annexArea: null, confidence: 0.4, signals: [], obligations: OBLIGATIONS.MINIMAL_RISK, requiresHumanReview: true,
      rationale: 'No high-risk or transparency indicators were found in the code and names examined. Low confidence: the intended purpose is not visible to a static scan.'
    };
  }

  /** Maps an inventory asset onto the existing risk-engine profile so it can be assessed by AiComplianceRiskEngine. */
  static toRiskProfile(a: { id: string; name: string; type: string; vendor: string | null; risk_class: string; annex_area: string | null; signals?: string[] }): AiSystemProfile {
    const area = (a.annex_area || '').split(' ')[0];
    const targetDomain: AiSystemProfile['targetDomain'] =
      area === 'EMPLOYMENT' ? 'HR_RECRUITMENT' : area === 'ESSENTIAL_SERVICES' ? 'FINANCIAL_CREDIT' : area === 'BIOMETRICS' ? 'BIOMETRIC_ID'
      : area === 'CRITICAL_INFRASTRUCTURE' ? 'CRITICAL_INFRASTRUCTURE' : area === 'MEDICAL_DEVICE' ? 'HEALTHCARE_TRIAGE'
      : area === 'JUSTICE_DEMOCRACY' ? 'LEGAL_ASSISTANCE' : /widget|chat/i.test(a.type + a.name) ? 'CUSTOMER_SUPPORT' : 'CONTENT_GENERATION';
    const deploymentType: AiSystemProfile['deploymentType'] =
      a.type === 'AI_WEBSITE_WIDGET' ? 'PUBLIC_API' : a.type === 'AGENT' || a.type === 'MCP_SERVER' ? 'EMBEDDED_AGENT'
      : ['HIGH_RISK_ANNEX_III', 'UNACCEPTABLE_PROHIBITED'].includes(a.risk_class) ? 'AUTOMATED_DECISION_ENGINE' : 'INTERNAL_TOOL';
    return {
      id: a.id, name: a.name, version: 'discovered', modelFamily: a.vendor || 'unknown', purpose: `Discovered ${a.type}`,
      targetDomain, deploymentType,
      // Unknowns default to the conservative answer so the assessment does not understate risk:
      hasHumanInTheLoop: false, collectsPii: ['EMPLOYMENT', 'ESSENTIAL_SERVICES', 'BIOMETRICS', 'MEDICAL_DEVICE'].includes(area),
      usesExternalRag: false, trainingDataProvenanceKnown: a.type === 'LLM_PROVIDER_INTEGRATION'
    };
  }
}
