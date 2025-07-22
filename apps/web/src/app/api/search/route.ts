import { NextRequest } from 'next/server';
import { searchBlogPosts } from '@/lib/algolia';

// Simple in-memory cache (for bonus feature)
const cache = new Map<string, { timestamp: number; results: any }>();
const CACHE_TTL = 60 * 5 * 1000; // 5 minutes

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';

  if (!query.trim()) {
    return new Response(JSON.stringify({ hits: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Check cache
  const cached = cache.get(query);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return new Response(JSON.stringify(cached.results), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' },
    });
  }

  // Search Algolia
  const results = await searchBlogPosts(query);
  cache.set(query, { timestamp: Date.now(), results });

  return new Response(JSON.stringify(results), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'X-Cache': 'MISS' },
  });
} 