// admin-agenda.js - Agenda con calendario y gestión de citas
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

    function csVal(id) {
        var d = document.getElementById(id);
        return d ? (d.dataset.csValue || 'all') : 'all';
    }

    function renderAll() {
        var role = csVal('filterRole');
        var staffId = csVal('filterStaff');
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
        html += '<div class="cs-dropdown" id="filterRole" data-cs-value="all"></div></div>';
        html += '<div class="prem-filter-select"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
        html += '<div class="cs-dropdown" id="filterStaff" data-cs-value="all"></div></div></div>';

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

        // Filters - custom dropdowns
        var roleOpts = [
            { value: 'all', label: 'Todos los profesionales' },
            { value: 'hair', label: 'Barbería' },
            { value: 'beauty', label: 'Estética' }
        ];
        csDropdown('filterRole', roleOpts, role, {
            onChange: function (v) {
                document.getElementById('filterRole').dataset.csValue = v;
                renderAll();
            }
        });
        var staffOpts = [{ value: 'all', label: 'Todos los empleados' }];
        (data.staff || []).forEach(function (s) {
            staffOpts.push({ value: s.id, label: s.name });
        });
        csDropdown('filterStaff', staffOpts, staffId, {
            onChange: function (v) {
                document.getElementById('filterStaff').dataset.csValue = v;
                renderAll();
            }
        });

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
        bodyHtml += '<select class="prem-form-select" id="closeStaff" style="display:none;">';
        bodyHtml += '<option value="all">Todos los profesionales</option>';
        staffList.forEach(function (s) {
            bodyHtml += '<option value="' + s.id + '">' + s.name + ' (' + ROLE_LABELS[s.role] + ')</option>';
        });
        bodyHtml += '</select>';
        bodyHtml += '<div class="cs-dropdown cs-form" id="closeStaffCs" data-cs-value="all"></div>';
        bodyHtml += '</div>';

        bodyHtml += '</div></div>';

        var footerHtml = '<button class="btn btn-ghost" data-close>Cancelar</button>';
        footerHtml += '<button class="btn btn-primary" id="confirmCloseDays">Cerrar días</button>';

        openModal('Cerrar días', bodyHtml, footerHtml, { wide: true });

        renderDpCalendar(document.getElementById('dpStartCal'), dpStartState);
        renderDpCalendar(document.getElementById('dpEndCal'), dpEndState);

        var closeStaffOpts = [{ value: 'all', label: 'Todos los profesionales' }];
        staffList.forEach(function (s) {
            closeStaffOpts.push({ value: s.id, label: s.name + ' (' + ROLE_LABELS[s.role] + ')' });
        });
        csDropdown('closeStaffCs', closeStaffOpts, 'all', {
            onChange: function (v) {
                document.getElementById('closeStaff').value = v;
            }
        });

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

    var statusOptsHtml = '<select id="apptStatus" style="display:none;">';
    Object.keys(STATUS_LABELS_ADMIN).forEach(function (s) {
        statusOptsHtml += '<option value="' + s + '"' + (appt.status === s ? ' selected' : '') + '>' + STATUS_LABELS_ADMIN[s] + '</option>';
    });
    statusOptsHtml += '</select><div class="cs-dropdown cs-form" id="apptStatusCs" data-cs-value="' + appt.status + '"></div>';

    openModal('Detalle de cita',
        '<div class="booking-summary">' +
        '<div class="summary-row"><span>Cliente</span><span>' + appt.clientName + '</span></div>' +
        (appt.clientPhone ? '<div class="summary-row"><span>Teléfono</span><span>' + appt.clientPhone + '</span></div>' : '') +
        '<div class="summary-row"><span>Servicio</span><span>' + (svc ? svc.name : '—') + '</span></div>' +
        '<div class="summary-row"><span>Profesional</span><span>' + (staff ? staff.name : '—') + '</span></div>' +
        '<div class="summary-row"><span>Fecha</span><span>' + fmtDateLong(appt.date) + '</span></div>' +
        '<div class="summary-row"><span>Hora</span><span>' + appt.startTime + ' - ' + appt.endTime + '</span></div>' +
        '<div class="summary-row"><span>Precio</span><span>' + formatMoney(svc ? svc.price : 0) + '</span></div></div>' +
        '<div class="form-group"><label>Estado</label>' + statusOptsHtml + '</div>',
        '<button class="btn btn-ghost" data-close>Cerrar</button><button class="btn btn-primary" id="saveApptStatus">Guardar</button>');

    var apptStatusCsOpts = [];
    Object.keys(STATUS_LABELS_ADMIN).forEach(function (s) {
        apptStatusCsOpts.push({ value: s, label: STATUS_LABELS_ADMIN[s] });
    });
    csDropdown('apptStatusCs', apptStatusCsOpts, appt.status, {
        onChange: function (v) {
            document.getElementById('apptStatus').value = v;
        }
    });

    el('saveApptStatus').addEventListener('click', function () {
        appt.status = el('apptStatus').value;
        saveData();
        toast('Estado actualizado', 'success');
        closeModal();
        if (afterClose) afterClose();
    });
}
