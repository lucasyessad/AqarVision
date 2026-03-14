import type { SupportedLocale } from "../schemas/auth.schema";

export interface ProfileDto {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: string;
  preferred_locale: SupportedLocale;
  created_at: string;
  updated_at: string;
}

export interface AuthSession {
  user_id: string;
  email: string;
  role: string;
  locale: SupportedLocale;
}

export interface SignUpResult {
  user_id: string;
  profile_created: boolean;
}

export interface SignInResult {
  session: AuthSession;
}
