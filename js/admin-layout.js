// admin-layout.js - Navegación, sidebar, constants y router del admin
var NAV_ITEMS = [
    { key: 'dashboard', label: 'Panel', icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' },
    { key: 'agenda', label: 'Agenda', icon: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z' },
    { key: 'services', label: 'Servicios', icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' },
    { key: 'schedule', label: 'Horarios', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { key: 'staff', label: 'Empleados', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z' },
    { key: 'clients', label: 'Clientes', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }
];

var DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
var MONTHS_LOWERCASE = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
var STATUS_LABELS_ADMIN = { confirmed: 'Confirmada', pending: 'Pendiente', cancelled: 'Cancelada', completed: 'Completada' };

function startOfToday() {
    var d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function renderAdmin(active) {
    var valid = 'dashboard';
    for (var i = 0; i < NAV_ITEMS.length; i++) {
        if (NAV_ITEMS[i].key === active) valid = active;
    }

    if (document.querySelector('.admin-layout')) {
        switchAdminView(valid);
        return;
    }

    var nav = '<div class="sidebar-brand">' +
        '<div class="sidebar-brand-logo"><div class="sidebar-brand-icon">✂</div><span class="sidebar-brand-name">Barbería Toni</span></div>' +
        '<div class="sidebar-brand-role">Panel de administración</div></div>' +
        '<div class="sidebar-nav"><div class="sidebar-section-label">Principal</div>';
    var mainNav = NAV_ITEMS.slice(0, 3);
    var secNav = NAV_ITEMS.slice(3);
    mainNav.forEach(function (n) {
        nav += '<button class="admin-nav-item ' + (n.key === valid ? 'active' : '') + '" data-admin-nav="' + n.key + '">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="' + n.icon + '"/></svg>' +
            '<span>' + n.label + '</span></button>';
    });
    nav += '<div class="sidebar-section-label" style="margin-top:20px;">Gestión</div>';
    secNav.forEach(function (n) {
        nav += '<button class="admin-nav-item ' + (n.key === valid ? 'active' : '') + '" data-admin-nav="' + n.key + '">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="' + n.icon + '"/></svg>' +
            '<span>' + n.label + '</span></button>';
    });
    nav += '</div><div class="sidebar-footer">' +
        '<button class="admin-nav-item" data-admin-nav="exit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg><span>Salir al menú</span></button></div>';

    var html = '<div class="admin-layout"><aside class="admin-sidebar">' + nav + '</aside>' +
        '<div class="admin-content" id="adminContent"><div class="loading"><div class="spinner"></div></div></div></div>';

    mainContent.innerHTML = html;
    mainContent.classList.remove('page-fade-in');
    void mainContent.offsetWidth;
    mainContent.classList.add('page-fade-in');
    window.scrollTo(0, 0);
    bindPublicEvents();
    bindHeaderActions();
    bindContactForm();
    setTimeout(function () { mainContent.classList.remove('page-fade-in'); }, 350);

    document.querySelectorAll('[data-admin-nav]').forEach(function (b) {
        b.addEventListener('click', function () {
            switchAdminView(b.dataset.adminNav);
        });
    });

    viewDashboard(el('adminContent'));
}

function switchAdminView(key) {
    if (key === 'exit') { go('home'); return; }
    document.querySelectorAll('.admin-nav-item').forEach(function (b) {
        b.classList.toggle('active', b.dataset.adminNav === key);
    });
    renderAdminView(key);
    history.replaceState(null, '', '#admin/' + key);
}

function renderAdminView(view) {
    var container = el('adminContent');
    if (!container) return;

    if (view === 'services') { viewServices(container); }
    else if (view === 'staff') { viewStaff(container); }
    else if (view === 'clients') { viewClients(container); }
    else if (view === 'schedule') { viewSchedule(container); }
    else if (view === 'agenda') { viewAgenda(container); }
    else { viewDashboard(container); }

    container.classList.remove('page-fade-in');
    void container.offsetWidth;
    container.classList.add('page-fade-in');
    setTimeout(function () { container.classList.remove('page-fade-in'); }, 350);
}
