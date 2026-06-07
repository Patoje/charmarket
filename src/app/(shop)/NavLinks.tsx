"use client";

import React from "react";

export function NavLinks() {
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      // Ajustamos un poco la posición para considerar el navbar fixed si es necesario
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      // Actualizamos la URL sin recargar
      window.history.pushState(null, "", `#${id}`);
    }
  };

  return (
    <div className="flex justify-end gap-3 md:gap-6 text-xs md:text-sm font-heading tracking-widest uppercase font-medium text-foreground">
      <a 
        href="#catalogo" 
        onClick={(e) => handleScroll(e, "catalogo")} 
        className="hover:text-primary transition-colors cursor-pointer"
      >
        Catálogo
      </a>
      <a 
        href="#envios" 
        onClick={(e) => handleScroll(e, "envios")} 
        className="hover:text-primary transition-colors cursor-pointer"
      >
        Envíos
      </a>
      <a 
        href="#faqs" 
        onClick={(e) => handleScroll(e, "faqs")} 
        className="hover:text-primary transition-colors cursor-pointer"
      >
        FAQs
      </a>
    </div>
  );
}
