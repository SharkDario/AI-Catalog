import { db } from "@/db";
import { forumThreads, forumComments, classifications, softwareItems, forumThreadRatings } from "@/db/schema";
import { eq, sql, avg, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { createComment, deleteThread, editThread, rateThread } from "@/lib/actions/forum";
import Link from "next/link";
import { ArrowLeft, User, ExternalLink, Tag, MonitorSmartphone, Eye, Star, Trash2, Edit } from "lucide-react";
import { StarRating } from "@/components/StarRating";
import { DeleteButton } from "@/components/DeleteButton";

export default async function ThreadDetail({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ edit?: string }> }) {
  const resolvedParams = await params;
  const threadId = parseInt(resolvedParams.id, 10);
  if (isNaN(threadId)) notFound();

  const resolvedSearch = await searchParams;
  const isEditing = resolvedSearch.edit === "true";

  // Incrementar vistas
  await db.update(forumThreads)
    .set({ views: sql`${forumThreads.views} + 1` })
    .where(eq(forumThreads.id, threadId));

  const [data] = await db.select({
    thread: forumThreads,
    classification: classifications,
    software: softwareItems,
  })
  .from(forumThreads)
  .leftJoin(classifications, eq(forumThreads.classificationId, classifications.id))
  .leftJoin(softwareItems, eq(forumThreads.softwareItemId, softwareItems.id))
  .where(eq(forumThreads.id, threadId));

  if (!data) notFound();
  
  const { thread, classification, software } = data;

  const [ratingData] = await db.select({
    avgScore: avg(forumThreadRatings.score)
  }).from(forumThreadRatings).where(eq(forumThreadRatings.threadId, threadId));

  const commentsData = await db.select().from(forumComments).where(eq(forumComments.threadId, threadId)).orderBy(forumComments.createdAt);
  
  const user = await currentUser();

  // Recopilar IDs de usuarios
  const userIdsToFetch = new Set<string>();
  userIdsToFetch.add(thread.userId);
  commentsData.forEach(c => userIdsToFetch.add(c.userId));

  let usersMap: Record<string, any> = {};
  try {
    const client = await clerkClient();
    const userList = await client.users.getUserList({ userId: Array.from(userIdsToFetch) });
    userList.data.forEach((u: any) => {
      usersMap[u.id] = u;
    });
  } catch (e) {
    console.error("Error fetching clerk users", e);
  }

  const threadAuthor = usersMap[thread.userId];
  const isOwner = user?.id === thread.userId;

  const rootComments = commentsData.filter(c => !c.parentId);
  const replies = commentsData.filter(c => c.parentId);

  const averageScore = ratingData?.avgScore ? Number(ratingData.avgScore).toFixed(1) : "Sin calificar";

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Link href="/forum" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver al foro
      </Link>

      <div className="bg-card border border-border p-8 rounded-2xl shadow-sm mb-12">
        {isEditing && isOwner ? (
          <form action={editThread.bind(null, thread.id)} className="space-y-4 mb-6">
            <input name="title" defaultValue={thread.title} required className="w-full text-2xl font-bold bg-background border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none" />
            <textarea name="content" defaultValue={thread.content} required rows={6} className="w-full bg-background border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none"></textarea>
            <div className="flex gap-2 justify-end">
              <Link href={`/forum/${thread.id}`} className="px-4 py-2 text-muted-foreground hover:bg-muted rounded-md transition-colors">Cancelar</Link>
              <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:opacity-90">Guardar Cambios</button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">{thread.title}</h1>
              {isOwner && (
                <div className="flex gap-2">
                  <Link href={`/forum/${thread.id}?edit=true`} className="text-blue-500 hover:bg-blue-500/10 p-2 rounded-md transition-colors"><Edit className="h-4 w-4" /></Link>
                  <DeleteButton onDelete={async () => { "use server"; return await deleteThread(thread.id); }} itemType="debate" redirectTo="/forum" />
                </div>
              )}
            </div>
            
            {(classification || software) && (
              <div className="flex flex-wrap gap-4 mb-6 p-4 bg-muted/30 rounded-xl border border-border">
                {classification && (
                  <Link href={`/classifications`} className="inline-flex items-center font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity">
                    <Tag className="h-4 w-4 mr-2" /> Ver Clasificación: {classification.name} <ExternalLink className="h-4 w-4 ml-2" />
                  </Link>
                )}
                {software && (
                  <Link href={`/catalog/${software.id}`} className="inline-flex items-center font-medium bg-emerald-600 text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity">
                    <MonitorSmartphone className="h-4 w-4 mr-2" /> Ver Software: {software.name} <ExternalLink className="h-4 w-4 ml-2" />
                  </Link>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b border-border justify-between">
              <div className="flex items-center gap-2">
                {threadAuthor?.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={threadAuthor.imageUrl} alt="Avatar" className="w-6 h-6 rounded-full" />
                ) : <User className="w-5 h-5" />}
                <span className="font-medium text-foreground">{threadAuthor?.firstName || "Usuario"}</span>
                <span>•</span>
                <span>{thread.createdAt.toLocaleDateString()} a las {thread.createdAt.toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1"><Eye className="h-4 w-4" /> {thread.views} vistas</span>
                <div className="flex items-center gap-1 text-yellow-500 bg-background px-2 py-1 rounded-md border border-border font-medium">
                  <Star className="h-4 w-4 fill-current" /> {averageScore}
                </div>
              </div>
            </div>
            
            <div className="text-lg text-foreground whitespace-pre-wrap leading-relaxed mb-8">
              {thread.content}
            </div>

            <div className="flex items-center justify-between border-t border-border pt-6 mt-8">
              <h3 className="font-bold text-foreground">¿Cómo calificas este debate?</h3>
              {user ? (
                <form action={rateThread} className="flex items-center">
                  <input type="hidden" name="threadId" value={thread.id} />
                  <StarRating name="score" autoSubmit />
                </form>
              ) : (
                <span className="text-sm text-muted-foreground"><Link href="/sign-in" className="text-primary hover:underline">Inicia sesión</Link> para calificar</span>
              )}
            </div>
          </>
        )}
      </div>

      <div className="space-y-8">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          Comentarios <span className="bg-primary/20 text-primary text-sm px-3 py-1 rounded-full">{commentsData.length}</span>
        </h2>

        <div className="space-y-6">
          {rootComments.map(comment => {
            const author = usersMap[comment.userId];
            const childReplies = replies.filter(r => r.parentId === comment.id);

            return (
              <div key={comment.id} className="bg-card border border-border p-6 rounded-xl">
                <div className="flex gap-4">
                  <div className="mt-1 flex-shrink-0">
                    {author?.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={author.imageUrl} alt="Avatar" className="w-10 h-10 rounded-full" />
                    ) : <div className="bg-muted p-2 rounded-full"><User className="h-5 w-5 text-muted-foreground" /></div>}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">{author?.firstName || "Usuario Anónimo"}</span>
                      <span className="text-xs text-muted-foreground">{comment.createdAt.toLocaleDateString()} {comment.createdAt.toLocaleTimeString()}</span>
                    </div>
                    <p className="text-muted-foreground whitespace-pre-wrap mb-4">{comment.content}</p>
                    
                    {user && (
                      <details className="mb-4">
                        <summary className="text-sm text-primary cursor-pointer hover:underline font-medium list-none">Responder</summary>
                        <form action={createComment} className="mt-3 flex flex-col items-end gap-2">
                          <input type="hidden" name="threadId" value={thread.id} />
                          <input type="hidden" name="parentId" value={comment.id} />
                          <textarea name="content" required rows={2} placeholder="Escribe tu respuesta..." className="w-full text-sm bg-background border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none"></textarea>
                          <button type="submit" className="bg-secondary text-secondary-foreground px-4 py-1.5 rounded-md text-sm font-medium hover:opacity-90">Enviar Respuesta</button>
                        </form>
                      </details>
                    )}

                    {childReplies.length > 0 && (
                      <div className="mt-4 space-y-4 border-l-2 border-border pl-4">
                        {childReplies.map(reply => {
                          const replyAuthor = usersMap[reply.userId];
                          return (
                            <div key={reply.id} className="flex gap-3">
                              <div className="mt-1 flex-shrink-0">
                                {replyAuthor?.imageUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={replyAuthor.imageUrl} alt="Avatar" className="w-6 h-6 rounded-full" />
                                ) : <div className="bg-muted p-1 rounded-full"><User className="h-4 w-4 text-muted-foreground" /></div>}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-sm text-foreground">{replyAuthor?.firstName || "Usuario"}</span>
                                  <span className="text-xs text-muted-foreground">{reply.createdAt.toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{reply.content}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {rootComments.length === 0 && (
            <p className="text-muted-foreground italic">No hay comentarios todavía.</p>
          )}
        </div>

        <div className="bg-card border border-border p-6 rounded-xl mt-12">
          <h3 className="text-xl font-bold mb-4">Añadir Comentario</h3>
          {!user ? (
            <div className="bg-muted/50 p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-3">Debes iniciar sesión para comentar.</p>
              <Link href="/sign-in" className="text-primary hover:underline font-medium">Ingresar</Link>
            </div>
          ) : (
            <form action={createComment} className="space-y-4">
              <input type="hidden" name="threadId" value={thread.id} />
              <textarea name="content" required rows={3} placeholder="Escribe tu comentario aquí..." className="w-full bg-background border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none"></textarea>
              <button type="submit" className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:opacity-90 transition-opacity">
                Publicar Comentario
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
