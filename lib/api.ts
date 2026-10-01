// Centralized API configuration and endpoints
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/login`,
  REGISTER: `${API_BASE_URL}/register`,
  ME: `${API_BASE_URL}/me`,
  CATEGORIES: `${API_BASE_URL}/categories`,
  VIDEOS: `${API_BASE_URL}/videos`,
} as const;
