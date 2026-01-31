// frontend/src/components/ui/Checkbox/Checkbox.tsx
import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, disabled, onCheckedChange, onChange, ...props }, ref) => {
    return (
      <label
        className={cn(
          'group inline-flex items-center gap-3 select-none',
          disabled && 'cursor-not-allowed opacity-60'
        )}
      >
        <span className="relative flex items-center">
          <input
            ref={ref}
            type="checkbox"
            disabled={disabled}
            className={cn(
              'peer sr-only',
              className
            )}
            {...props}
            onChange={(e) => {
              // call native onChange if provided
              onChange?.(e)
              // call the more convenient onCheckedChange with boolean
              onCheckedChange?.((e.target as HTMLInputElement).checked)
            }}
          />

          {/* Box */}
          <span
            className={cn(
              'flex h-5 w-5 items-center justify-center rounded-md border',
              'border-white/20 bg-white/5',
              'transition-all duration-200 ease-out',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-500',
              'peer-checked:border-emerald-500 peer-checked:bg-emerald-500',
              'peer-hover:border-white/40'
            )}
          >
            <Check
              className={cn(
                'h-3.5 w-3.5 text-black scale-0 opacity-0',
                'transition-all duration-200 ease-out',
                'peer-checked:scale-100 peer-checked:opacity-100'
              )}
              strokeWidth={3}
            />
          </span>
        </span>

        {/* Label */}
        {label && (
          <span className="text-sm text-white/80 group-hover:text-white transition-colors">
            {label}
          </span>
        )}

        {/* Error */}
        {error && (
          <span className="block text-xs text-red-400 mt-1">
            {error}
          </span>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

// export default Checkbox;