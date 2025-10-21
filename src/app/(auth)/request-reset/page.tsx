'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { ThemeProvider } from '@/components/theme-provider';
import { ModeToggle } from '@/components/toggle-switch';
import { BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function RequestResetPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Use Supabase's resetPasswordForEmail method
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message || 'Failed to send reset email');
        return;
      }

      setSent(true);
      toast.success('Reset link sent to your email');
    } catch (error) {
      console.error('Error sending reset email:', error);
      toast.error('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2 px-2 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between w-full max-w-5xl mx-auto">
            <div className="flex items-center gap-2">
              <div className="bg-primary rounded-lg p-2">
                <BookOpen className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold">QuizMentor</h1>
            </div>
            {/* Theme Toggle */}
            <ModeToggle />
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md space-y-8">
            {/* Back to Login */}
            <div className="flex items-center">
              <Link
                href="/login"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </Link>
            </div>

            {/* Welcome Section */}
            <div className="text-center space-y-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">
                  Forgot your password?
                </h2>
                <p className="text-muted-foreground mt-2">
                  Enter your email address and we&apos;ll send you a link to
                  reset your password.
                </p>
              </div>
            </div>

            {/* Reset Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Reset Password</CardTitle>
                <CardDescription className="text-center">
                  We&apos;ll send you a reset link via email
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {sent ? (
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      <CheckCircle className="w-12 h-12 text-green-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-green-600">
                        Check your email
                      </h3>
                      <p className="text-muted-foreground mt-2">
                        We&apos;ve sent a password reset link to{' '}
                        <strong>{email}</strong>
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Didn&apos;t receive the email? Check your spam folder or
                        try again.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSent(false);
                        setEmail('');
                      }}
                      className="w-full"
                    >
                      Send another email
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending reset link...
                        </>
                      ) : (
                        'Send reset link'
                      )}
                    </Button>
                  </form>
                )}

                {/* Back to Login */}
                <div className="text-center text-sm">
                  Remember your password?{' '}
                  <Link
                    href="/login"
                    className="font-medium text-primary hover:underline"
                  >
                    Sign in
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
