import { useState } from "react";
import { templateOptions } from "../utils/resumeDefaults";
import { cn } from "../utils/cn";

function buildTemplateAltText(template) {
  return `Preview do template ${template.name}`;
}

function TemplatePreview({ isActive, template, mode }) {
  const [imageFailed, setImageFailed] = useState(false);
  const isGrid = mode === "grid";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[16px] border",
        isActive ? "border-white/18 bg-white/10" : "border-slate-200 bg-slate-50",
      )}
    >
      {imageFailed ? (
        <div
          aria-hidden="true"
          className={cn(
            "bg-gradient-to-br p-4",
            isGrid ? "min-h-[240px]" : "min-h-[184px]",
            isActive ? "from-white/12 via-white/8 to-transparent" : "from-slate-100 via-white to-slate-50",
          )}
        >
          <div className={cn("rounded-[14px] border p-3", isActive ? "border-white/20 bg-white/10" : "border-white/40 bg-white/90")}>
            <div className={cn("h-2.5 w-16 rounded-full", isActive ? "bg-white/90" : "bg-slate-900")} />
            <div className={cn("mt-2 h-1.5 w-24 rounded-full", isActive ? "bg-white/50" : "bg-slate-400")} />
            <div className="mt-3 grid gap-1.5">
              <div className={cn("h-1.5 rounded-full", isActive ? "bg-white/30" : "bg-slate-200")} />
              <div className={cn("h-1.5 w-11/12 rounded-full", isActive ? "bg-white/30" : "bg-slate-200")} />
              <div className={cn("h-16 rounded-[14px]", isActive ? "bg-white/10" : "bg-slate-100")} />
            </div>
          </div>
        </div>
      ) : (
        <div className="relative bg-white">
          <img
            alt={buildTemplateAltText(template)}
            className={cn(
              "block w-full object-cover object-top transition duration-300 group-hover:scale-[1.02]",
              isGrid ? "h-[240px]" : "h-[184px]",
            )}
            loading="lazy"
            onError={() => setImageFailed(true)}
            src={`/templates/${template.id}.png`}
          />
          <div aria-hidden="true" className={cn("pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t", isActive ? "from-ink/55 to-transparent" : "from-white/70 to-transparent")} />
        </div>
      )}
    </div>
  );
}

export default function TemplatePicker({ value, onChange, mode = "list" }) {
  const isGrid = mode === "grid";

  return (
    <div className={cn("grid", isGrid ? "gap-4 md:grid-cols-2 2xl:grid-cols-3" : "gap-2")}>
      {templateOptions.map((template) => {
        const isActive = template.id === value;
        const labelId = `${template.id}-template-label`;
        const descriptionId = `${template.id}-template-description`;

        return (
          <button
            aria-describedby={descriptionId}
            aria-labelledby={labelId}
            aria-pressed={isActive}
            key={template.id}
            className={cn(
              "group relative isolate flex h-full flex-col overflow-hidden text-left transition duration-300",
              isGrid ? "rounded-[24px] border p-4" : "rounded-[20px] border p-3",
              isActive
                ? "border-ink bg-[linear-gradient(160deg,#0f172a_0%,#1f2937_55%,#0f766e_100%)] text-white shadow-[0_24px_60px_rgba(15,23,42,0.24)]"
                : "border-slate-200 bg-white hover:-translate-y-1 hover:border-slate-400 hover:shadow-[0_22px_48px_rgba(15,23,42,0.12)]",
            )}
            onClick={() => onChange(template.id)}
            type="button"
          >
            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute inset-x-5 top-0 h-0.5 origin-center rounded-full transition duration-300",
                isActive ? "bg-white/90" : "scale-x-0 bg-brand-400 group-hover:scale-x-100",
              )}
            />
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold" id={labelId}>
                  {template.name}
                </p>
                <p
                  className={cn("mt-1 text-xs leading-5", isActive ? "text-white/90" : "text-slate-700")}
                  id={descriptionId}
                >
                  {template.description}
                </p>
              </div>
              <span
                aria-hidden="true"
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] transition duration-300",
                  isActive
                    ? "bg-white/18 text-white"
                    : "bg-slate-100 text-slate-700 group-hover:bg-brand-50 group-hover:text-brand-700",
                )}
              >
                {isActive ? "Selecionado" : "Selecionar"}
              </span>
            </div>
            <div className={cn("transition duration-300 group-hover:-translate-y-0.5", isGrid ? "mt-5" : "mt-4")}>
              <TemplatePreview isActive={isActive} mode={mode} template={template} />
            </div>
            <div
              aria-hidden="true"
              className={cn(
                "mt-4 flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.16em]",
                isActive ? "text-white/78" : "text-slate-500 group-hover:text-slate-700",
              )}
            >
              <span>{isActive ? "Pronto para o editor" : "Hover para comparar"}</span>
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 transition duration-300",
                  isActive ? "bg-white/14 text-white" : "bg-slate-100 group-hover:bg-slate-200",
                )}
              >
                {isActive ? "Ativo agora" : "Preview real"}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
