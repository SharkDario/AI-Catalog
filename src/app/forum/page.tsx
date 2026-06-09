import { db } from "@/db";
import { forumThreads, classifications, softwareItems, forumThreadRatings, forumComments } from "@/db/schema";
import { createThread } from "@/lib/actions/forum";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { MessageSquare, Calendar, Tag, MonitorSmartphone, Eye, Star, MessageCircle } from "lucide-react";
import { desc, eq, sql } from "drizzle-orm";

export default async function ForumPage() {
  const data = await db.select({
    thread: forumThreads,
    classification: classifications,
    software: softwareItems,
    avgScore: sql<number>`avg(${forumThreadRatings.score})`.as("avg_score"),
    commentsCount: sql<number>`count(distinct ${forumComments.id})`.as("comments_count")
  })
  .from(forumThreads)
  .leftJoin(classifications, eq(forumThreads.classificationId, classifications.id))
  .leftJoin(softwareItems, eq(forumThreads.softwareItemId, softwareItems.id))
  .leftJoin(forumThreadRatings, eq(forumThreads.id, forumThreadRatings.threadId))
  .leftJoin(forumComments, eq(forumThreads.id, forumComments.threadId))
  .groupBy(forumThreads.id, classifications.id, softwareItems.id)
  .orderBy(desc(forumThreads.createdAt));

  const classes = await db.select().from(classifications).orderBy(classifications.name);
  const softwares = await db.select().from(softwareItems).orderBy(softwareItems.name);

  const user = await currentUser();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-foreground flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-primary" /> Foro de Debates
          </h1>
          <p className="text-lg text-muted-foreground">Comparte tus ideas y discute sobre Inteligencia Artificial.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {data.map(({ thread, classification, software, avgScore, commentsCount }) => (
            <div key={thread.id} className="block bg-card border border-border p-6 rounded-xl hover:shadow-glow transition-all">
              <div className="flex justify-between items-start">
                <Link href={`/forum/${thread.id}`}>
                  <h2 className="text-2xl font-bold text-foreground mb-3 hover:text-primary transition-colors">{thread.title}</h2>
                </Link>
                {avgScore && (
                  <div className="flex items-center text-yellow-500 font-medium bg-background px-2 py-1 rounded-md text-sm border border-border">
                    <Star className="h-4 w-4 mr-1 fill-current" />
                    {Number(avgScore).toFixed(1)}
                  </div>
                )}
              </div>
              <p className="text-muted-foreground line-clamp-2 mb-4">{thread.content}</p>
              
              {(classification || software) && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {classification && (
                    <Link href={`/catalog`} className="inline-flex items-center text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-md hover:bg-primary/20 transition-colors">
                      <Tag className="h-3 w-3 mr-1" /> {classification.name}
                    </Link>
                  )}
                  {software && (
                    <Link href={`/catalog/${software.id}`} className="inline-flex items-center text-xs font-medium bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-md hover:bg-emerald-500/20 transition-colors">
                      <MonitorSmartphone className="h-3 w-3 mr-1" /> {software.name}
                    </Link>
                  )}
                </div>
              )}

              <div className="flex items-center text-sm text-muted-foreground gap-6">
                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {thread.createdAt.toLocaleDateString()}</span>
                <span className="flex items-center gap-1"><MessageCircle className="h-4 w-4" /> {commentsCount} comentarios</span>
                <span className="flex items-center gap-1"><Eye className="h-4 w-4" /> {thread.views} vistas</span>
              </div>
            </div>
          ))}

          {data.length === 0 && (
            <div className="text-center py-16 bg-card rounded-xl border border-border">
              <h3 className="text-xl font-medium text-muted-foreground">Aún no hay hilos de debate. ¡Sé el primero en participar!</h3>
            </div>
          )}
        </div>

        <div>
          <div className="bg-card border border-border p-6 rounded-xl shadow-sm sticky top-24">
            <h3 className="text-xl font-bold mb-4">Crear Nuevo Hilo</h3>
            {!user ? (
              <div className="bg-muted/50 p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-3">Debes iniciar sesión para crear un debate.</p>
                <Link href="/sign-in" className="text-primary hover:underline font-medium">Ingresar</Link>
              </div>
            ) : (
              <form action={createThread} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Título del Debate</label>
                  <input name="title" required className="w-full bg-background border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Relacionado con Clasificación (Opcional)</label>
                  <select name="classificationId" className="w-full bg-background border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none text-foreground">
                    <option value="">Ninguna...</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Relacionado con Software (Opcional)</label>
                  <select name="softwareItemId" className="w-full bg-background border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none text-foreground">
                    <option value="">Ninguno...</option>
                    {softwares.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Contenido</label>
                  <textarea name="content" required rows={4} className="w-full bg-background border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none"></textarea>
                </div>
                <button type="submit" className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:opacity-90 transition-opacity">
                  Publicar Hilo
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
