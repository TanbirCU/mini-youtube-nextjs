"use client";

import Link from "next/link";
import { MoreVertical } from "lucide-react";
import { Video } from "@/types/video";

function formatViews(views: number) {
  if (views >= 1_000_000) {
    return `${(views / 1_000_000).toFixed(1)}M`;
  }

  if (views >= 1_000) {
    return `${(views / 1_000).toFixed(1)}K`;
  }

  return views.toString();
}

function getInitial(name?: string) {
  return name ? name.trim().charAt(0).toUpperCase() : "U";
}

export default function VideoCard({ video }: { video: Video }) {
  return (
    <article className="group min-w-0">
      <Link href={`/watch/${video.id}`} className="block">
        <div className="relative aspect-video overflow-hidden rounded-xl bg-gray-100">
          {video.thumbnail ? (
            <img
              src={video.thumbnail}
              alt={video.title}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-gray-900 to-gray-800 text-gray-400">
              <span className="text-sm font-medium">No Thumbnail</span>
            </div>
          )}

          {video.duration && (
            <span className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
              {video.duration}
            </span>
          )}
        </div>
      </Link>

      <div className="mt-3 flex gap-3">
        <Link href={`/channel/${video.channelId}`} className="shrink-0">
          {video.channelAvatar ? (
            <img
              src={video.channelAvatar}
              alt={video.channelName}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-sm font-semibold text-white shadow-sm">
              {getInitial(video.channelName)}
            </div>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <Link href={`/watch/${video.id}`}>
            <h3
              className="line-clamp-2 text-sm font-semibold leading-5 text-gray-900 group-hover:text-black"
              title={video.title}
            >
              {video.title}
            </h3>
          </Link>

          <Link
            href={`/channel/${video.channelId}`}
            className="mt-1 block text-sm text-gray-500 hover:text-gray-800"
          >
            {video.channelName}
          </Link>

          <p className="text-xs text-gray-500">
            {formatViews(video.views)} views • {video.uploadedAt}
          </p>
        </div>

        <button
          type="button"
          aria-label="More options"
          className="h-fit rounded-full p-1 text-gray-500 opacity-0 hover:bg-gray-100 hover:text-gray-900 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical size={18} />
        </button>
      </div>
    </article>
  );
}