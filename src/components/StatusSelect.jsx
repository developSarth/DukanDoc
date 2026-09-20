import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Circle, Clock, CheckCircle2 } from 'lucide-react';

const STATUS_CONFIG = {
  todo: { label: 'To Do', icon: Circle, color: 'text-slate-400' },
  in_progress: { label: 'In Progress', icon: Clock, color: 'text-slate-600' },
  done: { 
    label: 'Completed', 
    icon: ({className}) => (
      <div className={`rounded-full flex items-center justify-center bg-[var(--signal)] text-[var(--ink)] ${className}`}>
        <CheckCircle2 className="h-3/4 w-3/4" />
      </div>
    ), 
    color: '' 
  },
};

export default function StatusSelect({ value = 'todo', onChange }) {
  const current = STATUS_CONFIG[value] || STATUS_CONFIG.todo;
  const Icon = current.icon;

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 px-3.5 text-xs sm:text-sm rounded-full border border-slate-200 hover:border-slate-300 transition-colors bg-white font-medium shadow-sm gap-2">
        <div className="flex items-center gap-2">
          <Icon className={`h-3.5 w-3.5 ${current.color}`} />
          <span className="text-[#0A2528] font-medium">{current.label}</span>
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="todo">
          <div className="flex items-center gap-2 text-xs font-medium" style={{ color: 'var(--ink)' }}>
            <Circle className="h-4 w-4 text-slate-400" />
            <span>To Do</span>
          </div>
        </SelectItem>
        <SelectItem value="in_progress">
          <div className="flex items-center gap-2 text-xs font-medium" style={{ color: 'var(--ink)' }}>
            <Clock className="h-4 w-4 text-slate-600" />
            <span>In Progress</span>
          </div>
        </SelectItem>
        <SelectItem value="done">
          <div className="flex items-center gap-2 text-xs font-medium" style={{ color: 'var(--ink)' }}>
            <div className="h-4 w-4 rounded-full flex items-center justify-center bg-[var(--signal)] text-[var(--ink)]">
              <CheckCircle2 className="h-3 w-3" />
            </div>
            <span>Completed</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
