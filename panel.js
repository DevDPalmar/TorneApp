document.addEventListener('DOMContentLoaded', () => {
    // Configuración del Tema
    const themeBtn = document.getElementById('theme-toggle');
    if (localStorage.getItem('theme') === 'dark') document.body.setAttribute('data-theme', 'dark');

    themeBtn.addEventListener('click', () => {
        const isDark = document.body.hasAttribute('data-theme');
        isDark ? document.body.removeAttribute('data-theme') : document.body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    });

    // Carga de Datos
    const isDemo = localStorage.getItem('torneapp_demo') === 'true';
    const userRole = localStorage.getItem('torneapp_role') || 'viewer';

    document.getElementById('display-role').textContent = userRole === 'owner' ? 'Admin' : 'Jugador';
    
    if (userRole === 'owner') {
        document.getElementById('admin-controls').style.display = 'block';
    }

    if (isDemo) {
        document.getElementById('display-room-id').textContent = 'DEMO-88';
        cargarJugadoresDemo();
    }
});

function cargarJugadoresDemo() {
    const list = document.getElementById('players-list');
    const players = [
        { name: 'Diego_Dev', pts: 150, rank: 1 },
        { name: 'Eevee_Fan', pts: 120, rank: 2 },
        { name: 'Asphalt_King', pts: 90, rank: 3 }
    ];

    document.getElementById('player-count').textContent = players.length;
    list.innerHTML = '';

    players.forEach(p => {
        const div = document.createElement('div');
        div.className = 'player-row';
        div.innerHTML = `
            <div class="player-info">
                <div class="rank-circle">${p.rank}</div>
                <span>${p.name}</span>
            </div>
            <span style="font-weight:bold; color:var(--primary)">${p.pts} pts</span>
        `;
        list.appendChild(div);
    });
}

document.getElementById('exit-btn').addEventListener('click', () => {
    window.location.href = 'index.html';
});
