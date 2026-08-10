import { zodResolver } from "@hookform/resolvers/zod";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { submitContactRequestFn } from "@/lib/public-forms.functions";
import { cn } from "@/lib/utils";
import { CONTACT_SUBJECTS, contactRequestSchema } from "@/services/public/public.schemas";
import type { ContactRequestInput } from "@/services/public/public.schemas";

export function ContactForm({ className }: { className?: string }) {
  const submit = useServerFn(submitContactRequestFn);
  const [sent, setSent] = useState(false);

  const form = useForm<ContactRequestInput>({
    resolver: zodResolver(contactRequestSchema),
    defaultValues: {
      fullName: "",
      companyName: "",
      email: "",
      phone: "",
      subject: CONTACT_SUBJECTS[0],
      message: "",
      honeypot: "",
      utm: {},
    },
  });

  async function onSubmit(values: ContactRequestInput) {
    const result = await submit({ data: values });
    if (result.ok) {
      setSent(true);
      form.reset();
      toast.success("Message envoyé", { description: "Nous revenons vers vous rapidement." });
      return;
    }
    toast.error("Envoi impossible", { description: result.message ?? "Veuillez réessayer." });
  }

  if (sent) {
    return (
      <div className={cn("flex flex-col items-start gap-4 rounded-2xl border border-border bg-surface p-7", className)}>
        <CheckCircle2 className="size-7 text-success" aria-hidden="true" />
        <div>
          <h3 className="font-display text-lg font-semibold">Message reçu</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Merci. Nous étudions votre demande et revenons vers vous sous un jour ouvré.
          </p>
        </div>
        <Button variant="outline" className="rounded-full" onClick={() => setSent(false)}>
          Envoyer un autre message
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-5", className)} noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom complet *</FormLabel>
                <FormControl>
                  <Input autoComplete="name" placeholder="Awa Diallo" {...field} />
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
                  <Input autoComplete="organization" placeholder="Nom de votre société" {...field} value={field.value ?? ""} />
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
                  <Input type="email" autoComplete="email" placeholder="vous@entreprise.com" {...field} />
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
                  <Input type="tel" autoComplete="tel" placeholder="+221 ..." {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sujet *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un sujet" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CONTACT_SUBJECTS.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
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
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Votre besoin *</FormLabel>
              <FormControl>
                <Textarea
                  rows={6}
                  placeholder="Contexte, objectif, outils utilisés aujourd'hui, contrainte de délai..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Champ piège anti-robot : invisible pour les utilisateurs. */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="contact-hp">Ne pas remplir</label>
          <input id="contact-hp" tabIndex={-1} autoComplete="off" {...form.register("honeypot")} />
        </div>

        <Button type="submit" size="lg" className="w-full rounded-full sm:w-auto" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
              Envoi...
            </>
          ) : (
            "Envoyer le message"
          )}
        </Button>
      </form>
    </Form>
  );
}
