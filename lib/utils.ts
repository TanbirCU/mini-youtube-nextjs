import { Video } from "@/types/video";

export function formatTimeAgo(dateString?: string): string {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (isNaN(diffInSeconds) || diffInSeconds < 0) return "Recently";
  if (diffInSeconds < 60) return "Just now";
  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? "s" : ""} ago`;
}

const CATEGORY_THUMBNAILS: Record<string, string> = {
  music: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=900",
  movie: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=900",
  movies: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=900",
  animation: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=900",
  "movies & animation": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=900",
  travel: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=900",
  nature: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=900",
  gaming: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=900",
  programming: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900",
  technology: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=900",
  design: "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=900",
  database: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=900",
  education: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=900",
  news: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=900",
  sports: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=900",
};

const DEFAULT_FALLBACK_THUMBNAILS = [
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=900",
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=900",
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=900",
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900",
  "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=900",
];

export function getThumbnailFallback(categoryName?: string, id: number = 0): string {
  if (categoryName) {
    const key = categoryName.toLowerCase().trim();
    if (CATEGORY_THUMBNAILS[key]) {
      return CATEGORY_THUMBNAILS[key];
    }
    for (const [cat, url] of Object.entries(CATEGORY_THUMBNAILS)) {
      if (key.includes(cat) || cat.includes(key)) {
        return url;
      }
    }
  }
  return DEFAULT_FALLBACK_THUMBNAILS[id % DEFAULT_FALLBACK_THUMBNAILS.length];
}

export function mapBackendVideoToVideo(item: any): Video {
  const categoryName = item.category?.name || "General";
  const thumbnail =
    item.thumbnail && item.thumbnail.trim() !== ""
      ? item.thumbnail
      : getThumbnailFallback(categoryName, item.id || 0);

  // Direct static streaming via backend uploads or stream route
  let videoUrl = "";
  if (item.filename) {
    videoUrl = `http://localhost:8080/uploads/videos/${item.filename}`;
  } else if (item.id) {
    videoUrl = `http://localhost:8080/api/videos/${item.id}/stream`;
  }

  return {
    id: item.id,
    title: item.title || "Untitled Video",
    channelId: item.user?.id || item.user_id || 1,
    channelName: item.user?.name || "Creator",
    channelAvatar: item.user?.avatar || "",
    thumbnail,
    duration: item.duration || "03:45",
    views: typeof item.views === "number" ? item.views : 0,
    uploadedAt: formatTimeAgo(item.created_at),
    category: categoryName,
    description: item.description || "",
    likes: typeof item.likes === "number" ? item.likes : 0,
    comments: typeof item.comments === "number" ? item.comments : 0,
    videoUrl,
  };
}

// ==========================================
// WATCH HISTORY HELPERS
// ==========================================
export interface WatchHistoryEntry {
  videoId: number;
  watchedAt: number; // Date.now() timestamp
}

export function addToWatchHistory(videoId: number) {
  if (typeof window === "undefined" || !videoId) return;
  try {
    const raw = localStorage.getItem("minitube_watch_history");
    let history: WatchHistoryEntry[] = raw ? JSON.parse(raw) : [];
    // Remove if already exists to bring to top
    history = history.filter((item) => item.videoId !== videoId);
    history.unshift({ videoId, watchedAt: Date.now() });
    // Keep max 100 items
    if (history.length > 100) history = history.slice(0, 100);
    localStorage.setItem("minitube_watch_history", JSON.stringify(history));
  } catch {}
}

export function getWatchHistory(): WatchHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("minitube_watch_history");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function removeFromWatchHistory(videoId: number): WatchHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const history = getWatchHistory().filter((item) => item.videoId !== videoId);
    localStorage.setItem("minitube_watch_history", JSON.stringify(history));
    return history;
  } catch {
    return [];
  }
}

export function clearWatchHistory() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("minitube_watch_history");
  } catch {}
}

// ==========================================
// LIKED VIDEOS HELPERS
// ==========================================
export function getLikedVideos(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("minitube_liked_videos");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isLikedVideo(videoId: number): boolean {
  return getLikedVideos().includes(videoId);
}

export function toggleLikedVideo(videoId: number): boolean {
  if (typeof window === "undefined" || !videoId) return false;
  try {
    let liked = getLikedVideos();
    const isCurrentlyLiked = liked.includes(videoId);
    if (isCurrentlyLiked) {
      liked = liked.filter((id) => id !== videoId);
    } else {
      liked.unshift(videoId);
    }
    localStorage.setItem("minitube_liked_videos", JSON.stringify(liked));
    return !isCurrentlyLiked;
  } catch {
    return false;
  }
}

// ==========================================
// SAVED VIDEOS HELPERS
// ==========================================
export function getSavedVideos(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("minitube_saved_videos");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isSavedVideo(videoId: number): boolean {
  return getSavedVideos().includes(videoId);
}

export function toggleSavedVideo(videoId: number): boolean {
  if (typeof window === "undefined" || !videoId) return false;
  try {
    let saved = getSavedVideos();
    const isCurrentlySaved = saved.includes(videoId);
    if (isCurrentlySaved) {
      saved = saved.filter((id) => id !== videoId);
    } else {
      saved.unshift(videoId);
    }
    localStorage.setItem("minitube_saved_videos", JSON.stringify(saved));
    return !isCurrentlySaved;
  } catch {
    return false;
  }
}

export function removeSavedVideo(videoId: number): number[] {
  if (typeof window === "undefined" || !videoId) return [];
  try {
    const saved = getSavedVideos().filter((id) => id !== videoId);
    localStorage.setItem("minitube_saved_videos", JSON.stringify(saved));
    return saved;
  } catch {
    return [];
  }
}

export function clearSavedVideos() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("minitube_saved_videos");
  } catch {}
}

// ==========================================
// PLAYLIST HELPERS
// ==========================================
export interface CustomPlaylist {
  id: string;
  name: string;
  description?: string;
  videoIds: number[];
  createdAt: string;
}

export function getPlaylists(): CustomPlaylist[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("minitube_custom_playlists");
    if (!raw) {
      const defaultPlaylists: CustomPlaylist[] = [
        {
          id: "favorites",
          name: "Favorites",
          description: "Curated collection of great content",
          videoIds: [3, 1],
          createdAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem(
        "minitube_custom_playlists",
        JSON.stringify(defaultPlaylists)
      );
      return defaultPlaylists;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function savePlaylists(playlists: CustomPlaylist[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      "minitube_custom_playlists",
      JSON.stringify(playlists)
    );
  } catch {}
}

export function createPlaylist(
  name: string,
  description: string = "",
  videoIds: number[] = []
): CustomPlaylist {
  const newPlaylist: CustomPlaylist = {
    id: "pl_" + Date.now(),
    name,
    description,
    videoIds,
    createdAt: new Date().toISOString(),
  };
  const list = getPlaylists();
  list.unshift(newPlaylist);
  savePlaylists(list);
  return newPlaylist;
}

export function deletePlaylist(id: string): CustomPlaylist[] {
  const list = getPlaylists().filter((p) => p.id !== id);
  savePlaylists(list);
  return list;
}


