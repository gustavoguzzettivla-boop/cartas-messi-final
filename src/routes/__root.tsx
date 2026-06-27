import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Toaster } from "@/components/ui/sonner";

/* =========================
   NOT FOUND
========================= */
function NotFoundComponent() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white px-4">
      <div className="text-center max-w-md w-full">
        <h1 className="text-6xl font-bold">404</h1>
        <p className="mt-2 text-gray-500">Página no encontrada</p>
        <Link
          to="/"
          className="mt-6 inline-flex px-6 py-2 rounded-sm bg-black text-white hover:bg-gray-800"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

/* =========================
   ERROR BOUNDARY
========================= */
function ErrorComponent({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
    reportLovableError(error, {
      boundary: "tanstack_root_error_component",
    });
  }, [error]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 bg-white">
      <div className="text-center max-w-md w-full">
        <h1 className="text-xl font-semibold">Algo salió mal</h1>
        <p className="mt-2 text-sm text-gray-500">
          Error inesperado en la aplicación
        </p>
        <button
          className="mt-6 px-6 py-2 rounded-sm bg-black text-white hover:bg-gray-800"
          onClick={() => {
            router.invalidate();
            reset();
          }}
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}

/* =========================
   ROUTE
========================= */
export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Una Carta Para Messi" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),

  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

/* =========================
   ROOT COMPONENT
========================= */
function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="relative min-h-screen w-full bg-white flex flex-col font-serif text-gray-900 selection:bg-gray-200">
        
        {/* =========================================================
            FONDO QUE SCROLLEA Y MÁS DESVANECIDO: 
            Agrandamos la imagen con max-w-[1400px] y scale-[1.15]
        ========================================================= */}
        <div className="absolute top-0 left-0 right-0 z-0 pointer-events-none flex justify-center pt-20 overflow-hidden">
          <div 
            className="w-full max-w-[1400px] h-[85vh] bg-[url('/fondo-messi.jpg')] bg-contain bg-top bg-no-repeat opacity-40 scale-[1.15]"
            style={{ 
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)'
            }}
          />
        </div>

        {/* =========================================================
            CAPA SUPERIOR (TEXTO Y NAVEGACIÓN): 
            El z-10 asegura que todo se mantenga por encima de la foto.
        ========================================================= */}
        <div className="relative z-10 flex flex-col min-h-screen">
          <SiteHeader />

          {/* El Outlet inyecta el contenido de tus páginas aquí */}
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-12">
            <Outlet />
          </main>

          <SiteFooter />
          <Toaster />
        </div>

      </div>
    </QueryClientProvider>
  );
}

/* =========================
   HTML SHELL
========================= */
export function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>

      <body className="w-full min-h-screen overflow-x-hidden antialiased bg-white">
        {children}
        <Scripts />
      </body>
    </html>
  );
}