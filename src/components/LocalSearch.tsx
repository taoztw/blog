"use client";

import { formUrlQuery, removeKeysFromUrlQuery } from "@/lib/url";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "./ui/input";

interface Props {
  route: string;
  placeholder: string;
  otherClasses?: string;
  // iconPosition?: "left" | "right";
}

const LocalSearch = ({ route, placeholder, otherClasses }: Props) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";

  const [searchQuery, setSearchQuery] = useState(query);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        const newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: "query",
          value: searchQuery,
        });

        router.push(newUrl, { scroll: false });
      } else {
        const newUrl = removeKeysFromUrlQuery({
          params: searchParams.toString(),
          keysToRemove: ["query"],
        });

        router.push(newUrl, { scroll: false });
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, router, route, searchParams, pathname]);

  return (
    <div
      className={cn(
        "group relative flex min-h-11 w-full min-w-[260px] grow items-center rounded-full border border-border bg-muted/60 transition-colors focus-within:border-ink-400 focus-within:bg-background focus-within:ring-2 focus-within:ring-brand/15",
        otherClasses,
      )}
    >
      <Search className="ml-4 size-4 shrink-0 text-muted-foreground transition-colors group-focus-within:text-ink-700" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full border-0 bg-transparent px-3 text-sm shadow-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
      />
    </div>
  );
};

export default LocalSearch;
