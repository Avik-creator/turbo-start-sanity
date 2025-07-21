"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

interface Category {
  _id: string;
  title: string;
  slug: string;
}

export default function BlogCategoryNav({ active }: { active?: string }) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []));
  }, []);

  return (
    <nav className="flex flex-wrap gap-3 mb-12">
      <Link
        href="/blog"
        className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 hover:scale-105 ${
          !active 
            ? "bg-primary text-primary-foreground shadow-md" 
            : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        All
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat._id}
          href={`${cat.slug}`}
          className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 hover:scale-105 ${
            active === cat.slug 
              ? "bg-primary text-primary-foreground shadow-md" 
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          {cat.title}
        </Link>
      ))}
    </nav>
  );
} 