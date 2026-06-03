"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { deleteProduct, updateProductStock } from "@/app/actions/products";
import { ProductForm } from "./ProductForm";

export function ProductClient({ products, categories }: { products: any[], categories: any[] }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const router = useRouter();

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
      await deleteProduct(id);
    }
  };

  const handleStockChange = async (id: number, currentStock: number, delta: number) => {
    const newStock = Math.max(0, currentStock + delta);
    if (newStock !== currentStock) {
      await updateProductStock(id, newStock);
    }
  };

  const openNewProductDialog = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: any) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setEditingProduct(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-heading font-bold tracking-tight text-primary uppercase">INVENTARIO</h2>
          <p className="text-muted-foreground mt-2">Gestiona el catálogo de productos de TCG.</p>
        </div>
        <Button onClick={openNewProductDialog}><Plus className="mr-2 h-4 w-4" /> Agregar Producto</Button>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Idioma</TableHead>
              <TableHead>Precio Min.</TableHead>
              <TableHead>Precio May.</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No hay productos en el inventario. Haz clic en "Agregar Producto".
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{product.categoryName}</Badge>
                  </TableCell>
                  <TableCell>{product.language}</TableCell>
                  <TableCell>USD {product.priceUsdMinorista}</TableCell>
                  <TableCell>USD {product.priceUsdMayorista}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleStockChange(product.id, product.stock, -1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center">{product.stock}</span>
                      <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleStockChange(product.id, product.stock, 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(product)}>
                      Editar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id)}>
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) setEditingProduct(null);
        setIsDialogOpen(open);
      }}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
            <DialogDescription>
              {editingProduct ? "Modifica los datos del producto." : "Completa los datos para agregar un nuevo producto al catálogo."}
            </DialogDescription>
          </DialogHeader>
          <ProductForm 
            categories={categories} 
            initialData={editingProduct}
            onSuccess={closeDialog} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
