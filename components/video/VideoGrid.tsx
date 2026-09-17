import { Video } from "@/types/video";
import VideoCard from "./VideoCard";

export default function VideoGrid({
  videos = [],
}: {
  videos?: Video[];
}) {
  if (!videos || videos.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        No videos found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-4">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}