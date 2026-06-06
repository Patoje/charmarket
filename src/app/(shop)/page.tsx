import { getProducts, getCategories } from "@/app/actions/products";
import { getDolarValue } from "@/app/actions/config";
import { CatalogClient } from "./CatalogClient";
import Link from "next/link";
import { ArrowRight, ShoppingCart, ArrowDown, MapPin, Lock, Truck, Mail, Package, ShieldCheck, CreditCard, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FaqAccordion } from "@/components/FaqAccordion";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const products = await getProducts();
  const categories = await getCategories();
  const dolarValue = await getDolarValue();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-x-hidden">
      {/* Navbar Minimalista */}
      <nav className="fixed w-full top-0 left-0 bg-black/80 backdrop-blur-3xl supports-[backdrop-filter]:bg-black/60 py-6 px-4 md:px-8 border-b border-border/50 z-50">
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
          
          <div id="catalogo" className="mb-12 mt-8 scroll-mt-20">
            <CatalogClient products={products} categories={categories} dolarValue={dolarValue} />
          </div>
        </div>

        {/* --- SECCIÓN INSTITUCIONAL --- */}
        <div className="container mx-auto px-4 py-20 border-t border-border/30">
          
          {/* SOBRE NOSOTROS */}
          <div className="flex flex-col md:flex-row gap-12 items-center mb-24">
            <div className="w-full md:w-1/2">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-[1px] w-8 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                <span className="text-[0.72rem] uppercase tracking-[0.18em] text-primary font-bold">¿Qué es Charmarket?</span>
              </div>
              <h2 className="font-heading text-4xl md:text-5xl font-bold leading-tight mb-6 uppercase">
                Tu lugar en el universo <span className="text-primary">Pokémon</span>
              </h2>
              <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
                <p>
                  Somos una tienda nacida de la <strong>pasión por el mundo Pokémon TCG</strong>. 
                </p>
                <p>
                  Acá vas a encontrar cartas, sobres, productos 100% originales y una comunidad que comparte tu mismo entusiasmo. 
                  Charmarket no es solo una tienda de Pokémon, <strong>¡es una experiencia!</strong>
                </p>
              </div>
            </div>
            
            <div className="w-full md:w-1/2 grid grid-cols-2 gap-4">
              <div className="bg-card/50 border border-border/50 p-6 rounded-2xl flex flex-col items-center text-center gap-4">
                <ShieldCheck className="w-10 h-10 text-primary" />
                <h3 className="font-heading font-bold text-lg">100% Originales</h3>
                <p className="text-sm text-muted-foreground">Todos nuestros productos son sellados y auténticos.</p>
              </div>
              <div className="bg-card/50 border border-border/50 p-6 rounded-2xl flex flex-col items-center text-center gap-4">
                <Package className="w-10 h-10 text-primary" />
                <h3 className="font-heading font-bold text-lg">Atención Personalizada</h3>
                <p className="text-sm text-muted-foreground">Te asesoramos para que encuentres lo que buscás.</p>
              </div>
            </div>
          </div>

          {/* CÓMO SON LOS ENVÍOS */}
          <div className="mb-24">
            <div className="flex flex-col items-center text-center mb-12">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-[1px] w-8 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                <span className="text-[0.72rem] uppercase tracking-[0.18em] text-primary font-bold">Logística</span>
                <div className="h-[1px] w-8 bg-gradient-to-r from-primary/50 via-transparent to-transparent"></div>
              </div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold uppercase">¿Cómo son los envíos?</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-[#0a0a0a] border border-border/50 p-8 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <MapPin className="w-24 h-24 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-xl mb-4 relative z-10 flex items-center gap-3">
                  <span className="bg-primary/20 text-primary p-2 rounded-lg"><MapPin className="w-5 h-5" /></span>
                  Punto de Retiro
                </h3>
                <p className="text-muted-foreground relative z-10 mb-4">
                  Podés retirar tu pedido por nuestro depósito ubicado en Vicente López.
                </p>
                <div className="text-sm font-medium space-y-2 relative z-10 border-t border-border/50 pt-4 mt-auto">
                  <p>📍 Esmeralda 4390, Vicente López</p>
                  <p>🕒 Lunes a Viernes de 12:00 a 17:00 hs.</p>
                </div>
              </div>

              <div className="bg-[#0a0a0a] border border-border/50 p-8 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Truck className="w-24 h-24 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-xl mb-4 relative z-10 flex items-center gap-3">
                  <span className="bg-primary/20 text-primary p-2 rounded-lg"><Truck className="w-5 h-5" /></span>
                  Envíos AMBA
                </h3>
                <p className="text-muted-foreground relative z-10 mb-4">
                  Envíos rápidos dentro de CABA y GBA mediante mensajería por <strong>moto</strong>.
                </p>
                <div className="text-sm font-medium space-y-2 relative z-10 border-t border-border/50 pt-4 mt-auto">
                  <p>💬 Envianos tu dirección exacta</p>
                  <p>💰 Te cotizamos el envío en el momento.</p>
                </div>
              </div>

              <div className="bg-[#0a0a0a] border border-border/50 p-8 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Package className="w-24 h-24 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-xl mb-4 relative z-10 flex items-center gap-3">
                  <span className="bg-primary/20 text-primary p-2 rounded-lg"><Package className="w-5 h-5" /></span>
                  Interior del País
                </h3>
                <p className="text-muted-foreground relative z-10 mb-4">
                  Realizamos envíos a todo el país mediante <strong>Andreani</strong> o <strong>Correo Argentino</strong>.
                </p>
                <div className="text-sm font-medium space-y-2 relative z-10 border-t border-border/50 pt-4 mt-auto">
                  <p>🛡️ El método más seguro para mercadería.</p>
                  <p>📦 Ideal para clientes del interior.</p>
                </div>
              </div>

            </div>
          </div>

          {/* PREGUNTAS FRECUENTES (Acordeón) */}
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col items-center text-center mb-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-[1px] w-8 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                <span className="text-[0.72rem] uppercase tracking-[0.18em] text-primary font-bold">Dudas</span>
                <div className="h-[1px] w-8 bg-gradient-to-r from-primary/50 via-transparent to-transparent"></div>
              </div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold uppercase">Preguntas Frecuentes</h2>
            </div>
            
            <FaqAccordion 
              items={[
                {
                  question: "¿En qué moneda son los precios?",
                  answer: "El valor de la mercadería siempre será expresado en dólares."
                },
                {
                  question: "¿Si pago en pesos me cobran más caro?",
                  answer: "No, en absoluto. El precio final es exactamente igual para TODOS los clientes, sin importar si abonás en pesos o en dólares."
                },
                {
                  question: "¿Cuáles son los medios de pago?",
                  answer: (
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Transferencia o Depósito bancario.</li>
                      <li>Criptomonedas (USDT, BTC, ETH).</li>
                      <li>Efectivo (Pesos o Dólares).</li>
                    </ul>
                  )
                },
                {
                  question: "¿Cuánto demoran los pedidos?",
                  answer: "Como gestionamos los pedidos de manera personalizada vía WhatsApp, solemos demorar entre 24 y 48hs hábiles en despachar."
                },
                {
                  question: "¿Cómo me entero de lo que hay en stock?",
                  answer: "Tenemos un grupo exclusivo de WhatsApp donde vamos comentando todo lo que ingresa cada semana. La lista de precios completa la compartimos de forma exclusiva con nuestros clientes."
                },
                {
                  question: "¿Hay descuentos por cantidad?",
                  answer: "¡Sí! Hacemos descuentos especiales a partir de la compra de cierta cantidad de productos. Consultanos al armar tu pedido."
                }
              ]}
            />
          </div>

        </div>
      </main>

      {/* Footer Minimalista */}
      <footer className="border-t border-border/50 py-12 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-center text-center md:text-left">
            
            {/* Brand */}
            <div>
              <Link href="/" className="font-heading font-bold text-3xl tracking-wider text-foreground block mb-2">
                CHARMARKET
              </Link>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto md:mx-0">
                Tu proveedor de Pokémon TCG de confianza. Cartas, coleccionables y pasión por la saga.
              </p>
            </div>

            {/* Redes */}
            <div className="flex flex-col items-center md:items-start gap-4">
              <h4 className="font-heading font-bold uppercase tracking-widest text-sm text-foreground">Seguinos</h4>
              <a href="https://www.instagram.com/charmarket.ar/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
                <span>@charmarket.ar</span>
              </a>
              <a href="mailto:info.charmarket@gmail.com" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-5 h-5" />
                <span>info.charmarket@gmail.com</span>
              </a>
            </div>

            {/* Ubicacion */}
            <div className="flex flex-col items-center md:items-end gap-4 text-right">
              <h4 className="font-heading font-bold uppercase tracking-widest text-sm text-foreground text-center md:text-right w-full">Ubicación</h4>
              <div className="flex items-center justify-center md:justify-end gap-3 text-muted-foreground">
                <MapPin className="w-5 h-5 shrink-0" />
                <span className="text-sm">Adolfo Alsina 4327, Vicente López,<br/>Buenos Aires, Argentina</span>
              </div>
            </div>

          </div>
          
          <div className="mt-12 pt-6 border-t border-border/50 text-center flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground/60 uppercase tracking-widest font-medium">
              © {new Date().getFullYear()} Charmarket. Todos los derechos reservados.
            </p>
            {/* Oculto: Acceso al admin */}
            <Link href="/admin" className="p-2 opacity-0 hover:opacity-100 transition-opacity duration-300" title="Admin">
              <Lock className="w-4 h-4 text-muted-foreground" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
