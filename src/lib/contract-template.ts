export const CONTRACT_TEMPLATE = {
  title: "CONTRAT DE PRESTATION DE SERVICES ET D'UTILISATION DE LA PLATEFORME BENIN SANTÉ",
  introduction: `Le présent contrat est conclu ENTRE :
  BENIN SANTÉ, plateforme opérée par la société [NOM_SOCIETE], immatriculée au RCCM de Cotonou sous le numéro [NUMERO_RCCM], représentée par son Directeur Général.
  Ci-après dénommée "L'Entreprise".
  
  ET
  Le Praticien de santé, personne physique dûment inscrite à l'Ordre National des Médecins du Bénin (ONMB) ou autorité compétente, dont les informations sont renseignées lors de l'inscription sur la plateforme.
  Ci-après dénommé "Le Praticien".`,
  
  preamble: `Préambule : Benin Santé fournit une infrastructure numérique permettant la gestion de dossiers médicaux, la téléconsultation et la prise de rendez-vous. Le présent contrat encadre l'utilisation de ces services conformément aux dispositions de la Loi n° 2017-20 portant Code du numérique en République du Bénin.`,
  
  articles: [
    {
      id: 1,
      title: "OBJET DU CONTRAT",
      content: "Le présent contrat a pour objet de définir les conditions techniques et juridiques dans lesquelles l'Entreprise met à disposition du Praticien les outils numériques de Benin Santé pour l'exercice de ses fonctions."
    },
    {
      id: 2,
      title: "OBLIGATIONS DU PRATICIEN",
      content: "Le Praticien s'engage à : 1. Exercer son activité dans le respect strict du Code de Déontologie Médicale. 2. Vérifier l'identité des patients et obtenir leur consentement avant tout accès au carnet de santé numérique. 3. Assurer la confidentialité absolue des données consultées."
    },
    {
      id: 3,
      title: "SÉCURITÉ ET DONNÉES PERSONNELLES",
      content: "Conformément à la Loi n° 2009-09 portant protection des données à caractère personnel au Bénin, l'Entreprise met en œuvre des mesures de sécurité de niveau bancaire. Le Praticien est responsable de la protection de ses identifiants d'accès."
    },
    {
      id: 4,
      title: "MODALITÉS FINANCIÈRES",
      content: "Le Praticien fixe librement le montant de ses honoraires à l'issue de chaque consultation. L'Entreprise pourra prélever des frais de service sur les transactions effectuées via la plateforme, conformément à la grille tarifaire en vigueur."
    },
    {
      id: 5,
      title: "RÉSILIATION",
      content: "Chaque partie peut résilier le présent contrat moyennant un préavis de trente (30) jours adressé par voie électronique. En cas de manquement grave aux règles déontologiques ou de sécurité, la résiliation peut être immédiate."
    },
    {
      id: 6,
      title: "LITIGES",
      content: "Le présent contrat est régi par la loi béninoise. Tout litige sera soumis à une tentative de conciliation amiable, à défaut de laquelle compétence est attribuée au Tribunal de Commerce de Cotonou."
    }
  ],
  
  footer: "Fait à Cotonou, le " + new Date().toLocaleDateString('fr-FR')
};
