"use client";

import { useTransition, useState, useEffect } from "react";
import { saveProduct } from "@/app/actions/products";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadButton } from "@/utils/uploadthing";
import Image from "next/image";

export function ProductForm({ 
  categories, 
  initialData, 
  onSuccess 
}: { 
  categories: any[]; 
  initialData?: any; 
  onSuccess: () => void; 
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [categoryName, setCategoryName] = useState<string>(initialData?.categoryName || "");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(initialData?.subCategory || "");
  const [language, setLanguage] = useState<string>(initialData?.language || "Inglés");
  const [imageUrl, setImageUrl] = useState<string>(initialData?.imageUrl || "");

  // Para extraer el nombre en inglés si ya estaba guardado con paréntesis (ej: Shiny Treasure (Paldean Fates))
  const initName = initialData?.name || "";
  let defaultName = initName;
  let defaultEnglishName = "";
  if (initialData?.language === "Japonés" && initName.endsWith(")")) {
    const match = initName.match(/(.*) \((.*)\)$/);
    if (match) {
      defaultName = match[1].trim();
      defaultEnglishName = match[2].trim();
    }
  }

  const [productName, setProductName] = useState(defaultName);
  const [englishName, setEnglishName] = useState(defaultEnglishName);

  const selectedCategoryId = categories.find(c => c.name === categoryName)?.id || "";

  // Lógica inteligente de idiomas según la categoría elegida
  const availableLanguages = ["Booster Box", "Booster Pack", "Collection Box"].includes(categoryName)
    ? ["Inglés", "Japonés"]
    : categoryName === "Accesorios"
    ? ["Multi-idioma / No aplica"]
    : ["Inglés"];

  useEffect(() => {
    if (categoryName && !availableLanguages.includes(language)) {
      setLanguage(availableLanguages[0] || "Inglés");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryName]);

  useEffect(() => {
    let options: string[] = [];
    if (categoryName === "ETB") {
      options = ["Moderna", "Vintage"];
    } else if (categoryName === "Booster Box" || categoryName === "Booster Pack") {
      options = language === "Japonés" ? ["Común", "Especial"] : ["Moderna", "Vintage"];
    }
    if (selectedSubcategory && !options.includes(selectedSubcategory)) {
      setSelectedSubcategory("");
    }
  }, [categoryName, language]);

  const handleSubmit = (formData: FormData) => {
    let finalName = productName.trim();
    if (language === "Japonés" && englishName.trim() !== "") {
      finalName = `${finalName} (${englishName.trim()})`;
    }

    // Auto-prefijar la categoría para mantener consistencia en la DB
    if (categoryName && finalName) {
      const upperFinal = finalName.toUpperCase();
      const upperCat = categoryName.toUpperCase();
      
      let shouldPrepend = true;
      if (upperFinal.startsWith(upperCat)) {
        shouldPrepend = false;
      } else if (categoryName === "Collection Box" && upperFinal.includes("BOX")) {
        shouldPrepend = false;
      } else if (categoryName === "ETB" && upperFinal.includes("ETB")) {
        shouldPrepend = false;
      } else if (categoryName === "Accesorios") {
        shouldPrepend = false;
      }

      if (shouldPrepend) {
        finalName = `${categoryName} ${finalName}`;
      }
    }

    formData.set("name", finalName);

    startTransition(async () => {
      setError(null);
      const result = await saveProduct(formData);
      if (result.error) {
        setError(result.error);
      } else {
        onSuccess();
      }
    });
  };

  return (
    <form key={initialData?.id || "new"} action={handleSubmit} className="space-y-4">
      {initialData?.id && <input type="hidden" name="productId" value={initialData.id} />}
      <input type="hidden" name="categoryId" value={selectedCategoryId} />
      <input type="hidden" name="language" value={language} />
      {["ETB", "Booster Box", "Booster Pack"].includes(categoryName) && selectedSubcategory && (
        <input type="hidden" name="subCategory" value={selectedSubcategory} />
      )}
      <div className="grid grid-cols-2 gap-4">
        
        <div className="space-y-2 col-span-2">
          <Label>Tipo de Producto</Label>
          <Select required onValueChange={(val) => setCategoryName(val || "")} value={categoryName}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar tipo..." />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.name}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {["ETB", "Booster Box", "Booster Pack"].includes(categoryName) && (() => {
          let options: string[] = [];
          if (categoryName === "ETB") {
            options = ["Moderna", "Vintage"];
          } else { // Booster Box o Booster Pack
            if (language === "Japonés") {
              options = ["Común", "Especial"];
            } else {
              options = ["Moderna", "Vintage"];
            }
          }
          
          return (
            <div className="space-y-2 col-span-2">
              <Label>Era / Subcategoría</Label>
              <Select required onValueChange={(val) => setSelectedSubcategory(val || "")} value={selectedSubcategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona Era..." />
                </SelectTrigger>
                <SelectContent>
                  {options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          );
        })()}

        <div className="space-y-2 col-span-2 md:col-span-1">
          <Label htmlFor="name">Nombre Específico</Label>
          <Input id="name" name="name" required placeholder="Ej: Shiny Treasure..." value={productName} onChange={(e) => setProductName(e.target.value)} />
        </div>

        {language === "Japonés" ? (
          <div className="space-y-2 col-span-2 md:col-span-1">
            <Label htmlFor="englishName">Nombre en Inglés (Opcional)</Label>
            <Input id="englishName" placeholder="Ej: Paldean Fates..." value={englishName} onChange={(e) => setEnglishName(e.target.value)} />
          </div>
        ) : (
          <div className="col-span-2 md:col-span-1 hidden md:block"></div>
        )}
        
        <div className="space-y-2 col-span-2">
          <Label htmlFor="description">Descripción (Opcional)</Label>
          <Textarea id="description" name="description" placeholder="Detalles del producto..." defaultValue={initialData?.description || ""} />
        </div>

        {categoryName !== "Accesorios" && (
          <div className="space-y-2 col-span-2">
            <Label htmlFor="contains">¿Qué contiene la caja? (Opcional)</Label>
            <Textarea 
              id="contains" 
              name="contains" 
              placeholder="Ej: 10 sobres, 1 carta promo..." 
              defaultValue={initialData?.contains || ""} 
              className="min-h-[80px]"
            />
          </div>
        )}

        <div className="space-y-2 col-span-2">
          <Label>Imagen del Producto</Label>
          <div className="flex flex-col sm:flex-row gap-6 items-start p-4 border border-border/50 rounded-xl bg-background/50">
            {/* Si ya hay una imagen, la mostramos */}
            {imageUrl ? (
              <div className="relative group rounded-md overflow-hidden bg-white/5 p-2 flex-shrink-0 border border-border/50 w-32 h-32 flex items-center justify-center">
                <Image src={imageUrl} alt="Preview" width={128} height={128} className="max-w-full max-h-full object-contain" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => setImageUrl("")}
                  >
                    Borrar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="w-32 h-32 flex-shrink-0 flex flex-col items-center justify-center border-2 border-dashed border-border/50 rounded-md text-muted-foreground text-xs text-center p-2">
                Sin Imagen
              </div>
            )}

            {/* Botón de UploadThing */}
            <div className="flex-1 w-full">
              <UploadButton
                endpoint="productImage"
                onClientUploadComplete={(res) => {
                  if (res && res[0]) {
                    // Usamos ufsUrl para evitar el warning de deprecación en la v7+
                    setImageUrl((res[0] as any).ufsUrl || res[0].url);
                  }
                }}
                onUploadError={(error: Error) => {
                  alert(`ERROR! ${error.message}`);
                }}
                appearance={{
                  button: "bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-4 py-2 w-full",
                  container: "w-full flex-col items-start",
                  allowedContent: "text-muted-foreground text-xs mt-1"
                }}
              />
            </div>
            
            {/* Input oculto para que formData lo agarre al enviar */}
            <input type="hidden" name="imageUrl" value={imageUrl} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Idioma</Label>
          <Select required value={language} onValueChange={(val) => setLanguage(val || "")}>
            <SelectTrigger>
              <SelectValue placeholder="Idioma..." />
            </SelectTrigger>
            <SelectContent>
              {availableLanguages.map((lang) => (
                <SelectItem key={lang} value={lang}>{lang}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock">Stock</Label>
          <Input id="stock" name="stock" type="number" defaultValue={initialData?.stock ?? 0} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="priceUsdMinorista">Precio Minorista (USD)</Label>
          <Input id="priceUsdMinorista" name="priceUsdMinorista" type="number" step="0.01" defaultValue={initialData?.priceUsdMinorista} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="priceUsdMayorista">Precio Mayorista (USD)</Label>
          <Input id="priceUsdMayorista" name="priceUsdMayorista" type="number" step="0.01" defaultValue={initialData?.priceUsdMayorista} required />
        </div>

      </div>

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      
      <div className="flex justify-end pt-4 gap-2">
        <Button type="button" variant="outline" onClick={onSuccess}>Cancelar</Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Guardando..." : initialData ? "Actualizar Producto" : "Guardar Producto"}
        </Button>
      </div>
    </form>
  );
}
