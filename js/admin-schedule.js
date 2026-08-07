// admin-schedule.js - Gestión de horarios por profesional

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