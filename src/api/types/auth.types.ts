export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  emailVerified: boolean;
  createdAt: string;
  role?: string;
  isSuperuser?: boolean;
  permissions?: Record<string, { view: boolean; edit: boolean; delete: boolean }>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  // refreshToken is in httpOnly cookie, not returned
}

export interface RefreshTokenResponse {
  accessToken: string;
}
