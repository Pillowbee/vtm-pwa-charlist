export const clans = [
  "Ассамиты",
  "Бруха",
  "Вентру",
  "Гангрелы",
  "Джованни",
  "Каитиффы",
  "Ласомбра",
  "Малкавиане",
  "Носферату",
  "Последователи Сета",
  "Равнос",
  "Тореадоры",
  "Тремеры",
  "Тцимисхи",
] as const;

export const archetypes = [
  "Авантюрист",
  "Анархист",
  "Архитектор",
  "Бонвиван",
  "Бравёр",
  "Выживальщик",
  "Гедонист",
  "Директор",
  "Защитник",
  "Идеалист",
  "Искатель острых ощущений",
  "Критик",
  "Мазохист",
  "Мученик",
  "Одиночка",
  "Опекун",
  "Оптимист",
  "Перфекционист",
  "Победитель",
  "Подхалим",
  "Проказник",
  "Ребёнок",
  "Рыцарь",
  "Судья",
  "Традиционалист",
  "Фанатик",
] as const;

export const groups = {
  Physical: ["Strength", "Dexterity", "Stamina"],
  Social: ["Charisma", "Manipulation", "Appearance"],
  Mental: ["Perception", "Intelligence", "Wits"],
} as const;

export const skills = {
  Talents: [
    "Alertness",
    "Athletics",
    "Awareness",
    "Brawl",
    "Empathy",
    "Expression",
    "Intimidation",
    "Leadership",
    "Streetwise",
    "Subterfuge",
  ],
  Skills: [
    "Animal Ken",
    "Crafts",
    "Drive",
    "Etiquette",
    "Firearms",
    "Larceny",
    "Melee",
    "Performance",
    "Stealth",
    "Survival",
  ],
  Knowledges: [
    "Academics",
    "Computer",
    "Finance",
    "Investigation",
    "Law",
    "Medicine",
    "Occult",
    "Politics",
    "Science",
    "Technology",
  ],
} as const;

export const ru: Record<string, string> = {
  Physical: "Физические",
  Social: "Социальные",
  Mental: "Ментальные",
  Talents: "Таланты",
  Skills: "Навыки",
  Knowledges: "Знания",
  Strength: "Сила",
  Dexterity: "Ловкость",
  Stamina: "Выносливость",
  Charisma: "Харизма",
  Manipulation: "Манипулирование",
  Appearance: "Внешность",
  Perception: "Восприятие",
  Intelligence: "Интеллект",
  Wits: "Смекалка",
  Alertness: "Бдительность",
  Athletics: "Атлетика",
  Awareness: "Осведомлённость",
  Brawl: "Драка",
  Empathy: "Эмпатия",
  Expression: "Экспрессия",
  Intimidation: "Запугивание",
  Leadership: "Лидерство",
  Streetwise: "Знание улиц",
  Subterfuge: "Хитрость",
  "Animal Ken": "Знание животных",
  Crafts: "Ремесло",
  Drive: "Вождение",
  Etiquette: "Этикет",
  Firearms: "Стрельба",
  Larceny: "Воровство",
  Melee: "Фехтование",
  Performance: "Исполнительство",
  Stealth: "Скрытность",
  Survival: "Выживание",
  Academics: "Академические знания",
  Computer: "Компьютер",
  Finance: "Финансы",
  Investigation: "Расследование",
  Law: "Право",
  Medicine: "Медицина",
  Occult: "Оккультизм",
  Politics: "Политика",
  Science: "Наука",
  Technology: "Технология",
};

export type Scores = Record<string, number>;
export type ScoreType = "attributes" | "abilities";

export interface Character {
  id: string;
  name: string;
  clan: string;
  concept: string;
  player: string;
  chronicle: string;
  nature: string;
  demeanor: string;
  generation: string;
  sire: string;
  attributes: Scores;
  abilities: Scores;
  disciplines: string;
  backgrounds: string;
  merits: string;
  flaws: string;
  notes: string;
  humanity: number;
  willpower: number;
  blood: number;
  health: number;
}

const emptyScores = (source: Record<string, readonly string[]>, value: number): Scores =>
  Object.fromEntries(
    Object.values(source)
      .flat()
      .map((name) => [name, value]),
  );

export const newId = (): string =>
  crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const createCharacter = (): Character => ({
  id: newId(),
  name: "Безымянный вампир",
  clan: "",
  concept: "",
  player: "",
  chronicle: "",
  nature: "",
  demeanor: "",
  generation: "",
  sire: "",
  attributes: emptyScores(groups, 1),
  abilities: emptyScores(skills, 0),
  disciplines: "",
  backgrounds: "",
  merits: "",
  flaws: "",
  notes: "",
  humanity: 7,
  willpower: 5,
  blood: 0,
  health: 7,
});

export const addCharacter = (characters: Character[], character: Character): Character[] => [
  character,
  ...characters,
];

export const updateCharacter = (
  characters: Character[],
  id: string | null,
  change: Partial<Character>,
): Character[] =>
  characters.map((character) => (character.id === id ? { ...character, ...change } : character));

export const removeCharacter = (characters: Character[], id: string | null): Character[] =>
  characters.filter((character) => character.id !== id);
