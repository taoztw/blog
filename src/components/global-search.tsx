"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Spinner } from "@/components/ui/spinner";
import { api, type RouterOutputs } from "@/trpc/react";
import { FileText, Folder, Hash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Tag = RouterOutputs["tag"]["getAll"][number];
type Category = RouterOutputs["category"]["getAll"][number];
type Post = RouterOutputs["post"]["getByPage"]["items"][number];

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Search posts
  const { data: posts, isLoading: isLoadingPosts } = api.post.getByPage.useQuery(
    {
      page: 1,
      limit: 5,
      search: debouncedSearch,
    },
    {
      enabled: debouncedSearch.length > 0,
    }
  );

  // Get all tags
  const { data: tags, isLoading: isLoadingTags } = api.tag.getAll.useQuery(undefined, {
    enabled: open,
  });

  // Get all categories
  const { data: categories, isLoading: isLoadingCategories } = api.category.getAll.useQuery(undefined, {
    enabled: open,
  });

  // Filter tags and categories based on search
  const filteredTags = tags?.filter((tag: Tag) => tag.name.toLowerCase().includes(debouncedSearch.toLowerCase())) || [];

  const filteredCategories =
    categories?.filter((category: Category) => category.name.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
    [];

  const handleSelectPost = (postId: string, slug: string) => {
    onOpenChange(false);
    router.push(`/blog/${slug}`);
    setSearch("");
  };

  const handleSelectTag = (tagName: string) => {
    onOpenChange(false);
    router.push(`/blog?tag=${encodeURIComponent(tagName)}`);
    setSearch("");
  };

  const handleSelectCategory = (categoryName: string) => {
    onOpenChange(false);
    router.push(`/blog?category=${encodeURIComponent(categoryName)}`);
    setSearch("");
  };

  const isLoading = isLoadingPosts || isLoadingTags || isLoadingCategories;
  const hasResults = (posts && posts.items.length > 0) || filteredTags.length > 0 || filteredCategories.length > 0;

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      shouldFilter={false}
    >
      <CommandInput
        placeholder="Search posts, tags, or categories..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        {isLoading && (
          <div className="py-6 text-center">
            <Spinner className="size-5 mx-auto" />
          </div>
        )}

        {!isLoading && debouncedSearch.length === 0 && (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Start typing to search posts, tags, or categories
          </div>
        )}

        {!isLoading && debouncedSearch.length > 0 && !hasResults && <CommandEmpty>No results found.</CommandEmpty>}

        {!isLoading && posts && posts.items.length > 0 && (
          <CommandGroup heading="Posts">
            {posts.items.map((post: Post) => (
              <CommandItem
                key={post.id}
                value={post.content}
                onSelect={() => handleSelectPost(post.id, post.slug)}
              >
                <FileText className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span className="font-medium">{post.title}</span>
                  {post.excerpt && <span className="text-xs text-muted-foreground line-clamp-1">{post.excerpt}</span>}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {!isLoading && filteredTags.length > 0 && (
          <CommandGroup heading="Tags">
            {filteredTags.slice(0, 5).map((tag: Tag) => (
              <CommandItem
                key={tag.id}
                value={tag.name}
                onSelect={() => handleSelectTag(tag.name)}
              >
                <Hash className="mr-2 h-4 w-4" />
                <span>{tag.name}</span>
                {tag.description && <span className="ml-2 text-xs text-muted-foreground">- {tag.description}</span>}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {!isLoading && filteredCategories.length > 0 && (
          <CommandGroup heading="Categories">
            {filteredCategories.slice(0, 5).map((category: Category) => (
              <CommandItem
                key={category.id}
                value={`category-${category.id}`}
                onSelect={() => handleSelectCategory(category.name)}
              >
                <Folder className="mr-2 h-4 w-4" />
                <span>{category.name}</span>
                {category.description && (
                  <span className="ml-2 text-xs text-muted-foreground">- {category.description}</span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
