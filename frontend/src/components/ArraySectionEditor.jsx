import Button from "./Button";
import Field from "./Field";

export default function ArraySectionEditor({
  title,
  description,
  items,
  fields,
  addLabel,
  onAdd,
  onChange,
  onRemove,
}) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-ink">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        </div>
        <Button onClick={onAdd} variant="secondary">
          {addLabel}
        </Button>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={item.id} className="rounded-[24px] border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Item {String(index + 1).padStart(2, "0")}
              </span>
              <button className="text-sm font-semibold text-rose-600" onClick={() => onRemove(item.id)} type="button">
                Remover
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {fields.map((field) => (
                <div key={field.name} className={field.wide ? "md:col-span-2" : ""}>
                  <Field
                    as={field.type === "textarea" ? "textarea" : "input"}
                    autoComplete={field.autoComplete}
                    label={field.label}
                    name={`${field.name}-${item.id}`}
                    onChange={(event) => onChange(item.id, field.name, event.target.value)}
                    placeholder={field.placeholder}
                    type={field.type === "textarea" ? undefined : field.type ?? "text"}
                    value={item[field.name]}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

