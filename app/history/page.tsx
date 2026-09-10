import VideoGrid from "@/components/video/VideoGrid";
import { videos } from "@/data/videos";

export default function HistoryPage() {
  return (
    <div className="px-4 py-6 sm:px-6">

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Watch history
        </h1>

        <button className="rounded-full bg-gray-100 px-4 py-2 text-sm hover:bg-gray-200">
          Clear history
        </button>
      </div>

      <div className="mt-7">
        <h2 className="mb-5 text-lg font-semibold">
          Today
        </h2>

        <VideoGrid videos={videos.slice(0, 4)} />
      </div>

    </div>
  );
}