// Variable global del carrito
let cart = [];

// Navegación de pestañas en el portal
function switchTab(tab) {
  // Desmarcar todos los botones
  document.querySelectorAll('.portal-nav-btn').forEach(btn => {
    btn.classList.remove('active-tab');
  });

  // Ocultar todas las secciones del portal
 const sections = ['acceso', 'lobby', 'servicios', 'amenidades', 'roomservice', 'invitados', 'paseqr', 'chat'];
  sections.forEach(s => {
    const el = document.getElementById(`portal-${s}`);
    if (el) {
      el.classList.remove('active-view');
      el.classList.add('hidden');
    }
  });

  // Activar botón seleccionado
  const activeBtn = document.getElementById(`nav-${tab}`);
  if (activeBtn) {
    activeBtn.classList.add('active-tab');
  }

  // Mostrar la vista correspondiente
  const activeSection = document.getElementById(`portal-${tab}`);
  if (activeSection) {
    activeSection.classList.remove('hidden');
    activeSection.classList.add('active-view');
  }
}

// Inicialización de eventos al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  // Generador de Pase QR y Redirección
  const qrGenerateForm = document.getElementById('qrGenerateForm');
  if (qrGenerateForm) {
    qrGenerateForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('inputName').value.trim();
      const docType = document.getElementById('inputDocType').value;
      const docNum = document.getElementById('inputDocNum').value.trim();
      const passType = document.getElementById('inputPassType').value;

      // Calcular iniciales para el avatar
      const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'GT';
      const maskedDoc = docNum.length > 4 ? `•••• ${docNum.slice(-4)}` : docNum;

      // Actualizar tarjeta del pase QR
      document.getElementById('displayGuestAvatar').innerText = initials;
      document.getElementById('displayGuestName').innerText = name;
      document.getElementById('displayGuestDoc').innerText = `${docType} ${maskedDoc}`;
      document.getElementById('displayPassType').innerText = passType;

      // Generar código QR dinámico mediante la API pública
      const qrData = encodeURIComponent(`HESTIA-PASS|SUITE405|${name}|${docType}|${docNum}|${passType}`);
      document.getElementById('userQrCode').src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${qrData}`;

      // Redirigir a la pestaña del Pase QR con feedback
      switchTab('paseqr');
    });
  }
  // Formulario de Login / Acceso
  const loginForm = document.getElementById('portal-login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = document.getElementById('btn-portal-login');
      if (btn) btn.innerText = 'VALIDANDO RESERVA...';

      setTimeout(() => {
        if (btn) btn.innerText = 'INGRESAR AL PORTAL';
        switchTab('lobby');
      }, 600);
    });
  }
  // Chat Form
  const chatForm = document.getElementById('chat-form');
  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('chat-input');
      if (!input) return;
      const text = input.value.trim();
      if (!text) return;

      const chatMessages = document.getElementById('chat-messages');
      if (!chatMessages) return;

      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      chatMessages.innerHTML += `
        <div class="flex items-start justify-end gap-2">
          <div class="bg-hestia-dark text-white p-3 rounded-2xl max-w-sm shadow-sm">
            <p class="font-medium m-0">${text}</p>
            <span class="text-[9px] text-hestia-gold/80 mt-1 block text-right">Usted • ${now}</span>
          </div>
        </div>
      `;
      input.value = '';
      chatMessages.scrollTop = chatMessages.scrollHeight;

      setTimeout(() => {
        chatMessages.innerHTML += `
          <div class="flex items-start gap-2">
            <div class="bg-white border border-hestia-border p-3 rounded-2xl max-w-sm shadow-sm">
              <p class="text-hestia-dark font-medium m-0">Recibido, Sr. García. Gestionamos su solicitud de inmediato.</p>
              <span class="text-[9px] text-hestia-dark/50 mt-1 block text-right">Concierge • Ahora</span>
            </div>
          </div>
        `;
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 900);
    });
  }

  // Formulario de Invitados
  const formInvitados = document.getElementById('form-invitados');
  if (formInvitados) {
    formInvitados.addEventListener('submit', (e) => {
      e.preventDefault();
      const guestsList = document.getElementById('guests-list');
      if (!guestsList) return;

      const currentCount = guestsList.querySelectorAll('.guest-card').length;
      if (currentCount >= 4) {
        alert('Aforo completo: Se ha alcanzado el límite máximo permitido para la Suite (4 personas).');
        return;
      }

      const nameInput = document.getElementById('guest-name-input');
      const docTypeInput = document.getElementById('guest-doc-type');
      const docNumInput = document.getElementById('guest-doc-num');
      const passTypeInput = document.getElementById('guest-pass-type');

      const name = nameInput ? nameInput.value.trim() : '';
      const docType = docTypeInput ? docTypeInput.value : '';
      const docNum = docNumInput ? docNumInput.value.trim() : '';
      const passType = passTypeInput ? passTypeInput.value : '';

      const maskedDoc = docNum.length > 4 ? `•••• ${docNum.slice(-4)}` : docNum;

      const newCard = document.createElement('div');
      newCard.className = 'guest-card bg-hestia-cream/50 border border-hestia-border rounded-xl p-4 flex items-center justify-between gap-4 transition-all';
      newCard.innerHTML = `
        <div>
          <h6 class="text-sm font-bold text-hestia-dark m-0">${name}</h6>
          <p class="text-xs text-hestia-dark/60 m-0">${docType} ${maskedDoc} • ${passType}</p>
          <span class="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-green-100 text-green-800">● Autorizado</span>
        </div>
        <button onclick="revokeGuest(this)" class="px-3 py-1.5 border border-red-200 text-red-600 text-xs font-bold rounded-lg hover:bg-red-50 transition-colors">Revocar</button>
      `;

      guestsList.appendChild(newCard);
      formInvitados.reset();
      updateCapacity();
    });
  }
});

// Control de Aforo
function updateCapacity() {
  const guestsList = document.getElementById('guests-list');
  const capacityBadge = document.getElementById('capacity-badge');
  if (!guestsList || !capacityBadge) return;

  const currentGuests = guestsList.querySelectorAll('.guest-card').length;
  capacityBadge.innerText = `${currentGuests} / 4`;
}

function revokeGuest(button) {
  const card = button.closest('.guest-card');
  if (card) {
    card.remove();
    updateCapacity();
  }
}

// Filtro de categorías en Room Service
function filterCategory(cat, event) {
  document.querySelectorAll('.cat-filter-btn').forEach(btn => {
    btn.classList.remove('bg-hestia-dark', 'text-hestia-gold', 'border-hestia-gold');
    btn.classList.add('bg-white', 'text-hestia-dark', 'border-hestia-border');
  });

  const targetBtn = event ? event.currentTarget : (window.event ? window.event.target : null);
  if (targetBtn) {
    targetBtn.classList.add('bg-hestia-dark', 'text-hestia-gold', 'border-hestia-gold');
    targetBtn.classList.remove('bg-white', 'text-hestia-dark', 'border-hestia-border');
  }

  const items = document.querySelectorAll('.menu-card');
  items.forEach(item => {
    if (cat === 'todos' || item.getAttribute('data-category') === cat) {
      item.classList.remove('hidden');
    } else {
      item.classList.add('hidden');
    }
  });
}

// Buscador en tiempo real de platillos y bebidas
function searchDishes(term) {
  const query = term.toLowerCase().trim();
  const items = document.querySelectorAll('.menu-card');
  
  items.forEach(card => {
    const title = (card.getAttribute('data-title') || '').toLowerCase();
    if (title.includes(query)) {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });
}

// Métodos del Carrito
function addToCart(title, price) {
  cart.push({ title, price });
  renderCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}

function renderCart() {
  const container = document.getElementById('cart-items-container');
  const counterBadge = document.getElementById('cart-counter-badge');
  const summaryCount = document.getElementById('summary-items-count');
  const summaryTotal = document.getElementById('summary-total-price');
  const btnCheckout = document.getElementById('btn-checkout');

  if (counterBadge) counterBadge.innerText = `🛒 ${cart.length} items`;
  if (summaryCount) summaryCount.innerText = `${cart.length} seleccionados`;

  if (cart.length === 0) {
    if (container) container.innerHTML = '<p id="empty-cart-msg" class="text-xs text-hestia-dark/50 text-center py-10">No hay platillos seleccionados.</p>';
    if (summaryTotal) summaryTotal.innerText = '$0 COP';
    if (btnCheckout) {
      btnCheckout.disabled = true;
      btnCheckout.classList.add('opacity-50', 'cursor-not-allowed');
    }
    return;
  }

  if (btnCheckout) {
    btnCheckout.disabled = false;
    btnCheckout.classList.remove('opacity-50', 'cursor-not-allowed');
  }

  let total = 0;
  if (container) container.innerHTML = '';

  cart.forEach((item, index) => {
    total += item.price;
    if (container) {
      const row = document.createElement('div');
      row.className = 'flex items-center justify-between gap-2 p-2.5 rounded-lg bg-hestia-cream border border-hestia-border text-xs';
      row.innerHTML = `
        <div class="overflow-hidden">
          <span class="font-bold text-hestia-dark truncate block">${item.title}</span>
          <span class="text-[11px] text-hestia-dark/60">$${item.price.toLocaleString('es-CO')} COP</span>
        </div>
        <button onclick="removeFromCart(${index})" class="text-red-500 font-bold hover:opacity-80 px-2 py-1 text-xs cursor-pointer">✕</button>
      `;
      container.appendChild(row);
    }
  });

  if (summaryTotal) summaryTotal.innerText = `$${total.toLocaleString('es-CO')} COP`;
}

function checkoutOrder() {
  if (cart.length === 0) return;
  const total = cart.reduce((acc, item) => acc + item.price, 0);
  alert(`¡Orden confirmada! El pedido fue enviado a cocina para la Suite 405 por valor de $${total.toLocaleString('es-CO')} COP. Tiempo estimado: 25 minutos.`);
  cart = [];
  renderCart();
}

// LÓGICA UNIFICADA: MODO PRIVACIDAD / NO MOLESTAR
// Control sincronizado del Modo No Molestar (Lobby y Amenidades)
function toggleDoNotDisturb(source = 'lobby') {
  const toggleLobby = document.getElementById('dnd-toggle-lobby');
  const toggleAmenities = document.getElementById('dnd-toggle-amenities');
  const pillBadge = document.getElementById('dnd-pill-badge');

  const isActive = source === 'lobby' 
    ? (toggleLobby ? toggleLobby.checked : false) 
    : (toggleAmenities ? toggleAmenities.checked : false);

  if (toggleLobby) toggleLobby.checked = isActive;
  if (toggleAmenities) toggleAmenities.checked = isActive;

  if (pillBadge) {
    if (isActive) {
      pillBadge.innerText = '● Activo';
      pillBadge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30';
    } else {
      pillBadge.innerText = 'Desactivado';
      pillBadge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white/70 border border-white/20';
    }
  }
}
}

// LÓGICA DE AMENIDADES & HOUSEKEEPING
let currentCleaningSlot = 'Ahora';

function selectTimeSlot(btn, time) {
  document.querySelectorAll('.time-slot-btn').forEach(b => {
    b.classList.remove('bg-hestia-dark', 'text-hestia-gold', 'border-hestia-gold', 'font-bold');
    b.classList.add('bg-hestia-cream', 'text-hestia-dark', 'border-hestia-border', 'font-medium');
  });
  btn.classList.add('bg-hestia-dark', 'text-hestia-gold', 'border-hestia-gold', 'font-bold');
  btn.classList.remove('bg-hestia-cream', 'text-hestia-dark', 'border-hestia-border', 'font-medium');
  currentCleaningSlot = time;
}

function confirmCleaningRequest() {
  alert(`Solicitud registrada: El equipo de Housekeeping acudirá a la Suite 405 en el horario: ${currentCleaningSlot}.`);
}

function orderAmenity(amenity) {
  alert(`Solicitud recibida: Enviaremos "${amenity}" a su suite en aproximadamente 15 minutos.`);
}

function unlockDoor() {
  const btn = document.getElementById('btn-digital-key');
  if (!btn) return;

  btn.innerText = '🔓 DESBLOQUEANDO PUERTA...';
  btn.classList.replace('bg-hestia-gold', 'bg-white');

  setTimeout(() => {
    btn.innerText = '✅ PUERTA ABIERTA (SUITE 405)';
    btn.classList.add('text-green-800', 'bg-green-100');
    
    setTimeout(() => {
      btn.innerText = '🔑 PRESIONAR PARA DESBLOQUEAR';
      btn.classList.remove('text-green-800', 'bg-green-100');
      btn.classList.replace('bg-white', 'bg-hestia-gold');
    }, 3000);
  }, 900);
}
function sharePassWhatsApp() {
  const name = document.getElementById('displayGuestName').innerText;
  const message = encodeURIComponent(`Hola ${name}, aquí tienes tu pase de acceso digital con código QR para la Suite 405 en Hestia Concierge.`);
  window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
}