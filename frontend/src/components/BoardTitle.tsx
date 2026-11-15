import type { ElementType } from "react";

// A section heading set like the menu boards: spaced serif capitals, with
// "Cold" in icy blue and "Hot" in the accent colour.
export function BoardTitle({
  children,
  as: Tag = "h2",
  className = "",
}: {
  children: string;
  as?: ElementType;
  className?: string;
}) {
  const words = children.split(" ");
  return (
    <Tag className={`board-title text-chalk ${className}`}>
      {words.map((word, i) => {
        const tone = word === "Cold" ? "text-ice" : word === "Hot" ? "text-(--accent-soft)" : "";
        return (
          <span key={i} className={tone}>
            {word}
            {i < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </Tag>
  );
}
