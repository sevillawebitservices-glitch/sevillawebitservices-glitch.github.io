// admin.js - Panel de administración (core: panel, agenda, horarios)
// Usa funciones globales de utils.js, app.js y admin-extra.js.

// ==================== TIME PICKER COMPONENT ====================
var TimePicker = {
    activePicker: null,
    
    create: function(container, options) {
        var self = this;
        var value = options.value || '';
        var id = options.id || 'tp_' + Math.random().toString(36).substr(2, 9);
        var onChange = options.onChange || function() {};
        var disabled = options.disabled || false;
        
        var html = '<div class="tp-container" id="' + id + '" data-tp-id="' + id + '">';
        html += '<div class="tp-input' + (disabled ? ' disabled' : '') + '" data-tp-toggle="' + id + '">';
        html += '<svg class="tp-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
        html += '<span class="tp-input-value' + (!value ? ' empty' : '') + '" data-tp-display="' + id + '">' + (value || '--:--') + '</span>';
        html += '<svg class="tp-input-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>';
        html += '</div>';
        html += '</div>';
        
        container.innerHTML = html;
        
        // Store picker data
        this.pickers = this.pickers || {};
        this.pickers[id] = {
            value: value,
            onChange: onChange,
            container: container
        };
        
        // Bind toggle
        container.querySelector('[data-tp-toggle]').addEventListener('click', function(e) {
            e.stopPropagation();
            self.toggle(id);
        });
        
        return id;
    },
    
    toggle: function(id) {
        if (this.activePicker === id) {
            this.close();
        } else {
            this.open(id);
        }
    },
    
    open: function(id) {
        this.close();
        this.activePicker = id;
        
        var picker = this.pickers[id];
        if (!picker) return;
        
        var container = picker.container;
        var currentValue = picker.value || '09:00';
        var parts = currentValue.split(':');
        var selectedHour = parseInt(parts[0]) || 9;
        var selectedMinute = parseInt(parts[1]) || 0;
        
        // Create dropdown
        var dropdown = document.createElement('div');
        dropdown.className = 'tp-dropdown';
        dropdown.id = 'tp_dropdown_' + id;
        
        var html = '';
        
        // Header
        html += '<div class="tp-dropdown-header">';
        html += '<span class="tp-dropdown-title">Seleccionar hora</span>';
        html += '<button class="tp-dropdown-close" data-tp-close="' + id + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>';
        html += '</div>';
        
        // Selected display
        html += '<div class="tp-selected-display">';
        html += '<span class="tp-selected-time" data-tp-time-display="' + id + '">' + this.formatTime(selectedHour, selectedMinute) + '</span>';
        html += '<span class="tp-selected-period">' + (selectedHour < 12 ? 'AM' : 'PM') + '</span>';
        html += '</div>';
        
        // Clock face
        html += '<div class="tp-clock-container">';
        html += '<div class="tp-clock" data-tp-clock="' + id + '">';
        html += '<div class="tp-clock-center"></div>';
        html += '<div class="tp-clock-hand" data-tp-hand="' + id + '" style="transform: translateX(-50%) rotate(' + this.getRotation(selectedHour) + 'deg);"></div>';
        
        // Hour marks (1-12)
        var hours12 = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        hours12.forEach(function(h, i) {
            var angle = (i * 30) - 90;
            var rad = angle * (Math.PI / 180);
            var x = 50 + 38 * Math.cos(rad);
            var y = 50 + 38 * Math.sin(rad);
            var isActive = (selectedHour % 12 === h % 12);
            html += '<div class="tp-clock-hour-mark' + (isActive ? ' active' : '') + '" style="left:' + x + '%;top:' + y + '%;" data-tp-hour="' + h + '" data-tp-hour-24="' + (h === 12 ? 0 : h) + '">' + h + '</div>';
        });
        
        html += '</div>';
        
        // Minutes
        html += '<div class="tp-minutes-section">';
        html += '<div class="tp-minutes-label">Minutos</div>';
        html += '<div class="tp-minutes-grid">';
        [0, 15, 30, 45].forEach(function(m) {
            html += '<button class="tp-minute-btn' + (selectedMinute === m ? ' active' : '') + '" data-tp-minute="' + m + '">' + (m < 10 ? '0' : '') + m + '</button>';
        });
        html += '</div></div>';
        
        html += '</div>';
        
        // Quick times
        html += '<div class="tp-quick-times">';
        ['08:00', '09:00', '10:00', '12:00', '16:00', '17:00', '18:00', '20:00'].forEach(function(t) {
            var h = parseInt(t.split(':')[0]);
            var m = parseInt(t.split(':')[1]);
            html += '<button class="tp-quick-time-btn" data-tp-quick="' + t + '">' + t + '</button>';
        });
        html += '</div>';
        
        // Confirm
        html += '<button class="tp-confirm" data-tp-confirm="' + id + '">Seleccionar</button>';
        
        // Clear
        html += '<button class="tp-clear" data-tp-clear="' + id + '">Limpiar</button>';
        
        dropdown.innerHTML = html;
        container.querySelector('.tp-container').appendChild(dropdown);
        
        // Bind events
        this.bindEvents(id);
    },
    
    bindEvents: function(id) {
        var self = this;
        var picker = this.pickers[id];
        var dropdown = document.getElementById('tp_dropdown_' + id);
        if (!dropdown) return;
        
        // Close button
        dropdown.querySelector('[data-tp-close]').addEventListener('click', function(e) {
            e.stopPropagation();
            self.close();
        });
        
        // Hour marks
        dropdown.querySelectorAll('[data-tp-hour]').forEach(function(mark) {
            mark.addEventListener('click', function() {
                var hour12 = parseInt(mark.dataset.tpHour);
                var hour24 = parseInt(mark.dataset.tpHour24);
                
                // Update selection
                dropdown.querySelectorAll('[data-tp-hour]').forEach(function(m) { m.classList.remove('active'); });
                mark.classList.add('active');
                
                // Update hand rotation
                var index = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].indexOf(hour12);
                var rotation = (index * 30) - 90;
                dropdown.querySelector('[data-tp-hand]').style.transform = 'translateX(-50%) rotate(' + rotation + 'deg)';
                
                // Store
                self.tempHour = hour24;
                self.updateDisplay(id);
            });
        });
        
        // Minute buttons
        dropdown.querySelectorAll('[data-tp-minute]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                dropdown.querySelectorAll('[data-tp-minute]').forEach(function(b) { b.classList.remove('active'); });
                btn.classList.add('active');
                self.tempMinute = parseInt(btn.dataset.tpMinute);
                self.updateDisplay(id);
            });
        });
        
        // Quick times
        dropdown.querySelectorAll('[data-tp-quick]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var time = btn.dataset.tpQuick;
                var parts = time.split(':');
                self.tempHour = parseInt(parts[0]);
                self.tempMinute = parseInt(parts[1]);
                
                // Update hour selection
                var hour12 = self.tempHour % 12 || 12;
                dropdown.querySelectorAll('[data-tp-hour]').forEach(function(m) {
                    m.classList.toggle('active', parseInt(m.dataset.tpHour) === hour12);
                });
                
                // Update minute selection
                dropdown.querySelectorAll('[data-tp-minute]').forEach(function(b) {
                    b.classList.toggle('active', parseInt(b.dataset.tpMinute) === self.tempMinute);
                });
                
                // Update hand
                var index = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].indexOf(hour12);
                var rotation = (index * 30) - 90;
                dropdown.querySelector('[data-tp-hand]').style.transform = 'translateX(-50%) rotate(' + rotation + 'deg)';
                
                self.updateDisplay(id);
            });
        });
        
        // Confirm
        dropdown.querySelector('[data-tp-confirm]').addEventListener('click', function() {
            var time = self.formatTime(self.tempHour || 9, self.tempMinute || 0);
            picker.value = time;
            picker.onChange(time);
            
            // Update display
            var display = document.querySelector('[data-tp-display="' + id + '"]');
            if (display) {
                display.textContent = time;
                display.classList.remove('empty');
            }
            
            self.close();
        });
        
        // Clear
        dropdown.querySelector('[data-tp-clear]').addEventListener('click', function() {
            picker.value = '';
            picker.onChange('');
            
            var display = document.querySelector('[data-tp-display="' + id + '"]');
            if (display) {
                display.textContent = '--:--';
                display.classList.add('empty');
            }
            
            self.close();
        });
        
        // Initialize temp values
        this.tempHour = picker.value ? parseInt(picker.value.split(':')[0]) : 9;
        this.tempMinute = picker.value ? parseInt(picker.value.split(':')[1]) : 0;
    },
    
    updateDisplay: function(id) {
        var display = document.querySelector('[data-tp-time-display="' + id + '"]');
        if (display) {
            display.textContent = this.formatTime(this.tempHour || 0, this.tempMinute || 0);
        }
        
        // Update period
        var periodEl = display ? display.nextElementSibling : null;
        if (periodEl) {
            periodEl.textContent = (this.tempHour < 12 ? 'AM' : 'PM');
        }
    },
    
    formatTime: function(hour, minute) {
        return (hour < 10 ? '0' : '') + hour + ':' + (minute < 10 ? '0' : '') + minute;
    },
    
    getRotation: function(hour) {
        var h12 = hour % 12 || 12;
        var index = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].indexOf(h12);
        return (index * 30) - 90;
    },
    
    close: function() {
        document.querySelectorAll('.tp-dropdown').forEach(function(d) { d.remove(); });
        document.querySelectorAll('.tp-container.open').forEach(function(c) { c.classList.remove('open'); });
        this.activePicker = null;
    }
};

// Close on outside click
document.addEventListener('click', function() {
    TimePicker.close();
});

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

    render(html);

    document.querySelectorAll('[data-admin-nav]').forEach(function (b) {
        b.addEventListener('click', function () {
            switchAdminView(b.dataset.adminNav);
        });
    });

    renderAdminView(valid);
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
    if (view === 'services') { viewServices(container); return; }
    if (view === 'staff') { viewStaff(container); return; }
    if (view === 'clients') { viewClients(container); return; }
    if (view === 'schedule') { viewSchedule(container); return; }
    if (view === 'agenda') { viewAgenda(container); return; }
    viewDashboard(container);
}

// ==================== PANEL ====================
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
    total.forEach(function (a) {
        var svc = getService(a.serviceId);
        if (svc) revenue += svc.price;
    });
    thisWeek.forEach(function (a) {
        var svc = getService(a.serviceId);
        if (svc) weekRevenue += svc.price;
    });

    var upcoming = total.filter(function (a) { return a.date >= today; }).sort(function (a, b) {
        return (a.date + a.startTime).localeCompare(b.date + b.startTime);
    }).slice(0, 5);

    // Simulated trend data (in real app would come from historical data)
    var weekTrend = Math.floor(Math.random() * 30) + 5;
    var revenueTrend = Math.floor(Math.random() * 20) + 3;
    var clientsTrend = Math.floor(Math.random() * 15) + 2;

    // Mini chart data (last 7 days activity)
    var chartBars = '';
    for (var i = 6; i >= 0; i--) {
        var barDate = new Date();
        barDate.setDate(barDate.getDate() - i);
        var barDateStr = formatDate(barDate);
        var dayCount = appointments.filter(function (a) { return a.date === barDateStr && a.status !== 'cancelled'; }).length;
        var height = dayCount > 0 ? Math.max(20, (dayCount / 8) * 100) : 8;
        chartBars += '<div class="prem-stat-bar" style="height:' + height + '%"></div>';
    }

    // Upcoming appointments HTML
    var apptHtml = '';
    if (upcoming.length) {
        upcoming.forEach(function (a) {
            var svc = getService(a.serviceId);
            var staff = getStaffById(a.staffId);
            var timeParts = a.startTime.split(':');
            var hour = parseInt(timeParts[0]);
            var period = hour < 12 ? 'AM' : 'PM';
            var displayHour = hour > 12 ? hour - 12 : hour;

            apptHtml += '<div class="prem-appt-item" data-open-appt="' + a.id + '">' +
                '<div class="prem-appt-time">' +
                '<div class="prem-appt-hour">' + displayHour + ':' + timeParts[1] + '</div>' +
                '<div class="prem-appt-period">' + period + '</div>' +
                '</div>' +
                '<div class="prem-appt-info">' +
                '<div class="prem-appt-service">' + (svc ? svc.name : 'Servicio') + '</div>' +
                '<div class="prem-appt-client">' + a.clientName + '</div>' +
                '</div>' +
                '<div class="prem-appt-staff">' +
                (staff ? '<div class="prem-appt-avatar ' + staff.role + '">' + initials(staff.name) + '</div>' : '') +
                '<span class="prem-appt-status ' + a.status + '">' + STATUS_LABELS_ADMIN[a.status] + '</span>' +
                '</div>' +
                '</div>';
        });
    } else {
        apptHtml = '<div class="prem-empty">' +
            '<div class="prem-empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>' +
            '<h4>Sin citas programadas</h4>' +
            '<p>No hay próximas citas en tu agenda</p>' +
            '</div>';
    }

    // Team performance
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

        teamHtml += '<div class="prem-team-member">' +
            '<div class="prem-team-avatar ' + s.role + '">' + initials(s.name) + '</div>' +
            '<div class="prem-team-info">' +
            '<div class="prem-team-name">' + s.name + '</div>' +
            '<div class="prem-team-role">' + ROLE_LABELS[s.role] + '</div>' +
            '</div>' +
            '<div class="prem-team-stats">' +
            '<div class="prem-team-stat"><div class="prem-team-stat-value">' + staffAppts.length + '</div><div class="prem-team-stat-label">Citas</div></div>' +
            '<div class="prem-team-stat"><div class="prem-team-stat-value">' + formatMoney(staffRevenue) + '</div><div class="prem-team-stat-label">Ingresos</div></div>' +
            '</div>' +
            '</div>';
    });

    // Recent activity
    var recentAppts = appointments.slice().sort(function (a, b) {
        return (b.date + b.startTime).localeCompare(a.date + a.startTime);
    }).slice(0, 4);

    var activityHtml = '';
    recentAppts.forEach(function (a) {
        var svc = getService(a.serviceId);
        var staff = getStaffById(a.staffId);
        var action = a.status === 'confirmed' ? 'confirmó' : a.status === 'pending' ? 'reservó' : 'canceló';
        activityHtml += '<div class="prem-recent-item">' +
            '<div class="prem-recent-dot ' + a.status + '"></div>' +
            '<div class="prem-recent-info">' +
            '<div class="prem-recent-text"><strong>' + a.clientName + '</strong> ' + action + ' ' + (svc ? svc.name : 'un servicio') + (staff ? ' con ' + staff.name : '') + '</div>' +
            '<div class="prem-recent-time">' + fmtDateLong(a.date) + ' · ' + a.startTime + '</div>' +
            '</div>' +
            '</div>';
    });

    if (!activityHtml) {
        activityHtml = '<div class="prem-recent-item"><div class="prem-recent-info"><div class="prem-recent-text">Sin actividad reciente</div></div></div>';
    }

    container.innerHTML = '<div class="prem-dashboard">' +

        // Welcome header
        '<div class="prem-welcome">' +
        '<h1>Buenos días, Toni</h1>' +
        '<p>Aquí tienes el resumen de tu salón hoy</p>' +
        '</div>' +

        // Stats grid
        '<div class="prem-stats-grid">' +

        '<div class="prem-stat-card">' +
        '<div class="prem-stat-header">' +
        '<div class="prem-stat-icon gold"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>' +
        '<div class="prem-stat-trend up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>+' + weekTrend + '%</div>' +
        '</div>' +
        '<div class="prem-stat-value">' + todays.length + '</div>' +
        '<div class="prem-stat-label">Citas hoy</div>' +
        '<div class="prem-stat-chart">' + chartBars + '</div>' +
        '</div>' +

        '<div class="prem-stat-card">' +
        '<div class="prem-stat-header">' +
        '<div class="prem-stat-icon orange"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>' +
        '<div class="prem-stat-trend up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>+' + clientsTrend + '%</div>' +
        '</div>' +
        '<div class="prem-stat-value">' + pending.length + '</div>' +
        '<div class="prem-stat-label">Pendientes</div>' +
        '<div class="prem-stat-chart">' +
        '<div class="prem-stat-bar" style="height:40%"></div>' +
        '<div class="prem-stat-bar" style="height:25%"></div>' +
        '<div class="prem-stat-bar" style="height:60%"></div>' +
        '<div class="prem-stat-bar" style="height:35%"></div>' +
        '<div class="prem-stat-bar" style="height:50%"></div>' +
        '<div class="prem-stat-bar" style="height:30%"></div>' +
        '<div class="prem-stat-bar" style="height:45%"></div>' +
        '</div>' +
        '</div>' +

        '<div class="prem-stat-card">' +
        '<div class="prem-stat-header">' +
        '<div class="prem-stat-icon green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>' +
        '<div class="prem-stat-trend up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>+' + clientsTrend + '%</div>' +
        '</div>' +
        '<div class="prem-stat-value">' + total.length + '</div>' +
        '<div class="prem-stat-label">Total citas</div>' +
        '<div class="prem-stat-chart">' +
        '<div class="prem-stat-bar" style="height:30%"></div>' +
        '<div class="prem-stat-bar" style="height:45%"></div>' +
        '<div class="prem-stat-bar" style="height:55%"></div>' +
        '<div class="prem-stat-bar" style="height:40%"></div>' +
        '<div class="prem-stat-bar" style="height:70%"></div>' +
        '<div class="prem-stat-bar" style="height:60%"></div>' +
        '<div class="prem-stat-bar" style="height:80%"></div>' +
        '</div>' +
        '</div>' +

        '<div class="prem-stat-card">' +
        '<div class="prem-stat-header">' +
        '<div class="prem-stat-icon red"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg></div>' +
        '<div class="prem-stat-trend up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>+' + revenueTrend + '%</div>' +
        '</div>' +
        '<div class="prem-stat-value">' + formatMoney(revenue) + '</div>' +
        '<div class="prem-stat-label">Ingresos totales</div>' +
        '<div class="prem-stat-chart">' +
        '<div class="prem-stat-bar" style="height:25%"></div>' +
        '<div class="prem-stat-bar" style="height:35%"></div>' +
        '<div class="prem-stat-bar" style="height:50%"></div>' +
        '<div class="prem-stat-bar" style="height:45%"></div>' +
        '<div class="prem-stat-bar" style="height:65%"></div>' +
        '<div class="prem-stat-bar" style="height:55%"></div>' +
        '<div class="prem-stat-bar" style="height:75%"></div>' +
        '</div>' +
        '</div>' +

        '</div>' +

        // Content grid
        '<div class="prem-content-grid">' +

        // Upcoming appointments
        '<div class="prem-section">' +
        '<div class="prem-section-header">' +
        '<div class="prem-section-title">Próximas citas</div>' +
        '<div class="prem-section-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Hoy</div>' +
        '</div>' +
        '<div class="prem-appt-list">' + apptHtml + '</div>' +
        '</div>' +

        // Activity panel
        '<div class="prem-activity-panel">' +

        // Quick actions
        '<div class="prem-quick-actions">' +
        '<div class="prem-quick-title">Acciones rápidas</div>' +
        '<div class="prem-quick-grid">' +
        '<button class="prem-quick-btn" id="qaAgenda">' +
        '<div class="prem-quick-icon gold"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>' +
        '<div class="prem-quick-label">Ver agenda</div>' +
        '</button>' +
        '<button class="prem-quick-btn" id="qaServices">' +
        '<div class="prem-quick-icon green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg></div>' +
        '<div class="prem-quick-label">Servicios</div>' +
        '</button>' +
        '<button class="prem-quick-btn" id="qaSchedule">' +
        '<div class="prem-quick-icon blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>' +
        '<div class="prem-quick-label">Horarios</div>' +
        '</button>' +
        '<button class="prem-quick-btn" id="qaStaff">' +
        '<div class="prem-quick-icon purple"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg></div>' +
        '<div class="prem-quick-label">Empleados</div>' +
        '</button>' +
        '</div>' +
        '</div>' +

        // Team performance
        '<div class="prem-team-card">' +
        '<div class="prem-team-title">Rendimiento del equipo</div>' +
        teamHtml +
        '</div>' +

        // Recent activity
        '<div class="prem-recent-card">' +
        '<div class="prem-recent-title">Actividad reciente</div>' +
        activityHtml +
        '</div>' +

        '</div>' +

        '</div>' +
        '</div>';

    // Bind quick actions
    el('qaAgenda').addEventListener('click', function () { go('admin/agenda'); });
    el('qaServices').addEventListener('click', function () { go('admin/services'); });
    el('qaSchedule').addEventListener('click', function () { go('admin/schedule'); });
    el('qaStaff').addEventListener('click', function () { go('admin/staff'); });

    // Bind appointment clicks
    container.querySelectorAll('[data-open-appt]').forEach(function (b) {
        b.addEventListener('click', function () {
            viewAppointment(b.dataset.openAppt, function () {
                data = getData();
                viewDashboard(container);
            });
        });
    });
}

// ==================== AGENDA ====================
function viewAgenda(container) {
    var data = getData();
    var calMonth = new Date().getMonth();
    var calYear = new Date().getFullYear();
    var selectedDate = formatDate(new Date());

    function getAppointmentsForDate(dateStr, role, staffId) {
        return (data.appointments || []).filter(function (a) {
            if (a.date !== dateStr || a.status === 'cancelled') return false;
            var svc = getService(a.serviceId);
            var staff = getStaffById(a.staffId);
            var okRole = !role || role === 'all' || (svc && svc.category === role);
            var okStaff = !staffId || staffId === 'all' || a.staffId === staffId;
            return okRole && okStaff;
        }).sort(function (a, b) { return a.startTime.localeCompare(b.startTime); });
    }

    function countApptsForDay(dateStr) {
        return (data.appointments || []).filter(function (a) {
            return a.date === dateStr && a.status !== 'cancelled';
        }).length;
    }

    function renderAll() {
        var role = el('filterRole') ? el('filterRole').value : 'all';
        var staffId = el('filterStaff') ? el('filterStaff').value : 'all';
        var appointments = getAppointmentsForDate(selectedDate, role, staffId);
        var d = parseDate(selectedDate);
        var dayIdx = d.getDay();
        var isClosed = isDayClosed(selectedDate);
        var closedDayInfo = getClosedDayForDate(selectedDate);

        var html = '<div class="prem-agenda">';

        // Header
        html += '<div class="prem-agenda-header">';
        html += '<div><h1>Agenda</h1><p>Calendario mensual con gestión completa de citas</p></div>';
        html += '<div class="prem-agenda-actions">';
        html += '<button class="prem-close-days-btn" id="closeDaysBtn">';
        html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="10" y1="14" x2="14" y2="18"/><line x1="14" y1="14" x2="10" y2="18"/></svg>';
        html += 'Cerrar días';
        html += '</button>';
        html += '</div></div>';

        // Filtros
        html += '<div class="prem-agenda-filters">';
        html += '<div class="prem-filter-select"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>';
        html += '<select id="filterRole"><option value="all">Todos los profesionales</option><option value="hair">Barbería</option><option value="beauty">Estética</option></select></div>';
        html += '<div class="prem-filter-select"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
        html += '<select id="filterStaff"><option value="all">Todos los empleados</option>';
        (data.staff || []).forEach(function (s) {
            html += '<option value="' + s.id + '">' + s.name + '</option>';
        });
        html += '</select></div></div>';

        // Layout
        html += '<div class="prem-agenda-layout">';

        // CALENDARIO
        html += '<div class="prem-calendar-card">';
        html += '<div class="prem-calendar-header">';
        html += '<div class="prem-calendar-nav">';
        html += '<button class="prem-calendar-nav-btn" data-cal-prev><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg></button>';
        html += '<span class="prem-calendar-month">' + MONTHS[calMonth] + ' ' + calYear + '</span>';
        html += '<button class="prem-calendar-nav-btn" data-cal-next><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></button>';
        html += '</div>';
        html += '<button class="prem-calendar-today-btn" id="calTodayBtn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Hoy</button>';
        html += '</div>';

        html += '<div class="prem-calendar-body">';
        
        // Weekday headers
        html += '<div class="prem-calendar-weekdays">';
        var dowShort = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        dowShort.forEach(function (d) { html += '<div class="prem-calendar-weekday">' + d + '</div>'; });
        html += '</div>';

        // Days grid
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        var firstDay = new Date(calYear, calMonth, 1);
        var startDow = firstDay.getDay();
        startDow = startDow === 0 ? 6 : startDow - 1;
        var daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

        var closedDaysMonth = getClosedDaysForMonth(calYear, calMonth);

        html += '<div class="prem-calendar-days">';
        
        for (var p = 0; p < startDow; p++) {
            html += '<div class="prem-calendar-day empty"></div>';
        }

        for (var day = 1; day <= daysInMonth; day++) {
            var cellDate = new Date(calYear, calMonth, day);
            var dateStr = formatDate(cellDate);
            var isToday = cellDate.getTime() === today.getTime();
            var isSelected = dateStr === selectedDate;
            var apptCount = countApptsForDay(dateStr);
            var dayIsClosed = isDayClosed(dateStr);
            var isPast = cellDate < today;

            var cls = 'prem-calendar-day';
            if (isToday) cls += ' today';
            if (isSelected) cls += ' selected';
            if (isPast) cls += ' disabled';
            if (dayIsClosed) cls += ' closed';

            html += '<div class="' + cls + '" data-pick-day="' + dateStr + '">';
            html += '<span class="day-number">' + day + '</span>';
            
            if (apptCount > 0 && !dayIsClosed) {
                html += '<div class="appointment-dots">';
                var appts = (data.appointments || []).filter(function (a) { return a.date === dateStr && a.status !== 'cancelled'; });
                var confirmedCount = appts.filter(function (a) { return a.status === 'confirmed'; }).length;
                var pendingCount = appts.filter(function (a) { return a.status === 'pending'; }).length;
                if (confirmedCount > 0) html += '<span class="appointment-dot confirmed"></span>';
                if (pendingCount > 0) html += '<span class="appointment-dot pending"></span>';
                html += '</div>';
                if (apptCount > 0) html += '<div class="appointment-count">' + apptCount + '</div>';
            }
            
            if (dayIsClosed && !isPast) {
                html += '<svg style="width:12px;height:12px;position:absolute;bottom:4px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
            }
            
            html += '</div>';
        }
        html += '</div></div>';

        // Legend
        html += '<div class="prem-calendar-legend">';
        html += '<div class="prem-legend-item"><div class="prem-legend-dot confirmed"></div> Confirmada</div>';
        html += '<div class="prem-legend-item"><div class="prem-legend-dot pending"></div> Pendiente</div>';
        html += '<div class="prem-legend-item"><div class="prem-legend-dot closed"></div> Cerrado</div>';
        html += '</div></div>';

        // PANEL DÍA
        html += '<div class="prem-day-panel">';
        html += '<div class="prem-day-panel-header">';
        html += '<div class="prem-day-panel-date">' + DAY_NAMES[dayIdx] + ', ' + d.getDate() + ' de ' + MONTHS_LOWERCASE[d.getMonth()] + '</div>';
        html += '<div class="prem-day-panel-count">';
        
        if (isClosed) {
            html += '<span class="count-badge" style="background:#fee2e2;color:#dc2626;">Cerrado</span>';
        } else {
            html += '<span class="count-badge">' + appointments.length + ' cita' + (appointments.length !== 1 ? 's' : '') + '</span>';
        }
        
        html += '</div>';

        // Acciones del día
        html += '<div class="prem-day-panel-actions">';
        if (isClosed) {
            html += '<button class="prem-day-action-btn open-day" data-open-day="' + selectedDate + '">';
            html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>';
            html += 'Abrir día';
            html += '</button>';
        } else {
            html += '<button class="prem-day-action-btn close-day" data-close-day="' + selectedDate + '">';
            html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="10" y1="14" x2="14" y2="18"/><line x1="14" y1="14" x2="10" y2="18"/></svg>';
            html += 'Cerrar día';
            html += '</button>';
        }
        html += '</div></div>';

        // Banner si está cerrado
        if (isClosed && closedDayInfo) {
            html += '<div class="prem-closed-banner">';
            html += '<div class="prem-closed-banner-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>';
            html += '<div class="prem-closed-banner-info">';
            html += '<h4>' + (closedDayInfo.reason || 'Día cerrado') + '</h4>';
            html += '<p>' + (closedDayInfo.startDate === closedDayInfo.endDate ? fmtDateLong(closedDayInfo.startDate) : fmtDateLong(closedDayInfo.startDate) + ' - ' + fmtDateLong(closedDayInfo.endDate)) + '</p>';
            html += '</div>';
            html += '<button class="prem-closed-banner-remove" data-remove-closed="' + closedDayInfo.id + '">Eliminar</button>';
            html += '</div>';
        }

        // Lista de citas
        html += '<div class="prem-day-appointments">';
        
        if (isClosed) {
            html += '<div class="prem-day-empty">';
            html += '<div class="prem-day-empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>';
            html += '<h4>Día cerrado</h4>';
            html += '<p>Este día no hay citas programadas</p>';
            html += '</div>';
        } else if (appointments.length) {
            appointments.forEach(function (a) {
                var svc = getService(a.serviceId);
                var staff = getStaffById(a.staffId);
                var timeParts = a.startTime.split(':');
                var hour = parseInt(timeParts[0]);
                var period = hour < 12 ? 'AM' : 'PM';
                var displayHour = hour > 12 ? hour - 12 : hour;
                var statusLabels = { confirmed: 'Confirmada', pending: 'Pendiente', cancelled: 'Cancelada', completed: 'Completada' };

                html += '<div class="prem-day-appt" data-open-appt="' + a.id + '">';
                html += '<div class="prem-day-appt-time">';
                html += '<div class="prem-day-appt-hour">' + displayHour + ':' + timeParts[1] + '</div>';
                html += '<div class="prem-day-appt-period">' + period + '</div>';
                html += '</div>';
                html += '<div class="prem-day-appt-info">';
                html += '<div class="prem-day-appt-service">' + (svc ? svc.name : 'Servicio') + '</div>';
                html += '<div class="prem-day-appt-client">' + a.clientName + '</div>';
                html += '<div class="prem-day-appt-staff">';
                if (staff) {
                    html += '<div class="prem-day-appt-staff-avatar ' + staff.role + '">' + initials(staff.name) + '</div>';
                    html += staff.name;
                }
                html += '</div>';
                html += '<div class="prem-day-appt-price">' + formatMoney(svc ? svc.price : 0) + '</div>';
                html += '</div>';
                html += '<span class="prem-day-appt-status ' + a.status + '">' + statusLabels[a.status] + '</span>';
                html += '</div>';
            });
        } else {
            html += '<div class="prem-day-empty">';
            html += '<div class="prem-day-empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>';
            html += '<h4>Sin citas este día</h4>';
            html += '<p>No hay citas programadas para esta fecha</p>';
            html += '</div>';
        }
        
        html += '</div></div></div></div>';

        container.innerHTML = html;
        bindEvents();
    }

    function bindEvents() {
        // Calendar nav
        container.querySelectorAll('[data-cal-prev]').forEach(function (b) {
            b.addEventListener('click', function () {
                calMonth--;
                if (calMonth < 0) { calMonth = 11; calYear--; }
                renderAll();
            });
        });
        container.querySelectorAll('[data-cal-next]').forEach(function (b) {
            b.addEventListener('click', function () {
                calMonth++;
                if (calMonth > 11) { calMonth = 0; calYear++; }
                renderAll();
            });
        });

        // Today button
        var todayBtn = el('calTodayBtn');
        if (todayBtn) {
            todayBtn.addEventListener('click', function () {
                var now = new Date();
                calMonth = now.getMonth();
                calYear = now.getFullYear();
                selectedDate = formatDate(now);
                renderAll();
            });
        }

        // Day selection
        container.querySelectorAll('[data-pick-day]').forEach(function (b) {
            b.addEventListener('click', function () {
                if (b.classList.contains('disabled') || b.classList.contains('empty')) return;
                selectedDate = b.dataset.pickDay;
                renderAll();
            });
        });

        // Filters
        var fr = el('filterRole');
        var fs = el('filterStaff');
        if (fr) fr.addEventListener('change', renderAll);
        if (fs) fs.addEventListener('change', renderAll);

        // Appointments
        container.querySelectorAll('[data-open-appt]').forEach(function (b) {
            b.addEventListener('click', function () {
                viewAppointment(b.dataset.openAppt, function () {
                    data = getData();
                    renderAll();
                });
            });
        });

        // Close day button
        var closeDaysBtn = el('closeDaysBtn');
        if (closeDaysBtn) {
            closeDaysBtn.addEventListener('click', function () {
                openCloseDaysModal();
            });
        }

        // Close single day
        container.querySelectorAll('[data-close-day]').forEach(function (b) {
            b.addEventListener('click', function () {
                var date = b.dataset.closeDay;
                addClosedDay(date, 'Cerrado', 'all');
                toast('Día cerrado', 'success');
                renderAll();
            });
        });

        // Open day
        container.querySelectorAll('[data-open-day]').forEach(function (b) {
            b.addEventListener('click', function () {
                var date = b.dataset.openDay;
                var closedInfo = getClosedDayForDate(date);
                if (closedInfo) {
                    removeClosedDay(closedInfo.id);
                    toast('Día abierto', 'success');
                    renderAll();
                }
            });
        });

        // Remove closed day
        container.querySelectorAll('[data-remove-closed]').forEach(function (b) {
            b.addEventListener('click', function () {
                var id = b.dataset.removeClosed;
                removeClosedDay(id);
                toast('Día cerrado eliminado', 'success');
                renderAll();
            });
        });
    }

    function openCloseDaysModal() {
        var staffList = getStaff();
        var dpStartState = { month: new Date().getMonth(), year: new Date().getFullYear(), start: null, end: null };
        var dpEndState = { month: new Date().getMonth(), year: new Date().getFullYear(), start: null, end: null };

        function fmtDpVal(d) {
            if (!d) return '';
            var months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            var dd = d.getDate();
            var mm = months[d.getMonth()];
            var yyyy = d.getFullYear();
            return dd + ' ' + mm + ' ' + yyyy;
        }

        function renderDpCalendar(container, state) {
            var today = new Date();
            today.setHours(0, 0, 0, 0);
            var firstDay = new Date(state.year, state.month, 1).getDay();
            var daysInMonth = new Date(state.year, state.month + 1, 0).getDate();
            var monthsNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

            var html = '<div class="dp-calendar-header">';
            html += '<div class="dp-calendar-title" data-dp-monthselect>' + monthsNames[state.month] + ' ' + state.year + '</div>';
            html += '<div class="dp-calendar-nav">';
            html += '<button class="dp-calendar-nav-btn" data-dp-prev><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg></button>';
            html += '<button class="dp-calendar-nav-btn" data-dp-next><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg></button>';
            html += '</div></div>';

            html += '<div class="dp-calendar-body">';
            html += '<div class="dp-weekdays">';
            ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].forEach(function (d) {
                html += '<div class="dp-weekday">' + d + '</div>';
            });
            html += '</div>';
            html += '<div class="dp-days">';

            for (var i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
                html += '<div class="dp-day empty"></div>';
            }
            for (var d = 1; d <= daysInMonth; d++) {
                var dt = new Date(state.year, state.month, d);
                dt.setHours(0, 0, 0, 0);
                var classes = ['dp-day'];
                if (dt.getTime() === today.getTime()) classes.push('today');
                if (state.start && state.end && dt >= state.start && dt <= state.end) {
                    classes.push('in-range');
                    if (dt.getTime() === state.start.getTime()) classes.push('range-start');
                    if (dt.getTime() === state.end.getTime()) classes.push('range-end');
                } else if (state.start && dt.getTime() === state.start.getTime()) {
                    classes.push('selected');
                } else if (state.end && dt.getTime() === state.end.getTime()) {
                    classes.push('selected');
                }
                if (dt < today) classes.push('disabled');
                html += '<div class="' + classes.join(' ') + '" data-dp-day="' + d + '" data-dp-date="' + formatDate(dt) + '">' + d + '</div>';
            }
            html += '</div></div>';

            if (state.start || state.end) {
                html += '<div class="dp-selected-range">';
                html += '<div class="dp-range-date"><div class="dp-range-date-label">Inicio</div><div class="dp-range-date-value">' + (state.start ? fmtDpVal(state.start) : '—') + '</div></div>';
                html += '<div class="dp-range-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>';
                html += '<div class="dp-range-date"><div class="dp-range-date-label">Fin</div><div class="dp-range-date-value">' + (state.end ? fmtDpVal(state.end) : '—') + '</div></div>';
                html += '</div>';
            }

            html += '<div class="dp-quick-select">';
            html += '<button class="dp-quick-btn" data-dp-quick="today">Hoy</button>';
            html += '<button class="dp-quick-btn" data-dp-quick="tomorrow">Mañana</button>';
            html += '<button class="dp-quick-btn" data-dp-quick="week">Esta semana</button>';
            html += '<button class="dp-quick-btn" data-dp-quick="next-week">Próxima semana</button>';
            html += '<button class="dp-quick-btn" data-dp-quick="month">Todo el mes</button>';
            html += '</div>';

            html += '<button class="dp-confirm" data-dp-confirm>Confirmar selección</button>';
            html += '<button class="dp-clear" data-dp-clear>Limpiar selección</button>';

            container.innerHTML = html;

            container.querySelector('[data-dp-prev]').addEventListener('click', function () {
                state.month--;
                if (state.month < 0) { state.month = 11; state.year--; }
                renderDpCalendar(container, state);
            });
            container.querySelector('[data-dp-next]').addEventListener('click', function () {
                state.month++;
                if (state.month > 11) { state.month = 0; state.year++; }
                renderDpCalendar(container, state);
            });

            container.querySelectorAll('[data-dp-day]').forEach(function (dayEl) {
                dayEl.addEventListener('click', function () {
                    if (dayEl.classList.contains('disabled')) return;
                    var dt = new Date(dayEl.dataset.dpDate + 'T00:00:00');
                    if (!state.start || (state.start && state.end)) {
                        state.start = dt;
                        state.end = null;
                    } else {
                        if (dt < state.start) {
                            state.end = state.start;
                            state.start = dt;
                        } else {
                            state.end = dt;
                        }
                    }
                    renderDpCalendar(container, state);
                });
            });

            container.querySelectorAll('[data-dp-quick]').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    var today = new Date();
                    today.setHours(0, 0, 0, 0);
                    var start = new Date(today);
                    var end = new Date(today);
                    switch (btn.dataset.dpQuick) {
                        case 'today': break;
                        case 'tomorrow': start.setDate(start.getDate() + 1); end = new Date(start); break;
                        case 'week':
                            var dow = today.getDay();
                            var mo = dow === 0 ? -6 : 1 - dow;
                            start.setDate(today.getDate() + mo);
                            end.setDate(start.getDate() + 6);
                            break;
                        case 'next-week':
                            start.setDate(today.getDate() + ((1 + 7 - today.getDay()) % 7 || 7));
                            end = new Date(start);
                            end.setDate(end.getDate() + 6);
                            break;
                        case 'month':
                            start = new Date(today.getFullYear(), today.getMonth(), 1);
                            end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                            break;
                    }
                    state.start = start;
                    state.end = end;
                    renderDpCalendar(container, state);
                });
            });

            container.querySelector('[data-dp-confirm]').addEventListener('click', function () {
                container.closest('.dp-container').classList.remove('open');
                container.closest('.dp-container').querySelector('.dp-dropdown').style.display = 'none';
            });
            container.querySelector('[data-dp-clear]').addEventListener('click', function () {
                state.start = null;
                state.end = null;
                renderDpCalendar(container, state);
            });
        }

        var bodyHtml = '<div class="prem-modal-close-days">';
        bodyHtml += '<h3>Cerrar días (Vacaciones / Festivos)</h3>';
        bodyHtml += '<div class="prem-close-days-form">';

        bodyHtml += '<div class="dp-container" id="dpStart">';
        bodyHtml += '<div class="dp-label">Fecha de inicio</div>';
        bodyHtml += '<div class="dp-input"><svg class="dp-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg><span class="dp-input-value empty" id="dpStartVal">Seleccionar fecha</span><svg class="dp-input-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg></div>';
        bodyHtml += '<div class="dp-dropdown" id="dpStartDrop"><div id="dpStartCal"></div></div>';
        bodyHtml += '</div>';

        bodyHtml += '<div class="dp-container" id="dpEnd">';
        bodyHtml += '<div class="dp-label">Fecha de fin</div>';
        bodyHtml += '<div class="dp-input"><svg class="dp-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg><span class="dp-input-value empty" id="dpEndVal">Seleccionar fecha</span><svg class="dp-input-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg></div>';
        bodyHtml += '<div class="dp-dropdown" id="dpEndDrop"><div id="dpEndCal"></div></div>';
        bodyHtml += '</div>';

        bodyHtml += '<div class="prem-form-group">';
        bodyHtml += '<label>Motivo</label>';
        bodyHtml += '<input type="text" class="prem-form-input" id="closeReason" placeholder="Ej: Vacaciones de verano">';
        bodyHtml += '</div>';

        bodyHtml += '<div class="prem-form-group">';
        bodyHtml += '<label>Profesional</label>';
        bodyHtml += '<select class="prem-form-select" id="closeStaff">';
        bodyHtml += '<option value="all">Todos los profesionales</option>';
        staffList.forEach(function (s) {
            bodyHtml += '<option value="' + s.id + '">' + s.name + ' (' + ROLE_LABELS[s.role] + ')</option>';
        });
        bodyHtml += '</select></div>';

        bodyHtml += '</div></div>';

        var footerHtml = '<button class="btn btn-ghost" data-close>Cancelar</button>';
        footerHtml += '<button class="btn btn-primary" id="confirmCloseDays">Cerrar días</button>';

        openModal('Cerrar días', bodyHtml, footerHtml, { wide: true });

        renderDpCalendar(document.getElementById('dpStartCal'), dpStartState);
        renderDpCalendar(document.getElementById('dpEndCal'), dpEndState);

        document.getElementById('dpStart').querySelector('.dp-input').addEventListener('click', function (e) {
            e.stopPropagation();
            var wasOpen = dpStartState._open;
            document.getElementById('dpStart').classList.remove('open');
            document.getElementById('dpStartDrop').style.display = 'none';
            document.getElementById('dpEnd').classList.remove('open');
            document.getElementById('dpEndDrop').style.display = 'none';
            dpEndState._open = false;
            if (!wasOpen) {
                document.getElementById('dpStart').classList.add('open');
                var drop = document.getElementById('dpStartDrop');
                drop.style.display = 'block';
                drop.style.position = 'fixed';
                var rect = document.getElementById('dpStart').querySelector('.dp-input').getBoundingClientRect();
                var dropH = 420;
                if (rect.bottom + dropH + 10 > window.innerHeight) {
                    drop.style.top = (rect.top - dropH - 8) + 'px';
                } else {
                    drop.style.top = (rect.bottom + 8) + 'px';
                }
                drop.style.left = rect.left + 'px';
                drop.style.width = '320px';
                drop.style.zIndex = '10001';
                renderDpCalendar(document.getElementById('dpStartCal'), dpStartState);
            }
            dpStartState._open = !wasOpen;
        });
        document.getElementById('dpEnd').querySelector('.dp-input').addEventListener('click', function (e) {
            e.stopPropagation();
            var wasOpen = dpEndState._open;
            document.getElementById('dpStart').classList.remove('open');
            document.getElementById('dpStartDrop').style.display = 'none';
            dpStartState._open = false;
            document.getElementById('dpEnd').classList.remove('open');
            document.getElementById('dpEndDrop').style.display = 'none';
            if (!wasOpen) {
                document.getElementById('dpEnd').classList.add('open');
                var drop = document.getElementById('dpEndDrop');
                drop.style.display = 'block';
                drop.style.position = 'fixed';
                var rect = document.getElementById('dpEnd').querySelector('.dp-input').getBoundingClientRect();
                var dropH = 420;
                if (rect.bottom + dropH + 10 > window.innerHeight) {
                    drop.style.top = (rect.top - dropH - 8) + 'px';
                } else {
                    drop.style.top = (rect.bottom + 8) + 'px';
                }
                drop.style.left = rect.left + 'px';
                drop.style.width = '320px';
                drop.style.zIndex = '10001';
                renderDpCalendar(document.getElementById('dpEndCal'), dpEndState);
            }
            dpEndState._open = !wasOpen;
        });

        var observer = new MutationObserver(function () {
            if (!document.querySelector('.prem-modal-close-days')) {
                document.getElementById('dpStart').classList.remove('open');
                document.getElementById('dpStartDrop').style.display = 'none';
                document.getElementById('dpEnd').classList.remove('open');
                document.getElementById('dpEndDrop').style.display = 'none';
                observer.disconnect();
            }
        });
        observer.observe(document.getElementById('modal'), { childList: true, subtree: true });

        el('confirmCloseDays').addEventListener('click', function () {
            var startDate = dpStartState.start ? formatDate(dpStartState.start) : '';
            var endDate = dpEndState.end ? formatDate(dpEndState.end) : (dpStartState.start ? formatDate(dpStartState.start) : '');
            var reason = el('closeReason').value.trim() || 'Cerrado';
            var staffId = el('closeStaff').value;

            if (!startDate || !endDate) {
                toast('Selecciona las fechas', 'error');
                return;
            }
            if (startDate > endDate) {
                toast('La fecha de fin debe ser posterior', 'error');
                return;
            }

            addClosedDay({ startDate: startDate, endDate: endDate }, reason, staffId);
            toast('Días cerrados correctamente', 'success');
            closeModal();
            data = getData();
            renderAll();
        });
    }

    renderAll();
}

function viewAppointment(apptId, afterClose) {
    var data = getData();
    var appt = null;
    (data.appointments || []).forEach(function (a) { if (a.id === apptId) appt = a; });
    if (!appt) return;
    var svc = getService(appt.serviceId);
    var staff = getStaffById(appt.staffId);

    var statusOpts = '';
    Object.keys(STATUS_LABELS_ADMIN).forEach(function (s) {
        statusOpts += '<option value="' + s + '"' + (appt.status === s ? ' selected' : '') + '>' + STATUS_LABELS_ADMIN[s] + '</option>';
    });

    openModal('Detalle de cita',
        '<div class="booking-summary">' +
        '<div class="summary-row"><span>Cliente</span><span>' + appt.clientName + '</span></div>' +
        (appt.clientPhone ? '<div class="summary-row"><span>Teléfono</span><span>' + appt.clientPhone + '</span></div>' : '') +
        '<div class="summary-row"><span>Servicio</span><span>' + (svc ? svc.name : '—') + '</span></div>' +
        '<div class="summary-row"><span>Profesional</span><span>' + (staff ? staff.name : '—') + '</span></div>' +
        '<div class="summary-row"><span>Fecha</span><span>' + fmtDateLong(appt.date) + '</span></div>' +
        '<div class="summary-row"><span>Hora</span><span>' + appt.startTime + ' - ' + appt.endTime + '</span></div>' +
        '<div class="summary-row"><span>Precio</span><span>' + formatMoney(svc ? svc.price : 0) + '</span></div></div>' +
        '<div class="form-group"><label>Estado</label><select id="apptStatus">' + statusOpts + '</select></div>',
        '<button class="btn btn-ghost" data-close>Cerrar</button><button class="btn btn-primary" id="saveApptStatus">Guardar</button>');

    el('saveApptStatus').addEventListener('click', function () {
        appt.status = el('apptStatus').value;
        saveData();
        toast('Estado actualizado', 'success');
        closeModal();
        if (afterClose) afterClose();
    });
}

// ==================== HORARIOS ====================
function viewSchedule(container) {
    var staffList = getStaff();
    var activeStaffId = staffList.length ? staffList[0].id : null;
    var hasChanges = false;
    var timePickers = {};

    function renderTab(staffId) {
        activeStaffId = staffId;
        hasChanges = false;
        var staff = getStaffById(staffId);
        var staffName = staff ? staff.name : staffId;
        var cfg = getScheduleForStaff(staffId);

        // Staff tabs
        var tabsHtml = '';
        for (var i = 0; i < staffList.length; i++) {
            var s = staffList[i];
            var isActive = s.id === staffId;
            tabsHtml += '<div class="prem-staff-tab' + (isActive ? ' active' : '') + '" data-sched-staff="' + s.id + '">' +
                '<div class="prem-staff-tab-avatar ' + s.role + '">' + initials(s.name) + '</div>' +
                '<div class="prem-staff-tab-info">' +
                '<div class="prem-staff-tab-name">' + s.name + '</div>' +
                '<div class="prem-staff-tab-role">' + ROLE_LABELS[s.role] + '</div>' +
                '</div></div>';
        }

        // Day rows
        var daysHtml = '';
        for (var d = 0; d < 7; d++) {
            var dayCfg = cfg[d];
            var isClosed = dayCfg.closed;
            var hasMorning = dayCfg.morning && dayCfg.morning.open && dayCfg.morning.close;
            var hasAfternoon = dayCfg.afternoon && dayCfg.afternoon.open && dayCfg.afternoon.close;

            daysHtml += '<div class="prem-day-row' + (isClosed ? ' closed' : '') + '" data-day-row="' + d + '">' +
                
                '<div class="prem-day-info">' +
                '<span class="prem-day-name">' + DAY_NAMES[d] + '</span>' +
                '<label class="prem-day-toggle">' +
                '<input type="checkbox" data-day-closed="' + d + '"' + (isClosed ? ' checked' : '') + '>' +
                '<span class="slider"></span>' +
                '</label>' +
                '<span class="prem-day-status ' + (isClosed ? 'closed' : 'open') + '" data-day-label="' + d + '">' + (isClosed ? 'Cerrado' : 'Abierto') + '</span>' +
                '</div>' +

                '<div class="prem-day-periods">' +

                // Mañana
                '<div class="prem-period">' +
                '<div class="prem-period-label morning">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>' +
                'Mañana' +
                '</div>' +
                '<div class="prem-period-times">' +
                '<div id="tp_morning_open_' + d + '"></div>' +
                '<span class="prem-period-separator">a</span>' +
                '<div id="tp_morning_close_' + d + '"></div>' +
                '</div></div>' +

                // Tarde
                '<div class="prem-period">' +
                '<div class="prem-period-label afternoon">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>' +
                'Tarde' +
                '</div>' +
                '<div class="prem-period-times">' +
                '<div id="tp_afternoon_open_' + d + '"></div>' +
                '<span class="prem-period-separator">a</span>' +
                '<div id="tp_afternoon_close_' + d + '"></div>' +
                '</div></div>' +

                '</div>' +
                '</div>';
        }

        container.innerHTML = '<div class="prem-schedule">' +

            '<div class="prem-schedule-header">' +
            '<div>' +
            '<h1>Horarios</h1>' +
            '<p>Define la jornada partida de cada profesional individualmente</p>' +
            '</div>' +
            '<div class="prem-schedule-save">' +
            '<span class="save-status" id="saveStatus"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Sin cambios</span>' +
            '<button class="btn btn-primary" id="saveScheduleBtn">Guardar horarios</button>' +
            '</div>' +
            '</div>' +

            '<div class="prem-staff-tabs">' + tabsHtml + '</div>' +

            '<div class="prem-schedule-card">' +
            '<div class="prem-schedule-card-header">' +
            '<div class="prem-schedule-card-title">' +
            '<h2>Horario de ' + staffName + '</h2>' +
            '<span class="role-badge">' + ROLE_LABELS[staff.role] + '</span>' +
            '</div>' +
            '<div class="prem-schedule-legend">' +
            '<div class="prem-legend-item"><div class="prem-legend-dot morning"></div> Mañana</div>' +
            '<div class="prem-legend-item"><div class="prem-legend-dot afternoon"></div> Tarde</div>' +
            '<div class="prem-legend-item"><div class="prem-legend-dot closed"></div> Cerrado</div>' +
            '</div>' +
            '</div>' +

            '<div class="prem-day-list">' + daysHtml + '</div>' +

            '<div class="prem-quick-schedule">' +
            '<button class="prem-quick-schedule-btn" data-apply-template="standard">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>' +
            'Aplicar horario estándar' +
            '</button>' +
            '<button class="prem-quick-schedule-btn" data-apply-template="morning">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/></svg>' +
            'Solo mañana' +
            '</button>' +
            '<button class="prem-quick-schedule-btn" data-apply-template="full">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' +
            'Jornada completa' +
            '</button>' +
            '</div>' +

            '</div>' +
            '</div>';

        // Initialize time pickers
        initTimePickers(cfg);
        bindEvents();
    }

    function initTimePickers(cfg) {
        timePickers = {};
        
        for (var d = 0; d < 7; d++) {
            var dayCfg = cfg[d];
            var isClosed = dayCfg.closed;
            var hasMorning = dayCfg.morning && dayCfg.morning.open && dayCfg.morning.close;
            var hasAfternoon = dayCfg.afternoon && dayCfg.afternoon.open && dayCfg.afternoon.close;
            
            // Morning open
            var morningOpenContainer = document.getElementById('tp_morning_open_' + d);
            if (morningOpenContainer) {
                timePickers['morning_open_' + d] = TimePicker.create(morningOpenContainer, {
                    value: hasMorning ? dayCfg.morning.open : '',
                    id: 'tp_morning_open_' + d,
                    disabled: isClosed,
                    onChange: function(time) { markChanged(); }
                });
            }
            
            // Morning close
            var morningCloseContainer = document.getElementById('tp_morning_close_' + d);
            if (morningCloseContainer) {
                timePickers['morning_close_' + d] = TimePicker.create(morningCloseContainer, {
                    value: hasMorning ? dayCfg.morning.close : '',
                    id: 'tp_morning_close_' + d,
                    disabled: isClosed,
                    onChange: function(time) { markChanged(); }
                });
            }
            
            // Afternoon open
            var afternoonOpenContainer = document.getElementById('tp_afternoon_open_' + d);
            if (afternoonOpenContainer) {
                timePickers['afternoon_open_' + d] = TimePicker.create(afternoonOpenContainer, {
                    value: hasAfternoon ? dayCfg.afternoon.open : '',
                    id: 'tp_afternoon_open_' + d,
                    disabled: isClosed,
                    onChange: function(time) { markChanged(); }
                });
            }
            
            // Afternoon close
            var afternoonCloseContainer = document.getElementById('tp_afternoon_close_' + d);
            if (afternoonCloseContainer) {
                timePickers['afternoon_close_' + d] = TimePicker.create(afternoonCloseContainer, {
                    value: hasAfternoon ? dayCfg.afternoon.close : '',
                    id: 'tp_afternoon_close_' + d,
                    disabled: isClosed,
                    onChange: function(time) { markChanged(); }
                });
            }
        }
    }

    function getTimePickerValue(day, period, type) {
        var pickerId = period + '_' + type + '_' + day;
        var container = document.getElementById('tp_' + pickerId);
        if (!container) return '';
        var display = container.querySelector('[data-tp-display]');
        return display && !display.classList.contains('empty') ? display.textContent : '';
    }

    function setTimePickerValue(day, period, type, value) {
        var pickerId = period + '_' + type + '_' + day;
        var container = document.getElementById('tp_' + pickerId);
        if (!container) return;
        var display = container.querySelector('[data-tp-display]');
        if (display) {
            if (value) {
                display.textContent = value;
                display.classList.remove('empty');
            } else {
                display.textContent = '--:--';
                display.classList.add('empty');
            }
        }
    }

    function markChanged() {
        hasChanges = true;
        var status = el('saveStatus');
        if (status) {
            status.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Cambios pendientes';
            status.style.color = '#d97706';
        }
    }

    function bindEvents() {
        // Staff tabs
        container.querySelectorAll('[data-sched-staff]').forEach(function (tab) {
            tab.addEventListener('click', function () { renderTab(tab.dataset.schedStaff); });
        });

        // Closed toggles
        container.querySelectorAll('[data-day-closed]').forEach(function (cb) {
            cb.addEventListener('change', function () {
                var d = cb.dataset.dayClosed;
                var closed = cb.checked;
                var row = container.querySelector('[data-day-row="' + d + '"]');
                var label = container.querySelector('[data-day-label="' + d + '"]');
                
                if (label) {
                    label.textContent = closed ? 'Cerrado' : 'Abierto';
                    label.className = 'prem-day-status ' + (closed ? 'closed' : 'open');
                }
                
                if (row) {
                    row.classList.toggle('closed', closed);
                    // Toggle time pickers
                    ['tp_morning_open_', 'tp_morning_close_', 'tp_afternoon_open_', 'tp_afternoon_close_'].forEach(function(prefix) {
                        var el = document.getElementById(prefix + d);
                        if (el) {
                            var input = el.querySelector('.tp-input');
                            if (input) input.classList.toggle('disabled', closed);
                        }
                    });
                }
                
                markChanged();
            });
        });

        // Save button
        el('saveScheduleBtn').addEventListener('click', function () {
            var newWeek = {};
            for (var d = 0; d < 7; d++) {
                var closed = container.querySelector('[data-day-closed="' + d + '"]').checked;
                var morningOpen = getTimePickerValue(d, 'morning', 'open');
                var morningClose = getTimePickerValue(d, 'morning', 'close');
                var afternoonOpen = getTimePickerValue(d, 'afternoon', 'open');
                var afternoonClose = getTimePickerValue(d, 'afternoon', 'close');
                
                newWeek[d] = {
                    morning: { open: morningOpen, close: morningClose },
                    afternoon: { open: afternoonOpen, close: afternoonClose },
                    closed: closed
                };
            }
            setStaffSchedule(activeStaffId, newWeek);
            
            hasChanges = false;
            var status = el('saveStatus');
            if (status) {
                status.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Guardado';
                status.style.color = '#16a34a';
            }
            
            toast('Horario de ' + staffName + ' guardado', 'success');
        });

        // Quick templates
        container.querySelectorAll('[data-apply-template]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var template = btn.dataset.applyTemplate;
                applyTemplate(template);
                markChanged();
            });
        });
    }

    function applyTemplate(template) {
        for (var d = 0; d < 7; d++) {
            var closed = container.querySelector('[data-day-closed="' + d + '"]');
            
            if (d === 0) {
                // Domingo: cerrado
                closed.checked = true;
                closed.dispatchEvent(new Event('change'));
                continue;
            }
            
            closed.checked = false;
            closed.dispatchEvent(new Event('change'));
            
            switch (template) {
                case 'standard':
                    if (d === 6) {
                        // Sábado: solo mañana
                        setTimePickerValue(d, 'morning', 'open', '09:00');
                        setTimePickerValue(d, 'morning', 'close', '14:00');
                        setTimePickerValue(d, 'afternoon', 'open', '');
                        setTimePickerValue(d, 'afternoon', 'close', '');
                    } else {
                        // Lunes a viernes: jornada partida
                        setTimePickerValue(d, 'morning', 'open', '09:00');
                        setTimePickerValue(d, 'morning', 'close', '14:00');
                        setTimePickerValue(d, 'afternoon', 'open', '16:30');
                        setTimePickerValue(d, 'afternoon', 'close', '20:00');
                    }
                    break;
                case 'morning':
                    setTimePickerValue(d, 'morning', 'open', '09:00');
                    setTimePickerValue(d, 'morning', 'close', '14:00');
                    setTimePickerValue(d, 'afternoon', 'open', '');
                    setTimePickerValue(d, 'afternoon', 'close', '');
                    break;
                case 'full':
                    setTimePickerValue(d, 'morning', 'open', '08:00');
                    setTimePickerValue(d, 'morning', 'close', '14:00');
                    setTimePickerValue(d, 'afternoon', 'open', '15:00');
                    setTimePickerValue(d, 'afternoon', 'close', '21:00');
                    break;
            }
        }
    }

    renderTab(activeStaffId);
}