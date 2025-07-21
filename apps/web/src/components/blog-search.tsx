'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface BlogHit {
  objectID: string;
  title: string;
  description?: string;
  slug: string;
}

export default function BlogSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BlogHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }
    setLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => {
          setResults(data.hits || []);
          setShowResults(true);
        })
        .finally(() => setLoading(false));
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <div className="relative max-w-xl mx-auto mb-8">
      <input
        type="text"
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-primary"
        placeholder="Search blog posts..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query && setShowResults(true)}
        onBlur={() => setTimeout(() => setShowResults(false), 200)}
        aria-label="Search blog posts"
      />
      {loading && (
        <div className="absolute right-3 top-2 text-gray-400 animate-spin">⏳</div>
      )}
      {showResults && results.length > 0 && (
        <div className="absolute z-10 w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg mt-2 shadow-lg max-h-80 overflow-y-auto">
          {results.map((hit) => (
            <Link
              key={hit.objectID}
              href={`/blog/${hit.slug}`}
              className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              onClick={() => setShowResults(false)}
            >
              <div className="font-semibold text-lg">{hit.title}</div>
              {hit.description && (
                <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{hit.description}</div>
              )}
            </Link>
          ))}
        </div>
      )}
      {showResults && !loading && results.length === 0 && (
        <div className="absolute z-10 w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg mt-2 shadow-lg p-4 text-center text-gray-500 dark:text-gray-400">
          No results found.
        </div>
      )}
    </div>
  );
} 