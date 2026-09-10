"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Bell,
  Menu,
  Search,
  Upload,
  UserCircle,
  X,
} from "lucide-react";

export default function Header() {
  const [mobileSearch, setMobileSearch] = useState(false);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 h-16 border-b bg-white">
      <div className="flex h-full items-center gap-3 px-4">

        <button className="rounded-full p-2 hover:bg-gray-100">
          <Menu size={22} />
        </button>

        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white">
            ▶
          </div>

          <span className="hidden text-xl font-bold sm:block">
            Mini<span className="text-red-600">Tube</span>
          </span>
        </Link>

        {mobileSearch ? (
          <div className="flex flex-1 items-center">
            <input
              autoFocus
              placeholder="Search videos..."
              className="h-10 w-full rounded-l-full border border-gray-300 px-4 outline-none focus:border-gray-500"
            />

            <button className="h-10 rounded-r-full border border-l-0 bg-gray-100 px-5">
              <Search size={20} />
            </button>

            <button
              onClick={() => setMobileSearch(false)}
              className="ml-2 p-2"
            >
              <X size={20} />
            </button>
          </div>
        ) : (
          <div className="mx-auto hidden max-w-2xl flex-1 md:flex">
            <input
              placeholder="Search videos..."
              className="h-10 w-full rounded-l-full border border-gray-300 px-5 outline-none focus:border-gray-500"
            />

            <button className="h-10 rounded-r-full border border-l-0 bg-gray-100 px-6 hover:bg-gray-200">
              <Search size={20} />
            </button>
          </div>
        )}

        {!mobileSearch && (
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => setMobileSearch(true)}
              className="rounded-full p-2 hover:bg-gray-100 md:hidden"
            >
              <Search size={21} />
            </button>

            <Link
              href="/upload"
              className="hidden items-center gap-2 rounded-full bg-gray-100 px-4 py-2 hover:bg-gray-200 sm:flex"
            >
              <Upload size={18} />
              <span>Upload</span>
            </Link>

            <button className="rounded-full p-2 hover:bg-gray-100">
              <Bell size={21} />
            </button>

            <Link href="/login" className="rounded-full p-1">
              <UserCircle size={30} />
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}