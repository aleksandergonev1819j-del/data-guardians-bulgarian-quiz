import { createFileRoute } from "@tanstack/react-router";
import { Check, ChevronRight, CircleX, HardDrive, Medal, Play, RotateCcw, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import { useState } from "react";
import { QuizButton } from "@/components/quiz-button";
import { createQuiz, type Question } from "@/lib/quiz-data";
import hddAsset from "@/assets/generated-hdd.png";
import ssdAsset from "@/assets/generated-ssd.png";
import usbAsset from "@/assets/generated-usb.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Пазители на данните | Образователна викторина" },
      { name: "description", content: "Забавна българска викторина за носители на информация и безопасна работа с тях." },
      { property: "og:title", content: "Пазители на данните" },
      { property: "og:description", content: "Провери знанията си за HDD, SSD, дискове и флашпамети в 10 забавни въпроса." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Answer = { question: Question; selected: string; correct: boolean };
type GameState = "start" | "playing" | "results";

function Index() {
  const [gameState, setGameState] = useState<GameState>("start");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);

  const beginGame = () => {
    setQuestions(createQuiz());
    setCurrent(0);
    setSelected(null);
    setAnswers([]);
    setGameState("playing");
  };

  const question = questions[current];
  const score = answers.filter((answer) => answer.correct).length;

  const chooseAnswer = (choice: string) => {
    if (!question || selected) return;
    setSelected(choice);
    setAnswers((previous) => [...previous, { question, selected: choice, correct: choice === question.answer }]);
  };

  const goNext = () => {
    if (current === questions.length - 1) {
      setGameState("results");
      return;
    }
    setCurrent((value) => value + 1);
    setSelected(null);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <Decorations />
      {gameState === "start" && <StartScreen onStart={beginGame} />}
      {gameState === "playing" && question && (
        <QuizScreen
          question={question}
          current={current}
          total={questions.length}
          score={score}
          selected={selected}
          onChoose={chooseAnswer}
          onNext={goNext}
        />
      )}
      {gameState === "results" && <ResultsScreen answers={answers} onRestart={beginGame} />}
    </main>
  );
}

function Header() {
  return (
    <header className="relative z-10 flex w-full max-w-6xl items-center justify-between px-5 py-5 md:px-8">
      <div className="flex items-center gap-3 font-display text-lg font-black md:text-xl">
        <span className="grid size-10 place-items-center rounded-xl border-2 border-ink bg-secondary shadow-mini"><ShieldCheck className="size-6" /></span>
        Пазители на данните
      </div>
      <span className="hidden rounded-full border-2 border-border-strong bg-card px-4 py-2 text-sm font-bold text-muted-foreground sm:inline">Учим • Играем • Пазим</span>
    </header>
  );
}

function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center">
      <Header />
      <section className="grid w-full max-w-6xl flex-1 items-center gap-10 px-5 pb-10 pt-4 md:grid-cols-[1.05fr_0.95fr] md:px-8 md:pb-16">
        <div className="max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-highlight px-4 py-2 text-sm font-black uppercase tracking-wide shadow-mini">
            <Sparkles className="size-4" /> Мисия: 10 въпроса
          </div>
          <h1 className="font-display text-5xl font-black leading-[0.95] sm:text-6xl md:text-7xl lg:text-8xl">
            Стани <span className="text-primary">пазител</span> на данните!
          </h1>
          <p className="mt-6 max-w-xl text-lg font-semibold leading-relaxed text-muted-foreground md:text-xl">
            Разпознавай устройства, откривай безопасните правила и събери максимален резултат.
          </p>
          <QuizButton type="button" onClick={onStart} className="mt-8 min-h-14 px-7 text-lg">
            <Play className="size-5 fill-current" /> Започни играта
          </QuizButton>
          <div className="mt-8 flex flex-wrap gap-3 text-sm font-bold">
            <span className="rounded-full bg-secondary px-4 py-2">10 въпроса</span>
            <span className="rounded-full bg-accent px-4 py-2">3 вида предизвикателства</span>
            <span className="rounded-full bg-highlight px-4 py-2">Нови въпроси всеки път</span>
          </div>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-lg" aria-label="Носители на информация">
          <div className="absolute inset-[10%] rotate-3 rounded-[2rem] border-2 border-ink bg-secondary shadow-play" />
          <div className="absolute left-[3%] top-[7%] w-[55%] -rotate-6 rounded-2xl border-2 border-ink bg-card p-4 shadow-play">
            <img src={hddAsset} alt="Твърд диск" width={1024} height={768} className="aspect-[4/3] w-full object-contain" />
            <span className="mt-2 block font-display text-xl font-black">HDD</span>
          </div>
          <div className="absolute bottom-[7%] right-[2%] w-[57%] rotate-6 rounded-2xl border-2 border-ink bg-card p-4 shadow-play">
            <img src={ssdAsset} alt="SSD" width={1024} height={768} className="aspect-[4/3] w-full object-contain" />
            <span className="mt-2 block font-display text-xl font-black">SSD</span>
          </div>
          <div className="absolute right-[4%] top-[9%] w-[29%] rotate-6 rounded-2xl border-2 border-ink bg-highlight p-3 shadow-play">
            <img src={usbAsset} alt="USB флашпамет" width={1024} height={768} className="aspect-square w-full object-contain" />
          </div>
          <div className="absolute bottom-[12%] left-[4%] grid size-20 -rotate-6 place-items-center rounded-full border-2 border-ink bg-accent shadow-play md:size-24">
            <HardDrive className="size-10 md:size-12" />
          </div>
        </div>
      </section>
    </div>
  );
}

type QuizScreenProps = {
  question: Question; current: number; total: number; score: number; selected: string | null;
  onChoose: (choice: string) => void; onNext: () => void;
};

function QuizScreen({ question, current, total, score, selected, onChoose, onNext }: QuizScreenProps) {
  const isCorrect = selected === question.answer;
  return (
    <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 py-5 md:px-8 md:py-7">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-display font-black"><ShieldCheck className="size-6 text-primary" /> Пазители на данните</div>
        <div className="flex items-center gap-2 rounded-full border-2 border-border-strong bg-card px-4 py-2 text-sm font-black"><Trophy className="size-4 text-secondary-strong" /> {score} т.</div>
      </div>
      <div className="mt-5 flex items-center gap-4">
        <div className="h-3 flex-1 overflow-hidden rounded-full border-2 border-ink bg-card">
          <div className="h-full bg-primary transition-[width] duration-500" style={{ width: `${((current + 1) / total) * 100}%` }} />
        </div>
        <span className="shrink-0 text-sm font-black">{current + 1} / {total}</span>
      </div>

      <section className="my-auto py-7">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="rounded-full border-2 border-ink bg-secondary px-4 py-1.5 text-sm font-black">{question.category}</span>
          <span className="hidden text-sm font-bold text-muted-foreground sm:block">Избери един отговор</span>
        </div>
        <div className="rounded-2xl border-2 border-ink bg-card p-5 shadow-play md:p-8">
          <div className={question.image ? "grid items-center gap-7 md:grid-cols-[0.7fr_1.3fr]" : ""}>
            {question.image && <div className="rounded-xl border-2 border-border-strong bg-paper p-3"><img src={question.image} alt={question.imageAlt} loading="lazy" width={1024} height={768} className="mx-auto aspect-[4/3] max-h-64 w-full object-contain" /></div>}
            <div>
              <h2 className="font-display text-2xl font-black leading-tight sm:text-3xl md:text-4xl">{question.prompt}</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {question.choices.map((choice, index) => {
                  const correctChoice = selected && choice === question.answer;
                  const wrongChoice = selected === choice && choice !== question.answer;
                  return (
                    <QuizButton
                      key={choice}
                      tone="answer"
                      onClick={() => onChoose(choice)}
                      disabled={selected !== null}
                      className={`${correctChoice ? "answer-correct" : ""} ${wrongChoice ? "answer-wrong" : ""} justify-start text-left disabled:opacity-100`}
                    >
                      <span className="grid size-7 shrink-0 place-items-center rounded-lg border-2 border-current text-xs">{String.fromCharCode(А_CODE + index)}</span>
                      <span className="flex-1">{choice}</span>
                      {correctChoice && <Check className="size-5" />}
                      {wrongChoice && <CircleX className="size-5" />}
                    </QuizButton>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {selected && (
          <div className={`feedback-panel mt-4 flex flex-col gap-4 rounded-2xl border-2 border-ink p-5 shadow-play sm:flex-row sm:items-center ${isCorrect ? "bg-success" : "bg-danger-soft"}`}>
            <div className={`grid size-12 shrink-0 place-items-center rounded-full border-2 border-ink ${isCorrect ? "bg-success-strong" : "bg-danger"}`}>
              {isCorrect ? <Check className="size-7" /> : <CircleX className="size-7" />}
            </div>
            <div className="flex-1">
              <h3 className="font-display text-xl font-black">{isCorrect ? "Страхотно! Точно така." : `Почти! Верният отговор е „${question.answer}“.`}</h3>
              <p className="mt-1 font-semibold"><strong>Запомни:</strong> {question.lesson}</p>
            </div>
            <QuizButton tone="next" onClick={onNext} className="shrink-0">
              {current === total - 1 ? "Виж резултата" : "Следващ"} <ChevronRight className="size-5" />
            </QuizButton>
          </div>
        )}
      </section>
    </div>
  );
}

const А_CODE = 1040;

function ResultsScreen({ answers, onRestart }: { answers: Answer[]; onRestart: () => void }) {
  const score = answers.filter((answer) => answer.correct).length;
  const message = score === 10 ? "Истински пазител на данните!" : score >= 7 ? "Чудесна работа, пазителю!" : "Добро начало — опитай пак!";
  return (
    <div className="relative z-10 mx-auto min-h-screen w-full max-w-6xl px-5 py-7 md:px-8">
      <Header />
      <section className="mx-auto mt-4 max-w-5xl">
        <div className="grid items-center gap-5 rounded-2xl border-2 border-ink bg-secondary p-6 shadow-play md:grid-cols-[auto_1fr_auto] md:p-8">
          <div className="grid size-24 place-items-center rounded-full border-2 border-ink bg-highlight shadow-mini"><Medal className="size-12" /></div>
          <div>
            <p className="text-sm font-black uppercase tracking-wide">Мисията е завършена</p>
            <h1 className="mt-1 font-display text-3xl font-black md:text-5xl">{message}</h1>
            <p className="mt-2 font-semibold text-muted-foreground">Всеки верен отговор те прави по-добър защитник на информацията.</p>
          </div>
          <div className="text-left md:text-center">
            <div className="font-display text-6xl font-black text-primary">{score}<span className="text-2xl text-foreground">/10</span></div>
            <span className="font-bold">верни отговора</span>
          </div>
        </div>

        <div className="mt-7 overflow-hidden rounded-2xl border-2 border-ink bg-card shadow-play">
          <div className="border-b-2 border-ink px-5 py-4"><h2 className="font-display text-2xl font-black">Твоите резултати</h2></div>
          <div className="divide-y-2 divide-border">
            {answers.map((answer, index) => (
              <div key={answer.question.id} className="grid gap-2 px-4 py-4 sm:grid-cols-[2.2rem_1fr_1fr_auto] sm:items-center sm:px-5">
                <span className={`grid size-8 place-items-center rounded-full border-2 border-ink font-black ${answer.correct ? "bg-success" : "bg-danger-soft"}`}>{index + 1}</span>
                <span className="font-bold">{answer.question.prompt}</span>
                <span className="text-sm font-semibold text-muted-foreground">Твоят отговор: <strong className="text-foreground">{answer.selected}</strong></span>
                {answer.correct ? <Check className="size-6 text-success-ink" aria-label="Вярно" /> : <CircleX className="size-6 text-danger" aria-label="Грешно" />}
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center py-8">
          <QuizButton onClick={onRestart} className="min-h-14 px-7 text-lg"><RotateCcw className="size-5" /> Нова игра</QuizButton>
        </div>
      </section>
    </div>
  );
}

function Decorations() {
  return <div aria-hidden="true" className="pointer-events-none fixed inset-0"><div className="dot-field absolute inset-0 opacity-50" /><div className="absolute -left-12 top-1/4 size-28 rotate-12 rounded-2xl border-2 border-ink bg-accent opacity-70" /><div className="absolute -right-10 bottom-20 size-24 -rotate-12 rounded-full border-2 border-ink bg-secondary opacity-70" /></div>;
}