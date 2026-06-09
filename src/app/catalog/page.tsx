import { db } from "@/db";
import { softwareItems, classifications } from "@/db/schema";
import { eq, ilike, or } from "drizzle-orm";
import Link from "next/link";
import { SearchFilters } from "@/components/SearchFilters";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const query = typeof params.q === 'string' ? params.q : '';

  let dbQuery = db.select({
    software: softwareItems,
    classification: classifications.name
  })
  .from(softwareItems)
  .leftJoin(classifications, eq(softwareItems.classificationId, classifications.id));

  if (query) {
    dbQuery = dbQuery.where(
      or(
        ilike(softwareItems.name, `%${query}%`),
        ilike(softwareItems.objective, `%${query}%`),
        ilike(softwareItems.author, `%${query}%`)
      )
    );
  }

  const results = await dbQuery;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 text-foreground">Catálogo de Software IA</h1>
        <p className="text-lg text-muted-foreground">Explora herramientas, librerías y aplicaciones basadas en Inteligencia Artificial.</p>
      </div>

      <SearchFilters />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((item) => (
          <Link href={`/catalog/${item.software.id}`} key={item.software.id} className="group flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:shadow-glow transition-all duration-300 transform hover:-translate-y-1">
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{item.software.name}</h3>
                <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-full whitespace-nowrap ml-2">{item.classification}</span>
              </div>
              <p className="text-muted-foreground text-sm flex-1 mb-6">
                {item.software.objective}
              </p>
              <div className="mt-auto pt-4 border-t border-border flex justify-between text-sm text-muted-foreground">
                <span>{item.software.licenseType}</span>
                <span>{item.software.releaseYear}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {results.length === 0 && (
        <div className="text-center py-20 bg-card rounded-xl border border-border mt-6">
          <h3 className="text-2xl font-bold text-muted-foreground mb-2">No se encontraron resultados</h3>
          <p className="text-muted-foreground">Intenta buscar con otros términos o utiliza la búsqueda por voz.</p>
        </div>
      )}
    </div>
  );
}
