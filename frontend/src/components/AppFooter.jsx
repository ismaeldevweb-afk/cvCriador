import { Link } from "react-router-dom";
import { marketingContent } from "../content/marketingContent";
import { appRoutes, footerNavItems } from "../utils/routes";

export default function AppFooter({ brandAsLink = true, showNavigation = true }) {
  const { brand, footer } = marketingContent;
  const BrandWrapper = brandAsLink ? Link : "div";
  const brandProps = brandAsLink ? { to: appRoutes.home } : {};

  return (
    <footer className="relative mt-12 border-t border-white/70 bg-white/72 backdrop-blur-2xl">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className={`grid gap-8 lg:items-start ${showNavigation ? "lg:grid-cols-[1.2fr_0.8fr]" : "lg:grid-cols-[1.2fr_0.6fr]"}`}>
          <div>
            <BrandWrapper className="flex flex-wrap items-center gap-3 text-xs font-semibold tracking-[0.18em] text-ink sm:text-sm sm:tracking-[0.24em]" {...brandProps}>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f172a_0%,#1f2937_100%)] text-white shadow-[0_16px_35px_rgba(15,23,42,0.16)]">
                CV
              </span>
              <span className="max-w-full">{brand.name}</span>
            </BrandWrapper>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
              {footer.description}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {footer.pills.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(248,250,252,0.88))] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className={`grid gap-6 ${showNavigation ? "sm:grid-cols-2" : ""}`}>
            {showNavigation ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-600">{footer.navigationTitle}</p>
                <div className="mt-4 flex flex-col gap-3">
                  {footerNavItems.map((item) => (
                    <Link key={item.to} className="text-sm font-medium text-slate-700 transition hover:text-ink" to={item.to}>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-600">{footer.experienceTitle}</p>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                {footer.experienceItems.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-slate-200/80 pt-5 text-xs font-medium uppercase tracking-[0.14em] text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:tracking-[0.18em]">
          <p>{new Date().getFullYear()} {brand.name}</p>
          <p className="max-w-md leading-5 sm:text-right">{footer.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
