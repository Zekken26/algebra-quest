import "katex/dist/katex.min.css";
import katex from "katex";
import { useMemo } from "react";

type MathRendererProps = {
  latex: string;
  displayMode?: boolean;
  className?: string;
};

export function MathRenderer({ latex, displayMode = false, className }: MathRendererProps) {
  const html = useMemo(() => {
    if (!latex) return "";
    try {
      return katex.renderToString(latex, {
        displayMode,
        throwOnError: false,
      });
    } catch {
      return latex;
    }
  }, [latex, displayMode]);

  if (!html) return null;

  if (displayMode) {
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
