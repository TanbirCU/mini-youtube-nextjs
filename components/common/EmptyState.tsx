import { VideoOff } from "lucide-react";

export default function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed text-center">

      <div className="rounded-full bg-gray-100 p-5">
        <VideoOff size={30} className="text-gray-400" />
      </div>

      <h2 className="mt-5 font-semibold">
        {title}
      </h2>

      <p className="mt-2 max-w-sm text-sm text-gray-500">
        {description}
      </p>

    </div>
  );
}