let seleccionando = false;
let celdasSeleccionadas = [];
let celdaInicial = null;
let areasGuardadas = []; // Array para guardar las áreas y sus colores

// Función para generar un color aleatorio
function generarColorAleatorio() {
    const letras = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letras[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Función para generar la cuadrícula
function generarCuadricula() {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    for (let i = 0; i < 42 * 15; i++) {
        const celda = document.createElement('div');
        celda.dataset.index = i;
        celda.addEventListener('click', seleccionarCelda);
        grid.appendChild(celda);
    }
}

// Función para determinar si el color es oscuro o claro
function esColorOscuro(colorHex) {
    // Convertir el color a RGB
    const r = parseInt(colorHex.slice(1, 3), 16);
    const g = parseInt(colorHex.slice(3, 5), 16);
    const b = parseInt(colorHex.slice(5, 7), 16);
    // Calcular luminosidad
    const luminancia = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminancia < 128; // Si la luminosidad es baja, el color es oscuro
}

// Función para seleccionar celdas con Shift o arrastrando
function seleccionarCelda(e) {
    if (seleccionando) {
        // Verificar si la celda ya pertenece a otra área
        if (e.target.classList.contains('bloqueado')) {
            return; // No permitir selección o deselección de celdas ya guardadas
        }

        if (e.shiftKey && celdaInicial) {
            const indexInicio = parseInt(celdaInicial.dataset.index);
            const indexFin = parseInt(e.target.dataset.index);

            const cols = 42;
            const startRow = Math.floor(indexInicio / cols);
            const startCol = indexInicio % cols;
            const endRow = Math.floor(indexFin / cols);
            const endCol = indexFin % cols;

            const rowStart = Math.min(startRow, endRow);
            const rowEnd = Math.max(startRow, endRow);
            const colStart = Math.min(startCol, endCol);
            const colEnd = Math.max(startCol, endCol);

            for (let row = rowStart; row <= rowEnd; row++) {
                for (let col = colStart; col <= colEnd; col++) {
                    const index = row * cols + col;
                    const celda = document.querySelector(`#grid div[data-index="${index}"]`);
                    if (celda && !celda.classList.contains('selected')) {
                        celda.classList.add('selected');
                        celdasSeleccionadas.push(celda);
                    }
                }
            }
        } else {
            e.target.classList.toggle('selected');
            if (e.target.classList.contains('selected')) {
                celdasSeleccionadas.push(e.target);
            } else {
                celdasSeleccionadas = celdasSeleccionadas.filter(c => c !== e.target);
            }
            celdaInicial = e.target;
        }
    }
}

// Alternar botón para agregar/guardar área
document.getElementById('toggleAreaBtn').addEventListener('click', () => {
    if (!seleccionando) {
        seleccionando = true;
        celdasSeleccionadas = [];
        document.getElementById('toggleAreaBtn').textContent = "Guardar el Área";
    } else {
        if (celdasSeleccionadas.length > 0) {
            abrirModal();
        } else {
            alert("Selecciona un área primero.");
        }
        seleccionando = false;
        document.getElementById('toggleAreaBtn').textContent = "Agregar Área";
    }
});

// Abrir modal y cargar cultivos
async function abrirModal() {
    document.getElementById('areaModal').classList.add('active');
    document.getElementById('fechaPlantacion').value = "Día " + obtenerDiaActual();
    await cargarCultivos();
}

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

        estadoCultivoDiv.appendChild(radio);
        estadoCultivoDiv.appendChild(label);
        estadoCultivoDiv.appendChild(document.createElement('br'));
    });
}

    // Función para generar un color aleatorio
    function generarColorAleatorio() {
        const letras = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letras[Math.floor(Math.random() * 16)];
        }
        return color;
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
    const colorTexto = esColorOscuro(color) ? '#FFFFFF' : '#000000'; // Determinar el color del texto

    celdasSeleccionadas.forEach(celda => {
        celda.classList.add('bloqueado');
        celda.style.backgroundColor = color;
        celda.style.color = colorTexto; // Asignar color de texto
    });

    agregarTarjetaCultivo({
        nombre: nombreArea,
        cultivo: tipoCultivo,
        estado: estadoInicial,
        fecha: fechaPlantacion,
        color: color,
        colorTexto: colorTexto // Guardar color de texto en la tarjeta
    });

    document.getElementById('areaModal').classList.remove('active');
    celdasSeleccionadas = [];
});

// Agregar tarjeta de cultivo en la sección correspondiente
function agregarTarjetaCultivo(info) {
    const tarjeta = document.createElement('div');
    tarjeta.classList.add('tarjeta');
    tarjeta.style.backgroundColor = info.color; // Aplicar color de área
    tarjeta.style.color = info.colorTexto; // Aplicar color de texto en la tarjeta
    tarjeta.innerHTML = `
        <h4>${info.nombre}</h4>
        <p><strong>Cultivo:</strong> ${info.cultivo}</p>
        <p><strong>Estado:</strong> ${info.estado}</p>
        <p><strong>Fecha de Plantación:</strong> ${info.fecha}</p>
    `;
    document.getElementById('tarjetasCultivos').appendChild(tarjeta);
}

// Obtener el día actual (simulado aquí)
function obtenerDiaActual() {
    return 1; // Cambia esto para obtener el día real
}


// Generar la cuadrícula al cargar la página
window.onload = generarCuadricula;
