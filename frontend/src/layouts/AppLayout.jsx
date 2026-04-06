import { Link, useLocation } from "react-router-dom";
import AppFooter from "../components/AppFooter";
import { cn } from "../utils/cn";
import { appRoutes, workspaceNavItems } from "../utils/routes";

export default function AppLayout({ title, subtitle, actions, children, contentClassName, footerProps }) {
  const location = useLocation();

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(15,118,110,0.12),transparent_26%),radial-gradient(circle_at_top_right,rgba(245,158,11,0.12),transparent_24%),linear-gradient(180deg,#fcfbf7_0%,#f6f8fc_100%)] text-ink">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(15,118,110,0.12),transparent_58%)]" />
      <div aria-hidden className="pointer-events-none absolute left-[-8rem] top-24 h-64 w-64 rounded-full bg-brand-100/60 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute right-[-10rem] top-40 h-72 w-72 rounded-full bg-amber-100/60 blur-3xl" />

      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/65 backdrop-blur-2xl">
        <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center justify-between gap-4">
              <Link className="flex items-center gap-3 text-sm font-semibold tracking-[0.24em]" to={appRoutes.home}>
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f172a_0%,#1f2937_100%)] text-white shadow-[0_16px_35px_rgba(15,23,42,0.20)]">
                  CV
                </span>
                <span className="hidden sm:block">Criador de Curriculo Online</span>
              </Link>
            </div>

            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:gap-6">
              <nav className="flex flex-wrap items-center gap-2 rounded-full border border-white/70 bg-white/75 p-2 shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
                {workspaceNavItems.map((item) => {
                  const isActive = item.matches(location.pathname);

                  return (
                    <Link
                      aria-current={isActive ? "page" : undefined}
                      key={item.to}
                      className={
                        isActive
                          ? "rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_25px_rgba(15,23,42,0.18)]"
                          : "rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-ink"
                      }
                      to={item.to}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="rounded-full border border-white/70 bg-white/80 px-4 py-2 shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-600">Modo local</p>
                <p className="text-sm font-semibold text-ink">Curriculos salvos neste navegador</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className={cn("relative mx-auto w-full max-w-7xl flex-1 px-6 py-8 lg:px-8", contentClassName)}>
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-600">Workspace</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
            {subtitle ? <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-700">{subtitle}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-3 md:justify-end">{actions}</div> : null}
        </div>

        {children}
      </main>
      <AppFooter {...footerProps} />
    </div>
  );
}
