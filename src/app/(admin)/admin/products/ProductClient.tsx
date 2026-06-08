"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { deleteProduct, updateProductStock, importProductsFromCSV } from "@/app/actions/products";
import { ProductForm } from "./ProductForm";

export function ProductClient({ products, categories }: { products: any[], categories: any[] }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const confirmDelete = (product: any) => {
    setProductToDelete(product);
  };

  const executeDelete = async () => {
    if (productToDelete) {
      await deleteProduct(productToDelete.id);
      setProductToDelete(null);
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    Papa.parse(file, {
      header: false,
      skipEmptyLines: "greedy",
      complete: async (results) => {
        try {
          const res = await importProductsFromCSV(results.data as string[][]);
          if (res.success) {
            alert(`¡Éxito! Se importaron ${res.count} productos correctamente.`);
          } else {
            alert(res.error || "Ocurrió un error en la importación.");
          }
        } catch (error) {
          alert("Ocurrió un error inesperado al procesar el archivo.");
        } finally {
          setIsImporting(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      },
      error: () => {
        alert("Error leyendo el archivo CSV. Asegúrate de que el formato sea correcto.");
        setIsImporting(false);
      },
    });
  };

  return (
    <div className="space-y-4 mt-4">
      {/* Header — stacks on mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight text-primary uppercase">
            INVENTARIO
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Gestiona el catálogo de productos de TCG.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button onClick={openNewProductDialog} size="sm" className="h-10">
            <Plus className="mr-2 h-4 w-4" /> Agregar Producto
          </Button>
        </div>
      </div>

      {/* Table with horizontal scroll on small screens */}
      <div className="border rounded-md bg-card overflow-x-auto">
        <Table className="min-w-[640px]">
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[140px]">Nombre</TableHead>
              <TableHead className="min-w-[110px]">Categoría</TableHead>
              {/* Hidden on small, visible on md+ */}
              <TableHead className="hidden md:table-cell min-w-[120px]">Era / Subcat.</TableHead>
              <TableHead className="hidden sm:table-cell min-w-[80px]">Idioma</TableHead>
              <TableHead className="min-w-[90px]">Precio Min.</TableHead>
              <TableHead className="hidden md:table-cell min-w-[90px]">Precio May.</TableHead>
              <TableHead className="min-w-[110px]">Stock</TableHead>
              <TableHead className="text-right min-w-[130px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No hay productos en el inventario. Haz clic en &quot;Agregar Producto&quot;.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium max-w-[160px]">
                    <span className="block truncate" title={product.name}>
                      {product.name}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="whitespace-nowrap">
                      {product.categoryName}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {product.subCategory ? (
                      <Badge variant="outline">{product.subCategory}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{product.language}</TableCell>
                  <TableCell className="whitespace-nowrap">USD {product.priceUsdMinorista}</TableCell>
                  <TableCell className="hidden md:table-cell whitespace-nowrap">
                    USD {product.priceUsdMayorista}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => handleStockChange(product.id, product.stock, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-7 text-center text-sm font-medium">{product.stock}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => handleStockChange(product.id, product.stock, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1.5 justify-end flex-wrap">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(product)}>
                        Editar
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => confirmDelete(product)}>
                        Eliminar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit / New product dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) setEditingProduct(null);
          setIsDialogOpen(open);
        }}
      >
        <DialogContent className="w-[calc(100%-2rem)] max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-heading uppercase text-primary tracking-wide">
              {editingProduct ? "Editar Producto" : "Nuevo Producto"}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? "Modifica los datos del producto."
                : "Completa los datos para agregar un nuevo producto al catálogo."}
            </DialogDescription>
          </DialogHeader>
          <ProductForm categories={categories} initialData={editingProduct} onSuccess={closeDialog} />
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!productToDelete}
        onOpenChange={(open) => !open && setProductToDelete(null)}
      >
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar Producto</DialogTitle>
            <DialogDescription className="pt-2">
              ¿Estás seguro de que deseas eliminar{" "}
              <strong>{productToDelete?.name}</strong>? Esta acción borrará el producto del
              inventario de forma permanente.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-4 mt-4">
            <Button variant="ghost" onClick={() => setProductToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={executeDelete}>
              Sí, eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
