import Button from "./Button";
import Field from "./Field";

export default function SkillsEditor({ skills, onAdd, onChange, onRemove }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-ink">Habilidades</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Liste as competencias que reforcam sua proposta profissional.
          </p>
        </div>
        <Button className="w-full sm:w-auto" onClick={onAdd} variant="secondary">
          Adicionar skill
        </Button>
      </div>

      <div className="grid gap-4">
        {skills.map((skill, index) => (
          <div key={`${skill}-${index}`} className="flex flex-col gap-3 rounded-[24px] border border-slate-200 bg-white p-4 sm:flex-row sm:items-end sm:p-5">
            <div className="flex-1">
              <Field
                label={`Skill ${String(index + 1).padStart(2, "0")}`}
                name={`skill-${index}`}
                onChange={(event) => onChange(index, event.target.value)}
                placeholder="Ex.: Comunicacao, React, Atendimento ao cliente"
                value={skill}
              />
            </div>
            <button className="self-start rounded-full px-4 py-3 text-sm font-semibold text-rose-600 sm:self-auto" onClick={() => onRemove(index)} type="button">
              Remover
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
