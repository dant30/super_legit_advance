export default function ValidationErrors({ errors = [], className = "" }) {
  if (!errors || errors.length === 0) {
    return null;
  }

  return (
    <ul className={`grid gap-1 ${className}`} role="alert" aria-live="polite">
      {errors.map((error, index) => (
        <li key={`${error}-${index}`} className="text-xs text-rose-600">
          {error}
        </li>
      ))}
    </ul>
  );
}
