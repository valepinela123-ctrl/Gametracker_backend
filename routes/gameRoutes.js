const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController'); // Importa el controlador

// Rutas para los juegos
router.get('/', gameController.getAllGames);         // GET /api/games -> Obtener todos los juegos
router.get('/:id', gameController.getGameById);      // GET /api/games/:id -> Obtener un juego por ID
router.post('/', gameController.createGame);         // POST /api/games -> Crear un nuevo juego
router.put('/:id', gameController.updateGame);       // PUT /api/games/:id -> Actualizar un juego
router.delete('/:id', gameController.deleteGame);    // DELETE /api/games/:id -> Eliminar un juego

module.exports = router;