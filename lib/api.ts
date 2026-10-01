// Centralized API configuration and endpoints
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export const API_SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8080";

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/login`,
  REGISTER: `${API_BASE_URL}/register`,
  ME: `${API_BASE_URL}/me`,
  CATEGORIES: `${API_BASE_URL}/categories`,
  VIDEOS: `${API_BASE_URL}/videos`,
  VIDEO: (id: string | number) => `${API_BASE_URL}/videos/${id}`,
  STREAM: (id: string | number) => `${API_BASE_URL}/videos/${id}/stream`,
  COMMENTS: (videoId: string | number) =>
    `${API_BASE_URL}/videos/${videoId}/comments`,
  LIKE_COMMENT: (commentId: string | number) =>
    `${API_BASE_URL}/comments/${commentId}/like`,
  DELETE_COMMENT: (commentId: string | number) =>
    `${API_BASE_URL}/comments/${commentId}`,
  SUBSCRIBE: (channelId: string | number) =>
    `${API_BASE_URL}/channels/${channelId}/subscribe`,
} as const;
