import Image from "next/image";
import Link from "next/link";
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

export default function RelatedVideos({ videos }: { videos: Video[] }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Related Videos</h3>
      {videos.map((video) => (
        <Link
          key={video.id}
          href={`/watch/${video.id}`}
          className="flex gap-3 group"
        >
          <div className="relative aspect-video w-40 shrink-0 overflow-hidden rounded-lg bg-gray-200">
            <Image
              src={video.thumbnail}
              alt={video.title}
              fill
              sizes="160px"
              className="object-cover transition duration-300 group-hover:scale-105"
            />
            <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
              {video.duration}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="line-clamp-2 text-sm font-semibold leading-5 text-gray-900 group-hover:text-red-600">
              {video.title}
            </h4>
            <p className="mt-1 text-xs text-gray-500">{video.channelName}</p>
            <p className="text-xs text-gray-500">
              {formatViews(video.views)} views • {video.uploadedAt}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}