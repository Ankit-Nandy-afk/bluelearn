import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { getMyIdentity } from "@/lib/api/identity";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { client } from "@/lib/api/apiClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/profile";

export const Route = createFileRoute("/settings/profile")({
  component: RouteComponent,
  loader: async ({ abortController }) => {
    return getMyIdentity({ signal: abortController.signal });
  },
});

function RouteComponent() {
  const { profile: initialProfile } = Route.useLoaderData();
  const [profile, setProfile] = useState({
    displayName: initialProfile.display_name || "",
    username: initialProfile.username || "",
    bio: initialProfile.bio || "",
  });

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>("");

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);

    try {
      const res = await client.me.$patch({
        json: {
          display_name: profile.displayName || null,
          username: profile.username,
          bio: profile.bio || null,
        },
      });
      if (!res.ok) {
        if (res.status === 409) {
          throw new Error("Username already taken");
        }
        throw new Error(`Save failed: ${res.status}`);
      }
      toast.success("Profile saved successfully.");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-mono text-[14px] tracking-[0.08em] text-muted-foreground uppercase">
          Public Profile
        </h1>

        <div className="flex items-center">
          {saveError && (
            <p className="mono-micro px-4 text-destructive">{saveError}</p>
          )}

          <Button
            variant="default"
            className="btn-pri"
            size="lg"
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <Separator className="mb-8 bg-border" />

      <FieldGroup>
        <Field className="space-y-2">
          <div className="space-y-1">
            <FieldLabel className="font-mono tracking-[0.08em] uppercase">
              Profile Photo
            </FieldLabel>
            <FieldDescription className="text-xs">
              Automatically generated when your account was created.
            </FieldDescription>
          </div>

          <div className="flex items-end gap-4">
            <Avatar className="size-30 bg-secondary">
              <AvatarImage className="" />
              <AvatarFallback className="bg-secondary text-2xl font-bold">
                {getInitials(profile.displayName || profile.username)}
              </AvatarFallback>
            </Avatar>

            <div className="cursor-not-allowed">
              <Button variant="outline" disabled className="btn-sec" size="lg">
                Upload
              </Button>
            </div>
            <FieldDescription className="text-xs text-primary">
              Custom profile photos coming soon!
            </FieldDescription>
          </div>
        </Field>

        <Field className="space-y-2">
          <div className="space-y-1">
            <FieldLabel className="font-mono tracking-[0.08em] uppercase">
              Display Name
            </FieldLabel>
            <FieldDescription className="text-xs">
              Publicly visible (if blank, defaults to username)
            </FieldDescription>
          </div>

          <Input
            id="display-name"
            type="text"
            maxLength={50}
            placeholder="..."
            className="h-10 rounded-md"
            value={profile.displayName}
            onChange={(e) => {
              setProfile({
                ...profile,
                displayName: e.target.value,
              });
            }}
          />
        </Field>

        <Field className="space-y-2">
          <div className="space-y-1">
            <FieldLabel
              required
              className="font-mono tracking-[0.08em] uppercase"
            >
              Username
            </FieldLabel>
          </div>

          <Input
            id="username"
            type="text"
            maxLength={50}
            placeholder="..."
            className="h-10 rounded-md"
            required
            value={profile.username}
            onChange={(e) => {
              setProfile({
                ...profile,
                username: e.target.value,
              });
            }}
          />
        </Field>

        <Field className="space-y-2">
          <div className="space-y-1">
            <FieldLabel className="font-mono tracking-[0.08em] uppercase">
              Bio
            </FieldLabel>
            <FieldDescription className="text-xs">
              Short bio, visible on your profile
            </FieldDescription>
          </div>

          <textarea
            className="h-32 w-full min-w-0 resize-none rounded-md border border-input bg-input/20 p-2 text-sm transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-xs/relaxed file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 md:text-xs/relaxed dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
            rows={3}
            placeholder="..."
            value={profile.bio}
            onChange={(e) => {
              setProfile({
                ...profile,
                bio: e.target.value,
              });
            }}
          />
        </Field>
      </FieldGroup>
    </div>
  );
}
