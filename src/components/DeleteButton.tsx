"use client";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

const MySwal = withReactContent(Swal);

export function DeleteButton({ 
  onDelete, 
  itemType = "elemento",
  article = "El",
  redirectTo,
}: { 
  onDelete: () => Promise<boolean>;
  itemType?: string;
  article?: string;
  redirectTo?: string;
}) {
  const router = useRouter();
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
      background: "#0f172a", // Dark background
      color: "#f8fafc", // Light text
      customClass: {
        popup: "border border-slate-700 rounded-xl shadow-2xl",
        title: "text-slate-50 font-bold",
        htmlContainer: "text-slate-300",
      }
    }).then((result) => {
      if (result.isConfirmed) {
        startTransition(async () => {
          try {
            const success = await onDelete();
            if (success !== false) {
              // Navigate immediately to avoid the 404 flash caused by revalidatePath
              if (redirectTo) router.replace(redirectTo);
              // Show a non-blocking toast on top of the new page
              const isFeminine = article.toLowerCase() === "la";
              MySwal.mixin({
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                background: "#0f172a",
                color: "#f8fafc",
              }).fire({
                icon: "success",
                title: `${article} ${itemType} ha sido eliminad${isFeminine ? "a" : "o"} con éxito.`,
              });
            } else {
              MySwal.fire({
                title: "Error",
                text: "Hubo un problema al intentar eliminarlo.",
                icon: "error",
                background: "#0f172a",
                color: "#f8fafc",
                confirmButtonColor: "hsl(var(--primary))",
              });
            }
          } catch (error) {
            MySwal.fire({
              title: "Error",
              text: "Hubo un problema al intentar eliminarlo.",
              icon: "error",
              background: "#0f172a",
              color: "#f8fafc",
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
