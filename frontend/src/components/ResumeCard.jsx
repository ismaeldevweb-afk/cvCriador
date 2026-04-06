import { Link } from "react-router-dom";
import Button from "./Button";
import Panel from "./Panel";
import { getEditorRoute, getPreviewRoute } from "../utils/routes";

export default function ResumeCard({ resume, onDuplicate, onDelete }) {
  const totalSections =
    (resume.data.experience?.filter((item) => item.role || item.company).length ?? 0) +
    (resume.data.education?.filter((item) => item.course || item.institution).length ?? 0) +
    (resume.data.projects?.filter((item) => item.name).length ?? 0);
  const skillCount = (resume.data.skills ?? []).filter(Boolean).length;

  return (
    <Panel
      className="h-full min-h-[26rem] transition duration-200 hover:-translate-y-1 hover:shadow-float"
      description={`Template ${resume.template} • atualizado em ${new Date(resume.updatedAt).toLocaleDateString("pt-BR")}`}
      title={resume.title}
      action={
        <span className="inline-flex max-w-full items-center rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          {resume.data.personal?.role || "Sem cargo"}
        </span>
      }
    >
      <div className="flex h-full flex-col gap-5">
        <div className="flex-1 overflow-hidden rounded-[24px] border border-slate-200 bg-[linear-gradient(145deg,#ffffff_0%,#f8fafc_100%)] p-4 text-sm text-slate-600">
          <div className="mb-4 flex items-center justify-between">
            <div className="h-2 w-24 rounded-full bg-slate-900" />
            <div className="h-8 w-8 rounded-full bg-brand-50" />
          </div>
          <p className="font-semibold text-ink">{resume.data.personal?.fullName || "Curriculo sem nome"}</p>
          <p className="mt-2 h-[7.5rem] overflow-hidden leading-6 text-slate-600">
            {resume.data.summary || resume.data.personal?.objective || "Adicione resumo, objetivo e experiencia para fortalecer a apresentacao."}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Conteudo</p>
            <p className="mt-2 text-sm font-semibold text-ink">{totalSections} blocos preenchidos</p>
          </div>
          <div className="rounded-[20px] border border-brand-100 bg-brand-50/70 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-600/70">Competencias</p>
            <p className="mt-2 text-sm font-semibold text-brand-700">{skillCount} skills cadastradas</p>
          </div>
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
