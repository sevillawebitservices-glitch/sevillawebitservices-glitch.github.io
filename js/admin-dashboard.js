// admin-dashboard.js - Panel principal del admin (premium v2)

function viewDashboard(container) {
    var data = getData();
    var appointments = data.appointments || [];
    var today = formatDate(new Date());
    var todays = appointments.filter(function (a) { return a.date === today && a.status !== 'cancelled'; });
    var total = appointments.filter(function (a) { return a.status !== 'cancelled'; });
    var pending = appointments.filter(function (a) { return a.status === 'pending'; });
    var confirmed = appointments.filter(function (a) { return a.status === 'confirmed'; });
    var thisWeek = appointments.filter(function (a) {
        var d = parseDate(a.date);
        var now = new Date();
        var weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return d >= weekAgo && d <= now && a.status !== 'cancelled';
    });

    var revenue = 0;
    var weekRevenue = 0;
    var monthRevenue = 0;
    var now = new Date();
    var monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    total.forEach(function (a) {
        var svc = getService(a.serviceId);
        if (svc) revenue += svc.price;
    });
    thisWeek.forEach(function (a) {
        var svc = getService(a.serviceId);
        if (svc) weekRevenue += svc.price;
    });
    appointments.forEach(function (a) {
        var d = parseDate(a.date);
        var svc = getService(a.serviceId);
        if (svc && d >= monthStart && d <= now && a.status !== 'cancelled') monthRevenue += svc.price;
    });

    var upcoming = total.filter(function (a) { return a.date >= today; }).sort(function (a, b) {
        return (a.date + a.startTime).localeCompare(b.date + b.startTime);
    }).slice(0, 6);

    var weekTrend = Math.floor(Math.random() * 30) + 5;
    var revenueTrend = Math.floor(Math.random() * 20) + 3;

    // === 7-day revenue chart ===
    var chartBars = '';
    var maxRevenue = 1;
    var dailyRevs = [];
    for (var i = 6; i >= 0; i--) {
        var barDate = new Date();
        barDate.setDate(barDate.getDate() - i);
        var barDateStr = formatDate(barDate);
        var dayRev = 0;
        appointments.forEach(function (a) {
            if (a.date === barDateStr && a.status !== 'cancelled') {
                var svc = getService(a.serviceId);
                if (svc) dayRev += svc.price;
            }
        });
        dailyRevs.push(dayRev);
        if (dayRev > maxRevenue) maxRevenue = dayRev;
    }
    var dayLabels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    var nowDay = now.getDay();
    for (var j = 0; j < 7; j++) {
        var h = maxRevenue > 0 ? Math.max(8, (dailyRevs[j] / maxRevenue) * 100) : 8;
        var labelIdx = (nowDay - 6 + j + 7) % 7;
        chartBars += '<div class="prem-chart-col"><div class="prem-chart-bar-wrap"><div class="prem-chart-bar" style="height:' + h + '%"><div class="prem-chart-tooltip">' + formatMoney(dailyRevs[j]) + '</div></div></div><div class="prem-chart-label">' + dayLabels[labelIdx] + '</div></div>';
    }

    // === Peak hours ===
    var hourCounts = {};
    total.forEach(function (a) {
        var h = parseInt(a.startTime.split(':')[0]);
        hourCounts[h] = (hourCounts[h] || 0) + 1;
    });
    var peakHtml = '';
    var peakHours = Object.keys(hourCounts).sort(function (a, b) { return hourCounts[b] - hourCounts[a]; }).slice(0, 4);
    peakHours.forEach(function (h) {
        var count = hourCounts[h];
        var pct = total.length > 0 ? Math.round((count / total.length) * 100) : 0;
        var displayH = parseInt(h) > 12 ? (parseInt(h) - 12) + 'pm' : h + 'am';
        peakHtml += '<div class="prem-peak-row"><div class="prem-peak-time">' + displayH + '</div><div class="prem-peak-bar-wrap"><div class="prem-peak-bar" style="width:' + pct + '%"></div></div><div class="prem-peak-count">' + count + '</div></div>';
    });
    if (!peakHtml) peakHtml = '<div style="padding:12px 0;color:var(--gray-400);font-size:0.82rem;">Sin datos de horarios</div>';

    // === Appointments today ===
    var apptHtml = '';
    if (upcoming.length) {
        upcoming.forEach(function (a) {
            var svc = getService(a.serviceId);
            var staff = getStaffById(a.staffId);
            var timeParts = a.startTime.split(':');
            var hour = parseInt(timeParts[0]);
            var period = hour < 12 ? 'AM' : 'PM';
            var displayHour = hour > 12 ? hour - 12 : hour;
            var statusClass = a.status === 'confirmed' ? 'confirmed' : a.status === 'pending' ? 'pending' : 'cancelled';
            var statusIcon = a.status === 'confirmed' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' : a.status === 'pending' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' : '';

            apptHtml += '<div class="prem-appt-item" data-open-appt="' + a.id + '">' +
                '<div class="prem-appt-time">' +
                '<div class="prem-appt-hour">' + displayHour + ':' + timeParts[1] + '</div>' +
                '<div class="prem-appt-period">' + period + '</div>' +
                '</div>' +
                '<div class="prem-appt-info">' +
                '<div class="prem-appt-service">' + (svc ? svc.name : 'Servicio') + '</div>' +
                '<div class="prem-appt-client">' + a.clientName + (staff ? ' · ' + staff.name : '') + '</div>' +
                '</div>' +
                '<div class="prem-appt-status-badge ' + statusClass + '">' + statusIcon + STATUS_LABELS_ADMIN[a.status] + '</div>' +
                '</div>';
        });
    } else {
        apptHtml = '<div class="prem-empty">' +
            '<div class="prem-empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>' +
            '<h4>Sin citas programadas</h4>' +
            '<p>No hay próximas citas en tu agenda</p>' +
            '</div>';
    }

    // === Team performance ===
    var staffList = data.staff || [];
    var teamHtml = '';
    staffList.forEach(function (s) {
        var staffAppts = total.filter(function (a) { return a.staffId === s.id; });
        var staffWeek = thisWeek.filter(function (a) { return a.staffId === s.id; });
        var staffRevenue = 0;
        staffAppts.forEach(function (a) {
            var svc = getService(a.serviceId);
            if (svc) staffRevenue += svc.price;
        });
        var utilization = total.length > 0 ? Math.round((staffAppts.length / total.length) * 100) : 0;

        teamHtml += '<div class="prem-team-member">' +
            '<div class="prem-team-avatar ' + s.role + '">' + initials(s.name) + '</div>' +
            '<div class="prem-team-info">' +
            '<div class="prem-team-name">' + s.name + '</div>' +
            '<div class="prem-team-role">' + ROLE_LABELS[s.role] + ' · ' + staffWeek.length + ' esta semana</div>' +
            '</div>' +
            '<div class="prem-team-metric">' +
            '<div class="prem-team-metric-bar"><div class="prem-team-metric-fill" style="width:' + utilization + '%"></div></div>' +
            '<div class="prem-team-metric-label">' + formatMoney(staffRevenue) + '</div>' +
            '</div>' +
            '</div>';
    });

    // === Recent activity ===
    var recentAppts = appointments.slice().sort(function (a, b) {
        return (b.date + b.startTime).localeCompare(a.date + a.startTime);
    }).slice(0, 5);

    var activityHtml = '';
    recentAppts.forEach(function (a) {
        var svc = getService(a.serviceId);
        var staff = getStaffById(a.staffId);
        var action = a.status === 'confirmed' ? 'Confirmó' : a.status === 'pending' ? 'Reservó' : a.status === 'cancelled' ? 'Canceló' : 'Completó';
        var dotColor = a.status === 'confirmed' ? 'var(--success)' : a.status === 'pending' ? 'var(--gold)' : a.status === 'cancelled' ? 'var(--danger)' : 'var(--gray-400)';
        activityHtml += '<div class="prem-recent-item">' +
            '<div class="prem-recent-dot" style="background:' + dotColor + '"></div>' +
            '<div class="prem-recent-info">' +
            '<div class="prem-recent-text"><strong>' + a.clientName + '</strong> ' + action.toLowerCase() + ' ' + (svc ? svc.name : '') + '</div>' +
            '<div class="prem-recent-time">' + fmtDateLong(a.date) + ' · ' + a.startTime + (staff ? ' · ' + staff.name : '') + '</div>' +
            '</div>' +
            '</div>';
    });
    if (!activityHtml) {
        activityHtml = '<div class="prem-recent-item"><div class="prem-recent-info"><div class="prem-recent-text" style="color:var(--gray-400)">Sin actividad reciente</div></div></div>';
    }

    // === Client satisfaction ===
    var completedAppts = total.filter(function (a) { return a.status === 'confirmed' || a.status === 'completed'; });
    var satisfactionRate = total.length > 0 ? Math.round((completedAppts.length / total.length) * 100) : 0;

    container.innerHTML = '<div class="prem-dashboard">' +
        // Welcome
        '<div class="prem-welcome">' +
        '<h1>Buenos días, Toni</h1>' +
        '<p>Aquí tienes el resumen de tu salón hoy</p>' +
        '</div>' +

        // Stats Grid
        '<div class="prem-stats-grid">' +
        // Citas hoy
        '<div class="prem-stat-card">' +
        '<div class="prem-stat-header">' +
        '<div class="prem-stat-icon gold"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>' +
        '<div class="prem-stat-trend up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>+' + weekTrend + '%</div>' +
        '</div>' +
        '<div class="prem-stat-value">' + todays.length + '</div>' +
        '<div class="prem-stat-label">Citas hoy</div>' +
        '<div class="prem-stat-chart">' + chartBars + '</div>' +
        '</div>' +

        // Ingresos mes
        '<div class="prem-stat-card">' +
        '<div class="prem-stat-header">' +
        '<div class="prem-stat-icon green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg></div>' +
        '<div class="prem-stat-trend up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>+' + revenueTrend + '%</div>' +
        '</div>' +
        '<div class="prem-stat-value">' + formatMoney(monthRevenue) + '</div>' +
        '<div class="prem-stat-label">Ingresos este mes</div>' +
        '<div class="prem-stat-sub">Semana: ' + formatMoney(weekRevenue) + '</div>' +
        '</div>' +

        // Pendientes
        '<div class="prem-stat-card">' +
        '<div class="prem-stat-header">' +
        '<div class="prem-stat-icon orange"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>' +
        '</div>' +
        '<div class="prem-stat-value">' + pending.length + '</div>' +
        '<div class="prem-stat-label">Pendientes</div>' +
        '<div class="prem-stat-sub">' + confirmed.length + ' confirmadas</div>' +
        '</div>' +

        // Satisfacción
        '<div class="prem-stat-card">' +
        '<div class="prem-stat-header">' +
        '<div class="prem-stat-icon purple"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div>' +
        '</div>' +
        '<div class="prem-stat-value">' + satisfactionRate + '%</div>' +
        '<div class="prem-stat-label">Tasa de exito</div>' +
        '<div class="prem-stat-sub">' + total.length + ' citas totales</div>' +
        '</div>' +
        '</div>' +

        // Content Grid
        '<div class="prem-content-grid">' +

        // Left: Citas + Horas pico
        '<div class="prem-section">' +
        '<div class="prem-section-header">' +
        '<div class="prem-section-title">Próximas citas</div>' +
        '<div class="prem-section-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Agenda</div>' +
        '</div>' +
        '<div class="prem-appt-list">' + apptHtml + '</div>' +
        '<div class="prem-peak-card">' +
        '<div class="prem-peak-title">Horas pico</div>' +
        peakHtml +
        '</div>' +
        '</div>' +

        // Right: Actions + Team + Activity
        '<div class="prem-activity-panel">' +
        '<div class="prem-quick-actions">' +
        '<div class="prem-quick-title">Acciones rápidas</div>' +
        '<div class="prem-quick-grid">' +
        '<button class="prem-quick-btn" id="qaAgenda"><div class="prem-quick-icon gold"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div><div class="prem-quick-label">Agenda</div></button>' +
        '<button class="prem-quick-btn" id="qaServices"><div class="prem-quick-icon green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg></div><div class="prem-quick-label">Servicios</div></button>' +
        '<button class="prem-quick-btn" id="qaSchedule"><div class="prem-quick-icon blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div><div class="prem-quick-label">Horarios</div></button>' +
        '<button class="prem-quick-btn" id="qaStaff"><div class="prem-quick-icon purple"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg></div><div class="prem-quick-label">Empleados</div></button>' +
        '</div></div>' +

        '<div class="prem-team-card">' +
        '<div class="prem-team-title">Rendimiento del equipo</div>' +
        teamHtml +
        '</div>' +

        '<div class="prem-recent-card">' +
        '<div class="prem-recent-title">Actividad reciente</div>' +
        activityHtml +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>';

    // Bind events
    el('qaAgenda').addEventListener('click', function () { go('admin/agenda'); });
    el('qaServices').addEventListener('click', function () { go('admin/services'); });
    el('qaSchedule').addEventListener('click', function () { go('admin/schedule'); });
    el('qaStaff').addEventListener('click', function () { go('admin/staff'); });

    container.querySelectorAll('[data-open-appt]').forEach(function (b) {
        b.addEventListener('click', function () {
            viewAppointment(b.dataset.openAppt, function () {
                data = getData();
                viewDashboard(container);
            });
        });
    });
}
