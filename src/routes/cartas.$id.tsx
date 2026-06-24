import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Share2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { fetchLetter, formatDate } from "@/lib/letters";
import { countryToFlag } from "@/lib/country-flag";

export const Route = createFileRoute("/cartas/$id")({
  head: () => ({
    meta: [
      { title: "Carta · Una Carta Para Messi" },
      {
        name: "description",
        content: "Una carta del archivo abierto a Lionel Messi.",
      },
    ],
  }),
  component: LetterDetail,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <p className="text-muted-foreground">No se pudo cargar la carta.</p>
      <p className="mt-2 text-xs text-muted-foreground">{error.message}</p>
      <Link to="/cartas" className="mt-6 inline-block text-sm underline">
        Volver al archivo
      </Link>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="font-serif text-3xl">Carta no encontrada</h1>
      <p className="mt-2 text-muted-foreground">
        Puede que haya sido eliminada o todavía no fue aprobada.
      </p>
      <Link to="/cartas" className="mt-6 inline-block text-sm underline">
        Volver al archivo
      </Link>
    </div>
  ),
});

function LetterDetail() {
  const { id } = Route.useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["letter", id],
    queryFn: () => fetchLetter(id),
  });

  if (error) throw error;
  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24">
        <div className="h-96 animate-pulse rounded-sm bg-muted/40" />
      </div>
    );
  }
  if (!data) throw notFound();

  const flag = countryToFlag(data.country);
  const location = [data.city, data.country].filter(Boolean).join(", ");

  const share = async () => {
    const url = window.location.href;
    const shareData = {
      title: `Carta de ${data.author_name} para Messi`,
      text: `"${data.content.slice(0, 120)}${data.content.length > 120 ? "…" : ""}" — ${data.author_name}`,
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Enlace copiado");
      }
    } catch {
      /* cancelled */
    }
  };

  return (
    <div className="bg-background text-foreground">
      {/* BARRA SUPERIOR */}
      <div className="mx-auto max-w-3xl px-4 pt-10 sm:px-6">
        <div className="flex items-center justify-between">
          <Link
            to="/cartas"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al archivo
          </Link>
          <button
            onClick={share}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <Share2 className="h-4 w-4" />
            Compartir
          </button>
        </div>
      </div>

      {/* CUERPO DE LA CARTA (Tipografía estilizada y contenida) */}
      <article className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
        <header className="text-center">
          {(location || flag) && (
            <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {flag && <span className="text-base leading-none">{flag}</span>}
              <span>{location || data.country}</span>
            </div>
          )}
          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {formatDate(data.created_at)}
          </p>
          <div className="mx-auto mt-6 h-px w-12 bg-border" />
        </header>

        <div className="mt-10">
          <p className="font-serif text-xl leading-relaxed text-foreground sm:text-2xl">
            Querido Leo,
          </p>

          <div className="mt-5 whitespace-pre-wrap font-serif text-lg leading-relaxed text-foreground/90 sm:text-xl sm:leading-loose">
            {data.content}
          </div>
        </div>

        <footer className="mt-12">
          <div className="ml-auto max-w-xs text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Con cariño,
            </p>
            <p
              className="mt-2 text-3xl text-foreground sm:text-4xl"
              style={{ fontFamily: '"Caveat", "Dancing Script", cursive' }}
            >
              {data.author_name}
            </p>
            {location && (
              <p className="mt-1 text-xs text-muted-foreground">
                {flag && <span className="mr-1">{flag}</span>}
                {location}
              </p>
            )}
          </div>
        </footer>
      </article>

      {/* BOTONES SIGUIENTE / ANTERIOR (Compactos) */}
      <div className="mx-auto max-w-2xl px-4 py-4 border-t border-b border-border/60 my-6">
        <div className="flex justify-between items-center text-sm">
          {data.prevId ? (
            <Link
              to="/cartas/$id"
              params={{ id: data.prevId }}
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Link>
          ) : (
            <span className="text-xs text-muted-foreground/30 inline-flex items-center gap-1 select-none">
              <ChevronLeft className="h-4 w-4" /> Primera
            </span>
          )}

          {data.nextId ? (
            <Link
              to="/cartas/$id"
              params={{ id: data.nextId }}
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <span className="text-xs text-muted-foreground/30 inline-flex items-center gap-1 select-none">
              Última <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </div>
      </div>

      {/* INVITACIÓN A ESCRIBIR CARTA (Ajustada en tamaño normal) */}
      <div className="mx-auto max-w-2xl px-4 pb-20 text-center">
        <div className="mx-auto h-px w-12 bg-border" />
        <p className="mt-6 text-xs uppercase tracking-[0.1em] text-muted-foreground">
          ¿Vos también querés escribirle?
        </p>
        <Link
          to="/escribir"
          className="mt-2 inline-block font-serif text-base text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors"
        >
          Dejá tu carta acá
        </Link>
      </div>
    </div>
  );
}