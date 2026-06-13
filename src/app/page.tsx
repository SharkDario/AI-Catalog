import { db } from "@/db";
import { softwareItems, classifications, ratings, forumThreads, forumThreadRatings } from "@/db/schema";
import { sql, desc, eq } from "drizzle-orm";
import Link from "next/link";
import { TrendingUp, Star, Layers, Eye, MessageSquare } from "lucide-react";
import { HomeSearchBar } from "@/components/HomeSearchBar";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [{ count: totalSoftware }] = await db.select({ count: sql`count(*)`.mapWith(Number) }).from(softwareItems);
  const [{ count: totalClassifications }] = await db.select({ count: sql`count(*)`.mapWith(Number) }).from(classifications);

  // Fetch top software
  const topSoftwareRaw = await db.select({
    software: softwareItems,
    classification: classifications,
    avgScore: sql<number>`avg(${ratings.score})`.as("avg_score")
  })
  .from(softwareItems)
  .leftJoin(classifications, eq(softwareItems.classificationId, classifications.id))
  .leftJoin(ratings, eq(softwareItems.id, ratings.softwareItemId))
  .groupBy(softwareItems.id, classifications.id)
  .orderBy(desc(softwareItems.views), desc(sql`avg_score`))
  .limit(3);

  // Fetch top threads
  const topThreadsRaw = await db.select({
    thread: forumThreads,
    avgScore: sql<number>`avg(${forumThreadRatings.score})`.as("avg_score")
  })
  .from(forumThreads)
  .leftJoin(forumThreadRatings, eq(forumThreads.id, forumThreadRatings.threadId))
  .groupBy(forumThreads.id)
  .orderBy(desc(forumThreads.views), desc(sql`avg_score`))
  .limit(3);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      
      {/* Hero Card */}
      <div className="bg-gradient-card rounded-3xl p-10 md:p-16 border border-border shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-teal font-mono text-sm tracking-widest uppercase mb-8">
            <SparklesIcon className="w-4 h-4" />
            El conocimiento y el descubrimiento
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
            El <span className="text-gradient">catálogo inteligente</span> de sistemas y software de IA.
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mb-12 leading-relaxed">
            Explora modelos, compara licencias, debate con la comunidad y aprende los fundamentos detrás de cada tipo de sistema inteligente.
          </p>
          
          <HomeSearchBar />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Top Software */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 text-muted-foreground uppercase tracking-wider text-sm font-bold mb-6 border-b border-border pb-4">
            <TrendingUp className="w-5 h-5 text-primary" /> Top Catálogo de Software
          </div>
          <div className="space-y-4">
            {topSoftwareRaw.map(({ software, classification, avgScore }, index) => (
              <Link href={`/catalog/${software.id}`} key={software.id} className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                <div className="bg-primary/10 text-primary font-bold text-xl w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-foreground mb-1">{software.name}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-1">{classification?.name}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 text-sm font-medium text-foreground justify-end"><Eye className="w-4 h-4 text-muted-foreground"/> {software.views}</div>
                  <div className="flex items-center gap-1 text-sm font-medium text-yellow-500 justify-end"><Star className="w-4 h-4 fill-current"/> {avgScore ? Number(avgScore).toFixed(1) : "-"}</div>
                </div>
              </Link>
            ))}
            {topSoftwareRaw.length === 0 && <p className="text-muted-foreground text-center py-4">No hay software registrado aún.</p>}
          </div>
        </div>

        {/* Top Threads */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 text-muted-foreground uppercase tracking-wider text-sm font-bold mb-6 border-b border-border pb-4">
            <MessageSquare className="w-5 h-5 text-teal" /> Debates Destacados
          </div>
          <div className="space-y-4">
            {topThreadsRaw.map(({ thread, avgScore }, index) => (
              <Link href={`/forum/${thread.id}`} key={thread.id} className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                <div className="bg-teal/10 text-teal font-bold text-xl w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-foreground mb-1 line-clamp-1">{thread.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-1">{thread.content}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 text-sm font-medium text-foreground justify-end"><Eye className="w-4 h-4 text-muted-foreground"/> {thread.views}</div>
                  <div className="flex items-center gap-1 text-sm font-medium text-yellow-500 justify-end"><Star className="w-4 h-4 fill-current"/> {avgScore ? Number(avgScore).toFixed(1) : "-"}</div>
                </div>
              </Link>
            ))}
            {topThreadsRaw.length === 0 && <p className="text-muted-foreground text-center py-4">No hay debates creados aún.</p>}
          </div>
        </div>

      </div>
      
    </div>
  );
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18M3 12h18M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728" />
    </svg>
  )
}
