"use client";

import { useEffect } from "react";
import { addToWatchHistory } from "@/lib/utils";

export default function WatchTracker({ videoId }: { videoId: number }) {
  useEffect(() => {
    if (videoId) {
      addToWatchHistory(videoId);
    }
  }, [videoId]);

  return null;
}
