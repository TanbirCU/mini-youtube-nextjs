"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  History as HistoryIcon,
  Trash2,
  Search,
  X,
  Play,
  Clock,
  RefreshCw,
  Video as VideoIcon,
} from "lucide-react";
import { API_ENDPOINTS } from "@/lib/api";
import {
  mapBackendVideoToVideo,
  getWatchHistory,
  removeFromWatchHistory,
  clearWatchHistory,
  formatTimeAgo,
  WatchHistoryEntry,
} from "@/lib/utils";
import { Video } from "@/types/video";

interface HistoryVideoItem {
  video: Video;
  watchedAt: number;
}

export default function HistoryPage() {
  const [historyVideos, setHistoryVideos] = useState<HistoryVideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Get raw watch history entries
      const entries: WatchHistoryEntry[] = getWatchHistory();

      if (entries.length === 0) {
        setHistoryVideos([]);
        setLoading(false);
        return;
      }

      // 2. Fetch all database videos
      const res = await fetch(API_ENDPOINTS.VIDEOS);
      if (!res.ok) {
        throw new Error(`Failed to fetch videos (status ${res.status})`);
      }

      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        const allMapped: Video[] = json.data.map(mapBackendVideoToVideo);
        const videoMap = new Map<number, Video>();
        for (const v of allMapped) {
          videoMap.set(v.id, v);
        }

        // Match history entries with real database videos
        const items: HistoryVideoItem[] = [];
        for (const entry of entries) {
          const video = videoMap.get(entry.videoId);
          if (video) {
            items.push({
              video,
              watchedAt: entry.watchedAt,
            });
          }
        }

        setHistoryVideos(items);
      } else {
        setHistoryVideos([]);
      }
    } catch (err: any) {
      console.error("Error loading watch history:", err);
      setError(err.message || "Failed to load watch history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleRemoveItem = (videoId: number) => {
    removeFromWatchHistory(videoId);
    setHistoryVideos((prev) => prev.filter((item) => item.video.id !== videoId));
  };

  const handleClearAll = () => {
    clearWatchHistory();
    setHistoryVideos([]);
    setShowClearConfirm(false);
  };

  // Filter by search query
  const filteredItems = historyVideos.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.video.title.toLowerCase().includes(q) ||
      item.video.channelName.toLowerCase().includes(q) ||
      item.video.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-gray-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-600 shadow-xs">
            <HistoryIcon size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Watch history
            </h1>
            <p className="text-xs text-gray-500">
              {historyVideos.length}{" "}
              {historyVideos.length === 1 ? "video" : "videos"} watched
            </p>
          </div>
        </div>

        {/* Top Controls: Search & Clear Button */}
        {historyVideos.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search watch history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-9 pr-8 text-sm outline-none transition focus:border-gray-900 focus:bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-red-600"
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">Clear all history</span>
            </button>
          </div>
        )}
      </div>

      {/* Clear Confirmation Modal / Banner */}
      {showClearConfirm && (
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4 animate-in fade-in">
          <div>
            <p className="font-semibold text-red-900 text-sm">
              Clear entire watch history?
            </p>
            <p className="text-xs text-red-700 mt-0.5">
              This will remove all videos from your watch history across this device.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowClearConfirm(false)}
              className="rounded-full px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-white/80"
            >
              Cancel
            </button>
            <button
              onClick={handleClearAll}
              className="rounded-full bg-red-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-red-700"
            >
              Clear history
            </button>
          </div>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div className="mt-6 space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex animate-pulse gap-4 rounded-2xl border border-gray-100 p-3"
            >
              <div className="aspect-video w-48 rounded-xl bg-gray-200 shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 w-3/4 rounded bg-gray-200" />
                <div className="h-3 w-1/3 rounded bg-gray-200" />
                <div className="h-3 w-1/4 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error Banner */}
      {!loading && error && (
        <div className="mx-auto my-12 max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center shadow-sm">
          <p className="text-sm font-semibold text-red-700">{error}</p>
          <button
            onClick={loadHistory}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            <RefreshCw size={15} />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Empty State: History is empty */}
      {!loading && !error && historyVideos.length === 0 && (
        <div className="mx-auto my-16 max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gray-100 text-gray-400">
            <Clock size={32} />
          </div>
          <h2 className="mt-4 text-lg font-bold text-gray-900">
            Keep track of what you watch
          </h2>
          <p className="mt-1 text-sm text-gray-500 leading-6">
            Watch history isn&apos;t viewable when cleared or when you haven&apos;t
            watched any videos yet.
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-red-700"
            >
              <VideoIcon size={16} />
              <span>Explore videos</span>
            </Link>
          </div>
        </div>
      )}

      {/* Search Filtered Empty State */}
      {!loading && !error && historyVideos.length > 0 && filteredItems.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-sm font-semibold text-gray-900">
            No history found matching &quot;{searchQuery}&quot;
          </p>
          <button
            onClick={() => setSearchQuery("")}
            className="mt-3 text-xs font-semibold text-red-600 hover:underline"
          >
            Clear search
          </button>
        </div>
      )}

      {/* History Items List (Horizontal rows like YouTube) */}
      {!loading && !error && filteredItems.length > 0 && (
        <div className="mt-6 space-y-4">
          {filteredItems.map(({ video, watchedAt }) => {
            const initial = video.channelName
              ? video.channelName.charAt(0).toUpperCase()
              : "U";

            return (
              <div
                key={video.id}
                className="group relative flex flex-col gap-4 rounded-2xl border border-transparent p-2.5 transition hover:border-gray-200 hover:bg-gray-50/80 sm:flex-row sm:items-start"
              >
                {/* Thumbnail */}
                <Link
                  href={`/watch/${video.id}`}
                  className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-gray-200 sm:w-60"
                >
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  {video.duration && (
                    <span className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                      {video.duration}
                    </span>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition group-hover:opacity-100">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white shadow-lg">
                      <Play size={18} className="ml-0.5 fill-white" />
                    </div>
                  </div>
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0 pr-8">
                  <Link href={`/watch/${video.id}`}>
                    <h3 className="line-clamp-2 text-base font-semibold leading-snug text-gray-900 transition hover:text-red-600">
                      {video.title}
                    </h3>
                  </Link>

                  <div className="mt-2 flex items-center gap-2">
                    <Link
                      href={`/channel/${video.channelId}`}
                      className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-900"
                    >
                      {video.channelAvatar ? (
                        <img
                          src={video.channelAvatar}
                          alt={video.channelName}
                          className="h-4 w-4 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white">
                          {initial}
                        </div>
                      )}
                      <span>{video.channelName}</span>
                    </Link>

                    <span className="text-gray-300">•</span>
                    <span className="text-xs text-gray-500">
                      {video.views} views
                    </span>
                  </div>

                  {video.description && (
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-500">
                      {video.description}
                    </p>
                  )}

                  <p className="mt-2 text-[11px] font-medium text-gray-400">
                    Watched {formatTimeAgo(new Date(watchedAt).toISOString())}
                  </p>
                </div>

                {/* Remove single video button */}
                <button
                  type="button"
                  onClick={() => handleRemoveItem(video.id)}
                  title="Remove from watch history"
                  className="absolute right-3 top-3 rounded-full p-2 text-gray-400 opacity-0 transition hover:bg-gray-200 hover:text-red-600 group-hover:opacity-100"
                >
                  <X size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}