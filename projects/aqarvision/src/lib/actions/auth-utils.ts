export interface AgencyAuth {
  agency: { id: string; active_plan: string };
  user: { id: string; email: string };
}

export interface AuthError {
  success: false;
  error: string;
}

/**
 * Type guard pour différencier une erreur d'auth d'un résultat valide.
 */
export function isAuthError(result: AgencyAuth | AuthError): result is AuthError {
  return 'success' in result && result.success === false;
}
