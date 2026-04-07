import { buildThemeTokens, escapeHtml, getResumeSnapshot, withLineBreaks, wrapDocument } from "./templateUtils";
import { ProfilePhoto, renderProfilePhotoMarkup } from "./templatePhoto";

function SectionTitle({ theme, children }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.34em]" style={{ color: theme.primaryColor }}>
      {children}
    </p>
  );
}

function GlassCard({ theme, title, children }) {
  return (
    <section className="rounded-[24px] border bg-white/5 p-5 backdrop-blur" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
      <SectionTitle theme={theme}>{title}</SectionTitle>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function NoirTemplate({ resume, theme = buildThemeTokens(resume.customization) }) {
  const snapshot = getResumeSnapshot(resume);
  const hasPhoto = Boolean(snapshot.personal.photo);
  const contactLines = snapshot.contactLines.length > 0 ? snapshot.contactLines : ["Dados de contato e links profissionais"];

  return (
    <article className="overflow-hidden rounded-[32px] bg-[#0b1220] text-white shadow-[0_26px_80px_rgba(2,6,23,0.42)]" style={{ fontFamily: theme.fontFamily }}>
      <header className="border-b border-white/10 px-8 pb-8 pt-10 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em]" style={{ color: theme.primaryColor }}>
              {snapshot.title || "Noir signature"}
            </p>
            <h1 className="mt-6 max-w-4xl font-semibold tracking-tight text-white" style={{ fontSize: theme.titleSize }}>
              {snapshot.personal.fullName || "Seu nome"}
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-white/70">
              {snapshot.personal.role || "Template escuro com contraste elegante para posicionamento premium, impacto visual e leitura confiante."}
            </p>
            <div className="mt-6 rounded-[28px] border border-white/10 bg-white/5 px-6 py-5 text-[16px] leading-8 text-white/72">
              {snapshot.summary || "Use o resumo como manifesto curto: resultados, repertorio e maturidade profissional em tom direto e sofisticado."}
            </div>
          </div>

          <div className="space-y-4">
            {hasPhoto ? (
              <div className="flex justify-start lg:justify-end">
                <ProfilePhoto
                  alt={snapshot.personal.fullName || "Foto profissional"}
                  className="border-white/12 bg-white/10"
                  height={128}
                  photo={snapshot.personal.photo}
                  radius="30px"
                  width={128}
                />
              </div>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2">
              {contactLines.slice(0, 6).map((line) => (
                <div key={line} className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-6 text-white/70">
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-6 px-8 py-8 lg:grid-cols-[300px_minmax(0,1fr)] lg:px-10">
        <aside className="space-y-6">
          <GlassCard theme={theme} title="Objetivo">
            <p className="text-[15px] leading-7 text-white/74">
              {snapshot.objective || "Defina o proximo movimento da carreira, o ambiente buscado e a natureza do impacto que voce quer liderar."}
            </p>
          </GlassCard>

          <GlassCard theme={theme} title="Competencias">
            <div className="flex flex-wrap gap-2">
              {snapshot.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-white/10 px-3 py-2 text-xs font-semibold"
                  style={{ backgroundColor: `${theme.primaryColor}18`, color: theme.primaryColor }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </GlassCard>

          <GlassCard theme={theme} title="Idiomas e certificacoes">
            <div className="space-y-4">
              {snapshot.languages.map((item) => (
                <div key={item.id}>
                  <p className="font-semibold text-white">{item.name}</p>
                  <p className="text-sm text-white/58">{item.level}</p>
                </div>
              ))}
              {snapshot.certifications.map((item) => (
                <div key={item.id}>
                  <p className="font-semibold text-white">{item.name}</p>
                  <p className="text-sm text-white/58">{[item.issuer, item.year].filter(Boolean).join(" • ")}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          {snapshot.additionalInfo ? (
            <GlassCard theme={theme} title="Informacoes adicionais">
              <p className="text-[15px] leading-7 text-white/72">{snapshot.additionalInfo}</p>
            </GlassCard>
          ) : null}
        </aside>

        <main className="space-y-6">
          <section className="rounded-[28px] border border-white/10 bg-white/4 p-6">
            <SectionTitle theme={theme}>Experiencia profissional</SectionTitle>
            <div className="mt-5 space-y-5">
              {snapshot.experience.map((item) => (
                <div key={item.id} className="rounded-[24px] border border-white/10 bg-[#101a2d] p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-white">{item.role}</p>
                      <p className="text-sm text-white/58">{item.company}</p>
                    </div>
                    <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]" style={{ backgroundColor: `${theme.primaryColor}18`, color: theme.primaryColor }}>
                      {item.period}
                    </span>
                  </div>
                  <p className="mt-4 text-[15px] leading-7 text-white/70">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
            <section className="rounded-[28px] border border-white/10 bg-white/4 p-6">
              <SectionTitle theme={theme}>Projetos</SectionTitle>
              <div className="mt-5 space-y-4">
                {snapshot.projects.map((item) => (
                  <div key={item.id} className="rounded-[22px] border border-white/10 bg-[#101a2d] p-5">
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="font-semibold text-white">{item.name}</p>
                        <p className="text-sm text-white/58">{item.technologies}</p>
                      </div>
                      <span className="text-sm font-semibold" style={{ color: theme.primaryColor }}>
                        {item.link}
                      </span>
                    </div>
                    <p className="mt-3 text-[15px] leading-7 text-white/70">{item.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[28px] border border-white/10 bg-white/4 p-6">
              <SectionTitle theme={theme}>Formacao</SectionTitle>
              <div className="mt-5 space-y-4">
                {snapshot.education.map((item) => (
                  <div key={item.id}>
                    <p className="font-semibold text-white">{item.course}</p>
                    <p className="text-sm text-white/58">{item.institution}</p>
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

export function renderNoirDocument(resume, options = {}) {
  const theme = buildThemeTokens(resume.customization);
  const snapshot = getResumeSnapshot(resume);
  const hasPhoto = Boolean(snapshot.personal.photo);
  const contactMarkup = (snapshot.contactLines.length > 0 ? snapshot.contactLines : ["Dados de contato e links profissionais"])
    .slice(0, 6)
    .map(
      (line) => `<div style="border:1px solid rgba(255,255,255,0.1);border-radius:22px;background:rgba(255,255,255,0.05);padding:14px 16px;font-size:13px;line-height:1.7;color:rgba(255,255,255,0.7);">${escapeHtml(line)}</div>`,
    )
    .join("");
  const skillsMarkup = snapshot.skills
    .map(
      (skill) => `<span style="display:inline-flex;margin:8px 8px 0 0;border-radius:999px;border:1px solid rgba(255,255,255,0.1);padding:8px 12px;background:${theme.primaryColor}18;font-size:12px;font-weight:700;color:${theme.primaryColor};">${escapeHtml(skill)}</span>`,
    )
    .join("");
  const experienceMarkup = snapshot.experience
    .map(
      (item) => `
        <div style="margin-top:18px;border:1px solid rgba(255,255,255,0.1);border-radius:24px;background:#101a2d;padding:20px;">
          <div style="display:flex;justify-content:space-between;gap:16px;align-items:flex-start;">
            <div>
              <div style="font-size:18px;font-weight:700;color:#ffffff;">${escapeHtml(item.role)}</div>
              <div style="font-size:14px;color:rgba(255,255,255,0.58);margin-top:4px;">${escapeHtml(item.company)}</div>
            </div>
            <div style="display:inline-flex;border-radius:999px;padding:8px 12px;background:${theme.primaryColor}18;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${theme.primaryColor};">${escapeHtml(item.period)}</div>
          </div>
          <p style="font-size:15px;line-height:1.8;color:rgba(255,255,255,0.70);margin:14px 0 0;">${withLineBreaks(item.description)}</p>
        </div>`,
    )
    .join("");
  const projectsMarkup = snapshot.projects
    .map(
      (item) => `
        <div style="margin-top:16px;border:1px solid rgba(255,255,255,0.1);border-radius:22px;background:#101a2d;padding:20px;">
          <div style="display:flex;justify-content:space-between;gap:16px;align-items:flex-start;">
            <div>
              <div style="font-weight:700;color:#ffffff;">${escapeHtml(item.name)}</div>
              <div style="font-size:14px;color:rgba(255,255,255,0.58);margin-top:4px;">${escapeHtml(item.technologies)}</div>
            </div>
            <div style="font-size:13px;font-weight:700;color:${theme.primaryColor};">${escapeHtml(item.link)}</div>
          </div>
          <p style="font-size:15px;line-height:1.8;color:rgba(255,255,255,0.70);margin:12px 0 0;">${withLineBreaks(item.description)}</p>
        </div>`,
    )
    .join("");
  const educationMarkup = snapshot.education
    .map(
      (item) => `
        <div style="margin-top:14px;">
          <div style="font-weight:700;color:#ffffff;">${escapeHtml(item.course)}</div>
          <div style="font-size:14px;color:rgba(255,255,255,0.58);margin-top:4px;">${escapeHtml(item.institution)}</div>
          <div style="font-size:13px;font-weight:700;color:${theme.primaryColor};margin-top:8px;">${escapeHtml(item.period)}</div>
        </div>`,
    )
    .join("");
  const languagesMarkup = snapshot.languages
    .map(
      (item) => `
        <div style="margin-top:12px;">
          <div style="font-weight:700;color:#ffffff;">${escapeHtml(item.name)}</div>
          <div style="font-size:14px;color:rgba(255,255,255,0.58);margin-top:4px;">${escapeHtml(item.level)}</div>
        </div>`,
    )
    .join("");
  const certificationsMarkup = snapshot.certifications
    .map(
      (item) => `
        <div style="margin-top:12px;">
          <div style="font-weight:700;color:#ffffff;">${escapeHtml(item.name)}</div>
          <div style="font-size:14px;color:rgba(255,255,255,0.58);margin-top:4px;">${escapeHtml([item.issuer, item.year].filter(Boolean).join(" • "))}</div>
        </div>`,
    )
    .join("");

  return wrapDocument(
    `
      <article style="overflow:hidden;border-radius:32px;background:#0b1220;color:#ffffff;box-shadow:0 26px 80px rgba(2,6,23,0.42);">
        <header style="border-bottom:1px solid rgba(255,255,255,0.1);padding:40px 40px 32px;">
          <div style="display:grid;grid-template-columns:1.1fr 0.9fr;gap:32px;">
            <div>
              <div style="font-size:12px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">${escapeHtml(snapshot.title || "Noir signature")}</div>
              <div style="font-size:${theme.titleSize};font-weight:700;letter-spacing:-0.04em;color:#ffffff;margin-top:22px;">${escapeHtml(snapshot.personal.fullName || "Seu nome")}</div>
              <div style="max-width:700px;font-size:18px;line-height:1.8;color:rgba(255,255,255,0.70);margin-top:14px;">${escapeHtml(snapshot.personal.role || "Template escuro com contraste elegante para posicionamento premium, impacto visual e leitura confiante.")}</div>
              <div style="margin-top:20px;border:1px solid rgba(255,255,255,0.1);border-radius:28px;background:rgba(255,255,255,0.05);padding:20px 24px;font-size:16px;line-height:1.9;color:rgba(255,255,255,0.72);">${withLineBreaks(snapshot.summary || "Use o resumo como manifesto curto: resultados, repertorio e maturidade profissional em tom direto e sofisticado.")}</div>
            </div>
            <div>
              ${
                hasPhoto
                  ? `<div style="display:flex;justify-content:flex-end;margin-bottom:16px;">${renderProfilePhotoMarkup({
                      photo: snapshot.personal.photo,
                      alt: snapshot.personal.fullName || "Foto profissional",
                      width: 128,
                      height: 128,
                      radius: "30px",
                      borderColor: "rgba(255,255,255,0.12)",
                      background: "rgba(255,255,255,0.1)",
                    })}</div>`
                  : ""
              }
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">${contactMarkup}</div>
            </div>
          </div>
        </header>

        <div style="display:grid;grid-template-columns:300px minmax(0, 1fr);gap:24px;padding:32px 40px;">
          <aside>
            <section style="border:1px solid rgba(255,255,255,0.12);border-radius:24px;background:rgba(255,255,255,0.05);padding:20px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Objetivo</div>
              <p style="font-size:15px;line-height:1.8;color:rgba(255,255,255,0.74);margin:14px 0 0;">${withLineBreaks(snapshot.objective || "Defina o proximo movimento da carreira, o ambiente buscado e a natureza do impacto que voce quer liderar.")}</p>
            </section>
            <section style="border:1px solid rgba(255,255,255,0.12);border-radius:24px;background:rgba(255,255,255,0.05);padding:20px;margin-top:24px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Competencias</div>
              <div style="margin-top:10px;">${skillsMarkup}</div>
            </section>
            <section style="border:1px solid rgba(255,255,255,0.12);border-radius:24px;background:rgba(255,255,255,0.05);padding:20px;margin-top:24px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Idiomas e certificacoes</div>
              ${languagesMarkup}
              ${certificationsMarkup}
            </section>
            ${
              snapshot.additionalInfo
                ? `<section style="border:1px solid rgba(255,255,255,0.12);border-radius:24px;background:rgba(255,255,255,0.05);padding:20px;margin-top:24px;">
                    <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Informacoes adicionais</div>
                    <p style="font-size:15px;line-height:1.8;color:rgba(255,255,255,0.72);margin:14px 0 0;">${withLineBreaks(snapshot.additionalInfo)}</p>
                  </section>`
                : ""
            }
          </aside>

          <main>
            <section style="border:1px solid rgba(255,255,255,0.1);border-radius:28px;background:rgba(255,255,255,0.04);padding:24px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Experiencia profissional</div>
              ${experienceMarkup}
            </section>
            <div style="display:grid;grid-template-columns:1.02fr 0.98fr;gap:24px;margin-top:24px;">
              <section style="border:1px solid rgba(255,255,255,0.1);border-radius:28px;background:rgba(255,255,255,0.04);padding:24px;">
                <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Projetos</div>
                ${projectsMarkup}
              </section>
              <section style="border:1px solid rgba(255,255,255,0.1);border-radius:28px;background:rgba(255,255,255,0.04);padding:24px;">
                <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Formacao</div>
                ${educationMarkup}
              </section>
            </div>
          </main>
        </div>
      </article>
    `,
    theme,
    "#050b16",
    options,
  );
}
