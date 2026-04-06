import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createServer } from "vite";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
const frontendRoot = path.resolve(currentDir, "..");
const outputDir = path.resolve(frontendRoot, "public/templates");
const publicDir = path.resolve(frontendRoot, "public");
const publicBaseHref = `${pathToFileURL(publicDir).href.replace(/\/?$/, "/")}`;
const frontendRequire = createRequire(import.meta.url);

const shouldSkip = process.env.SKIP_TEMPLATE_IMAGES === "1";
const isCheckMode = process.argv.includes("--check");
const demoPhotoCandidates = [
  "templates/demo-photo.jpg",
  "templates/demo-photo.jpeg",
  "templates/demo-photo.png",
  "templates/demo-photo.webp",
  "templates/demo-photo.avif",
];

const templateOverrides = {
  modern: {
    customization: {
      primaryColor: "#0f766e",
      fontFamily: "manrope",
      spacing: "balanced",
      titleScale: "md",
    },
  },
  classic: {
    customization: {
      primaryColor: "#0f172a",
      fontFamily: "fraunces",
      spacing: "balanced",
      titleScale: "md",
    },
  },
  executive: {
    customization: {
      primaryColor: "#1d4ed8",
      fontFamily: "space",
      spacing: "balanced",
      titleScale: "md",
    },
  },
  editorial: {
    customization: {
      primaryColor: "#be185d",
      fontFamily: "fraunces",
      spacing: "airy",
      titleScale: "lg",
    },
  },
  minimal: {
    customization: {
      primaryColor: "#475569",
      fontFamily: "manrope",
      spacing: "balanced",
      titleScale: "md",
    },
  },
  compact: {
    customization: {
      primaryColor: "#ea580c",
      fontFamily: "space",
      spacing: "compact",
      titleScale: "sm",
    },
  },
  spotlight: {
    customization: {
      primaryColor: "#f59e0b",
      fontFamily: "space",
      spacing: "balanced",
      titleScale: "lg",
    },
  },
  timeline: {
    customization: {
      primaryColor: "#0f766e",
      fontFamily: "manrope",
      spacing: "balanced",
      titleScale: "md",
    },
  },
  atelier: {
    customization: {
      primaryColor: "#c2410c",
      fontFamily: "fraunces",
      spacing: "airy",
      titleScale: "lg",
    },
  },
  horizon: {
    customization: {
      primaryColor: "#0284c7",
      fontFamily: "manrope",
      spacing: "balanced",
      titleScale: "lg",
    },
  },
  noir: {
    customization: {
      primaryColor: "#d4a373",
      fontFamily: "space",
      spacing: "balanced",
      titleScale: "lg",
    },
  },
  mosaic: {
    customization: {
      primaryColor: "#dc2626",
      fontFamily: "space",
      spacing: "balanced",
      titleScale: "md",
    },
  },
  ledger: {
    customization: {
      primaryColor: "#334155",
      fontFamily: "manrope",
      spacing: "balanced",
      titleScale: "md",
    },
  },
};

function createMockResume(template, demoPhotoUrl) {
  return {
    title: "Curriculo Demo Helena Costa",
    template,
    personal: {
      fullName: "Helena Costa",
      role: "Frontend Product Engineer",
      objective: "Criar interfaces claras e escalaveis para produtos digitais com foco em experiencia, performance e consistencia visual.",
      photo: demoPhotoUrl,
      email: "helena@example.com",
      phone: "+55 11 90000-0000",
      city: "Curitiba, PR",
      linkedin: "linkedin.com/in/helena-costa-demo",
      github: "github.com/helena-demo",
      portfolio: "helenacosta.example",
    },
    summary:
      "Profissional de frontend com atuacao em produtos SaaS, sistemas de design e experiencias web orientadas a clareza, conversao e manutencao de longo prazo.",
    experience: [
      {
        id: "exp-1",
        company: "Atlas Studio",
        role: "Senior Frontend Product Engineer",
        period: "2023 - Atual",
        description:
          "Lideranca tecnica de interfaces React, evolucao de sistema visual e melhoria de indicadores de conversao em fluxos de onboarding e painel.",
      },
      {
        id: "exp-2",
        company: "Nova Layer",
        role: "Frontend Engineer",
        period: "2021 - 2023",
        description:
          "Desenvolvimento de jornadas de cadastro, dashboards analiticos e biblioteca de componentes com foco em experiencia e escala.",
      },
    ],
    education: [
      {
        id: "edu-1",
        institution: "Instituto de Tecnologia do Sul",
        course: "Design Digital e Sistemas Interativos",
        period: "2016 - 2020",
      },
    ],
    skills: ["React", "TypeScript", "Design Systems", "Node.js", "Tailwind CSS", "UX"],
    languages: [
      { id: "lang-1", name: "Ingles", level: "Avancado" },
      { id: "lang-2", name: "Espanhol", level: "Intermediario" },
    ],
    certifications: [
      { id: "cert-1", name: "AWS Cloud Practitioner", issuer: "AWS", year: "2024" },
    ],
    projects: [
      {
        id: "project-1",
        name: "Launchpad UI Kit",
        description: "Biblioteca de componentes para jornadas de onboarding, area logada e fluxos de carreira.",
        technologies: "React, Storybook, Tokens",
        link: "github.com/helena-demo/launchpad-ui-kit",
      },
    ],
    additionalInfo: "Perfil demonstrativo utilizado para previews dos templates, com foco em produto, design system e experiencia web.",
    customization: templateOverrides[template]?.customization ?? templateOverrides.modern.customization,
  };
}

function injectThumbnailTarget(html) {
  return html
    .replace("</head>", `<base href="${publicBaseHref}" /></head>`)
    .replace(
    '<div style="max-width:794px;margin:0 auto;">',
    '<div id="template-thumbnail-root" style="max-width:794px;margin:0 auto;">',
    );
}

async function loadTemplateModules() {
  const viteServer = await createServer({
    root: frontendRoot,
    configFile: path.resolve(frontendRoot, "vite.config.js"),
    logLevel: "error",
    server: {
      middlewareMode: true,
      hmr: false,
      ws: false,
    },
    appType: "custom",
  });

  try {
    const [{ renderResumeDocument }, { templateOptions }] = await Promise.all([
      viteServer.ssrLoadModule("/src/templates/templateRegistry.js"),
      viteServer.ssrLoadModule("/src/utils/resumeDefaults.js"),
    ]);

    return {
      viteServer,
      renderResumeDocument,
      templateOptions,
    };
  } catch (error) {
    await viteServer.close();
    throw error;
  }
}

async function ensureOutputDirectory() {
  await fs.mkdir(outputDir, { recursive: true });
}

function getMimeTypeFromExtension(filePath) {
  const extension = path.extname(filePath).toLowerCase();

  if (extension === ".jpg" || extension === ".jpeg") {
    return "image/jpeg";
  }

  if (extension === ".png") {
    return "image/png";
  }

  if (extension === ".webp") {
    return "image/webp";
  }

  if (extension === ".avif") {
    return "image/avif";
  }

  if (extension === ".svg") {
    return "image/svg+xml";
  }

  return "application/octet-stream";
}

async function fileToDataUrl(filePath) {
  const mimeType = getMimeTypeFromExtension(filePath);
  const buffer = await fs.readFile(filePath);
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

async function resolveDemoPhotoAsset() {
  try {
    const templateAssets = await fs.readdir(outputDir, { withFileTypes: true });
    const generatedPhoto = templateAssets
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((fileName) => /^Gemini_Generated_Image.*\.(png|jpe?g|webp|avif)$/i.test(fileName))
      .sort()[0];

    if (generatedPhoto) {
      return path.resolve(outputDir, generatedPhoto);
    }
  } catch {
    // Ignore lookup errors and continue to explicit demo-photo assets.
  }

  for (const assetPath of demoPhotoCandidates) {
    try {
      const absolutePath = path.resolve(publicDir, assetPath);
      await fs.access(absolutePath);
      return absolutePath;
    } catch {
      // Try the next supported asset.
    }
  }

  return path.resolve(publicDir, "templates/demo-photo.svg");
}

async function hasCachedTemplateImages(templateOptions) {
  const expectedFiles = [
    path.join(outputDir, "manifest.json"),
    ...templateOptions.map((template) => path.join(outputDir, `${template.id}.png`)),
  ];

  try {
    await Promise.all(expectedFiles.map((filePath) => fs.access(filePath)));
    return true;
  } catch {
    return false;
  }
}

async function writeManifest(entries) {
  const manifestPath = path.join(outputDir, "manifest.json");

  await fs.writeFile(
    manifestPath,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        templates: entries,
      },
      null,
      2,
    )}\n`,
  );
}

async function captureTemplateImage(page, { html, outputPath }) {
  await page.setViewport({
    width: 1120,
    height: 1600,
    deviceScaleFactor: 2,
  });
  await page.setContent(html, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#template-thumbnail-root");
  await page.emulateMediaType("screen");
  await page.evaluate(async () => {
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
  });
  const rootHandle = await page.$("#template-thumbnail-root");

  if (!rootHandle) {
    throw new Error("Nao foi possivel localizar o container do template para gerar a miniatura.");
  }

  await rootHandle.screenshot({
    path: outputPath,
    type: "png",
  });
}

async function generateTemplateImages() {
  const { viteServer, renderResumeDocument, templateOptions } = await loadTemplateModules();

  try {
    await ensureOutputDirectory();
    const demoPhotoUrl = await fileToDataUrl(await resolveDemoPhotoAsset());

    if (isCheckMode) {
      console.log(`check-ok ${templateOptions.length} templates carregados`);
      return;
    }

    let puppeteer;

    try {
      puppeteer = frontendRequire("puppeteer");
    } catch (error) {
      if (error?.code === "MODULE_NOT_FOUND") {
        throw new Error(
          "Puppeteer nao esta disponivel para gerar as imagens dos templates. Instale as dependencias do frontend para regenerar as miniaturas.",
        );
      }

      throw error;
    }

    const browser = await puppeteer.launch({
      headless: true,
      pipe: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-crash-reporter",
        "--disable-breakpad",
        "--disable-features=Crashpad",
      ],
    });

    try {
      const page = await browser.newPage();
      const manifestEntries = [];

      for (const template of templateOptions) {
        const mockResume = createMockResume(template.id, demoPhotoUrl);
        const html = injectThumbnailTarget(renderResumeDocument(mockResume));
        const fileName = `${template.id}.png`;
        const outputPath = path.join(outputDir, fileName);

        await captureTemplateImage(page, {
          html,
          outputPath,
        });

        manifestEntries.push({
          id: template.id,
          name: template.name,
          fileName,
          src: `/templates/${fileName}`,
        });
      }

      await writeManifest(manifestEntries);
      console.log(`Template images generated in ${outputDir}`);
    } finally {
      await browser.close();
    }
  } catch (error) {
    if (await hasCachedTemplateImages(templateOptions)) {
      console.warn(
        `Template image generation unavailable, reusing cached previews in ${outputDir}. ${error.message}`,
      );
      return;
    }

    throw new Error(
      `Falha ao gerar imagens dos templates. ${error.message}${
        process.env.CI ? "" : " Use SKIP_TEMPLATE_IMAGES=1 para ignorar temporariamente essa etapa."
      }`,
    );
  } finally {
    await viteServer.close();
  }
}

if (shouldSkip) {
  console.log("Skipping template image generation because SKIP_TEMPLATE_IMAGES=1.");
} else {
  await generateTemplateImages();
}
