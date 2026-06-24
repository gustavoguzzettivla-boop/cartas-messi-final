import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
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
          "Archivo completo de cartas enviadas a Lionel Messi. Buscá por autor, país, ciudad o fecha.",
      },
    ],
  }),
  component: CartasPage,
});

const PAGE_SIZE = 50;

function excerpt(text: string, max = 120) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : clean.slice(0, max - 1).trimEnd() + "…";
}

function CartasPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["letters", "all"],
    queryFn: () => fetchLetters(10000),
  });

  const letters = data ?? [];

  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [author, setAuthor] = useState("");
  const [year, setYear] = useState("");
  const [page, setPage] = useState(1);

  const { countries, cities, years } = useMemo(() => {
    const cSet = new Set<string>();
    const ciSet = new Set<string>();
    const ySet = new Set<string>();
    for (const l of letters) {
      if (l.country) cSet.add(l.country);
      if (l.city) ciSet.add(l.city);
      if (l.created_at) ySet.add(new Date(l.created_at).getFullYear().toString());
    }
    return {
      countries: [...cSet].sort(),
      cities: [...ciSet].sort(),
      years: [...ySet].sort((a, b) => b.localeCompare(a)),
    };
  }, [letters]);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const al = author.trim().toLowerCase();
    return letters.filter((l) => {
      if (country && l.country !== country) return false;
      if (city && l.city !== city) return false;
      if (year && new Date(l.created_at).getFullYear().toString() !== year)
        return false;
      if (al && !l.author_name.toLowerCase().includes(al)) return false;
      if (ql) {
        const hay = `${l.author_name} ${l.country ?? ""} ${l.city ?? ""} ${l.content}`.toLowerCase();
        if (!hay.includes(ql)) return false;
      }
      return true;
    });
  }, [letters, q, country, city, author, year]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const hasFilters = q || country || city || author || year;

  function resetFilters() {
    setQ("");
    setCountry("");
    setCity("");
    setAuthor("");
    setYear("");
    setPage(1);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      {/* Header */}
      <header className="border-b border-foreground/20 pb-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Archivo · Volumen I
        </p>
        <h1 className="mt-2 font-serif text-4xl text-foreground sm:text-5xl">
          Archivo de cartas
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Una colección viva de mensajes para Lionel Messi, escritos por
          personas de todo el mundo. Buscá, filtrá y leé cada carta.
        </p>
      </header>

      {/* Search + filters */}
      <div className="mt-6 space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar en autor, contenido, país o ciudad…"
            className="h-11 pl-9"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <select
            value={country}
            onChange={(e) => {
              setCountry(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="">Todos los países</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="">Todas las ciudades</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
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
            className="h-9"
          />

          <select
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="">Todos los años</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-mono uppercase tracking-wider">
            {isLoading
              ? "Cargando…"
              : `${filtered.length.toLocaleString("es-AR")} ${
                  filtered.length === 1 ? "carta" : "cartas"
                }`}
          </span>
          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 hover:text-foreground"
            >
              <X className="h-3 w-3" /> Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-md border border-border">
        {/* Header row */}
        <div className="hidden grid-cols-[28px_1fr_1fr_1.4fr_2.4fr_110px] gap-3 border-b border-border bg-muted/40 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground md:grid">
          <span></span>
          <span>País</span>
          <span>Ciudad</span>
          <span>Autor</span>
          <span>Extracto</span>
          <span className="text-right">Fecha</span>
        </div>

        {isLoading && (
          <div className="divide-y divide-border">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse bg-muted/30" />
            ))}
          </div>
        )}

        {!isLoading && pageItems.length === 0 && (
          <div className="px-4 py-16 text-center text-sm text-muted-foreground">
            No se encontraron cartas con esos filtros.
          </div>
        )}

        {!isLoading && pageItems.length > 0 && (
          <ul className="divide-y divide-border">
            {pageItems.map((l) => (
              <LetterRow key={l.id} letter={l} />
            ))}
          </ul>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          onChange={setPage}
        />
      )}

      <div className="mt-10 text-center">
        <Button asChild variant="outline">
          <Link to="/escribir">Sumar tu carta al archivo</Link>
        </Button>
      </div>
    </div>
  );
}

function LetterRow({ letter }: { letter: Letter }) {
  const flag = countryToFlag(letter.country);
  return (
    <li>
      <Link
        to="/cartas/$id"
        params={{ id: letter.id }}
        className="grid grid-cols-[28px_1fr_90px] items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40 md:grid-cols-[28px_1fr_1fr_1.4fr_2.4fr_110px]"
      >
        <span className="text-lg leading-none" aria-hidden>
          {flag ?? "·"}
        </span>

        {/* Mobile: stacked */}
        <div className="min-w-0 md:hidden">
          <div className="truncate font-serif text-base text-foreground">
            {letter.author_name}
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {[letter.city, letter.country].filter(Boolean).join(" · ") || "—"}
          </div>
          <div className="mt-1 truncate text-xs text-foreground/70">
            {excerpt(letter.content, 90)}
          </div>
        </div>
        <div className="text-right text-[11px] font-mono uppercase tracking-wider text-muted-foreground md:hidden">
          {formatDate(letter.created_at)}
        </div>

        {/* Desktop: columns */}
        <span className="hidden truncate text-sm text-foreground md:block">
          {letter.country ?? "—"}
        </span>
        <span className="hidden truncate text-sm text-muted-foreground md:block">
          {letter.city ?? "—"}
        </span>
        <span className="hidden truncate font-serif text-base text-foreground md:block">
          {letter.author_name}
        </span>
        <span className="hidden truncate text-sm text-foreground/70 md:block">
          {excerpt(letter.content)}
        </span>
        <span className="hidden text-right font-mono text-[11px] uppercase tracking-wider text-muted-foreground md:block">
          {formatDate(letter.created_at)}
        </span>
      </Link>
    </li>
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
  const add = (n: number | "…") => pages.push(n);
  const window = 1;
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= page - window && i <= page + window)
    ) {
      add(i);
    } else if (pages[pages.length - 1] !== "…") {
      add("…");
    }
  }

  return (
    <nav className="mt-6 flex items-center justify-center gap-1 font-mono text-xs">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="rounded border border-border px-3 py-1.5 uppercase tracking-wider disabled:opacity-40 hover:bg-muted"
      >
        Anterior
      </button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="px-2 text-muted-foreground">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`min-w-8 rounded border px-2 py-1.5 ${
              p === page
                ? "border-foreground bg-foreground text-background"
                : "border-border hover:bg-muted"
            }`}
          >
            {p}
          </button>
        ),
      )}
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="rounded border border-border px-3 py-1.5 uppercase tracking-wider disabled:opacity-40 hover:bg-muted"
      >
        Siguiente
      </button>
    </nav>
  );
}
