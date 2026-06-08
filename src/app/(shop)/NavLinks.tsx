"use client";

import React, { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { id: "catalogo", label: "Catálogo" },
  { id: "envios", label: "Envíos" },
  { id: "faqs", label: "FAQs" },
];

export function NavLinks() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Detect mobile on mount and on resize
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.pushState(null, "", `#${id}`);
    }
    setMobileOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    if (mobileOpen) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [mobileOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className="flex justify-end" ref={menuRef}>
      {/* Desktop links — shown via JS when not mobile */}
      {!isMobile && (
        <div className="flex gap-4 md:gap-7 text-[13px] md:text-[15px] font-heading tracking-widest uppercase font-medium text-foreground">
          {links.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={(e) => handleScroll(e, id)}
              className="hover:text-primary transition-colors cursor-pointer whitespace-nowrap"
            >
              {label}
            </a>
          ))}
        </div>
      )}

      {/* Mobile hamburger — shown via JS when mobile */}
      {isMobile && (
        <div className="relative">
          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="p-2 text-foreground hover:text-primary transition-colors rounded-md"
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {mobileOpen && (
            <div className="absolute top-full right-0 mt-2 w-44 bg-[#0e0803] border border-border/50 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {links.map(({ id, label }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={(e) => handleScroll(e, id)}
                  className="block px-5 py-3.5 text-sm font-heading font-medium tracking-widest uppercase text-foreground hover:text-primary hover:bg-white/5 transition-colors border-b border-border/20 last:border-0"
                >
                  {label}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
