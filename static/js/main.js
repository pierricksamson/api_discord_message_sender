let currentTranslations = {};

// ---------------------------------------------------------------------
// i18n : les traductions sont injectées côté serveur dans window.I18N_DATA
// (voir base.html) -> plus de fetch(), application synchrone et immédiate.
// ---------------------------------------------------------------------

function applyLanguage(lang) {
  const dict = (window.I18N_DATA && (window.I18N_DATA[lang] || window.I18N_DATA.fr)) || {};
  currentTranslations = dict;

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    if (dict[key]) element.innerHTML = dict[key];
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    const key = element.dataset.i18nPlaceholder;
    if (dict[key]) element.placeholder = dict[key];
  });

  try {
    localStorage.setItem("app_lang", lang);
  } catch (err) {
    /* stockage indisponible (navigation privée) : pas bloquant */
  }

  // Révèle la page une fois la traduction posée
  document.documentElement.classList.add("i18n-ready");
}

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

// Exécuté dès que ce script est atteint : comme il est chargé en fin de
// <body>, tout le DOM existe déjà -> pas besoin d'attendre DOMContentLoaded
// pour poser la traduction le plus tôt possible.
(function initLanguage() {
  let saved = null;
  try {
    saved = localStorage.getItem("app_lang");
  } catch (err) {
    saved = null;
  }
  const lang = saved || (navigator.language.startsWith("fr") ? "fr" : "en");
  updateLangUI(lang, lang === "fr" ? "fi-fr" : "fi-us");
  applyLanguage(lang);
})();

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
        btn.textContent = currentTranslations["btn_copy"] ? "Copié !" : "Copied!";
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

  // --- 3. Sélecteur de langue (interactions) ---
  const toggleBtn = document.getElementById("langToggle");
  const dropdown = document.getElementById("langDropdown");
  const options = document.querySelectorAll(".lang-option");

  if (toggleBtn && dropdown) {
    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.toggle("show");
      toggleBtn.setAttribute("aria-expanded", isOpen);
    });

    options.forEach((option) => {
      option.addEventListener("click", () => {
        const lang = option.dataset.lang;
        const flagClass = option.dataset.flag;

        updateLangUI(lang, flagClass);
        dropdown.classList.remove("show");
        toggleBtn.setAttribute("aria-expanded", "false");
        applyLanguage(lang);
      });
    });

    document.addEventListener("click", (e) => {
      if (!toggleBtn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove("show");
        toggleBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  // --- 4. Modale de confirmation (remplace window.confirm natif) ---
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