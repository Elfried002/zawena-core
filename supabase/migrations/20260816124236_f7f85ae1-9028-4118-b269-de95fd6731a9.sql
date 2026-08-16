
update public.services set content = content || $j${
  "image": "/images/services/ai-agents.jpg",
  "imageAlt": "Ingénieur Zawena supervisant une interface d'agent IA affichant une conversation et une file de tâches",
  "pricingNote": "Le tarif final dépend du périmètre, de la complexité et des besoins spécifiques du projet.",
  "benefits": [
    "Moins de temps passé sur les tâches répétitives à faible valeur.",
    "Des demandes traitées plus vite, y compris en dehors des heures de bureau.",
    "Une information retrouvée directement dans vos documents internes.",
    "Des données CRM tenues à jour sans double saisie.",
    "Une charge mentale allégée pour les équipes commerciales et support.",
    "Un contrôle humain conservé sur les décisions sensibles."
  ],
  "deliverables": [
    "Cadrage du périmètre d'action et des règles de l'agent.",
    "Agent connecté à vos outils (CRM, e-mail, agenda, base documentaire).",
    "Console de supervision : historique des actions et traçabilité.",
    "Politique de permissions et points de validation humaine.",
    "Documentation d'exploitation et transfert de compétences."
  ],
  "process": [
    { "title": "Analyse", "description": "Nous identifions les tâches répétitives et les règles métier à respecter." },
    { "title": "Conception", "description": "Nous définissons le périmètre de l'agent, ses outils, ses permissions et ses garde-fous." },
    { "title": "Développement", "description": "Nous construisons l'agent et ses connexions à vos systèmes." },
    { "title": "Tests", "description": "Nous validons les scénarios réels, les cas limites et les refus attendus." },
    { "title": "Déploiement", "description": "Mise en production progressive, d'abord en mode assisté." },
    { "title": "Suivi", "description": "Observation des exécutions, ajustement des règles et des prompts." }
  ],
  "useCases": [
    "Un agent qui répond aux demandes clients courantes et escalade le reste à un humain.",
    "Un agent qui qualifie chaque prospect entrant et crée la fiche dans le CRM.",
    "Un agent qui recherche une réponse dans vos documents internes et cite ses sources.",
    "Un agent qui rédige et envoie les e-mails de suivi après validation.",
    "Un agent qui propose et pose des rendez-vous dans l'agenda de l'équipe.",
    "Un agent qui produit chaque matin un rapport d'activité consolidé.",
    "Un agent qui traite les demandes internes (RH, IT, achats) selon des règles définies."
  ],
  "faq": [
    { "question": "Les agents agissent-ils sans supervision ?", "answer": "Non. Chaque action sensible passe par une validation humaine, sauf décision explicite de votre part sur un périmètre restreint." },
    { "question": "Peut-on connecter un agent à nos outils actuels ?", "answer": "Oui, dès qu'une API ou une base de données est accessible. Nous cadrons les accès au strict nécessaire." },
    { "question": "Quel type d'entreprise est concerné ?", "answer": "PME, groupes, cabinets, e-commerce, institutions : dès qu'une équipe traite un volume régulier de demandes ou de documents." },
    { "question": "Que se passe-t-il si l'agent se trompe ?", "answer": "Les actions sont journalisées et réversibles sur le périmètre défini ; les cas ambigus sont renvoyés à un humain plutôt que devinés." },
    { "question": "Combien de temps pour un premier agent en production ?", "answer": "Selon le périmètre, un premier agent utile se construit généralement en quelques semaines, pas en quelques mois." },
    { "question": "Comment est calculé le prix ?", "answer": "La mise en place démarre à 250 000 FCFA. Le tarif final dépend du nombre d'outils connectés, des règles métier et du niveau de supervision attendu." }
  ]
}$j$ where slug = 'ai-agents';

update public.services set content = content || $j${
  "image": "/images/services/ai-automation.jpg",
  "imageAlt": "Deux collaborateurs analysant un workflow automatisé représenté par des étapes connectées sur un grand écran",
  "pricingNote": "Le tarif final dépend du périmètre, de la complexité et des besoins spécifiques du projet.",
  "benefits": [
    "Suppression des recopies manuelles entre logiciels.",
    "Délais de traitement raccourcis et plus prévisibles.",
    "Moins d'erreurs de saisie et de dossiers oubliés.",
    "Visibilité sur l'état réel de chaque dossier.",
    "Des équipes recentrées sur les tâches à valeur ajoutée."
  ],
  "deliverables": [
    "Cartographie du processus actuel et des points de friction.",
    "Workflows automatisés déployés et documentés.",
    "Connexions aux outils concernés (CRM, e-mail, tableurs, ERP, APIs).",
    "Journal d'exécution et alertes en cas d'échec.",
    "Maintenance et supervision assurées dans le cadre du service."
  ],
  "process": [
    { "title": "Analyse", "description": "Nous suivons le processus réel, étape par étape, avec les personnes qui l'exécutent." },
    { "title": "Conception", "description": "Nous distinguons les étapes déterministes de celles qui demandent de l'interprétation." },
    { "title": "Intégration", "description": "Nous connectons les outils et construisons le workflow." },
    { "title": "Tests", "description": "Exécutions à blanc sur des cas réels, gestion des erreurs et des reprises." },
    { "title": "Déploiement", "description": "Bascule progressive avec retour arrière possible." },
    { "title": "Suivi", "description": "Supervision des exécutions et amélioration continue." }
  ],
  "capabilities": [
    { "title": "Formulaires et demandes entrantes", "description": "Réception, qualification, routage et enregistrement automatiques." },
    { "title": "CRM et données commerciales", "description": "Création et mise à jour de fiches, relances, synchronisation." },
    { "title": "E-mail et messagerie", "description": "Gmail, boîtes partagées, notifications WhatsApp selon les cas." },
    { "title": "Tableurs et bases de données", "description": "Google Sheets, PostgreSQL, entrepôts internes." },
    { "title": "ERP et outils internes", "description": "Connexion via API ou interfaces d'échange existantes." },
    { "title": "Rapports et alertes", "description": "Consolidation périodique et diffusion automatique." }
  ],
  "useCases": [
    "Exemple de chaîne : formulaire → analyse IA → création CRM → e-mail au client → notification interne → rapport.",
    "Devis et factures générés puis envoyés sans ressaisie.",
    "Demandes WhatsApp centralisées dans un outil unique de suivi.",
    "Rapport hebdomadaire d'activité produit et diffusé automatiquement.",
    "Relances automatiques des dossiers restés sans réponse.",
    "Réconciliation régulière entre un tableur, le CRM et l'ERP."
  ],
  "faq": [
    { "question": "Faut-il remplacer nos outils actuels ?", "answer": "Rarement. Nous automatisons d'abord autour de l'existant et ne recommandons un remplacement que s'il est justifié." },
    { "question": "Comment mesurez-vous le gain ?", "answer": "Nous définissons avant le projet les indicateurs suivis : temps de traitement, volume traité, taux d'erreur." },
    { "question": "Que se passe-t-il si une automatisation échoue ?", "answer": "Chaque exécution est journalisée ; une alerte est envoyée et le dossier reste traçable pour reprise manuelle." },
    { "question": "Assurez-vous la maintenance ?", "answer": "Oui. La supervision et la maintenance des workflows font partie du service, discutées lors du cadrage." },
    { "question": "Quel est le prix de départ ?", "answer": "La mise en place démarre à 200 000 FCFA, selon le nombre d'étapes et d'outils à connecter." }
  ]
}$j$ where slug = 'ai-automation';

update public.services set content = content || $j${
  "image": "/images/services/ai-integration.jpg",
  "imageAlt": "Poste de développement affichant des appels d'API et un schéma de base de données lors d'une intégration IA",
  "pricingNote": "Le tarif final dépend du périmètre, de la complexité et des besoins spécifiques du projet.",
  "benefit": "Vous n'avez pas toujours besoin de remplacer vos outils. Nous pouvons leur ajouter de l'intelligence.",
  "benefits": [
    "Vos outils actuels gagnent des capacités IA sans être remplacés.",
    "Vos documents deviennent réellement interrogeables.",
    "Moins de recherche manuelle d'informations.",
    "Des contenus et synthèses générés à partir de vos propres données.",
    "Un contrôle explicite sur les données exposées à l'IA."
  ],
  "deliverables": [
    "Intégration IA dans l'outil existant (CRM, ERP, application interne).",
    "Index documentaire et système de recherche augmentée (RAG).",
    "Règles d'accès aux données et cloisonnement par profil.",
    "Journalisation des requêtes et des réponses.",
    "Documentation technique et accompagnement des utilisateurs."
  ],
  "process": [
    { "title": "Analyse", "description": "Inventaire des outils, des données disponibles et des cas d'usage prioritaires." },
    { "title": "Conception", "description": "Choix du modèle, du mode d'intégration et des règles d'accès aux données." },
    { "title": "Intégration", "description": "Développement des connecteurs, de l'index documentaire et de l'interface." },
    { "title": "Tests", "description": "Contrôle de la qualité des réponses, des sources citées et des refus." },
    { "title": "Déploiement", "description": "Mise en production sur un périmètre pilote puis extension." },
    { "title": "Suivi", "description": "Mesure de l'usage réel et ajustement des données indexées." }
  ],
  "useCases": [
    "Intégrer un modèle (ChatGPT, Claude) dans un CRM pour préparer les réponses commerciales.",
    "Ajouter un assistant IA dans une application métier existante.",
    "Permettre à l'IA d'interroger une base de données en lecture, avec des règles strictes.",
    "Recherche documentaire intelligente sur les contrats, procédures et rapports.",
    "Connecter une IA à un ERP pour expliquer un écart ou résumer une situation.",
    "Génération automatique de comptes rendus, réponses ou fiches à partir de vos données.",
    "Système RAG sur la documentation interne de l'entreprise."
  ],
  "faq": [
    { "question": "Nos données servent-elles à entraîner un modèle ?", "answer": "Non. Nous utilisons vos données pour répondre à vos requêtes, pas pour entraîner des modèles publics." },
    { "question": "Qui peut consulter quoi ?", "answer": "Les accès sont cloisonnés par profil : l'IA ne voit que les documents auxquels l'utilisateur a droit." },
    { "question": "Faut-il changer d'outil pour intégrer l'IA ?", "answer": "Le plus souvent non : nous ajoutons des capacités à l'outil existant dès qu'une API est disponible." },
    { "question": "Quel niveau de fiabilité peut-on attendre ?", "answer": "Nous privilégions les réponses sourcées : l'IA cite les documents utilisés, ce qui rend la vérification possible." },
    { "question": "Quel est le prix de départ ?", "answer": "La mise en place démarre à 300 000 FCFA, selon le nombre de systèmes et le volume documentaire." }
  ]
}$j$ where slug = 'ai-integration';

update public.services set content = content || $j${
  "image": "/images/services/ai-applications.jpg",
  "imageAlt": "Ordinateur portable et tablette affichant une plateforme métier moderne avec tableaux de bord et indicateurs",
  "pricingNote": "Le tarif final dépend du périmètre, de la complexité et des besoins spécifiques du projet.",
  "benefits": [
    "Un produit numérique aligné sur votre métier, pas sur un logiciel générique.",
    "Une expérience utilisateur pensée pour vos équipes et vos clients.",
    "Des données centralisées et exploitables pour décider.",
    "Des fonctions IA intégrées nativement, pas ajoutées après coup.",
    "Une base technique prévue pour évoluer sans réécriture."
  ],
  "deliverables": [
    "Cadrage fonctionnel et parcours utilisateurs.",
    "Design UX/UI et système de composants.",
    "Frontend, backend, base de données et authentification.",
    "Fonctionnalités IA, tableaux de bord et intégrations tierces.",
    "Déploiement, supervision et maintenance."
  ],
  "process": [
    { "title": "Analyse", "description": "Objectifs métier, utilisateurs, contraintes et périmètre de la version 1." },
    { "title": "Conception", "description": "Architecture, modèle de données, UX/UI et maquettes." },
    { "title": "Développement", "description": "Construction par itérations livrables : frontend, backend, IA, intégrations." },
    { "title": "Tests", "description": "Validation fonctionnelle, contrôle des accès et vérifications de sécurité." },
    { "title": "Déploiement", "description": "Mise en production, observabilité et plan de retour arrière." },
    { "title": "Suivi", "description": "Maintenance, évolutions et amélioration continue." }
  ],
  "useCases": [
    "Plateforme SaaS destinée à vos clients ou à votre réseau.",
    "Portail client avec suivi des demandes et documents.",
    "Plateforme RH : candidatures, dossiers, processus internes.",
    "Dashboard décisionnel consolidant plusieurs sources.",
    "Application commerciale : pipeline, devis, relances.",
    "Plateforme de gestion métier avec rôles et permissions.",
    "Application intégrant un assistant IA pour ses utilisateurs."
  ],
  "faq": [
    { "question": "Pourquoi développer plutôt qu'acheter une solution existante ?", "answer": "Quand votre processus est un avantage concurrentiel ou qu'aucun outil du marché ne le couvre correctement, le sur-mesure devient rentable." },
    { "question": "Sommes-nous propriétaires du code ?", "answer": "Oui. Le code, les données et la documentation vous appartiennent." },
    { "question": "Peut-on démarrer petit ?", "answer": "Oui, et c'est ce que nous recommandons : une première version utile, puis des itérations mesurées." },
    { "question": "Assurez-vous la maintenance après livraison ?", "answer": "Oui, la maintenance et les évolutions font partie du service, cadrées avec vous." },
    { "question": "Quel est le prix de départ ?", "answer": "La mise en place démarre à 750 000 FCFA, selon le périmètre fonctionnel et le niveau d'intégration attendu." }
  ]
}$j$ where slug = 'ai-applications';

update public.services set content = content || $j${
  "image": "/images/services/software-engineering.jpg",
  "imageAlt": "Équipe d'ingénieurs logiciels concevant une architecture applicative au tableau blanc",
  "pricingNote": "Le tarif final dépend du périmètre, de la complexité et des besoins spécifiques du projet.",
  "benefits": [
    "Des systèmes maintenables, documentés et compréhensibles.",
    "Une architecture qui absorbe la croissance sans réécriture.",
    "Moins de dépendance à une seule personne ou à un prestataire opaque.",
    "Des applications vieillissantes modernisées progressivement.",
    "Une sécurité prise en compte dès la conception."
  ],
  "deliverables": [
    "Sites et applications web, APIs et services backend.",
    "Modélisation et optimisation de bases de données.",
    "Refonte ou modernisation d'applications existantes.",
    "Intégration de services tiers (paiement, e-mail, ERP, outils métier).",
    "Documentation d'architecture et maintenance."
  ],
  "process": [
    { "title": "Analyse", "description": "Compréhension du besoin, de l'existant et des contraintes techniques." },
    { "title": "Conception", "description": "Architecture, modèle de données et découpage des livraisons." },
    { "title": "Développement", "description": "Itérations courtes, revues de code et environnements de test." },
    { "title": "Tests", "description": "Validation fonctionnelle, performance et contrôles de sécurité." },
    { "title": "Déploiement", "description": "Mise en production outillée, réversible et observable." },
    { "title": "Suivi", "description": "Maintenance corrective et évolutive, scalabilité." }
  ],
  "useCases": [
    "Site web institutionnel performant et bien référencé.",
    "Application web métier remplaçant un ensemble de tableurs.",
    "API exposant vos données à vos partenaires de façon sécurisée.",
    "Refonte d'une application ancienne devenue risquée à modifier.",
    "Reprise de maintenance d'un logiciel existant après départ d'un prestataire.",
    "Mise en place d'une architecture prête pour la montée en charge."
  ],
  "faq": [
    { "question": "Reprenez-vous un projet existant ?", "answer": "Oui. Nous commençons par un audit du code et de l'architecture avant tout engagement de délai." },
    { "question": "Travaillez-vous sans IA ?", "answer": "Oui. L'IA n'est ajoutée que lorsqu'elle apporte une valeur réelle au produit." },
    { "question": "Comment garantissez-vous la maintenabilité ?", "answer": "Architecture explicite, règles côté serveur, tests sur les parties critiques et documentation livrée." },
    { "question": "Quel est le prix de départ ?", "answer": "La mise en place démarre à 400 000 FCFA, selon le périmètre et l'état du système existant." }
  ]
}$j$ where slug = 'software-engineering';

update public.services set content = content || $j${
  "image": "/images/services/cybersecurity.jpg",
  "imageAlt": "Analyste sécurité examinant des tableaux de bord de surveillance réseau et de contrôle des accès",
  "pricingNote": "Le tarif final dépend du nombre de systèmes, d'utilisateurs et d'applications, ainsi que de la profondeur de l'audit.",
  "benefits": [
    "Une vision claire de votre niveau d'exposition réel.",
    "Des risques classés par priorité, pas une liste indigeste.",
    "Des accès maîtrisés et limités au nécessaire.",
    "Des applications et configurations durcies.",
    "Des décisions d'architecture prises en connaissance de cause."
  ],
  "deliverables": [
    "Rapport de diagnostic : état des lieux et risques principaux.",
    "Rapport d'audit détaillé avec preuves et niveaux de gravité.",
    "Plan de correction priorisé et chiffré en effort.",
    "Mise en œuvre du durcissement et du contrôle des accès.",
    "Recommandations d'architecture et bonnes pratiques pour les équipes."
  ],
  "process": [
    { "title": "Analyse", "description": "Périmètre, inventaire des systèmes, utilisateurs et données sensibles." },
    { "title": "Évaluation", "description": "Recherche de vulnérabilités, revue des configurations et des accès." },
    { "title": "Priorisation", "description": "Classement des risques selon impact métier et probabilité." },
    { "title": "Sécurisation", "description": "Correction des configurations, durcissement, contrôle des accès." },
    { "title": "Vérification", "description": "Nouveau contrôle pour confirmer la correction effective." },
    { "title": "Suivi", "description": "Recommandations d'architecture et suivi des dépendances." }
  ],
  "useCases": [
    "Connaître son exposition avant une levée de fonds ou un appel d'offres.",
    "Auditer une application web accessible publiquement.",
    "Reprendre le contrôle des accès après plusieurs départs.",
    "Durcir une infrastructure cloud configurée dans l'urgence.",
    "Vérifier la sécurité d'une intégration avec un partenaire.",
    "Préparer une politique d'accès conforme au moindre privilège."
  ],
  "faq": [
    { "question": "Un audit peut-il perturber la production ?", "answer": "Non. Le périmètre et les méthodes sont définis avec vous, et les tests intrusifs ne sont menés qu'avec autorisation écrite." },
    { "question": "Que contient le diagnostic à 150 000 FCFA ?", "answer": "Un état des lieux, les risques principaux, des recommandations et leur priorisation." },
    { "question": "Pourquoi le prix d'un audit varie-t-il ?", "answer": "Il dépend du nombre de systèmes, d'utilisateurs et d'applications, ainsi que de la profondeur d'analyse demandée." },
    { "question": "Corrigez-vous ce que vous trouvez ?", "answer": "Oui, la prestation de sécurisation intervient après l'audit : configurations, durcissement, accès, applications." },
    { "question": "Livrez-vous des preuves des vulnérabilités ?", "answer": "Oui, chaque constat est documenté avec sa gravité, son impact et la correction recommandée." }
  ]
}$j$ where slug = 'cybersecurity';

update public.services set content = content || $j${
  "image": "/images/services/ai-consulting.jpg",
  "imageAlt": "Atelier stratégique présentant une feuille de route technologique à une équipe de direction",
  "pricingNote": "Le tarif final dépend du périmètre, de la complexité et des besoins spécifiques du projet.",
  "benefits": [
    "Savoir par où commencer, sans investir à l'aveugle.",
    "Des cas d'usage classés par valeur, effort et risque.",
    "Une estimation réaliste des coûts et des gains recherchés.",
    "Des projets inutiles écartés avant d'être lancés.",
    "Une feuille de route partagée entre direction et équipes."
  ],
  "deliverables": [
    "Compte rendu d'entretien et analyse des processus.",
    "Liste des opportunités d'IA et d'automatisation identifiées.",
    "Estimation des coûts et des gains potentiels par cas d'usage.",
    "Classement des projets et arbitrages recommandés.",
    "Roadmap 3 – 6 – 12 mois."
  ],
  "process": [
    { "title": "Entretien", "description": "Échange avec la direction sur les objectifs, contraintes et priorités." },
    { "title": "Analyse", "description": "Revue des processus, des outils et des données disponibles." },
    { "title": "Identification", "description": "Repérage des opportunités et des solutions à éviter." },
    { "title": "Estimation", "description": "Coûts, effort, risques et gains recherchés pour chaque piste." },
    { "title": "Priorisation", "description": "Classement des projets selon valeur et faisabilité." },
    { "title": "Roadmap", "description": "Feuille de route 3 – 6 – 12 mois, prête à être exécutée." }
  ],
  "useCases": [
    "Exemple de mission stratégique (environ 250 000 FCFA selon périmètre) : entretien de direction, analyse des processus, identification des opportunités, estimation des coûts et des gains, classement des projets, roadmap 3 – 6 – 12 mois.",
    "Décider s'il faut automatiser, intégrer l'IA ou d'abord corriger un processus.",
    "Arbitrer entre plusieurs demandes internes concurrentes.",
    "Estimer le budget d'un programme IA avant de le lancer.",
    "Cadrer un premier projet pilote mesurable.",
    "Former la direction aux usages réalistes de l'IA dans son secteur."
  ],
  "faq": [
    { "question": "Par quoi commencer si nous n'avons aucune expérience de l'IA ?", "answer": "Par une consultation ou un diagnostic : nous partons de vos processus réels avant toute recommandation technique." },
    { "question": "Le montant de 250 000 FCFA est-il le prix de l'offre complète ?", "answer": "Non. Il s'agit uniquement d'un exemple de mission stratégique. Les tarifs de référence sont : consultation à partir de 50 000 FCFA, diagnostic à partir de 150 000 FCFA, stratégie complète à partir de 300 000 FCFA." },
    { "question": "Sommes-nous obligés de réaliser les projets avec Zawena ?", "answer": "Non. Les livrables sont exploitables par n'importe quelle équipe, interne ou externe." },
    { "question": "Nous dites-vous aussi ce qu'il ne faut pas faire ?", "answer": "Oui. Écarter les solutions inadaptées fait partie du travail, et c'est souvent le plus rentable." },
    { "question": "Combien de temps dure une mission ?", "answer": "D'une session courte pour une consultation à quelques semaines pour une stratégie complète." }
  ]
}$j$ where slug = 'ai-consulting';
