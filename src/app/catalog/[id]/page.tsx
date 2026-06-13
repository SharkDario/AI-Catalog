import { db } from "@/db";
import { softwareItems, classifications, ratings } from "@/db/schema";
import { eq, sql, avg } from "drizzle-orm";
import { notFound } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Star, MessageSquare } from "lucide-react";
import { StarRating } from "@/components/StarRating";
import { CatalogAssistant } from "@/components/CatalogAssistant";

export default async function CatalogDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const itemId = parseInt(resolvedParams.id, 10);
  if (isNaN(itemId)) notFound();

  const [item] = await db.select({
    software: softwareItems,
    classification: classifications
  }).from(softwareItems)
  .leftJoin(classifications, eq(softwareItems.classificationId, classifications.id))
  .where(eq(softwareItems.id, itemId));

  if (!item) notFound();

  // Update views
  await db.update(softwareItems)
    .set({ views: sql`${softwareItems.views} + 1` })
    .where(eq(softwareItems.id, itemId));

  const [ratingData] = await db.select({
    avgScore: avg(ratings.score)
  }).from(ratings).where(eq(ratings.softwareItemId, itemId));

  const relatedThreads = await db.select()
    .from(require("@/db/schema").forumThreads)
    .where(eq(require("@/db/schema").forumThreads.softwareItemId, itemId));

  const user = await currentUser();

  async function submitRating(formData: FormData) {
    "use server";
    const currentUserData = await currentUser();
    if (!currentUserData) return;
    const score = parseInt(formData.get("score") as string, 10);
    if (!score || score < 1 || score > 5) return;
    
    await db.insert(ratings).values({
      softwareItemId: itemId,
      userId: currentUserData.id,
      score
    });
    revalidatePath(`/catalog/${itemId}`);
  }

  let embedUrl = "";
  if (item.software.videoUrl) {
    try {
      const urlStr = item.software.videoUrl;
      const url = new URL(urlStr);
      if (url.hostname.includes("youtube.com") || url.hostname.includes("youtu.be")) {
        const v = url.searchParams.get("v") || url.pathname.split("/").pop();
        embedUrl = `https://www.youtube.com/embed/${v}`;
      }
    } catch (e) {
      // Ignorar urls inválidas para no crashear
    }
  }

  const averageScore = ratingData?.avgScore ? Number(ratingData.avgScore).toFixed(1) : "Sin calificar";

  return (
    <>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/catalog" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver al catálogo
        </Link>

        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-primary/20 text-primary text-sm px-3 py-1 rounded-full font-medium">
                {item.classification?.name}
              </span>
              <div className="flex items-center text-yellow-500 font-medium">
                <Star className="h-5 w-5 mr-1 fill-current" />
                {averageScore}
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">{item.software.name}</h1>
            <p className="text-xl text-muted-foreground">{item.software.objective}</p>
          </div>

          <div className="bg-card border border-border p-6 rounded-xl shadow-sm space-y-4">
            <h2 className="text-2xl font-bold border-b border-border pb-2">Descripción y Funcionamiento</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">{item.software.description || "No hay descripción detallada."}</p>
            
            <div className="pt-4 flex items-center justify-between border-t border-border mt-6">
              <div className="flex gap-6">
                <div>
                  <span className="block text-sm text-muted-foreground">Licencia</span>
                  <span className="font-medium text-foreground">{item.software.licenseType}</span>
                </div>
                <div>
                  <span className="block text-sm text-muted-foreground">Año</span>
                  <span className="font-medium text-foreground">{item.software.releaseYear}</span>
                </div>
                <div>
                  <span className="block text-sm text-muted-foreground">Autor</span>
                  <span className="font-medium text-foreground">{item.software.author}</span>
                </div>
              </div>
              <a href={item.software.accessUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2 rounded-md hover:opacity-90 transition-opacity">
                Acceder <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>

          {embedUrl && (
            <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
              <h2 className="text-2xl font-bold mb-4">Material Demostrativo</h2>
              <div className="aspect-video w-full overflow-hidden rounded-lg">
                <iframe 
                  src={embedUrl} 
                  title="Video demostrativo" 
                  className="w-full h-full border-0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}

          <div className="space-y-6 mt-12">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground border-b border-border pb-2">
              <MessageSquare className="w-6 h-6 text-primary" /> Foro de Debates Asociado
            </h2>
            {relatedThreads.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {relatedThreads.map((thread: any) => (
                  <Link href={`/forum/${thread.id}`} key={thread.id} className="bg-card border border-border rounded-xl p-6 hover:shadow-glow hover:border-primary/50 transition-all group">
                    <h3 className="font-bold text-xl text-foreground mb-2 group-hover:text-primary transition-colors">{thread.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{thread.content}</p>
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                      <span className="text-muted-foreground">{thread.views} vistas</span>
                      <span className="text-primary group-hover:underline">Ver Debate &rarr;</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-card border border-border p-8 rounded-xl text-center text-muted-foreground">
                No hay debates asociados a este software aún.
              </div>
            )}
          </div>

          <div className="bg-card border border-border p-8 rounded-xl shadow-sm mt-12 flex flex-col items-center justify-center text-center">
            <h3 className="text-2xl font-bold mb-2">¿Cómo nos calificas?</h3>
            <p className="text-muted-foreground mb-6">Tu opinión ayuda a otros usuarios a encontrar las mejores herramientas.</p>
            
            {!user ? (
              <div className="py-4">
                <p className="text-muted-foreground mb-4 text-sm">Debes iniciar sesión para calificar.</p>
                <Link href="/sign-in" className="text-primary hover:underline font-medium">Ingresar</Link>
              </div>
            ) : (
              <form action={submitRating}>
                <input type="hidden" name="softwareItemId" value={itemId} />
                <StarRating name="score" value={0} autoSubmit />
              </form>
            )}
          </div>
        </div>
      </div>
      <CatalogAssistant item={item.software} />
    </>
  );
}
