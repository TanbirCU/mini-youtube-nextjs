"use client";

import { useState } from "react";
import CategoryBar from "@/components/home/CategoryBar";
import VideoGrid from "@/components/video/VideoGrid";
import { videos } from "@/data/videos";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredVideos =
    selectedCategory === "All"
      ? videos
      : videos.filter(
          (video) =>
            video.category.toLowerCase() === selectedCategory.toLowerCase()
        );

  return (
    <div>
      <CategoryBar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <div className="px-4 py-6 sm:px-6">
        <VideoGrid videos={filteredVideos} />
      </div>
    </div>
  );
}
