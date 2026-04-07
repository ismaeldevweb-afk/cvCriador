import { createHttpError } from "../../utils/http.js";
import { createImportResult, sanitizePartialResume, uniqueKeywords } from "./normalizers.js";

const GITHUB_HEADERS = {
  Accept: "application/vnd.github+json",
  "User-Agent": "resume-studio-importer",
  "X-GitHub-Api-Version": "2022-11-28",
};

const README_KEYWORDS = [
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Express",
  "NestJS",
  "PostgreSQL",
  "MongoDB",
  "Prisma",
  "Tailwind CSS",
  "Docker",
  "GraphQL",
  "REST API",
  "Vite",
  "Firebase",
  "AWS",
  "Python",
  "Django",
  "Flask",
  "Figma",
  "SQL",
  "Redis",
  "Kubernetes",
];
const GITHUB_USERNAME_PATTERN = /^(?!-)(?!.*--)[a-z\d-]{1,39}(?<!-)$/i;

export function isValidGithubUsername(username = "") {
  return GITHUB_USERNAME_PATTERN.test(compactText(username).replace(/^@/, ""));
}

function compactText(value = "") {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function normalizeUrl(value = "") {
  const text = compactText(value);
  if (!text) {
    return "";
  }

  return /^https?:\/\//i.test(text) ? text : `https://${text}`;
}

function encodePathSegment(value = "") {
  return encodeURIComponent(String(value ?? "").trim());
}

function splitBioRole(value = "") {
  return compactText(value).split(/[\-|•|\/]/).map((item) => compactText(item)).filter(Boolean)[0] ?? "";
}

async function fetchGitHubJson(path) {
  let response;

  try {
    response = await fetch(`https://api.github.com${path}`, {
      headers: GITHUB_HEADERS,
    });
  } catch {
    throw createHttpError("Nao foi possivel conectar ao GitHub agora. Verifique sua conexao e tente novamente em alguns instantes.", 503);
  }

  if (response.status === 404) {
    throw createHttpError("Perfil do GitHub nao encontrado. Revise o username informado.", 404);
  }

  if (response.status === 403) {
    throw createHttpError("O GitHub recusou a consulta no momento. Tente novamente em alguns minutos.", 503);
  }

  if (!response.ok) {
    throw createHttpError("Nao foi possivel consultar o GitHub agora. Tente novamente em alguns instantes.", 503);
  }

  return response.json();
}

async function fetchRepositoryReadme(owner, repo) {
  const response = await fetch(`https://api.github.com/repos/${encodePathSegment(owner)}/${encodePathSegment(repo)}/readme`, {
    headers: GITHUB_HEADERS,
  });

  if (!response.ok) {
    return "";
  }

  const payload = await response.json().catch(() => null);
  if (!payload?.content) {
    return "";
  }

  return Buffer.from(payload.content, "base64").toString("utf8");
}

function summarizeReadme(readme = "") {
  const lines = readme
    .split(/\r?\n/)
    .map((line) => compactText(line.replace(/^#+\s*/, "")))
    .filter(Boolean)
    .filter((line) => !/^https?:\/\//i.test(line))
    .filter((line) => line.length > 24);

  return lines.slice(0, 2).join(" ").slice(0, 220);
}

function extractReadmeKeywords(readme = "") {
  const content = readme.toLowerCase();
  return README_KEYWORDS.filter((keyword) => content.includes(keyword.toLowerCase()));
}

function formatRepoName(name = "") {
  return compactText(name.replace(/[-_]+/g, " "));
}

function buildGithubSummary({ user, projects, skills }) {
  const bio = compactText(user.bio);
  const focus = skills.slice(0, 4).join(", ");
  const projectCount = projects.length;

  if (bio && focus) {
    return `${bio}. Repertorio tecnico reforcado por ${projectCount} projeto${projectCount === 1 ? "" : "s"} publico${projectCount === 1 ? "" : "s"} com destaque para ${focus}.`;
  }

  if (bio) {
    return `${bio}. Atua com portfolio tecnico ativo no GitHub e projetos publicados para demonstrar repertorio pratico.`;
  }

  return `Profissional com presenca tecnica ativa no GitHub, projetos publicados e repertorio em ${focus || "desenvolvimento de software"}.`;
}

export async function parseGithubProfile(username = "") {
  const normalizedUsername = compactText(username).replace(/^@/, "");

  if (!normalizedUsername) {
    throw createHttpError("Informe um username do GitHub para continuar.", 400);
  }

  if (!isValidGithubUsername(normalizedUsername)) {
    throw createHttpError("Informe um username publico valido do GitHub.", 400);
  }

  try {
    const encodedUsername = encodePathSegment(normalizedUsername);
    const user = await fetchGitHubJson(`/users/${encodedUsername}`);
    const repositoriesPayload = await fetchGitHubJson(`/users/${encodedUsername}/repos?sort=updated&per_page=12&type=owner`);
    const repositories = Array.isArray(repositoriesPayload) ? repositoriesPayload : [];
    const topRepositories = repositories
      .filter((repo) => repo && typeof repo === "object" && !repo.fork)
      .sort((left, right) => {
        const leftScore = (left.stargazers_count ?? 0) * 4 + (left.forks_count ?? 0) * 2 + Date.parse(left.updated_at ?? 0) / 1e11;
        const rightScore = (right.stargazers_count ?? 0) * 4 + (right.forks_count ?? 0) * 2 + Date.parse(right.updated_at ?? 0) / 1e11;
        return rightScore - leftScore;
      })
      .slice(0, 4);

    const repositoryDetails = await Promise.all(
      topRepositories.map(async (repo) => {
        const [languages, readme] = await Promise.all([
          fetch(repo.languages_url, { headers: GITHUB_HEADERS }).then((response) => (response.ok ? response.json() : {})).catch(() => ({})),
          fetchRepositoryReadme(normalizedUsername, repo.name).catch(() => ""),
        ]);

        return {
          repo,
          languages: Object.keys(languages ?? {}),
          readme,
        };
      }),
    );

    const skills = uniqueKeywords([
      ...repositoryDetails.flatMap((item) => item.languages),
      ...repositoryDetails.flatMap((item) => item.repo.topics ?? []),
      ...repositoryDetails.flatMap((item) => extractReadmeKeywords(item.readme)),
    ]);

    const projects = repositoryDetails.map(({ repo, languages, readme }) => {
      const technologies = uniqueKeywords([...(repo.topics ?? []), ...languages]).slice(0, 6).join(", ");
      const readmeSummary = summarizeReadme(readme);
      const description = [
        compactText(repo.description),
        technologies ? `Stack principal: ${technologies}.` : "",
        readmeSummary,
      ]
        .filter(Boolean)
        .join(" ");

      return {
        name: formatRepoName(repo.name),
        description: compactText(description),
        technologies,
        link: repo.html_url,
      };
    });

    const profileUrl = user.html_url || `https://github.com/${normalizedUsername}`;
    const blogUrl = normalizeUrl(user.blog);
    const linkedinUrl = /linkedin\.com/i.test(blogUrl) ? blogUrl : "";
    const portfolioUrl = blogUrl && !linkedinUrl ? blogUrl : "";
    const fullName = compactText(user.name) || normalizedUsername;

    const normalizedResume = sanitizePartialResume({
      title: fullName ? `Curriculo ${fullName}` : "",
      personal: {
        fullName,
        role: splitBioRole(user.bio) || "Profissional de tecnologia",
        city: compactText(user.location),
        photo: compactText(user.avatar_url),
        github: profileUrl,
        portfolio: portfolioUrl,
        linkedin: linkedinUrl,
      },
      summary: buildGithubSummary({
        user,
        projects,
        skills,
      }),
      skills,
      projects,
      additionalInfo:
        user.followers || user.public_repos
          ? `GitHub: ${user.public_repos ?? 0} repositorios publicos e ${user.followers ?? 0} seguidores.`
          : "",
    });

    return createImportResult({
      sourceType: "github",
      sourceLabel: "GitHub",
      normalizedResume,
      parser: "github-public-api",
      notes: [
        "GitHub foi tratado como reforco tecnico para projetos, skills e links profissionais.",
        "Experiencia profissional formal nao foi preenchida automaticamente a partir do GitHub.",
      ],
      warnings: repositoryDetails.length === 0 ? ["Nenhum repositorio relevante foi encontrado para enriquecer projetos."] : [],
    });
  } catch (error) {
    if (error?.status) {
      throw error;
    }

    throw createHttpError("Nao foi possivel importar o perfil do GitHub agora. Tente novamente em alguns instantes.", 503);
  }
}
