// admin-staff.js - Gestión de empleados

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

    var existingRole = existing ? existing.role : 'hair';
    openModal(existing ? 'Editar empleado' : 'Añadir empleado',
        '<div class="form-group"><label>Nombre *</label><input type="text" id="stName" value="' + (existing ? existing.name : '') + '" placeholder="Ej: Laura"></div>' +
        '<div class="form-group"><label>Rol *</label><select id="stRole" style="display:none;">' +
        '<option value="hair"' + (existing && existing.role === 'hair' ? ' selected' : '') + '>Barbería</option>' +
        '<option value="beauty"' + (existing && existing.role === 'beauty' ? ' selected' : '') + '>Estética</option></select>' +
        '<div class="cs-dropdown cs-form" id="stRoleCs" data-cs-value="' + existingRole + '"></div></div>',
        '<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" id="saveStaffBtn">' + (existing ? 'Guardar' : 'Añadir') + '</button>');

    csDropdown('stRoleCs', [
        { value: 'hair', label: 'Barbería' },
        { value: 'beauty', label: 'Estética' }
    ], existingRole, {
        onChange: function (v) { document.getElementById('stRole').value = v; }
    });

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