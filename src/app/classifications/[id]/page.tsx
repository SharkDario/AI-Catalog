import { db } from "@/db";
import { classifications, classificationExamples, classificationRatings, softwareItems } from "@/db/schema";
import { eq, avg } from "drizzle-orm";
import { notFound } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Star, Box, Server } from "lucide-react";
import { StarRating } from "@/components/StarRating";
import { ExampleModal } from "@/components/ExampleModal";
import { CatalogAssistant } from "@/components/CatalogAssistant";

export default async function ClassificationDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const classificationId = parseInt(resolvedParams.id, 10);

  if (isNaN(classificationId)) {
    notFound();
  }

  const [classification] = await db.select().from(classifications).where(eq(classifications.id, classificationId));
  
  if (!classification) {
    notFound();
  }

  const examples = await db.select().from(classificationExamples).where(eq(classificationExamples.classificationId, classificationId));
  const relatedSoftware = await db.select().from(softwareItems).where(eq(softwareItems.classificationId, classificationId));

  const [ratingData] = await db.select({
    avgScore: avg(classificationRatings.score)
  }).from(classificationRatings).where(eq(classificationRatings.classificationId, classificationId));

  const averageScore = ratingData?.avgScore ? Number(ratingData.avgScore).toFixed(1) : "Sin calificar";

  const user = await currentUser();

  async function submitRating(formData: FormData) {
    "use server";
    const currentUserData = await currentUser();
    if (!currentUserData) return;
    const score = parseInt(formData.get("score") as string, 10);
    if (!score || score < 1 || score > 5) return;
    
    await db.insert(classificationRatings).values({
      classificationId,
      userId: currentUserData.id,
      score
    });
    revalidatePath(`/classifications/${classificationId}`);
    revalidatePath("/classifications");
  }

  return (
    <>
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <Link href="/classifications" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Clasificaciones
        </Link>

        <div className="space-y-12">
          {/* Cabecera / Info Principal */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row relative">
            {classification.imageUrl ? (
              <div className="md:w-1/3 bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={classification.imageUrl} alt={classification.name} className="w-full h-64 md:h-full object-cover" />
              </div>
            ) : (
              <div className="md:w-1/3 bg-primary/10 flex items-center justify-center p-8">
                 <div className="text-8xl font-black text-primary/20 opacity-50">{classification.name.substring(0,2).toUpperCase()}</div>
              </div>
            )}
            
            <div className="p-8 flex flex-col justify-center flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground">{classification.name}</h1>
                <div className="flex items-center text-yellow-500 font-medium bg-background px-3 py-1 rounded-full border border-border text-sm">
                  <Star className="h-4 w-4 mr-1 fill-current" />
                  {averageScore}
                </div>
              </div>
              
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed whitespace-pre-wrap">
                {classification.description}
              </p>
              
              <div className="mt-auto pt-6 border-t border-border flex items-center justify-between">
                {classification.usefulLinks ? (
                  <a href={classification.usefulLinks} target="_blank" rel="noreferrer" className="inline-flex items-center text-teal hover:underline font-bold bg-teal/10 px-4 py-2 rounded-lg">
                    <ExternalLink className="mr-2 w-4 h-4" /> Recursos y Documentación
                  </a>
                ) : <div></div>}
              </div>
            </div>
          </div>

          {/* Sección de Ejemplos */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground border-b border-border pb-2">
              <Box className="w-6 h-6 text-primary" /> Ejemplos Interactivos
            </h2>
            {examples.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {examples.map(ex => (
                  <ExampleModal key={ex.id} example={ex} />
                ))}
              </div>
            ) : (
              <div className="bg-card border border-border p-8 rounded-xl text-center text-muted-foreground">
                Aún no hay ejemplos interactivos para esta categoría.
              </div>
            )}
          </div>

          {/* Sección de Software Relacionado */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground border-b border-border pb-2 mt-8">
              <Server className="w-6 h-6 text-emerald-500" /> Catálogo de Software Asociado
            </h2>
            {relatedSoftware.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedSoftware.map(soft => (
                  <Link href={`/catalog/${soft.id}`} key={soft.id} className="bg-card border border-border rounded-xl p-6 hover:shadow-glow hover:border-emerald-500/50 transition-all group">
                    <h3 className="font-bold text-xl text-foreground mb-2 group-hover:text-emerald-500 transition-colors">{soft.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{soft.objective}</p>
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                      <span className="text-muted-foreground">{soft.licenseType}</span>
                      <span className="text-emerald-500 group-hover:underline">Ver Sistema &rarr;</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-card border border-border p-8 rounded-xl text-center text-muted-foreground">
                No se ha registrado software para esta categoría en el catálogo todavía.
              </div>
            )}
          </div>

          {/* Sección de Calificación */}
          <div className="bg-card border border-border p-8 rounded-xl shadow-sm mt-12 flex flex-col items-center justify-center text-center">
            <h3 className="text-2xl font-bold mb-2">¿Cómo nos calificas?</h3>
            <p className="text-muted-foreground mb-6">Tu opinión ayuda a destacar esta clasificación en el inicio.</p>
            
            {!user ? (
              <div className="py-4">
                <p className="text-muted-foreground mb-4 text-sm">Debes iniciar sesión para calificar.</p>
                <Link href="/sign-in" className="text-primary hover:underline font-medium">Ingresar</Link>
              </div>
            ) : (
              <form action={submitRating}>
                <StarRating name="score" value={0} autoSubmit />
              </form>
            )}
          </div>

        </div>
      </div>
      <CatalogAssistant item={classification} type="classification" />
    </>
  );
}
