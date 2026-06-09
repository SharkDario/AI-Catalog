import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Catalog",
  description: "Catálogo de software de inteligencia artificial y clasificaciones.",
};

import { GlobalAccessibility } from "@/components/accessibility/GlobalAccessibility";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={esES} afterSignOutUrl="/">
      <html lang="es" className="dark">
        <body className={`${inter.className} antialiased min-h-screen flex bg-background`}>
          <Sidebar />
          <div className="flex-1 overflow-y-auto">
            <GlobalAccessibility />
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
