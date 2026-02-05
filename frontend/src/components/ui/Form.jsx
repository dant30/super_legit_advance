// frontend/src/components/ui/Form.jsx
import React, { createContext, useContext } from "react"
import clsx from "clsx"

/**
 * Form Context
 * Used to share state like loading, disabled, errors
 */
const FormContext = createContext(null)

export const useFormContext = () => {
  const ctx = useContext(FormContext)
  if (!ctx) {
    throw new Error("Form components must be used inside <Form />")
  }
  return ctx
}

/**
 * Main Form Component
 */
const Form = ({
  children,
  onSubmit,
  loading = false,
  disabled = false,
  error = null,
  success = null,
  className,
  noValidate = true,
  as: Component = "form",
  ...props
}) => {
  return (
    <FormContext.Provider
      value={{
        loading,
        disabled: disabled || loading,
      }}
    >
      <Component
        onSubmit={onSubmit}
        noValidate={noValidate}
        className={clsx(
          "space-y-6",
          disabled && "pointer-events-none opacity-70",
          className
        )}
        {...props}
      >
        {error && <FormError message={error} />}
        {success && <FormSuccess message={success} />}

        {children}
      </Component>
    </FormContext.Provider>
  )
}

/**
 * Form Section
 */
export const FormSection = ({ title, description, children, className }) => (
  <section className={clsx("space-y-2", className)}>
    {title && (
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    )}
    {description && (
      <p className="text-sm text-gray-500">{description}</p>
    )}
    <div className="space-y-4">{children}</div>
  </section>
)

/**
 * Form Row (Grid Friendly)
 */
export const FormRow = ({ children, className }) => (
  <div className={clsx("grid grid-cols-1 md:grid-cols-2 gap-4", className)}>
    {children}
  </div>
)

/**
 * Form Field Wrapper
 */
export const FormField = ({
  label,
  error,
  hint,
  required = false,
  children,
  className,
}) => {
  const { disabled } = useFormContext()

  return (
    <div className={clsx("space-y-1", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      {React.cloneElement(children, {
        disabled,
        "aria-invalid": !!error,
      })}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {!error && hint && (
        <p className="text-sm text-gray-400">{hint}</p>
      )}
    </div>
  )
}

/**
 * Form Actions (Buttons Row)
 */
export const FormActions = ({ children, align = "right", className }) => {
  const alignment =
    align === "left"
      ? "justify-start"
      : align === "center"
      ? "justify-center"
      : "justify-end"

  return (
    <div className={clsx("flex gap-3", alignment, className)}>
      {children}
    </div>
  )
}

/**
 * Error Banner
 */
export const FormError = ({ message }) => (
  <div
    role="alert"
    className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700"
  >
    {message}
  </div>
)

/**
 * Success Banner
 */
export const FormSuccess = ({ message }) => (
  <div
    role="status"
    className="rounded-md bg-green-50 border border-green-200 p-4 text-sm text-green-700"
  >
    {message}
  </div>
)

/**
 * Submit Button
 */
export const FormSubmit = ({
  children = "Submit",
  loadingText = "Submitting...",
  className,
  ...props
}) => {
  const { loading, disabled } = useFormContext()

  return (
    <button
      type="submit"
      disabled={disabled}
      className={clsx(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium",
        "bg-primary-600 text-white hover:bg-primary-700",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    >
      {loading ? loadingText : children}
    </button>
  )
}

export default Form
