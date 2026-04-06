export const appRoutes = {
  home: "/",
  dashboard: "/dashboard",
  templates: "/templates",
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
    to: appRoutes.home,
    label: "Inicio",
  },
  {
    to: appRoutes.templates,
    label: "Templates",
  },
  {
    to: appRoutes.dashboard,
    label: "Dashboard",
  },
];

export const workspaceNavItems = [
  {
    to: appRoutes.templates,
    label: "Templates",
    matches: (pathname) => pathname === appRoutes.templates || pathname === appRoutes.editorNew,
  },
  {
    to: appRoutes.dashboard,
    label: "Dashboard",
    matches: (pathname) => pathname === appRoutes.dashboard,
  },
];
