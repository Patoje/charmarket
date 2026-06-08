"use client";

import { ArrowDown } from "lucide-react";

/** Simple CTA button that smooth-scrolls to the catalog — only shown on mobile */
export function ScrollToCatalogButton() {
  return (
    <button
      onClick={() => document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" })}
      className="sm:hidden inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] font-bold text-primary border border-primary/40 rounded-full px-5 py-2.5 hover:bg-primary/10 transition-colors"
      aria-label="Ver catálogo"
    >
      Ver Catálogo <ArrowDown className="w-3.5 h-3.5" />
    </button>
  );
}
