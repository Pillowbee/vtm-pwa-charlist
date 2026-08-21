import { createRoot } from "react-dom/client";
import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import { Field, Score, Section, Select, Text } from "./components";
import {
  archetypes,
  addCharacter,
  clans,
  createCharacter,
  groups,
  removeCharacter,
  ru,
  skills,
  type Character,
  type ScoreType,
  updateCharacter,
} from "./domain";
import {
  createBackup,
  ensureUniqueIds,
  loadCharacters,
  parseBackup,
  saveCharacters,
} from "./storage";
import "./style.css";

function App() {
  const [initial] = useState(loadCharacters);
  const [characters, setCharacters] = useState<Character[]>(initial.characters);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(initial.error);
  const importInput = useRef<HTMLInputElement>(null);
  const charactersRef = useRef(characters);
  const pendingSave = useRef(false);
  const selected = characters.find((character) => character.id === selectedId);
  charactersRef.current = characters;

  const savePendingChanges = useCallback(() => {
    if (!pendingSave.current) return;

    const error = saveCharacters(charactersRef.current);
    if (error) setNotice(error);
    else pendingSave.current = false;
  }, []);

  useEffect(() => {
    if (!pendingSave.current) return;

    const timeout = window.setTimeout(savePendingChanges, 300);
    return () => window.clearTimeout(timeout);
  }, [characters, savePendingChanges]);

  useEffect(() => {
    window.addEventListener("pagehide", savePendingChanges);
    return () => window.removeEventListener("pagehide", savePendingChanges);
  }, [savePendingChanges]);

  const changeCharacters = (change: (all: Character[]) => Character[]) => {
    pendingSave.current = true;
    setCharacters(change);
  };

  const update = (change: Partial<Character>) => {
    changeCharacters((all) => updateCharacter(all, selectedId, change));
  };

  const create = () => {
    const character = createCharacter();
    changeCharacters((all) => addCharacter(all, character));
    setSelectedId(character.id);
  };

  const exportCharacters = () => {
    const blob = new Blob([createBackup(characters)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "vtm20-персонажи.json";
    link.click();
    URL.revokeObjectURL(url);
    setNotice("Резервная копия скачана.");
  };

  const importCharacters = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const result = parseBackup(await file.text());
    if (result.error) {
      setNotice(result.error);
      return;
    }

    changeCharacters((all) => ensureUniqueIds([...result.characters, ...all]));
    setNotice(`Импортировано персонажей: ${result.characters.length}.`);
  };

  if (!selected) {
    return (
      <main className="app">
        <header>
          <div>
            <p className="eyebrow">Вампир: Маскарад</p>
            <h1>Персонажи</h1>
          </div>
          <div className="actions">
            <input
              ref={importInput}
              className="visually-hidden"
              type="file"
              accept="application/json,.json"
              onChange={importCharacters}
              aria-label="Импортировать резервную копию"
            />
            <button
              type="button"
              className="secondary"
              onClick={exportCharacters}
              disabled={!characters.length}
            >
              Экспорт
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => importInput.current?.click()}
            >
              Импорт
            </button>
            {characters.length > 0 && (
              <button type="button" className="primary" onClick={create}>
                + Новый
              </button>
            )}
          </div>
        </header>
        {notice && (
          <p className="notice" role="status" aria-live="polite">
            {notice}
          </p>
        )}
        <p className="intro">Персонажи хранятся на этом устройстве. Регулярно делайте экспорт.</p>
        <section className="cards" aria-label="Список персонажей">
          {characters.map((character) => (
            <button
              type="button"
              className="card"
              key={character.id}
              onClick={() => setSelectedId(character.id)}
            >
              <strong>{character.name || "Безымянный вампир"}</strong>
              <span>
                {character.clan || "Клан неизвестен"} · {character.concept || "Без концепции"}
              </span>
            </button>
          ))}
          {!characters.length && (
            <div className="empty">
              <span aria-hidden="true">☾</span>
              <h2>Персонажей пока нет</h2>
              <p>Создайте вампира, чтобы начать хронику.</p>
              <button type="button" className="primary" onClick={create}>
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
        <button type="button" className="back" onClick={() => setSelectedId(null)}>
          ← Список
        </button>
        <button
          type="button"
          className="delete"
          onClick={() => {
            if (window.confirm(`Удалить «${selected.name || "этого персонажа"}»?`)) {
              changeCharacters((all) => removeCharacter(all, selectedId));
              setSelectedId(null);
            }
          }}
        >
          Удалить
        </button>
      </header>
      <section className="identity" aria-label="Основные сведения">
        <label className="visually-hidden" htmlFor="character-name">
          Имя персонажа
        </label>
        <input
          id="character-name"
          className="name"
          value={selected.name}
          onChange={(event) => update({ name: event.target.value })}
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
        <Text
          label="Заметки персонажа"
          value={selected.notes}
          onChange={(notes) => update({ notes })}
          placeholder="История, снаряжение, союзники, заметки о кормлении…"
        />
      </Section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
