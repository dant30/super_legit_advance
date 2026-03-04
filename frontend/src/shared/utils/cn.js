// frontend/src/utils/cn.ts
// Utility function to combine class names with Tailwind CSS merging
import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export default cn