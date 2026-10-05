const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'db.json');

// Middleware para leer JSON en las peticiones POST y PUT
app.use(express.json());

// Función auxiliar para leer la base de datos
const leerDatos = () => {
    try {
        const jsonData = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(jsonData);
    } catch (error) {
        return { deportes: [] };
    }
};

// Función auxiliar para escribir en la base de datos
const escribirDatos = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
};

// ================= RUTAS (ENDPOINTS) =================

// 1. GET: Obtener todos los deportes
app.get('/deportes', (req, res) => {
    const db = leerDatos();
    res.json(db.deportes);
});

// 2. GET: Obtener un deporte por ID
app.get('/deportes/:id', (req, res) => {
    const db = leerDatos();
    const deporte = db.deportes.find(d => d.id === req.params.id);
    
    if (!deporte) {
        return res.status(404).json({ mensaje: 'Deporte no encontrado' });
    }
    res.json(deporte);
});

// 3. POST: Crear un nuevo deporte
app.post('/deportes', (req, res) => {
    const db = leerDatos();
    const nuevoDeporte = {
        id: Date.now().toString(), // Genera un ID único basado en el tiempo
        nombre: req.body.nombre,
        escenario: req.body.escenario,
        dimensiones: req.body.dimensiones,
        numero_de_elementos: req.body.numero_de_elementos,
        equipo: req.body.equipo || {},
        pais: req.body.pais
    };

    db.deportes.push(nuevoDeporte);
    escribirDatos(db);

    res.status(201).json({
        mensaje: 'Deporte creado con éxito',
        deporte: nuevoDeporte
    });
});

// 4. PUT: Actualizar un deporte existente
app.put('/deportes/:id', (req, res) => {
    const db = leerDatos();
    const index = db.deportes.findIndex(d => d.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({ mensaje: 'Deporte no encontrado para actualizar' });
    }

    const deporteActualizado = {
        ...db.deportes[index],
        nombre: req.body.nombre || db.deportes[index].nombre,
        escenario: req.body.escenario || db.deportes[index].escenario,
        dimensiones: req.body.dimensiones || db.deportes[index].dimensiones,
        numero_de_elementos: req.body.numero_de_elementos || db.deportes[index].numero_de_elementos,
        equipo: req.body.equipo || db.deportes[index].equipo,
        pais: req.body.pais || db.deportes[index].pais
    };

    db.deportes[index] = deporteActualizado;
    escribirDatos(db);

    res.json({
        mensaje: 'Deporte actualizado con éxito',
        deporte: deporteActualizado
    });
});

// 5. DELETE: Eliminar un deporte
app.delete('/deportes/:id', (req, res) => {
    const db = leerDatos();
    const index = db.deportes.findIndex(d => d.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({ mensaje: 'Deporte no encontrado para eliminar' });
    }

    const deporteEliminado = db.deportes.splice(index, 1);
    escribirDatos(db);

    res.json({
        mensaje: 'Deporte eliminado con éxito',
        deporte: deporteEliminado[0]
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor de deportes corriendo en http://localhost:${PORT}`);
});