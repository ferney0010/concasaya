(function () {
  "use strict";

  const currentPath = window.location.pathname.toLowerCase();
  const isHomePage = currentPath === "/" || currentPath.endsWith("/index.html");

  const config = {
    whatsappNumber: "573142891018",
    termsPremioSurpriseUrl: "/terminos-premio-sorpresa.html",
    showDelayMs: 18000,
    minimumScrollPercent: 35,
    dismissedCooldownDays: 7,
    convertedCooldownDays: 30,
    sessionKey: "concasayaLeadModalShownThisSession",
    dismissedKey: "concasayaLeadModalDismissedAt",
    convertedKey: "concasayaLeadModalConvertedAt",
    neverShowKey: "concasayaLeadModalNeverShow",
    excludedPaths: ["/admin/", "/chatbot.html", "/cotizador-encuesta.html"],
  };

  if (isHomePage) {
    Object.assign(config, {
      showDelayMs: 7000,
      minimumScrollPercent: 12,
      sessionKey: "concasayaLeadModalShownHomeSession",
      neverShowKey: "concasayaLeadModalNeverShowHome",
    });
  }

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const readStorage = (storageType, key) => {
    try {
      return window[storageType].getItem(key);
    } catch (error) {
      return null;
    }
  };

  const writeStorage = (storageType, key, value) => {
    try {
      window[storageType].setItem(key, value);
    } catch (error) {
      // Si el navegador bloquea el almacenamiento, el modal sigue funcionando sin frecuencia persistente.
    }
  };

  let hasRendered = false;
  let timerCompleted = false;
  let scrollCompleted = false;

  const path = currentPath;
  const params = new URLSearchParams(window.location.search);

  const isExpired = (key, days) => {
    const timestamp = Number(readStorage("localStorage", key) || 0);
    return !timestamp || now - timestamp > days * dayMs;
  };

  const shouldSkip = () => {
    if (params.get("noLeadModal") === "1") return true;
    if (config.excludedPaths.some((excludedPath) => path.includes(excludedPath))) return true;
    if (readStorage("localStorage", config.neverShowKey) === "1") return true;
    if (readStorage("sessionStorage", config.sessionKey) === "1") return true;
    if (!isHomePage && !isExpired(config.dismissedKey, config.dismissedCooldownDays)) return true;
    if (!isExpired(config.convertedKey, config.convertedCooldownDays)) return true;
    return false;
  };

  if (shouldSkip()) return;

  const injectStyles = () => {
    const style = document.createElement("style");
    style.textContent = `
      .cc-lead-modal {
        position: fixed;
        right: 1rem;
        bottom: 5.75rem;
        z-index: 60;
        width: min(92vw, 380px);
        font-family: "Poppins", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        color: #0f172a;
        transform: translateY(18px);
        opacity: 0;
        pointer-events: none;
        transition: opacity 220ms ease, transform 220ms ease;
      }

      .cc-lead-modal.is-visible {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
      }

      .cc-lead-modal__card {
        position: relative;
        overflow: hidden;
        border: 1px solid rgba(0, 119, 182, 0.16);
        border-radius: 22px;
        background: rgba(255, 255, 255, 0.96);
        box-shadow: 0 22px 60px rgba(15, 23, 42, 0.22);
        backdrop-filter: blur(14px);
      }

      .cc-lead-modal__card::before {
        content: "";
        position: absolute;
        inset: 0;
        height: 6px;
        background: linear-gradient(90deg, #0077b6, #10b981);
      }

      .cc-lead-modal__content {
        padding: 1.15rem;
      }

      .cc-lead-modal__title {
        margin: 0 2rem 0.5rem 0;
        padding: 0 0 0.4rem;
        color: #0d1b2a;
        font-size: 1.32rem;
        line-height: 1.12;
        font-weight: 800;
        letter-spacing: -0.03em;
      }

      .cc-lead-modal__title::after {
        content: "";
        display: block;
        margin-top: 0.42rem;
        width: min(140px, 42%);
        height: 4px;
        border-radius: 999px;
        background: linear-gradient(90deg, #0077b6, #10b981);
      }

      .cc-lead-modal__title-em {
        color: #0077b6;
      }

      .cc-lead-modal__text {
        margin: 0 0 0.72rem;
        color: #475569;
        font-size: 0.84rem;
        line-height: 1.4;
      }

      .cc-lead-modal__form {
        display: grid;
        gap: 0.65rem;
      }

      .cc-lead-modal__input {
        width: 100%;
        border: 1px solid #d7e1ea;
        border-radius: 13px;
        padding: 0.75rem 0.85rem;
        background: #f8fafc;
        color: #0f172a;
        font: inherit;
        font-size: 0.9rem;
        outline: none;
        transition: border-color 180ms ease, box-shadow 180ms ease, background 180ms ease;
      }

      .cc-lead-modal__input:focus {
        border-color: #0077b6;
        background: #fff;
        box-shadow: 0 0 0 3px rgba(0, 119, 182, 0.14);
      }

      .cc-lead-modal__submit {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.45rem;
        border: 0;
        border-radius: 14px;
        padding: 0.82rem 1rem;
        background: linear-gradient(135deg, #16a34a, #059669);
        color: #fff;
        font: inherit;
        font-weight: 800;
        cursor: pointer;
        box-shadow: 0 12px 26px rgba(5, 150, 105, 0.3);
        transition: transform 180ms ease, box-shadow 180ms ease;
      }

      .cc-lead-modal__submit:hover {
        transform: translateY(-1px);
        box-shadow: 0 16px 30px rgba(5, 150, 105, 0.36);
      }

      .cc-lead-modal__never {
        width: 100%;
        border: 0;
        background: transparent;
        color: #64748b;
        font: inherit;
        font-size: 0.74rem;
        text-decoration: underline;
        cursor: pointer;
      }

      .cc-lead-modal__never:hover {
        color: #0d1b2a;
      }

      .cc-lead-modal__fineprint {
        margin: 0.55rem 0 0;
        color: #64748b;
        font-size: 0.72rem;
        line-height: 1.35;
      }

      .cc-lead-modal__terms-link {
        color: #0077b6;
        font-weight: 600;
        text-decoration: underline;
        text-underline-offset: 2px;
      }

      .cc-lead-modal__terms-link:hover {
        color: #005f92;
      }

      .cc-lead-modal__close {
        position: absolute;
        top: 0.75rem;
        right: 0.75rem;
        display: grid;
        place-items: center;
        width: 2rem;
        height: 2rem;
        border: 0;
        border-radius: 999px;
        background: #eef5f9;
        color: #334155;
        font-size: 1.25rem;
        line-height: 1;
        cursor: pointer;
      }

      .cc-lead-modal__close:hover {
        background: #dbeafe;
        color: #0d1b2a;
      }

      @media (max-width: 640px) {
        .cc-lead-modal {
          left: 0.65rem;
          right: 0.65rem;
          bottom: calc(4.85rem + env(safe-area-inset-bottom, 0px));
          width: auto;
          max-height: min(78vh, 560px);
        }

        .cc-lead-modal__card {
          border-radius: 18px;
          max-height: inherit;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }

        .cc-lead-modal__content {
          padding: 0.95rem;
        }

        .cc-lead-modal__title {
          margin-right: 2.35rem;
          font-size: 1.14rem;
          line-height: 1.12;
          padding-bottom: 0;
        }

        .cc-lead-modal__title::after {
          margin-top: 0.35rem;
          height: 3px;
        }

        .cc-lead-modal__text {
          margin-bottom: 0.62rem;
          font-size: 0.79rem;
          line-height: 1.38;
        }

        .cc-lead-modal__form {
          gap: 0.5rem;
        }

        .cc-lead-modal__input {
          min-height: 2.75rem;
          padding: 0.68rem 0.75rem;
          border-radius: 12px;
          font-size: 1rem;
        }

        .cc-lead-modal__submit {
          min-height: 2.8rem;
          padding: 0.74rem 0.85rem;
          border-radius: 12px;
          font-size: 0.92rem;
        }

        .cc-lead-modal__fineprint {
          margin-top: 0.45rem;
          font-size: 0.64rem;
        }

        .cc-lead-modal__never {
          padding: 0.35rem 0;
          font-size: 0.68rem;
        }

        .cc-lead-modal__close {
          top: 0.55rem;
          right: 0.55rem;
          width: 2.15rem;
          height: 2.15rem;
        }
      }

      @media (max-width: 360px), (max-height: 620px) {
        .cc-lead-modal {
          bottom: calc(4.35rem + env(safe-area-inset-bottom, 0px));
          max-height: min(82vh, 500px);
        }

        .cc-lead-modal__content {
          padding: 0.82rem;
        }

        .cc-lead-modal__text {
          font-size: 0.76rem;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .cc-lead-modal,
        .cc-lead-modal__submit {
          transition: none;
        }
      }
    `;
    document.head.appendChild(style);
  };

  const buildWhatsappUrl = (email, phone) => {
    const currentPage = document.title ? `${document.title} - ${window.location.href}` : window.location.href;
    const message = [
      "Hola CONCASAYA, quiero información sobre casas prefabricadas y conocer cómo obtener el premio sorpresa por mi compra (según contrato firmado).",
      "",
      `Celular: ${phone}`,
      `Correo: ${email}`,
      `Página visitada: ${currentPage}`,
      "",
      "Autorizo que me contacten por WhatsApp, llamada o correo para recibir información de CONCASAYA.",
    ].join("\n");

    return `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  const closeModal = (modal, rememberDismissal) => {
    modal.classList.remove("is-visible");
    if (rememberDismissal) {
      writeStorage("localStorage", config.dismissedKey, String(Date.now()));
    }
    window.setTimeout(() => modal.remove(), 260);
  };

  const renderModal = () => {
    if (hasRendered) return;
    hasRendered = true;
    writeStorage("sessionStorage", config.sessionKey, "1");
    injectStyles();

    const modal = document.createElement("section");
    modal.className = "cc-lead-modal";
    modal.setAttribute("aria-label", "Premio sorpresa CONCASAYA por WhatsApp");
    modal.innerHTML = `
      <div class="cc-lead-modal__card" role="dialog" aria-modal="false" aria-labelledby="cc-lead-modal-title">
        <button class="cc-lead-modal__close" type="button" aria-label="Cerrar anuncio">&times;</button>
        <div class="cc-lead-modal__content">
          <h2 class="cc-lead-modal__title" id="cc-lead-modal-title"><span class="cc-lead-modal__title-em">Premio sorpresa</span> por tu compra</h2>
          <p class="cc-lead-modal__text">Deja celular y correo · te escribimos por WhatsApp · premio <strong>solo al firmar el contrato</strong>. Ej.: sanitarios baño, microondas, Smart TV.</p>
          <form class="cc-lead-modal__form">
            <input class="cc-lead-modal__input" type="tel" name="phone" inputmode="tel" autocomplete="tel" placeholder="Número de celular" required />
            <input class="cc-lead-modal__input" type="email" name="email" autocomplete="email" placeholder="Correo electrónico" required />
            <button class="cc-lead-modal__submit" type="submit">Hablar por WhatsApp</button>
          </form>
          <p class="cc-lead-modal__fineprint"><a href="${config.termsPremioSurpriseUrl}" class="cc-lead-modal__terms-link" target="_blank" rel="noopener noreferrer">Términos y condiciones</a>. Puedes cerrar cuando quieras.</p>
          <button class="cc-lead-modal__never" type="button">No volver a mostrar este anuncio</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    window.requestAnimationFrame(() => modal.classList.add("is-visible"));

    modal.querySelector(".cc-lead-modal__close").addEventListener("click", () => {
      closeModal(modal, !isHomePage);
    });

    modal.querySelector(".cc-lead-modal__never").addEventListener("click", () => {
      writeStorage("localStorage", config.neverShowKey, "1");
      closeModal(modal, false);
    });

    modal.querySelector("form").addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const phone = String(formData.get("phone") || "").trim();
      const email = String(formData.get("email") || "").trim();

      if (!phone || !email) return;

      writeStorage("localStorage", config.convertedKey, String(Date.now()));
      window.open(buildWhatsappUrl(email, phone), "_blank", "noopener,noreferrer");
      closeModal(modal, false);
    });
  };

  const maybeShow = () => {
    if (timerCompleted || scrollCompleted) {
      renderModal();
    }
  };

  const onScroll = () => {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollableHeight <= 0) return;
    const scrollPercent = (window.scrollY / scrollableHeight) * 100;

    if (scrollPercent >= config.minimumScrollPercent) {
      scrollCompleted = true;
      window.removeEventListener("scroll", onScroll);
      maybeShow();
    }
  };

  window.setTimeout(() => {
    timerCompleted = true;
    maybeShow();
  }, config.showDelayMs);

  window.addEventListener("scroll", onScroll, { passive: true });
})();
