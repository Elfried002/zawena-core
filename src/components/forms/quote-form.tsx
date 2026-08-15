import { zodResolver } from "@hookform/resolvers/zod";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { submitQuoteRequestFn } from "@/lib/public-forms.functions";
import { TIMELINES, publicQuoteFormSchema } from "@/services/public/public.schemas";
import type { PublicQuoteFormInput } from "@/services/public/public.schemas";
import {
  BUDGET_TIERS,
  CURRENCY_META,
  DISPLAY_CURRENCIES,
  FALLBACK_CURRENCY,
  RATES_UPDATED_AT,
  currencyFromLocale,
  formatBudgetTier,
  isDisplayCurrency,
} from "@/services/public/currency";
import type { DisplayCurrency } from "@/services/public/currency";
import type { PublicService } from "@/services/public/public.types";

const STEPS = [
  { title: "Votre besoin", fields: ["serviceSlug", "description"] },
  { title: "Cadre du projet", fields: ["budgetTier", "timeline"] },
  { title: "Vos coordonnées", fields: ["fullName", "email", "phone", "companyName"] },
] as const;

const CURRENCY_STORAGE_KEY = "zawena.display-currency";

/**
 * Devise d'affichage : suggestion serveur (pays), puis préférence explicite du
 * visiteur (persistée), puis langue du navigateur, puis fallback Zawena.
 */
function useDisplayCurrency(suggested?: DisplayCurrency | undefined) {
  const [currency, setCurrency] = useState<DisplayCurrency>(suggested ?? FALLBACK_CURRENCY);

  useEffect(() => {
    const stored = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (stored && isDisplayCurrency(stored)) {
      setCurrency(stored);
      return;
    }
    if (suggested) return;
    const fromLocale = currencyFromLocale(window.navigator.language);
    if (fromLocale) setCurrency(fromLocale);
  }, [suggested]);

  function choose(next: DisplayCurrency) {
    setCurrency(next);
    window.localStorage.setItem(CURRENCY_STORAGE_KEY, next);
  }

  return { currency, choose };
}

export function QuoteForm({
  services,
  defaultServiceSlug,
  suggestedCurrency,
}: {
  services: PublicService[];
  defaultServiceSlug?: string | undefined;
  suggestedCurrency?: DisplayCurrency | undefined;
}) {
  const submit = useServerFn(submitQuoteRequestFn);
  const [step, setStep] = useState(0);
  const [sent, setSent] = useState(false);
  const { currency, choose } = useDisplayCurrency(suggestedCurrency);

  const form = useForm<PublicQuoteFormInput>({
    resolver: zodResolver(publicQuoteFormSchema) as never,
    mode: "onTouched",
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      companyName: "",
      serviceSlug: defaultServiceSlug ?? "",
      budgetTier: "to_define",
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
    const base = { ...values, displayCurrency: currency };
    const payload = values.serviceSlug ? base : { ...base, serviceSlug: undefined };
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
          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="budgetTier"
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
                      {BUDGET_TIERS.map((tier) => (
                        <SelectItem key={tier.key} value={tier.key}>
                          {formatBudgetTier(tier.key, currency)}
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
            <div className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label htmlFor="quote-currency" className="text-sm font-medium">
                  Afficher les montants en
                </label>
                <select
                  id="quote-currency"
                  value={currency}
                  onChange={(event) => {
                    const next = event.target.value;
                    if (isDisplayCurrency(next)) choose(next);
                  }}
                  className="h-9 rounded-full border border-input bg-background px-4 text-sm"
                >
                  {DISPLAY_CURRENCIES.map((code) => (
                    <option key={code} value={code}>
                      {CURRENCY_META[code].label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                Montants convertis à titre indicatif depuis notre devise de référence (FCFA), taux de référence du{" "}
                {RATES_UPDATED_AT}. Le devis final est établi après cadrage et peut être libellé dans une autre devise.
              </p>
            </div>
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
