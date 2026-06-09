import { db } from "@/db";
import { classifications, classificationRatings } from "@/db/schema";
import { Star, ArrowRight } from "lucide-react";
import { avg } from "drizzle-orm";
import Link from "next/link";

export default async function ClassificationsPage() {
  const data = await db.select().from(classifications).orderBy(classifications.name);

  const ratingsData = await db.select({
    classificationId: classificationRatings.classificationId,
    avgScore: avg(classificationRatings.score)
  }).from(classificationRatings).groupBy(classificationRatings.classificationId);

  const ratingsMap = ratingsData.reduce((acc, r) => {
    acc[r.classificationId] = Number(r.avgScore).toFixed(1);
    return acc;
  }, {} as Record<number, string>);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">Clasificaciones de Sistemas Inteligentes</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Descubre los diferentes tipos y categorías en las que se divide la Inteligencia Artificial según su propósito y funcionamiento.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {data.map((item) => {
          const avgScore = ratingsMap[item.id] || "Sin calificar";
          
          return (
            <Link href={`/classifications/${item.id}`} key={item.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-glow transition-all hover:-translate-y-1 group flex flex-col">
              {item.imageUrl ? (
                <div className="w-full h-48 bg-muted relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <h2 className="text-2xl font-bold text-white">{item.name}</h2>
                  </div>
                </div>
              ) : (
                <div className="w-full h-48 bg-primary/10 flex items-center justify-center p-8 relative">
                   <div className="text-6xl font-black text-primary/20 opacity-50">{item.name.substring(0,2).toUpperCase()}</div>
                   <h2 className="absolute bottom-4 left-4 text-2xl font-bold text-primary">{item.name}</h2>
                </div>
              )}
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center text-yellow-500 font-medium mb-4 text-sm">
                  <Star className="h-4 w-4 mr-1 fill-current" />
                  {avgScore}
                </div>
                
                <p className="text-muted-foreground text-sm mb-6 line-clamp-3">
                  {item.description}
                </p>
                
                <div className="mt-auto flex items-center text-primary font-bold text-sm uppercase tracking-wider group-hover:text-teal transition-colors">
                  Ver Detalles <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          );
        })}

        {data.length === 0 && (
          <div className="col-span-full text-center py-20 bg-card rounded-xl border border-border">
            <h3 className="text-2xl font-bold text-muted-foreground">Aún no hay clasificaciones agregadas.</h3>
          </div>
        )}
      </div>
    </div>
  );
}
