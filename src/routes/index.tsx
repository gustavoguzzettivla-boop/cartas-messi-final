import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Globe, Mail, Star } from "lucide-react";
import { LetterCard } from "@/components/letter-card";
import {
  fetchCountriesCount,
  fetchFeaturedLetters,
  fetchLetters,
  fetchLettersCount,
} from "@/lib/letters";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {

  const lettersQuery = useQuery({
    queryKey: ["letters", "latest", 8],
    queryFn: () => fetchLetters(8),
  });


  const featuredQuery = useQuery({
    queryKey: ["letters", "featured", 6],
    queryFn: () => fetchFeaturedLetters(6),
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
  const featuredLetters = featuredQuery.data ?? [];
  const total = countQuery.data ?? 0;
  const countries = countriesQuery.data ?? 0;


  return (
    <div className="flex flex-col min-h-screen">


      {/* HERO */}

      <section className="relative pt-8 pb-20">

        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">

          <div className="max-w-xl space-y-6">


            <h1 className="text-5xl md:text-[4rem] font-bold tracking-tight text-gray-900 font-serif leading-[0.95]">
              UNA CARTA
              <br />
              PARA MESSI
            </h1>


            <div className="w-14 h-[2px] bg-gray-400" />


            <p className="text-lg text-gray-700 leading-relaxed font-medium max-w-md">
              Un archivo mundial donde personas de todo el planeta dejan su carta,
              su historia y su agradecimiento a Lionel Messi.
            </p>


            <div className="space-y-1 text-base text-gray-900 font-semibold">
              <p>Miles de historias.</p>
              <p>Miles de emociones.</p>
              <p>Un solo archivo.</p>
            </div>


            <div className="pt-4">

              <Link
                to="/escribir"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#0f1115] text-white rounded-md text-sm font-medium hover:bg-black transition-all shadow-sm"
              >
                <Mail className="h-4 w-4" />
                Escribir una carta
              </Link>

            </div>


            <p className="text-[10px] text-gray-500 uppercase tracking-[0.25em] pt-3 font-bold">
              CON AMOR, DESDE TODO EL MUNDO.
            </p>


          </div>

        </div>

      </section>





      {/* STATS */}

      <section className="border-y border-gray-200 bg-gray-50 py-7">

        <div className="mx-auto grid max-w-3xl gap-8 px-4 sm:grid-cols-2">


          <Stat
            icon={<Mail className="h-4 w-4" />}
            value={total}
            label="cartas publicadas"
          />


          <Stat
            icon={<Globe className="h-4 w-4" />}
            value={countries}
            label="países representados"
          />


        </div>

      </section>






      {/* CARTAS */}

      <div className="mx-auto w-full max-w-7xl px-4 py-10 space-y-12">





        {/* DESTACADAS */}

        {featuredLetters.length > 0 && (

          <section className="rounded-3xl bg-gray-50 border border-gray-200 p-4 sm:p-6 max-w-6xl mx-auto">


            <div className="flex items-start justify-between gap-4 mb-8">


              <div>

                <div className="flex items-center gap-3 mb-3">

                  <div className="rounded-full bg-yellow-100 p-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  </div>


                  <h2 className="font-serif text-2xl text-gray-900">
                    Cartas Destacadas
                  </h2>

                </div>


                <p className="text-sm text-gray-500">
                  Historias especiales que forman parte del archivo mundial.
                </p>

              </div>



              <Link
                to="/destacadas"
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-black font-medium pt-2 whitespace-nowrap"
              >
                Ver todas
                <ArrowRight className="h-4 w-4" />
              </Link>


            </div>





            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-5xl mx-auto">


              {featuredLetters.map((letter) => (

                <LetterCard
                  key={letter.id}
                  letter={letter}
                />

              ))}


            </div>


          </section>

        )}






        {/* ULTIMAS CARTAS */}

        <section>


          <div className="flex items-center justify-between mb-5">

            <h2 className="font-serif text-2xl text-gray-900">
              Últimas cartas
            </h2>


            <Link
              to="/cartas"
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-black font-medium"
            >
              Ver todas
              <ArrowRight className="h-4 w-4" />
            </Link>


          </div>




          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">


            {letters.map((letter) => (

              <LetterCard
                key={letter.id}
                letter={letter}
              />

            ))}


          </div>


        </section>
              </div>





      {/* COMO FUNCIONA */}

      <section className="py-14 bg-gray-50 border-t border-gray-200">


        <div className="max-w-4xl mx-auto px-4 text-center">


          <h2 className="font-serif text-2xl mb-10 text-gray-900">
            ¿Cómo funciona?
          </h2>




          <div className="grid md:grid-cols-3 gap-10">



            <div className="flex flex-col items-center">


              <div className="mb-4 w-16 h-16 bg-white rounded-full flex items-center justify-center border border-gray-200 text-gray-700 shadow-sm">

                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>

              </div>



              <div className="font-bold text-sm mb-1 flex items-center gap-2">

                <span className="bg-black text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">
                  1
                </span>

                Escribí tu carta

              </div>



              <p className="text-xs text-gray-500 px-4 leading-relaxed">
                Contá tu historia y dejá tu mensaje para Messi.
              </p>


            </div>







            <div className="flex flex-col items-center">


              <div className="mb-4 w-16 h-16 bg-white rounded-full flex items-center justify-center border border-gray-200 text-gray-700 shadow-sm">


                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >

                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />

                  <path d="m9 12 2 2 4-4" />

                </svg>


              </div>




              <div className="font-bold text-sm mb-1 flex items-center gap-2">


                <span className="bg-black text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">
                  2
                </span>


                Nosotros la revisamos


              </div>




              <p className="text-xs text-gray-500 px-4 leading-relaxed">
                Cuidamos que cada carta mantenga respeto y emoción.
              </p>


            </div>








            <div className="flex flex-col items-center">


              <div className="mb-4 w-16 h-16 bg-white rounded-full flex items-center justify-center border border-gray-200 text-gray-700 shadow-sm">


                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >

                  <line x1="22" y1="2" x2="11" y2="13" />

                  <polygon points="22 2 15 22 11 13 2 9 22 2" />

                </svg>


              </div>




              <div className="font-bold text-sm mb-1 flex items-center gap-2">


                <span className="bg-black text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">
                  3
                </span>


                La publicamos


              </div>




              <p className="text-xs text-gray-500 px-4 leading-relaxed">
                Tu carta pasa a formar parte del archivo mundial.
              </p>


            </div>



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


      <div className="text-gray-400 mb-2">
        {icon}
      </div>



      <div className="font-sans font-bold text-2xl text-gray-900">

        {typeof value === "number"
          ? value.toLocaleString("es-AR")
          : value}

      </div>



      <div className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">

        {label}

      </div>


    </div>

  );

}