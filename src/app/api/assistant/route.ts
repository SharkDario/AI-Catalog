import { NextResponse } from "next/server";
import { db } from "@/db";
import { softwareItems, classifications } from "@/db/schema";
import { ilike, or } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    // Extraer la última consulta del usuario para buscar en la BD
    const lastUserMessage = [...messages].reverse().find(m => m.role === "user");
    const query = lastUserMessage ? lastUserMessage.content : "";

    let contextText = "No se encontraron resultados locales.";

    if (query) {
      // 1. Extraer palabras clave (ignorando palabras muy cortas como "de", "la", "el", "que")
      const words = query.toLowerCase().split(/[\s\W]+/).filter((w: string) => w.length > 3);
      if (words.length === 0) words.push(query.toLowerCase());

      // 2. Crear condiciones dinámicas para cada palabra
      const softwareConditions = words.flatMap((w: string) => {
        const term = `%${w}%`;
        return [
          ilike(softwareItems.name, term),
          ilike(softwareItems.description, term),
          ilike(softwareItems.objective, term)
        ];
      });

      const classConditions = words.flatMap((w: string) => {
        const term = `%${w}%`;
        return [
          ilike(classifications.name, term),
          ilike(classifications.description, term)
        ];
      });

      // 3. Buscar en software (Cualquier coincidencia parcial)
      const softwareMatches = await db.select({
        id: softwareItems.id,
        name: softwareItems.name,
        objective: softwareItems.objective,
        description: softwareItems.description
      })
        .from(softwareItems)
        .where(or(...softwareConditions))
        .limit(5);

      // 4. Buscar en clasificaciones
      const classMatches = await db.select({
        id: classifications.id,
        name: classifications.name,
        description: classifications.description
      })
        .from(classifications)
        .where(or(...classConditions))
        .limit(5);

      const formattedSoftware = softwareMatches.map(s =>
        `- SOFTWARE: [${s.name}](/catalog/${s.id})\n  Descripción: ${s.objective} ${s.description}`
      ).join("\n\n");

      const formattedClasses = classMatches.map(c =>
        `- CLASIFICACIÓN: [${c.name}](/classifications/${c.id})\n  Descripción: ${c.description}`
      ).join("\n\n");

      contextText = "";
      if (formattedSoftware) contextText += "=== SOFTWARE RELACIONADO ===\n" + formattedSoftware + "\n\n";
      if (formattedClasses) contextText += "=== CLASIFICACIONES RELACIONADAS ===\n" + formattedClasses + "\n\n";

      if (!contextText) {
        contextText = "No se encontraron resultados en la base de datos para esta consulta.";
      }
    }

    const systemPrompt = `Eres el asistente conversacional de AI Catalog, experto en inteligencia artificial.
    
Utiliza la siguiente información de la base de datos del sitio web para responder a la última pregunta del usuario.

CONTEXTO EXTRAÍDO DE LA BASE DE DATOS LOCAL:
${contextText}

Reglas:
1. Responde de forma natural, amigable y conversacional.
2. Si mencionas un Software o Clasificación de la lista anterior, DEBES utilizar el enlace Markdown exacto que se proporciona en el contexto (Ejemplo: [Nombre](/ruta)). Nunca uses la URL cruda como texto.
3. Si el contexto no tiene la respuesta, usa tus conocimientos generales, pero aclara que no está en el catálogo actual si te preguntaron explícitamente por el catálogo.
4. Recuerda el historial de la conversación que se incluye en los mensajes.
`;

    // Inyectar el system prompt al inicio
    const ollamaMessages = [
      { role: "system", content: systemPrompt },
      ...messages
    ];

    const ollamaResponse = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2:3b",
        messages: ollamaMessages,
        stream: false,
      }),
    });

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama error: ${ollamaResponse.statusText}`);
    }

    const ollamaData = await ollamaResponse.json();

    return NextResponse.json({
      answer: ollamaData.message.content
    });
  } catch (error: any) {
    console.error("Assistant API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
