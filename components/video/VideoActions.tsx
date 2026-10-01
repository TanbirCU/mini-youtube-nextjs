"use client";

import { useState, useEffect } from "react";
import {
  Bookmark,
  Share2,
  ThumbsDown,
  ThumbsUp,
  Check,
} from "lucide-react";
import { isLikedVideo, toggleLikedVideo, isSavedVideo, toggleSavedVideo } from "@/lib/utils";

interface VideoActionsProps {
  videoId: number;
  likes: number;
}

export default function VideoActions({
  videoId,
  likes,
}: VideoActionsProps) {
  const [likeCount, setLikeCount] = useState(likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  // Initialize liked and saved states from localStorage
  useEffect(() => {
    if (videoId) {
      setIsLiked(isLikedVideo(videoId));
      setIsSaved(isSavedVideo(videoId));
    }
  }, [videoId]);

  const handleLike = () => {
    const newLikedState = toggleLikedVideo(videoId);
    setIsLiked(newLikedState);
    setLikeCount((prev) => (newLikedState ? prev + 1 : Math.max(0, prev - 1)));
    if (newLikedState && isDisliked) {
      setIsDisliked(false);
    }
  };

  const handleDislike = () => {
    if (isDisliked) {
      setIsDisliked(false);
    } else {
      setIsDisliked(true);
      if (isLiked) {
        toggleLikedVideo(videoId);
        setIsLiked(false);
        setLikeCount((prev) => Math.max(0, prev - 1));
      }
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = () => {
    const nextSaved = toggleSavedVideo(videoId);
    setIsSaved(nextSaved);
  };

  const formattedLikes = new Intl.NumberFormat("en-US", {
    notation: "compact",
  }).format(likeCount);

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {/* Like & Dislike Pill */}
      <div className="flex items-center rounded-full bg-gray-100 p-1">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
            isLiked
              ? "bg-white text-red-600 shadow-xs font-semibold"
              : "text-gray-700 hover:bg-gray-200"
          }`}
          aria-label="Like"
        >
          <ThumbsUp size={16} className={isLiked ? "fill-red-600" : ""} />
          <span>{formattedLikes}</span>
        </button>

        <div className="h-4 w-px bg-gray-300" />

        <button
          onClick={handleDislike}
          className={`rounded-full px-3 py-1.5 text-sm transition ${
            isDisliked
              ? "bg-white text-gray-900 shadow-xs"
              : "text-gray-700 hover:bg-gray-200"
          }`}
          aria-label="Dislike"
        >
          <ThumbsDown size={16} className={isDisliked ? "fill-gray-900" : ""} />
        </button>
      </div>

      {/* Share Button */}
      <button
        onClick={handleShare}
        className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
      >
        {copied ? <Check size={16} className="text-emerald-600" /> : <Share2 size={16} />}
        <span>{copied ? "Link Copied!" : "Share"}</span>
      </button>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
          isSaved
            ? "bg-gray-900 text-white hover:bg-gray-800"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        <Bookmark size={16} className={isSaved ? "fill-white" : ""} />
        <span>{isSaved ? "Saved" : "Save"}</span>
      </button>
    </div>
  );
}