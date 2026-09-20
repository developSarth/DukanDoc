import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, CheckCircle2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export default function InquiryDialog({ professional, item, checklist, userEmail, onOpenChange }) {
  const [senderEmail, setSenderEmail] = useState(userEmail || '');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userEmail) setSenderEmail(userEmail);
  }, [userEmail]);

  useEffect(() => {
    if (professional && item) {
      setMessage(
        `Hi ${professional.name},\n\nI am starting a business (${checklist?.business_type || 'business'} in ${checklist?.location || 'Mumbai'}) and need assistance with the requirement "${item.name}".\n\nPlease let me know your availability, estimated timeline, and consultation fees.\n\nThank you!`
      );
      setSent(false);
      setError('');
    }
  }, [professional, item, checklist]);

  if (!professional) return null;

  async function handleSend(e) {
    e.preventDefault();
    if (!senderEmail.trim() || !message.trim()) {
      setError('Please provide your email and inquiry message.');
      return;
    }

    setSending(true);
    setError('');

    try {
      // Invoke cloud function to dispatch email
      await base44.functions.invoke('sendInquiry', {
        to: professional.contact_email,
        professional_name: professional.name,
        requirement_name: item?.name || 'General Inquiry',
        message: message.trim(),
        user_email: senderEmail.trim(),
      });

      // Save inquiry to entities
      await base44.entities.Inquiry.create({
        checklist_item_id: item?.id || '',
        requirement_name: item?.name || 'General Inquiry',
        professional_name: professional.name,
        professional_type: professional.profession_type || '',
        contact_email: professional.contact_email || '',
        location: professional.location || '',
        rating: professional.rating || '',
        pricing: professional.pricing || '',
        message: message.trim(),
        status: 'sent',
      });

      setSent(true);
      toast({
        title: 'Inquiry Sent!',
        description: `Your inquiry has been emailed to ${professional.name}.`,
      });

      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    } catch (err) {
      setError(err?.message || 'Failed to send inquiry. Please try again.');
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={!!professional} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Contact {professional.name}</DialogTitle>
          <DialogDescription>
            Send a direct inquiry about <span className="font-semibold text-foreground">{item?.name}</span>.
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto animate-bounce" />
            <p className="font-semibold text-lg text-emerald-800">Inquiry Sent Successfully!</p>
            <p className="text-sm text-muted-foreground">
              The professional will reply directly to <span className="font-medium">{senderEmail}</span>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-4">
            {error && (
              <div className="p-3 text-xs rounded bg-destructive/10 text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="to_email">Recipient</Label>
              <Input id="to_email" value={`${professional.name} <${professional.contact_email}>`} disabled />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="user_email">Your Email Address</Label>
              <Input
                id="user_email"
                type="email"
                required
                placeholder="your.email@example.com"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="inquiry_message">Message</Label>
              <Textarea
                id="inquiry_message"
                rows={5}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={sending}>
                Cancel
              </Button>
              <Button type="submit" disabled={sending}>
                {sending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {sending ? 'Sending…' : 'Send Inquiry'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
