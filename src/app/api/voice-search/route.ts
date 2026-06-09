import { NextResponse } from "next/server";
import { db } from "@/db";
import { softwareItems, classifications } from "@/db/schema";
import { ilike, or } from "drizzle-orm";
import * as cheerio from "cheerio";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query, url } = body;

    if (!query) {
      return NextResponse.json({ error: "No query provided" }, { status: 400 });
    }

    // 2. Obtain context in parallel
    const [dbResults, webContext] = await Promise.all([
      fetchDbContext(query),
      fetchWebContext(url)
    ]);

    const sources = ["db"];
    if (webContext) sources.push("web");

    // 3. Prepare Prompt for Ollama
    const prompt = `Eres un asistente de AI Catalog.
Contexto de la base de datos (resultados relevantes):
${JSON.stringify(dbResults)}

Contexto de la página web consultada:
${webContext ? webContext.substring(0, 3000) : "No se proveyó URL o no se pudo extraer contenido."}

Pregunta del usuario: ${query}

Responde en español, de forma concisa y amigable, utilizando la información provista. Si no sabes la respuesta basada en el contexto, dilo.`;

    // 4. Call Ollama
    const ollamaResponse = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2:3b",
        prompt: prompt,
        stream: false,
      }),
    });

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama error: ${ollamaResponse.statusText}`);
    }

    const ollamaData = await ollamaResponse.json();

    // 5. Return result
    return NextResponse.json({
      answer: ollamaData.response,
      sources,
    });
  } catch (error: any) {
    console.error("Voice Search API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function fetchDbContext(query: string) {
  const searchTerm = `%${query}%`;
  
  // Search in software
  const softwareMatches = await db.select()
    .from(softwareItems)
    .where(
      or(
        ilike(softwareItems.name, searchTerm),
        ilike(softwareItems.description, searchTerm),
        ilike(softwareItems.objective, searchTerm)
      )
    )
    .limit(3);

  // Search in classifications
  const classMatches = await db.select()
    .from(classifications)
    .where(
      or(
        ilike(classifications.name, searchTerm),
        ilike(classifications.description, searchTerm)
      )
    )
    .limit(2);

  return { softwareMatches, classMatches };
}

async function fetchWebContext(url?: string) {
  if (!url) return null;
  
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Extract visible text (basic)
    $("script, style, noscript").remove();
    const text = $("body").text().replace(/\s+/g, " ").trim();
    return text;
  } catch (error) {
    console.error("Scraping error:", error);
    return null;
  }
}
