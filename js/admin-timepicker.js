// admin-timepicker.js - Componente de selección de hora visual
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

        this.pickers = this.pickers || {};
        this.pickers[id] = {
            value: value,
            onChange: onChange,
            container: container
        };

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

        var dropdown = document.createElement('div');
        dropdown.className = 'tp-dropdown';
        dropdown.id = 'tp_dropdown_' + id;

        var html = '';
        html += '<div class="tp-dropdown-header">';
        html += '<span class="tp-dropdown-title">Seleccionar hora</span>';
        html += '<button class="tp-dropdown-close" data-tp-close="' + id + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>';
        html += '</div>';
        html += '<div class="tp-selected-display">';
        html += '<span class="tp-selected-time" data-tp-time-display="' + id + '">' + this.formatTime(selectedHour, selectedMinute) + '</span>';
        html += '<span class="tp-selected-period">' + (selectedHour < 12 ? 'AM' : 'PM') + '</span>';
        html += '</div>';
        html += '<div class="tp-clock-container">';
        html += '<div class="tp-clock" data-tp-clock="' + id + '">';
        html += '<div class="tp-clock-center"></div>';
        html += '<div class="tp-clock-hand" data-tp-hand="' + id + '" style="transform: translateX(-50%) rotate(' + this.getRotation(selectedHour) + 'deg);"></div>';

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
        html += '<div class="tp-minutes-section">';
        html += '<div class="tp-minutes-label">Minutos</div>';
        html += '<div class="tp-minutes-grid">';
        [0, 15, 30, 45].forEach(function(m) {
            html += '<button class="tp-minute-btn' + (selectedMinute === m ? ' active' : '') + '" data-tp-minute="' + m + '">' + (m < 10 ? '0' : '') + m + '</button>';
        });
        html += '</div></div>';
        html += '</div>';

        html += '<div class="tp-quick-times">';
        ['08:00', '09:00', '10:00', '12:00', '16:00', '17:00', '18:00', '20:00'].forEach(function(t) {
            html += '<button class="tp-quick-time-btn" data-tp-quick="' + t + '">' + t + '</button>';
        });
        html += '</div>';
        html += '<button class="tp-confirm" data-tp-confirm="' + id + '">Seleccionar</button>';
        html += '<button class="tp-clear" data-tp-clear="' + id + '">Limpiar</button>';

        dropdown.innerHTML = html;
        container.querySelector('.tp-container').appendChild(dropdown);
        this.bindEvents(id);
    },

    bindEvents: function(id) {
        var self = this;
        var picker = this.pickers[id];
        var dropdown = document.getElementById('tp_dropdown_' + id);
        if (!dropdown) return;

        dropdown.querySelector('[data-tp-close]').addEventListener('click', function(e) {
            e.stopPropagation();
            self.close();
        });

        dropdown.querySelectorAll('[data-tp-hour]').forEach(function(mark) {
            mark.addEventListener('click', function() {
                var hour12 = parseInt(mark.dataset.tpHour);
                var hour24 = parseInt(mark.dataset.tpHour24);
                dropdown.querySelectorAll('[data-tp-hour]').forEach(function(m) { m.classList.remove('active'); });
                mark.classList.add('active');
                var index = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].indexOf(hour12);
                var rotation = (index * 30) - 90;
                dropdown.querySelector('[data-tp-hand]').style.transform = 'translateX(-50%) rotate(' + rotation + 'deg)';
                self.tempHour = hour24;
                self.updateDisplay(id);
            });
        });

        dropdown.querySelectorAll('[data-tp-minute]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                dropdown.querySelectorAll('[data-tp-minute]').forEach(function(b) { b.classList.remove('active'); });
                btn.classList.add('active');
                self.tempMinute = parseInt(btn.dataset.tpMinute);
                self.updateDisplay(id);
            });
        });

        dropdown.querySelectorAll('[data-tp-quick]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var time = btn.dataset.tpQuick;
                var parts = time.split(':');
                self.tempHour = parseInt(parts[0]);
                self.tempMinute = parseInt(parts[1]);
                var hour12 = self.tempHour % 12 || 12;
                dropdown.querySelectorAll('[data-tp-hour]').forEach(function(m) {
                    m.classList.toggle('active', parseInt(m.dataset.tpHour) === hour12);
                });
                dropdown.querySelectorAll('[data-tp-minute]').forEach(function(b) {
                    b.classList.toggle('active', parseInt(b.dataset.tpMinute) === self.tempMinute);
                });
                var index = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].indexOf(hour12);
                var rotation = (index * 30) - 90;
                dropdown.querySelector('[data-tp-hand]').style.transform = 'translateX(-50%) rotate(' + rotation + 'deg)';
                self.updateDisplay(id);
            });
        });

        dropdown.querySelector('[data-tp-confirm]').addEventListener('click', function() {
            var time = self.formatTime(self.tempHour || 9, self.tempMinute || 0);
            picker.value = time;
            picker.onChange(time);
            var display = document.querySelector('[data-tp-display="' + id + '"]');
            if (display) {
                display.textContent = time;
                display.classList.remove('empty');
            }
            self.close();
        });

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

        this.tempHour = picker.value ? parseInt(picker.value.split(':')[0]) : 9;
        this.tempMinute = picker.value ? parseInt(picker.value.split(':')[1]) : 0;
    },

    updateDisplay: function(id) {
        var display = document.querySelector('[data-tp-time-display="' + id + '"]');
        if (display) {
            display.textContent = this.formatTime(this.tempHour || 0, this.tempMinute || 0);
        }
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

document.addEventListener('click', function() {
    TimePicker.close();
});
