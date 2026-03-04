import Button from "../ui/Button";

export default function FormActions({
  primaryLabel = "Save",
  secondaryLabel = "Cancel",
  primaryProps = {},
  secondaryProps = {},
  align = "right",
  loading = false,
  className = "",
}) {
  const alignmentClass =
    align === "left" ? "justify-start" : align === "center" ? "justify-center" : "justify-end";

  return (
    <div className={`flex flex-wrap gap-2 border-t border-slate-200 pt-3 ${alignmentClass} ${className}`}>
      {secondaryLabel ? (
        <Button variant="secondary" {...secondaryProps}>
          {secondaryLabel}
        </Button>
      ) : null}
      <Button variant="primary" loading={loading} {...primaryProps}>
        {primaryLabel}
      </Button>
    </div>
  );
}
