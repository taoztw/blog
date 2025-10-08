"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { api } from "@/trpc/react";
import { useParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { ThumbsUp, ThumbsDown, Eye, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import dynamic from "next/dynamic";
import { MarkdownPreview } from "@/components/mardown-preview";
import { useSession } from "next-auth/react";

const MarkdownEditor = dynamic(() => import("@/components/mardown-preview").then(mod => ({ default: mod.MarkdownEditor })), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full" />,
});

export default function QuestionDetailPage() {
  const t = useTranslations("QuestionDetail");
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const questionId = params.id as string;

  const [answerContent, setAnswerContent] = useState("");
  const [answerSortBy, setAnswerSortBy] = useState<"newest" | "oldest" | "popular">("popular");

  // Get question data
  const { data: question, isLoading: questionLoading } = api.question.getOne.useQuery(
    { id: questionId },
    {
      onSuccess: () => {
        // Record view
        viewMutation.mutate({ questionId });
      },
    }
  );

  // Get answers
  const { data: answersData, isLoading: answersLoading } = api.answer.getByQuestion.useQuery({
    questionId,
    page: 1,
    limit: 20,
    sortBy: answerSortBy,
  });

  const viewMutation = api.question.createView.useMutation();
  const voteMutation = api.question.vote.useMutation({
    onSuccess: () => {
      toast.success("Vote recorded");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const createAnswerMutation = api.answer.create.useMutation({
    onSuccess: () => {
      toast.success("Answer posted successfully");
      setAnswerContent("");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleVote = (voteType: "upvote" | "downvote") => {
    if (!session) {
      toast.error("Please sign in to vote");
      return;
    }
    voteMutation.mutate({ questionId, voteType });
  };

  const handleSubmitAnswer = () => {
    if (!session) {
      toast.error("Please sign in to answer");
      return;
    }
    if (!answerContent) {
      toast.error("Please write your answer");
      return;
    }
    createAnswerMutation.mutate({
      questionId,
      content: answerContent,
    });
  };

  if (questionLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Question not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Question Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">{question.title}</h1>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <ThumbsUp className="h-4 w-4" />
              <span>{question.upvotes - question.downvotes} {t("votes")}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>{question.answers} {t("answers")}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{question.viewCount} {t("views")}</span>
            </div>
            <span>•</span>
            <span>{t("asked")} {new Date(question.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-[auto_1fr] gap-6">
          {/* Vote buttons */}
          <div className="flex flex-col items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleVote("upvote")}
              disabled={voteMutation.isPending}
            >
              <ThumbsUp className="h-5 w-5" />
            </Button>
            <span className="text-2xl font-bold">
              {question.upvotes - question.downvotes}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleVote("downvote")}
              disabled={voteMutation.isPending}
            >
              <ThumbsDown className="h-5 w-5" />
            </Button>
          </div>

          {/* Question Content */}
          <div className="space-y-6">
            <div className="prose max-w-none dark:prose-invert">
              <MarkdownPreview content={question.content} />
            </div>

            {/* Tags */}
            {question.tags && question.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {question.tags.map((tag: any) => (
                  <Badge key={tag.id} variant="secondary">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Author */}
            <div className="flex items-center gap-3 p-4 bg-accent rounded-lg">
              {question.author?.image && (
                <img
                  src={question.author.image}
                  alt={question.author.name || "User"}
                  className="h-10 w-10 rounded-full"
                />
              )}
              <div>
                <div className="font-semibold">{question.author?.name}</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(question.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Answers Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {question.answers} {t("answers")}
            </h2>
            <select
              value={answerSortBy}
              onChange={(e) => setAnswerSortBy(e.target.value as typeof answerSortBy)}
              className="border rounded-md px-3 py-2"
            >
              <option value="popular">{t("sortBy.highest")}</option>
              <option value="newest">{t("sortBy.newest")}</option>
              <option value="oldest">{t("sortBy.oldest")}</option>
            </select>
          </div>

          {answersLoading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          ) : answersData && answersData.items.length > 0 ? (
            <div className="space-y-6">
              {answersData.items.map((answer) => (
                <AnswerCard key={answer.id} answer={answer} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No answers yet. Be the first to answer!
            </div>
          )}
        </div>

        {/* Answer Form */}
        {session ? (
          <div className="mt-12 space-y-4">
            <h3 className="text-xl font-semibold">Your Answer</h3>
            <MarkdownEditor
              value={answerContent}
              onChange={setAnswerContent}
              placeholder={t("writeAnswer")}
            />
            <Button
              onClick={handleSubmitAnswer}
              disabled={createAnswerMutation.isPending}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {createAnswerMutation.isPending ? "Posting..." : t("postAnswer")}
            </Button>
          </div>
        ) : (
          <div className="mt-12 text-center p-8 border rounded-lg">
            <p className="text-muted-foreground mb-4">
              Please sign in to post an answer
            </p>
            <Button onClick={() => router.push("/sign-in")}>Sign In</Button>
          </div>
        )}
      </div>
    </div>
  );
}

function AnswerCard({ answer }: { answer: any }) {
  const { data: session } = useSession();
  const [isVoting, setIsVoting] = useState(false);

  const voteMutation = api.answer.vote.useMutation({
    onSuccess: () => {
      toast.success("Vote recorded");
      setIsVoting(false);
    },
    onError: (error) => {
      toast.error(error.message);
      setIsVoting(false);
    },
  });

  const handleVote = (voteType: "upvote" | "downvote") => {
    if (!session) {
      toast.error("Please sign in to vote");
      return;
    }
    setIsVoting(true);
    voteMutation.mutate({ answerId: answer.id, voteType });
  };

  return (
    <div className="border-t pt-6">
      <div className="grid grid-cols-[auto_1fr] gap-6">
        {/* Vote buttons */}
        <div className="flex flex-col items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleVote("upvote")}
            disabled={isVoting}
          >
            <ThumbsUp className="h-5 w-5" />
          </Button>
          <span className="text-xl font-semibold">
            {answer.upvotes - answer.downvotes}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleVote("downvote")}
            disabled={isVoting}
          >
            <ThumbsDown className="h-5 w-5" />
          </Button>
        </div>

        {/* Answer Content */}
        <div className="space-y-4">
          <div className="prose max-w-none dark:prose-invert">
            <MarkdownPreview content={answer.content} />
          </div>

          {/* Author */}
          <div className="flex items-center gap-3">
            {answer.author?.image && (
              <img
                src={answer.author.image}
                alt={answer.author.name || "User"}
                className="h-8 w-8 rounded-full"
              />
            )}
            <div>
              <div className="font-semibold text-sm">{answer.author?.name}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(answer.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
