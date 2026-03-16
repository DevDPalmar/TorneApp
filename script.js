// ==========================================
// LÓGICA DE PESTAÑAS (Crear Sala / Unirse)
// ==========================================
function switchTab(tab) {
    // Quitamos la clase 'active' de todos los botones y contenidos
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active-content'));

    // Activamos la pestaña seleccionada
    if(tab === 'crear') {
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
        document.getElementById('crear-sala').classList.add('active-content');
    } else {
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        document.getElementById('unirse-sala').classList.add('active-content');
    }
}
// Exponemos la función al entorno global para que funcione el 'onclick' del HTML
window.switchTab = switchTab;


// ==========================================
// MODO CLARO / OSCURO
// ==========================================
const themeToggleBtn = document.getElementById('theme-toggle');

// Comprobar si el usuario ya tenía el modo oscuro guardado de antes
if (localStorage.getItem('theme') === 'dark') {
    document.body.setAttribute('data-theme', 'dark');
    themeToggleBtn.textContent = '☀️';
}

themeToggleBtn.addEventListener('click', () => {
    // Si ya está oscuro, lo pasamos a claro
    if (document.body.getAttribute('data-theme') === 'dark') {
        document.body.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        themeToggleBtn.textContent = '🌙'; 
    } 
    // Si está claro, lo pasamos a oscuro
    else {
        document.body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        themeToggleBtn.textContent = '☀️'; 
    }
});


// ==========================================
// MODO DEMO: EL BOTÓN SECRETO (5 Clics)
// ==========================================
let clickCount = 0;
let clickTimer;
const logoTitle = document.getElementById('logo-title');

if (logoTitle) {
    logoTitle.addEventListener('click', () => {
        clickCount++;
        clearTimeout(clickTimer);
        
        // El usuario tiene 2 segundos para hacer los 5 clics seguidos, sino se reinicia
        clickTimer = setTimeout(() => { clickCount = 0; }, 2000);

        if (clickCount >= 5) {
            clickCount = 0; // Reiniciamos el contador por si acaso
            
            // Guardamos en la memoria local que estamos en modo demo y somos el dueño
            localStorage.setItem('torneapp_demo', 'true');
            localStorage.setItem('torneapp_role', 'owner'); 
            
            // Redirigimos al panel
            window.location.href = 'panel.html';
        }
    });
}


// ==========================================
// NAVEGACIÓN NORMAL DE FORMULARIOS
// ==========================================
const formCrear = document.getElementById('form-crear');
if (formCrear) {
    formCrear.addEventListener('submit', function(event) {
        event.preventDefault(); // Evita que la página se recargue al enviar el formulario
        
        // Limpiamos el demo y asignamos rol de creador
        localStorage.removeItem('torneapp_demo');
        localStorage.setItem('torneapp_role', 'owner');
        window.location.href = 'panel.html';
    });
}

const formUnirse = document.getElementById('form-unirse');
if (formUnirse) {
    formUnirse.addEventListener('submit', function(event) {
        event.preventDefault(); // Evita que la página se recargue al enviar el formulario
        
        // Limpiamos el demo y asignamos rol de espectador/jugador
        localStorage.removeItem('torneapp_demo');
        localStorage.setItem('torneapp_role', 'viewer'); 
        window.location.href = 'panel.html';
    });
}
