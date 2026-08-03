import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { updatePassword } from "@/lib/auth";
import { MIN_PASSWORD_LENGTH } from "@/lib/authValidation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < MIN_PASSWORD_LENGTH) {
      toast.error(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
      );
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setSubmitting(true);
    const { error } = await updatePassword(password);

    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated.");
    navigate({ to: "/" });
  }

  return (
    <div className={cn("mx-auto w-full max-w-md", className)} {...props}>
      <Card className="rounded-md bg-background shadow-none">
        <CardHeader className="space-y-4 p-6">
          <p className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
            Password reset
          </p>

          <div className="space-y-2">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Set a new password
            </CardTitle>

            <CardDescription className="text-sm text-muted-foreground">
              Choose a new password for your account.
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="border-t p-6">
            <FieldGroup className="space-y-5">
              <Field className="space-y-2">
                <FieldLabel className="font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase">
                  New password
                </FieldLabel>

                <div className="relative w-full">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    className="h-10 rounded-md"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </Field>

              <Field className="space-y-2">
                <FieldLabel className="font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase">
                  Confirm new password
                </FieldLabel>

                <div className="relative w-full">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    className="h-10 rounded-md"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </Field>

              <FieldDescription className="text-xs text-muted-foreground">
                Passwords must be at least{" "}
                <span className="font-medium text-foreground">
                  {MIN_PASSWORD_LENGTH} characters
                </span>{" "}
                long.
              </FieldDescription>
            </FieldGroup>
          </CardContent>

          <CardFooter className="border-t p-6">
            <Button
              type="submit"
              className="btn-pri w-full"
              disabled={submitting}
            >
              {submitting ? "Updating..." : "Update password"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
