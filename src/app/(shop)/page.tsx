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
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navbar Minimalista */}
      <nav className="flex items-center justify-between py-6 px-8 border-b border-border/50">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-heading font-bold text-2xl tracking-wider text-foreground">
            CHARMARKET
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 container mx-auto px-4 py-20 relative">
        
        <div className="max-w-2xl">
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
            Cartas Pokémon TCG singles, sobres y colecciones especiales. Encontrá las más buscadas del formato y las joyas de cada expansión.
          </p>
        </div>



        {/* Separador */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent mb-20"></div>

        {/* Catálogo Section */}
        <div id="catalogo" className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-[1px] w-8 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
            <span className="text-[0.72rem] uppercase tracking-[0.18em] text-primary font-bold">Catálogo Destacado</span>
          </div>
          <h2 className="font-heading text-4xl font-bold">CATÁLOGO</h2>
        </div>
        
        <CatalogClient products={products} categories={categories} dolarValue={dolarValue} />
      </main>
    </div>
  );
}
