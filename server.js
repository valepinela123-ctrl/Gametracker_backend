// 1. Importar módulos necesarios
require('dotenv').config(); // Para cargar variables de entorno desde .env
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Para permitir peticiones desde el frontend

// 2. Inicializar la aplicación Express
const app = express();
const gameRoutes = require('./routes/gameRoutes');


// 3. Middlewares (funciones que se ejecutan antes de que lleguen a tus rutas)
app.use(express.json()); // Permite a Express leer JSON en el cuerpo de las peticiones
app.use(cors()); // Habilita CORS para todas las rutas

app.use('/api/games', gameRoutes);

// 4. Conexión a MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI;

console.log('Valor de MONGODB_URI desde .env:', MONGODB_URI);

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Conectado a MongoDB Atlas con éxito!');
    })
    .catch((error) => {
        console.error('Error al conectar a MongoDB Atlas:', error.message);
    });

// 5. Ruta de prueba (para verificar que el servidor funciona)
app.get('/', (req, res) => {
    res.send('¡Servidor GameTracker Backend funcionando!');
});

// 6. Definir el puerto y levantar el servidor
const PORT = process.env.PORT || 5000; // Usa el puerto definido en .env o el 5000

app.listen(PORT, () => {
    console.log(`Servidor GameTracker Backend escuchando en el puerto ${PORT}`);
});
