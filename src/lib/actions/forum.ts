"use server";

import { db } from "@/db";
import { forumThreads, forumComments } from "@/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function createThread(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Debes iniciar sesión para crear un hilo");

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const rawClassId = formData.get("classificationId") as string;
  const classificationId = rawClassId ? parseInt(rawClassId, 10) : null;
  const rawSoftwareId = formData.get("softwareItemId") as string;
  const softwareItemId = rawSoftwareId ? parseInt(rawSoftwareId, 10) : null;

  await db.insert(forumThreads).values({
    userId: user.id, // Clerk ID
    title,
    content,
    classificationId,
    softwareItemId,
  });

  revalidatePath("/forum");
}

export async function createComment(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Debes iniciar sesión para comentar");

  const threadId = parseInt(formData.get("threadId") as string, 10);
  const content = formData.get("content") as string;
  const rawParentId = formData.get("parentId") as string;
  const parentId = rawParentId ? parseInt(rawParentId, 10) : null;

  await db.insert(forumComments).values({
    threadId,
    userId: user.id, // Clerk ID
    content,
    parentId,
  });

  revalidatePath(`/forum/${threadId}`);
}

import { forumThreadRatings } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function rateThread(formData: FormData) {
  const user = await currentUser();
  if (!user) return;
  const score = parseInt(formData.get("score") as string, 10);
  const threadId = parseInt(formData.get("threadId") as string, 10);
  
  if (!score || score < 1 || score > 5) return;
  
  const existingRating = await db.select().from(forumThreadRatings).where(and(
    eq(forumThreadRatings.threadId, threadId),
    eq(forumThreadRatings.userId, user.id)
  ));

  if (existingRating.length > 0) {
    await db.update(forumThreadRatings)
      .set({ score })
      .where(eq(forumThreadRatings.id, existingRating[0].id));
  } else {
    await db.insert(forumThreadRatings).values({
      threadId,
      userId: user.id,
      score
    });
  }
  revalidatePath(`/forum/${threadId}`);
  revalidatePath("/forum");
}

import { redirect } from "next/navigation";

export async function deleteThread(threadId: number) {
  const user = await currentUser();
  if (!user) return false;

  const [thread] = await db.select().from(forumThreads).where(eq(forumThreads.id, threadId));
  if (!thread || thread.userId !== user.id) {
    return false;
  }

  await db.delete(forumThreads).where(eq(forumThreads.id, threadId));
  revalidatePath("/forum");
  // Return true to indicate successful deletion; the caller can handle navigation.
  return true;
}

export async function editThread(threadId: number, formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  const [thread] = await db.select().from(forumThreads).where(eq(forumThreads.id, threadId));
  if (!thread || thread.userId !== user.id) {
    throw new Error("Unauthorized");
  }

  await db.update(forumThreads).set({ title, content }).where(eq(forumThreads.id, threadId));
  revalidatePath(`/forum/${threadId}`);
  revalidatePath("/forum");
}
