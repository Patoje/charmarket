"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { approveOrder, cancelOrder } from "@/app/actions/orders";
import { toast } from "sonner";
import { Check, X, Loader2 } from "lucide-react";

export function OrderActions({ orderId }: { orderId: number }) {
  const [isApproving, setIsApproving] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleApprove = async () => {
    setIsApproving(true);
    const res = await approveOrder(orderId);
    if (res.success) {
      toast.success("Orden aprobada y stock descontado correctamente");
    } else {
      toast.error(res.error || "Error al aprobar la orden");
    }
    setIsApproving(false);
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    const res = await cancelOrder(orderId);
    if (res.success) {
      toast.success("Orden denegada correctamente");
    } else {
      toast.error(res.error || "Error al denegar la orden");
    }
    setIsCancelling(false);
  };

  return (
    <div className="flex gap-2">
      {/* Aprobar Dialog */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" className="text-green-500 border-green-500/50 hover:bg-green-500/10">
            {isApproving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
            Aprobar
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Aprobar y descontar stock?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción marcará la orden como Pagada y descontará automáticamente el stock de los productos comprados de tu inventario. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove} className="bg-green-600 hover:bg-green-700 text-white">
              Sí, Aprobar Orden
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Denegar Dialog */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" className="text-destructive border-destructive/50 hover:bg-destructive/10">
            {isCancelling ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <X className="w-4 h-4 mr-2" />}
            Denegar
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Denegar orden?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción cancelará la orden. El stock del inventario no se verá afectado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Sí, Denegar Orden
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
