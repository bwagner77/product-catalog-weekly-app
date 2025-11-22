export interface StandardErrorBody {
  error: string;
  message: string;
}

export function adminAuthRequired(): StandardErrorBody {
  return { error: 'admin_auth_required', message: 'Admin authentication required' };
}

export function invalidCredentials(): StandardErrorBody {
  return { error: 'invalid_credentials', message: 'Invalid admin credentials' };
}

export function tokenExpired(): StandardErrorBody {
  return { error: 'token_expired', message: 'Token expired' };
}

export function forbiddenAdminRole(): StandardErrorBody {
  return { error: 'forbidden_admin_role', message: 'Admin role required' };
}
