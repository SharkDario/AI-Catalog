import { checkIsAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Library, Tag } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="w-64 border-r border-border bg-card">
        <div className="p-6">
          <h2 className="text-xl font-bold tracking-tight">AI Catalog Admin</h2>
        </div>
        <nav className="space-y-1 px-4">
          <Link href="/admin" className="flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link href="/admin/classifications" className="flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground">
            <Tag className="h-4 w-4" />
            Clasificaciones
          </Link>
          <Link href="/admin/catalog" className="flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground">
            <Library className="h-4 w-4" />
            Catálogo de Software
          </Link>
          <Link href="/" className="mt-8 flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground border-t border-border pt-4">
             Volver a la App
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
