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
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md w-full">
        <h1 className="text-6xl font-bold">404</h1>
        <p className="mt-2 text-muted-foreground">Página no encontrada</p>

        <Link
          to="/"
          className="mt-6 inline-flex px-4 py-2 rounded-md bg-primary text-primary-foreground"
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
    <div className="min-h-screen w-full flex items-center justify-center px-4">
      <div className="text-center max-w-md w-full">
        <h1 className="text-xl font-semibold">Algo salió mal</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Error inesperado en la aplicación
        </p>

        <button
          className="mt-6 px-4 py-2 rounded-md bg-primary text-primary-foreground"
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
   ROOT FIX REAL
========================= */
function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="w-full min-h-screen overflow-x-hidden flex flex-col">
        <SiteHeader />

        {/* 🔥 CLAVE REAL: ESTE WRAPPER EVITA “DE COSTADO” */}
        <main className="flex-1 w-full min-w-0 overflow-x-hidden">
          <div className="w-full max-w-full overflow-x-hidden">
            <Outlet />
          </div>
        </main>

        <SiteFooter />
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

/* =========================
   HTML SHELL
========================= */
function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>

      <body className="w-full min-h-screen overflow-x-hidden bg-background text-foreground antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}