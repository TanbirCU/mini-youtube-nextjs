"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Menu,
  Search,
  Upload,
  UserCircle,
  X,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { API_ENDPOINTS } from "@/lib/api";

interface AuthUser {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

export default function Header() {
  const router = useRouter();
  const [mobileSearch, setMobileSearch] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync auth state from localStorage and fetch fresh profile from API /api/me
  const syncAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (!token) {
        setUser(null);
        return;
      }

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      // Fetch latest profile from backend database to ensure real-time accuracy
      const res = await fetch(API_ENDPOINTS.ME, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        }
      } else if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      }
    } catch {
      // ignore network errors and keep cached user
    }
  };

  useEffect(() => {
    syncAuth();

    // Listen for custom auth events and storage changes
    window.addEventListener("auth-change", syncAuth);
    window.addEventListener("storage", syncAuth);

    return () => {
      window.removeEventListener("auth-change", syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setMenuOpen(false);
    window.dispatchEvent(new Event("auth-change"));
    router.push("/login");
    router.refresh();
  };

  // Get dynamic initial from name or email
  const getInitial = (name?: string, email?: string) => {
    if (name && name.trim()) {
      return name.trim().charAt(0).toUpperCase();
    }
    if (email && email.trim()) {
      return email.trim().charAt(0).toUpperCase();
    }
    return "U";
  };

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    setMobileSearch(false);
    if (!q) {
      router.push("/");
    } else {
      router.push(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 h-16 border-b bg-white">
      <div className="flex h-full items-center gap-3 px-4">
        <button className="rounded-full p-2 hover:bg-gray-100">
          <Menu size={22} />
        </button>

        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white shadow-sm shadow-red-200">
            ▶
          </div>

          <span className="hidden text-xl font-bold sm:block">
            Mini<span className="text-red-600">Tube</span>
          </span>
        </Link>

        {mobileSearch ? (
          <form onSubmit={handleSearchSubmit} className="flex flex-1 items-center">
            <div className="relative flex-1">
              <input
                autoFocus
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-l-full border border-gray-300 pl-4 pr-9 outline-none focus:border-gray-500 text-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <button
              type="submit"
              className="h-10 rounded-r-full border border-l-0 border-gray-300 bg-gray-100 px-5 text-gray-700 hover:bg-gray-200"
            >
              <Search size={18} />
            </button>

            <button
              type="button"
              onClick={() => setMobileSearch(false)}
              className="ml-2 rounded-full p-2 text-gray-500 hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleSearchSubmit} className="mx-auto hidden max-w-2xl flex-1 items-center md:flex">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-l-full border border-gray-300 pl-5 pr-10 outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-400 text-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <button
              type="submit"
              aria-label="Search"
              className="flex h-10 items-center justify-center rounded-r-full border border-l-0 border-gray-300 bg-gray-100 px-6 text-gray-700 transition hover:bg-gray-200"
            >
              <Search size={18} />
            </button>
          </form>
        )}

        {!mobileSearch && (
          <div className="ml-auto flex items-center gap-2">
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

            {/* Profile / Auth Area */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-sm font-semibold text-white shadow-sm transition hover:ring-2 hover:ring-red-400 focus:outline-none"
                  title={user.name || user.email}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <span>{getInitial(user.name, user.email)}</span>
                  )}
                </button>

                {/* Profile Dropdown Menu */}
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl animate-in fade-in zoom-in-95">
                    {/* User Info Header */}
                    <div className="flex items-center gap-3 border-b border-gray-100 p-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600 text-base font-bold text-white shadow-sm">
                        {getInitial(user.name, user.email)}
                      </div>
                      <div className="overflow-hidden">
                        <p className="truncate font-semibold text-gray-900">
                          {user.name}
                        </p>
                        <p className="truncate text-xs text-gray-500">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="py-1">
                      <Link
                        href="/channel"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <UserIcon size={18} />
                        <span>Your channel</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut size={18} />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-full border border-gray-200 px-3.5 py-1.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
              >
                <UserCircle size={20} className="text-gray-600" />
                <span className="hidden sm:inline">Sign in</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}