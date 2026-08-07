// admin-extra.js - Servicios, Empleados y Citas del panel admin
// Usa funciones globales de utils.js, app.js y admin.js.

var STATUS_LABELS_EXTRA = { confirmed: 'Confirmada', pending: 'Pendiente', cancelled: 'Cancelada', completed: 'Completada' };

function viewServices(container) {
    var data = getData();
    var services = data.services || [];
    var activeFilter = 'all';
    var searchTerm = '';

    var categoryLabels = { hair: 'Barbería', beauty: 'Estética' };

    function getFilteredServices() {
        return services.filter(function (s) {
            var matchCat = activeFilter === 'all' || s.category === activeFilter;
            var matchSearch = !searchTerm || s.name.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 || (s.description || '').toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1;
            return matchCat && matchSearch;
        });
    }

    function countByCategory(cat) {
        if (cat === 'all') return services.length;
        return services.filter(function (s) { return s.category === cat; }).length;
    }

    function render() {
        var filtered = getFilteredServices();
        var totalCount = services.length;
        var activeCount = services.filter(function (s) { return s.active; }).length;
        var avgPrice = totalCount > 0 ? services.reduce(function (sum, s) { return sum + s.price; }, 0) / totalCount : 0;
        var avgDuration = totalCount > 0 ? Math.round(services.reduce(function (sum, s) { return sum + s.duration; }, 0) / totalCount) : 0;

        var html = '';

        html += '<div class="svc-header">';
        html += '<div class="svc-header-left"><h2>Servicios</h2><p>Gestiona los servicios de tu negocio</p></div>';
        html += '<div class="svc-header-right">';
        html += '<div class="svc-search"><input type="text" id="svcSearchInput" placeholder="Buscar servicios..." value="' + searchTerm + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></div>';
        html += '<button class="btn btn-primary" id="addServiceBtn" style="display:flex;align-items:center;gap:8px;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:18px;height:18px;"><path d="M12 5v14M5 12h14"/></svg>Nuevo servicio</button>';
        html += '</div></div>';

        html += '<div class="svc-stats">';
        html += '<div class="svc-stat-card"><div class="svc-stat-icon gold"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h7"/></svg></div><div class="svc-stat-info"><h4>Total servicios</h4><span>' + totalCount + '</span></div></div>';
        html += '<div class="svc-stat-card"><div class="svc-stat-icon green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/></svg></div><div class="svc-stat-info"><h4>Activos</h4><span>' + activeCount + '</span></div></div>';
        html += '<div class="svc-stat-card"><div class="svc-stat-icon blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div><div class="svc-stat-info"><h4>Precio medio</h4><span>' + formatMoney(avgPrice) + '</span></div></div>';
        html += '<div class="svc-stat-card"><div class="svc-stat-icon purple"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></div><div class="svc-stat-info"><h4>Duración media</h4><span>' + avgDuration + ' min</span></div></div>';
        html += '</div>';

        html += '<div class="svc-filters">';
        html += '<button class="svc-filter-btn' + (activeFilter === 'all' ? ' active' : '') + '" data-svc-filter="all">Todos<span class="filter-count">' + countByCategory('all') + '</span></button>';
        html += '<button class="svc-filter-btn' + (activeFilter === 'hair' ? ' active' : '') + '" data-svc-filter="hair">Barbería<span class="filter-count">' + countByCategory('hair') + '</span></button>';
        html += '<button class="svc-filter-btn' + (activeFilter === 'beauty' ? ' active' : '') + '" data-svc-filter="beauty">Estética<span class="filter-count">' + countByCategory('beauty') + '</span></button>';
        html += '</div>';

        if (filtered.length === 0) {
            html += '<div class="svc-empty">';
            html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 6h16M4 12h16M4 18h7"/></svg>';
            html += '<h3>' + (searchTerm ? 'Sin resultados' : 'No hay servicios') + '</h3>';
            html += '<p>' + (searchTerm ? 'No se encontraron servicios con ese término de búsqueda' : 'Crea tu primer servicio para empezar a gestionar citas') + '</p>';
            if (!searchTerm) {
                html += '<button class="btn btn-primary" id="addServiceBtnEmpty" style="display:inline-flex;align-items:center;gap:8px;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:18px;height:18px;"><path d="M12 5v14M5 12h14"/></svg>Crear servicio</button>';
            }
            html += '</div>';
        } else {
            html += '<div class="svc-grid">';
            filtered.forEach(function (s) {
                html += '<div class="svc-card">';
                html += '<div class="svc-card-top">';
                html += '<span class="svc-card-category ' + s.category + '">' + (categoryLabels[s.category] || s.category) + '</span>';
                html += '<div class="svc-card-status ' + (s.active ? 'active' : 'inactive') + '"><span class="status-dot ' + (s.active ? 'active' : 'inactive') + '"></span>' + (s.active ? 'Activo' : 'Inactivo') + '</div>';
                html += '</div>';
                html += '<div class="svc-card-body">';
                html += '<div class="svc-card-name">' + s.name + '</div>';
                if (s.description) html += '<div class="svc-card-desc">' + s.description + '</div>';
                html += '</div>';
                html += '<div class="svc-card-meta">';
                html += '<div class="svc-card-meta-left">';
                html += '<div class="svc-meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg><span>' + s.duration + ' min</span></div>';
                if (s.step) html += '<div class="svc-meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg><span>' + s.step + ' min</span></div>';
                html += '</div>';
                html += '<div class="svc-card-price">' + formatMoney(s.price) + '</div>';
                html += '</div>';
                html += '<div class="svc-card-actions">';
                html += '<button class="svc-action-btn" data-edit-service="' + s.id + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Editar</button>';
                var toggleIcon = s.active
                    ? '<path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/>'
                    : '<path d="M5 12h14"/>';
                var toggleLabel = s.active ? 'Desactivar' : 'Activar';
                html += '<button class="svc-action-btn ' + (s.active ? 'toggle-on' : 'toggle-off') + '" data-toggle-service="' + s.id + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' + toggleIcon + '</svg>' + toggleLabel + '</button>';
                html += '<button class="svc-action-btn danger" data-del-service="' + s.id + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>Eliminar</button>';
                html += '</div>';
                html += '</div>';
            });
            html += '</div>';
        }

        container.innerHTML = html;

        var addBtn = container.querySelector('#addServiceBtn') || container.querySelector('#addServiceBtnEmpty');
        if (addBtn) addBtn.addEventListener('click', function () { serviceModal(); });

        container.querySelectorAll('[data-edit-service]').forEach(function (b) {
            b.addEventListener('click', function () { serviceModal(b.dataset.editService); });
        });
        container.querySelectorAll('[data-toggle-service]').forEach(function (b) {
            b.addEventListener('click', function () {
                var svc = services.find(function (s) { return s.id === b.dataset.toggleService; });
                if (!svc) return;
                svc.active = !svc.active;
                saveData();
                toast(svc.active ? 'Servicio activado' : 'Servicio desactivado', 'success');
                render();
            });
        });
        container.querySelectorAll('[data-del-service]').forEach(function (b) {
            b.addEventListener('click', function () { deleteService(b.dataset.delService); });
        });

        container.querySelectorAll('[data-svc-filter]').forEach(function (b) {
            b.addEventListener('click', function () {
                activeFilter = b.dataset.svcFilter;
                render();
            });
        });

        var searchInput = container.querySelector('#svcSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', function () {
                searchTerm = searchInput.value;
                render();
                var newInput = container.querySelector('#svcSearchInput');
                if (newInput) { newInput.focus(); newInput.setSelectionRange(newInput.value.length, newInput.value.length); }
            });
        }
    }

    render();
}

function serviceModal(serviceId) {
    var data = getData();
    var existing = null;
    if (serviceId) {
        data.services.forEach(function (s) { if (s.id === serviceId) existing = s; });
    }

    var bodyHtml = '<div class="svc-modal-body">';
    bodyHtml += '<div class="svc-modal-row">';
    bodyHtml += '<div class="svc-modal-group"><label>Nombre del servicio</label><input type="text" class="svc-modal-input" id="svName" value="' + (existing ? existing.name : '') + '" placeholder="Ej: Corte de pelo"></div>';
    bodyHtml += '<div class="svc-modal-group"><label>Categoría</label><select class="svc-modal-select" id="svCat"><option value="hair"' + (existing && existing.category === 'hair' ? ' selected' : '') + '>Barbería</option><option value="beauty"' + (existing && existing.category === 'beauty' ? ' selected' : '') + '>Estética</option></select></div>';
    bodyHtml += '</div>';

    bodyHtml += '<div class="svc-modal-row">';
    bodyHtml += '<div class="svc-modal-group"><label>Duración</label><div style="display:flex;align-items:center;gap:8px;"><input type="number" class="svc-modal-input" id="svDur" min="5" step="5" value="' + (existing ? existing.duration : 30) + '" style="flex:1;"><span style="font-size:0.82rem;color:var(--gray-500);font-weight:500;">min</span></div></div>';
    bodyHtml += '<div class="svc-modal-group"><label>Intervalo</label><div style="display:flex;align-items:center;gap:8px;"><input type="number" class="svc-modal-input" id="svStep" min="5" step="5" value="' + (existing && existing.step ? existing.step : (existing ? existing.duration : 30)) + '" style="flex:1;"><span style="font-size:0.82rem;color:var(--gray-500);font-weight:500;">min</span></div></div>';
    bodyHtml += '</div>';

    bodyHtml += '<div class="svc-modal-row">';
    bodyHtml += '<div class="svc-modal-group"><label>Precio</label><div style="display:flex;align-items:center;gap:8px;"><input type="number" class="svc-modal-input" id="svPrice" min="0" step="0.5" value="' + (existing ? existing.price : 0) + '" style="flex:1;"><span style="font-size:0.82rem;color:var(--gray-500);font-weight:500;">€</span></div></div>';
    bodyHtml += '</div>';

    bodyHtml += '<div class="svc-modal-group full"><label>Descripción</label><textarea class="svc-modal-textarea" id="svDesc" rows="3" placeholder="Describe el servicio (opcional)">' + (existing ? existing.description : '') + '</textarea></div>';

    bodyHtml += '<div class="svc-modal-group"><label>Estado</label><div class="svc-modal-toggle"><label class="switch"><input type="checkbox" id="svActive"' + (existing ? (existing.active ? ' checked' : '') : ' checked') + '><span class="slider"></span></label><span class="svc-modal-toggle-label">' + (existing ? (existing.active ? 'Activo' : 'Inactivo') : 'Activo') + '</span></div>';
    bodyHtml += '<div class="svc-modal-hint">Los servicios inactivos no aparecen para reserva de clientes</div></div>';

    bodyHtml += '</div>';

    var footerHtml = '<button class="btn btn-ghost" data-close>Cancelar</button>';
    footerHtml += '<button class="btn btn-primary" id="saveServiceBtn" style="display:flex;align-items:center;gap:8px;">' + (existing ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:18px;height:18px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/></svg>Guardar cambios' : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:18px;height:18px;"><path d="M12 5v14M5 12h14"/></svg>Crear servicio') + '</button>';

    openModal(existing ? 'Editar servicio' : 'Nuevo servicio', bodyHtml, footerHtml, { wide: true });

    var activeLabel = document.querySelector('.svc-modal-toggle-label');
    var activeCheck = el('svActive');
    if (activeCheck && activeLabel) {
        activeCheck.addEventListener('change', function () {
            activeLabel.textContent = activeCheck.checked ? 'Activo' : 'Inactivo';
        });
    }

    el('saveServiceBtn').addEventListener('click', function () {
        var name = el('svName').value.trim();
        var dur = parseInt(el('svDur').value);
        var step = parseInt(el('svStep').value);
        var price = parseFloat(el('svPrice').value);
        if (!name || !dur || !step || isNaN(price)) { toast('Completa todos los campos', 'error'); return; }
        var cat = el('svCat').value;
        if (existing) {
            existing.name = name;
            existing.category = cat;
            existing.duration = dur;
            existing.step = step;
            existing.price = price;
            existing.description = el('svDesc').value.trim();
            existing.active = el('svActive').checked;
            toast('Servicio actualizado', 'success');
        } else {
            data.services.push({
                id: uid(), name: name, category: cat, duration: dur, step: step, price: price,
                description: el('svDesc').value.trim(), active: el('svActive').checked
            });
            toast('Servicio creado', 'success');
        }
        saveData();
        closeModal();
        renderAdmin('services');
    });
}

function deleteService(id) {
    var data = getData();
    var svc = null;
    data.services.forEach(function (s) { if (s.id === id) svc = s; });
    if (!svc) return;
    openModal('Eliminar servicio',
        '<p>¿Eliminar <strong>"' + svc.name + '"</strong>? Las citas ya reservadas no se borran.</p>',
        '<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-danger" id="confirmDel">Eliminar</button>');
    el('confirmDel').addEventListener('click', function () {
        data.services = data.services.filter(function (s) { return s.id !== id; });
        saveData();
        toast('Servicio eliminado', 'success');
        closeModal();
        renderAdmin('services');
    });
}

function viewStaff(container) {
    var data = getData();
    var staff = data.staff || [];

    var rows = '';
    staff.forEach(function (s) {
        rows += '<tr>' +
            '<td><div style="display:flex;align-items:center;gap:10px;">' +
            '<div style="width:36px;height:36px;border-radius:50%;background:var(--gold);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;">' + initials(s.name) + '</div>' +
            '<strong>' + s.name + '</strong></div></td>' +
            '<td><span class="category-badge ' + s.role + '">' + ROLE_LABELS[s.role] + '</span></td>' +
            '<td><div class="actions">' +
            '<button class="icon-btn edit" data-edit-staff="' + s.id + '">✏</button>' +
            '<button class="icon-btn delete" data-del-staff="' + s.id + '">🗑</button>' +
            '</div></td></tr>';
    });

    container.innerHTML = '<div class="admin-content-header"><div><h2>Empleados</h2><p>Profesionales que atienden en el salón</p></div>' +
        '<button class="btn btn-primary" id="addStaffBtn">+ Añadir empleado</button></div>' +
        '<div class="table-wrapper"><table class="table"><thead><tr><th>Empleado</th><th>Rol</th><th>Acciones</th></tr></thead><tbody>' + rows + '</tbody></table></div>';

    el('addStaffBtn').addEventListener('click', function () { staffModal(null); });

    container.querySelectorAll('[data-edit-staff]').forEach(function (b) {
        b.addEventListener('click', function () { staffModal(b.dataset.editStaff); });
    });
    container.querySelectorAll('[data-del-staff]').forEach(function (b) {
        b.addEventListener('click', function () {
            var s = null;
            staff.forEach(function (x) { if (x.id === b.dataset.delStaff) s = x; });
            if (!s) return;
            openModal('Eliminar empleado', '<p>¿Eliminar a <strong>' + s.name + '</strong>?</p>',
                '<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-danger" id="confirmDelStaff">Eliminar</button>');
            el('confirmDelStaff').addEventListener('click', function () {
                data.staff = data.staff.filter(function (x) { return x.id !== s.id; });
                saveData();
                toast('Empleado eliminado', 'success');
                closeModal();
                renderAdmin('staff');
            });
        });
    });
}

function staffModal(staffId) {
    var data = getData();
    var existing = null;
    if (staffId) {
        data.staff.forEach(function (s) { if (s.id === staffId) existing = s; });
    }

    openModal(existing ? 'Editar empleado' : 'Añadir empleado',
        '<div class="form-group"><label>Nombre *</label><input type="text" id="stName" value="' + (existing ? existing.name : '') + '" placeholder="Ej: Laura"></div>' +
        '<div class="form-group"><label>Rol *</label><select id="stRole">' +
        '<option value="hair"' + (existing && existing.role === 'hair' ? ' selected' : '') + '>Barbería</option>' +
        '<option value="beauty"' + (existing && existing.role === 'beauty' ? ' selected' : '') + '>Estética</option></select></div>',
        '<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" id="saveStaffBtn">' + (existing ? 'Guardar' : 'Añadir') + '</button>');

    el('saveStaffBtn').addEventListener('click', function () {
        var name = el('stName').value.trim();
        if (!name) { toast('Escribe el nombre', 'error'); return; }
        var role = el('stRole').value;
        if (existing) {
            existing.name = name;
            existing.role = role;
            toast('Empleado actualizado', 'success');
        } else {
            data.staff.push({ id: uid(), name: name, role: role });
            toast('Empleado añadido', 'success');
        }
        saveData();
        closeModal();
        renderAdmin('staff');
    });
}

function viewClients(container) {
    var data = getData();
    var appointments = data.appointments || [];
    var services = data.services || [];
    var staffList = data.staff || [];

    function getClients() {
        var map = {};
        appointments.forEach(function (a) {
            var key = (a.clientName || '').trim().toLowerCase();
            if (!key) return;
            if (!map[key]) {
                map[key] = {
                    name: a.clientName,
                    phone: a.clientPhone || '',
                    email: a.clientEmail || '',
                    appointments: []
                };
            }
            map[key].appointments.push(a);
            if (a.clientPhone && !map[key].phone) map[key].phone = a.clientPhone;
            if (a.clientEmail && !map[key].email) map[key].email = a.clientEmail;
        });
        return Object.keys(map).sort().map(function (k) { return map[k]; });
    }

    var clients = getClients();
    var totalClients = clients.length;
    var totalAppts = appointments.length;
    var confirmedAppts = appointments.filter(function (a) { return a.status === 'confirmed' || a.status === 'completed'; }).length;
    var totalRevenue = 0;
    appointments.forEach(function (a) {
        if (a.status !== 'cancelled') {
            var svc = null;
            services.forEach(function (s) { if (s.id === a.serviceId) svc = s; });
            if (svc) totalRevenue += svc.price;
        }
    });

    var searchTerm = '';

    function render() {
        var filtered = clients.filter(function (c) {
            return !searchTerm || c.name.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 || c.phone.indexOf(searchTerm) !== -1;
        });

        var html = '';
        html += '<div class="svc-header">';
        html += '<div class="svc-header-left"><h2>Clientes</h2><p>Todos los clientes que han reservado citas</p></div>';
        html += '<div class="svc-header-right">';
        html += '<div class="svc-search"><input type="text" id="clientSearchInput" placeholder="Buscar por nombre o teléfono..." value="' + searchTerm + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></div>';
        html += '</div></div>';

        html += '<div class="svc-stats">';
        html += '<div class="svc-stat-card"><div class="svc-stat-icon gold"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg></div><div class="svc-stat-info"><h4>Total clientes</h4><span>' + totalClients + '</span></div></div>';
        html += '<div class="svc-stat-card"><div class="svc-stat-icon green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/></svg></div><div class="svc-stat-info"><h4>Citas totales</h4><span>' + totalAppts + '</span></div></div>';
        html += '<div class="svc-stat-card"><div class="svc-stat-icon blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div><div class="svc-stat-info"><h4>Confirmadas</h4><span>' + confirmedAppts + '</span></div></div>';
        html += '<div class="svc-stat-card"><div class="svc-stat-icon purple"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div><div class="svc-stat-info"><h4>Ingresos totales</h4><span>' + formatMoney(totalRevenue) + '</span></div></div>';
        html += '</div>';

        if (filtered.length === 0) {
            html += '<div class="svc-empty">';
            html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>';
            html += '<h3>' + (searchTerm ? 'Sin resultados' : 'No hay clientes') + '</h3>';
            html += '<p>' + (searchTerm ? 'No se encontraron clientes con ese término' : 'Los clientes aparecerán cuando se reserve alguna cita') + '</p>';
            html += '</div>';
        } else {
            html += '<div class="svc-grid">';
            filtered.forEach(function (c) {
                var apptCount = c.appointments.length;
                var cancelCount = c.appointments.filter(function (a) { return a.status === 'cancelled'; }).length;
                var clientRevenue = 0;
                c.appointments.forEach(function (a) {
                    if (a.status !== 'cancelled') {
                        var svc = null;
                        services.forEach(function (s) { if (s.id === a.serviceId) svc = s; });
                        if (svc) clientRevenue += svc.price;
                    }
                });
                var lastAppt = c.appointments.sort(function (a, b) { return (b.date + b.startTime).localeCompare(a.date + a.startTime); })[0];

                html += '<div class="svc-card" style="cursor:pointer;" data-client-name="' + c.name.replace(/"/g, '&quot;') + '">';
                html += '<div class="svc-card-top">';
                html += '<div style="display:flex;align-items:center;gap:12px;">';
                html += '<div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,var(--gold) 0%,var(--gold-dark) 100%);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1.1rem;flex-shrink:0;">' + (c.name.charAt(0).toUpperCase()) + '</div>';
                html += '<div><div class="svc-card-name" style="margin-bottom:2px;">' + c.name + '</div>';
                if (c.phone) html += '<div style="font-size:0.82rem;color:var(--gray-500);">' + c.phone + '</div>';
                html += '</div></div>';
                html += '<div class="svc-card-price">' + formatMoney(clientRevenue) + '</div>';
                html += '</div>';
                html += '<div class="svc-card-meta">';
                html += '<div class="svc-card-meta-left">';
                html += '<div class="svc-meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg><span>' + apptCount + ' cita' + (apptCount !== 1 ? 's' : '') + '</span></div>';
                if (cancelCount > 0) html += '<div class="svc-meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg><span style="color:var(--red);">' + cancelCount + ' cancelada' + (cancelCount !== 1 ? 's' : '') + '</span></div>';
                html += '</div>';
                if (lastAppt) html += '<div style="font-size:0.78rem;color:var(--gray-400);">Última: ' + fmtDateLong(lastAppt.date) + '</div>';
                html += '</div>';
                html += '</div>';
            });
            html += '</div>';
        }

        container.innerHTML = html;

        var searchInput = container.querySelector('#clientSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', function () {
                searchTerm = searchInput.value;
                render();
                var newInput = container.querySelector('#clientSearchInput');
                if (newInput) { newInput.focus(); newInput.setSelectionRange(newInput.value.length, newInput.value.length); }
            });
        }

        container.querySelectorAll('[data-client-name]').forEach(function (card) {
            card.addEventListener('click', function () {
                var clientName = card.dataset.clientName;
                var client = null;
                clients.forEach(function (c) { if (c.name === clientName) client = c; });
                if (client) clientDetail(client, container);
            });
        });
    }

    render();
}

function clientDetail(client, prevContainer) {
    var container = prevContainer;
    var data = getData();
    var services = data.services || [];
    var staffList = data.staff || [];

    var appts = client.appointments.slice().sort(function (a, b) {
        return (b.date + b.startTime).localeCompare(a.date + a.startTime);
    });

    var totalSpent = 0;
    var totalCancelled = 0;
    var totalConfirmed = 0;
    appts.forEach(function (a) {
        var svc = null;
        services.forEach(function (s) { if (s.id === a.serviceId) svc = s; });
        if (a.status !== 'cancelled' && svc) totalSpent += svc.price;
        if (a.status === 'cancelled') totalCancelled++;
        if (a.status === 'confirmed' || a.status === 'completed') totalConfirmed++;
    });

    var html = '';
    html += '<div class="svc-header">';
    html += '<div class="svc-header-left" style="display:flex;flex-direction:column;gap:4px;">';
    html += '<button class="btn btn-ghost" id="clientBackBtn" style="align-self:flex-start;margin-bottom:4px;display:flex;align-items:center;gap:6px;font-size:0.85rem;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>Volver a clientes</button>';
    html += '<h2>' + client.name + '</h2>';
    html += '<p>' + (client.phone ? client.phone + (client.email ? ' · ' + client.email : '') : (client.email || '')) + '</p>';
    html += '</div></div>';

    html += '<div class="svc-stats">';
    html += '<div class="svc-stat-card"><div class="svc-stat-icon green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/></svg></div><div class="svc-stat-info"><h4>Citas completadas</h4><span>' + totalConfirmed + '</span></div></div>';
    html += '<div class="svc-stat-card"><div class="svc-stat-icon blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg></div><div class="svc-stat-info"><h4>Total citas</h4><span>' + appts.length + '</span></div></div>';
    html += '<div class="svc-stat-card"><div class="svc-stat-icon gold"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg></div><div class="svc-stat-info"><h4>Canceladas</h4><span>' + totalCancelled + '</span></div></div>';
    html += '</div>';

    html += '<div style="margin-top:4px;">';
    html += '<div style="font-family:var(--font-display);font-size:1.1rem;font-weight:400;color:var(--black);margin-bottom:20px;">Historial de citas</div>';

    if (appts.length === 0) {
        html += '<div class="svc-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg><h3>Sin citas</h3><p>Este cliente no tiene citas registradas</p></div>';
    } else {
        html += '<div class="table-wrapper"><table class="table"><thead><tr><th>Fecha</th><th>Servicio</th><th>Profesional</th><th>Hora</th><th>Estado</th><th>Precio</th></tr></thead><tbody>';
        appts.forEach(function (a) {
            var svc = null;
            services.forEach(function (s) { if (s.id === a.serviceId) svc = s; });
            var staff = null;
            staffList.forEach(function (s) { if (s.id === a.staffId) staff = s; });
            var statusClass = a.status === 'cancelled' ? 'cancelled' : (a.status === 'completed' ? 'completed' : (a.status === 'confirmed' ? 'confirmed' : 'pending'));
            html += '<tr>';
            html += '<td>' + fmtDateLong(a.date) + '</td>';
            html += '<td>' + (svc ? svc.name : '—') + '</td>';
            html += '<td>' + (staff ? staff.name : '—') + '</td>';
            html += '<td>' + a.startTime + ' - ' + a.endTime + '</td>';
            html += '<td><span class="badge ' + statusClass + '">' + STATUS_LABELS_EXTRA[a.status] + '</span></td>';
            html += '<td>' + (a.status !== 'cancelled' && svc ? formatMoney(svc.price) : '—') + '</td>';
            html += '</tr>';
        });
        html += '</tbody></table></div>';
    }
    html += '</div>';

    container.innerHTML = html;

    container.querySelector('#clientBackBtn').addEventListener('click', function () {
        viewClients(container);
    });
}