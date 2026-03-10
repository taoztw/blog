"use client";

import { formUrlQuery, removeKeysFromUrlQuery } from "@/lib/url";
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
      className={`relative flex min-h-10 grow items-center gap-4 rounded-[10px] min-w-[300px] ${otherClasses || "bg-muted border border-border"}`}
    >
      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-4 py-2 rounded-full border-0 bg-transparent focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      <Search className="absolute right-1 size-5 mr-3 text-muted-foreground" />
    </div>
  );
};

export default LocalSearch;
