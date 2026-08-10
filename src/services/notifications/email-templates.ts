/**
 * Templates d'emails transactionnels — **séparés de la logique métier**.
 * Rendu pur : (données) → { subject, text, html }. Aucun envoi ici : le
 * fournisseur d'envoi sera branché plus tard sans toucher aux templates.
 */
export interface RenderedEmail {
  subject: string;
  text: string;
  html: string;
}

const SIGNATURE = "L'équipe Zawena";

function wrap(title: string, lines: string[]): RenderedEmail {
  const text = [...lines, "", SIGNATURE].join("\n");
  const html = `<h2>${title}</h2>${lines
    .map((line) => `<p>${line}</p>`)
    .join("")}<p><em>${SIGNATURE}</em></p>`;
  return { subject: title, text, html };
}

export const emailTemplates = {
  contactConfirmation: (data: { fullName: string }) =>
    wrap("Nous avons bien reçu votre message", [
      `Bonjour ${data.fullName},`,
      "Merci pour votre message. Notre équipe revient vers vous sous 24 heures ouvrées.",
    ]),

  quoteRequestReceived: (data: { fullName: string; reference: string }) =>
    wrap("Votre demande de devis est enregistrée", [
      `Bonjour ${data.fullName},`,
      `Votre demande (référence ${data.reference}) est en cours d'analyse par notre équipe.`,
    ]),

  internalNewLead: (data: { fullName: string; email: string; source: string }) =>
    wrap("Nouveau prospect", [
      `Prospect : ${data.fullName} (${data.email})`,
      `Source : ${data.source}`,
    ]),

  quoteSent: (data: { fullName: string; number: string; validUntil?: string }) =>
    wrap(`Votre devis ${data.number}`, [
      `Bonjour ${data.fullName},`,
      `Veuillez trouver votre devis ${data.number}.`,
      data.validUntil ? `Ce devis est valable jusqu'au ${data.validUntil}.` : "",
    ]),

  ticketCreated: (data: { number: string; subject: string }) =>
    wrap(`Ticket ${data.number} créé`, [
      `Votre demande « ${data.subject} » a été enregistrée sous le numéro ${data.number}.`,
    ]),

  ticketReplied: (data: { number: string }) =>
    wrap(`Nouvelle réponse sur le ticket ${data.number}`, [
      "Une nouvelle réponse a été ajoutée à votre ticket.",
    ]),

  invoiceSent: (data: { number: string; total: string; dueDate?: string }) =>
    wrap(`Facture ${data.number}`, [
      `Montant : ${data.total}.`,
      data.dueDate ? `Échéance : ${data.dueDate}.` : "",
    ]),
} as const;

export type EmailTemplateKey = keyof typeof emailTemplates;