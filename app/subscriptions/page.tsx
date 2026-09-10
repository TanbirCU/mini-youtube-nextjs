import VideoGrid from "@/components/video/VideoGrid";
import { videos } from "@/data/videos";

export default function SubscriptionsPage() {
  return (
    <div className="px-4 py-6 sm:px-6">

      <h1 className="text-2xl font-bold">
        Subscriptions
      </h1>

      <div className="mt-6 flex gap-3 overflow-x-auto">
        {[
          "All",
          "Tanbir Academy",
          "Laravel BD",
          "Code World",
        ].map((item, index) => (
          <button
            key={item}
            className={`whitespace-nowrap rounded-full px-5 py-2 text-sm ${
              index === 0
                ? "bg-gray-900 text-white"
                : "bg-gray-100"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mt-8">
        <VideoGrid videos={videos.slice(0, 6)} />
      </div>

    </div>
  );
}