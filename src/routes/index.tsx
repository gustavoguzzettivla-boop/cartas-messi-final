import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Globe, Heart, Mail, Star } from "lucide-react";
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
  const featuredLetters = featuredQuery.data ?? [];
  const total = countQuery.data ?? 0;
  const countries = countriesQuery.data ?? 0;

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* 1. HERO SECTION - Imagen más grande y márgenes ajustados */}
      <section className="relative pt-8 pb-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          {/* Max-w-2xl permite que el texto respire pero no sea tan angosto */}
          <div className="max-w-2xl space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 font-serif leading-none">
              UNA CARTA<br />PARA MESSI
            </h1>
            
            <div className="w-16 h-[2px] bg-gray-400 mt-8 mb-6"></div>
            
            <p className="text-xl text-gray-700 leading-relaxed">
              Un archivo abierto donde cualquier persona puede dejar una carta para Lionel Messi.
            </p>
            
            <div className="space-y-1 text-lg text-gray-900 font-medium py-2">
              <p>Miles de historias.</p>
              <p>Miles de agradecimientos.</p>
              <p>Un solo lugar.</p>
            </div>
            
            <div className="pt-2">
              <Link 
                to="/escribir" 
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#0f1115] text-white rounded-md font-medium hover:bg-black transition-colors shadow-lg"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
                Escribir una carta
              </Link>
            </div>
            
            <p className="text-xs text-gray-500 uppercase tracking-widest pt-4 font-semibold">
              CON AMOR, DESDE TODO EL MUNDO.
            </p>
          </div>
        </div>
      </section>

      {/* 2. STATS SECTION - Más compacta */}
      <section className="border-y border-gray-200/60 bg-white/40 py-6 my-4">
        <div className="mx-auto grid max-w-4xl gap-6 px-4 sm:grid-cols-3">
          <Stat icon={<Mail className="h-4 w-4" />} value={total} label="cartas publicadas" />
          <Stat icon={<Globe className="h-4 w-4" />} value={countries} label="países representados" />
          <Stat icon={<Heart className="h-4 w-4" />} value={visitas || 1} label="visitantes" />
        </div>
      </section>

      {/* 3. CARTAS DESTACADAS Y ÚLTIMAS CARTAS - Cards más chicas */}
      <div className="mx-auto w-full max-w-7xl px-4 py-8 space-y-12">
        {featuredLetters.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <h2 className="font-serif text-2xl text-gray-900">Cartas Destacadas</h2>
            </div>
            {/* Grid más chico con gap reducido */}
            <div className="grid gap-4 md:grid-cols-3">
              {featuredLetters.map((letter) => (
                <div key={letter.id} className="scale-90 origin-left">
                  <LetterCard letter={letter} />
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl text-gray-900">Últimas cartas</h2>
            <Link to="/cartas" className="flex items-center gap-1 text-sm text-gray-600 hover:text-black transition-colors font-medium">
              Ver todas <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {letters.map((letter) => (
              <div key={letter.id} className="scale-90 origin-left">
                <LetterCard letter={letter} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number | string; label: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="text-gray-400 mb-1">{icon}</div>
      <div className="font-sans font-bold text-2xl text-gray-900">
        {typeof value === "number" ? value.toLocaleString("es-AR") : value}
      </div>
      <div className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">{label}</div>
    </div>
  );
}