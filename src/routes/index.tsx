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
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-1 pb-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="max-w-lg space-y-5">
            <h1 className="text-4xl md:text-[3.5rem] font-bold tracking-tight text-gray-900 font-serif leading-none">
              UNA CARTA<br />PARA MESSI
            </h1>
            
            <div className="w-12 h-[2px] bg-gray-400 mt-6 mb-4"></div>
            
            <p className="text-lg text-gray-700 leading-relaxed font-medium">
              Un archivo abierto donde cualquier persona puede dejar una carta para Lionel Messi.
            </p>
            
            <div className="space-y-1 text-base text-gray-900 font-medium py-2">
              <p>Miles de historias.</p>
              <p>Miles de agradecimientos.</p>
              <p>Un solo lugar.</p>
            </div>
            
            <div className="pt-2">
              <Link 
                to="/escribir" 
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0f1115] text-white rounded-md text-sm font-medium hover:bg-black transition-colors shadow-sm"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
                Escribir una carta
              </Link>
            </div>
            
            <p className="text-[10px] text-gray-500 uppercase tracking-widest pt-4 font-bold">
              CON AMOR, DESDE TODO EL MUNDO.
            </p>
          </div>
        </div>
      </section>

      {/* 2. STATS SECTION */}
      <section className="border-y border-gray-200/60 bg-gray-50/50 py-6 my-4">
        <div className="mx-auto grid max-w-4xl gap-6 px-4 sm:grid-cols-3">
          <Stat icon={<Mail className="h-4 w-4" />} value={total} label="cartas publicadas" />
          <Stat icon={<Globe className="h-4 w-4" />} value={countries} label="países representados" />
          <Stat icon={<Heart className="h-4 w-4" />} value={visitas || 1} label="visitantes" />
        </div>
      </section>

      {/* 3. CARTAS */}
      <div className="mx-auto w-full max-w-7xl px-4 py-8 space-y-12">
        {featuredLetters.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <h2 className="font-serif text-2xl text-gray-900">Cartas Destacadas</h2>
            </div>
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

      {/* 4. ¿CÓMO FUNCIONA? - Versión compacta */}
      <section className="py-12 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-serif text-2xl mb-10 text-gray-900">¿Cómo funciona?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="mb-4 w-16 h-16 bg-white rounded-full flex items-center justify-center border border-gray-200 text-gray-700 shadow-sm">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </div>
              <div className="font-bold text-sm mb-1 flex items-center gap-2">
                <span className="bg-black text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">1</span>
                Escribí tu carta
              </div>
              <p className="text-xs text-gray-500 px-4 leading-relaxed">Contá tu historia, dejá tu mensaje.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="mb-4 w-16 h-16 bg-white rounded-full flex items-center justify-center border border-gray-200 text-gray-700 shadow-sm">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
              <div className="font-bold text-sm mb-1 flex items-center gap-2">
                <span className="bg-black text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">2</span>
                Nosotros la revisamos
              </div>
              <p className="text-xs text-gray-500 px-4 leading-relaxed">Mantenemos el respeto antes de publicar.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="mb-4 w-16 h-16 bg-white rounded-full flex items-center justify-center border border-gray-200 text-gray-700 shadow-sm">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </div>
              <div className="font-bold text-sm mb-1 flex items-center gap-2">
                <span className="bg-black text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">3</span>
                La publicamos
              </div>
              <p className="text-xs text-gray-500 px-4 leading-relaxed">Ya es parte del archivo mundial.</p>
            </div>
          </div>
        </div>
      </section>
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