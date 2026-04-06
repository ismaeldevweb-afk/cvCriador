import { buildThemeTokens, escapeHtml, getResumeSnapshot, withLineBreaks, wrapDocument } from "./templateUtils";
import { ProfilePhoto, renderProfilePhotoMarkup } from "./templatePhoto";

function SectionHeading({ theme, children }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.34em]" style={{ color: theme.primaryColor }}>
      {children}
    </p>
  );
}

function Panel({ theme, title, children }) {
  return (
    <section className="rounded-[24px] border bg-white p-6" style={{ borderColor: theme.lineColor }}>
      <SectionHeading theme={theme}>{title}</SectionHeading>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function HorizonTemplate({ resume, theme = buildThemeTokens(resume.customization) }) {
  const snapshot = getResumeSnapshot(resume);
  const hasPhoto = Boolean(snapshot.personal.photo);
  const contactLines = snapshot.contactLines.length > 0 ? snapshot.contactLines : ["Dados de contato e links profissionais"];

  return (
    <article className="overflow-hidden rounded-[32px] bg-white shadow-[0_24px_72px_rgba(15,23,42,0.12)]" style={{ fontFamily: theme.fontFamily }}>
      <header
        className="border-b px-8 pb-8 pt-10 lg:px-10"
        style={{ background: `linear-gradient(180deg, ${theme.softTint} 0%, rgba(255,255,255,0.92) 100%)`, borderColor: theme.lineColor }}
      >
        <div className="grid gap-8 lg:grid-cols-[1.12fr_0.88fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em]" style={{ color: theme.primaryColor }}>
              {snapshot.title || "Horizonte profissional"}
            </p>
            <h1 className="mt-6 max-w-4xl font-semibold tracking-tight text-slate-950" style={{ fontSize: theme.titleSize }}>
              {snapshot.personal.fullName || "Seu nome"}
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
              {snapshot.personal.role || "Template amplo para perfis seniores, produto, estrategia e lideranca com leitura clara."}
            </p>
            <div className="mt-6 rounded-[28px] border bg-white/85 px-6 py-5" style={{ borderColor: theme.lineColor }}>
              <p className="text-[16px] leading-8 text-slate-700">
                {snapshot.summary || "Abra o curriculo com uma visao geral objetiva: contexto, senioridade, resultados e tipo de desafio que voce domina."}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {hasPhoto ? (
              <div className="flex justify-start lg:justify-end">
                <ProfilePhoto
                  alt={snapshot.personal.fullName || "Foto profissional"}
                  className="border-white/80 bg-white"
                  height={122}
                  photo={snapshot.personal.photo}
                  radius="30px"
                  width={122}
                />
              </div>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2">
              {contactLines.slice(0, 6).map((line) => (
                <div key={line} className="rounded-[22px] border bg-white/88 px-4 py-4 text-sm leading-6 text-slate-600" style={{ borderColor: theme.lineColor }}>
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-6 p-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:p-10">
        <aside className="space-y-6">
          <Panel theme={theme} title="Objetivo">
            <p className="text-[15px] leading-7 text-slate-700">
              {snapshot.objective || "Explique a direcao desejada, o tipo de escopo buscado e onde sua contribuicao rende mais impacto."}
            </p>
          </Panel>

          <Panel theme={theme} title="Competencias">
            <div className="flex flex-wrap gap-2">
              {snapshot.skills.map((skill) => (
                <span key={skill} className="rounded-full px-3 py-2 text-xs font-semibold" style={{ backgroundColor: theme.softTint, color: theme.primaryColor }}>
                  {skill}
                </span>
              ))}
            </div>
          </Panel>

          <Panel theme={theme} title="Idiomas e certificacoes">
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
          </Panel>

          {snapshot.additionalInfo ? (
            <Panel theme={theme} title="Informacoes adicionais">
              <p className="text-[15px] leading-7 text-slate-700">{snapshot.additionalInfo}</p>
            </Panel>
          ) : null}
        </aside>

        <main className="space-y-6">
          <Panel theme={theme} title="Experiencia profissional">
            <div className="space-y-5">
              {snapshot.experience.map((item) => (
                <div key={item.id} className="rounded-[22px] bg-slate-50 p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-slate-950">{item.role}</p>
                      <p className="text-sm text-slate-500">{item.company}</p>
                    </div>
                    <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]" style={{ backgroundColor: theme.softTint, color: theme.primaryColor }}>
                      {item.period}
                    </span>
                  </div>
                  <p className="mt-4 text-[15px] leading-7 text-slate-700">{item.description}</p>
                </div>
              ))}
            </div>
          </Panel>

          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <Panel theme={theme} title="Formacao">
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
            </Panel>

            <Panel theme={theme} title="Projetos">
              <div className="space-y-4">
                {snapshot.projects.map((item) => (
                  <div key={item.id}>
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
            </Panel>
          </div>
        </main>
      </div>
    </article>
  );
}

export function renderHorizonDocument(resume) {
  const theme = buildThemeTokens(resume.customization);
  const snapshot = getResumeSnapshot(resume);
  const hasPhoto = Boolean(snapshot.personal.photo);
  const contactMarkup = (snapshot.contactLines.length > 0 ? snapshot.contactLines : ["Dados de contato e links profissionais"])
    .slice(0, 6)
    .map(
      (line) => `<div style="border:1px solid ${theme.lineColor};border-radius:22px;background:rgba(255,255,255,0.88);padding:14px 16px;font-size:13px;line-height:1.7;color:${theme.mutedColor};">${escapeHtml(line)}</div>`,
    )
    .join("");
  const skillsMarkup = snapshot.skills
    .map(
      (skill) =>
        `<span style="display:inline-flex;margin:8px 8px 0 0;border-radius:999px;padding:8px 12px;background:${theme.softTint};font-size:12px;font-weight:700;color:${theme.primaryColor};">${escapeHtml(skill)}</span>`,
    )
    .join("");
  const experienceMarkup = snapshot.experience
    .map(
      (item) => `
        <div style="margin-top:18px;border-radius:22px;background:#f8fafc;padding:20px;">
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
  const projectsMarkup = snapshot.projects
    .map(
      (item) => `
        <div style="margin-top:16px;">
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
      <article style="overflow:hidden;border-radius:32px;background:#ffffff;box-shadow:0 24px 72px rgba(15,23,42,0.12);">
        <header style="border-bottom:1px solid ${theme.lineColor};background:linear-gradient(180deg, ${theme.softTint} 0%, rgba(255,255,255,0.92) 100%);padding:40px 40px 32px;">
          <div style="display:grid;grid-template-columns:1.12fr 0.88fr;gap:32px;">
            <div>
              <div style="font-size:12px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">${escapeHtml(snapshot.title || "Horizonte profissional")}</div>
              <div style="font-size:${theme.titleSize};font-weight:700;letter-spacing:-0.04em;color:#020617;margin-top:22px;">${escapeHtml(snapshot.personal.fullName || "Seu nome")}</div>
              <div style="max-width:720px;font-size:18px;line-height:1.8;color:${theme.mutedColor};margin-top:14px;">${escapeHtml(snapshot.personal.role || "Template amplo para perfis seniores, produto, estrategia e lideranca com leitura clara.")}</div>
              <div style="margin-top:20px;border:1px solid ${theme.lineColor};border-radius:28px;background:rgba(255,255,255,0.85);padding:20px 24px;font-size:16px;line-height:1.9;color:${theme.mutedColor};">${withLineBreaks(snapshot.summary || "Abra o curriculo com uma visao geral objetiva: contexto, senioridade, resultados e tipo de desafio que voce domina.")}</div>
            </div>
            <div>
              ${
                hasPhoto
                  ? `<div style="display:flex;justify-content:flex-end;margin-bottom:16px;">${renderProfilePhotoMarkup({
                      photo: snapshot.personal.photo,
                      alt: snapshot.personal.fullName || "Foto profissional",
                      width: 122,
                      height: 122,
                      radius: "30px",
                      borderColor: "rgba(255,255,255,0.8)",
                      background: "#ffffff",
                    })}</div>`
                  : ""
              }
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">${contactMarkup}</div>
            </div>
          </div>
        </header>

        <div style="display:grid;grid-template-columns:280px minmax(0, 1fr);gap:24px;padding:32px 40px;">
          <aside>
            <section style="border:1px solid ${theme.lineColor};border-radius:24px;background:#ffffff;padding:24px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Objetivo</div>
              <p style="font-size:15px;line-height:1.8;color:${theme.mutedColor};margin:14px 0 0;">${withLineBreaks(snapshot.objective || "Explique a direcao desejada, o tipo de escopo buscado e onde sua contribuicao rende mais impacto.")}</p>
            </section>
            <section style="border:1px solid ${theme.lineColor};border-radius:24px;background:#ffffff;padding:24px;margin-top:24px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Competencias</div>
              <div style="margin-top:10px;">${skillsMarkup}</div>
            </section>
            <section style="border:1px solid ${theme.lineColor};border-radius:24px;background:#ffffff;padding:24px;margin-top:24px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Idiomas e certificacoes</div>
              ${languagesMarkup}
              ${certificationsMarkup}
            </section>
            ${
              snapshot.additionalInfo
                ? `<section style="border:1px solid ${theme.lineColor};border-radius:24px;background:#ffffff;padding:24px;margin-top:24px;">
                    <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Informacoes adicionais</div>
                    <p style="font-size:15px;line-height:1.8;color:${theme.mutedColor};margin:14px 0 0;">${withLineBreaks(snapshot.additionalInfo)}</p>
                  </section>`
                : ""
            }
          </aside>

          <main>
            <section style="border:1px solid ${theme.lineColor};border-radius:24px;background:#ffffff;padding:24px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Experiencia profissional</div>
              ${experienceMarkup}
            </section>
            <div style="display:grid;grid-template-columns:0.95fr 1.05fr;gap:24px;margin-top:24px;">
              <section style="border:1px solid ${theme.lineColor};border-radius:24px;background:#ffffff;padding:24px;">
                <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Formacao</div>
                ${educationMarkup}
              </section>
              <section style="border:1px solid ${theme.lineColor};border-radius:24px;background:#ffffff;padding:24px;">
                <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Projetos</div>
                ${projectsMarkup}
              </section>
            </div>
          </main>
        </div>
      </article>
    `,
    theme,
    "#f4f9fd",
  );
}
