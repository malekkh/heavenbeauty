import { UsersManager } from "@/components/admin/users-manager";
import { getUsers } from "@/lib/data/admin-queries";
import { createClient } from "@/lib/supabase/server";
import { hasServiceRole } from "@/lib/supabase/config";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const users = await getUsers();

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl">Users</h1>
        <p className="text-muted">
          Admins can access the dashboard and manage the store. Add new admins
          or revoke access below.
        </p>
      </div>
      <UsersManager
        users={users}
        currentUserId={user?.id ?? ""}
        serviceRoleAvailable={hasServiceRole()}
      />
    </div>
  );
}
