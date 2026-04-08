import { Link } from "react-router-dom";
import Button from "./Button";
import Panel from "./Panel";
import { templateOptions } from "../utils/resumeDefaults";
import { buildResumeInsight } from "../utils/resumeInsights";
import { getEditorRoute, getPreviewRoute } from "../utils/routes";

const templateNameMap = Object.fromEntries(templateOptions.map((item) => [item.id, item.name]));

const stageToneClassNames = {
  slate: "border-slate-200 bg-slate-100 text-slate-700",
  teal: "border-brand-200 bg-brand-50 text-brand-700",
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rose: "border-rose-200 bg-rose-50 text-rose-700",
};

const progressToneClassNames = {
  slate: "bg-[linear-gradient(90deg,#cbd5e1_0%,#94a3b8_100%)]",
  teal: "bg-[linear-gradient(90deg,#0f766e_0%,#14b8a6_100%)]",
  amber: "bg-[linear-gradient(90deg,#f59e0b_0%,#fbbf24_100%)]",
  emerald: "bg-[linear-gradient(90deg,#059669_0%,#34d399_100%)]",
  rose: "bg-[linear-gradient(90deg,#e11d48_0%,#fb7185_100%)]",
};

function formatCardMoment(value) {
  if (!value) {
    return "Sem registro";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function ResumeCard({ resume, onDuplicate, onDelete }) {
  const insight = buildResumeInsight(resume);
  const templateName = templateNameMap[resume.template] ?? resume.template;
  const fullName = resume.data.personal?.fullName || "Curriculo sem nome";
  const role = resume.data.personal?.role || "Sem cargo definido";
  const summary =
    resume.data.summary ||
    resume.data.personal?.objective ||
    "Adicione resumo, objetivo ou experiencias para fortalecer a narrativa antes do envio.";
  const progressWidth = insight.completionScore > 0 ? Math.max(insight.completionScore, 10) : 0;

  return (
    <Panel
      className="h-full min-h-[29rem] transition duration-200 hover:-translate-y-1 hover:shadow-float"
      description={`Atualizado em ${formatCardMoment(resume.updatedAt)}`}
      title={resume.title}
      action={
        <div className="flex max-w-full flex-wrap justify-end gap-2">
          <span
            className={`inline-flex max-w-full items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
              stageToneClassNames[insight.stageTone] ?? stageToneClassNames.slate
            }`}
          >
            {insight.stage}
          </span>
          <span className="inline-flex max-w-full items-center rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700">
            {templateName}
          </span>
        </div>
      }
    >
      <div className="flex h-full flex-col gap-5">
        <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">Prontidao</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-ink">{insight.completionScore}%</p>
            </div>
            <div className="max-w-[10rem] text-right">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">Proximo passo</p>
              <p className="mt-2 text-sm font-semibold leading-5 text-slate-800">{insight.focusLabel}</p>
            </div>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className={`h-full rounded-full ${progressToneClassNames[insight.stageTone] ?? progressToneClassNames.slate}`}
              style={{ width: `${progressWidth}%` }}
            />
          </div>

          <p className="mt-4 text-sm leading-6 text-slate-600">{insight.suggestion}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">Perfil</p>
            <p className="mt-2 text-sm font-semibold text-ink">{fullName}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{role}</p>
          </div>
          <div className="rounded-[20px] border border-brand-100 bg-brand-50/70 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-900">Cobertura</p>
            <p className="mt-2 text-sm font-semibold text-brand-900">{insight.counts.filledSections}/8 blocos ativos</p>
            <p className="mt-2 text-sm leading-6 text-brand-800">
              {insight.counts.skills} skills • {insight.counts.experience} experiencias • {insight.counts.projects} projetos
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-hidden rounded-[24px] border border-slate-200 bg-[linear-gradient(145deg,#ffffff_0%,#f8fafc_100%)] p-4 text-sm text-slate-600">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">Leitura rapida</p>
              <p className="mt-2 font-semibold text-ink">{insight.primaryStrength}</p>
            </div>
            <span className="inline-flex max-w-[9rem] items-center rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700">
              {role}
            </span>
          </div>
          <p className="mt-3 min-h-[4.5rem] leading-6 text-slate-600">{summary}</p>
        </div>

        <div className="mt-auto grid gap-3 sm:grid-cols-2">
          <Button as={Link} className="w-full" to={getEditorRoute(resume.id)} variant="primary">
            Editar
          </Button>
          <Button as={Link} className="w-full" to={getPreviewRoute(resume.id)} variant="secondary">
            Visualizar
          </Button>
          <Button className="w-full" onClick={() => onDuplicate(resume.id)} variant="secondary">
            Duplicar
          </Button>
          <Button className="w-full" onClick={() => onDelete(resume.id)} variant="ghost">
            Excluir
          </Button>
        </div>
      </div>
    </Panel>
  );
}
