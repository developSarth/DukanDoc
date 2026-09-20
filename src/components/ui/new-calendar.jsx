import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Check, Bell } from 'lucide-react';
import {
  format,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addDays,
} from 'date-fns';

export default function NewCalendar({ selectedDate, onSelectDate, onClose }) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate ? new Date(selectedDate) : new Date());

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const quickPresets = [
    { label: 'In 3 days', days: 3 },
    { label: 'In 7 days', days: 7 },
    { label: 'In 14 days', days: 14 },
    { label: 'In 30 days', days: 30 },
  ];

  return (
    <div
      className="p-4 rounded-2xl shadow-xl border w-[310px] animate-scale-in select-none text-left"
      style={{
        backgroundColor: '#FFFFFF',
        borderColor: 'rgba(0, 64, 67, 0.12)',
        boxShadow: '0 20px 40px -12px rgba(0, 40, 43, 0.18), 0 2px 8px rgba(0, 40, 43, 0.04)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b" style={{ borderColor: 'rgba(0, 64, 67, 0.08)' }}>
        <div className="flex items-center gap-1.5">
          <CalendarIcon className="h-4 w-4" style={{ color: 'var(--ink)' }} />
          <span className="font-heading font-semibold text-[14.5px]" style={{ color: 'var(--ink)' }}>
            {format(currentMonth, 'MMMM yyyy')}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            className="h-7 w-7 rounded-lg flex items-center justify-center transition-smooth hover:bg-black/5"
            style={{ color: 'var(--slate)' }}
            title="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="h-7 w-7 rounded-lg flex items-center justify-center transition-smooth hover:bg-black/5"
            style={{ color: 'var(--slate)' }}
            title="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {weekDays.map((day) => (
          <span
            key={day}
            className="text-[11px] font-semibold tracking-wider uppercase py-1"
            style={{ color: 'var(--slate)', opacity: 0.75 }}
          >
            {day}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = selectedDate && isSameDay(day, new Date(selectedDate));
          const isCurrentDay = isToday(day);

          return (
            <button
              key={idx}
              type="button"
              onClick={() => {
                onSelectDate(day);
                if (onClose) onClose();
              }}
              className="h-8 w-8 rounded-lg text-xs font-medium flex items-center justify-center transition-all mx-auto"
              style={{
                backgroundColor: isSelected
                  ? 'var(--ink)'
                  : isCurrentDay
                  ? 'rgba(39, 234, 166, 0.20)'
                  : 'transparent',
                color: isSelected
                  ? '#FFFFFF'
                  : isCurrentMonth
                  ? 'var(--ink)'
                  : 'rgba(0, 64, 67, 0.25)',
                fontWeight: isSelected || isCurrentDay ? 600 : 450,
                border: isCurrentDay && !isSelected ? '1px solid rgba(0, 64, 67, 0.25)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 64, 67, 0.08)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = isCurrentDay
                    ? 'rgba(39, 234, 166, 0.20)'
                    : 'transparent';
                }
              }}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>

      {/* Quick Presets */}
      <div className="mt-3.5 pt-3 border-t" style={{ borderColor: 'rgba(0, 64, 67, 0.08)' }}>
        <p className="text-[11px] font-medium mb-1.5 flex items-center gap-1" style={{ color: 'var(--slate)', opacity: 0.8 }}>
          <Clock className="h-3 w-3" /> Quick Deadline
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {quickPresets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                const target = addDays(new Date(), preset.days);
                onSelectDate(target);
                if (onClose) onClose();
              }}
              className="text-[11.5px] py-1 px-2 rounded-md font-medium text-left transition-smooth flex items-center justify-between"
              style={{
                backgroundColor: 'rgba(0, 64, 67, 0.04)',
                color: 'var(--ink)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--ink)';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 64, 67, 0.04)';
                e.currentTarget.style.color = 'var(--ink)';
              }}
            >
              <span>{preset.label}</span>
              <span className="text-[10px] opacity-60">
                {format(addDays(new Date(), preset.days), 'd MMM')}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
