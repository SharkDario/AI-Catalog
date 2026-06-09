import { NextResponse } from "next/server";
import { db } from "@/db";
import { softwareItems } from "@/db/schema";
import { ilike, or } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query } = body;

    if (!query) {
      return NextResponse.json({ error: "No query provided" }, { status: 400 });
    }

    // 1. Search DB for matching software
    const searchTerm = `%${query}%`;
    const results = await db.select()
      .from(softwareItems)
      .where(
        or(
          ilike(softwareItems.name, searchTerm),
          ilike(softwareItems.description, searchTerm)
        )
      )
      .limit(3);

    // 2. Prepare Context
    const dbContext = results.map(r => `- ${r.name}: ${r.description}`).join("\n");

    // 3. Prompt Ollama
    const prompt = `Eres un asistente de AI Catalog accesible para personas sordas en Argentina que usan la Lengua de Señas Argentina (LSA).
El usuario deletreó mediante el alfabeto manual de LSA la palabra/letras: "${query}"

Resultados relevantes encontrados en la base de datos:
${dbContext || "No se encontraron resultados directos."}

Tu tarea:
Si hay resultados, sugiere los 3 más relevantes explicando brevemente por qué coinciden con lo que deletreó el usuario. 
Si no hay resultados, pide amablemente que intente deletrear otra palabra.
Responde en español de Argentina, usando un lenguaje sumamente claro, directo y con alto contraste semántico (textos cortos, oraciones simples) ideal para accesibilidad cognitiva y rápida traducción mental a LSA.`;

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

    // 5. Return JSON
    return NextResponse.json({
      results: results,
      explanation: ollamaData.response,
    });
  } catch (error: any) {
    console.error("Sign Search API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
