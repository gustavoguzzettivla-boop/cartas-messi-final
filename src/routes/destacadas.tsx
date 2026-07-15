import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { LetterCard } from "@/components/letter-card";
import { fetchFeaturedLetters } from "@/lib/letters";

export const Route = createFileRoute("/destacadas")({
  component: Destacadas,
});

function Destacadas() {
  const featuredQuery = useQuery({
    queryKey: ["letters", "featured", "all"],
    queryFn: () => fetchFeaturedLetters(50),
  });

  const letters = featuredQuery.data ?? [];

  return (
    <div className="min-h-screen">

      {/* HERO DESTACADAS */}
      <section className="relative min-h-[420px] flex items-center overflow-hidden">

        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/messi-bg.png')",
          }}
        />


        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6">

          <div className="max-w-lg space-y-5">

            <div className="flex items-center gap-2">
              <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
              <span className="text-xs uppercase tracking-widest font-bold text-gray-700">
                Archivo especial
              </span>
            </div>


            <h1 className="font-serif text-4xl md:text-[3.5rem] font-bold tracking-tight text-gray-900 leading-none">
              CARTAS<br />
              DESTACADAS
            </h1>


            <div className="w-12 h-[2px] bg-gray-400" />


            <p className="text-lg text-gray-700 leading-relaxed font-medium max-w-md">
              Una selección de historias, recuerdos y mensajes que merecen
              ser guardados para siempre.
            </p>


          </div>

        </div>

      </section>


      {/* LISTADO */}
      <section className="max-w-7xl mx-auto px-4 py-12">

        <div className="mb-8">
          <h2 className="font-serif text-3xl text-gray-900">
            Todas las cartas destacadas
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            Historias elegidas para formar parte de este archivo mundial.
          </p>
        </div>


        {letters.length > 0 ? (

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

            {letters.map((letter) => (
              <LetterCard
                key={letter.id}
                letter={letter}
              />
            ))}

          </div>

        ) : (

          <div className="text-center py-20 text-gray-500">
            Todavía no hay cartas destacadas.
          </div>

        )}

      </section>

    </div>
  );
}