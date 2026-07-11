import { Link } from "@tanstack/react-router";
import { formatDate, type Letter } from "@/lib/letters";
import { countryToFlag } from "@/lib/country-flag";

export function LetterCard({
  letter,
  clamp = true,
}: {
  letter: Letter;
  clamp?: boolean;
}) {
  const flag = countryToFlag(letter.country);
  const location = [letter.country, letter.city].filter(Boolean).join(" · ");

  return (
    <Link
      to="/cartas/$id"
      params={{ id: letter.id }}
      className="group block h-full w-full min-w-0 overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md"
    >
      {/* Ubicación */}
      {location && (
        <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
          {flag ? (
            <span
              className="shrink-0 text-lg leading-none"
              aria-label={letter.country ?? ""}
            >
              {flag}
            </span>
          ) : null}

          <span className="min-w-0 truncate">
            {location}
          </span>
        </div>
      )}

      {/* Autor */}
      <h3 className="mt-3 break-words font-serif text-xl leading-tight text-foreground">
        {letter.author_name}
      </h3>

      {/* Fecha */}
      <p className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
        {formatDate(letter.created_at)}
      </p>

      <div className="my-3 h-px w-8 bg-border" />

      {/* Contenido */}
      <div className="space-y-4">
        <p
          className={`min-w-0 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/80 ${
            clamp ? "line-clamp-4" : ""
          }`}
        >
          {letter.content}
        </p>

        {/* Traducción automática */}
        {letter.content_es && letter.content_es !== letter.content && (
          <div className="border-t border-gray-100 pt-4">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Traducción al español
            </p>

            <p
              className={`min-w-0 whitespace-pre-wrap break-words text-sm italic leading-relaxed text-gray-600 ${
                clamp ? "line-clamp-3" : ""
              }`}
            >
              {letter.content_es}
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
        Leer carta
        <span className="ml-1 transition-transform duration-200 group-hover:translate-x-1">
          →
        </span>
      </div>
    </Link>
  );
}