"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Upload,
  UserCircle,
  Video as VideoIcon,
  PlaySquare,
  Info,
  SlidersHorizontal,
  Lock,
  Play,
  Trash2,
  X,
  Eye,
  Calendar,
  Loader2,
} from "lucide-react";
import { API_ENDPOINTS, API_BASE_URL } from "@/lib/api";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

interface UploadedVideo {
  id: number;
  user_id: number;
  category_id: number;
  title: string;
  description: string;
  filename: string;
  video_path: string;
  thumbnail?: string;
  views: number;
  created_at: string;
  category?: {
    id: number;
    name: string;
  };
}

export default function ChannelPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"videos" | "playlists" | "about">(
    "videos"
  );

  // User uploaded videos
  const [videos, setVideos] = useState<UploadedVideo[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [activeVideoToPlay, setActiveVideoToPlay] =
    useState<UploadedVideo | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Load user profile & videos
  useEffect(() => {
    async function loadUserProfileAndVideos() {
      try {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }

        let currentUser: UserProfile | null = null;
        if (storedUser) {
          currentUser = JSON.parse(storedUser);
          setUser(currentUser);
        }

        // Fetch fresh profile from API /api/me
        const res = await fetch(API_ENDPOINTS.ME, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            currentUser = data.user;
            setUser(data.user);
            localStorage.setItem("user", JSON.stringify(data.user));
          }
        }

        // Fetch videos from API
        if (currentUser) {
          setLoadingVideos(true);
          const videosRes = await fetch(API_ENDPOINTS.VIDEOS);
          if (videosRes.ok) {
            const videoData = await videosRes.json();
            if (videoData.data && Array.isArray(videoData.data)) {
              // Filter videos uploaded by current user
              const myVideos = videoData.data.filter(
                (v: any) =>
                  Number(v.user_id) === Number(currentUser?.id) ||
                  Number(v.user?.id) === Number(currentUser?.id)
              );
              setVideos(myVideos);
            }
          }
        }
      } catch (err) {
        console.error("Error loading channel profile or videos:", err);
      } finally {
        setLoading(false);
        setLoadingVideos(false);
      }
    }

    loadUserProfileAndVideos();
  }, []);

  const handleDeleteVideo = async (videoId: number) => {
    if (!window.confirm("Are you sure you want to delete this video?")) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    setDeletingId(videoId);
    try {
      const res = await fetch(`${API_ENDPOINTS.VIDEOS}/${videoId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setVideos((prev) => prev.filter((v) => v.id !== videoId));
        if (activeVideoToPlay?.id === videoId) {
          setActiveVideoToPlay(null);
        }
      } else {
        const data = await res.json();
        alert(data.message || "Could not delete video");
      }
    } catch (err) {
      console.error("Error deleting video:", err);
      alert("Failed to delete video");
    } finally {
      setDeletingId(null);
    }
  };

  const getInitial = (name?: string, email?: string) => {
    if (name && name.trim()) {
      return name.trim().charAt(0).toUpperCase();
    }
    if (email && email.trim()) {
      return email.trim().charAt(0).toUpperCase();
    }
    return "U";
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
      </div>
    );
  }

  // If user is not logged in, show sign-in prompt
  if (!user) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-4 py-16 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-600">
          <Lock size={36} />
        </div>

        <h1 className="mt-6 text-2xl font-bold text-gray-900">
          Sign in to view your channel
        </h1>

        <p className="mt-2 max-w-sm text-sm text-gray-500">
          Sign in to upload videos, create playlists, customize your profile, and manage your content.
        </p>

        <Link
          href="/login"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
        >
          <UserCircle size={18} />
          <span>Sign in</span>
        </Link>
      </div>
    );
  }

  const handle = `@${user.name.toLowerCase().replace(/[^a-z0-9]/g, "")}`;

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-4 sm:px-8">
      {/* Video Player Modal */}
      {activeVideoToPlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-black shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between bg-zinc-900 px-5 py-3 text-white">
              <h3 className="truncate font-semibold">{activeVideoToPlay.title}</h3>
              <button
                onClick={() => setActiveVideoToPlay(null)}
                className="rounded-full p-1 text-gray-400 hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Video element streaming directly from Go backend */}
            <div className="relative aspect-video w-full bg-black">
              <video
                src={`${API_BASE_URL}/videos/${activeVideoToPlay.id}/stream`}
                controls
                autoPlay
                className="h-full w-full object-contain"
              />
            </div>

            {/* Modal Footer info */}
            <div className="bg-zinc-900 p-4 text-sm text-zinc-300">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-lg bg-white/10 px-2.5 py-1 text-xs text-white">
                  {activeVideoToPlay.category?.name || "General"}
                </span>
                <span className="text-xs text-zinc-400">
                  Uploaded on{" "}
                  {new Date(activeVideoToPlay.created_at).toLocaleDateString()}
                </span>
              </div>
              {activeVideoToPlay.description && (
                <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                  {activeVideoToPlay.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Channel Banner */}
      <div className="relative h-36 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 sm:h-52">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
        <div className="absolute bottom-4 right-4 hidden sm:block">
          <Link
            href="/upload"
            className="flex items-center gap-2 rounded-xl bg-white/90 px-4 py-2 text-xs font-semibold text-gray-800 shadow backdrop-blur transition hover:bg-white"
          >
            <Upload size={14} />
            <span>Upload video</span>
          </Link>
        </div>
      </div>

      {/* Channel Info Header */}
      <div className="flex flex-col gap-6 py-6 sm:flex-row sm:items-center">
        {/* Avatar */}
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-4 border-white bg-red-600 text-3xl font-bold text-white shadow-md sm:h-28 sm:w-28 sm:text-4xl">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <span>{getInitial(user.name, user.email)}</span>
          )}
        </div>

        {/* Details */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {user.name}
          </h1>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <span className="font-medium text-gray-700">{handle}</span>
            <span>•</span>
            <span>{user.email}</span>
            <span>•</span>
            <span>0 subscribers</span>
            <span>•</span>
            <span className="font-semibold text-gray-800">
              {videos.length} {videos.length === 1 ? "video" : "videos"}
            </span>
          </div>

          <p className="mt-2 text-sm text-gray-600">
            Welcome to {user.name}&apos;s channel! Start sharing videos with the community.
          </p>

          {/* Action buttons */}
          <div className="mt-4 flex flex-wrap gap-2.5">
            <Link
              href="/upload"
              className="flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              <Upload size={16} />
              <span>Upload video</span>
            </Link>

            <button
              onClick={() => setActiveTab("about")}
              className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
            >
              <SlidersHorizontal size={16} />
              <span>Channel details</span>
            </button>
          </div>
        </div>
      </div>

      {/* Channel Navigation Tabs */}
      <div className="flex gap-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("videos")}
          className={`flex items-center gap-2 pb-3.5 text-sm font-medium transition ${
            activeTab === "videos"
              ? "border-b-2 border-gray-900 font-semibold text-gray-900"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          <VideoIcon size={16} />
          <span>Videos ({videos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("playlists")}
          className={`flex items-center gap-2 pb-3.5 text-sm font-medium transition ${
            activeTab === "playlists"
              ? "border-b-2 border-gray-900 font-semibold text-gray-900"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          <PlaySquare size={16} />
          <span>Playlists</span>
        </button>

        <button
          onClick={() => setActiveTab("about")}
          className={`flex items-center gap-2 pb-3.5 text-sm font-medium transition ${
            activeTab === "about"
              ? "border-b-2 border-gray-900 font-semibold text-gray-900"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          <Info size={16} />
          <span>About</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="py-8">
        {activeTab === "videos" && (
          <div>
            {loadingVideos ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={32} className="animate-spin text-gray-400" />
              </div>
            ) : videos.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                  <VideoIcon size={32} />
                </div>

                <h3 className="mt-4 text-base font-semibold text-gray-900">
                  Upload a video to get started
                </h3>

                <p className="mt-1 max-w-sm text-sm text-gray-500">
                  Start sharing your creations with viewers. Videos you upload will show up here.
                </p>

                <Link
                  href="/upload"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
                >
                  <Upload size={16} />
                  <span>Upload video</span>
                </Link>
              </div>
            ) : (
              /* Grid of User Uploaded Videos */
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:shadow-md"
                  >
                    {/* Video preview / thumbnail */}
                    <div
                      onClick={() => setActiveVideoToPlay(video)}
                      className="relative aspect-video w-full cursor-pointer overflow-hidden bg-gray-900"
                    >
                      <video
                        src={`${API_BASE_URL}/videos/${video.id}/stream#t=0.5`}
                        preload="metadata"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />

                      {/* Play overlay button */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition group-hover:opacity-100">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-lg">
                          <Play size={22} className="ml-1 fill-white" />
                        </div>
                      </div>

                      {/* Category Badge */}
                      {video.category?.name && (
                        <span className="absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                          {video.category.name}
                        </span>
                      )}
                    </div>

                    {/* Video Info */}
                    <div className="flex flex-1 flex-col justify-between p-4">
                      <div>
                        <h4
                          onClick={() => setActiveVideoToPlay(video)}
                          className="line-clamp-2 cursor-pointer font-semibold text-gray-900 hover:text-red-600"
                          title={video.title}
                        >
                          {video.title}
                        </h4>

                        {video.description && (
                          <p className="mt-1 line-clamp-1 text-xs text-gray-500">
                            {video.description}
                          </p>
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Eye size={13} />
                          <span>{video.views} views</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <Calendar size={13} />
                            <span>
                              {new Date(video.created_at).toLocaleDateString()}
                            </span>
                          </span>

                          {/* Delete Action */}
                          <button
                            onClick={() => handleDeleteVideo(video.id)}
                            disabled={deletingId === video.id}
                            title="Delete video"
                            className="rounded-lg p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                          >
                            {deletingId === video.id ? (
                              <Loader2 size={15} className="animate-spin text-red-600" />
                            ) : (
                              <Trash2 size={15} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "playlists" && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <PlaySquare size={32} />
            </div>

            <h3 className="mt-4 text-base font-semibold text-gray-900">
              No playlists created yet
            </h3>

            <p className="mt-1 max-w-sm text-sm text-gray-500">
              Playlists you create or save will be visible here.
            </p>
          </div>
        )}

        {activeTab === "about" && (
          <div className="max-w-xl rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900">Channel details</h3>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Channel Name</span>
                <span className="font-medium text-gray-900">{user.name}</span>
              </div>

              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Handle</span>
                <span className="font-medium text-gray-900">{handle}</span>
              </div>

              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Email</span>
                <span className="font-medium text-gray-900">{user.email}</span>
              </div>

              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">User ID</span>
                <span className="font-medium text-gray-900">#{user.id}</span>
              </div>

              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Total Uploaded Videos</span>
                <span className="font-medium text-gray-900">{videos.length}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
