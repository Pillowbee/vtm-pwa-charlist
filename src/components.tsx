import type { ReactNode } from "react";

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

export function Score({ label, value, min = 0, max = 5, onChange }: ScoreProps) {
  const safeValue = Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min;

  return (
    <div className="score">
      <span>{label}</span>
      <div>
        <button
          type="button"
          onClick={() => onChange(Math.max(min, safeValue - 1))}
          aria-label={`Уменьшить: ${label}`}
          disabled={safeValue <= min}
        >
          −
        </button>
        <output aria-label={`${label}: ${safeValue}`}>{safeValue}</output>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, safeValue + 1))}
          aria-label={`Увеличить: ${label}`}
          disabled={safeValue >= max}
        >
          +
        </button>
      </div>
    </div>
  );
}

export function Field({ label, value, onChange }: FieldProps) {
  return (
    <label>
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

export function Select({ label, value, onChange, options, placeholder }: SelectProps) {
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

export function Text({ label, value, onChange, placeholder }: TextProps) {
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

export function Section({ title, children }: SectionProps) {
  return (
    <section className="section" aria-labelledby={`section-${title}`}>
      <h2 id={`section-${title}`}>{title}</h2>
      {children}
    </section>
  );
}
