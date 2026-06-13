"use client";

import { useState, useTransition } from "react";
import { createSoftwareItem, updateSoftwareItem } from "@/lib/actions/admin";

type Classification = { id: number; name: string };

type SoftwareItem = {
  id: number;
  name: string;
  type: string;
  classificationId: number;
  objective: string;
  accessUrl: string;
  licenseType: string;
  releaseYear: number;
  author: string;
  description: string | null;
  videoUrl: string | null;
};

export function SoftwareForm({
  editingItem,
  classes,
}: {
  editingItem: SoftwareItem | null;
  classes: Classification[];
}) {
  const [isPending, startTransition] = useTransition();
  // Controlled state so the correct value is ALWAYS shown, regardless of React reconciliation
  const [selectedType, setSelectedType] = useState(editingItem?.type ?? "App");
  const [selectedClassId, setSelectedClassId] = useState(
    String(editingItem?.classificationId ?? "")
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      if (editingItem) {
        await updateSoftwareItem(editingItem.id, formData);
      } else {
        await createSoftwareItem(formData);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Nombre</label>
          <input
            name="name"
            defaultValue={editingItem?.name}
            required
            className="w-full bg-background border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-ring focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Tipo</label>
          <select
            name="type"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            required
            className="w-full bg-background border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-ring focus:outline-none text-foreground"
          >
            <option value="App">App</option>
            <option value="Librería">Librería</option>
            <option value="Modelo">Modelo</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Categoría (Clasificación)</label>
          <select
            name="classificationId"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            required
            className="w-full bg-background border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-ring focus:outline-none text-foreground"
          >
            <option value="">Seleccione...</option>
            {classes.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Propósito / Objetivo</label>
          <input
            name="objective"
            defaultValue={editingItem?.objective}
            required
            className="w-full bg-background border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-ring focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Enlace de Acceso</label>
          <input
            name="accessUrl"
            type="url"
            defaultValue={editingItem?.accessUrl}
            required
            className="w-full bg-background border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-ring focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Licencia</label>
          <input
            name="licenseType"
            defaultValue={editingItem?.licenseType}
            required
            placeholder="Ej. Open Source, Freemium"
            className="w-full bg-background border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-ring focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Año de Lanzamiento</label>
          <input
            name="releaseYear"
            type="number"
            defaultValue={editingItem?.releaseYear}
            required
            className="w-full bg-background border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-ring focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Autor / Referencia</label>
          <input
            name="author"
            defaultValue={editingItem?.author}
            required
            className="w-full bg-background border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-ring focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">URL de Video Demostrativo</label>
          <input
            name="videoUrl"
            defaultValue={editingItem?.videoUrl || ""}
            className="w-full bg-background border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-ring focus:outline-none"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium">Descripción</label>
          <textarea
            name="description"
            defaultValue={editingItem?.description || ""}
            rows={3}
            className="w-full bg-background border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-ring focus:outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {isPending
          ? "Guardando..."
          : editingItem
          ? "Actualizar Software"
          : "Guardar Software"}
      </button>
    </form>
  );
}
