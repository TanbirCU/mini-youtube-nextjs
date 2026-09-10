"use client";

import {
  Bookmark,
  Share2,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

export default function VideoActions({
  likes,
}: {
  likes: number;
}) {
  const actions = [
    {
      label: likes.toLocaleString(),
      icon: ThumbsUp,
    },
    {
      label: "24",
      icon: ThumbsDown,
    },
    {
      label: "Share",
      icon: Share2,
    },
    {
      label: "Save",
      icon: Bookmark,
    },
  ];

  return (
    <div className="mt-4 flex gap-2 overflow-x-auto">
      {actions.map((action) => {
        const Icon = action.icon;

        return (
          <button
            key={action.label}
            className="flex shrink-0 items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm hover:bg-gray-200"
          >
            <Icon size={18} />
            {action.label}
          </button>
        );
      })}
    </div>
  );
}