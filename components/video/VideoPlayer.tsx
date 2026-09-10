"use client";

import { Maximize, Pause, Settings, Volume2 } from "lucide-react";

export default function VideoPlayer() {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">

      <div className="absolute inset-0 flex items-center justify-center">
        <button className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur hover:bg-white/30">
          <span className="ml-1 text-2xl">▶</span>
        </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">

        <div className="mb-3 h-1 cursor-pointer rounded-full bg-white/30">
          <div className="h-full w-[35%] rounded-full bg-red-600" />
        </div>

        <div className="flex items-center justify-between text-white">

          <div className="flex items-center gap-4">
            <Pause size={19} />
            <Volume2 size={19} />
            <span className="text-xs">
              04:21 / 12:45
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Settings size={19} />
            <Maximize size={19} />
          </div>

        </div>
      </div>
    </div>
  );
}