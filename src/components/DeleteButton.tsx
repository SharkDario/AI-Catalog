"use client";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { Trash2 } from "lucide-react";
import { useTransition } from "react";

const MySwal = withReactContent(Swal);

export function DeleteButton({ 
  onDelete, 
  itemType = "elemento" 
}: { 
  onDelete: () => Promise<void>;
  itemType?: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    MySwal.fire({
      title: `¿Eliminar ${itemType}?`,
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "hsl(var(--destructive))",
      cancelButtonColor: "hsl(var(--muted))",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      background: "hsl(var(--card))",
      color: "hsl(var(--foreground))",
      customClass: {
        popup: "border border-border rounded-xl shadow-2xl",
        title: "text-foreground font-bold",
        htmlContainer: "text-muted-foreground",
      }
    }).then((result) => {
      if (result.isConfirmed) {
        startTransition(async () => {
          try {
            await onDelete();
            MySwal.fire({
              title: "¡Eliminado!",
              text: `El ${itemType} ha sido eliminado con éxito.`,
              icon: "success",
              background: "hsl(var(--card))",
              color: "hsl(var(--foreground))",
              confirmButtonColor: "hsl(var(--primary))",
              customClass: {
                popup: "border border-border rounded-xl shadow-2xl",
              }
            });
          } catch (error) {
            MySwal.fire({
              title: "Error",
              text: "Hubo un problema al intentar eliminarlo.",
              icon: "error",
              background: "hsl(var(--card))",
              color: "hsl(var(--foreground))",
              confirmButtonColor: "hsl(var(--primary))",
            });
          }
        });
      }
    });
  };

  return (
    <button 
      type="button" 
      onClick={handleDelete}
      disabled={isPending}
      className="text-destructive hover:bg-destructive/10 p-2 rounded-md transition-colors disabled:opacity-50"
      title={`Eliminar ${itemType}`}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
