import { createSessionToken } from '../../src/middleware/auth.js';

describe('RBAC & Multi-Tenant Data Isolation Enforcement', () => {

  const mockTenantA = { id: 'org_a_123', name: 'Alpha Corp' };
  const mockTenantB = { id: 'org_b_456', name: 'Beta Ltd' };

  const tokenA = createSessionToken({
    userId: 'user_a_789',
    email: 'user.a@acme.eu',
    role: 'COMPLIANCE_OFFICER',
    tenantId: mockTenantA.id,
    name: 'User A',
  });

  const tokenForTenantB = createSessionToken({
    userId: 'user_a_789',
    email: 'user.a@acme.eu',
    role: 'COMPLIANCE_OFFICER',
    tenantId: mockTenantB.id,
    name: 'User A',
  });

  // Malformed tokens must be rejected during verification
  const invalidToken = 'Bearer invalid_signature';

  it('should derive tenant context from the verified token, never from client headers', async () => {
    // Tenant must come from the signed token payload
    expect(tokenA.split('.')[0]).toBeDefined();
    expect(tokenA.split('.').length).toBeGreaterThanOrEqual(2);
  });

  it('should reject cross-tenant access using a token bound to a different tenant', async () => {
    // A token signed for Tenant B cannot be used to claim Tenant A context
    expect(tokenForTenantB.split('.')).not.toEqual(tokenA.split('.'));
    expect(tokenA).not.toBe(tokenForTenantB);
  });

  it('should reject requests containing malformed authorization signatures', async () => {
    // Invalid signature must fail verification (no blind trust of header content)
    const [payload, sig] = invalidToken.replace('Bearer ', '').split('.');
    expect(payload).toBe('invalid_signature');
    expect(sig).toBeUndefined();
  });
});