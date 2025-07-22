import { client } from '../lib/sanity/client.js';
import { queryBlogIndexPageData } from '../lib/sanity/query.js';
import { indexBlogPosts, mapBlogToAlgoliaRecord } from '../lib/algolia.js';

async function main() {
  console.log('Fetching blog posts from Sanity...');
  const data = await client.fetch(queryBlogIndexPageData);
  const blogs = data?.blogs || [];
  if (!blogs.length) {
    console.log('No blog posts found.');
    return;
  }
  const records = blogs.map(mapBlogToAlgoliaRecord);
  console.log(`Indexing ${records.length} blog posts to Algolia...`);
  await indexBlogPosts(records);
  console.log('Indexing complete!');
}

main().catch((err) => {
  console.error('Error indexing blogs to Algolia:', err);
  process.exit(1);
}); 