import {
  A4_PAGE_HEIGHT_MM,
  A4_PAGE_HEIGHT_PX,
  A4_PAGE_WIDTH_MM,
  A4_PAGE_WIDTH_PX,
  RESUME_CONTENT_HEIGHT_PX,
  RESUME_PAGE_PADDING_MM,
} from "../../utils/resumePagination";
import { joinClassNames } from "./ResumeSection";

export default function PageContainer({
  children,
  className = "",
  contentClassName = "",
  contentRef,
  mode = "preview",
  pageStart = 0,
  scale = 1,
  showShadow = mode === "preview",
}) {
  const isMeasure = mode === "measure";
  const isPreview = mode === "preview";

  const shell = (
    <div
      className={joinClassNames(
        "resume-page-shell",
        showShadow ? "resume-page-shell--shadow" : "",
        isMeasure ? "resume-page-shell--measure" : "",
        className,
      )}
      style={{
        width: `${A4_PAGE_WIDTH_MM}mm`,
        height: isMeasure ? "auto" : `${A4_PAGE_HEIGHT_MM}mm`,
        minHeight: `${A4_PAGE_HEIGHT_MM}mm`,
        ...(isPreview
          ? {
              left: 0,
              position: "absolute",
              top: 0,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }
          : null),
      }}
    >
      <div
        className="resume-page-body"
        style={{
          padding: `${RESUME_PAGE_PADDING_MM}mm`,
        }}
      >
        <div
          className="resume-page-viewport"
          style={{
            height: isMeasure ? "auto" : `${RESUME_CONTENT_HEIGHT_PX}px`,
            overflow: isMeasure ? "visible" : "hidden",
          }}
        >
          <div
            ref={contentRef}
            className={joinClassNames("resume-page-content", contentClassName)}
            style={{
              transform: !isMeasure && pageStart > 0 ? `translateY(-${pageStart}px)` : undefined,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  if (!isPreview) {
    return shell;
  }

  return (
    <div
      className="resume-page-preview"
      style={{
        height: `${A4_PAGE_HEIGHT_PX * scale}px`,
        position: "relative",
        width: `${A4_PAGE_WIDTH_PX * scale}px`,
      }}
    >
      {shell}
    </div>
  );
}
