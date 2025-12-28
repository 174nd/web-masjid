"use client";

import * as React from "react";
import { Image as ImageIcon, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ImageUpload({
  value,
  onChange,
  disabled,
  className,
  accept = "image/*",
  maxSizeMb = 2,
}: {
  value?: string | null; // base64
  onChange: (base64: string | null) => void;
  disabled?: boolean;
  className?: string;
  accept?: string;
  maxSizeMb?: number;
}) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function handleFile(file?: File) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar.");
      return;
    }

    const maxBytes = maxSizeMb * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`Ukuran maksimal ${maxSizeMb}MB.`);
      return;
    }

    setError(null);
    const base64 = await fileToBase64(file);
    onChange(base64);
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Preview / Placeholder */}
      <div
        className={cn(
          "relative flex h-40 w-full cursor-pointer items-center justify-center rounded-md border border-dashed bg-muted/30 transition hover:bg-muted/50",
          disabled && "cursor-not-allowed opacity-60"
        )}
        onClick={() => {
          if (disabled) return;
          inputRef.current?.click();
        }}
      >
        {value ? (
          <>
            <img src={value} alt="Cover preview" className="h-full w-full rounded-md object-cover" />
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute right-2 top-2"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ImageIcon className="h-6 w-6" />
            <div className="text-sm">Klik untuk upload cover</div>
            <div className="text-xs">JPG / PNG · max {maxSizeMb}MB</div>
          </div>
        )}
      </div>

      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          void handleFile(file);
          e.currentTarget.value = ""; // reset agar bisa upload file sama lagi
        }}
      />

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
