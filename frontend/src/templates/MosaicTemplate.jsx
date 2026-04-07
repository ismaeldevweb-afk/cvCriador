import { buildThemeTokens, escapeHtml, getResumeSnapshot, withLineBreaks, wrapDocument } from "./templateUtils";
import { ProfilePhoto, renderProfilePhotoMarkup } from "./templatePhoto";

function BlockTitle({ theme, children }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.34em]" style={{ color: theme.primaryColor }}>
      {children}
    </p>
  );
}

function Block({ theme, title, children, className = "", tinted = false }) {
  return (
    <section
      className={`rounded-[26px] border p-6 ${className}`}
      style={{ borderColor: theme.lineColor, backgroundColor: tinted ? theme.softTint : "#ffffff" }}
    >
      <BlockTitle theme={theme}>{title}</BlockTitle>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function MosaicTemplate({ resume, theme = buildThemeTokens(resume.customization) }) {
  const snapshot = getResumeSnapshot(resume);
  const hasPhoto = Boolean(snapshot.personal.photo);
  const contactLines = snapshot.contactLines.length > 0 ? snapshot.contactLines : ["Dados de contato e links profissionais"];

  return (
    <article className="overflow-hidden rounded-[34px] bg-[#f8fafc] shadow-[0_24px_72px_rgba(15,23,42,0.12)]" style={{ fontFamily: theme.fontFamily }}>
      <div className="grid gap-6 p-8 lg:grid-cols-[1.05fr_0.95fr] lg:p-10">
        <section className="rounded-[30px] bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.07)]">
          <div className={hasPhoto ? "grid gap-6 md:grid-cols-[126px_minmax(0,1fr)]" : "grid gap-6"}>
            {hasPhoto ? (
              <ProfilePhoto
                alt={snapshot.personal.fullName || "Foto profissional"}
                className="border-slate-200 bg-white"
                height={126}
                photo={snapshot.personal.photo}
                radius="30px"
                width={126}
              />
            ) : null}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em]" style={{ color: theme.primaryColor }}>
                {snapshot.title || "Mosaico profissional"}
              </p>
              <h1 className="mt-5 font-semibold tracking-tight text-slate-950" style={{ fontSize: theme.titleSize }}>
                {snapshot.personal.fullName || "Seu nome"}
              </h1>
              <p className="mt-3 max-w-2xl text-lg leading-8 text-slate-600">
                {snapshot.personal.role || "Grade modular para perfis com repertorio variado, projetos fortes e apresentacao visual dinamica."}
              </p>
            </div>
          </div>
          <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50/90 px-5 py-5">
            <p className="text-[16px] leading-8 text-slate-700">
              {snapshot.summary || "Organize os principais sinais de valor em blocos claros: contexto, especialidades, provas de trabalho e foco profissional."}
            </p>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          {contactLines.slice(0, 6).map((line) => (
            <div key={line} className="rounded-[24px] border bg-white px-4 py-4 text-sm leading-6 text-slate-600 shadow-[0_12px_32px_rgba(15,23,42,0.05)]" style={{ borderColor: theme.lineColor }}>
              {line}
            </div>
          ))}
        </section>

        <div className="grid gap-6 xl:grid-cols-2 xl:col-span-2">
          <Block theme={theme} title="Experiencia profissional" className="xl:row-span-2">
            <div className="space-y-5">
              {snapshot.experience.map((item) => (
                <div key={item.id} className="rounded-[22px] bg-slate-50 p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-slate-950">{item.role}</p>
                      <p className="text-sm text-slate-500">{item.company}</p>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: theme.primaryColor }}>
                      {item.period}
                    </span>
                  </div>
                  <p className="mt-4 text-[15px] leading-7 text-slate-700">{item.description}</p>
                </div>
              ))}
            </div>
          </Block>

          <Block theme={theme} title="Objetivo" tinted>
            <p className="text-[15px] leading-7 text-slate-700">
              {snapshot.objective || "Defina o tipo de oportunidade, escopo e desafio que melhor conversa com o seu momento profissional."}
            </p>
          </Block>

          <Block theme={theme} title="Competencias">
            <div className="flex flex-wrap gap-2">
              {snapshot.skills.map((skill) => (
                <span key={skill} className="rounded-full px-3 py-2 text-xs font-semibold" style={{ backgroundColor: theme.softTint, color: theme.primaryColor }}>
                  {skill}
                </span>
              ))}
            </div>
          </Block>

          <Block theme={theme} title="Projetos">
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
          </Block>

          <Block theme={theme} title="Formacao" tinted>
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
          </Block>

          <Block theme={theme} title="Idiomas e certificacoes">
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
          </Block>

          {snapshot.additionalInfo ? (
            <Block theme={theme} title="Informacoes adicionais" tinted className="xl:col-span-2">
              <p className="text-[15px] leading-7 text-slate-700">{snapshot.additionalInfo}</p>
            </Block>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function renderMosaicDocument(resume, options = {}) {
  const theme = buildThemeTokens(resume.customization);
  const snapshot = getResumeSnapshot(resume);
  const hasPhoto = Boolean(snapshot.personal.photo);
  const contactMarkup = (snapshot.contactLines.length > 0 ? snapshot.contactLines : ["Dados de contato e links profissionais"])
    .slice(0, 6)
    .map((line) => `<div style="border:1px solid ${theme.lineColor};border-radius:24px;background:#ffffff;padding:14px 16px;font-size:13px;line-height:1.7;color:${theme.mutedColor};box-shadow:0 12px 32px rgba(15,23,42,0.05);">${escapeHtml(line)}</div>`)
    .join("");
  const skillsMarkup = snapshot.skills
    .map((skill) => `<span style="display:inline-flex;margin:8px 8px 0 0;border-radius:999px;padding:8px 12px;background:${theme.softTint};font-size:12px;font-weight:700;color:${theme.primaryColor};">${escapeHtml(skill)}</span>`)
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
            <div style="font-size:13px;font-weight:700;color:${theme.primaryColor};">${escapeHtml(item.period)}</div>
          </div>
          <p style="font-size:15px;line-height:1.8;color:${theme.mutedColor};margin:14px 0 0;">${withLineBreaks(item.description)}</p>
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
      <article style="overflow:hidden;border-radius:34px;background:#f8fafc;box-shadow:0 24px 72px rgba(15,23,42,0.12);">
        <div style="display:grid;grid-template-columns:1.05fr 0.95fr;gap:24px;padding:32px 40px;">
          <section style="border-radius:30px;background:#ffffff;padding:32px;box-shadow:0 18px 50px rgba(15,23,42,0.07);">
            <div style="display:grid;grid-template-columns:${hasPhoto ? "126px minmax(0, 1fr)" : "minmax(0, 1fr)"};gap:24px;">
              ${
                hasPhoto
                  ? renderProfilePhotoMarkup({
                      photo: snapshot.personal.photo,
                      alt: snapshot.personal.fullName || "Foto profissional",
                      width: 126,
                      height: 126,
                      radius: "30px",
                      borderColor: "#e2e8f0",
                      background: "#ffffff",
                    })
                  : ""
              }
              <div>
                <div style="font-size:12px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">${escapeHtml(snapshot.title || "Mosaico profissional")}</div>
                <div style="font-size:${theme.titleSize};font-weight:700;letter-spacing:-0.04em;color:#020617;margin-top:18px;">${escapeHtml(snapshot.personal.fullName || "Seu nome")}</div>
                <div style="max-width:620px;font-size:18px;line-height:1.8;color:${theme.mutedColor};margin-top:12px;">${escapeHtml(snapshot.personal.role || "Grade modular para perfis com repertorio variado, projetos fortes e apresentacao visual dinamica.")}</div>
              </div>
            </div>
            <div style="margin-top:20px;border:1px solid #e2e8f0;border-radius:24px;background:rgba(248,250,252,0.9);padding:20px;font-size:16px;line-height:1.9;color:${theme.mutedColor};">${withLineBreaks(snapshot.summary || "Organize os principais sinais de valor em blocos claros: contexto, especialidades, provas de trabalho e foco profissional.")}</div>
          </section>

          <section style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">${contactMarkup}</section>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;grid-column:1 / -1;">
            <section style="grid-row:span 2;border:1px solid ${theme.lineColor};border-radius:26px;background:#ffffff;padding:24px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Experiencia profissional</div>
              ${experienceMarkup}
            </section>
            <section style="border:1px solid ${theme.lineColor};border-radius:26px;background:${theme.softTint};padding:24px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Objetivo</div>
              <p style="font-size:15px;line-height:1.8;color:${theme.mutedColor};margin:14px 0 0;">${withLineBreaks(snapshot.objective || "Defina o tipo de oportunidade, escopo e desafio que melhor conversa com o seu momento profissional.")}</p>
            </section>
            <section style="border:1px solid ${theme.lineColor};border-radius:26px;background:#ffffff;padding:24px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Competencias</div>
              <div style="margin-top:10px;">${skillsMarkup}</div>
            </section>
            <section style="border:1px solid ${theme.lineColor};border-radius:26px;background:#ffffff;padding:24px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Projetos</div>
              ${projectsMarkup}
            </section>
            <section style="border:1px solid ${theme.lineColor};border-radius:26px;background:${theme.softTint};padding:24px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Formacao</div>
              ${educationMarkup}
            </section>
            <section style="border:1px solid ${theme.lineColor};border-radius:26px;background:#ffffff;padding:24px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Idiomas e certificacoes</div>
              ${languagesMarkup}
              ${certificationsMarkup}
            </section>
            ${
              snapshot.additionalInfo
                ? `<section style="grid-column:1 / -1;border:1px solid ${theme.lineColor};border-radius:26px;background:${theme.softTint};padding:24px;">
                    <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Informacoes adicionais</div>
                    <p style="font-size:15px;line-height:1.8;color:${theme.mutedColor};margin:14px 0 0;">${withLineBreaks(snapshot.additionalInfo)}</p>
                  </section>`
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
