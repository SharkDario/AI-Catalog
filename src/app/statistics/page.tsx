import { db } from "@/db";
import { softwareItems, classifications } from "@/db/schema";
import { sql } from "drizzle-orm";
import { BarChart2, TrendingUp } from "lucide-react";

export default async function StatisticsPage() {
  const [{ count: totalSoftware }] = await db.select({ count: sql`count(*)`.mapWith(Number) }).from(softwareItems);
  const [{ count: totalClassifications }] = await db.select({ count: sql`count(*)`.mapWith(Number) }).from(classifications);
  
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 text-foreground flex items-center gap-3">
          <BarChart2 className="h-10 w-10 text-primary" /> Estadísticas
        </h1>
        <p className="text-lg text-muted-foreground">Métricas generales de la plataforma y el catálogo de software.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="text-muted-foreground uppercase tracking-wider text-xs font-semibold mb-2">Total Software</div>
          <div className="text-4xl font-bold text-foreground">{totalSoftware}</div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="text-muted-foreground uppercase tracking-wider text-xs font-semibold mb-2">Total Categorías</div>
          <div className="text-4xl font-bold text-teal">{totalClassifications}</div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="text-muted-foreground uppercase tracking-wider text-xs font-semibold mb-2">Métricas de Actividad</div>
          <div className="text-4xl font-bold text-accent">En vivo</div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-8 shadow-sm text-center py-20 mt-8">
        <TrendingUp className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Más estadísticas próximamente</h2>
        <p className="text-muted-foreground">Estamos trabajando para integrar gráficos interactivos con Recharts en futuras versiones para mostrar el crecimiento de usuarios y visitas por categoría.</p>
      </div>
    </div>
  );
}
