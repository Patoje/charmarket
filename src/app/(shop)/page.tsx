import { getProducts, getCategories } from "@/app/actions/products";
import { getDolarValue } from "@/app/actions/config";
import { CatalogClient } from "./CatalogClient";
import Link from "next/link";
import { ArrowRight, ShoppingCart, ArrowDown, MapPin, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const products = await getProducts();
  const categories = await getCategories();
  const dolarValue = await getDolarValue();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-x-hidden">
      {/* Navbar Minimalista */}
      <nav className="fixed w-full top-0 left-0 bg-background/40 backdrop-blur-md supports-[backdrop-filter]:bg-background/40 py-6 px-4 md:px-8 border-b border-border/50 z-50">
        <div className="container mx-auto grid grid-cols-3 items-center">
          <div className="flex justify-start"></div>
          <div className="flex justify-center">
            <Link href="/" className="font-heading font-bold text-2xl tracking-wider text-foreground">
              CHARMARKET
            </Link>
          </div>
          <div className="flex justify-end">
            {/* Botón oculto de Admin */}
            <Link 
              href="/admin" 
              className="p-2 opacity-10 hover:opacity-100 transition-opacity duration-300"
              title="Panel de Administración"
            >
              <Lock className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col pt-[85px]">
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
          <div className="mb-12 mt-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-[1px] w-8 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
              <span className="text-[0.72rem] uppercase tracking-[0.18em] text-primary font-bold">Catálogo Destacado</span>
            </div>
            <h2 className="font-heading text-4xl font-bold">CATÁLOGO</h2>
          </div>
          
          <div id="catalogo" className="mb-12 mt-8 scroll-mt-24">
            <CatalogClient products={products} categories={categories} dolarValue={dolarValue} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 mt-20 bg-background/50">
        <div className="container mx-auto px-4 flex flex-col items-center justify-center gap-6">
          <Link href="/" className="font-heading font-bold text-2xl tracking-wider text-foreground">
            CHARMARKET
          </Link>
          
          <div className="flex flex-col md:flex-row items-center gap-6 text-muted-foreground">
            <a 
              href="https://www.instagram.com/charmarket.ar/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-primary transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
              <span>@charmarket.ar</span>
            </a>
            
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span>Buenos Aires</span>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground/60 mt-4">
            © {new Date().getFullYear()} Charmarket. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
