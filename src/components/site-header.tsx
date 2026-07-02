import { useState } from "react";
import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="w-full border-b border-gray-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-[72px] flex items-center justify-between">
        
        {/* Logo */}
        <Link
          to="/"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 font-serif text-lg font-semibold text-gray-900"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
          UNA CARTA PARA MESSI
        </Link>

        {/* NAV desktop */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <Link to="/" className="hover:text-black transition-colors">
            Inicio
          </Link>

          <Link to="/cartas" className="hover:text-black transition-colors">
            Leer cartas
          </Link>

          <Link to="/escribir" className="hover:text-black transition-colors">
            Escribir carta
          </Link>

          <Link to="/sobre" className="hover:text-black transition-colors">
            Sobre el proyecto
          </Link>
        </nav>

        {/* Botón desktop */}
        <div className="hidden md:flex items-center">
          <Link
            to="/escribir"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-[#0f1115] text-white rounded-md text-sm font-medium hover:bg-black transition-colors shadow-sm"
          >
            Escribir una carta
          </Link>
        </div>

        {/* BOTÓN MOBILE */}
        <button
          className="md:hidden text-2xl text-gray-800"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>
      </div>

      {/* MENÚ MOBILE */}
      {open && (
        <div className="md:hidden absolute top-[72px] left-0 w-full bg-white border-b shadow-lg flex flex-col gap-4 p-5 text-sm font-medium text-gray-700">
          
          <Link to="/" onClick={() => setOpen(false)}>
            Inicio
          </Link>

          <Link to="/cartas" onClick={() => setOpen(false)}>
            Leer cartas
          </Link>

          <Link to="/escribir" onClick={() => setOpen(false)}>
            Escribir carta
          </Link>

          <Link to="/sobre" onClick={() => setOpen(false)}>
            Sobre el proyecto
          </Link>

          <Link
            to="/escribir"
            onClick={() => setOpen(false)}
            className="mt-2 inline-flex items-center justify-center px-4 py-2 bg-black text-white rounded-md"
          >
            Escribir una carta
          </Link>
        </div>
      )}
    </header>
  );
}


{open && (
  <div className="md:hidden absolute top-[72px] left-0 w-full bg-white border-b shadow-lg flex flex-col gap-4 p-5 z-50">
    
    <Link to="/" onClick={() => setOpen(false)}>Inicio</Link>
    <Link to="/cartas" onClick={() => setOpen(false)}>Leer cartas</Link>
    <Link to="/escribir" onClick={() => setOpen(false)}>Escribir carta</Link>
    <Link to="/sobre" onClick={() => setOpen(false)}>Sobre el proyecto</Link>

    <Link
      to="/escribir"
      onClick={() => setOpen(false)}
      className="mt-2 bg-black text-white px-4 py-2 rounded-md text-center"
    >
      Escribir una carta
    </Link>

  </div>
)}