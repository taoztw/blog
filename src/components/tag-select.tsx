"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react";
import { useState, type ComponentPropsWithoutRef } from "react";

export interface TagOption {
  id: string;
  name: string;
  color?: string | null;
  icon?: string | null;
}

function TagLabel({ tag, className }: { tag: TagOption; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      {tag.icon ? (
        <span
          className="size-4 shrink-0 [&>svg]:size-full"
          dangerouslySetInnerHTML={{ __html: tag.icon }}
        />
      ) : tag.color ? (
        <span
          className="size-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: tag.color }}
        />
      ) : null}
      <span>{tag.name}</span>
    </span>
  );
}

function SelectedTagBadge({
  tag,
  onRemove,
}: {
  tag: TagOption;
  onRemove: () => void;
}) {
  return (
    <Badge
      variant="outline"
      className="group flex items-center gap-1 pr-1"
      style={{
        backgroundColor: tag.color ? `${tag.color}12` : undefined,
        borderColor: tag.color ? `${tag.color}40` : undefined,
        color: tag.color || undefined,
      }}
    >
      {tag.icon ? (
        <span
          className="size-3 shrink-0 [&>svg]:size-full"
          dangerouslySetInnerHTML={{ __html: tag.icon }}
        />
      ) : null}
      <span className="max-w-[100px] truncate">{tag.name}</span>
      <span
        role="button"
        tabIndex={0}
        className="ml-0.5 rounded-sm opacity-70 hover:opacity-100 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.stopPropagation();
            onRemove();
          }
        }}
      >
        <XIcon className="size-3" />
      </span>
    </Badge>
  );
}

// --- Multi-select Tag Selector ---

interface TagMultiSelectProps extends Omit<ComponentPropsWithoutRef<typeof Button>, "value" | "onChange"> {
  tags: TagOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
}

export function TagMultiSelect({
  tags,
  value,
  onChange,
  placeholder = "选择标签...",
  searchPlaceholder = "搜索标签...",
  emptyMessage = "没有找到标签",
  className,
  ...props
}: TagMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const selectedSet = new Set(value);
  const selectedTags = tags.filter((t) => selectedSet.has(t.id));

  function toggle(id: string) {
    if (selectedSet.has(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "flex h-auto min-h-9 w-full items-center justify-between gap-2 overflow-hidden px-3 py-1.5",
            className
          )}
          {...props}
        >
          <div className="flex flex-1 flex-wrap gap-1 overflow-hidden">
            {selectedTags.length > 0 ? (
              selectedTags.map((tag) => (
                <SelectedTagBadge
                  key={tag.id}
                  tag={tag}
                  onRemove={() => toggle(tag.id)}
                />
              ))
            ) : (
              <span className="text-muted-foreground font-normal">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="min-w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {tags.map((tag) => (
                <CommandItem
                  key={tag.id}
                  value={tag.name}
                  onSelect={() => toggle(tag.id)}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 size-4",
                      selectedSet.has(tag.id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <TagLabel tag={tag} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// --- Single-select Tag Selector ---

interface TagSingleSelectProps extends Omit<ComponentPropsWithoutRef<typeof Button>, "value" | "onChange"> {
  tags: TagOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  clearable?: boolean;
}

export function TagSingleSelect({
  tags,
  value,
  onChange,
  placeholder = "选择标签...",
  searchPlaceholder = "搜索标签...",
  emptyMessage = "没有找到标签",
  clearable = true,
  className,
  ...props
}: TagSingleSelectProps) {
  const [open, setOpen] = useState(false);
  const selectedTag = tags.find((t) => t.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "flex h-9 w-full items-center justify-between gap-2 overflow-hidden px-3",
            className
          )}
          {...props}
        >
          <div className="flex flex-1 items-center overflow-hidden">
            {selectedTag ? (
              <TagLabel tag={selectedTag} />
            ) : (
              <span className="text-muted-foreground font-normal">{placeholder}</span>
            )}
          </div>
          {selectedTag && clearable ? (
            <span
              role="button"
              tabIndex={0}
              className="rounded-sm opacity-70 hover:opacity-100 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  onChange(null);
                }
              }}
            >
              <XIcon className="size-3.5" />
            </span>
          ) : (
            <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="min-w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {tags.map((tag) => (
                <CommandItem
                  key={tag.id}
                  value={tag.name}
                  onSelect={() => {
                    onChange(tag.id === value ? null : tag.id);
                    setOpen(false);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 size-4",
                      tag.id === value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <TagLabel tag={tag} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
