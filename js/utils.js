// utils.js - Helpers, estado y capa de datos (localStorage demo)
// Script clásico: define funciones globales usadas por el resto.

// ---------- Utilidades de fecha ----------
var DAYS_FULL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
var DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
var MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
var MONTHS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function pad(n) {
    return String(n).padStart(2, '0');
}

function formatDate(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

function parseDate(str) {
    var parts = str.split('-');
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
}

function fmtDateLong(str) {
    if (!str) return '';
    var d = parseDate(str);
    return DAYS_FULL[d.getDay()] + ' ' + d.getDate() + ' de ' + MONTHS[d.getMonth()];
}

function fmtTime(min) {
    return pad(Math.floor(min / 60)) + ':' + pad(min % 60);
}

function timeToMin(t) {
    if (!t) return 0;
    var parts = t.split(':');
    return parseInt(parts[0]) * 60 + (parseInt(parts[1]) || 0);
}

function minToTime(min) {
    return pad(Math.floor(min / 60)) + ':' + pad(min % 60);
}

function formatMoney(n) {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n);
}

function initials(name) {
    if (!name) return '?';
    return name.split(' ').map(function (w) { return w[0]; }).filter(Boolean).join('').slice(0, 2).toUpperCase();
}

function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ---------- Constantes ----------
var ROLE = { HAIR: 'hair', BEAUTY: 'beauty' };
var ROLE_LABELS = { hair: 'Barbería', beauty: 'Estética' };
var APP_USER = 'user';
var APP_ADMIN = 'admin';

// ---------- Almacenamiento local ----------
var KEY = 'peluqueria_toni_v1';
var DATA_VERSION = 'v3';

// Nueva estructura: jornada partida con morning/afternoon
function makeDefaultDay(morningOpen, morningClose, afternoonOpen, afternoonClose, closed) {
    return {
        morning: { open: morningOpen || '09:00', close: morningClose || '14:00' },
        afternoon: { open: afternoonOpen || '16:00', close: afternoonClose || '20:00' },
        closed: !!closed
    };
}

function makeDefaultWeek() {
    var week = {};
    for (var d = 0; d < 7; d++) {
        if (d === 0) {
            // Domingo cerrado
            week[d] = makeDefaultDay('09:00', '14:00', '16:00', '20:00', true);
        } else if (d === 6) {
            // Sábado: mañana solo
            week[d] = makeDefaultDay('09:00', '14:00', '', '', false);
            week[d].afternoon = { open: '', close: '' };
        } else {
            // Lunes a viernes: jornada partida
            week[d] = makeDefaultDay('09:00', '14:00', '16:00', '20:00', false);
        }
    }
    return week;
}

function getDefaultSchedule() {
    return { s1: makeDefaultWeek(), s2: makeDefaultWeek() };
}

function seedData() {
    var today = formatDate(new Date());
    return {
        staff: [
            { id: 's1', name: 'Toni', role: ROLE.HAIR, photo: 'img/toni.jpg' },
            { id: 's2', name: 'Alicia', role: ROLE.BEAUTY, photo: 'img/alicia.jpg' }
        ],
        services: [
            { id: 'sv1', name: 'Corte de pelo', category: ROLE.HAIR, duration: 30, step: 15, price: 18, description: 'Lavado, corte y secado', active: true },
            { id: 'sv2', name: 'Corte + Barba', category: ROLE.HAIR, duration: 45, step: 15, price: 25, description: 'Corte de pelo, barba y peinado', active: true },
            { id: 'sv3', name: 'Tinte completo', category: ROLE.HAIR, duration: 120, step: 30, price: 45, description: 'Coloración completa con productos profesionales', active: true },
            { id: 'sv4', name: 'Peinado de fiesta', category: ROLE.HAIR, duration: 45, step: 15, price: 28, description: 'Peinados para ocasiones especiales', active: true },
            { id: 'sv5', name: 'Diseño de cejas', category: ROLE.BEAUTY, duration: 30, step: 15, price: 15, description: 'Diseño y perfilado de cejas', active: true },
            { id: 'sv6', name: 'Manicura', category: ROLE.BEAUTY, duration: 45, step: 15, price: 18, description: 'Manicura básica con esmaltado', active: true },
            { id: 'sv7', name: 'Pedicura', category: ROLE.BEAUTY, duration: 50, step: 15, price: 22, description: 'Pedicura completa', active: true },
            { id: 'sv8', name: 'Masaje facial', category: ROLE.BEAUTY, duration: 30, step: 15, price: 25, description: 'Limpieza y masaje facial relajante', active: true }
        ],
        schedule: getDefaultSchedule(),
        closedDays: [], // Días cerrados (vacaciones, feriados, etc.)
        appointments: [
            {
                id: 'a1',
                clientName: 'María Gómez', clientPhone: '600111222',
                serviceId: 'sv1', staffId: 's1',
                date: today, startTime: '10:00', endTime: '10:30',
                status: 'confirmed'
            },
            {
                id: 'a2', clientName: 'Carlos Ruiz', clientPhone: '600333444',
                serviceId: 'sv2', staffId: 's1',
                date: today, startTime: '11:00', endTime: '11:45',
                status: 'confirmed'
            },
            {
                id: 'a3', clientName: 'Ana López', clientPhone: '600555666',
                serviceId: 'sv6', staffId: 's2',
                date: today, startTime: '10:00', endTime: '10:45',
                status: 'pending'
            }
        ]
    };
}

// Normalizar horarios legacy a nueva estructura
function normalizeSchedule(schedule) {
    if (!schedule) return getDefaultSchedule();
    var result = {};
    store = store || {};
    var staffList = (store.staff && store.staff.length) ? store.staff : getDefaultStaff();
    
    for (var i = 0; i < staffList.length; i++) {
        var sid = staffList[i].id;
        if (schedule[sid]) {
            var oldDay = schedule[sid];
            // Si tiene estructura antigua (open/close directos), convertir
            if (oldDay[0] && oldDay[0].open !== undefined && oldDay[0].morning === undefined) {
                result[sid] = convertLegacyWeek(oldDay);
            } else {
                result[sid] = oldDay;
            }
        } else {
            result[sid] = makeDefaultWeek();
        }
    }
    return result;
}

// Convertir formato antiguo a nuevo (jornada partida)
function convertLegacyWeek(oldWeek) {
    var newWeek = {};
    for (var d = 0; d < 7; d++) {
        var old = oldWeek[d] || {};
        if (old.closed) {
            newWeek[d] = makeDefaultDay('09:00', '14:00', '16:00', '20:00', true);
        } else {
            // Dividir el horario en dos partes
            var openMin = timeToMin(old.open || '09:00');
            var closeMin = timeToMin(old.close || '18:00');
            var totalHours = closeMin - openMin;
            
            if (totalHours > 6) {
                // Jornada larga: dividir en mañana y tarde
                var midPoint = openMin + Math.floor(totalHours / 2);
                var breakStart = midPoint - 60; // 1 hora de descanso
                var breakEnd = midPoint;
                newWeek[d] = makeDefaultDay(
                    old.open || '09:00', minToTime(breakStart),
                    minToTime(breakEnd), old.close || '18:00',
                    false
                );
            } else {
                // Jornada corta: solo mañana
                newWeek[d] = makeDefaultDay(old.open || '09:00', old.close || '18:00', '', '', false);
                newWeek[d].afternoon = { open: '', close: '' };
            }
        }
    }
    return newWeek;
}

function getDefaultStaff() {
    return [
        { id: 's1', name: 'Toni', role: ROLE.HAIR, photo: 'img/toni.jpg' },
        { id: 's2', name: 'Alicia', role: ROLE.BEAUTY, photo: 'img/alicia.jpg' }
    ];
}

function loadData() {
    try {
        var raw = localStorage.getItem(KEY);
        if (!raw) return seedData();
        var data = JSON.parse(raw);
        if (data._version !== DATA_VERSION) {
            var appointments = data.appointments || [];
            var fresh = seedData();
            fresh.appointments = appointments;
            fresh._version = DATA_VERSION;
            return fresh;
        }
        var merged = {};
        var defaults = seedData();
        for (var k in defaults) merged[k] = defaults[k];
        for (var k2 in data) merged[k2] = data[k2];
        merged.schedule = normalizeSchedule(data.schedule);
        merged.appointments = merged.appointments || [];
        merged.services = merged.services || [];
        merged.staff = merged.staff || defaults.staff;
        var defaultStaffMap = {};
        defaults.staff.forEach(function (ds) { defaultStaffMap[ds.id] = ds; });
        merged.staff.forEach(function (s) {
            if (defaultStaffMap[s.id] && !s.photo && defaultStaffMap[s.id].photo) {
                s.photo = defaultStaffMap[s.id].photo;
            }
        });
        merged._version = DATA_VERSION;
        return merged;
    } catch (e) {
        return seedData();
    }
}

var store = loadData();

function getData() {
    return store;
}

function saveData() {
    try {
        store._version = DATA_VERSION;
        localStorage.setItem(KEY, JSON.stringify(store));
    } catch (e) {
        console.error('No se pudo guardar', e);
    }
}

function resetData() {
    store = seedData();
    saveData();
}

// ---------- Sesión ----------
var SESSION_KEY = 'peloton_session';

function setCurrentUser(user) {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else localStorage.removeItem(SESSION_KEY);
}

function getCurrentUser() {
    try {
        var raw = localStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
}

// ---------- Dominio ----------
function getStaff() {
    return store.staff;
}

function getServices(onlyActive) {
    if (onlyActive === undefined) onlyActive = true;
    return store.services.filter(function (s) { return !onlyActive || s.active; });
}

function getService(id) {
    for (var i = 0; i < store.services.length; i++) {
        if (store.services[i].id === id) return store.services[i];
    }
    return null;
}

function getStaffById(id) {
    for (var i = 0; i < store.staff.length; i++) {
        if (store.staff[i].id === id) return store.staff[i];
    }
    return null;
}

// Horario por staffId
function getScheduleForStaff(staffId) {
    if (store.schedule && store.schedule[staffId]) return store.schedule[staffId];
    return makeDefaultWeek();
}

function setStaffSchedule(staffId, weekCfg) {
    if (!store.schedule) store.schedule = {};
    store.schedule[staffId] = weekCfg;
    saveData();
}

function getStaffForRole(role) {
    return store.staff.filter(function (s) { return s.role === role; });
}

// Horario legacy por role (usa el primer staff de ese role)
function getScheduleFor(role) {
    if (!role) return store.schedule;
    var staff = getStaffForRole(role);
    if (staff.length) return getScheduleForStaff(staff[0].id);
    return makeDefaultWeek();
}

function getAppointments() {
    return store.appointments;
}

// Verificar si un staff está disponible en un hueco específico
function isStaffAvailable(staffId, date, startMin, durationMin) {
    var endMin = startMin + durationMin;
    for (var i = 0; i < store.appointments.length; i++) {
        var a = store.appointments[i];
        if (a.staffId === staffId && a.date === date && a.status !== 'cancelled') {
            var s = timeToMin(a.startTime);
            var e = timeToMin(a.endTime);
            if (startMin < e && endMin > s) return false;
        }
    }
    return true;
}

// Verificar si un staff puede atender en un horario (con jornada partida)
function isStaffSchedule(staffId, date, startMin, durationMin) {
    // Verificar si el día está cerrado globalmente
    if (isDayClosed(date)) return false;
    
    var dayCfg = getScheduleForStaff(staffId)[parseDate(date).getDay()];
    if (!dayCfg || dayCfg.closed) return false;
    
    var endMin = startMin + durationMin;
    
    // Verificar mañana
    var morningOpen = timeToMin(dayCfg.morning.open);
    var morningClose = timeToMin(dayCfg.morning.close);
    var inMorning = dayCfg.morning.open && dayCfg.morning.close && 
                    startMin >= morningOpen && endMin <= morningClose;
    
    // Verificar tarde
    var afternoonOpen = timeToMin(dayCfg.afternoon.open);
    var afternoonClose = timeToMin(dayCfg.afternoon.close);
    var inAfternoon = dayCfg.afternoon.open && dayCfg.afternoon.close && 
                      startMin >= afternoonOpen && endMin <= afternoonClose;
    
    if (!inMorning && !inAfternoon) return false;
    
    return isStaffAvailable(staffId, date, startMin, durationMin);
}

// Obtener todos los huecos libres para un staff (considerando jornada partida)
function getAllFreeSlotsForStaff(staffId, dateStr, durMin, stepMin) {
    var data = getData();
    var dayCfg = getScheduleForStaff(staffId)[parseDate(dateStr).getDay()];
    if (!dayCfg || dayCfg.closed) return [];
    
    var taken = [];
    (data.appointments || []).forEach(function (a) {
        if (a.staffId === staffId && a.date === dateStr && a.status !== 'cancelled') {
            taken.push([timeToMin(a.startTime), timeToMin(a.endTime)]);
        }
    });
    
    var step = stepMin || durMin;
    var slots = [];
    
    // Función para generar slots en un rango
    function generateSlots(openMin, closeMin) {
        for (var start = openMin; start + durMin <= closeMin; start += step) {
            var end = start + durMin;
            var clash = false;
            for (var i = 0; i < taken.length; i++) {
                if (start < taken[i][1] && end > taken[i][0]) { clash = true; break; }
            }
            if (!clash) slots.push(start);
        }
    }
    
    // Slots de mañana
    if (dayCfg.morning.open && dayCfg.morning.close) {
        generateSlots(timeToMin(dayCfg.morning.open), timeToMin(dayCfg.morning.close));
    }
    
    // Slots de tarde
    if (dayCfg.afternoon.open && dayCfg.afternoon.close) {
        generateSlots(timeToMin(dayCfg.afternoon.open), timeToMin(dayCfg.afternoon.close));
    }
    
    return slots;
}

function findAvailableStaff(role, date, start, durationMin) {
    var result = [];
    store.staff.forEach(function (s) {
        if (s.role === role && isStaffSchedule(s.id, date, start, durationMin)) result.push(s);
    });
    return result;
}

// Función para obtener el período del día (morning/afternoon)
function getTimePeriod(timeStr) {
    var hour = parseInt(timeStr.split(':')[0]);
    return hour < 14 ? 'morning' : 'afternoon';
}

// Función para formatear el período
function formatPeriod(period) {
    return period === 'morning' ? 'Mañana' : 'Tarde';
}

// ---------- Gestión de días cerrados ----------
function getClosedDays() {
    return store.closedDays || [];
}

function isDayClosed(dateStr) {
    var closedDays = getClosedDays();
    return closedDays.some(function (cd) {
        if (cd.startDate && cd.endDate) {
            return dateStr >= cd.startDate && dateStr <= cd.endDate;
        }
        return cd.date === dateStr;
    });
}

function addClosedDay(dateOrRange, reason, staffId) {
    if (!store.closedDays) store.closedDays = [];
    
    var entry = {
        id: uid(),
        reason: reason || 'Cerrado',
        staffId: staffId || 'all', // 'all' = cerrado para todos
        createdAt: new Date().toISOString()
    };
    
    if (typeof dateOrRange === 'string') {
        entry.date = dateOrRange;
        entry.startDate = dateOrRange;
        entry.endDate = dateOrRange;
    } else if (dateOrRange.startDate) {
        entry.startDate = dateOrRange.startDate;
        entry.endDate = dateOrRange.endDate;
        entry.date = dateOrRange.startDate;
    }
    
    store.closedDays.push(entry);
    saveData();
    return entry;
}

function removeClosedDay(id) {
    store.closedDays = (store.closedDays || []).filter(function (cd) {
        return cd.id !== id;
    });
    saveData();
}

function getClosedDaysForMonth(year, month) {
    var closedDays = getClosedDays();
    var monthStr = pad(month + 1);
    var prefix = year + '-' + monthStr;
    
    return closedDays.filter(function (cd) {
        // Verificar si el rango de fechas incluye días de este mes
        if (cd.startDate && cd.endDate) {
            var lastDayOfMonth = new Date(year, month + 1, 0);
            var firstDayOfMonth = new Date(year, month, 1);
            var monthStart = formatDate(firstDayOfMonth);
            var monthEnd = formatDate(lastDayOfMonth);
            return cd.startDate <= monthEnd && cd.endDate >= monthStart;
        }
        return cd.date && cd.date.indexOf(prefix) === 0;
    });
}

function getClosedDayForDate(dateStr) {
    var closedDays = getClosedDays();
    for (var i = 0; i < closedDays.length; i++) {
        var cd = closedDays[i];
        if (cd.startDate && cd.endDate) {
            if (dateStr >= cd.startDate && dateStr <= cd.endDate) return cd;
        } else if (cd.date === dateStr) {
            return cd;
        }
    }
    return null;
}
