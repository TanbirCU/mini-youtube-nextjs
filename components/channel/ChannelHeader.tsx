import Image from "next/image";
import { Channel } from "@/types/channel";

export default function ChannelHeader({
  channel,
}: {
  channel: Channel;
}) {
  return (
    <div>

      <div className="relative h-40 overflow-hidden rounded-xl sm:h-56">
        <Image
          src={channel.banner}
          alt={channel.name}
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <div className="flex flex-col gap-5 py-6 sm:flex-row sm:items-center">

        <Image
          src={channel.avatar}
          alt={channel.name}
          width={100}
          height={100}
          className="h-24 w-24 rounded-full border-4 border-white object-cover"
        />

        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {channel.name}
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            {channel.username}
          </p>

          <p className="mt-1 text-sm text-gray-500">
            {channel.subscribers.toLocaleString()} subscribers
          </p>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
            {channel.description}
          </p>
        </div>

        <button className="rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white">
          Subscribe
        </button>

      </div>

      <div className="flex gap-6 overflow-x-auto border-b">
        {["Home", "Videos", "Shorts", "Playlists"].map(
          (tab, index) => (
            <button
              key={tab}
              className={`whitespace-nowrap px-2 py-4 text-sm font-medium ${
                index === 0
                  ? "border-b-2 border-gray-900"
                  : "text-gray-500"
              }`}
            >
              {tab}
            </button>
          )
        )}
      </div>

    </div>
  );
}