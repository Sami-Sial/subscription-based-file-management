"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle({ size = "md", className = "" }) {
  const { theme, toggle, mounted } = useTheme();

  const sizes = {
    sm: "w-8 h-8",
    md: "w-9 h-9",
    lg: "w-10 h-10",
  };
  const iconSize = size === "sm" ? 14 : size === "lg" ? 18 : 16;

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      data-testid="theme-toggle"
      className={`${sizes[size]} inline-flex items-center justify-center rounded-xl fc-border border fc-surface hover:fc-surface-2 transition-all fc-text-secondary hover:fc-text ${className}`}
      style={{ background: "var(--bg-surface)" }}
    >
      {mounted && theme === "dark" ? (
        <Sun size={iconSize} />
      ) : (
        <Moon size={iconSize} />
      )}
    </button>
  );
}
