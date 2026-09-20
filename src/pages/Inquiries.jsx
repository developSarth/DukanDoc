import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { Inbox, Loader2, MapPin, Star } from 'lucide-react';

export default function Inquiries() {
  const [inquiries, setInquiries] = useState(null);

  useEffect(() => {
    base44.entities.Inquiry.list('-created_date', 50)
      .then(setInquiries)
      .catch(() => setInquiries([]));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-heading font-bold">My inquiries</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Inquiries you've sent to professionals. They reply to you directly by email.
      </p>

      {inquiries === null && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {inquiries && inquiries.length === 0 && (
        <div className="text-center py-16">
          <Inbox className="h-10 w-10 mx-auto text-muted-foreground" />
          <p className="mt-3 text-muted-foreground">No inquiries sent yet.</p>
          <Button asChild className="mt-4">
            <Link to="/">Generate a checklist</Link>
          </Button>
        </div>
      )}

      {inquiries && inquiries.length > 0 && (
        <div className="space-y-3 mt-6">
          {inquiries.map((q) => (
            <Card key={q.id}>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{q.professional_name}</p>
                    {q.professional_type && (
                      <p className="text-sm text-muted-foreground">{q.professional_type}</p>
                    )}
                  </div>
                  <Badge variant={q.status === 'replied' ? 'default' : 'secondary'}>
                    {q.status === 'replied' ? 'Replied' : 'Sent'}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                  {q.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {q.location}
                    </span>
                  )}
                  {q.rating && (
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5" /> {q.rating}
                    </span>
                  )}
                  {q.created_date && (
                    <span>{format(new Date(q.created_date), 'd MMM yyyy, h:mm a')}</span>
                  )}
                </div>
                <div className="mt-3 rounded-md bg-muted p-3 text-sm">
                  <p className="text-xs text-muted-foreground mb-1">Re: {q.requirement_name}</p>
                  <p className="whitespace-pre-line">{q.message}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
