"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Clock3,
  Compass,
  Flame,
  History,
  House,
  ListVideo,
  PlaySquare,
  Settings,
  ThumbsUp,
  Tv,
} from "lucide-react";
import { API_ENDPOINTS } from "@/lib/api";

const mainLinks = [
  { label: "Home", href: "/", icon: House },
  { label: "Trending", href: "/trending", icon: Flame },
  { label: "Subscriptions", href: "/subscriptions", icon: PlaySquare },
];

const libraryLinks = [
  { label: "History", href: "/history", icon: History },
  { label: "Liked videos", href: "/liked", icon: ThumbsUp },
  { label: "Saved videos", href: "/saved", icon: Clock3 },
  { label: "Playlists", href: "/playlists", icon: ListVideo },
];

interface SubscribedChannel {
  id: number;
  name: string;
  avatar?: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [subscribedChannels, setSubscribedChannels] = useState<SubscribedChannel[]>([]);
  const [allCreators, setAllCreators] = useState<SubscribedChannel[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSubscriptions = async () => {
    try {
      // 1. Get local subscriptions
      let subIds: number[] = [];
      try {
        const raw = localStorage.getItem("minitube_subscriptions");
        if (raw) subIds = JSON.parse(raw);
      } catch {}

      // 2. Fetch API subscriptions if logged in
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) {
        try {
          const res = await fetch(API_ENDPOINTS.MY_SUBSCRIPTIONS, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            if (data.data && Array.isArray(data.data)) {
              const apiIds = data.data.map((s: any) => s.channel_id);
              subIds = Array.from(new Set([...subIds, ...apiIds]));
            }
          }
        } catch {}
      }

      // 3. Fetch database videos to extract channel info
      const resVideos = await fetch(API_ENDPOINTS.VIDEOS);
      if (resVideos.ok) {
        const json = await resVideos.json();
        if (json.data && Array.isArray(json.data)) {
          const creatorMap = new Map<number, SubscribedChannel>();

          for (const item of json.data) {
            const channelId = item.user?.id || item.user_id || 1;
            const channelName = item.user?.name || "Creator";
            const channelAvatar = item.user?.avatar || "";

            if (!creatorMap.has(channelId)) {
              creatorMap.set(channelId, {
                id: channelId,
                name: channelName,
                avatar: channelAvatar,
              });
            }
          }

          const creators = Array.from(creatorMap.values());
          setAllCreators(creators);

          // Filter by subscribed IDs
          const matched = creators.filter((c) => subIds.includes(c.id));
          setSubscribedChannels(matched);
        }
      }
    } catch (err) {
      console.error("Error loading sidebar subscriptions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();

    // Listen for subscription changes anywhere in the app
    const handleSubChange = () => {
      loadSubscriptions();
    };

    window.addEventListener("subscriptionChange", handleSubChange);
    window.addEventListener("storage", handleSubChange);

    return () => {
      window.removeEventListener("subscriptionChange", handleSubChange);
      window.removeEventListener("storage", handleSubChange);
    };
  }, []);

  return (
    <aside className="fixed bottom-0 left-0 top-16 hidden w-64 overflow-y-auto border-r bg-white p-3 lg:block">
      {/* Main navigation */}
      <div className="space-y-1">
        {mainLinks.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 rounded-xl px-4 py-3 text-sm transition ${
                active
                  ? "bg-gray-100 font-semibold text-gray-900"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="my-4 border-t" />

      {/* Library Links */}
      <p className="px-4 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
        You
      </p>

      <div className="space-y-1">
        {libraryLinks.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 rounded-xl px-4 py-3 text-sm transition ${
                active
                  ? "bg-gray-100 font-semibold text-gray-900"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="my-4 border-t" />

      {/* Real Subscriptions Section */}
      <div className="flex items-center justify-between px-4 pb-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Subscriptions
        </p>
        {subscribedChannels.length > 0 && (
          <span className="text-[11px] font-semibold text-gray-400">
            {subscribedChannels.length}
          </span>
        )}
      </div>

      <div className="space-y-0.5">
        {subscribedChannels.length > 0 ? (
          subscribedChannels.map((channel) => {
            const initial = channel.name
              ? channel.name.charAt(0).toUpperCase()
              : "U";

            return (
              <Link
                key={channel.id}
                href={`/channel/${channel.id}`}
                className="flex items-center gap-3 rounded-xl px-4 py-2 text-sm text-gray-800 transition hover:bg-gray-100"
              >
                {channel.avatar ? (
                  <img
                    src={channel.avatar}
                    alt={channel.name}
                    className="h-7 w-7 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-600 text-[11px] font-bold text-white shadow-xs">
                    {initial}
                  </div>
                )}
                <span className="truncate">{channel.name}</span>
              </Link>
            );
          })
        ) : (
          <div className="px-4 py-2 text-xs text-gray-500">
            <p className="leading-relaxed">No subscriptions yet.</p>
            <Link
              href="/subscriptions"
              className="mt-1.5 inline-block font-semibold text-red-600 hover:underline"
            >
              Explore channels →
            </Link>
          </div>
        )}
      </div>

      <div className="my-4 border-t" />

      {/* Settings */}
      <Link
        href="/settings"
        className="flex items-center gap-4 rounded-xl px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-100"
      >
        <Settings size={20} />
        <span>Settings</span>
      </Link>
    </aside>
  );
}