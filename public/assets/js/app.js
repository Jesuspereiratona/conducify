const estado = document.getElementById('estado')
const resultados = document.getElementById('resultados')
const resultadoAuto = document.getElementById('resultado-auto')

function setEstado(mensaje, tipo = 'info') {
    estado.className = `alert alert-${tipo}`
    estado.textContent = mensaje
}

function formatValue(valor) {
    if (valor === null || valor === undefined || valor === '') return '-'

    if (typeof valor === 'object') {
        return `<pre class="mb-0 small">${JSON.stringify(valor, null, 2)}</pre>`
    }

    return valor
}

function renderTabla(items, titulo) {
    if (!Array.isArray(items) || items.length === 0) {
        return `<div class="alert alert-warning mb-0">No hay datos para mostrar en ${titulo.toLowerCase()}.</div>`
    }

    const columnas = Object.keys(items[0])

    return `
        <div class="table-responsive">
            <table class="table table-striped table-hover align-middle">
                <thead class="table-dark">
                    <tr>
                        ${columnas.map((columna) => `<th>${columna}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${items.map((item) => `
                        <tr>
                            ${columnas.map((columna) => `<td>${formatValue(item[columna])}</td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `
}

function renderDetalle(item) {
    if (!item || Object.keys(item).length === 0) {
        return `<div class="alert alert-warning mb-0">No se encontró ningún auto con esa patente.</div>`
    }

    const conductor = item.conductor
    const conductorHtml = conductor
        ? `
            <div class="card border-0 bg-light mt-3">
                <div class="card-body">
                    <h4 class="h6 mb-2">Conductor asignado</h4>
                    <p class="mb-1"><strong>Nombre:</strong> ${conductor.nombre}</p>
                    <p class="mb-0"><strong>Edad:</strong> ${conductor.edad}</p>
                </div>
            </div>
        `
        : ''

    return `
        <div class="card border-0 shadow-sm">
            <div class="card-body">
                <h3 class="h6">Detalle del vehículo</h3>
                <ul class="list-group list-group-flush">
                    <li class="list-group-item px-0"><strong>Marca:</strong> ${item.marca}</li>
                    <li class="list-group-item px-0"><strong>Patente:</strong> ${item.patente}</li>
                    <li class="list-group-item px-0"><strong>Nombre del conductor:</strong> ${item.nombre_conductor}</li>
                </ul>
                ${conductorHtml}
            </div>
        </div>
    `
}

function renderSolitos(data) {
    return `
        <div class="row g-3">
            <div class="col-md-6">
                <div class="card border-0 bg-light">
                    <div class="card-body">
                        <h3 class="h6">Conductores sin auto</h3>
                        ${renderTabla(data.conductoresSinAuto || [], 'conductores sin auto')}
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card border-0 bg-light">
                    <div class="card-body">
                        <h3 class="h6">Autos sin conductores</h3>
                        ${renderTabla(data.autosSinConductores || [], 'autos sin conductores')}
                    </div>
                </div>
            </div>
        </div>
    `
}

async function pedirDatos(ruta) {
    const respuesta = await fetch(ruta)

    if (!respuesta.ok) {
        throw new Error('No se pudo cargar la información del servidor.')
    }

    return respuesta.json()
}

async function cargarEndpoint(ruta, titulo, renderizador) {
    setEstado(`Cargando ${titulo.toLowerCase()}...`, 'info')

    try {
        const datos = await pedirDatos(ruta)
        resultados.innerHTML = renderizador(datos, titulo)
        setEstado(`${titulo} cargados correctamente.`, 'success')
    } catch (error) {
        resultados.innerHTML = ''
        setEstado(error.message, 'danger')
    }
}

async function cargarTodo() {
    setEstado('Cargando todos los datos...', 'info')

    try {
        const [conductores, automoviles, conductoresSinAuto, solitos] = await Promise.all([
            pedirDatos('/conductores'),
            pedirDatos('/automoviles'),
            pedirDatos('/conductoressinauto'),
            pedirDatos('/solitos')
        ])

        resultados.innerHTML = `
            <div class="row g-3">
                <div class="col-12">
                    <div class="card border-0 bg-light">
                        <div class="card-body">
                            <h3 class="h6">Conductores</h3>
                            ${renderTabla(conductores, 'conductores')}
                        </div>
                    </div>
                </div>
                <div class="col-12">
                    <div class="card border-0 bg-light">
                        <div class="card-body">
                            <h3 class="h6">Automóviles</h3>
                            ${renderTabla(automoviles, 'automóviles')}
                        </div>
                    </div>
                </div>
                <div class="col-12">
                    <div class="card border-0 bg-light">
                        <div class="card-body">
                            <h3 class="h6">Conductores sin auto</h3>
                            ${renderTabla(conductoresSinAuto, 'conductores sin auto')}
                        </div>
                    </div>
                </div>
                <div class="col-12">
                    <div class="card border-0 bg-light">
                        <div class="card-body">
                            <h3 class="h6">Resumen de solitos</h3>
                            ${renderSolitos(solitos)}
                        </div>
                    </div>
                </div>
            </div>
        `

        setEstado('Todos los endpoints fueron cargados correctamente.', 'success')
    } catch (error) {
        resultados.innerHTML = ''
        setEstado(error.message, 'danger')
    }
}

document.getElementById('btn-todos').addEventListener('click', cargarTodo)
document.getElementById('btn-conductores').addEventListener('click', () => cargarEndpoint('/conductores', 'Conductores', renderTabla))
document.getElementById('btn-automoviles').addEventListener('click', () => cargarEndpoint('/automoviles', 'Automóviles', renderTabla))
document.getElementById('btn-sin-auto').addEventListener('click', () => cargarEndpoint('/conductoressinauto', 'Conductores sin auto', renderTabla))
document.getElementById('btn-solitos').addEventListener('click', () => cargarEndpoint('/solitos', 'Resumen de solitos', renderSolitos))

document.getElementById('form-auto').addEventListener('submit', async (evento) => {
    evento.preventDefault()

    const patente = document.getElementById('patente').value.trim()

    if (!patente) {
        setEstado('Ingresa una patente para buscar.', 'warning')
        resultadoAuto.innerHTML = ''
        return
    }

    try {
        const auto = await pedirDatos(`/auto?patente=${encodeURIComponent(patente)}`)
        resultadoAuto.innerHTML = renderDetalle(auto)
        setEstado(`Se mostró el resultado para la patente ${patente}.`, 'success')
    } catch (error) {
        resultadoAuto.innerHTML = ''
        setEstado(error.message, 'danger')
    }
})