import { createFileRoute, Link } from "@tanstack/react-router";
import { Feather } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre el proyecto · Una Carta Para Messi" },
      {
        name: "description",
        content:
          "Una Carta Para Messi es un archivo abierto de cartas escritas por fanáticos de todo el mundo.",
      },
      {
        property: "og:title",
        content: "Sobre el proyecto · Una Carta Para Messi",
      },
    ],
  }),
  component: SobrePage,
});

function SobrePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Feather className="h-4 w-4" />
        <span className="text-xs uppercase tracking-widest">
          Sobre el proyecto
        </span>
      </div>

      <h1 className="mt-6 font-serif text-5xl leading-tight text-foreground">
        Un archivo de gratitud, hecho por fanáticos.
      </h1>

      <div className="mt-10 space-y-6 text-lg leading-relaxed text-foreground/80">
        <p>
          <strong>Una Carta Para Messi</strong> nació de una idea simple: dar un
          lugar a todas esas palabras que la gente le quiere decir a Leo, y que
          casi nunca encuentran dónde quedarse.
        </p>
        <p>
          Cualquier persona puede entrar y dejar su carta. No hace falta crear
          cuenta. No hay algoritmos. No hay likes. Solo cartas, ordenadas por
          fecha, abiertas para que cualquier otra persona del mundo pueda
          leerlas.
        </p>
        <p>
          Es un proyecto independiente, sin fines de lucro, creado por fanáticos
          de Messi, para fanáticos de Messi.
        </p>
      </div>

      <div className="mt-12 flex flex-col items-start gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link to="/escribir">Escribir mi carta</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/cartas">Leer cartas</Link>
        </Button>
      </div>
    </div>
  );
}
