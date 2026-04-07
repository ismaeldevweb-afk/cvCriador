import { buildThemeTokens, escapeHtml, getResumeSnapshot, withLineBreaks, wrapDocument } from "./templateUtils";
import { ProfilePhoto, renderProfilePhotoMarkup } from "./templatePhoto";

function SectionTitle({ theme, children }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.38em]" style={{ color: theme.primaryColor }}>
      {children}
    </p>
  );
}

function Surface({ theme, title, children, className = "" }) {
  return (
    <section className={`rounded-[26px] border bg-white/92 p-6 ${className}`} style={{ borderColor: theme.lineColor }}>
      <SectionTitle theme={theme}>{title}</SectionTitle>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function AtelierTemplate({ resume, theme = buildThemeTokens(resume.customization) }) {
  const snapshot = getResumeSnapshot(resume);
  const hasPhoto = Boolean(snapshot.personal.photo);
  const contactLines = snapshot.contactLines.length > 0 ? snapshot.contactLines : ["Dados de contato e links profissionais"];

  return (
    <article className="overflow-hidden rounded-[34px] bg-[#fffaf4] shadow-[0_24px_72px_rgba(15,23,42,0.12)]" style={{ fontFamily: theme.fontFamily }}>
      <header className="border-b px-8 pb-8 pt-10 lg:px-10" style={{ borderColor: theme.lineColor }}>
        <div className={hasPhoto ? "grid gap-8 lg:grid-cols-[180px_minmax(0,1fr)]" : "grid gap-8"}>
          {hasPhoto ? (
            <div className="space-y-4">
              <ProfilePhoto
                alt={snapshot.personal.fullName || "Foto profissional"}
                className="border-slate-200 bg-white"
                height={180}
                photo={snapshot.personal.photo}
                radius="34px"
                width={180}
              />
              <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-sm leading-7 text-slate-600">
                {contactLines.slice(0, 5).map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>
          ) : null}

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em]" style={{ color: theme.primaryColor }}>
              {snapshot.title || "Atelier profissional"}
            </p>
            <h1 className="mt-6 max-w-4xl font-semibold tracking-tight text-slate-950" style={{ fontSize: theme.titleSize }}>
              {snapshot.personal.fullName || "Seu nome"}
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
              {snapshot.personal.role || "Narrativa visual com refinamento editorial para posicionar repertorio, autoria e direcao criativa."}
            </p>
            <div className="mt-6 rounded-[30px] border bg-white/80 px-6 py-5" style={{ borderColor: theme.lineColor }}>
              <p className="text-[18px] leading-9 text-slate-700">
                {snapshot.summary || "Use este espaco como carta de abertura: explique senioridade, foco de atuacao e o tipo de resultado que sua presenca gera."}
              </p>
            </div>
            {!hasPhoto ? (
              <div className="mt-6 flex flex-wrap gap-2">
                {contactLines.slice(0, 6).map((line) => (
                  <span
                    key={line}
                    className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600"
                  >
                    {line}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <div className="grid gap-6 p-8 lg:grid-cols-[1.08fr_0.92fr] lg:p-10">
        <main className="space-y-6">
          <Surface theme={theme} title="Experiencia profissional">
            <div className="space-y-5">
              {snapshot.experience.map((item) => (
                <div key={item.id} className="rounded-[22px] bg-[#fff7ed] p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xl font-semibold tracking-tight text-slate-950">{item.role}</p>
                      <p className="text-sm text-slate-500">{item.company}</p>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: theme.primaryColor }}>
                      {item.period}
                    </span>
                  </div>
                  <p className="mt-4 text-[15px] leading-8 text-slate-700">{item.description}</p>
                </div>
              ))}
            </div>
          </Surface>

          <Surface theme={theme} title="Projetos selecionados">
            <div className="grid gap-4">
              {snapshot.projects.map((item) => (
                <div key={item.id} className="rounded-[22px] border border-slate-200 bg-white p-5">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-semibold text-slate-950">{item.name}</p>
                      <p className="text-sm text-slate-500">{item.technologies}</p>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: theme.primaryColor }}>
                      {item.link}
                    </span>
                  </div>
                  <p className="mt-3 text-[15px] leading-7 text-slate-700">{item.description}</p>
                </div>
              ))}
            </div>
          </Surface>
        </main>

        <aside className="space-y-6">
          <Surface theme={theme} title="Objetivo">
            <p className="text-[15px] leading-7 text-slate-700">
              {snapshot.objective || "Descreva a proxima fase desejada da carreira e o tipo de contexto em que voce quer criar impacto."}
            </p>
          </Surface>

          <Surface theme={theme} title="Formacao">
            <div className="space-y-4">
              {snapshot.education.map((item) => (
                <div key={item.id}>
                  <p className="font-semibold text-slate-950">{item.course}</p>
                  <p className="text-sm text-slate-500">{item.institution}</p>
                  <p className="mt-2 text-sm font-semibold" style={{ color: theme.primaryColor }}>
                    {item.period}
                  </p>
                </div>
              ))}
            </div>
          </Surface>

          <Surface theme={theme} title="Competencias">
            <div className="flex flex-wrap gap-2">
              {snapshot.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full px-4 py-2 text-xs font-semibold"
                  style={{ backgroundColor: theme.softTint, color: theme.primaryColor }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </Surface>

          <Surface theme={theme} title="Idiomas e certificacoes">
            <div className="space-y-4">
              {snapshot.languages.map((item) => (
                <div key={item.id}>
                  <p className="font-semibold text-slate-950">{item.name}</p>
                  <p className="text-sm text-slate-500">{item.level}</p>
                </div>
              ))}
              {snapshot.certifications.map((item) => (
                <div key={item.id}>
                  <p className="font-semibold text-slate-950">{item.name}</p>
                  <p className="text-sm text-slate-500">{[item.issuer, item.year].filter(Boolean).join(" • ")}</p>
                </div>
              ))}
            </div>
          </Surface>

          {snapshot.additionalInfo ? (
            <Surface theme={theme} title="Informacoes adicionais">
              <p className="text-[15px] leading-7 text-slate-700">{snapshot.additionalInfo}</p>
            </Surface>
          ) : null}
        </aside>
      </div>
    </article>
  );
}

export function renderAtelierDocument(resume, options = {}) {
  const theme = buildThemeTokens(resume.customization);
  const snapshot = getResumeSnapshot(resume);
  const hasPhoto = Boolean(snapshot.personal.photo);
  const contactMarkup = (snapshot.contactLines.length > 0 ? snapshot.contactLines : ["Dados de contato e links profissionais"])
    .slice(0, 6)
    .map((line) => `<div>${escapeHtml(line)}</div>`)
    .join("");
  const inlineContactMarkup = (snapshot.contactLines.length > 0 ? snapshot.contactLines : ["Dados de contato e links profissionais"])
    .slice(0, 6)
    .map(
      (line) =>
        `<span style="display:inline-flex;margin:8px 8px 0 0;border-radius:999px;border:1px solid #e2e8f0;background:#ffffff;padding:10px 14px;font-size:12px;font-weight:700;color:${theme.mutedColor};">${escapeHtml(line)}</span>`,
    )
    .join("");
  const experienceMarkup = snapshot.experience
    .map(
      (item) => `
        <div style="margin-top:18px;border-radius:22px;background:#fff7ed;padding:20px;">
          <div style="display:flex;justify-content:space-between;gap:16px;align-items:flex-start;">
            <div>
              <div style="font-size:20px;font-weight:700;letter-spacing:-0.03em;color:#020617;">${escapeHtml(item.role)}</div>
              <div style="font-size:14px;color:${theme.mutedColor};margin-top:4px;">${escapeHtml(item.company)}</div>
            </div>
            <div style="font-size:13px;font-weight:700;color:${theme.primaryColor};">${escapeHtml(item.period)}</div>
          </div>
          <p style="font-size:15px;line-height:1.9;color:${theme.mutedColor};margin:14px 0 0;">${withLineBreaks(item.description)}</p>
        </div>`,
    )
    .join("");
  const projectsMarkup = snapshot.projects
    .map(
      (item) => `
        <div style="margin-top:16px;border:1px solid #e2e8f0;border-radius:22px;background:#ffffff;padding:20px;">
          <div style="display:flex;justify-content:space-between;gap:16px;align-items:flex-start;">
            <div>
              <div style="font-weight:700;color:#020617;">${escapeHtml(item.name)}</div>
              <div style="font-size:14px;color:${theme.mutedColor};margin-top:4px;">${escapeHtml(item.technologies)}</div>
            </div>
            <div style="font-size:13px;font-weight:700;color:${theme.primaryColor};">${escapeHtml(item.link)}</div>
          </div>
          <p style="font-size:15px;line-height:1.8;color:${theme.mutedColor};margin:12px 0 0;">${withLineBreaks(item.description)}</p>
        </div>`,
    )
    .join("");
  const educationMarkup = snapshot.education
    .map(
      (item) => `
        <div style="margin-top:14px;">
          <div style="font-weight:700;color:#020617;">${escapeHtml(item.course)}</div>
          <div style="font-size:14px;color:${theme.mutedColor};margin-top:4px;">${escapeHtml(item.institution)}</div>
          <div style="font-size:13px;font-weight:700;color:${theme.primaryColor};margin-top:8px;">${escapeHtml(item.period)}</div>
        </div>`,
    )
    .join("");
  const skillsMarkup = snapshot.skills
    .map(
      (skill) =>
        `<span style="display:inline-flex;margin:8px 8px 0 0;border-radius:999px;padding:10px 16px;background:${theme.softTint};font-size:12px;font-weight:700;color:${theme.primaryColor};">${escapeHtml(skill)}</span>`,
    )
    .join("");
  const languagesMarkup = snapshot.languages
    .map(
      (item) => `
        <div style="margin-top:12px;">
          <div style="font-weight:700;color:#020617;">${escapeHtml(item.name)}</div>
          <div style="font-size:14px;color:${theme.mutedColor};margin-top:4px;">${escapeHtml(item.level)}</div>
        </div>`,
    )
    .join("");
  const certificationsMarkup = snapshot.certifications
    .map(
      (item) => `
        <div style="margin-top:12px;">
          <div style="font-weight:700;color:#020617;">${escapeHtml(item.name)}</div>
          <div style="font-size:14px;color:${theme.mutedColor};margin-top:4px;">${escapeHtml([item.issuer, item.year].filter(Boolean).join(" • "))}</div>
        </div>`,
    )
    .join("");

  return wrapDocument(
    `
      <article style="overflow:hidden;border-radius:34px;background:#fffaf4;box-shadow:0 24px 72px rgba(15,23,42,0.12);">
        <header style="border-bottom:1px solid ${theme.lineColor};padding:40px 40px 32px;">
          <div style="display:grid;grid-template-columns:${hasPhoto ? "180px minmax(0, 1fr)" : "minmax(0, 1fr)"};gap:32px;">
            ${
              hasPhoto
                ? `<div>
                    ${renderProfilePhotoMarkup({
                      photo: snapshot.personal.photo,
                      alt: snapshot.personal.fullName || "Foto profissional",
                      width: 180,
                      height: 180,
                      radius: "34px",
                      borderColor: "#e2e8f0",
                      background: "#ffffff",
                    })}
                    <div style="margin-top:16px;border:1px solid #e2e8f0;border-radius:22px;background:#ffffff;padding:16px 18px;font-size:14px;line-height:1.8;color:${theme.mutedColor};">${contactMarkup}</div>
                  </div>`
                : ""
            }
            <div>
              <div style="font-size:12px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">${escapeHtml(snapshot.title || "Atelier profissional")}</div>
              <div style="font-size:${theme.titleSize};font-weight:700;letter-spacing:-0.04em;color:#020617;margin-top:22px;">${escapeHtml(snapshot.personal.fullName || "Seu nome")}</div>
              <div style="max-width:720px;font-size:18px;line-height:1.8;color:${theme.mutedColor};margin-top:14px;">${escapeHtml(snapshot.personal.role || "Narrativa visual com refinamento editorial para posicionar repertorio, autoria e direcao criativa.")}</div>
              <div style="margin-top:20px;border:1px solid ${theme.lineColor};border-radius:30px;background:rgba(255,255,255,0.84);padding:20px 24px;font-size:18px;line-height:1.9;color:${theme.mutedColor};">${withLineBreaks(snapshot.summary || "Use este espaco como carta de abertura: explique senioridade, foco de atuacao e o tipo de resultado que sua presenca gera.")}</div>
              ${hasPhoto ? "" : `<div style="margin-top:18px;">${inlineContactMarkup}</div>`}
            </div>
          </div>
        </header>

        <div style="display:grid;grid-template-columns:1.08fr 0.92fr;gap:24px;padding:32px 40px;">
          <main>
            <section style="border:1px solid ${theme.lineColor};border-radius:26px;background:rgba(255,255,255,0.92);padding:24px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.38em;text-transform:uppercase;color:${theme.primaryColor};">Experiencia profissional</div>
              ${experienceMarkup}
            </section>
            <section style="border:1px solid ${theme.lineColor};border-radius:26px;background:rgba(255,255,255,0.92);padding:24px;margin-top:24px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.38em;text-transform:uppercase;color:${theme.primaryColor};">Projetos selecionados</div>
              ${projectsMarkup}
            </section>
          </main>

          <aside>
            <section style="border:1px solid ${theme.lineColor};border-radius:26px;background:rgba(255,255,255,0.92);padding:24px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.38em;text-transform:uppercase;color:${theme.primaryColor};">Objetivo</div>
              <p style="font-size:15px;line-height:1.8;color:${theme.mutedColor};margin:14px 0 0;">${withLineBreaks(snapshot.objective || "Descreva a proxima fase desejada da carreira e o tipo de contexto em que voce quer criar impacto.")}</p>
            </section>
            <section style="border:1px solid ${theme.lineColor};border-radius:26px;background:rgba(255,255,255,0.92);padding:24px;margin-top:24px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.38em;text-transform:uppercase;color:${theme.primaryColor};">Formacao</div>
              ${educationMarkup}
            </section>
            <section style="border:1px solid ${theme.lineColor};border-radius:26px;background:rgba(255,255,255,0.92);padding:24px;margin-top:24px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.38em;text-transform:uppercase;color:${theme.primaryColor};">Competencias</div>
              <div style="margin-top:10px;">${skillsMarkup}</div>
            </section>
            <section style="border:1px solid ${theme.lineColor};border-radius:26px;background:rgba(255,255,255,0.92);padding:24px;margin-top:24px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.38em;text-transform:uppercase;color:${theme.primaryColor};">Idiomas e certificacoes</div>
              ${languagesMarkup}
              ${certificationsMarkup}
            </section>
            ${
              snapshot.additionalInfo
                ? `<section style="border:1px solid ${theme.lineColor};border-radius:26px;background:rgba(255,255,255,0.92);padding:24px;margin-top:24px;">
                    <div style="font-size:11px;font-weight:700;letter-spacing:0.38em;text-transform:uppercase;color:${theme.primaryColor};">Informacoes adicionais</div>
                    <p style="font-size:15px;line-height:1.8;color:${theme.mutedColor};margin:14px 0 0;">${withLineBreaks(snapshot.additionalInfo)}</p>
                  </section>`
                : ""
            }
          </aside>
        </div>
      </article>
    `,
    theme,
    "#fff8f1",
    options,
  );
}
