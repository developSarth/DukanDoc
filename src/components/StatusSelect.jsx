import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';

const STATUS_CONFIG = {
  todo: { 
    label: 'To Do', 
    dotClass: 'border border-slate-400 bg-transparent',
  },
  in_progress: { 
    label: 'In Progress', 
    dotClass: 'bg-amber-500',
  },
  done: { 
    label: 'Completed', 
    dotClass: 'bg-[#004043]',
  },
};

export default function StatusSelect({ value = 'todo', onChange }) {
  const current = STATUS_CONFIG[value] || STATUS_CONFIG.todo;

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-7.5 w-[112px] sm:w-[116px] px-2.5 text-xs rounded-full border border-slate-200/90 hover:border-[#004043]/30 transition-all bg-white font-medium shadow-2xs gap-1 focus:ring-1 focus:ring-[#004043]/20">
        <div className="flex items-center gap-1.5 truncate">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${current.dotClass}`} />
          <span className="text-[#0A2528] text-xs font-medium truncate">{current.label}</span>
        </div>
      </SelectTrigger>
      <SelectContent className="w-[116px] min-w-[116px] p-1 rounded-xl border border-slate-200/90 shadow-lg bg-white/95 backdrop-blur-md">
        <SelectItem
          value="todo"
          hideIndicator
          className="group rounded-lg py-1.5 px-2 hover:bg-[rgba(0,64,67,0.06)] hover:translate-x-0.5 data-[state=checked]:bg-[#004043] transition-all duration-150 cursor-pointer"
        >
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#0A2528] group-data-[state=checked]:text-white">
            <span className="w-2 h-2 rounded-full border border-slate-400 bg-transparent flex-shrink-0 group-data-[state=checked]:border-white" />
            <span>To Do</span>
          </div>
        </SelectItem>
        <SelectItem
          value="in_progress"
          hideIndicator
          className="group rounded-lg py-1.5 px-2 hover:bg-[rgba(0,64,67,0.06)] hover:translate-x-0.5 data-[state=checked]:bg-[#004043] transition-all duration-150 cursor-pointer"
        >
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#0A2528] group-data-[state=checked]:text-white">
            <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0 group-data-[state=checked]:bg-amber-300" />
            <span>In Progress</span>
          </div>
        </SelectItem>
        <SelectItem
          value="done"
          hideIndicator
          className="group rounded-lg py-1.5 px-2 hover:bg-[rgba(0,64,67,0.06)] hover:translate-x-0.5 data-[state=checked]:bg-[#004043] transition-all duration-150 cursor-pointer"
        >
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#0A2528] group-data-[state=checked]:text-white">
            <span className="w-2 h-2 rounded-full bg-[#004043] flex-shrink-0 group-data-[state=checked]:bg-[#D0FF71]" />
            <span>Completed</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
