import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Feather, Globe, Heart, Mail, Send, ShieldCheck, Star } from "lucide-react";
import heroImage from "@/assets/messi-bg.png.asset.json";
import { Button } from "@/components/ui/button";
import { LetterCard } from "@/components/letter-card";
import { useEffect, useState } from "react";
import {
  fetchCountriesCount,
  fetchFeaturedLetters,
  fetchLetters,
  fetchLettersCount,
  incrementarVisitasServidor, // <-- Importamos la nueva función
} from "@/lib/letters";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Una Carta Para Messi · Un archivo abierto" },
      {
        name: "description",
        content:
          "Miles de historias. Miles de agradecimientos. Un solo lugar para dejarle una carta a Lionel Messi.",
      },
      { property: "og:title", content: "Una Carta Para Messi" },
      {
        property: "og:description",
        content: "Miles de historias. Un solo lugar.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [visitas, setVisitas] = useState(0);

  useEffect(() => {
    async function inicializarContador() {
      if (typeof window === "undefined") return;

      try {
        // Llamamos directamente a la función del servidor sin usar (window as any).supabase
        const totalVisitas = await incrementarVisitasServidor();
        setVisitas(totalVisitas);
      } catch (err) {
        console.error("Error en el contador:", err);
        setVisitas(1);
      }
    }

    // Opcional: Podés dejar el candado quitando este comentario si no querés que sume al recargar vos mismo:
    // if (!sessionStorage.getItem("ya_sumo_visita")) {
    //   sessionStorage.setItem("ya_sumo_visita", "true");
    //   inicializarContador();
    // } else { ... leer valor ... }
    
    // Para probar ahora mismo que sume libremente en cada dispositivo:
    inicializarContador();
  }, []);

  const lettersQuery = useQuery({
    queryKey: ["letters", "latest", 3],
    queryFn: () => fetchLetters(3),
  });
  const featuredQuery = useQuery({
    queryKey: ["letters", "featured"],
    queryFn: () => fetchFeaturedLetters(3),
  });
  const countQuery = useQuery({
    queryKey: ["letters", "count"],
    queryFn: fetchLettersCount,
  });
  const countriesQuery = useQuery({
    queryKey: ["letters", "countries"],
    queryFn: fetchCountriesCount,
  });

  const letters = lettersQuery.data ?? [];
  const featured = featuredQuery.data ?? [];
  const total = countQuery.data ?? 0;
  const countries = countriesQuery.data ?? 0;

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
          <div>
            <h1 className="font-serif text-5xl leading-[1.05] tracking-tight text-foreground sm:text-6xl">
              UNA CARTA
              <br />
              PARA MESSI
            </h1>
            <div className="mt-6 h-px w-12 bg-foreground" />
            <p className="mt-6 max-w-md text-base text-muted-foreground">
              Un archivo abierto donde cualquier persona puede dejar una carta
              para Lionel Messi.
            </p>
            <p className="mt-6 max-w-md text-base leading-relaxed text-foreground">
              Miles de historias.
              <br />
              Miles de agradecimientos.
              <br />
              Un solo lugar.
            </p>

            <div className="mt-8">
              <Button asChild size="lg">
                <Link to="/escribir">
                  <Feather className="mr-1 h-4 w-4" />
                  Escribir una carta
                </Link>
              </Button>
            </div>

            <p className="mt-8 text-xs uppercase tracking-widest text-muted-foreground">
              Con amor, desde todo el mundo.
            </p>
          </div>

        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-paper/40">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6">
          <Stat icon={<Mail className="h-5 w-5" />} value={total} label="cartas publicadas" />
          <Stat icon={<Globe className="h-5 w-5" />} value={countries} label="países representados" />
          <Stat icon={<Heart className="h-5 w-5" />} value={visitas || 1} label="visitantes de la web" />
        </div>
      </section>

      {/* Featured letters */}
      {featured.length > 0 && (
        <section className="border-b border-border bg-paper/40">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="flex items-center justify-center gap-2">
              <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
              <h2 className="font-serif text-3xl text-foreground sm:text-4xl">
                Cartas destacadas
              </h2>
            </div>
            <p className="mx-auto mt-3 max-w-xl text-center text-sm text-muted-foreground">
              Una selección de las cartas que más nos emocionaron.
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {featured.map((l) => (
                <LetterCard key={l.id} letter={l} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest letters */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between">
          <h2 className="font-serif text-3xl text-foreground sm:text-4xl">
            Últimas cartas
          </h2>
          <Link
            to="/cartas"
            className="group flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            Ver todas las cartas
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {lettersQuery.isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-lg border border-border bg-muted/40"
              />
            ))}

          {!lettersQuery.isLoading && letters.length === 0 && (
            <div className="md:col-span-3 rounded-lg border border-dashed border-border bg-card p-12 text-center">
              <p className="font-serif text-2xl">
                Sé el primero en dejar una carta.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Todavía nadie escribió. Tu message abrirá el archivo.
              </p>
              <Button asChild className="mt-6">
                <Link to="/escribir">Escribir la primera carta</Link>
              </Button>
            </div>
          )}

          {letters.map((l) => (
            <LetterCard key={l.id} letter={l} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-paper/40">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <h2 className="text-center font-serif text-3xl text-foreground sm:text-4xl">
            ¿Cómo funciona?
          </h2>

          <div className="mt-12 grid gap-10 sm:grid-cols-3">
            <Step
              n={1}
              icon={<Feather className="h-6 w-6" />}
              title="Escribí tu carta"
              text="Contá tu historia, dejá tu mensaje para Messi."
            />
            <Step
              n={2}
              icon={<ShieldCheck className="h-6 w-6" />}
              title="Nosotros la revisamos"
              text="Leemos cada carta para mantener el respeto antes de publicarla."
            />
            <Step
              n={3}
              icon={<Send className="h-6 w-6" />}
              title="La publicamos"
              text="Pasa a formar parte del archivo y el mundo la puede leer."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number | string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="text-muted-foreground">{icon}</div>
      <div className="mt-3 font-sans font-bold text-4xl text-foreground">
        {typeof value === "number" ? value.toLocaleString("es-AR") : value}
      </div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function Step({
  n,
  icon,
  title,
  text,
}: {
  n: number;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background text-foreground">
        {icon}
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-[10px] font-medium text-background">
          {n}
        </span>
        <h3 className="font-serif text-lg text-foreground">{title}</h3>
      </div>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">{text}</p>
    </div>
  );
}