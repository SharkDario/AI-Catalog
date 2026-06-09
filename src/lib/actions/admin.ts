"use server";

import { db } from "@/db";
import { classifications, softwareItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { checkIsAdmin } from "@/lib/auth";

// --- Classifications ---
export async function createClassification(formData: FormData) {
  if (!(await checkIsAdmin())) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const imageUrl = formData.get("imageUrl") as string | null;
  const usefulLinks = formData.get("usefulLinks") as string | null;

  await db.insert(classifications).values({
    name,
    description,
    imageUrl,
    usefulLinks,
  });

  revalidatePath("/admin/classifications");
  revalidatePath("/classifications");
}

export async function updateClassification(id: number, formData: FormData) {
  if (!(await checkIsAdmin())) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const imageUrl = formData.get("imageUrl") as string | null;
  const usefulLinks = formData.get("usefulLinks") as string | null;

  await db.update(classifications).set({
    name,
    description,
    imageUrl,
    usefulLinks,
  }).where(eq(classifications.id, id));

  revalidatePath("/admin/classifications");
  revalidatePath("/classifications");
}

export async function deleteClassification(id: number) {
  if (!(await checkIsAdmin())) throw new Error("Unauthorized");
  await db.delete(classifications).where(eq(classifications.id, id));
  revalidatePath("/admin/classifications");
  revalidatePath("/classifications");
}

// --- Software Items (Catalog) ---
export async function createSoftwareItem(formData: FormData) {
  if (!(await checkIsAdmin())) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const objective = formData.get("objective") as string;
  const accessUrl = formData.get("accessUrl") as string;
  const licenseType = formData.get("licenseType") as string;
  const releaseYear = parseInt(formData.get("releaseYear") as string, 10);
  const author = formData.get("author") as string;
  const description = formData.get("description") as string | null;
  const videoUrl = formData.get("videoUrl") as string | null;
  const classificationId = parseInt(formData.get("classificationId") as string, 10);

  await db.insert(softwareItems).values({
    name,
    objective,
    accessUrl,
    licenseType,
    releaseYear,
    author,
    description,
    videoUrl,
    classificationId,
  });

  revalidatePath("/admin/catalog");
  revalidatePath("/catalog");
}

export async function updateSoftwareItem(id: number, formData: FormData) {
  if (!(await checkIsAdmin())) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const objective = formData.get("objective") as string;
  const accessUrl = formData.get("accessUrl") as string;
  const licenseType = formData.get("licenseType") as string;
  const releaseYear = parseInt(formData.get("releaseYear") as string, 10);
  const author = formData.get("author") as string;
  const description = formData.get("description") as string | null;
  const videoUrl = formData.get("videoUrl") as string | null;
  const classificationId = parseInt(formData.get("classificationId") as string, 10);

  await db.update(softwareItems).set({
    name,
    objective,
    accessUrl,
    licenseType,
    releaseYear,
    author,
    description,
    videoUrl,
    classificationId,
    updatedAt: new Date(),
  }).where(eq(softwareItems.id, id));

  revalidatePath("/admin/catalog");
  revalidatePath("/catalog");
}

export async function deleteSoftwareItem(id: number) {
  if (!(await checkIsAdmin())) throw new Error("Unauthorized");
  await db.delete(softwareItems).where(eq(softwareItems.id, id));
  revalidatePath("/admin/catalog");
  revalidatePath("/catalog");
}

// --- Classification Examples ---
import { classificationExamples } from "@/db/schema";

export async function createClassificationExample(formData: FormData) {
  if (!(await checkIsAdmin())) throw new Error("Unauthorized");

  const classificationId = parseInt(formData.get("classificationId") as string, 10);
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const imageUrl = formData.get("imageUrl") as string | null;
  const videoUrl = formData.get("videoUrl") as string | null;

  await db.insert(classificationExamples).values({
    classificationId,
    name,
    description,
    imageUrl,
    videoUrl,
  });

  revalidatePath("/admin/classifications");
  revalidatePath("/classifications");
}

export async function updateClassificationExample(id: number, formData: FormData) {
  if (!(await checkIsAdmin())) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const imageUrl = formData.get("imageUrl") as string | null;
  const videoUrl = formData.get("videoUrl") as string | null;

  await db.update(classificationExamples).set({
    name,
    description,
    imageUrl,
    videoUrl,
  }).where(eq(classificationExamples.id, id));

  revalidatePath("/admin/classifications");
  revalidatePath("/classifications");
}

export async function deleteClassificationExample(id: number) {
  if (!(await checkIsAdmin())) throw new Error("Unauthorized");
  await db.delete(classificationExamples).where(eq(classificationExamples.id, id));
  revalidatePath("/admin/classifications");
  revalidatePath("/classifications");
}
