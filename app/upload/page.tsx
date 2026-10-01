"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  Video,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Search,
  ChevronDown,
  Check,
  X,
} from "lucide-react";
import { API_ENDPOINTS } from "@/lib/api";

interface Category {
  id: number;
  name: string;
}

export default function UploadPage() {
  const router = useRouter();

  // Categories from database
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Category search states
  const [categorySearch, setCategorySearch] = useState("");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);

  // Form states
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [visibility, setVisibility] = useState("Public");

  // Submission states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Close category dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        categoryRef.current &&
        !categoryRef.current.contains(event.target as Node)
      ) {
        setIsCategoryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedCategoryObj = categories.find(
    (c) => String(c.id) === String(categoryId)
  );

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  // 1. Fetch categories from Database via API
  useEffect(() => {
    async function loadCategories() {
      try {
        setLoadingCategories(true);
        const res = await fetch(API_ENDPOINTS.CATEGORIES);

        if (!res.ok) {
          throw new Error("Failed to load categories");
        }

        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          setCategories(json.data);
          if (json.data.length > 0) {
            setCategoryId(String(json.data[0].id));
          }
        }
      } catch (err: any) {
        console.error("Error fetching categories:", err);
        setError("Could not load categories from database.");
      } finally {
        setLoadingCategories(false);
      }
    }

    loadCategories();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.toLowerCase().endsWith(".mp4")) {
        setError("Only MP4 videos are supported by the server");
        return;
      }
      setFile(selectedFile);
      setError(null);
      // Auto fill title if empty
      if (!title) {
        const autoTitle = selectedFile.name.replace(/\.[^/.]+$/, "");
        setTitle(autoTitle);
      }
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please sign in to upload videos");
      return;
    }

    if (!file) {
      setError("Please select a video file (.mp4)");
      return;
    }

    if (!title.trim()) {
      setError("Please provide a video title");
      return;
    }

    if (!categoryId) {
      setError("Please select a category");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("category_id", categoryId);
      formData.append("video", file);

      const res = await fetch(API_ENDPOINTS.VIDEOS, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to upload video");
      }

      setSuccess("Video uploaded successfully! Redirecting...");
      setTimeout(() => {
        router.push("/channel");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Something went wrong during upload");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900">Upload video</h1>
      <p className="mt-1 text-sm text-gray-500">
        Share your video with the world.
      </p>

      {/* Notifications */}
      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handlePublish} className="mt-6 space-y-7">
        {/* Upload Dropzone */}
        <label className="flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center transition hover:border-gray-400 hover:bg-gray-100">
          <UploadCloud size={50} className="text-gray-400" />

          <h2 className="mt-4 text-lg font-semibold text-gray-800">
            {file ? file.name : "Drag and drop your video"}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {file
              ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
              : "MP4 supported (max 500MB)"}
          </p>

          <span className="mt-5 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800">
            {file ? "Change video" : "Select video"}
          </span>

          <input
            type="file"
            accept="video/mp4"
            disabled={loading}
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        {/* Video details form */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <Video size={22} className="text-gray-700" />
            <h2 className="font-semibold text-gray-900">Video details</h2>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
                placeholder="Enter video title"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                placeholder="Tell viewers about your video..."
                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:bg-gray-50"
              />
            </div>

            {/* Searchable Dynamic Category Selector */}
            <div ref={categoryRef}>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Category <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                {/* Trigger Button */}
                <button
                  type="button"
                  disabled={loading || loadingCategories}
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className="flex w-full items-center justify-between rounded-xl border border-gray-300 bg-white px-4 py-3 text-left outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:bg-gray-50"
                >
                  <span
                    className={
                      selectedCategoryObj ? "text-gray-900" : "text-gray-400"
                    }
                  >
                    {loadingCategories
                      ? "Loading categories from database..."
                      : selectedCategoryObj
                      ? selectedCategoryObj.name
                      : "Select a category"}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-gray-400 transition-transform ${
                      isCategoryOpen ? "rotate-180 text-gray-700" : ""
                    }`}
                  />
                </button>

                {/* Dropdown with Search */}
                {isCategoryOpen && (
                  <div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-2xl border border-gray-200 bg-white shadow-xl animate-in fade-in zoom-in-95">
                    {/* Search Input Box */}
                    <div className="relative border-b border-gray-100 p-2.5">
                      <Search
                        size={16}
                        className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        autoFocus
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        placeholder="Search category..."
                        className="w-full rounded-xl bg-gray-50 py-2 pl-9 pr-8 text-sm outline-none transition focus:bg-white focus:ring-1 focus:ring-gray-900"
                      />
                      {categorySearch && (
                        <button
                          type="button"
                          onClick={() => setCategorySearch("")}
                          className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    {/* Filtered Category List */}
                    <div className="max-h-56 overflow-y-auto p-1.5">
                      {filteredCategories.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-400">
                          No category found matching &quot;{categorySearch}&quot;
                        </div>
                      ) : (
                        filteredCategories.map((cat) => {
                          const isSelected = String(cat.id) === String(categoryId);
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => {
                                setCategoryId(String(cat.id));
                                setIsCategoryOpen(false);
                                setCategorySearch("");
                              }}
                              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm transition ${
                                isSelected
                                  ? "bg-gray-100 font-semibold text-gray-900"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              <span>{cat.name}</span>
                              {isSelected && (
                                <Check size={16} className="text-red-600" />
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
              <p className="mt-1.5 text-xs text-gray-500">
                Loaded dynamically from database • Searchable
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Visibility
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                disabled={loading}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:bg-gray-50"
              >
                <option value="Public">Public</option>
                <option value="Unlisted">Unlisted</option>
                <option value="Private">Private</option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 border-t border-gray-100 pt-5">
            <Link
              href="/"
              className="rounded-full px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading || loadingCategories}
              className="flex items-center gap-2 rounded-full bg-red-600 px-6 py-2.5 font-medium text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              <span>{loading ? "Publishing..." : "Publish video"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}