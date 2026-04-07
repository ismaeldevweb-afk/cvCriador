import { useState } from "react";
import AppFooter from "../components/AppFooter";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import Panel from "../components/Panel";
import TemplatePicker from "../components/TemplatePicker";
import { marketingContent } from "../content/marketingContent";
import { cn } from "../utils/cn";
import { appRoutes } from "../utils/routes";
import { templateOptions } from "../utils/resumeDefaults";
import { getTemplateShowcaseTheme } from "../utils/templateShowcase";

function SectionHeader({ eyebrow, title, description }) {
  return (
    <div className="mb-6 w-full max-w-3xl sm:mb-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400 sm:text-xs sm:tracking-[0.3em]">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl md:text-4xl">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:mt-4 sm:leading-7 md:text-base">{description}</p>
    </div>
  );
}

const showcaseIllustrations = {
  modern: {
    frame: "border-white/80 bg-[linear-gradient(145deg,#ecfeff_0%,#f8fafc_100%)]",
    panel: "bg-white/72 border-white/70",
    card: "bg-white text-slate-800 border-white/90",
    accent: "bg-teal-500",
    accentSoft: "bg-teal-100",
    accentText: "text-teal-700",
    line: "bg-slate-300",
    mutedLine: "bg-slate-200",
    pill: "bg-white/90 text-teal-700 border-white/80",
  },
  executive: {
    frame: "border-white/80 bg-[linear-gradient(145deg,#eff6ff_0%,#f8fafc_100%)]",
    panel: "bg-slate-900/92 border-slate-700/60",
    card: "bg-white text-slate-900 border-white/90",
    accent: "bg-blue-500",
    accentSoft: "bg-blue-100",
    accentText: "text-blue-700",
    line: "bg-slate-300",
    mutedLine: "bg-slate-200",
    pill: "bg-white/90 text-blue-700 border-white/80",
  },
  editorial: {
    frame: "border-white/80 bg-[linear-gradient(145deg,#fff7ed_0%,#fffdf8_100%)]",
    panel: "bg-white/76 border-white/80",
    card: "bg-white text-slate-900 border-white/90",
    accent: "bg-orange-500",
    accentSoft: "bg-orange-100",
    accentText: "text-orange-700",
    line: "bg-slate-300",
    mutedLine: "bg-slate-200",
    pill: "bg-white/90 text-orange-700 border-white/80",
  },
  noir: {
    frame: "border-slate-700/70 bg-[linear-gradient(145deg,#111827_0%,#1f2937_100%)]",
    panel: "bg-white/8 border-white/10",
    card: "bg-slate-950/80 text-white border-white/10",
    accent: "bg-amber-300",
    accentSoft: "bg-white/10",
    accentText: "text-amber-200",
    line: "bg-white/55",
    mutedLine: "bg-white/16",
    pill: "bg-white/10 text-amber-100 border-white/10",
  },
};

function IllustrationLine({ className }) {
  return <div className={cn("h-2 rounded-full", className)} />;
}

function TemplateIllustration({ compact = false, templateId, templateName }) {
  const theme = showcaseIllustrations[templateId] ?? showcaseIllustrations.modern;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[24px] border p-3 sm:rounded-[28px] sm:p-4",
        compact && "rounded-[20px] p-2.5",
        theme.frame,
      )}
    >
      <div aria-hidden className={cn("absolute -right-8 -top-8 h-24 w-24 rounded-full blur-3xl", theme.accentSoft)} />
      <div aria-hidden className={cn("absolute bottom-0 left-0 h-24 w-24 rounded-full blur-3xl", theme.accentSoft)} />

      <div className="relative flex items-start justify-between gap-3">
        <span className={cn("rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.22em] sm:px-3 sm:text-[10px] sm:tracking-[0.26em]", compact && "px-2 py-0.5 text-[8px]", theme.pill)}>
          Ilustrativo
        </span>
        <div className={cn("h-8 w-8 rounded-2xl sm:h-10 sm:w-10", compact && "h-6 w-6 rounded-xl", theme.accentSoft)} />
      </div>

      {templateId === "modern" ? (
        <div className={cn("relative mt-4 grid grid-cols-[0.92fr_1.08fr] gap-2.5 sm:mt-5 sm:gap-3", compact && "mt-3 gap-2")}>
          <div className={cn("rounded-[20px] border p-3 sm:rounded-[22px] sm:p-4", compact && "rounded-[16px] p-2.5", theme.panel)}>
            <div className={cn("space-y-3", compact && "space-y-2")}>
              <div className="flex items-center gap-2">
                <div className={cn("h-7 w-7 rounded-2xl sm:h-8 sm:w-8", compact && "h-5 w-5 rounded-xl", theme.accent)} />
                <div className="min-w-0 flex-1">
                  <IllustrationLine className={cn("w-16", theme.line)} />
                  <IllustrationLine className={cn("mt-2 w-10", theme.mutedLine)} />
                </div>
              </div>
              <div className="space-y-2">
                <div className={cn("h-8 rounded-2xl sm:h-9", compact && "h-6 rounded-[14px]", theme.mutedLine)} />
                <div className={cn("h-8 rounded-2xl sm:h-9", compact && "h-6 rounded-[14px]", theme.mutedLine)} />
                <div className={cn("h-16 rounded-[20px] sm:h-20 sm:rounded-[22px]", compact && "h-11 rounded-[16px]", theme.mutedLine)} />
              </div>
            </div>
          </div>
          <div className={cn("rounded-[20px] border p-3 sm:rounded-[22px] sm:p-4", compact && "rounded-[16px] p-2.5", theme.card)}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <IllustrationLine className={cn("w-24", templateId === "noir" ? theme.line : "bg-slate-900")} />
                <IllustrationLine className={cn("mt-2 w-16", theme.mutedLine)} />
              </div>
              <div className={cn("h-8 w-8 rounded-full sm:h-9 sm:w-9", compact && "h-6 w-6", theme.accentSoft)} />
            </div>
            <div className={cn("mt-4 grid gap-3 sm:mt-5", compact && "mt-3 gap-2")}>
              <div className={cn("rounded-[18px] bg-slate-50/90 p-3", compact && "rounded-[14px] p-2.5")}>
                <IllustrationLine className={cn("w-16", theme.accent)} />
                <IllustrationLine className={cn("mt-3", theme.mutedLine)} />
                <IllustrationLine className={cn("mt-2 w-10/12", theme.mutedLine)} />
              </div>
              <div className="flex flex-wrap gap-2">
                <div className={cn("h-7 w-16 rounded-full", compact && "h-5 w-12", theme.accentSoft)} />
                <div className={cn("h-7 w-20 rounded-full", compact && "h-5 w-14", theme.accentSoft)} />
                <div className={cn("h-7 w-14 rounded-full", compact && "h-5 w-10", theme.accentSoft)} />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {templateId === "executive" ? (
        <div className={cn("relative mt-4 space-y-2.5 sm:mt-5 sm:space-y-3", compact && "mt-3 space-y-2")}>
          <div className={cn("rounded-[22px] border p-3 text-white sm:rounded-[24px] sm:p-4", compact && "rounded-[16px] p-2.5", theme.panel)}>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <IllustrationLine className="w-24 bg-white/80" />
                <IllustrationLine className="mt-2 w-14 bg-white/30" />
              </div>
              <div className={cn("h-8 w-8 rounded-2xl sm:h-10 sm:w-10", compact && "h-6 w-6 rounded-xl", theme.accent)} />
            </div>
          </div>
          <div className={cn("grid gap-2.5 sm:grid-cols-[1.05fr_0.95fr] sm:gap-3", compact && "gap-2")}>
            <div className={cn("rounded-[18px] border p-3 sm:rounded-[20px] sm:p-4", compact && "rounded-[15px] p-2.5", theme.card)}>
              <IllustrationLine className="w-16 bg-slate-900" />
              <IllustrationLine className={cn("mt-4", theme.mutedLine)} />
              <IllustrationLine className={cn("mt-2 w-10/12", theme.mutedLine)} />
              <IllustrationLine className={cn("mt-2 w-8/12", theme.mutedLine)} />
            </div>
            <div className={cn("space-y-3", compact && "space-y-2")}>
              <div className={cn("rounded-[18px] border p-3 sm:rounded-[20px] sm:p-4", compact && "rounded-[15px] p-2.5", theme.card)}>
                <IllustrationLine className={cn("w-12", theme.accent)} />
                <IllustrationLine className={cn("mt-3", theme.mutedLine)} />
                <IllustrationLine className={cn("mt-2 w-9/12", theme.mutedLine)} />
              </div>
              <div className={cn("rounded-[18px] border p-3 sm:rounded-[20px] sm:p-4", compact && "rounded-[15px] p-2.5", theme.card)}>
                <div className="flex gap-2">
                  <div className={cn("h-8 w-8 rounded-full", compact && "h-6 w-6", theme.accentSoft)} />
                  <div className="min-w-0 flex-1">
                    <IllustrationLine className={cn("w-20", theme.line)} />
                    <IllustrationLine className={cn("mt-2 w-14", theme.mutedLine)} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {templateId === "editorial" ? (
        <div className={cn("relative mt-4 grid grid-cols-[0.74fr_1.26fr] gap-2.5 sm:mt-5 sm:gap-3", compact && "mt-3 gap-2")}>
          <div className={cn("overflow-hidden rounded-[22px] border border-white/70 bg-white/70 sm:rounded-[24px]", compact && "rounded-[16px]")}>
            <div className={cn("h-full min-h-[200px] p-3 sm:min-h-[240px] sm:p-4", compact && "min-h-[132px] p-2.5", theme.panel)}>
              <div className={cn("h-full rounded-[18px] bg-[linear-gradient(180deg,rgba(251,146,60,0.18),rgba(255,255,255,0.16))]")} />
            </div>
          </div>
            <div className={cn("space-y-3", compact && "space-y-2")}>
            <div className={cn("rounded-[18px] border p-3 sm:rounded-[20px] sm:p-4", compact && "rounded-[15px] p-2.5", theme.card)}>
              <div className={cn("h-1.5 w-14 rounded-full", theme.accent)} />
              <div className="mt-4 space-y-2">
                <IllustrationLine className={cn("h-3 w-28", templateId === "noir" ? theme.line : "bg-slate-900")} />
                <IllustrationLine className={cn("w-10/12", theme.mutedLine)} />
                <IllustrationLine className={cn("w-8/12", theme.mutedLine)} />
              </div>
            </div>
            <div className={cn("rounded-[18px] border p-3 sm:rounded-[20px] sm:p-4", compact && "rounded-[15px] p-2.5", theme.card)}>
              <IllustrationLine className={cn("w-16", theme.accent)} />
              <div className={cn("mt-4 grid grid-cols-2 gap-3", compact && "mt-3 gap-2")}>
                <div className={cn("rounded-[16px] bg-slate-50/90 p-3", compact && "rounded-[12px] p-2")}>
                  <IllustrationLine className={cn("w-10", theme.mutedLine)} />
                  <IllustrationLine className={cn("mt-2 w-8", theme.mutedLine)} />
                </div>
                <div className={cn("rounded-[16px] bg-slate-50/90 p-3", compact && "rounded-[12px] p-2")}>
                  <IllustrationLine className={cn("w-10", theme.mutedLine)} />
                  <IllustrationLine className={cn("mt-2 w-8", theme.mutedLine)} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {templateId === "noir" ? (
        <div className={cn("relative mt-4 space-y-2.5 text-white sm:mt-5 sm:space-y-3", compact && "mt-3 space-y-2")}>
          <div className={cn("rounded-[22px] border p-3 sm:rounded-[24px] sm:p-4", compact && "rounded-[16px] p-2.5", theme.panel)}>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <IllustrationLine className={cn("w-20", theme.line)} />
                <IllustrationLine className={cn("mt-2 w-12", theme.mutedLine)} />
              </div>
              <div className={cn("h-8 w-8 rounded-full sm:h-10 sm:w-10", compact && "h-6 w-6", theme.accent)} />
            </div>
          </div>
          <div className={cn("grid gap-2.5 sm:grid-cols-[0.88fr_1.12fr] sm:gap-3", compact && "gap-2")}>
            <div className={cn("rounded-[18px] border p-3 sm:rounded-[20px] sm:p-4", compact && "rounded-[15px] p-2.5", theme.card)}>
              <div className="flex flex-wrap gap-2">
                <div className={cn("h-7 w-14 rounded-full", compact && "h-5 w-10", theme.accentSoft)} />
                <div className={cn("h-7 w-[4.5rem] rounded-full", compact && "h-5 w-12", theme.accentSoft)} />
              </div>
              <IllustrationLine className={cn("mt-5", theme.mutedLine)} />
              <IllustrationLine className={cn("mt-2 w-10/12", theme.mutedLine)} />
              <IllustrationLine className={cn("mt-2 w-8/12", theme.mutedLine)} />
            </div>
            <div className={cn("rounded-[18px] border p-3 sm:rounded-[20px] sm:p-4", compact && "rounded-[15px] p-2.5", theme.panel)}>
              <div className={cn("space-y-3", compact && "space-y-2")}>
                <div className={cn("h-16 rounded-[18px] sm:h-20", compact && "h-10 rounded-[12px]", theme.accentSoft)} />
                <div className={cn("grid grid-cols-2 gap-3", compact && "gap-2")}>
                  <div className={cn("h-16 rounded-[18px] sm:h-20", compact && "h-10 rounded-[12px]", theme.mutedLine)} />
                  <div className={cn("h-16 rounded-[18px] sm:h-20", compact && "h-10 rounded-[12px]", theme.mutedLine)} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className={cn("relative mt-4 flex items-center justify-between gap-3", compact && "mt-3")}>
        <div className="min-w-0">
          <p className={cn("text-xs font-semibold uppercase tracking-[0.24em]", theme.accentText)}>Conceito</p>
          <p className={cn("mt-1 text-sm font-medium", compact && "text-[12px] leading-4", templateId === "noir" ? "text-white/80" : "text-slate-600")}>
            Direcao visual inspirada no template {templateName}.
          </p>
        </div>
        <div className="flex gap-2">
          <div className={cn("h-2.5 w-2.5 rounded-full", theme.accent)} />
          <div className={cn("h-2.5 w-2.5 rounded-full", theme.mutedLine)} />
          <div className={cn("h-2.5 w-2.5 rounded-full", theme.mutedLine)} />
        </div>
      </div>
    </div>
  );
}

function TemplateShowcaseCard({ className, compact = false, template, index }) {
  return (
    <Panel className={cn("h-full p-0", className)}>
      <div className={cn("rounded-[24px] bg-[linear-gradient(145deg,#ffffff_0%,#f8fafc_100%)] p-4 sm:rounded-[26px] sm:p-5", compact && "p-3.5")}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400 sm:text-xs sm:tracking-[0.3em]">Template {String(index + 1).padStart(2, "0")}</p>
          <span className="self-start rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-500">Demonstrativo</span>
        </div>
        <h3 className={cn("mt-4 text-xl font-semibold tracking-tight text-ink sm:text-[1.35rem]", compact && "mt-3 text-lg")}>{template.name}</h3>
        <p className={cn("mt-2.5 text-sm leading-6 text-slate-600", compact && "mt-2 text-[12px] leading-4")}>{template.description}</p>
        <div className={cn("mt-4", compact && "mt-3")}>
          <TemplateIllustration compact={compact} templateId={template.id} templateName={template.name} />
        </div>
      </div>
    </Panel>
  );
}

function TemplateCarouselMock({ templates }) {
  const leftTemplate = templates[0];
  const centerTemplate = templates[1] ?? templates[0];
  const rightTemplate = templates[2] ?? templates[templates.length - 1];

  return (
    <div className="relative px-2 pb-2 pt-1">
      <div aria-hidden className="pointer-events-none absolute left-0 top-10 z-0 w-[32%] -translate-x-[18%] scale-[0.7] opacity-40 blur-[0.4px]">
        <TemplateShowcaseCard compact index={1} template={leftTemplate} />
      </div>
      <div aria-hidden className="pointer-events-none absolute right-0 top-10 z-0 w-[32%] translate-x-[18%] scale-[0.7] opacity-40 blur-[0.4px]">
        <TemplateShowcaseCard compact index={3} template={rightTemplate} />
      </div>
      <div className="relative z-10 mx-auto w-[68%] max-w-[14.5rem]">
        <TemplateShowcaseCard compact index={2} template={centerTemplate} />
      </div>
      <div className="mt-3 flex items-center justify-center gap-2">
        <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        <div className="h-2.5 w-8 rounded-full bg-slate-900" />
        <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { benefits, brand, finalCta, hero, quickProofs } = marketingContent;
  const [selectedTemplate, setSelectedTemplate] = useState(templateOptions[0]?.id ?? "modern");
  const selectedTemplateMeta = templateOptions.find((template) => template.id === selectedTemplate) ?? templateOptions[0];
  const selectedTheme = getTemplateShowcaseTheme(selectedTemplateMeta?.id);
  const createTarget = `${appRoutes.editorNew}?${new URLSearchParams({ template: selectedTemplate, fresh: "1" }).toString()}`;

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden text-ink">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(15,118,110,0.14),transparent_58%)]" />
      <div aria-hidden className="pointer-events-none absolute right-[-8rem] top-20 h-72 w-72 rounded-full bg-amber-100/70 blur-3xl" />

      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/72 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <Link className="flex items-center gap-3 text-xs font-semibold tracking-[0.18em] sm:text-sm sm:tracking-[0.24em]" to={appRoutes.home}>
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f172a_0%,#1f2937_100%)] text-white shadow-[0_16px_35px_rgba(15,23,42,0.20)]">
              CV
            </span>
            <span className="hidden sm:block">{brand.name}</span>
          </Link>

          <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:flex sm:items-center sm:gap-3">
            <Button as={Link} className="w-full min-w-0 px-4 py-3 text-[13px] sm:w-auto sm:px-5 sm:text-sm" to={appRoutes.dashboard} variant="ghost">
              Painel
            </Button>
            <Button as="a" className="w-full min-w-0 px-4 py-3 text-[13px] sm:w-auto sm:px-5 sm:text-sm" href="#template-selector" variant="primary">
              Escolher template
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14 lg:px-8 lg:pb-24 lg:pt-16">
          <div className="grid gap-10 sm:gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(360px,520px)] lg:items-center">
            <div className="max-w-5xl">
              <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border border-white/80 bg-white/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 shadow-soft sm:text-xs sm:tracking-[0.28em]">
                <span className="h-2 w-2 rounded-full bg-brand-500" />
                {hero.eyebrow}
              </div>

              <h1 className="mt-6 max-w-4xl font-display text-[clamp(2.85rem,12vw,4.75rem)] leading-[0.98] tracking-tight sm:mt-8 md:text-7xl">
                {hero.title}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:mt-6 sm:text-lg sm:leading-8 md:text-xl">
                {hero.subtitle}
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Button as="a" className="w-full px-7 py-4 sm:w-auto" href="#template-selector" variant="primary">
                  {hero.primaryCta}
                </Button>
                <Button as={Link} className="w-full px-7 py-4 sm:w-auto" to={appRoutes.dashboard} variant="secondary">
                  {hero.secondaryCta}
                </Button>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div
                aria-hidden
                className="absolute inset-6 rounded-[40px] bg-[radial-gradient(circle_at_top,rgba(15,118,110,0.24),rgba(255,255,255,0))] blur-3xl"
              />
              <div className="relative overflow-hidden rounded-[36px] border border-white/80 bg-white/72 p-3 shadow-float backdrop-blur-2xl">
                <img
                  alt="Profissional sorrindo com curriculo pronto ao lado da interface do produto."
                  className="block h-full w-full rounded-[28px] object-cover"
                  loading="eager"
                  src="/hero/landing-hero-resume.png"
                />
              </div>
            </div>
          </div>

          <div
            className="mt-12 scroll-mt-28 rounded-[28px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(248,250,252,0.9))] p-4 shadow-soft backdrop-blur-2xl sm:mt-14 sm:rounded-[32px] sm:p-6 lg:p-8"
            id="template-selector"
          >
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_360px]">
              <div className="min-w-0">
                <SectionHeader
                  description="A escolha de template agora fica em um carrossel na propria pagina inicial. Passe pelos modelos, compare rapidamente e siga direto para o editor."
                  eyebrow="Escolha de Template"
                  title="Deslize pelo carrossel e escolha o modelo."
                />
                <TemplatePicker mode="carousel" onChange={setSelectedTemplate} value={selectedTemplate} />
              </div>

              <Panel
                className="min-w-0 h-fit p-5 sm:p-6"
                description="Ao continuar, o editor abre ja com o template selecionado."
                title="Template selecionado"
              >
                <div className="space-y-5">
                  <div
                    className="rounded-[20px] border border-slate-200 p-4 sm:rounded-[24px] sm:p-5"
                    style={{ background: selectedTheme.panelSurface }}
                  >
                    <div className="overflow-hidden rounded-[18px] border border-white/90 bg-white/88 p-2 shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:rounded-[20px]">
                      <div className="relative overflow-hidden rounded-[14px] bg-white sm:rounded-[16px]">
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-x-6 top-0 h-20 rounded-full blur-3xl"
                          style={{ background: selectedTheme.glow }}
                        />
                        <img
                          alt={`Preview ampliado do template ${selectedTemplateMeta?.name}`}
                          className="block h-[160px] w-full object-cover object-top sm:h-[200px]"
                          loading="lazy"
                          src={`/templates/${selectedTemplateMeta?.id}.png`}
                        />
                      </div>
                    </div>
                    <div className="mt-5 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                      <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-700">Selecionado agora</h3>
                      <span
                        className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]"
                        style={{ backgroundColor: selectedTheme.accentSoft, color: selectedTheme.accent }}
                      >
                        {selectedTheme.label}
                      </span>
                    </div>
                    <h4 className="mt-2 text-xl font-semibold tracking-tight text-ink sm:text-2xl">{selectedTemplateMeta?.name}</h4>
                    <p className="mt-3 text-sm leading-6 text-slate-700 sm:leading-7">{selectedTemplateMeta?.description}</p>
                  </div>

                  <div
                    className="rounded-[20px] border border-ink/10 p-4 text-white shadow-[0_24px_60px_rgba(15,23,42,0.2)] sm:rounded-[24px] sm:p-5"
                    style={{ background: selectedTheme.surface }}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">Proximo passo</p>
                    <p className="mt-3 text-sm leading-6 text-white/82">
                      Abra o editor com {selectedTemplateMeta?.name} e comece a preencher o curriculo imediatamente.
                    </p>
                    <div className="mt-5">
                      <Button as={Link} className="w-full px-5 py-4 text-sm sm:px-7" to={createTarget} variant="accent">
                        Continuar com {selectedTemplateMeta?.name}
                      </Button>
                    </div>
                  </div>
                </div>
              </Panel>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:mt-12 md:grid-cols-3">
            {quickProofs.map((item) => (
              <Panel key={item.title} className="p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">{item.title}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
              </Panel>
            ))}
          </div>
        </section>

        <section className="border-y border-slate-200/80 bg-white/55">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <SectionHeader
              description="Os blocos abaixo concentram os diferenciais principais da plataforma, sem misturar essa leitura com a etapa de escolha do template."
              eyebrow="Diferenciais do Produto"
              title="Uma faixa dedicada para a experiencia central."
            />

            <div className="grid gap-6 lg:grid-cols-3">
              {benefits.map((benefit) => (
                <Panel key={benefit.title}>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">{benefit.eyebrow}</p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight text-ink">{benefit.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{benefit.description}</p>
                </Panel>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200/80">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <div className="overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#0f172a_0%,#1f2937_48%,#0f766e_100%)] px-5 py-8 text-white shadow-float sm:rounded-[38px] sm:px-8 sm:py-12">
              <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
                <div className="max-w-3xl">
                  <p className="text-sm uppercase tracking-[0.34em] text-white/50">{finalCta.eyebrow}</p>
                  <h2 className="mt-4 font-display text-3xl tracking-tight sm:text-4xl md:text-5xl">
                    {finalCta.title}
                  </h2>
                  <p className="mt-5 max-w-2xl text-sm leading-7 text-white/72">
                    {finalCta.description}
                  </p>
                </div>
                <Button as="a" className="w-full px-7 py-4 sm:w-auto" href="#template-selector" variant="secondary">
                  {finalCta.cta}
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(248,250,252,0.96))]">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
            <Panel className="overflow-hidden border-white/90 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))] p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] sm:p-8">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <div className="max-w-3xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Painel</p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Abra seu workspace local antes de sair da home.</h2>
                  <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                    Entre no painel para retomar rascunhos, revisar curriculos salvos e acompanhar suas exportacoes recentes sem perder o fluxo.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {["Rascunhos locais", "Curriculos salvos", "PDFs recentes"].map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-white/80 bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600 shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <Button as={Link} className="w-full px-7 py-4 sm:w-auto" to={appRoutes.dashboard} variant="primary">
                  Abrir painel
                </Button>
              </div>
            </Panel>
          </div>
        </section>
      </main>

      <AppFooter />
    </div>
  );
}
