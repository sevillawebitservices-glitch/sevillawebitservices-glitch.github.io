// admin-services.js - Gestión de servicios del salón

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
    bodyHtml += '<div class="svc-modal-group"><label>Categoría</label><select class="svc-modal-select" id="svCat" style="display:none;"><option value="hair"' + (existing && existing.category === 'hair' ? ' selected' : '') + '>Barbería</option><option value="beauty"' + (existing && existing.category === 'beauty' ? ' selected' : '') + '>Estética</option></select><div class="cs-dropdown cs-form" id="svCatCs" data-cs-value="' + (existing ? existing.category : 'hair') + '"></div></div>';
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

    csDropdown('svCatCs', [
        { value: 'hair', label: 'Barbería' },
        { value: 'beauty', label: 'Estética' }
    ], existing ? existing.category : 'hair', {
        onChange: function (v) { document.getElementById('svCat').value = v; }
    });

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
