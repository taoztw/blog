import type { ChatMessage, ToolName } from "@/components/editor/use-chat";
import type { NextRequest } from "next/server";

import { createAzure } from "@ai-sdk/azure";
import {
  type LanguageModel,
  type UIMessageStreamWriter,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateText,
  Output,
  streamText,
  tool,
} from "ai";
import { NextResponse } from "next/server";
import { type SlateEditor, createSlateEditor, nanoid } from "platejs";
import { z } from "zod";

import { BaseEditorKit } from "@/components/editor/editor-base-kit";
import { markdownJoinerTransform } from "@/lib/markdown-joiner-transform";

import {
  buildEditTableMultiCellPrompt,
  getChooseToolPrompt,
  getCommentPrompt,
  getEditPrompt,
  getGeneratePrompt,
} from "./prompt";

export async function POST(req: NextRequest) {
  const { ctx, messages: messagesRaw, model } = await req.json();

  const { children, selection, toolName: toolNameParam } = ctx;

  const editor = createSlateEditor({
    plugins: BaseEditorKit,
    selection,
    value: children,
  });

  const resourceName = process.env.AZURE_RESOURCE_NAME;
  const apiKey = process.env.AZURE_API_KEY;
  const defaultModelId = model ?? process.env.AZURE_DEFAULT_DEPLOYMENT;
  const fastModelId = model ?? process.env.AZURE_FAST_DEPLOYMENT ?? defaultModelId;

  if (!resourceName || !apiKey) {
    return NextResponse.json({ error: "Missing Azure OpenAI credentials." }, { status: 401 });
  }

  if (!defaultModelId) {
    return NextResponse.json({ error: "Missing Azure deployment name." }, { status: 400 });
  }

  const isSelecting = editor.api.isExpanded();

  const azureProvider = createAzure({
    resourceName,
    apiKey,
  });

  try {
    const stream = createUIMessageStream<ChatMessage>({
      execute: async ({ writer }) => {
        let toolName = toolNameParam;

        if (!toolName) {
          const prompt = getChooseToolPrompt({
            isSelecting,
            messages: messagesRaw,
          });

          const enumOptions = isSelecting
            ? (["generate", "edit", "comment"] as const)
            : (["generate", "comment"] as const);
          const modelId = fastModelId;

          const toolSchema = z.object({
            tool: z.enum(enumOptions).describe("The tool to use for this task"),
          });

          const result = await generateText({
            model: azureProvider(modelId),
            tools: {
              selectTool: tool({
                description: "Select which tool to use for this task",
                inputSchema: toolSchema,
              }),
            },
            toolChoice: { type: "tool", toolName: "selectTool" },
            prompt,
          });

          const toolCall = result.toolCalls[0];
          if (toolCall && toolCall.toolName === "selectTool") {
            const AIToolName = (toolCall.input as z.infer<typeof toolSchema>).tool;

            writer.write({
              data: AIToolName as ToolName,
              type: "data-toolName",
            });

            toolName = AIToolName;
          }
        }

        const stream = streamText({
          experimental_transform: markdownJoinerTransform(),
          model: azureProvider(defaultModelId),
          // Not used
          prompt: "",
          tools: {
            comment: getCommentTool(editor, {
              messagesRaw,
              model: azureProvider(fastModelId),
              writer,
            }),
            table: getTableTool(editor, {
              messagesRaw,
              model: azureProvider(fastModelId),
              writer,
            }),
          },
          prepareStep: async (step) => {
            if (toolName === "comment") {
              return {
                ...step,
                toolChoice: { toolName: "comment", type: "tool" },
              };
            }

            if (toolName === "edit") {
              const [editPrompt, editType] = getEditPrompt(editor, {
                isSelecting,
                messages: messagesRaw,
              });

              // Table editing uses the table tool
              if (editType === "table") {
                return {
                  ...step,
                  toolChoice: { toolName: "table", type: "tool" },
                };
              }

              return {
                ...step,
                activeTools: [],
                model:
                  editType === "selection"
                    ? //The selection task is more challenging, so we chose to use Gemini 2.5 Flash.
                      azureProvider(fastModelId)
                    : azureProvider(defaultModelId),
                messages: [
                  {
                    content: editPrompt,
                    role: "user",
                  },
                ],
              };
            }

            if (toolName === "generate") {
              const generatePrompt = getGeneratePrompt(editor, {
                isSelecting,
                messages: messagesRaw,
              });

              return {
                ...step,
                activeTools: [],
                messages: [
                  {
                    content: generatePrompt,
                    role: "user",
                  },
                ],
                model: azureProvider(defaultModelId),
              };
            }
          },
        });

        writer.merge(stream.toUIMessageStream({ sendFinish: false }));
      },
    });

    return createUIMessageStreamResponse({ stream });
  } catch {
    return NextResponse.json({ error: "Failed to process AI request" }, { status: 500 });
  }
}

const getCommentTool = (
  editor: SlateEditor,
  {
    messagesRaw,
    model,
    writer,
  }: {
    messagesRaw: ChatMessage[];
    model: LanguageModel;
    writer: UIMessageStreamWriter<ChatMessage>;
  }
) =>
  tool({
    description: "Comment on the content",
    inputSchema: z.object({}),
    execute: async () => {
      const commentSchema = z.object({
        blockId: z
          .string()
          .describe(
            "The id of the starting block. If the comment spans multiple blocks, use the id of the first block."
          ),
        comment: z.string().describe("A brief comment or explanation for this fragment."),
        content: z
          .string()
          .describe(
            String.raw`The original document fragment to be commented on.It can be the entire block, a small part within a block, or span multiple blocks. If spanning multiple blocks, separate them with two \n\n.`
          ),
      });

      const { experimental_partialOutputStream } = streamText({
        model,
        experimental_output: Output.object({
          schema: z.object({
            comments: z.array(commentSchema),
          }),
        }),
        prompt: getCommentPrompt(editor, {
          messages: messagesRaw,
        }),
      });

      let lastLength = 0;

      for await (const partial of experimental_partialOutputStream) {
        const comments = partial.comments ?? [];
        for (let i = lastLength; i < comments.length; i++) {
          const comment = comments[i];
          if (!comment) continue;
          const commentDataId = nanoid();

          writer.write({
            id: commentDataId,
            data: {
              comment: comment as z.infer<typeof commentSchema>,
              status: "streaming",
            },
            type: "data-comment",
          });
        }

        lastLength = comments.length;
      }

      writer.write({
        id: nanoid(),
        data: {
          comment: null,
          status: "finished",
        },
        type: "data-comment",
      });
    },
  });

const getTableTool = (
  editor: SlateEditor,
  {
    messagesRaw,
    model,
    writer,
  }: {
    messagesRaw: ChatMessage[];
    model: LanguageModel;
    writer: UIMessageStreamWriter<ChatMessage>;
  }
) =>
  tool({
    description: "Edit table cells",
    inputSchema: z.object({}),
    execute: async () => {
      const cellUpdateSchema = z.object({
        content: z
          .string()
          .describe(String.raw`The new content for the cell. Can contain multiple paragraphs separated by \n\n.`),
        id: z.string().describe("The id of the table cell to update."),
      });

      const { experimental_partialOutputStream } = streamText({
        model,
        experimental_output: Output.object({
          schema: z.object({
            cellUpdates: z.array(cellUpdateSchema),
          }),
        }),
        prompt: buildEditTableMultiCellPrompt(editor, messagesRaw),
      });

      let lastLength = 0;

      for await (const partial of experimental_partialOutputStream) {
        const cellUpdates = partial.cellUpdates ?? [];
        for (let i = lastLength; i < cellUpdates.length; i++) {
          const cellUpdate = cellUpdates[i];
          if (!cellUpdate) continue;

          writer.write({
            id: nanoid(),
            data: {
              cellUpdate: cellUpdate as z.infer<typeof cellUpdateSchema>,
              status: "streaming",
            },
            type: "data-table",
          });
        }

        lastLength = cellUpdates.length;
      }

      writer.write({
        id: nanoid(),
        data: {
          cellUpdate: null,
          status: "finished",
        },
        type: "data-table",
      });
    },
  });
