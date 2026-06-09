import { db } from "@/db";
import { classifications, classificationExamples } from "@/db/schema";
import { createClassificationExample, deleteClassificationExample, updateClassificationExample } from "@/lib/actions/admin";
import { Edit, ArrowLeft } from "lucide-react";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/DeleteButton";

export default async function AdminClassificationExamples({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ edit?: string }> }) {
  const resolvedParams = await params;
  const classificationId = parseInt(resolvedParams.id, 10);
  if (isNaN(classificationId)) notFound();

  const resolvedSearchParams = await searchParams;
  const editId = resolvedSearchParams.edit ? parseInt(resolvedSearchParams.edit, 10) : null;

  const [classification] = await db.select().from(classifications).where(eq(classifications.id, classificationId));
  if (!classification) notFound();

  const examples = await db.select().from(classificationExamples).where(eq(classificationExamples.classificationId, classificationId)).orderBy(classificationExamples.id);

  const editingItem = editId ? examples.find(e => e.id === editId) : null;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/admin/classifications" className="inline-flex items-center text-muted-foreground hover:text-primary mb-2 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Clasificaciones
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Ejemplos de: {classification.name}</h1>
        </div>
        {editingItem && (
          <Link href={`/admin/classifications/${classificationId}`} className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md font-medium hover:opacity-90">
            Cancelar Edición
          </Link>
        )}
      </div>

      <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-card-foreground">
          {editingItem ? `Editar Ejemplo: ${editingItem.name}` : "Añadir Nuevo Ejemplo"}
        </h2>
        <form action={editingItem ? updateClassificationExample.bind(null, editingItem.id) : createClassificationExample} className="space-y-4">
          <input type="hidden" name="classificationId" value={classificationId} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre</label>
              <input name="name" defaultValue={editingItem?.name} required className="w-full bg-background border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-ring focus:outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">URL de Imagen</label>
              <input name="imageUrl" defaultValue={editingItem?.imageUrl || ""} className="w-full bg-background border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-ring focus:outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">URL de Video</label>
              <input name="videoUrl" defaultValue={editingItem?.videoUrl || ""} className="w-full bg-background border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-ring focus:outline-none" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Descripción</label>
              <textarea name="description" required defaultValue={editingItem?.description} rows={3} className="w-full bg-background border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-ring focus:outline-none" />
            </div>
          </div>
          <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:opacity-90 transition-opacity">
            {editingItem ? "Actualizar Ejemplo" : "Guardar Ejemplo"}
          </button>
        </form>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary text-secondary-foreground border-b border-border">
            <tr>
              <th className="px-6 py-3 font-medium">Nombre</th>
              <th className="px-6 py-3 font-medium hidden md:table-cell">Descripción</th>
              <th className="px-6 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {examples.map((item) => (
              <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 font-medium text-primary">{item.name}</td>
                <td className="px-6 py-4 max-w-xs truncate hidden md:table-cell text-muted-foreground">{item.description}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/classifications/${classificationId}?edit=${item.id}`} className="text-blue-500 hover:bg-blue-500/10 p-2 rounded-md transition-colors" title="Editar">
                      <Edit className="h-4 w-4" />
                    </Link>
                    <DeleteButton 
                      onDelete={async () => {
                        "use server";
                        await deleteClassificationExample(item.id);
                      }} 
                      itemType="ejemplo" 
                    />
                  </div>
                </td>
              </tr>
            ))}
            {examples.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">
                  No hay ejemplos registrados para esta clasificación.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
