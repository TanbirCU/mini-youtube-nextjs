"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search as SearchIcon,
  Play,
  SlidersHorizontal,
  Flame,
  Clock,
  RefreshCw,
  Video as VideoIcon,
} from "lucide-react";
import { API_ENDPOINTS } from "@/lib/api";
import { mapBackendVideoToVideo } from "@/lib/utils";
import { Video } from "@/types/video";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"relevance" | "views" | "date">("relevance");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const fetchSearchResults = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all videos from database
      const res = await fetch(API_ENDPOINTS.VIDEOS);
      if (!res.ok) {
        throw new Error(`Failed to load search results (status ${res.status})`);
      }

      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        const all: Video[] = json.data.map(mapBackendVideoToVideo);

        // If query is provided, filter across title, channelName, category, description
        if (query.trim()) {
          const q = query.toLowerCase().trim();
          const filtered = all.filter((video) => {
            const haystack = `${video.title} ${video.channelName} ${video.category} ${video.description}`.toLowerCase();
            return haystack.includes(q);
          });
          setVideos(filtered);
        } else {
          setVideos(all);
        }
      } else {
        setVideos([]);
      }
    } catch (err: any) {
      console.error("Search error:", err);
      setError(err.message || "Failed to load search results");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearchResults();
  }, [query]);

  // Extract unique categories from results
  const categories = ["All", ...Array.from(new Set(videos.map((v) => v.category)))];

  // Apply category filter and sorting
  let processedVideos = [...videos];

  if (selectedCategory !== "All") {
    processedVideos = processedVideos.filter(
      (v) => v.category.toLowerCase() === selectedCategory.toLowerCase()
    );
  }

  if (sortBy === "views") {
    processedVideos.sort((a, b) => b.views - a.views);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      {/* Search Header */}
      <div className="mb-6 flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            {query ? (
              <>
                Search results for <span className="text-red-600">&quot;{query}&quot;</span>
              </>
            ) : (
              "All Videos"
            )}
          </h1>
          <p className="mt-1 text-xs text-gray-500">
            {processedVideos.length}{" "}
            {processedVideos.length === 1 ? "video" : "videos"} found
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-gray-400" />
          <span className="text-xs font-semibold text-gray-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 outline-none transition focus:border-gray-900"
          >
            <option value="relevance">Relevance</option>
            <option value="views">Most Viewed</option>
            <option value="date">Upload Date</option>
          </select>
        </div>
      </div>

      {/* Category Chips Filter */}
      {categories.length > 2 && (
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-1 text-xs font-semibold transition ${
                selectedCategory === cat
                  ? "bg-gray-900 text-white shadow-xs"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div className="space-y-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex animate-pulse flex-col gap-4 rounded-2xl border border-gray-100 p-3 sm:flex-row"
            >
              <div className="aspect-video w-full rounded-xl bg-gray-200 sm:w-72 shrink-0" />
              <div className="flex-1 space-y-2.5 py-1">
                <div className="h-5 w-4/5 rounded bg-gray-200" />
                <div className="h-3 w-1/3 rounded bg-gray-200" />
                <div className="h-3 w-1/4 rounded bg-gray-200" />
                <div className="h-10 w-full rounded bg-gray-100 mt-2" />
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
            onClick={fetchSearchResults}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            <RefreshCw size={15} />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && processedVideos.length === 0 && (
        <div className="mx-auto my-16 max-w-md rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-xs">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
            <SearchIcon size={32} />
          </div>
          <h2 className="mt-4 text-lg font-bold text-gray-900">
            No results found for &quot;{query}&quot;
          </h2>
          <p className="mt-1 text-xs text-gray-500 leading-relaxed">
            Try different keywords or check spelling.
          </p>

          <div className="mt-5 rounded-2xl bg-gray-50 p-4 text-left text-xs text-gray-600 space-y-1.5">
            <p className="font-semibold text-gray-900">Suggestions:</p>
            <p>• Make sure all words are spelled correctly.</p>
            <p>• Try different or more general keywords.</p>
            <p>• Try fewer keywords.</p>
          </div>

          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
            >
              <VideoIcon size={16} />
              <span>Browse All Videos</span>
            </Link>
          </div>
        </div>
      )}

      {/* Search Results List */}
      {!loading && !error && processedVideos.length > 0 && (
        <div className="space-y-4">
          {processedVideos.map((video) => {
            const initial = video.channelName
              ? video.channelName.charAt(0).toUpperCase()
              : "U";

            return (
              <div
                key={video.id}
                className="group relative flex flex-col gap-4 rounded-2xl border border-transparent p-3 transition hover:border-gray-200 hover:bg-gray-50/80 sm:flex-row sm:items-start"
              >
                {/* Thumbnail */}
                <Link
                  href={`/watch/${video.id}`}
                  className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-gray-200 sm:w-80"
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
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600 text-white shadow-lg">
                      <Play size={20} className="ml-0.5 fill-white" />
                    </div>
                  </div>
                </Link>

                {/* Video Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/watch/${video.id}`}>
                    <h2 className="line-clamp-2 text-base font-semibold leading-snug text-gray-900 transition hover:text-red-600 sm:text-lg">
                      {video.title}
                    </h2>
                  </Link>

                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                    <span>{video.views.toLocaleString()} views</span>
                    <span>•</span>
                    <span>{video.uploadedAt}</span>
                    {video.category && (
                      <>
                        <span>•</span>
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-700">
                          {video.category}
                        </span>
                      </>
                    )}
                  </div>

                  <Link
                    href={`/channel/${video.channelId}`}
                    className="mt-3 flex items-center gap-2.5 text-xs font-medium text-gray-600 hover:text-gray-900"
                  >
                    {video.channelAvatar ? (
                      <img
                        src={video.channelAvatar}
                        alt={video.channelName}
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                        {initial}
                      </div>
                    )}
                    <span>{video.channelName}</span>
                  </Link>

                  {video.description && (
                    <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-gray-500">
                      {video.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl px-4 py-12 text-center text-sm text-gray-500">
          Loading search results...
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}