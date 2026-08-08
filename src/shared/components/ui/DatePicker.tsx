import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { cn } from '@/shared/utils';
import { Button } from './Button';
import { Calendar } from './Calendar';

interface DatePickerProps {
  date?: Date;
  setDate?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({
  date,
  setDate,
  placeholder = 'Pick a date',
  className
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn('relative', className)} ref={containerRef}>
      <Button
        variant="outline"
        className={cn(
          'w-full justify-between h-10 px-4 rounded-xl border-gray-100 bg-gray-50/30 hover:bg-white hover:border-[#1D4F6D]/20 transition-all font-bold text-[11px] shadow-sm',
          !date && 'text-gray-400'
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <CalendarIcon className={cn("h-4 w-4", date ? "text-[#1D4F6D]" : "text-gray-400")} />
          <span className="uppercase tracking-widest">{date ? date.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' }) : placeholder}</span>
        </div>
        <ChevronDown className={cn("h-3.5 w-3.5 text-gray-400 transition-transform duration-300", isOpen && "rotate-180")} />
      </Button>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 z-[100] w-[280px] animate-in fade-in slide-in-from-top-2 duration-200">
          <Calendar
            selected={date}
            onSelect={(d) => {
              setDate && setDate(d);
              setIsOpen(false);
            }}
            className="shadow-[0_16px_40px_-12px_rgba(0,0,0,0.15)] border border-gray-100 bg-white"
          />
        </div>
      )}
    </div>
  );
}