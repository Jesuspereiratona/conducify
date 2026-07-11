# Conducify 🚗

Servidor Express que expone conductores y autos desde un archivo de datos.

## Cómo correr

```bash
npm install
node index.js
```

Entra a http://localhost:4000

## Qué hace cada endpoint

- `/conductores` → lista todos los conductores
- `/automoviles` → lista todos los autos
- `/conductoressinauto?edad=30` → conductores sin auto menores de 30 años
- `/solitos` → conductores sin auto Y autos sin conductor
- `/auto?patente=HXJH55` → busca un auto por patente exacta
- `/auto?iniciopatente=H` → busca autos cuya patente empiece con H

🔗 Repositorio: https://github.com/Jesuspereiratona/conducify
