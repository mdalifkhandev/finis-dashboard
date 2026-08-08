import React, { useEffect, useState, useRef, KeyboardEvent } from 'react';
import { cn } from '@/shared/utils';

interface DropdownItem {
  label: string;
  icon?: React.ElementType;
  onClick: () => void;
  variant?: 'default' | 'destructive';
  isActive?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
  id?: string;
}

export function Dropdown({
  trigger,
  items,
  align = 'right',
  className,
  id
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const dropdownId = id || `dropdown-${Math.random().toString(36).substr(2, 9)}`;
  const menuId = `${dropdownId}-menu`;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setFocusedIndex(0);
    } else {
      setFocusedIndex(-1);
    }
  }, [isOpen]);

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isOpen) {
          if (focusedIndex >= 0) {
            items[focusedIndex].onClick();
            setIsOpen(false);
          }
        } else {
          setIsOpen(true);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setFocusedIndex(prev => (prev < items.length - 1 ? prev + 1 : prev));
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex(prev => (prev > 0 ? prev - 1 : prev));
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  return (
    <div
      className="relative inline-block text-left"
      ref={dropdownRef}
      onKeyDown={handleKeyDown}
    >
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer"
        role="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls={menuId}
        tabIndex={0}
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          id={menuId}
          role="menu"
          ref={menuRef}
          className={cn(
            'absolute z-50 mt-2 w-52 rounded-2xl bg-white shadow-[0_12px_40px_-8px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200',
            align === 'right' ? 'right-0' : 'left-0',
            className
          )}
        >
          <div className="p-1 px-1.5 flex flex-col gap-0.5">
            {items.map((item, index) => (
              <button
                key={index}
                role="menuitem"
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                onMouseEnter={() => setFocusedIndex(index)}
                className={cn(
                  'flex w-full items-center px-4 py-3 text-[11px] font-bold transition-all relative group rounded-lg outline-none',
                  item.isActive ? "bg-blue-50 text-[#1D4F6D]" :
                    index === focusedIndex ? "bg-gray-50 text-[#1D4F6D]" : "text-gray-400 hover:bg-gray-50 hover:text-[#1D4F6D]",
                  item.variant === 'destructive' && 'text-red-500 hover:text-red-600 hover:bg-red-50'
                )}
              >
                {/* Brand Navy Selection Indicator */}
                <div className={cn(
                  "absolute left-0 top-1/2 -translate-y-1/2 w-1 bg-[#1D4F6D] rounded-r-full transition-all",
                  item.isActive ? "h-4" : (index === focusedIndex ? "h-4 opacity-50" : "h-0")
                )} />
                {item.icon && <item.icon className="mr-3 h-3.5 w-3.5" />}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}