import { useState, type DragEvent, type MouseEvent } from "react";
import { FileImage, FileText, Presentation, Usb, Lightbulb, PartyPopper, FolderOpen } from "lucide-react";
import { QuizButton } from "@/components/quiz-button";
import laptopAsset from "@/assets/generated-laptop.png";
import usbAsset from "@/assets/generated-usb.png";

const FILES = [
  { name: "Домашно.docx", icon: FileText },
  { name: "Снимка.jpg", icon: FileImage },
  { name: "Проект.pptx", icon: Presentation },
];

type Menu = { x: number; y: number; type: "file" | "desktop" | "usb"; file?: string } | null;
type Props = { done: boolean; onResolve: (selected: string, correct: boolean) => void };

export function UsbChallenge({ done, onResolve }: Props) {
  const [plugged, setPlugged] = useState(false);
  const [windowOpen, setWindowOpen] = useState(false);
  const [copied, setCopied] = useState<string[]>([]);
  const [clipboard, setClipboard] = useState<string | null>(null);
  const [ejected, setEjected] = useState(false);
  const [selectedStick, setSelectedStick] = useState(false);
  const [menu, setMenu] = useState<Menu>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);

  const mistake = (text: string) => { setMistakes((m) => m + 1); setHint(text); setMenu(null); };
  const allCopied = copied.length === FILES.length;

  const step = !plugged ? 1 : !allCopied ? 2 : !ejected ? 3 : 4;

  const plugIn = () => { if (plugged) return; setPlugged(true); setWindowOpen(true); setSelectedStick(false); };

  const copyFile = (name: string) => setCopied((c) => (c.includes(name) ? c : [...c, name]));

  const openMenu = (e: MouseEvent, type: "file" | "desktop" | "usb", file?: string) => {
    e.preventDefault(); e.stopPropagation();
    const box = (e.currentTarget.closest("[data-screen]") as HTMLElement).getBoundingClientRect();
    setMenu({ x: e.clientX - box.left, y: e.clientY - box.top, type, file });
  };

  const eject = () => {
    setMenu(null);
    if (!allCopied) return mistake("Почакай! Още не си копирал всички файлове на работния плот. Първо ги копирай, после извади флашката.");
    setEjected(true);
    setWindowOpen(false);
  };

  const pullOut = (e: DragEvent) => {
    if (e.dataTransfer.dropEffect !== "none") return;
    if (!ejected) mistake("Не дърпай флашката директно! Така може да изгубиш данните. Натисни с десен бутон иконата на флашката долу в лентата и избери „Извади“.");
  };

  const finish = () => { setPlugged(false); onResolve(mistakes === 0 ? "Без грешки!" : `Готово с ${mistakes} подсказки`, mistakes === 0); };

  const steps = ["Влачи флашката в USB порта на лаптопа", "Копирай файловете на работния плот (влачи или десен бутон → Копирай / Постави)", "Десен бутон на флашката в лентата → „Извади“", "Издърпай флашката от лаптопа"];

  return (
    <div onClick={() => setMenu(null)}>
      <h2 className="font-display text-2xl font-black leading-tight sm:text-3xl">Включи флашката, копирай файловете и я извади безопасно!</h2>
      <ol className="mt-3 grid gap-1 text-sm font-bold sm:grid-cols-2">
        {steps.map((s, i) => (
          <li key={s} className={`rounded-lg border-2 px-3 py-1.5 ${step > i + 1 || done ? "answer-correct" : step === i + 1 ? "border-primary bg-highlight" : "border-border"}`}>{i + 1}. {s}</li>
        ))}
      </ol>

      <div className="mt-5 grid items-center gap-4 md:grid-cols-[1fr_9rem]">
        <div className="relative mx-auto w-full max-w-2xl select-none">
          <img src={laptopAsset} alt="Лаптоп" width={1024} height={768} className="w-full" draggable={false} />
          {/* Screen */}
          <div
            data-screen
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { const f = e.dataTransfer.getData("file"); if (f) { e.preventDefault(); copyFile(f); } }}
            onContextMenu={(e) => plugged && openMenu(e, "desktop")}
            className="absolute overflow-hidden rounded-sm bg-accent/40 text-[10px] sm:text-xs"
            style={{ left: "8%", top: "9.5%", width: "57%", height: "47%", transform: "skewY(-1.2deg)" }}
          >
            <div className="flex flex-wrap gap-2 p-2">
              {copied.map((name) => {
                const F = FILES.find((f) => f.name === name)!;
                return <div key={name} className="flex w-14 flex-col items-center text-center font-bold"><F.icon className="size-6 text-primary-strong" />{name}</div>;
              })}
            </div>

            {windowOpen && (
              <div className="absolute right-[4%] top-[6%] w-[62%] rounded-md border-2 border-ink bg-card shadow-mini">
                <div className="flex items-center justify-between bg-primary px-2 py-0.5 font-black text-primary-foreground"><span className="flex items-center gap-1"><FolderOpen className="size-3" /> USB (E:)</span><button type="button" onClick={() => setWindowOpen(false)}>✕</button></div>
                <div className="grid gap-0.5 p-1.5">
                  {FILES.map((f) => (
                    <div
                      key={f.name}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData("file", f.name)}
                      onContextMenu={(e) => openMenu(e, "file", f.name)}
                      className={`flex cursor-grab items-center gap-1 rounded px-1 py-0.5 font-bold hover:bg-highlight ${copied.includes(f.name) ? "opacity-50" : ""}`}
                    >
                      <f.icon className="size-4" /> {f.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Taskbar */}
            <div className="absolute inset-x-0 bottom-0 flex h-[14%] items-center justify-end gap-1 bg-ink px-2 text-paper">
              {plugged && !ejected && (
                <button
                  type="button"
                  aria-label="Флашка в лентата"
                  onClick={(e) => { e.stopPropagation(); if (!windowOpen) setWindowOpen(true); else mistake("За да извадиш флашката, натисни с ДЕСНИЯ бутон на мишката върху иконата ѝ."); }}
                  onContextMenu={(e) => openMenu(e, "usb")}
                  className="grid h-full place-items-center rounded px-1 hover:bg-ink-soft"
                ><Usb className="size-4" /></button>
              )}
              <span className="font-bold">10:30</span>
            </div>

            {menu && (
              <div className="absolute z-20 min-w-28 rounded-md border-2 border-ink bg-card py-1 font-bold shadow-mini" style={{ left: Math.min(menu.x, 200), top: Math.min(menu.y, 120) }} onClick={(e) => e.stopPropagation()}>
                {menu.type === "file" && <button type="button" className="block w-full px-3 py-1 text-left hover:bg-highlight" onClick={() => { setClipboard(menu.file!); setMenu(null); }}>Копирай</button>}
                {menu.type === "desktop" && <button type="button" className="block w-full px-3 py-1 text-left hover:bg-highlight" onClick={() => { if (!clipboard) return mistake("Няма какво да поставиш. Първо натисни с десен бутон файл в прозореца на флашката и избери „Копирай“."); copyFile(clipboard); setMenu(null); }}>Постави</button>}
                {menu.type === "usb" && <><button type="button" className="block w-full px-3 py-1 text-left hover:bg-highlight" onClick={() => { setWindowOpen(true); setMenu(null); }}>Отвори</button><button type="button" className="block w-full px-3 py-1 text-left hover:bg-highlight" onClick={eject}>Извади (Eject)</button></>}
              </div>
            )}

            {ejected && !done && <div className="absolute inset-x-[10%] top-[30%] rounded-md border-2 border-ink bg-success p-2 text-center font-black">Флашката може да бъде извадена безопасно ✔</div>}
          </div>

          {/* USB port */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { if (e.dataTransfer.getData("usb")) { e.preventDefault(); plugIn(); } }}
            onClick={() => selectedStick && plugIn()}
            aria-label="USB порт"
            className={`absolute grid place-items-center rounded-md border-2 border-dashed ${plugged ? "border-transparent" : "border-primary bg-primary/20 animate-pulse"}`}
            style={{ left: "6%", top: "64%", width: "14%", height: "18%" }}
          >
            {plugged && (
              <img
                src={usbAsset} alt="Включена флашка" width={1024} height={768}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("plugged", "1")}
                onDragEnd={pullOut}
                className="w-[160%] max-w-none -translate-x-[45%] -rotate-90 cursor-grab"
              />
            )}
          </div>
        </div>

        {/* Tray */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { if (e.dataTransfer.getData("plugged") && ejected) { e.preventDefault(); finish(); } }}
          className="flex min-h-32 flex-col items-center justify-center rounded-xl border-2 border-dashed border-border-strong bg-paper p-2 text-center text-xs font-bold"
        >
          {!plugged && !done && (
            <img
              src={usbAsset} alt="Флашка" width={1024} height={768} draggable
              onDragStart={(e) => e.dataTransfer.setData("usb", "1")}
              onDragEnd={(e) => { if (e.dataTransfer.dropEffect === "none") mistake("Флашката не влезе. Пусни я точно върху мигащия USB порт отляво на лаптопа."); }}
              onClick={() => setSelectedStick((s) => !s)}
              className={`w-full cursor-grab rounded-lg ${selectedStick ? "ring-4 ring-primary" : ""}`}
            />
          )}
          {!plugged && !done && "Влачи ме!"}
          {plugged && (ejected ? "Издърпай флашката тук" : "Масата")}
          {done && <PartyPopper className="size-10 text-primary" />}
        </div>
      </div>

      {hint && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4" role="dialog" aria-modal="true">
          <div className="feedback-panel w-full max-w-md rounded-2xl border-2 border-ink bg-card p-6 shadow-play">
            <div className="flex items-center gap-3"><span className="grid size-12 place-items-center rounded-full border-2 border-ink bg-secondary"><Lightbulb className="size-6" /></span><h3 className="font-display text-xl font-black">Подсказка</h3></div>
            <p className="mt-3 font-semibold">{hint}</p>
            <QuizButton className="mt-5 w-full" onClick={() => setHint(null)}>Разбрах!</QuizButton>
          </div>
        </div>
      )}
    </div>
  );
}
