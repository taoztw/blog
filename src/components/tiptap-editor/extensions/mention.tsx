"use client";

import Mention from "@tiptap/extension-mention";
import { ReactRenderer } from "@tiptap/react";
import tippy, { type Instance as TippyInstance } from "tippy.js";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  type FC,
} from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { MentionUser } from "../types";
import "tippy.js/dist/tippy.css";

/**
 * 提及建议列表组件
 */
interface MentionListProps {
  items: MentionUser[];
  command: (item: MentionUser) => void;
}

const MentionList = forwardRef<{ onKeyDown: (e: KeyboardEvent) => boolean }, MentionListProps>(
  (props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
      setSelectedIndex(0);
    }, [props.items]);

    useImperativeHandle(ref, () => ({
      onKeyDown: (event: KeyboardEvent) => {
        if (event.key === "ArrowUp") {
          setSelectedIndex((prev) =>
            prev === 0 ? props.items.length - 1 : prev - 1,
          );
          return true;
        }

        if (event.key === "ArrowDown") {
          setSelectedIndex((prev) =>
            prev === props.items.length - 1 ? 0 : prev + 1,
          );
          return true;
        }

        if (event.key === "Enter") {
          const item = props.items[selectedIndex];
          if (item) {
            props.command(item);
          }
          return true;
        }

        return false;
      },
    }));

    if (props.items.length === 0) {
      return (
        <div className="px-3 py-2 text-sm text-muted-foreground">
          未找到用户
        </div>
      );
    }

    return (
      <div className="bg-popover border rounded-md shadow-md overflow-hidden min-w-[200px] max-h-[300px] overflow-y-auto">
        {props.items.map((item, index) => (
          <button
            key={item.id}
            onClick={() => props.command(item)}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-accent transition-colors ${
              index === selectedIndex ? "bg-accent" : ""
            }`}
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={item.avatar} alt={item.name} />
              <AvatarFallback>{item.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{item.name}</div>
              <div className="text-xs text-muted-foreground truncate">
                @{item.username}
              </div>
            </div>
          </button>
        ))}
      </div>
    );
  },
);

MentionList.displayName = "MentionList";

/**
 * 创建提及建议插件
 */
function createSuggestion(onSearchUsers?: (query: string) => Promise<MentionUser[]>) {
  return {
    items: async ({ query }: { query: string }) => {
      if (!onSearchUsers) {
        // 默认示例用户
        const defaultUsers: MentionUser[] = [
          { id: "1", name: "张三", username: "zhangsan" },
          { id: "2", name: "李四", username: "lisi" },
          { id: "3", name: "王五", username: "wangwu" },
        ];

        return defaultUsers.filter(
          (user) =>
            user.name.toLowerCase().includes(query.toLowerCase()) ||
            user.username.toLowerCase().includes(query.toLowerCase()),
        );
      }

      return onSearchUsers(query);
    },

    render: () => {
      let component: ReactRenderer<any> | null = null;
      let popup: TippyInstance[] | null = null;

      return {
        onStart: (props: any) => {
          component = new ReactRenderer(MentionList, {
            props,
            editor: props.editor,
          });

          if (!props.clientRect) {
            return;
          }

          popup = tippy("body", {
            getReferenceClientRect: props.clientRect,
            appendTo: () => document.body,
            content: component.element,
            showOnCreate: true,
            interactive: true,
            trigger: "manual",
            placement: "bottom-start",
          });
        },

        onUpdate(props: any) {
          component?.updateProps(props);

          if (!props.clientRect) {
            return;
          }

          popup?.[0]?.setProps({
            getReferenceClientRect: props.clientRect,
          });
        },

        onKeyDown(props: any) {
          if (props.event.key === "Escape") {
            popup?.[0]?.hide();
            return true;
          }

          return component?.ref?.onKeyDown(props.event) ?? false;
        },

        onExit() {
          popup?.[0]?.destroy();
          component?.destroy();
        },
      };
    },
  };
}

/**
 * 自定义 Mention 扩展
 */
export function createMentionExtension(
  onSearchUsers?: (query: string) => Promise<MentionUser[]>,
) {
  return Mention.configure({
    HTMLAttributes: {
      class: "mention bg-primary/10 text-primary px-1 rounded font-medium",
    },
    suggestion: createSuggestion(onSearchUsers),
  });
}
