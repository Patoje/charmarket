"use client";

import { useState, useEffect } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { SidebarNav } from "./SidebarNav";

interface AdminSidebarWrapperProps {
  children: React.ReactNode;
  pendingCount: number;
  logoutAction: () => Promise<void>;
}

export function AdminSidebarWrapper({ children, pendingCount, logoutAction }: AdminSidebarWrapperProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile on mount and resize
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768); // md breakpoint
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Close sidebar on route change (clicks on nav links)
  useEffect(() => {
    setIsMobileOpen(false);
  }, []);

  // Close sidebar on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobileOpen, isMobile]);

  return (
    <div className="flex h-screen bg-muted/40 overflow-hidden">
      {/* ── MOBILE OVERLAY ── */}
      {isMobileOpen && isMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/85"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col flex-shrink-0 border-r border-border
          transition-transform duration-300 ease-in-out
          ${isMobile ? "w-64 bg-[#130a03]" : "relative w-64 bg-card z-auto"}
          ${isMobile && isMobileOpen ? "shadow-2xl" : ""}
        `}
        style={{
          transform: (isMobile && !isMobileOpen) ? 'translateX(-100%)' : 'translateX(0)'
        }}
      >
        {/* Sidebar Header */}
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="text-base font-bold text-primary leading-tight">
            Charmarket<br />
            <span className="text-xs font-medium text-muted-foreground tracking-widest uppercase">Admin</span>
          </h2>
          {/* Close button visible on mobile only */}
          {isMobile && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsMobileOpen(false);
              }}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors cursor-pointer relative z-50"
              aria-label="Cerrar menú"
            >
              <X className="w-6 h-6 pointer-events-none" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <SidebarNav
          pendingOrdersCount={pendingCount}
          onNavClick={() => setIsMobileOpen(false)}
        />

        {/* Logout */}
        <div className="p-4 border-t border-border/50 mt-auto">
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 p-3 text-destructive hover:bg-destructive/10 rounded-md transition-colors text-sm font-bold tracking-wide uppercase"
            >
              <LogOut size={16} />
              Cerrar Sesión
            </button>
          </form>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile top bar — only rendered if isMobile is true */}
        {isMobile && (
          <header className="flex items-center px-4 py-3 bg-card border-b border-border sticky top-0 z-30">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 -ml-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Abrir menú"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-bold text-primary font-heading text-lg tracking-wider ml-2">Charmarket Admin</span>
          </header>
        )}

        <main className="flex-1 p-4 md:p-6 overflow-y-auto overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

