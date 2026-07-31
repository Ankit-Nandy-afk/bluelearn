import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { signIn, signOut, updateEmail, updatePassword } from "@/lib/auth";
import { deleteMyAccount, getMyIdentity } from "@/lib/api/identity";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/settings/account")({
  component: RouteComponent,
  loader: async ({ abortController }) => {
    return getMyIdentity({ signal: abortController.signal });
  },
});

function RouteComponent() {
  const { email: initialEmail } = Route.useLoaderData();
  const currentEmail = initialEmail || "";

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

  const navigate = useNavigate();

  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "delete account") return;

    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteMyAccount();
      await signOut();
      navigate({ to: "/" });
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete account");
      setIsDeleting(false);
    }
  };

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

  const handleUpdate = async () => {
    setUpdating(true);
    setUpdateError(null);

    if (password.new.length < 6) {
      setUpdateError("New password must be at least 6 characters long.");
      setUpdating(false);
      return;
    }

    if (password.new !== password.confirmNew) {
      setUpdateError("New passwords do not match.");
      setUpdating(false);
      return;
    }

    if (!currentEmail) {
      setUpdateError("No user email found.");
      setUpdating(false);
      return;
    }

    // Verify old password by attempting to sign in
    const { error: signInError } = await signIn(currentEmail, password.old);

    if (signInError) {
      setUpdateError("Incorrect old password.");
      setUpdating(false);
      return;
    }

    // Update to new password
    const { error: updateAuthError } = await updatePassword(password.new);

    if (updateAuthError) {
      setUpdateError(updateAuthError.message);
    } else {
      setIsPasswordEditing(false);
      setPassword({ old: "", new: "", confirmNew: "" });
    }

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
                  className="btn-sec"
                  variant="outline"
                  onClick={() => setIsEmailEditing(true)}
                >
                  Change Email
                </Button>
              )}
            </div>

            {isEmailEditing && (
              <div className="space-y-4">
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
                    className="btn-sec"
                    variant="ghost"
                    onClick={() => {
                      setIsEmailEditing(false);
                      setSaveError(null);
                      setSaveSuccess(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="btn-pri"
                    onClick={handleSave}
                    disabled={saving}
                  >
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
                  className="btn-sec"
                  variant="outline"
                  onClick={() => setIsPasswordEditing(true)}
                >
                  Change Password
                </Button>
              )}
            </div>

            {isPasswordEditing && (
              <div className="space-y-4">
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
                    className="btn-sec"
                    variant="ghost"
                    onClick={() => {
                      setIsPasswordEditing(false);
                      setUpdateError(null);
                      setPassword({ old: "", new: "", confirmNew: "" });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="btn-pri"
                    onClick={handleUpdate}
                    disabled={updating}
                  >
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
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="destructive"
              className="font-mono tracking-[0.08em] uppercase"
            >
              Delete Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <FieldLabel
                  htmlFor="delete-confirm"
                  className="font-mono text-xs tracking-[0.08em] uppercase"
                >
                  Type <span className="font-bold">delete account</span> to
                  confirm
                </FieldLabel>
                <Input
                  id="delete-confirm"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder={'type "Delete Account"'}
                />
              </div>
              {deleteError && (
                <p className="mono-micro text-destructive">{deleteError}</p>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                variant="destructive"
                disabled={deleteConfirmText !== "Delete Account" || isDeleting}
                onClick={handleDeleteAccount}
              >
                {isDeleting ? "Deleting..." : "Delete Account"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
