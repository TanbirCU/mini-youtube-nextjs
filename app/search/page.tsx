import Image from "next/image";
import Link from "next/link";
import { videos } from "@/data/videos";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || "golang";

  const results = videos.filter((video) =>
    `${video.title} ${video.channelName} ${video.category}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <div className="px-4 py-6 sm:px-6">

      <h1 className="text-xl font-bold">
        Search results for "{query}"
      </h1>

      <div className="mt-7 max-w-4xl space-y-6">

        {results.map((video) => (
          <Link
            key={video.id}
            href={`/watch/${video.id}`}
            className="flex gap-4"
          >
            <div className="relative aspect-video w-72 shrink-0 overflow-hidden rounded-xl bg-gray-200">
              <Image
                src={video.thumbnail}
                alt={video.title}
                fill
                sizes="288px"
                className="object-cover"
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold">
                {video.title}
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                {video.views.toLocaleString()} views •{" "}
                {video.uploadedAt}
              </p>

              <p className="mt-3 text-sm text-gray-500">
                {video.channelName}
              </p>

              <p className="mt-3 line-clamp-2 text-sm text-gray-600">
                {video.description}
              </p>
            </div>
          </Link>
        ))}

      </div>

    </div>
  );
}