import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import AiAssistantPanel from "../components/AiAssistantPanel";
import ArraySectionEditor from "../components/ArraySectionEditor";
import Button from "../components/Button";
import CustomizationPanel from "../components/CustomizationPanel";
import Field from "../components/Field";
import Panel from "../components/Panel";
import ProfileImportPanel from "../components/ProfileImportPanel";
import SkillsEditor from "../components/SkillsEditor";
import { useResumeEditor } from "../hooks/useResumeEditor";
import AppLayout from "../layouts/AppLayout";
import { aiApi } from "../services/aiApi";
import { resumeApi, resumeDraftApi } from "../services/resumeApi";
import { applyImportPreviewToResume } from "../utils/profileImport";
import { buildResumeInsight } from "../utils/resumeInsights";
import { appRoutes, getEditorRoute, getPreviewRoute } from "../utils/routes";
import {
  colorOptions,
  createEmptyResume,
  editorSteps,
  fontOptions,
  hasMeaningfulResumeContent,
  spacingOptions,
  templateOptions,
  titleScaleOptions,
} from "../utils/resumeDefaults";
import { cn } from "../utils/cn";
import { isEmailValid, validateResume } from "../utils/validators";

const experienceFields = [
  { name: "company", label: "Empresa", placeholder: "Ex.: Studio Atlas" },
  { name: "role", label: "Cargo", placeholder: "Ex.: Product Designer" },
  { name: "period", label: "Periodo", placeholder: "Ex.: 2022 - Atual" },
  {
    name: "description",
    label: "Descricao",
    placeholder: "Explique escopo, entregas e resultados.",
    type: "textarea",
    wide: true,
  },
];

const educationFields = [
  { name: "institution", label: "Instituicao", placeholder: "Ex.: Universidade Federal" },
  { name: "course", label: "Curso", placeholder: "Ex.: Sistemas de Informacao" },
  { name: "period", label: "Periodo", placeholder: "Ex.: 2019 - 2023" },
];

const languageFields = [
  { name: "name", label: "Idioma", placeholder: "Ex.: Ingles" },
  { name: "level", label: "Nivel", placeholder: "Ex.: Avancado" },
];

const certificationFields = [
  { name: "name", label: "Certificacao", placeholder: "Ex.: Google UX Design" },
  { name: "issuer", label: "Emissor", placeholder: "Ex.: Coursera" },
  { name: "year", label: "Ano", placeholder: "Ex.: 2024" },
];

const projectFields = [
  { name: "name", label: "Nome do projeto", placeholder: "Ex.: Portfolio OS" },
  {
    name: "description",
    label: "Descricao",
    placeholder: "Descreva o problema, a solucao e o impacto.",
    type: "textarea",
    wide: true,
  },
  { name: "technologies", label: "Tecnologias", placeholder: "Ex.: React, Node.js, Tailwind CSS" },
  { name: "link", label: "Link", placeholder: "Ex.: portfolio.dev" },
];
const AUTO_SAVE_DELAY_MS = 800;
const DEFAULT_EDITOR_FEEDBACK = "Preencha os campos e acompanhe o curriculo em tempo real.";

const stepGuides = [
  {
    label: editorSteps[0],
    description: "Defina identidade, contato e narrativa principal para o documento.",
    readyLabel: "Base principal pronta",
    successTip: "A base principal esta consistente. Revise texto e alinhamento com a vaga alvo.",
  },
  {
    label: editorSteps[1],
    description: "Mostre historico profissional e formacao com contexto claro.",
    readyLabel: "Trajetoria registrada",
    successTip: "A trajetoria principal esta montada. Revise impacto e clareza de cada bloco.",
  },
  {
    label: editorSteps[2],
    description: "Reforce repertorio tecnico, idiomas e credenciais.",
    readyLabel: "Competencias bem cobertas",
    successTip: "As competencias principais ja sustentam o posicionamento do curriculo.",
  },
  {
    label: editorSteps[3],
    description: "Use projetos e detalhes finais para provar execucao e fechar a narrativa.",
    readyLabel: "Fechamento bem resolvido",
    successTip: "Os blocos finais estao fortes. Revise o preview e prepare a exportacao.",
  },
];

const toneBadgeClasses = {
  slate: "bg-slate-100 text-slate-700",
  teal: "bg-brand-50 text-brand-700",
  amber: "bg-amber-50 text-amber-700",
  rose: "bg-rose-50 text-rose-700",
  emerald: "bg-emerald-50 text-emerald-700",
};

const issueLabelMap = {
  title: "Titulo interno",
  fullName: "Nome completo",
  role: "Cargo principal",
  email: "Email de contato",
};

function hasText(value) {
  return String(value ?? "").trim().length > 0;
}

function buildResumePayload(resume) {
  const normalizedTitle = String(resume.title ?? "").trim();
  const normalizedFullName = String(resume.personal?.fullName ?? "").trim();
  const safeTitle = normalizedTitle || (normalizedFullName ? `Curriculo ${normalizedFullName}` : "Meu curriculo");

  return {
    title: safeTitle,
    template: resume.template,
    data: {
      ...resume,
      title: safeTitle,
    },
  };
}

function formatSavedAt(value) {
  if (!value) {
    return "agora";
  }

  return new Date(value).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getProgressTone(score) {
  if (score >= 85) {
    return "emerald";
  }

  if (score >= 60) {
    return "teal";
  }

  if (score >= 35) {
    return "amber";
  }

  return "slate";
}

function buildEditorStepMeta({ resume, insight }) {
  const validEmail = hasText(resume.personal.email) && isEmailValid(resume.personal.email);
  const summaryReady = hasText(resume.summary) || hasText(resume.personal.objective);
  const additionalInfoReady = hasText(resume.additionalInfo);
  const proofCount = insight.counts.projects + insight.counts.certifications;

  const checklists = [
    [
      { done: hasText(resume.title), tip: "Defina um titulo interno para organizar melhor suas versoes." },
      { done: hasText(resume.personal.fullName), tip: "Preencha o nome completo para posicionar o documento." },
      { done: hasText(resume.personal.role), tip: "Defina cargo ou objetivo principal para dar contexto imediato." },
      { done: validEmail, tip: "Adicione um email valido para liberar a exportacao sem pendencias." },
      { done: insight.counts.contacts >= 2, tip: "Inclua pelo menos dois canais de contato para facilitar o retorno." },
      { done: summaryReady, tip: "Escreva resumo ou objetivo para fortalecer a narrativa logo no inicio." },
    ],
    [
      { done: insight.counts.experience > 0, tip: "Inclua ao menos uma experiencia com cargo, empresa e entregas." },
      { done: insight.counts.education > 0, tip: "Adicione a formacao principal para fechar a base academica." },
      { done: insight.counts.experience >= 2 || hasText(resume.experience[0]?.description), tip: "Aprofunde impacto e escopo nas experiencias mais relevantes." },
    ],
    [
      { done: insight.counts.skills >= 3, tip: "Liste ao menos 3 skills diretamente ligadas a vaga." },
      { done: insight.counts.languages > 0 || insight.counts.certifications > 0, tip: "Idiomas ou certificacoes ajudam a reforcar repertorio." },
      {
        done: insight.counts.skills >= 6 || insight.counts.certifications > 0,
        tip: "Amplie a cobertura tecnica para sustentar o posicionamento profissional.",
      },
    ],
    [
      { done: insight.counts.projects > 0, tip: "Adicione ao menos um projeto ou case com impacto real." },
      { done: proofCount > 1 || additionalInfoReady, tip: "Use informacoes finais para fechar a narrativa com contexto extra." },
      {
        done: insight.counts.projects > 0 && (additionalInfoReady || hasText(resume.personal.portfolio) || hasText(resume.personal.github)),
        tip: "Conecte projeto e portfolio para facilitar validacao externa do trabalho.",
      },
    ],
  ];

  return stepGuides.map((guide, index) => {
    const checklist = checklists[index];
    const completedCount = checklist.filter((item) => item.done).length;
    const totalCount = checklist.length;
    const completionScore = Math.round((completedCount / totalCount) * 100);
    const remainingItems = checklist.filter((item) => !item.done);

    const highlights = [
      `${insight.counts.contacts} contatos`,
      `${insight.counts.experience + insight.counts.education} blocos`,
      `${insight.counts.skills} skills`,
      `${proofCount} provas`,
    ];

    return {
      ...guide,
      completionScore,
      completedCount,
      totalCount,
      detail: remainingItems.length === 0 ? guide.readyLabel : `${remainingItems.length} ajustes pendentes`,
      tip: remainingItems[0]?.tip ?? guide.successTip,
      tone: getProgressTone(completionScore),
      highlight: highlights[index],
      isReady: remainingItems.length === 0,
    };
  });
}

function StepTab({ item, isActive, onClick }) {
  return (
    <button
      className={cn(
        "rounded-[18px] border p-3 text-left transition",
        isActive
          ? "border-ink bg-ink text-white shadow-[0_18px_36px_rgba(15,23,42,0.16)]"
          : "border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50/80",
      )}
      onClick={onClick}
      type="button"
    >
      <div className="flex items-center justify-between gap-3">
        <p className={cn("text-sm font-semibold tracking-tight", isActive ? "text-white" : "text-ink")}>{item.label}</p>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
            isActive ? "bg-white/10 text-white" : toneBadgeClasses[item.tone] ?? toneBadgeClasses.slate,
          )}
        >
          {item.completionScore}%
        </span>
      </div>
    </button>
  );
}

function StepGroup({ kicker, title, description, children, action }) {
  return (
    <div className="rounded-[26px] border border-slate-200 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))] p-4 shadow-[0_14px_32px_rgba(15,23,42,0.05)] sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{kicker}</p>
          <h3 className="mt-2 text-lg font-semibold tracking-tight text-ink">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}

export default function EditorPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isNew = !id;
  const isMountedRef = useRef(true);
  const editorSectionRef = useRef(null);
  const skipNextAutoSaveRef = useRef(false);
  const autoSaveTimerRef = useRef(null);
  const {
    resume,
    replaceResume,
    updateTitle,
    updatePersonal,
    updateSummary,
    updateAdditionalInfo,
    updateListItem,
    addListItem,
    removeListItem,
    updateSkill,
    addSkill,
    removeSkill,
    updateCustomization,
  } = useResumeEditor();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState(DEFAULT_EDITOR_FEEDBACK);
  const [errors, setErrors] = useState({});
  const [saveState, setSaveState] = useState(isNew ? "idle" : "saved");
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [activeSupportPanel, setActiveSupportPanel] = useState(null);
  const [busyActions, setBusyActions] = useState({
    summary: false,
    generatedSummary: false,
    skills: false,
    objective: false,
  });
  const requestedTemplate = searchParams.get("template");
  const selectedTemplateId = templateOptions.some((item) => item.id === requestedTemplate) ? requestedTemplate : null;
  const requestedPrimaryColor = colorOptions.includes(searchParams.get("color")) ? searchParams.get("color") : null;
  const requestedFontFamily = fontOptions.some((item) => item.id === searchParams.get("font")) ? searchParams.get("font") : null;
  const requestedSpacing = spacingOptions.some((item) => item.id === searchParams.get("spacing")) ? searchParams.get("spacing") : null;
  const requestedTitleScale = titleScaleOptions.some((item) => item.id === searchParams.get("titleScale"))
    ? searchParams.get("titleScale")
    : null;
  const shouldStartFresh = searchParams.get("fresh") === "1";

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;

      if (autoSaveTimerRef.current) {
        window.clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (isNew) {
      if (!shouldStartFresh) {
        const draft = resumeDraftApi.get();

        if (draft?.data) {
          skipNextAutoSaveRef.current = true;
          replaceResume(draft.data);
          setFeedback("Rascunho local recuperado automaticamente.");
          setSaveState("saved");
          setLastSavedAt(draft.updatedAt);
          setActiveSupportPanel(null);
          setIsLoading(false);
          return () => {
            cancelled = true;
          };
        }
      }

      if (!selectedTemplateId) {
        navigate(appRoutes.templates, { replace: true });
        return () => {
          cancelled = true;
        };
      }

      skipNextAutoSaveRef.current = true;
      const baseResume = createEmptyResume();
      replaceResume({
        ...baseResume,
        template: selectedTemplateId,
        customization: {
          ...baseResume.customization,
          ...(requestedPrimaryColor ? { primaryColor: requestedPrimaryColor } : {}),
          ...(requestedFontFamily ? { fontFamily: requestedFontFamily } : {}),
          ...(requestedSpacing ? { spacing: requestedSpacing } : {}),
          ...(requestedTitleScale ? { titleScale: requestedTitleScale } : {}),
        },
      });
      setFeedback(
        `Template ${templateOptions.find((item) => item.id === selectedTemplateId)?.name ?? selectedTemplateId} selecionado. Preencha os campos e acompanhe o curriculo em tempo real.`,
      );
      setSaveState("idle");
      setLastSavedAt(null);
      setActiveSupportPanel(null);
      setIsLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setIsLoading(true);
    setActiveSupportPanel(null);

    resumeApi
      .getById(id)
      .then((response) => {
        if (cancelled || !isMountedRef.current) {
          return;
        }

        skipNextAutoSaveRef.current = true;
        replaceResume(response.resume.data);
        setSaveState("saved");
        setLastSavedAt(response.resume.updatedAt);
      })
      .catch((error) => {
        if (cancelled || !isMountedRef.current) {
          return;
        }

        setFeedback(error.message);
      })
      .finally(() => {
        if (cancelled || !isMountedRef.current) {
          return;
        }

        setActiveSupportPanel(null);
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    id,
    isNew,
    navigate,
    replaceResume,
    requestedFontFamily,
    requestedPrimaryColor,
    requestedSpacing,
    requestedTitleScale,
    selectedTemplateId,
    shouldStartFresh,
  ]);

  const formErrors = useMemo(() => {
    const nextErrors = validateResume(resume);

    if (resume.personal.email && !isEmailValid(resume.personal.email)) {
      nextErrors.email = "Informe um email valido.";
    }

    return nextErrors;
  }, [resume]);

  const insight = useMemo(() => buildResumeInsight(resume), [resume]);
  const stepMeta = useMemo(() => buildEditorStepMeta({ resume, insight }), [insight, resume]);
  const currentStepMeta = stepMeta[currentStep] ?? stepMeta[0];
  const recommendedStepIndex = useMemo(() => {
    const nextIndex = stepMeta.findIndex((item) => !item.isReady);
    return nextIndex === -1 ? editorSteps.length - 1 : nextIndex;
  }, [stepMeta]);
  const recommendedStepMeta = stepMeta[recommendedStepIndex] ?? currentStepMeta;
  const currentTemplateName = templateOptions.find((item) => item.id === resume.template)?.name ?? resume.template;
  const currentFontName = fontOptions.find((item) => item.id === resume.customization.fontFamily)?.name ?? resume.customization.fontFamily;
  const currentSpacingName = spacingOptions.find((item) => item.id === resume.customization.spacing)?.name ?? resume.customization.spacing;
  const hasUnsavedChanges = saveState === "dirty" || saveState === "saving" || saveState === "error";
  const resumeStorageMeta = useMemo(() => resumeApi.getStorageMeta(), [id, isNew, saveState]);
  const blockingItems = Object.entries(formErrors).map(([field, message]) => ({
    id: field,
    title: issueLabelMap[field] ?? field,
    message,
  }));
  const blockingCount = blockingItems.length;
  const blockingSummary = useMemo(() => {
    if (blockingItems.length === 0) {
      return "";
    }

    return blockingItems.map((item) => item.title).join(", ");
  }, [blockingItems]);
  const saveStatusMeta = useMemo(() => {
    if (saveState === "saving") {
      return {
        label: "Salvando automaticamente",
        className: "bg-amber-50 text-amber-700",
        description: "Sincronizando as alteracoes atuais para nao perder nada do que voce acabou de editar.",
        progress: 72,
        progressClassName: "bg-[linear-gradient(90deg,#f59e0b_0%,#fbbf24_100%)]",
        dotClassName: "bg-amber-500 animate-pulse",
      };
    }

    if (saveState === "dirty") {
      return {
        label: "Alteracoes pendentes",
        className: "bg-amber-50 text-amber-700",
        description: "O auto-save entra em poucos instantes enquanto voce continua preenchendo os campos.",
        progress: 38,
        progressClassName: "bg-[linear-gradient(90deg,#f59e0b_0%,#fbbf24_100%)]",
        dotClassName: "bg-amber-500",
      };
    }

    if (saveState === "error") {
      return {
        label: "Falha no auto-save",
        className: "bg-rose-50 text-rose-700",
        description: "Nao foi possivel sincronizar agora. Use salvar manualmente para garantir esta versao.",
        progress: 100,
        progressClassName: "bg-[linear-gradient(90deg,#e11d48_0%,#fb7185_100%)]",
        dotClassName: "bg-rose-500",
      };
    }

    if (saveState === "saved") {
      return {
        label: `${isNew ? "Rascunho salvo" : "Salvo automaticamente"} as ${formatSavedAt(lastSavedAt)}`,
        className: "bg-emerald-50 text-emerald-700",
        description: isNew
          ? "O rascunho local esta protegido neste navegador enquanto voce monta a primeira versao."
          : "As alteracoes desta versao foram sincronizadas automaticamente e ja estao seguras.",
        progress: 100,
        progressClassName: "bg-[linear-gradient(90deg,#0f766e_0%,#14b8a6_100%)]",
        dotClassName: "bg-emerald-500",
      };
    }

    return {
      label: "Auto-save pronto",
      className: "bg-slate-100 text-slate-500",
      description: "Assim que voce preencher algo relevante, o rascunho local passa a ser salvo automaticamente.",
      progress: 14,
      progressClassName: "bg-[linear-gradient(90deg,#cbd5e1_0%,#94a3b8_100%)]",
      dotClassName: "bg-slate-400",
    };
  }, [isNew, lastSavedAt, saveState]);
  const visibleFeedback = useMemo(() => {
    if (!feedback || feedback === DEFAULT_EDITOR_FEEDBACK || feedback.startsWith("Template ")) {
      return "";
    }

    if (
      feedback === "Curriculo criado com sucesso." ||
      feedback === "Curriculo salvo com sucesso." ||
      feedback.startsWith("Curriculo salvo localmente.")
    ) {
      return "";
    }

    return feedback;
  }, [feedback]);
  const showRecommendedStepAction = recommendedStepIndex !== currentStep;
  const compactSupportButtonClassName = "w-full px-4 py-2 text-xs sm:w-auto";
  const supportPanelButtonClassName =
    "w-full border border-transparent px-4 py-2 text-xs text-slate-600 hover:border-slate-200 hover:bg-white hover:text-ink sm:w-auto";

  function scrollToSection(targetRef) {
    targetRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  useEffect(() => {
    let cancelled = false;

    if (autoSaveTimerRef.current) {
      window.clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }

    if (isLoading) {
      return undefined;
    }

    if (skipNextAutoSaveRef.current) {
      skipNextAutoSaveRef.current = false;
      return undefined;
    }

    if (isNew && !hasMeaningfulResumeContent(resume)) {
      resumeDraftApi.clear();
      setSaveState("idle");
      setLastSavedAt(null);
      return undefined;
    }

    setSaveState("dirty");

    autoSaveTimerRef.current = window.setTimeout(async () => {
      if (cancelled || !isMountedRef.current) {
        autoSaveTimerRef.current = null;
        return;
      }

      setSaveState("saving");

      try {
        if (isNew) {
          const draft = resumeDraftApi.save(resume);

          if (cancelled || !isMountedRef.current) {
            return;
          }

          setLastSavedAt(draft.updatedAt);
        } else {
          const response = await resumeApi.update(id, buildResumePayload(resume));

          if (cancelled || !isMountedRef.current) {
            return;
          }

          setLastSavedAt(response.resume.updatedAt);
        }

        setSaveState("saved");
      } catch (error) {
        if (cancelled || !isMountedRef.current) {
          return;
        }

        setSaveState("error");
        setFeedback(error.message);
      } finally {
        autoSaveTimerRef.current = null;
      }
    }, AUTO_SAVE_DELAY_MS);

    return () => {
      cancelled = true;

      if (autoSaveTimerRef.current) {
        window.clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
    };
  }, [id, isLoading, isNew, resume]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!hasUnsavedChanges) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  async function handleSave() {
    setErrors(formErrors);

    if (autoSaveTimerRef.current) {
      window.clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }

    setIsSaving(true);
    setSaveState("saving");

    try {
      const payload = buildResumePayload(resume);

      if (isNew) {
        const response = await resumeApi.create(payload);

        if (!isMountedRef.current) {
          return;
        }

        resumeDraftApi.clear();
        setFeedback(
          Object.keys(formErrors).length > 0
            ? "Curriculo salvo localmente. Complete nome, email e cargo antes de exportar."
            : "Curriculo criado com sucesso.",
        );
        setSaveState("saved");
        setLastSavedAt(response.resume.updatedAt);
        navigate(getEditorRoute(response.resume.id), { replace: true });
        return;
      }

      const response = await resumeApi.update(id, payload);

      if (!isMountedRef.current) {
        return;
      }

      setSaveState("saved");
      setLastSavedAt(response.resume.updatedAt);
      setFeedback(
        Object.keys(formErrors).length > 0
          ? "Curriculo salvo localmente. Complete nome, email e cargo antes de exportar."
          : "Curriculo salvo com sucesso.",
      );
    } catch (error) {
      if (!isMountedRef.current) {
        return;
      }

      setSaveState("error");
      setFeedback(error.message);
    } finally {
      if (isMountedRef.current) {
        setIsSaving(false);
      }
    }
  }

  function handlePreviewNavigation() {
    const payload = buildResumePayload(resume);
    const previewPath = id ? getPreviewRoute(id) : appRoutes.previewDraft;

    navigate(previewPath, {
      state: {
        editorPath: `${location.pathname}${location.search}`,
        resumeRecord: {
          id: id ?? null,
          title: payload.title,
          template: resume.template,
          data: resume,
        },
      },
    });
  }

  function handleImportedProfile(importPreview, selectedSections) {
    const nextResume = applyImportPreviewToResume(resume, importPreview, selectedSections);

    replaceResume(nextResume);
    setCurrentStep(0);
    setFeedback("Dados importados com sucesso. Revise os blocos preenchidos antes de salvar.");
    setActiveSupportPanel(null);
    scrollToSection(editorSectionRef);
  }

  async function runAiAction(key, callback) {
    setBusyActions((current) => ({ ...current, [key]: true }));

    try {
      await callback();

      if (!isMountedRef.current) {
        return;
      }

      setFeedback("Sugestao aplicada com sucesso.");
    } catch (error) {
      if (isMountedRef.current) {
        setFeedback(error.message);
      }
    } finally {
      if (isMountedRef.current) {
        setBusyActions((current) => ({ ...current, [key]: false }));
      }
    }
  }

  async function handleImproveSummary() {
    return runAiAction("summary", async () => {
      const response = await aiApi.improveText({
        text: resume.summary,
        tone: "executive",
      });

      updateSummary(response.result);
    });
  }

  async function handleGenerateSummary() {
    return runAiAction("generatedSummary", async () => {
      const response = await aiApi.generateSummary({
        fullName: resume.personal.fullName,
        title: resume.personal.role,
        experience: resume.experience,
      });

      updateSummary(response.result);
    });
  }

  async function handleSuggestSkills() {
    return runAiAction("skills", async () => {
      const response = await aiApi.suggestSkills({
        targetRole: resume.personal.role,
      });

      replaceResume({
        ...resume,
        skills: Array.from(new Set([...(resume.skills ?? []).filter(Boolean), ...response.result])),
      });
    });
  }

  async function handleRewriteObjective() {
    return runAiAction("objective", async () => {
      const response = await aiApi.rewriteObjective({
        targetRole: resume.personal.role,
        objective: resume.personal.objective,
      });

      updatePersonal("objective", response.result);
    });
  }

  function handleResetCurrentContent() {
    if (!window.confirm("Deseja limpar o conteudo atual e manter apenas o template e o estilo selecionados?")) {
      return;
    }

    const baseResume = createEmptyResume();

    replaceResume({
      ...baseResume,
      template: resume.template,
      customization: {
        ...baseResume.customization,
        ...resume.customization,
      },
    });
    setCurrentStep(0);
    setErrors({});
    setFeedback("Conteudo reiniciado. O template e o estilo atual foram preservados.");
    scrollToSection(editorSectionRef);
  }

  function handleGoToRecommendedStep() {
    setCurrentStep(recommendedStepIndex);
    scrollToSection(editorSectionRef);
  }

  function toggleSupportPanel(panelName) {
    setActiveSupportPanel((current) => (current === panelName ? null : panelName));
  }

  function renderStep() {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <StepGroup
              kicker="Identidade base"
              title="Posicione a versao principal"
              description="Defina nome, cargo, cidade e um titulo interno claro para localizar esta variacao depois."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  error={errors.title}
                  label="Titulo interno"
                  name="resume-title"
                  onChange={(event) => updateTitle(event.target.value)}
                  placeholder="Ex.: Curriculo Product Designer 2026"
                  value={resume.title}
                />
                <Field
                  autoComplete="name"
                  error={errors.fullName}
                  label="Nome completo"
                  name="full-name"
                  onChange={(event) => updatePersonal("fullName", event.target.value)}
                  placeholder="Seu nome completo"
                  value={resume.personal.fullName}
                />
                <Field
                  error={errors.role}
                  label="Cargo ou objetivo principal"
                  name="role"
                  onChange={(event) => updatePersonal("role", event.target.value)}
                  placeholder="Ex.: Desenvolvedor Frontend Junior"
                  value={resume.personal.role}
                />
                <Field
                  autoComplete="address-level2"
                  label="Cidade"
                  name="city"
                  onChange={(event) => updatePersonal("city", event.target.value)}
                  placeholder="Ex.: Recife, PE"
                  value={resume.personal.city}
                />
              </div>
            </StepGroup>

            <StepGroup
              kicker="Contato e presenca"
              title="Abra canais claros para retorno"
              description="Use email, telefone e links profissionais para dar continuidade ao processo sem friccao."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  autoComplete="email"
                  error={errors.email}
                  label="Email"
                  name="email"
                  onChange={(event) => updatePersonal("email", event.target.value)}
                  placeholder="voce@email.com"
                  type="email"
                  value={resume.personal.email}
                />
                <Field
                  autoComplete="tel"
                  label="Telefone"
                  name="phone"
                  onChange={(event) => updatePersonal("phone", event.target.value)}
                  placeholder="+55 11 99999-9999"
                  value={resume.personal.phone}
                />
                <Field
                  autoComplete="url"
                  label="LinkedIn"
                  name="linkedin"
                  onChange={(event) => updatePersonal("linkedin", event.target.value)}
                  placeholder="linkedin.com/in/seunome"
                  value={resume.personal.linkedin}
                />
                <Field
                  autoComplete="url"
                  label="GitHub"
                  name="github"
                  onChange={(event) => updatePersonal("github", event.target.value)}
                  placeholder="github.com/seunome"
                  value={resume.personal.github}
                />
                <div className="md:col-span-2">
                  <Field
                    autoComplete="url"
                    label="Portfolio"
                    name="portfolio"
                    onChange={(event) => updatePersonal("portfolio", event.target.value)}
                    placeholder="seuportfolio.dev"
                    value={resume.personal.portfolio}
                  />
                </div>
                <div className="md:col-span-2">
                  <Field
                    autoComplete="url"
                    helperText="Use uma URL publica de imagem. Fotos em base64 ou arquivos locais nao sao persistidos no modo local."
                    label="Foto profissional"
                    name="photo"
                    onChange={(event) => updatePersonal("photo", event.target.value)}
                    placeholder="https://exemplo.com/foto-profissional.jpg"
                    value={resume.personal.photo}
                  />
                </div>
              </div>

              {resume.personal.photo ? (
                <div className="mt-5 flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 sm:flex-row sm:items-center">
                  <img
                    alt={resume.personal.fullName || "Preview da foto profissional"}
                    className="h-20 w-20 rounded-[22px] border border-slate-200 object-cover shadow-[0_14px_30px_rgba(15,23,42,0.08)]"
                    referrerPolicy="no-referrer"
                    src={resume.personal.photo}
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Preview da foto</p>
                    <p className="mt-1 text-xs leading-6 text-slate-500">
                      A imagem sera exibida apenas nos templates que usam foto e na exportacao em PDF.
                    </p>
                  </div>
                </div>
              ) : null}
            </StepGroup>

            <StepGroup
              kicker="Narrativa profissional"
              title="Mostre intencao e contexto"
              description="Objetivo e resumo explicam por que esta versao existe e como voce quer ser percebido."
            >
              <div className="grid gap-4">
                <Field
                  as="textarea"
                  label="Objetivo profissional"
                  name="objective"
                  onChange={(event) => updatePersonal("objective", event.target.value)}
                  placeholder="Ex.: Busco uma oportunidade para crescer em produto digital, contribuindo com foco em UX, colaboracao e entrega."
                  value={resume.personal.objective}
                />
                <Field
                  as="textarea"
                  label="Resumo profissional"
                  name="summary"
                  onChange={(event) => updateSummary(event.target.value)}
                  placeholder="Resuma experiencia, contexto, resultados e diferenciais."
                  value={resume.summary}
                />
              </div>
            </StepGroup>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <ArraySectionEditor
              addLabel="Adicionar experiencia"
              description="Liste experiencias com foco em impacto, entregas e resultados."
              fields={experienceFields}
              items={resume.experience}
              onAdd={() => addListItem("experience")}
              onChange={(itemId, field, value) => updateListItem("experience", itemId, field, value)}
              onRemove={(itemId) => removeListItem("experience", itemId)}
              title="Experiencia profissional"
            />
            <ArraySectionEditor
              addLabel="Adicionar formacao"
              description="Inclua graduacoes, cursos tecnicos ou formacoes relevantes."
              fields={educationFields}
              items={resume.education}
              onAdd={() => addListItem("education")}
              onChange={(itemId, field, value) => updateListItem("education", itemId, field, value)}
              onRemove={(itemId) => removeListItem("education", itemId)}
              title="Formacao academica"
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <SkillsEditor onAdd={addSkill} onChange={updateSkill} onRemove={removeSkill} skills={resume.skills} />
            <ArraySectionEditor
              addLabel="Adicionar idioma"
              description="Liste idiomas e niveis para dar mais contexto ao perfil."
              fields={languageFields}
              items={resume.languages}
              onAdd={() => addListItem("languages")}
              onChange={(itemId, field, value) => updateListItem("languages", itemId, field, value)}
              onRemove={(itemId) => removeListItem("languages", itemId)}
              title="Idiomas"
            />
            <ArraySectionEditor
              addLabel="Adicionar certificacao"
              description="Mostre cursos e certificacoes que reforcem sua credibilidade."
              fields={certificationFields}
              items={resume.certifications}
              onAdd={() => addListItem("certifications")}
              onChange={(itemId, field, value) => updateListItem("certifications", itemId, field, value)}
              onRemove={(itemId) => removeListItem("certifications", itemId)}
              title="Certificacoes"
            />
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <ArraySectionEditor
              addLabel="Adicionar projeto"
              description="Destaque cases que comprovem resultado, autoria e profundidade."
              fields={projectFields}
              items={resume.projects}
              onAdd={() => addListItem("projects")}
              onChange={(itemId, field, value) => updateListItem("projects", itemId, field, value)}
              onRemove={(itemId) => removeListItem("projects", itemId)}
              title="Projetos"
            />
            <StepGroup
              kicker="Fechamento"
              title="Contexto adicional"
              description="Use este bloco apenas para o que realmente reforca disponibilidade, premios, mobilidade ou contexto final."
            >
              <Field
                as="textarea"
                label="Informacoes adicionais"
                name="additional-info"
                onChange={(event) => updateAdditionalInfo(event.target.value)}
                placeholder="Espaco para voluntariado, premios, disponibilidade, mobilidade ou outros detalhes importantes."
                value={resume.additionalInfo}
              />
            </StepGroup>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <AppLayout
      actions={
        <>
          <Button className="w-full sm:w-auto" onClick={handlePreviewNavigation} variant="secondary">
            Abrir preview
          </Button>
          <Button className="w-full sm:w-auto" disabled={isSaving} onClick={handleSave} variant="primary">
            {isSaving ? "Salvando..." : "Salvar agora"}
          </Button>
        </>
      }
      contentClassName="max-w-none px-3 py-6 sm:px-6 sm:py-8 lg:px-8 2xl:px-10"
      subtitle="Fluxo mais direto para preencher no editor e revisar o preview em uma tela separada."
      title={isNew ? "Novo curriculo" : "Editar curriculo"}
    >
      {isLoading ? (
        <Panel>
          <p className="text-sm text-slate-500">Carregando dados do curriculo...</p>
        </Panel>
      ) : (
        <div className="space-y-6">
          <Panel className="p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                  {resume.title || "Meu curriculo"}
                </h2>
                <div className="mt-3 flex flex-col gap-1.5 text-sm">
                  <p className="flex items-center gap-2 text-slate-600">
                    <span className={cn("h-2 w-2 rounded-full", saveStatusMeta.dotClassName)} />
                    {saveStatusMeta.label}
                  </p>
                  <p className="text-slate-500">Template: {currentTemplateName}</p>
                </div>
              </div>
              <div className="grid gap-2 sm:flex sm:flex-wrap lg:justify-end">
                {showRecommendedStepAction ? (
                  <Button className={compactSupportButtonClassName} onClick={handleGoToRecommendedStep} variant="secondary">
                    Ir para {recommendedStepMeta.label}
                  </Button>
                ) : null}
                <Button
                  className={cn(
                    supportPanelButtonClassName,
                    activeSupportPanel === "import"
                      ? "border-slate-300 bg-white text-ink shadow-[0_8px_20px_rgba(15,23,42,0.08)]"
                      : "",
                  )}
                  onClick={() => toggleSupportPanel("import")}
                  variant="ghost"
                >
                  Importar perfil
                </Button>
                <Button
                  className={cn(
                    supportPanelButtonClassName,
                    activeSupportPanel === "style"
                      ? "border-slate-300 bg-white text-ink shadow-[0_8px_20px_rgba(15,23,42,0.08)]"
                      : "",
                  )}
                  onClick={() => toggleSupportPanel("style")}
                  variant="ghost"
                >
                  Ajustar estilo
                </Button>
                <Button
                  className={cn(
                    supportPanelButtonClassName,
                    activeSupportPanel === "assistant"
                      ? "border-slate-300 bg-white text-ink shadow-[0_8px_20px_rgba(15,23,42,0.08)]"
                      : "",
                  )}
                  onClick={() => toggleSupportPanel("assistant")}
                  variant="ghost"
                >
                  Assistente
                </Button>
              </div>
            </div>

            {visibleFeedback ? (
              <div className="mt-4 rounded-[20px] border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm leading-6 text-slate-600">
                {visibleFeedback}
              </div>
            ) : null}
          </Panel>

          {isNew && resumeStorageMeta.limitReached ? (
            <div className="rounded-[28px] border border-amber-200 bg-[linear-gradient(145deg,rgba(255,251,235,0.96),rgba(254,243,199,0.78))] px-5 py-5 shadow-[0_18px_40px_rgba(217,119,6,0.10)]">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-700/75">Limite local</p>
                  <p className="mt-2 text-sm font-semibold text-amber-950">
                    Voce atingiu o limite de curriculos salvos neste modo local.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-amber-900/80">
                    O rascunho continua funcionando, mas para salvar uma nova versao voce precisa excluir um curriculo antigo.
                  </p>
                </div>
                <span className="rounded-full border border-amber-200 bg-white/85 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">
                  {resumeStorageMeta.total}/{resumeStorageMeta.limit} versoes
                </span>
              </div>
            </div>
          ) : null}

          {activeSupportPanel === "import" ? (
            <ProfileImportPanel onApply={handleImportedProfile} onDismiss={() => setActiveSupportPanel(null)} />
          ) : null}

          {activeSupportPanel === "style" ? (
            <Panel
              description="Abra o ajuste visual apenas quando precisar, sem ocupar a area principal do formulario."
              title="Estilo"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
                    Template: {currentTemplateName}
                  </span>
                  <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 shadow-[0_8px_18px_rgba(15,23,42,0.05)]">
                    Fonte: {currentFontName}
                  </span>
                  <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 shadow-[0_8px_18px_rgba(15,23,42,0.05)]">
                    Espacamento: {currentSpacingName}
                  </span>
                </div>
                <CustomizationPanel customization={resume.customization} onChange={updateCustomization} />
              </div>
            </Panel>
          ) : null}

          {activeSupportPanel === "assistant" ? (
            <Panel description="Use os atalhos de IA apenas quando precisar destravar texto ou habilidades." title="Assistente">
              <AiAssistantPanel
                busyActions={busyActions}
                embedded
                onGenerateSummary={handleGenerateSummary}
                onImproveSummary={handleImproveSummary}
                onRewriteObjective={handleRewriteObjective}
                onSuggestSkills={handleSuggestSkills}
              />
            </Panel>
          ) : null}

          <div ref={editorSectionRef} className="space-y-6">
            <Panel title="Editor">
              <div className="space-y-4">
                <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 px-4 py-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold tracking-tight text-ink">{currentStepMeta.label}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {blockingCount > 0 ? `Complete: ${blockingSummary}.` : currentStepMeta.tip}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 shadow-[0_8px_18px_rgba(15,23,42,0.05)]">
                      {currentStepMeta.completedCount}/{currentStepMeta.totalCount}
                    </span>
                  </div>
                </div>

                <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                  {stepMeta.map((item, index) => (
                    <StepTab
                      isActive={index === currentStep}
                      item={item}
                      key={item.label}
                      onClick={() => setCurrentStep(index)}
                    />
                  ))}
                </div>

                {renderStep()}

                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <Button
                    className="w-full px-4 py-2 text-xs md:w-auto"
                    disabled={currentStep === 0}
                    onClick={() => setCurrentStep((value) => Math.max(value - 1, 0))}
                    variant="ghost"
                  >
                    Etapa anterior
                  </Button>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      className="w-full px-4 py-2 text-xs text-rose-700 hover:bg-rose-50 hover:text-rose-800 sm:w-auto"
                      onClick={handleResetCurrentContent}
                      variant="ghost"
                    >
                      Limpar conteudo
                    </Button>
                    <Button className="w-full px-4 py-2 text-xs sm:w-auto" onClick={handlePreviewNavigation} variant="secondary">
                      Abrir preview
                    </Button>
                    <Button
                      className="w-full sm:w-auto"
                      disabled={currentStep === editorSteps.length - 1}
                      onClick={() => setCurrentStep((value) => Math.min(value + 1, editorSteps.length - 1))}
                      variant="primary"
                    >
                      Proxima etapa
                    </Button>
                  </div>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
