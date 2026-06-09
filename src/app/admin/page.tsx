import { db } from "@/db";
import { classifications, softwareItems } from "@/db/schema";
import { sql } from "drizzle-orm";

export default async function AdminDashboard() {
  const [{ count: totalClassifications }] = await db.select({ count: sql`count(*)`.mapWith(Number) }).from(classifications);
  const [{ count: totalSoftware }] = await db.select({ count: sql`count(*)`.mapWith(Number) }).from(softwareItems);
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-foreground">Dashboard General</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-lg bg-card border border-border shadow-glow">
          <h3 className="text-sm font-medium text-muted-foreground">Total Clasificaciones</h3>
          <p className="text-4xl font-bold mt-2 text-primary">{totalClassifications}</p>
        </div>
        <div className="p-6 rounded-lg bg-card border border-border shadow-glow">
          <h3 className="text-sm font-medium text-muted-foreground">Total Software en Catálogo</h3>
          <p className="text-4xl font-bold mt-2 text-primary">{totalSoftware}</p>
        </div>
      </div>
    </div>
  );
}
