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
      className="group block w-full min-w-0 h-full rounded-lg border border-border bg-card p-6 transition-shadow hover:shadow-sm overflow-hidden"
    >
      {/* location */}
      {location && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
          {flag ? (
            <span className="text-lg leading-none shrink-0" aria-label={letter.country ?? ""}>
              {flag}
            </span>
          ) : null}

          <span className="truncate min-w-0">
            {location}
          </span>
        </div>
      )}

      {/* author */}
      <h3 className="mt-3 font-serif text-2xl leading-tight text-foreground group-hover:underline break-words">
        {letter.author_name}
      </h3>

      {/* date */}
      <p className="mt-1 text-xs text-muted-foreground">
        {formatDate(letter.created_at)}
      </p>

      <div className="my-4 h-px w-10 bg-border" />

      {/* content */}
      <div className="space-y-4">
        <p
          className={`text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap break-words min-w-0 ${
            clamp ? "line-clamp-5" : ""
          }`}
        >
          {letter.content}
        </p>

        {/* Traducción automática si existe y es distinta */}
        {letter.content_es && letter.content_es !== letter.content && (
          <div className="pt-4 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">
              Traducción al español:
            </p>
            <p
              className={`text-sm leading-relaxed text-gray-600 italic whitespace-pre-wrap break-words min-w-0 ${
                clamp ? "line-clamp-3" : ""
              }`}
            >
              {letter.content_es}
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}