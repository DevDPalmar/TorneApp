// ==========================================
// INICIALIZACIÓN Y TEMA
// ==========================================
const isDemo = localStorage.getItem('torneapp_demo') === 'true';
let currentRole = localStorage.getItem('torneapp_role') || 'viewer';

// Sincronizar Tema
const themeToggleBtn = document.getElementById('theme-toggle');
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

// ==========================================
// MODO DEMO Y ROLES
// ==========================================
if (isDemo) {
    document.getElementById('room-id').textContent = 'MODO-DEMO';
    document.getElementById('room-pass').textContent = '****';
    
    const roleSwitcher = document.getElementById('demo-role-switcher');
    roleSwitcher.classList.remove('hidden');
    roleSwitcher.value = currentRole;
    
    roleSwitcher.addEventListener('change', (e) => {
        currentRole = e.target.value;
        applyRoleRestrictions();
        showToast(`Cambiado a vista de: ${currentRole}`);
    });
}

function applyRoleRestrictions() {
    const btnExit = document.getElementById('btn-exit');
    const panelDivisas = document.getElementById('panel-divisas');
    const panelConfig = document.getElementById('panel-config');
    const panelRegistro = document.getElementById('panel-registro');
    const financesSection = document.getElementById('finances-section');
    const btnReset = document.getElementById('btn-reset');

    // Resetear vistas
    [panelDivisas, panelConfig, panelRegistro, financesSection, btnReset].forEach(el => el.classList.remove('hidden'));
    
    if (currentRole === 'owner') {
        btnExit.textContent = 'Cerrar Sala';
        btnExit.className = 'action-btn danger-btn';
    } 
    else if (currentRole === 'editor') {
        btnExit.textContent = 'Salir';
        btnExit.className = 'action-btn warning-btn';
        financesSection.classList.add('hidden'); // Editor no ve el dinero
        btnReset.classList.add('hidden'); // Editor no reinicia paneles
    } 
    else if (currentRole === 'viewer') {
        btnExit.textContent = 'Salir';
        btnExit.className = 'action-btn warning-btn';
        // Viewer solo ve la tabla
        panelDivisas.classList.add('hidden');
        panelConfig.classList.add('hidden');
        panelRegistro.classList.add('hidden');
        financesSection.classList.add('hidden');
        btnReset.classList.add('hidden');
    }
    
    renderTable(); // Re-renderizar para ocultar/mostrar botones de borrar
}

applyRoleRestrictions(); // Aplicar al cargar

// ==========================================
// LÓGICA DE INTERFAZ (TOGGLES Y DIVISAS)
// ==========================================
let modoJuego = 'individual';
let tipoPuntaje = 'kills';

// Toggles
document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const group = e.target.getAttribute('data-group');
        const val = e.target.getAttribute('data-val');
        
        // Quitar active del grupo
        document.querySelectorAll(`.toggle-btn[data-group="${group}"]`).forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        if (group === 'modo') {
            modoJuego = val;
            const input2 = document.getElementById('input-jugador-2');
            if (val === 'duos') {
                input2.classList.remove('hidden');
                document.getElementById('jugador-2').setAttribute('required', 'true');
            } else {
                input2.classList.add('hidden');
                document.getElementById('jugador-2').removeAttribute('required');
            }
        }

        if (group === 'puntaje') {
            tipoPuntaje = val;
            const killsExtra = document.getElementById('config-kills-extra');
            const inputPuntaje = document.getElementById('input-puntaje');
            if (val === 'kills') {
                killsExtra.classList.remove('hidden');
                inputPuntaje.placeholder = "Kills realizadas";
            } else {
                killsExtra.classList.add('hidden');
                inputPuntaje.placeholder = "Posición (1, 2, 3...)";
            }
        }
    });
});

// Calculadora de Divisas en Tiempo Real
const tasaInput = document.getElementById('tasa-cambio');
const costoUsdInput = document.getElementById('costo-entrada-usd');
const pagoKillUsdInput = document.getElementById('pago-kill-usd');

function actualizarConversiones() {
    const tasa = parseFloat(tasaInput.value) || 0;
    const costo = parseFloat(costoUsdInput.value) || 0;
    const pagoKill = parseFloat(pagoKillUsdInput.value) || 0;

    document.getElementById('costo-entrada-local').textContent = (costo * tasa).toFixed(2);
    document.getElementById('pago-kill-local').textContent = (pagoKill * tasa).toFixed(2);
    calcularFinanzas(); // Actualiza totales si cambia la moneda
}

tasaInput.addEventListener('input', actualizarConversiones);
costoUsdInput.addEventListener('input', actualizarConversiones);
pagoKillUsdInput.addEventListener('input', actualizarConversiones);

// ==========================================
// REGISTRO Y TABLA (MEMORIA TEMPORAL)
// ==========================================
let registros = [];

document.getElementById('form-registro').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const j1 = document.getElementById('jugador-1').value;
    const j2 = document.getElementById('jugador-2').value;
    const color = document.getElementById('equipo-color').value;
    const puntajeVal = parseInt(document.getElementById('input-puntaje').value) || 0;
    
    let nombreEquipo = modoJuego === 'individual' ? j1 : `${j1} & ${j2}`;
    let premioCalculado = 0;

    // Calcular premio (Por ahora solo fórmula de kills, la de posición se ampliará luego)
    if (tipoPuntaje === 'kills') {
        const tasa = parseFloat(tasaInput.value) || 0;
        const pagoUsd = parseFloat(pagoKillUsdInput.value) || 0;
        premioCalculado = puntajeVal * pagoUsd * tasa;
    }

    const nuevoRegistro = {
        id: Date.now().toString(),
        nombre: nombreEquipo,
        color: color,
        puntaje: puntajeVal,
        premioLocal: premioCalculado
    };

    registros.push(nuevoRegistro);
    
    // Ordenar: Si es Kills (mayor a menor), Si es Posición (menor a mayor)
    if (tipoPuntaje === 'kills') {
        registros.sort((a, b) => b.puntaje - a.puntaje);
    } else {
        registros.sort((a, b) => a.puntaje - b.puntaje);
    }

    renderTable();
    calcularFinanzas();
    showToast("Jugador añadido con éxito");
    
    // Limpiar form
    document.getElementById('jugador-1').value = '';
    document.getElementById('jugador-2').value = '';
    document.getElementById('input-puntaje').value = '';
});

function renderTable() {
    const tbody = document.getElementById('tabla-body');
    tbody.innerHTML = '';

    if (registros.length === 0) {
        tbody.innerHTML = `<tr class="empty-row"><td colspan="5">No hay registros aún.</td></tr>`;
        return;
    }

    registros.forEach((reg, index) => {
        const lugar = index + 1;
        const tr = document.createElement('tr');
        
        // Columna Acción: Oculta para viewers
        const actionHtml = currentRole === 'viewer' 
            ? `<td>-</td>` 
            : `<td><button class="icon-btn small-btn" onclick="borrarRegistro('${reg.id}')" title="Borrar">🗑️</button></td>`;

        tr.innerHTML = `
            <td><strong>#${lugar}</strong></td>
            <td><span style="display:inline-block; width:12px; height:12px; background-color:${reg.color}; border-radius:50%; margin-right:8px;"></span>${reg.nombre}</td>
            <td>${reg.puntaje} ${tipoPuntaje === 'kills' ? 'Kills' : 'º Lugar'}</td>
            <td>${reg.premioLocal.toFixed(2)} Local</td>
            ${actionHtml}
        `;
        tbody.appendChild(tr);
    });
}

window.borrarRegistro = function(id) {
    registros = registros.filter(r => r.id !== id);
    renderTable();
    calcularFinanzas();
    showToast("Registro eliminado");
};

// Botón Deshacer
document.getElementById('btn-deshacer').addEventListener('click', () => {
    if (registros.length > 0) {
        registros.pop(); // Elimina el último añadido en el array (aunque visualmente esté ordenado)
        renderTable();
        calcularFinanzas();
        showToast("Última acción deshecha");
    } else {
        mostrarError("Nada que deshacer");
    }
});

// ==========================================
// FINANZAS
// ==========================================
function calcularFinanzas() {
    const costoEntrada = parseFloat(document.getElementById('costo-entrada-usd').value) || 0;
    
    // Si es dúo, contamos como 1 entrada de equipo, o 2 individuales (por defecto asumamos 1 cuota por equipo/fila)
    const totalEntradasUsd = registros.length * costoEntrada; 
    
    // Calcular total de premios a pagar en USD (dividimos el premio local entre la tasa)
    const tasa = parseFloat(tasaInput.value) || 1; // Evitar división por cero
    let totalPremiosLocal = 0;
    registros.forEach(r => totalPremiosLocal += r.premioLocal);
    
    const totalPremiosUsd = totalPremiosLocal / tasa;
    const gananciaNetaUsd = totalEntradasUsd - totalPremiosUsd;

    document.getElementById('total-recaudado').textContent = `${totalEntradasUsd.toFixed(2)} USD`;
    document.getElementById('ganancia-neta').textContent = `${gananciaNetaUsd.toFixed(2)} USD`;
}

// ==========================================
// UTILIDADES (Copiar ID, Botón Salir, Toasts)
// ==========================================
document.getElementById('btn-copy-id').addEventListener('click', () => {
    const idStr = document.getElementById('room-id').textContent;
    navigator.clipboard.writeText(idStr).then(() => {
        showToast("ID copiada al portapapeles");
    });
});

document.getElementById('btn-exit').addEventListener('click', () => {
    if (currentRole === 'owner') {
        // En el futuro, aquí desactivaremos la sala en Firebase
        alert("Sala cerrada. Expulsando a todos...");
    }
    window.location.href = 'index.html';
});

document.getElementById('btn-reset').addEventListener('click', () => {
    if(confirm("¿Estás seguro de restablecer los paneles? Se borrará la tabla.")) {
        registros = [];
        renderTable();
        calcularFinanzas();
        showToast("Paneles restablecidos");
    }
});

// Sistema de Notificaciones (Toasts)
function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.style.cssText = `
        background-color: var(--primary-color); color: white; padding: 10px 20px; 
        border-radius: 6px; margin-top: 10px; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        animation: fadeInOut 3s forwards;
    `;
    toast.textContent = message;
    container.appendChild(toast);
    
    setTimeout(() => { toast.remove(); }, 3000);
}

// Ventana Modal de Error
function mostrarError(mensaje) {
    document.getElementById('error-message').textContent = mensaje;
    document.getElementById('error-modal').classList.remove('hidden');
}

window.closeErrorModal = function() {
    document.getElementById('error-modal').classList.add('hidden');
}

// CSS Dinámico para la animación del Toast
const style = document.createElement('style');
style.textContent = `
    .toast-container { position: fixed; top: 20px; right: 20px; z-index: 2000; }
    .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 3000; }
    .error-content { background: var(--card-bg); padding: 20px; border-radius: 8px; border-left: 5px solid var(--danger-color); min-width: 300px; text-align: center; position: relative;}
    .close-btn { position: absolute; top: 10px; right: 15px; cursor: pointer; font-size: 1.5rem; font-weight: bold;}
    @keyframes fadeInOut { 0% { opacity: 0; transform: translateY(-10px); } 10% { opacity: 1; transform: translateY(0); } 90% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(-10px); } }
`;
document.head.appendChild(style);
                      
