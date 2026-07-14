const cors = require("cors")
const express = require("express")
const webServer = express()
const morgan = require("morgan")
const path = require("node:path")
const fs = require("node:fs/promises")
const { automoviles, conductores } = require("./data.js")

webServer.use(cors())
webServer.use(morgan('dev'))
webServer.use(express.json())
webServer.use(express.static(path.join(__dirname, "public")))

const PRODUCTOS_PATH = path.join(__dirname, "productos.txt")

// conducif

webServer.get("/conductores", (req, res) => {
    res.json(conductores)
})

webServer.get("/automoviles", (req, res) => {
    res.json(automoviles)
})

webServer.get("/conductoressinauto", (req, res) => {
    const edad = parseInt(req.query.edad)
    const conductoresSinAuto = conductores.filter((conductor) => {
        const sinAuto = !automoviles.some((auto) => auto.nombre_conductor === conductor.nombre)
        const menorDeEdad = isNaN(edad) || conductor.edad < edad
        return sinAuto && menorDeEdad
    })
    res.json(conductoresSinAuto)
})

webServer.get("/solitos", (req, res) => {
    const conductoresSinAuto = conductores.filter((conductor) => {
        return !automoviles.some((auto) => auto.nombre_conductor === conductor.nombre)
    })
    const autosSinConductores = automoviles.filter((auto) => {
        return !conductores.some((conductor) => auto.nombre_conductor === conductor.nombre)
    })
    res.json({ conductoresSinAuto, autosSinConductores })
})

webServer.get("/auto", (req, res) => {
    const { iniciopatente, patente } = req.query
    if (patente) {
        const autoEncontrado = automoviles.find((auto) => auto.patente === patente)
        if (!autoEncontrado) return res.status(404).json({})
        return res.json({ ...autoEncontrado, conductor: conductores.find((c) => c.nombre === autoEncontrado.nombre_conductor) || null })
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

// productos txts
webServer.get("/productos", async (req, res) => {
    try {
        const contenido = await fs.readFile(PRODUCTOS_PATH, "utf-8")
        const productos = contenido
            .split("\n")
            .filter(linea => linea.trim() !== "")
            .map(linea => {
                const [nombre, precio] = linea.split(",")
                return { nombre: nombre.trim(), precio: parseInt(precio.trim()) }
            })
        res.status(200).json(productos)
    } catch (error) {
        res.status(500).json({ error: "No se pudo leer el archivo de productos." })
    }
})

webServer.post("/productos", async (req, res) => {
    const { nombre, precio } = req.body

    if (!nombre || !precio) {
        return res.status(400).json({ error: "Debes enviar nombre y precio." })
    }

    try {
        await fs.appendFile(PRODUCTOS_PATH, `\n${nombre}, ${precio}`)
        res.status(201).json({ mensaje: "Producto agregado correctamente.", producto: { nombre, precio } })
    } catch (error) {
        res.status(500).json({ error: "No se pudo guardar el producto." })
    }
})

// servidorsh

const PORT = process.env.PORT || 4000
webServer.listen(PORT, () => {
    console.log(`El server está corriendo en http://localhost:${PORT}/`)
})