import Image from "next/image";
import { videos } from "@/data/videos";

const playlists = [
  {
    id: 1,
    name: "Go Programming",
    videos: videos.slice(0, 3),
  },
  {
    id: 2,
    name: "Laravel Development",
    videos: videos.slice(1, 4),
  },
  {
    id: 3,
    name: "Frontend Development",
    videos: videos.slice(2, 6),
  },
];

export default function PlaylistsPage() {
  return (
    <div className="px-4 py-6 sm:px-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Playlists
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Your saved collections
          </p>
        </div>

        <button className="rounded-full bg-gray-900 px-5 py-2.5 text-sm text-white">
          + Create playlist
        </button>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

        {playlists.map((playlist) => (
          <div key={playlist.id}>

            <div className="grid aspect-video grid-cols-2 overflow-hidden rounded-xl">
              {playlist.videos.slice(0, 4).map((video) => (
                <div key={video.id} className="relative">
                  <Image
                    src={video.thumbnail}
                    alt={video.title}
                    fill
                    sizes="50vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>

            <h2 className="mt-3 font-semibold">
              {playlist.name}
            </h2>

            <p className="text-sm text-gray-500">
              {playlist.videos.length} videos
            </p>

          </div>
        ))}

      </div>

    </div>
  );
}