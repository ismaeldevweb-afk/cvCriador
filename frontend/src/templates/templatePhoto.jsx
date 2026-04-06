import { cn } from "../utils/cn";
import { escapeHtml } from "./templateUtils";

function toUnit(value) {
  return typeof value === "number" ? `${value}px` : value;
}

export function ProfilePhoto({
  photo,
  alt = "Foto profissional",
  width = 112,
  height = 112,
  radius = "28px",
  className,
  imageClassName,
  style,
}) {
  if (!photo) {
    return null;
  }

  return (
    <div
      className={cn("overflow-hidden border border-white/40 bg-slate-100 shadow-[0_16px_35px_rgba(15,23,42,0.14)]", className)}
      style={{
        width: toUnit(width),
        height: toUnit(height),
        borderRadius: radius,
        ...style,
      }}
    >
      <img
        alt={alt}
        className={cn("h-full w-full object-cover", imageClassName)}
        referrerPolicy="no-referrer"
        src={photo}
      />
    </div>
  );
}

export function renderProfilePhotoMarkup({
  photo,
  alt = "Foto profissional",
  width = 112,
  height = 112,
  radius = "28px",
  borderColor = "rgba(255,255,255,0.4)",
  background = "#e2e8f0",
  boxShadow = "0 16px 35px rgba(15,23,42,0.14)",
}) {
  if (!photo) {
    return "";
  }

  return `<div style="overflow:hidden;width:${toUnit(width)};height:${toUnit(height)};border-radius:${radius};border:1px solid ${borderColor};background:${background};box-shadow:${boxShadow};">
    <img src="${escapeHtml(photo)}" alt="${escapeHtml(alt)}" referrerpolicy="no-referrer" style="display:block;width:100%;height:100%;object-fit:cover;" />
  </div>`;
}
