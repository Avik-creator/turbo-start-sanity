import { notFound } from "next/navigation";
import { stegaClean } from "next-sanity";
import { ArticleJsonLd } from "@/components/json-ld";
import { RichText } from "@/components/richtext";
import { SanityImage } from "@/components/sanity-image";
import { TableOfContent } from "@/components/table-of-content";
import { sanityFetch } from "@/lib/sanity/live";
import { queryBlogSlugPageData, queryCategoryBySlug, queryBlogsByCategorySlug, queryAllCategories, querySlugType } from "@/lib/sanity/query";
import { getSEOMetadata } from "@/lib/seo";
import BlogCategoryNav from "@/components/blog-category-nav";
import { BlogCard } from "@/components/blog-card";
import { client } from "@/lib/sanity/client";

const PAGE_SIZE = 10;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const { data: slugType } = await sanityFetch({ query: querySlugType, params: { slug } });
  if (slugType?._type === "category") {
    const { data: category } = await sanityFetch({ query: queryCategoryBySlug, params: { slug } });
    return getSEOMetadata({
      title: category.seoTitle || category.title,
      description: category.seoDescription || category.description,
      slug: `/blog/${category.slug}`,
      contentType: "category",
    });
  }else if (slugType?._type === "blog") {
    const { data: blog } = await sanityFetch({ query: queryBlogSlugPageData, params: { slug: `/blog/${slug}` } });
    return getSEOMetadata({
      title: blog.seoTitle || blog.title,
      description: blog.seoDescription || blog.description,
      slug: blog.slug,
      contentType: "article",
    });
  }
  return {};
  
}

export default async function BlogSlugOrCategoryPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ slug: string }>, 
  searchParams: Promise<{ page?: string }> 
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const categories = await client.fetch(queryAllCategories);

  const { slug } = resolvedParams;
  const { data: slugType } = await sanityFetch({ query: querySlugType, params: { slug } });

  if (slugType?._type === "blog") {
    const { data: blog } = await sanityFetch({ query: queryBlogSlugPageData, params: { slug: `/blog/${slug}` } });
    if (blog) {
      const { title, description, image, richText } = blog ?? {};
      return (
        <div className="container my-16 mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
            <main>
              <ArticleJsonLd article={stegaClean(blog)} />
              <header className="mb-8">
                <h1 className="mt-2 text-4xl font-bold">{title}</h1>
                <p className="mt-4 text-lg text-muted-foreground">{description}</p>
              </header>
              {image && (
                <div className="mb-12">
                  <SanityImage
                    asset={image}
                    alt={title}
                    width={1600}
                    loading="eager"
                    priority
                    height={900}
                    className="rounded-lg h-auto w-full"
                  />
                </div>
              )}
              <RichText richText={richText ?? []} />
              {/* Category Nav under content */}
              <div className="mt-12 flex justify-center">
                <BlogCategoryNav categories={categories} />
              </div>
            </main>
            <div className="hidden lg:block">
              <div className="sticky top-4 rounded-lg ">
                <TableOfContent richText={richText} />
              </div>
            </div>
          </div>
        </div>
      );
    }
  } else if (slugType?._type === "category") {
    const { data: category } = await sanityFetch({ query: queryCategoryBySlug, params: { slug } });
    if (category) {
      const page = parseInt(resolvedSearchParams?.page || '1', 10);
      const { data: blogs } = await sanityFetch({
        query: queryBlogsByCategorySlug,
        params: { slug },
      });
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
  }
  return notFound();
}
