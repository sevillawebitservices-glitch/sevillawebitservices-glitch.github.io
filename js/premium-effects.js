// premium-effects.js - Efectos premium v2: partículas, scroll reveal, counters, tilt, confetti, WhatsApp, back-to-top, shimmer, progress bar, hamburger, magnetic, accordion, scramble, cursor

// ========== GOLD PARTICLES ==========
function initParticles() {
    var canvas = document.getElementById('heroParticles');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var particles = [];
    var particleCount = 40;

    function resize() {
        var hero = canvas.parentElement;
        canvas.width = hero.offsetWidth;
        canvas.height = hero.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function Particle() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2.5 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.3 - 0.15;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.pulse = Math.random() * Math.PI * 2;
    }
    Particle.prototype.update = function () {
        this.x += this.speedX;
        this.y += this.speedY;
        this.pulse += 0.02;
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
    };
    Particle.prototype.draw = function () {
        var o = this.opacity * (0.6 + 0.4 * Math.sin(this.pulse));
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(201,168,76,' + o + ')';
        ctx.fill();
    };

    for (var i = 0; i < particleCount; i++) particles.push(new Particle());

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (var i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }
        for (var a = 0; a < particles.length; a++) {
            for (var b = a + 1; b < particles.length; b++) {
                var dx = particles[a].x - particles[b].x;
                var dy = particles[a].y - particles[b].y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.strokeStyle = 'rgba(201,168,76,' + (0.06 * (1 - dist / 120)) + ')';
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }
    animate();
}

// ========== SCROLL REVEAL ==========
function initScrollReveal() {
    var elements = document.querySelectorAll('[data-reveal]');
    if (!elements.length) return;

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                var delay = entry.target.getAttribute('data-reveal-delay') || 0;
                setTimeout(function () {
                    entry.target.classList.add('revealed');
                }, parseInt(delay));
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(function (el) { observer.observe(el); });
}

// ========== ANIMATED COUNTERS ==========
function initCounters() {
    var counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(function (el) { observer.observe(el); });
}

function animateCounter(el) {
    var target = el.getAttribute('data-count');
    var suffix = el.getAttribute('data-suffix') || '';
    var prefix = el.getAttribute('data-prefix') || '';
    var isDecimal = target.indexOf('.') > -1;
    var targetNum = parseFloat(target);
    var duration = 1800;
    var start = 0;
    var startTime = null;

    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 4);
        var current = start + (targetNum - start) * eased;

        if (isDecimal) {
            el.textContent = prefix + current.toFixed(1) + suffix;
        } else {
            el.textContent = prefix + Math.floor(current).toLocaleString('es-ES') + suffix;
        }

        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }
    requestAnimationFrame(step);
}

// ========== CARD TILT 3D ==========
function initTiltCards() {
    var cards = document.querySelectorAll('.service-card');
    cards.forEach(function (card) {
        card.addEventListener('mousemove', function (e) {
            var rect = card.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            var centerX = rect.width / 2;
            var centerY = rect.height / 2;
            var rotateX = (y - centerY) / centerY * -5;
            var rotateY = (x - centerX) / centerX * 5;

            card.style.transform = 'perspective(800px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale(1.02)';
            card.style.transition = 'transform 0.1s ease';

            var shine = card.querySelector('.card-shine');
            if (!shine) {
                shine = document.createElement('div');
                shine.className = 'card-shine';
                card.appendChild(shine);
            }
            shine.style.background = 'radial-gradient(circle at ' + x + 'px ' + y + 'px, rgba(201,168,76,0.12) 0%, transparent 60%)';
        });

        card.addEventListener('mouseleave', function () {
            card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
            card.style.transition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
            var shine = card.querySelector('.card-shine');
            if (shine) shine.remove();
        });
    });
}

// ========== CONFETTI ==========
function launchConfetti() {
    var container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);

    var colors = ['#c9a84c', '#d4b85a', '#b8943d', '#e8d48b', '#ffffff', '#c9a84c'];
    var count = 60;

    for (var i = 0; i < count; i++) {
        var piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + 'vw';
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = Math.random() * 0.8 + 's';
        piece.style.animationDuration = (Math.random() * 1.5 + 1.5) + 's';
        piece.style.width = (Math.random() * 8 + 4) + 'px';
        piece.style.height = (Math.random() * 12 + 6) + 'px';
        piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        piece.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
        container.appendChild(piece);
    }

    setTimeout(function () { container.remove(); }, 4000);
}

// ========== BACK TO TOP ==========
function initBackToTop() {
    var btn = document.getElementById('backToTop');
    if (!btn) return;

    window.addEventListener('scroll', function () {
        if (window.scrollY > 500) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    });

    btn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ========== WHATSAPP FLOATING ==========
function initWhatsApp() {
    var btn = document.getElementById('whatsappFloat');
    if (!btn) return;
    btn.addEventListener('click', function () {
        window.open('https://wa.me/34900000000?text=' + encodeURIComponent('Hola, me gustaría reservar cita en Barbería Toni'), '_blank');
    });
}

// ========== HEADER SCROLL EFFECT ==========
function initHeaderScroll() {
    var header = document.querySelector('.header');
    if (!header) return;
    var ticking = false;

    window.addEventListener('scroll', function () {
        if (!ticking) {
            requestAnimationFrame(function () {
                header.classList.toggle('scrolled', window.scrollY > 20);
                ticking = false;
            });
            ticking = true;
        }
    });
}

// ========== SMOOTH ANCHOR LINKS ==========
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// ========== SCROLL PROGRESS BAR ==========
function initScrollProgress() {
    var bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.appendChild(bar);

    window.addEventListener('scroll', function () {
        var scrollTop = window.scrollY;
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        bar.style.width = progress + '%';
    });
}

// ========== MAGNETIC BUTTONS ==========
function initMagneticButtons() {
    var btns = document.querySelectorAll('.btn-primary, .btn-lg');
    btns.forEach(function (btn) {
        btn.classList.add('magnetic-btn');

        btn.addEventListener('mousemove', function (e) {
            var rect = btn.getBoundingClientRect();
            var x = e.clientX - rect.left - rect.width / 2;
            var y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = 'translate(' + (x * 0.15) + 'px, ' + (y * 0.15) + 'px)';
        });

        btn.addEventListener('mouseleave', function () {
            btn.style.transform = 'translate(0, 0)';
        });
    });
}

// ========== ACCORDION ==========
function initAccordion() {
    document.querySelectorAll('.accordion-header').forEach(function (header) {
        header.addEventListener('click', function () {
            var item = header.parentElement;
            var isOpen = item.classList.contains('open');

            // Close all
            document.querySelectorAll('.accordion-item').forEach(function (i) {
                i.classList.remove('open');
            });

            // Toggle clicked
            if (!isOpen) item.classList.add('open');
        });
    });
}

// ========== TEXT SCRAMBLE ==========
function scrambleText(el) {
    var chars = '!<>-_\\/[]{}—=+*^?#________';
    var original = el.getAttribute('data-text') || el.textContent;
    var frame = 0;
    var queue = [];

    for (var i = 0; i < original.length; i++) {
        queue.push({
            from: original[i],
            to: original[i],
            start: Math.floor(Math.random() * 20),
            end: Math.floor(Math.random() * 20) + 20,
            char: ''
        });
    }

    function update() {
        var output = '';
        var complete = 0;
        for (var i = 0; i < queue.length; i++) {
            var q = queue[i];
            if (frame >= q.end) {
                complete++;
                output += q.to;
            } else if (frame >= q.start) {
                if (!q.char || Math.random() < 0.28) {
                    q.char = chars[Math.floor(Math.random() * chars.length)];
                }
                output += q.char;
            } else {
                output += q.from;
            }
        }
        el.textContent = output;
        frame++;
        if (complete < queue.length) {
            requestAnimationFrame(update);
        }
    }
    update();
}

function initTextScramble() {
    var elements = document.querySelectorAll('[data-scramble]');
    if (!elements.length) return;

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                scrambleText(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    elements.forEach(function (el) { observer.observe(el); });
}

// ========== SVG DRAW ON SCROLL ==========
function initSVGDraw() {
    var svgs = document.querySelectorAll('.trust-icon svg');
    if (!svgs.length) return;

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('svg-draw');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    svgs.forEach(function (svg) { observer.observe(svg); });
}

// ========== CURSOR TRAIL (desktop only) ==========
function initCursorTrail() {
    if (window.innerWidth < 768 || 'ontouchstart' in window) return;

    var trail = document.createElement('div');
    trail.className = 'cursor-trail';
    document.body.appendChild(trail);

    var mouseX = 0, mouseY = 0;
    var trailX = 0, trailY = 0;

    document.addEventListener('mousemove', function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        trail.style.opacity = '1';
    });

    document.addEventListener('mouseleave', function () {
        trail.style.opacity = '0';
    });

    function animate() {
        trailX += (mouseX - trailX) * 0.15;
        trailY += (mouseY - trailY) * 0.15;
        trail.style.left = trailX - 4 + 'px';
        trail.style.top = trailY - 4 + 'px';
        requestAnimationFrame(animate);
    }
    animate();
}

// ========== INITIALIZE ALL ==========
function initPremiumEffects() {
    initParticles();
    initScrollReveal();
    initCounters();
    initTiltCards();
    initBackToTop();
    initWhatsApp();
    initHeaderScroll();
    initSmoothScroll();
    initScrollProgress();
    initMagneticButtons();
    initAccordion();
    initTextScramble();
    initSVGDraw();
    initCursorTrail();
}

// Run on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPremiumEffects);
} else {
    initPremiumEffects();
}
