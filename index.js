const cors = require("cors")
const express = require("express")
const webServer = express()
const morgan = require("morgan")
const path = require("node:path")
// conductores : nombre, edad
// vehiculos: marca, patente, nombre_conductor
const { automoviles, conductores } = require("./data.js")

webServer.use(cors())
webServer.use(morgan('dev'))

//servir archivos estáticos (que no cambian)
webServer.use(express.static(path.join(__dirname, "public"))) // /home/joaquin/Documents/repos/bootcamp-45-6/modulo_6/revisando_npm/public

// debemos responder con todos los conductores
webServer.get("/conductores",
    (req, res) => {
        res.json(conductores)
    }
)

webServer.get("/automoviles",
    (req, res) => {
        res.json(automoviles)
    }
)

// GET /conductoressinauto
webServer.get("/conductoressinauto", (req, res) => {
    const edad = parseInt(req.query.edad)
    
    const conductoresSinAuto = conductores.filter((conductor) => {
        const sinAuto = !automoviles.some((auto) => auto.nombre_conductor === conductor.nombre)
        const menorDeEdad = isNaN(edad) || conductor.edad < edad
        return sinAuto && menorDeEdad
    })
    
    res.json(conductoresSinAuto)
})

// GET /solitos
webServer.get("/solitos", (req, res) => {
    const conductoresSinAuto = conductores.filter((conductor) => {
        return !automoviles.some((auto) => auto.nombre_conductor === conductor.nombre)
    })

    const autosSinConductores = automoviles.filter((auto) => {
        return !conductores.some((conductor) => auto.nombre_conductor === conductor.nombre)
    })

    res.json({ conductoresSinAuto, autosSinConductores })
    // {conductoresSinAuto: [...], autosSinConductores: [...]}
})

webServer.get("/auto", (req, res) => {
    const { iniciopatente, patente } = req.query

    if (patente) {
        const autoEncontrado = automoviles.find((auto) => auto.patente === patente)
        if (!autoEncontrado) return res.status(404).json({})

        return res.json({ ...autoEncontrado, conductor: conductores.find((c) => c.nombre === autoEncontrado.nombre_conductor) || null })
        return res.json(autoEncontrado)
    }

    if (iniciopatente) {
        const autos = automoviles
            .filter((auto) => auto.patente.startsWith(iniciopatente.toUpperCase()))
            .map((auto) => ({
                ...auto,
                conductor: conductores.find((c) => c.nombre === auto.nombre_conductor) || null
            }))
        return res.json(autos)
    }

    res.status(400).json({ error: 'Debes enviar patente o iniciopatente' })
})

const PORT = process.env.PORT || 4000
webServer.listen(PORT, () => {
    console.log(`El server está corriendo en http://localhost:${PORT}/`)
})