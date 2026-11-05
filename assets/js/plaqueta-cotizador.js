/* ==========================================================================
   COTIZADOR DE PLAQUETA DE CONCRETO
   --------------------------------------------------------------------------
   Logica del cotizador de /plaqueta-de-concreto.

   Datos comerciales (los suministro el cliente, no se inventan):
   - Plaquetas de concreto reforzado de 3.500 PSI con refuerzo en grafita.
   - Precio de venta: $27.500 COP por metro cuadrado.
   - Pedido minimo: 30 m².
   - Transporte: NO incluido, lo asume el comprador.
   - Entrega: el producto se entrega cargado en planta.

   El calculo es lineal (m² x 27.500), que es exactamente lo que dice la
   tabla de precios comercial: 30 m² = 825.000, 50 = 1.375.000,
   70 = 1.925.000, 100 = 2.750.000, 150 = 4.125.000.
   ========================================================================== */
(function () {
  'use strict';

  var PRECIO_M2 = 27500;
  var MINIMO_M2 = 30;
  var WHATSAPP = '573142891018';

  // Cantidades de la tabla de precios comercial del cliente.
  var CANTIDADES_OFICIALES = [30, 50, 70, 100, 150];

  var input = document.getElementById('pq-m2');
  var chipsBox = document.getElementById('pq-chips');
  var totalEl = document.getElementById('pq-total');
  var totalM2El = document.getElementById('pq-total-m2');
  var totalUnitEl = document.getElementById('pq-total-unit');
  var waBtn = document.getElementById('pq-wa');
  var errorEl = document.getElementById('pq-error');
  var tableBody = document.getElementById('pq-table-body');
  var opciones = document.getElementById('pq-opciones');
  var opcionesValor = document.getElementById('pq-opciones-valor');

  if (!input || !totalEl) return;

  // --- Formato de moneda Colombia: $27.500 (sin decimales, punto de miles)
  function formatCOP(numero) {
    return '$' + Math.round(numero).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  // --- Chips de cantidad rapida -------------------------------------------
  if (chipsBox) {
    CANTIDADES_OFICIALES.forEach(function (cantidad) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'pq-chip';
      chip.setAttribute('data-m2', String(cantidad));
      chip.textContent = cantidad + ' m²';
      chip.addEventListener('click', function () {
        input.value = String(cantidad);
        render();
        input.focus();
      });
      chipsBox.appendChild(chip);
    });
  }

  // --- Tabla de precios (se arma desde JS para que el precio nunca se
  //     desincronice del cotizador) ----------------------------------------
  if (tableBody) {
    CANTIDADES_OFICIALES.forEach(function (cantidad) {
      var tr = document.createElement('tr');
      tr.setAttribute('data-m2', String(cantidad));

      var tdCant = document.createElement('td');
      tdCant.textContent = cantidad + ' m²';

      var tdPrecio = document.createElement('td');
      tdPrecio.textContent = formatCOP(PRECIO_M2);

      var tdTotal = document.createElement('td');
      tdTotal.className = 'pq-table__total';
      tdTotal.textContent = formatCOP(cantidad * PRECIO_M2);

      tr.appendChild(tdCant);
      tr.appendChild(tdPrecio);
      tr.appendChild(tdTotal);
      tableBody.appendChild(tr);
    });
  }

  function mensajeWhatsApp(m2, total) {
    return 'Hola, quiero comprar ' + m2 + ' m² de plaqueta de concreto de 3.500 PSI. ' +
      'Valor total estimado: ' + formatCOP(total) + '. Quiero cotizar.';
  }

  function render() {
    var valorBruto = parseFloat(input.value);
    var esValido = !isNaN(valorBruto) && valorBruto >= MINIMO_M2 && valorBruto <= 5000;

    // Chips activos
    if (chipsBox) {
      Array.prototype.forEach.call(chipsBox.querySelectorAll('.pq-chip'), function (chip) {
        chip.classList.toggle('is-active', chip.getAttribute('data-m2') === input.value);
      });
    }

    // Fila de la tabla activa
    if (tableBody) {
      Array.prototype.forEach.call(tableBody.querySelectorAll('tr'), function (tr) {
        tr.classList.toggle('is-selected', tr.getAttribute('data-m2') === input.value);
      });
    }

    if (!esValido) {
      input.classList.add('is-error');
      if (errorEl) {
        errorEl.classList.add('is-visible');
        if (isNaN(valorBruto) || valorBruto <= 0) {
          errorEl.textContent = 'Escribe la cantidad de m² que necesitas.';
        } else if (valorBruto < MINIMO_M2) {
          errorEl.textContent = 'El pedido mínimo es de ' + MINIMO_M2 + ' m². Ajusta la cantidad para cotizar.';
        } else {
          errorEl.textContent = 'Para pedidos mayores a 5.000 m² escríbenos por WhatsApp para cotizarte el volumen.';
        }
      }
      // Total de referencia: el minimo facturable.
      totalEl.textContent = formatCOP(MINIMO_M2 * PRECIO_M2);
      if (totalM2El) totalM2El.textContent = MINIMO_M2 + ' m²';
      if (totalUnitEl) totalUnitEl.textContent = 'Valor mínimo del pedido';
      if (opciones) {
        opciones.textContent = MINIMO_M2 + ' m²';
      }
      if (opcionesValor) {
        opcionesValor.textContent = formatCOP(MINIMO_M2 * PRECIO_M2);
      }
      if (waBtn) {
        waBtn.classList.add('is-disabled');
        waBtn.setAttribute('aria-disabled', 'true');
        waBtn.setAttribute('href', 'https://wa.me/' + WHATSAPP + '?text=' +
          encodeURIComponent(mensajeWhatsApp(MINIMO_M2, MINIMO_M2 * PRECIO_M2)));
      }
      return;
    }

    var m2 = Math.round(valorBruto);
    var total = m2 * PRECIO_M2;

    input.classList.remove('is-error');
    if (errorEl) errorEl.classList.remove('is-visible');

    totalEl.textContent = formatCOP(total);
    if (totalM2El) totalM2El.textContent = m2 + ' m²';
    if (totalUnitEl) totalUnitEl.textContent = 'a ' + formatCOP(PRECIO_M2) + ' el m²';
    if (opciones) {
      opciones.textContent = m2 + ' m²';
    }
    if (opcionesValor) {
      opcionesValor.textContent = formatCOP(total);
    }

    if (waBtn) {
      waBtn.classList.remove('is-disabled');
      waBtn.removeAttribute('aria-disabled');
      waBtn.setAttribute('href', 'https://wa.me/' + WHATSAPP + '?text=' +
        encodeURIComponent(mensajeWhatsApp(m2, total)));
    }
  }

  input.addEventListener('input', render);
  input.addEventListener('blur', render);

  // Si el usuario escribe menos del mínimo, el valor del input se deja como
  // esta (para que vea el error) pero la cotizacion usa el minimo.
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      render();
    }
  });

  // --- Boton de WhatsApp: si esta bloqueado (cantidad invalida) lleva al
  //     formulario en vez de abrir WhatsApp con datos erroneos.
  if (waBtn) {
    waBtn.addEventListener('click', function (e) {
      if (waBtn.classList.contains('is-disabled')) {
        e.preventDefault();
        var valorBruto = parseFloat(input.value);
        if (isNaN(valorBruto) || valorBruto < MINIMO_M2) {
          input.value = String(MINIMO_M2);
        }
        render();
        input.focus();
      }
    });
  }

  // Valor inicial: el minimo del pedido.
  input.value = String(MINIMO_M2);
  render();
})();
