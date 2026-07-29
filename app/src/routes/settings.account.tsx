import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

export const Route = createFileRoute("/settings/account")({
  component: RouteComponent,
});

function RouteComponent() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState({
    old: "",
    new: "",
    confirmNew: "",
  });

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>("");

  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>("");

  // TODO: fetch account data and update data based on fields

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    setSaving(false);
  };

  const handleUpdate = async () => {
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
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-mono text-[12px] tracking-[0.08em] text-muted-foreground uppercase">
            Update Details
          </h2>

          <div className="flex items-center">
            {saveError && (
              <p className="mono-micro px-4 text-destructive">{saveError}</p>
            )}

            <Button
              variant={"outline"}
              className="btn-sec"
              onClick={handleSave}
              disabled={saving}
              size="lg"
            >
              {saving ? "Updating..." : "Update"}
            </Button>
          </div>
        </div>

        <Separator className="mb-4 bg-border" />

        <FieldGroup>
          <Field className="space-y-2">
            <div className="space-y-1">
              <FieldLabel className="font-mono tracking-[0.08em] uppercase">
                Email
              </FieldLabel>
              <FieldDescription className="text-xs">
                Contact support to change your email address
              </FieldDescription>
            </div>

            <Input
              id="email"
              type="email"
              className="h-10 rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
        </FieldGroup>
      </div>

      <div className="my-8">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-mono text-[12px] tracking-[0.08em] text-muted-foreground uppercase">
            Change Password
          </h2>

          <div className="flex items-center">
            {updateError && (
              <p className="mono-micro px-4 text-destructive">{updateError}</p>
            )}

            <Button
              variant={"outline"}
              className="btn-sec"
              onClick={handleUpdate}
              disabled={updating}
              size="lg"
            >
              {updating ? "Updating..." : "Change"}
            </Button>
          </div>
        </div>

        <Separator className="mb-4 bg-border" />

        <FieldGroup>
          <Field className="space-y-2">
            <div className="space-y-1">
              <FieldLabel className="font-mono tracking-[0.08em] uppercase">
                Old Password
              </FieldLabel>
            </div>

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
          </Field>

          <Field className="space-y-2">
            <div className="space-y-1">
              <FieldLabel className="font-mono tracking-[0.08em] uppercase">
                New Password
              </FieldLabel>
            </div>

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
          </Field>

          <Field className="space-y-2">
            <div className="space-y-1">
              <FieldLabel className="font-mono tracking-[0.08em] uppercase">
                Confirm New Password
              </FieldLabel>
            </div>

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
