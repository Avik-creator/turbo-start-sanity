import { NextRequest } from "next/server";
import { sanityFetch } from "@/lib/sanity/live";
import { queryAllCategories } from "@/lib/sanity/query";

export async function GET(req: NextRequest) {
  const { data: categories } = await sanityFetch({ query: queryAllCategories });
  return new Response(
    JSON.stringify({ categories: (categories || []).map((cat: any) => ({ _id: cat._id, title: cat.title, slug: cat.slug })) }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
} 