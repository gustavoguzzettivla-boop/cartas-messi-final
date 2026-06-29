import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { franc } from "franc";

export const letterSchema = z.object({
  author_name: z.string().trim().min(1).max(80),
  country: z.string().trim().max(60).optional().or(z.literal("")),
  city: z.string().trim().max(60).optional().or(z.literal("")),
  content: z.string().trim().min(10).max(20000),
});

export type LetterInput = z.infer<typeof letterSchema>;

export type Letter = {
  id: string;
  author_name: string;
  country: string | null;
  city: string | null;
  content: string;
  content_es?: string | null;
  created_at: string;
  status?: string;
  featured?: boolean;
  nextId?: string | null;
  prevId?: string | null;
  user_ip?: string | null;
  moderation_notes?: string | null;
};

const LETTER_SELECT = `
  id,
  author_name,
  country,
  city,
  content,
  content_es,
  created_at,
  status,
  featured,
  user_ip,
  moderation_notes
`;

export async function fetchLetters(limit = 50): Promise<Letter[]> {
  const { data, error } = await supabase
    .from("letters")
    .select(LETTER_SELECT)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as Letter[];
}

export async function fetchFeaturedLetters(limit = 3): Promise<Letter[]> {
  const { data, error } = await supabase
    .from("letters")
    .select(LETTER_SELECT)
    .eq("featured", true)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as Letter[];
}

export async function fetchLetter(id: string): Promise<Letter | null> {
  const { data: currentLetter, error } = await supabase
    .from("letters")
    .select(LETTER_SELECT)
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
    ...currentLetter,
    nextId: nextData?.id ?? null,
    prevId: prevData?.id ?? null,
  };
}

export async function fetchLettersCount(): Promise<number> {
  const { count, error } = await supabase
    .from("letters")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved");

  if (error) throw error;
  return count ?? 0;
}

export async function fetchCountriesCount(): Promise<number> {
  const { data, error } = await supabase
    .from("letters")
    .select("country")
    .eq("status", "approved")
    .not("country", "is", null);

  if (error) throw error;

  const set = new Set(
    (data ?? [])
      .map((r) => (r.country ?? "").trim().toLowerCase())
      .filter(Boolean)
  );

  return set.size;
}

export async function createLetter(input: LetterInput) {
  const parsed = letterSchema.parse(input);

  let userIp = "unknown";
  let finalStatus: "approved" | "pending" = "approved";
  let moderationNotes = "";

  const idioma = franc(parsed.content);
  const content_es = idioma === "spa" ? parsed.content : null;

  try {
    const ipResponse = await fetch("https://api.ipify.org?format=json");

    if (ipResponse.ok) {
      const ipData = await ipResponse.json();
      userIp = ipData.ip;
    }

    if (userIp !== "unknown") {
      const { count, error: countError } = await supabase
        .from("letters")
        .select("*", { count: "exact", head: true })
        .eq("user_ip", userIp);

      if (!countError && (count ?? 0) > 0) {
        finalStatus = "pending";
        moderationNotes = "IP repetida. Requiere revisión manual.";
      }
    }

    if (finalStatus === "approved") {
      const malas = evaluarFiltroInapropiado(parsed.content);

      if (malas) {
        finalStatus = "pending";
        moderationNotes = "Lenguaje inadecuado/Sospechoso detectado.";
      }
    }
  } catch (e) {
    console.error("Error en validación automatizada:", e);
  }

  const payload = {
    author_name: parsed.author_name,
    country: parsed.country || null,
    city: parsed.city || null,
    content: parsed.content,
    status: finalStatus,
    featured: false,
    user_ip: userIp,
    moderation_notes: moderationNotes || null,
    content_es,
  };

  const { error } = await supabase.from("letters").insert(payload);

  if (error) throw error;

  return { ok: true, status: finalStatus };
}

function evaluarFiltroInapropiado(texto: string): boolean {
  const malasPalabras = ["insulto1", "insulto2", "casino", "crypto", "bet", "compra"];
  const t = texto.toLowerCase();
  return malasPalabras.some((p) => t.includes(p));
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

export async function incrementarVisitasServidor() {
  try {
    const { data, error } = await supabase.rpc("incrementar_visitas");

    if (!error && data !== null) return data;

    const { data: fallback } = await supabase
      .from("letters")
      .select("contador")
      .eq("id", "global")
      .maybeSingle();

    return fallback?.contador || 1;
  } catch (e) {
    console.error(e);
    return 1;
  }
}