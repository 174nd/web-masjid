"use client";

import * as React from "react";
import { useForm } from "@tanstack/react-form";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ImageUpload } from "@/components/ui/image-upload";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import TextEditor from "@/components/textEditor";

import { TagsMultiSelect } from "./tags-multi-select";
import { resolveNewsCoverUrl } from "../api/news.api";
import { useNewsTagsQuery } from "../api/news.queries";
import { useCreateNewsMutation, useUpdateNewsMutation } from "../api/news.mutations";
import type { NewsDetail } from "../api/news.types";
import { toast } from "react-toastify";

function isDataUri(value: string | null) {
  return !!value && value.startsWith("data:");
}

export function NewsCreateCard({
  mode = "create",
  news,
  isLoading = false,
  loadError,
  onCancelEdit,
}: {
  mode?: "create" | "edit";
  news?: NewsDetail | null;
  isLoading?: boolean;
  loadError?: string | null;
  onCancelEdit?: () => void;
}) {
  const tagsQuery = useNewsTagsQuery();
  const createMutation = useCreateNewsMutation();
  const updateMutation = useUpdateNewsMutation();

  const defaultValues = React.useMemo(
    () => ({
      title: mode === "edit" && news ? news.title : "",
      description: mode === "edit" && news ? news.description : "",
      isPinned: mode === "edit" && news ? news.isPinned : false,
      coverDataUri: mode === "edit" && news ? resolveNewsCoverUrl(news.coverUrl) : null,
      tags: mode === "edit" && news ? news.tags.map((t) => t.id) : ([] as number[]),
      content: mode === "edit" && news ? news.content : "",
    }),
    [mode, news]
  );

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      if (mode === "create") {
        await createMutation.mutateAsync({
          title: value.title,
          description: value.description,
          isPinned: value.isPinned,
          tags: value.tags,
          coverDataUri: value.coverDataUri,
          content: value.content,
        });
        toast.success("Berita berhasil dibuat.");
      } else if (mode === "edit" && news) {
        const payload = {
          title: value.title,
          description: value.description,
          isPinned: value.isPinned,
          tags: value.tags,
          content: value.content,
          coverDataUri: isDataUri(value.coverDataUri) ? value.coverDataUri : undefined,
        };
        if (news.coverUrl && value.coverDataUri === null) {
          payload.coverDataUri = null;
        }

        await updateMutation.mutateAsync({ newsId: news.id, payload });
        toast.success("Berita berhasil diperbarui.");
      }

      form.reset();
      onCancelEdit?.();
    },
  });

  React.useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  React.useEffect(() => {
    createMutation.reset();
    updateMutation.reset();
  }, [createMutation, updateMutation, mode, news?.id]);

  const tags = tagsQuery.data?.data ?? [];
  const isSubmitting = form.state.isSubmitting || createMutation.isPending || updateMutation.isPending;
  const isEditBlocked = mode === "edit" && !news;
  const isBusy = isSubmitting || isLoading || isEditBlocked;
  const isError = createMutation.isError || updateMutation.isError;
  const errorMessage = ((createMutation.error ?? updateMutation.error) as Error | undefined)?.message ?? "Error";

  return (
    <Card className="p-4">
      <div className="mb-2">
        <h2 className="text-base font-semibold">{mode === "create" ? "Tambah Berita" : "Edit Berita"}</h2>
        <p className="text-sm text-muted-foreground">
          {mode === "create" ? "Isi form berikut untuk membuat berita baru." : "Perbarui informasi berita di bawah ini."}
        </p>
      </div>

      <Separator className="my-4" />

      {loadError ? (
        <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{loadError}</div>
      ) : null}

      {isError ? (
        <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{errorMessage}</div>
      ) : null}

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.Field
          name="title"
          validators={{
            onChange: ({ value }) => (!value?.trim() ? "Judul wajib diisi." : undefined),
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Judul</Label>
              <Input
                id={field.name}
                value={(field.state.value ?? "") as string}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="Masukkan judul berita..."
                disabled={isBusy}
              />
              {field.state.meta.errors?.[0] ? <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p> : null}
            </div>
          )}
        </form.Field>
        <form.Field
          name="description"
          validators={{
            onChange: ({ value }) => (!value?.trim() ? "Deskripsi wajib diisi." : undefined),
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Deskripsi Singkat</Label>
              <Input
                id={field.name}
                value={(field.state.value ?? "") as string}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="Masukkan Deskripsi Singkat..."
                disabled={isBusy}
              />
              {field.state.meta.errors?.[0] ? <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p> : null}
            </div>
          )}
        </form.Field>

        <form.Field name="isPinned">
          {(field) => (
            <Label className="flex items-start gap-3 rounded-lg border p-3 hover:bg-accent/50 has-aria-checked:border-primary has-aria-checked:bg-primary/10">
              <Checkbox checked={field.state.value} onCheckedChange={(v) => field.handleChange(Boolean(v))} disabled={isBusy} />
              <div className="grid gap-1.5">
                <p className="text-sm font-medium">Pin Berita</p>
                <p className="text-xs text-muted-foreground">Berita akan tampil di bagian pinned.</p>
              </div>
            </Label>
          )}
        </form.Field>

        <form.Field name="coverDataUri">
          {(field) => (
            <div className="space-y-2">
              <Label>Cover Berita</Label>
              <ImageUpload value={(field.state.value ?? null) as string | null} onChange={(v) => field.handleChange(v)} disabled={isBusy} />
              <p className="text-xs text-muted-foreground">Cover akan dikirim sebagai data URI jika diubah.</p>
            </div>
          )}
        </form.Field>

        <form.Field
          name="tags"
          validators={{
            onChange: ({ value }) => (!value || value.length === 0 ? "Pilih minimal 1 tag." : undefined),
          }}
        >
          {(field) => {
            const selected = ((field.state.value ?? []) as number[]) ?? [];
            const selectedTags = tags.filter((t) => selected.includes(t.id));

            return (
              <div className="space-y-2">
                <Label>Tags</Label>

                <TagsMultiSelect
                  tags={tags}
                  value={selected}
                  onChange={(next) => field.handleChange(next)}
                  disabled={isBusy || tagsQuery.isLoading}
                />

                {/* Selected tags badges (dibawahnya) */}
                {selectedTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {selectedTags.map((t) => (
                      <Badge
                        key={t.id}
                        variant="secondary"
                        onClick={() => {
                          if (isBusy) return;
                          field.handleChange(selected.filter((id) => id !== t.id));
                        }}
                        title="Klik untuk menghapus tag"
                      >
                        {t.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Belum ada tag yang dipilih.</p>
                )}

                {field.state.meta.errors?.[0] ? <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p> : null}
              </div>
            );
          }}
        </form.Field>

        <form.Field
          name="content"
          validators={{
            onChange: ({ value }) => (!value?.trim() ? "Isi berita wajib diisi." : undefined),
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Isi Berita</Label>
              {isLoading || isEditBlocked ? (
                <div className="min-h-[180px] rounded-md border bg-muted/50 animate-pulse" />
              ) : (
                <TextEditor
                  key={mode === "edit" && news ? `edit-${news.id}` : "create"}
                  value={(field.state.value ?? "") as string}
                  onChange={(v) => field.handleChange(v)}
                />
              )}
              {/* <Textarea
                id={field.name}
                value={(field.state.value ?? "") as string}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="Tulis isi berita di sini..."
                className="min-h-[160px]"
                disabled={mutation.isPending}
              /> */}
              {field.state.meta.errors?.[0] ? <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p> : null}
            </div>
          )}
        </form.Field>

        <div className="flex flex-wrap justify-end gap-2">
          {mode === "edit" ? (
            <Button type="button" variant="outline" onClick={onCancelEdit} disabled={isBusy}>
              Batal
            </Button>
          ) : null}
          <Button type="submit" disabled={isBusy}>
            {isSubmitting ? "Saving..." : mode === "create" ? "Tambah Berita" : "Simpan Perubahan"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
