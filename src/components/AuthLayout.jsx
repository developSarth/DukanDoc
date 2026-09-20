import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-slate-50 to-background">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="text-center pb-4">
          {Icon && (
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Icon className="w-6 h-6 text-primary" />
            </div>
          )}
          <CardTitle className="text-2xl font-bold font-heading">{title}</CardTitle>
          {subtitle && <CardDescription className="text-sm mt-1">{subtitle}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-4">
          {children}
          {footer && (
            <div className="text-center text-xs text-muted-foreground pt-4 border-t">
              {footer}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
