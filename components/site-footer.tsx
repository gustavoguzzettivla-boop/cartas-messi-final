import { Link } from "@tanstack/react-router";
import { Feather } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-paper/50">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <Feather className="h-5 w-5" />
            <span className="font-serif text-base tracking-wide">
              UNA CARTA PARA MESSI
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Un proyecto independiente creado por fanáticos de Messi, para
            fanáticos de Messi.
          </p>
        </div>

        <div>
          <h3 className="font-sans text-sm font-medium text-foreground">
            Navegación
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground">Inicio</Link></li>
            <li><Link to="/cartas" className="hover:text-foreground">Leer cartas</Link></li>
            <li><Link to="/escribir" className="hover:text-foreground">Escribir carta</Link></li>
            <li><Link to="/sobre" className="hover:text-foreground">Sobre el proyecto</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-sans text-sm font-medium text-foreground">
            El archivo
          </h3>
          <p className="mt-4 text-sm text-muted-foreground">
            Las cartas son enviadas por personas de todo el mundo y se conservan
            como un archivo abierto y público.
          </p>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Una Carta Para Messi. Todos los derechos reservados.
      </div>
    </footer>
  );
}
