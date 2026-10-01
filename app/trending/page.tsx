"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Flame, RefreshCw, Upload, Video as VideoIcon } from "lucide-react";
import VideoGrid from "@/components/video/VideoGrid";
import { API_ENDPOINTS } from "@/lib/api";
import { mapBackendVideoToVideo } from "@/lib/utils";
import { Video } from "@/types/video";

const TIME_FILTERS = ["All", "Today", "This week", "This month"] as const;
type TimeFilter = (typeof TIME_FILTERS)[number];

export default function TrendingPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<TimeFilter>("All");

  const fetchTrendingVideos = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_ENDPOINTS.VIDEOS}?sort=views`);
      if (!res.ok) {
        throw new Error(`Failed to fetch trending videos (status ${res.status})`);
      }

      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        const mapped = json.data.map(mapBackendVideoToVideo);
        // Sort by views descending
        const sorted = mapped.sort((a: Video, b: Video) => b.views - a.views);
        setVideos(sorted);
      } else {
        setVideos([]);
      }
    } catch (err: any) {
      console.error("Error loading trending videos:", err);
      setError(err.message || "Could not load trending videos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingVideos();
  }, []);

  // Filter based on active time filter
  const filteredVideos = videos.filter((video) => {
    if (activeFilter === "All") return true;

    const uploadedText = video.uploadedAt.toLowerCase();

    if (activeFilter === "Today") {
      return (
        uploadedText.includes("just now") ||
        uploadedText.includes("min") ||
        uploadedText.includes("hour") ||
        uploadedText.includes("today") ||
        uploadedText.includes("1 day")
      );
    }

    if (activeFilter === "This week") {
      return (
        uploadedText.includes("just now") ||
        uploadedText.includes("min") ||
        uploadedText.includes("hour") ||
        uploadedText.includes("day") ||
        uploadedText.includes("1 week")
      );
    }

    if (activeFilter === "This month") {
      return (
        !uploadedText.includes("year") &&
        (!uploadedText.includes("month") || uploadedText.includes("1 month"))
      );
    }

    return true;
  });

  return (
    <div className="px-4 py-6 sm:px-6">
      {/* Page Header */}
      <div className="mb-7">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 shadow-xs">
            <Flame size={24} className="fill-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Trending
            </h1>
            <p className="text-xs text-gray-500">
              Most viewed and popular videos right now
            </p>
          </div>
        </div>

        {/* Time / Category Filter Tabs */}
        <div className="mt-5 flex gap-2.5 overflow-x-auto no-scrollbar">
          {TIME_FILTERS.map((item) => {
            const isActive = activeFilter === item;
            return (
              <button
                key={item}
                onClick={() => setActiveFilter(item)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gray-900 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
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
            onClick={fetchTrendingVideos}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            <RefreshCw size={15} />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Empty State: No videos in database */}
      {!loading && !error && videos.length === 0 && (
        <div className="mx-auto my-16 max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
            <VideoIcon size={32} />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            No trending videos yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Videos uploaded to MiniTube will appear here as they gain views.
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

      {/* Filtered Empty State */}
      {!loading && !error && videos.length > 0 && filteredVideos.length === 0 && (
        <div className="mx-auto my-16 max-w-md text-center">
          <h3 className="text-base font-semibold text-gray-900">
            No videos found for &quot;{activeFilter}&quot;
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Check back later or view all trending videos.
          </p>
          <div className="mt-4">
            <button
              onClick={() => setActiveFilter("All")}
              className="rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              View all
            </button>
          </div>
        </div>
      )}

      {/* Video Grid */}
      {!loading && !error && filteredVideos.length > 0 && (
        <VideoGrid videos={filteredVideos} />
      )}
    </div>
  );
}