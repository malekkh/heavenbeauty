"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/**
 * Delete button with a confirm step. Receives a bound server action
 * (e.g. `deleteProduct.bind(null, id)`) and refreshes the route on success.
 */
export function ConfirmDelete({
  action,
  itemName,
}: {
  action: () => Promise<void>;
  itemName: string;
}) {
  const router = useRouter();
  const [armed, setArmed] = useState(false);
  const [pending, startTransition] = useTransition();

  function onDelete() {
    if (!armed) {
      setArmed(true);
      return;
    }
    startTransition(async () => {
      try {
        await action();
        toast.success(`Deleted ${itemName}`);
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Delete failed");
      } finally {
        setArmed(false);
      }
    });
  }

  return (
    <Button
      type="button"
      variant={armed ? "default" : "ghost"}
      size="sm"
      onClick={onDelete}
      onBlur={() => setArmed(false)}
      disabled={pending}
      className={armed ? "bg-red-600 text-white hover:bg-red-700" : ""}
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Trash2 className="size-4" />
      )}
      {armed ? "Confirm" : null}
    </Button>
  );
}
