document.addEventListener("DOMContentLoaded", () => {
  // --- Onglets de la page /docs (Python / cURL / JavaScript) ---
  document.querySelectorAll("[data-tabs]").forEach((tabs) => {
    const buttons = tabs.querySelectorAll(".tab-btn");
    const panels = tabs.querySelectorAll(".tab-panel");

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.tab;
        buttons.forEach((b) => b.classList.toggle("active", b === btn));
        panels.forEach((p) => p.classList.toggle("active", p.dataset.panel === target));
      });
    });
  });

  // --- Bouton "Copier" (clé API révélée dans le dashboard) ---
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const value = btn.getAttribute("data-copy");
      try {
        await navigator.clipboard.writeText(value);
        const original = btn.textContent;
        btn.textContent = "Copié !";
        btn.disabled = true;
        setTimeout(() => {
          btn.textContent = original;
          btn.disabled = false;
        }, 1500);
      } catch (err) {
        console.error("Impossible de copier la clé :", err);
      }
    });
  });
});
document.addEventListener("DOMContentLoaded", () => {
  // --- 1. Onglets de la page /docs ---
  document.querySelectorAll("[data-tabs]").forEach((tabs) => {
    const buttons = tabs.querySelectorAll(".tab-btn");
    const panels = tabs.querySelectorAll(".tab-panel");

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.tab;
        buttons.forEach((b) => b.classList.toggle("active", b === btn));
        panels.forEach((p) => p.classList.toggle("active", p.dataset.panel === target));
      });
    });
  });

  // --- 2. Bouton "Copier" (Clé API) ---
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const value = btn.getAttribute("data-copy");
      try {
        await navigator.clipboard.writeText(value);
        const original = btn.textContent;
        btn.textContent = "Copié !";
        btn.disabled = true;
        setTimeout(() => {
          btn.textContent = original;
          btn.disabled = false;
        }, 1500);
      } catch (err) {
        console.error("Impossible de copier la clé :", err);
      }
    });
  });

  // --- 3. Sélecteur de Langue ---
  const toggleBtn = document.getElementById("langToggle");
  const dropdown = document.getElementById("langDropdown");
  const options = document.querySelectorAll(".lang-option");

  if (toggleBtn && dropdown) {
    // Ouvrir / Fermer le menu
    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.toggle("show");
      toggleBtn.setAttribute("aria-expanded", isOpen);
    });

    // Sélectionner une langue
    options.forEach((option) => {
      option.addEventListener("click", () => {
        const lang = option.dataset.lang;
        const flagClass = option.dataset.flag;

        updateLangUI(lang, flagClass);
        dropdown.classList.remove("show");
        toggleBtn.setAttribute("aria-expanded", "false");
        loadLanguage(lang);
      });
    });

    // Fermer le menu en cliquant dehors
    document.addEventListener("click", (e) => {
      if (!toggleBtn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove("show");
        toggleBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  // --- 4. Initialisation de la langue (localStorage -> navigateur -> 'fr') ---
  const savedLang =
    localStorage.getItem("app_lang") ||
    (navigator.language.startsWith("fr") ? "fr" : "en");

  const initialOption =
    document.querySelector(`.lang-option[data-lang="${savedLang}"]`) ||
    document.querySelector(".lang-option");

  if (initialOption) {
    updateLangUI(savedLang, initialOption.dataset.flag);
  }
  loadLanguage(savedLang);
});

// Met à jour le drapeau et le code dans le bouton
function updateLangUI(lang, flagClass) {
  const currentFlag = document.getElementById("currentFlag");
  const currentLang = document.getElementById("currentLang");
  const options = document.querySelectorAll(".lang-option");

  if (currentFlag) currentFlag.className = `fi ${flagClass}`;
  if (currentLang) currentLang.textContent = lang.toUpperCase();

  options.forEach((opt) => {
    opt.classList.toggle("active", opt.dataset.lang === lang);
  });
}

// Charge le fichier JSON de traduction et l'applique à la page
async function loadLanguage(lang) {
  try {
    const response = await fetch(`/static/lang/${lang}.json`);
    if (!response.ok) return;

    const translations = await response.json();

    // Sauvegarde du choix dans le navigateur
    localStorage.setItem("app_lang", lang);

    // Mise à jour du texte HTML
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.dataset.i18n;
      if (translations[key]) {
        element.innerHTML = translations[key];
      }
    });

    // Mise à jour des placeholders d'inputs
    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
      const key = element.dataset.i18nPlaceholder;
      if (translations[key]) {
        element.placeholder = translations[key];
      }
    });
  } catch (err) {
    console.error("Erreur lors du chargement du fichier de langue :", err);
  }
}