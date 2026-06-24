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
      className="group flex h-full flex-col rounded-lg border border-border bg-card p-6 transition-shadow hover:shadow-sm"
    >
      {location && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {flag ? (
            <span className="text-lg leading-none" aria-label={letter.country ?? ""}>
              {flag}
            </span>
          ) : null}
          <span>{location}</span>
        </div>
      )}

      <h3 className="mt-3 font-serif text-2xl leading-tight text-foreground group-hover:underline">
        {letter.author_name}
      </h3>

      <p className="mt-1 text-xs text-muted-foreground">
        {formatDate(letter.created_at)}
      </p>

      <div className="my-4 h-px w-10 bg-border" />

      <p
        className={`text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap ${
          clamp ? "line-clamp-5" : ""
        }`}
      >
        {letter.content}
      </p>
    </Link>
  );
}
