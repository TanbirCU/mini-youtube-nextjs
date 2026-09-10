"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, History, House, PlaySquare } from "lucide-react";

const navItems = [
  { label: "Home", href: "/", icon: House },
  { label: "Trending", href: "/trending", icon: Flame },
  { label: "Subscriptions", href: "/subscriptions", icon: PlaySquare },
  { label: "History", href: "/history", icon: History },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t bg-white lg:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 text-xs ${
              active ? "font-semibold text-red-600" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}