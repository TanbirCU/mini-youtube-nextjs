"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bookmark,
  Play,
  Trash2,
  RefreshCw,
  Video as VideoIcon,
  Search,
  X,
} from "lucide-react";
import VideoGrid from "@/components/video/VideoGrid";
import { API_ENDPOINTS } from "@/lib/api";
import {
  mapBackendVideoToVideo,
  getSavedVideos,
  removeSavedVideo,
  clearSavedVideos,
} from "@/lib/utils";
import { Video } from "@/types/video";

export default function SavedPage() {
  const [savedVideos, setSavedVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const loadSavedVideos = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Get saved video IDs from localStorage
      const savedIds = getSavedVideos();

      if (savedIds.length === 0) {
        setSavedVideos([]);
        setLoading(false);
        return;
      }

      // 2. Fetch all database videos
      const res = await fetch(API_ENDPOINTS.VIDEOS);
      if (!res.ok) {
        throw new Error(`Failed to load videos (status ${res.status})`);
      }

      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        const mapped: Video[] = json.data.map(mapBackendVideoToVideo);
        // Preserve saved order
        const filtered = savedIds
          .map((id) => mapped.find((v) => v.id === id))
          .filter((v): v is Video => Boolean(v));
        setSavedVideos(filtered);
      } else {
        setSavedVideos([]);
      }
    } catch (err: any) {
      console.error("Error loading saved videos:", err);
      setError(err.message || "Failed to load saved videos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedVideos();
  }, []);

  const handleClearAll = () => {
    clearSavedVideos();
    setSavedVideos([]);
    setShowClearConfirm(false);
  };

  const filteredVideos = savedVideos.filter((video) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      video.title.toLowerCase().includes(q) ||
      video.channelName.toLowerCase().includes(q) ||
      video.category.toLowerCase().includes(q)
    );
  });

  const firstVideo = filteredVideos[0];

  return (
    <div className="px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-7 flex flex-col gap-4 border-b border-gray-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-600 shadow-xs">
            <Bookmark size={22} className="fill-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Saved videos
            </h1>
            <p className="text-xs text-gray-500">
              {savedVideos.length}{" "}
              {savedVideos.length === 1 ? "video" : "videos"} saved for later
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        {savedVideos.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative sm:w-60">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search saved videos..."
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

            {/* Play All */}
            {firstVideo && (
              <Link
                href={`/watch/${firstVideo.id}`}
                className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800"
              >
                <Play size={16} className="fill-white" />
                <span>Play all</span>
              </Link>
            )}

            {/* Clear All */}
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-1.5 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-red-600"
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">Clear all</span>
            </button>
          </div>
        )}
      </div>

      {/* Clear Confirmation Modal / Banner */}
      {showClearConfirm && (
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4 animate-in fade-in">
          <div>
            <p className="font-semibold text-red-900 text-sm">
              Remove all saved videos?
            </p>
            <p className="text-xs text-red-700 mt-0.5">
              This will clear all saved videos from your Watch Later playlist.
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
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="aspect-video w-full rounded-xl bg-gray-200" />
              <div className="mt-3 flex gap-3">
                <div className="h-9 w-9 shrink-0 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-5/6 rounded bg-gray-200" />
                  <div className="h-3 w-3/5 rounded bg-gray-200" />
                  <div className="h-3 w-2/5 rounded bg-gray-200" />
                </div>
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
            onClick={loadSavedVideos}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            <RefreshCw size={15} />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Empty State: No saved videos */}
      {!loading && !error && savedVideos.length === 0 && (
        <div className="mx-auto my-16 max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gray-100 text-gray-400">
            <Bookmark size={32} />
          </div>
          <h2 className="mt-4 text-lg font-bold text-gray-900">
            No saved videos yet
          </h2>
          <p className="mt-1 text-sm text-gray-500 leading-6">
            Save videos to watch later by clicking the Save button on any video page.
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
      {!loading && !error && savedVideos.length > 0 && filteredVideos.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-sm font-semibold text-gray-900">
            No saved videos matching &quot;{searchQuery}&quot;
          </p>
          <button
            onClick={() => setSearchQuery("")}
            className="mt-3 text-xs font-semibold text-red-600 hover:underline"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Saved Video Grid */}
      {!loading && !error && filteredVideos.length > 0 && (
        <VideoGrid videos={filteredVideos} />
      )}
    </div>
  );
}