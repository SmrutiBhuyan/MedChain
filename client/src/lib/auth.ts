import { apiRequest } from "./queryClient";
import { LoginData, InsertUser } from "@shared/schema";

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export async function login(data: LoginData): Promise<AuthResponse> {
  const response = await apiRequest("POST", "/api/auth/login", data);
  return response.json();
}

export async function register(data: InsertUser): Promise<AuthResponse> {
  const response = await apiRequest("POST", "/api/auth/register", data);
  return response.json();
}

export function getAuthHeaders(): { Authorization: string } | {} {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}
