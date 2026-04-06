import { buildThemeTokens, escapeHtml, getResumeSnapshot, withLineBreaks, wrapDocument } from "./templateUtils";
import { ProfilePhoto, renderProfilePhotoMarkup } from "./templatePhoto";

function SectionHeading({ theme, children }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.34em]" style={{ color: theme.primaryColor }}>
      {children}
    </p>
  );
}

export default function CompactTemplate({ resume, theme = buildThemeTokens(resume.customization) }) {
  const snapshot = getResumeSnapshot(resume);

  return (
    <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.10)]" style={{ fontFamily: theme.fontFamily }}>
      <div className="h-2 w-full" style={{ backgroundColor: theme.primaryColor }} />
      <div className="p-8 lg:p-9">
        <header className="border-b pb-6" style={{ borderColor: theme.lineColor }}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: theme.primaryColor }}>
                {snapshot.title || "Compacto premium"}
              </p>
              <h1 className="mt-4 font-semibold tracking-tight text-slate-950" style={{ fontSize: theme.titleSize }}>
                {snapshot.personal.fullName || "Seu nome"}
              </h1>
              <p className="mt-3 text-base leading-7 text-slate-600">
                {snapshot.personal.role || "Curriculo objetivo, denso e eficiente para triagem rapida."}
              </p>
            </div>
            <div className="max-w-md space-y-4 text-sm leading-7 text-slate-500">
              {snapshot.personal.photo ? (
                <div className="flex lg:justify-end">
                  <ProfilePhoto
                    alt={snapshot.personal.fullName || "Foto profissional"}
                    className="border-slate-200 bg-white"
                    height={96}
                    photo={snapshot.personal.photo}
                    radius="26px"
                    width={96}
                  />
                </div>
              ) : null}
              <div>{snapshot.contactLines.join(" • ") || "Email, telefone, cidade e links profissionais"}</div>
            </div>
          </div>
        </header>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <section className="rounded-[22px] bg-slate-50 p-5">
            <SectionHeading theme={theme}>Objetivo</SectionHeading>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              {snapshot.objective || "Defina rapidamente o foco da candidatura e o contexto em que deseja atuar."}
            </p>
          </section>
          <section className="rounded-[22px] bg-slate-50 p-5">
            <SectionHeading theme={theme}>Resumo</SectionHeading>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              {snapshot.summary || "Sintetize experiencia, diferenciais e repertorio com linguagem direta e convincente."}
            </p>
          </section>
        </div>

        <section className="mt-7">
          <SectionHeading theme={theme}>Experiencia profissional</SectionHeading>
          <div className="mt-4 space-y-4">
            {snapshot.experience.map((item) => (
              <div key={item.id} className="rounded-[22px] border p-5" style={{ borderColor: theme.lineColor }}>
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-semibold text-slate-950">{item.role}</p>
                    <p className="text-sm text-slate-500">{item.company}</p>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: theme.primaryColor }}>
                    {item.period}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-700">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-7 grid gap-5 xl:grid-cols-[0.8fr_1.2fr_1fr]">
          <section className="rounded-[22px] border p-5" style={{ borderColor: theme.lineColor }}>
            <SectionHeading theme={theme}>Habilidades</SectionHeading>
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

          <section className="rounded-[22px] border p-5" style={{ borderColor: theme.lineColor }}>
            <SectionHeading theme={theme}>Projetos</SectionHeading>
            <div className="mt-4 space-y-4">
              {snapshot.projects.map((item) => (
                <div key={item.id}>
                  <p className="font-semibold text-slate-950">{item.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.technologies}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-700">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-5">
            <div className="rounded-[22px] border p-5" style={{ borderColor: theme.lineColor }}>
              <SectionHeading theme={theme}>Formacao</SectionHeading>
              <div className="mt-4 space-y-3">
                {snapshot.education.map((item) => (
                  <div key={item.id}>
                    <p className="font-semibold text-slate-950">{item.course}</p>
                    <p className="text-sm text-slate-500">{item.institution}</p>
                    <p className="mt-1 text-sm font-semibold" style={{ color: theme.primaryColor }}>
                      {item.period}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[22px] border p-5" style={{ borderColor: theme.lineColor }}>
              <SectionHeading theme={theme}>Idiomas e certificacoes</SectionHeading>
              <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                {snapshot.languages.map((item) => (
                  <div key={item.id}>
                    <p className="font-semibold text-slate-950">{item.name}</p>
                    <p>{item.level}</p>
                  </div>
                ))}
                {snapshot.certifications.map((item) => (
                  <div key={item.id}>
                    <p className="font-semibold text-slate-950">{item.name}</p>
                    <p>{[item.issuer, item.year].filter(Boolean).join(" • ")}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {snapshot.additionalInfo ? (
          <section className="mt-7 rounded-[22px] border p-5" style={{ borderColor: theme.lineColor }}>
            <SectionHeading theme={theme}>Informacoes adicionais</SectionHeading>
            <p className="mt-3 text-sm leading-7 text-slate-700">{snapshot.additionalInfo}</p>
          </section>
        ) : null}
      </div>
    </article>
  );
}

export function renderCompactDocument(resume) {
  const theme = buildThemeTokens(resume.customization);
  const snapshot = getResumeSnapshot(resume);
  const experienceMarkup = snapshot.experience
    .map(
      (item) => `
        <div style="margin-top:16px;border:1px solid ${theme.lineColor};border-radius:22px;padding:20px;">
          <div style="display:flex;justify-content:space-between;gap:16px;align-items:flex-start;">
            <div>
              <div style="font-weight:700;color:#020617;">${escapeHtml(item.role)}</div>
              <div style="font-size:14px;color:${theme.mutedColor};margin-top:4px;">${escapeHtml(item.company)}</div>
            </div>
            <div style="font-size:13px;font-weight:700;color:${theme.primaryColor};">${escapeHtml(item.period)}</div>
          </div>
          <p style="font-size:14px;line-height:1.9;color:${theme.mutedColor};margin:12px 0 0;">${withLineBreaks(item.description)}</p>
        </div>`,
    )
    .join("");
  const skillMarkup = snapshot.skills
    .map(
      (skill) => `<span style="display:inline-flex;margin:8px 8px 0 0;border-radius:999px;padding:8px 12px;background:${theme.softTint};font-size:12px;font-weight:700;color:${theme.primaryColor};">${escapeHtml(skill)}</span>`,
    )
    .join("");
  const projectMarkup = snapshot.projects
    .map(
      (item) => `
        <div style="margin-top:14px;">
          <div style="font-weight:700;color:#020617;">${escapeHtml(item.name)}</div>
          <div style="font-size:14px;color:${theme.mutedColor};margin-top:4px;">${escapeHtml(item.technologies)}</div>
          <p style="font-size:14px;line-height:1.8;color:${theme.mutedColor};margin:8px 0 0;">${withLineBreaks(item.description)}</p>
        </div>`,
    )
    .join("");
  const educationMarkup = snapshot.education
    .map(
      (item) => `
        <div style="margin-top:12px;">
          <div style="font-weight:700;color:#020617;">${escapeHtml(item.course)}</div>
          <div style="font-size:14px;color:${theme.mutedColor};margin-top:4px;">${escapeHtml(item.institution)}</div>
          <div style="font-size:13px;font-weight:700;color:${theme.primaryColor};margin-top:6px;">${escapeHtml(item.period)}</div>
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
      <article style="overflow:hidden;border-radius:28px;border:1px solid #e2e8f0;background:#ffffff;box-shadow:0 20px 60px rgba(15,23,42,0.10);">
        <div style="height:8px;width:100%;background:${theme.primaryColor};"></div>
        <div style="padding:32px 36px;">
          <header style="border-bottom:1px solid ${theme.lineColor};padding-bottom:24px;">
            <div style="display:flex;justify-content:space-between;gap:24px;align-items:flex-end;">
              <div>
                <div style="font-size:12px;font-weight:700;letter-spacing:0.3em;text-transform:uppercase;color:${theme.primaryColor};">${escapeHtml(snapshot.title || "Compacto premium")}</div>
                <div style="font-size:${theme.titleSize};font-weight:700;letter-spacing:-0.04em;color:#020617;margin-top:14px;">${escapeHtml(snapshot.personal.fullName || "Seu nome")}</div>
                <div style="font-size:16px;line-height:1.8;color:${theme.mutedColor};margin-top:10px;">${escapeHtml(snapshot.personal.role || "Curriculo objetivo, denso e eficiente para triagem rapida.")}</div>
              </div>
              <div style="max-width:360px;font-size:13px;line-height:1.8;color:${theme.mutedColor};text-align:right;">
                ${
                  snapshot.personal.photo
                    ? `<div style="display:flex;justify-content:flex-end;margin-bottom:12px;">${renderProfilePhotoMarkup({
                        photo: snapshot.personal.photo,
                        alt: snapshot.personal.fullName || "Foto profissional",
                        width: 96,
                        height: 96,
                        radius: "26px",
                        borderColor: "#e2e8f0",
                        background: "#ffffff",
                      })}</div>`
                    : ""
                }
                ${escapeHtml(snapshot.contactLines.join(" • ") || "Email, telefone, cidade e links profissionais")}
              </div>
            </div>
          </header>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:24px;">
            <section style="border-radius:22px;background:#f8fafc;padding:20px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Objetivo</div>
              <p style="font-size:14px;line-height:1.9;color:${theme.mutedColor};margin:12px 0 0;">${withLineBreaks(snapshot.objective || "Defina rapidamente o foco da candidatura e o contexto em que deseja atuar.")}</p>
            </section>
            <section style="border-radius:22px;background:#f8fafc;padding:20px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Resumo</div>
              <p style="font-size:14px;line-height:1.9;color:${theme.mutedColor};margin:12px 0 0;">${withLineBreaks(snapshot.summary || "Sintetize experiencia, diferenciais e repertorio com linguagem direta e convincente.")}</p>
            </section>
          </div>

          <section style="margin-top:${theme.sectionGap};">
            <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Experiencia profissional</div>
            ${experienceMarkup}
          </section>

          <div style="display:grid;grid-template-columns:0.8fr 1.2fr 1fr;gap:20px;margin-top:${theme.sectionGap};">
            <section style="border:1px solid ${theme.lineColor};border-radius:22px;padding:20px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Habilidades</div>
              <div style="margin-top:10px;">${skillMarkup}</div>
            </section>
            <section style="border:1px solid ${theme.lineColor};border-radius:22px;padding:20px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Projetos</div>
              ${projectMarkup}
            </section>
            <section>
              <section style="border:1px solid ${theme.lineColor};border-radius:22px;padding:20px;">
                <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Formacao</div>
                ${educationMarkup}
              </section>
              <section style="border:1px solid ${theme.lineColor};border-radius:22px;padding:20px;margin-top:20px;">
                <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Idiomas e certificacoes</div>
                ${languagesMarkup}
                ${certificationsMarkup}
              </section>
            </section>
          </div>

          ${
            snapshot.additionalInfo
              ? `<section style="margin-top:${theme.sectionGap};border:1px solid ${theme.lineColor};border-radius:22px;padding:20px;">
                  <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Informacoes adicionais</div>
                  <p style="font-size:14px;line-height:1.9;color:${theme.mutedColor};margin:12px 0 0;">${withLineBreaks(snapshot.additionalInfo)}</p>
                </section>`
              : ""
          }
        </div>
      </article>
    `,
    theme,
    "#f8fafc",
  );
}
