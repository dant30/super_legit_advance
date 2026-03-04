export default function ValidationErrors({ id, errors = [], className = "" }) {
  if (!errors || errors.length === 0) {
    return null;
  }

  return (
    <ul id={id} className={`grid gap-1 ${className}`} role="alert" aria-live="polite">
      {errors.map((error, index) => (
        <li key={`${error}-${index}`} className="ui-error text-xs">
          {error}
        </li>
      ))}
    </ul>
  );
}
