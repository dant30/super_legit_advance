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
    <div
      className={`flex flex-wrap gap-2 border-t border-gray-200 pt-3 dark:border-slate-700 ${alignmentClass} ${className}`}
      role="group"
      aria-label="Form actions"
    >
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
