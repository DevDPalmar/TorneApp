// Función para cambiar entre las pestañas (Crear Sala / Unirse a Sala)
function switchTab(tab) {
    // Quitar clase activa de todos los botones y contenidos
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active-content'));

    // Añadir clase activa al seleccionado
    if(tab === 'crear') {
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
        document.getElementById('crear-sala').classList.add('active-content');
    } else {
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        document.getElementById('unirse-sala').classList.add('active-content');
    }
}

// Lógica para el botón de Modo Claro / Oscuro
const themeToggleBtn = document.getElementById('theme-toggle');

themeToggleBtn.addEventListener('click', () => {
    // Verifica si el body tiene el atributo de tema oscuro
    if (document.body.getAttribute('data-theme') === 'dark') {
        document.body.removeAttribute('data-theme');
        themeToggleBtn.textContent = '🌙'; // Cambia el icono a luna
    } else {
        document.body.setAttribute('data-theme', 'dark');
        themeToggleBtn.textContent = '☀️'; // Cambia el icono a sol
    }
});

