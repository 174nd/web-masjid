"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";

import type { NewsTag } from "../api/news.types";

export function TagsMultiSelect({
  tags,
  value,
  onChange,
  disabled,
}: {
  tags: NewsTag[];
  value: number[]; // ids
  onChange: (next: number[]) => void;
  disabled?: boolean;
}) {
  const selected = new Set(value);

  function toggle(tagId: number) {
    const next = new Set(selected);
    if (next.has(tagId)) next.delete(tagId);
    else next.add(tagId);
    onChange(Array.from(next));
  }

  const selectedTags = tags.filter((t) => selected.has(t.id));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" disabled={disabled} className="w-full justify-between">
          <span className={cn("truncate", value.length === 0 && "text-muted-foreground")}>
            {value.length === 0 ? "Pilih tag..." : `${value.length} tag dipilih`}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-70" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-85 p-0" align="start">
        <Command>
          <CommandInput placeholder="Cari tag..." />
          <CommandEmpty>Tag tidak ditemukan.</CommandEmpty>
          <CommandGroup>
            {tags.map((t) => {
              const isActive = selected.has(t.id);
              return (
                <CommandItem key={t.id} value={t.name} onSelect={() => toggle(t.id)}>
                  <span
                    className={cn(
                      "mr-2 inline-flex h-4 w-4 items-center justify-center rounded border",
                      isActive ? "bg-primary text-primary-foreground border-primary" : "bg-background"
                    )}
                  >
                    {isActive ? <Check className="h-3 w-3 text-white" /> : null}
                  </span>
                  <span>{t.name}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>

        {selectedTags.length > 0 ? (
          <div className="border-t p-3">
            <div className="mb-2 text-xs text-muted-foreground">Selected</div>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((t) => (
                <Badge key={t.id} variant="secondary" className="cursor-pointer" onClick={() => toggle(t.id)}>
                  {t.name}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
