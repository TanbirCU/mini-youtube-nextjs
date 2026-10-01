"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ListMusic,
  Plus,
  Play,
  Trash2,
  ThumbsUp,
  Bookmark,
  History,
  X,
  Check,
  Film,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import VideoGrid from "@/components/video/VideoGrid";
import { API_ENDPOINTS } from "@/lib/api";
import {
  mapBackendVideoToVideo,
  getPlaylists,
  createPlaylist,
  deletePlaylist,
  getLikedVideos,
  getSavedVideos,
  getWatchHistory,
  CustomPlaylist,
} from "@/lib/utils";
import { Video } from "@/types/video";

export default function PlaylistsPage() {
  const [allVideos, setAllVideos] = useState<Video[]>([]);
  const [playlists, setPlaylists] = useState<CustomPlaylist[]>([]);
  const [likedCount, setLikedCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [historyCount, setHistoryCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New playlist modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [selectedVideoIds, setSelectedVideoIds] = useState<number[]>([]);

  // Selected playlist view (if user clicks into a playlist)
  const [activePlaylist, setActivePlaylist] = useState<CustomPlaylist | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // System playlist counts
      setLikedCount(getLikedVideos().length);
      setSavedCount(getSavedVideos().length);
      setHistoryCount(getWatchHistory().length);

      // Custom playlists
      setPlaylists(getPlaylists());

      // Fetch all database videos
      const res = await fetch(API_ENDPOINTS.VIDEOS);
      if (!res.ok) {
        throw new Error(`Failed to load videos (status ${res.status})`);
      }

      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        const mapped: Video[] = json.data.map(mapBackendVideoToVideo);
        setAllVideos(mapped);
      } else {
        setAllVideos([]);
      }
    } catch (err: any) {
      console.error("Error loading playlists:", err);
      setError(err.message || "Failed to load playlists");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created = createPlaylist(
      newTitle.trim(),
      newDescription.trim(),
      selectedVideoIds
    );
    setPlaylists((prev) => [created, ...prev]);

    // Reset modal
    setNewTitle("");
    setNewDescription("");
    setSelectedVideoIds([]);
    setIsModalOpen(false);
  };

  const handleDeletePlaylist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deletePlaylist(id);
    setPlaylists(updated);
    if (activePlaylist?.id === id) {
      setActivePlaylist(null);
    }
  };

  const toggleVideoSelection = (videoId: number) => {
    setSelectedVideoIds((prev) =>
      prev.includes(videoId)
        ? prev.filter((id) => id !== videoId)
        : [...prev, videoId]
    );
  };

  // Helper to get preview thumbnail for a playlist
  const getPlaylistThumbnail = (videoIds: number[]) => {
    if (videoIds.length > 0) {
      const match = allVideos.find((v) => v.id === videoIds[0]);
      if (match?.thumbnail) return match.thumbnail;
    }
    return allVideos[0]?.thumbnail || "";
  };

  const likedThumbnail = getPlaylistThumbnail(getLikedVideos());
  const savedThumbnail = getPlaylistThumbnail(getSavedVideos());

  // If viewing a specific playlist
  if (activePlaylist) {
    const playlistVideos = activePlaylist.videoIds
      .map((id) => allVideos.find((v) => v.id === id))
      .filter((v): v is Video => Boolean(v));

    const firstId = playlistVideos[0]?.id;

    return (
      <div className="px-4 py-6 sm:px-6">
        <button
          onClick={() => setActivePlaylist(null)}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          <span>Back to all playlists</span>
        </button>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {activePlaylist.name}
            </h1>
            {activePlaylist.description && (
              <p className="mt-1 text-sm text-gray-500">
                {activePlaylist.description}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-400">
              {playlistVideos.length}{" "}
              {playlistVideos.length === 1 ? "video" : "videos"}
            </p>
          </div>

          {firstId && (
            <Link
              href={`/watch/${firstId}`}
              className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800"
            >
              <Play size={16} className="fill-white" />
              <span>Play all</span>
            </Link>
          )}
        </div>

        {playlistVideos.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            No videos in this playlist yet.
          </div>
        ) : (
          <VideoGrid videos={playlistVideos} />
        )}
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-600 shadow-xs">
            <ListMusic size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Playlists
            </h1>
            <p className="text-xs text-gray-500">
              Your saved collections &amp; custom playlists
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 active:scale-95"
        >
          <Plus size={18} />
          <span>New playlist</span>
        </button>
      </div>

      {/* Error state */}
      {!loading && error && (
        <div className="mx-auto my-8 max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm font-semibold text-red-700">{error}</p>
          <button
            onClick={loadData}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-1.5 text-xs font-medium text-white"
          >
            <RefreshCw size={14} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Section 1: System Playlists */}
      <div className="mb-10">
        <h2 className="mb-4 text-base font-bold text-gray-900">
          Built-in Collections
        </h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Liked Videos Card */}
          <Link
            href="/liked"
            className="group relative flex overflow-hidden rounded-2xl border border-gray-100 bg-white p-3 shadow-xs transition hover:shadow-md hover:border-gray-200"
          >
            <div className="relative aspect-video w-36 shrink-0 overflow-hidden rounded-xl bg-gray-900">
              {likedThumbnail ? (
                <img
                  src={likedThumbnail}
                  alt="Liked videos"
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-800 text-gray-400">
                  <ThumbsUp size={24} />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
                <Play size={20} className="fill-white text-white" />
              </div>
            </div>

            <div className="ml-3.5 flex flex-1 flex-col justify-center">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600">
                <ThumbsUp size={13} />
                <span>Collection</span>
              </div>
              <h3 className="mt-1 font-bold text-gray-900 text-sm group-hover:text-red-600">
                Liked videos
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                {likedCount} {likedCount === 1 ? "video" : "videos"}
              </p>
            </div>
          </Link>

          {/* Watch Later / Saved Videos Card */}
          <Link
            href="/saved"
            className="group relative flex overflow-hidden rounded-2xl border border-gray-100 bg-white p-3 shadow-xs transition hover:shadow-md hover:border-gray-200"
          >
            <div className="relative aspect-video w-36 shrink-0 overflow-hidden rounded-xl bg-gray-900">
              {savedThumbnail ? (
                <img
                  src={savedThumbnail}
                  alt="Saved videos"
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-800 text-gray-400">
                  <Bookmark size={24} />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
                <Play size={20} className="fill-white text-white" />
              </div>
            </div>

            <div className="ml-3.5 flex flex-1 flex-col justify-center">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                <Bookmark size={13} />
                <span>Collection</span>
              </div>
              <h3 className="mt-1 font-bold text-gray-900 text-sm group-hover:text-emerald-600">
                Saved videos
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                {savedCount} {savedCount === 1 ? "video" : "videos"}
              </p>
            </div>
          </Link>

          {/* Watch History Card */}
          <Link
            href="/history"
            className="group relative flex overflow-hidden rounded-2xl border border-gray-100 bg-white p-3 shadow-xs transition hover:shadow-md hover:border-gray-200"
          >
            <div className="relative aspect-video w-36 shrink-0 overflow-hidden rounded-xl bg-gray-800 flex items-center justify-center text-gray-300">
              <History size={26} />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
                <Play size={20} className="fill-white text-white" />
              </div>
            </div>

            <div className="ml-3.5 flex flex-1 flex-col justify-center">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600">
                <History size={13} />
                <span>Activity</span>
              </div>
              <h3 className="mt-1 font-bold text-gray-900 text-sm group-hover:text-indigo-600">
                Watch history
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                {historyCount} {historyCount === 1 ? "video" : "videos"}
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Section 2: Custom Playlists */}
      <div>
        <h2 className="mb-4 text-base font-bold text-gray-900">
          Created Playlists ({playlists.length})
        </h2>

        {playlists.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-200 p-12 text-center">
            <Film size={32} className="mx-auto text-gray-400" />
            <h3 className="mt-3 text-base font-semibold text-gray-900">
              No custom playlists yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Group videos into playlists for easy viewing or sharing.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              <Plus size={16} />
              <span>Create your first playlist</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {playlists.map((playlist) => {
              const thumbnail = getPlaylistThumbnail(playlist.videoIds);

              return (
                <div
                  key={playlist.id}
                  onClick={() => setActivePlaylist(playlist)}
                  className="group cursor-pointer min-w-0"
                >
                  {/* Stacked Playlist Preview Banner */}
                  <div className="relative aspect-video overflow-hidden rounded-2xl bg-gray-100 shadow-xs">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={playlist.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-800 text-gray-400">
                        <ListMusic size={32} />
                      </div>
                    )}

                    {/* Stacked Pill badge */}
                    <div className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-lg bg-black/80 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                      <ListMusic size={13} />
                      <span>{playlist.videoIds.length} videos</span>
                    </div>

                    {/* Hover Play All Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition duration-200 group-hover:opacity-100">
                      <div className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-gray-900 shadow-md backdrop-blur-xs">
                        <Play size={14} className="fill-gray-900" />
                        <span>View Playlist</span>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="mt-3 flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-gray-900 text-sm group-hover:text-red-600">
                        {playlist.name}
                      </h3>
                      {playlist.description && (
                        <p className="mt-0.5 truncate text-xs text-gray-500">
                          {playlist.description}
                        </p>
                      )}
                      <p className="mt-0.5 text-xs text-gray-400">
                        Updated recently
                      </p>
                    </div>

                    <button
                      onClick={(e) => handleDeletePlaylist(playlist.id, e)}
                      title="Delete playlist"
                      className="rounded-full p-1.5 text-gray-400 opacity-0 transition hover:bg-gray-100 hover:text-red-600 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Playlist Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="text-lg font-bold text-gray-900">
                Create new playlist
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePlaylist} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                  Playlist Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Chill Beats, Coding Tutorials"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                  Description (optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="What is this playlist about?"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-2 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
              </div>

              {/* Add Initial Videos from Database */}
              {allVideos.length > 0 && (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                    Add videos ({selectedVideoIds.length} selected)
                  </label>
                  <div className="max-h-48 overflow-y-auto rounded-xl border border-gray-200 p-2 space-y-1.5 no-scrollbar">
                    {allVideos.map((video) => {
                      const isSelected = selectedVideoIds.includes(video.id);

                      return (
                        <div
                          key={video.id}
                          onClick={() => toggleVideoSelection(video.id)}
                          className={`flex cursor-pointer items-center justify-between rounded-lg p-2 text-xs transition ${
                            isSelected
                              ? "bg-red-50 text-red-900 font-medium"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <img
                              src={video.thumbnail}
                              alt={video.title}
                              className="h-8 w-14 shrink-0 rounded object-cover"
                            />
                            <span className="truncate">{video.title}</span>
                          </div>

                          <div
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                              isSelected
                                ? "border-red-600 bg-red-600 text-white"
                                : "border-gray-300"
                            }`}
                          >
                            {isSelected && <Check size={12} />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}