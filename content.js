function convertFrenchNumbers() {
  // Expression régulière pour trouver les numéros français
  const frenchNumberRegex = /(?:\b0)[1-9]([\s.-]?\d{2}){4}\b/g;

  // Fonction pour convertir un numéro
  function convertToInternational(match) {
    const cleanNumber = match.replace(/[\s.-]/g, "");
    return "+33" + cleanNumber.substring(1);
  }

  // Parcourir tous les nœuds de texte de la page
  function walkText(node) {
    if (node.nodeType === 3) {
      // Nœud texte
      const text = node.textContent;
      const newText = text.replace(frenchNumberRegex, convertToInternational);
      if (text !== newText) {
        node.textContent = newText;
      }
    } else {
      node.childNodes.forEach(walkText);
    }
  }

  // Convertir les liens téléphoniques
  function convertPhoneLinks() {
    const telLinks = document.querySelectorAll('a[href^="tel:"]');
    telLinks.forEach((link) => {
      const href = link.getAttribute("href");
      const phoneNumber = href.replace("tel:", "");

      // Vérifier si c'est un numéro français
      if (phoneNumber.match(frenchNumberRegex)) {
        const convertedNumber = convertToInternational(phoneNumber);
        link.setAttribute("href", `tel:${convertedNumber}`);
      }
    });
  }

  // Lancer la conversion du texte
  walkText(document.body);

  // Lancer la conversion des liens
  convertPhoneLinks();
}

// Exécuter la conversion au chargement de la page
convertFrenchNumbers();

// Observer les changements dans le DOM
const observer = new MutationObserver((mutations) => {
  convertFrenchNumbers();
});

// Configurer l'observateur
observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ["href"],
});
