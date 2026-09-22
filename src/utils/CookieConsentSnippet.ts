
/**
 * CookieConsentSnippet Utility
 * Generates advanced code snippets for clients to embed on their sites.
 * Supports GDPR, CCPA, LGPD, and jurisdictional compliance levels.
 */

export interface SnippetConfig {
  tenantId: string;
  theme: 'light' | 'dark';
  position: 'top' | 'bottom' | 'center';
  primaryColor: string;
  jurisdictions: string[];
  complianceLevel: 'standard' | 'advanced' | 'strict'; // OneTrust style
  autoDetectRegion: boolean;
}

export const generateCookieConsentSnippet = (config: SnippetConfig): string => {
  const { 
    tenantId, 
    theme, 
    position, 
    primaryColor, 
    jurisdictions, 
    complianceLevel,
    autoDetectRegion 
  } = config;

  const jurisdictionsStr = jurisdictions.length > 0 
    ? jurisdictions.map(j => `'${j}'`).join(', ') 
    : '';

  return `
<!-- Nonaxen Advanced Cookie Consent Snippet -->
<script src="https://cdn.nonaxen.com/consent/v2/sdk.js" data-tenant-id="${tenantId}"></script>
<script>
  window.NonaxenConsent = window.NonaxenConsent || {};
  NonaxenConsent.init({
    theme: "${theme}",
    position: "${position}",
    primaryColor: "${primaryColor}",
    complianceLevel: "${complianceLevel}",
    jurisdictions: [${jurisdictionsStr}],
    autoDetectRegion: ${autoDetectRegion},
    onConsentUpdate: function(consent) {
      console.log('[Nonaxen] Consent updated:', consent);
      // Integrate with GTM or other analytics here
    }
  });
</script>
`.trim();
};
