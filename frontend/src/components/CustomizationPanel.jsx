import {
  colorOptions,
  fontOptions,
  spacingOptions,
  titleScaleOptions,
} from "../utils/resumeDefaults";
import { cn } from "../utils/cn";
import Field from "./Field";

const colorLabels = {
  "#0f766e": "Verde Esmeralda",
  "#0f172a": "Grafite Profundo",
  "#2563eb": "Azul Royal",
  "#be185d": "Framboesa Intenso",
  "#7c3aed": "Violeta Intenso",
  "#ea580c": "Terracota",
};

export default function CustomizationPanel({ customization, onChange, compact = false }) {
  return (
    <div className={cn(compact ? "space-y-3" : "space-y-4")}>
      <fieldset className={cn("rounded-[22px] border border-slate-200/80 bg-white/70", compact ? "p-3" : "p-3.5")}>
        <div className="flex items-center justify-between">
          <legend className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">Cor principal</legend>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-800">
            {colorLabels[customization.primaryColor] ?? customization.primaryColor.replace("#", "")}
          </span>
        </div>
        <div className={cn("mt-3 grid grid-cols-6", compact ? "gap-1.5" : "gap-2")}>
          {colorOptions.map((color) => (
            <button
              aria-label={`Cor ${colorLabels[color] ?? color}`}
              aria-pressed={customization.primaryColor === color}
              key={color}
              className={cn(
                "rounded-full border-[3px] shadow-[0_10px_22px_rgba(15,23,42,0.08)] transition",
                compact ? "h-7 w-7" : "h-8 w-8",
                customization.primaryColor === color ? "scale-105 border-slate-900" : "border-white",
              )}
              onClick={() => onChange("primaryColor", color)}
              style={{ backgroundColor: color }}
              title={`Cor ${colorLabels[color] ?? color}`}
              type="button"
            />
          ))}
        </div>
      </fieldset>

      <fieldset className={cn("rounded-[22px] border border-slate-200/80 bg-white/70", compact ? "p-3" : "p-3.5")}>
        <legend className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">Fonte e espacamento</legend>
        <div className={cn("mt-3 grid sm:grid-cols-2", compact ? "gap-2.5" : "gap-3")}>
          <Field
            as="select"
            className={cn(compact ? "rounded-lg px-3 py-2 text-[13px]" : "rounded-xl px-3 py-2.5 text-sm")}
            helperText="Escolha a familia tipografica base do curriculo."
            label="Fonte"
            name="font-family"
            onChange={(event) => onChange("fontFamily", event.target.value)}
            value={customization.fontFamily}
          >
            {fontOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </Field>

          <Field
            as="select"
            className="rounded-xl px-3 py-2.5 text-sm"
            helperText="Ajuste a densidade visual do layout."
            label="Espacamento"
            name="spacing"
            onChange={(event) => onChange("spacing", event.target.value)}
            value={customization.spacing}
          >
            {spacingOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </Field>
        </div>
      </fieldset>

      <fieldset className={cn("rounded-[22px] border border-slate-200/80 bg-white/70", compact ? "p-3" : "p-3.5")}>
        <legend className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">Escala do titulo</legend>
        <div className={cn("mt-3 grid grid-cols-3", compact ? "gap-1.5" : "gap-2")}>
          {titleScaleOptions.map((option) => {
            const isActive = option.id === customization.titleScale;

            return (
              <button
                aria-label={`Selecionar escala de titulo ${option.name}`}
                aria-pressed={isActive}
                key={option.id}
                className={cn(
                  "rounded-xl border font-semibold transition",
                  compact ? "px-2.5 py-1.5 text-[11px]" : "px-3 py-2 text-xs",
                  isActive
                    ? "border-ink bg-ink text-white shadow-[0_14px_30px_rgba(15,23,42,0.16)]"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:text-ink",
                )}
                onClick={() => onChange("titleScale", option.id)}
                type="button"
              >
                {option.name}
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
