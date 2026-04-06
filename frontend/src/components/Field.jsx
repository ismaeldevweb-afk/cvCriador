import { useId } from "react";
import { cn } from "../utils/cn";

function slugify(value = "") {
  return value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const baseInputClasses =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-200/80";

export default function Field({
  label,
  as = "input",
  helperText,
  error,
  className,
  id,
  name,
  children,
  ...props
}) {
  const generatedId = useId().replace(/:/g, "");
  const baseId = slugify(name ?? id ?? label ?? "field") || "field";
  const controlId = id ?? `${baseId}-${generatedId}`;
  const controlName = name ?? `${baseId}-${generatedId}`;

  const controlProps = {
    id: controlId,
    name: controlName,
    className: cn(baseInputClasses, error && "border-rose-300 focus:border-rose-400 focus:ring-rose-100", className),
    ...props,
  };

  const control =
    as === "textarea" ? (
      <textarea {...controlProps} className={cn(controlProps.className, "min-h-[120px] resize-y")} />
    ) : as === "select" ? (
      <select {...controlProps}>{children}</select>
    ) : (
      <input {...controlProps} />
    );

  return (
    <label className="flex flex-col gap-2" htmlFor={controlId}>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      {control}
      {error ? <span className="text-xs font-medium text-rose-600">{error}</span> : null}
      {!error && helperText ? <span className="text-xs text-slate-500">{helperText}</span> : null}
    </label>
  );
}

