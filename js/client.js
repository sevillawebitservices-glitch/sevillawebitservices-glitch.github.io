// client.js - Reserva estilo Fresha.

function freeSlotsForStaff(staffId, dateStr, durMin, stepMin) {
    return getAllFreeSlotsForStaff(staffId, dateStr, durMin, stepMin);
}

function countFreeSlotsForStaff(staffId, dateStr, durMin, stepMin) {
    return freeSlotsForStaff(staffId, dateStr, durMin, stepMin).length;
}

function renderClientBookingView(opts) {
    var data = getData();
    var services = getServices();
    var user = getCurrentUser();

    if (!services.length) {
        render('<section class="section"><div class="container"><div class="empty-state"><h3>No hay servicios disponibles</h3><p>El administrador aún no ha añadido servicios.</p></div></div></section>');
        return;
    }

    var preService = opts && opts.preService;
    var selectedService = preService ? services.filter(function (s) { return s.id === preService; })[0] : null;
    var selectedStaff = null;
    var selectedDate = null;
    var selectedTime = null;
    var calMonth = new Date().getMonth();
    var calYear = new Date().getFullYear();

    render('<section class="fresha-booking"><div id="bookingBody"></div></section>');
    var body = el('bookingBody');

    function renderAll() {
        if (!selectedService) {
            renderServiceList();
        } else if (!selectedStaff) {
            renderStaffPicker();
        } else if (!selectedDate) {
            renderDateTimePicker();
        } else if (selectedTime === null) {
            renderDateTimePicker();
        } else {
            renderConfirmation();
        }
    }

    function renderServiceList() {
        var hair = services.filter(function (s) { return s.category === 'hair'; });
        var beauty = services.filter(function (s) { return s.category === 'beauty'; });

        var html = '<div class="fl-header">';
        html += '<button class="fl-back" data-go-home>&larr;</button>';
        html += '<h1>Servicios</h1>';
        html += '<div></div>';
        html += '</div>';

        html += '<div class="fl-search"><input type="text" placeholder="Buscar servicios" id="serviceSearch"></div>';

        if (user) {
            var myAppts = (data.appointments || []).filter(function (a) {
                return (a.clientName === user.name || a.clientPhone === user.phone) &&
                       a.status !== 'cancelled';
            }).sort(function (a, b) {
                return (b.date + b.startTime).localeCompare(a.date + a.startTime);
            });

            if (myAppts.length) {
                var last = myAppts[0];
                var lastSvc = getService(last.serviceId);
                var lastStaff = getStaffById(last.staffId);
                if (lastSvc) {
                    html += '<div class="fl-section">';
                    html += '<div class="fl-section-title">Recomendado para ti</div>';
                    html += '<div class="fl-recommended" data-recommend="' + lastSvc.id + '" data-recommend-staff="' + (lastStaff ? lastStaff.id : '') + '">';
                    html += '<div class="fl-rec-content">';
                    html += '<div class="fl-rec-icon">&#9733;</div>';
                    html += '<div class="fl-rec-info">';
                    html += '<div class="fl-rec-label">Tu &uacute;ltimo servicio</div>';
                    html += '<div class="fl-rec-name">' + lastSvc.name + '</div>';
                    html += '<div class="fl-rec-meta">' + lastSvc.duration + ' min &middot; ' + formatMoney(lastSvc.price) + (lastStaff ? ' &middot; con ' + lastStaff.name : '') + '</div>';
                    html += '</div></div>';
                    html += '<button class="fl-rec-btn" data-recommend="' + lastSvc.id + '" data-recommend-staff="' + (lastStaff ? lastStaff.id : '') + '">Reservar de nuevo</button>';
                    html += '</div></div>';
                }
            }
        }

        if (hair.length) {
            html += '<div class="fl-section">';
            html += '<div class="fl-section-title">Barber&iacute;a</div>';
            hair.forEach(function (s) { html += serviceRow(s); });
            html += '</div>';
        }

        if (beauty.length) {
            html += '<div class="fl-section">';
            html += '<div class="fl-section-title">Est&eacute;tica</div>';
            beauty.forEach(function (s) { html += serviceRow(s); });
            html += '</div>';
        }

        html += '</div>';
        body.innerHTML = html;

        var searchInput = el('serviceSearch');
        if (searchInput) {
            searchInput.addEventListener('input', function () {
                var q = this.value.toLowerCase();
                var cards = body.querySelectorAll('.fl-service-row');
                cards.forEach(function (c) {
                    c.style.display = c.textContent.toLowerCase().indexOf(q) > -1 ? '' : 'none';
                });
            });
        }

        body.querySelectorAll('[data-recommend]').forEach(function (b) {
            b.addEventListener('click', function () {
                var svcId = b.getAttribute('data-recommend');
                var staffId = b.getAttribute('data-recommend-staff');
                for (var i = 0; i < services.length; i++) {
                    if (services[i].id === svcId) { selectedService = services[i]; break; }
                }
                if (staffId) {
                    var allStaff = getStaff();
                    for (var j = 0; j < allStaff.length; j++) {
                        if (allStaff[j].id === staffId) { selectedStaff = allStaff[j]; break; }
                    }
                }
                selectedDate = null;
                selectedTime = null;
                renderAll();
            });
        });

        body.querySelectorAll('[data-pick-service]').forEach(function (b) {
            b.addEventListener('click', function () {
                var id = b.getAttribute('data-pick-service');
                for (var i = 0; i < services.length; i++) {
                    if (services[i].id === id) { selectedService = services[i]; break; }
                }
                selectedStaff = null;
                selectedDate = null;
                selectedTime = null;
                renderAll();
            });
        });

        body.querySelectorAll('[data-go-home]').forEach(function (b) {
            b.addEventListener('click', function () { go('home'); });
        });
    }

    function serviceRow(s) {
        return '<div class="fl-service-row" data-pick-service="' + s.id + '">' +
            '<div class="fl-service-info">' +
            '<div class="fl-service-name">' + s.name + '</div>' +
            '<div class="fl-service-meta">' + s.duration + ' min</div>' +
            '</div>' +
            '<div class="fl-service-right">' +
            '<div class="fl-service-price">' + formatMoney(s.price) + '</div>' +
            '<button class="fl-reserve-btn">Reservar</button>' +
            '</div>' +
            '</div>';
    }

    function renderStaffPicker() {
        var allStaff = getStaff();
        var staffForService = allStaff.filter(function (s) {
            return s.role === selectedService.category;
        });
        if (!staffForService.length) staffForService = allStaff;

        var html = '<div class="fl-header">';
        html += '<button class="fl-back" data-back-services>&larr;</button>';
        html += '<h1>Seleccionar profesional</h1>';
        html += '<div></div>';
        html += '</div>';

        html += '<div class="fl-staff-list">';
        staffForService.forEach(function (s) {
            var roleLabel = ROLE_LABELS[s.role] || s.role;
            var avatarHtml;
            if (s.photo) {
                avatarHtml = '<img src="' + s.photo + '" alt="' + s.name + '" class="fl-staff-photo">';
            } else {
                avatarHtml = '<div class="fl-staff-avatar">' + initials(s.name) + '</div>';
            }
            html += '<button class="fl-staff-row" data-pick-staff="' + s.id + '">' +
                avatarHtml +
                '<div class="fl-staff-info">' +
                '<div class="fl-staff-name">' + s.name + '</div>' +
                '<div class="fl-staff-role">' + roleLabel + '</div>' +
                '</div>' +
                '<div class="fl-staff-arrow">&rsaquo;</div>' +
                '</button>';
        });
        html += '</div>';
        body.innerHTML = html;

        body.querySelectorAll('[data-pick-staff]').forEach(function (b) {
            b.addEventListener('click', function () {
                var id = b.getAttribute('data-pick-staff');
                for (var i = 0; i < allStaff.length; i++) {
                    if (allStaff[i].id === id) { selectedStaff = allStaff[i]; break; }
                }
                selectedDate = null;
                selectedTime = null;
                renderAll();
            });
        });

        body.querySelectorAll('[data-back-services]').forEach(function (b) {
            b.addEventListener('click', function () {
                selectedService = null;
                renderAll();
            });
        });
    }

    function renderDateTimePicker() {
        var dur = selectedService.duration;
        var step = selectedService.step || dur;
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        var firstDay = new Date(calYear, calMonth, 1);
        var startDow = firstDay.getDay();
        startDow = startDow === 0 ? 6 : startDow - 1;
        var daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

        var html = '<div class="fl-header">';
        html += '<button class="fl-back" data-back-staff>&larr;</button>';
        html += '<h1>' + selectedService.name + ' con ' + selectedStaff.name + '</h1>';
        html += '<div></div>';
        html += '</div>';

        html += '<div class="fl-calendar">';
        html += '<div class="fl-cal-nav">';
        html += '<span class="fl-cal-month">' + MONTHS[calMonth] + ' ' + calYear + '</span>';
        html += '<div class="fl-cal-arrows">';
        html += '<button class="fl-cal-arrow" data-cal-prev>&lsaquo;</button>';
        html += '<button class="fl-cal-arrow" data-cal-next>&rsaquo;</button>';
        html += '</div></div>';

        html += '<div class="fl-cal-grid">';
        var dowShort = ['Lun', 'Mar', 'Mi\u00e9', 'Jue', 'Vie', 'S\u00e1b', 'Dom'];
        dowShort.forEach(function (d) { html += '<div class="fl-cal-dow">' + d + '</div>'; });
        for (var p = 0; p < startDow; p++) html += '<div class="fl-cal-day empty"></div>';

        for (var day = 1; day <= daysInMonth; day++) {
            var cellDate = new Date(calYear, calMonth, day);
            var dateStr = formatDate(cellDate);
            var isPast = cellDate < today;
            var isToday = cellDate.getTime() === today.getTime();
            var dayOfWeek = cellDate.getDay();
            var dayCfg = getScheduleForStaff(selectedStaff.id)[dayOfWeek];
            var isOpen = dayCfg && !dayCfg.closed && !isPast;
            var freeCount = isOpen ? countFreeSlotsForStaff(selectedStaff.id, dateStr, dur, step) : 0;
            var hasSlots = freeCount > 0;
            var sel = selectedDate === dateStr ? ' selected' : '';

            var cls = 'fl-cal-day';
            if (isPast || !isOpen) cls += ' disabled';
            if (isToday) cls += ' today';
            if (hasSlots) cls += ' available';
            if (sel) cls += sel;

            var dot = '';
            if (hasSlots) dot = '<span class="fl-cal-dot"></span>';
            else if (isOpen) dot = '<span class="fl-cal-dot orange"></span>';

            html += '<button class="' + cls + '" data-cal-day="' + dateStr + '"' + (isPast || !isOpen ? ' disabled' : '') + '>' +
                '<span>' + day + '</span>' + dot + '</button>';
        }
        html += '</div></div>';

        if (selectedDate) {
            var slots = freeSlotsForStaff(selectedStaff.id, selectedDate, dur, step);
            var morningSlots = slots.filter(function (t) { return t < 14 * 60; });
            var afternoonSlots = slots.filter(function (t) { return t >= 14 * 60; });
            
            html += '<div class="fl-times">';
            
            // Mañana
            if (morningSlots.length) {
                html += '<div class="fl-times-section">';
                html += '<div class="fl-times-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;display:inline;vertical-align:middle;margin-right:6px;"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> Mañana</div>';
                html += '<div class="fl-times-grid">';
                morningSlots.forEach(function (t) {
                    var selCls = selectedTime === t ? ' selected' : '';
                    html += '<button class="fl-time-pill' + selCls + '" data-pick-time="' + t + '">' + minToTime(t) + '</button>';
                });
                html += '</div></div>';
            }
            
            // Tarde
            if (afternoonSlots.length) {
                html += '<div class="fl-times-section">';
                html += '<div class="fl-times-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;display:inline;vertical-align:middle;margin-right:6px;"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg> Tarde</div>';
                html += '<div class="fl-times-grid">';
                afternoonSlots.forEach(function (t) {
                    var selCls = selectedTime === t ? ' selected' : '';
                    html += '<button class="fl-time-pill' + selCls + '" data-pick-time="' + t + '">' + minToTime(t) + '</button>';
                });
                html += '</div></div>';
            }
            
            if (!slots.length) {
                html += '<div style="padding:24px;text-align:center;color:var(--gray-500);">No hay huecos este día</div>';
            }
            html += '</div>';
        }

        html += '<div class="fl-bottom-bar">';
        html += '<div class="fl-bottom-info">';
        html += '<div class="fl-bottom-service">' + selectedService.name + ' &middot; ' + selectedStaff.name + '</div>';
        html += '<div class="fl-bottom-price">' + formatMoney(selectedService.price) + '</div>';
        html += '</div>';
        html += '<button class="fl-continue-btn" id="flContinue"' + (!selectedDate || selectedTime === null ? ' disabled' : '') + '>Continuar</button>';
        html += '</div>';

        body.innerHTML = html;

        body.querySelectorAll('[data-cal-prev]').forEach(function (b) {
            b.addEventListener('click', function () {
                calMonth--;
                if (calMonth < 0) { calMonth = 11; calYear--; }
                renderAll();
            });
        });
        body.querySelectorAll('[data-cal-next]').forEach(function (b) {
            b.addEventListener('click', function () {
                calMonth++;
                if (calMonth > 11) { calMonth = 0; calYear++; }
                renderAll();
            });
        });

        body.querySelectorAll('[data-cal-day]').forEach(function (b) {
            if (!b.disabled) {
                b.addEventListener('click', function () {
                    selectedDate = b.getAttribute('data-cal-day');
                    selectedTime = null;
                    renderAll();
                });
            }
        });

        body.querySelectorAll('[data-pick-time]').forEach(function (b) {
            b.addEventListener('click', function () {
                selectedTime = parseInt(b.getAttribute('data-pick-time'));
                renderAll();
            });
        });

        body.querySelectorAll('[data-back-staff]').forEach(function (b) {
            b.addEventListener('click', function () {
                selectedStaff = null;
                selectedDate = null;
                selectedTime = null;
                renderAll();
            });
        });

        var continueBtn = el('flContinue');
        if (continueBtn) {
            continueBtn.addEventListener('click', function () {
                if (selectedDate && selectedTime !== null) renderAll();
            });
        }
    }

    function renderConfirmation() {
        var end = selectedTime + selectedService.duration;
        var addr = 'Calle Parroco Don Juan Cot\u00e1n, 41960, Gines';

        var html = '<div class="fl-header">';
        html += '<button class="fl-back" data-back-datetime>&larr;</button>';
        html += '<h1>Revisar y confirmar</h1>';
        html += '<div></div>';
        html += '</div>';

        html += '<div class="fl-confirm">';
        html += '<div class="fl-confirm-datetime">' + fmtDateLong(selectedDate) + ' &middot; ' + minToTime(selectedTime) + '</div>';
        html += '<div class="fl-confirm-address">Barber&iacute;a Toni &middot; ' + addr + '</div>';

        html += '<div class="fl-confirm-card">';
        html += '<div class="fl-confirm-row">';
        html += '<div><div class="fl-confirm-service">' + selectedService.name + '</div>';
        html += '<div class="fl-confirm-staff">' + selectedStaff.name + '</div></div>';
        html += '<div class="fl-confirm-right">';
        html += '<div class="fl-confirm-price">' + formatMoney(selectedService.price) + '</div>';
        html += '<div class="fl-confirm-time">' + minToTime(selectedTime) + ' - ' + minToTime(end) + '</div>';
        html += '</div></div>';
        html += '<div class="fl-confirm-divider"></div>';
        html += '<div class="fl-confirm-subtotal">';
        html += '<span>Subtotal</span><span>' + formatMoney(selectedService.price) + '</span>';
        html += '</div></div>';

        html += '<div class="fl-confirm-notice">';
        html += '<div class="fl-confirm-notice-title">Asegura tu lugar ahora, paga despu&eacute;s</div>';
        html += '<div class="fl-confirm-notice-text">Confirma tu reserva ahora y paga una vez completado tu servicio.</div>';
        html += '</div>';
        html += '</div>';

        html += '<div class="fl-bottom-bar">';
        html += '<div class="fl-bottom-info">';
        html += '<div class="fl-bottom-detail">' + selectedService.duration + ' min</div>';
        html += '<div class="fl-bottom-price">' + formatMoney(selectedService.price) + '</div>';
        html += '</div>';
        html += '<button class="fl-continue-btn" id="flConfirmBtn">Confirmar</button>';
        html += '</div>';

        body.innerHTML = html;

        body.querySelectorAll('[data-back-datetime]').forEach(function (b) {
            b.addEventListener('click', function () {
                selectedDate = null;
                selectedTime = null;
                renderAll();
            });
        });

        el('flConfirmBtn').addEventListener('click', function () {
            getData().appointments.push({
                id: uid(),
                clientName: user ? user.name : 'Cliente',
                clientPhone: user ? user.phone : '',
                serviceId: selectedService.id,
                staffId: selectedStaff.id,
                date: selectedDate,
                startTime: minToTime(selectedTime),
                endTime: minToTime(end),
                status: 'confirmed'
            });
            saveData();
            toast('Cita reservada. \u00a1Te esperamos!', 'success');
            if (typeof launchConfetti === 'function') launchConfetti();

            body.innerHTML = '<div class="fl-success">' +
                '<div class="fl-success-icon">\u2713</div>' +
                '<h2>Reserva confirmada</h2>' +
                '<p>' + selectedService.name + ' con ' + selectedStaff.name + '</p>' +
                '<p class="fl-success-date">' + fmtDateLong(selectedDate) + ' a las ' + minToTime(selectedTime) + '</p>' +
                '<div class="fl-success-actions">' +
                '<button class="btn btn-primary" data-nav="booking">Hacer otra reserva</button>' +
                '<button class="btn btn-outline" data-nav="appointments">Ver mis citas</button>' +
                '</div></div>';

            body.querySelectorAll('[data-nav]').forEach(function (b) {
                b.addEventListener('click', function () { go(b.getAttribute('data-nav')); });
            });
        });
    }

    renderAll();
}

function renderMyAppointments() {
    var user = getCurrentUser();
    var data = getData();
    var appointments = (data.appointments || []).filter(function (a) {
        if (!user) return false;
        return a.clientName === user.name || a.clientPhone === user.phone;
    }).sort(function (a, b) {
        return (b.date + b.startTime).localeCompare(a.date + a.startTime);
    });

    var statusLabels = { confirmed: 'Confirmada', pending: 'Pendiente', cancelled: 'Cancelada', completed: 'Completada' };
    var listHtml = '';
    if (appointments.length) {
        appointments.forEach(function (a) {
            var svc = getService(a.serviceId);
            var staff = getStaffById(a.staffId);
            listHtml += '<div class="fl-service-row">' +
                '<div class="fl-service-info">' +
                '<div class="fl-service-name">' + (svc ? svc.name : 'Servicio') + '</div>' +
                '<div class="fl-service-meta">' + fmtDateLong(a.date) + ' &middot; ' + a.startTime + ' - ' + a.endTime + (staff ? ' &middot; ' + staff.name : '') + '</div>' +
                '</div>' +
                '<div class="fl-service-right">' +
                '<span class="badge ' + a.status + '">' + statusLabels[a.status] + '</span>' +
                (a.status === 'confirmed' ? '<button class="btn btn-danger btn-sm" data-cancel-appt="' + a.id + '">Cancelar</button>' : '') +
                '</div></div>';
        });
    } else {
        listHtml = '<div class="empty-state"><h3>No tienes citas</h3><p>Reserva tu primera cita online.</p>' +
            '<button class="btn btn-primary" data-nav="booking">Reservar ahora</button></div>';
    }

    render(
        '<section class="fresha-booking"><div class="fl-header">' +
        '<div></div><h1>Mis citas</h1><div></div></div>' +
        '<div style="padding:0 16px 100px;">' + listHtml + '</div></section>'
    );

    document.querySelectorAll('[data-cancel-appt]').forEach(function (b) {
        b.addEventListener('click', function () {
            var appt = null;
            (getData().appointments || []).forEach(function (a) { if (a.id === b.getAttribute('data-cancel-appt')) appt = a; });
            if (!appt) return;
            appt.status = 'cancelled';
            saveData();
            toast('Cita cancelada', 'warning');
            renderMyAppointments();
        });
    });
}
