/**
 * PROMPT-INJECTION / JAILBREAK DETECTOR (pure, dependency-free)
 *
 * Layered heuristic detector:
 *   1. Normalise: strip invisible/format characters, decode Unicode tag characters, NFKC, fold
 *      homoglyphs, collapse spaced-out letters.
 *   2. Build decoded variants: leetspeak fold, ROT13, base64 payloads.
 *   3. Match weighted rules (STRONG / MEDIUM / WEAK) across all variants and 14 languages.
 *   4. Decide on the summed score, so a single weak look-alike ("Dan from sales", "act as a bridge")
 *      never triggers by itself.
 *
 * This is a heuristic first line of defence. It reduces risk; it does not eliminate it — pair it with
 * least-privilege tools, output validation and human approval for consequential actions.
 */

export type InjectionGroup =
  | 'OVERRIDE' | 'LEAK' | 'JAILBREAK' | 'ENCODING' | 'INDIRECT' | 'DELIMITER' | 'TOOL' | 'EXFIL' | 'CONTEXT' | 'MULTILINGUAL';

export interface InjectionMatch { label: string; group: InjectionGroup; weight: number; variant: string }

export interface InjectionAnalysis {
  score: number;               // 0..1
  detected: boolean;
  matches: InjectionMatch[];
  flags: string[];             // normalisation signals (hidden chars, homoglyphs, …)
  decodedLayers: string[];     // decoded base64 / hidden text (truncated)
  groupScores: Record<string, number>;
  sanitized: string;
}

const S = 0.7;   // strong: decisive on its own
const M = 0.4;   // medium: needs corroboration
const W = 0.12;  // weak: context only

interface Rule { label: string; re: RegExp; weight: number; group: InjectionGroup }
const R = (label: string, re: RegExp, weight: number, group: InjectionGroup): Rule => ({ label, re, weight, group });

const QUALIFIER = '(?:all|any|every|your|previous|prior|above|earlier|preceding|initial|original|safety|system|former)';
const OVERRIDE_WORDS = '(?:all|any|every|of|your|the|my|these|those|previous|prior|above|earlier|preceding|initial|original|safety|system|former)';
const TARGETS = '(?:instructions?|rules|prompts?|directives?|guidelines?|programming|polic(?:y|ies)|guardrails?|restrictions?|constraints?)';

export const INJECTION_RULES: Rule[] = [
  // ── Override
  R('ignore_previous_instructions', new RegExp(`\\b(?:ignore|disregard|forget|override)\\b(?=[^.\\n]{0,40}\\b${QUALIFIER}\\b)\\s+(?:${OVERRIDE_WORDS}\\s+){1,5}${TARGETS}\\b`, 'i'), S, 'OVERRIDE'),
  R('forget_everything_told', /\bforget\s+(?:everything|all)\s+(?:you\s+(?:were|have\s+been|had\s+been)\s+(?:told|given|taught)|above|before|earlier|that\s+came\s+before)/i, S, 'OVERRIDE'),
  R('safety_filters_off', /\b(?:safety|content|security)\s+(?:filters?|policy|policies|guardrails?|restrictions?|checks?)\s+(?:are|is|have\s+been|has\s+been)\s+(?:turned\s+off|disabled|removed|lifted|deactivated)\b/i, S, 'OVERRIDE'),
  R('ignore_content_policy', /\bignores?\s+(?:your\s+|the\s+)?(?:content|safety)\s+polic(?:y|ies)\b/i, S, 'OVERRIDE'),
  R('now_in_mode', /\byou\s+are\s+now\s+in\s+(?:\w+\s+)?mode\b/i, M, 'OVERRIDE'),
  R('enable_special_mode', /\b(?:enable|activate|enter|switch\s+to|turn\s+on)\s+(?:the\s+)?(?:developer|dev|admin|maintenance|debug|god|sudo|root|jailbreak)\s+mode\b/i, M, 'OVERRIDE'),
  R('you_are_now', /\byou\s+are\s+(?:now|no\s+longer)\s+(?:an?\s+|the\s+)?(?:ai|assistant|bot|model|chatbot|unrestricted|free)\b/i, M, 'OVERRIDE'),
  R('only_rule_now', /\b(?:your\s+only\s+(?:rule|task|job|goal)\s+(?:is|now\s+is)|from\s+this\s+point\s+(?:on\s+)?you\s+(?:must|will|shall))\b/i, M, 'OVERRIDE'),
  R('must_now_answer_only', /\byou\s+must\s+now\s+(?:answer|respond|reply|output|say|write)\s+only\b/i, M, 'OVERRIDE'),
  R('instead_of_then_reply', /\binstead\s+of\s+\w+ing\b[^.\n]{0,40}\b(?:reply|respond|output|say|write|print)\s+(?:only|just|exactly)\b/i, M, 'OVERRIDE'),
  R('ignore_bare_instructions', /\b(?:ignore|disregard)\s+the\s+instructions\b/i, W, 'OVERRIDE'),

  // ── System-prompt extraction
  R('reveal_system_prompt', /\b(?:reveal|show|print|display|leak|expose|repeat|output|echo|dump|tell\s+me)\s+(?:me\s+)?(?:(?:the|your|all|of|my|full|entire|exact|complete)\s+)*(?:system\s+prompt|initial\s+(?:instructions?|prompt)|hidden\s+(?:instructions?|prompt)|original\s+instructions?|instructions?\s+(?:above|you\s+were\s+given))/i, S, 'LEAK'),
  R('repeat_everything_above', /\brepeat\s+(?:everything|all|the\s+text|the\s+words)\s+(?:above|before)\b/i, S, 'LEAK'),
  R('transform_system_prompt', /\b(?:translate|summari[sz]e|rewrite|encode|paraphrase|convert)\s+(?:your|the)\s+(?:system\s+prompt|initial\s+instructions?|hidden\s+instructions?)/i, S, 'LEAK'),
  R('first_n_chars_of_prompt', /\b(?:first|initial|last)\s+\d{2,5}\s+(?:characters?|chars?|words?|tokens?)\s+of\s+(?:(?:the\s+)?text\s+you\s+were\s+given|your\s+(?:system\s+)?(?:prompt|instructions?)|the\s+prompt)\b/i, S, 'LEAK'),
  R('verbatim_instructions', /\b(?:verbatim|word\s+for\s+word)\b[^.\n]{0,40}\b(?:system\s+prompt|instructions?|above)/i, M, 'LEAK'),
  R('what_are_your_instructions', /\bwhat\s+(?:are|were)\s+your\s+(?:system\s+)?(?:instructions?|rules|guidelines|initial\s+prompt)\b/i, M, 'LEAK'),

  // ── Jailbreak / persona
  R('dan_persona', /(?:you\s+are|act\s+as|pretend|become|as|called|named|mode|persona|from\s+now\s+on)[^.\n]{0,30}\bDAN\b|\bDAN\s+(?:mode|persona|prompt)|\bDAN\b[^.\n]{0,40}(?:no\s+rules|anything|without\s+restrictions)/, S, 'JAILBREAK'), // case-sensitive: "Dan" is a name
  R('dan_bare', /\bDAN\b/, W, 'JAILBREAK'),                          // plain acronym: context only
  R('do_anything_now', /\bdo\s+anything\s+now\b/i, S, 'JAILBREAK'),
  R('evil_twin', /\b(?:evil|malicious|dark|uncensored|unfiltered|rogue)\s+(?:twin|version|alter\s*ego|counterpart|clone)\b/i, S, 'JAILBREAK'),
  R('unrestricted_ai', /\b(?:unrestricted|unfiltered|uncensored|unlimited|jailbroken)\s+(?:ai|a\.i\.|assistant|chatbot|model|bot|version\s+of\s+(?:you|yourself))\b/i, S, 'JAILBREAK'),
  R('you_are_ai_with_no_rules', /\byou\s+(?:are|will\s+be|have\s+become|can\s+be)\s+(?:now\s+)?(?:an?\s+)?(?:ai\s+|assistant\s+|bot\s+)?(?:with|that\s+has|having|who\s+has|without)\s+(?:no|zero|any)\s+(?:rules|guidelines|restrictions|limits|limitations|filters|ethics|boundaries|content\s+restrictions)\b/i, S, 'JAILBREAK'),
  R('ai_with_no_rules_third_person', /\b(?:ai|assistant|chatbot|model|bot|version\s+of\s+(?:you|yourself))\s+(?:with|that\s+has|having|who\s+has)\s+(?:no|zero)\s+(?:rules|guidelines|restrictions|limits|filters|ethics|boundaries)\b/i, M, 'JAILBREAK'),
  R('persona_with_no_restrictions', /\b(?:persona|alter\s*ego|character|mode)s?\b[^.\n]{0,80}\b(?:zero|no|without|free\s+of)\s+(?:content\s+)?(?:restrictions|limits|rules|filters|censorship|guardrails|limitations)\b/i, S, 'JAILBREAK'),
  R('free_from_rules', /\bfree\s+(?:from|of)\s+(?:all\s+)?(?:safety|rules|restrictions|constraints|guidelines|limitations|filters)\b/i, S, 'JAILBREAK'),
  R('no_rules_or_guidelines', /\b(?:no|without(?:\s+any)?)\s+(?:rules|restrictions|guidelines|limits|boundaries|filters)\s+(?:or|and)\s+(?:rules|restrictions|guidelines|limits|boundaries|filters)\b/i, M, 'JAILBREAK'),
  R('jailbreak_term', /\bjail\s*break(?:ing|ed)?\b/i, M, 'JAILBREAK'),
  R('pretend_persona', /\b(?:pretend|imagine|roleplay|role-play)\s+(?:that\s+)?(?:you\s+are|you're|to\s+be|as)\s+(?:an?\s+|the\s+)?(?:\w+\s+){0,3}(?:ai|assistant|bot|model|twin|persona|character|version)\b/i, W, 'JAILBREAK'),
  R('hypothetical_framing', /\bhypothetical\s+(?:story|scenario|world|situation)\b/i, W, 'JAILBREAK'),
  R('secret_mode', /\b(?:secret|hidden|stealth|covert)\s+mode\b/i, W, 'JAILBREAK'),

  // ── Indirect injection (instructions hidden in content)
  R('note_to_ai', /\b(?:note|notice|message|instructions?|directive|memo|reminder|command)s?\s+(?:to|for)\s+(?:the\s+)?(?:ai|a\.i\.|assistant|model|llm|chatbot|bot|language\s+model)\b/i, M, 'INDIRECT'),
  R('system_notice_to_ai', /\b(?:system|admin(?:istrator)?|developer|security)\s+(?:notice|alert|override|message|directive|update)\s+(?:to|for)\s+(?:the\s+)?(?:ai|assistant|model|llm|bot)/i, M, 'INDIRECT'),
  R('html_comment_to_ai', /<!--[^>]{0,300}\b(?:ai|assistant|model|llm|chatbot)\b[^>]{0,300}-->/i, M, 'INDIRECT'),
  R('hidden_text_marker', /\b(?:hidden|invisible|white[\s-]on[\s-]white|zero[\s-]width|tiny\s+font)\s+(?:text|instruction|message|prompt|content)\b/i, M, 'INDIRECT'),
  R('markdown_image_exfil', /!\[[^\]]{0,80}\]\(\s*https?:\/\/[^)\s]{0,200}[?&][^)\s]{0,200}\)/i, M, 'INDIRECT'),

  // ── Delimiter / chat-template escape
  R('chat_template_tokens', /<\|(?:im_start|im_end|endoftext|system|user|assistant)\|>|\[\/?INST\]|<<\/?SYS>>/i, S, 'DELIMITER'),
  R('guard_delimiter_spoof', /#{2,}\s*(?:USER_INPUT_(?:START|END)|SYSTEM|END_?OF_?(?:USER|INPUT)|ASSISTANT|INSTRUCTIONS?)\s*#{2,}/i, S, 'DELIMITER'),
  R('fake_role_tags', /<\/?(?:system|assistant|instructions?|developer|admin)>/i, M, 'DELIMITER'),
  R('closing_input_tag', /<\/(?:user_input|user|input|context|document)>/i, M, 'DELIMITER'),
  R('role_line_injection', /^\s*(?:system|assistant|developer)\s*:\s*\S/im, M, 'DELIMITER'),

  // ── Tool abuse
  R('call_tool', /\b(?:call|run|invoke|execute|trigger|use)\s+(?:the\s+|your\s+)?(?!(?:the|a|an|my|your|this|that|our|their|any|unit|test|tests)\b)[\w.-]{2,40}\s+(?:tool|function|api|plugin|command)\b/i, M, 'TOOL'),
  R('skip_approval', /\b(?:skip|bypass|without|no\s+need\s+for|don'?t\s+(?:ask|wait)\s+for|do\s+not\s+(?:ask|wait)\s+for|do\s+not\s+require)\s+(?:the\s+)?(?:human\s+|manual\s+)?(?:approval|confirmation|review|permission|authori[sz]ation|consent)\b/i, M, 'TOOL'),
  R('claimed_preapproval', /\b(?:pre-?approved|already\s+(?:approved|authori[sz]ed)|(?:administrator|admin)\s+(?:approved|authori[sz]ed)|(?:authori[sz]ed|approved|sanctioned|cleared)\s+by\s+(?:the\s+)?(?:cto|ceo|cfo|ciso|admin(?:istrator)?|manager|management|security\s+team|boss|owner))\b/i, M, 'TOOL'),
  R('urgent_execution', /\b(?:right\s+now|immediately|asap)\b/i, W, 'TOOL'),
  R('shell_exfil_pipe', /\b(?:cat|type|printenv|env|echo|tar|cp|head|tail)\b[^\n|]{0,60}\|\s*(?:curl|wget|nc|ncat|netcat|ssh|scp)\b|\bcurl\s+[^\n]{0,80}(?:-d|--data(?:-binary)?)\s+@-/i, S, 'TOOL'),
  R('sensitive_file_path', /(?:\.ssh\/id_|\/etc\/(?:passwd|shadow)|\.aws\/credentials|\.env\b)/i, M, 'TOOL'),
  R('send_data_external', /\b(?:send|post|upload|forward|exfiltrate|transmit|email)\s+(?:[\w']+\s+){0,5}(?:messages?|conversation|chat|history|contents?|data|files?|secrets?|keys?|context|credentials?)\s+to\s+(?:https?:\/\/|\w[\w.-]*\.\w{2,})/i, M, 'TOOL'),

  // ── Data exfiltration requests
  R('list_pii_of_others', /\b(?:list|show|give|reveal|output|print|tell)\s+(?:me\s+)?(?:the\s+)?[\w\s,]{0,60}\b(?:emails?(?:\s+addresses)?|phone\s+numbers?|card\s+numbers?|credit\s+cards?|passwords?|ssns?|api\s+keys?|tokens?|addresses)\b[\w\s,]{0,60}\b(?:of|from|belonging\s+to)\s+(?:other|another|all|previous|different)\s+(?:customers?|users?|clients?|people|accounts?|patients?|employees?)\b/i, 0.55, 'EXFIL'),
  R('dump_secrets_in_context', /\b(?:output|print|show|reveal|list|dump|leak|display)\s+(?:me\s+)?(?:any|all|every|the)\s+(?:api\s+keys?|passwords?|tokens?|secrets?|credentials?|private\s+keys?)\b[^.\n]{0,60}\b(?:in|from|within|inside)\s+(?:your|the)\s+(?:context|memory|prompt|session|environment|conversation)\b/i, 0.6, 'EXFIL'),
  R('training_data_regurgitation', /\b(?:verbatim|exact|raw)\s+(?:text|passages?|samples?|records?)\s+from\s+your\s+training\s+data\b|\btraining\s+data\s+that\s+contains\s+personal\b/i, 0.55, 'EXFIL'),

  // ── Context manipulation
  R('claimed_prior_agreement', /\bas\s+we\s+(?:agreed|discussed|established)\s+(?:earlier|previously|before|in\s+(?:our|the)\s+(?:previous|last|earlier)\s+(?:conversation|chat|session))\b/i, M, 'CONTEXT'),
  R('claimed_rules_updated', /\b(?:your|the)\s+(?:rules|instructions|guidelines|policy|policies|restrictions)\s+(?:were|have\s+been|has\s+been|are)\s+(?:updated|changed|revised|replaced|lifted|removed)\b/i, M, 'CONTEXT'),

  // ── Additional concept-level rules
  R('new_system_message', /\bnew\s+system\s+(?:message|prompt|instructions?|directive)\s*:/i, S, 'DELIMITER'),
  R('bracketed_override_tag', /\[(?:system|admin|developer)\s*(?:override|message|prompt|command|mode)\]/i, S, 'DELIMITER'),
  R('compose_completion_trick', /\b(?:complete|continue|finish|fill\s+in)\b[^.\n]{0,40}\b(?:system\s+prompt|hidden\s+prompt|instructions?\s+(?:are|is))/i, S, 'LEAK'),
  R('dump_conversation_with_hidden', /\b(?:output|print|show|dump|give|display|reveal|copy|list)\s+(?:the\s+)?(?:entire\s+|full\s+|whole\s+)?(?:conversation|context|chat|messages?|history)\b[^.\n]{0,40}\b(?:including|with|along\s+with)\s+(?:any\s+|all\s+|the\s+)?(?:hidden|system|internal|private|developer)\b/i, S, 'LEAK'),
  R('text_at_top_of_conversation', /\b(?:text|message|content|words?)\s+(?:that\s+)?(?:appears?|comes?|was|is)\s+(?:at\s+the\s+)?(?:very\s+)?(?:top|start|beginning)\s+of\s+(?:this|the)\s+(?:conversation|chat|context)|before\s+my\s+first\s+message/i, M, 'LEAK'),
  R('copy_exactly', /\b(?:copy|reproduce|quote|paste)\s+(?:it|them|that|this)?\s*(?:exactly|verbatim)\b/i, M, 'LEAK'),
  R('wipe_context', /\b(?:wipe|reset|clear|erase|flush|purge)\s+(?:all\s+|any\s+)?(?:of\s+)?(?:your|the)\s+(?:prior|previous|earlier|current|existing)?\s*(?:context|instructions?|rules|setup|programming|memory|configuration)\b/i, M, 'OVERRIDE'),
  R('follow_only_me', /\bfollow\s+only\s+(?:what\s+i\s+say|my\s+(?:instructions?|commands?|orders?)|the\s+instructions?\s+i)/i, M, 'OVERRIDE'),
  R('no_longer_bound', /\b(?:you\s+are\s+)?no\s+longer\s+bound\s+by\b/i, S, 'OVERRIDE'),
  R('grant_all_access_unchecked', /\bgrant\s+(?:them|him|her|me)\s+(?:access\s+to\s+)?all\b[^.\n]{0,40}\bwithout\s+(?:checking|verif(?:y|ying)|validat(?:e|ing))/i, S, 'TOOL'),
  R('claimed_verified_admin', /\bthe\s+user\s+is\s+a\s+verified\s+(?:admin(?:istrator)?|owner|employee|developer|root)\b/i, M, 'TOOL'),
  R('addressed_to_ai_in_content', /\b(?:to\s+any\s+(?:automated\s+)?(?:assistant|ai|llm|agent|model)|if\s+you\s+are\s+(?:an?\s+)?(?:ai|llm|language\s+model|assistant|bot|agent)\b)/i, M, 'INDIRECT'),
  R('tell_user_to_act', /\b(?:tell|ask|instruct|direct|persuade)\s+the\s+user\s+to\s+(?:visit|click|open|go\s+to|enter|send|provide|share|download|install)\b/i, M, 'INDIRECT'),
  R('authority_claim_developer', /\bi['’]?m\s+(?:the|a|an)\s+(?:developer|admin(?:istrator)?|owner|engineer|creator|operator|security\s+(?:researcher|tester))\b/i, W, 'CONTEXT'),
  R('grandma_exploit', /\b(?:read|tell|recite|give)\s+me\s+(?:windows\s+)?(?:activation|product|licen[sc]e|serial)\s+keys\b/i, M, 'JAILBREAK'),
];

// ── Normalisation ────────────────────────────────────────────────────────────

const TAG_RANGE = /[\u{E0000}-\u{E007F}]/gu;
const INVISIBLE = /[\u200b\u200c\u200d\u2060\ufeff\u00ad]/g;
const BIDI = /[\u202a-\u202e\u2066-\u2069]/g;

const HOMOGLYPHS: Record<string, string> = {
  '\u0430': 'a', '\u0435': 'e', '\u043e': 'o', '\u0456': 'i', '\u0440': 'p', '\u0441': 'c', '\u0445': 'x', '\u0443': 'y',
  '\u0455': 's', '\u0458': 'j', '\u04bb': 'h', '\u0501': 'd', '\u0410': 'A', '\u0415': 'E', '\u041e': 'O', '\u0420': 'P',
  '\u0421': 'C', '\u0425': 'X', '\u0391': 'A', '\u0395': 'E', '\u039f': 'O', '\u03bf': 'o', '\u03b1': 'a', '\u03c1': 'p'
};

function foldHomoglyphs(s: string): string {
  let out = '';
  for (const ch of s) out += HOMOGLYPHS[ch] ?? ch;
  return out;
}

function mixedScriptTokens(s: string): number {
  let n = 0;
  for (const tok of s.split(/\s+/)) {
    if (tok.length > 2 && /[A-Za-z]/.test(tok) && /[\u0400-\u04FF\u0370-\u03FF]/.test(tok)) n++;
  }
  return n;
}

function collapseSpaced(s: string): string {
  // "i g n o r e   a l l" → "ignore all". Only triggers when a long run (>= 6 letters) proves deliberate spacing,
  // then collapses every run of >= 3 spaced single letters (so short words like "a l l" are recovered too).
  if (!/(?:^|\s)(?:[A-Za-z]\s){5,}[A-Za-z](?=\s|$)/.test(s)) return s;
  return s.replace(/(?:^|\s)((?:[A-Za-z]\s){2,}[A-Za-z])(?=\s|$)/g, (_m, run: string) => ' ' + run.replace(/\s/g, ''))
          .replace(/\s{2,}/g, ' ');
}

function rot13(s: string): string {
  return s.replace(/[a-z]/gi, c => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
  });
}

function leetFold(s: string): string {
  return s.replace(/[4310@$5!7]/g, c => ({ '4': 'a', '3': 'e', '1': 'i', '0': 'o', '@': 'a', '$': 's', '5': 's', '!': 'i', '7': 't' } as Record<string, string>)[c]);
}

function printableRatio(s: string): number {
  if (!s.length) return 0;
  let ok = 0;
  for (const ch of s) { const c = ch.codePointAt(0)!; if ((c >= 32 && c < 127) || c === 10 || c === 9 || c >= 160) ok++; }
  return ok / s.length;
}

function decodeBase64Tokens(s: string): string[] {
  const out: string[] = [];
  for (const m of s.matchAll(/[A-Za-z0-9+/]{24,}={0,2}/g)) {
    if (out.length >= 5) break;
    try {
      const dec = Buffer.from(m[0], 'base64').toString('utf8');
      if (dec.length >= 12 && printableRatio(dec) >= 0.92 && /[a-z]{3,}/i.test(dec)) out.push(dec);
    } catch { /* not base64 */ }
  }
  return out;
}

interface Variant { name: string; text: string }

function buildVariants(input: string): { variants: Variant[]; flags: { label: string; weight: number }[]; decoded: string[] } {
  const flags: { label: string; weight: number }[] = [];
  const decoded: string[] = [];
  const variants: Variant[] = [];
  const text = input.slice(0, 20000);

  const tagChars = text.match(TAG_RANGE);
  if (tagChars) {
    flags.push({ label: 'HIDDEN_TAG_CHARACTERS', weight: 0.5 });
    const hidden = Array.from(text).filter(ch => /[\u{E0000}-\u{E007F}]/u.test(ch)).map(ch => String.fromCharCode(ch.codePointAt(0)! - 0xE0000)).join('');
    if (hidden.trim()) { decoded.push(hidden.slice(0, 200)); variants.push({ name: 'tag-decoded', text: hidden }); }
  }
  if (BIDI.test(text)) flags.push({ label: 'BIDI_CONTROL_CHARACTERS', weight: 0.3 });
  if ((text.match(/[A-Za-z][\u200b\u200c\u200d\u2060\ufeff]+[A-Za-z]/g) || []).length >= 3) flags.push({ label: 'ZERO_WIDTH_INSIDE_WORDS', weight: 0.3 });

  let t = text.replace(TAG_RANGE, '').replace(INVISIBLE, '').replace(BIDI, '').normalize('NFKC');
  const unfolded = t;
  if (mixedScriptTokens(t) >= 2) flags.push({ label: 'MIXED_SCRIPT_HOMOGLYPHS', weight: 0.3 });
  t = foldHomoglyphs(t);
  const despaced = collapseSpaced(t);
  if (despaced !== t.replace(/\s{2,}/g, ' ')) flags.push({ label: 'SPACED_OUT_LETTERS', weight: 0.2 });

  variants.push({ name: 'normalized', text: despaced });
  if (unfolded !== t) variants.push({ name: 'unfolded', text: unfolded });
  if (despaced !== t) variants.push({ name: 'raw-spacing', text: t });

  if ((despaced.match(/[a-z][4310@$5][a-z]/gi) || []).length >= 2) variants.push({ name: 'leetspeak', text: leetFold(despaced) });
  variants.push({ name: 'rot13', text: rot13(despaced) });
  variants.push({ name: 'reversed', text: Array.from(despaced).reverse().join('') });   // "snoitcurtsni suoiverp lla erongi"

  for (const d of decodeBase64Tokens(despaced)) {
    decoded.push(d.slice(0, 200));
    variants.push({ name: 'base64', text: foldHomoglyphs(d.normalize('NFKC')) });
  }
  return { variants, flags, decoded };
}

// ── Concept-level detection (generalises beyond fixed phrases) ───────────────

interface Lexicon { lang: string; verbs: string; nouns: string; qualifiers: string; cjk?: boolean }

const LEXICONS: Lexicon[] = [
  { lang: 'en', verbs: "ignore|disregard|forget|override|bypass|discard|abandon|set\\s+aside|pay\\s+no\\s+attention\\s+to|stop\\s+following|do\\s+not\\s+follow|don'?t\\s+follow|disobey|circumvent|wipe|drop",
    nouns: "instructions?|rules|guidelines?|guidance|directives?|directions|programming|polic(?:y|ies)|guardrails?|restrictions?|constraints?|limitations?|system\\s+prompt|training|conditioning|setup|configuration|orders|commands",
    qualifiers: "all|any|every|your|previous|prior|above|earlier|preceding|initial|original|former|whatever|everything|so\\s+far|you(?:'ve|\\s+have|\\s+were)\\s+(?:been\\s+)?(?:given|told|instructed|taught|programmed)|developers?|creators?|operators?" },
  { lang: 'es', verbs: "ignora(?:r)?|olvida(?:r)?|descarta|omite|no\\s+(?:tengas|tomes)\\s+en\\s+cuenta|desobedece", nouns: "instrucciones|reglas|indicaciones|pautas|directrices|normas|órdenes|restricciones", qualifiers: "anteriores|previas|todas|tus|esas|que\\s+te" },
  { lang: 'fr', verbs: "ignore[zr]?|oublie[zr]?|ne\\s+tiens\\s+pas\\s+compte|ne\\s+tenez\\s+pas\\s+compte|ne\\s+suis\\s+pas|d[ée]sob[ée]is", nouns: "instructions|consignes|r[eè]gles|directives|restrictions|indications", qualifiers: "pr[ée]c[ée]dentes?|ant[ée]rieures?|toutes|tes|vos|ces" },
  { lang: 'de', verbs: "ignorier(?:e|en)?|vergiss|vergessen|missachte|befolge\\s+nicht|beachte\\s+nicht", nouns: "anweisungen|instruktionen|regeln|vorgaben|richtlinien|einschränkungen|beschränkungen", qualifiers: "vorherigen|bisherigen|früheren|obigen|alle|deine|diese" },
  { lang: 'it', verbs: "ignora|dimentica|trascura|non\\s+seguire", nouns: "istruzioni|regole|direttive|linee\\s+guida|restrizioni", qualifiers: "precedenti|tutte|tue|sopra" },
  { lang: 'pt', verbs: "ignor(?:e|a)|esque[cç]a|desconsidere", nouns: "instru[cç][õo]es|regras|diretrizes|restri[cç][õo]es", qualifiers: "anteriores|todas|suas|tuas" },
  { lang: 'nl', verbs: "negeer|vergeet", nouns: "instructies|regels|richtlijnen|beperkingen", qualifiers: "vorige|eerdere|alle|jouw" },
  { lang: 'tr', verbs: "yoksay|unut|göz\\s+ardı\\s+et", nouns: "talimat|kural|yönerge|kısıtlama", qualifiers: "önceki|tüm|bütün" },
  { lang: 'ru', verbs: "игнорируй(?:те)?|забудь(?:те)?|не\\s+следуй|отбрось", nouns: "инструкци|правил|указани|ограничени", qualifiers: "предыдущ|прежн|все|всех" },
  { lang: 'zh', cjk: true, verbs: "忽略|无视|忘记|忽視|無視|不要遵守|别管|不要理会", nouns: "指令|指示|提示|说明|說明|规则|規則|限制|约束|系统提示", qualifiers: "之前|以前|上面|先前|以上|所有|全部|一切" },
  { lang: 'ja', cjk: true, verbs: "無視|忘れ|従わない", nouns: "指示|命令|指令|ルール|制限", qualifiers: "以前|前の|すべて|全て" },
  { lang: 'ko', cjk: true, verbs: "무시|잊어|따르지", nouns: "지시|명령|지침|규칙|제한", qualifiers: "이전|위의|모든" },
  { lang: 'ar', cjk: true, verbs: "تجاهل|انسَ|انس|لا\\s+تتبع", nouns: "التعليمات|القواعد|الأوامر|القيود", qualifiers: "السابقة|جميع|كل" },
  { lang: 'hi', cjk: true, verbs: "अनदेखा|नज़रअंदाज़|नजरअंदाज|भूल\\s+जाओ|न\\s+मानो", nouns: "निर्देश|नियम|आदेश|प्रतिबंध", qualifiers: "पिछले|पिछली|सभी|सारे" },
  { lang: 'bn', cjk: true, verbs: "উপেক্ষা|অগ্রাহ্য|ভুলে|মানবে\\s+না", nouns: "নির্দেশ|নিয়ম|আদেশ|বিধিনিষেধ", qualifiers: "আগের|পূর্বের|সব|সকল" }
];

const BOUND = '(?<![\\p{L}\\p{N}])';
const LEX_COMPILED = LEXICONS.map(l => {
  const gap = l.cjk ? '[^.\\n。]{0,25}?' : '[^.\\n。]{0,40}?';
  const lead = l.cjk ? '' : BOUND;
  const core = new RegExp(`${lead}(?:${l.verbs})${gap}(?:${l.nouns})|${lead}(?:${l.nouns})${gap}(?:${l.verbs})`, 'giu');
  const qual = new RegExp(l.cjk ? `(?:${l.qualifiers})` : `${BOUND}(?:${l.qualifiers})`, 'iu');
  return { lang: l.lang, core, qual };
});

const REVEAL_VERBS = "reveal|show|print|display|leak|expose|repeat|output|echo|dump|copy|reproduce|recite|tell\\s+me|give\\s+me|write\\s+out|read\\s+back|translate|summari[sz]e|paraphrase";
const SECRET_STRONG = "(?:system|configuration|config|initial|hidden|original|startup|setup|secret|developer|pre)[\\s-]?(?:prompt|instructions?|message|text|settings|rules)";
const SECRET_SOFT = "your\\s+(?:instructions|rules|guidelines|programming|configuration)|(?:everything|all\\s+text|the\\s+text)\\s+(?:above|before)";
const REVEAL_STRONG = new RegExp(`\\b(?:${REVEAL_VERBS})\\b[^.\\n]{0,40}?\\b(?:${SECRET_STRONG})`, 'i');
const REVEAL_SOFT = new RegExp(`\\b(?:${REVEAL_VERBS})\\b[^.\\n]{0,40}?\\b(?:${SECRET_SOFT})`, 'i');

function conceptScan(text: string, variant: string): InjectionMatch[] {
  const out: InjectionMatch[] = [];
  for (const lex of LEX_COMPILED) {
    lex.core.lastIndex = 0;
    let m: RegExpExecArray | null; let guard = 0;
    while ((m = lex.core.exec(text)) && guard++ < 5) {
      const win = text.slice(Math.max(0, m.index - 30), m.index + m[0].length + 30);
      const strong = lex.qual.test(win);
      out.push({ label: `concept:override_${lex.lang}${strong ? '' : '_weak'}`, group: lex.lang === 'en' ? 'OVERRIDE' : 'MULTILINGUAL', weight: strong ? S : M, variant });
      break;
    }
  }
  if (REVEAL_STRONG.test(text)) out.push({ label: 'concept:reveal_hidden_prompt', group: 'LEAK', weight: S, variant });
  else if (REVEAL_SOFT.test(text)) out.push({ label: 'concept:reveal_instructions', group: 'LEAK', weight: M, variant });
  return out;
}

// ── Analysis ─────────────────────────────────────────────────────────────────

export function analyzeInjection(input: string, opts: { groups?: InjectionGroup[] } = {}): InjectionAnalysis {
  const { variants, flags, decoded } = buildVariants(typeof input === 'string' ? input : String(input ?? ''));
  const seen = new Set<string>();
  const matches: InjectionMatch[] = [];
  const primaryHit = new Set<string>();
  const PRIMARY = new Set(['normalized', 'raw-spacing', 'unfolded', 'tag-decoded']);
  const push = (m: InjectionMatch) => {
    if (opts.groups && !opts.groups.includes(m.group)) return;
    const isPrimary = PRIMARY.has(m.variant);
    if (isPrimary) primaryHit.add(m.label);
    // a rule that fires on a decoded variant only counts when it did not already fire on the plain text
    if (!isPrimary && primaryHit.has(m.label)) return;
    const key = (isPrimary ? '' : `${m.variant}:`) + m.label;
    if (seen.has(key)) return;
    seen.add(key);
    matches.push({ ...m, label: key });
  };

  for (const v of variants) {
    for (const rule of INJECTION_RULES) {
      if (v.name === 'unfolded') continue;                 // unfolded text is only used for concept/multilingual scanning
      if (v.name === 'reversed' && rule.group === 'MULTILINGUAL') continue;
      if (!rule.re.test(v.text)) continue;
      push({ label: rule.label, group: rule.group, weight: rule.weight, variant: v.name });
    }
    if (v.name !== 'rot13' && v.name !== 'reversed') conceptScan(v.text, v.name).forEach(push);
  }

  const encodedHit = matches.some(m => !PRIMARY.has(m.variant));
  const flagLabels: string[] = [];
  for (const f of flags) { flagLabels.push(f.label); }
  if (encodedHit) flagLabels.push('OBFUSCATED_PAYLOAD_DECODED');

  const groupScores: Record<string, number> = {};
  let score = 0;
  for (const m of matches) { groupScores[m.group] = (groupScores[m.group] || 0) + m.weight; score += m.weight; }
  if (!opts.groups) {
    for (const f of flags) { groupScores.ENCODING = (groupScores.ENCODING || 0) + f.weight; score += f.weight; }
    if (encodedHit) { groupScores.ENCODING = (groupScores.ENCODING || 0) + 0.2; score += 0.2; }
  }
  score = Math.min(1, score);

  const strong = matches.some(m => m.weight >= S);
  return {
    score: parseFloat(score.toFixed(2)),
    detected: strong || score >= 0.5,
    matches, flags: flagLabels, decodedLayers: decoded, groupScores,
    sanitized: sanitizeForModel(input)
  };
}

/** Neutralises delimiter/role spoofing and invisible characters before text reaches a model. */
export function sanitizeForModel(input: string): string {
  return String(input ?? '')
    .replace(TAG_RANGE, '').replace(INVISIBLE, '').replace(BIDI, '')
    .replace(/<\|[a-z_]+\|>|\[\/?INST\]|<<\/?SYS>>/gi, '[FILTERED_TOKEN]')
    .replace(/#{2,}\s*(?:USER_INPUT_(?:START|END)|SYSTEM|ASSISTANT|INSTRUCTIONS?)\s*#{2,}/gi, '[FILTERED_DELIMITER]')
    .replace(/<\/?(?:system|assistant|instructions?|developer|admin|user_input)>/gi, '[FILTERED_TAG]')
    .replace(/```(?:markdown|system|prompt)/gi, '```text')
    .replace(/[-=_]{5,}/g, '[FILTERED_DELIMITER]')
    .trim();
}
