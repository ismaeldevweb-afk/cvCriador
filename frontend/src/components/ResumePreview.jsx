import { startTransition, useEffect, useLayoutEffect, useRef, useState } from "react";
import PageContainer from "./resume/PageContainer";
import { buildThemeTokens, getTemplateComponent } from "../templates/templateRegistry";
import {
  A4_PAGE_WIDTH_PX,
  calculatePageStarts,
  isBeginnerResume,
} from "../utils/resumePagination";

function hasSamePageStarts(left = [], right = []) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
}

export default function ResumePreview({ resume, compact = false, onPaginationChange }) {
  const TemplateComponent = getTemplateComponent(resume.template);
  const theme = buildThemeTokens(resume.customization);
  const measureContentRef = useRef(null);
  const pageListRef = useRef(null);
  const scrollAreaRef = useRef(null);
  const scaleHostRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPaginationReady, setIsPaginationReady] = useState(false);
  const [pageStarts, setPageStarts] = useState([0]);
  const [previewScale, setPreviewScale] = useState(1);

  useLayoutEffect(() => {
    const host = scaleHostRef.current;

    if (!host || typeof ResizeObserver === "undefined") {
      return undefined;
    }

    const syncScale = () => {
      const nextWidth = host.getBoundingClientRect().width;

      if (!nextWidth) {
        return;
      }

      const nextScale = Math.min(1, Math.max((nextWidth - 2) / A4_PAGE_WIDTH_PX, 0.3));

      setPreviewScale((currentScale) => (Math.abs(currentScale - nextScale) < 0.01 ? currentScale : nextScale));
    };

    syncScale();

    const resizeObserver = new ResizeObserver(syncScale);
    resizeObserver.observe(host);
    window.addEventListener("resize", syncScale);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", syncScale);
    };
  }, []);

  useLayoutEffect(() => {
    const contentNode = measureContentRef.current;

    if (!contentNode || typeof window === "undefined") {
      return undefined;
    }

    let frameId = 0;
    const cleanupCallbacks = [];
    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => {
            scheduleMeasurement();
          });

    function scheduleMeasurement() {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        const nextPageStarts = calculatePageStarts({ root: contentNode });

        startTransition(() => {
          setPageStarts((currentPageStarts) =>
            hasSamePageStarts(currentPageStarts, nextPageStarts) ? currentPageStarts : nextPageStarts,
          );
          setIsPaginationReady(true);
        });
      });
    }

    setIsPaginationReady(false);
    resizeObserver?.observe(contentNode);

    Array.from(contentNode.querySelectorAll("img")).forEach((image) => {
      if (image.complete) {
        return;
      }

      image.addEventListener("load", scheduleMeasurement);
      image.addEventListener("error", scheduleMeasurement);
      cleanupCallbacks.push(() => {
        image.removeEventListener("load", scheduleMeasurement);
        image.removeEventListener("error", scheduleMeasurement);
      });
    });

    document.fonts?.ready?.then(() => {
      scheduleMeasurement();
    });

    scheduleMeasurement();

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
      cleanupCallbacks.forEach((callback) => callback());
    };
  }, [resume]);

  useEffect(() => {
    const scrollNode = scrollAreaRef.current;
    const pageListNode = pageListRef.current;

    if (!scrollNode || !pageListNode) {
      return undefined;
    }

    const syncCurrentPage = () => {
      const previewPages = Array.from(pageListNode.querySelectorAll("[data-preview-page]"));
      const nextPage = previewPages.reduce((selectedPage, pageNode, index) => {
        return pageNode.offsetTop - 28 <= scrollNode.scrollTop ? index + 1 : selectedPage;
      }, 1);

      setCurrentPage((value) => (value === nextPage ? value : nextPage));
    };

    syncCurrentPage();
    scrollNode.addEventListener("scroll", syncCurrentPage, { passive: true });
    window.addEventListener("resize", syncCurrentPage);

    return () => {
      scrollNode.removeEventListener("scroll", syncCurrentPage);
      window.removeEventListener("resize", syncCurrentPage);
    };
  }, [pageStarts, previewScale]);

  useEffect(() => {
    onPaginationChange?.({
      isReady: isPaginationReady,
      pageCount: pageStarts.length,
      pageStarts,
    });
  }, [isPaginationReady, onPaginationChange, pageStarts]);

  const pageCount = pageStarts.length;
  const pageLabel = `Pagina ${Math.min(currentPage, pageCount)} de ${pageCount}`;
  const pageSummary = pageCount > 1 ? `${pageCount} paginas` : "1 pagina";
  const showOnePageHint = pageCount > 1 && isBeginnerResume(resume);

  return (
    <div className="overflow-hidden rounded-[32px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(255,255,255,0.84))] shadow-float">
      <div className="flex items-center justify-between border-b border-white/70 bg-white/85 px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">Preview</p>
          <p className="mt-1 text-sm text-slate-500">Paginacao A4 sincronizada com a exportacao em PDF.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            {resume.customization.fontFamily}
          </span>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Live</span>
        </div>
      </div>

      <div
        ref={scrollAreaRef}
        className={compact ? "max-h-none bg-[#eef2f7] p-4" : "max-h-[calc(100vh-12rem)] overflow-auto bg-[#eef2f7] p-4"}
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-white/70 bg-white/75 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 shadow-[0_12px_25px_rgba(15,23,42,0.05)]">
          <span>Canvas A4 real</span>
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: theme.primaryColor }} />
            {isPaginationReady ? pageLabel : "Preparando paginacao"}
          </span>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          <span className="rounded-full bg-white px-3 py-1 shadow-[0_8px_18px_rgba(15,23,42,0.05)]">{pageSummary}</span>
          <span className="rounded-full bg-white px-3 py-1 shadow-[0_8px_18px_rgba(15,23,42,0.05)]">
            {isPaginationReady ? "Preview pronto para exportacao" : "Medindo conteudo"}
          </span>
        </div>

        {showOnePageHint ? (
          <div className="mb-4 rounded-[22px] border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm leading-6 text-amber-900">
            Recomendamos manter seu curriculo em 1 pagina para maior impacto.
          </div>
        ) : null}

        <div ref={scaleHostRef} className="relative">
          <div aria-hidden className="pointer-events-none absolute left-[-9999px] top-0 opacity-0">
            <PageContainer contentRef={measureContentRef} mode="measure" showShadow={false}>
              <TemplateComponent resume={resume} theme={theme} />
            </PageContainer>
          </div>

          <div ref={pageListRef} className="flex flex-col items-center gap-6">
            {pageStarts.map((pageStart, index) => (
              <div key={`${index}-${pageStart}`} data-preview-page>
                <PageContainer pageStart={pageStart} scale={previewScale}>
                  <TemplateComponent resume={resume} theme={theme} />
                </PageContainer>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
