"use client";

import { useState } from "react";
import { UploadCloud, Video } from "lucide-react";

export default function UploadPage() {
  const [fileName, setFileName] = useState("");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">

      <h1 className="text-2xl font-bold">
        Upload video
      </h1>

      <p className="mt-1 text-sm text-gray-500">
        Share your video with the world.
      </p>

      <div className="mt-8 space-y-7">

        <label className="flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center hover:bg-gray-100">

          <UploadCloud size={50} className="text-gray-400" />

          <h2 className="mt-4 text-lg font-semibold">
            {fileName || "Drag and drop your video"}
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            MP4, WebM or MOV
          </p>

          <span className="mt-5 rounded-full bg-gray-900 px-5 py-2.5 text-sm text-white">
            Select video
          </span>

          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) =>
              setFileName(
                e.target.files?.[0]?.name || ""
              )
            }
          />

        </label>

        <div className="rounded-2xl border p-5">

          <div className="mb-6 flex items-center gap-3">
            <Video size={22} />

            <h2 className="font-semibold">
              Video details
            </h2>
          </div>

          <div className="space-y-5">

            <div>
              <label className="mb-2 block text-sm font-medium">
                Title
              </label>

              <input
                placeholder="Enter video title"
                className="w-full rounded-xl border px-4 py-3 outline-none focus:border-gray-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Description
              </label>

              <textarea
                rows={5}
                placeholder="Tell viewers about your video..."
                className="w-full resize-none rounded-xl border px-4 py-3 outline-none focus:border-gray-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Category
              </label>

              <select className="w-full rounded-xl border px-4 py-3 outline-none">
                <option>Programming</option>
                <option>Technology</option>
                <option>Music</option>
                <option>Gaming</option>
                <option>Education</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Visibility
              </label>

              <select className="w-full rounded-xl border px-4 py-3 outline-none">
                <option>Public</option>
                <option>Unlisted</option>
                <option>Private</option>
              </select>
            </div>

          </div>

          <div className="mt-7 flex justify-end gap-3">
            <button className="rounded-full px-5 py-2.5 hover:bg-gray-100">
              Cancel
            </button>

            <button className="rounded-full bg-red-600 px-6 py-2.5 font-medium text-white hover:bg-red-700">
              Publish video
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}