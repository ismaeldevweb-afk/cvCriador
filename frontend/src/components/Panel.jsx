import { cn } from "../utils/cn";

export default function Panel({ title, description, action, className, style, children }) {
  return (
    <section
      className={cn(
        "relative flex min-h-0 flex-col overflow-hidden rounded-[30px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,255,255,0.84))] p-6 shadow-soft backdrop-blur-2xl",
        className,
      )}
      style={style}
    >
      <div aria-hidden className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-90" />
      <div aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-100/60 blur-3xl" />
      {(title || description || action) && (
        <div className="relative mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            {title ? <h2 className="text-xl font-semibold tracking-tight text-ink">{title}</h2> : null}
            {description ? <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-700">{description}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      )}
      <div className="relative flex min-h-0 flex-1 flex-col">{children}</div>
    </section>
  );
}
