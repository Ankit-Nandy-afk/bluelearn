import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { resendVerification } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldDescription } from "@/components/ui/field";

const COOLDOWN_SECONDS = 60;

export function EmailVerification({
  email,
  className,
  ...props
}: React.ComponentProps<"div"> & { email?: string }) {
  const [submitting, setSubmitting] = useState(false);
  // signup already sent one, so start on cooldown
  const [cooldown, setCooldown] = useState(COOLDOWN_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function handleResend() {
    if (!email) return;
    setSubmitting(true);

    const { error } = await resendVerification(email);

    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setCooldown(COOLDOWN_SECONDS);
    toast.success("Verification email sent.");
  }

  return (
    <div className={cn("mx-auto w-full max-w-5xl", className)} {...props}>
      <Card className="overflow-hidden rounded-md bg-background shadow-none">
        <CardContent className="grid p-0 md:grid-cols-2">
          {/* Left side - Message */}
          <div className="flex flex-col border-r">
            {/* Header */}
            <CardHeader className="space-y-4 p-6">
              <p className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
                Authentication
              </p>

              <div className="space-y-2">
                <CardTitle className="text-2xl font-semibold tracking-tight">
                  Check your email
                </CardTitle>

                <CardDescription className="text-sm text-muted-foreground">
                  {email ? (
                    <>
                      We sent a verification link to{" "}
                      <span className="font-medium text-foreground">
                        {email}
                      </span>
                      . Click it to activate your account.
                    </>
                  ) : (
                    <>
                      We sent a verification link to your email. Click it to
                      activate your account.
                    </>
                  )}
                </CardDescription>
              </div>
            </CardHeader>

            {/* Body */}
            <div className="flex-1 border-t p-6">
              <FieldDescription className="text-sm text-muted-foreground">
                Nothing in your inbox? Check your spam folder before requesting
                another link.
              </FieldDescription>
            </div>

            {/* Footer */}
            <CardFooter className="flex flex-col gap-5 border-t p-6">
              {email && (
                <Button
                  type="button"
                  className="btn-pri w-full"
                  onClick={handleResend}
                  disabled={submitting || cooldown > 0}
                >
                  {submitting
                    ? "Sending..."
                    : cooldown > 0
                      ? `Resend in ${cooldown}s`
                      : "Resend email"}
                </Button>
              )}

              <FieldDescription className="text-center text-sm">
                Already verified?{" "}
                <Link
                  to="/login"
                  className="font-medium text-foreground transition-colors hover:underline"
                >
                  Sign in
                </Link>
              </FieldDescription>
            </CardFooter>
          </div>

          {/* Right side - Image */}
          <div className="relative hidden md:flex md:items-center md:justify-center">
            <img
              src="/assets/adam/adam-arrow-reg.png"
              alt="Verify your email to start contributing"
              className="absolute object-cover p-8"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
