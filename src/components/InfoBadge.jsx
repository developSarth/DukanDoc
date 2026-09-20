import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, HelpCircle } from 'lucide-react';

export default function InfoBadge({ official }) {
  if (official) {
    return (
      <Badge variant="secondary" className="gap-1 bg-emerald-50 text-emerald-700 border-emerald-200">
        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
        Official Legal Requirement
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-1 text-amber-700 border-amber-200 bg-amber-50">
      <HelpCircle className="h-3 w-3 text-amber-600" />
      Advisory / Recommended
    </Badge>
  );
}
