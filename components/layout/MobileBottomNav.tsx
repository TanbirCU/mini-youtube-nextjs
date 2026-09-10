"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Clock3,
  Compass,
  Flame,
  History,
  House,
  ListVideo,
  PlaySquare,
  Settings,
  ThumbsUp,
} from "lucide-react";

const mainLinks = [
  { label: "Home", href: "/", icon: House },
  { label: "Trending", href: "/trending", icon: Flame },
  { label: "Subscriptions", href: "/subscriptions", icon: PlaySquare },
];

const libraryLinks = [
  { label: "History", href: "/history", icon: History },
  { label: "Liked videos", href: "/liked", icon: ThumbsUp },
  { label: "Saved videos", href: "/saved", icon: Clock3 },
  { label: "Playlists", href: "/playlists", icon: ListVideo },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed bottom-0 left-0 top-16 hidden w-64 overflow-y-auto border-r bg-white p-3 lg:block">

      <div className="space-y-1">
        {mainLinks.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 rounded-xl px-4 py-3 ${
                active
                  ? "bg-gray-100 font-semibold"
                  : "hover:bg-gray-100"
              }`}
            >
              <Icon size={21} />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="my-4 border-t" />

      <p className="px-4 pb-2 text-sm font-semibold text-gray-500">
        You
      </p>

      <div className="space-y-1">
        {libraryLinks.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 rounded-xl px-4 py-3 hover:bg-gray-100"
            >
              <Icon size={21} />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="my-4 border-t" />

      <p className="px-4 pb-2 text-sm font-semibold text-gray-500">
        Subscriptions
      </p>

      {["Tanbir Academy", "Laravel BD", "Code World"].map(
        (channel) => (
          <div
            key={channel}
            className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-2.5 hover:bg-gray-100"
          >
            <div className="h-8 w-8 rounded-full bg-gray-200" />
            <span className="truncate text-sm">{channel}</span>
          </div>
        )
      )}

      <div className="my-4 border-t" />

      <Link
        href="/settings"
        className="flex items-center gap-4 rounded-xl px-4 py-3 hover:bg-gray-100"
      >
        <Settings size={21} />
        Settings
      </Link>

    </aside>
  );
}