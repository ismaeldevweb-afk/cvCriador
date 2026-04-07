import { buildThemeTokens, escapeHtml, getResumeSnapshot, withLineBreaks, wrapDocument } from "./templateUtils";
import { ProfilePhoto, renderProfilePhotoMarkup } from "./templatePhoto";

function SectionTitle({ theme, children }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.34em]" style={{ color: theme.primaryColor }}>
      {children}
    </p>
  );
}

function Card({ theme, title, children }) {
  return (
    <section className="rounded-[24px] border bg-white/92 p-5 backdrop-blur" style={{ borderColor: theme.lineColor }}>
      <SectionTitle theme={theme}>{title}</SectionTitle>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function SpotlightTemplate({ resume, theme = buildThemeTokens(resume.customization) }) {
  const snapshot = getResumeSnapshot(resume);
  const contactLines = snapshot.contactLines.length > 0 ? snapshot.contactLines : ["Email, telefone e links profissionais"];
  const hasPhoto = Boolean(snapshot.personal.photo);

  return (
    <article
      className="overflow-hidden rounded-[32px] bg-[linear-gradient(180deg,#0f172a_0%,#111827_32%,#ffffff_32%,#ffffff_100%)] shadow-[0_24px_70px_rgba(15,23,42,0.14)]"
      style={{ fontFamily: theme.fontFamily }}
    >
      <header className="px-8 pb-8 pt-10 text-white lg:px-10">
        <div className={hasPhoto ? "grid gap-8 lg:grid-cols-[156px_minmax(0,1fr)]" : "grid gap-8"}>
          {hasPhoto ? (
            <div className="flex items-start">
              <ProfilePhoto
                alt={snapshot.personal.fullName || "Foto profissional"}
                className="border-white/15 bg-white/10"
                height={156}
                photo={snapshot.personal.photo}
                radius="36px"
                width={156}
              />
            </div>
          ) : null}

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em]" style={{ color: `${theme.primaryColor}` }}>
              {snapshot.title || "Template destaque"}
            </p>
            <h1 className="mt-5 max-w-4xl font-semibold tracking-tight" style={{ fontSize: theme.titleSize }}>
              {snapshot.personal.fullName || "Seu nome"}
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-white/78">
              {snapshot.personal.role || "Posicionamento visual forte, resumo objetivo e leitura premium para perfis estrategicos."}
            </p>
            <div className="mt-6 rounded-[28px] border border-white/10 bg-white/6 p-5 text-[15px] leading-8 text-white/76">
              {snapshot.summary || "Use o hero para comunicar rapidamente senioridade, repertorio e diferencial competitivo."}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {contactLines.slice(0, 6).map((line) => (
            <span
              key={line}
              className="rounded-full border border-white/12 bg-white/8 px-3 py-2 text-xs font-semibold text-white/78"
            >
              {line}
            </span>
          ))}
        </div>
      </header>

      <div className="grid gap-6 bg-white p-8 lg:grid-cols-[1.18fr_0.82fr] lg:p-10">
        <main className="space-y-6">
          <Card theme={theme} title="Experiencia profissional">
            <div className="space-y-5">
              {snapshot.experience.map((item) => (
                <div key={item.id} className="rounded-[22px] bg-slate-50 p-5">
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
              ))}
            </div>
          </Card>

          <Card theme={theme} title="Projetos em destaque">
            <div className="grid gap-4">
              {snapshot.projects.map((item) => (
                <div key={item.id} className="rounded-[22px] border border-slate-200 p-5">
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
          </Card>
        </main>

        <aside className="space-y-6">
          <Card theme={theme} title="Objetivo">
            <p className="text-[15px] leading-7 text-slate-700">
              {snapshot.objective || "Apresente o tipo de desafio que voce busca e o contexto em que entrega seu melhor trabalho."}
            </p>
          </Card>

          <Card theme={theme} title="Habilidades principais">
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
          </Card>

          <Card theme={theme} title="Formacao">
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
          </Card>

          <Card theme={theme} title="Idiomas e certificacoes">
            <div className="space-y-3">
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
          </Card>

          {snapshot.additionalInfo ? (
            <Card theme={theme} title="Informacoes adicionais">
              <p className="text-[15px] leading-7 text-slate-700">{snapshot.additionalInfo}</p>
            </Card>
          ) : null}
        </aside>
      </div>
    </article>
  );
}

export function renderSpotlightDocument(resume, options = {}) {
  const theme = buildThemeTokens(resume.customization);
  const snapshot = getResumeSnapshot(resume);
  const hasPhoto = Boolean(snapshot.personal.photo);
  const contactMarkup = (snapshot.contactLines.length > 0 ? snapshot.contactLines : ["Email, telefone e links profissionais"])
    .slice(0, 6)
    .map(
      (line) =>
        `<span style="display:inline-flex;margin:8px 8px 0 0;border-radius:999px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.08);padding:10px 14px;font-size:12px;font-weight:700;color:rgba(255,255,255,0.78);">${escapeHtml(line)}</span>`,
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
  const projectsMarkup = snapshot.projects
    .map(
      (item) => `
        <div style="margin-top:16px;border:1px solid #e2e8f0;border-radius:22px;padding:20px;">
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
      <article style="overflow:hidden;border-radius:32px;background:linear-gradient(180deg,#0f172a 0%,#111827 32%,#ffffff 32%,#ffffff 100%);box-shadow:0 24px 70px rgba(15,23,42,0.14);">
        <header style="padding:40px 40px 32px;color:#ffffff;">
          <div style="display:grid;grid-template-columns:${hasPhoto ? "156px minmax(0, 1fr)" : "minmax(0, 1fr)"};gap:32px;">
            ${
              hasPhoto
                ? `<div>${renderProfilePhotoMarkup({
                    photo: snapshot.personal.photo,
                    alt: snapshot.personal.fullName || "Foto profissional",
                    width: 156,
                    height: 156,
                    radius: "36px",
                    borderColor: "rgba(255,255,255,0.15)",
                    background: "rgba(255,255,255,0.1)",
                  })}</div>`
                : ""
            }
            <div>
              <div style="font-size:12px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">${escapeHtml(snapshot.title || "Template destaque")}</div>
              <div style="font-size:${theme.titleSize};font-weight:700;letter-spacing:-0.04em;margin-top:18px;">${escapeHtml(snapshot.personal.fullName || "Seu nome")}</div>
              <div style="max-width:700px;font-size:18px;line-height:1.8;color:rgba(255,255,255,0.78);margin-top:14px;">${escapeHtml(snapshot.personal.role || "Posicionamento visual forte, resumo objetivo e leitura premium para perfis estrategicos.")}</div>
              <div style="margin-top:18px;border:1px solid rgba(255,255,255,0.10);border-radius:28px;background:rgba(255,255,255,0.06);padding:18px 20px;font-size:15px;line-height:1.9;color:rgba(255,255,255,0.76);">${withLineBreaks(snapshot.summary || "Use o hero para comunicar rapidamente senioridade, repertorio e diferencial competitivo.")}</div>
            </div>
          </div>
          <div style="margin-top:24px;">${contactMarkup}</div>
        </header>

        <div style="display:grid;grid-template-columns:1.18fr 0.82fr;gap:24px;padding:32px 40px;background:#ffffff;">
          <main>
            <section style="border:1px solid ${theme.lineColor};border-radius:24px;background:rgba(255,255,255,0.92);padding:20px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Experiencia profissional</div>
              ${experienceMarkup}
            </section>
            <section style="border:1px solid ${theme.lineColor};border-radius:24px;background:rgba(255,255,255,0.92);padding:20px;margin-top:24px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Projetos em destaque</div>
              ${projectsMarkup}
            </section>
          </main>

          <aside>
            <section style="border:1px solid ${theme.lineColor};border-radius:24px;background:rgba(255,255,255,0.92);padding:20px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Objetivo</div>
              <p style="font-size:15px;line-height:1.8;color:${theme.mutedColor};margin:14px 0 0;">${withLineBreaks(snapshot.objective || "Apresente o tipo de desafio que voce busca e o contexto em que entrega seu melhor trabalho.")}</p>
            </section>
            <section style="border:1px solid ${theme.lineColor};border-radius:24px;background:rgba(255,255,255,0.92);padding:20px;margin-top:24px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Habilidades principais</div>
              <div style="margin-top:10px;">${skillsMarkup}</div>
            </section>
            <section style="border:1px solid ${theme.lineColor};border-radius:24px;background:rgba(255,255,255,0.92);padding:20px;margin-top:24px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Formacao</div>
              ${educationMarkup}
            </section>
            <section style="border:1px solid ${theme.lineColor};border-radius:24px;background:rgba(255,255,255,0.92);padding:20px;margin-top:24px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Idiomas e certificacoes</div>
              ${languagesMarkup}
              ${certificationsMarkup}
            </section>
            ${
              snapshot.additionalInfo
                ? `<section style="border:1px solid ${theme.lineColor};border-radius:24px;background:rgba(255,255,255,0.92);padding:20px;margin-top:24px;">
                    <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Informacoes adicionais</div>
                    <p style="font-size:15px;line-height:1.8;color:${theme.mutedColor};margin:14px 0 0;">${withLineBreaks(snapshot.additionalInfo)}</p>
                  </section>`
                : ""
            }
          </aside>
        </div>
      </article>
    `,
    theme,
    "#f4f7fb",
    options,
  );
}
