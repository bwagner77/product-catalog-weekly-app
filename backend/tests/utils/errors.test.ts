import { adminAuthRequired, invalidCredentials, tokenExpired, forbiddenAdminRole } from '../../src/utils/errors';

describe('Standard error helpers', () => {
  test('adminAuthRequired shape', () => {
    expect(adminAuthRequired()).toEqual({ error: 'admin_auth_required', message: 'Admin authentication required' });
  });
  test('invalidCredentials shape', () => {
    expect(invalidCredentials()).toEqual({ error: 'invalid_credentials', message: 'Invalid admin credentials' });
  });
  test('tokenExpired shape', () => {
    expect(tokenExpired()).toEqual({ error: 'token_expired', message: 'Token expired' });
  });
  test('forbiddenAdminRole shape', () => {
    expect(forbiddenAdminRole()).toEqual({ error: 'forbidden_admin_role', message: 'Admin role required' });
  });
});
