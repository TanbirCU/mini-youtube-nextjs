"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Tv,
  RefreshCw,
  Sparkles,
  Check,
  Video as VideoIcon,
  Bell,
} from "lucide-react";
import VideoGrid from "@/components/video/VideoGrid";
import SubscribeButton from "@/components/video/SubscribeButton";
import { API_ENDPOINTS } from "@/lib/api";
import { mapBackendVideoToVideo } from "@/lib/utils";
import { Video } from "@/types/video";

interface CreatorChannel {
  id: number;
  name: string;
  avatar?: string;
  videoCount: number;
}

export default function SubscriptionsPage() {
  const [allVideos, setAllVideos] = useState<Video[]>([]);
  const [subscribedIds, setSubscribedIds] = useState<number[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Load local subscriptions
      let localSubIds: number[] = [];
      try {
        const stored = localStorage.getItem("minitube_subscriptions");
        if (stored) {
          localSubIds = JSON.parse(stored);
        }
      } catch {}

      // 2. Load API subscriptions if user is logged in
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await fetch(API_ENDPOINTS.MY_SUBSCRIPTIONS, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            if (data.data && Array.isArray(data.data)) {
              const apiIds = data.data.map((s: any) => s.channel_id);
              localSubIds = Array.from(new Set([...localSubIds, ...apiIds]));
            }
          }
        } catch (err) {
          console.error("Could not fetch remote subscriptions:", err);
        }
      }

      setSubscribedIds(localSubIds);

      // 3. Load all videos from database
      const resVideos = await fetch(API_ENDPOINTS.VIDEOS);
      if (!resVideos.ok) {
        throw new Error(`Failed to load videos (status ${resVideos.status})`);
      }

      const jsonVideos = await resVideos.json();
      if (jsonVideos.data && Array.isArray(jsonVideos.data)) {
        const mapped = jsonVideos.data.map(mapBackendVideoToVideo);
        setAllVideos(mapped);
      } else {
        setAllVideos([]);
      }
    } catch (err: any) {
      console.error("Error loading subscriptions page:", err);
      setError(err.message || "Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute all unique creators/channels from database videos
  const creatorsMap = new Map<number, CreatorChannel>();
  for (const v of allVideos) {
    if (!creatorsMap.has(v.channelId)) {
      creatorsMap.set(v.channelId, {
        id: v.channelId,
        name: v.channelName,
        avatar: v.channelAvatar,
        videoCount: 1,
      });
    } else {
      const c = creatorsMap.get(v.channelId)!;
      c.videoCount += 1;
    }
  }
  const allCreators = Array.from(creatorsMap.values());

  // Channels user is subscribed to
  const subscribedChannels = allCreators.filter((c) =>
    subscribedIds.includes(c.id)
  );

  // Subscribed videos
  const subscribedVideos = allVideos.filter((v) =>
    subscribedIds.includes(v.channelId)
  );

  // Filtered by selected channel chip
  const displayedVideos =
    selectedChannelId === null
      ? subscribedVideos
      : subscribedVideos.filter((v) => v.channelId === selectedChannelId);

  // Handle instant subscribe from suggested creators card
  const handleInstantSubscribe = (channelId: number) => {
    let nextList = [...subscribedIds];
    if (nextList.includes(channelId)) {
      nextList = nextList.filter((id) => id !== channelId);
    } else {
      nextList.push(channelId);
    }
    setSubscribedIds(nextList);
    try {
      localStorage.setItem("minitube_subscriptions", JSON.stringify(nextList));
    } catch {}

    const token = localStorage.getItem("token");
    if (token) {
      fetch(API_ENDPOINTS.SUBSCRIBE(channelId), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(console.error);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-100 text-red-600 shadow-xs">
            <Tv size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Subscriptions
            </h1>
            <p className="text-xs text-gray-500">
              Latest uploads from creators you follow
            </p>
          </div>
        </div>

        {subscribedChannels.length > 0 && (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
            {subscribedChannels.length} Following
          </span>
        )}
      </div>

      {/* Subscribed Channels Bar */}
      {!loading && subscribedChannels.length > 0 && (
        <div className="mb-8 flex items-center gap-2 overflow-x-auto border-b border-gray-100 pb-4 no-scrollbar">
          <button
            onClick={() => setSelectedChannelId(null)}
            className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
              selectedChannelId === null
                ? "bg-gray-900 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Subscriptions
          </button>

          {subscribedChannels.map((channel) => {
            const isSelected = selectedChannelId === channel.id;
            const initial = channel.name ? channel.name.charAt(0).toUpperCase() : "U";

            return (
              <button
                key={channel.id}
                onClick={() =>
                  setSelectedChannelId(isSelected ? null : channel.id)
                }
                className={`flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                  isSelected
                    ? "bg-gray-900 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {channel.avatar ? (
                  <img
                    src={channel.avatar}
                    alt={channel.name}
                    className="h-5 w-5 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                    {initial}
                  </div>
                )}
                <span>{channel.name}</span>
              </button>
            );
          })}
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
            onClick={loadData}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            <RefreshCw size={15} />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Content: Has Subscriptions */}
      {!loading && !error && subscribedVideos.length > 0 && (
        <div>
          {displayedVideos.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              No videos from this creator yet.
            </div>
          ) : (
            <VideoGrid videos={displayedVideos} />
          )}
        </div>
      )}

      {/* Empty State: Not Subscribed to Any Channel */}
      {!loading && !error && subscribedVideos.length === 0 && (
        <div className="mt-4 space-y-12">
          {/* Hero Banner */}
          <div className="mx-auto max-w-lg rounded-3xl border border-gray-100 bg-gradient-to-b from-gray-50 to-white p-8 text-center shadow-xs">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 text-red-600 shadow-xs">
              <Users size={32} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-gray-900">
              Don&apos;t miss new videos
            </h2>
            <p className="mt-2 text-sm text-gray-500 leading-6">
              Subscribe to channels to see their latest videos right here in your feed.
            </p>

            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800"
              >
                <VideoIcon size={16} />
                <span>Browse Videos</span>
              </Link>
            </div>
          </div>

          {/* Discover Creators Section */}
          {allCreators.length > 0 && (
            <div>
              <div className="mb-5 flex items-center gap-2">
                <Sparkles size={18} className="text-amber-500" />
                <h3 className="text-lg font-bold text-gray-900">
                  Recommended Creators to Follow
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {allCreators.map((creator) => {
                  const isSub = subscribedIds.includes(creator.id);
                  const initial = creator.name
                    ? creator.name.charAt(0).toUpperCase()
                    : "U";

                  return (
                    <div
                      key={creator.id}
                      className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-xs transition hover:shadow-md"
                    >
                      <Link
                        href={`/channel/${creator.id}`}
                        className="flex items-center gap-3 min-w-0"
                      >
                        {creator.avatar ? (
                          <img
                            src={creator.avatar}
                            alt={creator.name}
                            className="h-12 w-12 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 font-bold text-white shadow-sm shrink-0">
                            {initial}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-gray-900 text-sm">
                            {creator.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {creator.videoCount}{" "}
                            {creator.videoCount === 1 ? "video" : "videos"} uploaded
                          </p>
                        </div>
                      </Link>

                      <button
                        onClick={() => handleInstantSubscribe(creator.id)}
                        className={`ml-3 shrink-0 flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition active:scale-95 ${
                          isSub
                            ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            : "bg-red-600 text-white hover:bg-red-700 shadow-xs"
                        }`}
                      >
                        {isSub ? (
                          <>
                            <Check size={14} />
                            <span>Subscribed</span>
                          </>
                        ) : (
                          <>
                            <Bell size={14} />
                            <span>Subscribe</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}