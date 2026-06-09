"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Library, Tag, MessageSquare, BarChart2, Mic, Settings, UserCircle } from "lucide-react";
import { UserButton, useUser, SignInButton } from "@clerk/nextjs";

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  if (pathname?.startsWith("/admin")) return null;

  const links = [
    { name: "Inicio", href: "/", icon: Home },
    { name: "Catálogo", href: "/catalog", icon: Library },
    { name: "Clasificaciones", href: "/classifications", icon: Tag },
    { name: "Foro", href: "/forum", icon: MessageSquare },
    { name: "Estadísticas", href: "/statistics", icon: BarChart2 },
    { name: "Accesibilidad", href: "/voice-search", icon: Mic },
    { name: "Configuración", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-border bg-sidebar text-sidebar-foreground flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-400 via-purple-400 to-cyan-400 flex items-center justify-center text-white shadow-sm flex-shrink-0">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 4c0 4.418 3.582 8 8 8-4.418 0-8 3.582-8 8-0-4.418-3.582-8-8-8 4.418 0 8-3.582 8-8Z" />
            <circle cx="7" cy="17" r="1.5" fill="currentColor" stroke="none" />
            <path d="M17 5v4m-2-2h4" />
          </svg>
        </div>
        <div>
          <h1 className="font-bold text-xl leading-none text-foreground tracking-wide">AI Catalog</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mt-1 font-medium">Aprender • Comparar</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" 
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <link.icon className="w-5 h-5" />
              {link.name}
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-sidebar-border">
        {user ? (
          <div className="flex items-center gap-3 px-3 py-2">
            <UserButton afterSignOutUrl="/" />
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-none">{user.firstName || "Usuario"}</span>
              <Link href="/admin" className="text-xs text-muted-foreground hover:text-primary mt-1">
                Panel Admin
              </Link>
            </div>
          </div>
        ) : (
          <Link href="/sign-in" className="flex items-center gap-3 px-3 py-2 w-full rounded-xl text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors">
            <UserCircle className="w-5 h-5" />
            Ingresar
          </Link>
        )}
      </div>
    </aside>
  );
}
