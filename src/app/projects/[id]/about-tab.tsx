"use client";

import DOMPurify from "dompurify";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

interface AboutTabProps {
  content: string;
}

function isHTML(str: string): boolean {
  return /<[a-z][\s\S]*>/i.test(str);
}

export function AboutTab({ content }: AboutTabProps) {
  if (!content) {
    return (
      <p className="text-sm" style={{ color: "#F0F0F0", opacity: 0.6 }}>
        Chưa có mô tả.
      </p>
    );
  }

  if (isHTML(content)) {
    const clean = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [
        "h1", "h2", "h3", "h4", "p", "br", "strong", "em", "u", "s",
        "a", "img", "ul", "ol", "li", "blockquote", "pre", "code", "hr",
        "div", "span",
      ],
      ALLOWED_ATTR: [
        "href", "src", "alt", "title", "target", "rel", "class", "width", "height",
      ],
    });

    return (
      <div
        className="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: clean }}
      />
    );
  }

  // Fallback: render as markdown for old plain-text descriptions
  return (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
