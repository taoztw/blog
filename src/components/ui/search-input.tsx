import { useId } from "react";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";

export default function SearchInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const id = useId();

  return (
    <div className="*:not-first:mt-2">
      <div className="relative">
        <Input
          id={id}
          className="peer ps-9 pe-9"
          placeholder="Search..."
          type="search"
          value={value ?? ""} // 永远是字符串，避免受控警告
          onChange={(e) => onChange(e.target.value)}
        />
        <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
          <SearchIcon size={16} />
        </div>
      </div>
    </div>
  );
}
