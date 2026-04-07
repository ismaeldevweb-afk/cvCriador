import { Suspense, lazy, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Button from "../components/Button";
import Panel from "../components/Panel";
import AppLayout from "../layouts/AppLayout";
import { resumeApi } from "../services/resumeApi";
import { appRoutes, getEditorRoute } from "../utils/routes";

const ResumePreview = lazy(() => import("../components/ResumePreview"));

function PreviewFallbackCard() {
  return (
    <Panel>
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Carregando visualizacao</p>
      <p className="mt-3 text-sm leading-7 text-slate-600">O preview final esta sendo preparado antes da exportacao.</p>
    </Panel>
  );
}

export default function PreviewPage() {
  const { id } = useParams();
  const [resumeRecord, setResumeRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [paginationInfo, setPaginationInfo] = useState({
    isReady: false,
    pageCount: 1,
    pageStarts: [0],
  });

  useEffect(() => {
    resumeApi
      .getById(id)
      .then((response) => {
        setResumeRecord(response.resume);
      })
      .catch((error) => {
        setFeedback(error.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id]);

  async function handleExport() {
    if (!resumeRecord) {
      return;
    }

    setIsExporting(true);

    try {
      const { createPdfFileName, exportPdfFile } = await import("../services/pdfApi");

      await exportPdfFile({
        resume: resumeRecord.data,
        fileName: createPdfFileName(resumeRecord.data.personal.fullName),
        pagination: paginationInfo,
      });
      setFeedback("PDF gerado e enviado para download.");
    } catch (error) {
      setFeedback(error.message);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <AppLayout
      actions={
        <>
          <Button as={Link} to={appRoutes.dashboard} variant="ghost">
            Painel
          </Button>
          <Button as={Link} to={getEditorRoute(id)} variant="secondary">
            Voltar para o editor
          </Button>
          <Button disabled={isExporting || !paginationInfo.isReady} onClick={handleExport} variant="primary">
            {isExporting ? "Gerando PDF..." : paginationInfo.isReady ? "Exportar PDF" : "Preparando paginas..."}
          </Button>
        </>
      }
      subtitle="Visualize a versao final do curriculo em tela cheia antes de exportar."
      title="Visualizacao do curriculo"
    >
      {feedback ? (
        <Panel className="mb-6">
          <p className="text-sm font-medium text-slate-600">{feedback}</p>
        </Panel>
      ) : null}

      {isLoading || !resumeRecord ? (
        <Panel>
          <p className="text-sm text-slate-500">Carregando curriculo...</p>
        </Panel>
      ) : (
        <div className="space-y-6">
          <Panel
            action={
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                {resumeRecord.template}
              </span>
            }
            description={resumeRecord.data.personal.role || "Curriculo sem cargo definido"}
            title={resumeRecord.title}
          />
          <Suspense fallback={<PreviewFallbackCard />}>
            <ResumePreview compact onPaginationChange={setPaginationInfo} resume={resumeRecord.data} />
          </Suspense>
        </div>
      )}
    </AppLayout>
  );
}
