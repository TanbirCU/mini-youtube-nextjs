"use client";

import { useState, useEffect } from "react";
import { Bell, Check, UserPlus } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/api";

interface SubscribeButtonProps {
  channelId: number;
  initialSubscribers?: number;
}

export default function SubscribeButton({
  channelId,
  initialSubscribers = 25000,
}: SubscribeButtonProps) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(initialSubscribers);
  const [loading, setLoading] = useState(false);

  // Check subscription status on mount
  useEffect(() => {
    // 1. Check local storage first
    try {
      const savedSubs = localStorage.getItem("minitube_subscriptions");
      if (savedSubs) {
        const subsArray = JSON.parse(savedSubs);
        if (subsArray.includes(channelId)) {
          setIsSubscribed(true);
        }
      }
    } catch {}

    // 2. Check backend API
    async function checkStatus() {
      try {
        const token = localStorage.getItem("token");
        const headers: Record<string, string> = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(API_ENDPOINTS.SUBSCRIBE(channelId), { headers });
        if (res.ok) {
          const data = await res.json();
          if (typeof data.is_subscribed === "boolean") {
            setIsSubscribed(data.is_subscribed);
          }
          if (typeof data.subscribers === "number" && data.subscribers > 0) {
            setSubscriberCount(data.subscribers);
          }
        }
      } catch (err) {
        console.error("Could not fetch subscription status:", err);
      }
    }

    if (channelId) {
      checkStatus();
    }
  }, [channelId]);

  const handleToggleSubscribe = async () => {
    if (loading) return;

    setLoading(true);
    const nextState = !isSubscribed;
    setIsSubscribed(nextState);
    setSubscriberCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    // Save to localStorage
    try {
      const saved = localStorage.getItem("minitube_subscriptions");
      let list: number[] = saved ? JSON.parse(saved) : [];
      if (nextState) {
        if (!list.includes(channelId)) list.push(channelId);
      } else {
        list = list.filter((id) => id !== channelId);
      }
      localStorage.setItem("minitube_subscriptions", JSON.stringify(list));
      window.dispatchEvent(new Event("subscriptionChange"));
    } catch {}

    // Call API if token exists
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const res = await fetch(API_ENDPOINTS.SUBSCRIBE(channelId), {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (typeof data.is_subscribed === "boolean") {
            setIsSubscribed(data.is_subscribed);
          }
          if (typeof data.subscribers === "number") {
            setSubscriberCount(data.subscribers);
          }
        }
      }
    } catch (err) {
      console.error("Failed to toggle subscription on server:", err);
    } finally {
      setLoading(false);
    }
  };

  const formattedCount = new Intl.NumberFormat("en-US", {
    notation: "compact",
  }).format(subscriberCount);

  return (
    <div className="flex items-center gap-4">
      <span className="hidden text-xs text-gray-500 sm:inline">
        {formattedCount} subscribers
      </span>

      <button
        onClick={handleToggleSubscribe}
        disabled={loading}
        className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all active:scale-95 ${
          isSubscribed
            ? "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200"
            : "bg-red-600 text-white hover:bg-red-700 shadow-sm"
        }`}
      >
        {isSubscribed ? (
          <>
            <Check size={16} className="text-gray-600" />
            <span>Subscribed</span>
          </>
        ) : (
          <>
            <Bell size={16} />
            <span>Subscribe</span>
          </>
        )}
      </button>
    </div>
  );
}
