import { Blog } from "@/types";

export default async function PokemonPageContent({blogs}: {blogs: Blog[]}) {
   
    return(
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
        {blogs.filter((blog: Blog) => blog.pokemon).length === 0 && (
          <p className="text-muted-foreground text-center py-8">
            No Pokémon featured in blog posts yet. Add some Pokémon to your blog posts in the Sanity Studio!
          </p>
        )}
        </div>
    )
}