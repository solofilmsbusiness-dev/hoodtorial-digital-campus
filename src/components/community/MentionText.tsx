import React from "react";
import { Link } from "react-router-dom";

interface MentionTextProps {
  content: string;
  className?: string;
}

/**
 * Renders text with @mentions highlighted and linked to the community
 */
export function MentionText({ content, className }: MentionTextProps) {
  // Split content by @mentions
  const parts = content.split(/(@\w+)/g);
  
  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.startsWith('@')) {
          return (
            <span 
              key={index}
              className="text-primary font-bold cursor-pointer hover:underline"
              title={`View ${part}'s profile`}
            >
              {part}
            </span>
          );
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
}
