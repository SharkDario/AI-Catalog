import { UserProfile } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { Settings } from "lucide-react";

export default async function SettingsPage() {
  const user = await currentUser();

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 text-foreground flex items-center gap-3">
          <Settings className="w-10 h-10 text-primary" /> Configuración
        </h1>
        <p className="text-lg text-muted-foreground">Administra tu perfil y preferencias de cuenta.</p>
      </div>
      
      {!user ? (
        <div className="bg-card border border-border rounded-2xl p-12 shadow-sm text-center">
          <h2 className="text-2xl font-bold mb-4">Debes iniciar sesión</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Para ver o modificar tus ajustes de cuenta, debes estar autenticado en la plataforma.
          </p>
          <Link href="/sign-in" className="inline-flex items-center justify-center bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity">
            Ingresar a mi cuenta
          </Link>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden flex justify-center py-10 shadow-sm">
          <UserProfile routing="hash" />
        </div>
      )}
    </div>
  );
}
