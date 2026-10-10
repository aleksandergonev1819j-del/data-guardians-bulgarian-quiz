import { useMemo, useState } from "react";
import { Check, CircleX } from "lucide-react";
import { QuizButton } from "@/components/quiz-button";
import { shuffle, type MatchQuestion } from "@/lib/quiz-data";

type Props = { question: MatchQuestion; done: boolean; onResolve: (selected: string, correct: boolean) => void };

export function MatchQuestionView({ question, done, onResolve }: Props) {
  const labels = useMemo(() => shuffle(question.pairs.map((p) => p.label)), [question]);
  const [placed, setPlaced] = useState<(string | null)[]>(() => question.pairs.map(() => null));
  const [picked, setPicked] = useState<string | null>(null);
  const free = labels.filter((l) => !placed.includes(l));

  const place = (slot: number, label: string) => {
    if (done) return;
    setPlaced((prev) => prev.map((v, i) => (i === slot ? label : v === label ? null : v)));
    setPicked(null);
  };

  const check = () => {
    const correctCount = placed.filter((l, i) => l === question.pairs[i]?.label).length;
    onResolve(`${correctCount} от ${question.pairs.length} на място`, correctCount === question.pairs.length);
  };

  return (
    <div>
      <h2 className="font-display text-2xl font-black leading-tight sm:text-3xl">{question.prompt}</h2>
      <p className="mt-1 text-sm font-bold text-muted-foreground">Влачи името до картинката (или натисни име, после картинка).</p>
      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        {question.pairs.map((pair, i) => {
          const label = placed[i];
          const ok = done && label === pair.label;
          const bad = done && label !== pair.label;
          return (
            <div
              key={i}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); place(i, e.dataTransfer.getData("text/plain")); }}
              onClick={() => picked && place(i, picked)}
              className={`flex flex-col items-center rounded-xl border-2 bg-paper p-2 ${ok ? "answer-correct" : bad ? "answer-wrong" : "border-border-strong"} ${picked ? "cursor-pointer" : ""}`}
            >
              <img src={pair.image} alt="Носител" loading="lazy" width={1024} height={768} className="aspect-[4/3] w-full object-contain" />
              <div className="mt-2 flex min-h-11 w-full items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border-strong bg-card px-2 text-center text-sm font-black">
                {label ? (
                  <span draggable={!done} onDragStart={(e) => e.dataTransfer.setData("text/plain", label)} className="cursor-grab">{label}</span>
                ) : <span className="text-muted-foreground">?</span>}
                {ok && <Check className="size-4" />}
                {bad && <CircleX className="size-4" />}
              </div>
              {bad && <span className="mt-1 text-xs font-bold">Вярно: {pair.label}</span>}
            </div>
          );
        })}
      </div>
      {!done && (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {free.map((label) => (
            <button
              key={label}
              type="button"
              draggable
              onDragStart={(e) => e.dataTransfer.setData("text/plain", label)}
              onClick={() => setPicked(picked === label ? null : label)}
              className={`cursor-grab rounded-full border-2 border-ink px-4 py-2 text-sm font-black shadow-mini ${picked === label ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
            >
              {label}
            </button>
          ))}
          <QuizButton tone="next" className="ml-auto" disabled={free.length > 0} onClick={check}>Провери</QuizButton>
        </div>
      )}
    </div>
  );
}
