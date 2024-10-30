let seleccionando = false;
let seleccionModoArea = false;
let celdasSeleccionadas = [];
let celdaInicial = null;
let cultivosPlantados = [];
let diaActual = 1;
let cultivosDisponibles = []; // Mover la declaración aquí para que sea accesible en todas las funciones

// Mostrar el día actual en la interfaz
function mostrarDiaActual() {
    document.getElementById('diaActual').textContent = diaActual;
}

// Obtener el día actual
function obtenerDiaActual() {
    return diaActual;
}

// Activar el modo de agregar área y manejar la selección
document.getElementById('toggleAreaBtn').addEventListener('click', () => {
    if (!seleccionModoArea) {
        // Activar el modo de selección de área
        seleccionModoArea = true;
        celdasSeleccionadas = [];
        celdaInicial = null;
        limpiarSeleccion();
        document.getElementById('toggleAreaBtn').textContent = "Guardar el Área";
        document.getElementById('toggleAreaBtn').classList.add('active');
    } else {
        // Guardar el área seleccionada
        if (celdasSeleccionadas.length > 0) {
            abrirModal();
        } else {
            alert("No hay celdas seleccionadas para guardar.");
        }
    }
});

// Generar la cuadrícula
function generarCuadricula() {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    for (let i = 0; i < 42 * 15; i++) {
        const celda = document.createElement('div');
        celda.dataset.index = i;
        celda.classList.add('celda');
        celda.addEventListener('click', seleccionarCelda);
        grid.appendChild(celda);
    }
}

// Función para seleccionar el área entre dos celdas
function seleccionarCelda(e) {
    if (seleccionModoArea) {
        if (!celdaInicial) {
            celdaInicial = e.target;
            celdaInicial.classList.add('selected');
            celdasSeleccionadas.push(celdaInicial);
        } else {
            const celdaFinal = e.target;
            seleccionarAreaRectangular(celdaInicial, celdaFinal);
            celdaInicial = null;
        }
    }
}

// Seleccionar área rectangular entre dos celdas
function seleccionarAreaRectangular(celdaInicio, celdaFin) {
    const cols = 42;
    const indexInicio = parseInt(celdaInicio.dataset.index);
    const indexFin = parseInt(celdaFin.dataset.index);

    const startRow = Math.floor(indexInicio / cols);
    const startCol = indexInicio % cols;
    const endRow = Math.floor(indexFin / cols);
    const endCol = indexFin % cols;

    limpiarSeleccion();

    const rowStart = Math.min(startRow, endRow);
    const rowEnd = Math.max(startRow, endRow);
    const colStart = Math.min(startCol, endCol);
    const colEnd = Math.max(startCol, endCol);

    for (let row = rowStart; row <= rowEnd; row++) {
        for (let col = colStart; col <= colEnd; col++) {
            const index = row * cols + col;
            const celda = document.querySelector(`.grid div[data-index="${index}"]`);
            if (celda && !celda.classList.contains('bloqueado')) {
                celda.classList.add('selected');
                celdasSeleccionadas.push(celda);
            }
        }
    }
}

// Función para limpiar la selección actual
function limpiarSeleccion() {
    celdasSeleccionadas.forEach(celda => celda.classList.remove('selected'));
    celdasSeleccionadas = [];
}

// Función auxiliar para generar un color aleatorio para las áreas
function generarColorAleatorio() {
    const letras = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letras[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Abrir modal y cargar cultivos
async function abrirModal() {
    document.getElementById('areaModal').style.display = 'block';
    document.getElementById('fechaPlantacion').value = "Día " + obtenerDiaActual();
    await cargarCultivos();
}

// Cerrar modal
document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('areaModal').style.display = 'none';
});

// Cargar datos de cultivos desde JSON
async function cargarCultivos() {
    try {
        const response = await fetch('spring.json');
        cultivosDisponibles = await response.json();
        const tipoCultivoDropdown = document.getElementById('tipoCultivo');
        tipoCultivoDropdown.innerHTML = '';

        cultivosDisponibles.forEach(cultivo => {
            const option = document.createElement('option');
            option.value = cultivo.name;
            option.textContent = cultivo.name;
            tipoCultivoDropdown.appendChild(option);
        });

        tipoCultivoDropdown.addEventListener('change', () => {
            const cultivoSeleccionado = cultivosDisponibles.find(c => c.name === tipoCultivoDropdown.value);
            mostrarFasesCultivo(cultivoSeleccionado);
        });

        if (cultivosDisponibles.length > 0) mostrarFasesCultivo(cultivosDisponibles[0]);
    } catch (error) {
        console.error("Error al cargar los cultivos:", error);
    }
}

// Mostrar fases de crecimiento
function mostrarFasesCultivo(cultivo) {
    const estadoCultivoDiv = document.getElementById('estadoCultivo');
    estadoCultivoDiv.innerHTML = '';

    cultivo.stages.forEach(stage => {
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'estado';
        radio.value = stage.name;
        if (stage.name === 'Seed') radio.checked = true;

        const label = document.createElement('label');
        label.textContent = stage.name;

        const container = document.createElement('div');
        container.classList.add('radio-option');
        container.appendChild(radio);
        container.appendChild(label);

        estadoCultivoDiv.appendChild(container);
    });
}

// Guardar la información al hacer clic en "Guardar" en el modal
document.getElementById('guardarInfoBtn').addEventListener('click', () => {
    const nombreArea = document.getElementById('nombreArea').value;
    const tipoCultivo = document.getElementById('tipoCultivo').value;
    const estadoInicial = document.querySelector('input[name="estado"]:checked').value;
    const fechaPlantacion = document.getElementById('fechaPlantacion').value;

    if (nombreArea === "") {
        alert("Por favor, ingresa un nombre para el área.");
        return;
    }

    const color = generarColorAleatorio();
    celdasSeleccionadas.forEach(celda => {
        celda.classList.add('bloqueado');
        celda.style.backgroundColor = color;
        celda.classList.add('border');
        celda.style.borderColor = color;
        celda.classList.remove('selected');

        // Añadir imagen del cultivo en la celda
        const img = document.createElement('img');
        img.src = `img/${tipoCultivo.toLowerCase()}.gif`;
        img.alt = tipoCultivo;
        celda.appendChild(img);
    });

    // Obtener puntos iniciales según el clima actual
    const clima = document.getElementById('climaSelect').value;
    const puntosClima = obtenerPuntosPorClima(clima);

    agregarTarjetaCultivo({
        nombre: nombreArea,
        cultivo: tipoCultivo,
        estado: estadoInicial,
        fecha: fechaPlantacion,
        color: color,
        puntosSolDia: puntosClima.sol,
        puntosAguaDia: puntosClima.agua,
        puntosSolAcumulados: 0,
        puntosAguaAcumulados: 0,
        maxPuntosSol: obtenerPuntosMaximos(tipoCultivo, estadoInicial, 'sol'),
        maxPuntosAgua: obtenerPuntosMaximos(tipoCultivo, estadoInicial, 'agua'),
        regado: 0, // Valor de regado inicial
        diasEnEtapa: 0, // Días transcurridos en la etapa actual
        diasRequeridos: obtenerDiasRequeridos(tipoCultivo, estadoInicial)
    });

    document.getElementById('areaModal').style.display = 'none';
    limpiarSeleccion();
    seleccionModoArea = false;
    document.getElementById('toggleAreaBtn').textContent = "Agregar Área";
    document.getElementById('toggleAreaBtn').classList.remove('active');

    guardarCultivosEnLocalStorage();
});

// Función para obtener los puntos máximos de sol y agua para el estado actual
function obtenerPuntosMaximos(nombreCultivo, estado, tipo) {
    const cultivo = cultivosDisponibles.find(c => c.name === nombreCultivo);
    if (!cultivo) {
        console.error(`Cultivo ${nombreCultivo} no encontrado en los cultivos disponibles.`);
        return 0;
    }
    const stage = cultivo.stages.find(s => s.name === estado);
    if (!stage) {
        console.error(`Estado ${estado} no encontrado en el cultivo ${nombreCultivo}.`);
        return 0;
    }
    if (tipo === 'sol') {
        return stage.sunRange[1];
    } else if (tipo === 'agua') {
        return stage.waterRange[1];
    }
    return 0;
}

// Función para obtener los días requeridos en la etapa actual
function obtenerDiasRequeridos(nombreCultivo, estado) {
    const cultivo = cultivosDisponibles.find(c => c.name === nombreCultivo);
    if (!cultivo) {
        console.error(`Cultivo ${nombreCultivo} no encontrado en los cultivos disponibles.`);
        return 0;
    }
    const stage = cultivo.stages.find(s => s.name === estado);
    if (!stage) {
        console.error(`Estado ${estado} no encontrado en el cultivo ${nombreCultivo}.`);
        return 0;
    }
    return stage.days;
}

// Agregar tarjeta de cultivo en la sección correspondiente
function agregarTarjetaCultivo(info) {
    const tarjeta = document.createElement('div');
    tarjeta.classList.add('tarjeta');
    tarjeta.style.borderLeft = `10px solid ${info.color}`;
    tarjeta.dataset.nombre = info.nombre;

    // Barra de progreso para puntos de sol
    const progresoSol = document.createElement('div');
    progresoSol.classList.add('progress-bar');
    const progresoSolInner = document.createElement('div');
    progresoSolInner.classList.add('progress-bar-inner', 'sol');
    progresoSolInner.style.width = `0%`;
    progresoSolInner.style.backgroundColor = '#FFD700';
    progresoSol.appendChild(progresoSolInner);

    // Barra de progreso para puntos de agua
    const progresoAgua = document.createElement('div');
    progresoAgua.classList.add('progress-bar');
    const progresoAguaInner = document.createElement('div');
    progresoAguaInner.classList.add('progress-bar-inner', 'agua');
    progresoAguaInner.style.width = `0%`;
    progresoAguaInner.style.backgroundColor = '#00BFFF';
    progresoAgua.appendChild(progresoAguaInner);

    // Imagen del cultivo
    const imgCultivo = document.createElement('img');
    imgCultivo.src = `img/${info.cultivo.toLowerCase()}.gif`;
    imgCultivo.alt = info.cultivo;

    // Control de regado
    const wateringControls = document.createElement('div');
    wateringControls.classList.add('watering-controls');
    const wateringLabel = document.createElement('label');
    wateringLabel.textContent = 'Regado:';
    const wateringSelect = document.createElement('select');
    wateringSelect.innerHTML = `
        <option value="0" ${info.regado === 0 ? 'selected' : ''}>0</option>
        <option value="1" ${info.regado === 1 ? 'selected' : ''}>1</option>
        <option value="2" ${info.regado === 2 ? 'selected' : ''}>2</option>
    `;
    wateringSelect.addEventListener('change', (e) => {
        info.regado = parseInt(e.target.value);
        actualizarPuntosCultivo(info.nombre);
        guardarCultivosEnLocalStorage();
    });
    wateringControls.appendChild(wateringLabel);
    wateringControls.appendChild(wateringSelect);

    // Tip mejorado
    const tipRiego = document.createElement('p');
    tipRiego.classList.add('tip');
    tipRiego.textContent = generarTip(info, info.puntosSolAcumulados, info.puntosAguaAcumulados);

    tarjeta.innerHTML = `
        <h4>${info.nombre}</h4>
        <p><strong>Cultivo:</strong> ${info.cultivo}</p>
        <p><strong>Estado:</strong> <span class="estado">${info.estado}</span></p>
        <p><strong>Días en Etapa:</strong> <span class="dias">${info.diasEnEtapa}</span> / ${info.diasRequeridos}</p>
        <p><strong>Fecha de Plantación:</strong> ${info.fecha}</p>
        <p><strong>Puntos de Sol:</strong> <span class="sol">${info.puntosSolAcumulados}</span> / ${info.maxPuntosSol}</p>
    `;
    tarjeta.appendChild(progresoSol);
    tarjeta.innerHTML += `
        <p><strong>Puntos de Agua:</strong> <span class="agua">${info.puntosAguaAcumulados}</span> / ${info.maxPuntosAgua}</p>
    `;
    tarjeta.appendChild(progresoAgua);
    tarjeta.appendChild(wateringControls);
    tarjeta.appendChild(tipRiego);
    tarjeta.appendChild(imgCultivo);

    document.getElementById('tarjetasCultivos').appendChild(tarjeta);

    // Guardamos la información del cultivo en una estructura global
    cultivosPlantados.push({
        nombre: info.nombre,
        cultivo: info.cultivo,
        estado: info.estado,
        fecha: info.fecha,
        color: info.color,
        puntosSolDia: info.puntosSolDia,
        puntosAguaDia: info.puntosAguaDia,
        puntosSolAcumulados: info.puntosSolAcumulados,
        puntosAguaAcumulados: info.puntosAguaAcumulados,
        maxPuntosSol: info.maxPuntosSol,
        maxPuntosAgua: info.maxPuntosAgua,
        celdas: celdasSeleccionadas.map(celda => celda.dataset.index),
        regado: info.regado,
        diasEnEtapa: info.diasEnEtapa,
        diasRequeridos: info.diasRequeridos
    });

    // Actualizar los puntos iniciales en la interfaz
    actualizarPuntosCultivo(info.nombre);
}

// Actualizar puntos al cambiar el clima o el regado
function actualizarPuntosCultivo(nombreCultivo) {
    const cultivo = cultivosPlantados.find(c => c.nombre === nombreCultivo);

    if (cultivo) {
        const clima = document.getElementById('climaSelect').value;
        const puntosClima = obtenerPuntosPorClima(clima);

        cultivo.puntosSolDia = puntosClima.sol;
        cultivo.puntosAguaDia = puntosClima.agua + cultivo.regado;

        // Calculamos los puntos acumulados hasta el día actual (sin sumar aún los del día actual)
        const puntosSolAcumulados = cultivo.puntosSolAcumulados + cultivo.puntosSolDia;
        const puntosAguaAcumulados = cultivo.puntosAguaAcumulados + cultivo.puntosAguaDia;

        // Actualizar barras y textos
        const tarjeta = document.querySelector(`.tarjeta[data-nombre="${cultivo.nombre}"]`);
        if (tarjeta) {
            tarjeta.querySelector('.sol').textContent = puntosSolAcumulados;
            tarjeta.querySelector('.agua').textContent = puntosAguaAcumulados;

            const progresoSolInner = tarjeta.querySelector('.progress-bar-inner.sol');
            progresoSolInner.style.width = `${(puntosSolAcumulados / cultivo.maxPuntosSol) * 100}%`;
            const progresoAguaInner = tarjeta.querySelector('.progress-bar-inner.agua');
            progresoAguaInner.style.width = `${(puntosAguaAcumulados / cultivo.maxPuntosAgua) * 100}%`;

            const tipRiego = tarjeta.querySelector('.tip');
            tipRiego.textContent = generarTip(cultivo, puntosSolAcumulados, puntosAguaAcumulados);
        }
    }
}

// Actualizar puntos y estado al cambiar el clima o regado en tiempo real
document.getElementById('climaSelect').addEventListener('change', () => {
    // Actualizar icono del clima
    const clima = document.getElementById('climaSelect').value;
    const climaIcono = document.getElementById('climaIcono');
    climaIcono.src = `img/${clima.toLowerCase()}.gif`;
    climaIcono.alt = clima;

    // Actualizar puntos de todos los cultivos
    cultivosPlantados.forEach(cultivo => {
        actualizarPuntosCultivo(cultivo.nombre);
    });

    guardarCultivosEnLocalStorage();
});

// Evento para avanzar el día
document.getElementById('avanzarDiaBtn').addEventListener('click', () => {
    diaActual++;
    mostrarDiaActual();

    cultivosPlantados.forEach(cultivo => {
        // Sumar los puntos del día a los acumulados
        cultivo.puntosSolAcumulados += cultivo.puntosSolDia;
        cultivo.puntosAguaAcumulados += cultivo.puntosAguaDia;

        // Resetear los puntos del día y regado
        cultivo.puntosSolDia = 0;
        cultivo.puntosAguaDia = 0;
        cultivo.regado = 0;

        // Incrementar días en etapa
        cultivo.diasEnEtapa++;

        // Verificar si debe avanzar de etapa o marchitarse
        verificarEstadoCultivo(cultivo);

        // Actualizar la tarjeta correspondiente
        const tarjeta = document.querySelector(`.tarjeta[data-nombre="${cultivo.nombre}"]`);
        if (tarjeta) {
            // Restablecer regado a 0 en la interfaz
            const wateringSelect = tarjeta.querySelector('.watering-controls select');
            wateringSelect.value = '0';

            // Actualizar días en etapa
            tarjeta.querySelector('.dias').textContent = cultivo.diasEnEtapa;

            // Actualizar puntos acumulados
            tarjeta.querySelector('.sol').textContent = cultivo.puntosSolAcumulados;
            tarjeta.querySelector('.agua').textContent = cultivo.puntosAguaAcumulados;

            // Actualizar barras de progreso
            const progresoSolInner = tarjeta.querySelector('.progress-bar-inner.sol');
            progresoSolInner.style.width = `${(cultivo.puntosSolAcumulados / cultivo.maxPuntosSol) * 100}%`;
            const progresoAguaInner = tarjeta.querySelector('.progress-bar-inner.agua');
            progresoAguaInner.style.width = `${(cultivo.puntosAguaAcumulados / cultivo.maxPuntosAgua) * 100}%`;

            // Actualizar estado si cambió
            tarjeta.querySelector('.estado').textContent = cultivo.estado;

            // Actualizar tip
            const tipRiego = tarjeta.querySelector('.tip');
            tipRiego.textContent = generarTip(cultivo, cultivo.puntosSolAcumulados, cultivo.puntosAguaAcumulados);
        }
    });

    guardarCultivosEnLocalStorage();
});

// Función para generar un tip mejorado
function generarTip(cultivo, puntosSolAcumulados, puntosAguaAcumulados) {
    if (cultivo.estado === "Marchito") {
        return "El cultivo se ha marchitado. Considérelo perdido.";
    }

    const necesitaAgua = puntosAguaAcumulados < cultivo.maxPuntosAgua;
    const necesitaSol = puntosSolAcumulados < cultivo.maxPuntosSol;
    const diasRestantes = cultivo.diasRequeridos - cultivo.diasEnEtapa;

    let tip = `Faltan ${diasRestantes} día(s) para avanzar de etapa. `;

    if (!necesitaAgua && !necesitaSol) {
        tip += "El cultivo está listo para avanzar de etapa.";
    } else if (necesitaAgua && !necesitaSol) {
        tip += "Necesita regar el cultivo.";
    } else if (!necesitaAgua && necesitaSol) {
        tip += "El cultivo necesita más sol.";
    } else {
        tip += "El cultivo necesita más sol y agua.";
    }

    return tip;
}

// Función para verificar el estado del cultivo
function verificarEstadoCultivo(cultivo) {
    const cultivoData = cultivosDisponibles.find(c => c.name === cultivo.cultivo);
    if (!cultivoData) {
        console.error(`Cultivo ${cultivo.cultivo} no encontrado en los cultivos disponibles.`);
        return;
    }
    const estadoActual = cultivoData.stages.find(s => s.name === cultivo.estado);
    if (!estadoActual) {
        console.error(`Estado ${cultivo.estado} no encontrado en el cultivo ${cultivo.cultivo}.`);
        return;
    }

    // Verificar si alcanza los puntos mínimos y días requeridos para avanzar de etapa
    if (
        cultivo.puntosSolAcumulados >= estadoActual.sunRange[0] &&
        cultivo.puntosAguaAcumulados >= estadoActual.waterRange[0] &&
        cultivo.diasEnEtapa >= cultivo.diasRequeridos
    ) {
        const indexActual = cultivoData.stages.findIndex(s => s.name === cultivo.estado);
        if (indexActual < cultivoData.stages.length - 1) {
            // Avanzar al siguiente estado
            cultivo.estado = cultivoData.stages[indexActual + 1].name;
            cultivo.puntosSolAcumulados = 0;
            cultivo.puntosAguaAcumulados = 0;
            cultivo.puntosSolDia = 0;
            cultivo.puntosAguaDia = 0;
            cultivo.maxPuntosSol = cultivoData.stages[indexActual + 1].sunRange[1];
            cultivo.maxPuntosAgua = cultivoData.stages[indexActual + 1].waterRange[1];
            cultivo.diasEnEtapa = 0;
            cultivo.diasRequeridos = cultivoData.stages[indexActual + 1].days;

            // Actualizar la tarjeta
            actualizarPuntosCultivo(cultivo.nombre);
        } else {
            // Cultivo maduro
            cultivo.estado = "Maduro";
            // Aquí puedes agregar lógica adicional si deseas
        }
    }

    // Verificar si supera los puntos máximos y debe marchitarse
    if (cultivo.puntosSolAcumulados > estadoActual.sunRange[1] || cultivo.puntosAguaAcumulados > estadoActual.waterRange[1]) {
        cultivo.estado = "Marchito";
        // Puedes agregar lógica para cambiar el estilo de las celdas y tarjetas
    }
}

// Función para obtener los puntos de sol y agua según el clima
function obtenerPuntosPorClima(clima) {
    const climaPuntos = {
        Sunny: { sol: 3, agua: 0 },
        Clear: { sol: 2, agua: 0 },
        Cloudy: { sol: 1, agua: 0 },
        Drizzle: { sol: 0, agua: 1 },
        Rainy: { sol: 0, agua: 2 },
        Snowy: { sol: 0, agua: 2 },
        Hurricane: { sol: 0, agua: 3 },
        Blizzard: { sol: 0, agua: 3 },
    };
    return climaPuntos[clima] || { sol: 0, agua: 0 };
}

// Persistencia de datos en localStorage
function guardarCultivosEnLocalStorage() {
    localStorage.setItem('cultivosPlantados', JSON.stringify(cultivosPlantados));
    localStorage.setItem('diaActual', diaActual);
}

function cargarCultivosDeLocalStorage() {
    const cultivosGuardados = localStorage.getItem('cultivosPlantados');
    const diaGuardado = localStorage.getItem('diaActual');

    if (cultivosGuardados) {
        cultivosPlantados = JSON.parse(cultivosGuardados);
        cultivosPlantados.forEach(cultivo => {
            // Restaurar las celdas en la cuadrícula
            cultivo.celdas.forEach(index => {
                const celda = document.querySelector(`.grid div[data-index="${index}"]`);
                if (celda) {
                    celda.classList.add('bloqueado');
                    celda.style.backgroundColor = cultivo.color;
                    celda.classList.add('border');
                    celda.style.borderColor = cultivo.color;

                    // Añadir imagen del cultivo
                    const img = document.createElement('img');
                    img.src = `img/${cultivo.cultivo.toLowerCase()}.gif`;
                    img.alt = cultivo.cultivo;
                    celda.appendChild(img);
                }
            });

            // Agregar la tarjeta
            agregarTarjetaCultivo(cultivo);
        });
    }

    if (diaGuardado) {
        diaActual = parseInt(diaGuardado);
        mostrarDiaActual();
    }
}

// Inicializar cuadrícula y día actual al cargar la página
window.onload = async () => {
    await cargarCultivos();
    generarCuadricula();
    mostrarDiaActual();
    cargarCultivosDeLocalStorage();

    // Actualizar icono del clima al cargar la página
    const clima = document.getElementById('climaSelect').value;
    const climaIcono = document.getElementById('climaIcono');
    climaIcono.src = `img/${clima.toLowerCase()}.gif`;
    climaIcono.alt = clima;
};
