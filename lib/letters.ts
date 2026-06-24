import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const letterSchema = z.object({
  author_name: z
    .string()
    .trim()
    .min(1, "Tu nombre no puede estar vacío")
    .max(80, "Máximo 80 caracteres"),
  country: z.string().trim().max(60).optional().or(z.literal("")),
  city: z.string().trim().max(60).optional().or(z.literal("")),
  content: z
    .string()
    .trim()
    .min(10, "Tu carta es demasiado corta (mínimo 10 caracteres)")
    .max(5000, "Tu carta es demasiado larga (máximo 5000 caracteres)"),
});

export type LetterInput = z.infer<typeof letterSchema>;

export type Letter = {
  id: string;
  author_name: string;
  country: string | null;
  city: string | null;
  content: string;
  created_at: string;
  status?: string;
  featured?: boolean;
  nextId?: string | null;
  prevId?: string | null;
};

// Trae solo las cartas que el administrador ya aprobó ('approved')
export async function fetchLetters(limit = 50): Promise<Letter[]> {
  const { data, error } = await supabase
    .from("letters")
    .select("id, author_name, country, city, content, created_at, status")
    .eq("status", "approved") 
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Letter[];
}

// Trae solo las destacadas que además estén aprobadas ('approved')
export async function fetchFeaturedLetters(limit = 3): Promise<Letter[]> {
  const { data, error } = await supabase
    .from("letters")
    .select("id, author_name, country, city, content, created_at, featured, status")
    .eq("featured", true)
    .eq("status", "approved") 
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Letter[];
}

// Trae una carta específica junto con los IDs de las cartas adyacentes para navegar de corrido
export async function fetchLetter(id: string): Promise<Letter | null> {
  const { data: currentLetter, error } = await supabase
    .from("letters")
    .select("id, author_name, country, city, content, created_at, status")
    .eq("id", id)
    .eq("status", "approved")
    .maybeSingle();

  if (error) throw error;
  if (!currentLetter) return null;

  const { data: nextData } = await supabase
    .from("letters")
    .select("id")
    .eq("status", "approved")
    .gt("created_at", currentLetter.created_at)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const { data: prevData } = await supabase
    .from("letters")
    .select("id")
    .eq("status", "approved")
    .lt("created_at", currentLetter.created_at)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    ...(currentLetter as Letter),
    nextId: nextData?.id || null,
    prevId: prevData?.id || null,
  };
}

// Cuenta SOLO las cartas que están aprobadas
export async function fetchLettersCount(): Promise<number> {
  const { count, error } = await supabase
    .from("letters")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved"); 
  if (error) throw error;
  return count ?? 0;
}

// Cuenta SOLO los países de las cartas que ya están aprobadas
export async function fetchCountriesCount(): Promise<number> {
  const { data, error } = await supabase
    .from("letters")
    .select("country")
    .eq("status", "approved") 
    .not("country", "is", null);
  if (error) throw error;
  const set = new Set(
    (data ?? []).map((r) => (r.country ?? "").trim().toLowerCase()).filter(Boolean),
  );
  return set.size;
}

// Guarda la carta aplicando filtros automáticos de IP y palabras prohibidas
export async function createLetter(input: LetterInput) {
  const parsed = letterSchema.parse(input);
  
  let userIp = "unknown";
  let finalStatus = "approved"; // Por defecto pasa directo a publicarse
  let moderationNotes = "";

  try {
    // 1. Obtener la IP pública del remitente de forma segura
    const ipResponse = await fetch("https://api.ipify.org?format=json");
    if (ipResponse.ok) {
      const ipData = await ipResponse.json();
      userIp = ipData.ip;
    }

    // 2. FILTRO ANTI-SPAM: Revisar si esa IP ya mandó una carta antes
    if (userIp !== "unknown") {
      const { count, error: countError } = await supabase
        .from("letters")
        .select("*", { count: "exact", head: true })
        .eq("user_ip", userIp);

      if (!countError && count && count > 0) {
        finalStatus = "pending";
        moderationNotes = "IP repetida. Requiere revisión manual.";
      }
    }

    // 3. FILTRO TEMPORAL DE TEXTO: Si la IP está limpia, miramos el contenido
    if (finalStatus === "approved") {
      const contieneLenguajeInadecuado = evaluarFiltroInapropiado(parsed.content);
      if (contieneLenguajeInadecuado) {
        finalStatus = "pending";
        moderationNotes = "Lenguaje inadecuado/Sospechoso detectado.";
      }
    }

  } catch (e) {
    console.error("Error en validación automatizada:", e);
    finalStatus = "pending";
    moderationNotes = "Error técnico en validación automática.";
  }

  const payload = {
    author_name: parsed.author_name,
    country: parsed.country ? parsed.country : null,
    city: parsed.city ? parsed.city : null,
    content: parsed.content,
    status: finalStatus, 
    featured: false,
    user_ip: userIp,
    moderation_notes: moderationNotes
  };

  const { error } = await supabase.from("letters").insert(payload);
  if (error) throw error;
  return { ok: true, status: finalStatus };
}

// Filtro rápido de palabras inapropiadas o spam evidente
function evaluarFiltroInapropiado(texto: string): boolean {
  const malasPalabras = ["insulto1", "insulto2", "casino", "crypto", "bet", "compra"]; 
  const contenidoEnMinuscula = texto.toLowerCase();
  return malasPalabras.some(palabra => contenidoEnMinuscula.includes(palabra));
}

export function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("es-AR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}


// Función para obtener las visitas actuales y sumarle 1 en la base de datos
export async function registrarYObtenerVisita() {
  const supabase = (window as any).supabase; // O como tengas exportado tu cliente de supabase
  
  // 1. Buscamos el valor actual
  const { data } = await supabase
    .from('次_visitas')
    .select('contador')
    .eq('id', 'global')
    .single();

  const nuevoTotal = (data?.contador || 0) + 1;

  // 2. Guardamos el nuevo número en la base de datos
  await supabase
    .from('次_visitas')
    .update({ contador: nuevoTotal })
    .eq('id', 'global');

  return nuevoTotal;
}


// Función para incrementar visitas desde el servidor de forma segura
export async function incrementarVisitasServidor() {
  // Importamos el cliente de supabase que ya usás en este archivo
  // Si tu cliente se llama diferente, ajustalo (ej. supabaseClient)
  if (!supabase) return 1; 

  try {
    const { data, error } = await supabase.rpc("incrementar_visitas");
    if (!error && data !== null) {
      return data;
    }
    
    // Si falla el RPC, leemos el valor actual
    const { data: fallbackData } = await supabase
      .from("visitas")
      .select("contador")
      .eq("id", "global")
      .maybeSingle();
      
    return fallbackData?.contador || 1;
  } catch (e) {
    console.error(e);
    return 1;
  }
}