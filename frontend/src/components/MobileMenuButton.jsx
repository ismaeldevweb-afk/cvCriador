import { cn } from "../utils/cn";

export default function MobileMenuButton({
  className,
  controls,
  isOpen = false,
  onClick,
}) {
  const label = isOpen ? "Fechar menu" : "Abrir menu";

  return (
    <button
      aria-controls={controls}
      aria-expanded={isOpen}
      aria-label={label}
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/80 bg-white/88 text-ink shadow-[0_16px_35px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-300/60",
        className,
      )}
      onClick={onClick}
      type="button"
    >
      <span className="sr-only">{label}</span>
      <span className="relative h-4 w-5">
        <span
          aria-hidden="true"
          className={cn(
            "absolute left-0 top-0 h-0.5 w-5 rounded-full bg-current transition duration-200",
            isOpen && "translate-y-[7px] rotate-45",
          )}
        />
        <span
          aria-hidden="true"
          className={cn(
            "absolute left-0 top-[7px] h-0.5 w-5 rounded-full bg-current transition duration-200",
            isOpen && "opacity-0",
          )}
        />
        <span
          aria-hidden="true"
          className={cn(
            "absolute bottom-0 left-0 h-0.5 w-5 rounded-full bg-current transition duration-200",
            isOpen && "-translate-y-[7px] -rotate-45",
          )}
        />
      </span>
    </button>
  );
}
