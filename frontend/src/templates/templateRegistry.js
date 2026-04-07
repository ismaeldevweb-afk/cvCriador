import ClassicTemplate, { renderClassicDocument } from "./ClassicTemplate";
import CompactTemplate, { renderCompactDocument } from "./CompactTemplate";
import EditorialTemplate, { renderEditorialDocument } from "./EditorialTemplate";
import ExecutiveTemplate, { renderExecutiveDocument } from "./ExecutiveTemplate";
import AtelierTemplate, { renderAtelierDocument } from "./AtelierTemplate";
import HorizonTemplate, { renderHorizonDocument } from "./HorizonTemplate";
import LedgerTemplate, { renderLedgerDocument } from "./LedgerTemplate";
import MinimalTemplate, { renderMinimalDocument } from "./MinimalTemplate";
import MosaicTemplate, { renderMosaicDocument } from "./MosaicTemplate";
import ModernTemplate, { renderModernDocument } from "./ModernTemplate";
import NoirTemplate, { renderNoirDocument } from "./NoirTemplate";
import SpotlightTemplate, { renderSpotlightDocument } from "./SpotlightTemplate";
import TimelineTemplate, { renderTimelineDocument } from "./TimelineTemplate";
import { buildThemeTokens } from "./templateUtils";

const registry = {
  modern: {
    component: ModernTemplate,
    renderDocument: renderModernDocument,
  },
  classic: {
    component: ClassicTemplate,
    renderDocument: renderClassicDocument,
  },
  executive: {
    component: ExecutiveTemplate,
    renderDocument: renderExecutiveDocument,
  },
  editorial: {
    component: EditorialTemplate,
    renderDocument: renderEditorialDocument,
  },
  minimal: {
    component: MinimalTemplate,
    renderDocument: renderMinimalDocument,
  },
  compact: {
    component: CompactTemplate,
    renderDocument: renderCompactDocument,
  },
  spotlight: {
    component: SpotlightTemplate,
    renderDocument: renderSpotlightDocument,
  },
  timeline: {
    component: TimelineTemplate,
    renderDocument: renderTimelineDocument,
  },
  atelier: {
    component: AtelierTemplate,
    renderDocument: renderAtelierDocument,
  },
  horizon: {
    component: HorizonTemplate,
    renderDocument: renderHorizonDocument,
  },
  noir: {
    component: NoirTemplate,
    renderDocument: renderNoirDocument,
  },
  mosaic: {
    component: MosaicTemplate,
    renderDocument: renderMosaicDocument,
  },
  ledger: {
    component: LedgerTemplate,
    renderDocument: renderLedgerDocument,
  },
};

export function getTemplateComponent(template) {
  return registry[template]?.component ?? ModernTemplate;
}

export function renderResumeDocument(resume, options = {}) {
  return (registry[resume.template] ?? registry.modern).renderDocument(resume, options);
}

export { buildThemeTokens };
