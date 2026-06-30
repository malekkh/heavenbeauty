"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDelete } from "./confirm-delete";
import { slugify } from "@/lib/utils";
import {
  deleteCategory,
  saveCategory,
  type CategoryInput,
} from "@/app/admin/actions";
import type { Category } from "@/lib/types";

export function CategoriesManager({
  categories,
}: {
  categories: Category[];
}) {
  const router = useRouter();
  const [newName, setNewName] = useState("");
  const [pending, startTransition] = useTransition();

  function save(input: CategoryInput) {
    startTransition(async () => {
      try {
        await saveCategory(input);
        toast.success("Category saved");
        setNewName("");
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Save failed");
      }
    });
  }

  return (
    <div className="space-y-8">
      {/* Add */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!newName.trim()) return;
          save({
            slug: slugify(newName),
            name: newName.trim(),
            sort_order: categories.length + 1,
            is_active: true,
          });
        }}
        className="flex items-end gap-3 rounded-lg border border-border bg-surface p-4"
      >
        <div className="flex-1 space-y-2">
          <Label htmlFor="new-cat">New category</Label>
          <Input
            id="new-cat"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Lip Oils"
          />
        </div>
        <Button type="submit" disabled={pending || !newName.trim()}>
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}
          Add
        </Button>
      </form>

      <div className="rounded-lg border border-border bg-surface">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="w-24">Sort</TableHead>
              <TableHead className="w-24">Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <CategoryRow
                key={category.id}
                category={category}
                onSave={save}
                pending={pending}
                onDelete={deleteCategory.bind(null, category.id)}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function CategoryRow({
  category,
  onSave,
  pending,
  onDelete,
}: {
  category: Category;
  onSave: (input: CategoryInput) => void;
  pending: boolean;
  onDelete: () => Promise<void>;
}) {
  const [name, setName] = useState(category.name);
  const [sort, setSort] = useState(category.sort_order);
  const [active, setActive] = useState(category.is_active);

  return (
    <TableRow>
      <TableCell>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </TableCell>
      <TableCell className="text-muted">/{category.slug}</TableCell>
      <TableCell>
        <Input
          type="number"
          value={sort}
          onChange={(e) => setSort(Number(e.target.value))}
          className="w-20"
        />
      </TableCell>
      <TableCell>
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="size-4 accent-[var(--brand)]"
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-1">
          <Button
            size="sm"
            variant="ghost"
            disabled={pending}
            onClick={() =>
              onSave({
                id: category.id,
                slug: category.slug,
                name: name.trim(),
                sort_order: sort,
                is_active: active,
              })
            }
          >
            <Save className="size-4" /> Save
          </Button>
          <ConfirmDelete action={onDelete} itemName={category.name} />
        </div>
      </TableCell>
    </TableRow>
  );
}
