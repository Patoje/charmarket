"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ShoppingCart, Filter, Search, ChevronDown, ChevronUp } from "lucide-react";
import { useCart } from "@/components/CartContext";
import { CartDrawer } from "./CartDrawer";

export function CatalogClient({ products, categories, dolarValue }: { products: any[], categories: any[], dolarValue: number }) {
  const { addItem, items } = useCart();

  // Estados de Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas las categorías");
  const [subCategoryFilter, setSubCategoryFilter] = useState("Todas las subcategorías");
  const [sortBy, setSortBy] = useState("none");
  
  // Filtros Avanzados
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [languageFilter, setLanguageFilter] = useState("Cualquier Idioma");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [priceCurrency, setPriceCurrency] = useState<"USD" | "ARS">("USD");
  const [hideOutOfStock, setHideOutOfStock] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [addedGridFeedback, setAddedGridFeedback] = useState<Record<number, boolean>>({});

  const uniqueLanguages = useMemo(() => Array.from(new Set(products.map(p => p.language))), [products]);

  const availableSubCategories = useMemo(() => {
    if (languageFilter === "Japonés") {
      return ["Común", "Especial"];
    } else if (languageFilter === "Inglés") {
      return ["Moderna", "Vintage"];
    } else if (languageFilter === "Cualquier Idioma") {
      if (categoryFilter === "Todas las categorías" || categoryFilter === "Booster Box" || categoryFilter === "Booster Pack") {
        return ["Moderna", "Vintage", "Común", "Especial"];
      } else if (categoryFilter === "ETB") {
        return ["Moderna", "Vintage"];
      }
    }
    return [];
  }, [categoryFilter, languageFilter]);

  // Mapa de nombres de ordenamiento para asegurar que siempre diga lo correcto
  const sortLabels: Record<string, string> = {
    none: "Por Defecto",
    price_asc: "Precio: Menor a Mayor",
    price_desc: "Precio: Mayor a Menor",
    name_asc: "Nombre: A - Z",
    name_desc: "Nombre: Z - A"
  };

  // Lógica principal de filtrado y ordenamiento
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // 1. Filtro por Búsqueda (Nombre)
    if (searchTerm) {
      result = result.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    // 2. Filtro por Categoría
    if (categoryFilter !== "Todas las categorías") {
      result = result.filter(p => p.categoryName === categoryFilter);
    }

    // 2.5 Filtro por SubCategoría
    if (subCategoryFilter !== "Todas las subcategorías") {
      result = result.filter(p => p.subCategory === subCategoryFilter);
    }

    // 3. Filtro por Idioma (Avanzado)
    if (languageFilter !== "Cualquier Idioma") {
      result = result.filter(p => p.language === languageFilter);
    }

    // 4. Filtro por Precio (Avanzado)
    if (priceMin || priceMax) {
      const min = priceMin ? parseFloat(priceMin) : 0;
      const max = priceMax ? parseFloat(priceMax) : Infinity;

      result = result.filter(p => {
        let targetPrice = Number(p.priceUsdMinorista);
        if (priceCurrency === "ARS") {
          targetPrice = Math.round(targetPrice * dolarValue);
        }
        return targetPrice >= min && targetPrice <= max;
      });
    }

    // 4.5 Filtro Sin Stock
    if (hideOutOfStock) {
      result = result.filter(p => p.stock > 0);
    }

    // 5. Ordenamiento
    if (sortBy !== "none") {
      result.sort((a, b) => {
        switch (sortBy) {
          case "price_asc":
            return Number(a.priceUsdMinorista) - Number(b.priceUsdMinorista);
          case "price_desc":
            return Number(b.priceUsdMinorista) - Number(a.priceUsdMinorista);
          case "name_asc":
            return a.name.localeCompare(b.name);
          case "name_desc":
            return b.name.localeCompare(a.name);
          default:
            return 0;
        }
      });
    }

    // 6. REGLA DE ORO: Sin stock siempre al final (Solo aplica si no los ocultamos)
    result.sort((a, b) => {
      const aHasStock = a.stock > 0;
      const bHasStock = b.stock > 0;
      if (aHasStock && !bHasStock) return -1;
      if (!aHasStock && bHasStock) return 1;
      return 0; // Si ambos tienen o no tienen stock, mantienen el orden previo
    });

    return result;
  }, [products, searchTerm, categoryFilter, subCategoryFilter, languageFilter, priceMin, priceMax, priceCurrency, sortBy, dolarValue, hideOutOfStock]);


  // Función simple para generar un emoji representativo si no hay imagen
  const getProductEmoji = (name: string, category: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("pikachu") || lowerName.includes("rayo")) return "⚡";
    if (lowerName.includes("charizard") || lowerName.includes("fuego")) return "🐉";
    if (lowerName.includes("umbreon") || lowerName.includes("luna")) return "🌙";
    if (lowerName.includes("agua") || lowerName.includes("greninja")) return "🌊";
    if (lowerName.includes("sceptile") || lowerName.includes("planta")) return "🌿";
    if (category.includes("Booster") || category.includes("Sobre")) return "💎";
    if (category.includes("ETB")) return "📦";
    return "🃏";
  };

  // Mapa de imágenes provisionales para categorías
  const categoryImages: Record<string, string> = {
    "Booster Box": "https://m.media-amazon.com/images/I/81tXgqfV+NL._AC_SL1500_.jpg",
    "Collection Box": "https://m.media-amazon.com/images/I/81R4-5XQhWL._AC_SL1500_.jpg",
    "Booster Bundle": "https://m.media-amazon.com/images/I/71y+W08v81L._AC_SL1500_.jpg",
    "Booster Pack": "https://m.media-amazon.com/images/I/71wYV3Mv9hL._AC_SL1500_.jpg",
    "Accesorios": "https://m.media-amazon.com/images/I/71y2X0bL7LL._AC_SL1500_.jpg",
    "ETB": "https://m.media-amazon.com/images/I/81Pj6E0W8aL._AC_SL1500_.jpg"
  };
  const defaultImage = "https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?q=80&w=800&auto=format&fit=crop";

  return (
    <div className="pb-24">
      {/* GRILLA DE CATEGORIAS */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10 mt-4">
        {categories.map((cat: any) => (
          <div 
            key={cat.id}
            onClick={() => {
              setCategoryFilter(cat.name);
              setSubCategoryFilter("Todas las subcategorías");
              document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="group relative h-32 md:h-48 border border-border/50 bg-[#1a0c05] overflow-hidden cursor-pointer flex items-center justify-center rounded-sm transition-all duration-300 hover:border-primary/80 shadow-md"
          >
            <div className="absolute inset-0 bg-black/60 z-10 transition-colors duration-300 group-hover:bg-black/40"></div>
            <img 
              src={categoryImages[cat.name] || defaultImage} 
              alt={cat.name}
              className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105 group-hover:opacity-40"
            />
            <span className="relative z-20 font-heading font-bold text-sm md:text-xl uppercase tracking-widest text-white/90 drop-shadow-md group-hover:text-primary transition-colors">
              {cat.name}
            </span>
          </div>
        ))}
      </div>

      {/* BARRA DE FILTROS */}
      <div className="bg-card border border-border/50 rounded-xl p-6 mb-8 shadow-sm">
        
        {/* Filtros Principales */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
          
          <div className="relative flex-1 w-full flex items-center">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input 
              placeholder="Buscar carta o producto..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background/50 border-border w-full"
            />
          </div>

          <Select value={categoryFilter} onValueChange={(val) => {
            setCategoryFilter(val || "");
            setSubCategoryFilter("Todas las subcategorías");
          }}>
            <SelectTrigger className="w-full md:w-[240px] bg-background/50 border-border">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todas las categorías">Todas las categorías</SelectItem>
              {categories.map((cat: any) => (
                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>



          <Select value={sortBy} onValueChange={(val) => setSortBy(val || "")}>
            <SelectTrigger className="w-full md:w-[240px] bg-background/50 border-border">
              <SelectValue>{sortLabels[sortBy]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(sortLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Botones adicionales */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <Button 
            variant="ghost" 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors p-0 h-auto"
          >
            <Filter className="mr-2 h-3 w-3" />
            Filtros Avanzados
            {showAdvanced ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
          </Button>

          {(priceMin || priceMax || languageFilter !== "Cualquier Idioma" || categoryFilter !== "Todas las categorías" || subCategoryFilter !== "Todas las subcategorías" || hideOutOfStock || searchTerm !== "") && (
            <Button 
              variant="ghost" 
              onClick={() => {
                setSearchTerm("");
                setCategoryFilter("Todas las categorías");
                setPriceMin("");
                setPriceMax("");
                setLanguageFilter("Cualquier Idioma");
                setSubCategoryFilter("Todas las subcategorías");
                setHideOutOfStock(false);
              }}
              className="text-xs uppercase tracking-widest text-destructive hover:text-destructive/80 transition-colors p-0 h-auto"
            >
              Limpiar Todos los Filtros
            </Button>
          )}
        </div>

        {/* Filtros Avanzados Colapsables */}
        {showAdvanced && (
          <div className="mt-6 pt-6 border-t border-border/50 grid grid-cols-1 md:grid-cols-5 gap-6 animate-in slide-in-from-top-2 fade-in duration-200">
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Idioma</Label>
              <Select value={languageFilter} onValueChange={(val) => setLanguageFilter(val || "")}>
                <SelectTrigger className="w-full bg-background/50 border-border">
                  <SelectValue placeholder="Cualquier Idioma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cualquier Idioma">Cualquier Idioma</SelectItem>
                  {uniqueLanguages.map(lang => (
                    <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Era / Subcategoría</Label>
              <Select 
                value={subCategoryFilter} 
                onValueChange={(val) => setSubCategoryFilter(val || "")}
                disabled={availableSubCategories.length === 0}
              >
                <SelectTrigger className="w-full bg-background/50 border-border">
                  <SelectValue placeholder={availableSubCategories.length === 0 ? "-" : "Cualquiera"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todas las subcategorías">Todas las subcategorías</SelectItem>
                  {availableSubCategories.map(sub => (
                    <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex flex-col justify-center">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Disponibilidad</Label>
              <div className="flex items-center gap-3 cursor-pointer w-fit group" onClick={() => setHideOutOfStock(!hideOutOfStock)}>
                <button 
                  type="button"
                  role="switch"
                  aria-checked={hideOutOfStock}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${hideOutOfStock ? 'bg-primary' : 'bg-muted border-border/50'}`}
                >
                  <span className="sr-only">Ocultar Agotados</span>
                  <span
                    aria-hidden="true"
                    className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                    style={{ transform: hideOutOfStock ? "translateX(20px)" : "translateX(0px)" }}
                  />
                </button>
                <span className={`text-sm font-medium transition-colors ${hideOutOfStock ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>
                  Ocultar Agotados
                </span>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Rango de Precio</Label>
              <div className="flex flex-wrap items-center gap-2">
                <Select value={priceCurrency} onValueChange={(val: any) => {
                  setPriceCurrency(val);
                  setPriceMin("");
                  setPriceMax("");
                }}>
                  <SelectTrigger className="w-[100px] bg-background/50 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="ARS">ARS</SelectItem>
                  </SelectContent>
                </Select>

                <Input 
                  type="number" 
                  placeholder="Mínimo" 
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="w-24 bg-background/50 border-border"
                />
                <span className="text-muted-foreground">-</span>
                <Input 
                  type="number" 
                  placeholder="Máximo" 
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="w-24 bg-background/50 border-border"
                />
              </div>
            </div>

          </div>
        )}
      </div>

      {/* GRILLA DE RESULTADOS */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[0.7rem] uppercase tracking-widest text-muted-foreground">
          Mostrando {filteredAndSortedProducts.length} productos
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredAndSortedProducts.map((product) => {
          const cartItem = items.find(i => i.product.id === product.id);
          const currentQtyInCart = cartItem?.quantity || 0;
          const availableToAdd = product.stock - currentQtyInCart;

          const arsPrice = Math.round(product.priceUsdMinorista * dolarValue);
          const isOutOfStock = product.stock <= 0;

          return (
            <div 
              key={product.id} 
              className={`group flex flex-col bg-card border border-border rounded-xl overflow-hidden transition-all duration-300 shadow-sm ${
                isOutOfStock ? "opacity-60 grayscale hover:grayscale-0" : "hover:-translate-y-1 hover:border-primary/60"
              }`}
            >
              {/* Imagen / Emoji Section */}
              <div 
                className="relative h-56 w-full flex items-center justify-center p-4 bg-[#2e1208] rounded-t-xl cursor-pointer"
                onClick={() => setSelectedProduct(product)}
              >
                <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                  {isOutOfStock ? (
                    <span className="bg-muted text-muted-foreground border border-border/50 text-[10px] font-bold px-2 py-0.5 rounded tracking-widest uppercase">
                      Agotado
                    </span>
                  ) : (
                    <>
                      {product.stock < 5 && product.stock > 0 && (
                        <span className="bg-destructive/80 text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-widest uppercase">
                          Últimos
                        </span>
                      )}
                    </>
                  )}
                </div>
                
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.name}
                    className="w-full h-full max-h-[160px] object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <span className="text-7xl drop-shadow-2xl group-hover:scale-110 transition-transform duration-300">
                    {getProductEmoji(product.name, product.categoryName)}
                  </span>
                )}
              </div>

              {/* Contenido */}
              <div className="p-5 flex-1 flex flex-col border-t border-border/50">
                <h3 className="font-heading font-bold text-lg tracking-wide mb-1 uppercase line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-muted-foreground text-xs mb-4 uppercase tracking-wider line-clamp-1">
                  {product.categoryName} {product.subCategory ? `(${product.subCategory})` : ""} • {product.language}
                </p>

                <div className="mt-auto flex items-end justify-between">
                  <div className={isOutOfStock ? "opacity-50" : ""}>
                    <p className="text-xl font-bold text-primary">USD {Number(product.priceUsdMinorista).toFixed(2)}</p>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider mt-0.5 font-medium">ARS ${arsPrice.toLocaleString("es-AR")}</p>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className={`text-xs tracking-widest uppercase rounded-md h-10 px-4 transition-all duration-300 active:scale-95 ${
                      isOutOfStock 
                        ? "bg-muted/50 border-border text-muted-foreground cursor-not-allowed" 
                        : addedGridFeedback[product.id]
                        ? "bg-green-600 border-green-600 text-white hover:bg-green-700 hover:border-green-700"
                        : "bg-transparent border-primary/30 text-foreground hover:bg-transparent hover:border-primary hover:text-primary"
                    }`}
                    disabled={availableToAdd <= 0}
                    onClick={() => {
                      addItem(product);
                      setAddedGridFeedback(prev => ({ ...prev, [product.id]: true }));
                      setTimeout(() => {
                        setAddedGridFeedback(prev => ({ ...prev, [product.id]: false }));
                      }, 1500);
                    }}
                  >
                    {addedGridFeedback[product.id] ? "¡Añadido!" : isOutOfStock ? "Sin Stock" : availableToAdd <= 0 ? "Límite" : "+ Agregar"}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
        {filteredAndSortedProducts.length === 0 && (
          <div className="col-span-full text-center py-20 text-muted-foreground border border-dashed border-border/50 rounded-xl bg-card/30">
            <Search className="h-10 w-10 mx-auto mb-4 opacity-20" />
            <p className="font-heading text-xl uppercase tracking-wide">No hay resultados</p>
            <p className="text-sm mt-2">Intenta ajustar los filtros o el término de búsqueda.</p>
          </div>
        )}
      </div>

      {/* Modal de Detalle de Producto */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="max-w-3xl bg-background border-border/50 shadow-2xl p-0 overflow-hidden sm:max-w-4xl">
          {selectedProduct && (
            <div className="flex flex-col md:flex-row h-full max-h-[85vh]">
              {/* Lado izquierdo: Imagen grande */}
              <div className="md:w-1/2 bg-black flex items-center justify-center p-8 md:p-12 border-b md:border-b-0 md:border-r border-border/50 min-h-[300px]">
                {selectedProduct.imageUrl ? (
                  <img 
                    src={selectedProduct.imageUrl} 
                    alt={selectedProduct.name}
                    className="w-full h-full max-h-[500px] object-contain drop-shadow-2xl"
                  />
                ) : (
                  <span className="text-9xl drop-shadow-2xl">
                    {getProductEmoji(selectedProduct.name, selectedProduct.categoryName)}
                  </span>
                )}
              </div>
              
              {/* Lado derecho: Detalles e Info */}
              <div className="md:w-1/2 p-6 md:p-8 flex flex-col relative bg-background">
                <DialogHeader className="mb-4 text-left">
                  <div className="flex gap-2 mb-3 flex-wrap">
                    <Badge variant="secondary" className="w-fit text-xs uppercase tracking-widest">{selectedProduct.categoryName}</Badge>
                    {selectedProduct.subCategory && (
                      <Badge variant="outline" className="w-fit text-xs uppercase tracking-widest">
                        {selectedProduct.subCategory}
                      </Badge>
                    )}
                  </div>
                  <DialogTitle className="font-heading font-bold text-3xl uppercase tracking-wide leading-tight mb-2">
                    {selectedProduct.name}
                  </DialogTitle>
                  <DialogDescription className="uppercase tracking-widest text-xs font-medium text-muted-foreground">
                    Idioma: {selectedProduct.language}
                  </DialogDescription>
                </DialogHeader>

                {selectedProduct.description && selectedProduct.description.trim() !== "" && selectedProduct.description !== "No hay detalles adicionales para este producto." && (
                  <div className="flex-1 overflow-y-auto mb-6 pr-2">
                    <h4 className="text-xs uppercase tracking-widest text-primary mb-2 font-bold">Descripción</h4>
                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                      {selectedProduct.description}
                    </p>
                  </div>
                )}

                <div className="mt-auto border-t border-border/50 pt-6">
                  <div className="flex justify-between items-end mb-6">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Precio</p>
                      <p className="text-4xl font-bold text-primary">USD {Number(selectedProduct.priceUsdMinorista).toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground uppercase tracking-widest mt-1">ARS ${(selectedProduct.priceUsdMinorista * dolarValue).toLocaleString("es-AR")}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Disponibles</p>
                      <p className={`text-2xl font-bold ${selectedProduct.stock > 0 ? "text-foreground" : "text-destructive"}`}>
                        {selectedProduct.stock > 0 ? selectedProduct.stock : "Agotado"}
                      </p>
                    </div>
                  </div>

                  <Button 
                    className={`w-full h-14 uppercase tracking-widest font-bold text-sm active:scale-95 transition-all duration-300 ${addedFeedback ? "bg-green-600 hover:bg-green-700 text-white" : ""}`} 
                    disabled={selectedProduct.stock - (items.find((i: any) => i.product.id === selectedProduct.id)?.quantity || 0) <= 0}
                    onClick={() => {
                      addItem(selectedProduct);
                      setAddedFeedback(true);
                      setTimeout(() => setAddedFeedback(false), 1500);
                    }}
                  >
                    {addedFeedback ? "¡Añadido al Carrito!" : selectedProduct.stock <= 0 ? "Agotado" : "Añadir al Carrito"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <CartDrawer dolarValue={dolarValue} />
    </div>
  );
}
