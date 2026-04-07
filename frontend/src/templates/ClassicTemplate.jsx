import { buildThemeTokens, escapeHtml, getResumeSnapshot, withLineBreaks, wrapDocument } from "./templateUtils";
import { ProfilePhoto, renderProfilePhotoMarkup } from "./templatePhoto";
import ResumeSection, { ResumeBlock } from "../components/resume/ResumeSection";

function Section({ title, theme, children, className = "" }) {
  return (
    <ResumeSection
      bodyClassName="mt-4"
      className={className}
      title={title}
      titleClassName="text-xs font-bold uppercase tracking-[0.36em]"
      titleStyle={{ color: theme.primaryColor }}
    >
      {children}
    </ResumeSection>
  );
}

export default function ClassicTemplate({ resume, theme = buildThemeTokens(resume.customization) }) {
  const snapshot = getResumeSnapshot(resume);

  return (
    <article className="rounded-[28px] bg-white p-10 shadow-[0_20px_70px_rgba(15,23,42,0.12)]" style={{ fontFamily: theme.fontFamily }}>
      <header className="border-b pb-6" style={{ borderColor: theme.lineColor }}>
        <p className="text-xs font-semibold uppercase tracking-[0.36em]" style={{ color: theme.primaryColor }}>
          {snapshot.title || "Curriculo profissional"}
        </p>
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-semibold tracking-tight" style={{ fontSize: theme.titleSize }}>
              {snapshot.personal.fullName || "Seu nome"}
            </h1>
            <p className="mt-3 text-lg text-slate-600">{snapshot.personal.role || "Seu cargo principal"}</p>
          </div>
          <div className="max-w-[300px] text-sm leading-6 text-slate-500 md:text-right">
            {snapshot.personal.photo ? (
              <div className="mb-4 flex md:justify-end">
                <ProfilePhoto
                  alt={snapshot.personal.fullName || "Foto profissional"}
                  className="border-slate-200"
                  height={104}
                  photo={snapshot.personal.photo}
                  width={104}
                />
              </div>
            ) : null}
            {snapshot.contactLines.join(" • ") || "Dados de contato e links profissionais"}
          </div>
        </div>
      </header>

      <div className="space-y-6" style={{ marginTop: theme.sectionGap }}>
        <Section className="" theme={theme} title="Objetivo profissional">
          <p className="text-[15px] leading-7 text-slate-700">
            {snapshot.objective || "Explique com clareza a direcao profissional buscada."}
          </p>
        </Section>

        <Section theme={theme} title="Resumo profissional">
          <p className="text-[15px] leading-7 text-slate-700">
            {snapshot.summary || "Apresente sua senioridade, contexto e principais pontos de valor."}
          </p>
        </Section>

        <Section theme={theme} title="Experiencia profissional">
          <div className="space-y-5">
            {snapshot.experience.map((item) => (
              <ResumeBlock key={item.id}>
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{item.role}</p>
                    <p className="text-sm font-medium text-slate-500">{item.company}</p>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: theme.primaryColor }}>
                    {item.period}
                  </span>
                </div>
                <p className="mt-3 text-[15px] leading-7 text-slate-700">{item.description}</p>
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
                  <p className="text-sm text-slate-500">{[item.issuer, item.year].filter(Boolean).join(" • ")}</p>
                </ResumeBlock>
              ))}
            </div>
          </Section>
        </div>

        <Section theme={theme} title="Habilidades e idiomas">
          <div className="flex flex-wrap gap-2">
            {snapshot.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full px-4 py-2 text-sm font-semibold"
                style={{ backgroundColor: theme.softTint, color: theme.primaryColor }}
              >
                {skill}
              </span>
            ))}
            {snapshot.languages.map((item) => (
              <span
                key={item.id}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
              >
                {item.name} {item.level ? `• ${item.level}` : ""}
              </span>
            ))}
          </div>
        </Section>

        <Section theme={theme} title="Projetos">
          <div className="space-y-5">
            {snapshot.projects.map((item) => (
              <ResumeBlock key={item.id}>
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <p className="text-sm text-slate-500">{item.technologies}</p>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: theme.primaryColor }}>
                    {item.link}
                  </span>
                </div>
                <p className="mt-3 text-[15px] leading-7 text-slate-700">{item.description}</p>
              </ResumeBlock>
            ))}
          </div>
        </Section>

        {snapshot.additionalInfo ? (
          <Section theme={theme} title="Informacoes adicionais">
            <p className="text-[15px] leading-7 text-slate-700">{snapshot.additionalInfo}</p>
          </Section>
        ) : null}
      </div>
    </article>
  );
}

export function renderClassicDocument(resume, options = {}) {
  const theme = buildThemeTokens(resume.customization);
  const snapshot = getResumeSnapshot(resume);

  return wrapDocument(
    `
      <article style="border-radius:28px;background:#ffffff;padding:40px;box-shadow:0 20px 70px rgba(15,23,42,0.12);">
        <header style="padding-bottom:24px;border-bottom:1px solid ${theme.lineColor};">
          <div style="font-size:12px;font-weight:700;letter-spacing:0.36em;text-transform:uppercase;color:${theme.primaryColor};">${escapeHtml(snapshot.title || "Curriculo profissional")}</div>
          <div style="display:flex;justify-content:space-between;gap:24px;align-items:flex-end;margin-top:16px;">
            <div>
              <div style="font-size:${theme.titleSize};font-weight:700;letter-spacing:-0.04em;">${escapeHtml(snapshot.personal.fullName || "Seu nome")}</div>
              <div style="font-size:18px;color:${theme.mutedColor};margin-top:12px;">${escapeHtml(snapshot.personal.role || "Seu cargo principal")}</div>
            </div>
            <div style="max-width:300px;font-size:13px;line-height:1.8;color:${theme.mutedColor};text-align:right;">
              ${
                snapshot.personal.photo
                  ? `<div style="display:flex;justify-content:flex-end;margin-bottom:14px;">${renderProfilePhotoMarkup({
                      photo: snapshot.personal.photo,
                      alt: snapshot.personal.fullName || "Foto profissional",
                      width: 104,
                      height: 104,
                      radius: "28px",
                      borderColor: "#e2e8f0",
                      background: "#f8fafc",
                    })}</div>`
                  : ""
              }
              ${escapeHtml(snapshot.contactLines.join(" • ") || "Dados de contato e links profissionais")}
            </div>
          </div>
        </header>

        <section style="margin-top:${theme.sectionGap};">
          <div style="font-size:12px;font-weight:700;letter-spacing:0.36em;text-transform:uppercase;color:${theme.primaryColor};">Objetivo profissional</div>
          <p style="font-size:15px;line-height:1.8;color:${theme.mutedColor};margin:12px 0 0;">${withLineBreaks(snapshot.objective || "Explique com clareza a direcao profissional buscada.")}</p>
        </section>

        <section style="margin-top:${theme.sectionGap};">
          <div style="font-size:12px;font-weight:700;letter-spacing:0.36em;text-transform:uppercase;color:${theme.primaryColor};">Resumo profissional</div>
          <p style="font-size:15px;line-height:1.8;color:${theme.mutedColor};margin:12px 0 0;">${withLineBreaks(snapshot.summary || "Apresente sua senioridade, contexto e principais pontos de valor.")}</p>
        </section>

        <section style="margin-top:${theme.sectionGap};">
          <div style="font-size:12px;font-weight:700;letter-spacing:0.36em;text-transform:uppercase;color:${theme.primaryColor};">Experiencia profissional</div>
          ${snapshot.experience
            .map(
              (item) => `
                <div style="margin-top:18px;">
                  <div style="display:flex;justify-content:space-between;gap:16px;align-items:flex-start;">
                    <div>
                      <div style="font-size:18px;font-weight:700;">${escapeHtml(item.role)}</div>
                      <div style="font-size:14px;color:${theme.mutedColor};margin-top:4px;">${escapeHtml(item.company)}</div>
                    </div>
                    <div style="font-size:13px;font-weight:700;color:${theme.primaryColor};">${escapeHtml(item.period)}</div>
                  </div>
                  <p style="font-size:15px;line-height:1.8;color:${theme.mutedColor};margin:12px 0 0;">${withLineBreaks(item.description)}</p>
                </div>`,
            )
            .join("")}
        </section>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:${theme.sectionGap};">
          <section>
            <div style="font-size:12px;font-weight:700;letter-spacing:0.36em;text-transform:uppercase;color:${theme.primaryColor};">Formacao</div>
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
            <div style="font-size:12px;font-weight:700;letter-spacing:0.36em;text-transform:uppercase;color:${theme.primaryColor};">Certificacoes</div>
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

        <section style="margin-top:${theme.sectionGap};">
          <div style="font-size:12px;font-weight:700;letter-spacing:0.36em;text-transform:uppercase;color:${theme.primaryColor};">Habilidades e idiomas</div>
          <div style="margin-top:12px;">
            ${snapshot.skills
              .map(
                (skill) => `<span style="display:inline-flex;margin:8px 8px 0 0;border-radius:999px;padding:10px 16px;background:${theme.softTint};font-size:14px;font-weight:700;color:${theme.primaryColor};">${escapeHtml(skill)}</span>`,
              )
              .join("")}
            ${snapshot.languages
              .map(
                (item) => `<span style="display:inline-flex;margin:8px 8px 0 0;border-radius:999px;padding:10px 16px;border:1px solid #e2e8f0;font-size:14px;font-weight:700;color:${theme.mutedColor};">${escapeHtml(item.name)}${item.level ? ` • ${escapeHtml(item.level)}` : ""}</span>`,
              )
              .join("")}
          </div>
        </section>

        <section style="margin-top:${theme.sectionGap};">
          <div style="font-size:12px;font-weight:700;letter-spacing:0.36em;text-transform:uppercase;color:${theme.primaryColor};">Projetos</div>
          ${snapshot.projects
            .map(
              (item) => `
                <div style="margin-top:18px;">
                  <div style="display:flex;justify-content:space-between;gap:16px;align-items:flex-start;">
                    <div>
                      <div style="font-weight:700;">${escapeHtml(item.name)}</div>
                      <div style="font-size:14px;color:${theme.mutedColor};margin-top:4px;">${escapeHtml(item.technologies)}</div>
                    </div>
                    <div style="font-size:13px;font-weight:700;color:${theme.primaryColor};">${escapeHtml(item.link)}</div>
                  </div>
                  <p style="font-size:15px;line-height:1.8;color:${theme.mutedColor};margin:12px 0 0;">${withLineBreaks(item.description)}</p>
                </div>`,
            )
            .join("")}
        </section>

        ${
          snapshot.additionalInfo
            ? `<section style="margin-top:${theme.sectionGap};">
                <div style="font-size:12px;font-weight:700;letter-spacing:0.36em;text-transform:uppercase;color:${theme.primaryColor};">Informacoes adicionais</div>
                <p style="font-size:15px;line-height:1.8;color:${theme.mutedColor};margin:12px 0 0;">${withLineBreaks(snapshot.additionalInfo)}</p>
              </section>`
            : ""
        }
      </article>
    `,
    theme,
    "#f8fafc",
    options,
  );
}
