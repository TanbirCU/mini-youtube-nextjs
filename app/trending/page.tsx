import VideoGrid from "@/components/video/VideoGrid";
import { videos } from "@/data/videos";

export default function TrendingPage() {
  const trending = [...videos].sort(
    (a, b) => b.views - a.views
  );

  return (
    <div className="px-4 py-6 sm:px-6">

      <div className="mb-7">
        <h1 className="text-2xl font-bold">
          🔥 Trending
        </h1>

        <div className="mt-5 flex gap-3 overflow-x-auto">
          {["Today", "This week", "This month"].map(
            (item, index) => (
              <button
                key={item}
                className={`rounded-full px-5 py-2 text-sm ${
                  index === 0
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100"
                }`}
              >
                {item}
              </button>
            )
          )}
        </div>
      </div>

      <VideoGrid videos={trending} />

    </div>
  );
}