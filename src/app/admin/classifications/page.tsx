import { db } from "@/db";
import { classifications } from "@/db/schema";
import { createClassification, deleteClassification, updateClassification } from "@/lib/actions/admin";
import { Edit, ListPlus } from "lucide-react";
import Link from "next/link";
import { DeleteButton } from "@/components/DeleteButton";
import { SaveSuccessToast } from "@/components/SaveSuccessToast";
import { Suspense } from "react";

export default async function AdminClassifications({ searchParams }: { searchParams: Promise<{ edit?: string; saved?: string }> }) {
  const resolvedParams = await searchParams;
  const editId = resolvedParams.edit ? parseInt(resolvedParams.edit, 10) : null;

  const data = await db.select().from(classifications).orderBy(classifications.id);

  const editingItem = editId ? data.find(d => d.id === editId) : null;

  return (
    <div className="space-y-8">
      <Suspense fallback={null}>
        <SaveSuccessToast
          messageCreate="Clasificación guardada con éxito."
          messageUpdate="Clasificación actualizada con éxito."
        />
      </Suspense>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Gestión de Clasificaciones</h1>
        {editingItem && (
          <Link href="/admin/classifications" className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md font-medium hover:opacity-90">
            Cancelar Edición
          </Link>
        )}
      </div>

      <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-card-foreground">
          {editingItem ? `Editar Clasificación: ${editingItem.name}` : "Añadir Nueva Clasificación"}
        </h2>
        <form action={editingItem ? updateClassification.bind(null, editingItem.id) : createClassification} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre</label>
              <input name="name" defaultValue={editingItem?.name} required className="w-full bg-background border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-ring focus:outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">URL de Imagen</label>
              <input name="imageUrl" defaultValue={editingItem?.imageUrl || ""} className="w-full bg-background border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-ring focus:outline-none" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Descripción</label>
              <textarea name="description" defaultValue={editingItem?.description} required rows={3} className="w-full bg-background border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-ring focus:outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Enlaces Útiles</label>
              <input name="usefulLinks" defaultValue={editingItem?.usefulLinks || ""} className="w-full bg-background border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-ring focus:outline-none" />
            </div>
          </div>
          <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:opacity-90 transition-opacity">
            {editingItem ? "Actualizar Clasificación" : "Guardar Clasificación"}
          </button>
        </form>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary text-secondary-foreground border-b border-border">
            <tr>
              <th className="px-6 py-3 font-medium">ID</th>
              <th className="px-6 py-3 font-medium">Nombre</th>
              <th className="px-6 py-3 font-medium hidden md:table-cell">Descripción</th>
              <th className="px-6 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4">{item.id}</td>
                <td className="px-6 py-4 font-medium text-primary">{item.name}</td>
                <td className="px-6 py-4 max-w-xs truncate hidden md:table-cell text-muted-foreground">{item.description}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/classifications/${item.id}`} className="text-emerald-500 hover:bg-emerald-500/10 p-2 rounded-md transition-colors" title="Gestionar Ejemplos">
                      <ListPlus className="h-4 w-4" />
                    </Link>
                    <Link href={`/admin/classifications?edit=${item.id}`} className="text-blue-500 hover:bg-blue-500/10 p-2 rounded-md transition-colors" title="Editar">
                      <Edit className="h-4 w-4" />
                    </Link>
                    <DeleteButton 
                      onDelete={async () => {
                        "use server";
                        return await deleteClassification(item.id);
                      }} 
                      itemType="clasificación"
                      article="La"
                      redirectTo="/admin/classifications"
                    />
                  </div>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                  No hay clasificaciones registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
