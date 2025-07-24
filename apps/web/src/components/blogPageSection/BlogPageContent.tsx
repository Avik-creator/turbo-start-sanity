import { stegaClean } from "next-sanity";
import { ArticleJsonLd } from "@/components/json-ld";
import { RichText } from "@/components/richtext";
import { SanityImage } from "@/components/sanity-image";
import BlogCategoryNav from "@/components/blog-category-nav";
import { TableOfContent } from "@/components/table-of-content";
import React from "react";

export default function BlogPageContent({ blog, categories }: { blog: any, categories: any[] }) {
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