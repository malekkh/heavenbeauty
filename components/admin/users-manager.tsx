"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, ShieldOff, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDelete } from "./confirm-delete";
import {
  createAdminUser,
  deleteUser,
  setUserAdmin,
} from "@/app/admin/actions";
import type { AdminUser } from "@/lib/data/admin-queries";

export function UsersManager({
  users,
  currentUserId,
  serviceRoleAvailable,
}: {
  users: AdminUser[];
  currentUserId: string;
  serviceRoleAvailable: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, startTransition] = useTransition();

  function addAdmin(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await createAdminUser(email, password);
        toast.success(`Admin added: ${email}`);
        setEmail("");
        setPassword("");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to add admin");
      }
    });
  }

  function toggleAdmin(user: AdminUser) {
    startTransition(async () => {
      try {
        await setUserAdmin(user.id, !user.is_admin);
        toast.success(
          user.is_admin
            ? `Revoked admin from ${user.email}`
            : `Granted admin to ${user.email}`
        );
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Update failed");
      }
    });
  }

  if (!serviceRoleAvailable) {
    return (
      <div className="rounded-lg border border-border bg-surface p-6 text-sm text-muted">
        User management needs{" "}
        <code className="text-brand">SUPABASE_SERVICE_ROLE_KEY</code> configured
        on the server.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Add admin */}
      <form
        onSubmit={addAdmin}
        className="rounded-lg border border-border bg-surface p-6"
      >
        <h2 className="mb-4 flex items-center gap-2 font-medium">
          <UserPlus className="size-4 text-brand" /> Add a new admin
        </h2>
        <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div className="space-y-2">
            <Label htmlFor="new-email">Email</Label>
            <Input
              id="new-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">Temporary password</Label>
            <Input
              id="new-password"
              type="text"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <UserPlus className="size-4" />
            )}
            Add admin
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted">
          The new admin signs in at <code>/admin</code> with this email and
          password.
        </p>
      </form>

      
      <div className="rounded-lg border border-border bg-surface">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const isSelf = user.id === currentUserId;
              return (
                <TableRow key={user.id}>
                  <TableCell>
                    <span className="font-medium">{user.email}</span>
                    {isSelf ? (
                      <span className="ml-2 text-xs text-muted">(you)</span>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    {user.is_admin ? (
                      <Badge variant="soft">Admin</Badge>
                    ) : (
                      <Badge variant="muted">No access</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={pending || isSelf}
                        onClick={() => toggleAdmin(user)}
                      >
                        {user.is_admin ? (
                          <>
                            <ShieldOff className="size-4" /> Revoke
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="size-4" /> Make admin
                          </>
                        )}
                      </Button>
                      {!isSelf ? (
                        <ConfirmDelete
                          action={deleteUser.bind(null, user.id)}
                          itemName={user.email ?? "user"}
                        />
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
