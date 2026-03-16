// ==========================================
// INICIALIZACIÓN Y CONFIGURACIÓN DE TEMA
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Sincronizar el tema (Claro/Oscuro)
    const themeToggleBtn = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme === 'dark') {
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

    // 2. Detectar Modo y Rol
    const isDemo = localStorage.getItem('torneapp_demo') === 'true';
    const userRole = localStorage.getItem('torneapp_role') || 'viewer';

    // 3. Ejecutar la carga inicial
    inicializarPanel(isDemo, userRole);
});

// ==========================================
// FUNCION PRINCIPAL DE CARGA
// ==========================================
function inicializarPanel(isDemo, role) {
    const statusBadge = document.getElementById('status-badge');
    const roomIdDisplay = document.getElementById('display-room-id');
    const roleDisplay = document.getElementById('display-role');
    const adminSection = document.getElementById('admin-controls');

    // Mostrar el rol en pantalla
    roleDisplay.textContent = role === 'owner' ? 'Administrador' : 'Espectador';

    if (isDemo) {
        statusBadge.textContent = 'MODO DEMO ACTIVO';
        statusBadge.style.background = '#0284c7';
        statusBadge.style.color = 'white';
        roomIdDisplay.textContent = 'DEMO-12345';
        
        cargarDatosPrueba();
    } else {
        statusBadge.textContent = 'SALA EN VIVO';
        roomIdDisplay.textContent = 'ESPERANDO...';
        // Aquí irá la conexión a Firebase en el futuro
    }

    // Mostrar controles de admin solo si es el dueño
    if (role === 'owner') {
        adminSection.style.display = 'block';
    } else {
        // Ocultar columnas de acción en la tabla para espectadores
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
    }
}

// ==========================================
// DATOS DE PRUEBA (PARA EL MODO DEMO)
// ==========================================
function cargarDatosPrueba() {
    const playersList = document.getElementById('players-list');
    const playerCount = document.getElementById('player-count');
    
    // Lista de jugadores ficticios
    const jugadoresDemo = [
        { pos: 1, nombre: 'Eevee_Master', puntos: 2500 },
        { pos: 2, nombre: 'Flareon_Fire', puntos: 2100 },
        { pos: 3, nombre: 'GamerTech_04', puntos: 1850 },
        { pos: 4, nombre: 'Valkyrie_Driver', puntos: 1200 }
    ];

    playerCount.textContent = `${jugadoresDemo.length} / 10`;

    // Limpiar lista actual
    playersList.innerHTML = '';

    // Insertar jugadores en la tabla
    jugadoresDemo.forEach(jugador => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>#${jugador.pos}</strong></td>
            <td>${jugador.nombre}</td>
            <td>${jugador.puntos} pts</td>
            <td class="admin-only">
                <button class="btn-secondary" style="padding: 5px 10px; font-size: 0.7rem;">Editar</button>
            </td>
        `;
        playersList.appendChild(row);
    });

    // Cargar un encuentro de prueba
    const matchesContainer = document.getElementById('matches-container');
    matchesContainer.innerHTML = `
        <div style="background: var(--bg-color); padding: 15px; border-radius: 8px; text-align: center; border: 1px dashed var(--primary);">
            <p style="font-weight: bold; color: var(--primary);">PARTIDA FINAL</p>
            <p style="margin: 5px 0;">Eevee_Master  VS  Flareon_Fire</p>
            <small>Mapa: Crash (Domino)</small>
        </div>
    `;
}

// ==========================================
// BOTÓN SALIR
// ==========================================
document.getElementById('exit-btn').addEventListener('click', () => {
    if (confirm('¿Seguro que quieres salir del panel?')) {
        // Limpiamos los datos temporales del modo demo
        localStorage.removeItem('torneapp_demo');
        localStorage.removeItem('torneapp_role');
        window.location.href = 'index.html';
    }
});

// ==========================================
// FUNCIONES DE BOTONES (PROVISIONALES)
// ==========================================
window.abrirModalJugador = () => {
    alert('Función para añadir jugadores (Próximamente con Firebase)');
};

window.iniciarTorneo = () => {
    alert('¡El torneo ha comenzado! Los datos se sincronizarán en tiempo real.');
};

window.finalizarTorneo = () => {
    if(confirm('¿Finalizar el torneo y declarar ganadores?')) {
        alert('Torneo finalizado.');
    }
};
