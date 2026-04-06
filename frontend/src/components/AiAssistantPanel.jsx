import Button from "./Button";
import Panel from "./Panel";
import { cn } from "../utils/cn";

function ActionRow({ title, description, actionLabel, busy, onClick, compact = false }) {
  return (
    <div
      className={cn(
        "border border-slate-200 bg-[linear-gradient(145deg,#ffffff_0%,#f8fafc_100%)] shadow-[0_12px_30px_rgba(15,23,42,0.05)]",
        compact ? "rounded-[20px] p-3" : "rounded-[24px] p-4",
      )}
    >
      <div className={cn("flex flex-col", compact ? "gap-3" : "gap-4")}>
        <div className={cn("flex items-start", compact ? "gap-2.5" : "gap-3")}>
          <div
            className={cn(
              "mt-0.5 flex shrink-0 items-center justify-center bg-brand-50 font-bold uppercase tracking-[0.16em] text-brand-600",
              compact ? "h-8 w-8 rounded-xl text-[10px]" : "h-9 w-9 rounded-2xl text-xs",
            )}
          >
            IA
          </div>
          <div>
            <p className={cn("font-semibold text-ink", compact ? "text-sm" : undefined)}>{title}</p>
            <p className={cn("mt-1 text-slate-500", compact ? "text-xs leading-5" : "text-sm leading-6")}>{description}</p>
          </div>
        </div>
        <Button className={cn("w-full", compact ? "px-3 py-2.5 text-xs" : undefined)} disabled={busy} onClick={onClick} variant="accent">
          {busy ? "Processando..." : actionLabel}
        </Button>
      </div>
    </div>
  );
}

export default function AiAssistantPanel({
  busyActions,
  onImproveSummary,
  onGenerateSummary,
  onSuggestSkills,
  onRewriteObjective,
  embedded = false,
  compact = false,
}) {
  const content = (
    <>
      <div
        className={cn(
          "mb-4 rounded-[22px] bg-slate-50 text-slate-600",
          compact
            ? "px-3 py-2.5 text-[11px] leading-5"
            : embedded
              ? "px-3.5 py-3 text-xs leading-6"
              : "px-4 py-4 text-sm leading-7",
        )}
      >
        Estes atalhos representam a camada inteligente planejada para a proxima fase do produto. Hoje eles servem como uma demonstracao funcional do fluxo.
      </div>
      <div className={cn(compact ? "space-y-2.5" : "space-y-3")}>
        <ActionRow
          actionLabel="Melhorar resumo"
          busy={busyActions.summary}
          compact={compact}
          description="Reescreve o resumo profissional com mais clareza e tom executivo."
          onClick={onImproveSummary}
          title="Otimizar texto do resumo"
        />
        <ActionRow
          actionLabel="Gerar resumo"
          busy={busyActions.generatedSummary}
          compact={compact}
          description="Usa cargo e experiencias preenchidas para gerar um resumo inicial."
          onClick={onGenerateSummary}
          title="Gerar resumo automatico"
        />
        <ActionRow
          actionLabel="Sugerir habilidades"
          busy={busyActions.skills}
          compact={compact}
          description="Sugere habilidades alinhadas ao cargo desejado."
          onClick={onSuggestSkills}
          title="Sugerir skills"
        />
        <ActionRow
          actionLabel="Reescrever objetivo"
          busy={busyActions.objective}
          compact={compact}
          description="Refina o objetivo profissional para ficar mais atrativo."
          onClick={onRewriteObjective}
          title="Reescrever objetivo"
        />
      </div>
    </>
  );

  if (embedded) {
    return content;
  }

  return (
    <Panel
      description="Camada de assistente preparada para receber integracao mais robusta no curto prazo."
      title="Assistente inteligente em breve"
    >
      {content}
    </Panel>
  );
}
