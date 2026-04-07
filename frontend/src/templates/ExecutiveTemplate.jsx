import { buildThemeTokens, escapeHtml, getResumeSnapshot, withLineBreaks, wrapDocument } from "./templateUtils";
import { ProfilePhoto, renderProfilePhotoMarkup } from "./templatePhoto";

function SectionTitle({ theme, children }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.34em]" style={{ color: theme.primaryColor }}>
      {children}
    </p>
  );
}

function SidebarBlock({ theme, title, children }) {
  return (
    <section className="rounded-[24px] border bg-white p-5" style={{ borderColor: theme.lineColor }}>
      <SectionTitle theme={theme}>{title}</SectionTitle>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function ExecutiveTemplate({ resume, theme = buildThemeTokens(resume.customization) }) {
  const snapshot = getResumeSnapshot(resume);

  return (
    <article className="overflow-hidden rounded-[30px] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.12)]" style={{ fontFamily: theme.fontFamily }}>
      <header className="border-b" style={{ borderColor: theme.lineColor }}>
        <div className="grid gap-8 p-8 lg:grid-cols-[1.15fr_0.85fr] lg:p-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em]" style={{ color: theme.primaryColor }}>
              {snapshot.title || "Perfil executivo"}
            </p>
            <h1 className="mt-5 font-semibold tracking-tight text-slate-950" style={{ fontSize: theme.titleSize }}>
              {snapshot.personal.fullName || "Seu nome"}
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              {snapshot.personal.role || "Posicionamento estrategico, lideranca e execucao orientada a resultado."}
            </p>
          </div>

          <div className="space-y-4">
            {snapshot.personal.photo ? (
              <div className="flex justify-start sm:justify-end">
                <ProfilePhoto
                  alt={snapshot.personal.fullName || "Foto profissional"}
                  className="border-slate-200 bg-white"
                  height={112}
                  photo={snapshot.personal.photo}
                  width={112}
                />
              </div>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2">
              {(snapshot.contactLines.length > 0 ? snapshot.contactLines : ["Email, telefone e canais profissionais"])
                .slice(0, 6)
                .map((line) => (
                  <div
                    key={line}
                    className="rounded-[22px] border bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600"
                    style={{ borderColor: theme.lineColor }}
                  >
                    {line}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-5 bg-slate-50/90 p-8">
          <SidebarBlock theme={theme} title="Objetivo">
            <p className="text-[15px] leading-7 text-slate-700">
              {snapshot.objective || "Descreva a direcao de carreira, o escopo desejado e o tipo de impacto que voce pretende gerar."}
            </p>
          </SidebarBlock>

          <SidebarBlock theme={theme} title="Resumo profissional">
            <p className="text-[15px] leading-7 text-slate-700">
              {snapshot.summary || "Apresente senioridade, repertorio de negocio e capacidade de liderar entregas com clareza e consistencia."}
            </p>
          </SidebarBlock>

          <SidebarBlock theme={theme} title="Habilidades-chave">
            <div className="flex flex-wrap gap-2">
              {snapshot.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full px-3 py-2 text-xs font-semibold"
                  style={{ backgroundColor: theme.softTint, color: theme.primaryColor }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </SidebarBlock>

          <SidebarBlock theme={theme} title="Idiomas e certificacoes">
            <div className="space-y-3">
              {snapshot.languages.map((item) => (
                <div key={item.id}>
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <p className="text-sm text-slate-500">{item.level}</p>
                </div>
              ))}
              {snapshot.certifications.map((item) => (
                <div key={item.id}>
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <p className="text-sm text-slate-500">{[item.issuer, item.year].filter(Boolean).join(" • ")}</p>
                </div>
              ))}
            </div>
          </SidebarBlock>

          {snapshot.additionalInfo ? (
            <SidebarBlock theme={theme} title="Informacoes adicionais">
              <p className="text-[15px] leading-7 text-slate-700">{snapshot.additionalInfo}</p>
            </SidebarBlock>
          ) : null}
        </aside>

        <main className="space-y-8 p-8 lg:p-10">
          <section>
            <SectionTitle theme={theme}>Experiencia profissional</SectionTitle>
            <div className="mt-5 space-y-5">
              {snapshot.experience.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[24px] border bg-white p-6"
                  style={{ borderColor: theme.lineColor, boxShadow: "0 12px 30px rgba(15, 23, 42, 0.05)" }}
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-slate-950">{item.role}</p>
                      <p className="text-sm font-medium text-slate-500">{item.company}</p>
                    </div>
                    <span
                      className="inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]"
                      style={{ backgroundColor: theme.softTint, color: theme.primaryColor }}
                    >
                      {item.period}
                    </span>
                  </div>
                  <p className="mt-4 text-[15px] leading-7 text-slate-700">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <SectionTitle theme={theme}>Projetos estrategicos</SectionTitle>
            <div className="mt-5 grid gap-4">
              {snapshot.projects.map((item) => (
                <div key={item.id} className="rounded-[24px] border p-5" style={{ borderColor: theme.lineColor }}>
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
          </section>

          <div className="grid gap-6 md:grid-cols-2">
            <section className="rounded-[24px] border p-6" style={{ borderColor: theme.lineColor }}>
              <SectionTitle theme={theme}>Formacao</SectionTitle>
              <div className="mt-4 space-y-4">
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
            </section>

            <section className="rounded-[24px] border p-6" style={{ borderColor: theme.lineColor }}>
              <SectionTitle theme={theme}>Destaques</SectionTitle>
              <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600">
                <p>Template orientado a clareza executiva, leitura corporativa e composicao premium.</p>
                <p>Indicado para lideranca, consultoria, gestao, operacoes e perfis seniores.</p>
              </div>
            </section>
          </div>
        </main>
      </div>
    </article>
  );
}

export function renderExecutiveDocument(resume, options = {}) {
  const theme = buildThemeTokens(resume.customization);
  const snapshot = getResumeSnapshot(resume);
  const contactMarkup = (snapshot.contactLines.length > 0 ? snapshot.contactLines : ["Email, telefone e canais profissionais"])
    .slice(0, 6)
    .map(
      (line) => `
        <div style="border:1px solid ${theme.lineColor};border-radius:22px;background:#f8fafc;padding:14px 16px;font-size:13px;line-height:1.7;color:${theme.mutedColor};">
          ${escapeHtml(line)}
        </div>`,
    )
    .join("");
  const skillsMarkup = snapshot.skills
    .map(
      (skill) => `<span style="display:inline-flex;margin:8px 8px 0 0;border-radius:999px;padding:8px 12px;background:${theme.softTint};font-size:12px;font-weight:700;color:${theme.primaryColor};">${escapeHtml(skill)}</span>`,
    )
    .join("");
  const languagesMarkup = snapshot.languages
    .map(
      (item) => `
        <div style="margin-top:12px;">
          <div style="font-weight:700;">${escapeHtml(item.name)}</div>
          <div style="font-size:13px;color:${theme.mutedColor};margin-top:4px;">${escapeHtml(item.level)}</div>
        </div>`,
    )
    .join("");
  const certificationsMarkup = snapshot.certifications
    .map(
      (item) => `
        <div style="margin-top:12px;">
          <div style="font-weight:700;">${escapeHtml(item.name)}</div>
          <div style="font-size:13px;color:${theme.mutedColor};margin-top:4px;">${escapeHtml([item.issuer, item.year].filter(Boolean).join(" • "))}</div>
        </div>`,
    )
    .join("");
  const experienceMarkup = snapshot.experience
    .map(
      (item) => `
        <div style="margin-top:18px;border:1px solid ${theme.lineColor};border-radius:24px;background:#ffffff;padding:24px;box-shadow:0 12px 30px rgba(15,23,42,0.05);">
          <div style="display:flex;justify-content:space-between;gap:16px;align-items:flex-start;">
            <div>
              <div style="font-size:18px;font-weight:700;color:#020617;">${escapeHtml(item.role)}</div>
              <div style="font-size:14px;color:${theme.mutedColor};margin-top:4px;">${escapeHtml(item.company)}</div>
            </div>
            <div style="display:inline-flex;border-radius:999px;padding:8px 12px;background:${theme.softTint};font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${theme.primaryColor};">${escapeHtml(item.period)}</div>
          </div>
          <p style="font-size:15px;line-height:1.8;color:${theme.mutedColor};margin:14px 0 0;">${withLineBreaks(item.description)}</p>
        </div>`,
    )
    .join("");
  const projectMarkup = snapshot.projects
    .map(
      (item) => `
        <div style="margin-top:16px;border:1px solid ${theme.lineColor};border-radius:24px;padding:20px;">
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

  return wrapDocument(
    `
      <article style="overflow:hidden;border-radius:30px;background:#ffffff;box-shadow:0 24px 70px rgba(15,23,42,0.12);">
        <header style="border-bottom:1px solid ${theme.lineColor};">
          <div style="display:grid;grid-template-columns:1.15fr 0.85fr;gap:32px;padding:32px 40px;">
            <div>
              <div style="font-size:12px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">${escapeHtml(snapshot.title || "Perfil executivo")}</div>
              <div style="font-size:${theme.titleSize};font-weight:700;letter-spacing:-0.04em;color:#020617;margin-top:18px;">${escapeHtml(snapshot.personal.fullName || "Seu nome")}</div>
              <div style="max-width:620px;font-size:18px;line-height:1.8;color:${theme.mutedColor};margin-top:14px;">${escapeHtml(snapshot.personal.role || "Posicionamento estrategico, lideranca e execucao orientada a resultado.")}</div>
            </div>
            <div>
              ${
                snapshot.personal.photo
                  ? `<div style="display:flex;justify-content:flex-end;margin-bottom:16px;">${renderProfilePhotoMarkup({
                      photo: snapshot.personal.photo,
                      alt: snapshot.personal.fullName || "Foto profissional",
                      width: 112,
                      height: 112,
                      radius: "30px",
                      borderColor: "#e2e8f0",
                      background: "#ffffff",
                    })}</div>`
                  : ""
              }
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">${contactMarkup}</div>
            </div>
          </div>
        </header>
        <div style="display:grid;grid-template-columns:320px minmax(0, 1fr);">
          <aside style="background:rgba(248,250,252,0.92);padding:32px;">
            <section style="border:1px solid ${theme.lineColor};border-radius:24px;background:#ffffff;padding:20px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Objetivo</div>
              <p style="font-size:15px;line-height:1.8;color:${theme.mutedColor};margin:14px 0 0;">${withLineBreaks(snapshot.objective || "Descreva a direcao de carreira, o escopo desejado e o tipo de impacto que voce pretende gerar.")}</p>
            </section>
            <section style="border:1px solid ${theme.lineColor};border-radius:24px;background:#ffffff;padding:20px;margin-top:20px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Resumo profissional</div>
              <p style="font-size:15px;line-height:1.8;color:${theme.mutedColor};margin:14px 0 0;">${withLineBreaks(snapshot.summary || "Apresente senioridade, repertorio de negocio e capacidade de liderar entregas com clareza e consistencia.")}</p>
            </section>
            <section style="border:1px solid ${theme.lineColor};border-radius:24px;background:#ffffff;padding:20px;margin-top:20px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Habilidades-chave</div>
              <div style="margin-top:10px;">${skillsMarkup}</div>
            </section>
            <section style="border:1px solid ${theme.lineColor};border-radius:24px;background:#ffffff;padding:20px;margin-top:20px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Idiomas e certificacoes</div>
              ${languagesMarkup}
              ${certificationsMarkup}
            </section>
            ${
              snapshot.additionalInfo
                ? `<section style="border:1px solid ${theme.lineColor};border-radius:24px;background:#ffffff;padding:20px;margin-top:20px;">
                    <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Informacoes adicionais</div>
                    <p style="font-size:15px;line-height:1.8;color:${theme.mutedColor};margin:14px 0 0;">${withLineBreaks(snapshot.additionalInfo)}</p>
                  </section>`
                : ""
            }
          </aside>
          <main style="padding:32px 40px;">
            <section>
              <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Experiencia profissional</div>
              ${experienceMarkup}
            </section>
            <section style="margin-top:${theme.sectionGap};">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Projetos estrategicos</div>
              ${projectMarkup}
            </section>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:${theme.sectionGap};">
              <section style="border:1px solid ${theme.lineColor};border-radius:24px;padding:24px;">
                <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Formacao</div>
                ${educationMarkup}
              </section>
              <section style="border:1px solid ${theme.lineColor};border-radius:24px;padding:24px;">
                <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Destaques</div>
                <p style="font-size:14px;line-height:1.9;color:${theme.mutedColor};margin:14px 0 0;">Template orientado a clareza executiva, leitura corporativa e composicao premium.</p>
                <p style="font-size:14px;line-height:1.9;color:${theme.mutedColor};margin:10px 0 0;">Indicado para lideranca, consultoria, gestao, operacoes e perfis seniores.</p>
              </section>
            </div>
          </main>
        </div>
      </article>
    `,
    theme,
    "#f8fafc",
    options,
  );
}
