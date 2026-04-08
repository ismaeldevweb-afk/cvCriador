import { buildThemeTokens, escapeHtml, getResumeSnapshot, withLineBreaks, wrapDocument } from "./templateUtils";
import { ProfilePhoto, renderProfilePhotoMarkup } from "./templatePhoto";
import ResumeSection, { ResumeBlock } from "../components/resume/ResumeSection";

function Section({ title, theme, children }) {
  return (
    <ResumeSection
      bodyClassName="mt-4"
      title={title}
      titleClassName="text-xs font-bold uppercase tracking-[0.34em]"
      titleStyle={{ color: theme.primaryColor }}
    >
      {children}
    </ResumeSection>
  );
}

export default function ModernTemplate({ resume, theme = buildThemeTokens(resume.customization) }) {
  const snapshot = getResumeSnapshot(resume);

  return (
    <article className="overflow-hidden rounded-[28px] bg-white shadow-[0_20px_70px_rgba(15,23,42,0.12)]" style={{ fontFamily: theme.fontFamily }}>
      <div className="grid lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="p-8 text-white" style={{ backgroundColor: theme.primaryColor }}>
          {snapshot.personal.photo ? (
            <div className="mb-6">
              <ProfilePhoto
                alt={snapshot.personal.fullName || "Foto profissional"}
                className="border-white/18 bg-white/10"
                height={116}
                photo={snapshot.personal.photo}
                width={116}
              />
            </div>
          ) : null}
          <p className="text-xs uppercase tracking-[0.34em] text-white/88">Perfil</p>
          <p className="mt-5 font-semibold tracking-tight" style={{ fontSize: theme.titleSize }}>
            {snapshot.personal.fullName || "Seu nome"}
          </p>
          <p className="mt-3 text-sm leading-7 text-white/92">{snapshot.personal.role || "Seu cargo principal"}</p>

          <div className="mt-8 space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.34em] text-white/88">Contato</p>
              <div className="mt-3 space-y-2 text-sm leading-6 text-white/95">
                {snapshot.contactLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.34em] text-white/88">Skills</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {snapshot.skills.map((skill) => (
                  <span key={skill} className="rounded-full border border-white/20 px-3 py-2 text-xs font-semibold">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.34em] text-white/88">Idiomas</p>
              <div className="mt-3 space-y-2 text-sm leading-6 text-white/95">
                {snapshot.languages.map((item) => (
                  <p key={item.id}>
                    {item.name} {item.level ? `• ${item.level}` : ""}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 p-8 lg:p-10" style={{ gap: theme.sectionGap }}>
          <Section theme={theme} title="Objetivo">
            <p className="text-[15px] leading-7 text-slate-700">
              {snapshot.objective || "Descreva o objetivo da sua proxima fase profissional."}
            </p>
          </Section>

          <Section theme={theme} title="Resumo profissional">
            <p className="text-[15px] leading-7 text-slate-700">
              {snapshot.summary || "Adicione um resumo com contexto, senioridade e principais diferenciais."}
            </p>
          </Section>

          <Section theme={theme} title="Experiencia profissional">
            <div className="space-y-5">
              {snapshot.experience.map((item) => (
                <ResumeBlock key={item.id} className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-5">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{item.role}</p>
                      <p className="text-sm font-medium text-slate-500">{item.company}</p>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: theme.primaryColor }}>
                      {item.period}
                    </span>
                  </div>
                  <p className="mt-4 text-[15px] leading-7 text-slate-700">{item.description}</p>
                </ResumeBlock>
              ))}
            </div>
          </Section>

          <Section theme={theme} title="Projetos">
            <div className="space-y-4">
              {snapshot.projects.map((item) => (
                <ResumeBlock key={item.id} className="rounded-[22px] border border-slate-200 p-5">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="text-sm text-slate-500">{item.technologies}</p>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: theme.primaryColor }}>
                      {item.link}
                    </span>
                  </div>
                  <p className="mt-4 text-[15px] leading-7 text-slate-700">{item.description}</p>
                </ResumeBlock>
              ))}
            </div>
          </Section>

          <div className="grid gap-6 md:grid-cols-2">
            <Section theme={theme} title="Formacao">
              <div className="space-y-4">
                {snapshot.education.map((item) => (
                  <ResumeBlock key={item.id}>
                    <p className="font-semibold text-slate-900">{item.course}</p>
                    <p className="text-sm text-slate-500">{item.institution}</p>
                    <p className="mt-2 text-sm font-semibold" style={{ color: theme.primaryColor }}>
                      {item.period}
                    </p>
                  </ResumeBlock>
                ))}
              </div>
            </Section>

            <Section theme={theme} title="Certificacoes">
              <div className="space-y-4">
                {snapshot.certifications.map((item) => (
                  <ResumeBlock key={item.id}>
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <p className="text-sm text-slate-500">
                      {[item.issuer, item.year].filter(Boolean).join(" • ")}
                    </p>
                  </ResumeBlock>
                ))}
              </div>
            </Section>
          </div>

          {snapshot.additionalInfo ? (
            <Section theme={theme} title="Informacoes adicionais">
              <p className="text-[15px] leading-7 text-slate-700">{snapshot.additionalInfo}</p>
            </Section>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function renderModernDocument(resume, options = {}) {
  const theme = buildThemeTokens(resume.customization);
  const snapshot = getResumeSnapshot(resume);

  return wrapDocument(
    `
      <article style="overflow:hidden;border-radius:28px;background:#ffffff;box-shadow:0 20px 70px rgba(15,23,42,0.12);">
        <div style="display:grid;grid-template-columns:260px minmax(0, 1fr);">
          <aside style="padding:32px;background:${theme.primaryColor};color:#ffffff;">
            ${
              snapshot.personal.photo
                ? `<div style="margin-bottom:24px;">${renderProfilePhotoMarkup({
                    photo: snapshot.personal.photo,
                    alt: snapshot.personal.fullName || "Foto profissional",
                    width: 116,
                    height: 116,
                    radius: "28px",
                    borderColor: "rgba(255,255,255,0.18)",
                    background: "rgba(255,255,255,0.1)",
                  })}</div>`
                : ""
            }
            <div style="font-size:12px;letter-spacing:0.34em;text-transform:uppercase;color:rgba(255,255,255,0.65);">Perfil</div>
            <div style="font-size:${theme.titleSize};font-weight:700;letter-spacing:-0.04em;margin-top:20px;">${escapeHtml(snapshot.personal.fullName || "Seu nome")}</div>
            <div style="font-size:14px;line-height:1.8;color:rgba(255,255,255,0.82);margin-top:12px;">${escapeHtml(snapshot.personal.role || "Seu cargo principal")}</div>
            <div style="margin-top:28px;font-size:12px;letter-spacing:0.34em;text-transform:uppercase;color:rgba(255,255,255,0.65);">Contato</div>
            <div style="margin-top:12px;font-size:13px;line-height:1.8;color:rgba(255,255,255,0.85);">${snapshot.contactLines.map((line) => `<div>${escapeHtml(line)}</div>`).join("")}</div>
            <div style="margin-top:28px;font-size:12px;letter-spacing:0.34em;text-transform:uppercase;color:rgba(255,255,255,0.65);">Skills</div>
            <div style="margin-top:12px;">${snapshot.skills
              .map((skill) => `<span style="display:inline-flex;margin:8px 8px 0 0;border-radius:999px;border:1px solid rgba(255,255,255,0.2);padding:8px 12px;font-size:12px;font-weight:700;color:#ffffff;">${escapeHtml(skill)}</span>`)
              .join("")}</div>
            <div style="margin-top:28px;font-size:12px;letter-spacing:0.34em;text-transform:uppercase;color:rgba(255,255,255,0.65);">Idiomas</div>
            <div style="margin-top:12px;font-size:13px;line-height:1.8;color:rgba(255,255,255,0.85);">${snapshot.languages
              .map((item) => `<div>${escapeHtml(item.name)}${item.level ? ` • ${escapeHtml(item.level)}` : ""}</div>`)
              .join("")}</div>
          </aside>
          <div style="padding:32px 40px;">
            <div style="font-size:12px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Objetivo</div>
            <p style="font-size:15px;line-height:1.8;color:${theme.mutedColor};margin:14px 0 0;">${withLineBreaks(snapshot.objective || "Descreva o objetivo da sua proxima fase profissional.")}</p>

            <div style="font-size:12px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};margin-top:${theme.sectionGap};">Resumo profissional</div>
            <p style="font-size:15px;line-height:1.8;color:${theme.mutedColor};margin:14px 0 0;">${withLineBreaks(snapshot.summary || "Adicione um resumo com contexto, senioridade e principais diferenciais.")}</p>

            <div style="font-size:12px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};margin-top:${theme.sectionGap};">Experiencia profissional</div>
            ${snapshot.experience
              .map(
                (item) => `
                  <div style="margin-top:18px;border:1px solid #e2e8f0;border-radius:22px;background:rgba(248,250,252,0.9);padding:20px;">
                    <div style="display:flex;justify-content:space-between;gap:16px;align-items:flex-start;">
                      <div>
                        <div style="font-size:18px;font-weight:700;">${escapeHtml(item.role)}</div>
                        <div style="font-size:14px;color:${theme.mutedColor};margin-top:4px;">${escapeHtml(item.company)}</div>
                      </div>
                      <div style="font-size:13px;font-weight:700;color:${theme.primaryColor};">${escapeHtml(item.period)}</div>
                    </div>
                    <p style="font-size:15px;line-height:1.8;color:${theme.mutedColor};margin:14px 0 0;">${withLineBreaks(item.description)}</p>
                  </div>`,
              )
              .join("")}

            <div style="font-size:12px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};margin-top:${theme.sectionGap};">Projetos</div>
            ${snapshot.projects
              .map(
                (item) => `
                  <div style="margin-top:16px;border:1px solid #e2e8f0;border-radius:22px;padding:20px;">
                    <div style="display:flex;justify-content:space-between;gap:16px;align-items:flex-start;">
                      <div>
                        <div style="font-weight:700;">${escapeHtml(item.name)}</div>
                        <div style="font-size:14px;color:${theme.mutedColor};margin-top:4px;">${escapeHtml(item.technologies)}</div>
                      </div>
                      <div style="font-size:13px;font-weight:700;color:${theme.primaryColor};">${escapeHtml(item.link)}</div>
                    </div>
                    <p style="font-size:15px;line-height:1.8;color:${theme.mutedColor};margin:14px 0 0;">${withLineBreaks(item.description)}</p>
                  </div>`,
              )
              .join("")}

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:${theme.sectionGap};">
              <section>
                <div style="font-size:12px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Formacao</div>
                ${snapshot.education
                  .map(
                    (item) => `
                      <div style="margin-top:14px;">
                        <div style="font-weight:700;">${escapeHtml(item.course)}</div>
                        <div style="font-size:14px;color:${theme.mutedColor};margin-top:4px;">${escapeHtml(item.institution)}</div>
                        <div style="font-size:13px;font-weight:700;color:${theme.primaryColor};margin-top:8px;">${escapeHtml(item.period)}</div>
                      </div>`,
                  )
                  .join("")}
              </section>
              <section>
                <div style="font-size:12px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Certificacoes</div>
                ${snapshot.certifications
                  .map(
                    (item) => `
                      <div style="margin-top:14px;">
                        <div style="font-weight:700;">${escapeHtml(item.name)}</div>
                        <div style="font-size:14px;color:${theme.mutedColor};margin-top:4px;">${escapeHtml([item.issuer, item.year].filter(Boolean).join(" • "))}</div>
                      </div>`,
                  )
                  .join("")}
              </section>
            </div>

            ${
              snapshot.additionalInfo
                ? `<div style="font-size:12px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};margin-top:${theme.sectionGap};">Informacoes adicionais</div>
                   <p style="font-size:15px;line-height:1.8;color:${theme.mutedColor};margin:14px 0 0;">${withLineBreaks(snapshot.additionalInfo)}</p>`
                : ""
            }
          </div>
        </div>
      </article>
    `,
    theme,
    "#f8fafc",
    options,
  );
}
