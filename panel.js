// ==========================================
// ESTADO GLOBAL DE LA SALA (Memoria Temporal)
// ==========================================
let estadoSala = {
    tasaCambio: 0,
    costoEntradaUsd: 0,
    modoEquipo: 'individual', // 'individual' o 'duos'
    modoVictoria: 'kills',    // 'kills' o 'posicion'
    premioKillUsd: 0,
    jugadores: []
};

// ==========================================
// 1. INICIALIZACIÓN AL CARGAR LA PÁGINA
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Sincronizar Tema (Oscuro/Claro)
    configurarTema();

    // Comprobar si entramos por el "Botón Secreto" (Modo Demo)
    const isDemo = localStorage.getItem('torneapp_demo') === 'true';
    if (isDemo) {
        document.getElementById('display-id').textContent = 'ID: DEMO';
        document.getElementById('display-pass').textContent = '🔑: Sin PIN';
    }

    // Inicializar los listeners (los oídos del programa)
    configurarListenersEconomia();
    configurarListenersModos();
    configurarBotonesPrincipales();
});

// ==========================================
// 2. LÓGICA DE ECONOMÍA (PANEL 1 Y 2)
// ==========================================
function configurarListenersEconomia() {
    const inputDolar = document.getElementById('valor-dolar');
    const inputEntrada = document.getElementById('costo-entrada');
    const inputPremioKill = document.getElementById('premio-kill');

    // Cuando escribes el valor del dólar
    inputDolar.addEventListener('input', (e) => {
        estadoSala.tasaCambio = parseFloat(e.target.value) || 0;
        actualizarCalculos();
    });

    // Cuando escribes el costo de entrada
    inputEntrada.addEventListener('input', (e) => {
        estadoSala.costoEntradaUsd = parseFloat(e.target.value) || 0;
        actualizarCalculos();
    });

    // Cuando escribes el premio por Kill
    inputPremioKill.addEventListener('input', (e) => {
        estadoSala.premioKillUsd = parseFloat(e.target.value) || 0;
        actualizarCalculos();
    });
}

// Función maestra que actualiza todos los números en pantalla
function actualizarCalculos() {
    const totalLocalEntrada = estadoSala.costoEntradaUsd * estadoSala.tasaCambio;
    const totalLocalKill = estadoSala.premioKillUsd * estadoSala.tasaCambio;

    document.getElementById('entrada-local').textContent = totalLocalEntrada.toFixed(2);
    document.getElementById('kill-local').textContent = totalLocalKill.toFixed(2);
    
    actualizarFinanzasTotales();
}

// ==========================================
// 3. LÓGICA DE MODOS DE JUEGO (PANEL 2)
// ==========================================
function configurarListenersModos() {
    const botonesEquipo = document.querySelectorAll('#toggle-equipo .toggle-btn');
    const botonesVictoria = document.querySelectorAll('#toggle-victoria .toggle-btn');
    const cajaPremioKill = document.getElementById('caja-premio-kill');

    // Cambiar entre Individual / Dúos
    botonesEquipo.forEach(btn => {
        btn.addEventListener('click', (e) => {
            botonesEquipo.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            estadoSala.modoEquipo = e.target.getAttribute('data-val');
            limpiarListaJugadores(); // Si cambias el modo, se limpia la lista
        });
    });

    // Cambiar entre Kills / Posición
    botonesVictoria.forEach(btn => {
        btn.addEventListener('click', (e) => {
            botonesVictoria.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            estadoSala.modoVictoria = e.target.getAttribute('data-val');
            
            // Mostrar u ocultar el campo de "Premio por Kill"
            if (estadoSala.modoVictoria === 'kills') {
                cajaPremioKill.style.display = 'flex';
            } else {
                cajaPremioKill.style.display = 'none';
                estadoSala.premioKillUsd = 0; // Resetear el premio
                document.getElementById('premio-kill').value = '';
                actualizarCalculos();
            }
            limpiarListaJugadores();
        });
    });
}

// ==========================================
// 4. REGISTRO DINÁMICO (PANEL 3)
// ==========================================
function configurarBotonesPrincipales() {
    const btnAddPlayer = document.getElementById('btn-add-player');
    const containerRegistro = document.getElementById('registro-container');

    btnAddPlayer.addEventListener('click', () => {
        // Quitar el mensaje de vacío si existe
        const emptyMsg = containerRegistro.querySelector('.empty-msg');
        if (emptyMsg) emptyMsg.remove();

        const idUnico = Date.now(); // ID temporal para el modo offline
        const nuevaFila = document.createElement('div');
        nuevaFila.classList.add('input-group', 'flex-row');
        nuevaFila.id = `player-row-${idUnico}`;

        // Lógica: Crear los campos según lo que se eligió arriba
        let htmlCampos = '';

        if (estadoSala.modoEquipo === 'individual') {
            htmlCampos += `<input type="text" placeholder="Nombre" style="flex: 2;">`;
            htmlCampos += `<input type="color" value="#0284c7" style="flex: 0.5; height: 42px; padding: 0;">`;
            
            if (estadoSala.modoVictoria === 'kills') {
                htmlCampos += `<input type="number" placeholder="Kills" style="flex: 1;" onchange="actualizarFinanzasTotales()">`;
            } else {
                htmlCampos += `<input type="number" placeholder="Posición (1,2...)" style="flex: 1;">`;
            }
        } else {
            // Modo Dúos
            htmlCampos += `
                <div style="flex: 3; display: flex; flex-direction: column; gap: 5px;">
                    <input type="text" placeholder="Nombre Jugador 1">
                    <input type="text" placeholder="Nombre Jugador 2">
                </div>
                <input type="color" value="#0284c7" style="flex: 0.5; height: auto; padding: 0;">
            `;
            
            if (estadoSala.modoVictoria === 'kills') {
                htmlCampos += `
                    <div style="flex: 1; display: flex; flex-direction: column; gap: 5px;">
                        <input type="number" placeholder="Kills J1" onchange="actualizarFinanzasTotales()">
                        <input type="number" placeholder="Kills J2" onchange="actualizarFinanzasTotales()">
                    </div>
                `;
            } else {
                htmlCampos += `<input type="number" placeholder="Posición (1,2...)" style="flex: 1; align-self: center;">`;
            }
        }

        // Botón de eliminar
        htmlCampos += `
            <button onclick="eliminarFila(${idUnico})" class="btn-danger" style="padding: 10px; border: none; border-radius: 8px; cursor: pointer;">
                🗑️
            </button>
        `;

        nuevaFila.innerHTML = htmlCampos;
        containerRegistro.appendChild(nuevaFila);
        
        // Aumentar el contador de personas en la barra superior
        actualizarContadorUsuarios();
    });

    // Botones de la barra superior
    document.getElementById('btn-reset').addEventListener('click', resetearTodo);
    document.getElementById('btn-close').addEventListener('click', () => {
        if(confirm('¿Seguro que quieres cerrar la sala? Los datos no guardados se perderán.')){
            window.location.href = 'index.html';
        }
    });
}

// ==========================================
// 5. UTILIDADES Y FINANZAS
// ==========================================
window.eliminarFila = function(id) {
    document.getElementById(`player-row-${id}`).remove();
    actualizarContadorUsuarios();
    actualizarFinanzasTotales();
};

function limpiarListaJugadores() {
    document.getElementById('registro-container').innerHTML = '<p class="empty-msg">Configura el torneo arriba para empezar a registrar.</p>';
    actualizarContadorUsuarios();
}

function actualizarContadorUsuarios() {
    // Cuenta cuántas filas de jugadores hay (Aproximación para el demo)
    const count = document.querySelectorAll('[id^="player-row-"]').length;
    document.getElementById('user-count').textContent = count;
}

function actualizarFinanzasTotales() {
    // Calculamos el dinero bruto que entra (Cantidad de filas * Costo de Entrada)
    const filasParticipantes = document.querySelectorAll('[id^="player-row-"]').length;
    
    // Si es individual cobra 1 entrada por fila, si es dúo cobra 2 (puedes ajustar esta regla)
    const multiplicador = estadoSala.modoEquipo === 'duos' ? 2 : 1;
    const totalDolaresBruto = filasParticipantes * multiplicador * estadoSala.costoEntradaUsd;
    const totalLocalBruto = totalDolaresBruto * estadoSala.tasaCambio;

    document.getElementById('total-recaudado').textContent = totalLocalBruto.toFixed(2);

    // Aquí irá la lógica más compleja de restar los premios (Ganancia Neta)
    // Por ahora, en este paso, lo igualamos o hacemos un estimado:
    document.getElementById('total-ganancia').textContent = totalLocalBruto.toFixed(2); 
}

function resetearTodo() {
    if(confirm('¿Limpiar todos los paneles y empezar de cero?')){
        document.querySelectorAll('input').forEach(input => input.value = '');
        estadoSala.tasaCambio = 0;
        estadoSala.costoEntradaUsd = 0;
        estadoSala.premioKillUsd = 0;
        actualizarCalculos();
        limpiarListaJugadores();
    }
}

// ==========================================
// TEMA OSCURO/CLARO
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
