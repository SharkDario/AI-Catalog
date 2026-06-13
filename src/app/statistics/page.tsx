import { db } from "@/db";
import { softwareItems, classifications, forumThreads, ratings, classificationRatings, forumThreadRatings } from "@/db/schema";
import { sql, eq } from "drizzle-orm";
import { BarChart2 } from "lucide-react";
import { StatisticsDashboard, ItemStats } from "@/components/StatisticsDashboard";

export const dynamic = "force-dynamic";

export default async function StatisticsPage() {
  const softwareData = await db.select({
    id: softwareItems.id,
    name: softwareItems.name,
    type: softwareItems.type,
    classificationId: softwareItems.classificationId,
    views: softwareItems.views,
    avgRating: sql<number>`COALESCE(AVG(${ratings.score}), 0)`.mapWith(Number),
    rating1: sql<number>`COUNT(CASE WHEN ${ratings.score} = 1 THEN 1 END)`.mapWith(Number),
    rating2: sql<number>`COUNT(CASE WHEN ${ratings.score} = 2 THEN 1 END)`.mapWith(Number),
    rating3: sql<number>`COUNT(CASE WHEN ${ratings.score} = 3 THEN 1 END)`.mapWith(Number),
    rating4: sql<number>`COUNT(CASE WHEN ${ratings.score} = 4 THEN 1 END)`.mapWith(Number),
    rating5: sql<number>`COUNT(CASE WHEN ${ratings.score} = 5 THEN 1 END)`.mapWith(Number),
  })
  .from(softwareItems)
  .leftJoin(ratings, eq(softwareItems.id, ratings.softwareItemId))
  .groupBy(softwareItems.id);

  const classificationData = await db.select({
    id: classifications.id,
    name: classifications.name,
    views: classifications.views,
    avgRating: sql<number>`COALESCE(AVG(${classificationRatings.score}), 0)`.mapWith(Number),
    rating1: sql<number>`COUNT(CASE WHEN ${classificationRatings.score} = 1 THEN 1 END)`.mapWith(Number),
    rating2: sql<number>`COUNT(CASE WHEN ${classificationRatings.score} = 2 THEN 1 END)`.mapWith(Number),
    rating3: sql<number>`COUNT(CASE WHEN ${classificationRatings.score} = 3 THEN 1 END)`.mapWith(Number),
    rating4: sql<number>`COUNT(CASE WHEN ${classificationRatings.score} = 4 THEN 1 END)`.mapWith(Number),
    rating5: sql<number>`COUNT(CASE WHEN ${classificationRatings.score} = 5 THEN 1 END)`.mapWith(Number),
  })
  .from(classifications)
  .leftJoin(classificationRatings, eq(classifications.id, classificationRatings.classificationId))
  .groupBy(classifications.id);

  const debateData = await db.select({
    id: forumThreads.id,
    name: forumThreads.title,
    type: softwareItems.type,
    classificationId: sql<number>`COALESCE(${forumThreads.classificationId}, ${softwareItems.classificationId})`.mapWith(Number),
    views: forumThreads.views,
    avgRating: sql<number>`COALESCE(AVG(${forumThreadRatings.score}), 0)`.mapWith(Number),
    rating1: sql<number>`COUNT(CASE WHEN ${forumThreadRatings.score} = 1 THEN 1 END)`.mapWith(Number),
    rating2: sql<number>`COUNT(CASE WHEN ${forumThreadRatings.score} = 2 THEN 1 END)`.mapWith(Number),
    rating3: sql<number>`COUNT(CASE WHEN ${forumThreadRatings.score} = 3 THEN 1 END)`.mapWith(Number),
    rating4: sql<number>`COUNT(CASE WHEN ${forumThreadRatings.score} = 4 THEN 1 END)`.mapWith(Number),
    rating5: sql<number>`COUNT(CASE WHEN ${forumThreadRatings.score} = 5 THEN 1 END)`.mapWith(Number),
  })
  .from(forumThreads)
  .leftJoin(forumThreadRatings, eq(forumThreads.id, forumThreadRatings.threadId))
  .leftJoin(softwareItems, eq(forumThreads.softwareItemId, softwareItems.id))
  .groupBy(forumThreads.id, softwareItems.id);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 text-foreground flex items-center gap-3">
          <BarChart2 className="h-10 w-10 text-primary" /> Dashboard de Estadísticas
        </h1>
        <p className="text-lg text-muted-foreground">Analiza el rendimiento y popularidad de los distintos artículos en la plataforma.</p>
      </div>

      <StatisticsDashboard 
        softwareStats={softwareData as ItemStats[]}
        classificationsStats={classificationData as ItemStats[]}
        debatesStats={debateData as ItemStats[]}
      />
    </div>
  );
}
