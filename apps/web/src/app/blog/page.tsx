import { notFound } from "next/navigation";

import { BlogCard, BlogHeader, FeaturedBlogCard } from "@/components/blog-card";
import { PageBuilder } from "@/components/pagebuilder";
import { sanityFetch } from "@/lib/sanity/live";
import { queryBlogIndexPageData, queryAllCategories } from "@/lib/sanity/query";
import { getSEOMetadata } from "@/lib/seo";
import { handleErrors } from "@/utils";
import BlogSearchInstantSearch from '@/components/blog-search-instantsearch';
import BlogCategoryNav from '@/components/blog-category-nav';
import { client } from "@/lib/sanity/client";

async function fetchBlogPosts() {
  return await handleErrors(sanityFetch({ query: queryBlogIndexPageData }));
}

export async function generateMetadata() {
  const { data: result } = await sanityFetch({
    query: queryBlogIndexPageData,
    stega: false,
  });
  return getSEOMetadata(
    result
      ? {
          title: result?.title ?? result?.seoTitle ?? "",
          description: result?.description ?? result?.seoDescription ?? "",
          slug: result?.slug,
          contentId: result?._id,
          contentType: result?._type,
        }
      : {},
  );
}

export default async function BlogIndexPage() {
  const [res, err] = await fetchBlogPosts();
  if (err || !res?.data) notFound();

  // Fetch categories on the server
  const categories = await client.fetch(queryAllCategories);

  const {
    blogs = [],
    title,
    description,
    pageBuilder = [],
    _id,
    _type,
    displayFeaturedBlogs,
    featuredBlogsCount,
  } = res.data;

  const validFeaturedBlogsCount = featuredBlogsCount
    ? Number.parseInt(featuredBlogsCount)
    : 0;

  if (!blogs.length) {
    return (
      <main className="container my-16 mx-auto px-4 md:px-6">
        <BlogHeader title={title} description={description} />
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No blog posts available at the moment.
          </p>
        </div>
        {pageBuilder && pageBuilder.length > 0 && (
          <PageBuilder pageBuilder={pageBuilder} id={_id} type={_type} />
        )}
      </main>
    );
  }

  const shouldDisplayFeaturedBlogs =
    displayFeaturedBlogs && validFeaturedBlogsCount > 0;

  const featuredBlogs = shouldDisplayFeaturedBlogs
    ? blogs.slice(0, validFeaturedBlogsCount)
    : [];
  const remainingBlogs = shouldDisplayFeaturedBlogs
    ? blogs.slice(validFeaturedBlogsCount)
    : blogs;

  return (
    <main className="bg-background">
      <div className="container my-16 mx-auto px-4 md:px-6">
        {/* Blog page header */}
        <div className="mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Insights & hot takes</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed">
            We share discourse on the latest tech. Keep up-to-date with content operating systems, workflows, scalability and sometimes, the odd CMS roast
          </p>
        </div>
        {/* Section header */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground">All articles</h2>
        </div>
        {/* Search bar */}
        <BlogSearchInstantSearch />
        {/* Category nav */}
        <div className="flex justify-center">
          <BlogCategoryNav categories={categories} />
        </div>
        {/* Featured blogs */}
        {featuredBlogs.length > 0 && (
          <div className="mx-auto mt-8 sm:mt-12 md:mt-16 mb-12 lg:mb-20 grid grid-cols-1 gap-8 md:gap-12">
            {featuredBlogs.map((blog: any) => (
              <FeaturedBlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        )}
        {/* Remaining blogs */}
        {remainingBlogs.length > 0 && (
          <div className="grid grid-cols-1 gap-8 md:gap-12 lg:grid-cols-2 mt-8">
            {remainingBlogs.map((blog: any) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        )}

        {/* Pokemon Test Section */}
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
      </div>
      {pageBuilder && pageBuilder.length > 0 && (
        <PageBuilder pageBuilder={pageBuilder} id={_id} type={_type} />
      )}
    </main>
  );
}
