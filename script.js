// --- LÓGICA DE PESTAÑAS ---
function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active-content'));

    if(tab === 'crear') {
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
        document.getElementById('crear-sala').classList.add('active-content');
    } else {
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        document.getElementById('unirse-sala').classList.add('active-content');
    }
}

// --- MODO OSCURO / CLARO ---
const themeToggleBtn = document.getElementById('theme-toggle');

// Cargar tema guardado
if (localStorage.getItem('theme') === 'dark') {
    document.body.setAttribute('data-theme', 'dark');
    themeToggleBtn.textContent = '☀️';
}

themeToggleBtn.addEventListener('click', () => {
    if (document.body.getAttribute('data-theme') === 'dark') {
        document.body.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        themeToggleBtn.textContent = '🌙'; 
    } else {
        document.body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        themeToggleBtn.textContent = '☀️'; 
    }
});

// --- EL MODO DEMO (5 CLICS EN EL LOGO) ---
let clickCount = 0;
let clickTimer;

document.getElementById('logo-title').addEventListener('click', () => {
    clickCount++;
    clearTimeout(clickTimer);
    
    // Si no haces los 5 clics en 2 segundos, se reinicia
    clickTimer = setTimeout(() => { clickCount = 0; }, 2000);

    if (clickCount >= 5) {
        clickCount = 0;
        localStorage.setItem('torneapp_demo', 'true');
        localStorage.setItem('torneapp_role', 'owner'); // Entras como dueño por defecto
        window.location.href = 'panel.html';
    }
});

// --- REDIRECCIÓN NORMAL ---
document.getElementById('form-crear').addEventListener('submit', function(event) {
    event.preventDefault();
    localStorage.removeItem('torneapp_demo');
    localStorage.setItem('torneapp_role', 'owner');
    window.location.href = 'panel.html';
});

document.getElementById('form-unirse').addEventListener('submit', function(event) {
    event.preventDefault();
    localStorage.removeItem('torneapp_demo');
    localStorage.setItem('torneapp_role', 'viewer'); // Por defecto entran como vista
    window.location.href = 'panel.html';
});
