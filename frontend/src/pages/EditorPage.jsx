import { Suspense, lazy, startTransition, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
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
import { appRoutes, getEditorRoute, getPreviewRoute } from "../utils/routes";
import { applyImportPreviewToResume } from "../utils/profileImport";
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
const ResumePreview = lazy(() => import("../components/ResumePreview"));

function buildResumePayload(resume) {
  return {
    title: resume.title,
    template: resume.template,
    data: resume,
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

function PreviewFallbackCard() {
  return (
    <Panel>
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Preview em carregamento</p>
      <p className="mt-3 text-sm leading-7 text-slate-600">A visualizacao detalhada do curriculo esta sendo preparada.</p>
    </Panel>
  );
}

export default function EditorPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isNew = !id;
  const isMountedRef = useRef(true);
  const editorSectionRef = useRef(null);
  const editorCardRef = useRef(null);
  const previewSectionRef = useRef(null);
  const customizationSectionRef = useRef(null);
  const assistantSectionRef = useRef(null);
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
    resetResume,
  } = useResumeEditor();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [feedback, setFeedback] = useState("Preencha os campos e acompanhe o curriculo em tempo real.");
  const [errors, setErrors] = useState({});
  const [saveState, setSaveState] = useState(isNew ? "idle" : "saved");
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [editorCardHeight, setEditorCardHeight] = useState(null);
  const [shouldLoadPreview, setShouldLoadPreview] = useState(false);
  const [isImportPanelOpen, setIsImportPanelOpen] = useState(false);
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
          setIsImportPanelOpen(false);
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
      setIsImportPanelOpen(false);
      setIsLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setIsLoading(true);
    setIsImportPanelOpen(false);

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

        setIsImportPanelOpen(false);
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

  const canPreview = !isNew && Boolean(id);

  const formErrors = useMemo(() => {
    const nextErrors = validateResume(resume);

    if (resume.personal.email && !isEmailValid(resume.personal.email)) {
      nextErrors.email = "Informe um email valido.";
    }

    return nextErrors;
  }, [resume]);
  const currentStepLabel = editorSteps[currentStep] ?? editorSteps[0];
  const progressPercent = ((currentStep + 1) / editorSteps.length) * 100;
  const currentTemplateName = templateOptions.find((item) => item.id === resume.template)?.name ?? resume.template;
  const currentFontName = fontOptions.find((item) => item.id === resume.customization.fontFamily)?.name ?? resume.customization.fontFamily;
  const currentSpacingName = spacingOptions.find((item) => item.id === resume.customization.spacing)?.name ?? resume.customization.spacing;
  const hasUnsavedChanges = saveState === "dirty" || saveState === "saving" || saveState === "error";
  const resumeStorageMeta = useMemo(() => resumeApi.getStorageMeta(), [id, isNew, saveState]);
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

  function ensurePreviewReady() {
    startTransition(() => {
      setShouldLoadPreview(true);
    });
  }

  useEffect(() => {
    const node = editorCardRef.current;

    if (!node || typeof window === "undefined") {
      return undefined;
    }

    const syncEditorCardHeight = () => {
      if (window.innerWidth < 1280) {
        setEditorCardHeight(null);
        return;
      }

      setEditorCardHeight(node.getBoundingClientRect().height);
    };

    syncEditorCardHeight();

    const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(syncEditorCardHeight);
    resizeObserver?.observe(node);
    window.addEventListener("resize", syncEditorCardHeight);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", syncEditorCardHeight);
    };
  }, [isLoading]);

  useEffect(() => {
    if (shouldLoadPreview) {
      return undefined;
    }

    const node = previewSectionRef.current;

    if (!node || typeof IntersectionObserver === "undefined") {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          ensurePreviewReady();
          observer.disconnect();
        }
      },
      {
        rootMargin: "320px 0px",
      },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [shouldLoadPreview]);

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

  function syncErrors() {
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  }

  async function handleSave() {
    if (!syncErrors()) {
      setFeedback("Revise os campos obrigatorios antes de salvar.");
      return;
    }

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
        setFeedback("Curriculo criado com sucesso.");
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
      setFeedback("Curriculo salvo com sucesso.");
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
    ensurePreviewReady();
    scrollToSection(previewSectionRef);
  }

  function handleImportedProfile(importPreview, selectedSections) {
    const nextResume = applyImportPreviewToResume(resume, importPreview, selectedSections);

    replaceResume(nextResume);
    setCurrentStep(0);
    setFeedback("Dados importados com sucesso. Revise os blocos preenchidos antes de salvar.");
    setIsImportPanelOpen(false);
    ensurePreviewReady();
    scrollToSection(editorSectionRef);
  }

  async function handleExport() {
    if (!syncErrors()) {
      setFeedback("Corrija os dados principais antes de exportar.");
      return;
    }

    setIsExporting(true);

    try {
      const { createPdfFileName, exportPdfFile } = await import("../services/pdfApi");

      await exportPdfFile({
        resume,
        fileName: createPdfFileName(resume.personal.fullName),
      });

      if (!isMountedRef.current) {
        return;
      }

      setFeedback("PDF gerado e enviado para download.");
    } catch (error) {
      if (isMountedRef.current) {
        setFeedback(error.message);
      }
    } finally {
      if (isMountedRef.current) {
        setIsExporting(false);
      }
    }
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

  function renderStep() {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
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
              {resume.personal.photo ? (
                <div className="md:col-span-2">
                  <div className="flex items-center gap-4 rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
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
                </div>
              ) : null}
              <div className="md:col-span-2">
                <Field
                  as="textarea"
                  label="Objetivo profissional"
                  name="objective"
                  onChange={(event) => updatePersonal("objective", event.target.value)}
                  placeholder="Ex.: Busco uma oportunidade para crescer em produto digital, contribuindo com foco em UX, colaboracao e entrega."
                  value={resume.personal.objective}
                />
              </div>
              <div className="md:col-span-2">
                <Field
                  as="textarea"
                  label="Resumo profissional"
                  name="summary"
                  onChange={(event) => updateSummary(event.target.value)}
                  placeholder="Resuma experiencia, contexto, resultados e diferenciais."
                  value={resume.summary}
                />
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-8">
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
          <div className="space-y-8">
            <SkillsEditor
              onAdd={addSkill}
              onChange={updateSkill}
              onRemove={removeSkill}
              skills={resume.skills}
            />
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
          <div className="space-y-8">
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
            <Field
              as="textarea"
              label="Informacoes adicionais"
              name="additional-info"
              onChange={(event) => updateAdditionalInfo(event.target.value)}
              placeholder="Espaco para voluntariado, premios, disponibilidade, mobilidade ou outros detalhes importantes."
              value={resume.additionalInfo}
            />
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
          <Button onClick={() => setIsImportPanelOpen((value) => !value)} variant="ghost">
            {isImportPanelOpen ? "Fechar importacao" : "Importar perfil"}
          </Button>
          {canPreview ? (
            <Button as={Link} to={getPreviewRoute(id)} variant="secondary">
              Visualizar
            </Button>
          ) : null}
          <Button disabled={isExporting} onClick={handleExport} variant="secondary">
            {isExporting ? "Gerando PDF..." : "Exportar PDF"}
          </Button>
          <Button disabled={isSaving} onClick={handleSave} variant="primary">
            {isSaving ? "Salvando..." : "Salvar agora"}
          </Button>
        </>
      }
      contentClassName="max-w-none px-4 py-8 sm:px-6 lg:px-8 2xl:px-10"
      subtitle="Editor estruturado em secoes, preview instantaneo, recursos inteligentes e layout pronto para evoluir como SaaS."
      title={isNew ? "Novo curriculo" : "Editar curriculo"}
    >
      {isLoading ? (
        <Panel>
          <p className="text-sm text-slate-500">Carregando dados do curriculo...</p>
        </Panel>
      ) : (
        <div className="space-y-6">
          {isImportPanelOpen ? (
            <ProfileImportPanel
              onApply={handleImportedProfile}
              onDismiss={() => setIsImportPanelOpen(false)}
            />
          ) : null}

          <div className="flex flex-col gap-4 rounded-[28px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.95),rgba(255,255,255,0.82))] px-5 py-5 shadow-soft md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <span className={`mt-1 h-2.5 w-2.5 rounded-full ${saveStatusMeta.dotClassName}`} />
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Status do editor</p>
                <p aria-live="polite" className="mt-2 text-sm font-semibold leading-7 text-slate-800">
                  {saveStatusMeta.description}
                </p>
                <p className="mt-1 text-sm leading-7 text-slate-600">{feedback}</p>
                <div className="mt-4">
                  <div className="flex items-center justify-between gap-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    <span>Auto-save</span>
                    <span>{saveStatusMeta.label}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${saveStatusMeta.progressClassName}`}
                      style={{ width: `${saveStatusMeta.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${saveStatusMeta.className}`}>
                {saveStatusMeta.label}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Etapa {currentStep + 1}/{editorSteps.length}
              </span>
              <span className="rounded-full bg-brand-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
                Template {currentTemplateName}
              </span>
            </div>
          </div>

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

          <div className="grid gap-6 xl:items-start xl:grid-cols-[minmax(0,1.45fr)_360px] 2xl:grid-cols-[minmax(0,1.55fr)_380px]">
            <div ref={editorSectionRef} className="space-y-6">
              <div ref={editorCardRef}>
                <Panel description="Navegue por secoes para montar o curriculo sem perder contexto." title="Editor">
                  <div className="mb-6 rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Fluxo atual</p>
                        <p className="mt-2 text-base font-semibold text-ink">{currentStepLabel}</p>
                      </div>
                      <div className="rounded-full bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 shadow-[0_10px_20px_rgba(15,23,42,0.06)]">
                        {Math.round(progressPercent)}%
                      </div>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
                      <div
                        className="h-2 rounded-full bg-[linear-gradient(90deg,#0f766e_0%,#14b8a6_100%)] transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className="mt-4 grid gap-2 md:grid-cols-4">
                      {editorSteps.map((step, index) => {
                        const isActive = index === currentStep;
                        const isCompleted = index < currentStep;

                        return (
                          <div
                            key={`${step}-progress`}
                            className={`rounded-[18px] border px-3 py-3 text-center text-xs font-semibold uppercase tracking-[0.16em] transition ${
                              isActive
                                ? "border-ink bg-ink text-white shadow-[0_18px_35px_rgba(15,23,42,0.18)]"
                                : isCompleted
                                  ? "border-brand-200 bg-brand-50 text-brand-700"
                                  : "border-slate-200 bg-white text-slate-500"
                            }`}
                          >
                            {step}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {editorSteps.map((step, index) => {
                      const active = index === currentStep;

                      return (
                        <button
                          key={step}
                          className={`flex items-center gap-3 rounded-full px-4 py-3 text-sm font-semibold transition ${
                            active
                              ? "bg-ink text-white shadow-[0_18px_35px_rgba(15,23,42,0.18)]"
                              : "border border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-ink"
                          }`}
                          onClick={() => setCurrentStep(index)}
                          type="button"
                        >
                          <span
                            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                              active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          {step}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-6">{renderStep()}</div>

                  <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <Button
                      disabled={currentStep === 0}
                      onClick={() => setCurrentStep((value) => Math.max(value - 1, 0))}
                      variant="secondary"
                    >
                      Etapa anterior
                    </Button>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button onClick={handlePreviewNavigation} variant="secondary">
                        Pre-visualizar
                      </Button>
                      <Button onClick={resetResume} variant="ghost">
                        Resetar
                      </Button>
                      <Button
                        disabled={currentStep === editorSteps.length - 1}
                        onClick={() => setCurrentStep((value) => Math.min(value + 1, editorSteps.length - 1))}
                        variant="primary"
                      >
                        Proxima etapa
                      </Button>
                    </div>
                  </div>
                </Panel>
              </div>
            </div>

            <div className="space-y-6 xl:min-h-0">
              <Panel
                className="xl:min-h-0"
                description="Ajuste a apresentacao visual e use atalhos de IA sem poluir a tela principal do editor."
                style={editorCardHeight ? { height: `${editorCardHeight}px` } : undefined}
                title="Estilo e assistente"
              >
                <div className="flex h-full min-h-0 flex-col">
                  <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                    <div className="sticky top-0 z-10 rounded-[18px] border border-slate-200/80 bg-white/92 p-2.5 shadow-[0_10px_24px_rgba(15,23,42,0.05)] backdrop-blur">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Acesso rapido</p>
                      <div className="mt-2.5 grid grid-cols-2 gap-2">
                        <button
                          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-600 transition hover:border-slate-400 hover:bg-white hover:text-ink"
                          onClick={() => scrollToSection(customizationSectionRef)}
                          type="button"
                        >
                          Estilo
                        </button>
                        <button
                          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-600 transition hover:border-slate-400 hover:bg-white hover:text-ink"
                          onClick={() => scrollToSection(assistantSectionRef)}
                          type="button"
                        >
                          Assistente
                        </button>
                      </div>
                    </div>

                    <div ref={customizationSectionRef} className="rounded-[22px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(248,250,252,0.92),rgba(255,255,255,0.84))] p-3.5">
                      <div className="mb-3 flex flex-col gap-1.5">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Customizacao</p>
                        <p className="text-xs leading-5 text-slate-500">
                          Ajuste cor, fonte e hierarquia sem sair do fluxo.
                        </p>
                      </div>
                      <div className="mb-3 flex flex-wrap gap-1.5">
                        <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-700 shadow-[0_8px_18px_rgba(15,23,42,0.05)]">
                          Template: {currentTemplateName}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 shadow-[0_8px_18px_rgba(15,23,42,0.05)]">
                          Fonte: {currentFontName}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 shadow-[0_8px_18px_rgba(15,23,42,0.05)]">
                          Espacamento: {currentSpacingName}
                        </span>
                      </div>
                      <CustomizationPanel compact customization={resume.customization} onChange={updateCustomization} />
                    </div>

                    <div ref={assistantSectionRef} className="rounded-[22px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.9))] p-3.5">
                      <div className="mb-3 flex flex-col gap-1.5">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Assistente inteligente em breve</p>
                        <p className="text-xs leading-5 text-slate-500">
                          Bloco de demonstracao da camada inteligente prevista para o proximo ciclo do produto.
                        </p>
                      </div>
                      <AiAssistantPanel
                        busyActions={busyActions}
                        compact
                        embedded
                        onGenerateSummary={handleGenerateSummary}
                        onImproveSummary={handleImproveSummary}
                        onRewriteObjective={handleRewriteObjective}
                        onSuggestSkills={handleSuggestSkills}
                      />
                    </div>
                  </div>
                </div>
              </Panel>
            </div>

            <div ref={previewSectionRef} className="space-y-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Preview ao vivo</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Visualize o curriculo em uma secao dedicada</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
                    O preview foi separado dos controles para facilitar a edicao e a leitura do resultado final.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="rounded-full border border-white/80 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-500 shadow-soft">
                    Atualizacao instantanea
                  </div>
                  <Button onClick={() => scrollToSection(editorSectionRef)} variant="secondary">
                    Voltar para o editor
                  </Button>
                </div>
              </div>

              {shouldLoadPreview ? (
                <Suspense fallback={<PreviewFallbackCard />}>
                  <ResumePreview resume={resume} />
                </Suspense>
              ) : (
                <PreviewFallbackCard />
              )}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
