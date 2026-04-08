import { buildThemeTokens, escapeHtml, getResumeSnapshot, withLineBreaks, wrapDocument } from "./templateUtils";
import { ProfilePhoto, renderProfilePhotoMarkup } from "./templatePhoto";
import ResumeSection, { ResumeBlock } from "../components/resume/ResumeSection";

function Section({ title, theme, children }) {
  return (
    <ResumeSection
      bodyClassName="mt-4"
      className="rounded-[24px] border border-slate-200 bg-white p-6"
      title={title}
      titleClassName="text-[11px] font-bold uppercase tracking-[0.42em]"
      titleStyle={{ color: theme.primaryColor }}
    >
      {children}
    </ResumeSection>
  );
}

export default function MinimalTemplate({ resume, theme = buildThemeTokens(resume.customization) }) {
  const snapshot = getResumeSnapshot(resume);

  return (
    <article className="rounded-[30px] bg-[#fffdfa] p-10 shadow-[0_20px_70px_rgba(15,23,42,0.12)]" style={{ fontFamily: theme.fontFamily }}>
      <header className="pb-8">
        <div className="h-1.5 w-24 rounded-full" style={{ backgroundColor: theme.primaryColor }} />
        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.34em] text-slate-600">{snapshot.title || "Curriculo online"}</p>
            <p className="mt-3 font-semibold tracking-tight" style={{ fontSize: theme.titleSize }}>
              {snapshot.personal.fullName || "Seu nome"}
            </p>
            <p className="mt-4 max-w-xl text-lg leading-8 text-slate-600">{snapshot.personal.role || "Seu cargo principal"}</p>
          </div>
          <div className="space-y-4">
            {snapshot.personal.photo ? (
              <div className="flex lg:justify-end">
                <ProfilePhoto
                  alt={snapshot.personal.fullName || "Foto profissional"}
                  className="border-slate-200 bg-white"
                  height={104}
                  photo={snapshot.personal.photo}
                  width={104}
                />
              </div>
            ) : null}
            <div className="rounded-[22px] border border-slate-200 bg-white px-5 py-4 text-sm leading-7 text-slate-500">
              {snapshot.contactLines.join(" • ") || "Dados de contato e links profissionais"}
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Section theme={theme} title="Objetivo">
            <p className="text-[15px] leading-7 text-slate-700">
              {snapshot.objective || "Defina com clareza a direcao que deseja para sua carreira."}
            </p>
          </Section>

          <Section theme={theme} title="Resumo profissional">
            <p className="text-[15px] leading-7 text-slate-700">
              {snapshot.summary || "Escreva um resumo curto e convincente sobre seu momento profissional."}
            </p>
          </Section>

          <Section theme={theme} title="Experiencia">
            <div className="space-y-5">
              {snapshot.experience.map((item) => (
                <ResumeBlock key={item.id} className="border-b border-slate-100 pb-5 last:border-b-0 last:pb-0">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{item.role}</p>
                      <p className="text-sm text-slate-500">{item.company}</p>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: theme.primaryColor }}>
                      {item.period}
                    </span>
                  </div>
                  <p className="mt-3 text-[15px] leading-7 text-slate-700">{item.description}</p>
                </ResumeBlock>
              ))}
            </div>
          </Section>

          <Section theme={theme} title="Projetos">
            <div className="space-y-4">
              {snapshot.projects.map((item) => (
                <ResumeBlock key={item.id}>
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="text-sm text-slate-500">{item.technologies}</p>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: theme.primaryColor }}>
                      {item.link}
                    </span>
                  </div>
                  <p className="mt-3 text-[15px] leading-7 text-slate-700">{item.description}</p>
                </ResumeBlock>
              ))}
            </div>
          </Section>
        </div>

        <div className="space-y-6">
          <Section theme={theme} title="Formacao">
            <div className="space-y-4">
              {snapshot.education.map((item) => (
                <ResumeBlock key={item.id}>
                  <p className="font-semibold text-slate-900">{item.course}</p>
                  <p className="text-sm text-slate-500">{item.institution}</p>
                  <p className="mt-2 text-sm font-semibold" style={{ color: theme.primaryColor }}>
                    {item.period}
                  </p>
                </ResumeBlock>
              ))}
            </div>
          </Section>

          <Section theme={theme} title="Habilidades">
            <div className="flex flex-wrap gap-2">
              {snapshot.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full px-4 py-2 text-sm font-semibold"
                  style={{ backgroundColor: theme.softTint, color: theme.primaryColor }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </Section>

          <Section theme={theme} title="Idiomas e certificacoes">
            <div className="space-y-4">
              {snapshot.languages.map((item) => (
                <ResumeBlock key={item.id}>
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <p className="text-sm text-slate-500">{item.level}</p>
                </ResumeBlock>
              ))}
              {snapshot.certifications.map((item) => (
                <ResumeBlock key={item.id}>
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <p className="text-sm text-slate-500">{[item.issuer, item.year].filter(Boolean).join(" • ")}</p>
                </ResumeBlock>
              ))}
            </div>
          </Section>

          {snapshot.additionalInfo ? (
            <Section theme={theme} title="Informacoes adicionais">
              <p className="text-[15px] leading-7 text-slate-700">{snapshot.additionalInfo}</p>
            </Section>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function renderMinimalDocument(resume, options = {}) {
  const theme = buildThemeTokens(resume.customization);
  const snapshot = getResumeSnapshot(resume);

  return wrapDocument(
    `
      <article style="border-radius:30px;background:#fffdfa;padding:40px;box-shadow:0 20px 70px rgba(15,23,42,0.12);">
        <header style="padding-bottom:32px;">
          <div style="height:6px;width:96px;border-radius:999px;background:${theme.primaryColor};"></div>
          <div style="display:flex;justify-content:space-between;gap:24px;align-items:flex-end;margin-top:24px;">
            <div>
              <div style="font-size:13px;letter-spacing:0.34em;text-transform:uppercase;color:#94a3b8;">${escapeHtml(snapshot.title || "Curriculo online")}</div>
              <div style="font-size:${theme.titleSize};font-weight:700;letter-spacing:-0.04em;margin-top:12px;">${escapeHtml(snapshot.personal.fullName || "Seu nome")}</div>
              <div style="max-width:520px;font-size:18px;line-height:1.8;color:${theme.mutedColor};margin-top:16px;">${escapeHtml(snapshot.personal.role || "Seu cargo principal")}</div>
            </div>
            <div style="max-width:300px;">
              ${
                snapshot.personal.photo
                  ? `<div style="display:flex;justify-content:flex-end;margin-bottom:14px;">${renderProfilePhotoMarkup({
                      photo: snapshot.personal.photo,
                      alt: snapshot.personal.fullName || "Foto profissional",
                      width: 104,
                      height: 104,
                      radius: "28px",
                      borderColor: "#e2e8f0",
                      background: "#ffffff",
                    })}</div>`
                  : ""
              }
              <div style="border:1px solid #e2e8f0;border-radius:22px;background:#ffffff;padding:16px 20px;font-size:13px;line-height:1.8;color:${theme.mutedColor};">${escapeHtml(snapshot.contactLines.join(" • ") || "Dados de contato e links profissionais")}</div>
            </div>
          </div>
        </header>
        <div style="display:grid;grid-template-columns:1.1fr 0.9fr;gap:24px;">
          <div>
            <section style="border:1px solid #e2e8f0;border-radius:24px;background:#ffffff;padding:24px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.42em;text-transform:uppercase;color:${theme.primaryColor};">Objetivo</div>
              <p style="font-size:15px;line-height:1.8;color:${theme.mutedColor};margin:14px 0 0;">${withLineBreaks(snapshot.objective || "Defina com clareza a direcao que deseja para sua carreira.")}</p>
            </section>
            <section style="border:1px solid #e2e8f0;border-radius:24px;background:#ffffff;padding:24px;margin-top:24px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.42em;text-transform:uppercase;color:${theme.primaryColor};">Resumo profissional</div>
              <p style="font-size:15px;line-height:1.8;color:${theme.mutedColor};margin:14px 0 0;">${withLineBreaks(snapshot.summary || "Escreva um resumo curto e convincente sobre seu momento profissional.")}</p>
            </section>
            <section style="border:1px solid #e2e8f0;border-radius:24px;background:#ffffff;padding:24px;margin-top:24px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.42em;text-transform:uppercase;color:${theme.primaryColor};">Experiencia</div>
              ${snapshot.experience
                .map(
                  (item) => `
                    <div style="margin-top:18px;padding-bottom:18px;border-bottom:1px solid #f1f5f9;">
                      <div style="display:flex;justify-content:space-between;gap:16px;align-items:flex-start;">
                        <div>
                          <div style="font-size:18px;font-weight:700;">${escapeHtml(item.role)}</div>
                          <div style="font-size:14px;color:${theme.mutedColor};margin-top:4px;">${escapeHtml(item.company)}</div>
                        </div>
                        <div style="font-size:13px;font-weight:700;color:${theme.primaryColor};">${escapeHtml(item.period)}</div>
                      </div>
                      <p style="font-size:15px;line-height:1.8;color:${theme.mutedColor};margin:12px 0 0;">${withLineBreaks(item.description)}</p>
                    </div>`,
                )
                .join("")}
            </section>
            <section style="border:1px solid #e2e8f0;border-radius:24px;background:#ffffff;padding:24px;margin-top:24px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.42em;text-transform:uppercase;color:${theme.primaryColor};">Projetos</div>
              ${snapshot.projects
                .map(
                  (item) => `
                    <div style="margin-top:18px;">
                      <div style="display:flex;justify-content:space-between;gap:16px;align-items:flex-start;">
                        <div>
                          <div style="font-weight:700;">${escapeHtml(item.name)}</div>
                          <div style="font-size:14px;color:${theme.mutedColor};margin-top:4px;">${escapeHtml(item.technologies)}</div>
                        </div>
                        <div style="font-size:13px;font-weight:700;color:${theme.primaryColor};">${escapeHtml(item.link)}</div>
                      </div>
                      <p style="font-size:15px;line-height:1.8;color:${theme.mutedColor};margin:12px 0 0;">${withLineBreaks(item.description)}</p>
                    </div>`,
                )
                .join("")}
            </section>
          </div>
          <div>
            <section style="border:1px solid #e2e8f0;border-radius:24px;background:#ffffff;padding:24px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.42em;text-transform:uppercase;color:${theme.primaryColor};">Formacao</div>
              ${snapshot.education
                .map(
                  (item) => `
                    <div style="margin-top:14px;">
                      <div style="font-weight:700;">${escapeHtml(item.course)}</div>
                      <div style="font-size:14px;color:${theme.mutedColor};margin-top:4px;">${escapeHtml(item.institution)}</div>
                      <div style="font-size:13px;font-weight:700;color:${theme.primaryColor};margin-top:8px;">${escapeHtml(item.period)}</div>
                    </div>`,
                )
                .join("")}
            </section>
            <section style="border:1px solid #e2e8f0;border-radius:24px;background:#ffffff;padding:24px;margin-top:24px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.42em;text-transform:uppercase;color:${theme.primaryColor};">Habilidades</div>
              <div style="margin-top:10px;">${snapshot.skills
                .map(
                  (skill) => `<span style="display:inline-flex;margin:8px 8px 0 0;border-radius:999px;padding:10px 16px;background:${theme.softTint};font-size:14px;font-weight:700;color:${theme.primaryColor};">${escapeHtml(skill)}</span>`,
                )
                .join("")}</div>
            </section>
            <section style="border:1px solid #e2e8f0;border-radius:24px;background:#ffffff;padding:24px;margin-top:24px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.42em;text-transform:uppercase;color:${theme.primaryColor};">Idiomas e certificacoes</div>
              ${snapshot.languages
                .map(
                  (item) => `
                    <div style="margin-top:14px;">
                      <div style="font-weight:700;">${escapeHtml(item.name)}</div>
                      <div style="font-size:14px;color:${theme.mutedColor};margin-top:4px;">${escapeHtml(item.level)}</div>
                    </div>`,
                )
                .join("")}
              ${snapshot.certifications
                .map(
                  (item) => `
                    <div style="margin-top:14px;">
                      <div style="font-weight:700;">${escapeHtml(item.name)}</div>
                      <div style="font-size:14px;color:${theme.mutedColor};margin-top:4px;">${escapeHtml([item.issuer, item.year].filter(Boolean).join(" • "))}</div>
                    </div>`,
                )
                .join("")}
            </section>
            ${
              snapshot.additionalInfo
                ? `<section style="border:1px solid #e2e8f0;border-radius:24px;background:#ffffff;padding:24px;margin-top:24px;">
                    <div style="font-size:11px;font-weight:700;letter-spacing:0.42em;text-transform:uppercase;color:${theme.primaryColor};">Informacoes adicionais</div>
                    <p style="font-size:15px;line-height:1.8;color:${theme.mutedColor};margin:12px 0 0;">${withLineBreaks(snapshot.additionalInfo)}</p>
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
