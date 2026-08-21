import { createCharacter, groups, newId, skills, type Character, type Scores } from "./domain";

export const STORAGE_KEY = "vtm20-characters";
export const BACKUP_FORMAT = "vtm20-character-list";
const BACKUP_VERSION = 1;

type UnknownRecord = Record<string, unknown>;

export interface LoadResult {
  characters: Character[];
  error: string | null;
}

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const text = (value: unknown, fallback: string): string =>
  typeof value === "string" ? value : fallback;

const score = (value: unknown, fallback: number, min: number, max: number): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
};

const normalizeScores = (
  value: unknown,
  collection: Record<string, readonly string[]>,
  fallback: number,
  min: number,
  max: number,
): Scores => {
  const source = isRecord(value) ? value : {};
  return Object.fromEntries(
    Object.values(collection)
      .flat()
      .map((label) => [label, score(source[label], fallback, min, max)]),
  );
};

const isCharacterCandidate = (value: unknown): value is UnknownRecord =>
  isRecord(value) &&
  ["id", "name", "attributes", "abilities", "clan", "notes"].some((key) => key in value);

export const normalizeCharacter = (value: UnknownRecord): Character => {
  const defaults = createCharacter();
  return {
    ...defaults,
    id: text(value.id, defaults.id) || defaults.id,
    name: text(value.name, defaults.name),
    clan: text(value.clan, defaults.clan),
    concept: text(value.concept, defaults.concept),
    player: text(value.player, defaults.player),
    chronicle: text(value.chronicle, defaults.chronicle),
    nature: text(value.nature, defaults.nature),
    demeanor: text(value.demeanor, defaults.demeanor),
    generation: text(value.generation, defaults.generation),
    sire: text(value.sire, defaults.sire),
    attributes: normalizeScores(value.attributes, groups, 1, 1, 5),
    abilities: normalizeScores(value.abilities, skills, 0, 0, 5),
    disciplines: text(value.disciplines, defaults.disciplines),
    backgrounds: text(value.backgrounds, defaults.backgrounds),
    merits: text(value.merits, defaults.merits),
    flaws: text(value.flaws, defaults.flaws),
    notes: text(value.notes, defaults.notes),
    humanity: score(value.humanity, defaults.humanity, 0, 10),
    willpower: score(value.willpower, defaults.willpower, 0, 10),
    blood: score(value.blood, defaults.blood, 0, 20),
    health: score(value.health, defaults.health, 0, 7),
  };
};

export const ensureUniqueIds = (characters: Character[]): Character[] => {
  const ids = new Set<string>();
  return characters.map((character) => {
    let id = character.id;
    while (ids.has(id)) id = newId();
    ids.add(id);
    return id === character.id ? character : { ...character, id };
  });
};

export const parseCharacters = (value: unknown): Character[] => {
  const list = Array.isArray(value)
    ? value
    : isRecord(value) && Array.isArray(value.characters)
      ? value.characters
      : [];

  return ensureUniqueIds(list.filter(isCharacterCandidate).map(normalizeCharacter));
};

export const loadCharacters = (): LoadResult => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return { characters: [], error: null };
    return { characters: parseCharacters(JSON.parse(raw)), error: null };
  } catch {
    return {
      characters: [],
      error:
        "Не удалось прочитать сохранённые данные. Импортируйте резервную копию, если она есть.",
    };
  }
};

export const saveCharacters = (characters: Character[]): string | null => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: BACKUP_VERSION, characters }));
    return null;
  } catch {
    return "Не удалось сохранить изменения: хранилище браузера недоступно или заполнено.";
  }
};

export const createBackup = (characters: Character[]): string =>
  JSON.stringify({ format: BACKUP_FORMAT, version: BACKUP_VERSION, characters }, null, 2);

export const parseBackup = (raw: string): LoadResult => {
  try {
    const document: unknown = JSON.parse(raw);
    if (
      !Array.isArray(document) &&
      (!isRecord(document) ||
        document.format !== BACKUP_FORMAT ||
        !Array.isArray(document.characters))
    ) {
      return { characters: [], error: "Это не резервная копия списка персонажей." };
    }

    const characters = parseCharacters(document);
    return characters.length > 0
      ? { characters, error: null }
      : { characters: [], error: "В резервной копии нет корректных персонажей." };
  } catch {
    return { characters: [], error: "Не удалось прочитать JSON-файл резервной копии." };
  }
};
