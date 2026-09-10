import VideoGrid from "@/components/video/VideoGrid";
import { videos } from "@/data/videos";

export default function LikedPage() {
  return (
    <div className="px-4 py-6 sm:px-6">

      <h1 className="text-2xl font-bold">
        Liked videos
      </h1>

      <p className="mt-1 text-sm text-gray-500">
        Videos you liked
      </p>

      <div className="mt-7">
        <VideoGrid videos={videos.slice(1, 7)} />
      </div>

    </div>
  );
}