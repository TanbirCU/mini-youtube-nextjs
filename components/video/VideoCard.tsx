import Image from "next/image";
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

export default function VideoCard({ video }: { video: Video }) {
  return (
    <article className="group min-w-0">

      <Link href={`/watch/${video.id}`}>
        <div className="relative aspect-video overflow-hidden rounded-xl bg-gray-200">
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />

          <span className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs font-medium text-white">
            {video.duration}
          </span>
        </div>
      </Link>

      <div className="mt-3 flex gap-3">
        <Link href={`/channel/${video.channelId}`}>
          <Image
            src={video.channelAvatar}
            alt={video.channelName}
            width={38}
            height={38}
            className="rounded-full"
          />
        </Link>

        <div className="min-w-0 flex-1">
          <Link href={`/watch/${video.id}`}>
            <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-gray-900">
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

        <button className="h-fit rounded-full p-1 opacity-0 hover:bg-gray-100 group-hover:opacity-100">
          <MoreVertical size={18} />
        </button>
      </div>
    </article>
  );
}