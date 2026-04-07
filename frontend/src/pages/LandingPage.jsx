import { useEffect, useLayoutEffect, useRef, useState } from "react";
import AppFooter from "../components/AppFooter";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import MobileMenuButton from "../components/MobileMenuButton";
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
      <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-600 sm:text-sm sm:tracking-[0.18em]">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl md:text-4xl">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:mt-4 sm:leading-7 md:text-base">{description}</p>
    </div>
  );
}

const landingNavItems = [
  { href: "#inicio", label: "Inicio" },
  { href: "#template-selector", label: "Templates" },
  { href: "#diferenciais", label: "Diferenciais" },
  { href: "#painel-local", label: "Painel" },
];

const sectionScrollGap = 12;

export default function LandingPage() {
  const { benefits, brand, finalCta, hero, quickProofs } = marketingContent;
  const [selectedTemplate, setSelectedTemplate] = useState(templateOptions[0]?.id ?? "modern");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headerRef = useRef(null);
  const selectedTemplateMeta = templateOptions.find((template) => template.id === selectedTemplate) ?? templateOptions[0];
  const selectedTheme = getTemplateShowcaseTheme(selectedTemplateMeta?.id);
  const createTarget = `${appRoutes.editorNew}?${new URLSearchParams({ template: selectedTemplate, fresh: "1" }).toString()}`;

  function scrollToSection(hash, behavior = "smooth") {
    const sectionId = hash.replace(/^#/, "");
    const target = document.getElementById(sectionId);

    if (!target) {
      return;
    }

    const headerHeight = headerRef.current?.getBoundingClientRect().height ?? 0;
    const nextTop = target.getBoundingClientRect().top + window.scrollY - headerHeight - sectionScrollGap;

    window.scrollTo({
      top: Math.max(0, nextTop),
      behavior,
    });
  }

  function handleSectionLinkClick(event, hash) {
    event.preventDefault();

    if (window.location.hash !== hash) {
      window.history.pushState(null, "", hash);
    }

    setIsMobileMenuOpen(false);
    scrollToSection(hash, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth");
  }

  useLayoutEffect(() => {
    if (!window.location.hash) {
      return undefined;
    }

    window.scrollTo({ top: 0, behavior: "auto" });
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        scrollToSection(window.location.hash, "auto");
      });
    });
  }, []);

  useEffect(() => {
    const syncHashPosition = () => {
      if (!window.location.hash) {
        return;
      }

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          scrollToSection(window.location.hash, "auto");
        });
      });
    };

    if (window.location.hash) {
      syncHashPosition();
    }

    if (document.readyState !== "complete") {
      window.addEventListener("load", syncHashPosition);
    }

    window.addEventListener("hashchange", syncHashPosition);
    window.addEventListener("resize", syncHashPosition);

    return () => {
      window.removeEventListener("load", syncHashPosition);
      window.removeEventListener("hashchange", syncHashPosition);
      window.removeEventListener("resize", syncHashPosition);
    };
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col text-ink">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(15,118,110,0.14),transparent_58%)]" />
        <div className="absolute right-[-8rem] top-20 h-72 w-72 rounded-full bg-amber-100/70 blur-3xl" />
      </div>

      <header ref={headerRef} className="sticky top-0 z-30 border-b border-white/70 bg-white/72 backdrop-blur-2xl">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link className="flex items-center gap-3 text-[13px] font-semibold tracking-[0.12em] sm:text-sm sm:tracking-[0.18em]" to={appRoutes.home}>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f172a_0%,#1f2937_100%)] text-white shadow-[0_16px_35px_rgba(15,23,42,0.20)]">
                CV
              </span>
              <span className="hidden sm:block">{brand.name}</span>
            </Link>

            <div className="hidden min-w-0 flex-1 justify-end lg:flex">
              <nav aria-label="Navegacao principal" className="flex flex-wrap items-center gap-2 rounded-full border border-white/70 bg-white/75 p-2 shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
                {landingNavItems.map((item) => (
                  <a
                    key={item.href}
                    className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-ink"
                    href={item.href}
                    onClick={(event) => handleSectionLinkClick(event, item.href)}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>

            <MobileMenuButton
              className="sm:hidden"
              controls="landing-mobile-menu"
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((current) => !current)}
            />
          </div>

          <nav aria-label="Navegacao principal" className="mt-4 hidden sm:flex lg:hidden">
            <div className="flex flex-wrap items-center gap-2 rounded-full border border-white/70 bg-white/75 p-2 shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
              {landingNavItems.map((item) => (
                <a
                  key={item.href}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-ink"
                  href={item.href}
                  onClick={(event) => handleSectionLinkClick(event, item.href)}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </nav>

          {isMobileMenuOpen ? (
            <div
              className="mt-4 space-y-3 rounded-[28px] border border-white/80 bg-white/92 p-3 shadow-[0_24px_60px_rgba(15,23,42,0.1)] sm:hidden"
              id="landing-mobile-menu"
            >
              <div className="rounded-[22px] border border-white/80 bg-[linear-gradient(145deg,rgba(248,250,252,0.94),rgba(255,255,255,0.98))] px-4 py-3">
                <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-700">Menu</p>
                <p className="mt-1 text-sm leading-6 text-slate-700">Navegue pela home ou pule direto para o seletor de templates.</p>
              </div>

              <nav aria-label="Navegacao principal" className="grid gap-2">
                {landingNavItems.map((item) => (
                  <a
                    key={item.href}
                    className="rounded-[20px] border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white hover:text-ink"
                    href={item.href}
                    onClick={(event) => handleSectionLinkClick(event, item.href)}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          ) : null}
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 sm:pb-14 sm:pt-14 lg:px-8 lg:pb-16 lg:pt-16" id="inicio">
          <div className="grid gap-10 sm:gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(360px,520px)] lg:items-center">
            <div className="max-w-5xl">
              <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border border-white/80 bg-white/80 px-4 py-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-slate-700 shadow-soft sm:text-sm sm:tracking-[0.16em]">
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
                <Button
                  as="a"
                  className="w-full px-7 py-4 sm:w-auto"
                  href="#template-selector"
                  onClick={(event) => handleSectionLinkClick(event, "#template-selector")}
                  variant="primary"
                >
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
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24" id="template-selector">
          <div className="rounded-[28px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(248,250,252,0.9))] p-4 shadow-soft backdrop-blur-2xl sm:rounded-[32px] sm:p-6 lg:p-8">
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
                      <h3 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-700">Selecionado agora</h3>
                      <span
                        className="rounded-full px-3 py-1.5 text-[13px] font-semibold uppercase tracking-[0.12em]"
                        style={{ backgroundColor: selectedTheme.accentSoft, color: selectedTheme.accentInk }}
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
                    <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-white">Proximo passo</p>
                    <p className="mt-3 text-sm leading-6 text-white">
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
                <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-600">{item.title}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
              </Panel>
            ))}
          </div>
        </section>

        <section className="border-y border-slate-200/80 bg-white/55" id="diferenciais">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <SectionHeader
              description="Os blocos abaixo concentram os diferenciais principais da plataforma, sem misturar essa leitura com a etapa de escolha do template."
              eyebrow="Diferenciais do Produto"
              title="Uma faixa dedicada para a experiencia central."
            />

            <div className="grid gap-6 lg:grid-cols-3">
              {benefits.map((benefit) => (
                <Panel key={benefit.title}>
                  <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-600">{benefit.eyebrow}</p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight text-ink">{benefit.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{benefit.description}</p>
                </Panel>
              ))}
            </div>
          </div>
        </section>

        <section
          className="border-t border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(248,250,252,0.96))]"
          id="painel-local"
        >
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
            <Panel className="overflow-hidden border-white/90 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))] p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] sm:p-8">
              <div className="space-y-8">
                <div className="max-w-4xl">
                  <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-600">{finalCta.eyebrow}</p>
                  <h2 className="mt-3 font-display text-3xl tracking-tight text-ink sm:text-4xl md:text-5xl">{finalCta.title}</h2>
                  <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">{finalCta.description}</p>
                </div>

                <div className="h-px bg-[linear-gradient(90deg,rgba(148,163,184,0.12),rgba(148,163,184,0.5),rgba(148,163,184,0.12))]" />

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                  <div className="max-w-3xl">
                    <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-600">Painel</p>
                    <h3 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Abra seu workspace local antes de sair da home.</h3>
                    <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                      Entre no painel para retomar rascunhos, revisar curriculos salvos e acompanhar suas exportacoes recentes sem perder o fluxo.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {["Rascunhos locais", "Curriculos salvos", "PDFs recentes"].map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-white/80 bg-white px-3 py-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row lg:flex-col">
                    <Button as={Link} className="w-full px-7 py-4 sm:w-auto" to={appRoutes.dashboard} variant="primary">
                      Abrir painel
                    </Button>
                    <Button
                      as="a"
                      className="w-full px-7 py-4 sm:w-auto"
                      href="#template-selector"
                      onClick={(event) => handleSectionLinkClick(event, "#template-selector")}
                      variant="secondary"
                    >
                      {finalCta.cta}
                    </Button>
                  </div>
                </div>
              </div>
            </Panel>
          </div>
        </section>
      </main>

      <AppFooter brandAsLink={false} />
    </div>
  );
}
