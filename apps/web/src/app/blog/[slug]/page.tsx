import { notFound } from "next/navigation";
import { sanityFetch } from "@/lib/sanity/live";
import { queryBlogSlugPageData, queryCategoryBySlug, queryBlogsByCategorySlug, queryAllCategories, querySlugType } from "@/lib/sanity/query";
import { getSEOMetadata } from "@/lib/seo";
import { client } from "@/lib/sanity/client";
import BlogPageContent from "@/components/blogPageSection/BlogPageContent";
import CategoryPageContent from "@/components/blogPageSection/CategoryPageContent";


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
      return <BlogPageContent blog={blog} categories={categories} />;
    }
  } else if (slugType?._type === "category") {
    const { data: category } = await sanityFetch({ query: queryCategoryBySlug, params: { slug } });
    if (category) {
      const page = parseInt(resolvedSearchParams?.page || '1', 10);
      const { data: blogs } = await sanityFetch({
        query: queryBlogsByCategorySlug,
        params: { slug },
      });
      return <CategoryPageContent category={category} blogs={blogs} categories={categories} slug={slug} page={page} />;
    }
  }
  return notFound();
}
