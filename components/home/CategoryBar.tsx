"use client";

import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "@/lib/api";
import { categories as fallbackCategories } from "@/data/categories";

interface Category {
  id: number;
  name: string;
}

interface CategoryBarProps {
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
}

export default function CategoryBar({
  selectedCategory,
  onSelectCategory,
}: CategoryBarProps = {}) {
  const [internalSelected, setInternalSelected] = useState("All");
  const selected = selectedCategory ?? internalSelected;
  const handleSelect = onSelectCategory ?? setInternalSelected;

  const [categoryList, setCategoryList] = useState<string[]>(fallbackCategories);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(API_ENDPOINTS.CATEGORIES);
        if (!res.ok) {
          throw new Error("Failed to fetch categories");
        }

        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          const names = json.data.map((c: Category) => c.name);
          // Prepend "All" and avoid duplicates
          setCategoryList([
            "All",
            ...names.filter((n: string) => n.toLowerCase() !== "all"),
          ]);
        }
      } catch (err) {
        console.error("Could not fetch categories from API:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return (
    <div className="sticky top-16 z-30 overflow-x-auto border-b bg-white no-scrollbar">
      <div className="flex min-w-max gap-2.5 px-4 py-3">
        {categoryList.map((category) => (
          <button
            key={category}
            onClick={() => handleSelect(category)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
              selected.toLowerCase() === category.toLowerCase()
                ? "bg-gray-900 text-white shadow-sm"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}