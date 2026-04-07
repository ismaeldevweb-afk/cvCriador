import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import AppFooter from "../components/AppFooter";
import MobileMenuButton from "../components/MobileMenuButton";
import { cn } from "../utils/cn";
import { appRoutes, workspaceNavItems } from "../utils/routes";

export default function AppLayout({ title, subtitle, actions, children, contentClassName, footerProps }) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.hash, location.pathname, location.search]);

  return (
    <div className="relative flex min-h-screen flex-col bg-[radial-gradient(circle_at_top_left,rgba(15,118,110,0.12),transparent_26%),radial-gradient(circle_at_top_right,rgba(245,158,11,0.12),transparent_24%),linear-gradient(180deg,#fcfbf7_0%,#f6f8fc_100%)] text-ink">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(15,118,110,0.12),transparent_58%)]" />
        <div className="absolute left-[-8rem] top-24 h-64 w-64 rounded-full bg-brand-100/60 blur-3xl" />
        <div className="absolute right-[-10rem] top-40 h-72 w-72 rounded-full bg-amber-100/60 blur-3xl" />
      </div>

      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/65 backdrop-blur-2xl">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center justify-between gap-4">
              <Link className="flex items-center gap-3 text-sm font-semibold tracking-[0.24em]" to={appRoutes.home}>
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f172a_0%,#1f2937_100%)] text-white shadow-[0_16px_35px_rgba(15,23,42,0.20)]">
                  CV
                </span>
                <span className="hidden sm:block">Criador de Curriculo Online</span>
              </Link>
            </div>

            <div className="hidden min-w-0 flex-1 flex-col gap-3 sm:flex lg:flex-row lg:items-center lg:justify-end">
              <nav
                aria-label="Navegacao do workspace"
                className="flex flex-wrap items-center gap-2 rounded-full border border-white/70 bg-white/75 p-2 shadow-[0_14px_35px_rgba(15,23,42,0.06)] lg:justify-end"
              >
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
                <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-700">Modo local</p>
                <p className="text-sm font-semibold text-ink">Curriculos salvos neste navegador</p>
              </div>
            </div>

            <MobileMenuButton
              className="sm:hidden"
              controls="workspace-mobile-menu"
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((current) => !current)}
            />
          </div>

          {isMobileMenuOpen ? (
            <div
              className="mt-4 space-y-3 rounded-[28px] border border-white/80 bg-white/92 p-3 shadow-[0_24px_60px_rgba(15,23,42,0.1)] sm:hidden"
              id="workspace-mobile-menu"
            >
              <nav aria-label="Menu do workspace" className="flex flex-col gap-2">
                {workspaceNavItems.map((item) => {
                  const isActive = item.matches(location.pathname);

                  return (
                    <Link
                      aria-current={isActive ? "page" : undefined}
                      className={
                        isActive
                          ? "rounded-[20px] bg-ink px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_25px_rgba(15,23,42,0.18)]"
                          : "rounded-[20px] border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white hover:text-ink"
                      }
                      key={item.to}
                      to={item.to}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="rounded-[22px] border border-white/80 bg-[linear-gradient(145deg,rgba(248,250,252,0.94),rgba(255,255,255,0.98))] px-4 py-3">
                <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-700">Modo local</p>
                <p className="mt-1 text-sm font-semibold text-ink">Curriculos salvos neste navegador</p>
              </div>
            </div>
          ) : null}
        </div>
      </header>

      <main className={cn("relative mx-auto w-full max-w-7xl flex-1 px-6 py-8 lg:px-8", contentClassName)}>
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-700">Workspace</p>
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
