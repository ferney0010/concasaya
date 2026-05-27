(function () {
  "use strict";

  const currentPath = window.location.pathname.toLowerCase();
  const isHomePage = currentPath === "/" || currentPath.endsWith("/index.html");

  const config = {
    whatsappNumber: "573142891018",
    termsPremioSurpriseUrl: "/terminos-premio-sorpresa.html",
    showDelayMs: 9000,
    minimumScrollPercent: 18,
    dismissedCooldownDays: 3,
    convertedCooldownDays: 14,
    sessionKey: "concasayaLeadModalShownThisSession",
    dismissedKey: "concasayaLeadModalDismissedAt",
    convertedKey: "concasayaLeadModalConvertedAt",
    neverShowKey: "concasayaLeadModalNeverShow",
    excludedPaths: ["/admin/", "/chatbot.html", "/cotizador-precios-casas-prefabricadas.html"],
  };

  if (isHomePage) {
    Object.assign(config, {
      showDelayMs: 4000,
      minimumScrollPercent: 5,
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
        border: 1px solid rgba(0, 119, 182, 0.2);
        border-radius: 24px;
        background: #fff;
        box-shadow:
          0 0 0 1px rgba(255, 255, 255, 0.6) inset,
          0 28px 56px rgba(15, 23, 42, 0.18),
          0 12px 24px rgba(0, 119, 182, 0.08);
      }

      .cc-lead-modal__hero {
        position: relative;
        padding: 1.2rem 1.2rem 1rem;
        padding-right: 2.85rem;
        background: linear-gradient(145deg, #e8f4fc 0%, #ecfdf5 42%, #f8fafc 100%);
        border-bottom: 1px solid rgba(0, 119, 182, 0.1);
      }

      .cc-lead-modal__title {
        margin: 0;
        color: #0d1b2a;
        font-size: 1.38rem;
        line-height: 1.08;
        font-weight: 800;
        letter-spacing: -0.035em;
        text-wrap: balance;
      }

      .cc-lead-modal__title-em {
        color: #0077b6;
      }

      @supports ((-webkit-background-clip: text) or (background-clip: text)) {
        .cc-lead-modal__title-em {
          background: linear-gradient(120deg, #0077b6 10%, #0d9488 90%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
      }

      .cc-lead-modal__lead {
        margin: 0.55rem 0 0;
        color: #475569;
        font-size: 0.8125rem;
        line-height: 1.45;
        font-weight: 500;
      }

      .cc-lead-modal__content {
        padding: 0.95rem 1.15rem 1.05rem;
      }

      .cc-lead-modal__pills {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
        margin-bottom: 0.55rem;
      }

      .cc-lead-modal__pill {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.35rem 0.6rem;
        border-radius: 999px;
        font-size: 0.6875rem;
        font-weight: 700;
        letter-spacing: 0.01em;
        line-height: 1;
      }

      .cc-lead-modal__pill--shine {
        background: #fff;
        color: #047857;
        border: 1px solid rgba(16, 185, 129, 0.35);
        box-shadow: 0 2px 8px rgba(5, 150, 105, 0.12);
      }

      .cc-lead-modal__pill--accent {
        background: linear-gradient(135deg, rgba(0, 119, 182, 0.12), rgba(13, 148, 136, 0.1));
        color: #0c4a6e;
        border: 1px solid rgba(0, 119, 182, 0.2);
      }

      .cc-lead-modal__pill  .cc-lead-modal__pill-ico {
        flex-shrink: 0;
      }

      .cc-lead-modal__hint {
        margin: 0 0 0.72rem;
        padding: 0.5rem 0.62rem;
        border-radius: 12px;
        background: linear-gradient(180deg, #f8fafc, #fff);
        border: 1px dashed #cbd5e1;
        color: #64748b;
        font-size: 0.71875rem;
        line-height: 1.4;
      }

      .cc-lead-modal__hint strong {
        color: #334155;
      }

      .cc-lead-modal__form-panel {
        padding: 0.85rem 0.75rem 0.8rem;
        border-radius: 16px;
        background: linear-gradient(180deg, #f1f5f9 0%, #fff 56%);
        border: 1px solid #e2e8f0;
        box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
      }

      .cc-lead-modal__form-kicker {
        margin: 0 0 0.55rem;
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0;
        color: #334155;
      }

      .cc-lead-modal__form {
        display: grid;
        gap: 0.55rem;
      }

      .cc-lead-modal__input {
        width: 100%;
        border: 1px solid #cfd8e3;
        border-radius: 12px;
        padding: 0.72rem 0.82rem;
        background: #fff;
        color: #0f172a;
        font: inherit;
        font-size: 0.898rem;
        outline: none;
        transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
      }

      .cc-lead-modal__input:focus {
        border-color: #0077b6;
        box-shadow: 0 0 0 3px rgba(0, 119, 182, 0.16), 0 4px 12px rgba(0, 119, 182, 0.06);
      }

      .cc-lead-modal__input::placeholder {
        color: #94a3b8;
      }

      .cc-lead-modal__submit {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.48rem;
        border: 0;
        border-radius: 999px;
        padding: 0.78rem 1rem;
        margin-top: 0.12rem;
        background: linear-gradient(145deg, #22c55e, #059669);
        color: #fff;
        font: inherit;
        font-weight: 800;
        font-size: 0.898rem;
        cursor: pointer;
        box-shadow: 0 4px 0 #047857, 0 14px 28px rgba(5, 150, 105, 0.35);
        transition: transform 180ms ease, box-shadow 180ms ease, filter 180ms ease;
      }

      .cc-lead-modal__submit svg {
        flex-shrink: 0;
      }

      .cc-lead-modal__submit:hover {
        transform: translateY(-1px);
        filter: brightness(1.04);
        box-shadow: 0 5px 0 #047857, 0 18px 34px rgba(5, 150, 105, 0.4);
      }

      .cc-lead-modal__submit:active {
        transform: translateY(1px);
        box-shadow: 0 2px 0 #047857, 0 10px 20px rgba(5, 150, 105, 0.28);
      }

      .cc-lead-modal__never {
        width: 100%;
        margin-top: 0.35rem;
        border: 0;
        background: transparent;
        color: #64748b;
        font: inherit;
        font-size: 0.71875rem;
        text-decoration: underline;
        text-underline-offset: 2px;
        cursor: pointer;
      }

      .cc-lead-modal__never:hover {
        color: #0d1b2a;
      }

      .cc-lead-modal__fineprint {
        margin: 0.65rem 0 0;
        padding-top: 0.62rem;
        border-top: 1px solid #f1f5f9;
        color: #94a3b8;
        font-size: 0.6875rem;
        line-height: 1.45;
        text-align: center;
      }

      .cc-lead-modal__terms-link {
        color: #0077b6;
        font-weight: 700;
        text-decoration: none;
        border-bottom: 1px solid rgba(0, 119, 182, 0.35);
      }

      .cc-lead-modal__terms-link:hover {
        color: #005f92;
        border-bottom-color: #005f92;
      }

      .cc-lead-modal__close {
        position: absolute;
        top: 0.65rem;
        right: 0.65rem;
        z-index: 2;
        display: grid;
        place-items: center;
        width: 2.2rem;
        height: 2.2rem;
        border: 1px solid rgba(15, 23, 42, 0.08);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.92);
        color: #475569;
        font-size: 1.2rem;
        line-height: 1;
        cursor: pointer;
        box-shadow: 0 2px 10px rgba(15, 23, 42, 0.08);
        transition: background 180ms ease, color 180ms ease, transform 180ms ease;
      }

      .cc-lead-modal__close:hover {
        background: #fff;
        color: #0d1b2a;
        transform: scale(1.05);
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
          border-radius: 20px;
          max-height: inherit;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }

        .cc-lead-modal__hero {
          padding: 1.05rem 1rem 0.88rem;
          padding-right: 2.75rem;
        }

        .cc-lead-modal__title {
          font-size: 1.2rem;
        }

        .cc-lead-modal__lead {
          font-size: 0.78rem;
        }

        .cc-lead-modal__content {
          padding: 0.85rem 0.95rem 0.95rem;
        }

        .cc-lead-modal__pills {
          gap: 0.35rem;
          margin-bottom: 0.48rem;
        }

        .cc-lead-modal__pill {
          padding: 0.32rem 0.55rem;
          font-size: 0.65rem;
        }

        .cc-lead-modal__hint {
          font-size: 0.68rem;
          padding: 0.45rem 0.52rem;
          margin-bottom: 0.62rem;
        }

        .cc-lead-modal__form-panel {
          padding: 0.72rem 0.62rem;
        }

        .cc-lead-modal__form {
          gap: 0.48rem;
        }

        .cc-lead-modal__input {
          min-height: 2.75rem;
          padding: 0.62rem 0.72rem;
          border-radius: 11px;
          font-size: 1rem;
        }

        .cc-lead-modal__submit {
          min-height: 2.78rem;
          padding: 0.68rem 0.88rem;
          font-size: 0.9rem;
          border-radius: 999px;
        }

        .cc-lead-modal__fineprint {
          margin-top: 0.52rem;
          padding-top: 0.52rem;
          font-size: 0.625rem;
        }

        .cc-lead-modal__never {
          margin-top: 0.28rem;
          padding: 0.3rem 0;
          font-size: 0.65rem;
        }

        .cc-lead-modal__close {
          top: 0.5rem;
          right: 0.5rem;
          width: 2.1rem;
          height: 2.1rem;
          font-size: 1.1rem;
        }
      }

      @media (max-width: 360px), (max-height: 620px) {
        .cc-lead-modal {
          bottom: calc(4.35rem + env(safe-area-inset-bottom, 0px));
          max-height: min(82vh, 500px);
        }

        .cc-lead-modal__hero {
          padding-left: 0.85rem;
          padding-right: 2.6rem;
        }

        .cc-lead-modal__title {
          font-size: 1.1rem;
        }

        .cc-lead-modal__lead {
          font-size: 0.74rem;
        }

        .cc-lead-modal__content {
          padding-left: 0.82rem;
          padding-right: 0.82rem;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .cc-lead-modal,
        .cc-lead-modal__submit,
        .cc-lead-modal__close {
          transition: none;
        }

        .cc-lead-modal__submit:hover,
        .cc-lead-modal__submit:active {
          transform: none;
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
        <div class="cc-lead-modal__hero">
          <h2 class="cc-lead-modal__title" id="cc-lead-modal-title"><span class="cc-lead-modal__title-em">Premio sorpresa</span> por tu compra</h2>
          <p class="cc-lead-modal__lead">Déjanos tus datos y te escribimos por WhatsApp para orientarte en tu proyecto CONCASAYA.</p>
        </div>
        <div class="cc-lead-modal__content">
          <div class="cc-lead-modal__pills">
            <span class="cc-lead-modal__pill cc-lead-modal__pill--shine">
              <svg class="cc-lead-modal__pill-ico" width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.884 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </span>
            <span class="cc-lead-modal__pill cc-lead-modal__pill--accent">Premio al firmar contrato</span>
          </div>
          <p class="cc-lead-modal__hint"><strong>Ejemplos de premios:</strong> combo baño · microondas · Smart TV (según campaña y disponibilidad).</p>
          <div class="cc-lead-modal__form-panel">
            <p class="cc-lead-modal__form-kicker" id="cc-lead-modal-kicker">Tus datos</p>
            <form class="cc-lead-modal__form" aria-labelledby="cc-lead-modal-title cc-lead-modal-kicker">
              <input class="cc-lead-modal__input" type="tel" name="phone" inputmode="tel" autocomplete="tel" placeholder="Número de celular" required />
              <input class="cc-lead-modal__input" type="email" name="email" autocomplete="email" placeholder="Correo electrónico" required />
              <button class="cc-lead-modal__submit" type="submit"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.884 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg><span>Hablar por WhatsApp</span></button>
            </form>
          </div>
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
