"use client";

import { useTransition, useRef, useState } from "react";
import { updateDolarValue } from "@/app/actions/config";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function DolarForm({ currentValue }: { currentValue: number }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      setMessage(null);
      const result = await updateDolarValue(formData);
      if (result.error) {
        setMessage({ text: result.error, type: "error" });
      } else {
        setMessage({ text: "Dólar actualizado correctamente", type: "success" });
      }
    });
  };

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="dolarValue">Valor del Dólar Charmarket (ARS)</Label>
        <div className="flex items-center gap-4">
          <Input 
            id="dolarValue" 
            name="dolarValue" 
            type="number" 
            step="0.01" 
            defaultValue={currentValue} 
            className="max-w-[200px]"
            required 
          />
          <Button type="submit" disabled={isPending}>
            {isPending ? "Guardando..." : "Actualizar"}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Este valor se usará para calcular dinámicamente todos los precios en pesos dentro del catálogo.
        </p>
        
        {message && (
          <p className={`text-sm font-medium mt-2 ${message.type === "error" ? "text-red-500" : "text-green-600"}`}>
            {message.text}
          </p>
        )}
      </div>
    </form>
  );
}
