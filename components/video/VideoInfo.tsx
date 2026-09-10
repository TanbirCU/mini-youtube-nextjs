import { Video } from "@/types/video";

function formatViews(views: number) {
  return new Intl.NumberFormat("en-US").format(views);
}

export default function VideoInfo({
  video,
}: {
  video: Video;
}) {
  return (
    <div className="mt-5">
      <h1 className="text-xl font-bold sm:text-2xl">
        {video.title}
      </h1>

      <p className="mt-2 text-sm text-gray-500">
        {formatViews(video.views)} views • {video.uploadedAt}
      </p>

      <div className="mt-5 rounded-xl bg-gray-100 p-4">
        <p className="whitespace-pre-line text-sm leading-6">
          {video.description}
        </p>
      </div>
    </div>
  );
}