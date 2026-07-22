// Traductions courantes, accessibles depuis toute la page (ex: modale de confirmation)
let currentTranslations = {};

document.addEventListener("DOMContentLoaded", () => {
  // --- 1. Onglets de la page /docs (Python / cURL / JavaScript) ---
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

  // --- 2. Bouton "Copier" (clé API révélée dans le dashboard) ---
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

  // --- 3. Sélecteur de langue ---
  const toggleBtn = document.getElementById("langToggle");
  const dropdown = document.getElementById("langDropdown");
  const options = document.querySelectorAll(".lang-option");

  if (toggleBtn && dropdown) {
    // Ouvrir / fermer le menu
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

  // --- 5. Modale de confirmation (remplace window.confirm natif) ---
  const confirmOverlay = document.getElementById("confirmModalOverlay");
  const confirmMessageEl = document.getElementById("confirmModalMessage");
  const confirmBtn = document.getElementById("confirmModalConfirm");
  const cancelBtn = document.getElementById("confirmModalCancel");
  let pendingForm = null;

  function openConfirmModal(message, form) {
    pendingForm = form;
    confirmMessageEl.textContent = message;
    confirmOverlay.classList.add("show");
    confirmBtn.focus();
  }

  function closeConfirmModal() {
    pendingForm = null;
    confirmOverlay.classList.remove("show");
  }

  if (confirmOverlay) {
    document.querySelectorAll(".js-confirm-form").forEach((form) => {
      form.addEventListener("submit", (e) => {
        if (form.dataset.confirmed === "true") return;
        e.preventDefault();
        const key = form.dataset.confirmText;
        const message =
          (currentTranslations && currentTranslations[key]) ||
          form.dataset.confirmFallback ||
          "Êtes-vous sûr ?";
        openConfirmModal(message, form);
      });
    });

    confirmBtn.addEventListener("click", () => {
      if (pendingForm) {
        pendingForm.dataset.confirmed = "true";
        pendingForm.submit();
      }
      closeConfirmModal();
    });

    cancelBtn.addEventListener("click", closeConfirmModal);

    confirmOverlay.addEventListener("click", (e) => {
      if (e.target === confirmOverlay) closeConfirmModal();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && confirmOverlay.classList.contains("show")) {
        closeConfirmModal();
      }
    });
  }
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
    currentTranslations = translations;

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