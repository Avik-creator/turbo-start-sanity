'use client';

import React from 'react';
import { InstantSearch, SearchBox, Hits, Configure, useSearchBox } from 'react-instantsearch';
import { algoliasearch } from 'algoliasearch';
import Link from 'next/link';

const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APPLICATION_ID as string;
const ALGOLIA_SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_ID as string;

const searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY);

function Hit({ hit }: { hit: any }) {
  return (
    <Link
      href={`/blog/${hit.slug}`}
      className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors border-b border-gray-100 dark:border-zinc-700 last:border-b-0"
    >
      <div className="font-semibold text-lg">{hit.title}</div>
      {hit.description && (
        <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
          {hit.description}
        </div>
      )}
    </Link>
  );
}

function CustomHits() {
  const { query } = useSearchBox();
  
  if (!query) return null;
  
  return (
    <div className="absolute z-10 w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg mt-2 shadow-lg max-h-80 overflow-y-auto">
      <Hits 
        hitComponent={Hit}
        classNames={{
          root: '',
          list: '',
          item: '',
        }}
      />
    </div>
  );
}

export default function BlogSearchInstantSearch() {
  return (
    <div className="relative max-w-xl mx-auto mb-8">
      <InstantSearch searchClient={searchClient} indexName="blog_posts">
        <Configure hitsPerPage={5} />
        <SearchBox
          placeholder="Search blog posts..."
          classNames={{
            root: 'relative',
            form: 'relative',
            input: 'w-full px-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100',
            submit: 'hidden',
            reset: 'absolute right-3 top-2 text-gray-400 hover:text-gray-600 cursor-pointer',
            loadingIndicator: 'absolute right-3 top-2 text-gray-400',
          }}
        />
        <CustomHits />
      </InstantSearch>
    </div>
  );
} 