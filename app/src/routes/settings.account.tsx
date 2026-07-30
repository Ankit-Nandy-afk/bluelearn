import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { useAuth } from "@/lib/authContext";
import { updateEmail } from "@/lib/auth";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";

export const Route = createFileRoute("/settings/account")({
  component: RouteComponent,
});

function RouteComponent() {
  const { session } = useAuth();
  const currentEmail = session?.user.email || "";

  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    if (currentEmail && !email) {
      setEmail(currentEmail);
    }
  }, [currentEmail, email]);
  const [password, setPassword] = useState({
    old: "",
    new: "",
    confirmNew: "",
  });

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>("");
  const [saveSuccess, setSaveSuccess] = useState<string | null>("");

  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>("");

  const [isEmailEditing, setIsEmailEditing] = useState(false);
  const [isPasswordEditing, setIsPasswordEditing] = useState(false);

  // TODO: fetch account data and update data based on fields

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    const { error } = await updateEmail(email);

    if (error) {
      setSaveError(error.message);
    } else {
      setSaveSuccess("Verification emails sent. Please check your inbox.");
    }

    setSaving(false);
  };

  const handleUpdate = () => {
    setUpdating(true);
    setUpdateError(null);
    setUpdating(false);
  };

  return (
    <div>
      <h1 className="mb-4 font-mono text-[14px] tracking-[0.08em] text-muted-foreground uppercase">
        Account
      </h1>

      <Separator className="mb-8 bg-border" />

      <div className="my-8">
        <h2 className="mb-2 font-mono text-[12px] tracking-[0.08em] text-muted-foreground uppercase">
          Account Details
        </h2>

        <Separator className="mb-4 bg-border" />

        <FieldGroup>
          <Field className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <FieldLabel className="font-mono tracking-[0.08em] uppercase">
                  Email
                </FieldLabel>
                {!isEmailEditing && (
                  <p className="text-sm text-muted-foreground">
                    {currentEmail || "Loading..."}
                  </p>
                )}
              </div>
              {!isEmailEditing && (
                <Button
                  variant="outline"
                  onClick={() => setIsEmailEditing(true)}
                >
                  Change Email
                </Button>
              )}
            </div>

            {isEmailEditing && (
              <div className="space-y-4 rounded-md border p-4">
                <div className="space-y-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="New email address"
                    className="h-10 rounded-md"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-end space-x-2">
                  {saveError && (
                    <p className="mono-micro text-destructive">{saveError}</p>
                  )}
                  {saveSuccess && (
                    <p className="mono-micro text-green-500">{saveSuccess}</p>
                  )}
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIsEmailEditing(false);
                      setSaveError(null);
                      setSaveSuccess(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            )}
          </Field>
        </FieldGroup>
      </div>

      <div className="my-8">
        <h2 className="mb-2 font-mono text-[12px] tracking-[0.08em] text-muted-foreground uppercase">
          Security
        </h2>

        <Separator className="mb-4 bg-border" />

        <FieldGroup>
          <Field className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <FieldLabel className="font-mono tracking-[0.08em] uppercase">
                  Password
                </FieldLabel>
                {!isPasswordEditing && (
                  <p className="text-sm text-muted-foreground">********</p>
                )}
              </div>
              {!isPasswordEditing && (
                <Button
                  variant="outline"
                  onClick={() => setIsPasswordEditing(true)}
                >
                  Change Password
                </Button>
              )}
            </div>

            {isPasswordEditing && (
              <div className="space-y-4 rounded-md border p-4">
                <div className="space-y-2">
                  <FieldLabel className="font-mono text-xs tracking-[0.08em] uppercase">
                    Old Password
                  </FieldLabel>
                  <Input
                    id="old-password"
                    type="password"
                    className="h-10 rounded-md"
                    value={password.old}
                    onChange={(e) => {
                      setPassword({
                        ...password,
                        old: e.target.value,
                      });
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <FieldLabel className="font-mono text-xs tracking-[0.08em] uppercase">
                    New Password
                  </FieldLabel>
                  <Input
                    id="new-password"
                    type="password"
                    className="h-10 rounded-md"
                    value={password.new}
                    onChange={(e) => {
                      setPassword({
                        ...password,
                        new: e.target.value,
                      });
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <FieldLabel className="font-mono text-xs tracking-[0.08em] uppercase">
                    Confirm New Password
                  </FieldLabel>
                  <Input
                    id="confirm-password"
                    type="password"
                    className="h-10 rounded-md"
                    value={password.confirmNew}
                    onChange={(e) => {
                      setPassword({
                        ...password,
                        confirmNew: e.target.value,
                      });
                    }}
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2">
                  {updateError && (
                    <p className="mono-micro text-destructive">{updateError}</p>
                  )}
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIsPasswordEditing(false);
                      setUpdateError(null);
                      setPassword({ old: "", new: "", confirmNew: "" });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleUpdate} disabled={updating}>
                    {updating ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </div>
            )}
          </Field>
        </FieldGroup>
      </div>

      <div className="my-8">
        <h2 className="mb-2 font-mono text-[12px] tracking-[0.08em] text-muted-foreground uppercase">
          Delete Account
        </h2>

        <Separator className="mb-4 bg-border" />

        <p className="py-2 font-mono text-xs text-destructive">
          This action is permanent and cannot be undone.
        </p>
        <Button
          variant="destructive"
          className="font-mono tracking-[0.08em] uppercase"
        >
          Delete Account
        </Button>
      </div>
    </div>
  );
}
