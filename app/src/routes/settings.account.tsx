import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { client } from "@/lib/api/apiClient";

export const Route = createFileRoute("/settings/account")({
  component: RouteComponent,
});

function RouteComponent() {
  const [displayName, setDisplayName] = useState("Johnny Doeser");
  const [username, setUsername] = useState("John_Doe99");
  const [email, setEmail] = useState("johnny.doeser@example.com");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await client.me.$patch({
        json: {
          username,
          display_name: displayName || null,
          bio: bio || null,
        },
      });
      if (!res.ok) {
        throw new Error(`Save failed: ${res.status}`);
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mb-6">
      <div>
        <h1 className="data-label text-[14px] tracking-[0.08em] text-muted-foreground uppercase">
          Account
        </h1>
        <p className="font-mono text-sm text-muted-foreground">
          Make changes to your account details
        </p>
      </div>

      <Separator className="mb-8 bg-border" />

      <div className="space-y-6">
        <Field>
          <FieldLabel className="w-fit border-b border-foreground pb-0.5 font-mono tracking-[0.08em] uppercase">
            Display Name
          </FieldLabel>
          <p className="mb-1 font-sans text-xs text-muted-foreground">
            Publicly visible (if blank, defaults to username)
          </p>
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </Field>

        <Field>
          <FieldLabel className="w-fit border-b border-foreground pb-0.5 font-mono tracking-[0.08em] uppercase">
            Username
          </FieldLabel>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Field>

        <Field>
          <FieldLabel className="w-fit border-b border-foreground pb-0.5 font-mono tracking-[0.08em] uppercase">
            Email
          </FieldLabel>
          <p className="mb-1 font-sans text-xs text-muted-foreground">
            Contact support to change your email
          </p>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled
          />
        </Field>

        <Field>
          <FieldLabel className="w-fit border-b border-foreground pb-0.5 font-mono tracking-[0.08em] uppercase">
            Bio
          </FieldLabel>
          <Input value={bio} onChange={(e) => setBio(e.target.value)} />
        </Field>

        {saveError && (
          <p className="font-mono text-sm text-destructive">{saveError}</p>
        )}

        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      <Separator className="my-8 bg-border" />

      <div className="space-y-2">
        <Button
          variant="destructive"
          className="font-mono tracking-[0.08em] uppercase"
        >
          Delete Account
        </Button>
        <p className="mt-3 font-mono text-sm tracking-[0.08em] text-destructive uppercase">
          This action cannot be undone
        </p>
      </div>
    </div>
  );
}
