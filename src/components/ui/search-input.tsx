import { useEffect, useId, useState } from "react";
import { ArrowRightIcon, SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SearchInput({
  defaultValue = "",
  onChange,
}: {
  defaultValue?: string;
  onChange: (value: string) => void;
}) {
  // 使用 useId 确保每个输入框都有唯一的 ID
  const id = useId();
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    const t = setTimeout(() => {
      onChange(value);
    }, 300); // 300ms 防抖
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div className="*:not-first:mt-2">
      <div className="relative">
        <Input
          id={id}
          className="peer ps-9 pe-9"
          placeholder="Search..."
          type="search"
          onChange={(e) => setValue(e.target.value)}
        />
        <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
          <SearchIcon size={16} />
        </div>
      </div>
    </div>
  );
}
