import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <header className="w-full border-b border-gray-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-[72px] flex items-center justify-between">
        
        {/* Logo a la izquierda */}
        <Link to="/" className="flex items-center gap-2 font-serif text-lg font-semibold text-gray-900">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
          UNA CARTA PARA MESSI
        </Link>

        {/* Navegación central (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <Link to="/" className="hover:text-black transition-colors">Inicio</Link>
          <Link to="/leer" className="hover:text-black transition-colors">Leer cartas</Link>
          <Link to="/escribir" className="hover:text-black transition-colors">Escribir carta</Link>
          <Link to="/sobre-el-proyecto" className="hover:text-black transition-colors">Sobre el proyecto</Link>
        </nav>

        {/* Botón Escribir a la derecha (Igual al principal) */}
        <div className="flex items-center">
          <Link 
            to="/escribir" 
            className="inline-flex items-center justify-center px-5 py-2.5 bg-[#0f1115] text-white rounded-md text-sm font-medium hover:bg-black transition-colors shadow-sm"
          >
            Escribir una carta
          </Link>
        </div>
      </div>
    </header>
  );
}