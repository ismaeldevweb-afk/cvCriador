import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import Panel from "../components/Panel";
import ResumeCard from "../components/ResumeCard";
import AppLayout from "../layouts/AppLayout";
import { activityInsights } from "../services/activityInsights";
import { buildResumeStorageMeta, resumeApi, resumeDraftApi } from "../services/resumeApi";
import { buildResumeInsight } from "../utils/resumeInsights";
import { appRoutes, getEditorRoute, getPreviewRoute } from "../utils/routes";
import { templateOptions } from "../utils/resumeDefaults";

const templateNameMap = Object.fromEntries(templateOptions.map((item) => [item.id, item.name]));

const badgeTones = {
  slate: "bg-slate-100 text-slate-600",
  teal: "bg-brand-50 text-brand-700",
  amber: "bg-amber-50 text-amber-700",
  rose: "bg-rose-50 text-rose-700",
  emerald: "bg-emerald-50 text-emerald-700",
};

const stageToneClassNames = {
  slate: "border-slate-200 bg-slate-100 text-slate-700",
  teal: "border-brand-200 bg-brand-50 text-brand-700",
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  rose: "border-rose-200 bg-rose-50 text-rose-700",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
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

function buildWorkspaceTimeline({ resumes, draftInfo, exportSummary }) {
  const items = [];

  resumes.slice(0, 4).forEach((resume) => {
    const insight = buildResumeInsight(resume);

    items.push({
      id: `resume-${resume.id}`,
      icon: "document",
      tone: insight.stageTone,
      title: resume.title,
      subtitle: `${insight.stage} • ${resume.data.personal?.role || "Sem cargo definido"}`,
      time: resume.updatedAt,
      to: getEditorRoute(resume.id),
    });
  });

  exportSummary.recentExports.forEach((item) => {
    items.push({
      id: `export-${item.id}`,
      icon: "download",
      tone: "teal",
      title: item.fileName,
      subtitle: "PDF exportado no workspace local",
      time: item.exportedAt,
      to: null,
    });
  });

  if (draftInfo?.updatedAt) {
    items.push({
      id: "draft",
      icon: "draft",
      tone: "slate",
      title: "Rascunho local pronto para retomar",
      subtitle: "O editor recupera automaticamente a estrutura atual",
      time: draftInfo.updatedAt,
      to: appRoutes.editorNew,
    });
  }

  return items
    .sort((left, right) => Date.parse(right.time ?? 0) - Date.parse(left.time ?? 0))
    .slice(0, 5);
}

function buildWorkspaceTasks({
  resumes,
  draftInfo,
  exportSummary,
  focusEntry,
  templateUsageCount,
  storageMeta,
}) {
  const items = [];

  if (resumes.length === 0) {
    items.push({
      id: "create-first",
      icon: "spark",
      tone: "teal",
      title: "Criar a primeira versao base",
      description: "Escolha um template e monte a estrutura principal do curriculo.",
      to: appRoutes.templates,
      cta: "Comecar",
    });
  }

  if (draftInfo?.updatedAt && (!focusEntry || focusEntry.kind !== "draft")) {
    items.push({
      id: "draft",
      icon: "draft",
      tone: "slate",
      title: "Retomar rascunho local",
      description: `Edicao salva em ${formatDashboardMoment(draftInfo.updatedAt)}.`,
      to: appRoutes.editorNew,
      cta: "Retomar",
    });
  }

  if (focusEntry?.insight && focusEntry.insight.completionScore < 85) {
    items.push({
      id: "focus-upgrade",
      icon: "target",
      tone: focusEntry.insight.stageTone,
      title: `Elevar ${focusEntry.title}`,
      description: focusEntry.insight.suggestion,
      to: focusEntry.to,
      cta: focusEntry.kind === "draft" ? "Editar" : "Abrir",
    });
  }

  if (focusEntry?.kind === "resume" && exportSummary.totalExports === 0) {
    items.push({
      id: "first-export",
      icon: "download",
      tone: "teal",
      title: "Gerar o primeiro PDF",
      description: "Use o preview final para validar a versao principal antes de compartilhar.",
      to: focusEntry.previewTo,
      cta: "Preview",
    });
  }

  if (resumes.length > 0 && templateUsageCount < 2 && !storageMeta.limitReached) {
    items.push({
      id: "new-template",
      icon: "layers",
      tone: "amber",
      title: "Testar um segundo template",
      description: "Crie uma variacao visual para comparar leitura e posicionamento.",
      to: appRoutes.templates,
      cta: "Explorar",
    });
  }

  if (storageMeta.limitReached) {
    items.push({
      id: "storage-limit",
      icon: "duplicate",
      tone: "rose",
      title: "Liberar espaco no modo local",
      description: `Voce esta usando ${storageMeta.total}/${storageMeta.limit} slots de curriculo.`,
      to: null,
      cta: null,
    });
  }

  return items.slice(0, 4);
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

  if (name === "target") {
    return (
      <svg {...sharedProps}>
        <circle cx="12" cy="12" r="7.25" />
        <circle cx="12" cy="12" r="3.25" />
        <path d="M12 2.75v2.5" />
        <path d="M21.25 12h-2.5" />
        <path d="M12 18.75v2.5" />
        <path d="M5.25 12h-2.5" />
      </svg>
    );
  }

  if (name === "check-circle") {
    return (
      <svg {...sharedProps}>
        <circle cx="12" cy="12" r="8" />
        <path d="m8.75 12.25 2.1 2.1 4.4-4.6" />
      </svg>
    );
  }

  if (name === "arrow-up-right") {
    return (
      <svg {...sharedProps}>
        <path d="M8 16 16 8" />
        <path d="M9 8h7v7" />
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

function ActionCard({ as: Component = Link, icon, subtitle, title, tone = "secondary", className = "", ...props }) {
  const toneClassName =
    tone === "accent"
      ? "border border-brand-200 bg-[linear-gradient(135deg,rgba(15,118,110,0.10),rgba(20,184,166,0.14))] text-ink hover:border-brand-400 hover:shadow-[0_20px_40px_rgba(15,118,110,0.12)]"
      : "border border-slate-200 bg-white/80 text-ink hover:border-slate-400 hover:shadow-[0_20px_35px_rgba(15,23,42,0.08)]";

  return (
    <Component
      className={`flex items-center justify-between gap-4 rounded-[24px] px-4 py-4 transition duration-200 hover:-translate-y-0.5 ${toneClassName} ${className}`}
      {...props}
    >
      <div className="flex items-center gap-3">
        <IconBadge name={icon} tone={tone === "accent" ? "teal" : "slate"} />
        <div className="text-left">
          <p className="text-sm font-semibold text-ink">{title}</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">{subtitle}</p>
        </div>
      </div>
      <Icon className="h-4 w-4 text-slate-500" name="play" />
    </Component>
  );
}

function TaskCard({ item }) {
  const Component = item.to ? Link : "div";
  const componentProps = item.to ? { to: item.to } : {};

  return (
    <Component
      className={`flex items-start justify-between gap-4 rounded-[24px] border p-4 transition duration-200 ${
        item.to ? "hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(15,23,42,0.06)]" : ""
      } ${stageToneClassNames[item.tone] ?? stageToneClassNames.slate}`}
      {...componentProps}
    >
      <div className="flex items-start gap-3">
        <IconBadge name={item.icon} tone={item.tone} />
        <div>
          <p className="text-sm font-semibold text-ink">{item.title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
          {item.cta ? (
            <span className="mt-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
              {item.cta}
              <Icon className="h-3.5 w-3.5" name="arrow-up-right" />
            </span>
          ) : null}
        </div>
      </div>
      {item.to ? <Icon className="mt-1 h-4 w-4 shrink-0 text-slate-500" name="arrow-up-right" /> : null}
    </Component>
  );
}

function TimelineItem({ item }) {
  const Component = item.to ? Link : "div";
  const componentProps = item.to ? { to: item.to } : {};

  return (
    <Component
      className={`flex items-start justify-between gap-4 rounded-[22px] border border-white/90 bg-white/90 px-4 py-4 shadow-[0_12px_24px_rgba(15,23,42,0.04)] ${
        item.to ? "transition duration-200 hover:-translate-y-0.5 hover:border-slate-300" : ""
      }`}
      {...componentProps}
    >
      <div className="flex items-start gap-3">
        <IconBadge name={item.icon} tone={item.tone} />
        <div>
          <p className="text-sm font-semibold text-ink">{item.title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">{item.subtitle}</p>
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{formatDashboardMoment(item.time)}</p>
        </div>
      </div>
      {item.to ? <Icon className="mt-1 h-4 w-4 shrink-0 text-slate-400" name="arrow-up-right" /> : null}
    </Component>
  );
}

export default function DashboardPage() {
  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
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
          setFeedback({
            tone: "error",
            message: error.message,
          });
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

  const resumeSnapshots = useMemo(
    () => resumes.map((resume) => ({ resume, insight: buildResumeInsight(resume) })),
    [resumes],
  );
  const latestResumeSnapshot = resumeSnapshots[0] ?? null;
  const latestResume = latestResumeSnapshot?.resume ?? null;
  const latestResumeInsight = latestResumeSnapshot?.insight ?? null;
  const templateUsageCount = new Set(resumes.map((item) => item.template ?? item.data?.template)).size;
  const mostUsedTemplate = useMemo(() => getMostUsedTemplate(resumes), [resumes]);
  const updatedTodayCount = useMemo(
    () => resumes.filter((item) => new Date(item.updatedAt).toDateString() === new Date().toDateString()).length,
    [resumes],
  );
  const averageCompletion = useMemo(() => {
    if (resumeSnapshots.length === 0) {
      return 0;
    }

    return Math.round(
      resumeSnapshots.reduce((sum, item) => sum + item.insight.completionScore, 0) / resumeSnapshots.length,
    );
  }, [resumeSnapshots]);
  const readyResumeCount = useMemo(
    () => resumeSnapshots.filter((item) => item.insight.completionScore >= 85).length,
    [resumeSnapshots],
  );
  const storageMeta = useMemo(() => buildResumeStorageMeta(resumes), [resumes]);
  const draftInsight = useMemo(() => (draftInfo?.data ? buildResumeInsight(draftInfo.data) : null), [draftInfo]);
  const shouldPrioritizeDraft = useMemo(() => {
    if (!draftInfo?.data) {
      return false;
    }

    const draftTime = Date.parse(draftInfo.updatedAt ?? 0);
    const latestResumeTime = Date.parse(latestResume?.updatedAt ?? 0);
    return !latestResume || draftTime >= latestResumeTime;
  }, [draftInfo, latestResume]);

  const focusEntry = useMemo(() => {
    if (shouldPrioritizeDraft && draftInfo?.data && draftInsight) {
      return {
        kind: "draft",
        title: draftInfo.data.title || "Rascunho local",
        role: draftInfo.data.personal?.role || "Defina um cargo para dar mais contexto visual",
        templateName: templateNameMap[draftInfo.data.template] ?? draftInfo.data.template ?? "Template nao definido",
        updatedAt: draftInfo.updatedAt,
        to: appRoutes.editorNew,
        previewTo: null,
        actionLabel: "Retomar rascunho",
        insight: draftInsight,
      };
    }

    if (latestResume && latestResumeInsight) {
      return {
        kind: "resume",
        title: latestResume.title,
        role: latestResume.data.personal?.role || "Defina um cargo para dar mais contexto visual",
        templateName: templateNameMap[latestResume.template] ?? latestResume.template,
        updatedAt: latestResume.updatedAt,
        to: getEditorRoute(latestResume.id),
        previewTo: getPreviewRoute(latestResume.id),
        actionLabel: "Continuar edicao",
        insight: latestResumeInsight,
      };
    }

    return null;
  }, [draftInfo, draftInsight, latestResume, latestResumeInsight, shouldPrioritizeDraft]);

  const continueTarget = focusEntry ? focusEntry.to : appRoutes.templates;
  const continueLabel = focusEntry ? focusEntry.actionLabel : "Abrir editor";
  const hasDistinctContinueAction = continueTarget !== appRoutes.templates;
  const heroTitle =
    resumes.length === 0
      ? "Monte o primeiro curriculo e ative seu workspace."
      : focusEntry?.kind === "draft"
        ? "Seu rascunho local esta mais vivo do que as versoes salvas."
        : resumes.length === 1
          ? "Sua versao principal pode virar varias adaptacoes."
          : "Seu workspace esta pronto para adaptar curriculos com velocidade.";
  const heroCopy =
    resumes.length === 0
      ? "Escolha um template, preencha a base principal e acompanhe o progresso antes da primeira exportacao."
      : focusEntry?.kind === "draft"
        ? "Retome o rascunho mais recente, consolide a estrutura e salve quando a narrativa estiver redonda."
        : focusEntry?.insight.completionScore >= 85
          ? "Voce ja tem uma base forte. Use o painel para duplicar, personalizar por vaga e exportar com rapidez."
          : "Gerencie versoes, acompanhe a prontidao e saiba qual o proximo ajuste antes de exportar.";
  const storageProgress = storageMeta.limit > 0 ? Math.round((storageMeta.total / storageMeta.limit) * 100) : 0;
  const storageCopy =
    resumes.length === 0
      ? "Nenhum slot ocupado ainda."
      : storageMeta.limitReached
        ? "Limite atingido. Exclua versoes antigas para continuar criando."
        : `${storageMeta.remaining} ${storageMeta.remaining === 1 ? "espaco restante" : "espacos restantes"} para novas versoes.`;

  const metrics = useMemo(
    () => [
      {
        label: "Curriculos salvos",
        value: resumes.length,
        detail:
          resumes.length === 0
            ? "Nenhuma versao criada ainda."
            : `${updatedTodayCount} ${updatedTodayCount === 1 ? "versao atualizada hoje" : "versoes atualizadas hoje"}.`,
        icon: "document",
        kicker: "Base",
        tone: "slate",
      },
      {
        label: "Prontidao media",
        value: `${averageCompletion}%`,
        detail:
          resumes.length === 0
            ? "A leitura de maturidade aparece aqui quando houver curriculos salvos."
            : `${readyResumeCount} ${readyResumeCount === 1 ? "versao pronta para envio" : "versoes prontas para envio"}.`,
        icon: readyResumeCount > 0 ? "check-circle" : "target",
        kicker: "Qualidade",
        tone: readyResumeCount > 0 ? "emerald" : "amber",
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
        label: "PDFs exportados",
        value: exportSummary.totalExports,
        detail: exportSummary.lastExportAt
          ? `Ultimo download em ${formatDashboardMoment(exportSummary.lastExportAt)}.`
          : "Seu historico de PDFs aparece aqui depois da primeira exportacao.",
        icon: "download",
        kicker: "Entrega",
        tone: "teal",
      },
    ],
    [
      averageCompletion,
      exportSummary.lastExportAt,
      exportSummary.totalExports,
      mostUsedTemplate,
      readyResumeCount,
      resumes.length,
      templateUsageCount,
      updatedTodayCount,
    ],
  );

  const workspaceTasks = useMemo(
    () =>
      buildWorkspaceTasks({
        resumes,
        draftInfo,
        exportSummary,
        focusEntry,
        templateUsageCount,
        storageMeta,
      }),
    [draftInfo, exportSummary, focusEntry, resumes, storageMeta, templateUsageCount],
  );

  const workspaceTimeline = useMemo(
    () =>
      buildWorkspaceTimeline({
        resumes,
        draftInfo,
        exportSummary,
      }),
    [draftInfo, exportSummary, resumes],
  );

  async function handleDelete(resumeId) {
    if (!window.confirm("Deseja realmente excluir este curriculo?")) {
      return;
    }

    try {
      await resumeApi.remove(resumeId);
      setResumes((current) => current.filter((item) => item.id !== resumeId));
      setFeedback({
        tone: "success",
        message: "Curriculo excluido com sucesso.",
      });
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error.message,
      });
    }
  }

  async function handleDuplicate(resumeId) {
    try {
      const response = await resumeApi.duplicate(resumeId);
      setResumes((current) => [response.resume, ...current]);
      setFeedback({
        tone: "success",
        message: "Curriculo duplicado com sucesso.",
      });
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error.message,
      });
    }
  }

  return (
    <AppLayout
      footerProps={{ showNavigation: false }}
      subtitle="Retome rascunhos, acompanhe prontidao e transforme versoes em entregas sem perder contexto."
      title="Dashboard"
    >
      <div className="mb-6 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_340px] 2xl:grid-cols-[minmax(0,1.45fr)_380px]">
        <Panel className="overflow-hidden border-white/90 bg-[linear-gradient(145deg,rgba(255,255,255,0.99),rgba(248,250,252,0.92))] p-7 shadow-[0_24px_60px_rgba(15,23,42,0.08)] xl:p-8">
          <div className="grid gap-8 2xl:grid-cols-[minmax(0,1.22fr)_310px]">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-600">Painel vivo</p>
              <h2 className="mt-3 max-w-3xl text-[2.45rem] font-medium leading-[1.05] tracking-[-0.03em] text-slate-900 md:text-[2.85rem]">
                {heroTitle}
              </h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600">{heroCopy}</p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Button as={Link} to={appRoutes.templates} variant="accent">
                  Escolher template
                </Button>
                {hasDistinctContinueAction ? (
                  <Button as={Link} to={continueTarget} variant="secondary">
                    {continueLabel}
                  </Button>
                ) : null}
              </div>

              <div className="mt-7 rounded-[26px] border border-slate-200 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))] p-5 shadow-[0_14px_32px_rgba(15,23,42,0.05)]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600">Capacidade local</p>
                    <p className="mt-2 text-lg font-semibold tracking-tight text-ink">
                      {storageMeta.total}/{storageMeta.limit} versoes utilizadas
                    </p>
                  </div>
                  <span className="rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700">
                    {storageMeta.remaining} livres
                  </span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full rounded-full ${
                      storageMeta.limitReached
                        ? "bg-[linear-gradient(90deg,#e11d48_0%,#fb7185_100%)]"
                        : "bg-[linear-gradient(90deg,#0f766e_0%,#14b8a6_100%)]"
                    }`}
                    style={{ width: `${storageProgress}%` }}
                  />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{storageCopy}</p>
              </div>

              <div className="mt-9 grid gap-4 sm:grid-cols-2">
                {metrics.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[24px] border border-slate-200 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))] p-4 shadow-[0_14px_32px_rgba(15,23,42,0.05)] xl:p-5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <IconBadge name={item.icon} tone={item.tone} />
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700">
                        {item.kicker}
                      </span>
                    </div>
                    <p className="mt-5 text-3xl font-semibold tracking-tight text-ink">{item.value}</p>
                    <h3 className="mt-2 text-sm font-semibold tracking-tight text-slate-800">{item.label}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[30px] border border-slate-900/85 bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.16),transparent_38%),linear-gradient(160deg,#0f172a_0%,#1e293b_44%,#0f766e_100%)] p-6 text-white shadow-[0_28px_60px_rgba(15,23,42,0.24)] xl:p-7">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/78">Radar atual</p>
                <span
                  className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                    focusEntry ? stageToneClassNames[focusEntry.insight.stageTone] : "border-white/12 bg-white/10 text-white/80"
                  }`}
                >
                  {focusEntry ? focusEntry.insight.stage : "Vazio"}
                </span>
              </div>

              <h3 className="mt-4 text-2xl font-semibold tracking-tight">
                {focusEntry?.title || "Nenhum curriculo salvo ainda"}
              </h3>
              <p className="mt-3 text-sm leading-7 text-white/72">
                {focusEntry
                  ? focusEntry.kind === "draft"
                    ? "O rascunho local esta mais recente que qualquer versao salva. Retome daqui para nao perder contexto."
                    : focusEntry.insight.completionScore >= 85
                      ? "A versao principal esta forte. Revise o preview final e gere o PDF quando quiser."
                      : "Ainda existe espaco para lapidar essa versao antes da exportacao final."
                  : "Crie sua primeira versao base para ativar metricas, timeline e atalhos operacionais."}
              </p>

              <div className="mt-6 rounded-[24px] border border-white/12 bg-white/10 px-5 py-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/72">Prontidao</p>
                    <p className="mt-2 text-5xl font-semibold tracking-tight text-white">
                      {focusEntry ? `${focusEntry.insight.completionScore}%` : "0%"}
                    </p>
                  </div>
                  <p className="max-w-[10rem] text-right text-xs leading-5 text-white/68">
                    {focusEntry
                      ? `${focusEntry.insight.completedCheckpointCount}/${focusEntry.insight.totalCheckpointCount} sinais estrategicos concluidos`
                      : "Escolha um template para iniciar o progresso"}
                  </p>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#ccfbf1_0%,#5eead4_100%)]"
                    style={{
                      width: `${
                        focusEntry
                          ? focusEntry.insight.completionScore > 0
                            ? Math.max(focusEntry.insight.completionScore, 10)
                            : 0
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                <div className="rounded-[22px] border border-white/12 bg-white/10 px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/72">Proximo passo</p>
                  <p className="mt-2 text-base font-semibold text-white">
                    {focusEntry ? focusEntry.insight.focusLabel : "Escolher template"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/72">
                    {focusEntry ? focusEntry.insight.suggestion : "A primeira versao libera retomada, preview e duplicacao no painel."}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[22px] border border-white/12 bg-white/10 px-4 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/72">Template</p>
                    <p className="mt-2 text-base font-semibold text-white">{focusEntry?.templateName || "Moderno"}</p>
                  </div>
                  <div className="rounded-[22px] border border-white/12 bg-white/10 px-4 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/72">Contexto</p>
                    <p className="mt-2 text-base font-semibold text-white">{focusEntry?.role || "Defina um cargo para ganhar contexto"}</p>
                  </div>
                </div>

                <div className="rounded-[22px] border border-white/12 bg-white/10 px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/72">Leitura do painel</p>
                  <p className="mt-2 text-base font-semibold text-white">
                    {focusEntry ? focusEntry.insight.primaryStrength : "Sem atividade registrada"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/72">
                    {focusEntry ? `Ultima atividade em ${formatDashboardMoment(focusEntry.updatedAt)}.` : "Assim que voce salvar algo relevante, esse radar passa a mostrar foco e progresso."}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {hasDistinctContinueAction ? (
                  <Button as={Link} className="px-5 py-3" to={continueTarget} variant="secondary">
                    {continueLabel}
                  </Button>
                ) : null}
                {focusEntry?.previewTo ? (
                  <Button
                    as={Link}
                    className="px-5 py-3 text-white hover:bg-white/10 hover:text-white"
                    to={focusEntry.previewTo}
                    variant="ghost"
                  >
                    Preview final
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </Panel>

        <Panel description="Atalhos, proximos passos e atividade recente do workspace local." title="Centro de comando">
          <div className="grid gap-3">
            <ActionCard
              as={Link}
              icon="spark"
              subtitle="Crie uma base nova ou uma versao adaptada por vaga."
              title="Escolher template"
              to={appRoutes.templates}
              tone="accent"
            />
            {hasDistinctContinueAction ? (
              <ActionCard
                as={Link}
                icon={focusEntry?.kind === "draft" ? "draft" : "document"}
                subtitle={
                  focusEntry?.kind === "draft"
                    ? "Recupere o rascunho local mais recente e continue do ponto exato."
                    : "Volte direto para a versao principal mais relevante do momento."
                }
                title={continueLabel}
                to={continueTarget}
              />
            ) : (
              <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/80 px-4 py-4 text-sm leading-6 text-slate-700">
                Escolha um template para liberar retomada, preview e duplicacao direta pelo dashboard.
              </div>
            )}
            {latestResume ? (
              <ActionCard
                as="button"
                icon="duplicate"
                onClick={() => handleDuplicate(latestResume.id)}
                subtitle="Duplique a base atual para outra vaga, senioridade ou contexto."
                title="Duplicar versao base"
                type="button"
              />
            ) : null}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[22px] border border-slate-200 bg-slate-50/85 px-4 py-4">
              <div className="flex items-center gap-3">
                <IconBadge name="draft" tone="slate" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">Rascunho local</p>
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
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-800">Template dominante</p>
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

          <div className="mt-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">Proximos passos</p>
                <p className="mt-1 text-sm font-semibold text-ink">
                  {workspaceTasks.length > 0 ? "Acoes sugeridas pelo estado atual do workspace" : "Sem pendencias prioritarias"}
                </p>
              </div>
              <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                {workspaceTasks.length}
              </span>
            </div>

            <div className="space-y-3">
              {workspaceTasks.length > 0 ? (
                workspaceTasks.map((item) => <TaskCard item={item} key={item.id} />)
              ) : (
                <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/80 px-4 py-4 text-sm leading-6 text-slate-600">
                  O painel nao encontrou bloqueios prioritarios agora. Aproveite para revisar o preview final ou testar um novo template.
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.95),rgba(255,255,255,0.86))] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">Atividade recente</p>
                <p className="mt-1 text-sm font-semibold text-ink">
                  {workspaceTimeline.length > 0 ? "Movimentos mais recentes do workspace" : "Nenhuma atividade registrada"}
                </p>
              </div>
              <IconBadge name="clock" tone="slate" />
            </div>

            <div className="mt-4 space-y-3">
              {workspaceTimeline.length > 0 ? (
                workspaceTimeline.map((item) => <TimelineItem item={item} key={item.id} />)
              ) : (
                <div className="rounded-[18px] border border-dashed border-slate-300 bg-white/70 px-4 py-4 text-sm leading-6 text-slate-500">
                  Assim que voce editar, salvar ou exportar, a timeline passa a mostrar esse historico.
                </div>
              )}
            </div>
          </div>
        </Panel>
      </div>

      {feedback ? (
        <div
          className={`rounded-[24px] border px-5 py-4 text-sm font-medium shadow-soft ${
            feedback.tone === "success"
              ? "border-emerald-200 bg-emerald-50/85 text-emerald-800"
              : "border-rose-200 bg-rose-50/85 text-rose-800"
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      <div className="mt-6">
        {isLoading ? (
          <Panel className="p-8">
            <p className="text-sm text-slate-500">Carregando seus curriculos...</p>
          </Panel>
        ) : resumes.length === 0 ? (
          <Panel
            description="Crie a versao base, acompanhe a prontidao e gere o primeiro PDF em poucos minutos."
            title="Nenhum curriculo salvo ainda"
          >
            <div className="flex flex-wrap gap-3">
              <Button as={Link} to={appRoutes.templates} variant="accent">
                Escolher template
              </Button>
              {draftInfo ? (
                <Button as={Link} to={appRoutes.editorNew} variant="secondary">
                  Retomar rascunho local
                </Button>
              ) : null}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5">
                <IconBadge name="spark" tone="teal" />
                <p className="mt-4 text-sm font-semibold text-ink">1. Escolha o template</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Defina o visual inicial para montar uma base clara e reutilizavel.
                </p>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5">
                <IconBadge name="target" tone="amber" />
                <p className="mt-4 text-sm font-semibold text-ink">2. Preencha o essencial</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Nome, cargo, resumo, experiencia e skills ja ativam a leitura de prontidao.
                </p>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5">
                <IconBadge name="download" tone="emerald" />
                <p className="mt-4 text-sm font-semibold text-ink">3. Revise e exporte</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Use o preview final para validar layout, consistencia e gerar o primeiro PDF.
                </p>
              </div>
            </div>
          </Panel>
        ) : (
          <>
            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-600">Curriculos salvos</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                  {resumes.length === 1 ? "1 versao pronta para adaptar" : `${resumes.length} versoes prontas para edicao rapida`}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {readyResumeCount} {readyResumeCount === 1 ? "versao em ritmo de envio" : "versoes em ritmo de envio"} e {storageMeta.remaining}{" "}
                  {storageMeta.remaining === 1 ? "slot livre" : "slots livres"} no modo local.
                </p>
              </div>
              <div className="rounded-full border border-white/80 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-soft">
                Media de prontidao: {averageCompletion}%
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
