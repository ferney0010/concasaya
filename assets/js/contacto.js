// ============================================
// FORMULARIO DE CONTACTO - CONCASAYA
// ============================================
// Sin dependencias externas: solo abre WhatsApp
// con los datos del formulario pre-llenados.
// ============================================

const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');
const businessWhatsappNumber = '573142891018';

if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = contactForm.name.value;
    const email = contactForm.email.value;
    const phone = contactForm.phone.value;
    const message = contactForm.message.value;
    const submitButton = contactForm.querySelector('button[type="submit"]');

    submitButton.disabled = true;
    submitButton.textContent = 'Procesando...';
    if (formStatus) {
      formStatus.textContent = '';
      formStatus.classList.remove('text-green-600', 'text-red-600');
    }

    const whatsappMessage = `
Hola CONCASAYA, estoy interesado en una casa prefabricada.

*Nombre:* ${name}
*Email:* ${email}
*Teléfono:* ${phone}

*Mensaje:*
${message}
    `.trim();

    const whatsappUrl = `https://wa.me/${businessWhatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

    window.open(whatsappUrl, '_blank');

    if (formStatus) {
      formStatus.textContent = '¡Gracias! Serás redirigido a WhatsApp para enviar tu mensaje.';
      formStatus.classList.add('text-green-600');
    }
    contactForm.reset();
    submitButton.disabled = false;
    submitButton.textContent = 'Enviar Mensaje';
  });
}
