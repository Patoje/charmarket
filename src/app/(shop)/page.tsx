import { getProducts, getCategories } from "@/app/actions/products";
import { getDolarValue } from "@/app/actions/config";
import { CatalogClient } from "./CatalogClient";
import Link from "next/link";
import { ArrowRight, ShoppingCart, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const products = await getProducts();
  const categories = await getCategories();
  const dolarValue = await getDolarValue();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-x-hidden">
      {/* Navbar Minimalista */}
      <nav className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-center py-6 px-8 border-b border-border/50 z-50">
        <Link href="/" className="font-heading font-bold text-2xl tracking-wider text-foreground">
          CHARMARKET
        </Link>
      </nav>

      <main className="flex-1 flex flex-col">
        {/* Hero Section Viewport (100vh) */}
        <div className="min-h-[calc(100vh-85px)] flex flex-col relative container mx-auto px-4">
          
          <div className="flex-1 flex items-center relative">
            <div className="max-w-2xl relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                <span className="text-[0.72rem] uppercase tracking-[0.18em] text-primary font-bold">Tu tienda de confianza</span>
              </div>

              <h1 className="font-heading text-6xl md:text-7xl font-bold leading-[1.1] mb-6">
                COLECCIONA.<br/>
                <span className="text-primary">JUEGA.</span><br/>
                EVOLUCIONA.
              </h1>

              <p className="text-muted-foreground text-lg mb-10 max-w-md leading-relaxed">
                Cartas Pokémon TCG, sobres y colecciones especiales. Encontrá las más buscadas del formato y las joyas de cada expansión.
              </p>
            </div>

            {/* Huge Charmander Silhouette / User Image */}
            <div className="absolute top-0 right-0 h-full w-1/2 pointer-events-none z-0 hidden md:flex items-center justify-end pr-10">
              {/* Intentamos cargar charmander.png de la carpeta public. Si no la subiste aún, se verá un ícono roto hasta que lo hagas. */}
              <img 
                src="/charmander.png" 
                alt="Charmander Silhouette"
                className="h-[500px] w-auto object-contain opacity-60 drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Separador al final de la pantalla */}
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent mb-12"></div>
        </div>

        {/* Catálogo Section (Abajo del fold) */}
        <div className="container mx-auto px-4">
          <div id="catalogo" className="mb-12 mt-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-[1px] w-8 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
              <span className="text-[0.72rem] uppercase tracking-[0.18em] text-primary font-bold">Catálogo Destacado</span>
            </div>
            <h2 className="font-heading text-4xl font-bold">CATÁLOGO</h2>
          </div>
          
          <CatalogClient products={products} categories={categories} dolarValue={dolarValue} />
        </div>
      </main>
    </div>
  );
}
