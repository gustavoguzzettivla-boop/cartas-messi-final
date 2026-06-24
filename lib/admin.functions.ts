import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const passwordSchema = z.object({ password: z.string().min(1) });

function checkPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD || "gusvalen2026";
  if (!expected) throw new Error("ADMIN_PASSWORD no configurada");
  if (password !== expected) throw new Error("Clave incorrecta");
}

export const verifyAdmin = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => passwordSchema.parse(d))
  .handler(async ({ data }) => {
    checkPassword(data.password);
    return { ok: true };
  });

export const adminListLetters = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    passwordSchema
      .extend({
        status: z.enum(["pending", "approved", "rejected", "all"]).default("pending"),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    checkPassword(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let query = supabaseAdmin
      .from("letters")
      .select("id, author_name, country, city, content, created_at, status, featured")
      .order("created_at", { ascending: false });
    if (data.status !== "all") query = query.eq("status", data.status);
    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminSetStatus = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    passwordSchema
      .extend({
        id: z.string().uuid(),
        status: z.enum(["pending", "approved", "rejected"]),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    checkPassword(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("letters")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminSetFeatured = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    passwordSchema
      .extend({ id: z.string().uuid(), featured: z.boolean() })
      .parse(d),
  )
  .handler(async ({ data }) => {
    checkPassword(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("letters")
      .update({ featured: data.featured })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteLetter = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    passwordSchema.extend({ id: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data }) => {
    checkPassword(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("letters")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });