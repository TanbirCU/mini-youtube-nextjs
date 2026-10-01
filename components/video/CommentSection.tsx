"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ThumbsUp, Trash2, Send, MessageSquare } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/api";
import { formatTimeAgo } from "@/lib/utils";

interface CommentItem {
  id: number;
  user_id?: number;
  name: string;
  avatar?: string;
  comment: string;
  likes: number;
  created_at?: string;
}

interface CommentSectionProps {
  videoId: number;
}

const FALLBACK_COMMENTS: CommentItem[] = [
  {
    id: 101,
    name: "Rahim Ahmed",
    avatar: "https://i.pravatar.cc/100?img=20",
    comment: "Great quality video! Really enjoyed watching this.",
    likes: 14,
    created_at: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
  },
  {
    id: 102,
    name: "Karim Ullah",
    avatar: "https://i.pravatar.cc/100?img=21",
    comment: "The sound and presentation are on point. Keep it up!",
    likes: 6,
    created_at: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
  },
];

export default function CommentSection({ videoId }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    id?: number;
    name?: string;
    avatar?: string;
  } | null>(null);

  // Load current user
  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch {}
  }, []);

  // Fetch comments from database API
  useEffect(() => {
    async function loadComments() {
      try {
        setLoading(true);
        const res = await fetch(API_ENDPOINTS.COMMENTS(videoId));
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data) && json.data.length > 0) {
            const mapped = json.data.map((c: any) => ({
              id: c.id,
              user_id: c.user_id,
              name: c.user?.name || "Viewer",
              avatar: c.user?.avatar || "",
              comment: c.comment,
              likes: c.likes || 0,
              created_at: c.created_at,
            }));
            setComments(mapped);
            return;
          }
        }
      } catch (err) {
        console.error("Could not load comments from API:", err);
      } finally {
        setLoading(false);
      }

      // If no API comments yet, check localStorage for this video
      try {
        const local = localStorage.getItem(`minitube_comments_${videoId}`);
        if (local) {
          setComments(JSON.parse(local));
          return;
        }
      } catch {}

      // Default sample comments
      setComments(FALLBACK_COMMENTS);
    }

    if (videoId) {
      loadComments();
    }
  }, [videoId]);

  const saveLocalComments = (newList: CommentItem[]) => {
    try {
      localStorage.setItem(
        `minitube_comments_${videoId}`,
        JSON.stringify(newList)
      );
    } catch {}
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = commentText.trim();
    if (!text || isSubmitting) return;

    setIsSubmitting(true);

    const authorName = currentUser?.name || "Guest Viewer";
    const authorAvatar = currentUser?.avatar || "";
    const token = localStorage.getItem("token");

    // Optimistic comment item
    const tempComment: CommentItem = {
      id: Date.now(),
      user_id: currentUser?.id,
      name: authorName,
      avatar: authorAvatar,
      comment: text,
      likes: 0,
      created_at: new Date().toISOString(),
    };

    const updated = [tempComment, ...comments];
    setComments(updated);
    saveLocalComments(updated);
    setCommentText("");

    // Send to backend API if token exists
    if (token) {
      try {
        const res = await fetch(API_ENDPOINTS.COMMENTS(videoId), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ comment: text }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            const serverComment: CommentItem = {
              id: json.data.id,
              user_id: json.data.user_id,
              name: json.data.user?.name || authorName,
              avatar: json.data.user?.avatar || authorAvatar,
              comment: json.data.comment,
              likes: json.data.likes || 0,
              created_at: json.data.created_at,
            };
            const synced = [
              serverComment,
              ...updated.filter((c) => c.id !== tempComment.id),
            ];
            setComments(synced);
            saveLocalComments(synced);
          }
        }
      } catch (err) {
        console.error("Failed to post comment to server:", err);
      }
    }

    setIsSubmitting(false);
  };

  const handleLike = async (commentId: number) => {
    const updated = comments.map((c) =>
      c.id === commentId ? { ...c, likes: c.likes + 1 } : c
    );
    setComments(updated);
    saveLocalComments(updated);

    try {
      await fetch(API_ENDPOINTS.LIKE_COMMENT(commentId), {
        method: "POST",
      });
    } catch {}
  };

  const handleDelete = async (commentId: number) => {
    const updated = comments.filter((c) => c.id !== commentId);
    setComments(updated);
    saveLocalComments(updated);

    const token = localStorage.getItem("token");
    if (token) {
      try {
        await fetch(API_ENDPOINTS.DELETE_COMMENT(commentId), {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch {}
    }
  };

  const userInitial = currentUser?.name
    ? currentUser.name.charAt(0).toUpperCase()
    : "U";

  return (
    <section className="mt-10 border-t pt-8">
      <div className="flex items-center gap-3">
        <MessageSquare size={22} className="text-gray-700" />
        <h2 className="text-xl font-bold text-gray-900">
          Comments ({comments.length})
        </h2>
      </div>

      {/* Add Comment Input Form */}
      <form onSubmit={handleAddComment} className="mt-6 flex gap-3">
        {currentUser?.avatar ? (
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white shadow-sm">
            {userInitial}
          </div>
        )}

        <div className="flex-1">
          <textarea
            rows={2}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={
              currentUser
                ? "Add a comment as " + currentUser.name + "..."
                : "Add a comment..."
            }
            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none transition focus:border-gray-900 focus:bg-white focus:ring-1 focus:ring-gray-900"
          />

          <div className="mt-2 flex items-center justify-between">
            {!currentUser && (
              <span className="text-xs text-gray-500">
                Commenting as Guest.{" "}
                <Link href="/login" className="font-medium text-red-600 hover:underline">
                  Sign in
                </Link>{" "}
                to save with your profile.
              </span>
            )}

            <div className="ml-auto flex items-center gap-2">
              {commentText && (
                <button
                  type="button"
                  onClick={() => setCommentText("")}
                  className="rounded-full px-4 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                disabled={!commentText.trim() || isSubmitting}
                className="flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={14} />
                <span>{isSubmitting ? "Posting..." : "Comment"}</span>
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="mt-8 space-y-6">
        {comments.map((comment) => {
          const initial = comment.name ? comment.name.charAt(0).toUpperCase() : "U";
          const isOwner = currentUser?.id && comment.user_id === currentUser.id;

          return (
            <div key={comment.id} className="group flex gap-3">
              {comment.avatar ? (
                <img
                  src={comment.avatar}
                  alt={comment.name}
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-800 text-sm font-bold text-white shadow-sm">
                  {initial}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900">
                    {comment.name}
                  </p>
                  {comment.created_at && (
                    <span className="text-xs text-gray-400">
                      • {formatTimeAgo(comment.created_at)}
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm leading-6 text-gray-800 whitespace-pre-wrap">
                  {comment.comment}
                </p>

                <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                  <button
                    onClick={() => handleLike(comment.id)}
                    className="flex items-center gap-1.5 transition hover:text-gray-900"
                  >
                    <ThumbsUp size={14} />
                    <span>{comment.likes > 0 ? comment.likes : "Like"}</span>
                  </button>

                  {isOwner && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="flex items-center gap-1 text-red-500 opacity-0 transition group-hover:opacity-100 hover:text-red-700"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}