import { algoliasearch } from 'algoliasearch';

const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APPLICATION_ID as string;
const ALGOLIA_SEARCH_KEY = process.env.ALGOLIA_SEARCH_ID! 
const ALGOLIA_INDEX_NAME = process.env.ALGOLIA_INDEX_NAME || 'blog_posts'; // Your index name

export const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY);
const algoliaSearchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY);

export async function indexBlogPosts(posts: { objectID: string, title: string, description: string, slug: string }[]) {
  return algoliaClient.saveObjects({
    indexName: ALGOLIA_INDEX_NAME,
    objects: posts
  });
}

export async function searchBlogPosts(query: string) {
  return algoliaSearchClient.searchSingleIndex({
    indexName: ALGOLIA_INDEX_NAME,
    searchParams: {
      query
    }
  });
}

export function mapBlogToAlgoliaRecord(blog: any) {
  return {
    objectID: blog._id,
    title: blog.title,
    description: blog.description || '',
    slug: blog.slug,
  };
}