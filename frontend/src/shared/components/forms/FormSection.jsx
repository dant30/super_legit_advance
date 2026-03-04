export default function FormSection({
  title,
  description,
  actions,
  children,
  className = "",
}) {
  return (
    <section className={`ui-page-section anim-fade-in ${className}`}>
      {(title || description || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <div>
            {title ? <h3 className="ui-section-title text-base">{title}</h3> : null}
            {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
          </div>
          {actions ? <div>{actions}</div> : null}
        </header>
      )}
      <div className="grid gap-4 px-4 py-4">{children}</div>
    </section>
  );
}
