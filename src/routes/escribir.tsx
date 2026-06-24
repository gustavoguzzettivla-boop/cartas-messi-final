import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Feather, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createLetter, letterSchema, type LetterInput } from "@/lib/letters";

export const Route = createFileRoute("/escribir")({
  head: () => ({
    meta: [
      { title: "Escribir una carta · Una Carta Para Messi" },
      {
        name: "description",
        content:
          "Dejá tu mensaje para Lionel Messi. Se publicará al instante en el archivo abierto.",
      },
      {
        property: "og:title",
        content: "Escribir una carta · Una Carta Para Messi",
      },
    ],
  }),
  component: EscribirPage,
});

function EscribirPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const form = useForm<LetterInput>({
    resolver: zodResolver(letterSchema),
    defaultValues: {
      author_name: "",
      country: "",
      city: "",
      content: "",
    },
  });

  const mutation = useMutation({
    mutationFn: createLetter,
    onSuccess: () => {
      toast.success("Tu carta fue enviada", {
        description: "La revisamos antes de publicarla. ¡Gracias!",
      });
      qc.invalidateQueries({ queryKey: ["letters"] });
      navigate({ to: "/" });
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof Error ? err.message : "Algo salió mal, probá de nuevo.";
      toast.error("No se pudo enviar tu carta", { description: msg });
    },
  });

  const content = form.watch("content") ?? "";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-border bg-paper">
          <Feather className="h-5 w-5" />
        </div>
        <h1 className="mt-6 font-serif text-4xl text-foreground sm:text-5xl">
          Escribí tu carta
        </h1>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">
          Contale a Messi lo que quieras. Revisamos cada carta antes de
          publicarla para mantener el respeto.
        </p>
      </div>

      <form
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        className="mt-12 rounded-lg border border-border bg-card p-6 sm:p-10"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Tu nombre"
            error={form.formState.errors.author_name?.message}
            required
          >
            <Input
              placeholder="Ej. Juan Cruz"
              {...form.register("author_name")}
            />
          </Field>
          <Field label="País" error={form.formState.errors.country?.message}>
            <Input
              placeholder="Ej. Argentina"
              {...form.register("country")}
            />
          </Field>
          <Field
            label="Ciudad"
            error={form.formState.errors.city?.message}
            className="sm:col-span-2"
          >
            <Input
              placeholder="Ej. Buenos Aires"
              {...form.register("city")}
            />
          </Field>
        </div>

        <div className="mt-6">
          <Field
            label="Tu carta"
            error={form.formState.errors.content?.message}
            required
          >
            <Textarea
              rows={12}
              placeholder="Querido Leo..."
              /* Cambiada la fuente a 'font-sans', subido el tamaño a 'text-xl' y mejorado el padding/tracking */
              className="font-sans text-xl leading-relaxed tracking-wide p-4"
              {...form.register("content")}
            />
            <div className="mt-1 flex justify-end text-xs text-muted-foreground">
              {content.length} / 20000
            </div>
          </Field>
        </div>

        <div className="mt-8 flex flex-col-reverse items-center gap-3 sm:flex-row sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Al enviar, tu carta queda pendiente de revisión antes de publicarse.
          </p>
          <Button
            type="submit"
            size="lg"
            disabled={mutation.isPending}
          >
            {mutation.isPending && (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            )}
            Enviar carta
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  required,
  className,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="mt-2">{children}</div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}