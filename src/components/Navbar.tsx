"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { Database, Search, MessageSquare, Home, Sparkles } from "lucide-react";

export function Navbar() {
  const { user } = useUser();
  const pathname = usePathname();

  // Ocultar Navbar en rutas de administrador para no chocar con el sidebar
  if (pathname?.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
          <Sparkles className="h-5 w-5" />
          <span>AI Catalog</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className={`transition-colors hover:text-primary ${pathname === '/' ? 'text-primary' : 'text-muted-foreground'}`}>
            Inicio
          </Link>
          <Link href="/catalog" className={`transition-colors hover:text-primary ${pathname?.startsWith('/catalog') ? 'text-primary' : 'text-muted-foreground'}`}>
            Catálogo
          </Link>
          <Link href="/classifications" className={`transition-colors hover:text-primary ${pathname?.startsWith('/classifications') ? 'text-primary' : 'text-muted-foreground'}`}>
            Clasificaciones
          </Link>
          <Link href="/forum" className={`transition-colors hover:text-primary ${pathname?.startsWith('/forum') ? 'text-primary' : 'text-muted-foreground'}`}>
            Foro
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {!user ? (
            <Link href="/sign-in" className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity">
              Ingresar
            </Link>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-sm font-medium text-muted-foreground hover:text-primary hidden sm:block">
                Admin
              </Link>
              <UserButton />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
