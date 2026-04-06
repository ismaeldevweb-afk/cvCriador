import { buildThemeTokens, getTemplateComponent } from "../templates/templateRegistry";

export default function ResumePreview({ resume, compact = false }) {
  const TemplateComponent = getTemplateComponent(resume.template);
  const theme = buildThemeTokens(resume.customization);

  return (
    <div className="overflow-hidden rounded-[32px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(255,255,255,0.84))] shadow-float">
      <div className="flex items-center justify-between border-b border-white/70 bg-white/85 px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">Preview</p>
          <p className="mt-1 text-sm text-slate-500">Atualizacao em tempo real com template {resume.template}.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            {resume.customization.fontFamily}
          </span>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Live</span>
        </div>
      </div>
      <div className={compact ? "max-h-none bg-[#eef2f7] p-4" : "max-h-[calc(100vh-12rem)] overflow-auto bg-[#eef2f7] p-4"}>
        <div className="mb-4 flex items-center justify-between rounded-[22px] border border-white/70 bg-white/75 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 shadow-[0_12px_25px_rgba(15,23,42,0.05)]">
          <span>Canvas</span>
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: theme.primaryColor }} />
            pronto para exportacao
          </span>
        </div>
        <TemplateComponent resume={resume} theme={theme} />
      </div>
    </div>
  );
}
