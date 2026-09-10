import { notFound } from "next/navigation";
import ChannelHeader from "@/components/channel/ChannelHeader";
import VideoGrid from "@/components/video/VideoGrid";
import { channels } from "@/data/channels";
import { videos } from "@/data/videos";

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const channel = channels.find(
    (item) => item.id === Number(id)
  );

  if (!channel) {
    notFound();
  }

  const channelVideos = videos.filter(
    (video) => video.channelId === channel.id
  );

  return (
    <div className="px-4 py-6 sm:px-6">

      <ChannelHeader channel={channel} />

      <section className="py-7">
        <h2 className="mb-5 text-xl font-bold">
          Videos
        </h2>

        <VideoGrid videos={channelVideos} />
      </section>

    </div>
  );
}