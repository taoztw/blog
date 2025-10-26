"use client";

import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select";

interface Tag {
  id: string;
  name: string;
}

interface TagsSelectProps {
  tags: Tag[];
  selectedTagIds: string[];
  onSelectedChange: (tagIds: string[]) => void;
  placeholder?: string;
}

export function TagsSelect({ tags, selectedTagIds, onSelectedChange, placeholder = "选择标签..." }: TagsSelectProps) {
  return (
    <MultiSelect values={selectedTagIds} onValuesChange={onSelectedChange}>
      <MultiSelectTrigger className="w-full">
        <MultiSelectValue placeholder={placeholder} />
      </MultiSelectTrigger>
      <MultiSelectContent>
        <MultiSelectGroup>
          {tags.map((tag) => (
            <MultiSelectItem key={tag.id} value={tag.id}>
              {tag.name}
            </MultiSelectItem>
          ))}
        </MultiSelectGroup>
      </MultiSelectContent>
    </MultiSelect>
  );
}
