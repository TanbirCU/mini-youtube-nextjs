"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Settings as SettingsIcon,
  User,
  PlaySquare,
  Shield,
  Bell,
  Sun,
  Moon,
  Trash2,
  Check,
  LogOut,
  ExternalLink,
  Save,
  Loader2,
  AlertCircle,
  Tv,
} from "lucide-react";
import { API_ENDPOINTS } from "@/lib/api";
import {
  clearWatchHistory,
  clearSavedVideos,
  getWatchHistory,
  getSavedVideos,
  getLikedVideos,
} from "@/lib/utils";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

export default function SettingsPage() {
  const router = useRouter();

  // Active Tab
  const [activeTab, setActiveTab] = useState<"account" | "playback" | "privacy" | "appearance">("account");

  // User State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Edit Profile Form
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Playback Preferences
  const [autoplay, setAutoplay] = useState(true);
  const [quality, setQuality] = useState("1080p");
  const [playbackSuccess, setPlaybackSuccess] = useState(false);

  // Privacy Counts
  const [historyCount, setHistoryCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [likedCount, setLikedCount] = useState(0);
  const [privacyMessage, setPrivacyMessage] = useState<string | null>(null);

  // Appearance
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");

  // Load user & settings
  useEffect(() => {
    // 1. Load user
    const token = localStorage.getItem("token");
    const stored = localStorage.getItem("user");

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        setName(parsed.name || "");
        setAvatar(parsed.avatar || "");
      } catch {}
    }

    if (token) {
      fetch(API_ENDPOINTS.ME, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setUser(data.user);
            setName(data.user.name || "");
            setAvatar(data.user.avatar || "");
            localStorage.setItem("user", JSON.stringify(data.user));
          }
        })
        .catch(console.error)
        .finally(() => setLoadingUser(false));
    } else {
      setLoadingUser(false);
    }

    // 2. Load playback preferences
    const savedAutoplay = localStorage.getItem("minitube_setting_autoplay");
    if (savedAutoplay !== null) {
      setAutoplay(savedAutoplay === "true");
    }

    const savedQuality = localStorage.getItem("minitube_setting_quality");
    if (savedQuality) {
      setQuality(savedQuality);
    }

    // 3. Load privacy counts
    setHistoryCount(getWatchHistory().length);
    setSavedCount(getSavedVideos().length);
    setLikedCount(getLikedVideos().length);
  }, []);

  // Save Profile Handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setProfileError("Please sign in to update your profile");
      return;
    }

    if (!name.trim()) {
      setProfileError("Name cannot be empty");
      return;
    }

    setSavingProfile(true);

    try {
      const res = await fetch(API_ENDPOINTS.ME, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          avatar: avatar.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      if (data.user) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        // Dispatch storage event to update Header & Sidebar
        window.dispatchEvent(new Event("storage"));
      }

      setProfileSuccess("Profile updated successfully!");
      setTimeout(() => setProfileSuccess(null), 3000);
    } catch (err: any) {
      setProfileError(err.message || "Failed to save profile");
    } finally {
      setSavingProfile(false);
    }
  };

  // Sign Out Handler
  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.dispatchEvent(new Event("storage"));
    router.push("/");
  };

  // Save Playback Settings
  const handleToggleAutoplay = () => {
    const next = !autoplay;
    setAutoplay(next);
    localStorage.setItem("minitube_setting_autoplay", String(next));
    showPlaybackNotice();
  };

  const handleQualityChange = (val: string) => {
    setQuality(val);
    localStorage.setItem("minitube_setting_quality", val);
    showPlaybackNotice();
  };

  const showPlaybackNotice = () => {
    setPlaybackSuccess(true);
    setTimeout(() => setPlaybackSuccess(false), 2000);
  };

  // Privacy Actions
  const handleClearHistory = () => {
    clearWatchHistory();
    setHistoryCount(0);
    setPrivacyMessage("Watch history cleared successfully");
    setTimeout(() => setPrivacyMessage(null), 3000);
  };

  const handleClearSaved = () => {
    clearSavedVideos();
    setSavedCount(0);
    setPrivacyMessage("Saved videos cleared successfully");
    setTimeout(() => setPrivacyMessage(null), 3000);
  };

  const handleClearLiked = () => {
    localStorage.removeItem("minitube_liked_videos");
    setLikedCount(0);
    setPrivacyMessage("Liked videos list cleared successfully");
    setTimeout(() => setPrivacyMessage(null), 3000);
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-100 text-gray-800 shadow-xs">
          <SettingsIcon size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Settings
          </h1>
          <p className="text-xs text-gray-500">
            Manage your account preferences, playback, and privacy
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex gap-2 border-b border-gray-100 pb-3 overflow-x-auto no-scrollbar">
        {[
          { id: "account", label: "Account", icon: User },
          { id: "playback", label: "Playback", icon: PlaySquare },
          { id: "privacy", label: "Privacy & Data", icon: Shield },
          { id: "appearance", label: "Appearance", icon: Sun },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                active
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* TAB 1: ACCOUNT */}
      {/* ======================================================== */}
      {activeTab === "account" && (
        <div className="space-y-6">
          {user ? (
            <>
              {/* Profile Card */}
              <div className="flex flex-col gap-5 rounded-3xl border border-gray-100 bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-16 w-16 rounded-full object-cover shadow-sm"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-xl font-bold text-white shadow-sm">
                      {userInitial}
                    </div>
                  )}

                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {user.name}
                    </h2>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <span className="mt-1.5 inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                      Active Account
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href="/channel"
                    className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
                  >
                    <Tv size={14} />
                    <span>View Channel</span>
                    <ExternalLink size={12} className="text-gray-400" />
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>

              {/* Edit Profile Form */}
              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xs">
                <h3 className="text-base font-bold text-gray-900">
                  Edit Profile Information
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Update your display name and avatar image URL
                </p>

                {profileSuccess && (
                  <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">
                    <Check size={16} />
                    <span>{profileSuccess}</span>
                  </div>
                )}

                {profileError && (
                  <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                    <AlertCircle size={16} />
                    <span>{profileError}</span>
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                      Display Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                      Avatar Image URL (optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/avatar.jpg"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={savingProfile || !name.trim()}
                      className="flex items-center gap-2 rounded-full bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:opacity-50"
                    >
                      {savingProfile ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Save size={16} />
                      )}
                      <span>{savingProfile ? "Saving..." : "Save Changes"}</span>
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            /* Not Logged In */
            <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-xs">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-500">
                <User size={28} />
              </div>
              <h2 className="mt-4 text-lg font-bold text-gray-900">
                You are not signed in
              </h2>
              <p className="mx-auto mt-1 max-w-sm text-xs text-gray-500 leading-relaxed">
                Sign in to customize your profile, sync subscriptions to your account,
                and upload videos.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Link
                  href="/login"
                  className="rounded-full bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="rounded-full border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Create Account
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: PLAYBACK */}
      {/* ======================================================== */}
      {activeTab === "playback" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xs">
            <h3 className="text-base font-bold text-gray-900">
              Playback Experience
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Customize how videos play across MiniTube
            </p>

            {playbackSuccess && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs font-semibold text-emerald-800">
                <Check size={14} />
                <span>Preferences saved</span>
              </div>
            )}

            <div className="mt-6 divide-y divide-gray-100">
              {/* Autoplay Toggle */}
              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="font-semibold text-sm text-gray-900">
                    Autoplay videos
                  </p>
                  <p className="text-xs text-gray-500">
                    Automatically start playing videos immediately when you open a video page
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleToggleAutoplay}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    autoplay ? "bg-red-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      autoplay ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Default Quality */}
              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="font-semibold text-sm text-gray-900">
                    Default Video Quality
                  </p>
                  <p className="text-xs text-gray-500">
                    Preferred resolution for video streams
                  </p>
                </div>

                <select
                  value={quality}
                  onChange={(e) => handleQualityChange(e.target.value)}
                  className="rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 outline-none transition focus:border-gray-900"
                >
                  <option value="1080p">1080p (HD)</option>
                  <option value="720p">720p</option>
                  <option value="480p">480p</option>
                  <option value="Auto">Auto</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: PRIVACY & DATA */}
      {/* ======================================================== */}
      {activeTab === "privacy" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xs">
            <h3 className="text-base font-bold text-gray-900">
              Manage History &amp; Privacy
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Control your activity and saved preferences on this device
            </p>

            {privacyMessage && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs font-semibold text-emerald-800">
                <Check size={14} />
                <span>{privacyMessage}</span>
              </div>
            )}

            <div className="mt-6 divide-y divide-gray-100">
              {/* Clear Watch History */}
              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="font-semibold text-sm text-gray-900">
                    Clear Watch History
                  </p>
                  <p className="text-xs text-gray-500">
                    {historyCount} {historyCount === 1 ? "video" : "videos"} logged in history
                  </p>
                </div>

                <button
                  onClick={handleClearHistory}
                  disabled={historyCount === 0}
                  className="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Trash2 size={13} />
                  <span>Clear History</span>
                </button>
              </div>

              {/* Clear Saved Videos */}
              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="font-semibold text-sm text-gray-900">
                    Clear Saved Videos
                  </p>
                  <p className="text-xs text-gray-500">
                    {savedCount} {savedCount === 1 ? "video" : "videos"} saved for later
                  </p>
                </div>

                <button
                  onClick={handleClearSaved}
                  disabled={savedCount === 0}
                  className="flex items-center gap-1.5 rounded-full border border-gray-200 px-4 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Trash2 size={13} />
                  <span>Clear Saved</span>
                </button>
              </div>

              {/* Clear Liked Videos */}
              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="font-semibold text-sm text-gray-900">
                    Reset Liked Videos
                  </p>
                  <p className="text-xs text-gray-500">
                    {likedCount} {likedCount === 1 ? "video" : "videos"} currently liked
                  </p>
                </div>

                <button
                  onClick={handleClearLiked}
                  disabled={likedCount === 0}
                  className="flex items-center gap-1.5 rounded-full border border-gray-200 px-4 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Trash2 size={13} />
                  <span>Reset Likes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: APPEARANCE */}
      {/* ======================================================== */}
      {activeTab === "appearance" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xs">
            <h3 className="text-base font-bold text-gray-900">
              Theme &amp; Visual Appearance
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Choose how MiniTube looks to you
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { id: "light", label: "Light theme", desc: "Default bright theme", icon: Sun },
                { id: "dark", label: "Dark theme", desc: "Easier on the eyes", icon: Moon },
                { id: "system", label: "Use device theme", desc: "Matches system preferences", icon: Shield },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = theme === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => setTheme(item.id as any)}
                    className={`cursor-pointer rounded-2xl border p-4 transition ${
                      isSelected
                        ? "border-red-600 bg-red-50/50 ring-1 ring-red-600"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <Icon size={20} className={isSelected ? "text-red-600" : "text-gray-500"} />
                    <p className="mt-3 font-semibold text-sm text-gray-900">
                      {item.label}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
