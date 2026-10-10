import cdAsset from "@/assets/generated-cd.png";
import dvdAsset from "@/assets/generated-dvd.png";
import hddAsset from "@/assets/generated-hdd.png";
import ssdAsset from "@/assets/generated-ssd.png";
import usbAsset from "@/assets/generated-usb.png";

export type Question = {
  id: string;
  category: "Разпознай" | "Вярно или грешно" | "Бърз тест";
  prompt: string;
  choices: string[];
  answer: string;
  lesson: string;
  image?: string;
  imageAlt?: string;
};

export const questionBank: Question[] = [
  { id: "image-hdd", category: "Разпознай", prompt: "Кой носител е показан на изображението?", choices: ["Твърд диск (HDD)", "SSD", "Компактдиск", "Флашпамет"], answer: "Твърд диск (HDD)", lesson: "Твърдият диск съхранява данните върху покрити с магнитен слой плочи.", image: hddAsset, imageAlt: "Илюстрация на твърд диск" },
  { id: "image-cd", category: "Разпознай", prompt: "Познай носителя от изображението.", choices: ["DVD", "Компактдиск (CD)", "Blu-ray диск", "SSD"], answer: "Компактдиск (CD)", lesson: "Компактдискът се чете с лазер и се използва за съхраняване на информация.", image: cdAsset, imageAlt: "Илюстрация на компактдиск" },
  { id: "image-dvd", category: "Разпознай", prompt: "Кой оптичен носител виждаш?", choices: ["USB флашпамет", "Компактдиск", "DVD", "Твърд диск"], answer: "DVD", lesson: "DVD може да съхранява звук и видео с високо качество.", image: dvdAsset, imageAlt: "Илюстрация на DVD" },
  { id: "image-usb", category: "Разпознай", prompt: "Как се нарича това компактно устройство?", choices: ["SSD", "Четец на карти", "USB флашпамет", "DVD устройство"], answer: "USB флашпамет", lesson: "Флашпаметта няма движещи се части и се включва в USB порт.", image: usbAsset, imageAlt: "Илюстрация на USB флашпамет" },
  { id: "image-ssd", category: "Разпознай", prompt: "Кой съвременен носител е показан?", choices: ["SSD", "HDD", "Карта памет", "Компактдиск"], answer: "SSD", lesson: "SSD е бърз, безшумен и енергонезависим носител без движещи се части.", image: ssdAsset, imageAlt: "Илюстрация на SSD" },
  { id: "tf-sun", category: "Вярно или грешно", prompt: "Безопасно е да оставяме компактдисковете на пряка слънчева светлина.", choices: ["Вярно", "Грешно"], answer: "Грешно", lesson: "Дисковете не трябва да се излагат на пряка слънчева светлина." },
  { id: "tf-fingers", category: "Вярно или грешно", prompt: "Можем спокойно да пипаме повърхността на диска с пръсти.", choices: ["Вярно", "Грешно"], answer: "Грешно", lesson: "Не пипай повърхността на дисковете — дръж ги за краищата." },
  { id: "tf-case", category: "Вярно или грешно", prompt: "Добре е дисковете да се съхраняват в кутии или обложки.", choices: ["Вярно", "Грешно"], answer: "Вярно", lesson: "Кутията предпазва диска от прах, драскотини и повреди." },
  { id: "tf-eject", category: "Вярно или грешно", prompt: "Външен носител трябва да се извади чрез командата „Извади“.", choices: ["Вярно", "Грешно"], answer: "Вярно", lesson: "Използвай „Извади“, преди да отделиш външния носител от компютъра." },
  { id: "tf-heat", category: "Вярно или грешно", prompt: "Носителите могат да стоят близо до нагревателни уреди.", choices: ["Вярно", "Грешно"], answer: "Грешно", lesson: "Пази носителите далеч от нагревателни уреди и силна топлина." },
  { id: "tf-bd", category: "Вярно или грешно", prompt: "Blu-ray дискът има висока плътност на запис.", choices: ["Вярно", "Грешно"], answer: "Вярно", lesson: "Blu-ray се използва за видеоинформация с висока разделителна способност." },
  { id: "match-cd", category: "Бърз тест", prompt: "Кое физическо име е за работа с компактдискове?", choices: ["CD устройство", "USB устройство", "Четец на карти", "Флопидисково устройство"], answer: "CD устройство", lesson: "Физическото име показва типа на устройството." },
  { id: "match-dvd", category: "Бърз тест", prompt: "Кое устройство работи с дигитални видеодискове?", choices: ["CD устройство", "DVD устройство", "USB устройство", "Четец на карти"], answer: "DVD устройство", lesson: "DVD устройството служи за работа с дигитални видеодискове." },
  { id: "match-usb", category: "Бърз тест", prompt: "Кое устройство е предназначено за флашпамет?", choices: ["DVD устройство", "Четец на карти", "USB устройство", "Флопидисково устройство"], answer: "USB устройство", lesson: "USB устройството осигурява връзка с флашпаметта." },
  { id: "match-card", category: "Бърз тест", prompt: "Кое устройство използваме за флашкарти?", choices: ["Четец на карти", "CD устройство", "DVD устройство", "Флопидисково устройство"], answer: "Четец на карти", lesson: "Четецът на карти може да бъде вътрешен или външен." },
  { id: "match-floppy", category: "Бърз тест", prompt: "Кое физическо име е за работа с дискети?", choices: ["USB устройство", "DVD устройство", "Флопидисково устройство", "Четец на карти"], answer: "Флопидисково устройство", lesson: "Днес флопидисковото устройство рядко се среща в новите компютри." },
];

export function createQuiz(count = 10) {
  return [...questionBank].sort(() => Math.random() - 0.5).slice(0, count).map((question) => ({
    ...question,
    choices: [...question.choices].sort(() => Math.random() - 0.5),
  }));
}