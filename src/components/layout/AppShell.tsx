import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Home, LayoutGrid, Network, MessagesSquare, BarChart3, Mic, Settings, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; icon: typeof Home; exact?: boolean };

const nav: NavItem[] = [
  { to: "/", label: "Home", icon: Home, exact: true },
  { to: "/catalog", label: "Catalog", icon: LayoutGrid },
  { to: "/classifications", label: "Classifications", icon: Network },
  { to: "/forum", label: "Forum", icon: MessagesSquare },
  { to: "/statistics", label: "Statistics", icon: BarChart3 },
  { to: "/voice", label: "Voice Search", icon: Mic },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children?: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen flex w-full bg-background text-foreground">
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-sidebar">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-sidebar-border">
          <div className="h-9 w-9 rounded-lg bg-gradient-hero grid place-items-center shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-semibold text-sidebar-foreground leading-none">AI Catalog</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Learn · Compare</div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((item) => {
            const active = item.exact ? path === item.to : path.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to as any}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground border border-border"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 m-3 rounded-lg border border-border bg-gradient-card">
          <div className="text-xs text-muted-foreground">Signed in as</div>
          <div className="text-sm font-medium mt-0.5">Researcher</div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top nav */}
        <div className="md:hidden flex items-center gap-2 px-4 h-14 border-b border-border bg-sidebar overflow-x-auto">
          <div className="h-7 w-7 rounded-md bg-gradient-hero grid place-items-center shrink-0">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          {nav.map((item) => {
            const active = item.exact ? path === item.to : path.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to as any}
                className={cn(
                  "text-xs whitespace-nowrap px-2.5 py-1.5 rounded-md",
                  active ? "bg-primary/20 text-foreground" : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <main className="flex-1 min-w-0">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}
