import { zodResolver } from "@hookform/resolvers/zod";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { submitQuoteRequestFn } from "@/lib/public-forms.functions";
import { BUDGET_RANGES, TIMELINES, publicQuoteFormSchema } from "@/services/public/public.schemas";
import type { PublicQuoteFormInput } from "@/services/public/public.schemas";
import type { PublicService } from "@/services/public/public.types";

const STEPS = [
  { title: "Votre besoin", fields: ["serviceSlug", "description"] },
  { title: "Cadre du projet", fields: ["budgetRange", "timeline"] },
  { title: "Vos coordonnées", fields: ["fullName", "email", "phone", "companyName"] },
] as const;

export function QuoteForm({
  services,
  defaultServiceSlug,
}: {
  services: PublicService[];
  defaultServiceSlug?: string;
}) {
  const submit = useServerFn(submitQuoteRequestFn);
  const [step, setStep] = useState(0);
  const [sent, setSent] = useState(false);

  const form = useForm<PublicQuoteFormInput>({
    resolver: zodResolver(publicQuoteFormSchema),
    mode: "onTouched",
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      companyName: "",
      serviceSlug: defaultServiceSlug ?? "",
      budgetRange: BUDGET_RANGES[4],
      timeline: TIMELINES[1],
      description: "",
      honeypot: "",
      utm: {},
    },
  });

  async function next() {
    const valid = await form.trigger(STEPS[step]!.fields as never);
    if (valid) setStep((current) => Math.min(current + 1, STEPS.length - 1));
  }

  async function onSubmit(values: PublicQuoteFormInput) {
    const payload = values.serviceSlug ? values : { ...values, serviceSlug: undefined };
    const result = await submit({ data: payload });
    if (result.ok) {
      setSent(true);
      toast.success("Demande envoyée", { description: "Nous analysons votre projet et revenons vers vous." });
      return;
    }
    toast.error("Envoi impossible", { description: result.message ?? "Veuillez réessayer." });
  }

  if (sent) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-2xl border border-border bg-surface p-8">
        <CheckCircle2 className="size-8 text-success" aria-hidden="true" />
        <h3 className="font-display text-xl font-semibold">Demande de devis reçue</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Merci. Nous étudions votre demande et revenons vers vous avec les prochaines étapes et le périmètre proposé.
        </p>
      </div>
    );
  }

  const current = STEPS[step]!;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7" noValidate>
        <div>
          <div className="flex items-center justify-between text-sm">
            <p className="font-display font-semibold">{current.title}</p>
            <p className="font-mono text-xs text-muted-foreground">
              Étape {step + 1} / {STEPS.length}
            </p>
          </div>
          <Progress value={((step + 1) / STEPS.length) * 100} className="mt-3 h-1.5" />
        </div>

        {step === 0 ? (
          <div className="space-y-5">
            <FormField
              control={form.control}
              name="serviceSlug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service concerné</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Je ne sais pas encore" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.slug} value={service.slug}>
                          {service.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Décrivez votre projet *</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={7}
                      placeholder="Problème à résoudre, processus concerné, volumes, outils existants, contraintes..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ) : null}

        {step === 1 ? (
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="budgetRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget envisagé</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="À définir ensemble" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BUDGET_RANGES.map((range) => (
                        <SelectItem key={range} value={range}>
                          {range}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="timeline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Échéance souhaitée</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sous 1 à 3 mois" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TIMELINES.map((timeline) => (
                        <SelectItem key={timeline} value={timeline}>
                          {timeline}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom complet *</FormLabel>
                  <FormControl>
                    <Input autoComplete="name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entreprise</FormLabel>
                  <FormControl>
                    <Input autoComplete="organization" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail professionnel *</FormLabel>
                  <FormControl>
                    <Input type="email" autoComplete="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Téléphone</FormLabel>
                  <FormControl>
                    <Input type="tel" autoComplete="tel" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ) : null}

        <div className="hidden" aria-hidden="true">
          <label htmlFor="quote-hp">Ne pas remplir</label>
          <input id="quote-hp" tabIndex={-1} autoComplete="off" {...form.register("honeypot")} />
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
          {step > 0 ? (
            <Button type="button" variant="outline" className="rounded-full" onClick={() => setStep((c) => c - 1)}>
              <ArrowLeft className="mr-1 size-4" aria-hidden="true" />
              Retour
            </Button>
          ) : null}
          {step < STEPS.length - 1 ? (
            <Button type="button" className="rounded-full" onClick={next}>
              Continuer
              <ArrowRight className="ml-1 size-4" aria-hidden="true" />
            </Button>
          ) : (
            <Button type="submit" size="lg" className="rounded-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
                  Envoi...
                </>
              ) : (
                "Envoyer la demande"
              )}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
