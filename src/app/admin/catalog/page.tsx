import { db } from "@/db";
import { classifications, softwareItems } from "@/db/schema";
import { deleteSoftwareItem } from "@/lib/actions/admin";
import { Edit } from "lucide-react";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { DeleteButton } from "@/components/DeleteButton";
import { SaveSuccessToast } from "@/components/SaveSuccessToast";
import { SoftwareForm } from "@/components/SoftwareForm";
import { Suspense } from "react";

export default async function AdminCatalog({ searchParams }: { searchParams: Promise<{ edit?: string; saved?: string }> }) {
  const resolvedParams = await searchParams;
  const editId = resolvedParams.edit ? parseInt(resolvedParams.edit, 10) : null;

  const data = await db.select({
    software: softwareItems,
    classification: classifications.name
  }).from(softwareItems).leftJoin(classifications, eq(softwareItems.classificationId, classifications.id)).orderBy(softwareItems.id);
  
  const classes = await db.select().from(classifications).orderBy(classifications.name);

  const editingItem = editId ? data.find(d => d.software.id === editId)?.software : null;

  return (
    <div className="space-y-8">
      <Suspense fallback={null}>
        <SaveSuccessToast
          messageCreate="Software guardado con éxito."
          messageUpdate="Software actualizado con éxito."
        />
      </Suspense>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Gestión de Catálogo</h1>
        {editingItem && (
          <Link href="/admin/catalog" className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md font-medium hover:opacity-90">
            Cancelar Edición
          </Link>
        )}
      </div>

      <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-card-foreground">
          {editingItem ? `Editar Software: ${editingItem.name}` : "Añadir Nuevo Software"}
        </h2>
        <SoftwareForm key={editingItem?.id ?? "new"} editingItem={editingItem ?? null} classes={classes} />
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary text-secondary-foreground border-b border-border">
            <tr>
              <th className="px-6 py-3 font-medium">ID</th>
              <th className="px-6 py-3 font-medium">Nombre</th>
              <th className="px-6 py-3 font-medium hidden lg:table-cell">Tipo</th>
              <th className="px-6 py-3 font-medium hidden md:table-cell">Categoría</th>
              <th className="px-6 py-3 font-medium hidden sm:table-cell">Licencia / Año</th>
              <th className="px-6 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((item) => (
              <tr key={item.software.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4">{item.software.id}</td>
                <td className="px-6 py-4 font-medium text-primary">
                  {item.software.name}
                  <div className="text-xs text-muted-foreground mt-1 block sm:hidden">
                    {item.software.licenseType} • {item.software.releaseYear}
                  </div>
                </td>
                <td className="px-6 py-4 hidden lg:table-cell">
                  <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full font-medium">{item.software.type}</span>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">{item.classification}</td>
                <td className="px-6 py-4 hidden sm:table-cell text-muted-foreground">
                  {item.software.licenseType} <br/>
                  {item.software.releaseYear}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/catalog?edit=${item.software.id}`} className="text-blue-500 hover:bg-blue-500/10 p-2 rounded-md transition-colors" title="Editar">
                      <Edit className="h-4 w-4" />
                    </Link>
                    <DeleteButton 
                      onDelete={async () => {
                        "use server";
                        return await deleteSoftwareItem(item.software.id);
                      }} 
                      itemType="software"
                      article="El"
                      redirectTo="/admin/catalog"
                    />
                  </div>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                  No hay software registrado en el catálogo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
