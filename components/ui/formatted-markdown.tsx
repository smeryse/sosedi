import React from "react";

interface FormattedMarkdownProps {
  content: string;
  className?: string;
}

/** Parses markdown formatting (**bold**, *italic*, bullet lists) into clean JSX elements */
export function FormattedMarkdown({ content, className = "" }: FormattedMarkdownProps) {
  if (!content) return null;

  const lines = content.split("\n");

  return (
    <div className={`space-y-2 leading-relaxed ${className}`}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // Bullet point lines (* item or - item or • item)
        const isBullet = /^[*\-•]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed);
        const cleanLine = isBullet
          ? trimmed.replace(/^[*\-•]\s+/, "").replace(/^\d+\.\s+/, "")
          : trimmed;

        const renderedText = renderInlineMarkdown(cleanLine);

        if (isBullet) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 my-0.5">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#7B9E00]" />
              <div className="flex-1 min-w-0">{renderedText}</div>
            </div>
          );
        }

        return <p key={idx}>{renderedText}</p>;
      })}
    </div>
  );
}

function renderInlineMarkdown(text: string): React.ReactNode {
  // Regex to split by **bold** or *italic*
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|__.*?__)/g);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-black text-[#111111] dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("__") && part.endsWith("__")) {
      return (
        <em key={i} className="font-semibold italic">
          {part.slice(2, -2)}
        </em>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={i} className="font-semibold italic">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}
