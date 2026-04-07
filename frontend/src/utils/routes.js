export const appRoutes = {
  home: "/",
  dashboard: "/dashboard",
  templates: "/templates#template-selector",
  editorNew: "/editor/new",
};

export function getEditorRoute(id) {
  return `/editor/${id}`;
}

export function getPreviewRoute(id) {
  return `/preview/${id}`;
}

export const footerNavItems = [
  {
    to: appRoutes.templates,
    label: "Escolher template",
  },
  {
    to: appRoutes.dashboard,
    label: "Painel",
  },
];

export const workspaceNavItems = [
  {
    to: appRoutes.templates,
    label: "Novo curriculo",
    matches: (pathname) => pathname === "/templates" || pathname === appRoutes.editorNew,
  },
  {
    to: appRoutes.dashboard,
    label: "Painel",
    matches: (pathname) => pathname === appRoutes.dashboard,
  },
];
