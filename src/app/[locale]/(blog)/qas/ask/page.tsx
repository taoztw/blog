"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Dynamically import markdown editor to avoid SSR issues
const MarkdownEditor = dynamic(() => import("@/components/mardown-preview").then(mod => ({ default: mod.MarkdownEditor })), {
  ssr: false,
  loading: () => <Skeleton className="h-96 w-full" />,
});

export default function AskQuestionPage() {
  const t = useTranslations("AskQuestion");
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const createMutation = api.question.createWithTags.useMutation({
    onSuccess: (data) => {
      toast.success(t("submit") + " successfully!");
      router.push(`/qas/${data.question.id}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { data: allTags } = api.tag.getAll.useQuery();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !content) {
      toast.error("Please fill in all required fields");
      return;
    }

    createMutation.mutate({
      title,
      content,
      tagIds: tags,
    });
  };

  const handleAddTag = (tagId: string) => {
    if (tags.length >= 5) {
      toast.error("Maximum 5 tags allowed");
      return;
    }
    if (!tags.includes(tagId)) {
      setTags([...tags, tagId]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagId: string) => {
    setTags(tags.filter((t) => t !== tagId));
  };

  const filteredTags = allTags?.filter(
    (tag) =>
      tag.name.toLowerCase().includes(tagInput.toLowerCase()) &&
      !tags.includes(tag.id)
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">{t("title")}</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              {t("questionTitle")} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("questionTitlePlaceholder")}
              required
            />
          </div>

          {/* Question Content */}
          <div className="space-y-2">
            <Label htmlFor="content">
              {t("detailedExplanation")} <span className="text-red-500">*</span>
            </Label>
            <MarkdownEditor
              value={content}
              onChange={setContent}
              placeholder="Provide detailed explanation of your problem..."
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">{t("tags")}</Label>
            <Input
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder={t("tagsPlaceholder")}
            />

            {/* Tag Suggestions */}
            {tagInput && filteredTags && filteredTags.length > 0 && (
              <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
                {filteredTags.slice(0, 10).map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleAddTag(tag.id)}
                    className="block w-full text-left px-3 py-2 hover:bg-accent rounded-sm"
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            )}

            {/* Selected Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tagId) => {
                  const tag = allTags?.find((t) => t.id === tagId);
                  return (
                    <span
                      key={tagId}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-sm"
                    >
                      {tag?.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tagId)}
                        className="hover:text-destructive"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {createMutation.isPending ? "Submitting..." : t("submit")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
