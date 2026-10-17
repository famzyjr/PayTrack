
import { apiRequest } from "./api";

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
}

interface RegisterResponse extends ApiResponse {
  user: AuthUser;
   token: string;
}

interface LoginResponse extends ApiResponse {
  token: string;
  user: AuthUser;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export function registerUser(data: RegisterData) {
  return apiRequest<RegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function loginUser(data: LoginData) {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getCurrentUser(token: string) {
  return apiRequest<ApiResponse & { user: AuthUser }>("/auth/me", {
    method: "GET",
    token,
  });
}
