import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Loader2, KeyRound } from 'lucide-react';
import AuthLayout from '@/components/AuthLayout';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await base44.auth.requestPasswordReset(email);
      setSubmitted(true);
    } catch (err) {
      setError(err?.message || 'Failed to send reset link. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <AuthLayout
        icon={Mail}
        title="Check your inbox"
        subtitle={`We have sent password reset instructions to ${email}`}
        footer={
          <Link to="/login" className="text-primary font-medium hover:underline">
            Return to Login
          </Link>
        }
      >
        <p className="text-sm text-muted-foreground text-center">
          Follow the link inside the email to set a new password. If you don't see it, check your spam folder.
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={KeyRound}
      title="Reset your password"
      subtitle="Enter your email to receive a password reset link"
      footer={
        <Link to="/login" className="text-primary font-medium hover:underline">
          Back to Login
        </Link>
      }
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              required
              autoFocus
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>

        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending link...
            </>
          ) : (
            'Send Reset Link'
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
