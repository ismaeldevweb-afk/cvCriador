import { useEffect, useRef, useState } from "react";
import { templateOptions } from "../utils/resumeDefaults";
import { cn } from "../utils/cn";
import { getTemplateShowcaseTheme } from "../utils/templateShowcase";

function buildTemplateAltText(template) {
  return `Preview do template ${template.name}`;
}

function TemplatePreview({ isActive, template, mode, theme }) {
  const [imageFailed, setImageFailed] = useState(false);
  const isGrid = mode === "grid";
  const isCarousel = mode === "carousel";
  const isShowcase = isGrid || isCarousel;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[20px] border sm:rounded-[16px]",
        isActive ? "border-white/18 bg-white/10" : "border-slate-200 bg-slate-50",
      )}
    >
      {imageFailed ? (
        <div
          aria-hidden="true"
          className={cn(
            "relative overflow-hidden bg-gradient-to-br p-4",
            isShowcase ? "min-h-[180px] sm:min-h-[240px]" : "min-h-[184px]",
            isActive ? "from-white/12 via-white/8 to-transparent" : "from-slate-100 via-white to-slate-50",
          )}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-[-1.5rem] top-[-1rem] h-24 w-24 rounded-full blur-3xl"
            style={{ background: theme.glow, opacity: isActive ? 0.95 : 0.55 }}
          />
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
        <div className="relative overflow-hidden bg-white">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-8 top-2 h-20 rounded-full blur-3xl"
            style={{ background: theme.glow, opacity: isActive ? 0.95 : 0.45 }}
          />
          <img
            alt={buildTemplateAltText(template)}
            className={cn(
              "block w-full object-cover object-top transition duration-300 group-hover:scale-[1.02]",
              isShowcase ? "h-[180px] sm:h-[240px]" : "h-[184px]",
            )}
            loading="lazy"
            onError={() => setImageFailed(true)}
            src={`/templates/${template.id}.png`}
          />
          <div className="absolute left-3 top-3 flex items-center gap-2">
            <span
              className={cn(
                "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] backdrop-blur",
                isActive ? "border-white/16 bg-black/20 text-white" : "border-white/80 bg-white/88 text-slate-700",
              )}
              style={!isActive ? { color: theme.accent } : undefined}
            >
              {theme.label}
            </span>
          </div>
          <div aria-hidden="true" className={cn("pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t", isActive ? "from-ink/55 to-transparent" : "from-white/70 to-transparent")} />
        </div>
      )}
    </div>
  );
}

export default function TemplatePicker({ value, onChange, mode = "list" }) {
  const isGrid = mode === "grid";
  const isCarousel = mode === "carousel";
  const cardRefs = useRef(new Map());
  const selectedTemplate = templateOptions.find((template) => template.id === value) ?? templateOptions[0];
  const activeIndex = Math.max(
    0,
    templateOptions.findIndex((template) => template.id === value),
  );
  const selectedTheme = getTemplateShowcaseTheme(selectedTemplate?.id);

  useEffect(() => {
    if (!isCarousel) {
      return;
    }

    const activeNode = cardRefs.current.get(value);
    activeNode?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [isCarousel, value]);

  function selectRelative(offset) {
    const nextIndex = (activeIndex + offset + templateOptions.length) % templateOptions.length;
    onChange(templateOptions[nextIndex].id);
  }

  function handleKeyDown(event) {
    if (!isCarousel) {
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      selectRelative(1);
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      selectRelative(-1);
    }
  }

  const cardClassName = cn(
    "group relative isolate flex h-full flex-col overflow-hidden text-left transition duration-300",
    isCarousel
      ? "w-[72vw] max-w-[272px] shrink-0 snap-center rounded-[30px] border p-3.5 sm:w-[340px] sm:max-w-none sm:rounded-[26px] sm:p-5"
      : isGrid
        ? "rounded-[24px] border p-4"
        : "rounded-[20px] border p-3",
  );

  const cards = templateOptions.map((template) => {
    const isActive = template.id === value;
    const labelId = `${template.id}-template-label`;
    const descriptionId = `${template.id}-template-description`;
    const templateTheme = getTemplateShowcaseTheme(template.id);

    return (
      <button
        aria-describedby={descriptionId}
        aria-labelledby={labelId}
        aria-pressed={isActive}
        aria-selected={isCarousel ? isActive : undefined}
        key={template.id}
        className={cn(
          cardClassName,
          isCarousel && (isActive ? "sm:-translate-y-1.5 sm:scale-[1.01]" : "sm:scale-[0.985] sm:opacity-[0.94]"),
          isActive
            ? "border-transparent text-white"
            : "border-slate-200 bg-white hover:-translate-y-1 hover:border-slate-400 hover:shadow-[0_22px_48px_rgba(15,23,42,0.12)]",
        )}
        onClick={() => onChange(template.id)}
        onKeyDown={handleKeyDown}
        ref={(node) => {
          if (node) {
            cardRefs.current.set(template.id, node);
            return;
          }

          cardRefs.current.delete(template.id);
        }}
        role={isCarousel ? "option" : undefined}
        style={
          isActive
            ? {
                background: templateTheme.surface,
                boxShadow: `0 28px 72px ${templateTheme.shadow}`,
              }
            : undefined
        }
        type="button"
      >
        {isActive ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-[-3rem] top-[-2rem] h-32 w-32 rounded-full blur-3xl"
            style={{ background: templateTheme.glow }}
          />
        ) : null}
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-x-5 top-0 h-0.5 origin-center rounded-full transition duration-300",
            isActive ? "bg-white/90" : "scale-x-0 bg-brand-400 group-hover:scale-x-100",
          )}
        />
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-start sm:justify-between">
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
            {isCarousel ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]",
                    isActive ? "bg-white/14 text-white" : "bg-slate-100",
                  )}
                  style={!isActive ? { color: templateTheme.accent, backgroundColor: templateTheme.accentSoft } : undefined}
                >
                  {templateTheme.label}
                </span>
                <span className={cn("text-[11px] font-medium", isActive ? "text-white/70" : "text-slate-500")}>
                  {String(templateOptions.findIndex((item) => item.id === template.id) + 1).padStart(2, "0")}
                </span>
              </div>
            ) : null}
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
        <div className={cn("transition duration-300 group-hover:-translate-y-0.5", isGrid || isCarousel ? "mt-5" : "mt-4")}>
          <TemplatePreview isActive={isActive} mode={mode} template={template} theme={templateTheme} />
        </div>
        <div
          aria-hidden="true"
          className={cn(
            "mt-4 flex flex-col items-start gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] sm:flex-row sm:items-center sm:justify-between sm:gap-3",
            isActive ? "text-white/78" : "text-slate-500 group-hover:text-slate-700",
          )}
        >
          <span>{isActive ? "Pronto para o editor" : isCarousel ? "Clique ou deslize" : "Hover para comparar"}</span>
          <span
            className={cn(
              "rounded-full px-2.5 py-1 transition duration-300",
              isActive ? "bg-white/14 text-white" : "bg-slate-100 group-hover:bg-slate-200",
            )}
            >
              {isActive ? "Ativo agora" : "Preview real"}
            </span>
          </div>
        {isCarousel && isActive ? (
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, rgba(255,255,255,0.92), ${templateTheme.accent})`,
                width: "100%",
              }}
            />
          </div>
        ) : null}
      </button>
    );
  });

  if (isCarousel) {
    return (
      <div className="relative w-full min-w-0 overflow-hidden rounded-[28px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.9),rgba(248,250,252,0.76))] p-3 shadow-[0_30px_80px_rgba(15,23,42,0.12)] sm:rounded-[34px] sm:p-5">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[-4rem] top-[-4rem] h-40 w-40 rounded-full blur-3xl"
          style={{ background: selectedTheme.glow }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[-5rem] right-[-3rem] h-44 w-44 rounded-full blur-3xl"
          style={{ background: selectedTheme.accentSoft }}
        />

        <div className="relative min-w-0 space-y-5">
          <div className="w-full min-w-0 rounded-[22px] border border-white/80 bg-white/72 p-3.5 shadow-[0_20px_45px_rgba(15,23,42,0.06)] backdrop-blur sm:rounded-[28px] sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700">
                    Carrossel de templates
                  </span>
                  <span
                    className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]"
                    style={{ backgroundColor: selectedTheme.accentSoft, color: selectedTheme.accent }}
                  >
                    {selectedTheme.label}
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 shadow-[0_10px_18px_rgba(15,23,42,0.05)]">
                    {activeIndex + 1} de {templateOptions.length}
                  </span>
                </div>

                <h3 className="mt-4 text-xl font-semibold tracking-tight text-ink sm:text-[2rem]">
                  {selectedTemplate?.name}
                </h3>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 sm:text-[15px] sm:leading-7">
                  {selectedTemplate?.description}
                </p>
              </div>
            </div>

            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-200/80">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  background: `linear-gradient(90deg, ${selectedTheme.accent}, rgba(255,255,255,0.96))`,
                  width: `${((activeIndex + 1) / templateOptions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="relative min-w-0">
            <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-20 bg-gradient-to-r from-white via-white/92 to-transparent lg:block" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-20 bg-gradient-to-l from-white via-white/92 to-transparent lg:block" />

            <div
              className="template-picker-carousel flex w-full min-w-0 snap-x snap-mandatory gap-4 overflow-x-auto pb-2 pt-2 scroll-smooth sm:gap-5 sm:pb-3"
              role="listbox"
              aria-label="Escolha um template"
            >
              {cards}
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="order-2 template-picker-controls flex w-full gap-2 overflow-x-auto pb-1 sm:order-1 sm:w-auto sm:flex-wrap sm:overflow-visible sm:pb-0">
              {templateOptions.map((template, index) => {
                const theme = getTemplateShowcaseTheme(template.id);
                const isActive = template.id === value;

                return (
                  <button
                    aria-label={`Selecionar template ${template.name}`}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition",
                      isActive
                        ? "border-transparent text-white shadow-[0_14px_26px_rgba(15,23,42,0.12)]"
                        : "border-white/80 bg-white/80 text-slate-500 hover:border-slate-300 hover:text-slate-700",
                    )}
                    key={template.id}
                    onClick={() => onChange(template.id)}
                    style={isActive ? { background: theme.surface } : undefined}
                    type="button"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </button>
                );
              })}
            </div>

            <div className="order-1 flex w-full items-center justify-between gap-3 sm:order-2 sm:w-auto sm:justify-end">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 sm:hidden">
                Deslize ou use as setas
              </span>
              <button
                aria-label="Selecionar template anterior"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-lg text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-[0_18px_32px_rgba(15,23,42,0.1)]"
                onClick={() => selectRelative(-1)}
                type="button"
              >
                ←
              </button>
              <button
                aria-label="Selecionar proximo template"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-lg text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-[0_18px_32px_rgba(15,23,42,0.1)]"
                onClick={() => selectRelative(1)}
                type="button"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("grid", isGrid ? "gap-4 md:grid-cols-2 2xl:grid-cols-3" : "gap-2")}>
      {cards}
    </div>
  );
}
