import { createRoot } from "react-dom/client";
import { useEffect, useState, type ReactNode } from "react";
import "./style.css";

const KEY = "vtm20-characters";

const clans = [
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

const archetypes = [
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

const groups = {
  Physical: ["Strength", "Dexterity", "Stamina"],
  Social: ["Charisma", "Manipulation", "Appearance"],
  Mental: ["Perception", "Intelligence", "Wits"],
} as const;

const skills = {
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

const ru: Record<string, string> = {
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

type Scores = Record<string, number>;
type ScoreCollection = Record<string, readonly string[]>;
type ScoreType = "attributes" | "abilities";

interface Character {
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

interface ScoreProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

interface TextProps extends FieldProps {
  placeholder?: string;
}

interface SelectProps extends FieldProps {
  options: readonly string[];
  placeholder: string;
}

interface SectionProps {
  title: string;
  children: ReactNode;
}

const emptyScores = (source: ScoreCollection, value: number): Scores =>
  Object.fromEntries(
    Object.values(source)
      .flat()
      .map((name) => [name, value]),
  );

const newId = (): string =>
  crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const fresh = (): Character => ({
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

const load = (): Character[] => {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(stored) ? (stored as Character[]) : [];
  } catch {
    return [];
  }
};

function Score({ label, value, min = 0, max = 5, onChange }: ScoreProps) {
  return (
    <div className="score">
      <span>{label}</span>
      <div>
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          aria-label={`Уменьшить: ${label}`}
          disabled={value <= min}
        >
          −
        </button>
        <b>{value}</b>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          aria-label={`Увеличить: ${label}`}
          disabled={value >= max}
        >
          +
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: FieldProps) {
  return (
    <label>
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Select({ label, value, onChange, options, placeholder }: SelectProps) {
  const hasCustomValue = value !== "" && !options.includes(value);

  return (
    <label>
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">{placeholder}</option>
        {hasCustomValue && <option value={value}>{value}</option>}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Text({ label, value, onChange, placeholder }: TextProps) {
  return (
    <label className="wide">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function Section({ title, children }: SectionProps) {
  return (
    <section className="section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function App() {
  const [characters, setCharacters] = useState<Character[]>(load);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = characters.find((character) => character.id === selectedId);

  useEffect(() => localStorage.setItem(KEY, JSON.stringify(characters)), [characters]);

  const update = (change: Partial<Character>) => {
    setCharacters((all) =>
      all.map((character) =>
        character.id === selectedId ? { ...character, ...change } : character,
      ),
    );
  };

  const create = () => {
    const character = fresh();
    setCharacters((all) => [character, ...all]);
    setSelectedId(character.id);
  };

  if (!selected) {
    return (
      <main className="app">
        <header>
          <div>
            <p className="eyebrow">Вампир: Маскарад</p>
          </div>
          {characters.length > 0 && (
            <button className="primary" onClick={create}>
              + Новый
            </button>
          )}
        </header>
        <p className="intro">Персонажи хранятся только на этом устройстве.</p>
        <section className="cards">
          {characters.map((character) => (
            <button className="card" key={character.id} onClick={() => setSelectedId(character.id)}>
              <strong>{character.name}</strong>
              <span>
                {character.clan || "Клан неизвестен"} · {character.concept || "Без концепции"}
              </span>
            </button>
          ))}
          {!characters.length && (
            <div className="empty">
              <span>☾</span>
              <h2>Персонажей пока нет</h2>
              <p>Создайте вампира, чтобы начать хронику.</p>
              <button className="primary" onClick={create}>
                Создать персонажа
              </button>
            </div>
          )}
        </section>
      </main>
    );
  }

  const setScore = (type: ScoreType, label: string, value: number) =>
    update({ [type]: { ...selected[type], [label]: value } });

  return (
    <main className="app editor">
      <header>
        <button className="back" onClick={() => setSelectedId(null)}>
          ← Список
        </button>
        <button
          className="delete"
          onClick={() => {
            if (confirm(`Удалить «${selected.name}»?`)) {
              setCharacters((all) => all.filter((character) => character.id !== selectedId));
              setSelectedId(null);
            }
          }}
        >
          Удалить
        </button>
      </header>
      <section className="identity">
        <input
          className="name"
          value={selected.name}
          onChange={(event) => update({ name: event.target.value })}
          aria-label="Имя персонажа"
        />
        <div className="fields">
          <Select
            label="Клан"
            value={selected.clan}
            onChange={(clan) => update({ clan })}
            options={clans}
            placeholder="Выберите клан"
          />
          <Field
            label="Концепция"
            value={selected.concept}
            onChange={(concept) => update({ concept })}
          />
          <Field label="Игрок" value={selected.player} onChange={(player) => update({ player })} />
          <Field
            label="Хроника"
            value={selected.chronicle}
            onChange={(chronicle) => update({ chronicle })}
          />
          <Select
            label="Натура"
            value={selected.nature}
            onChange={(nature) => update({ nature })}
            options={archetypes}
            placeholder="Выберите натуру"
          />
          <Select
            label="Маска"
            value={selected.demeanor}
            onChange={(demeanor) => update({ demeanor })}
            options={archetypes}
            placeholder="Выберите маску"
          />
          <Field
            label="Поколение"
            value={selected.generation}
            onChange={(generation) => update({ generation })}
          />
          <Field label="Сир" value={selected.sire} onChange={(sire) => update({ sire })} />
        </div>
      </section>
      <Section title="Атрибуты">
        <div className="three-columns">
          {Object.entries(groups).map(([group, labels]) => (
            <div key={group}>
              <h3>{ru[group]}</h3>
              {labels.map((label) => (
                <Score
                  key={label}
                  label={ru[label]}
                  value={selected.attributes[label]}
                  min={1}
                  onChange={(value) => setScore("attributes", label, value)}
                />
              ))}
            </div>
          ))}
        </div>
      </Section>
      <Section title="Способности">
        <div className="three-columns">
          {Object.entries(skills).map(([group, labels]) => (
            <div key={group}>
              <h3>{ru[group]}</h3>
              {labels.map((label) => (
                <Score
                  key={label}
                  label={ru[label]}
                  value={selected.abilities[label]}
                  onChange={(value) => setScore("abilities", label, value)}
                />
              ))}
            </div>
          ))}
        </div>
      </Section>
      <Section title="Преимущества">
        <div className="fields">
          <Text
            label="Дисциплины"
            value={selected.disciplines}
            onChange={(disciplines) => update({ disciplines })}
            placeholder="Например: Прорицание 2, Стремительность 1"
          />
          <Text
            label="Дополнения"
            value={selected.backgrounds}
            onChange={(backgrounds) => update({ backgrounds })}
            placeholder="Например: Ресурсы 3"
          />
          <Text
            label="Достоинства"
            value={selected.merits}
            onChange={(merits) => update({ merits })}
          />
          <Text label="Недостатки" value={selected.flaws} onChange={(flaws) => update({ flaws })} />
        </div>
      </Section>
      <Section title="Шкалы">
        <div className="tracks">
          <Score
            label="Человечность"
            value={selected.humanity}
            max={10}
            onChange={(humanity) => update({ humanity })}
          />
          <Score
            label="Сила воли"
            value={selected.willpower}
            max={10}
            onChange={(willpower) => update({ willpower })}
          />
          <Score
            label="Запас крови"
            value={selected.blood}
            max={20}
            onChange={(blood) => update({ blood })}
          />
          <Score
            label="Здоровье"
            value={selected.health}
            max={7}
            onChange={(health) => update({ health })}
          />
        </div>
      </Section>
      <Section title="Заметки">
        <textarea
          value={selected.notes}
          onChange={(event) => update({ notes: event.target.value })}
          placeholder="История, снаряжение, союзники, заметки о кормлении…"
        />
      </Section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);

if ("serviceWorker" in navigator) {
  addEventListener("load", () => {
    if (import.meta.env.PROD) navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`);
    else
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      });
  });
}
