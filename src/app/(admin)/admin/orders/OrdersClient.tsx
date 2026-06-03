"use client";

import { useState } from "react";
import { acceptOrder, rejectOrder } from "@/app/actions/admin-orders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, Clock } from "lucide-react";

export function OrdersClient({ orders }: { orders: any[] }) {
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<{ id: number; type: "accept" | "reject" } | null>(null);

  const pendientes = orders.filter((o) => o.status === "pending");
  const aceptadas = orders.filter((o) => o.status === "accepted");
  const rechazadas = orders.filter((o) => o.status === "rejected");

  const handleAction = async (orderId: number, action: "accept" | "reject") => {
    setDialogAction({ id: orderId, type: action });
    setDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!dialogAction) return;
    const { id, type } = dialogAction;
    
    setLoadingId(id);
    setDialogOpen(false);
    
    try {
      const res = type === "accept" ? await acceptOrder(id) : await rejectOrder(id);
      if (!res.success) {
        alert(res.error);
      }
    } finally {
      setLoadingId(null);
      setDialogAction(null);
    }
  };

  const renderOrderList = (list: any[], showActions: boolean) => {
    if (list.length === 0) {
      return <div className="text-center py-10 text-muted-foreground">No hay órdenes en esta sección.</div>;
    }

    return (
      <div className="space-y-4 mt-4">
        {list.map((order) => (
          <Card key={order.id} className="border-border/50 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/20 flex flex-row items-center justify-between bg-muted/20">
              <div>
                <CardTitle className="font-heading text-lg">Orden {order.orderNumber}</CardTitle>
                <div className="text-sm text-muted-foreground mt-1">
                  {new Date(order.createdAt).toLocaleString("es-AR")}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-primary">USD {order.totalUsd}</div>
                {order.customerName && <div className="text-sm">Cliente: {order.customerName}</div>}
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2 mb-6">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.productName}</span>
                    <span className="text-muted-foreground">USD {item.priceUsdSnapshot} c/u</span>
                  </div>
                ))}
              </div>

              {showActions && (
                <div className="flex gap-4 justify-end pt-4 border-t border-border/20">
                  <Button 
                    variant="outline" 
                    className="border-red-500 text-red-500 hover:bg-red-500/10"
                    onClick={() => handleAction(order.id, "reject")}
                    disabled={loadingId !== null}
                  >
                    <X className="w-4 h-4 mr-2" /> Rechazar
                  </Button>
                  <Button 
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleAction(order.id, "accept")}
                    disabled={loadingId !== null}
                  >
                    <Check className="w-4 h-4 mr-2" /> Aceptar y Descontar Stock
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight">Gestión de Pedidos</h1>
        <p className="text-muted-foreground mt-2">Administra las órdenes que ingresan desde WhatsApp.</p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md bg-muted/50 p-1">
          <TabsTrigger value="pending" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Pendientes <Badge variant="secondary" className="ml-2 bg-yellow-500/20 text-yellow-600 border-none">{pendientes.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="accepted" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Aceptadas <Badge variant="secondary" className="ml-2 bg-green-500/20 text-green-600 border-none">{aceptadas.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Rechazadas <Badge variant="secondary" className="ml-2 bg-red-500/20 text-red-600 border-none">{rechazadas.length}</Badge>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-6">
          {renderOrderList(pendientes, true)}
        </TabsContent>
        <TabsContent value="accepted" className="mt-6">
          {renderOrderList(aceptadas, false)}
        </TabsContent>
        <TabsContent value="rejected" className="mt-6">
          {renderOrderList(rechazadas, false)}
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogAction?.type === "accept" ? "Aceptar Orden" : "Rechazar Orden"}
            </DialogTitle>
            <DialogDescription className="pt-2">
              {dialogAction?.type === "accept" 
                ? "¿Estás seguro de que deseas aceptar esta orden? Esto descontará automáticamente el stock de los productos."
                : "¿Estás seguro de que deseas rechazar esta orden? El stock de los productos no se verá afectado."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end mt-4">
            <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              type="button" 
              variant={dialogAction?.type === "accept" ? "default" : "destructive"} 
              className={dialogAction?.type === "accept" ? "bg-green-600 hover:bg-green-700" : ""}
              onClick={confirmAction}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
