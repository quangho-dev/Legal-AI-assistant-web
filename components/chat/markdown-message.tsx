"use client";

import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

function flattenChildren(children: ReactNode): string {
  if (children == null || typeof children === "boolean") return "";
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(flattenChildren).join("");
  }
  if (typeof children === "object" && "props" in children) {
    const element = children as { props?: { children?: ReactNode } };
    return flattenChildren(element.props?.children);
  }
  return "";
}

type MarkdownMessageProps = {
  content: string;
  className?: string;
  variant?: "default" | "compare-report";
};

export function MarkdownMessage({
  content,
  className,
  variant = "default",
}: MarkdownMessageProps) {
  const isCompareReport = variant === "compare-report";

  return (
    <div className={cn("markdown-message", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-3 mt-1 text-base font-semibold first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              className={cn(
                "mb-2 mt-4 text-sm font-semibold first:mt-0",
                isCompareReport &&
                  "border-b border-primary/20 pb-2 text-base tracking-tight"
              )}
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => {
            const text = flattenChildren(children);
            const isTopicHeading =
              isCompareReport && /^Chủ đề\s+\d+:/i.test(text);

            return (
              <h3
                className={cn(
                  "mb-2 mt-3 text-sm font-medium first:mt-0",
                  isCompareReport &&
                    "mt-6 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2 text-sm font-semibold text-foreground first:mt-0",
                  isTopicHeading && "border-l-4 border-l-primary pl-3"
                )}
              >
                {children}
              </h3>
            );
          },
          p: ({ children }) => (
            <p className="mb-3 leading-relaxed last:mb-0">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          blockquote: ({ children }) => (
            <blockquote className="mb-3 border-l-2 border-primary/40 pl-3 text-muted-foreground last:mb-0">
              {children}
            </blockquote>
          ),
          code: ({ className: codeClassName, children }) => {
            const isBlock = codeClassName?.includes("language-");

            if (isBlock) {
              return (
                <code className="block overflow-x-auto rounded-lg bg-background/80 px-3 py-2 font-mono text-xs">
                  {children}
                </code>
              );
            }

            return (
              <code className="rounded bg-background/80 px-1.5 py-0.5 font-mono text-[0.85em]">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="mb-3 overflow-x-auto rounded-lg border bg-background/80 p-3 last:mb-0">
              {children}
            </pre>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline underline-offset-2 hover:opacity-80"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="mb-3 overflow-x-auto last:mb-0">
              <table className="w-full border-collapse text-left text-xs">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="border-b bg-background/60">{children}</thead>
          ),
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => (
            <tr className="border-b border-border/60 last:border-0">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-2 py-1.5 font-semibold">{children}</th>
          ),
          td: ({ children }) => <td className="px-2 py-1.5">{children}</td>,
          hr: () => (
            <hr
              className={cn(
                "my-4 border-border/60",
                isCompareReport && "my-6 border-t-2 border-dashed border-primary/30"
              )}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
