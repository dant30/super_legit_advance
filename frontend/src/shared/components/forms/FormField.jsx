import ValidationErrors from "./ValidationErrors";

export default function FormField({
  id,
  label,
  required = false,
  hint,
  errors = [],
  children,
  className = "",
}) {
  const hasErrors = Array.isArray(errors) && errors.length > 0;
  return (
    <div className={`grid gap-1.5 ${className}`}>
      {label ? (
        <label htmlFor={id} className="text-sm font-medium text-slate-800">
          {label}
          {required ? <span className="ml-1 text-rose-600">*</span> : null}
        </label>
      ) : null}
      <div className={hasErrors ? "rounded-md ring-1 ring-rose-200" : ""}>{children}</div>
      {hint && !hasErrors ? <p className="text-xs text-slate-500">{hint}</p> : null}
      <ValidationErrors errors={errors} />
    </div>
  );
}
