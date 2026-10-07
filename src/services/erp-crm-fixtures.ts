/**
 * Documented-shape vendor responses used to exercise the ERP/CRM connectors without live tenants.
 * Only ever used when ERP_CONNECTOR_FIXTURES=1 AND NODE_ENV !== 'production' (see aiEstateRoutes.ts).
 * All values are fake. The planted "secrets" exist to prove redaction and query-string stripping.
 */
import type { FetchJson } from './erp-crm-connectors';

const ok = (json: unknown) => ({ status: 200, json });

export const fixtureFetchJson: FetchJson = async (rawUrl, headers) => {
  const u = new URL(rawUrl);
  const path = decodeURIComponent(u.pathname + u.search);
  if (!/^Bearer \S{8,}$/.test(headers.Authorization || '') && !headers['X-Api-Key']) return { status: 401, error: 'missing credential' };

  if (u.hostname.endsWith('salesforce.com')) {
    if (path.includes('FROM RemoteProxy')) return ok({ totalSize: 4, done: true, records: [
      { attributes: { type: 'RemoteProxy' }, SiteName: 'OpenAI_API', EndpointUrl: 'https://api.openai.com/v1/chat?api_key=NOTAREALKEY123', IsActive: true },
      { attributes: { type: 'RemoteProxy' }, SiteName: 'Billing', EndpointUrl: 'https://billing.acme-corp.example/api', IsActive: true },
      { attributes: { type: 'RemoteProxy' }, SiteName: 'Deepseek', EndpointUrl: 'https://api.deepseek.com', IsActive: false },
      { attributes: { type: 'RemoteProxy' }, SiteName: 'Self', EndpointUrl: `https://${u.hostname}`, IsActive: true }] });
    if (path.includes('FROM NamedCredential')) return { status: 403, error: '[{"message":"sObject type NamedCredential is not supported.","errorCode":"INVALID_TYPE"}]' };
    if (path.includes('FROM ConnectedApplication')) return ok({ totalSize: 4, done: true, records: ['Einstein Copilot', 'Slack', 'ChatGPT Connector', 'Salesforce Mobile'].map(Name => ({ attributes: { type: 'ConnectedApplication' }, Name })) });
  }
  if (u.hostname.endsWith('service-now.com')) {
    if (path.includes('/sys_rest_message')) return ok({ result: [
      { name: 'Now Assist GenAI', rest_endpoint: 'https://api.anthropic.com/v1/messages', authentication_type: 'basic' },
      { name: 'HR Sync', rest_endpoint: 'https://hr.acme-corp.example/sync', authentication_type: 'oauth2' }] });
    if (path.includes('/oauth_entity')) return ok({ result: [{ name: 'Azure OpenAI', type: 'client' }, { name: 'Okta SSO', type: 'client' }] });
    if (path.includes('/sys_properties')) return ok({ result: [{ name: 'glide.now_assist.enabled', value: 'true' }, { name: 'com.snc.generative_ai.auto_decision', value: 'true' }] });
  }
  if (u.hostname.endsWith('dynamics.com')) {
    if (path.includes('/connectionreferences') && !u.searchParams.has('$skiptoken')) return ok({ value: [{ connectionreferencelogicalname: 'new_openai_ref', connectorid: '/providers/Microsoft.PowerApps/apis/shared_openai' }],
      '@odata.nextLink': `https://${u.hostname}/api/data/v9.2/connectionreferences?$skiptoken=p2` });
    if (path.includes('/connectionreferences')) return ok({ value: [{ connectionreferencelogicalname: 'new_mail_ref', connectorid: '/providers/Microsoft.PowerApps/apis/shared_office365' }] });
    if (path.includes('/connectors')) return ok({ value: [{ name: 'Credit Scoring API', connectorinternalid: 'c-1' }], '@odata.nextLink': 'https://evil.example/steal?x=1' });
    if (path.includes('/msdyn_aimodels')) return ok({ value: [{ msdyn_name: 'Lead Scoring Model', statuscode: 7 }] });
  }
  if (path.startsWith('/odata/Settings')) return ok({ value: [{ ai_decision_enabled: true, client_secret: 'topsecretvalue123', description: 'Scoring' }] });
  if (path.startsWith('/odata/Empty')) return ok({ value: [] });
  return { status: 404, error: 'not found' };
};
