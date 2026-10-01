"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ThumbsUp,
  Play,
  RefreshCw,
  Video as VideoIcon,
  Sparkles,
} from "lucide-react";
import VideoGrid from "@/components/video/VideoGrid";
import { API_ENDPOINTS } from "@/lib/api";
import { mapBackendVideoToVideo, getLikedVideos } from "@/lib/utils";
import { Video } from "@/types/video";

export default function LikedPage() {
  const [likedVideos, setLikedVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLikedVideos = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Get list of liked video IDs
      const likedIds = getLikedVideos();

      // 2. Fetch all database videos
      const res = await fetch(API_ENDPOINTS.VIDEOS);
      if (!res.ok) {
        throw new Error(`Failed to fetch videos (status ${res.status})`);
      }

      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        const mapped: Video[] = json.data.map(mapBackendVideoToVideo);
        const filtered = mapped.filter((v) => likedIds.includes(v.id));
        setLikedVideos(filtered);
      } else {
        setLikedVideos([]);
      }
    } catch (err: any) {
      console.error("Error loading liked videos:", err);
      setError(err.message || "Failed to load liked videos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLikedVideos();
  }, []);

  const firstVideo = likedVideos[0];

  return (
    <div className="px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-600 shadow-xs">
            <ThumbsUp size={22} className="fill-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Liked videos
            </h1>
            <p className="text-xs text-gray-500">
              {likedVideos.length}{" "}
              {likedVideos.length === 1 ? "video" : "videos"} saved
            </p>
          </div>
        </div>

        {/* Play All button if at least 1 video */}
        {firstVideo && (
          <Link
            href={`/watch/${firstVideo.id}`}
            className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800"
          >
            <Play size={16} className="fill-white" />
            <span>Play all</span>
          </Link>
        )}
      </div>

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
            onClick={loadLikedVideos}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            <RefreshCw size={15} />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Empty State: No liked videos */}
      {!loading && !error && likedVideos.length === 0 && (
        <div className="mx-auto my-16 max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gray-100 text-gray-400">
            <ThumbsUp size={32} />
          </div>
          <h2 className="mt-4 text-lg font-bold text-gray-900">
            No liked videos yet
          </h2>
          <p className="mt-1 text-sm text-gray-500 leading-6">
            Videos you like while watching will be collected here so you can easily
            watch them again.
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-red-700"
            >
              <VideoIcon size={16} />
              <span>Discover videos</span>
            </Link>
          </div>
        </div>
      )}

      {/* Liked Video Grid */}
      {!loading && !error && likedVideos.length > 0 && (
        <VideoGrid videos={likedVideos} />
      )}
    </div>
  );
}