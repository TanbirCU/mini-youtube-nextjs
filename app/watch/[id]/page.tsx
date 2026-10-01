import { notFound } from "next/navigation";
import Link from "next/link";
import VideoPlayer from "@/components/video/VideoPlayer";
import VideoInfo from "@/components/video/VideoInfo";
import VideoActions from "@/components/video/VideoActions";
import SubscribeButton from "@/components/video/SubscribeButton";
import RelatedVideos from "@/components/video/RelatedVideos";
import CommentSection from "@/components/video/CommentSection";
import WatchTracker from "@/components/video/WatchTracker";
import { API_ENDPOINTS } from "@/lib/api";
import { mapBackendVideoToVideo } from "@/lib/utils";
import { videos as staticVideos } from "@/data/videos";
import { channels } from "@/data/channels";
import { Video } from "@/types/video";

export default async function WatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let video: Video | undefined;

  // 1. Try to fetch video from the database via API
  try {
    const res = await fetch(`${API_ENDPOINTS.VIDEOS}/${id}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const json = await res.json();
      if (json.data) {
        video = mapBackendVideoToVideo(json.data);
      }
    }
  } catch (err) {
    console.error("Failed to fetch video from API:", err);
  }

  // 2. Fallback to mock videos if not found in database
  if (!video) {
    video = staticVideos.find((item) => item.id === Number(id));
  }

  if (!video) {
    notFound();
  }

  const channel = channels.find((item) => item.id === video.channelId);

  // Fetch related videos from database or fallback to static
  let relatedVideos: Video[] = [];
  try {
    const res = await fetch(API_ENDPOINTS.VIDEOS, { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        relatedVideos = json.data
          .filter((item: any) => item.id !== video!.id)
          .map(mapBackendVideoToVideo)
          .slice(0, 5);
      }
    }
  } catch (err) {
    console.error("Failed to fetch related videos:", err);
  }

  if (relatedVideos.length === 0) {
    relatedVideos = staticVideos
      .filter((item) => item.id !== video!.id)
      .slice(0, 5);
  }

  const creatorInitial = video.channelName
    ? video.channelName.charAt(0).toUpperCase()
    : "U";

  return (
    <div className="px-4 py-6 sm:px-6">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          {/* Watch Tracker */}
          <WatchTracker videoId={video.id} />

          {/* Real Video Player with controls */}
          <VideoPlayer
            src={video.videoUrl}
            poster={video.thumbnail}
            title={video.title}
          />

          {/* Video Metadata */}
          <VideoInfo video={video} />

          {/* Video Action Buttons (Like, Share, Save) */}
          <VideoActions videoId={video.id} likes={video.likes || 0} />

          {/* Channel Info & Subscribe Bar */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <Link
              href={`/channel/${video.channelId}`}
              className="flex items-center gap-3 transition hover:opacity-80"
            >
              {channel?.avatar || video.channelAvatar ? (
                <img
                  src={channel?.avatar || video.channelAvatar}
                  alt={video.channelName}
                  className="h-11 w-11 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600 font-bold text-white shadow-sm">
                  {creatorInitial}
                </div>
              )}

              <div>
                <p className="font-semibold text-gray-900 leading-tight">
                  {video.channelName}
                </p>
                <p className="text-xs text-gray-500">
                  {channel?.subscribers
                    ? `${channel.subscribers.toLocaleString()} subscribers`
                    : "Channel"}
                </p>
              </div>
            </Link>

            {/* Dynamic Interactive Subscribe Button */}
            <SubscribeButton
              channelId={video.channelId}
              initialSubscribers={channel?.subscribers || 25000}
            />
          </div>

          {/* Interactive Comments Section */}
          <CommentSection videoId={video.id} />
        </div>

        {/* Sidebar / Related Videos */}
        <aside>
          <RelatedVideos videos={relatedVideos} />
        </aside>
      </div>
    </div>
  );
}