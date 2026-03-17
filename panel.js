// ==========================================
// ESTADO GLOBAL DE LA SALA (Memoria Temporal)
// ==========================================
let estadoSala = {
    tasaCambio: 0,
    costoEntradaUsd: 0,
    modoEquipo: 'individual', 
    modoVictoria: 'kills',    
    premioKillUsd: 0,
    rolActual: 'admin' // Puede ser 'admin' o 'espectador'
};

// ==========================================
// 1. INICIALIZACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    configurarTema();

    // Comprobar si es Demo
    const isDemo = localStorage.getItem('torneapp_demo') === 'true';
    if (isDemo) {
        document.getElementById('display-id').textContent = 'ID: DEMO-2026';
        document.getElementById('display-pass').textContent = '🔑: Sin PIN';
    }

    configurarListenersEconomia();
    configurarListenersModos();
    configurarBotonesPrincipales();
    configurarMenuDemo();

    // Asegurar que siempre haya 1 persona (El Admin)
    actualizarContadorUsuarios(1);
    
    // Inyectar la primera fila inicial de forma correcta
    renderizarFilas(); 
});

// ==========================================
// 2. LÓGICA DE ECONOMÍA
// ==========================================
function configurarListenersEconomia() {
    ['valor-dolar', 'costo-entrada', 'premio-kill'].forEach(id => {
        document.getElementById(id).addEventListener('input', (e) => {
            if(id === 'valor-dolar') estadoSala.tasaCambio = parseFloat(e.target.value) || 0;
            if(id === 'costo-entrada') estadoSala.costoEntradaUsd = parseFloat(e.target.value) || 0;
            if(id === 'premio-kill') estadoSala.premioKillUsd = parseFloat(e.target.value) || 0;
            actualizarCalculos();
        });
    });
}

function actualizarCalculos() {
    document.getElementById('entrada-local').textContent = (estadoSala.costoEntradaUsd * estadoSala.tasaCambio).toFixed(2);
    document.getElementById('kill-local').textContent = (estadoSala.premioKillUsd * estadoSala.tasaCambio).toFixed(2);
    actualizarFinanzasTotales();
}

// ==========================================
// 3. LÓGICA DE MODOS DE JUEGO
// ==========================================
function configurarListenersModos() {
    const btnEquipo = document.querySelectorAll('#toggle-equipo .toggle-btn');
    const btnVictoria = document.querySelectorAll('#toggle-victoria .toggle-btn');
    const cajaPremioKill = document.getElementById('caja-premio-kill');

    btnEquipo.forEach(btn => {
        btn.addEventListener('click', (e) => {
            btnEquipo.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            estadoSala.modoEquipo = e.target.getAttribute('data-val');
            renderizarFilas(true); // Reinicia la lista con el nuevo formato
        });
    });

    btnVictoria.forEach(btn => {
        btn.addEventListener('click', (e) => {
            btnVictoria.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            estadoSala.modoVictoria = e.target.getAttribute('data-val');
            
            if (estadoSala.modoVictoria === 'kills') {
                cajaPremioKill.style.display = 'flex';
            } else {
                cajaPremioKill.style.display = 'none';
                estadoSala.premioKillUsd = 0;
                document.getElementById('premio-kill').value = '';
                actualizarCalculos();
            }
            renderizarFilas(true); 
        });
    });
}

// ==========================================
// 4. REGISTRO DINÁMICO Y PRE-CARGADO
// ==========================================
function renderizarFilas(reset = false) {
    const container = document.getElementById('registro-container');
    if (reset) container.innerHTML = ''; 

    // Si está vacío, inyectamos una fila por defecto
    if (container.children.length === 0) {
        agregarFilaJugador();
    }
}

function agregarFilaJugador() {
    const container = document.getElementById('registro-container');
    const idUnico = Date.now();
    const div = document.createElement('div');
    div.classList.add('input-group', 'flex-row', 'player-row');
    div.id = `player-row-${idUnico}`;

    let html = '';

    // INDIVIDUAL
    if (estadoSala.modoEquipo === 'individual') {
        html += `<input type="text" placeholder="Nombre del jugador" style="flex: 2;">
                 <input type="color" value="#0284c7" style="flex: 0.5; height: 42px; padding: 0;">`;
        if (estadoSala.modoVictoria === 'kills') {
            html += `<input type="number" placeholder="Cant. Kills" class="calc-kill" style="flex: 1;">`;
        } else {
            // Posición (Incluye campo de premio en USD)
            html += `<input type="number" placeholder="Lugar (1°, 2°)" style="flex: 1;">
                     <input type="number" placeholder="Premio Ganado ($ USD)" class="calc-premio" style="flex: 1.5;">`;
        }
    } 
    // DÚOS
    else {
        html += `<div style="flex: 3; display: flex; flex-direction: column; gap: 5px;">
                    <input type="text" placeholder="Jugador 1">
                    <input type="text" placeholder="Jugador 2">
                 </div>
                 <input type="color" value="#0284c7" style="flex: 0.5; height: auto; padding: 0;">`;
        if (estadoSala.modoVictoria === 'kills') {
            html += `<div style="flex: 1; display: flex; flex-direction: column; gap: 5px;">
                        <input type="number" placeholder="Kills J1" class="calc-kill">
                        <input type="number" placeholder="Kills J2" class="calc-kill">
                     </div>`;
        } else {
            html += `<div style="flex: 1.5; display: flex; flex-direction: column; gap: 5px;">
                        <input type="number" placeholder="Lugar del Dúo">
                        <input type="number" placeholder="Premio ($ USD)" class="calc-premio">
                     </div>`;
        }
    }

    html += `<button class="btn-danger btn-del" onclick="eliminarFila(${idUnico})" style="padding: 10px; border: none; border-radius: 8px;">🗑️</button>`;
    
    div.innerHTML = html;
    container.appendChild(div);

    // Añadir listeners a los nuevos inputs para actualizar finanzas en tiempo real
    div.querySelectorAll('.calc-kill, .calc-premio').forEach(input => {
        input.addEventListener('input', actualizarFinanzasTotales);
    });

    actualizarContadorUsuarios();
    actualizarFinanzasTotales();
}

function configurarBotonesPrincipales() {
    document.getElementById('btn-add-player').addEventListener('click', agregarFilaJugador);
    
    document.getElementById('btn-reset').addEventListener('click', () => {
        if(confirm('¿Limpiar todos los paneles y empezar de cero?')){
            document.querySelectorAll('#panel-economia input, #panel-config input').forEach(i => i.value = '');
            estadoSala.tasaCambio = 0;
            estadoSala.costoEntradaUsd = 0;
            estadoSala.premioKillUsd = 0;
            actualizarCalculos();
            renderizarFilas(true); // Reinicia con 1 fila
        }
    });

    document.getElementById('btn-close').addEventListener('click', () => {
        if(confirm('¿Seguro que quieres cerrar la sala?')){
            window.location.href = 'index.html';
        }
    });
}

// ==========================================
// 5. FINANZAS Y UTILIDADES
// ==========================================
window.eliminarFila = function(id) {
    const fila = document.getElementById(`player-row-${id}`);
    if (fila) fila.remove();
    
    // Si borras todas las filas, vuelve a poner una limpia automáticamente
    const container = document.getElementById('registro-container');
    if (container.children.length === 0) agregarFilaJugador();
    
    actualizarContadorUsuarios();
    actualizarFinanzasTotales();
};

function actualizarContadorUsuarios(forzarSuma = 0) {
    const count = document.querySelectorAll('.player-row').length;
    // Siempre mostrará al menos 1 (el admin) más los registrados
    const total = count > 0 ? count + forzarSuma : 1; 
    document.getElementById('user-count').textContent = total;
}

function actualizarFinanzasTotales() {
    const filas = document.querySelectorAll('.player-row');
    const multiplicador = estadoSala.modoEquipo === 'duos' ? 2 : 1;
    
    // 1. RECAUDACIÓN BRUTA (Moneda Local)
    const recaudacionUsd = filas.length * multiplicador * estadoSala.costoEntradaUsd;
    const recaudacionLocal = recaudacionUsd * estadoSala.tasaCambio;
    document.getElementById('total-recaudado').textContent = recaudacionLocal.toFixed(2);

    // 2. GASTOS EN PREMIOS (Moneda Local)
    let totalPremiosUsd = 0;
    
    if (estadoSala.modoVictoria === 'kills') {
        const inputsKills = document.querySelectorAll('.calc-kill');
        let totalKills = 0;
        inputsKills.forEach(input => totalKills += (parseFloat(input.value) || 0));
        totalPremiosUsd = totalKills * estadoSala.premioKillUsd;
    } else {
        const inputsPremios = document.querySelectorAll('.calc-premio');
        inputsPremios.forEach(input => totalPremiosUsd += (parseFloat(input.value) || 0));
    }

    const totalPremiosLocal = totalPremiosUsd * estadoSala.tasaCambio;

    // 3. GANANCIA NETA
    const gananciaNeta = recaudacionLocal - totalPremiosLocal;
    document.getElementById('total-ganancia').textContent = gananciaNeta.toFixed(2);
}

// ==========================================
// 6. MENÚ DEMO Y TEMAS
// ==========================================
function configurarTema() {
    const themeBtn = document.getElementById('theme-toggle');
    if (localStorage.getItem('theme') === 'dark') document.body.setAttribute('data-theme', 'dark');

    themeBtn.addEventListener('click', () => {
        const isDark = document.body.hasAttribute('data-theme');
        isDark ? document.body.removeAttribute('data-theme') : document.body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    });
}

function configurarMenuDemo() {
    const demoBtn = document.getElementById('demo-menu-btn');
    
    demoBtn.addEventListener('click', () => {
        const accion = prompt(
            "🛠️ MENÚ DEMO - Elige una opción:\n\n" +
            "1. Cambiar a vista Espectador\n" +
            "2. Cambiar a vista Admin\n" +
            "3. Añadir 3 Jugadores Bot\n" +
            "4. Limpiar caché (Reset total)"
        );

        if (accion === "1") {
            estadoSala.rolActual = 'espectador';
            document.querySelectorAll('.btn-danger, #btn-add-player, #btn-reset, #panel-economia').forEach(el => el.style.display = 'none');
            alert("Vista Espectador activada. Controles ocultos.");
        } else if (accion === "2") {
            estadoSala.rolActual = 'admin';
            document.querySelectorAll('.btn-danger, #btn-add-player, #btn-reset, #panel-economia').forEach(el => el.style.display = '');
            alert("Vista Admin restaurada.");
        } else if (accion === "3") {
            agregarFilaJugador();
            agregarFilaJugador();
            agregarFilaJugador();
            alert("3 Bots añadidos al registro.");
        } else if (accion === "4") {
            localStorage.clear();
            location.reload();
        }
    });
}
