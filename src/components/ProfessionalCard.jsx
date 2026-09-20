import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Phone, Mail, ExternalLink, MessageSquareText } from 'lucide-react';

export default function ProfessionalCard({ professional, onContact }) {
  if (!professional) return null;

  return (
    <Card className="hover:border-foreground/20 transition-all shadow-sm">
      <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold text-base leading-snug">{professional.name}</h4>
              {professional.profession_type && (
                <p className="text-xs text-muted-foreground mt-0.5">{professional.profession_type}</p>
              )}
            </div>
            {professional.rating && (
              <Badge variant="secondary" className="gap-1 flex-shrink-0 text-xs">
                <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                {professional.rating}
              </Badge>
            )}
          </div>

          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            {professional.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{professional.location}</span>
              </div>
            )}
            {professional.phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{professional.phone}</span>
              </div>
            )}
            {professional.pricing && (
              <div className="text-xs font-medium text-foreground mt-1">
                Fees: {professional.pricing}
              </div>
            )}
          </div>
        </div>

        <div className="pt-2 border-t flex items-center justify-between gap-2">
          {professional.source_url ? (
            <a
              href={professional.source_url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
            >
              Public listing <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <span />
          )}

          {professional.contact_email ? (
            <Button size="sm" onClick={() => onContact(professional)} className="h-8 text-xs gap-1.5">
              <MessageSquareText className="h-3.5 w-3.5" />
              Contact
            </Button>
          ) : (
            <span className="text-[11px] text-muted-foreground italic">Contact via phone / listing</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
