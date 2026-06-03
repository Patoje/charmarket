"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/components/CartContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createCheckoutOrder } from "../actions/orders";

export function CartDrawer({ dolarValue }: { dolarValue: number }) {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeItem, clearCart, totalItems } = useCart();
  const [animate, setAnimate] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (totalItems > 0) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 300);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  const calculateSubtotal = () => {
    return items.reduce((acc, item) => {
      // Regla de oro mayorista: Si lleva 5 o más, cobra precio mayorista
      const price = item.quantity >= 5 ? Number(item.product.priceUsdMayorista) : Number(item.product.priceUsdMinorista);
      return acc + price * item.quantity;
    }, 0);
  };

  const totalUsd = calculateSubtotal();
  const totalArs = totalUsd * dolarValue;

  const handleCheckout = async () => {
    if (!customerName.trim()) {
      alert("Por favor ingresa tu nombre para continuar.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Registrar la orden en la base de datos
      const orderItems = items.map((item) => {
        const isMayorista = item.quantity >= 5;
        const price = isMayorista ? Number(item.product.priceUsdMayorista) : Number(item.product.priceUsdMinorista);
        return {
          productId: item.product.id,
          quantity: item.quantity,
          priceUsdSnapshot: price,
        };
      });

      const res = await createCheckoutOrder(customerName, totalUsd, orderItems);

      if (!res.success) {
        alert(res.error || "Error al procesar el pedido.");
        setIsSubmitting(false);
        return;
      }

      const { orderNumber } = res;

      let message = `*Nuevo Pedido Charmarket* 🛒\n*Orden:* ${orderNumber}\n*Cliente:* ${customerName}\n\n`;
      items.forEach((item) => {
        const isMayorista = item.quantity >= 5;
        const price = isMayorista ? Number(item.product.priceUsdMayorista) : Number(item.product.priceUsdMinorista);
        message += `• ${item.quantity}x ${item.product.name} (USD ${price.toFixed(2)} c/u)\n`;
      });
      
      message += `\n*Total USD:* $${totalUsd.toFixed(2)}`;
      message += `\n*Total ARS:* $${Math.round(totalArs).toLocaleString("es-AR")}`;
      
      const encodedMessage = encodeURIComponent(message);
      window.location.href = `https://wa.me/5493513486735?text=${encodedMessage}`;
      
      clearCart();
      setIsCartOpen(false);
      setCustomerName("");
    } catch (error) {
      console.error(error);
      alert("Hubo un error al crear tu pedido. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetTrigger 
        className={cn(
          "fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-transform",
          animate && "scale-110"
        )}
      >
        <ShoppingCart className="h-6 w-6" />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </SheetTrigger>
      <SheetContent className="flex flex-col w-full sm:max-w-2xl p-6 sm:p-8 bg-card border-l border-border">
        <SheetHeader className="mb-6">
          <SheetTitle className="font-heading text-2xl tracking-wide">Tu Carrito ({totalItems})</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-2 space-y-6 pr-2">
          {items.length === 0 ? (
            <div className="text-center text-muted-foreground mt-20 text-sm tracking-widest uppercase">Tu carrito está vacío</div>
          ) : (
            items.map((item) => {
              const isMayorista = item.quantity >= 5;
              const unitPriceUsd = isMayorista ? Number(item.product.priceUsdMayorista) : Number(item.product.priceUsdMinorista);
              
              return (
                <div key={item.product.id} className="flex justify-between items-center border-b border-border/40 pb-5">
                  <div className="flex-1 pr-4">
                    <h4 className="font-heading font-bold text-base tracking-wide uppercase">{item.product.name}</h4>
                    <p className="text-xs text-muted-foreground mt-2 tracking-wider">
                      USD {unitPriceUsd.toFixed(2)} c/u 
                      {isMayorista && <span className="ml-3 text-primary font-bold">¡Precio Mayorista!</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-background border border-border/50 rounded-full px-1 py-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-primary/20 hover:text-primary" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-primary/20 hover:text-primary" onClick={() => updateQuantity(item.product.id, item.quantity + 1)} disabled={item.quantity >= item.product.stock}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => removeItem(item.product.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border/40 pt-6 space-y-6 mt-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Total USD</p>
                <p className="text-xl font-bold">USD {totalUsd.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Total Pesos (Dólar: ${dolarValue})</p>
                <p className="text-4xl font-heading font-bold text-primary">ARS ${Math.round(totalArs).toLocaleString("es-AR")}</p>
              </div>
            </div>
            
            <div className="pt-2">
              <Input 
                placeholder="Ingresa tu nombre..." 
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="h-12 border-border focus-visible:ring-primary font-bold"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-12 rounded-lg text-xs uppercase tracking-widest font-bold border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30" onClick={clearCart}>
                Vaciar Carrito
              </Button>
              <Button onClick={handleCheckout} disabled={isSubmitting} className="h-12 rounded-lg text-xs uppercase tracking-widest font-bold bg-[#25D366] hover:bg-[#128C7E] text-white border-none">
                {isSubmitting ? "Procesando..." : "WhatsApp"}
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
