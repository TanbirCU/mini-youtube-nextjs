import { notFound } from "next/navigation";
import VideoPlayer from "@/components/video/VideoPlayer";
import VideoInfo from "@/components/video/VideoInfo";
import VideoActions from "@/components/video/VideoActions";
import RelatedVideos from "@/components/video/RelatedVideos";
import CommentSection from "@/components/video/CommentSection";
import { videos } from "@/data/videos";
import { channels } from "@/data/channels";

export default async function WatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const video = videos.find(
    (item) => item.id === Number(id)
  );

  if (!video) {
    notFound();
  }

  const channel = channels.find(
    (item) => item.id === video.channelId
  );

  const relatedVideos = videos
    .filter((item) => item.id !== video.id)
    .slice(0, 5);

  return (
    <div className="px-4 py-6 sm:px-6">

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">

        <div>
          <VideoPlayer />

          <VideoInfo video={video} />

          <VideoActions likes={video.likes} />

          <div className="mt-6 flex items-center justify-between rounded-xl border p-4">

            <div className="flex items-center gap-3">
              <img
                src={channel?.avatar || video.channelAvatar}
                alt={video.channelName}
                className="h-11 w-11 rounded-full"
              />

              <div>
                <p className="font-semibold">
                  {video.channelName}
                </p>

                <p className="text-xs text-gray-500">
                  {channel?.subscribers.toLocaleString() || "25K"} subscribers
                </p>
              </div>
            </div>

            <button className="rounded-full bg-gray-900 px-5 py-2 text-sm font-medium text-white">
              Subscribe
            </button>

          </div>

          <CommentSection />
        </div>

        <aside>
          <RelatedVideos videos={relatedVideos} />
        </aside>

      </div>
    </div>
  );
}