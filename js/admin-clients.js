// admin-clients.js - Gestión de clientes e historial

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
