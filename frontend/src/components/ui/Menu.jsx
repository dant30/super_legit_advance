// frontent/src/components/ui/Menu.jsx
import React, { useState, useRef, useEffect, cloneElement } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Menu Component
 *
 * Usage:
 * <Menu
 *   trigger={<Button>Open</Button>}
 *   items={[
 *     { label: 'Profile', icon: User, onClick: () => {} },
 *     { label: 'Settings', icon: Settings, onClick: () => {} },
 *     { divider: true },
 *     { label: 'Logout', icon: LogOut, danger: true, onClick: logout },
 *   ]}
 * />
 */

const Menu = ({
  trigger,
  items = [],
  align = 'left',        // left | right
  closeOnSelect = true,
  disabled = false,
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const menuRef = useRef(null);
  const triggerRef = useRef(null);

  // -----------------------------
  // Click outside to close
  // -----------------------------
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };

    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // -----------------------------
  // Keyboard navigation
  // -----------------------------
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      const enabledItems = items.filter(i => !i.divider && !i.disabled);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % enabledItems.length);
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) =>
          prev <= 0 ? enabledItems.length - 1 : prev - 1
        );
      }

      if (e.key === 'Enter' && activeIndex >= 0) {
        enabledItems[activeIndex]?.onClick?.();
        if (closeOnSelect) setOpen(false);
      }

      if (e.key === 'Escape') {
        setOpen(false);
        setActiveIndex(-1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, activeIndex, items, closeOnSelect]);

  // -----------------------------
  // Clone trigger to inject props
  // -----------------------------
  const Trigger = cloneElement(trigger, {
    ref: triggerRef,
    onClick: () => !disabled && setOpen(prev => !prev),
    'aria-haspopup': 'menu',
    'aria-expanded': open,
  });

  return (
    <div className="relative inline-block">
      {Trigger}

      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            role="menu"
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.15 }}
            className={`
              absolute z-50 mt-2 min-w-[200px]
              rounded-xl border border-gray-200
              bg-white shadow-lg
              ${align === 'right' ? 'right-0' : 'left-0'}
              ${className}
            `}
          >
            <ul className="py-1">
              {items.map((item, index) => {
                if (item.divider) {
                  return (
                    <li
                      key={`divider-${index}`}
                      className="my-1 h-px bg-gray-200"
                    />
                  );
                }

                const Icon = item.icon;
                const isDisabled = item.disabled;

                return (
                  <li
                    key={index}
                    role="menuitem"
                    onClick={() => {
                      if (isDisabled) return;
                      item.onClick?.();
                      if (closeOnSelect) setOpen(false);
                    }}
                    className={`
                      flex items-center gap-3 px-4 py-2 text-sm
                      cursor-pointer select-none
                      transition-colors
                      ${
                        isDisabled
                          ? 'opacity-40 cursor-not-allowed'
                          : item.danger
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    {Icon && <Icon size={16} />}
                    <span>{item.label}</span>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Menu;