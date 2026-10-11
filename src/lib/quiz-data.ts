import cdAsset from "@/assets/generated-cd.png";
import dvdAsset from "@/assets/generated-dvd.png";
import hddAsset from "@/assets/generated-hdd.png";
import ssdAsset from "@/assets/generated-ssd.png";
import usbAsset from "@/assets/generated-usb.png";
import blurayAsset from "@/assets/generated-bluray.png";
import cardAsset from "@/assets/generated-card.png";
import floppyAsset from "@/assets/generated-floppy.png";

type Base = { id: string; prompt: string; lesson: string };

export type ChoiceQuestion = Base & {
  kind: "choice";
  category: "Разпознай" | "Вярно или грешно" | "Бърз тест";
  choices: string[];
  answer: string;
  image?: string;
  imageAlt?: string;
};

export type MatchPair = { label: string; image: string };
export type MatchQuestion = Base & { kind: "match"; category: "Подреди"; pairs: MatchPair[] };
export type UsbQuestion = Base & { kind: "usb"; category: "Голямото предизвикателство" };
export type Question = ChoiceQuestion | MatchQuestion | UsbQuestion;

const choice = (q: Omit<ChoiceQuestion, "kind">): ChoiceQuestion => ({ ...q, kind: "choice" });

export const questionBank: Question[] = [
  choice({ id: "image-hdd", category: "Разпознай", prompt: "Кой носител е показан на изображението?", choices: ["Твърд диск (HDD)", "SSD", "Компактдиск", "Флашпамет"], answer: "Твърд диск (HDD)", lesson: "Твърдият диск съхранява данните върху покрити с магнитен слой плочи.", image: hddAsset, imageAlt: "Илюстрация на твърд диск" }),
  choice({ id: "image-cd", category: "Разпознай", prompt: "Познай носителя от изображението.", choices: ["DVD", "Компактдиск (CD)", "Blu-ray диск", "SSD"], answer: "Компактдиск (CD)", lesson: "Компактдискът се чете с лазер и се използва за съхраняване на информация.", image: cdAsset, imageAlt: "Илюстрация на компактдиск" }),
  choice({ id: "image-dvd", category: "Разпознай", prompt: "Кой оптичен носител виждаш?", choices: ["USB флашпамет", "Компактдиск", "DVD", "Твърд диск"], answer: "DVD", lesson: "DVD може да съхранява звук и видео с високо качество.", image: dvdAsset, imageAlt: "Илюстрация на DVD" }),
  choice({ id: "image-usb", category: "Разпознай", prompt: "Как се нарича това компактно устройство?", choices: ["SSD", "Четец на карти", "USB флашпамет", "DVD устройство"], answer: "USB флашпамет", lesson: "Флашпаметта няма движещи се части и се включва в USB порт.", image: usbAsset, imageAlt: "Илюстрация на USB флашпамет" }),
  choice({ id: "image-ssd", category: "Разпознай", prompt: "Кой съвременен носител е показан?", choices: ["SSD", "HDD", "Карта памет", "Компактдиск"], answer: "SSD", lesson: "SSD е бърз, безшумен и енергонезависим носител без движещи се части.", image: ssdAsset, imageAlt: "Илюстрация на SSD" }),
  choice({ id: "tf-sun", category: "Вярно или грешно", prompt: "Безопасно е да оставяме компактдисковете на пряка слънчева светлина.", choices: ["Вярно", "Грешно"], answer: "Грешно", lesson: "Дисковете не трябва да се излагат на пряка слънчева светлина." }),
  choice({ id: "tf-fingers", category: "Вярно или грешно", prompt: "Можем спокойно да пипаме повърхността на диска с пръсти.", choices: ["Вярно", "Грешно"], answer: "Грешно", lesson: "Не пипай повърхността на дисковете — дръж ги за краищата." }),
  choice({ id: "tf-case", category: "Вярно или грешно", prompt: "Добре е дисковете да се съхраняват в кутии или обложки.", choices: ["Вярно", "Грешно"], answer: "Вярно", lesson: "Кутията предпазва диска от прах, драскотини и повреди." }),
  choice({ id: "tf-eject", category: "Вярно или грешно", prompt: "Външен носител трябва да се извади чрез командата „Eject“ (Извади).", choices: ["Вярно", "Грешно"], answer: "Вярно", lesson: "Използвай „Извади“, преди да отделиш външния носител от компютъра." }),
  choice({ id: "tf-heat", category: "Вярно или грешно", prompt: "Носителите могат да стоят близо до нагревателни уреди.", choices: ["Вярно", "Грешно"], answer: "Грешно", lesson: "Пази носителите далеч от нагревателни уреди и силна топлина." }),
  choice({ id: "match-cd", category: "Бърз тест", prompt: "Кое физическо име е за работа с компактдискове?", choices: ["CD устройство", "USB устройство", "Четец на карти", "Флопидисково устройство"], answer: "CD устройство", lesson: "Физическото име показва типа на устройството." }),
  choice({ id: "match-dvd", category: "Бърз тест", prompt: "Кое устройство работи с дигитални видеодискове?", choices: ["CD устройство", "DVD устройство", "USB устройство", "Четец на карти"], answer: "DVD устройство", lesson: "DVD устройството служи за работа с дигитални видеодискове." }),
  choice({ id: "match-usb", category: "Бърз тест", prompt: "Кое устройство е предназначено за флашпамет?", choices: ["DVD устройство", "Четец на карти", "USB устройство", "Флопидисково устройство"], answer: "USB устройство", lesson: "USB устройството осигурява връзка с флашпаметта." }),
  choice({ id: "match-card", category: "Бърз тест", prompt: "Кое устройство използваме за флашкарти?", choices: ["Четец на карти", "CD устройство", "DVD устройство", "Флопидисково устройство"], answer: "Четец на карти", lesson: "Четецът на карти може да бъде вътрешен или външен." }),
  choice({ id: "match-floppy", category: "Бърз тест", prompt: "Кое физическо име е за работа с дискети?", choices: ["USB устройство", "DVD устройство", "Флопидисково устройство", "Четец на карти"], answer: "Флопидисково устройство", lesson: "Днес флопидисковото устройство рядко се среща в новите компютри." }),
  { id: "order-1", kind: "match", category: "Подреди", prompt: "Сложи всяко име под правилната картинка!", lesson: "HDD, флашпамет, CD и Blu-ray са различни носители на информация.", pairs: [{ label: "Твърд диск", image: hddAsset }, { label: "Флашпамет", image: usbAsset }, { label: "CD", image: cdAsset }, { label: "Blu-ray", image: blurayAsset }] },
  { id: "order-2", kind: "match", category: "Подреди", prompt: "Познай носителите и ги именувай!", lesson: "SSD е бърз, DVD е оптичен диск, картата памет е флаш носител, а дискетата е стар магнитен носител.", pairs: [{ label: "SSD", image: ssdAsset }, { label: "DVD", image: dvdAsset }, { label: "Карта памет", image: cardAsset }, { label: "Дискета", image: floppyAsset }] },
  { id: "order-3", kind: "match", category: "Подреди", prompt: "Кое устройство чете този носител?", lesson: "Всеки носител има устройство за достъп до него.", pairs: [{ label: "USB устройство", image: usbAsset }, { label: "CD устройство", image: cdAsset }, { label: "Четец на карти", image: cardAsset }, { label: "Флопидисково устройство", image: floppyAsset }] },
  { id: "order-4", kind: "match", category: "Подреди", prompt: "Свържи картинките с имената им!", lesson: "Оптичните дискове се четат с лазер, а HDD и SSD са вътре в компютъра.", pairs: [{ label: "SSD", image: ssdAsset }, { label: "Blu-ray", image: blurayAsset }, { label: "Твърд диск", image: hddAsset }, { label: "DVD", image: dvdAsset }] },
];

export const usbChallenge: UsbQuestion = {
  id: "usb-challenge",
  kind: "usb",
  category: "Голямото предизвикателство",
  prompt: "Включи флашката, копирай файловете на работния плот и я извади безопасно!",
  lesson: "Правилният ред е: включи → копирай → клик върху иконата на флашката в лентата → десен бутон върху устройството → „Извади“ → чак тогава я издърпай.",
};

const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

/** Random questions, always ending with the USB challenge. */
export function createQuiz(count = 10): Question[] {
  const picked = shuffle(questionBank).slice(0, count - 1).map((q) => (q.kind === "choice" ? { ...q, choices: shuffle(q.choices) } : q));
  return [...picked, usbChallenge];
}

export { shuffle };
