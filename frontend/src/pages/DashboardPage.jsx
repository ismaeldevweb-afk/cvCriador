import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import Panel from "../components/Panel";
import ResumeCard from "../components/ResumeCard";
import AppLayout from "../layouts/AppLayout";
import { activityInsights } from "../services/activityInsights";
import { buildResumeStorageMeta, resumeApi, resumeDraftApi } from "../services/resumeApi";
import { appRoutes, getEditorRoute, getPreviewRoute } from "../utils/routes";
import { templateOptions } from "../utils/resumeDefaults";

const templateNameMap = Object.fromEntries(templateOptions.map((item) => [item.id, item.name]));

const badgeTones = {
  slate: "bg-slate-100 text-slate-600",
  teal: "bg-brand-50 text-brand-700",
  amber: "bg-amber-50 text-amber-700",
  rose: "bg-rose-50 text-rose-700",
};

function formatDashboardMoment(value) {
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

function getMostUsedTemplate(resumes) {
  const counts = resumes.reduce((accumulator, item) => {
    const templateId = item.template ?? item.data?.template;
    if (!templateId) {
      return accumulator;
    }

    accumulator[templateId] = (accumulator[templateId] ?? 0) + 1;
    return accumulator;
  }, {});

  const [templateId, count] = Object.entries(counts).sort((left, right) => right[1] - left[1])[0] ?? [];

  if (!templateId) {
    return null;
  }

  return {
    id: templateId,
    name: templateNameMap[templateId] ?? templateId,
    count,
  };
}

function Icon({ name, className = "h-5 w-5" }) {
  const sharedProps = {
    className,
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: "1.8",
    viewBox: "0 0 24 24",
  };

  if (name === "document") {
    return (
      <svg {...sharedProps}>
        <path d="M7.75 3.75h6.5l4 4v12.5a1 1 0 0 1-1 1H7.75a1 1 0 0 1-1-1V4.75a1 1 0 0 1 1-1Z" />
        <path d="M14.25 3.75v4h4" />
        <path d="M9.5 12h5" />
        <path d="M9.5 15.5h5" />
      </svg>
    );
  }

  if (name === "download") {
    return (
      <svg {...sharedProps}>
        <path d="M12 4.5v9" />
        <path d="m8.5 10.5 3.5 3.5 3.5-3.5" />
        <path d="M5 18.5h14" />
      </svg>
    );
  }

  if (name === "layers") {
    return (
      <svg {...sharedProps}>
        <path d="m12 4.75 7 4-7 4-7-4 7-4Z" />
        <path d="m5 12.5 7 4 7-4" />
        <path d="m5 16.25 7 4 7-4" />
      </svg>
    );
  }

  if (name === "clock") {
    return (
      <svg {...sharedProps}>
        <circle cx="12" cy="12" r="7.25" />
        <path d="M12 8.25v4.25l2.75 1.75" />
      </svg>
    );
  }

  if (name === "spark") {
    return (
      <svg {...sharedProps}>
        <path d="m12 4.5 1.25 3.75L17 9.5l-3.75 1.25L12 14.5l-1.25-3.75L7 9.5l3.75-1.25L12 4.5Z" />
        <path d="m18.5 15.5.65 1.95 1.95.65-1.95.65-.65 1.95-.65-1.95-1.95-.65 1.95-.65.65-1.95Z" />
      </svg>
    );
  }

  if (name === "draft") {
    return (
      <svg {...sharedProps}>
        <path d="M6.75 6.75h10.5v10.5H6.75z" />
        <path d="M9.5 9.5h5" />
        <path d="M9.5 12h5" />
        <path d="M9.5 14.5h3.5" />
      </svg>
    );
  }

  if (name === "play") {
    return (
      <svg {...sharedProps}>
        <path d="m9 7.5 7 4.5-7 4.5Z" />
      </svg>
    );
  }

  if (name === "duplicate") {
    return (
      <svg {...sharedProps}>
        <rect x="8.5" y="8.5" width="9.75" height="9.75" rx="1.5" />
        <path d="M6 15.5H5.5A1.75 1.75 0 0 1 3.75 13.75V5.5A1.75 1.75 0 0 1 5.5 3.75h8.25A1.75 1.75 0 0 1 15.5 5.5V6" />
      </svg>
    );
  }

  return (
    <svg {...sharedProps}>
      <path d="M6 12h12" />
      <path d="M12 6v12" />
    </svg>
  );
}

function IconBadge({ name, tone = "slate" }) {
  return (
    <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${badgeTones[tone] ?? badgeTones.slate}`}>
      <Icon className="h-5 w-5" name={name} />
    </span>
  );
}

function ActionCard({ as: Component = Link, icon, subtitle, title, tone = "secondary", ...props }) {
  const toneClassName =
    tone === "accent"
      ? "border border-brand-200 bg-[linear-gradient(135deg,rgba(15,118,110,0.10),rgba(20,184,166,0.14))] text-ink hover:border-brand-400 hover:shadow-[0_20px_40px_rgba(15,118,110,0.12)]"
      : "border border-slate-200 bg-white/80 text-ink hover:border-slate-400 hover:shadow-[0_20px_35px_rgba(15,23,42,0.08)]";

  return (
    <Component
      className={`flex items-center justify-between gap-4 rounded-[24px] px-4 py-4 transition duration-200 hover:-translate-y-0.5 ${toneClassName}`}
      {...props}
    >
      <div className="flex items-center gap-3">
        <IconBadge name={icon} tone={tone === "accent" ? "teal" : "slate"} />
        <div className="text-left">
          <p className="text-sm font-semibold text-ink">{title}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">{subtitle}</p>
        </div>
      </div>
      <Icon className="h-4 w-4 text-slate-400" name="play" />
    </Component>
  );
}

export default function DashboardPage() {
  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [draftInfo, setDraftInfo] = useState(() => resumeDraftApi.get());
  const [exportSummary, setExportSummary] = useState(() => activityInsights.getPdfExportSummary());

  useEffect(() => {
    let active = true;

    setDraftInfo(resumeDraftApi.get());
    setExportSummary(activityInsights.getPdfExportSummary());

    resumeApi
      .list()
      .then((response) => {
        if (!active) {
          return;
        }

        setResumes(response.resumes);
      })
      .catch((error) => {
        if (active) {
          setFeedback(error.message);
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const latestResume = resumes[0];
  const templateUsageCount = new Set(resumes.map((item) => item.template)).size;
  const mostUsedTemplate = useMemo(() => getMostUsedTemplate(resumes), [resumes]);
  const updatedTodayCount = useMemo(
    () => resumes.filter((item) => new Date(item.updatedAt).toDateString() === new Date().toDateString()).length,
    [resumes],
  );
  const heroTitle =
    resumes.length === 0
      ? "Comece seu primeiro curriculo agora."
      : resumes.length === 1
        ? "Sua base principal ja esta pronta."
        : "Seu painel esta vivo e pronto para novas versoes.";
  const heroCopy =
    resumes.length === 0
      ? "Crie a primeira versao, escolha um template e gere seu primeiro PDF sem sair do navegador."
      : "Gerencie versoes, adapte por vaga e exporte em PDF com rapidez.";
  const continueTarget = latestResume ? getEditorRoute(latestResume.id) : draftInfo ? appRoutes.editorNew : appRoutes.templates;
  const continueLabel = latestResume ? "Continuar ultima edicao" : draftInfo ? "Retomar rascunho local" : "Abrir editor";
  const focusTemplateName = latestResume ? templateNameMap[latestResume.template] ?? latestResume.template : "Moderno";
  const latestRole = latestResume?.data.personal?.role || "Defina um cargo para dar mais contexto visual";
  const storageMeta = useMemo(() => buildResumeStorageMeta(resumes), [resumes]);

  const metrics = useMemo(
    () => [
      {
        label: "Curriculos salvos",
        value: resumes.length,
        detail:
          resumes.length === 0
            ? "Nenhuma versao criada ainda."
            : resumes.length === 1
              ? "1 versao base pronta para adaptar."
              : `${resumes.length} versoes salvas neste navegador.`,
        icon: "document",
        kicker: "Base",
        tone: "slate",
      },
      {
        label: "PDFs exportados",
        value: exportSummary.totalExports,
        detail: exportSummary.lastExportAt
          ? `Ultimo download em ${formatDashboardMoment(exportSummary.lastExportAt)}.`
          : "Seu historico de PDFs aparece aqui depois da primeira exportacao.",
        icon: "download",
        kicker: "Entrega",
        tone: "teal",
      },
      {
        label: "Templates usados",
        value: templateUsageCount,
        detail: mostUsedTemplate
          ? `${mostUsedTemplate.name} lidera em ${mostUsedTemplate.count} ${mostUsedTemplate.count === 1 ? "versao" : "versoes"}.`
          : "Escolha o primeiro template para ativar esse radar.",
        icon: "layers",
        kicker: "Visual",
        tone: "amber",
      },
      {
        label: "Atualizados hoje",
        value: updatedTodayCount,
        detail: latestResume
          ? `Ultima edicao em ${formatDashboardMoment(latestResume.updatedAt)}.`
          : "Sem atividade recente registrada.",
        icon: "clock",
        kicker: "Ritmo",
        tone: "rose",
      },
    ],
    [exportSummary.lastExportAt, exportSummary.totalExports, latestResume, mostUsedTemplate, resumes.length, templateUsageCount, updatedTodayCount],
  );

  async function handleDelete(resumeId) {
    if (!window.confirm("Deseja realmente excluir este curriculo?")) {
      return;
    }

    try {
      await resumeApi.remove(resumeId);
      setResumes((current) => current.filter((item) => item.id !== resumeId));
      setFeedback("Curriculo excluido com sucesso.");
    } catch (error) {
      setFeedback(error.message);
    }
  }

  async function handleDuplicate(resumeId) {
    try {
      const response = await resumeApi.duplicate(resumeId);
      setResumes((current) => [response.resume, ...current]);
      setFeedback("Curriculo duplicado com sucesso.");
    } catch (error) {
      setFeedback(error.message);
    }
  }

  return (
    <AppLayout
      actions={
        <Button as={Link} to={appRoutes.templates} variant="primary">
          Escolher template
        </Button>
      }
      subtitle="Gerencie versoes, adapte por vaga e exporte em PDF com rapidez."
      title="Dashboard"
    >
      <div className="mb-6 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_300px] 2xl:grid-cols-[minmax(0,1.38fr)_340px]">
        <Panel className="overflow-hidden border-white/90 bg-[linear-gradient(145deg,rgba(255,255,255,0.99),rgba(248,250,252,0.92))] p-7 shadow-[0_24px_60px_rgba(15,23,42,0.08)] xl:p-8">
          <div className="grid gap-8 2xl:grid-cols-[minmax(0,1.28fr)_280px]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Painel vivo</p>
              <h2 className="mt-3 max-w-xl text-[2.45rem] font-medium leading-[1.08] tracking-[-0.03em] text-slate-900 md:text-[2.8rem]">
                {heroTitle}
              </h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600">{heroCopy}</p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Button as={Link} to={appRoutes.templates} variant="accent">
                  Escolher template
                </Button>
                <Button as={Link} to={continueTarget} variant="secondary">
                  {continueLabel}
                </Button>
              </div>

              {storageMeta.limitReached ? (
                <div className="mt-7 rounded-[24px] border border-amber-200 bg-[linear-gradient(145deg,rgba(255,251,235,0.96),rgba(254,243,199,0.78))] p-4 shadow-[0_16px_35px_rgba(217,119,6,0.10)]">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-700/75">Modo local cheio</p>
                      <p className="mt-2 text-sm font-semibold text-amber-950">
                        Voce atingiu o limite de curriculos salvos neste modo local.
                      </p>
                      <p className="mt-2 text-sm leading-6 text-amber-900/80">
                        Exclua versoes antigas para abrir espaco para novas criacoes sem perder a leveza do MVP.
                      </p>
                    </div>
                    <span className="rounded-full border border-amber-200 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-800">
                      {storageMeta.total}/{storageMeta.limit} versoes
                    </span>
                  </div>
                </div>
              ) : null}

              <div className="mt-9 grid gap-4 sm:grid-cols-2">
                {metrics.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[24px] border border-slate-200 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))] p-4 shadow-[0_14px_32px_rgba(15,23,42,0.05)] xl:p-5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <IconBadge name={item.icon} tone={item.tone} />
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {item.kicker}
                      </span>
                    </div>
                    <p className="mt-5 text-3xl font-semibold tracking-tight text-ink">{item.value}</p>
                    <p className="mt-2 text-[11px] font-semibold uppercase leading-5 tracking-[0.14em] text-slate-400">{item.label}</p>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[30px] border border-slate-900/85 bg-[linear-gradient(160deg,#0f172a_0%,#1e293b_44%,#0f766e_100%)] p-6 text-white shadow-[0_28px_60px_rgba(15,23,42,0.24)] xl:p-7">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/55">Foco atual</p>
                <span className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/74">
                  {latestResume ? "Ativo" : "Vazio"}
                </span>
              </div>

              <h3 className="mt-4 text-2xl font-semibold tracking-tight">
                {latestResume?.title || "Nenhum curriculo salvo ainda"}
              </h3>
              <p className="mt-3 text-sm leading-7 text-white/72">
                {latestResume
                  ? "Continue refinando a versao principal, duplique para novas vagas e exporte quando estiver pronto."
                  : "Crie sua primeira versao base para preencher o painel com atividade, templates e PDFs recentes."}
              </p>

              <div className="mt-6 grid gap-3">
                <div className="rounded-[22px] border border-white/12 bg-white/10 px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/48">Template atual</p>
                  <p className="mt-2 text-base font-semibold text-white">{focusTemplateName}</p>
                </div>
                <div className="rounded-[22px] border border-white/12 bg-white/10 px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/48">Contexto</p>
                  <p className="mt-2 text-base font-semibold text-white">{latestRole}</p>
                </div>
                <div className="rounded-[22px] border border-white/12 bg-white/10 px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/48">Ultima atividade</p>
                  <p className="mt-2 text-base font-semibold text-white">
                    {latestResume ? formatDashboardMoment(latestResume.updatedAt) : "Sem atividade"}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button as={Link} className="px-5 py-3" to={continueTarget} variant="secondary">
                  {latestResume ? "Continuar edicao" : "Escolher template"}
                </Button>
                {latestResume ? (
                  <Button as={Link} className="px-5 py-3 text-white hover:bg-white/10 hover:text-white" to={getPreviewRoute(latestResume.id)} variant="ghost">
                    Preview final
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </Panel>

        <Panel description="Atalhos operacionais, template dominante e historico recente." title="Acoes rapidas">
          <div className="grid gap-3">
            <ActionCard
              as={Link}
              icon="spark"
              subtitle="Crie uma nova base ou uma versao adaptada."
              title="Escolher template"
              to={appRoutes.templates}
              tone="accent"
            />
            <ActionCard
              as={Link}
              icon="document"
              subtitle={latestResume ? "Volte direto para a ultima versao atualizada." : "Abra o editor e recupere o rascunho local automaticamente."}
              title={continueLabel}
              to={continueTarget}
            />
            {latestResume ? (
              <ActionCard
                as="button"
                icon="duplicate"
                onClick={() => handleDuplicate(latestResume.id)}
                subtitle="Duplique a base atual para uma nova vaga ou contexto."
                title="Duplicar versao base"
                type="button"
              />
            ) : (
              <ActionCard
                as={Link}
                icon="layers"
                subtitle="Volte para a home e defina o template da nova versao."
                title="Escolher template"
                to={appRoutes.templates}
              />
            )}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[22px] border border-slate-200 bg-slate-50/85 px-4 py-4">
              <div className="flex items-center gap-3">
                <IconBadge name="draft" tone="slate" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Rascunho local</p>
                  <p className="mt-1 text-sm font-semibold text-ink">{draftInfo ? "Pronto para retomar" : "Nenhum rascunho ativo"}</p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {draftInfo?.updatedAt ? `Atualizado em ${formatDashboardMoment(draftInfo.updatedAt)}.` : "Os rascunhos aparecem aqui depois da primeira edicao."}
              </p>
            </div>

            <div className="rounded-[22px] border border-amber-100 bg-amber-50/80 px-4 py-4">
              <div className="flex items-center gap-3">
                <IconBadge name="layers" tone="amber" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-700/70">Template dominante</p>
                  <p className="mt-1 text-sm font-semibold text-amber-900">
                    {mostUsedTemplate ? mostUsedTemplate.name : "Sem historico ainda"}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-amber-900/80">
                {mostUsedTemplate
                  ? `Usado em ${mostUsedTemplate.count} ${mostUsedTemplate.count === 1 ? "curriculo" : "curriculos"}.`
                  : "Crie mais versoes para descobrir o estilo que mais se repete."}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.95),rgba(255,255,255,0.86))] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Ultimos PDFs</p>
                <p className="mt-1 text-sm font-semibold text-ink">
                  {exportSummary.totalExports > 0 ? `${exportSummary.totalExports} exportacoes registradas` : "Nenhuma exportacao ainda"}
                </p>
              </div>
              <IconBadge name="download" tone="teal" />
            </div>

            <div className="mt-4 space-y-3">
              {exportSummary.recentExports.length > 0 ? (
                exportSummary.recentExports.map((item) => (
                  <div key={item.id} className="rounded-[18px] border border-white/90 bg-white/90 px-4 py-3 shadow-[0_12px_24px_rgba(15,23,42,0.04)]">
                    <p className="truncate text-sm font-semibold text-ink">{item.fileName}</p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      {formatDashboardMoment(item.exportedAt)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-[18px] border border-dashed border-slate-300 bg-white/70 px-4 py-4 text-sm leading-6 text-slate-500">
                  Gere o primeiro PDF para alimentar esse historico e acompanhar suas entregas recentes.
                </div>
              )}
            </div>
          </div>
        </Panel>
      </div>

      {feedback ? (
        <div className="rounded-[24px] border border-slate-200 bg-white/80 px-5 py-4 text-sm font-medium text-slate-600 shadow-soft">
          {feedback}
        </div>
      ) : null}

      <div className="mt-6">
        {isLoading ? (
          <Panel className="p-8">
            <p className="text-sm text-slate-500">Carregando seus curriculos...</p>
          </Panel>
        ) : resumes.length === 0 ? (
          <Panel
            action={
              <Button as={Link} to={appRoutes.templates} variant="accent">
                Escolher template
              </Button>
            }
            description="Crie a versao base, ajuste o template e gere seu primeiro PDF em poucos minutos."
            title="Nenhum curriculo salvo ainda"
          />
        ) : (
          <>
            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Curriculos salvos</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                  {resumes.length === 1 ? "1 versao pronta para adaptar" : `${resumes.length} versoes prontas para edicao rapida`}
                </h2>
              </div>
              <div className="rounded-full border border-white/80 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-500 shadow-soft">
                {exportSummary.totalExports} {exportSummary.totalExports === 1 ? "PDF recente" : "PDFs recentes"}
              </div>
            </div>

            <div className="grid auto-rows-fr gap-6 md:grid-cols-2 2xl:grid-cols-3">
              {resumes.map((resume) => (
                <ResumeCard key={resume.id} onDelete={handleDelete} onDuplicate={handleDuplicate} resume={resume} />
              ))}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
