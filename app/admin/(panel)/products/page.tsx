import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { getAdminProducts } from "@/lib/data/admin-queries";
import { deleteProduct } from "@/app/admin/actions";

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Products</h1>
          <p className="text-muted">{products.length} total</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus /> New product
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-surface">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const availableIn = product.pricing.filter(
                (p) => p.is_available
              ).length;
              return (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative size-10 shrink-0 overflow-hidden rounded-md border border-border bg-background">
                        {product.images[0]?.url ? (
                          <Image
                            src={product.images[0].url}
                            alt={product.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-muted">/{product.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted">
                    {product.category?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted">
                    {availableIn} countr{availableIn === 1 ? "y" : "ies"}
                  </TableCell>
                  <TableCell>
                    {product.is_active ? (
                      <Badge variant="soft">Active</Badge>
                    ) : (
                      <Badge variant="muted">Hidden</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/products/${product.id}`}>
                          Edit
                        </Link>
                      </Button>
                      <ConfirmDelete
                        action={deleteProduct.bind(
                          null,
                          product.id,
                          product.slug
                        )}
                        itemName={product.name}
                      />
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
