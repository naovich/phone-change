function convertFrenchNumbers() {
  // Expression régulière pour trouver les différents formats de numéros français
  const frenchNumberRegex = /(?:(?:\+33|0033|0))[1-9]([\s.-]?\d{2}){4}\b/g;

  // Fonction pour convertir un numéro au format international
  function convertToInternational(match) {
    // Nettoyer le numéro de tous les caractères non numériques
    const cleanNumber = match.replace(/[\s.-]/g, "");

    // Si le numéro commence par 0033, convertir en +33
    if (cleanNumber.startsWith("0033")) {
      return "+33" + cleanNumber.substring(4);
    }

    // Si le numéro commence déjà par +33, le laisser tel quel
    if (cleanNumber.startsWith("+33")) {
      return cleanNumber;
    }

    // Si le numéro commence par 0, convertir en +33
    if (cleanNumber.startsWith("0")) {
      return "+33" + cleanNumber.substring(1);
    }

    return match; // Format non reconnu, retourner tel quel
  }

  // Parcourir tous les nœuds de texte de la page
  function walkText(node) {
    if (node.nodeType === 3) {
      // Nœud texte
      const text = node.textContent;
      const newText = text.replace(frenchNumberRegex, convertToInternational);
      if (text !== newText) {
        node.nodeValue = newText; // Utiliser nodeValue au lieu de textContent
      }
    } else {
      Array.from(node.childNodes).forEach(walkText);
    }
  }

  // Convertir les liens téléphoniques
  function convertPhoneLinks() {
    const telLinks = document.querySelectorAll('a[href^="tel:"]');
    telLinks.forEach((link) => {
      if (link.dataset.converted) return; // Ignorer si déjà converti

      const href = link.getAttribute("href");
      const phoneNumber = href.replace("tel:", "");

      // Vérifier si c'est un numéro français (peu importe le format)
      if (phoneNumber.match(frenchNumberRegex)) {
        const convertedNumber = convertToInternational(phoneNumber);
        if (phoneNumber !== convertedNumber) {
          link.setAttribute("href", `tel:${convertedNumber}`);
          link.dataset.converted = "true"; // Marquer comme converti
        }
      }
    });
  }

  // Lancer la conversion du texte et des liens
  walkText(document.body);
  convertPhoneLinks();
}

// Exécuter la conversion au chargement de la page
convertFrenchNumbers();

// Observer les changements dans le DOM
const observer = new MutationObserver((mutations) => {
  let shouldProcess = false;

  // Vérifier si les mutations ne sont pas causées par notre script
  for (const mutation of mutations) {
    if (!mutation.target.dataset || !mutation.target.dataset.converted) {
      shouldProcess = true;
      break;
    }
  }

  if (shouldProcess) {
    convertFrenchNumbers();
  }
});

// Configurer l'observateur
observer.observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true,
  attributes: true,
  attributeFilter: ["href"],
});
