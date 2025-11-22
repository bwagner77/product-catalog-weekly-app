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

export function validationError(message: string): StandardErrorBody {
  return { error: 'validation_error', message };
}

export function categoryNameConflict(message = 'Category name already exists'): StandardErrorBody {
  return { error: 'category_name_conflict', message };
}

export function notFound(message = 'Resource not found'): StandardErrorBody {
  return { error: 'not_found', message };
}

export function stockConflict(message = 'Stock conflict'): StandardErrorBody {
  return { error: 'stock_conflict', message };
}

export function insufficientStock(message = 'Insufficient stock'): StandardErrorBody { // alias for clarity
  return { error: 'stock_conflict', message };
}
