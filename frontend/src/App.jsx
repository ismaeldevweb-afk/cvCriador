import { Suspense, lazy } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import TemplateSelectionPage from "./pages/TemplateSelectionPage";

const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const EditorPage = lazy(() => import("./pages/EditorPage"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const PreviewPage = lazy(() => import("./pages/PreviewPage"));

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(15,118,110,0.12),transparent_26%),radial-gradient(circle_at_top_right,rgba(245,158,11,0.12),transparent_24%),linear-gradient(180deg,#fcfbf7_0%,#f6f8fc_100%)] px-6 text-ink">
      <div className="w-full max-w-md rounded-[30px] border border-white/80 bg-white/88 p-8 text-center shadow-soft backdrop-blur-2xl">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f172a_0%,#1f2937_100%)] text-sm font-semibold tracking-[0.24em] text-white shadow-[0_16px_35px_rgba(15,23,42,0.18)]">
          CV
        </span>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Carregando workspace</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink">Preparando a proxima tela</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Os blocos pesados do editor e do preview agora entram sob demanda para manter a experiencia mais leve.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <Suspense fallback={<RouteFallback />}>
      <div className="route-fade-enter" key={`${location.pathname}${location.search}`}>
        <Routes location={location}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/templates" element={<TemplateSelectionPage />} />
          <Route path="/editor/new" element={<EditorPage />} />
          <Route path="/editor/:id" element={<EditorPage />} />
          <Route path="/preview/:id" element={<PreviewPage />} />
          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </div>
    </Suspense>
  );
}
