import { notFound } from "next/navigation";
import { stegaClean } from "next-sanity";
import { ArticleJsonLd } from "@/components/json-ld";
import { RichText } from "@/components/richtext";
import { SanityImage } from "@/components/sanity-image";
import { TableOfContent } from "@/components/table-of-content";
import { sanityFetch } from "@/lib/sanity/live";
import { queryBlogSlugPageData, queryCategoryBySlug, queryBlogsByCategorySlug } from "@/lib/sanity/query";
import { getSEOMetadata } from "@/lib/seo";
import BlogCategoryNav from "@/components/blog-category-nav";
import { BlogCard } from "@/components/blog-card";

const PAGE_SIZE = 10;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const { data: blog } = await sanityFetch({ query: queryBlogSlugPageData, params: { slug: `/blog/${slug}` } });
  if (blog) {
    return getSEOMetadata({
      title: blog.seoTitle || blog.title,
      description: blog.seoDescription || blog.description,
      slug: blog.slug,
      contentType: "article",
    });
  }
  // Try category
  const { data: category } = await sanityFetch({ query: queryCategoryBySlug, params: { slug } });
  if (category) {
    return getSEOMetadata({
      title: category.seoTitle || category.title,
      description: category.seoDescription || category.description,
      slug: `/blog/${category.slug}`,
      contentType: "category",
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
  const { slug } = resolvedParams;
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
              <BlogCategoryNav />
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
  // Try category
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
        <BlogCategoryNav active={category.slug} />
        
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
      </main>
    );
  }
  return notFound();
}
