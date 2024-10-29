let seleccionando = false;
let seleccionModoArea = false;
let celdasSeleccionadas = [];
let celdaInicial = null;

// Mostrar el día actual en la interfaz
function mostrarDiaActual() {
    const diaActual = obtenerDiaActual();
    document.getElementById('diaActual').textContent = diaActual;
}

// Obtener el día actual (simulado aquí)
function obtenerDiaActual() {
    return 1; // Puedes cambiar esta lógica para obtener el día real
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

    const rowStart = Math.min(startRow, endRow);
    const rowEnd = Math.max(startRow, endRow);
    const colStart = Math.min(startCol, endCol);
    const colEnd = Math.max(startCol, endCol);

    limpiarSeleccion();

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
        const cultivos = await response.json();
        const tipoCultivoDropdown = document.getElementById('tipoCultivo');
        tipoCultivoDropdown.innerHTML = '';

        cultivos.forEach(cultivo => {
            const option = document.createElement('option');
            option.value = cultivo.name;
            option.textContent = cultivo.name;
            tipoCultivoDropdown.appendChild(option);
        });

        tipoCultivoDropdown.addEventListener('change', () => {
            const cultivoSeleccionado = cultivos.find(c => c.name === tipoCultivoDropdown.value);
            mostrarFasesCultivo(cultivoSeleccionado);
        });

        if (cultivos.length > 0) mostrarFasesCultivo(cultivos[0]);
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
        celda.classList.remove('selected');
    });

    agregarTarjetaCultivo({
        nombre: nombreArea,
        cultivo: tipoCultivo,
        estado: estadoInicial,
        fecha: fechaPlantacion,
        color: color
    });

    document.getElementById('areaModal').style.display = 'none';
    limpiarSeleccion();
    seleccionModoArea = false;
    document.getElementById('toggleAreaBtn').textContent = "Agregar Área";
    document.getElementById('toggleAreaBtn').classList.remove('active');
});

// Agregar tarjeta de cultivo en la sección correspondiente
function agregarTarjetaCultivo(info) {
    const tarjeta = document.createElement('div');
    tarjeta.classList.add('tarjeta');
    tarjeta.style.borderLeft = `10px solid ${info.color}`;
    tarjeta.innerHTML = `
        <h4>${info.nombre}</h4>
        <p><strong>Cultivo:</strong> ${info.cultivo}</p>
        <p><strong>Estado:</strong> ${info.estado}</p>
        <p><strong>Fecha de Plantación:</strong> ${info.fecha}</p>
    `;
    document.getElementById('tarjetasCultivos').appendChild(tarjeta);
}

// Inicializar cuadrícula y día actual al cargar la página
window.onload = () => {
    generarCuadricula();
    mostrarDiaActual();
};
