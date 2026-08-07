// auth.js - Autenticación (demo sin base de datos)
// Usa funciones globales de utils.js y app.js.

var DEMO_ADMIN = { email: 'admin@peluqueria.com', password: 'admin123' };

function renderAuth(mode) {
    if (mode === undefined) mode = 'login';
    var isLogin = mode === 'login';

    var extraFields = '';
    if (!isLogin) {
        extraFields =
            '<div class="form-group">' +
            '<label><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Nombre completo</label>' +
            '<div class="auth-input-wrapper">' +
            '<input type="text" id="regName" placeholder="Tu nombre" required>' +
            '</div></div>' +
            '<div class="form-group">' +
            '<label><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg> Teléfono</label>' +
            '<div class="auth-input-wrapper">' +
            '<input type="tel" id="regPhone" placeholder="600 000 000">' +
            '</div></div>';
    }

    var switchLink = isLogin
        ? '¿No tienes cuenta? <a href="#register" data-nav="register">Regístrate</a>'
        : '¿Ya tienes cuenta? <a href="#login" data-nav="login">Inicia sesión</a>';

    var viewSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
    var viewOffSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';

    render(
        '<div class="auth-wrapper">' +
        '<div class="auth-container">' +

        '<div class="auth-logo">' +
        '<div class="auth-logo-icon">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>' +
        '</div></div>' +

        '<h2>' + (isLogin ? 'Bienvenido' : 'Crear cuenta') + '</h2>' +
        '<p class="auth-subtitle">' + (isLogin ? 'Accede a tu area personal' : 'Regístrate para reservar citas') + '</p>' +

        '<div class="auth-form">' +
        extraFields +

        '<div class="form-group">' +
        '<label><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> Correo electrónico</label>' +
        '<div class="auth-input-wrapper">' +
        '<input type="email" id="authEmail" placeholder="tu@email.com" required>' +
        '</div></div>' +

        '<div class="form-group">' +
        '<label><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg> Contraseña</label>' +
        '<div class="auth-input-wrapper">' +
        '<input type="password" id="authPassword" placeholder="••••••••" required>' +
        '<button type="button" class="auth-password-toggle" id="togglePassword" tabindex="-1">' + viewSvg + '</button>' +
        '</div></div>' +

        (isLogin ? '<a class="auth-forgot" id="forgotPassword">¿Olvidaste tu contraseña?</a>' : '') +

        '<button class="auth-submit" id="authSubmit">' +
        (isLogin ? 'Iniciar sesión' : 'Crear cuenta') + '</button>' +
        '</div>' +

        '<div class="auth-divider"><span>o</span></div>' +

        '<div class="auth-demo">' +
        '<div class="auth-demo-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg> Acceso demo</div>' +
        '<div class="auth-demo-btns">' +
        '<button class="auth-demo-btn admin-demo" id="demoAdminBtn">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>' +
        'Entrar como Administrador</button>' +
        '<button class="auth-demo-btn" id="demoUserBtn">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
        'Entrar como Cliente</button>' +
        '</div></div>' +

        '<div class="auth-switch">' + switchLink + '</div>' +

        '</div></div>'
    );

    // Toggle password visibility
    var toggleBtn = el('togglePassword');
    var passInput = el('authPassword');
    if (toggleBtn && passInput) {
        toggleBtn.addEventListener('click', function () {
            var isPassword = passInput.type === 'password';
            passInput.type = isPassword ? 'text' : 'password';
            toggleBtn.innerHTML = isPassword ? viewOffSvg : viewSvg;
        });
    }

    // Forgot password (demo)
    var forgotLink = el('forgotPassword');
    if (forgotLink) {
        forgotLink.addEventListener('click', function () {
            toast('Función no disponible en modo demo', 'warning');
        });
    }

    el('authSubmit').addEventListener('click', function () {
        var email = el('authEmail').value.trim();
        var password = el('authPassword').value;
        if (!email || !password) {
            toast('Completa todos los campos', 'error');
            return;
        }
        if (isLogin) {
            doLogin(email, password);
        } else {
            var name = el('regName').value.trim();
            if (!name) { toast('Completa tu nombre', 'error'); return; }
            register(name, email, el('regPhone').value.trim());
        }
    });

    el('demoAdminBtn').addEventListener('click', function () {
        demoLogin(APP_ADMIN, 'Administrador');
    });
    el('demoUserBtn').addEventListener('click', function () {
        demoLogin(APP_USER, 'Cliente');
    });
}

function demoLogin(role, label) {
    var user = {
        id: 'demo_' + role,
        name: role === APP_ADMIN ? 'Toni Admin' : 'Cliente Demo',
        email: role === APP_ADMIN ? DEMO_ADMIN.email : 'cliente@demo.com',
        role: role,
        demo: true
    };
    setCurrentUser(user);
    toast('Bienvenido, ' + label);
    if (role === APP_ADMIN) {
        go('admin');
    } else {
        go('booking');
    }
}

function doLogin(email, password) {
    if (email === DEMO_ADMIN.email && password === DEMO_ADMIN.password) {
        var user = { id: 'admin', name: 'Toni Admin', email: email, role: APP_ADMIN };
        setCurrentUser(user);
        toast('Bienvenido, Administrador', 'success');
        go('admin');
        return;
    }
    var clients = getData().clients || [];
    for (var i = 0; i < clients.length; i++) {
        if (clients[i].email === email && clients[i].password === password) {
            setCurrentUser(clients[i]);
            toast('Bienvenido, ' + clients[i].name, 'success');
            go('booking');
            return;
        }
    }
    toast('Credenciales incorrectas', 'error');
}

function register(name, email, phone) {
    var data = getData();
    if (!data.clients) data.clients = [];
    for (var i = 0; i < data.clients.length; i++) {
        if (data.clients[i].email === email) {
            toast('Ya existe una cuenta con ese email', 'error');
            return;
        }
    }
    var client = { id: uid(), name: name, email: email, phone: phone, role: APP_USER, password: '' };
    data.clients.push(client);
    saveData();
    setCurrentUser(client);
    toast('Cuenta creada. ¡Bienvenido!', 'success');
    go('booking');
}