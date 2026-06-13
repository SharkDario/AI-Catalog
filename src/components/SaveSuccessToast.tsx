"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

/**
 * Drop this component into any admin page that has a form.
 * After a successful server action the action redirects to `?saved=1`
 * (optionally `?saved=created` or `?saved=updated`).
 * This component detects that flag, fires a SweetAlert toast, then
 * cleans the URL so the toast doesn't fire again on refresh.
 */
export function SaveSuccessToast({
  messageCreate = "Elemento guardado con éxito.",
  messageUpdate = "Elemento actualizado con éxito.",
}: {
  messageCreate?: string;
  messageUpdate?: string;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const saved = searchParams.get("saved");

  useEffect(() => {
    if (!saved) return;

    const message =
      saved === "updated" ? messageUpdate : messageCreate;

    MySwal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3500,
      timerProgressBar: true,
      background: "#0f172a",
      color: "#f8fafc",
    }).fire({
      icon: "success",
      title: message,
    });

    // Remove ?saved from the URL so it doesn't retrigger on refresh
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.delete("saved");
    const newUrl = params.toString() ? `${pathname}?${params}` : pathname;
    router.replace(newUrl);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved]);

  return null;
}
