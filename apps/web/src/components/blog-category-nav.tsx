"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

interface Category {
  _id: string;
  title: string;
  slug: string;
}

export default function BlogCategoryNav({ active, categories }: { active?: string; categories: Category[] }) {
  return (
    <nav className="flex flex-wrap gap-3 mb-12">
      <Link
        href="/blog"
        data-state={!active ? "active" : undefined}
        className="px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 hover:scale-105 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        All
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat._id}
          href={`/blog/${cat.slug}`}
          data-state={active === cat.slug ? "active" : undefined}
          className="px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 hover:scale-105 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          {cat.title}
        </Link>
      ))}
    </nav>
  );
} 