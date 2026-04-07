import { buildThemeTokens, escapeHtml, getResumeSnapshot, withLineBreaks, wrapDocument } from "./templateUtils";
import { ProfilePhoto, renderProfilePhotoMarkup } from "./templatePhoto";

function MetaSection({ theme, title, children }) {
  return (
    <section>
      <p className="text-[11px] font-bold uppercase tracking-[0.4em]" style={{ color: theme.primaryColor }}>
        {title}
      </p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function EditorialTemplate({ resume, theme = buildThemeTokens(resume.customization) }) {
  const snapshot = getResumeSnapshot(resume);

  return (
    <article className="overflow-hidden rounded-[30px] bg-[#fcfaf6] shadow-[0_22px_70px_rgba(15,23,42,0.12)]" style={{ fontFamily: theme.fontFamily }}>
      <header className="border-b px-8 pb-8 pt-10 lg:px-10" style={{ borderColor: theme.lineColor }}>
        <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em]" style={{ color: theme.primaryColor }}>
              {snapshot.title || "Curriculo editorial"}
            </p>
            {snapshot.personal.photo ? (
              <div className="mt-6">
                <ProfilePhoto
                  alt={snapshot.personal.fullName || "Foto profissional"}
                  className="border-slate-200 bg-white"
                  height={128}
                  photo={snapshot.personal.photo}
                  radius="32px"
                  width={128}
                />
              </div>
            ) : null}
          </div>
          <div>
            <h1 className="max-w-4xl font-display text-5xl leading-[0.96] tracking-tight text-slate-950 md:text-6xl">
              {snapshot.personal.fullName || "Seu nome"}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
              {snapshot.personal.role || "Narrativa profissional com repertorio, clareza e diferencas bem comunicadas."}
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-0 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="border-r p-8" style={{ borderColor: theme.lineColor }}>
          <div className="space-y-8">
            <MetaSection theme={theme} title="Contato">
              <div className="space-y-2 text-sm leading-7 text-slate-600">
                {(snapshot.contactLines.length > 0 ? snapshot.contactLines : ["Dados de contato e links profissionais"]).map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </MetaSection>

            <MetaSection theme={theme} title="Habilidades">
              <div className="space-y-2 text-sm leading-7 text-slate-600">
                {snapshot.skills.map((skill) => (
                  <p key={skill}>{skill}</p>
                ))}
              </div>
            </MetaSection>

            <MetaSection theme={theme} title="Idiomas">
              <div className="space-y-3 text-sm leading-7 text-slate-600">
                {snapshot.languages.map((item) => (
                  <div key={item.id}>
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <p>{item.level}</p>
                  </div>
                ))}
              </div>
            </MetaSection>

            <MetaSection theme={theme} title="Certificacoes">
              <div className="space-y-3 text-sm leading-7 text-slate-600">
                {snapshot.certifications.map((item) => (
                  <div key={item.id}>
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <p>{[item.issuer, item.year].filter(Boolean).join(" • ")}</p>
                  </div>
                ))}
              </div>
            </MetaSection>
          </div>
        </aside>

        <main className="space-y-8 p-8 lg:p-10">
          <section className="rounded-[26px] border bg-white px-6 py-6" style={{ borderColor: theme.lineColor }}>
            <p className="text-xl leading-9 text-slate-700">
              {snapshot.summary || "Use este espaco para sintetizar contexto, diferenciacao e o tipo de valor que sua experiencia entrega."}
            </p>
          </section>

          <section>
            <p className="text-[11px] font-bold uppercase tracking-[0.4em]" style={{ color: theme.primaryColor }}>
              Objetivo profissional
            </p>
            <p className="mt-4 max-w-4xl text-[15px] leading-8 text-slate-700">
              {snapshot.objective || "Explique o tipo de oportunidade buscada, o contexto em que voce gera melhor resultado e seu foco de contribuicao."}
            </p>
          </section>

          <section>
            <p className="text-[11px] font-bold uppercase tracking-[0.4em]" style={{ color: theme.primaryColor }}>
              Experiencia
            </p>
            <div className="mt-5 space-y-6">
              {snapshot.experience.map((item) => (
                <div key={item.id} className="grid gap-4 border-t pt-5 md:grid-cols-[160px_minmax(0,1fr)]" style={{ borderColor: theme.lineColor }}>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em]" style={{ color: theme.primaryColor }}>
                      {item.period}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">{item.company}</p>
                  </div>
                  <div>
                    <p className="text-xl font-semibold tracking-tight text-slate-950">{item.role}</p>
                    <p className="mt-3 text-[15px] leading-8 text-slate-700">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <p className="text-[11px] font-bold uppercase tracking-[0.4em]" style={{ color: theme.primaryColor }}>
              Projetos
            </p>
            <div className="mt-5 grid gap-4">
              {snapshot.projects.map((item) => (
                <div key={item.id} className="rounded-[24px] border bg-white p-5" style={{ borderColor: theme.lineColor }}>
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
            <section className="rounded-[24px] border bg-white p-6" style={{ borderColor: theme.lineColor }}>
              <p className="text-[11px] font-bold uppercase tracking-[0.4em]" style={{ color: theme.primaryColor }}>
                Formacao
              </p>
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

            {snapshot.additionalInfo ? (
              <section className="rounded-[24px] border bg-white p-6" style={{ borderColor: theme.lineColor }}>
                <p className="text-[11px] font-bold uppercase tracking-[0.4em]" style={{ color: theme.primaryColor }}>
                  Informacoes adicionais
                </p>
                <p className="mt-4 text-[15px] leading-8 text-slate-700">{snapshot.additionalInfo}</p>
              </section>
            ) : null}
          </div>
        </main>
      </div>
    </article>
  );
}

export function renderEditorialDocument(resume, options = {}) {
  const theme = buildThemeTokens(resume.customization);
  const snapshot = getResumeSnapshot(resume);
  const contactMarkup = (snapshot.contactLines.length > 0 ? snapshot.contactLines : ["Dados de contato e links profissionais"])
    .map((line) => `<div>${escapeHtml(line)}</div>`)
    .join("");
  const skillsMarkup = snapshot.skills.map((skill) => `<div>${escapeHtml(skill)}</div>`).join("");
  const languagesMarkup = snapshot.languages
    .map(
      (item) => `
        <div style="margin-top:12px;">
          <div style="font-weight:700;color:#020617;">${escapeHtml(item.name)}</div>
          <div style="margin-top:2px;">${escapeHtml(item.level)}</div>
        </div>`,
    )
    .join("");
  const certificationsMarkup = snapshot.certifications
    .map(
      (item) => `
        <div style="margin-top:12px;">
          <div style="font-weight:700;color:#020617;">${escapeHtml(item.name)}</div>
          <div style="margin-top:2px;">${escapeHtml([item.issuer, item.year].filter(Boolean).join(" • "))}</div>
        </div>`,
    )
    .join("");
  const experienceMarkup = snapshot.experience
    .map(
      (item) => `
        <div style="display:grid;grid-template-columns:160px minmax(0, 1fr);gap:16px;border-top:1px solid ${theme.lineColor};padding-top:20px;margin-top:20px;">
          <div>
            <div style="font-size:12px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:${theme.primaryColor};">${escapeHtml(item.period)}</div>
            <div style="font-size:14px;color:${theme.mutedColor};margin-top:8px;">${escapeHtml(item.company)}</div>
          </div>
          <div>
            <div style="font-size:22px;font-weight:700;letter-spacing:-0.03em;color:#020617;">${escapeHtml(item.role)}</div>
            <p style="font-size:15px;line-height:1.9;color:${theme.mutedColor};margin:12px 0 0;">${withLineBreaks(item.description)}</p>
          </div>
        </div>`,
    )
    .join("");
  const projectsMarkup = snapshot.projects
    .map(
      (item) => `
        <div style="margin-top:16px;border:1px solid ${theme.lineColor};border-radius:24px;background:#ffffff;padding:20px;">
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
      <article style="overflow:hidden;border-radius:30px;background:#fcfaf6;box-shadow:0 22px 70px rgba(15,23,42,0.12);">
        <header style="border-bottom:1px solid ${theme.lineColor};padding:40px 40px 32px;">
          <div style="display:grid;grid-template-columns:220px minmax(0, 1fr);gap:32px;">
            <div>
              <div style="font-size:12px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">${escapeHtml(snapshot.title || "Curriculo editorial")}</div>
              ${
                snapshot.personal.photo
                  ? `<div style="margin-top:24px;">${renderProfilePhotoMarkup({
                      photo: snapshot.personal.photo,
                      alt: snapshot.personal.fullName || "Foto profissional",
                      width: 128,
                      height: 128,
                      radius: "32px",
                      borderColor: "#e2e8f0",
                      background: "#ffffff",
                    })}</div>`
                  : ""
              }
            </div>
            <div>
              <div style="max-width:760px;font-family:${theme.fontFamily};font-size:58px;line-height:0.96;font-weight:700;letter-spacing:-0.05em;color:#020617;">${escapeHtml(snapshot.personal.fullName || "Seu nome")}</div>
              <div style="max-width:700px;font-size:18px;line-height:1.8;color:${theme.mutedColor};margin-top:18px;">${escapeHtml(snapshot.personal.role || "Narrativa profissional com repertorio, clareza e diferencas bem comunicadas.")}</div>
            </div>
          </div>
        </header>
        <div style="display:grid;grid-template-columns:220px minmax(0, 1fr);">
          <aside style="padding:32px;border-right:1px solid ${theme.lineColor};">
            <section>
              <div style="font-size:11px;font-weight:700;letter-spacing:0.4em;text-transform:uppercase;color:${theme.primaryColor};">Contato</div>
              <div style="margin-top:14px;font-size:14px;line-height:1.8;color:${theme.mutedColor};">${contactMarkup}</div>
            </section>
            <section style="margin-top:30px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.4em;text-transform:uppercase;color:${theme.primaryColor};">Habilidades</div>
              <div style="margin-top:14px;font-size:14px;line-height:1.8;color:${theme.mutedColor};">${skillsMarkup}</div>
            </section>
            <section style="margin-top:30px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.4em;text-transform:uppercase;color:${theme.primaryColor};">Idiomas</div>
              <div style="margin-top:14px;font-size:14px;line-height:1.8;color:${theme.mutedColor};">${languagesMarkup}</div>
            </section>
            <section style="margin-top:30px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.4em;text-transform:uppercase;color:${theme.primaryColor};">Certificacoes</div>
              <div style="margin-top:14px;font-size:14px;line-height:1.8;color:${theme.mutedColor};">${certificationsMarkup}</div>
            </section>
          </aside>
          <main style="padding:32px 40px;">
            <section style="border:1px solid ${theme.lineColor};border-radius:26px;background:#ffffff;padding:24px;">
              <p style="font-size:20px;line-height:1.9;color:${theme.mutedColor};margin:0;">${withLineBreaks(snapshot.summary || "Use este espaco para sintetizar contexto, diferenciacao e o tipo de valor que sua experiencia entrega.")}</p>
            </section>
            <section style="margin-top:${theme.sectionGap};">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.4em;text-transform:uppercase;color:${theme.primaryColor};">Objetivo profissional</div>
              <p style="font-size:15px;line-height:1.9;color:${theme.mutedColor};margin:14px 0 0;">${withLineBreaks(snapshot.objective || "Explique o tipo de oportunidade buscada, o contexto em que voce gera melhor resultado e seu foco de contribuicao.")}</p>
            </section>
            <section style="margin-top:${theme.sectionGap};">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.4em;text-transform:uppercase;color:${theme.primaryColor};">Experiencia</div>
              ${experienceMarkup}
            </section>
            <section style="margin-top:${theme.sectionGap};">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.4em;text-transform:uppercase;color:${theme.primaryColor};">Projetos</div>
              ${projectsMarkup}
            </section>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:${theme.sectionGap};">
              <section style="border:1px solid ${theme.lineColor};border-radius:24px;background:#ffffff;padding:24px;">
                <div style="font-size:11px;font-weight:700;letter-spacing:0.4em;text-transform:uppercase;color:${theme.primaryColor};">Formacao</div>
                ${educationMarkup}
              </section>
              ${
                snapshot.additionalInfo
                  ? `<section style="border:1px solid ${theme.lineColor};border-radius:24px;background:#ffffff;padding:24px;">
                      <div style="font-size:11px;font-weight:700;letter-spacing:0.4em;text-transform:uppercase;color:${theme.primaryColor};">Informacoes adicionais</div>
                      <p style="font-size:15px;line-height:1.9;color:${theme.mutedColor};margin:14px 0 0;">${withLineBreaks(snapshot.additionalInfo)}</p>
                    </section>`
                  : ""
              }
            </div>
          </main>
        </div>
      </article>
    `,
    theme,
    "#fcfaf6",
    options,
  );
}
