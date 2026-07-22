import { api } from "@/lib/api-client";

export interface User {
  id: string;
  email: string;
  display_name: string;
  role: string;
}

export interface SessionResponse {
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
}

export interface SignupRequest {
  email: string;
  password: string;
  display_name: string;
  role?: string;
}

export interface SignupResponse {
  user: User;
  verification_required: boolean;
}

export const authApi = {
  login: (data: LoginRequest) => api.post<LoginResponse>("/auth/login", data),

  signup: (data: SignupRequest) => api.post<SignupResponse>("/auth/signup", data),

  logout: () => api.post<{ success: boolean }>("/auth/logout"),

  getSession: () => api.get<SessionResponse>("/auth/session"),

  forgotPassword: (email: string) =>
    api.post<{ message: string }>("/auth/forgot-password", { email }),

  resetPassword: (token: string, password: string) =>
    api.post<{ message: string }>("/auth/reset-password", { token, password }),
};
