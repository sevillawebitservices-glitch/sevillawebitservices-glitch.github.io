// app.js - Router, UI compartida y vistas públicas (script final)

var mainContent = document.getElementById('mainContent');

// ---------- Utilidades UI ----------
function el(id) {
    return document.getElementById(id);
}

function render(html) {
    mainContent.innerHTML = html;
    mainContent.classList.remove('page-fade-in');
    void mainContent.offsetWidth;
    mainContent.classList.add('page-fade-in');
    window.scrollTo(0, 0);
    bindPublicEvents();
    bindHeaderActions();
    bindContactForm();
    setTimeout(function () { mainContent.classList.remove('page-fade-in'); }, 350);
}

function toast(message, type) {
    if (type === undefined) type = 'success';
    var container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    var icons = {
        success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>',
        error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
    };
    var toastEl = document.createElement('div');
    toastEl.className = 'toast ' + type;
    toastEl.innerHTML = (icons[type] || icons.success) + '<span>' + message + '</span>';
    container.appendChild(toastEl);
    setTimeout(function () {
        toastEl.style.opacity = '0';
        toastEl.style.transform = 'translateX(30px)';
        setTimeout(function () { toastEl.remove(); }, 300);
    }, 3000);
}

// ---------- Modal ----------
function openModal(title, bodyHtml, footerHtml, opts) {
    var existing = document.getElementById('modalOverlay');
    if (existing) existing.remove();
    document.body.style.overflow = 'hidden';
    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modalOverlay';
    var modalClass = 'modal' + ((opts && opts.wide) ? ' modal-wide' : '');
    overlay.innerHTML =
        '<div class="' + modalClass + '"><div class="modal-header"><h3>' + title + '</h3>' +
        '<button class="modal-close" data-close>&times;</button></div>' +
        '<div class="modal-body">' + bodyHtml + '</div>' +
        (footerHtml ? '<div class="modal-footer">' + footerHtml + '</div>' : '') +
        '</div>';
    overlay.addEventListener('click', function (e) {
        if (e.target === overlay || e.target.closest('[data-close]')) closeModal();
    });
    document.body.appendChild(overlay);
    return el('modalOverlay');
}

function closeModal() {
    var overlay = document.getElementById('modalOverlay');
    if (overlay) overlay.remove();
    document.body.style.overflow = '';
}

// ---------- Router ----------
function renderHome() {
    var data = getData();
    var services = [];
    data.services.forEach(function (s) { if (s.active) services.push(s); });
    services = services.slice(0, 6);
    var staff = data.staff || [];

    var testimonials = [
        { name: 'Carlos M.', initials: 'CM', text: 'El mejor barbero de Sevilla. La atenci&oacute;n es incre&iacute;ble y siempre salgo encantado. Toni lleva m&aacute;s de 15 a&ntilde;os destrozando pelos.', stars: 5, date: 'Hace 2 semanas' },
        { name: 'Ana R.', initials: 'AR', text: 'Excelente trato y profesionalidad. El servicio de est&eacute;tica es de primer nivel. Reservar online es s&uacute;per f&aacute;cil.', stars: 5, date: 'Hace 1 mes' },
        { name: 'Pedro L.', initials: 'PL', text: 'Llevo a&ntilde;os viniendo y nunca me decepciona. Pago con tarjeta en un momento. Gran experiencia siempre.', stars: 5, date: 'Hace 3 d&iacute;as' }
    ];

    render(
        '<section class="hero"><div class="container"><canvas id="heroParticles"></canvas><div class="hero-content">' +
        '<div class="hero-eyebrow" data-scramble>Barber&iacute;a de &eacute;lite</div>' +
        '<h1>El arte del<span>corte perfecto</span></h1>' +
        '<p class="hero-subtitle">Profesionales de primer nivel. Reserva tu cita con un solo clic y descubre una experiencia de barber&iacute;a sin igual.</p>' +
        '<div class="hero-buttons">' +
        '<button class="btn btn-primary btn-lg" data-nav="booking">Reservar cita</button>' +
        '<button class="btn btn-outline btn-lg" data-nav="services">Ver servicios</button>' +
        '</div>' +
        '<div class="hero-stats">' +
        '<div data-reveal><div class="hero-stat-value" data-count="15" data-suffix="+">0</div><div class="hero-stat-label">A&ntilde;os de experiencia</div></div>' +
        '<div data-reveal data-reveal-delay="100"><div class="hero-stat-value" data-count="5000" data-suffix="+">0</div><div class="hero-stat-label">Clientes satisfechos</div></div>' +
        '<div data-reveal data-reveal-delay="200"><div class="hero-stat-value" data-count="5.0" data-prefix="">0</div><div class="hero-stat-label">Valoraci&oacute;n media</div></div>' +
        '</div></div></div></section>' +

        '<section class="section"><div class="container">' +
        '<div class="section-header" data-reveal><span class="eyebrow">Servicios</span><h2>Excelencia en cada detalle</h2>' +
        '<p>Servicios de barber&iacute;a y est&eacute;tica con los m&aacute;s altos est&aacute;ndares de calidad profesional.</p></div>' +
        '<div class="services-grid">' + services.map(function (s, i) {
            return '<div data-reveal data-reveal-delay="' + (i * 80) + '">' + serviceCard(s) + '</div>';
        }).join('') + '</div>' +
        '<div style="text-align:center; margin-top:40px;" data-reveal>' +
        '<button class="btn btn-outline btn-lg" data-nav="services">Ver todos los servicios</button>' +
        '</div></div></section>' +

        '<section class="section section-alt"><div class="container">' +
        '<div class="section-header" data-reveal><span class="eyebrow">Nuestro equipo</span><h2>Maestros de su oficio</h2>' +
        '<p>Profesionales con a&ntilde;os de experiencia comprometidos con la excelencia.</p></div>' +
        '<div class="services-grid team-grid">' +
        staff.map(function (s, i) {
            var accentColor = s.role === 'hair' ? 'var(--gold)' : '#be185d';
            var photoHtml;
            if (s.photo) {
                photoHtml = '<img src="' + s.photo + '" alt="' + s.name + '" class="staff-photo">';
            } else {
                photoHtml = '<div class="staff-avatar" style="background:' + accentColor + ';width:120px;height:120px;font-size:2rem;margin:0 auto 20px;border:3px solid ' + accentColor + ';box-shadow:0 8px 32px rgba(212,168,67,0.25);">' + initials(s.name) + '</div>';
            }
            return '<div data-reveal data-reveal-delay="' + (i * 100) + '"><div class="service-card team-card" style="--accent:' + accentColor + ';"><div class="service-body" style="text-align:center;padding:40px 28px 32px;">' +
                photoHtml +
                '<h3 style="font-size:1.35rem;margin-top:4px;">' + s.name + '</h3>' +
                '<p style="margin-top:6px;color:var(--gray-400);font-size:0.88rem;">' + ROLE_LABELS[s.role] + '</p>' +
                '<div style="width:32px;height:2px;background:' + accentColor + ';margin:16px auto 0;border-radius:1px;opacity:0.5;"></div>' +
                '</div></div></div>';
        }).join('') +
        '</div></div></section>' +

        '<section class="section"><div class="container">' +
        '<div class="section-header" data-reveal><span class="eyebrow">Opiniones</span><h2>Lo que dicen nuestros clientes</h2>' +
        '<p>M&aacute;s de 5000 clientes satisfechos conf&iacute;an en nosotros.</p></div>' +
        '<div class="testimonials-grid">' +
        testimonials.map(function (t, i) {
            var starsHtml = '';
            for (var s = 0; s < t.stars; s++) {
                starsHtml += '<svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
            }
            return '<div class="testimonial-card" data-reveal data-reveal-delay="' + (i * 120) + '">' +
                '<div class="testimonial-quote">&ldquo;</div>' +
                '<div class="testimonial-stars">' + starsHtml + '</div>' +
                '<p class="testimonial-text">' + t.text + '</p>' +
                '<div class="testimonial-author">' +
                '<div class="testimonial-avatar">' + t.initials + '</div>' +
                '<div><div class="testimonial-name">' + t.name + '</div>' +
                '<div class="testimonial-date">' + t.date + '</div></div>' +
                '</div></div>';
        }).join('') +
        '</div></div></section>' +

        '<section class="section section-alt"><div class="container">' +
        '<div class="section-header" data-reveal><span class="eyebrow">Preguntas frecuentes</span><h2>¿Tienes dudas?</h2>' +
        '<p>Resolvemos las preguntas m&aacute;s habituales de nuestros clientes.</p></div>' +
        '<div style="max-width:640px;margin:0 auto;">' +
        '<div class="accordion-item" data-reveal><div class="accordion-header"><span>¿Necesito cita previa?</span><div class="accordion-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></div></div><div class="accordion-body"><div class="accordion-content">Sí, es obligatorio. Trabajamos exclusivamente con cita previa para garantizarte la mejor atención. Reserva online en un clic desde nuestra web.</div></div></div>' +
        '<div class="accordion-item" data-reveal data-reveal-delay="80"><div class="accordion-header"><span>¿Qué métodos de pago aceptan?</span><div class="accordion-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></div></div><div class="accordion-body"><div class="accordion-content">Aceptamos <strong>exclusivamente tarjeta</strong> (Visa, Mastercard) y Bizum. No se acepta efectivo.</div></div></div>' +
        '<div class="accordion-item" data-reveal data-reveal-delay="160"><div class="accordion-header"><span>¿Cómo puedo cancelar una cita?</span><div class="accordion-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></div></div><div class="accordion-body"><div class="accordion-content">Puedes cancelar desde la sección "Mis citas" en tu perfil. Te pedimos al menos 2 horas de antelación para que otros clientes puedan reservar.</div></div></div>' +
        '<div class="accordion-item" data-reveal data-reveal-delay="240"><div class="accordion-header"><span>¿Dónde estáis ubicados?</span><div class="accordion-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></div></div><div class="accordion-body"><div class="accordion-content">Estamos en Calle Párroco Don Juan Cotán, 35, Gines, Sevilla 41960. Fácil acceso en transporte público y con zona de aparcamiento cercana.</div></div></div>' +
        '<div class="accordion-item" data-reveal data-reveal-delay="320"><div class="accordion-header"><span>¿Trabajáis con productos premium?</span><div class="accordion-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></div></div><div class="accordion-body"><div class="accordion-content">Sí, utilizamos exclusivamente productos de marcas reconocidas internacionalmente para garantizar los mejores resultados.</div></div></div>' +
        '</div></div></section>'
    );

    // Init premium effects after render
    setTimeout(function () {
        initParticles();
        initScrollReveal();
        initCounters();
        initTiltCards();
        initAccordion();
    }, 50);
}

function serviceCard(s) {
    return '<div class="service-card" data-nav-booking="' + s.id + '"><div class="service-body">' +
        '<span class="category-badge ' + s.category + '">' + ROLE_LABELS[s.category] + '</span>' +
        '<h3>' + s.name + '</h3>' +
        '<p>' + s.description + '</p>' +
        '<div class="service-meta">' +
        '<span class="service-duration"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' + s.duration + ' min</span>' +
        '<span class="service-price">' + formatMoney(s.price) + '</span>' +
        '</div></div></div>';
}

function renderServicesPage() {
    var data = getData();
    var all = [];
    data.services.forEach(function (s) { if (s.active) all.push(s); });
    render(
        '<section class="section"><div class="container">' +
        '<div class="section-header"><span class="eyebrow">Servicios</span><h2>Nuestra propuesta</h2></div>' +
        '<div class="category-tabs" id="serviceTabs">' +
        '<button class="category-tab active" data-cat="all">Todos</button>' +
        '<button class="category-tab" data-cat="hair">Barbería</button>' +
        '<button class="category-tab" data-cat="beauty">Estética</button>' +
        '</div>' +
        '<div class="services-grid" id="servicesGrid">' + all.map(serviceCard).join('') + '</div>' +
        '</div></section>'
    );
    var tabs = document.querySelectorAll('.category-tab');
    tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            tabs.forEach(function (t) { t.classList.remove('active'); });
            tab.classList.add('active');
            var cat = tab.dataset.cat;
            var list = cat === 'all' ? all : all.filter(function (s) { return s.category === cat; });
            el('servicesGrid').innerHTML = list.map(serviceCard).join('');
        });
    });
}

function renderContact() {
    var mapsUrl = 'https://www.google.com/maps/search/Calle+Parroco+Don+Juan+Cotan+Gines+Sevilla+41960';
    render(
        '<section class="section"><div class="container">' +
        '<div class="section-header"><span class="eyebrow">Contacto</span><h2>Estamos a tu disposici&oacute;n</h2></div>' +
        '<div style="max-width:600px;margin:0 auto;">' +
        '<div class="booking-summary" style="background:transparent;border:1px solid var(--border)">' +
        '<div class="summary-row"><span>Dirección</span><span>Calle Parroco Don Juan Cotán, 35, Gines, Sevilla 41960</span></div>' +
        '<div class="summary-row"><span>Teléfono</span><span>+34 900 000 000</span></div>' +
        '<div class="summary-row"><span>Email</span><span>info@barberiatoni.com</span></div>' +
        '</div>' +
        '<div style="margin:20px 0;">' +
        '<a href="' + mapsUrl + '" target="_blank" rel="noopener" class="btn btn-outline btn-block" style="text-decoration:none;">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>' +
        'Abrir en Google Maps</a></div>' +
        '<form id="contactForm">' +
        '<div class="form-group"><label>Tu nombre</label><input type="text" required placeholder="Nombre y apellidos"></div>' +
        '<div class="form-group"><label>Email</label><input type="email" required placeholder="tu@email.com"></div>' +
        '<div class="form-group"><label>Mensaje</label><textarea rows="4" required placeholder="Cuéntanos en qué te ayudamos..."></textarea></div>' +
        '<button class="btn btn-primary btn-block">Enviar mensaje</button>' +
        '</form></div></div></section>'
    );
}

var routes = {
    home: renderHome,
    services: renderServicesPage,
    booking: function () { renderClientBookingView({}); },
    contact: renderContact,
    login: function () { renderAuth('login'); },
    register: function () { renderAuth('register'); },
    admin: function () { renderAdmin('dashboard'); },
    appointments: renderMyAppointments,
    'admin/dashboard': function () { renderAdmin('dashboard'); },
    'admin/agenda': function () { renderAdmin('agenda'); },
    'admin/services': function () { renderAdmin('services'); },
    'admin/schedule': function () { renderAdmin('schedule'); },
    'admin/staff': function () { renderAdmin('staff'); },
    'admin/clients': function () { renderAdmin('clients'); }
};

function navigate(hash) {
    var clean = (hash || 'home').replace(/^#\/?/, '');
    var route = routes[clean] || routes.home;
    if (clean.indexOf('admin') === 0) {
        var user = getCurrentUser();
        if (!user || user.role !== APP_ADMIN) {
            toast('Acceso restringido. Inicia sesión como administrador.', 'error');
            location.hash = 'login';
            return;
        }
    }
    route();
    updateNav(clean);
}

function updateNav(activeRoute) {
    document.querySelectorAll('.nav-link').forEach(function (l) {
        var link = l.dataset.link;
        l.classList.toggle('active', activeRoute.indexOf(link) === 0);
    });
    var nav = document.getElementById('nav');
    if (nav) nav.classList.remove('open');
    renderHeaderActions();
}

function go(hash) {
    if (location.hash === '#' + hash) {
        navigate(hash);
    } else {
        location.hash = hash;
    }
}

// ---------- Header actions ----------
function renderHeaderActions() {
    var container = document.getElementById('headerActions');
    if (!container) return;
    var user = getCurrentUser();

    if (!user) {
        container.innerHTML =
            '<button class="btn btn-outline" data-nav="login">Entrar</button>' +
            '<button class="btn btn-primary" data-nav="booking">Reservar</button>';
    } else if (user.role === APP_ADMIN) {
        container.innerHTML =
            '<button class="user-chip" data-user-chip>' + initials(user.name) + ' ' + user.name + '</button>';
    } else {
        container.innerHTML =
            '<button class="user-chip" data-user-chip>' + initials(user.name || 'C') + ' ' + (user.name || 'Cliente') + '</button>' +
            '<button class="btn btn-primary" data-nav="booking">Reservar</button>';
    }
    bindHeaderActions();
}

function bindHeaderActions() {
    document.querySelectorAll('[data-nav]').forEach(function (b) {
        b.addEventListener('click', function () {
            go(b.dataset.nav);
            var nav = document.getElementById('nav');
            if (nav) nav.classList.remove('open');
        });
    });
    var chip = document.querySelector('[data-user-chip]');
    if (chip) chip.addEventListener('click', openUserMenu);
}

function openUserMenu(e) {
    e.stopPropagation();
    var user = getCurrentUser();
    if (!user) return;
    var existing = document.querySelector('.user-dropdown');
    if (existing) { existing.remove(); return; }

    var items = user.role === APP_ADMIN
        ? '<button class="dropdown-item" data-nav="admin">Panel de administración</button>'
        : '<button class="dropdown-item" data-nav="appointments">Mis citas</button>' +
          '<button class="dropdown-item" data-nav="booking">Reservar</button>';

    var menu = document.createElement('div');
    menu.className = 'user-dropdown';
    menu.innerHTML =
        '<div class="dropdown-header"><div class="dropdown-name">' + (user.name || user.email || 'Usuario') + '</div>' +
        '<div class="dropdown-email">' + (user.email || '') + '</div></div>' +
        items +
        '<button class="dropdown-item danger" data-cmd="logout">Cerrar sesión</button>';

    menu.style.position = 'fixed';
    var rect = e.currentTarget.getBoundingClientRect();
    menu.style.top = (rect.bottom + 8) + 'px';
    menu.style.right = '24px';
    document.body.appendChild(menu);

    menu.querySelectorAll('[data-nav]').forEach(function (b) {
        b.addEventListener('click', function () { menu.remove(); go(b.dataset.nav); });
    });
    menu.querySelector('[data-cmd="logout"]').addEventListener('click', function () {
        menu.remove();
        logout();
    });

    function close(ev) {
        if (!menu.contains(ev.target) && !ev.target.closest('.user-chip')) {
            menu.remove();
            document.removeEventListener('click', close);
        }
    }
    setTimeout(function () { document.addEventListener('click', close); }, 0);
}

function logout() {
    setCurrentUser(null);
    toast('Sesión cerrada');
    renderHeaderActions();
    go('home');
}

// ---------- Eventos globales por render ----------
function bindPublicEvents() {
    document.querySelectorAll('[data-nav]').forEach(function (b) {
        b.addEventListener('click', function () { go(b.dataset.nav); });
    });
    document.querySelectorAll('[data-nav-booking]').forEach(function (b) {
        b.addEventListener('click', function () { go('booking'); });
    });
}

function bindContactForm() {
    var form = document.getElementById('contactForm');
    if (form) form.addEventListener('submit', function (e) {
        e.preventDefault();
        toast('Mensaje enviado. Te contactaremos pronto.', 'success');
        form.reset();
    });
}

// ---------- Init ----------
function init() {
    document.querySelectorAll('.nav-link').forEach(function (l) {
        l.addEventListener('click', function (e) { e.preventDefault(); go(l.dataset.link); });
    });
    var logo = document.querySelector('.logo');
    if (logo) logo.addEventListener('click', function (e) { e.preventDefault(); go('home'); });
    var menuBtn = document.getElementById('mobileMenuBtn');
    if (menuBtn) menuBtn.addEventListener('click', function () {
        var nav = document.getElementById('nav');
        if (nav) nav.classList.toggle('open');
        menuBtn.classList.toggle('active');
    });
    renderHeaderActions();
    window.addEventListener('hashchange', function () { navigate(location.hash); });
    window.addEventListener('scroll', function () {
        var header = document.querySelector('.header');
        if (header) header.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
    navigate(location.hash || 'home');
}

init();