import { buildThemeTokens, escapeHtml, getResumeSnapshot, withLineBreaks, wrapDocument } from "./templateUtils";
import { ProfilePhoto, renderProfilePhotoMarkup } from "./templatePhoto";

function SectionTitle({ theme, children }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.34em]" style={{ color: theme.primaryColor }}>
      {children}
    </p>
  );
}

function RuledCard({ theme, title, children }) {
  return (
    <section className="rounded-[22px] border bg-white p-5" style={{ borderColor: theme.lineColor }}>
      <SectionTitle theme={theme}>{title}</SectionTitle>
      <div className="mt-4 border-t pt-4" style={{ borderColor: theme.lineColor }}>
        {children}
      </div>
    </section>
  );
}

export default function LedgerTemplate({ resume, theme = buildThemeTokens(resume.customization) }) {
  const snapshot = getResumeSnapshot(resume);
  const hasPhoto = Boolean(snapshot.personal.photo);
  const contactLines = snapshot.contactLines.length > 0 ? snapshot.contactLines : ["Dados de contato e links profissionais"];

  return (
    <article className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_22px_68px_rgba(15,23,42,0.10)]" style={{ fontFamily: theme.fontFamily }}>
      <div className="h-2 w-full" style={{ backgroundColor: theme.primaryColor }} />

      <header className="grid gap-8 border-b px-8 pb-8 pt-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-10" style={{ borderColor: theme.lineColor }}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.34em]" style={{ color: theme.primaryColor }}>
            {snapshot.title || "Ledger professional"}
          </p>
          <h1 className="mt-5 font-semibold tracking-tight text-slate-950" style={{ fontSize: theme.titleSize }}>
            {snapshot.personal.fullName || "Seu nome"}
          </h1>
          <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-600">
            {snapshot.personal.role || "Estrutura refinada para trajetorias densas, curriculos seniores e leitura altamente organizada."}
          </p>
          <div className="mt-5 rounded-[24px] bg-slate-50 px-5 py-5">
            <p className="text-[15px] leading-8 text-slate-700">
              {snapshot.summary || "Abra com contexto, senioridade, foco de atuacao e o tipo de decisao ou entrega em que voce costuma gerar seguranca."}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {hasPhoto ? (
            <div className="flex justify-start lg:justify-end">
              <ProfilePhoto
                alt={snapshot.personal.fullName || "Foto profissional"}
                className="border-slate-200 bg-white"
                height={110}
                photo={snapshot.personal.photo}
                radius="26px"
                width={110}
              />
            </div>
          ) : null}
          <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 text-sm leading-7 text-slate-600">
            {contactLines.slice(0, 6).map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
      </header>

      <div className="grid gap-6 p-8 lg:grid-cols-[1.12fr_0.88fr] lg:px-10 lg:py-10">
        <main className="space-y-6">
          <RuledCard theme={theme} title="Experiencia profissional">
            <div className="space-y-5">
              {snapshot.experience.map((item) => (
                <div key={item.id} className="border-b border-slate-100 pb-5 last:border-b-0 last:pb-0">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-slate-950">{item.role}</p>
                      <p className="text-sm text-slate-500">{item.company}</p>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: theme.primaryColor }}>
                      {item.period}
                    </span>
                  </div>
                  <p className="mt-3 text-[15px] leading-7 text-slate-700">{item.description}</p>
                </div>
              ))}
            </div>
          </RuledCard>

          <RuledCard theme={theme} title="Projetos">
            <div className="space-y-5">
              {snapshot.projects.map((item) => (
                <div key={item.id} className="border-b border-slate-100 pb-5 last:border-b-0 last:pb-0">
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
          </RuledCard>
        </main>

        <aside className="space-y-6">
          <RuledCard theme={theme} title="Objetivo">
            <p className="text-[15px] leading-7 text-slate-700">
              {snapshot.objective || "Defina o tipo de escopo, responsabilidade e ambiente que representam melhor seu proximo passo profissional."}
            </p>
          </RuledCard>

          <RuledCard theme={theme} title="Competencias">
            <div className="flex flex-wrap gap-2">
              {snapshot.skills.map((skill) => (
                <span key={skill} className="rounded-full px-3 py-2 text-xs font-semibold" style={{ backgroundColor: theme.softTint, color: theme.primaryColor }}>
                  {skill}
                </span>
              ))}
            </div>
          </RuledCard>

          <RuledCard theme={theme} title="Formacao">
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
          </RuledCard>

          <RuledCard theme={theme} title="Idiomas e certificacoes">
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
          </RuledCard>

          {snapshot.additionalInfo ? (
            <RuledCard theme={theme} title="Informacoes adicionais">
              <p className="text-[15px] leading-7 text-slate-700">{snapshot.additionalInfo}</p>
            </RuledCard>
          ) : null}
        </aside>
      </div>
    </article>
  );
}

export function renderLedgerDocument(resume) {
  const theme = buildThemeTokens(resume.customization);
  const snapshot = getResumeSnapshot(resume);
  const hasPhoto = Boolean(snapshot.personal.photo);
  const contactMarkup = (snapshot.contactLines.length > 0 ? snapshot.contactLines : ["Dados de contato e links profissionais"])
    .slice(0, 6)
    .map((line) => `<div>${escapeHtml(line)}</div>`)
    .join("");
  const skillsMarkup = snapshot.skills
    .map((skill) => `<span style="display:inline-flex;margin:8px 8px 0 0;border-radius:999px;padding:8px 12px;background:${theme.softTint};font-size:12px;font-weight:700;color:${theme.primaryColor};">${escapeHtml(skill)}</span>`)
    .join("");
  const experienceMarkup = snapshot.experience
    .map(
      (item) => `
        <div style="padding-bottom:18px;border-bottom:1px solid #f1f5f9;margin-top:18px;">
          <div style="display:flex;justify-content:space-between;gap:16px;align-items:flex-start;">
            <div>
              <div style="font-size:18px;font-weight:700;color:#020617;">${escapeHtml(item.role)}</div>
              <div style="font-size:14px;color:${theme.mutedColor};margin-top:4px;">${escapeHtml(item.company)}</div>
            </div>
            <div style="font-size:13px;font-weight:700;color:${theme.primaryColor};">${escapeHtml(item.period)}</div>
          </div>
          <p style="font-size:15px;line-height:1.8;color:${theme.mutedColor};margin:12px 0 0;">${withLineBreaks(item.description)}</p>
        </div>`,
    )
    .join("");
  const projectsMarkup = snapshot.projects
    .map(
      (item) => `
        <div style="padding-bottom:18px;border-bottom:1px solid #f1f5f9;margin-top:18px;">
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
      <article style="overflow:hidden;border:1px solid #e2e8f0;border-radius:30px;background:#ffffff;box-shadow:0 22px 68px rgba(15,23,42,0.10);">
        <div style="height:8px;width:100%;background:${theme.primaryColor};"></div>
        <header style="display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:32px;border-bottom:1px solid ${theme.lineColor};padding:32px 40px;">
          <div>
            <div style="font-size:12px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">${escapeHtml(snapshot.title || "Ledger professional")}</div>
            <div style="font-size:${theme.titleSize};font-weight:700;letter-spacing:-0.04em;color:#020617;margin-top:18px;">${escapeHtml(snapshot.personal.fullName || "Seu nome")}</div>
            <div style="max-width:700px;font-size:18px;line-height:1.8;color:${theme.mutedColor};margin-top:12px;">${escapeHtml(snapshot.personal.role || "Estrutura refinada para trajetorias densas, curriculos seniores e leitura altamente organizada.")}</div>
            <div style="margin-top:18px;border-radius:24px;background:#f8fafc;padding:18px 20px;font-size:15px;line-height:1.9;color:${theme.mutedColor};">${withLineBreaks(snapshot.summary || "Abra com contexto, senioridade, foco de atuacao e o tipo de decisao ou entrega em que voce costuma gerar seguranca.")}</div>
          </div>
          <div>
            ${
              hasPhoto
                ? `<div style="display:flex;justify-content:flex-end;margin-bottom:16px;">${renderProfilePhotoMarkup({
                    photo: snapshot.personal.photo,
                    alt: snapshot.personal.fullName || "Foto profissional",
                    width: 110,
                    height: 110,
                    radius: "26px",
                    borderColor: "#e2e8f0",
                    background: "#ffffff",
                  })}</div>`
                : ""
            }
            <div style="border:1px solid #e2e8f0;border-radius:24px;background:#ffffff;padding:16px 20px;font-size:13px;line-height:1.8;color:${theme.mutedColor};">${contactMarkup}</div>
          </div>
        </header>

        <div style="display:grid;grid-template-columns:1.12fr 0.88fr;gap:24px;padding:32px 40px;">
          <main>
            <section style="border:1px solid ${theme.lineColor};border-radius:22px;background:#ffffff;padding:20px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Experiencia profissional</div>
              <div style="margin-top:16px;border-top:1px solid ${theme.lineColor};padding-top:16px;">${experienceMarkup}</div>
            </section>
            <section style="border:1px solid ${theme.lineColor};border-radius:22px;background:#ffffff;padding:20px;margin-top:24px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Projetos</div>
              <div style="margin-top:16px;border-top:1px solid ${theme.lineColor};padding-top:16px;">${projectsMarkup}</div>
            </section>
          </main>
          <aside>
            <section style="border:1px solid ${theme.lineColor};border-radius:22px;background:#ffffff;padding:20px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Objetivo</div>
              <div style="margin-top:16px;border-top:1px solid ${theme.lineColor};padding-top:16px;">
                <p style="font-size:15px;line-height:1.8;color:${theme.mutedColor};margin:0;">${withLineBreaks(snapshot.objective || "Defina o tipo de escopo, responsabilidade e ambiente que representam melhor seu proximo passo profissional.")}</p>
              </div>
            </section>
            <section style="border:1px solid ${theme.lineColor};border-radius:22px;background:#ffffff;padding:20px;margin-top:24px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Competencias</div>
              <div style="margin-top:16px;border-top:1px solid ${theme.lineColor};padding-top:16px;">${skillsMarkup}</div>
            </section>
            <section style="border:1px solid ${theme.lineColor};border-radius:22px;background:#ffffff;padding:20px;margin-top:24px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Formacao</div>
              <div style="margin-top:16px;border-top:1px solid ${theme.lineColor};padding-top:16px;">${educationMarkup}</div>
            </section>
            <section style="border:1px solid ${theme.lineColor};border-radius:22px;background:#ffffff;padding:20px;margin-top:24px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Idiomas e certificacoes</div>
              <div style="margin-top:16px;border-top:1px solid ${theme.lineColor};padding-top:16px;">${languagesMarkup}${certificationsMarkup}</div>
            </section>
            ${
              snapshot.additionalInfo
                ? `<section style="border:1px solid ${theme.lineColor};border-radius:22px;background:#ffffff;padding:20px;margin-top:24px;">
                    <div style="font-size:11px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${theme.primaryColor};">Informacoes adicionais</div>
                    <div style="margin-top:16px;border-top:1px solid ${theme.lineColor};padding-top:16px;">
                      <p style="font-size:15px;line-height:1.8;color:${theme.mutedColor};margin:0;">${withLineBreaks(snapshot.additionalInfo)}</p>
                    </div>
                  </section>`
                : ""
            }
          </aside>
        </div>
      </article>
    `,
    theme,
    "#f8fafc",
  );
}
