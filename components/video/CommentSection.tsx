const comments = [
  {
    id: 1,
    name: "Rahim",
    avatar: "https://i.pravatar.cc/100?img=20",
    comment: "Great tutorial. Very easy to understand!",
    likes: 24,
  },
  {
    id: 2,
    name: "Karim",
    avatar: "https://i.pravatar.cc/100?img=21",
    comment: "This helped me a lot. Thanks!",
    likes: 12,
  },
  {
    id: 3,
    name: "Sakib",
    avatar: "https://i.pravatar.cc/100?img=22",
    comment: "Please make more Go tutorials.",
    likes: 8,
  },
];

export default function CommentSection() {
  return (
    <section className="mt-10">

      <h2 className="text-xl font-bold">
        Comments {comments.length}
      </h2>

      <div className="mt-5 flex gap-3">
        <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200" />

        <div className="flex-1">
          <input
            placeholder="Add a comment..."
            className="w-full border-b border-gray-300 py-2 text-sm outline-none focus:border-gray-900"
          />

          <div className="mt-3 flex justify-end gap-2">
            <button className="rounded-full px-4 py-2 text-sm hover:bg-gray-100">
              Cancel
            </button>

            <button className="rounded-full bg-gray-900 px-5 py-2 text-sm text-white">
              Comment
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-7">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <img
              src={comment.avatar}
              alt={comment.name}
              className="h-10 w-10 rounded-full"
            />

            <div>
              <p className="text-sm font-semibold">
                {comment.name}
              </p>

              <p className="mt-1 text-sm leading-6">
                {comment.comment}
              </p>

              <div className="mt-2 flex gap-4 text-xs text-gray-500">
                <button>👍 {comment.likes}</button>
                <button>Reply</button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}