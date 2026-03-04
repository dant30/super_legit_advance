// frontend/src/components/ui/Descriptions.jsx
import React from 'react';
import { Info, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';

/* ---------------------------------------------
   Helper Components
--------------------------------------------- */

const StatusBadge = ({ status }) => {
  const styles = {
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
  };

  if (!status) return null;

  return (
    <span
      className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
};

const Skeleton = () => (
  <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
);

/* ---------------------------------------------
   Descriptions Item
--------------------------------------------- */

export const DescriptionItem = ({
  label,
  value,
  tooltip,
  status,
  copyable = false,
  loading = false,
  render,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(String(value));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col gap-1">
      {/* Label */}
      <div className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
        {tooltip && (
          <span title={tooltip}>
            <Info size={12} className="cursor-help opacity-70" />
          </span>
        )}
      </div>

      {/* Value */}
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
        {loading ? (
          <Skeleton />
        ) : render ? (
          render(value)
        ) : value ? (
          <>
            <span>{value}</span>

            {status && <StatusBadge status={status} />}

            {copyable && (
              <button
                onClick={handleCopy}
                className="text-gray-400 hover:text-gray-700"
              >
                {copied ? (
                  <Check size={14} className="text-green-600" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            )}
          </>
        ) : (
          <span className="italic text-gray-400">—</span>
        )}
      </div>
    </div>
  );
};

/* ---------------------------------------------
   Main Descriptions Component
--------------------------------------------- */

const Descriptions = ({
  title,
  description,
  columns = 3,
  layout = 'horizontal', // horizontal | vertical
  loading = false,
  children,
  bordered = false,
}) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full rounded-xl ${
        bordered ? 'border border-gray-200' : ''
      } bg-white p-4`}
    >
      {/* Header */}
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>
      )}

      {/* Content */}
      <div
        className={`grid gap-6 ${
          layout === 'vertical'
            ? 'grid-cols-1'
            : `grid-cols-1 sm:grid-cols-2 lg:grid-cols-${columns}`
        }`}
      >
        {React.Children.map(children, (child) =>
          React.cloneElement(child, { loading })
        )}
      </div>
    </motion.section>
  );
};

export default Descriptions;
