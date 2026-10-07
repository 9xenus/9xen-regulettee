/**
 * AI ESTATE SCANNER
 * Detects AI-regulation / AI-security violations across an organisation's estate:
 *   source code (GitHub / GitLab), CI/CD pipelines, IaC & cloud-server config,
 *   websites, agentic-AI configs (incl. MCP), and ERP / CRM configuration.
 *
 * Extends — does not replace — existing engines:
 *   - PolicyEngineService.scanCodeContent  (15-law code rules)      → reused for source files
 *   - AiRuntimePolicyEngine tool registry  (READ_ONLY…PRODUCTION)   → reused to classify agent tools
 *
 * Detection is static/heuristic (regex + context windows). It reports evidence with
 * secrets masked; it never stores raw credentials.
 */
import { v4 as uuidv4 } from 'uuid';
import { PolicyEngineService } from './ai-policy-engine';
import { AiRuntimePolicyEngine } from './ai-runtime-policy';
import { SECRET_TEST, PRIVATE_KEY_BODY, maskSecrets } from './ai-secret-patterns';
export { maskSecrets };

// ── Types ────────────────────────────────────────────────────────────────────

export type EstateSourceKind =
  | 'SOURCE_CODE' | 'CICD_PIPELINE' | 'IAC' | 'WEBSITE' | 'AGENT_CONFIG' | 'ERP_CRM_CONFIG' | 'CLOUD_SERVER_CONFIG';

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface EstateFile { path: string; content: string; kind?: EstateSourceKind }

export interface EstateFinding {
  id: string;
  ruleId: string;
  title: string;
  kind: EstateSourceKind;
  path: string;
  line: number;
  severity: Severity;
  framework: string;
  articleRef: string;
  category: string;
  penaltyExposureEur: number;
  evidence: string;
  remediation: string;
  fixSnippet?: string;
}

export interface EstateScanResult {
  scanId: string;
  timestamp: string;
  filesScanned: number;
  filesSkipped: number;
  byKind: Record<string, number>;
  findings: EstateFinding[];
  counts: Record<Severity, number>;
  riskScore: number; // 0..100, 100 = clean
  complianceRating: 'CRITICAL_RISK' | 'HIGH_RISK' | 'MODERATE' | 'LOW_RISK';
  totalPenaltyExposureEur: number;
  aiProvidersDetected: { provider: string; domain: string; sanctioned: boolean; files: string[] }[];
  summary: string;
}

/**
 * Vocabulary-based rules ("emotion recognition", "social scoring" …) also match code that DETECTS or DESCRIBES those
 * terms (rule definitions, regexes, messages, comments, schema/mapping). Those lines are not violations.
 */
const DEFINITION_CONTEXT = /(\.includes\(|\.test\(|\.match\(|\bnew RegExp\b|\bpattern\s*:|\bregex\s*:|\bre\s*:|\blabel\s*:|\bdescription\s*:|\bsuggestedAction\s*:|\btitle\s*:|\bissue\s*:|\bevidence\s*:|\barticleRef\s*:|\bremediation\s*:|\bfixSuggestion\s*:|^\s*(?:\/\/|\*|#|<!--))/;
const SCHEMA_CONTEXT = /\b(?:INTEGER|TEXT|BOOLEAN|VARCHAR|NOT NULL|DEFAULT\s+\d)\b|\bBoolean\(|\br\.[a-z_]+\b|\b(?:SELECT|INSERT)\b|^\s*(?:[a-z][a-z0-9_]*\s*,\s*){2,}[a-z][a-z0-9_]*,?\s*\)?\s*$|^\s*['"]?\w+['"]?\s*:\s*['"][^'"]+['"]\s*,?\s*$/i;
const DISABLED_CONFIG = /\benabled\s*[:=]\s*(?:false|0|no)\b|\bdisabled\s*[:=]\s*(?:true|1)\b|\bactive\s*[:=]\s*false\b/i;

interface Rule {
  vocabulary?: boolean;                  // keyword rule: skip definition/schema lines
  id: string;
  title: string;
  kinds: EstateSourceKind[] | 'ALL';
  pattern: RegExp;                       // per line, or whole-file when fileLevel
  fileLevel?: boolean;
  requireFile?: RegExp;
  unlessFile?: RegExp;
  unlessNear?: { re: RegExp; lines: number };
  severity: Severity;
  framework: string;
  articleRef: string;
  category: string;
  penaltyEur: number;
  remediation: string;
  fixSnippet?: string;
}

// ── AI provider catalogue (shadow-AI-in-code detection) ──────────────────────

export const AI_PROVIDER_DOMAINS: { domain: string; provider: string; region: string }[] = [
  { domain: 'api.openai.com', provider: 'OpenAI', region: 'US' },
  { domain: 'api.anthropic.com', provider: 'Anthropic', region: 'US' },
  { domain: 'generativelanguage.googleapis.com', provider: 'Google Gemini', region: 'US' },
  { domain: 'aiplatform.googleapis.com', provider: 'Google Vertex AI', region: 'Global' },
  { domain: 'api.mistral.ai', provider: 'Mistral AI', region: 'EU' },
  { domain: 'api.cohere.ai', provider: 'Cohere', region: 'US/CA' },
  { domain: 'api.cohere.com', provider: 'Cohere', region: 'US/CA' },
  { domain: 'api.together.xyz', provider: 'Together AI', region: 'US' },
  { domain: 'api.groq.com', provider: 'Groq', region: 'US' },
  { domain: 'api.deepseek.com', provider: 'DeepSeek', region: 'CN' },
  { domain: 'api.perplexity.ai', provider: 'Perplexity', region: 'US' },
  { domain: 'api.x.ai', provider: 'xAI', region: 'US' },
  { domain: 'api.replicate.com', provider: 'Replicate', region: 'US' },
  { domain: 'api-inference.huggingface.co', provider: 'Hugging Face Inference', region: 'US/EU' },
  { domain: 'openai.azure.com', provider: 'Azure OpenAI', region: 'Tenant-selected' },
  { domain: 'bedrock-runtime', provider: 'AWS Bedrock', region: 'Tenant-selected' },
  { domain: 'api.elevenlabs.io', provider: 'ElevenLabs', region: 'US' },
  { domain: 'api.stability.ai', provider: 'Stability AI', region: 'UK/US' },
  { domain: 'api.ai21.com', provider: 'AI21 Labs', region: 'IL/US' },
  { domain: 'dashscope.aliyuncs.com', provider: 'Alibaba Qwen', region: 'CN' },
  { domain: 'api.moonshot.cn', provider: 'Moonshot Kimi', region: 'CN' }
];

// ── Secret masking (shared module) ───────────────────────────────────────────

// ── Rules ────────────────────────────────────────────────────────────────────

const LLM_CALL = /(openai|anthropic|chat\.completions|completions\.create|messages\.create|generateContent|invokeModel|\.chat\(|llm\.invoke|ChatOpenAI|ChatAnthropic)/i;

export const ESTATE_RULES: Rule[] = [
  // ── Secrets (all) ──
  { id: 'SEC-01', title: 'Hard-coded AI/cloud credential', kinds: 'ALL', pattern: SECRET_TEST, severity: 'CRITICAL',
    framework: 'EU_AI_ACT', articleRef: 'Art. 15 / OWASP LLM02', category: 'SECRETS_EXPOSURE', penaltyEur: 15_000_000,
    remediation: 'Revoke the credential immediately, rotate it, and load it from a secrets manager at runtime. Purge it from git history.',
    fixSnippet: "const apiKey = process.env.LLM_API_KEY; // inject from Vault / cloud secret manager\nif (!apiKey) throw new Error('LLM_API_KEY not configured');" },

  { id: 'SEC-02', title: 'Private key material committed', kinds: 'ALL', pattern: PRIVATE_KEY_BODY, fileLevel: true, severity: 'CRITICAL',
    framework: 'EU_AI_ACT', articleRef: 'Art. 15 / GDPR Art. 32', category: 'SECRETS_EXPOSURE', penaltyEur: 15_000_000,
    remediation: 'Treat the key as compromised: revoke/rotate it, remove it from history, and load keys from a KMS or secrets manager.' },

  // ── CI/CD ──
  { id: 'CICD-01', title: 'pull_request_target checks out untrusted PR code (prompt-injection / secret-exfil path)', kinds: ['CICD_PIPELINE'],
    pattern: /pull_request_target/, requireFile: /github\.event\.pull_request\.head|github\.head_ref/, severity: 'HIGH',
    framework: 'OWASP_LLM_TOP10', articleRef: 'LLM01 / LLM05', category: 'PIPELINE_SECURITY', penaltyEur: 10_000_000,
    remediation: 'Use `pull_request` for untrusted code, or split into an unprivileged build job and a privileged job that never checks out PR head. Never expose secrets to AI steps that read PR text.' },
  { id: 'CICD-02', title: 'Third-party action pinned to a mutable ref (supply chain)', kinds: ['CICD_PIPELINE'],
    pattern: /uses:\s*[\w.-]+\/[\w.-]+(?:\/[\w./-]+)?@(main|master|latest|v?\d+(\.\d+)?)\s*$/i, severity: 'MEDIUM',
    framework: 'OWASP_LLM_TOP10', articleRef: 'LLM03 Supply chain / Art. 15', category: 'AI_SUPPLY_CHAIN', penaltyEur: 5_000_000,
    remediation: 'Pin every third-party action to a full commit SHA and review updates via Dependabot/Renovate.',
    fixSnippet: 'uses: owner/action@<full-40-char-commit-sha> # v1.2.3' },
  { id: 'CICD-03', title: 'Auto-merge / admin-merge without human review (oversight bypass)', kinds: ['CICD_PIPELINE'],
    pattern: /gh\s+pr\s+merge[^\n]*(--auto|--admin)|automerge:\s*true|merge_when_pipeline_succeeds/i, severity: 'HIGH',
    framework: 'EU_AI_ACT', articleRef: 'Art. 14 Human oversight', category: 'HUMAN_OVERSIGHT', penaltyEur: 15_000_000,
    remediation: 'Require at least one human CODEOWNER approval before merge, especially for AI/agent-authored changes.' },
  { id: 'CICD-04', title: 'Model artefact downloaded without integrity check', kinds: ['CICD_PIPELINE', 'CLOUD_SERVER_CONFIG'],
    pattern: /(huggingface-cli\s+download|(wget|curl)[^\n]*\.(safetensors|gguf|ckpt|pt|pth|bin|onnx))/i,
    unlessFile: /sha256sum|shasum|--revision\s+[0-9a-f]{40}|cosign|checksum/i, severity: 'MEDIUM',
    framework: 'OWASP_LLM_TOP10', articleRef: 'LLM03 Supply chain', category: 'AI_SUPPLY_CHAIN', penaltyEur: 5_000_000,
    remediation: 'Pin model revisions to a commit hash, verify SHA-256/signature, and prefer safetensors over pickle formats.' },
  { id: 'CICD-05', title: 'AI step exposes secrets to model context (env dump / echo secrets)', kinds: ['CICD_PIPELINE'],
    pattern: /(printenv|env\s*\||echo\s+\$\{\{\s*secrets\.)/i, severity: 'HIGH',
    framework: 'OWASP_LLM_TOP10', articleRef: 'LLM02 Sensitive disclosure', category: 'SECRETS_EXPOSURE', penaltyEur: 10_000_000,
    remediation: 'Remove env dumps; mask secrets and keep them out of any text an LLM step can read.' },

  // ── Source code ──
  { id: 'SRC-01', title: 'Untrusted input concatenated into a prompt (prompt injection)', kinds: ['SOURCE_CODE'],
    pattern: /(prompt|content|system)\s*[:=]\s*[`'"].*\$\{[^}]*(req\.|request\.|body|query|user|input|message)[^}]*\}/i, severity: 'HIGH',
    framework: 'OWASP_LLM_TOP10', articleRef: 'LLM01 Prompt injection / Art. 15', category: 'PROMPT_SECURITY', penaltyEur: 10_000_000,
    remediation: 'Separate instructions from data: wrap user content in delimited blocks, screen it with the AI Security Engine, and never let it alter the system role.',
    fixSnippet: "const v = AiSecurityEngine.detectPromptInjection(userInput);\nif (v.detected) throw new Error('Blocked: prompt injection');\nmessages.push({ role: 'user', content: `### USER_INPUT_START ###\\n${v.sanitizedInput}\\n### USER_INPUT_END ###` });" },
  { id: 'SRC-02', title: 'LLM output passed to eval/exec (improper output handling → RCE)', kinds: ['SOURCE_CODE'],
    pattern: /(eval\(|new Function\(|child_process|execSync\(|(?<!\b(?:db|database|sqlite|conn|connection|cursor|client|knex|pool|sql|stmt)\.)exec\(|os\.system\(|subprocess\.)[^\n]*(completion|response|\bllm\b|choices|output|generated)/i, severity: 'CRITICAL',
    framework: 'OWASP_LLM_TOP10', articleRef: 'LLM05 Improper output handling', category: 'OUTPUT_HANDLING', penaltyEur: 15_000_000,
    remediation: 'Never execute model output. Parse into a strict schema, validate, and run only allow-listed actions in a sandbox.' },
  { id: 'SRC-03', title: 'Personal data sent to an LLM without scrubbing', kinds: ['SOURCE_CODE'],
    pattern: /(email|ssn|iban|passport|national_?id|date_?of_?birth|dob|phone|salary|diagnosis)[^\n]{0,80}(\bopenai\b|\banthropic\b|completions?\.create|messages\.create|generateContent\(|\.chat\()|(\bopenai\b|\banthropic\b|completions?\.create|messages\.create|generateContent\(|\.chat\()[^\n]{0,80}(email|ssn|iban|passport|national_?id|dob|salary|diagnosis)/i,
    unlessNear: { re: /(scrub|redact|mask|anonymi[sz]e|pseudonymi[sz]e|scrubPii)/i, lines: 8 }, severity: 'HIGH',
    framework: 'GDPR', articleRef: 'GDPR Art. 5(1)(c), 25 / AI Act Art. 10', category: 'DATA_GOVERNANCE', penaltyEur: 20_000_000,
    remediation: 'Scrub or pseudonymise personal data before it reaches the model; use the runtime gateway PII redaction.',
    fixSnippet: 'const { sanitized } = AiSecurityEngine.scrubPii(text);\nawait llm.chat({ messages: [{ role: "user", content: sanitized }] });' },
  { id: 'SRC-04', title: 'Automated decision on people without human review path', kinds: ['SOURCE_CODE'],
    pattern: /(autoReject|autoApprove|auto_reject|auto_approve|rejectCandidate|approveLoan|denyClaim|scoreCandidate|rankApplicants|creditDecision)\w*\s*[(=]/i,
    unlessNear: { re: /(humanReview|manualReview|human_in_the_loop|hitl|requiresApproval|escalate|appeal)/i, lines: 10 }, severity: 'HIGH',
    framework: 'EU_AI_ACT', articleRef: 'Art. 14 / GDPR Art. 22 / Annex III', category: 'HUMAN_OVERSIGHT', penaltyEur: 15_000_000,
    remediation: 'Add a human-in-the-loop gate and an appeal route for decisions with legal or similarly significant effect.' },
  { id: 'SRC-05', vocabulary: true, title: 'Prohibited-practice indicator (Art. 5)', kinds: ['SOURCE_CODE', 'WEBSITE'],
    pattern: /(emotion[_-]?recogni|facial[_-]?scrap|untargeted[_-]?scrap|predictive[_-]?polic|biometric[_-]?categori[sz]|exploit[_-]?vulnerab)/i, severity: 'CRITICAL',
    framework: 'EU_AI_ACT', articleRef: 'Art. 5 Prohibited practices', category: 'PROHIBITED_PRACTICE', penaltyEur: 35_000_000,
    remediation: 'Stop and legally review immediately. These practices are banned or heavily restricted under the EU AI Act (fines up to €35M / 7%).' },
  { id: 'SRC-06', title: 'TLS verification disabled on AI/API client', kinds: ['SOURCE_CODE'],
    pattern: /(rejectUnauthorized\s*:\s*false|verify\s*=\s*False|NODE_TLS_REJECT_UNAUTHORIZED\s*=\s*['"]?0|InsecureSkipVerify\s*:\s*true)/, severity: 'HIGH',
    framework: 'EU_AI_ACT', articleRef: 'Art. 15 Cybersecurity', category: 'TRANSPORT_SECURITY', penaltyEur: 10_000_000,
    remediation: 'Remove the override; trust a proper CA bundle instead.' },
  { id: 'SRC-07', title: 'Unbounded agent/LLM loop (no iteration cap)', kinds: ['SOURCE_CODE'],
    pattern: /while\s*\(\s*(true|1)\s*\)|while\s+True\s*:/, requireFile: /(llm|agent|completion|openai|anthropic|tool_call)/i,
    unlessNear: { re: /(maxSteps|max_steps|maxIterations|max_iterations|maxTurns|break|budget)/i, lines: 12 }, severity: 'MEDIUM',
    framework: 'OWASP_LLM_TOP10', articleRef: 'LLM10 Unbounded consumption', category: 'AGENT_SAFETY', penaltyEur: 2_500_000,
    remediation: 'Add max iterations, token and cost budgets, and a kill-switch check on every loop turn.' },
  { id: 'SRC-08', title: 'LLM call without audit logging (Art. 12 record-keeping)', kinds: ['SOURCE_CODE'],
    pattern: /(chat\.completions\.create|messages\.create|generateContent\(|invokeModel\()/,
    unlessNear: { re: /(audit|logInference|recordAuditEvent|logger\.|log\()/i, lines: 10 }, severity: 'MEDIUM',
    framework: 'EU_AI_ACT', articleRef: 'Art. 12 Record-keeping', category: 'TRACEABILITY', penaltyEur: 7_500_000,
    remediation: 'Route inference through the runtime gateway or log prompt/response hashes to the immutable audit ledger.' },

  // ── Agentic AI ──
  { id: 'AGT-01', title: 'Agent granted wildcard tool permissions (excessive agency)', kinds: ['AGENT_CONFIG'],
    pattern: /(tools|allowed_?tools|permissions|allow|capabilities)["']?\s*[:=]\s*\[?\s*["']\*["']/i, severity: 'CRITICAL',
    framework: 'OWASP_LLM_TOP10', articleRef: 'LLM06 Excessive agency / Art. 14', category: 'AGENT_SAFETY', penaltyEur: 15_000_000,
    remediation: 'Replace wildcards with an explicit tool allow-list; default-deny everything else.' },
  { id: 'AGT-02', title: 'Agent runs with approvals disabled (auto-approve / skip permissions)', kinds: ['AGENT_CONFIG', 'CICD_PIPELINE', 'CLOUD_SERVER_CONFIG'],
    pattern: /(auto_?approve["']?\s*[:=]\s*true|require_?approval["']?\s*[:=]\s*false|human_in_the_loop["']?\s*[:=]\s*false|--dangerously-skip-permissions|--yolo|bypassPermissions)/i, severity: 'HIGH',
    framework: 'EU_AI_ACT', articleRef: 'Art. 14 Human oversight', category: 'HUMAN_OVERSIGHT', penaltyEur: 15_000_000,
    remediation: 'Require approval for any data-changing action; financial and production actions must be default-deny.' },
  { id: 'AGT-03', title: 'MCP / tool server reachable over plain HTTP or unauthenticated', kinds: ['AGENT_CONFIG'],
    pattern: /["']?url["']?\s*[:=]\s*["']http:\/\/(?!localhost|127\.0\.0\.1)/i, severity: 'HIGH',
    framework: 'OWASP_LLM_TOP10', articleRef: 'LLM03 / LLM06', category: 'AGENT_SAFETY', penaltyEur: 10_000_000,
    remediation: 'Use HTTPS with mutual auth/short-lived tokens; pin server identity and review tool descriptions for injected instructions.' },
  { id: 'AGT-04', title: 'Agent exposes shell / code-execution tool', kinds: ['AGENT_CONFIG'],
    pattern: /["']?(shell|bash|exec|terminal|run_command|code_interpreter|execute_code)["']?\s*[:=,\]]/i, severity: 'HIGH',
    framework: 'OWASP_LLM_TOP10', articleRef: 'LLM06 Excessive agency', category: 'AGENT_SAFETY', penaltyEur: 10_000_000,
    remediation: 'Run execution tools in an isolated sandbox with no network or secrets, with per-call approval.' },
  { id: 'AGT-05', title: 'Agent has no step / time / cost limit or kill-switch', kinds: ['AGENT_CONFIG'],
    pattern: /\S/, fileLevel: true, unlessFile: /(max_?(steps|iterations|turns)|timeout|kill_?switch|budget)/i, severity: 'MEDIUM',
    framework: 'OWASP_LLM_TOP10', articleRef: 'LLM10 / Art. 14', category: 'AGENT_SAFETY', penaltyEur: 2_500_000,
    remediation: 'Set max_steps, a wall-clock timeout, a token/cost budget, and wire the agent to the runtime kill switch.' },

  // ── IaC / cloud ──
  { id: 'IAC-01', title: 'Publicly accessible storage (training data / model artefacts at risk)', kinds: ['IAC'],
    pattern: /(acl\s*=\s*"public-read(-write)?"|block_public_(acls|policy)\s*=\s*false|restrict_public_buckets\s*=\s*false|publicAccess:\s*(Blob|Container)|AllowBlobPublicAccess\W+true)/i, severity: 'CRITICAL',
    framework: 'GDPR', articleRef: 'GDPR Art. 32 / AI Act Art. 10, 15', category: 'DATA_GOVERNANCE', penaltyEur: 20_000_000,
    remediation: 'Block all public access and serve via private endpoints / signed URLs.' },
  { id: 'IAC-02', title: 'Encryption disabled on storage or database', kinds: ['IAC'],
    pattern: /(encrypted|storage_encrypted|enable_encryption|encryption_enabled)\s*=\s*false/i, severity: 'HIGH',
    framework: 'GDPR', articleRef: 'GDPR Art. 32', category: 'DATA_GOVERNANCE', penaltyEur: 10_000_000,
    remediation: 'Enable encryption at rest with a customer-managed key and rotation.' },
  { id: 'IAC-03', title: 'AI / ML endpoint exposed to public network', kinds: ['IAC'],
    pattern: /public_network_access(_enabled)?\s*=\s*("Enabled"|true)|publicNetworkAccess:\s*Enabled|associate_public_ip_address\s*=\s*true/i,
    requireFile: /(sagemaker|bedrock|aiplatform|vertex|cognitive|openai|ml_workspace|machine_learning|inference)/i, severity: 'HIGH',
    framework: 'EU_AI_ACT', articleRef: 'Art. 15 Cybersecurity / OWASP LLM10', category: 'INFRA_SECURITY', penaltyEur: 15_000_000,
    remediation: 'Disable public access; expose inference only through private endpoints behind the runtime protection gateway.' },
  { id: 'IAC-04', title: 'World-open ingress (0.0.0.0/0)', kinds: ['IAC', 'CLOUD_SERVER_CONFIG'],
    pattern: /(cidr_blocks|cidrIp|source_address_prefix|ipv6_cidr_blocks)["']?\s*[:=]\s*\[?\s*["'](0\.0\.0\.0\/0|::\/0|\*)["']/i, severity: 'HIGH',
    framework: 'EU_AI_ACT', articleRef: 'Art. 15 Cybersecurity', category: 'INFRA_SECURITY', penaltyEur: 10_000_000,
    remediation: 'Restrict to known CIDRs / private networking; put the service behind an authenticated gateway.' },
  { id: 'IAC-05', title: 'Wildcard IAM on AI services', kinds: ['IAC'],
    pattern: /("Action"\s*:\s*"\*"|actions\s*=\s*\["\*"\]|"(bedrock|sagemaker|aiplatform):\*")/i, severity: 'HIGH',
    framework: 'OWASP_LLM_TOP10', articleRef: 'LLM06 Excessive agency', category: 'INFRA_SECURITY', penaltyEur: 10_000_000,
    remediation: 'Scope IAM to specific model ARNs and actions (least privilege).' },
  { id: 'IAC-06', title: 'Logging disabled on AI/ML resource (Art. 12)', kinds: ['IAC'],
    pattern: /(enable_logging|logging_enabled|access_logs_enabled|data_capture_enabled)\s*=\s*false/i, severity: 'MEDIUM',
    framework: 'EU_AI_ACT', articleRef: 'Art. 12 Record-keeping', category: 'TRACEABILITY', penaltyEur: 7_500_000,
    remediation: 'Enable request/response capture and ship logs to immutable storage.' },
  { id: 'IAC-07', title: 'Resource deployed outside EU region (data-residency review)', kinds: ['IAC'],
    pattern: /region\s*=\s*"(us|ap|sa|ca|me|af|cn)-[a-z]+-\d"/i, severity: 'MEDIUM',
    framework: 'GDPR', articleRef: 'GDPR Ch. V (transfers)', category: 'DATA_RESIDENCY', penaltyEur: 10_000_000,
    remediation: 'If this workload processes EU personal data, move it to an EU region or document the transfer mechanism (SCCs / adequacy).' },
  { id: 'IAC-08', title: 'Privileged / host-network container', kinds: ['IAC', 'CLOUD_SERVER_CONFIG'],
    pattern: /(privileged:\s*true|hostNetwork:\s*true|hostPID:\s*true|network_mode:\s*["']?host)/i, severity: 'HIGH',
    framework: 'EU_AI_ACT', articleRef: 'Art. 15 Cybersecurity', category: 'INFRA_SECURITY', penaltyEur: 10_000_000,
    remediation: 'Drop privileges and host namespaces; run model servers as non-root with read-only filesystems.' },

  // ── Cloud server ──
  { id: 'CLD-01', title: 'Self-hosted model server bound to all interfaces (no auth by default)', kinds: ['CLOUD_SERVER_CONFIG', 'IAC'],
    pattern: /(OLLAMA_HOST\s*=\s*["']?0\.0\.0\.0|0\.0\.0\.0:(11434|8000|7860|8188)|["']?(11434|7860|8188):(11434|7860|8188)|--host\s+0\.0\.0\.0)/i, severity: 'HIGH',
    framework: 'OWASP_LLM_TOP10', articleRef: 'LLM10 / Art. 15', category: 'INFRA_SECURITY', penaltyEur: 10_000_000,
    remediation: 'Bind to localhost or a private interface and front with an authenticating reverse proxy / the runtime gateway.' },
  { id: 'CLD-02', title: 'Credential file committed (.env)', kinds: ['CLOUD_SERVER_CONFIG', 'SOURCE_CODE'],
    pattern: /^\s*[A-Z0-9_]*(KEY|TOKEN|SECRET|PASSWORD)[A-Z0-9_]*\s*=\s*(?!["']?(?:changeme|change_me|your[_-]|<|x{3,}|example|placeholder|dummy|sample|todo|\$\{|\*{3,}))[^\s#]{12,}/i, requireFile: /(^|\n)\s*[A-Z0-9_]+=/, severity: 'HIGH',
    framework: 'GDPR', articleRef: 'GDPR Art. 32 / OWASP LLM02', category: 'SECRETS_EXPOSURE', penaltyEur: 10_000_000,
    remediation: 'Remove the file from version control, rotate every value, and use a secrets manager.' },

  // ── Website ──
  { id: 'WEB-02', title: 'AI-generated content without disclosure/provenance label (Art. 50(4))', kinds: ['WEBSITE'],
    pattern: /generated\s+(by|with|using)\s+(chatgpt|gpt-?\d?|claude|gemini|midjourney|dall-?e|stable\s*diffusion|ai)\b/i,
    unlessFile: /(ai-generated|ai generated|c2pa|content credentials|synthetic content)/i, severity: 'MEDIUM',
    framework: 'EU_AI_ACT', articleRef: 'Art. 50(2),(4) Transparency', category: 'TRANSPARENCY', penaltyEur: 7_500_000,
    remediation: 'Add a visible "AI-generated" label and machine-readable provenance (C2PA / metadata).' },
  { id: 'WEB-03', title: 'Browser-side call to an AI provider (exposed key / uncontrolled data flow)', kinds: ['WEBSITE'],
    pattern: /(api\.openai\.com|api\.anthropic\.com|generativelanguage\.googleapis\.com|api\.mistral\.ai|api\.deepseek\.com)/i, severity: 'HIGH',
    framework: 'OWASP_LLM_TOP10', articleRef: 'LLM02 / LLM10', category: 'SECRETS_EXPOSURE', penaltyEur: 10_000_000,
    remediation: 'Proxy AI calls through your backend/runtime gateway; never ship provider keys or direct endpoints to the browser.' },
  { id: 'WEB-04', title: 'Emotion / face-analysis library loaded on site', kinds: ['WEBSITE'],
    pattern: /(face-api(\.min)?\.js|affectiva|emotion-recogni|faceapi\.|tracking\.js.*face)/i, severity: 'HIGH',
    framework: 'EU_AI_ACT', articleRef: 'Art. 5(1)(f) / Annex III(1)', category: 'PROHIBITED_PRACTICE', penaltyEur: 35_000_000,
    remediation: 'Remove, or confirm lawful basis and context: emotion inference in workplace/education is prohibited; biometric systems are high-risk.' },

  // ── ERP / CRM ──
  { id: 'ERP-01', title: 'AI scoring / auto-decisioning enabled in ERP/CRM without review or consent controls', kinds: ['ERP_CRM_CONFIG'],
    pattern: /(einstein|lead[_-]?scor(e|ing)|credit[_-]?scor(e|ing)|candidate[_-]?scor(e|ing)|auto[_-]?(decision|reject|approve)|ai[_-]?decision|predictive[_-]?scor)\w*["']?\s*[:=]\s*["']?(true|enabled|on|yes)/i,
    unlessFile: /(human[_-]?review|manual[_-]?review|consent[_-]?required|require[_-]?consent)/i, severity: 'HIGH',
    framework: 'EU_AI_ACT', articleRef: 'Art. 14 / Annex III / GDPR Art. 22', category: 'HUMAN_OVERSIGHT', penaltyEur: 15_000_000,
    remediation: 'Enable human review and a documented lawful basis; run a DPIA and fundamental-rights impact assessment where required.' },
  { id: 'ERP-02', title: 'AI connector granted full-data scope', kinds: ['ERP_CRM_CONFIG'],
    pattern: /(scope|permissions?|access)["']?\s*[:=]\s*["']?(full|all|\*|admin|full_access|read_write_all)/i,
    requireFile: /(openai|copilot|einstein|joule|agentforce|now[_-]?assist|gemini|anthropic|llm|ai[_-]?connector)/i, severity: 'HIGH',
    framework: 'GDPR', articleRef: 'GDPR Art. 5(1)(c) minimisation / OWASP LLM06', category: 'DATA_GOVERNANCE', penaltyEur: 15_000_000,
    remediation: 'Restrict the connector to the minimum objects/fields needed; exclude special-category and payment data.' },
  { id: 'ERP-03', title: 'Sensitive fields mapped to a third-party AI service', kinds: ['ERP_CRM_CONFIG'],
    pattern: /(ssn|national_?id|iban|salary|health|diagnosis|ethnic|religio|biometric)/i,
    requireFile: /(openai|copilot|einstein|joule|agentforce|gemini|anthropic|llm|ai[_-]?connector)/i, severity: 'HIGH',
    framework: 'GDPR', articleRef: 'GDPR Art. 9 special categories', category: 'DATA_GOVERNANCE', penaltyEur: 20_000_000,
    remediation: 'Remove special-category fields from the mapping or pseudonymise them before AI processing.' },
  { id: 'ERP-04', title: 'AI feature present in ERP/CRM — register in AI inventory', kinds: ['ERP_CRM_CONFIG'],
    pattern: /(agentforce|einstein\s*gpt|einstein|joule|copilot\s+for\s+(dynamics|sales|service|finance)|copilot\s*studio|ai\s*builder|power\s*virtual\s*agents?|shared_openai|azure\s*openai|now\s*assist|workday\s*ai|breeze|zoho\s*zia|oracle\s*ai|netsuite\s*(ai|text\s*enhance))/i,
    severity: 'LOW', framework: 'ISO_42001', articleRef: 'ISO/IEC 42001 inventory / AI Act Art. 4, 26', category: 'AI_INVENTORY', penaltyEur: 1_000_000,
    remediation: 'Add the AI feature to the model/system register with owner, purpose, risk class and deployer obligations (Art. 26).' }
];

// ── Website AI widget detection ──────────────────────────────────────────────

const WEBSITE_AI_WIDGETS = /(intercom[^"']*fin|widget\.intercom|drift\.com|js\.driftt|tidio|botpress|voiceflow|dialogflow|landbot|ada\.cx|kommunicate|chatbot|chat-widget|crisp\.chat|zendesk[^"']*ai|openai|copilot-chat|ask-ai|ai-assistant|livechatinc|hubspot[^"']*conversations|freshchat|manychat)/i;
const AI_DISCLOSURE = /(you are (chatting|talking|interacting|speaking) with an? (ai|bot|virtual|automated)|ai[- ]powered (assistant|chat)|(this is an? )?ai assistant|automated assistant|powered by ai|virtual assistant \(ai\)|i['’]m an ai)/i;

// ── Classification ───────────────────────────────────────────────────────────

export function detectKind(path: string, content: string): EstateSourceKind {
  const p = path.toLowerCase();
  if (/(^|\/)\.github\/workflows\/.+\.ya?ml$/.test(p) || /(^|\/)\.gitlab-ci\.ya?ml$/.test(p) || /(^|\/)(jenkinsfile|azure-pipelines\.ya?ml|bitbucket-pipelines\.ya?ml|\.circleci\/config\.ya?ml)$/.test(p)) return 'CICD_PIPELINE';
  if (/\.(tf|tfvars|bicep)$/.test(p) || /(cloudformation|template)\.(ya?ml|json)$/.test(p) || /(^|\/)(k8s|kubernetes|helm|manifests?)\//.test(p) || /apiVersion:\s*\S+\s*\n\s*kind:/.test(content)) return 'IAC';
  if (/\.(html?|vue|svelte)$/.test(p)) return 'WEBSITE';
  if (/(^|\/)(mcp|\.mcp|agents?|crew|langgraph|autogen|\.cursor\/mcp|claude_desktop_config|\.claude\/settings)[^/]*\.(json|ya?ml|toml)$/.test(p) || /"mcpServers"|mcp_servers|"allowed_?tools"|agent_config/.test(content)) return 'AGENT_CONFIG';
  if (/(^|\/)(docker-compose[^/]*\.ya?ml|dockerfile|\.env[^/]*|[^/]+\.service|[^/]+\.sh|nginx\.conf|supervisord\.conf)$/.test(p)) return 'CLOUD_SERVER_CONFIG';
  if (/(salesforce|sfdc|sap|netsuite|dynamics|hubspot|zoho|workday|odoo|oracle|servicenow|erp|crm)/.test(p) && /\.(json|ya?ml|xml|cfg|conf|ini|txt)$/.test(p)) return 'ERP_CRM_CONFIG';
  return 'SOURCE_CODE';
}

const SCANNABLE_EXT = /\.(ts|tsx|js|jsx|mjs|cjs|py|go|java|cs|rb|php|rs|kt|tf|tfvars|bicep|ya?ml|json|toml|ini|cfg|conf|xml|html?|vue|svelte|sh|env|txt|md|properties)$/i;
const SCANNABLE_NAMES = /(^|\/)(dockerfile|jenkinsfile|\.env[^/]*)$/i;
export function isScannablePath(path: string): boolean {
  if (/(^|\/)(node_modules|dist|build|vendor|\.git|coverage|\.next)\//.test(path)) return false;
  if (/(package-lock\.json|yarn\.lock|pnpm-lock\.yaml|\.min\.js|\.map)$/.test(path)) return false;
  return SCANNABLE_EXT.test(path) || SCANNABLE_NAMES.test(path);
}

// ── Engine ───────────────────────────────────────────────────────────────────

const SEV_WEIGHT: Record<Severity, number> = { CRITICAL: 25, HIGH: 12, MEDIUM: 5, LOW: 1 };

function mk(rule: Rule, file: EstateFile, kind: EstateSourceKind, line: number, evidence: string): EstateFinding {
  return {
    id: `EST-${uuidv4().substring(0, 8).toUpperCase()}`,
    ruleId: rule.id, title: rule.title, kind, path: file.path, line, severity: rule.severity,
    framework: rule.framework, articleRef: rule.articleRef, category: rule.category,
    penaltyExposureEur: rule.penaltyEur,
    evidence: maskSecrets(evidence.trim()).slice(0, 220),
    remediation: rule.remediation, fixSnippet: rule.fixSnippet
  };
}

// ── Aggregation helpers ──────────────────────────────────────────────────────

function summarizeFindings(input: EstateFinding[]) {
  const order: Record<Severity, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  const findings = input.slice().sort((a, b) => order[a.severity] - order[b.severity] || a.path.localeCompare(b.path) || a.line - b.line);
  const counts: Record<Severity, number> = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  findings.forEach(f => { counts[f.severity]++; });
  const deduction = findings.reduce((sum, f) => sum + SEV_WEIGHT[f.severity], 0);
  const riskScore = Math.max(0, Math.min(100, 100 - deduction));
  const complianceRating: EstateScanResult['complianceRating'] =
    counts.CRITICAL > 0 ? 'CRITICAL_RISK' : counts.HIGH > 0 ? 'HIGH_RISK' : counts.MEDIUM > 0 ? 'MODERATE' : 'LOW_RISK';
  // Exposure counts each distinct rule once (not once per hit) to avoid inflating the figure
  const byRule = new Map<string, number>();
  findings.forEach(f => byRule.set(f.ruleId, Math.max(byRule.get(f.ruleId) || 0, f.penaltyExposureEur)));
  const totalPenaltyExposureEur = Array.from(byRule.values()).reduce((a, b) => a + b, 0);
  return { findings, counts, riskScore, complianceRating, totalPenaltyExposureEur };
}

function summaryLine(scanned: number, skipped: number, f: { findings: EstateFinding[]; counts: Record<Severity, number>; riskScore: number }): string {
  return `${scanned} file(s) scanned${skipped ? ` (${skipped} scannable file(s) NOT scanned)` : ''}: ${f.findings.length} finding(s) — ${f.counts.CRITICAL} critical, ${f.counts.HIGH} high, ${f.counts.MEDIUM} medium, ${f.counts.LOW} low. Risk score ${f.riskScore}/100.`;
}

export class AiEstateScanner {
  /**
   * Scans a set of files. `sanctionedProviders` lists AI providers the organisation has
   * approved (provider names or domains); anything else found in code is reported as shadow AI.
   */
  public static scan(
    files: EstateFile[],
    opts: { sanctionedProviders?: string[]; tenantId?: string } = {}
  ): EstateScanResult {
    const sanctioned = (opts.sanctionedProviders || []).map(s => s.toLowerCase());
    const findings: EstateFinding[] = [];
    const byKind: Record<string, number> = {};
    const providerHits = new Map<string, { provider: string; domain: string; sanctioned: boolean; files: Set<string> }>();
    let scanned = 0; let skipped = 0;

    for (const file of files) {
      if (!file || typeof file.content !== 'string' || !file.path) { skipped++; continue; }
      if (file.content.length > 400_000 || file.content.includes('\u0000')) { skipped++; continue; }
      scanned++;
      const kind = file.kind || detectKind(file.path, file.content);
      byKind[kind] = (byKind[kind] || 0) + 1;
      const lines = file.content.split('\n');
      const seen = new Set<string>(); // de-dupe rule+line

      for (const rule of ESTATE_RULES) {
        if (rule.kinds !== 'ALL' && !rule.kinds.includes(kind)) continue;
        if (rule.requireFile && !rule.requireFile.test(file.content)) continue;
        if (rule.unlessFile && rule.unlessFile.test(file.content)) continue;
        // CLD-02 only makes sense for .env-style files
        if (rule.id === 'CLD-02' && (!/(^|\/)\.env[^/]*$/i.test(file.path) || /\.(example|sample|template|dist|tpl|defaults?)$/i.test(file.path))) continue;

        if (rule.fileLevel) {
          const m = rule.pattern.exec(file.content);
          if (m) {
            const line = file.content.slice(0, m.index).split('\n').length;
            findings.push(mk(rule, file, kind, line, lines[line - 1] || rule.title));
          }
          continue;
        }

        let perRule = 0;
        for (let i = 0; i < lines.length && perRule < 5; i++) {
          const text = lines[i];
          if (text.length > 600 || !rule.pattern.test(text)) continue;
          if (rule.vocabulary && (DEFINITION_CONTEXT.test(text) || SCHEMA_CONTEXT.test(text))) continue;
          if (rule.unlessNear) {
            const from = Math.max(0, i - rule.unlessNear.lines);
            const to = Math.min(lines.length, i + rule.unlessNear.lines + 1);
            if (rule.unlessNear.re.test(lines.slice(from, to).join('\n'))) continue;
          }
          const key = `${rule.id}:${i}`;
          if (seen.has(key)) continue;
          seen.add(key);
          findings.push(mk(rule, file, kind, i + 1, text));
          perRule++;
        }
      }

      // Website: AI widget without disclosure (Art. 50(1))
      if (kind === 'WEBSITE' && WEBSITE_AI_WIDGETS.test(file.content) && !AI_DISCLOSURE.test(file.content)) {
        const idx = lines.findIndex(l => WEBSITE_AI_WIDGETS.test(l));
        findings.push(mk({
          id: 'WEB-01', title: 'AI chat/assistant widget without AI-interaction disclosure (Art. 50(1))', kinds: ['WEBSITE'], pattern: /./,
          severity: 'HIGH', framework: 'EU_AI_ACT', articleRef: 'Art. 50(1) Transparency', category: 'TRANSPARENCY', penaltyEur: 7_500_000,
          remediation: 'Tell users clearly, at first interaction, that they are talking to an AI system; offer a human handover.',
          fixSnippet: '<p class="ai-disclosure">You are chatting with an AI assistant. <a href="#human">Talk to a person</a></p>'
        }, file, kind, Math.max(1, idx + 1), lines[idx] || 'AI widget detected'));
      }

      // Agent configs: classify declared tools against the runtime tool registry
      if (kind === 'AGENT_CONFIG') findings.push(...AiEstateScanner.analyzeAgentTools(file));

      // Existing 15-law code rules (reuse)
      if (kind === 'SOURCE_CODE') {
        try {
          for (const v of PolicyEngineService.scanCodeContent(opts.tenantId || 'default-tenant', file.path, file.content)) {
            const lineText = lines[v.lineNumber - 1] || '';
            // Vocabulary rules also match detector/rule/schema code. Code-BEHAVIOUR rules (SQL injection, token storage, consent)
            // must still fire on real SQL/DB code, so the schema filter does not apply to them.
            const codeBehaviour = /SQL Injection|Security of Processing|Conditions for Consent/i.test(v.articleMapping);
            if (DEFINITION_CONTEXT.test(lineText) || (!codeBehaviour && SCHEMA_CONTEXT.test(lineText))) continue;
            // SQL-injection calibration: severity follows what can actually reach the query text.
            let sev = v.severity; let issue = v.issue;
            if (/SQL Injection/i.test(v.articleMapping)) {
              const arg = lineText.match(/prepare\(\s*(['"`])/);
              if (arg && arg[1] !== '`') continue;                                  // constant SQL string: the ${…} is elsewhere on the line
              const exprs = Array.from(lineText.matchAll(/\$\{([^}]+)\}/g)).map(m => m[1]);
              const tainted = exprs.some(e => /\b(?:req|request|ctx)\b\.|\b(?:query|params|body|input|args|payload|user\w*)\b/i.test(e));
              const fragments = exprs.length > 0 && exprs.every(e => /\bwhere\b|\bclauses?\b|\bconditions?\b|\bplaceholders?\b|\bmarks\b|\.join\(|\.length\b/i.test(e));
              const inList = /\bIN\s*\(\s*\$\{[^}]+\}\s*\)/i.test(lineText);
              if (tainted) { sev = 'CRITICAL'; }
              else if (inList || fragments) { sev = 'LOW'; issue = `${v.issue} (dynamic fragment/IN-list — verify it is built only from constants and "?" placeholders)`; }
              else { sev = 'MEDIUM'; issue = `${v.issue} (interpolated value is not visibly request-derived — verify)`; }
            }
            findings.push({
              id: `EST-${uuidv4().substring(0, 8).toUpperCase()}`,
              ruleId: `POLICY:${v.id}`, title: issue, kind, path: v.filePath, line: v.lineNumber,
              severity: sev, framework: /AI Act/i.test(v.articleMapping) ? 'EU_AI_ACT' : /GDPR/i.test(v.articleMapping) ? 'GDPR' : 'OTHER',
              articleRef: v.articleMapping, category: 'POLICY_ENGINE', penaltyExposureEur: v.severity === 'CRITICAL' ? 20_000_000 : 10_000_000,
              evidence: maskSecrets(v.evidence).slice(0, 220),
              remediation: v.isAutoFixable ? 'Apply the suggested patch (human review required).' : 'Manual remediation required.',
              fixSnippet: v.fixSuggestion
            });
          }
        } catch { /* reuse is best-effort */ }
      }

      // Shadow AI: unsanctioned provider endpoints referenced in this file
      const providersHere = new Set(AI_PROVIDER_DOMAINS.filter(p => file.content.toLowerCase().includes(p.domain)).map(p => p.provider));
      const isCatalogue = providersHere.size >= 4;   // a file naming many providers is a gateway/catalogue, not a use
      for (const p of AI_PROVIDER_DOMAINS) {
        if (!file.content.toLowerCase().includes(p.domain)) continue;
        const ok = sanctioned.some(s => s === p.domain || s === p.provider.toLowerCase() || p.domain.includes(s) || p.provider.toLowerCase().includes(s));
        const hit = providerHits.get(p.domain) || { provider: p.provider, domain: p.domain, sanctioned: ok, files: new Set<string>() };
        hit.files.add(file.path);
        providerHits.set(p.domain, hit);
        if (!ok) {
          const idx = lines.findIndex(l => l.toLowerCase().includes(p.domain));
          const cn = p.region === 'CN';
          const near = lines.slice(Math.max(0, idx - 1), idx + 2).join('\n');
          const disabled = idx >= 0 && DISABLED_CONFIG.test(near);
          const catalogue = isCatalogue && !disabled;
          findings.push(mk({
            id: 'SHADOW-AI-01', title: disabled ? `AI provider configured but disabled: ${p.provider} (${p.region})` : catalogue ? `AI provider listed in a provider catalogue (not necessarily in use): ${p.provider} (${p.region})` : `Unsanctioned AI provider in use: ${p.provider} (${p.region})`, kinds: 'ALL', pattern: /./,
            severity: disabled || catalogue ? 'LOW' : cn ? 'HIGH' : 'MEDIUM', framework: 'ISO_42001', articleRef: 'ISO/IEC 42001 / GDPR Ch. V / AI Act Art. 25-26',
            category: 'SHADOW_AI', penaltyEur: cn ? 10_000_000 : 5_000_000,
            remediation: `Route ${p.provider} traffic through the runtime protection gateway, complete vendor/DPA review, and add it to the approved-provider register — or remove it.`
          }, file, kind, Math.max(1, idx + 1), lines[idx] || p.domain));
        }
      }
    }

    const fin = summarizeFindings(findings);

    return {
      scanId: `ESTATE-${uuidv4().substring(0, 8).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      filesScanned: scanned, filesSkipped: skipped, byKind, findings: fin.findings, counts: fin.counts, riskScore: fin.riskScore,
      complianceRating: fin.complianceRating, totalPenaltyExposureEur: fin.totalPenaltyExposureEur,
      aiProvidersDetected: Array.from(providerHits.values()).map(h => ({ ...h, files: Array.from(h.files) })),
      summary: summaryLine(scanned, skipped, fin)
    };
  }

  /** Merge extra findings (e.g. web/API probe results) into an existing result and recompute all aggregates. */
  public static rescore(result: EstateScanResult, extra: EstateFinding[]): EstateScanResult {
    const fin = summarizeFindings([...result.findings, ...extra]);
    return { ...result, findings: fin.findings, counts: fin.counts, riskScore: fin.riskScore, complianceRating: fin.complianceRating,
      totalPenaltyExposureEur: fin.totalPenaltyExposureEur, summary: summaryLine(result.filesScanned, result.filesSkipped, fin) };
  }

  /** CI gate: pass/fail against explicit thresholds. */
  public static gate(result: Pick<EstateScanResult, 'counts' | 'riskScore'>, t: { maxCritical?: number; maxHigh?: number; minScore?: number } = {}) {
    const maxCritical = t.maxCritical ?? 0; const maxHigh = t.maxHigh ?? Number.POSITIVE_INFINITY; const minScore = t.minScore ?? 0;
    const reasons: string[] = [];
    if (result.counts.CRITICAL > maxCritical) reasons.push(`${result.counts.CRITICAL} critical finding(s) exceed the limit of ${maxCritical}`);
    if (result.counts.HIGH > maxHigh) reasons.push(`${result.counts.HIGH} high finding(s) exceed the limit of ${maxHigh}`);
    if (result.riskScore < minScore) reasons.push(`Risk score ${result.riskScore} is below the minimum ${minScore}`);
    return { pass: reasons.length === 0, reasons, thresholds: { maxCritical, maxHigh: Number.isFinite(maxHigh) ? maxHigh : null, minScore } };
  }

  /** Classifies tools declared in an agent/MCP config against the runtime policy tool registry. */
  private static analyzeAgentTools(file: EstateFile): EstateFinding[] {
    const names = new Set<string>();
    try {
      const walk = (v: unknown, key = ''): void => {
        if (Array.isArray(v)) v.forEach(x => (typeof x === 'string' && /tool/i.test(key)) ? names.add(x) : walk(x, key));
        else if (v && typeof v === 'object') {
          const o = v as Record<string, unknown>;
          if (typeof o.name === 'string' && /tool/i.test(key)) names.add(o.name);
          Object.entries(o).forEach(([k, val]) => walk(val, k));
        }
      };
      walk(JSON.parse(file.content));
    } catch {
      for (const m of file.content.matchAll(/^\s*-\s*(?:name:\s*)?["']?([a-z][a-z0-9_]{2,40})["']?\s*$/gim)) names.add(m[1]);
    }
    const out: EstateFinding[] = [];
    const lines = file.content.split('\n');
    for (const name of names) {
      if (name === '*') continue;
      const def = AiRuntimePolicyEngine.classifyTool(name);
      const idx = Math.max(0, lines.findIndex(l => l.includes(name)));
      if (def && (def.permission === 'FINANCIAL' || def.permission === 'PRODUCTION')) {
        out.push(mk({
          id: 'AGT-06', title: `Agent exposes ${def.permission} tool "${name}" (default-deny under runtime policy)`, kinds: ['AGENT_CONFIG'], pattern: /./,
          severity: 'HIGH', framework: 'EU_AI_ACT', articleRef: 'Art. 14 Human oversight', category: 'AGENT_SAFETY', penaltyEur: 15_000_000,
          remediation: 'Remove the tool from the agent, or require dual approval via the Secure Approval API before it can execute.'
        }, file, 'AGENT_CONFIG', idx + 1, lines[idx] || name));
      } else if (def && def.permission === 'DATA_CHANGING') {
        out.push(mk({
          id: 'AGT-07', title: `Agent exposes data-changing tool "${name}" — approval required`, kinds: ['AGENT_CONFIG'], pattern: /./,
          severity: 'MEDIUM', framework: 'EU_AI_ACT', articleRef: 'Art. 14 Human oversight', category: 'AGENT_SAFETY', penaltyEur: 5_000_000,
          remediation: 'Gate this tool behind the approval workflow (policy: DATA_CHANGING → APPROVAL_REQUIRED).'
        }, file, 'AGENT_CONFIG', idx + 1, lines[idx] || name));
      } else if (!def && /(delete|drop|transfer|pay|refund|send|deploy|exec|write|update|admin)/i.test(name)) {
        out.push(mk({
          id: 'AGT-08', title: `Unclassified high-impact tool "${name}" — not in the runtime tool registry`, kinds: ['AGENT_CONFIG'], pattern: /./,
          severity: 'MEDIUM', framework: 'ISO_42001', articleRef: 'ISO/IEC 42001 / Art. 14', category: 'AGENT_SAFETY', penaltyEur: 2_500_000,
          remediation: 'Register and classify the tool (READ_ONLY / DATA_CHANGING / FINANCIAL / PRODUCTION) so the policy engine can govern it.'
        }, file, 'AGENT_CONFIG', idx + 1, lines[idx] || name));
      }
    }
    return out;
  }
}
