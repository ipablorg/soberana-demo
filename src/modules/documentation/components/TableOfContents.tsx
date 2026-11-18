/**
 * TableOfContents - Sticky Navigation Sidebar
 * 
 * Auto-generates navigation from page sections with active state tracking.
 */

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/shared/lib/utils";

export interface TOCItem {
  id: string;
  title: string;
  level: number;
}

export interface TableOfContentsProps {
  /**
   * Array of section items
   */
  items: TOCItem[];
  
  /**
   * Optional title for the TOC
   */
  title?: string;
  
  /**
   * Additional class names
   */
  className?: string;
}

export function TableOfContents({ 
  items, 
  title = "On this page",
  className 
}: TableOfContentsProps) {
  const [activeId, setActiveId] = React.useState<string>("");

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -66%" }
    );

    // Observe all section elements
    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [items]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav className={cn("space-y-1", className)}>
      <h4 className="text-sm font-semibold text-foreground mb-4">{title}</h4>
      
      <ul className="space-y-2">
        {items.map((item) => {
          const isActive = activeId === item.id;
          
          return (
            <li
              key={item.id}
              className={cn(
                "relative",
                item.level > 2 && "ml-4"
              )}
            >
              <button
                onClick={() => handleClick(item.id)}
                className={cn(
                  "w-full text-left text-sm transition-colors hover:text-foreground py-1",
                  isActive 
                    ? "text-primary font-medium" 
                    : "text-muted-foreground"
                )}
              >
                {item.title}
              </button>
              
              {/* Active Indicator */}
              {isActive && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary"
                  initial={false}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                />
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

