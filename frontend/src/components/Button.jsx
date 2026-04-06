import { cn } from "../utils/cn";

const variants = {
  primary:
    "bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_100%)] text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)] hover:-translate-y-0.5 hover:shadow-[0_22px_50px_rgba(15,23,42,0.22)]",
  secondary:
    "border border-slate-300/90 bg-white/85 text-ink shadow-[0_10px_30px_rgba(15,23,42,0.06)] hover:-translate-y-0.5 hover:border-slate-500 hover:bg-white",
  ghost: "bg-transparent text-slate-700 hover:bg-white/80 hover:text-ink",
  accent:
    "bg-[linear-gradient(135deg,#0f766e_0%,#14b8a6_100%)] text-white shadow-[0_18px_40px_rgba(15,118,110,0.22)] hover:-translate-y-0.5 hover:shadow-[0_22px_50px_rgba(15,118,110,0.28)]",
  danger:
    "bg-[linear-gradient(135deg,#e11d48_0%,#be123c_100%)] text-white shadow-[0_18px_40px_rgba(225,29,72,0.18)] hover:-translate-y-0.5 hover:shadow-[0_22px_50px_rgba(225,29,72,0.24)]",
};

export default function Button({
  as: Component = "button",
  variant = "primary",
  className,
  children,
  ...props
}) {
  return (
    <Component
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-300/60 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
