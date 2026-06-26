import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Feather, Globe, Heart, Mail, Send, ShieldCheck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LetterCard } from "@/components/letter-card";
import { useEffect, useState } from "react";
import {
  fetchCountriesCount,
  fetchFeaturedLetters,
  fetchLetters,
  fetchLettersCount,
  incrementarVisitasServidor,
} from "@/lib/letters";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [visitas, setVisitas] = useState(0);

  useEffect(() => {
    async function inicializarContador() {
      try {
        const totalVisitas = await incrementarVisitasServidor();
        setVisitas(totalVisitas);
      } catch (err) {
        setVisitas(1);
      }
    }
    inicializarContador();
  }, []);

  const lettersQuery = useQuery({ queryKey: ["letters", "latest", 3], queryFn: () => fetchLetters(3) });
  const featuredQuery = useQuery({ queryKey: ["letters", "featured"], queryFn: () => fetchFeaturedLetters(3) });
  const countQuery = useQuery({ queryKey: ["letters", "count"], queryFn: fetchLettersCount });
  const countriesQuery = useQuery({ queryKey: ["letters", "countries"], queryFn: fetchCountriesCount });

  const letters = lettersQuery.data ?? [];
  const total = countQuery.data ?? 0;
  const countries = countriesQuery.data ?? 0;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - Estructura corregida para el layout */}
      <section className="relative border-b border-border bg-background py-16 md:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 md:grid-cols-2">
          {/* Lado Izquierdo: Contenido */}
          <div className="relative z-10">
            <h1 className="font-serif text-5xl leading-[1.05] tracking-tight text-foreground sm:text-6xl">
              UNA CARTA<br />PARA MESSI
            </h1>
            <div className="mt-6 h-px w-12 bg-foreground" />
            <p className="mt-6 max-w-md text-base text-muted-foreground">
              Un archivo abierto donde cualquier persona puede dejar una carta para Lionel Messi.
            </p>
            <div className="mt-8">
              <Button asChild size="lg">
                <Link to="/escribir">
                  <Feather className="mr-2 h-4 w-4" /> Escribir una carta
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Lado Derecho: Contenedor visual (Aquí irá tu imagen de fondo) */}
          <div className="hidden md:block h-[400px] w-full bg-muted/30 rounded-2xl animate-in fade-in duration-700" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b border-border bg-muted/20 py-12">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 sm:grid-cols-3 sm:px-6">
          <Stat icon={<Mail className="h-5 w-5" />} value={total} label="cartas publicadas" />
          <Stat icon={<Globe className="h-5 w-5" />} value={countries} label="países representados" />
          <Stat icon={<Heart className="h-5 w-5" />} value={visitas || 1} label="visitantes de la web" />
        </div>
      </section>

      {/* Latest Letters */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-3xl text-foreground">Últimas cartas</h2>
          <Link to="/cartas" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            Ver todas <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {letters.map((l) => (
            <LetterCard key={l.id} letter={l} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number | string; label: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="text-muted-foreground mb-3">{icon}</div>
      <div className="font-sans font-bold text-4xl text-foreground">
        {typeof value === "number" ? value.toLocaleString("es-AR") : value}
      </div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}