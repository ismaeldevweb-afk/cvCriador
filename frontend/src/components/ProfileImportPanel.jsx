import { useMemo, useState } from "react";
import { cn } from "../utils/cn";
import { importProfileApi } from "../services/importProfileApi";
import { buildImportSelection } from "../utils/profileImport";
import Button from "./Button";
import Field from "./Field";
import Panel from "./Panel";

const sourceOptions = [
  {
    id: "zero",
    title: "Continuar manualmente",
    description: "Fechar a importacao e seguir preenchendo o curriculo no editor.",
    badge: "Manual",
  },
  {
    id: "github",
    title: "Importar do GitHub",
    description: "Usa seu perfil tecnico para sugerir resumo, skills, projetos e links.",
    badge: "Tecnico",
  },
  {
    id: "linkedin_pdf",
    title: "Importar do LinkedIn PDF",
    description: "Tenta converter headline, experiencia, formacao e competencias em campos editaveis.",
    badge: "Profissional",
  },
  {
    id: "resume_pdf",
    title: "Importar curriculo em PDF",
    description: "Reaproveita um curriculo antigo e traz o conteudo para templates melhores do produto.",
    badge: "Migracao",
  },
];

function formatSectionPriority(value = "secondary") {
  return value === "primary" ? "Prioridade alta" : "Complementar";
}

function formatConfidenceLabel(value = "medium") {
  if (value === "high") {
    return "Alta confianca";
  }

  if (value === "low") {
    return "Baixa confianca";
  }

  return "Media confianca";
}

function getConfidenceBadgeClassName(value = "medium") {
  if (value === "high") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (value === "low") {
    return "bg-rose-50 text-rose-700";
  }

  return "bg-amber-50 text-amber-800";
}

export default function ProfileImportPanel({
  onApply,
  onDismiss,
}) {
  const [selectedSource, setSelectedSource] = useState(null);
  const [githubUsername, setGithubUsername] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const [selectedSections, setSelectedSections] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");

  const activeSource = useMemo(
    () => sourceOptions.find((item) => item.id === selectedSource) ?? null,
    [selectedSource],
  );

  function handleSourceSelect(sourceId) {
    if (sourceId === "zero") {
      setSelectedSource(null);
      setImportPreview(null);
      setSelectedFile(null);
      setFeedback("Fluxo manual liberado. Voce pode preencher tudo a partir do zero.");
      onDismiss?.();
      return;
    }

    setSelectedSource(sourceId);
    setImportPreview(null);
    setSelectedSections({});
    setSelectedFile(null);
    setFeedback("");
  }

  async function handleAnalyze() {
    if (!selectedSource) {
      setFeedback("Escolha uma fonte para continuar.");
      return;
    }

    setIsSubmitting(true);
    setFeedback("");

    try {
      const preview =
        selectedSource === "github"
          ? await importProfileApi.previewGithub(githubUsername)
          : await importProfileApi.previewPdf({
              file: selectedFile,
              sourceType: selectedSource,
            });

      setImportPreview(preview);
      setSelectedSections(buildImportSelection(preview));
    } catch (error) {
      setFeedback(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSectionToggle(sectionKey) {
    setSelectedSections((current) => ({
      ...current,
      [sectionKey]: !current[sectionKey],
    }));
  }

  function handleApplyImport() {
    onApply?.(importPreview, selectedSections);
    setImportPreview(null);
    setSelectedSections({});
    setSelectedSource(null);
    setSelectedFile(null);
    setFeedback("");
  }

  return (
    <Panel
      action={
        onDismiss ? (
          <Button onClick={onDismiss} variant="ghost">
            Fechar
          </Button>
        ) : null
      }
      description="Escolha uma fonte, revise os dados detectados e confirme antes de preencher o editor."
      title="Importacao inteligente"
    >
      <div className="space-y-6">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {sourceOptions.map((option) => {
            const isActive = option.id === selectedSource;

            return (
              <button
                key={option.id}
                className={cn(
                  "rounded-[24px] border p-4 text-left transition",
                  isActive
                    ? "border-ink bg-ink text-white shadow-[0_20px_40px_rgba(15,23,42,0.18)]"
                    : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-400",
                )}
                onClick={() => handleSourceSelect(option.id)}
                type="button"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{option.title}</p>
                    <p className={cn("mt-2 text-sm leading-6", isActive ? "text-white/76" : "text-slate-500")}>
                      {option.description}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
                      isActive ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500",
                    )}
                  >
                    {option.badge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {feedback ? (
          <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm leading-6 text-slate-600">
            {feedback}
          </div>
        ) : null}

        {activeSource && !importPreview ? (
          <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.92),rgba(255,255,255,0.86))] p-5">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Fonte selecionada</p>
              <p className="mt-2 text-base font-semibold text-ink">{activeSource.title}</p>
            </div>

            {selectedSource === "github" ? (
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <Field
                  helperText="Digite apenas o username publico. Ex.: gaearon"
                  label="Username do GitHub"
                  name="github-username"
                  onChange={(event) => setGithubUsername(event.target.value)}
                  placeholder="seunome"
                  value={githubUsername}
                />
                <Button disabled={isSubmitting || !githubUsername.trim()} onClick={handleAnalyze} variant="accent">
                  {isSubmitting ? "Lendo GitHub..." : "Analisar perfil"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-700">
                    {selectedSource === "linkedin_pdf" ? "PDF exportado do LinkedIn" : "Curriculo em PDF"}
                  </span>
                  <input
                    accept="application/pdf"
                    className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                    onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                    type="file"
                  />
                </label>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <p className="text-sm leading-6 text-slate-500">
                    Envie um PDF com texto selecionavel para melhorar a deteccao. Limite recomendado: 5 MB.
                  </p>
                  <Button disabled={isSubmitting || !selectedFile} onClick={handleAnalyze} variant="accent">
                    {isSubmitting ? "Lendo PDF..." : "Gerar preview"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {importPreview ? (
          <div className="space-y-5">
            <div className="rounded-[24px] border border-slate-200 bg-white/90 p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Preview da importacao</p>
                  <p className="mt-2 text-lg font-semibold text-ink">{importPreview.source.label}</p>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                    Revise os blocos detectados e escolha apenas o que vale a pena aplicar no editor.
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  parser {importPreview.meta.parser}
                </span>
              </div>

              {importPreview.meta.notes?.length ? (
                <div className="mt-4 rounded-[20px] border border-brand-100 bg-brand-50/60 px-4 py-3 text-sm leading-6 text-brand-700">
                  {importPreview.meta.notes.join(" ")}
                </div>
              ) : null}

              {importPreview.meta.warnings?.length ? (
                <div className="mt-4 rounded-[20px] border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm leading-6 text-amber-900">
                  {importPreview.meta.warnings.join(" ")}
                </div>
              ) : null}
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Blocos detectados</p>
                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                  {importPreview.sections.map((section) => {
                    const checked = Boolean(selectedSections[section.key]);

                    return (
                      <label
                        key={section.key}
                        className={cn(
                          "flex cursor-pointer gap-4 rounded-[24px] border p-4 transition",
                          checked
                            ? "border-ink bg-[linear-gradient(145deg,rgba(15,23,42,0.04),rgba(15,118,110,0.05))]"
                            : "border-slate-200 bg-white",
                        )}
                      >
                        <input
                          checked={checked}
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600"
                          onChange={() => handleSectionToggle(section.key)}
                          type="checkbox"
                        />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-ink">{section.label}</p>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                              {section.count} item{section.count === 1 ? "" : "s"}
                            </span>
                            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-700">
                              {formatSectionPriority(section.priority)}
                            </span>
                            <span
                              className={cn(
                                "rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
                                getConfidenceBadgeClassName(section.confidence),
                              )}
                            >
                              {formatConfidenceLabel(section.confidence)}
                            </span>
                          </div>
                          <div className="mt-3 space-y-2">
                            {section.preview.map((line) => (
                              <p key={line} className="text-sm leading-6 text-slate-600">
                                {line}
                              </p>
                            ))}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {importPreview.suspiciousSections?.length ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Blocos suspeitos</p>
                  <div className="mt-3 grid gap-3 lg:grid-cols-2">
                    {importPreview.suspiciousSections.map((section) => (
                      <div
                        key={section.key}
                        className="rounded-[24px] border border-rose-200 bg-[linear-gradient(145deg,rgba(255,241,242,0.88),rgba(255,255,255,0.94))] p-4"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-ink">{section.label}</p>
                          <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                            {section.count} item{section.count === 1 ? "" : "s"}
                          </span>
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
                              getConfidenceBadgeClassName(section.confidence),
                            )}
                          >
                            {formatConfidenceLabel(section.confidence)}
                          </span>
                        </div>
                        {section.reason ? (
                          <p className="mt-3 text-sm leading-6 text-rose-800">{section.reason}</p>
                        ) : null}
                        <div className="mt-3 space-y-2">
                          {section.preview.map((line) => (
                            <p key={line} className="text-sm leading-6 text-slate-600">
                              {line}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                onClick={() => {
                  setImportPreview(null);
                  setSelectedSections({});
                }}
                variant="secondary"
              >
                Revisar fonte
              </Button>
              <Button
                disabled={!Object.values(selectedSections).some(Boolean)}
                onClick={handleApplyImport}
                variant="accent"
              >
                Confirmar e preencher editor
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </Panel>
  );
}
