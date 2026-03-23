// Request types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
}

// Response types
export interface AdminInfo {
  id: string;
  email: string;
  name: string;
}

export interface AdminProfileInfo extends AdminInfo {
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginResponse {
  message: string;
  admin: AdminInfo;
  token: string;
}

export interface LogoutResponse {
  message: string;
}

export interface CurrentAdminResponse {
  admin: AdminInfo;
}

export interface UpdateProfileResponse {
  message: string;
  admin: AdminProfileInfo;
}

// JWT payload type
export interface JWTPayload {
  adminId: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Database model type
export interface AdminModel {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// Note: Express Request.admin type is defined in middleware/auth.ts
// to avoid conflicts with Prisma types
