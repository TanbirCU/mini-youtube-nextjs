import VideoGrid from "@/components/video/VideoGrid";
import { videos } from "@/data/videos";

export default function SavedPage() {
  return (
    <div className="px-4 py-6 sm:px-6">

      <h1 className="text-2xl font-bold">
        Saved videos
      </h1>

      <div className="mt-7">
        <VideoGrid videos={videos.slice(2, 7)} />
      </div>

    </div>
  );
}