import AppFooter from "../components/AppFooter";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import Panel from "../components/Panel";
import { marketingContent } from "../content/marketingContent";
import { appRoutes } from "../utils/routes";
import { templateOptions } from "../utils/resumeDefaults";

export default function LandingPage() {
  const { audience, benefits, brand, finalCta, hero, productPreview, quickProofs, steps, templates } = marketingContent;
  const showcaseTemplates = templateOptions.slice(0, 3);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden text-ink">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(15,118,110,0.14),transparent_58%)]" />
      <div aria-hidden className="pointer-events-none absolute right-[-8rem] top-20 h-72 w-72 rounded-full bg-amber-100/70 blur-3xl" />

      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/72 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link className="flex items-center gap-3 text-sm font-semibold tracking-[0.24em]" to={appRoutes.home}>
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f172a_0%,#1f2937_100%)] text-white shadow-[0_16px_35px_rgba(15,23,42,0.20)]">
              CV
            </span>
            <span className="hidden sm:block">{brand.name}</span>
          </Link>

          <div className="flex items-center gap-3">
            <Button as={Link} to={appRoutes.dashboard} variant="ghost">
              Painel
            </Button>
            <Button as={Link} to={appRoutes.templates} variant="primary">
              Escolher template
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto grid max-w-7xl gap-14 px-6 pb-20 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 shadow-soft">
              <span className="h-2 w-2 rounded-full bg-brand-500" />
              {hero.eyebrow}
            </div>

            <h1 className="mt-8 max-w-4xl font-display text-5xl leading-[0.98] tracking-tight md:text-7xl">
              {hero.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
              {hero.subtitle}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button as={Link} className="px-7 py-4" to={appRoutes.templates} variant="primary">
                {hero.primaryCta}
              </Button>
              <Button as={Link} className="px-7 py-4" to={appRoutes.dashboard} variant="secondary">
                {hero.secondaryCta}
              </Button>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {quickProofs.map((item) => (
                <Panel key={item.title} className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">{item.title}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
                </Panel>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="overflow-hidden rounded-[38px] border border-white/70 bg-[linear-gradient(160deg,#0f172a_0%,#1f2937_38%,#0f766e_100%)] p-7 text-white shadow-float">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.34em] text-white/55">{productPreview.eyebrow}</p>
                  <p className="mt-3 max-w-sm text-sm leading-7 text-white/76">
                    {productPreview.description}
                  </p>
                </div>
                <div className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/80">
                  {productPreview.badge}
                </div>
              </div>

              <div className="mt-8 rounded-[28px] border border-white/12 bg-white/10 p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-3 w-32 rounded-full bg-white/85" />
                    <div className="mt-3 h-2 w-48 rounded-full bg-white/45" />
                  </div>
                  <div className="rounded-full bg-white/15 px-3 py-2 text-xs uppercase tracking-[0.22em] text-white/70">{productPreview.liveLabel}</div>
                </div>

                <div className="mt-7 grid gap-4 lg:grid-cols-[0.94fr_1.06fr]">
                  <div className="rounded-[22px] border border-white/12 bg-white/10 p-4">
                    <div className="text-xs uppercase tracking-[0.28em] text-white/55">{productPreview.editorLabel}</div>
                    <div className="mt-4 space-y-3">
                      <div className="h-10 rounded-2xl bg-white/15" />
                      <div className="h-10 rounded-2xl bg-white/15" />
                      <div className="h-10 rounded-2xl bg-white/15" />
                      <div className="h-24 rounded-[22px] bg-white/15" />
                    </div>
                  </div>

                  <div className="rounded-[22px] border border-white/12 bg-white px-5 py-4 text-slate-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="h-3 w-24 rounded-full bg-slate-900" />
                        <div className="mt-2 h-2 w-36 rounded-full bg-slate-300" />
                      </div>
                      <div className="h-8 w-8 rounded-full bg-brand-100" />
                    </div>
                    <div className="mt-5 grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
                      <div className="rounded-[18px] bg-slate-50 p-4">
                        <div className="h-2 w-20 rounded-full bg-brand-400" />
                        <div className="mt-4 h-2 rounded-full bg-slate-200" />
                        <div className="mt-2 h-2 w-5/6 rounded-full bg-slate-200" />
                        <div className="mt-5 flex flex-wrap gap-2">
                          <div className="h-7 w-16 rounded-full bg-brand-50" />
                          <div className="h-7 w-20 rounded-full bg-brand-50" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="rounded-[18px] border border-slate-200 p-4">
                          <div className="h-2 w-24 rounded-full bg-brand-400" />
                          <div className="mt-3 h-2 rounded-full bg-slate-200" />
                          <div className="mt-2 h-2 w-11/12 rounded-full bg-slate-200" />
                          <div className="mt-2 h-2 w-4/5 rounded-full bg-slate-200" />
                        </div>
                        <div className="rounded-[18px] border border-slate-200 p-4">
                          <div className="h-2 w-20 rounded-full bg-brand-400" />
                          <div className="mt-3 h-2 rounded-full bg-slate-200" />
                          <div className="mt-2 h-2 w-10/12 rounded-full bg-slate-200" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {templates.map((template) => (
                  <span
                    key={template}
                    className="rounded-full border border-white/12 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/78"
                  >
                    {template}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Panel title={audience.title}>
                <ul className="space-y-2 text-sm leading-6 text-slate-600">
                  {audience.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </Panel>
              <Panel title={steps.title}>
                <ol className="space-y-2 text-sm leading-6 text-slate-600">
                  {steps.items.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </Panel>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <Panel key={benefit.title}>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">{benefit.eyebrow}</p>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight text-ink">{benefit.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{benefit.description}</p>
              </Panel>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          <div className="grid gap-5 lg:grid-cols-3">
            {showcaseTemplates.map((template, index) => (
              <Panel key={template.id} className="p-0">
                <div className="rounded-[26px] bg-[linear-gradient(145deg,#ffffff_0%,#f8fafc_100%)] p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Template {String(index + 1).padStart(2, "0")}</p>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">{template.name}</span>
                  </div>
                  <div className="mt-5 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.05)]">
                    <img
                      alt={`Preview real do template ${template.name}`}
                      className="block w-full"
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                        const fallbackNode = event.currentTarget.nextElementSibling;

                        if (fallbackNode) {
                          fallbackNode.style.display = "flex";
                        }
                      }}
                      src={`/templates/${template.id}.png`}
                    />
                    <div className="hidden min-h-[420px] flex-col justify-between bg-[linear-gradient(145deg,#ffffff_0%,#f8fafc_100%)] p-5">
                      <div>
                        <div className="h-3 w-28 rounded-full bg-slate-900" />
                        <div className="mt-3 h-2 w-40 rounded-full bg-slate-300" />
                      </div>
                      <div className="mt-5 grid gap-3 md:grid-cols-[0.85fr_1.15fr]">
                        <div className="rounded-[18px] bg-slate-50 p-4">
                          <div className="h-2 w-16 rounded-full bg-brand-400" />
                          <div className="mt-3 h-2 rounded-full bg-slate-200" />
                          <div className="mt-2 h-2 w-11/12 rounded-full bg-slate-200" />
                        </div>
                        <div className="space-y-2">
                          <div className="h-2 rounded-full bg-slate-200" />
                          <div className="h-2 rounded-full bg-slate-200" />
                          <div className="h-2 w-4/5 rounded-full bg-slate-200" />
                          <div className="mt-4 h-16 rounded-[20px] bg-slate-50" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Panel>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="overflow-hidden rounded-[38px] bg-[linear-gradient(135deg,#0f172a_0%,#1f2937_48%,#0f766e_100%)] px-8 py-12 text-white shadow-float">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="max-w-3xl">
                <p className="text-sm uppercase tracking-[0.34em] text-white/50">{finalCta.eyebrow}</p>
                <h2 className="mt-4 font-display text-4xl tracking-tight md:text-5xl">
                  {finalCta.title}
                </h2>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-white/72">
                  {finalCta.description}
                </p>
              </div>
              <Button as={Link} className="px-7 py-4" to={appRoutes.templates} variant="secondary">
                {finalCta.cta}
              </Button>
            </div>
          </div>
        </section>
      </main>

      <AppFooter />
    </div>
  );
}
