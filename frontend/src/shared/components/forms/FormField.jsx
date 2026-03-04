import React from "react";
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
  const normalizedErrors = Array.isArray(errors)
    ? errors.filter(Boolean)
    : errors
    ? [String(errors)]
    : [];
  const hasErrors = normalizedErrors.length > 0;
  const hintId = hint && id ? `${id}-hint` : undefined;
  const errorId = hasErrors && id ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  const enhancedChild = React.isValidElement(children)
    ? React.cloneElement(children, {
        id: children.props.id || id,
        "aria-invalid": hasErrors ? "true" : children.props["aria-invalid"],
        "aria-describedby":
          [children.props["aria-describedby"], describedBy].filter(Boolean).join(" ") || undefined,
      })
    : children;

  return (
    <div className={`grid gap-1.5 ${className}`}>
      {label ? (
        <label htmlFor={id} className="ui-label">
          {label}
          {required ? <span className="ml-1 text-danger-600">*</span> : null}
        </label>
      ) : null}
      <div className={hasErrors ? "rounded-md ring-1 ring-danger-200 dark:ring-danger-900/40" : ""}>
        {enhancedChild}
      </div>
      {hint && !hasErrors ? (
        <p id={hintId} className="ui-help">
          {hint}
        </p>
      ) : null}
      <ValidationErrors id={errorId} errors={normalizedErrors} />
    </div>
  );
}
