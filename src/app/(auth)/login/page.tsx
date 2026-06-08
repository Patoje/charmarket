"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Lock, User } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      setError(null);
      const result = await login(formData);
      
      if (result.error) {
        setError(result.error);
      } else {
        router.push("/admin");
        router.refresh(); // Para forzar que el middleware reciba la nueva cookie en el layout
      }
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative">
      {/* Botón volver */}
      <Link
        href="/"
        className="absolute top-4 left-4 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver
      </Link>

      <Link href="/" className="font-heading font-bold text-3xl tracking-wider text-primary mb-8 hover:opacity-80 transition-opacity">
        CHARMARKET
      </Link>
      
      <div className="w-full max-w-md bg-card border border-border/50 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Adorno visual */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="font-heading text-2xl font-bold uppercase tracking-wide">Acceso Restringido</h1>
          <p className="text-muted-foreground text-sm mt-2">Inicia sesión para administrar la tienda.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-xs uppercase tracking-widest text-muted-foreground">Usuario</Label>
            <div className="relative flex items-center">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input 
                id="username" 
                name="username" 
                type="text" 
                placeholder="admin" 
                required 
                className="pl-10 bg-background/50"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs uppercase tracking-widest text-muted-foreground">Contraseña</Label>
            <div className="relative flex items-center">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                placeholder="••••••••" 
                required 
                className="pl-10 bg-background/50"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center font-medium">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full font-bold uppercase tracking-widest mt-2" 
            disabled={isPending}
          >
            {isPending ? "Ingresando..." : "Iniciar Sesión"}
          </Button>
        </form>
      </div>
      
      <p className="text-muted-foreground text-xs mt-8 tracking-widest uppercase">
        Solo personal autorizado
      </p>
    </div>
  );
}
