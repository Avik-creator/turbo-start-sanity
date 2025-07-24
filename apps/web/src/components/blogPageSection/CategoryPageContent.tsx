import BlogCategoryNav from "@/components/blog-category-nav";
import { BlogCard } from "@/components/blog-card";
import React from "react";

const PAGE_SIZE = 10;

export default function CategoryPageContent({ category, blogs, categories, slug, page }: {
  category: any,
  blogs: any[],
  categories: any[],
  slug: string,
  page: number
}) {
  const pagedBlogs = (blogs || []).slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);
  return (
    <main className="container my-16 mx-auto px-4 md:px-6">
      {/* Category nav at the top */}
      <BlogCategoryNav active={slug} categories={categories} />
      {/* Category header section */}
      <div className="mb-16">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 capitalize">
          {category.title}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed">
          {category.description || 
            "We share discourse on the latest tech. Keep up-to-date with content operating systems, workflows, scalability and sometimes, the odd CMS roast"
          }
        </p>
      </div>
      {/* Section header */}
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
          All articles in <span className="capitalize">{category.title}</span>
        </h2>
      </div>
      {/* Blog posts */}
      {pagedBlogs.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground">
            No articles in this category yet. Check back soon for new content!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:gap-12 lg:grid-cols-2">
          {pagedBlogs.map((blog: any) => (
            <BlogCard key={blog._id} blog={blog} />
          ))}
        </div>
      )}
      {/* Pagination */}
      {blogs && blogs.length > PAGE_SIZE && (
        <div className="flex justify-center mt-16 gap-3">
          {Array.from({ length: Math.ceil(blogs.length / PAGE_SIZE) }).map((_, i) => (
            <a
              key={i}
              href={`?page=${i+1}`}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 ${
                page === i+1 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {i+1}
            </a>
          ))}
        </div>
      )}
      <div className="mt-16">
        <h2 className="text-2xl md:text-3xl font-semibold mb-8">Featured Pokémon in Blogs</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogs
            .filter((blog: any) => blog.pokemon)
            .map((blog: any) => (
              <div
                key={blog._id}
                className="p-6 border rounded-lg bg-card hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={blog.pokemon.sprite}
                    alt={blog.pokemon.name}
                    className="w-16 h-16"
                  />
                  <div>
                    <h3 className="font-semibold capitalize">{blog.pokemon.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Types: {blog.pokemon.types?.join(", ")}
                    </p>
                    <p className="text-xs text-muted-foreground">ID: {blog.pokemon.id}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium">From blog: {blog.title}</p>
                  <a
                    href={`${blog.slug}`}
                    className="text-xs text-primary hover:underline"
                  >
                    Read more →
                  </a>
                </div>
              </div>
            ))}
        </div>
        {blogs.filter((blog: any) => blog.pokemon).length === 0 && (
          <p className="text-muted-foreground text-center py-8">
            No Pokémon featured in blog posts yet. Add some Pokémon to your blog posts in the Sanity Studio!
          </p>
        )}
      </div>
    </main>
  );
} 