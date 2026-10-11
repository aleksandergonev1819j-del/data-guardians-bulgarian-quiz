import { useEffect, useLayoutEffect, useRef, useState, type DragEvent, type MouseEvent, type ReactNode, type TouchEvent } from "react";
import { Check, ChevronUp, FileImage, FileText, FolderOpen, Lightbulb, PartyPopper, Presentation, RotateCw, Search, Trash2, Usb } from "lucide-react";
import { QuizButton } from "@/components/quiz-button";

const FILES = [
  { name: "Домашно.docx", icon: FileText, color: "#2b579a" },
  { name: "Снимка.jpg", icon: FileImage, color: "#0f8a7e" },
  { name: "Проект.pptx", icon: Presentation, color: "#d24726" },
];

const DEVICE = "USB устройство (E:)";

type Menu = { x: number; y: number; type: "file" | "desktop" | "usb"; file?: string | undefined } | null;
type Props = { done: boolean; onResolve: (selected: string, correct: boolean) => void };

/*
 * The laptop is drawn in a 1000×720 viewBox. Every overlay below is positioned in % of that box,
 * so the screen, the USB port and the plugged-in flash drive always line up with the drawing.
 */
const pct = (x: number, y: number, w: number, h: number) => ({ left: `${x / 10}%`, top: `${(y / 720) * 100}%`, width: `${w / 10}%`, height: `${(h / 720) * 100}%` });
const SCREEN = pct(215, 50, 690, 430);
const PORT_ZONE = pct(20, 615, 200, 103);
const PLUGGED_DRIVE = pct(26, 645, 108, 50);

export function UsbChallenge({ done, onResolve }: Props) {
  const [plugged, setPlugged] = useState(false);
  const [windowOpen, setWindowOpen] = useState(false);
  const [copied, setCopied] = useState<string[]>([]);
  const [clipboard, setClipboard] = useState<string | null>(null);
  const [trayOpen, setTrayOpen] = useState(false);
  const [ejected, setEjected] = useState(false);
  const [selectedStick, setSelectedStick] = useState(false);
  const [menu, setMenu] = useState<Menu>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [touch, setTouch] = useState(false);

  useEffect(() => { setTouch(window.matchMedia("(pointer: coarse)").matches); }, []);

  const mistake = (text: string) => { setMistakes((m) => m + 1); setHint(text); setMenu(null); };
  const allCopied = copied.length === FILES.length;

  const step = !plugged ? 1 : !allCopied ? 2 : !ejected ? 3 : 4;

  const plugIn = () => { if (plugged) return; setPlugged(true); setWindowOpen(true); setSelectedStick(false); };

  const copyFile = (name: string) => setCopied((c) => (c.includes(name) ? c : [...c, name]));

  const openMenuAt = (x: number, y: number, el: Element, type: "file" | "desktop" | "usb", file?: string) => {
    const box = (el.closest("[data-screen]") as HTMLElement).getBoundingClientRect();
    setMenu({ x: x - box.left, y: y - box.top, type, file });
  };

  /*
   * "Right click" for both mouse and touch: a right click, or holding a finger for a moment.
   * While a finger is down the browser's own long-press context menu is ignored, so it does not fire twice.
   */
  const press = useRef<{ timer: number; fired: boolean; x: number; y: number } | null>(null);
  const rightClick = (handler: (x: number, y: number, el: Element) => void) => ({
    onContextMenu: (e: MouseEvent) => { e.preventDefault(); e.stopPropagation(); if (!press.current) handler(e.clientX, e.clientY, e.currentTarget); },
    onTouchStart: (e: TouchEvent) => {
      e.stopPropagation();
      const t = e.touches[0]; const el = e.currentTarget;
      if (!t) return;
      const state = { timer: 0, fired: false, x: t.clientX, y: t.clientY };
      state.timer = window.setTimeout(() => { state.fired = true; handler(state.x, state.y, el); }, 450);
      press.current = state;
    },
    onTouchMove: (e: TouchEvent) => {
      const s = press.current; const t = e.touches[0];
      if (s && t && Math.hypot(t.clientX - s.x, t.clientY - s.y) > 10) clearTimeout(s.timer);
    },
    onTouchEnd: (e: TouchEvent) => {
      const s = press.current; if (!s) return;
      clearTimeout(s.timer);
      if (s.fired) e.preventDefault(); // no extra tap after a long press
      press.current = null;
    },
  });
  const noRightClick = { onContextMenu: (e: MouseEvent) => { e.preventDefault(); e.stopPropagation(); }, onTouchStart: (e: TouchEvent) => e.stopPropagation() };

  const eject = () => {
    setMenu(null);
    setTrayOpen(false);
    if (!allCopied) return mistake("Почакай! Още не си копирал всички файлове на работния плот. Първо ги копирай, после извади флашката.");
    setEjected(true);
    setWindowOpen(false);
  };

  const pullTooEarly = () => mistake(touch
    ? "Не дърпай флашката директно! Така може да изгубиш данните. Първо докосни иконата на флашката в лентата долу вдясно, задръж пръст върху „USB устройство (E:)“ и избери „Извади“."
    : "Не дърпай флашката директно! Така може да изгубиш данните. Първо кликни иконата на флашката в лентата долу вдясно, натисни с десен бутон върху „USB устройство (E:)“ и избери „Извади“.");

  const pullOut = (e: DragEvent) => {
    if (e.dataTransfer.dropEffect !== "none") return;
    if (!ejected) pullTooEarly();
  };

  const finish = () => { setPlugged(false); onResolve(mistakes === 0 ? "Без грешки!" : `Готово с ${mistakes} подсказки`, mistakes === 0); };

  const steps = touch
    ? [
        "Докосни флашката на масата, после мигащия USB порт отстрани на лаптопа",
        "Копирай файловете на работния плот (докосни файл, после празно място на плота, или задръж пръст → Копирай / Постави)",
        "Докосни иконата на флашката в лентата → задръж пръст върху „USB устройство (E:)“ → „Извади“",
        "Докосни флашката, за да я издърпаш от лаптопа",
      ]
    : [
        "Влачи флашката от масата в USB порта отстрани на лаптопа",
        "Копирай файловете на работния плот (влачи ги или десен бутон → Копирай / Постави)",
        "Кликни иконата на флашката в лентата → десен бутон върху „USB устройство (E:)“ → „Извади“",
        "Издърпай флашката от лаптопа обратно на масата",
      ];

  return (
    <div onClick={() => { setMenu(null); setTrayOpen(false); }}>
      <h2 className="font-display text-2xl font-black leading-tight sm:text-3xl">Включи флашката, копирай файловете и я извади безопасно!</h2>
      <ol className="mt-3 grid gap-1 text-sm font-bold sm:grid-cols-2">
        {steps.map((s, i) => (
          <li key={s} className={`rounded-lg border-2 px-3 py-1.5 ${step > i + 1 || done ? "answer-correct" : step === i + 1 ? "border-primary bg-highlight" : "border-border"}`}>{i + 1}. {s}</li>
        ))}
      </ol>
      <p className="mt-3 hidden items-center gap-2 rounded-lg bg-highlight px-3 py-2 text-sm font-bold max-sm:portrait:flex">
        <RotateCw className="size-4 shrink-0" /> Завърти телефона хоризонтално — така лаптопът ще е по-голям и по-лесен за игра.
      </p>

      <div className="mt-5 grid items-center gap-4 md:grid-cols-[9rem_1fr]">
        {/* Desk */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { if (e.dataTransfer.getData("plugged")) { e.preventDefault(); if (ejected) finish(); else pullTooEarly(); } }}
          className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border-strong bg-paper p-3 text-center text-xs font-bold"
        >
          <span className="text-muted-foreground">Масата</span>
          {!plugged && !done && (
            <>
              <div
                draggable={!touch}
                role="button"
                aria-label="Флашка"
                onDragStart={(e) => e.dataTransfer.setData("usb", "1")}
                onDragEnd={(e) => { if (e.dataTransfer.dropEffect === "none") mistake("Флашката не влезе. Пусни я точно върху мигащия USB порт отляво на лаптопа."); }}
                onClick={(e) => { e.stopPropagation(); setSelectedStick((s) => !s); }}
                className={`w-full max-w-36 cursor-grab rounded-lg p-1 ${selectedStick ? "ring-4 ring-primary" : ""}`}
              >
                <FlashDrive className="w-full" />
              </div>
              {touch ? "Докосни ме, после USB порта!" : "Влачи ме до USB порта!"}
            </>
          )}
          {plugged && ejected && "Издърпай флашката тук"}
          {done && <PartyPopper className="size-10 text-primary" />}
        </div>

        {/* Laptop, frontal view */}
        <div className="relative mx-auto w-full max-w-2xl select-none [-webkit-touch-callout:none]" style={{ aspectRatio: "1000 / 720" }}>
          <LaptopDrawing plugged={plugged} />

          {/* Screen */}
          <div data-screen className="absolute overflow-hidden" style={{ ...SCREEN, containerType: "inline-size" }}>
            <div
              className="absolute inset-0 bg-[linear-gradient(135deg,#0a2a6b_0%,#0f4fb5_55%,#1f7ae0_100%)] leading-tight"
              style={{ fontSize: "2.2cqw" }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { const f = e.dataTransfer.getData("file"); if (f) { e.preventDefault(); copyFile(f); } }}
              onClick={() => { if (selectedFile) { copyFile(selectedFile); setSelectedFile(null); } }}
              {...rightClick((x, y, el) => plugged && openMenuAt(x, y, el, "desktop"))}
            >
              {/* Desktop icons fill top-to-bottom in a column, like Windows */}
              <div className="absolute bottom-[13%] left-[1.5%] top-[3%] grid auto-cols-[6.5em] grid-flow-col grid-rows-4 gap-x-[0.5em] gap-y-[0.4em]">
                <DesktopIcon name="Кошче"><Trash2 className="size-[1.5em] text-[#4a5262]" /></DesktopIcon>
                {copied.map((name) => {
                  const F = FILES.find((f) => f.name === name)!;
                  return <DesktopIcon key={name} name={name}><F.icon className="size-[1.5em]" style={{ color: F.color }} /></DesktopIcon>;
                })}
              </div>

              {/* File Explorer window — opens low on the right so the desktop icons stay visible */}
              {windowOpen && (
                <div
                  className="absolute bottom-[13%] left-[36%] right-[2%] top-[24%] z-10 flex flex-col border border-[#1883d7] bg-white text-[#1a1a1a] shadow-[0_0.4em_1.2em_rgb(0_0_0/0.45)]"
                  onDragOver={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  {...noRightClick}
                >
                  <div className="flex h-[2em] shrink-0 items-center gap-[0.4em] pl-[0.5em]">
                    <FolderOpen className="size-[1.2em] shrink-0 text-[#e6a817]" />
                    <span className="flex-1 truncate">{DEVICE}</span>
                    <span className="grid h-full w-[2.2em] place-items-center text-[#555]">—</span>
                    <span className="grid h-full w-[2.2em] place-items-center text-[#555]">☐</span>
                    <button type="button" aria-label="Затвори" className="grid h-full w-[2.4em] place-items-center hover:bg-[#e81123] hover:text-white" onClick={() => setWindowOpen(false)}>✕</button>
                  </div>
                  <div className="flex shrink-0 gap-[1em] px-[0.5em] text-[0.85em]">
                    <span className="bg-[#1979ca] px-[0.6em] text-white">Файл</span><span>Начало</span><span>Споделяне</span><span>Изглед</span>
                  </div>
                  <div className="mx-[0.4em] my-[0.3em] shrink-0 truncate border border-[#d9d9d9] px-[0.4em] py-[0.1em] text-[0.9em]">› Този компютър › {DEVICE}</div>
                  <div className="min-h-0 flex-1 overflow-auto px-[0.3em] pb-[0.3em]">
                    <div className="border-b border-[#e5e5e5] px-[0.4em] text-[0.85em] text-[#6d6d6d]">Име</div>
                    {FILES.map((f) => (
                      <div
                        key={f.name}
                        draggable={!touch}
                        onDragStart={(e) => e.dataTransfer.setData("file", f.name)}
                        onClick={() => setSelectedFile((s) => (s === f.name ? null : f.name))}
                        {...rightClick((x, y, el) => openMenuAt(x, y, el, "file", f.name))}
                        className={`flex cursor-grab items-center gap-[0.4em] px-[0.4em] py-[0.4em] ${selectedFile === f.name ? "bg-[#cce8ff] outline outline-1 outline-[#99d1ff]" : "hover:bg-[#e5f3ff]"}`}
                      >
                        <f.icon className="size-[1.3em] shrink-0" style={{ color: f.color }} />
                        <span className="flex-1 truncate">{f.name}</span>
                        {copied.includes(f.name) && <Check className="size-[1.2em] shrink-0 text-[#107c10]" aria-label="Копиран" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Taskbar */}
              <div className="absolute inset-x-0 bottom-0 z-20 flex h-[10%] items-center bg-[#101826]/95 text-white" onClick={(e) => { e.stopPropagation(); setMenu(null); setTrayOpen(false); }} {...noRightClick}>
                <span className="grid h-full w-[2.8em] place-items-center"><WindowsLogo className="size-[1.2em] text-[#4cc2ff]" /></span>
                <span className="flex h-[78%] w-[28%] min-w-0 items-center gap-[0.4em] bg-white px-[0.5em] text-[#555]"><Search className="size-[1.1em] shrink-0" /><span className="truncate">Търси тук</span></span>
                <button
                  type="button"
                  aria-label="Файлов мениджър"
                  className="relative grid h-full w-[2.8em] place-items-center hover:bg-white/10"
                  onClick={(e) => { e.stopPropagation(); if (plugged && !ejected) setWindowOpen(true); }}
                >
                  <FolderOpen className="size-[1.3em] text-[#ffc83d]" />
                  {windowOpen && <span className="absolute inset-x-[15%] bottom-0 h-[0.18em] bg-[#76b9ed]" />}
                </button>
                <span className="flex-1" />
                <ChevronUp className="mx-[0.3em] size-[1.1em] opacity-80" />
                {plugged && !ejected && (
                  <button
                    type="button"
                    aria-label="Безопасно премахване на хардуер"
                    title="Безопасно премахване на хардуер и изваждане на носител"
                    onClick={(e) => { e.stopPropagation(); setMenu(null); setTrayOpen((o) => !o); }}
                    {...rightClick(() => mistake(touch
                      ? "Само докосни иконата на флашката, без да задържаш пръст, за да видиш свързаните устройства."
                      : "Натисни иконата на флашката в лентата с ЛЕВИЯ бутон на мишката, за да видиш свързаните устройства."))}
                    className={`grid h-full w-[2.2em] place-items-center hover:bg-white/15 ${trayOpen ? "bg-white/20" : ""} ${step === 3 && !trayOpen ? "animate-pulse bg-white/25" : ""}`}
                  ><Usb className="size-[1.2em]" /></button>
                )}
                <span className="px-[0.4em] text-[0.85em]">БГ</span>
                <span className="flex flex-col items-center px-[0.5em] text-[0.8em] leading-tight"><span>10:30</span><span>11.10.2026</span></span>
              </div>

              {/* Connected devices flyout above the tray */}
              {trayOpen && plugged && !ejected && (
                <div className="absolute bottom-[11%] right-[2%] z-30 w-[50%] border border-[#bdbdbd] bg-[#f2f2f2] py-[0.3em] text-[#1a1a1a] shadow-[0_0.3em_1em_rgb(0_0_0/0.4)]" onClick={(e) => e.stopPropagation()}>
                  <div className="px-[0.8em] pb-[0.2em] text-[0.85em] text-[#6d6d6d]">Свързани устройства</div>
                  <button
                    type="button"
                    onClick={() => mistake(touch ? "Сега задръж пръст върху „USB устройство (E:)“, докато се появи меню." : "Сега натисни с ДЕСНИЯ бутон на мишката върху „USB устройство (E:)“.")}
                    {...rightClick((x, y, el) => openMenuAt(x, y, el, "usb"))}
                    className="flex w-full items-center gap-[0.5em] px-[0.8em] py-[0.35em] text-left font-bold hover:bg-[#cce8ff]"
                  ><Usb className="size-[1.2em] shrink-0" /><span className="truncate">{DEVICE}</span></button>
                </div>
              )}

              {menu && (
                <ScreenMenu key={`${menu.x}-${menu.y}-${menu.type}`} x={menu.x} y={menu.y}>
                  {menu.type === "file" && <MenuItem onClick={() => { setClipboard(menu.file!); setMenu(null); }}>Копирай</MenuItem>}
                  {menu.type === "desktop" && <MenuItem onClick={() => { if (!clipboard) return mistake(touch ? "Няма какво да поставиш. Първо задръж пръст върху файл в прозореца на флашката и избери „Копирай“." : "Няма какво да поставиш. Първо натисни с десен бутон файл в прозореца на флашката и избери „Копирай“."); copyFile(clipboard); setMenu(null); }}>Постави</MenuItem>}
                  {menu.type === "usb" && <MenuItem onClick={eject}>Извади</MenuItem>}
                </ScreenMenu>
              )}

              {/* Windows 10 style notification */}
              {ejected && plugged && (
                <div role="status" className="absolute bottom-[11%] right-[2%] z-30 flex w-[56%] gap-[0.6em] bg-[#1f1f1f] p-[0.7em] text-white shadow-[0_0.3em_1em_rgb(0_0_0/0.5)] animate-in fade-in slide-in-from-right-4 duration-300">
                  <span className="grid size-[2.2em] shrink-0 place-items-center bg-[#0078d7]"><Usb className="size-[1.3em]" /></span>
                  <span className="min-w-0">
                    <span className="block font-bold">Безопасно премахване на хардуер</span>
                    <span className="block text-[0.9em] text-[#d0d0d0]">USB устройството е готово да се премахне безопасно.</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* USB port drop zone */}
          {!plugged && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { if (e.dataTransfer.getData("usb")) { e.preventDefault(); plugIn(); } }}
              onClick={(e) => { e.stopPropagation(); if (selectedStick) plugIn(); }}
              aria-label="USB порт"
              className="absolute animate-pulse rounded-md border-2 border-dashed border-primary bg-primary/15"
              style={PORT_ZONE}
            />
          )}

          {/* Flash drive seated in the side port */}
          {plugged && (
            <div
              draggable={!touch}
              role="button"
              aria-label="Включена флашка"
              onDragStart={(e) => e.dataTransfer.setData("plugged", "1")}
              onDragEnd={pullOut}
              onClick={(e) => { e.stopPropagation(); if (ejected) finish(); else pullTooEarly(); }}
              className="absolute cursor-grab"
              style={PLUGGED_DRIVE}
            >
              <FlashDrive plugged className="size-full" />
            </div>
          )}
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

function DesktopIcon({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-[0.2em] text-center">
      <span className="grid size-[2.3em] place-items-center rounded-[0.3em] bg-white/95">{children}</span>
      <span className="w-full text-[0.9em] font-bold text-white [overflow-wrap:anywhere] [text-shadow:0_1px_2px_rgb(0_0_0/0.8)]">{name}</span>
    </div>
  );
}

/** Context menu that is clamped so it never leaves the laptop screen. */
function ScreenMenu({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: x, top: y, visible: false });
  useLayoutEffect(() => {
    const el = ref.current;
    const screen = el?.parentElement;
    if (!el || !screen) return;
    const pad = 3;
    setPos({
      left: Math.max(pad, Math.min(x, screen.clientWidth - el.offsetWidth - pad)),
      top: Math.max(pad, Math.min(y, screen.clientHeight - el.offsetHeight - pad)),
      visible: true,
    });
  }, [x, y]);
  return (
    <div
      ref={ref}
      className="absolute z-40 min-w-[8em] border border-[#bdbdbd] bg-[#f2f2f2] py-[0.25em] text-[#1a1a1a] shadow-[0_0.3em_1em_rgb(0_0_0/0.4)]"
      style={{ left: pos.left, top: pos.top, visibility: pos.visible ? "visible" : "hidden" }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
    >{children}</div>
  );
}

function MenuItem({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return <button type="button" className="block w-full px-[1.2em] py-[0.3em] text-left hover:bg-[#cce8ff]" onClick={onClick}>{children}</button>;
}

function WindowsLogo({ className }: { className?: string }) {
  return <svg viewBox="0 0 16 16" className={className} aria-hidden="true"><path fill="currentColor" d="M0 2.3 6.5 1.4v6.1H0zM7.3 1.3 16 0v7.5H7.3zM0 8.3h6.5v6.2L0 13.6zM7.3 8.3H16V16l-8.7-1.2z" /></svg>;
}

/** Side profile of the flash drive. When plugged, the metal connector is hidden inside the port. */
function FlashDrive({ plugged = false, className }: { plugged?: boolean; className?: string }) {
  return (
    <svg viewBox={plugged ? "0 0 108 50" : "0 0 134 50"} className={className} aria-hidden="true">
      <circle cx="12" cy="25" r="8" fill="none" stroke="#22b8c4" strokeWidth="5" />
      <rect x="16" y="6" width="88" height="38" rx="12" fill="#f26b5b" className="stroke-ink" strokeWidth="3" />
      <rect x="24" y="12" width="58" height="6" rx="3" fill="#fff" opacity="0.4" />
      <rect x="98" y="8" width="10" height="34" rx="2" fill="#22b8c4" className="stroke-ink" strokeWidth="3" />
      {!plugged && (
        <g>
          <rect x="108" y="13" width="24" height="24" rx="1.5" fill="#cfd4dc" className="stroke-ink" strokeWidth="2.5" />
          <rect x="114" y="18" width="5" height="4" fill="#2f3542" />
          <rect x="123" y="18" width="5" height="4" fill="#2f3542" />
          <rect x="109.5" y="28" width="21" height="5" fill="#2b7de9" />
        </g>
      )}
    </svg>
  );
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Keys for one keyboard row; `units` are relative key widths, laid out between the deck's slanted edges. */
function keyRow(y: number, units: number[]) {
  const t = (y - 508) / (648 - 508);
  const left = lerp(170, 130, t) + 45;
  const right = lerp(950, 990, t) - 45;
  const gap = 5;
  const unit = (right - left - gap * (units.length - 1)) / units.reduce((a, b) => a + b, 0);
  let x = left;
  return units.map((u, i) => {
    const w = u * unit;
    const key = <rect key={`${y}-${i}`} x={x} y={y} width={w} height={15} rx={3} fill="#3a4252" />;
    x += w + gap;
    return key;
  });
}

const FULL_ROW = Array<number>(14).fill(1);

function LaptopDrawing({ plugged }: { plugged: boolean }) {
  return (
    <svg viewBox="0 0 1000 720" className="absolute inset-0 size-full" aria-label="Лаптоп" role="img">
      {/* Lid */}
      <rect x="190" y="8" width="740" height="500" rx="26" fill="#2f3542" className="stroke-ink" strokeWidth="6" />
      <circle cx="560" cy="30" r="7" fill="#11151d" stroke="#4a5262" strokeWidth="2" />
      <rect x="215" y="50" width="690" height="430" fill="#0b1220" />
      {/* Keyboard deck */}
      <path d="M170 508 H950 L990 648 H130 Z" fill="#cfd4dc" className="stroke-ink" strokeWidth="6" strokeLinejoin="round" />
      {keyRow(522, FULL_ROW)}
      {keyRow(542, FULL_ROW)}
      {keyRow(562, FULL_ROW)}
      {keyRow(582, [1, 1, 1, 7, 1, 1, 1])}
      <path d="M460 606 H660 L666 640 H454 Z" fill="#aeb4be" stroke="#8a919c" strokeWidth="3" strokeLinejoin="round" />
      {/* Front edge */}
      <path d="M130 648 H990 V676 Q990 692 974 692 H146 Q130 692 130 676 Z" fill="#9ea6b2" className="stroke-ink" strokeWidth="6" strokeLinejoin="round" />
      <rect x="520" y="652" width="80" height="6" rx="3" fill="#8a919c" />
      {/* USB port on the left side */}
      {!plugged && (
        <g>
          <rect x="126" y="657" width="30" height="26" rx="3" fill="#141a26" />
          <rect x="126" y="663" width="22" height="8" fill="#2b7de9" />
        </g>
      )}
      <g stroke="#4a5262" strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M168 670 H198 M176 670 L182 662 H190 M182 670 L188 678 H192" />
        <circle cx="166" cy="670" r="3" fill="#4a5262" />
      </g>
    </svg>
  );
}
