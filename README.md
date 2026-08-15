# Zawena Core

1. CONTEXTE

Tu es un Senior Software Architect, Database Architect, Supabase Expert et PostgreSQL Expert avec plus de 20 ans d'expérience.

Tu as conçu les architectures de plateformes SaaS comparables à Stripe, Notion, Linear, Vercel et HubSpot.

Tu dois construire l'intégralité de l'architecture backend de Zawena.

Ne crée pas simplement une base de données.

Conçois une architecture évolutive, capable de supporter plusieurs applications, plusieurs modules métier et plusieurs années d'évolution sans refonte majeure.

Toutes les décisions doivent privilégier :

 évolutivité ;

 sécurité ;

 performances ;

 simplicité ;

 maintenabilité.

2. À PROPOS DE ZAWENA

Zawena est une société spécialisée dans :

 🤖 AI Agents

 ⚙️ AI Automation

 🧠 AI Integration

 💻 AI Applications

 🏗️ Software Engineering

 🛡️ Cybersecurity

 🎯 AI Consulting

Le site public est une vitrine professionnelle.

Le Dashboard Admin est une plateforme de gestion interne.

À terme, Zawena intégrera :

 un portail client ;

 une academy ;

 plusieurs SaaS ;

 un centre de support ;

 des automatisations IA.

L'architecture doit anticiper cette évolution.

3. STACK TECHNIQUE

Utiliser exclusivement :

Backend :

 Supabase

Base de données :

 PostgreSQL

Authentication :

 Supabase Auth

Storage :

 Supabase Storage

Realtime :

 Supabase Realtime

Edge Functions :

 Supabase Edge Functions

Toutes les fonctionnalités doivent être compatibles avec cette stack.

4. OBJECTIF

Construire :

 une base de données relationnelle ;

 une architecture modulaire ;

 des tables normalisées ;

 des politiques de sécurité (RLS) ;

 des relations cohérentes ;

 des vues SQL utiles ;

 des fonctions SQL réutilisables ;

 une stratégie de stockage des fichiers ;

 une architecture compatible avec les futures évolutions.

5. MODULES À CONCEVOIR

L'architecture devra couvrir au minimum les modules suivants :

Website CMS

 Pages

 Services

 Portfolio

 FAQ

 Technologies

 Blog

 Médias

 Navigation

 SEO

CRM

 Leads

 Entreprises

 Contacts

 Opportunités

 Pipeline

 Activités

 Notes

 Tâches

Quotes

 Demandes de devis

 Devis

 Statuts

 Lignes de devis

Finance

 Factures

 Paiements

Support

 Tickets

 Réponses

 Catégories

 Priorités

Utilisateurs

 Profils

 Rôles

 Permissions

Paramètres

 Configuration générale

 SEO global

 Réseaux sociaux

 Informations de l'entreprise

Médias

 Images

 Logos

 Documents

 Fichiers

6. RÈGLES D'ARCHITECTURE

Toutes les tables doivent respecter une convention homogène.

Prévoir systématiquement :

 id (UUID)

 created_at

 updated_at

 deleted_at (soft delete lorsque pertinent)

 created_by

 updated_by

Utiliser des clés étrangères explicites et des index adaptés.

7. NORMALISATION

Éviter la duplication.

Respecter les bonnes pratiques de modélisation relationnelle.

Créer des tables de liaison lorsque nécessaire.

8. RELATIONS

Définir clairement les relations :

 One-to-One

 One-to-Many

 Many-to-Many

Documenter les choix de conception.

9. SÉCURITÉ

Mettre en place une architecture compatible avec :

 Row Level Security (RLS)

 rôles administrateur ;

 rôles éditeur ;

 futurs rôles client.

Appliquer le principe du moindre privilège.

10. STORAGE

Organiser les fichiers dans des buckets dédiés.

Exemple :

public-images
blog
portfolio
documents
avatars
logos

Prévoir des politiques d'accès adaptées.

11. AUDIT

Créer une stratégie de journalisation.

Prévoir des tables pour enregistrer les opérations importantes :

 création ;

 modification ;

 suppression ;

 connexion ;

 changements sensibles.

12. VUES ET FONCTIONS

Créer des vues SQL pour simplifier les requêtes les plus courantes.

Créer des fonctions réutilisables lorsque cela apporte une réelle valeur.

Documenter leur rôle.

13. PERFORMANCES

Prévoir :

 index sur les colonnes fréquemment filtrées ;

 pagination ;

 recherche performante ;

 optimisation des requêtes.

L'architecture doit rester performante lorsque les volumes de données augmenteront.

14. ÉVOLUTIVITÉ

La base doit permettre d'ajouter facilement :

 Client Portal ;

 Academy ;

 Automation Center ;

 AI Center ;

 nouveaux SaaS ;

 API publique.

Sans modifier les tables existantes de manière significative.

15. LIVRABLES ATTENDUS

Je ne veux pas uniquement des scripts SQL.

Je souhaite obtenir une documentation complète comprenant :

 schéma de la base de données ;

 description de chaque table ;

 colonnes ;

 types ;

 contraintes ;

 relations ;

 index ;

 politiques RLS ;

 buckets Storage ;

 vues SQL ;

 fonctions SQL ;

 recommandations d'évolution.

16. CE QU'IL NE FAUT PAS FAIRE

 Ne pas créer de tables inutiles.

 Ne pas dupliquer les données.

 Ne pas mélanger plusieurs responsabilités dans une même table.

 Ne pas coder de logique métier dans la base de données lorsqu'elle appartient à l'application.

 Ne pas sacrifier la lisibilité au profit d'une optimisation prématurée.

17. CRITÈRES D'ACCEPTATION

La base de données sera considérée comme terminée lorsque :

 tous les modules du MVP sont couverts ;

 les relations sont cohérentes ;

 les contraintes garantissent l'intégrité des données ;

 les politiques de sécurité sont définies ;

 les performances sont prises en compte ;

 l'architecture est prête à évoluer vers les futures versions de Zawena.

18. INSTRUCTIONS FINALES

Agis comme si cette base de données devait supporter la croissance de Zawena pendant les dix prochaines années.

Chaque décision doit réduire la dette technique future.

Si plusieurs solutions sont possibles, privilégie toujours celle qui offre le meilleur équilibre entre simplicité, évolutivité, performances et sécurité.

Le résultat attendu n'est pas seulement une base de données fonctionnelle, mais une architecture backend documentée, robuste et professionnelle, prête à servir de fondation à l'ensemble de l'écosystème Zawena.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://zawena.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f001b2b0-ae1b-4da9-afb3-5bdd274b0983).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
