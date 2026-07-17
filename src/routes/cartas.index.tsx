import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, X, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchLetters, formatDate, type Letter } from "@/lib/letters";
import { countryToFlag } from "@/lib/country-flag";

export const Route = createFileRoute("/cartas/")({
  head: () => ({
    meta: [
      { title: "Archivo de cartas · Una Carta Para Messi" },
      {
        name: "description",
        content:
          "Archivo mundial de cartas enviadas a Lionel Messi.",
      },
    ],
  }),
  component: CartasPage,
});

const PAGE_SIZE = 50;

function excerpt(text: string, max = 55) {
  const clean = text.replace(/\s+/g, " ").trim();

  return clean.length <= max
    ? clean
    : clean.slice(0, max - 1).trimEnd() + "…";
}

function CartasPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["letters", "all"],
    queryFn: () => fetchLetters(10000),
  });

  const letters = [...(data ?? [])].sort(
  (a, b) =>
    new Date(b.created_at).getTime() -
    new Date(a.created_at).getTime(),
);

  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [author, setAuthor] = useState("");
  const [year, setYear] = useState("");
  const [page, setPage] = useState(1);

  const { countries, cities, years } = useMemo(() => {
    const countriesSet = new Set<string>();
    const citiesSet = new Set<string>();
    const yearsSet = new Set<string>();

    for (const letter of letters) {
      if (letter.country) countriesSet.add(letter.country);
      if (letter.city) citiesSet.add(letter.city);

      if (letter.created_at) {
        yearsSet.add(
          new Date(letter.created_at)
            .getFullYear()
            .toString(),
        );
      }
    }

    return {
      countries: [...countriesSet].sort(),
      cities: [...citiesSet].sort(),
      years: [...yearsSet].sort((a, b) =>
        b.localeCompare(a),
      ),
    };
  }, [letters]);

  const filtered = useMemo(() => {
    const search = q.trim().toLowerCase();
    const authorSearch = author.trim().toLowerCase();

    return letters.filter((letter) => {
      if (country && letter.country !== country) return false;
      if (city && letter.city !== city) return false;

      if (
        year &&
        new Date(letter.created_at)
          .getFullYear()
          .toString() !== year
      ) {
        return false;
      }

      if (
        authorSearch &&
        !letter.author_name
          .toLowerCase()
          .includes(authorSearch)
      ) {
        return false;
      }

      if (search) {
        const text =
          `${letter.author_name} ${letter.country ?? ""} ${
            letter.city ?? ""
          } ${letter.content}`.toLowerCase();

        if (!text.includes(search)) return false;
      }

      return true;
    });
  }, [
    letters,
    q,
    country,
    city,
    author,
    year,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / PAGE_SIZE),
  );

  const currentPage = Math.min(page, totalPages);

  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const hasFilters =
    q || country || city || author || year;

  function resetFilters() {
    setQ("");
    setCountry("");
    setCity("");
    setAuthor("");
    setYear("");
    setPage(1);
  }

  return (
    <main className="mx-auto max-w-7xl px-3 py-8 sm:px-5">
      <header className="border-b border-border pb-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          Archivo mundial
        </p>

        <h1 className="mt-2 font-serif text-3xl sm:text-5xl">
          Cartas para Lionel Messi
        </h1>

        <p className="mt-2 max-w-xl text-xs text-muted-foreground">
          Una colección de mensajes enviados desde todo
          el mundo.
        </p>
      </header>

      <section className="mt-5 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar carta..."
            className="h-9 pl-9 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <select
            value={country}
            onChange={(e) => {
              setCountry(e.target.value);
              setPage(1);
            }}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs"
          >
            <option value="">País</option>

            {countries.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setPage(1);
            }}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs"
          >
            <option value="">Ciudad</option>

            {cities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <Input
            value={author}
            onChange={(e) => {
              setAuthor(e.target.value);
              setPage(1);
            }}
            placeholder="Autor"
            className="h-8 text-xs"
          />

          <select
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
              setPage(1);
            }}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs"
          >
            <option value="">Año</option>

            {years.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="font-mono uppercase tracking-wider">
            {isLoading
              ? "Cargando..."
              : `${filtered.length.toLocaleString(
                  "es-AR",
                )} cartas`}
          </span>

          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 hover:text-foreground"
            >
              <X className="h-3 w-3" />
              Limpiar
            </button>
          )}
        </div>
      </section>

      <section className="mt-5">
        {isLoading && (
          <div className="grid grid-cols-2 gap-2 min-[390px]:grid-cols-3 md:grid-cols-5">
            {Array.from({ length: 25 }).map((_, index) => (
              <div
                key={index}
                className="h-24 rounded-md bg-muted/30 animate-pulse"
              />
            ))}
          </div>
        )}

        {!isLoading && pageItems.length === 0 && (
          <div className="rounded-md border border-border p-8 text-center text-xs text-muted-foreground">
            No hay cartas con esos filtros.
          </div>
        )}

        {!isLoading && pageItems.length > 0 && (
          <div
            className="
              grid
              grid-cols-2
              gap-2
              min-[390px]:grid-cols-3
              md:grid-cols-4
              lg:grid-cols-5
            "
          >
            {pageItems.map((letter, index) => (
              <LetterCard
                key={letter.id}
                letter={letter}
                number={
  letters.length -
  ((currentPage - 1) * PAGE_SIZE + index)
}
              />
            ))}
          </div>
        )}
      </section>

      {totalPages > 1 && (
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          onChange={setPage}
        />
      )}

      <div className="mt-6 text-center">
        <Button
          asChild
          variant="outline"
          size="sm"
        >
          <Link to="/escribir">
            Escribir una carta
          </Link>
        </Button>
      </div>
    </main>
  );
}

function LetterCard({
  letter,
  number,
}: {
  letter: Letter;
  number: number;
}) {
  const flag = countryToFlag(letter.country);

  return (
    <Link
      to="/cartas/$id"
      params={{ id: letter.id }}
      className="
        group
        min-h-[130px]
        rounded-md
        border
        border-border
        p-2
        transition
        hover:bg-muted/40
      "
    >
      <div className="flex items-center justify-between">
        <span className="text-base">
          {flag ?? "🌎"}
        </span>

        <span className="font-mono text-[8px] text-muted-foreground">
          #{number}
        </span>
      </div>

      <p className="mt-1 truncate font-serif text-xs">
        {letter.author_name}
      </p>

      <p className="truncate text-[9px] text-muted-foreground">
        {[letter.city, letter.country]
          .filter(Boolean)
          .join(" · ") || "Sin ubicación"}
      </p>

      <p className="mt-2 line-clamp-3 text-[10px] leading-tight text-foreground/80">
        {excerpt(letter.content)}
      </p>
            <div className="mt-2 flex items-center justify-between border-t border-border pt-1">
        <span className="font-mono text-[8px] uppercase text-muted-foreground">
          {formatDate(letter.created_at)}
        </span>

        <ArrowRight className="h-3 w-3 text-muted-foreground transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  const pages: (number | "…")[] = [];

  const window = 1;

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= page - window && i <= page + window)
    ) {
      pages.push(i);
    } else if (
      pages[pages.length - 1] !== "…"
    ) {
      pages.push("…");
    }
  }

  return (
    <nav className="mt-6 flex items-center justify-center gap-1 font-mono text-[10px]">
      <button
        type="button"
        onClick={() =>
          onChange(Math.max(1, page - 1))
        }
        disabled={page === 1}
        className="
          rounded border border-border
          px-2 py-1
          hover:bg-muted
          disabled:opacity-40
        "
      >
        ←
      </button>

      {pages.map((item, index) =>
        item === "…" ? (
          <span
            key={`dots-${index}`}
            className="px-1 text-muted-foreground"
          >
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            className={`
              rounded border px-2 py-1
              ${
                item === page
                  ? "border-foreground bg-foreground text-background"
                  : "border-border hover:bg-muted"
              }
            `}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() =>
          onChange(Math.min(totalPages, page + 1))
        }
        disabled={page === totalPages}
        className="
          rounded border border-border
          px-2 py-1
          hover:bg-muted
          disabled:opacity-40
        "
      >
        →
      </button>
    </nav>
  );
}
