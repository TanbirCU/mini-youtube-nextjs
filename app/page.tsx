"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Upload, Video as VideoIcon } from "lucide-react";
import CategoryBar from "@/components/home/CategoryBar";
import VideoGrid from "@/components/video/VideoGrid";
import { API_ENDPOINTS } from "@/lib/api";
import { mapBackendVideoToVideo } from "@/lib/utils";
import { Video } from "@/types/video";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(API_ENDPOINTS.VIDEOS);

      if (!res.ok) {
        throw new Error(`Failed to fetch videos (status ${res.status})`);
      }

      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        const mappedVideos = json.data.map(mapBackendVideoToVideo);
        setVideos(mappedVideos);
      } else {
        setVideos([]);
      }
    } catch (err: any) {
      console.error("Error loading videos from database:", err);
      setError(err.message || "Could not load videos from database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const filteredVideos =
    selectedCategory.toLowerCase() === "all"
      ? videos
      : videos.filter(
          (video) =>
            video.category.toLowerCase().trim() ===
            selectedCategory.toLowerCase().trim()
        );

  return (
    <div>
      <CategoryBar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <div className="px-4 py-6 sm:px-6">
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

        {/* Error State */}
        {!loading && error && (
          <div className="mx-auto my-12 max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertCircle size={24} />
            </div>
            <h3 className="mt-3 text-base font-semibold text-gray-900">
              Failed to load videos
            </h3>
            <p className="mt-1 text-sm text-gray-600">{error}</p>
            <button
              onClick={fetchVideos}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              <RefreshCw size={16} />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Empty State: Database has no videos at all */}
        {!loading && !error && videos.length === 0 && (
          <div className="mx-auto my-16 max-w-md text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <VideoIcon size={32} />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              No videos in database
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Be the first to upload a video to MiniTube!
            </p>
            <div className="mt-6">
              <Link
                href="/upload"
                className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-red-700"
              >
                <Upload size={16} />
                <span>Upload Video</span>
              </Link>
            </div>
          </div>
        )}

        {/* Filtered Empty State: Category has no matches */}
        {!loading && !error && videos.length > 0 && filteredVideos.length === 0 && (
          <div className="mx-auto my-16 max-w-md text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <VideoIcon size={28} />
            </div>
            <h3 className="mt-4 text-base font-semibold text-gray-900">
              No videos in &quot;{selectedCategory}&quot;
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Try selecting another category or view all videos.
            </p>
            <div className="mt-5">
              <button
                onClick={() => setSelectedCategory("All")}
                className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                View all videos
              </button>
            </div>
          </div>
        )}

        {/* Video Grid */}
        {!loading && !error && filteredVideos.length > 0 && (
          <VideoGrid videos={filteredVideos} />
        )}
      </div>
    </div>
  );
}
