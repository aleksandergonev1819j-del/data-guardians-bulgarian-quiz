import { type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type QuizButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "answer" | "next";
};

export function QuizButton({ className, tone = "primary", ...props }: QuizButtonProps) {
  return (
    <button
      className={cn(
        "quiz-button inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 px-5 py-3 text-base font-extrabold transition-all focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60",
        tone === "primary" && "border-primary-strong bg-primary text-primary-foreground shadow-play hover:-translate-y-0.5 hover:bg-primary-strong",
        tone === "answer" && "border-border-strong bg-card text-foreground hover:-translate-y-0.5 hover:border-primary hover:bg-highlight",
        tone === "next" && "border-ink bg-ink text-paper hover:-translate-y-0.5 hover:bg-ink-soft",
        className,
      )}
      {...props}
    />
  );
}