// ========== EMAILJS CONFIGURATION ==========
const EMAILJS_CONFIG = {
    SERVICE_ID: 'service_fk7yhn4',
    TEMPLATE_ID: 'template_1yj39ae'
};

// ========== GLOBAL VARIABLES ==========
let turnstileToken = null;
let isFormSubmitting = false;
const isMobile = window.innerWidth <= 768;

// ========== TURNSTILE FUNCTIONS ==========
function onTurnstileSuccess(token) {
    console.log('✅ Turnstile verificado');
    turnstileToken = token;
    // Opcional: cambiar estilo del widget para feedback visual
    const widget = document.querySelector('.cf-turnstile');
    if (widget) {
        widget.style.border = '2px solid #4CAF50';
        widget.style.borderRadius = '4px';
    }
}

function onTurnstileError() {
    console.error('❌ Error en Turnstile');
    turnstileToken = null;
    showFeedback('❌ Error en la verificación de seguridad. Recarga la página.', 'error');
}

function resetTurnstile() {
    console.log('🔄 Reseteando Turnstile...');
    turnstileToken = null;
    
    if (window.turnstile) {
        const widget = document.querySelector('.cf-turnstile');
        if (widget) {
            // Remover estilos visuales
            widget.style.border = '';
            widget.style.borderRadius = '';
            
            // Resetear widget
            widget.innerHTML = '';
            window.turnstile.render('.cf-turnstile', {
                sitekey: widget.getAttribute('data-sitekey'),
                callback: onTurnstileSuccess,
                'error-callback': onTurnstileError
            });
        }
    }
}

// ========== EMAIL FORM HANDLING ==========
async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (isFormSubmitting) {
        console.log('⏳ Envío en progreso...');
        showFeedback('⏳ Ya se está enviando un mensaje. Espera...', 'warning');
        return;
    }
    
    console.log('🔄 Procesando formulario...');
    
    // Validar campos requeridos
    const name = document.getElementById('form-name').value.trim();
    const email = document.getElementById('form-email').value.trim();
    const subject = document.getElementById('form-subject').value.trim();
    const message = document.getElementById('form-message').value.trim();
    
    if (!name || !email || !subject || !message) {
        showFeedback('⚠️ Por favor, completa todos los campos', 'warning');
        return;
    }
    
    if (!isValidEmail(email)) {
        showFeedback('⚠️ Por favor, ingresa un email válido', 'warning');
        return;
    }
    
    // Validar Turnstile
    if (!turnstileToken) {
        showFeedback('⚠️ Por favor, completa la verificación "No soy robot"', 'warning');
        return;
    }
    
    // Cambiar estado del botón
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (!submitBtn) {
        console.error('❌ Botón de submit no encontrado');
        return;
    }
    
    const originalText = submitBtn.textContent;
    isFormSubmitting = true;
    submitBtn.textContent = 'ENVIANDO...';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';
    submitBtn.style.cursor = 'not-allowed';
    
    try {
        // Preparar datos
        const formData = {
            from_name: name,
            from_email: email,
            subject: subject,
            message: message,
            date: new Date().toLocaleString('es-CL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            page_url: window.location.href,
        };
        
        console.log('📤 Enviando datos:', { 
            ...formData, 
            turnstile_token: '***' // Ocultar token en logs
        });
        
        // Enviar con EmailJS
        const response = await emailjs.send(
            EMAILJS_CONFIG.SERVICE_ID,
            EMAILJS_CONFIG.TEMPLATE_ID,
            formData
        );
        
        console.log('✅ EmailJS response:', response);
        
        // Mostrar feedback de éxito
        showFeedback('✅ ¡Mensaje enviado correctamente! Te responderé pronto.', 'success');
        
        // Limpiar formulario
        e.target.reset();
        
        // Resetear Turnstile
        resetTurnstile();
        
    } catch (error) {
        console.error('❌ Error enviando email:', error);
        
        let errorMessage = 'Error al enviar el mensaje. Intenta nuevamente.';
        
        if (error.status === 0) {
            errorMessage = '❌ Error de conexión. Verifica tu internet.';
        } else if (error.status === 400) {
            errorMessage = '❌ Datos inválidos. Verifica los campos.';
        } else if (error.status === 429) {
            errorMessage = '❌ Demasiados intentos. Espera unos minutos.';
        } else if (error.message?.includes('EmailJS')) {
            errorMessage = '❌ Error en el servicio de email. Intenta más tarde.';
        }
        
        showFeedback(errorMessage, 'error');
        turnstileToken = null;
        
    } finally {
        // Restaurar estado del botón
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        submitBtn.style.cursor = 'pointer';
        isFormSubmitting = false;
    }
}

// Función auxiliar para validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showFeedback(message, type = 'success') {
    // Crear elemento si no existe
    let feedback = document.getElementById('form-feedback');
    if (!feedback) {
        feedback = document.createElement('div');
        feedback.id = 'form-feedback';
        document.body.appendChild(feedback);
    }
    
    // Aplicar estilos
    feedback.textContent = message;
    feedback.style.background = type === 'success' ? '#0a0a0a' : 
                               type === 'error' ? '#ff3e00' : 
                               type === 'warning' ? '#ff9500' : '#0a0a0a';
    feedback.classList.add('show');
    
    // Ocultar después de 5 segundos
    setTimeout(() => {
        feedback.classList.remove('show');
    }, 5000);
}

// ========== NAVIGATION FUNCTIONS ==========
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function scrollToSection(id) {
    const target = document.getElementById(id);
    if (!target) return;

    if (isMobile) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
    }

    if (id === 'contact-section' || id === 'my-projects') {
        const horizontal2 = document.getElementById("horizontal-2");
        if (horizontal2) {
            const st = ScrollTrigger.getAll().find(s => s.trigger === horizontal2);
            if (st) {
                const totalScroll = st.end - st.start;
                let desiredProgress = id === 'contact-section' ? 0.5 : 1.0;
                const invertedProgress = 1 - desiredProgress;
                const targetPos = st.start + (totalScroll * invertedProgress);
                window.scrollTo({ top: targetPos, behavior: 'smooth' });
                return;
            }
        }
    }

    const rect = target.getBoundingClientRect();
    const targetPos = rect.top + window.pageYOffset;
    window.scrollTo({ top: targetPos, behavior: 'smooth' });
}

// ========== MOBILE MENU FUNCTIONS ==========
function toggleMenu() {
    if (!isMobile) return;
    
    const navLinks = document.querySelector('.nav-links');
    const hamburger = document.querySelector('.hamburger');
    
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
    
    if (navLinks.classList.contains('active')) {
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
    }
}

// ========== PROJECT FILTERING FUNCTIONS ==========
function filterProjects(category) {
    const projects = document.querySelectorAll('.project-card-ui');
    const tabs = document.querySelectorAll('.tab-btn');

    tabs.forEach(tab => {
        if (tab.getAttribute('data-category') === category) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    projects.forEach(project => {
        const categories = project.getAttribute('data-categories').split(' ');
        
        if (category === 'all' || categories.includes(category)) {
            project.style.display = 'flex';
            gsap.fromTo(project, 
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
            );
        } else {
            gsap.to(project, {
                opacity: 0,
                y: -10,
                duration: 0.3,
                ease: "power2.in",
                onComplete: () => {
                    project.style.display = 'none';
                }
            });
        }
    });
    
    updateProjectCounts();
}

function updateProjectCounts() {
    const categories = ['all', 'web', 'github', 'data'];
    
    categories.forEach(category => {
        const projects = document.querySelectorAll('.project-card-ui');
        let count = 0;
        
        projects.forEach(project => {
            const projectCategories = project.getAttribute('data-categories').split(' ');
            if (category === 'all' || projectCategories.includes(category)) {
                count++;
            }
        });
        
        const countElement = document.getElementById(`count-${category}`);
        if (countElement) {
            countElement.textContent = count;
        }
    });
}

// ========== TYPEWRITER EFFECT ==========
const words = ["ANALISTA PROGRAMADOR", "CERT. DATA SCIENCE", "ORACLE CLOUD INFRASTRUCTURE"];
let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;

function type() {
    const typewriterEl = document.getElementById('typewriter-text');
    if (!typewriterEl) return;
    
    const currentWord = words[wordIndex];
    
    if (isDeleting) {
        typewriterEl.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typewriterEl.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
    }

    let typeSpeed = isDeleting ? 50 : 100;

    if (!isDeleting && charIndex === currentWord.length) {
        typeSpeed = 2000;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        typeSpeed = 500;
    }

    setTimeout(type, typeSpeed);
}

// ========== INITIALIZATION ==========
function initializeEventListeners() {
    // Email form
    const form = document.getElementById('portfolio-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // Navigation links
    document.querySelectorAll('.nav-links a').forEach((link, index) => {
        const sections = ['certified', 'experience', 'my-projects', 'contact-section'];
        link.addEventListener('click', () => scrollToSection(sections[index]));
    });
    
    // Logo link
    const logoLink = document.querySelector('.logo-link');
    if (logoLink) {
        logoLink.addEventListener('click', scrollToTop);
    }
    
    // Hamburger menu
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', toggleMenu);
    }
    
    // Project filter buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        const category = btn.getAttribute('data-category');
        btn.addEventListener('click', () => filterProjects(category));
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!isMobile) return;
        
        const navLinks = document.querySelector('.nav-links');
        const hamburger = document.querySelector('.hamburger');
        
        if (navLinks.classList.contains('active') && 
            !e.target.closest('.nav-links') && 
            !e.target.closest('.hamburger')) {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });
}

// ========== PAGE LOAD ==========
window.addEventListener('DOMContentLoaded', function() {
    // Initialize animations
    type();
    animate();
    updateProjectCounts();
    initializeEventListeners();
    
    // Initialize Turnstile - VERSIÓN MEJORADA
    function initTurnstile() {
        if (window.turnstile) {
            const widget = document.querySelector('.cf-turnstile');
            if (widget) {
                window.turnstile.render(widget, {
                    sitekey: widget.getAttribute('data-sitekey'),
                    callback: onTurnstileSuccess,
                    'error-callback': onTurnstileError
                });
                console.log('✅ Turnstile inicializado');
            }
        } else {
            // Si aún no está cargado, reintentar en 500ms
            setTimeout(initTurnstile, 500);
        }
    }
    
    // Iniciar Turnstile después de 1 segundo
    setTimeout(initTurnstile, 1000);
    
    console.log('✅ Portafolio cargado completamente');
});

// ========== ANIMATIONS (GSAP) ==========
gsap.registerPlugin(ScrollTrigger);

const layer = document.getElementById('interaction-layer');
let currentPhysics = "mercury";
let currentScale = { x: 1, y: 1 };
const drops = [];
const dropCount = isMobile ? 18 : 45;

for (let i = 0; i < dropCount; i++) {
    const drop = document.createElement('div');
    drop.className = 'blob-particle';
    const size = isMobile ? Math.random() * 25 + 8 : Math.random() * 40 + 10;
    drop.style.width = `${size}px`;
    drop.style.height = `${size}px`;
    
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    
    layer.appendChild(drop);
    drops.push({ 
        el: drop, 
        x: x, 
        y: y, 
        vx: (Math.random() - 0.5) * 2, 
        vy: (Math.random() - 0.5) * 2, 
        size: size,
        baseVy: Math.random() * 4 + (isMobile ? 4 : 6)
    });
}

if (isMobile) {
    document.querySelectorAll('section, .vertical-section').forEach(sec => {
        gsap.to(sec, {
            scrollTrigger: {
                trigger: sec,
                start: "top 85%",
                toggleActions: "play none none reverse"
            },
            opacity: 1,
            x: 0,
            duration: 1,
            ease: "power4.out"
        });
    });
}

if (!isMobile) {
    const h1 = document.getElementById("horizontal-1");
    gsap.to(h1, {
        x: () => -(h1.scrollWidth - window.innerWidth),
        ease: "none",
        scrollTrigger: { 
            trigger: h1, pin: true, scrub: 0.2, 
            end: () => "+=" + (h1.scrollWidth * 0.4)
        }
    });

    const h2 = document.getElementById("horizontal-2");
    gsap.from(h2, {
        x: () => -(h2.scrollWidth - window.innerWidth),
        ease: "none",
        scrollTrigger: { 
            trigger: h2, pin: true, scrub: 0.2, 
            start: "top top", end: () => "+=" + (h2.scrollWidth * 0.4)
        }
    });
}

const allSections = document.querySelectorAll('section, .vertical-section');
allSections.forEach(sec => {
    ScrollTrigger.create({
        trigger: sec,
        start: isMobile ? "top 40%" : "top center",
        end: isMobile ? "bottom 40%" : "bottom center",
        onToggle: self => {
            if (self.isActive) {
                const newMorph = sec.getAttribute('data-morph');
                const label = sec.getAttribute('data-label');
                const physics = sec.getAttribute('data-physics');
                const scrollDirElement = document.getElementById("scroll-dir");
                if (scrollDirElement) scrollDirElement.innerText = label;
                updatePhysics(physics, newMorph);
            }
        }
    });
});

function updatePhysics(mode, morph) {
    currentPhysics = mode;
    if(mode === "rain") {
        currentScale = { x: isMobile ? 0.8 : 0.6, y: isMobile ? 1.4 : 1.8 };
    } else {
        currentScale = { x: 1, y: 1 };
    }
    
    drops.forEach(d => {
        d.el.style.borderRadius = morph;
    });
}

const c1 = document.getElementById('c1'), c2 = document.getElementById('c2');
let m = { x: -200, y: -200 }, p1 = { x: -200, y: -200 }, p2 = { x: -200, y: -200 };

window.addEventListener('mousemove', e => { m.x = e.clientX; m.y = e.clientY; });
window.addEventListener('touchmove', e => { 
    if(e.touches.length > 0) {
        m.x = e.touches[0].clientX; m.y = e.touches[0].clientY; 
    }
});

let lerpScale = { x: 1, y: 1 };

function animate() {
    lerpScale.x += (currentScale.x - lerpScale.x) * 0.1;
    lerpScale.y += (currentScale.y - lerpScale.y) * 0.1;

    p1.x += (m.x - p1.x) * 0.15; p1.y += (m.y - p1.y) * 0.15;
    p2.x += (m.x - p2.x) * 0.1; p2.y += (m.y - p2.y) * 0.1;
    
    if (c1 && c2) {
        c1.style.transform = `translate(${p1.x - 40}px, ${p1.y - 40}px)`;
        c2.style.transform = `translate(${p2.x - 25}px, ${p2.y - 25}px)`;
    }

    const transformScale = `scale(${lerpScale.x}, ${lerpScale.y})`;

    drops.forEach(d => {
        if (currentPhysics === "rain") {
            d.y += d.baseVy;
            if (d.y > window.innerHeight + 60) {
                d.y = -80;
                d.x = Math.random() * window.innerWidth;
            }
        } else {
            d.x += d.vx; d.y += d.vy;
            if (d.x < -50 || d.x > window.innerWidth + 50) d.vx *= -1;
            if (d.y < -50 || d.y > window.innerHeight + 50) d.vy *= -1;
        }
        
        d.el.style.transform = `translate(${d.x - (d.size/2)}px, ${d.y - (d.size/2)}px) ${transformScale}`;
    });
    requestAnimationFrame(animate);
}