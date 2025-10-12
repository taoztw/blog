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
import { useSession } from "next-auth/react";

const MarkdownEditor = dynamic(
  () => import("@/components/markdown-editor").then((mod) => ({ default: mod.MarkdownEditor })),
  {
    ssr: false,
    loading: () => <Skeleton className="h-96 w-full" />,
  }
);

export default function CreateJournalPage() {
  const t = useTranslations("CreateJournal");
  const router = useRouter();
  const { data: session } = useSession();

  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const createMutation = api.journal.create.useMutation({
    onSuccess: () => {
      toast.success("Journal created successfully!");
      router.push("/journals");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      toast.error("Please sign in to create a journal");
      router.push("/sign-in");
      return;
    }

    if (!content) {
      toast.error("Please write some content");
      return;
    }

    createMutation.mutate({
      content,
      imageUrl: imageUrl || undefined,
    });
  };

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to create a journal</h1>
          <Button onClick={() => router.push("/sign-in")}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">{t("title")}</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">
              {t("content")} <span className="text-red-500">*</span>
            </Label>
            <MarkdownEditor value={content} onChange={setContent} placeholder={t("contentPlaceholder")} />
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl">{t("imageUrl")}</Label>
            <Input
              id="imageUrl"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            {imageUrl && (
              <div className="mt-2">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="max-w-full h-auto max-h-64 rounded-lg"
                  onError={() => toast.error("Invalid image URL")}
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button type="submit" disabled={createMutation.isPending} className="bg-orange-500 hover:bg-orange-600">
              {createMutation.isPending ? "Creating..." : t("submit")}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
