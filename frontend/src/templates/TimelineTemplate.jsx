import { buildThemeTokens, escapeHtml, getResumeSnapshot, withLineBreaks, wrapDocument } from "./templateUtils";
import { ProfilePhoto, renderProfilePhotoMarkup } from "./templatePhoto";

function SectionHeading({ theme, children }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.36em]" style={{ color: theme.primaryColor }}>
      {children}
    </p>
  );
}

function TimelineDot({ theme }) {
  return (
    <span
      className="absolute left-[-8px] top-2 h-4 w-4 rounded-full border-4 border-white shadow-[0_0_0_1px_rgba(15,23,42,0.08)]"
      style={{ backgroundColor: theme.primaryColor }}
    />
  );
}

export default function TimelineTemplate({ resume, theme = buildThemeTokens(resume.customization) }) {
  const snapshot = getResumeSnapshot(resume);
  const contactLines = snapshot.contactLines.length > 0 ? snapshot.contactLines : ["Dados de contato e links profissionais"];
  const hasPhoto = Boolean(snapshot.personal.photo);

  return (
    <article className="overflow-hidden rounded-[30px] bg-white shadow-[0_22px_70px_rgba(15,23,42,0.12)]" style={{ fontFamily: theme.fontFamily }}>
      <header className="border-b p-8 lg:p-10" style={{ borderColor: theme.lineColor }}>
        <div className={hasPhoto ? "grid gap-8 lg:grid-cols-[auto_minmax(0,1fr)_280px] lg:items-center" : "grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center"}>
          {hasPhoto ? (
            <ProfilePhoto
              alt={snapshot.personal.fullName || "Foto profissional"}
              className="border-slate-200 bg-white"
              height={132}
              photo={snapshot.personal.photo}
              radius="34px"
              width={132}
            />
          ) : null}

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em]" style={{ color: theme.primaryColor }}>
              {snapshot.title || "Template timeline"}
            </p>
            <h1 className="mt-5 font-semibold tracking-tight text-slate-950" style={{ fontSize: theme.titleSize }}>
              {snapshot.personal.fullName || "Seu nome"}
            </h1>
            <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-600">
              {snapshot.personal.role || "Historico profissional organizado em linha do tempo com leitura clara e sofisticada."}
            </p>
          </div>

          <div className="rounded-[24px] border bg-slate-50 px-5 py-4 text-sm leading-7 text-slate-600" style={{ borderColor: theme.lineColor }}>
            {contactLines.slice(0, 6).map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
      </header>

      <div className="grid gap-8 p-8 lg:grid-cols-[300px_minmax(0,1fr)] lg:p-10">
        <aside className="space-y-5">
          <section className="rounded-[24px] border bg-slate-50 p-5" style={{ borderColor: theme.lineColor }}>
            <SectionHeading theme={theme}>Resumo profissional</SectionHeading>
            <p className="mt-4 text-[15px] leading-7 text-slate-700">
              {snapshot.summary || "Sintetize momento profissional, repertorio e tipo de impacto que voce consegue entregar."}
            </p>
          </section>

          <section className="rounded-[24px] border bg-slate-50 p-5" style={{ borderColor: theme.lineColor }}>
            <SectionHeading theme={theme}>Objetivo</SectionHeading>
            <p className="mt-4 text-[15px] leading-7 text-slate-700">
              {snapshot.objective || "Explique o proximo passo desejado para a carreira e o ambiente em que pretende atuar."}
            </p>
          </section>

          <section className="rounded-[24px] border bg-slate-50 p-5" style={{ borderColor: theme.lineColor }}>
            <SectionHeading theme={theme}>Competencias</SectionHeading>
            <div className="mt-4 flex flex-wrap gap-2">
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
          </section>

          <section className="rounded-[24px] border bg-slate-50 p-5" style={{ borderColor: theme.lineColor }}>
            <SectionHeading theme={theme}>Idiomas e certificacoes</SectionHeading>
            <div className="mt-4 space-y-3">
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
          </section>

          {snapshot.additionalInfo ? (
            <section className="rounded-[24px] border bg-slate-50 p-5" style={{ borderColor: theme.lineColor }}>
              <SectionHeading theme={theme}>Informacoes adicionais</SectionHeading>
              <p className="mt-4 text-[15px] leading-7 text-slate-700">{snapshot.additionalInfo}</p>
            </section>
          ) : null}
        </aside>

        <main className="space-y-8">
          <section>
            <SectionHeading theme={theme}>Experiencia profissional</SectionHeading>
            <div className="mt-6 space-y-6">
              {snapshot.experience.map((item) => (
                <div key={item.id} className="relative border-l border-slate-200 pl-6">
                  <TimelineDot theme={theme} />
                  <div className="rounded-[24px] border bg-white p-5" style={{ borderColor: theme.lineColor }}>
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-slate-950">{item.role}</p>
                        <p className="text-sm text-slate-500">{item.company}</p>
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
                </div>
              ))}
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
            <section className="rounded-[24px] border p-6" style={{ borderColor: theme.lineColor }}>
              <SectionHeading theme={theme}>Projetos</SectionHeading>
              <div className="mt-4 space-y-4">
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
            </section>

            <section className="rounded-[24px] border p-6" style={{ borderColor: theme.lineColor }}>
              <SectionHeading theme={theme}>Formacao</SectionHeading>
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
          </div>
        </main>
      </div>
    </article>
  );
}

export function renderTimelineDocument(resume, options = {}) {
  const theme = buildThemeTokens(resume.customization);
  const snapshot = getResumeSnapshot(resume);
  const hasPhoto = Boolean(snapshot.personal.photo);
  const contactMarkup = (snapshot.contactLines.length > 0 ? snapshot.contactLines : ["Dados de contato e links profissionais"])
    .slice(0, 6)
    .map((line) => `<div>${escapeHtml(line)}</div>`)
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
        <div style="position:relative;border-left:1px solid #e2e8f0;padding-left:24px;margin-top:22px;">
          <span style="position:absolute;left:-8px;top:8px;height:16px;width:16px;border-radius:999px;border:4px solid #ffffff;box-shadow:0 0 0 1px rgba(15,23,42,0.08);background:${theme.primaryColor};"></span>
          <div style="border:1px solid ${theme.lineColor};border-radius:24px;background:#ffffff;padding:20px;">
            <div style="display:flex;justify-content:space-between;gap:16px;align-items:flex-start;">
              <div>
                <div style="font-size:18px;font-weight:700;color:#020617;">${escapeHtml(item.role)}</div>
                <div style="font-size:14px;color:${theme.mutedColor};margin-top:4px;">${escapeHtml(item.company)}</div>
              </div>
              <div style="display:inline-flex;border-radius:999px;padding:8px 12px;background:${theme.softTint};font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${theme.primaryColor};">${escapeHtml(item.period)}</div>
            </div>
            <p style="font-size:15px;line-height:1.8;color:${theme.mutedColor};margin:14px 0 0;">${withLineBreaks(item.description)}</p>
          </div>
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
      <article style="overflow:hidden;border-radius:30px;background:#ffffff;box-shadow:0 22px 70px rgba(15,23,42,0.12);">
        <header style="border-bottom:1px solid ${theme.lineColor};padding:32px 40px;">
          <div style="display:grid;grid-template-columns:${hasPhoto ? "auto minmax(0, 1fr) 280px" : "minmax(0, 1fr) 280px"};gap:32px;align-items:center;">
            ${
              hasPhoto
                ? `<div>${renderProfilePhotoMarkup({
                    photo: snapshot.personal.photo,
                    alt: snapshot.personal.fullName || "Foto profissional",
                    width: 132,
                    height: 132,
                    radius: "34px",
                    borderColor: "#e2e8f0",
                    background: "#ffffff",
                  })}</div>`
                : ""
            }
            <div>
              <div style="font-size:12px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">${escapeHtml(snapshot.title || "Template timeline")}</div>
              <div style="font-size:${theme.titleSize};font-weight:700;letter-spacing:-0.04em;color:#020617;margin-top:18px;">${escapeHtml(snapshot.personal.fullName || "Seu nome")}</div>
              <div style="max-width:700px;font-size:18px;line-height:1.8;color:${theme.mutedColor};margin-top:12px;">${escapeHtml(snapshot.personal.role || "Historico profissional organizado em linha do tempo com leitura clara e sofisticada.")}</div>
            </div>
            <div style="border:1px solid ${theme.lineColor};border-radius:24px;background:#f8fafc;padding:16px 20px;font-size:13px;line-height:1.8;color:${theme.mutedColor};">${contactMarkup}</div>
          </div>
        </header>

        <div style="display:grid;grid-template-columns:300px minmax(0, 1fr);gap:32px;padding:32px 40px;">
          <aside>
            <section style="border:1px solid ${theme.lineColor};border-radius:24px;background:#f8fafc;padding:20px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.36em;text-transform:uppercase;color:${theme.primaryColor};">Resumo profissional</div>
              <p style="font-size:15px;line-height:1.8;color:${theme.mutedColor};margin:14px 0 0;">${withLineBreaks(snapshot.summary || "Sintetize momento profissional, repertorio e tipo de impacto que voce consegue entregar.")}</p>
            </section>
            <section style="border:1px solid ${theme.lineColor};border-radius:24px;background:#f8fafc;padding:20px;margin-top:20px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.36em;text-transform:uppercase;color:${theme.primaryColor};">Objetivo</div>
              <p style="font-size:15px;line-height:1.8;color:${theme.mutedColor};margin:14px 0 0;">${withLineBreaks(snapshot.objective || "Explique o proximo passo desejado para a carreira e o ambiente em que pretende atuar.")}</p>
            </section>
            <section style="border:1px solid ${theme.lineColor};border-radius:24px;background:#f8fafc;padding:20px;margin-top:20px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.36em;text-transform:uppercase;color:${theme.primaryColor};">Competencias</div>
              <div style="margin-top:10px;">${skillsMarkup}</div>
            </section>
            <section style="border:1px solid ${theme.lineColor};border-radius:24px;background:#f8fafc;padding:20px;margin-top:20px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.36em;text-transform:uppercase;color:${theme.primaryColor};">Idiomas e certificacoes</div>
              ${languagesMarkup}
              ${certificationsMarkup}
            </section>
            ${
              snapshot.additionalInfo
                ? `<section style="border:1px solid ${theme.lineColor};border-radius:24px;background:#f8fafc;padding:20px;margin-top:20px;">
                    <div style="font-size:11px;font-weight:700;letter-spacing:0.36em;text-transform:uppercase;color:${theme.primaryColor};">Informacoes adicionais</div>
                    <p style="font-size:15px;line-height:1.8;color:${theme.mutedColor};margin:14px 0 0;">${withLineBreaks(snapshot.additionalInfo)}</p>
                  </section>`
                : ""
            }
          </aside>

          <main>
            <section>
              <div style="font-size:11px;font-weight:700;letter-spacing:0.36em;text-transform:uppercase;color:${theme.primaryColor};">Experiencia profissional</div>
              ${experienceMarkup}
            </section>
            <div style="display:grid;grid-template-columns:1fr 0.9fr;gap:24px;margin-top:${theme.sectionGap};">
              <section style="border:1px solid ${theme.lineColor};border-radius:24px;padding:24px;">
                <div style="font-size:11px;font-weight:700;letter-spacing:0.36em;text-transform:uppercase;color:${theme.primaryColor};">Projetos</div>
                ${projectsMarkup}
              </section>
              <section style="border:1px solid ${theme.lineColor};border-radius:24px;padding:24px;">
                <div style="font-size:11px;font-weight:700;letter-spacing:0.36em;text-transform:uppercase;color:${theme.primaryColor};">Formacao</div>
                ${educationMarkup}
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
