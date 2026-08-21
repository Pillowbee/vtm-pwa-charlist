import { afterEach, expect, test, vi } from "vitest";
import { addCharacter, createCharacter, removeCharacter, updateCharacter } from "./domain";
import {
  createBackup,
  loadCharacters,
  parseBackup,
  parseCharacters,
  saveCharacters,
} from "./storage";

test("мигрирует старый массив и восстанавливает отсутствующие поля", () => {
  const [character] = parseCharacters([
    {
      id: "legacy-id",
      name: "Виктория",
      attributes: { Strength: 99, Dexterity: Number.NaN },
      abilities: { Academics: 3.2 },
      humanity: -3,
      blood: 999,
    },
  ]);

  expect(character.id).toBe("legacy-id");
  expect(character.name).toBe("Виктория");
  expect(character.attributes.Strength).toBe(5);
  expect(character.attributes.Dexterity).toBe(1);
  expect(character.attributes.Wits).toBe(1);
  expect(character.abilities.Academics).toBe(3);
  expect(character.abilities.Awareness).toBe(0);
  expect(character.humanity).toBe(0);
  expect(character.blood).toBe(20);
  expect(character.notes).toBe("");
});

test("устраняет повторяющиеся идентификаторы", () => {
  const characters = parseCharacters([
    { id: "same", name: "Первый" },
    { id: "same", name: "Второй" },
  ]);

  expect(characters).toHaveLength(2);
  expect(characters[0].id).not.toBe(characters[1].id);
});

test("создаёт и читает резервную копию", () => {
  const source = parseCharacters([{ id: "backup-id", name: "Роза", clan: "Тореадоры" }]);
  const backup = createBackup(source);
  const result = parseBackup(backup);

  expect(result.error).toBeNull();
  expect(result.characters[0].name).toBe("Роза");
  expect(result.characters[0].clan).toBe("Тореадоры");
});

test("отклоняет посторонний JSON", () => {
  const result = parseBackup('{"characters":[]}');

  expect(result.characters).toHaveLength(0);
  expect(result.error).toMatch(/не резервная копия/i);
});

test("создаёт, изменяет и удаляет персонажа", () => {
  const created = createCharacter();
  const afterCreate = addCharacter([], created);
  const afterUpdate = updateCharacter(afterCreate, created.id, { name: "Мария" });
  const afterDelete = removeCharacter(afterUpdate, created.id);

  expect(afterCreate).toHaveLength(1);
  expect(afterUpdate[0].name).toBe("Мария");
  expect(afterDelete).toEqual([]);
});

test("сохраняет и загружает данные в новом формате", () => {
  const values = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  });
  const characters = parseCharacters([{ id: "saved-id", name: "Сохранённый" }]);

  expect(saveCharacters(characters)).toBeNull();
  expect(loadCharacters()).toMatchObject({ error: null, characters: [{ name: "Сохранённый" }] });
});

afterEach(() => vi.unstubAllGlobals());
