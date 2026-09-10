"use client";

import { useState } from "react";
import { categories } from "@/data/categories";

export default function CategoryBar() {
  const [selected, setSelected] = useState("All");

  return (
    <div className="sticky top-16 z-30 overflow-x-auto border-b bg-white">
      <div className="flex min-w-max gap-3 px-4 py-3">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelected(category)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              selected === category
                ? "bg-gray-900 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}