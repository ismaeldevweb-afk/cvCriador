import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import CustomizationPanel from "../components/CustomizationPanel";
import Panel from "../components/Panel";
import TemplatePicker from "../components/TemplatePicker";
import AppLayout from "../layouts/AppLayout";
import { resumeDraftApi } from "../services/resumeApi";
import { appRoutes } from "../utils/routes";
import { createEmptyResume, fontOptions, spacingOptions, templateOptions, titleScaleOptions } from "../utils/resumeDefaults";

const flowSteps = ["Template", "Conteudo", "Salvar", "Dashboard"];

function formatMoment(value) {
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

export default function TemplateSelectionPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(templateOptions[0]?.id ?? "modern");
  const [customization, setCustomization] = useState(() => createEmptyResume().customization);
  const draftInfo = useMemo(() => resumeDraftApi.get(), []);
  const selectedTemplateMeta = templateOptions.find((item) => item.id === selectedTemplate) ?? templateOptions[0];
  const currentFontName = fontOptions.find((item) => item.id === customization.fontFamily)?.name ?? customization.fontFamily;
  const currentSpacingName = spacingOptions.find((item) => item.id === customization.spacing)?.name ?? customization.spacing;
  const currentTitleScaleName =
    titleScaleOptions.find((item) => item.id === customization.titleScale)?.name ?? customization.titleScale;
  const flowProgressPercent = (1 / flowSteps.length) * 100;
  const createParams = new URLSearchParams({
    template: selectedTemplate,
    fresh: "1",
    color: customization.primaryColor,
    font: customization.fontFamily,
    spacing: customization.spacing,
    titleScale: customization.titleScale,
  });
  const createTarget = `/editor/new?${createParams.toString()}`;
  const ctaFeedback = `O editor abrira com ${selectedTemplateMeta?.name}, fonte ${currentFontName}, espacamento ${currentSpacingName.toLowerCase()} e titulos ${currentTitleScaleName.toLowerCase()}.`;

  function updateCustomization(field, value) {
    setCustomization((current) => ({
      ...current,
      [field]: value,
    }));
  }

  return (
    <AppLayout
      footerProps={{ brandAsLink: false, showNavigation: false }}
      subtitle="Escolha o template em uma tela dedicada antes de entrar no editor. Isso deixa o fluxo mais direto e o preview mais coerente desde o inicio."
      title="Escolha seu template"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_360px]">
        <Panel
          description="Todos os modelos abaixo usam previews reais. Selecione o visual que melhor combina com o contexto da vaga antes de preencher o curriculo."
          title="Galeria de templates"
        >
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-brand-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-800">
                Fluxo recomendado
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700">
                Inicio / template / construcao / dashboard
              </span>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(255,255,255,0.92))] p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-700">Progresso do fluxo</p>
                  <p className="mt-2 text-sm font-semibold text-ink">Etapa 1 de 4: escolha do template</p>
                </div>
                <span className="rounded-full bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 shadow-[0_10px_20px_rgba(15,23,42,0.06)]">
                  {Math.round(flowProgressPercent)}%
                </span>
              </div>
              <div className="mt-4 h-2 rounded-full bg-white">
                <div
                  className="h-2 rounded-full bg-[linear-gradient(90deg,#0f766e_0%,#14b8a6_100%)] transition-all duration-300"
                  style={{ width: `${flowProgressPercent}%` }}
                />
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-4">
                {flowSteps.map((step, index) => {
                  const isActive = index === 0;

                  return (
                    <div
                      key={step}
                      className={`rounded-[18px] border px-3 py-3 text-center text-xs font-semibold uppercase tracking-[0.16em] ${
                        isActive
                          ? "border-ink bg-ink text-white shadow-[0_18px_35px_rgba(15,23,42,0.18)]"
                          : "border-slate-200 bg-white text-slate-500"
                      }`}
                    >
                      {step}
                    </div>
                  );
                })}
              </div>
            </div>

            <TemplatePicker mode="grid" onChange={setSelectedTemplate} value={selectedTemplate} />
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel
            description="A selecao abaixo define a base visual da nova versao antes de abrir o editor."
            title="Template e estilo inicial"
          >
            <div className="space-y-4">
              <div
                className="rounded-[24px] border border-slate-200 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))] p-5 transition duration-300"
                key={selectedTemplate}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-700">Selecionado agora</h3>
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-700">
                    Preview real
                  </span>
                </div>
                <h4 className="mt-2 text-2xl font-semibold tracking-tight text-ink">{selectedTemplateMeta?.name}</h4>
                <p className="mt-3 text-sm leading-7 text-slate-700">{selectedTemplateMeta?.description}</p>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(255,255,255,0.88))] p-4">
                <div className="mb-3 flex flex-col gap-1.5">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">Estilo inicial</h3>
                  <p className="text-xs leading-5 text-slate-700">
                    Defina a base visual antes de entrar no editor. Depois voce ainda pode refinar tudo com calma.
                  </p>
                </div>
                <div className="mb-3 flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-800 shadow-[0_8px_18px_rgba(15,23,42,0.05)]">
                    Cor: {customization.primaryColor.replace("#", "")}
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700 shadow-[0_8px_18px_rgba(15,23,42,0.05)]">
                    Fonte: {currentFontName}
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700 shadow-[0_8px_18px_rgba(15,23,42,0.05)]">
                    Espacamento: {currentSpacingName}
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700 shadow-[0_8px_18px_rgba(15,23,42,0.05)]">
                    Titulos: {currentTitleScaleName}
                  </span>
                </div>
                <CustomizationPanel compact customization={customization} onChange={updateCustomization} />
              </div>

              <div className="rounded-[24px] border border-ink/10 bg-[linear-gradient(160deg,rgba(15,23,42,0.96),rgba(31,41,55,0.94),rgba(15,118,110,0.9))] p-4 text-white shadow-[0_24px_60px_rgba(15,23,42,0.2)]">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">CTA principal</p>
                    <p className="mt-2 text-sm leading-6 text-white/82">Tudo pronto para abrir o editor com a base visual escolhida.</p>
                  </div>
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/82">
                    Etapa 2 na sequencia
                  </span>
                </div>
                <Button as={Link} className="w-full px-7 py-4" to={createTarget} variant="accent">
                  Continuar com {selectedTemplateMeta?.name}
                </Button>
                <p aria-live="polite" className="mt-3 text-sm leading-6 text-white/78">
                  {ctaFeedback}
                </p>
              </div>
            </div>
          </Panel>

          {draftInfo ? (
            <Panel
              description="Existe um rascunho salvo neste navegador. Voce pode retoma-lo sem passar pela criacao de uma nova versao."
              title="Rascunho local detectado"
            >
              <div className="space-y-4">
                <div className="rounded-[24px] border border-slate-200 bg-slate-50/85 p-5">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-700">Ultima atualizacao</h3>
                  <time className="mt-2 block text-lg font-semibold text-ink" dateTime={new Date(draftInfo.updatedAt).toISOString()}>
                    {formatMoment(draftInfo.updatedAt)}
                  </time>
                </div>

                <Button as={Link} className="w-full" to={appRoutes.editorNew} variant="secondary">
                  Retomar rascunho local
                </Button>
              </div>
            </Panel>
          ) : null}

          <Panel description="Visao resumida do caminho ideal para criar uma nova versao." title="Proximos passos">
            <div className="space-y-3">
              {[
                "Escolha o template que melhor representa sua apresentacao.",
                "Construa o curriculo no editor com preview ao vivo.",
                "Salve a versao e acompanhe tudo no dashboard.",
                "Gere o PDF final quando for o momento de enviar.",
              ].map((step, index) => (
                <div
                  key={step}
                  className="flex items-start gap-3 rounded-[20px] border border-slate-200 bg-white px-4 py-3"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="text-sm leading-6 text-slate-600">{step}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </AppLayout>
  );
}
