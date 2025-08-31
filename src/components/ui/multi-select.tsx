"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Option {
  label: string;
  value: string;
  color?: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "选择选项...",
  className,
}: MultiSelectProps) {
  const handleUnselect = (item: string) => {
    onChange(selected.filter((i) => i !== item));
  };

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const selectedOptions = options.filter((option) => selected.includes(option.value));

  return (
    <div className={cn("w-full", className)}>
      {/* Selected tags display */}
      {selectedOptions.length > 0 && (
        <div className="flex gap-1 flex-wrap mb-2">
          {selectedOptions.map((option) => (
            <Badge
              variant="secondary"
              key={option.value}
              className="mr-1 mb-1"
              style={{
                backgroundColor: option.color ? `${option.color}20` : undefined,
                borderColor: option.color || undefined,
                color: option.color || undefined,
              }}
            >
              {option.label}
              <button
                className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onClick={() => handleUnselect(option.value)}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      
      {/* Dropdown to select more tags */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span className="text-muted-foreground">
              {selectedOptions.length > 0 ? "添加更多标签..." : placeholder}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 max-h-60 overflow-y-auto">
          {options.map((option) => (
            <DropdownMenuItem
              key={option.value}
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => handleSelect(option.value)}
            >
              <div className="w-4 h-4 border rounded flex items-center justify-center">
                {selected.includes(option.value) && (
                  <div className="w-2 h-2 bg-primary rounded"></div>
                )}
              </div>
              <Badge
                variant="outline"
                className="flex-1"
                style={{
                  backgroundColor: option.color ? `${option.color}20` : undefined,
                  borderColor: option.color || undefined,
                  color: option.color || undefined,
                }}
              >
                {option.label}
              </Badge>
            </DropdownMenuItem>
          ))}
          {options.length === 0 && (
            <DropdownMenuItem disabled>暂无标签可选</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}