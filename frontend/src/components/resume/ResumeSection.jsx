function compactClassName(value = "") {
  return typeof value === "string" ? value.trim() : "";
}

export function joinClassNames(...values) {
  return values.map(compactClassName).filter(Boolean).join(" ");
}

export function ResumeBlock({
  as: Tag = "div",
  children,
  className = "",
  measure = "item",
  style,
  ...rest
}) {
  return (
    <Tag
      {...rest}
      className={joinClassNames("resume-break-block", className)}
      data-resume-block={measure}
      style={{
        breakInside: "avoid",
        pageBreakInside: "avoid",
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}

export default function ResumeSection({
  as = "section",
  bodyClassName = "",
  bodyStyle,
  children,
  className = "",
  measure = "section",
  style,
  title,
  titleAs = "p",
  titleClassName = "",
  titleStyle,
  ...rest
}) {
  const TitleTag = titleAs;

  return (
    <ResumeBlock as={as} className={className} measure={measure} style={style} {...rest}>
      {title ? (
        <TitleTag className={titleClassName} style={titleStyle}>
          {title}
        </TitleTag>
      ) : null}
      <div className={bodyClassName} style={bodyStyle}>
        {children}
      </div>
    </ResumeBlock>
  );
}
