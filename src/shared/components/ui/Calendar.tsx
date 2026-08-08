import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/shared/utils';
import { Button } from './Button';

interface CalendarEvent {
  date: Date;
  type: 'present' | 'absent' | 'leave' | 'holiday';
  label?: string;
}

interface CalendarProps {
  events?: CalendarEvent[];
  selected?: Date;
  onSelect?: (date: Date) => void;
  onDateClick?: (date: Date) => void;
  className?: string;
  mode?: 'single' | 'range';
}

export function Calendar({
  events = [],
  selected,
  onSelect,
  onDateClick,
  className
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(selected || new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getEventForDate = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return events.find(e =>
      e.date.getDate() === date.getDate() &&
      e.date.getMonth() === date.getMonth() &&
      e.date.getFullYear() === date.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    if (!selected) return false;
    return day === selected.getDate() &&
      currentDate.getMonth() === selected.getMonth() &&
      currentDate.getFullYear() === selected.getFullYear();
  };

  const getDayStyles = (day: number, eventType?: string) => {
    const activeSelection = isSelected(day);
    const isToday = day === new Date().getDate() &&
      currentDate.getMonth() === new Date().getMonth() &&
      currentDate.getFullYear() === new Date().getFullYear();

    if (activeSelection) return 'bg-blue-50 text-[#1D4F6D] font-black border-[#1D4F6D]/10';
    if (isToday) return 'bg-[#1D4F6D]/5 text-[#1D4F6D] border-[#1D4F6D]/10';

    switch (eventType) {
      case 'present': return 'bg-green-50 text-green-600 border-green-100';
      case 'absent': return 'bg-red-50 text-red-600 border-red-100';
      case 'leave': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
      case 'holiday': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'hover:bg-gray-50 hover:text-[#1D4F6D]';
    }
  };

  const handleDateClick = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    onSelect?.(date);
    onDateClick?.(date);
  };

  return (
    <div className={cn('w-full bg-white rounded-2xl border border-gray-100 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.05)] overflow-hidden animate-in fade-in duration-300 select-none pb-4', className)}>
      {/* Header with Brand Color Integrated */}
      <div className="flex items-center justify-between p-4 bg-gray-50/30 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-[#1D4F6D]" />
          <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">
            {monthName} <span className="text-[#1D4F6D]">{year}</span>
          </h3>
        </div>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" onClick={prevMonth} className="h-7 w-7 rounded-lg border-gray-200 hover:border-[#1D4F6D]/20 hover:text-[#1D4F6D] transition-all">
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth} className="h-7 w-7 rounded-lg border-gray-200 hover:border-[#1D4F6D]/20 hover:text-[#1D4F6D] transition-all">
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="p-4">
        {/* Days of week */}
        <div className="grid grid-cols-7 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="text-center text-[9px] font-black text-gray-300 py-1 tracking-widest">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const event = getEventForDate(day);
            const activeSelection = isSelected(day);
            const isToday = day === new Date().getDate() &&
              currentDate.getMonth() === new Date().getMonth() &&
              currentDate.getFullYear() === new Date().getFullYear();

            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                className={cn(
                  'aspect-square rounded-xl flex flex-col items-center justify-center text-[11px] font-bold transition-all relative border border-transparent group overflow-hidden',
                  getDayStyles(day, event?.type)
                )}
              >
                {/* Brand Selection Indicator - The Navy Line */}
                <div className={cn(
                  "absolute left-0 top-1/2 -translate-y-1/2 w-1 bg-[#1D4F6D] rounded-r-full transition-all",
                  activeSelection ? "h-5" : "h-0 group-hover:h-5"
                )} />

                {isToday && !activeSelection && (
                  <div className="absolute top-1 right-1 w-1 h-1 bg-[#1D4F6D] rounded-full" />
                )}

                <span className={cn('relative z-10', activeSelection ? 'text-[#1D4F6D] scale-105' : 'text-gray-600')}>
                  {day}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}