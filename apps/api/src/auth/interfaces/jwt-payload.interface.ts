export interface JwtPayload {
  sub: string;
  email?: string;
  role?: string;
  exp?: number;
  iat?: number;
  user_metadata?: {
    name?: string;
    full_name?: string;
    tnc_accepted_at?: string;
  };
}
